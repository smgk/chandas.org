/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function customMeterModule(root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.ChandasCustomMeter = api;
    }
}(typeof window !== "undefined" ? window : globalThis, function createCustomMeterApi() {
    "use strict";

    const VERSION = "1.0.0";
    const STORAGE_META_KEY = "customForms";
    const LOCAL_STORAGE_KEY = "chandas.customForms.v1";
    const MAX_FORMS = 100;
    const MAX_EXAMPLES = 5;
    const MODES = new Set(["exact", "balanced", "loose"]);

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function unique(values) {
        return Array.from(new Set(values));
    }

    function median(values) {
        const sorted = values.slice().sort((left, right) => left - right);
        return sorted[Math.floor((sorted.length - 1) / 2)] || 0;
    }

    function createId() {
        if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
            return `custom:${globalThis.crypto.randomUUID()}`;
        }
        return `custom:${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }

    function patternConsensus(patterns) {
        if (!patterns.length) {
            return [];
        }
        const shortest = Math.min(...patterns.map((pattern) => pattern.length));
        const constraints = [];
        for (let index = 0; index < shortest; index += 1) {
            const weights = unique(patterns.map((pattern) => pattern[index]));
            if (weights.length === 1) {
                constraints.push({ position: index + 1, weight: weights[0] });
            }
        }
        return constraints;
    }

    function consensusSuffix(patterns, maximum) {
        if (!patterns.length) {
            return "";
        }
        const limit = Math.min(maximum || 4, ...patterns.map((pattern) => pattern.length));
        let suffix = "";
        for (let length = 1; length <= limit; length += 1) {
            const candidates = unique(patterns.map((pattern) => pattern.slice(-length)));
            if (candidates.length !== 1) {
                break;
            }
            suffix = candidates[0];
        }
        return suffix;
    }

    function possibleGroups(total) {
        const candidates = [];
        [4, 5, 3].forEach((size) => {
            if (total >= size && total % size === 0) {
                candidates.push(Array(total / size).fill(size));
            }
        });
        for (const first of [3, 4, 5]) {
            for (const final of [1, 2, 3, 4, 5]) {
                const body = total - final;
                if (body >= first && body % first === 0 && final !== first) {
                    candidates.push([...Array(body / first).fill(first), final]);
                }
            }
        }
        return candidates.filter((candidate, index, all) =>
            all.findIndex((other) => other.join("+") === candidate.join("+")) === index)
            .slice(0, 4);
    }

    function boundaryAfter(line) {
        const syllables = line.syllables || [];
        if (syllables.length < 4) {
            return null;
        }
        const total = line.matraCount || syllables.reduce((sum, syllable) =>
            sum + (syllable.classification === "G" ? 2 : 1), 0);
        let running = 0;
        const candidates = [];
        for (let index = 0; index < syllables.length - 1; index += 1) {
            running += syllables[index].classification === "G" ? 2 : 1;
            const gap = line.text.slice(
                syllables[index].end - line.start,
                syllables[index + 1].start - line.start
            );
            if (!/[\p{White_Space}\p{Punctuation}]/u.test(gap)) {
                continue;
            }
            candidates.push({
                afterSyllable: index + 1,
                afterMatra: running,
                major: /\p{Punctuation}/u.test(gap),
                distance: Math.abs(running - (total / 2))
            });
        }
        return candidates.sort((left, right) =>
            Number(right.major) - Number(left.major) ||
            left.distance - right.distance ||
            left.afterSyllable - right.afterSyllable)[0] || null;
    }

    function consonantKey(syllable, sourceScheme, romanApi) {
        if (!syllable || !syllable.text) {
            return "";
        }
        let roman = syllable.text;
        if (romanApi && typeof romanApi.convert === "function") {
            roman = romanApi.convert(roman, sourceScheme || "native", "iast").text;
        }
        const folded = roman.toLocaleLowerCase().normalize("NFC")
            .replace(/[aāiīuūṛṝḷḹeoēōăĕŏṃṁḥm̐'’\p{White_Space}\p{Punctuation}]/gu, "");
        return folded || roman.toLocaleLowerCase().normalize("NFC");
    }

    function schemeFromKeys(keys) {
        const labels = new Map();
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const scheme = [];
        let next = 0;
        keys.forEach((key, index) => {
            const value = key || `__single_${index}`;
            if (!labels.has(value)) {
                labels.set(value, alphabet[next] || `R${next + 1}`);
                next += 1;
            }
            scheme.push(labels.get(value));
        });
        return scheme.join("");
    }

    function relationInference(stanzas, type, sourceScheme, romanApi) {
        const schemes = stanzas.map((stanza) => schemeFromKeys(stanza.lines.map((line) => {
            const syllables = line.syllables || [];
            const syllable = type === "dvitiyakshara"
                ? syllables[1]
                : syllables[syllables.length - 1];
            return consonantKey(syllable, sourceScheme, romanApi);
        })));
        const counts = new Map();
        schemes.forEach((scheme) => counts.set(scheme, (counts.get(scheme) || 0) + 1));
        const selected = Array.from(counts.entries()).sort((left, right) =>
            right[1] - left[1] || left[0].localeCompare(right[0]))[0];
        if (!selected) {
            return null;
        }
        const groups = new Map();
        Array.from(selected[0]).forEach((label, index) => {
            const positions = groups.get(label) || [];
            positions.push(index + 1);
            groups.set(label, positions);
        });
        const lineGroups = Array.from(groups.values()).filter((group) => group.length > 1);
        if (!lineGroups.length) {
            return null;
        }
        return {
            type,
            scheme: selected[0],
            lineGroups,
            support: selected[1],
            sampleCount: stanzas.length,
            confidence: selected[1] / stanzas.length
        };
    }

    function stableRefrains(stanzas) {
        if (stanzas.length < 2) {
            return [];
        }
        const count = stanzas[0].lines.length;
        const refrains = [];
        for (let index = 0; index < count; index += 1) {
            const texts = stanzas.map((stanza) => stanza.lines[index].text
                .trim().replace(/\s+/g, " "));
            if (texts[0] && unique(texts).length === 1) {
                refrains.push({ line: index + 1, text: texts[0] });
            }
        }
        return refrains;
    }

    function inferLineRole(lines, index) {
        const patterns = lines.map((line) => line.pattern || "");
        const syllables = lines.map((line) => (line.syllables || []).length);
        const matras = lines.map((line) => line.matraCount || 0);
        const boundaries = lines.map(boundaryAfter).filter(Boolean);
        const stableBoundary = boundaries.length === lines.length &&
            unique(boundaries.map((item) => item.afterSyllable)).length === 1
            ? boundaries[0]
            : null;
        const targetMatras = median(matras);
        return {
            line: index + 1,
            observedPatterns: unique(patterns),
            syllables: {
                min: Math.min(...syllables),
                max: Math.max(...syllables),
                preferred: median(syllables)
            },
            matras: {
                min: Math.min(...matras),
                max: Math.max(...matras),
                preferred: targetMatras
            },
            consensus: patternConsensus(patterns),
            cadence: consensusSuffix(patterns, 4),
            groupAlternatives: possibleGroups(targetMatras),
            yati: stableBoundary,
            confidence: {
                syllables: unique(syllables).length === 1 ? 1 : 1 / unique(syllables).length,
                matras: unique(matras).length === 1 ? 1 : 1 / unique(matras).length,
                pattern: unique(patterns).length === 1 ? 1 : 1 / unique(patterns).length
            }
        };
    }

    function infer(analysis, options) {
        const stanzas = analysis && Array.isArray(analysis.stanzas)
            ? analysis.stanzas.filter((stanza) => stanza.lines && stanza.lines.length)
            : [];
        if (!stanzas.length) {
            throw new Error("A composition is required");
        }
        const activeIndex = Math.max(0, Math.min(
            Number(options && options.activeStanzaIndex) || 0,
            stanzas.length - 1
        ));
        const lineCount = stanzas[activeIndex].lines.length;
        const examples = stanzas.filter((stanza) => stanza.lines.length === lineCount);
        const roles = Array.from({ length: lineCount }, (_, lineIndex) =>
            inferLineRole(examples.map((stanza) => stanza.lines[lineIndex]), lineIndex));
        const sourceScheme = options && options.sourceScheme || "native";
        const romanApi = options && options.romanApi;
        const antya = relationInference(examples, "antya", sourceScheme, romanApi);
        const dvitiyakshara = relationInference(
            examples,
            "dvitiyakshara",
            sourceScheme,
            romanApi
        );
        const stableFeatures = roles.reduce((sum, role) => sum +
            Number(role.confidence.syllables === 1) +
            Number(role.confidence.matras === 1) +
            Number(role.cadence.length >= 2), 0);
        return {
            version: VERSION,
            lineCount,
            sampleCount: examples.length,
            ignoredStanzaCount: stanzas.length - examples.length,
            roles,
            rhyme: { antya, dvitiyakshara },
            refrains: stableRefrains(examples),
            examples: examples.slice(0, MAX_EXAMPLES).map((stanza) => stanza.text),
            scripts: unique(examples.flatMap((stanza) => stanza.scripts || [])),
            confidence: stableFeatures / Math.max(1, lineCount * 3)
        };
    }

    function ruleForMode(role, mode, options) {
        const exact = mode === "exact";
        const loose = mode === "loose";
        const syllablePadding = loose ? 1 : 0;
        const matraPadding = loose ? 2 : 0;
        const cadence = !exact && options.enforceCadence && role.cadence.length >= 2
            ? role.cadence
            : "";
        const cadenceStart = role.syllables.preferred - cadence.length + 1;
        const rule = {
            syllables: {
                min: Math.max(1, role.syllables.min - syllablePadding),
                max: role.syllables.max + syllablePadding,
                preferred: role.syllables.preferred
            },
            matras: {
                min: Math.max(1, role.matras.min - matraPadding),
                max: role.matras.max + matraPadding,
                preferred: role.matras.preferred
            },
            allowedPatterns: exact ? role.observedPatterns.slice() : [],
            weightConstraints: mode === "balanced"
                ? role.consensus.filter((constraint) =>
                    !cadence || constraint.position < cadenceStart)
                : [],
            preferredGroups: role.groupAlternatives[0] || [],
            cadence,
            yatiAfter: options.enforceYati && role.yati
                ? role.yati.afterSyllable
                : null
        };
        return rule;
    }

    function signatureLines(rules, mode, rhyme, refrains) {
        const lines = rules.map((rule, index) => {
            const syllables = rule.syllables.min === rule.syllables.max
                ? `${rule.syllables.min} syllables`
                : `${rule.syllables.min}–${rule.syllables.max} syllables`;
            const matras = rule.matras.min === rule.matras.max
                ? `${rule.matras.min} mātrās`
                : `${rule.matras.min}–${rule.matras.max} mātrās`;
            const cadence = rule.cadence ? ` · ends ${rule.cadence}` : "";
            return `${index + 1}. ${syllables} · ${matras}${cadence}`;
        });
        const rhymeParts = [rhyme.antya, rhyme.dvitiyakshara]
            .filter(Boolean).map((item) => `${item.type}: ${item.scheme}`);
        if (rhymeParts.length) {
            lines.push(rhymeParts.join(" · "));
        }
        if (refrains.length) {
            lines.push(`refrain: line ${refrains.map((item) => item.line).join(", ")}`);
        }
        lines.push(`${mode} custom form`);
        return lines;
    }

    function buildForm(inference, options) {
        if (!inference || !Array.isArray(inference.roles) || !inference.roles.length) {
            throw new Error("Invalid inference");
        }
        const mode = MODES.has(options && options.mode) ? options.mode : "balanced";
        const name = String(options && options.name || "").trim().slice(0, 120);
        if (!name) {
            throw new Error("A name is required");
        }
        const settings = {
            enforceCadence: options.enforceCadence !== false,
            enforceYati: options.enforceYati === true,
            enforceAntya: options.enforceAntya === true,
            enforceDvitiyakshara: options.enforceDvitiyakshara === true,
            enforceRefrain: options.enforceRefrain === true
        };
        const rules = inference.roles.map((role) =>
            ruleForMode(role, mode, settings));
        const rhyme = {
            antya: settings.enforceAntya ? clone(inference.rhyme.antya) : null,
            dvitiyakshara: settings.enforceDvitiyakshara
                ? clone(inference.rhyme.dvitiyakshara)
                : null
        };
        const refrains = settings.enforceRefrain
            ? clone(inference.refrains)
            : [];
        const now = new Date().toISOString();
        return normalizeForm({
            id: options.id || createId(),
            schemaVersion: 1,
            inferenceVersion: VERSION,
            name,
            mode,
            lineCount: inference.lineCount,
            rules,
            rhyme,
            refrains,
            settings,
            evidence: {
                sampleCount: inference.sampleCount,
                ignoredStanzaCount: inference.ignoredStanzaCount,
                confidence: inference.confidence,
                scripts: inference.scripts,
                examples: inference.examples
            },
            createdAt: options.createdAt || now,
            updatedAt: now
        });
    }

    function normalizeRange(value) {
        const minimum = Math.max(1, Number(value && value.min) || 1);
        const maximum = Math.max(minimum, Number(value && value.max) || minimum);
        return {
            min: minimum,
            max: maximum,
            preferred: Math.max(minimum, Math.min(
                maximum,
                Number(value && value.preferred) || minimum
            ))
        };
    }

    function normalizeRelation(value, lineCount) {
        if (!value || typeof value !== "object") {
            return null;
        }
        const lineGroups = (Array.isArray(value.lineGroups) ? value.lineGroups : [])
            .map((group) => unique((Array.isArray(group) ? group : [])
                .map(Number)
                .filter((line) => Number.isInteger(line) && line >= 1 &&
                    line <= lineCount)))
            .filter((group) => group.length > 1)
            .slice(0, lineCount);
        if (!lineGroups.length) {
            return null;
        }
        return {
            type: value.type === "dvitiyakshara" ? "dvitiyakshara" : "antya",
            scheme: String(value.scheme || "").slice(0, lineCount),
            lineGroups,
            support: Math.max(0, Number(value.support) || 0),
            sampleCount: Math.max(0, Number(value.sampleCount) || 0),
            confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0))
        };
    }

    function normalizeForm(value) {
        if (!value || typeof value !== "object" || !String(value.name || "").trim() ||
            !Array.isArray(value.rules) || !value.rules.length) {
            throw new Error("Invalid custom form");
        }
        const lineCount = Math.max(1, Math.min(24,
            Number(value.lineCount) || value.rules.length));
        const rules = value.rules.slice(0, lineCount).map((rule) => ({
            syllables: normalizeRange(rule.syllables),
            matras: normalizeRange(rule.matras),
            allowedPatterns: unique((rule.allowedPatterns || [])
                .map((pattern) => String(pattern).replace(/[^GL]/g, ""))
                .filter(Boolean)).slice(0, 16),
            weightConstraints: (rule.weightConstraints || []).filter((item) =>
                Number.isInteger(item.position) && item.position > 0 &&
                ["G", "L"].includes(item.weight)).slice(0, 128),
            preferredGroups: (rule.preferredGroups || []).map(Number)
                .filter((number) => Number.isInteger(number) && number > 0),
            cadence: String(rule.cadence || "").replace(/[^GL]/g, "").slice(-8),
            yatiAfter: Number.isInteger(rule.yatiAfter) && rule.yatiAfter > 0
                ? rule.yatiAfter
                : null
        }));
        if (rules.length !== lineCount) {
            throw new Error("Custom form line count does not match its rules");
        }
        const suppliedId = String(value.id || createId());
        const rhymeValue = value.rhyme && typeof value.rhyme === "object"
            ? value.rhyme
            : {};
        const evidenceValue = value.evidence && typeof value.evidence === "object"
            ? value.evidence
            : {};
        return {
            id: suppliedId.startsWith("custom:")
                ? suppliedId
                : `custom:${suppliedId}`,
            schemaVersion: 1,
            inferenceVersion: String(value.inferenceVersion || VERSION),
            name: String(value.name).trim().slice(0, 120),
            mode: MODES.has(value.mode) ? value.mode : "balanced",
            lineCount,
            rules,
            rhyme: {
                antya: normalizeRelation(rhymeValue.antya, lineCount),
                dvitiyakshara: normalizeRelation(
                    rhymeValue.dvitiyakshara,
                    lineCount
                )
            },
            refrains: (Array.isArray(value.refrains) ? value.refrains : [])
                .map((refrain) => ({
                    line: Number(refrain && refrain.line),
                    text: String(refrain && refrain.text || "").trim().slice(0, 2000)
                }))
                .filter((refrain) => Number.isInteger(refrain.line) &&
                    refrain.line >= 1 && refrain.line <= lineCount && refrain.text)
                .slice(0, lineCount),
            settings: value.settings && typeof value.settings === "object"
                ? clone(value.settings)
                : {},
            evidence: {
                sampleCount: Math.max(0, Number(evidenceValue.sampleCount) || 0),
                ignoredStanzaCount: Math.max(
                    0,
                    Number(evidenceValue.ignoredStanzaCount) || 0
                ),
                confidence: Math.max(
                    0,
                    Math.min(1, Number(evidenceValue.confidence) || 0)
                ),
                scripts: unique((Array.isArray(evidenceValue.scripts)
                    ? evidenceValue.scripts
                    : []).map(String)).slice(0, 8),
                examples: (Array.isArray(evidenceValue.examples)
                    ? evidenceValue.examples
                    : []).map((example) => String(example).slice(0, 20000))
                    .slice(0, MAX_EXAMPLES)
            },
            createdAt: Number.isFinite(Date.parse(value.createdAt))
                ? new Date(value.createdAt).toISOString()
                : new Date().toISOString(),
            updatedAt: Number.isFinite(Date.parse(value.updatedAt))
                ? new Date(value.updatedAt).toISOString()
                : new Date().toISOString()
        };
    }

    function normalizeForms(values) {
        const forms = [];
        const ids = new Set();
        for (const value of Array.isArray(values) ? values.slice(0, MAX_FORMS) : []) {
            try {
                const form = normalizeForm(value);
                if (!ids.has(form.id)) {
                    ids.add(form.id);
                    forms.push(form);
                }
            } catch (error) {
                // Ignore malformed private records without affecting the catalog.
            }
        }
        return forms.sort((left, right) => left.name.localeCompare(right.name));
    }

    function comparableForm(value) {
        const form = normalizeForm(value);
        delete form.updatedAt;
        return JSON.stringify(form);
    }

    function mergeForms(existingValues, incomingValues) {
        const forms = normalizeForms(existingValues);
        const byId = new Map(forms.map((form) => [form.id, form]));
        let added = 0;
        let skipped = 0;
        let conflicts = 0;
        for (const incoming of normalizeForms(incomingValues)) {
            const existing = byId.get(incoming.id);
            if (!existing) {
                byId.set(incoming.id, incoming);
                added += 1;
                continue;
            }
            if (comparableForm(existing) === comparableForm(incoming)) {
                skipped += 1;
                continue;
            }
            const copy = normalizeForm({
                ...incoming,
                id: createId(),
                name: `${incoming.name} (imported copy)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            byId.set(copy.id, copy);
            conflicts += 1;
        }
        return {
            forms: normalizeForms(Array.from(byId.values())),
            added,
            skipped,
            conflicts
        };
    }

    function relationToCatalog(relation, type) {
        return relation ? {
            type: type === "antya"
                ? "antya-prasa"
                : "dvitiyakshara-prasa",
            lineGroups: relation.lineGroups,
            required: true,
            provenance: "user-custom-form"
        } : null;
    }

    function toCatalogMeter(formValue) {
        const form = normalizeForm(formValue);
        const lineRelations = [
            relationToCatalog(form.rhyme.antya, "antya"),
            relationToCatalog(form.rhyme.dvitiyakshara, "dvitiyakshara")
        ].filter(Boolean);
        return {
            id: form.id,
            name: form.name,
            aliases: [form.name, "custom", "my pattern"],
            kind: "custom",
            signatureLines: signatureLines(
                form.rules,
                form.mode,
                form.rhyme,
                form.refrains
            ),
            ruleCompleteness: "user-defined",
            linePolicy: { type: "fixed", unit: "line", count: form.lineCount },
            customRules: form.rules,
            lineRelations,
            refrains: form.refrains,
            customForm: form
        };
    }

    return {
        VERSION,
        STORAGE_META_KEY,
        LOCAL_STORAGE_KEY,
        MAX_FORMS,
        infer,
        buildForm,
        normalizeForm,
        normalizeForms,
        mergeForms,
        toCatalogMeter
    };
}));
