/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function englishFormsModule(root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.ChandasEnglishForms = api;
    }
}(typeof window !== "undefined" ? window : globalThis,
    function createEnglishFormsApi() {
        "use strict";

        const MATCH_COST = Object.freeze({
            exact: 0,
            compatible: 0.12,
            incomplete: 0.8,
            approximate: 0.65
        });

        function normalizeWord(value) {
            return String(value || "")
                .normalize("NFKD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[’‘]/g, "'")
                .toLocaleLowerCase("en-US");
        }

        function validateRhymeDocument(document) {
            if (!document || document.schemaVersion !== 1 ||
                document.representation !== "final-stressed-vowel-rime" ||
                !Array.isArray(document.entries)) {
                throw new Error("Invalid English rhyme dictionary");
            }
            return document;
        }

        function createRhymeLexicon(document) {
            validateRhymeDocument(document);
            const entries = new Map();
            for (const entry of document.entries) {
                if (!Array.isArray(entry) || typeof entry[0] !== "string" ||
                    !Array.isArray(entry[1])) {
                    continue;
                }
                const records = entry[1].filter((record) =>
                    Array.isArray(record) && typeof record[0] === "string" &&
                    Number.isInteger(record[1]) && record[1] >= 0)
                    .map((record) => ({ key: record[0], trailing: record[1] }));
                if (records.length) {
                    entries.set(entry[0], records);
                }
            }
            return {
                metadata: {
                    accent: document.accent,
                    source: document.source,
                    counts: document.counts
                },
                entries
            };
        }

        function validateCatalog(catalog) {
            if (!catalog || catalog.analysisSystem !== "english-form" ||
                !Array.isArray(catalog.forms) || !catalog.forms.length) {
                throw new Error("Invalid English form catalog");
            }
            const ids = new Set();
            for (const form of catalog.forms) {
                if (!form.id || !form.name || ids.has(form.id) ||
                    !form.lineCount || !Array.isArray(form.meterSequence) ||
                    !form.meterSequence.length) {
                    throw new Error(`Invalid English form: ${form.id || "(missing id)"}`);
                }
                ids.add(form.id);
            }
            return catalog;
        }

        function lookupRecords(word, lexicon) {
            const normalized = normalizeWord(word);
            const direct = lexicon.entries.get(normalized);
            if (direct) {
                return direct;
            }
            if (normalized.endsWith("'s")) {
                return lexicon.entries.get(normalized.slice(0, -2)) || null;
            }
            return null;
        }

        function recordsIntersect(left, right) {
            const rightKeys = new Set(right.map((record) => record.key));
            return left.some((record) => rightKeys.has(record.key));
        }

        function rhymeKind(records) {
            if (!records || !records.length) {
                return "unknown";
            }
            const kinds = new Set(records.map((record) =>
                record.trailing > 0 ? "feminine" : "masculine"));
            return kinds.size === 1 ? [...kinds][0] : "ambiguous";
        }

        function schemeLabel(index) {
            const letter = String.fromCharCode(65 + (index % 26));
            return index < 26 ? letter : `${letter}${Math.floor(index / 26)}`;
        }

        function analyzeRhymes(lines, lexicon) {
            const groups = [];
            const endings = (lines || []).map((line, lineIndex) => {
                const token = line.tokens && line.tokens.at(-1);
                const word = token ? token.text : "";
                const records = token ? lookupRecords(token.normalized || word, lexicon) : null;
                if (!records) {
                    return {
                        line: lineIndex + 1,
                        word,
                        start: token ? token.start : line.end,
                        end: token ? token.end : line.end,
                        label: "?",
                        confidence: "unknown",
                        kind: "unknown",
                        keys: []
                    };
                }
                const matches = groups.map((group, index) =>
                    recordsIntersect(records, group.records) ? index : -1)
                    .filter((index) => index >= 0);
                const groupIndex = matches.length ? matches[0] : groups.length;
                if (!groups[groupIndex]) {
                    groups[groupIndex] = { records: [...records], lines: [] };
                } else {
                    const known = new Set(groups[groupIndex].records.map((item) =>
                        `${item.key}|${item.trailing}`));
                    records.forEach((record) => {
                        const key = `${record.key}|${record.trailing}`;
                        if (!known.has(key)) {
                            known.add(key);
                            groups[groupIndex].records.push(record);
                        }
                    });
                }
                groups[groupIndex].lines.push(lineIndex + 1);
                return {
                    line: lineIndex + 1,
                    word,
                    start: token.start,
                    end: token.end,
                    label: schemeLabel(groupIndex),
                    confidence: matches.length > 1 ? "ambiguous" : "dictionary",
                    kind: rhymeKind(records),
                    keys: records.map((record) => record.key)
                };
            });
            const repeatedGroups = groups.filter((group) => group.lines.length > 1);
            return {
                scheme: endings.map((ending) => ending.label).join(""),
                displayScheme: endings.map((ending) => ending.label).join(" "),
                endings,
                knownCount: endings.filter((ending) => ending.label !== "?").length,
                unknownCount: endings.filter((ending) => ending.label === "?").length,
                repeatedGroups: repeatedGroups.map((group, index) => ({
                    label: schemeLabel(groups.indexOf(group)),
                    lines: group.lines,
                    kind: rhymeKind(group.records)
                }))
            };
        }

        function lineCountMatches(rule, count) {
            if (Number.isInteger(rule.exact)) {
                return count === rule.exact;
            }
            if (Number.isInteger(rule.min) && count < rule.min) {
                return false;
            }
            return !Number.isInteger(rule.multiple) || count % rule.multiple === 0;
        }

        function canonicalTerzaRima(lineCount) {
            const labels = [];
            for (let tercet = 0; tercet < lineCount / 3; tercet += 1) {
                labels.push(
                    schemeLabel(tercet),
                    schemeLabel(tercet + 1),
                    schemeLabel(tercet)
                );
            }
            return labels.join("");
        }

        function expectedSchemes(form, lineCount) {
            if (form.rhymePolicy === "terza-rima") {
                return [canonicalTerzaRima(lineCount)];
            }
            return form.rhymeSchemes || [];
        }

        function rhymeFit(form, rhyme, lineCount) {
            if (form.rhymePolicy === "advisory") {
                return { mismatchCount: 0, expected: "", exact: true };
            }
            if (form.rhymePolicy === "unrhymed") {
                const repeated = rhyme.repeatedGroups.reduce((sum, group) =>
                    sum + group.lines.length - 1, 0);
                return {
                    mismatchCount: repeated,
                    expected: "unrhymed",
                    exact: repeated === 0 && rhyme.unknownCount === 0
                };
            }
            let best = null;
            for (const expected of expectedSchemes(form, lineCount)) {
                let mismatchCount = 0;
                for (let index = 0; index < expected.length; index += 1) {
                    if (rhyme.scheme[index] !== "?" &&
                        rhyme.scheme[index] !== expected[index]) {
                        mismatchCount += 1;
                    }
                }
                const candidate = {
                    mismatchCount,
                    expected,
                    exact: mismatchCount === 0 && rhyme.unknownCount === 0
                };
                if (!best || candidate.mismatchCount < best.mismatchCount) {
                    best = candidate;
                }
            }
            return best || { mismatchCount: 0, expected: "", exact: true };
        }

        function meterChoices(form, lineIndex) {
            if (form.repeatMeterSequence) {
                return form.meterSequence[lineIndex % form.meterSequence.length];
            }
            return form.meterSequence[lineIndex] || [];
        }

        function lineMeterFit(line, choices, tolerance) {
            const candidates = (line.candidates || []).filter((candidate) =>
                choices.includes(candidate.id));
            if (!candidates.length) {
                return null;
            }
            const normalized = candidates.map((candidate) => {
                const canonicalDistance = Math.abs(
                    candidate.canonicalPattern.length - candidate.syllables.length
                );
                const recoverPartial = candidate.matchLevel === "incomplete" &&
                    (canonicalDistance === 0 ||
                        (tolerance === "ternary" && canonicalDistance <= 1));
                return {
                    candidate,
                    canonicalDistance,
                    level: recoverPartial ? "compatible" : candidate.matchLevel,
                    score: candidate.score + (recoverPartial ? 0.12 : 0)
                };
            }).sort((left, right) =>
                (MATCH_COST[left.level] ?? 1) - (MATCH_COST[right.level] ?? 1) ||
                left.score - right.score);
            const best = normalized[0];
            const maximumDistance = tolerance === "ternary" ? 1 : 0;
            if (best.level === "incomplete" ||
                best.canonicalDistance > maximumDistance ||
                best.candidate.extraCount > maximumDistance ||
                (best.level === "approximate" && best.score >
                    (tolerance === "ternary" ? 0.34 : 0.24))) {
                return null;
            }
            return {
                id: best.candidate.id,
                level: best.level,
                score: (MATCH_COST[best.level] ?? 1) + best.score
            };
        }

        function compareForms(left, right) {
            const levelRank = { exact: 0, compatible: 1 };
            return levelRank[left.matchLevel] - levelRank[right.matchLevel] ||
                left.score - right.score ||
                right.specificity - left.specificity ||
                right.prominence - left.prominence ||
                left.name.localeCompare(right.name, "en");
        }

        function analyzeForms(lines, rhyme, catalog) {
            validateCatalog(catalog);
            const lineCount = lines.length;
            return catalog.forms.map((form) => {
                if (!lineCountMatches(form.lineCount, lineCount)) {
                    return null;
                }
                const meterFits = lines.map((line, index) =>
                    lineMeterFit(
                        line,
                        meterChoices(form, index),
                        form.meterTolerance
                    ));
                if (meterFits.some((fit) => !fit)) {
                    return null;
                }
                const rhymeResult = rhymeFit(form, rhyme, lineCount);
                if (rhymeResult.mismatchCount > 0) {
                    return null;
                }
                const approximateMeters = meterFits.filter((fit) =>
                    fit.level === "approximate").length;
                const meterScore = meterFits.reduce((sum, fit) =>
                    sum + fit.score, 0) / lineCount;
                const exact = !approximateMeters && rhymeResult.exact;
                const specificity = Number.isInteger(form.lineCount.exact)
                    ? form.lineCount.exact
                    : 1;
                return {
                    id: form.id,
                    name: form.name,
                    aliases: form.aliases || [],
                    matchLevel: exact ? "exact" : "compatible",
                    lineCount,
                    meterFits,
                    expectedRhyme: rhymeResult.expected,
                    observedRhyme: rhyme.scheme,
                    unknownRhymes: rhyme.unknownCount,
                    prominence: form.prominence || 0,
                    specificity,
                    score: meterScore + rhyme.unknownCount * 0.08 -
                        (form.prominence || 0) * 0.008 - specificity * 0.002,
                    sourceRef: form.sourceRef
                };
            }).filter(Boolean).sort(compareForms);
        }

        function analyzeStanza(lines, rhymeLexicon, catalog) {
            const activeLines = (lines || []).filter((line) =>
                line.tokens && line.tokens.length);
            const rhyme = analyzeRhymes(activeLines, rhymeLexicon);
            const forms = analyzeForms(activeLines, rhyme, catalog);
            return {
                analysisSystem: "english-form",
                rhyme,
                forms,
                bestForm: forms[0] || null
            };
        }

        return {
            analyzeForms,
            analyzeRhymes,
            analyzeStanza,
            canonicalTerzaRima,
            createRhymeLexicon,
            normalizeWord,
            validateCatalog,
            validateRhymeDocument
        };
    }));
