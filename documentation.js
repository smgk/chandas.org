/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function documentationModule(globalScope, factory) {
    const api = factory();

    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }

    if (globalScope && globalScope.document) {
        globalScope.addEventListener("DOMContentLoaded", () => {
            api.initializeMeterCatalog(globalScope.document);
        });
    }
}(typeof globalThis !== "undefined" ? globalThis : this, function createDocumentationApi() {
    "use strict";

    const GANA_NAMES = new Map([
        ["LGG", "ya-gaṇa"],
        ["GGG", "ma-gaṇa"],
        ["GGL", "ta-gaṇa"],
        ["GLG", "ra-gaṇa"],
        ["LGL", "ja-gaṇa"],
        ["GLL", "bha-gaṇa"],
        ["LLL", "na-gaṇa"],
        ["LLG", "sa-gaṇa"]
    ]);

    function foldSearch(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/\p{Mark}/gu, "")
            .toLocaleLowerCase();
    }

    function fixedVersePatterns(value) {
        const patterns = (Array.isArray(value) ? value : [value])
            .map((pattern) => String(pattern || "").toUpperCase().replace(/[^LG]/g, ""))
            .filter(Boolean);

        if (patterns.length === 0) {
            return [];
        }
        if (patterns.length === 4) {
            return patterns;
        }
        if (patterns.length === 2) {
            return [patterns[0], patterns[1], patterns[0], patterns[1]];
        }
        return Array.from({ length: 4 }, (_, index) => patterns[index % patterns.length]);
    }

    function ganaReading(pattern) {
        const weights = Array.from(String(pattern || ""));
        const reading = [];

        for (let index = 0; index < weights.length; index += 3) {
            const group = weights.slice(index, index + 3).join("");
            if (group.length === 3) {
                reading.push(GANA_NAMES.get(group) || group);
            } else {
                reading.push(...Array.from(group, (weight) =>
                    weight === "G" ? "Guru" : "Laghu"));
            }
        }
        return reading;
    }

    function node(document, tag, className, text) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        if (text !== undefined) {
            element.textContent = text;
        }
        return element;
    }

    function addDefinition(document, parent, term, description) {
        parent.append(
            node(document, "dt", "", term),
            node(document, "dd", "", description)
        );
    }

    function corpusExamples(corpus) {
        const defaults = corpus && typeof corpus.defaults === "object"
            ? corpus.defaults
            : {};
        return Array.isArray(corpus && corpus.examples)
            ? corpus.examples.map((example) => ({
                ...defaults,
                ...example,
                source: example.source || defaults.source
            }))
            : [];
    }

    function exampleFitsFixedPatterns(example, versePatterns) {
        if (!Array.isArray(example.versePatterns)) {
            return true;
        }
        return example.versePatterns.length === versePatterns.length &&
            example.versePatterns.every((pattern, index) =>
                pattern === versePatterns[index]);
    }

    function fixedMeter(entry, index, examples) {
        const name = String(entry[0] || `Meter ${index + 1}`);
        const versePatterns = fixedVersePatterns(entry[1]);
        const matchingExamples = Array.isArray(examples)
            ? examples.filter((example) =>
                exampleFitsFixedPatterns(example, versePatterns))
            : [];
        const syllableCounts = Array.from(new Set(versePatterns.map((pattern) => pattern.length)));
        return {
            id: `fixed:${index}`,
            name,
            kind: "fixed",
            kindLabel: "Fixed vṛtta",
            aliases: [],
            examples: matchingExamples,
            versePatterns,
            searchText: foldSearch(`${name} fixed vritta ${syllableCounts.join(" ")}`),
            summary: syllableCounts.length === 1
                ? `${syllableCounts[0]} syllables per pāda · 4 pādas`
                : `${syllableCounts.join("/")} syllables · 4 pādas`
        };
    }

    function structuralMeter(entry) {
        const aliases = Array.isArray(entry.aliases) ? entry.aliases : [];
        const isMatra = entry.kind === "matra";
        const isAmsha = entry.kind === "amsha";
        const isTeluguGana = entry.kind === "telugu-gana";
        const repeating = entry.linePolicy &&
            ["repeating", "variable"].includes(entry.linePolicy.type);
        return {
            ...entry,
            kindLabel: isMatra
                ? "Mātrā meter"
                : isAmsha
                    ? "Aṃśa meter"
                    : isTeluguGana
                        ? "Telugu deśi-gaṇa meter"
                    : "Structural syllabic meter",
            searchText: foldSearch([
                entry.name,
                ...aliases,
                entry.kind,
                ...(entry.signatureLines || []),
                entry.notes || ""
            ].join(" ")),
            summary: isMatra
                ? repeating
                    ? "repeatable lines · mātrā groups"
                    : `${entry.padaGroups.length} lines · mātrā groups`
                : isAmsha
                    ? `${entry.amshaGroups.length} lines · aṃśa-gaṇas`
                    : isTeluguGana
                        ? `${entry.amshaGroups.length} lines · Sūrya/Indra gaṇas`
                : `${entry.padas.length} lines · syllable rules`
        };
    }

    function renderFixedDetails(document, meter, body) {
        const introduction = node(
            document,
            "p",
            "meter-catalog-explanation",
            "Read each row from left to right. The gaṇa reading groups syllables in threes; " +
                "a final one or two syllables are named separately."
        );
        const lines = node(document, "div", "meter-pattern-lines");

        meter.versePatterns.forEach((pattern, index) => {
            const line = node(document, "section", "meter-pattern-line");
            const title = node(document, "h4", "", `Pāda ${index + 1}`);
            const signature = node(document, "code", "meter-signature");
            signature.textContent = Array.from(pattern).join(" ");
            signature.setAttribute(
                "aria-label",
                Array.from(pattern, (weight) => weight === "G" ? "Guru" : "Laghu").join(", ")
            );
            const reading = node(
                document,
                "p",
                "gana-reading",
                `Gaṇas: ${ganaReading(pattern).join(" · ")}`
            );
            line.append(title, signature, reading);
            lines.append(line);
        });

        body.append(introduction, lines);
    }

    function ruleLevelLabel(value) {
        return {
            complete: "Complete catalog rules",
            "group-totals": "Mātrā-group totals",
            "provisional-rhythm": "Provisional rhythmic rules",
            "gujarati-tala-totals": "Gujarati mātrā and tāla totals",
            "gujarati-akshara-count": "Gujarati akṣara-count rules",
            "pathyā": "Pathyā rules",
            "classical-pathyā-vipulā": "Classical pathyā and vipulā rules"
        }[value] || String(value || "Catalog rules");
    }

    function ruleSelector(rule) {
        if (Array.isArray(rule.globalGroups)) {
            return `Gaṇas ${rule.globalGroups.join(", ")}`;
        }
        if (rule.everyGroup) {
            return "Every gaṇa";
        }
        if (Array.isArray(rule.padas) && Array.isArray(rule.localGroups)) {
            return `Lines ${rule.padas.join(", ")}, gaṇas ${rule.localGroups.join(", ")}`;
        }
        return "Selected gaṇas";
    }

    function renderStructuralDetails(document, meter, body) {
        const definitions = node(document, "dl", "meter-definitions");
        addDefinition(document, definitions, "Recognition level", ruleLevelLabel(meter.ruleCompleteness));
        (meter.signatureLines || []).forEach((signature, index) => {
            addDefinition(
                document,
                definitions,
                index === 0 ? "Signature" : " ",
                signature
            );
        });

        if (meter.kind === "matra") {
            const repeating = meter.linePolicy &&
                ["repeating", "variable"].includes(meter.linePolicy.type);
            const lines = meter.padaGroups.map((groups, index) => {
                const options = meter.padaGroupOptions &&
                    meter.padaGroupOptions[index];
                const patterns = Array.isArray(options)
                    ? options.map((option) => option.join(" + ")).join(" or ")
                    : groups.join(" + ");
                return `${repeating ? "Each line" : `Line ${index + 1}`}: ` +
                    `${patterns} = ${groups.reduce((sum, value) => sum + value, 0)} mātrās`;
            });
            addDefinition(document, definitions, "Line-by-line", lines.join(" · "));
            if (meter.compactMatraLayout) {
                addDefinition(
                    document,
                    definitions,
                    "Accepted typing layout",
                    `${meter.padaGroups.length} separate caraṇa lines or ` +
                        `${meter.compactMatraLayout.sourceUnitCount} lines with ` +
                        `${meter.compactMatraLayout.padasPerSourceUnit} caraṇas each`
                );
            }
        } else if (meter.kind === "amsha" || meter.kind === "telugu-gana") {
            const formatGroups = (groups) => groups.map((slot) =>
                (Array.isArray(slot) ? slot.join("/") : slot)).join(" · ");
            const lines = meter.amshaGroups.map((groups, index) =>
                `Line ${index + 1}: ${formatGroups(groups)}`);
            addDefinition(document, definitions, "Line-by-line", lines.join(" · "));
            addDefinition(document, definitions, meter.kind === "telugu-gana"
                ? "Telugu gaṇa key" : "Aṃśa key", meter.kind === "telugu-gana"
                ? "S = Sūrya (GL or LLL); I = Indra (LLLL, LLLG, LLGL, GLL, GLG, or GGL)"
                : "B = Brahma, V = Viṣṇu, R = Rudra; a slash marks an accepted alternative");
            if (meter.kind === "telugu-gana" &&
                Array.isArray(meter.ganaLayouts) && meter.ganaLayouts.length) {
                addDefinition(
                    document,
                    definitions,
                    "Accepted written layouts",
                    meter.ganaLayouts.map((layout) =>
                        `${layout.name}: ${layout.groups.map(formatGroups).join(" / ")}`
                    ).join(" · ")
                );
            }
            if (meter.kind === "amsha" && Array.isArray(meter.amshaSubstitutions) &&
                meter.amshaSubstitutions.length) {
                const substitutions = meter.amshaSubstitutions.map((rule) =>
                    `Line ${rule.padas.join("/")}, gaṇa ` +
                    `${rule.localGroups.join("/")}: ` +
                    `${rule.expectedClass}→${rule.actualClass}, ` +
                    `${rule.realizedMatras} sung mātrās, no karṣaṇa`);
                addDefinition(
                    document,
                    definitions,
                    "Reviewed recital realizations",
                    substitutions.join(" · ")
                );
            }
        } else {
            const lines = meter.padas.map((pada, index) => {
                const hasRealizations = Array.isArray(pada.realizations) &&
                    pada.realizations.length;
                const cadence = !hasRealizations && pada.cadence
                    ? `; positions ${pada.cadence.start}–` +
                        `${pada.cadence.start + pada.cadence.pattern.length - 1} = ` +
                        `${pada.cadence.pattern}`
                    : "";
                const forbidden = (hasRealizations ? [] : pada.forbidden || []).map((rule) =>
                    `; positions ${rule.start}–${rule.start + rule.patterns[0].length - 1} ` +
                    `cannot be ${rule.patterns.join(" or ")}`).join("");
                const realizations = (pada.realizations || []).map((realization) => {
                    const sequences = [
                        ...(realization.required || []),
                        ...(realization.cadence ? [realization.cadence] : [])
                    ].map((sequence) =>
                        `positions ${sequence.start}–` +
                        `${sequence.start + sequence.pattern.length - 1} = ` +
                        sequence.pattern);
                    const boundaries = (realization.boundariesAfter || []).map((position) =>
                        `caesura after ${position}`);
                    const exclusions = (realization.forbidden || []).map((rule) =>
                        `positions ${rule.start}–` +
                        `${rule.start + rule.patterns[0].length - 1} not ` +
                        rule.patterns.join(" or "));
                    return `${realization.name}: ` +
                        [...sequences, ...exclusions, ...boundaries].join(", ");
                });
                const alternatives = realizations.length
                    ? `; accepted forms: ${realizations.join("; ")}`
                    : "";
                return `Pāda ${index + 1}: ${pada.syllables} syllables` +
                    `${cadence}${forbidden}${alternatives}`;
            });
            addDefinition(document, definitions, "Line-by-line", lines.join(" · "));
        }

        (meter.groupRules || []).forEach((rule) => {
            const condition = Array.isArray(rule.allowedPatterns)
                ? `must be ${rule.allowedPatterns.join(" or ")}`
                : Array.isArray(rule.allowedPrefixes)
                    ? `must begin ${rule.allowedPrefixes.join(" or ")}`
                : Array.isArray(rule.forbiddenPrefixes)
                    ? `cannot begin ${(rule.forbiddenPrefixes || []).join(" or ")}`
                    : `cannot be ${(rule.forbiddenPatterns || []).join(" or ")}`;
            addDefinition(document, definitions, ruleSelector(rule), condition);
        });
        (meter.boundaryRules || []).forEach((rule) => {
            addDefinition(
                document,
                definitions,
                ruleSelector(rule),
                `when ${(rule.whenPatterns || []).join(" or ")}, place yati after ` +
                    `syllable ${rule.afterSyllable}`
            );
        });
        (meter.lineBoundaryRules || []).forEach((rule) => {
            addDefinition(
                document,
                definitions,
                `Lines ${(rule.padas || []).join(", ")}`,
                `place yati after gaṇa ${rule.afterGroup}`
            );
        });
        (meter.padaEndRules || []).forEach((rule) => {
            addDefinition(
                document,
                definitions,
                `Lines ${(rule.padas || []).join(", ")} ending`,
                `must end ${rule.allowedPatterns.join(" or ")}`
            );
        });
        (meter.yatiRelations || []).forEach((rule) => {
            addDefinition(
                document,
                definitions,
                `Lines ${(rule.padas || []).join(", ")}`,
                `yati joins gaṇa ${rule.anchorGroup} with gaṇa ${rule.targetGroup}; ` +
                    "friendship equivalence is advisory pending expert review"
            );
        });
        (meter.lineRelations || []).forEach((relation) => {
            if (relation.type === "pairwise-antya-prasa") {
                addDefinition(
                    document,
                    definitions,
                    "Line relationship",
                    `Each group of ${relation.pairSize} adjacent lines shares its ending consonant`
                );
            } else if (relation.type === "pairwise-dvitiyakshara-prasa") {
                addDefinition(
                    document,
                    definitions,
                    "Line relationship",
                    `Each group of ${relation.pairSize} adjacent lines shares dvitīyākṣara-prāsa`
                );
            } else if (relation.type === "dvitiyakshara-prasa") {
                addDefinition(
                    document,
                    definitions,
                    "Line relationship",
                    "All applicable lines share dvitīyākṣara-prāsa"
                );
            }
        });

        body.append(definitions);
        if (meter.notes) {
            body.append(node(document, "p", "meter-note", meter.notes));
        }
        if (Array.isArray(meter.uncheckedRules) && meter.uncheckedRules.length) {
            body.append(node(
                document,
                "p",
                "meter-warning",
                `Not checked yet: ${meter.uncheckedRules.join(", ")}.`
            ));
        }
        renderExamples(document, meter, body);
    }

    function renderExamples(document, meter, body) {
        const examples = Array.isArray(meter.examples) ? meter.examples : [];
        if (!examples.length) {
            body.append(node(
                document,
                "p",
                "meter-example-missing",
                "No authenticated, child-safe example has been added yet."
            ));
            return;
        }
        const section = node(document, "section", "meter-examples");
        section.append(node(document, "h4", "", "Example to scan"));
        examples.forEach((example) => {
            const article = node(document, "article", "meter-example");
            const heading = node(document, "h5", "", example.title || "Example");
            const byline = node(
                document,
                "p",
                "meter-example-byline",
                [example.author, example.language, example.script]
                    .filter(Boolean).join(" · ")
            );
            const review = node(
                document,
                "p",
                "meter-example-review",
                example.verificationStatus === "source-verified"
                    ? "Source verified · reviewed for young readers"
                    : "Bibliographic source pending · reviewed for young readers"
            );
            const verse = node(document, "pre", "meter-example-text", example.text);
            const actions = node(document, "p", "meter-example-actions");
            const tryLink = node(document, "a", "meter-example-try", "Try in Chandas");
            const query = new URLSearchParams({
                verse: String(example.text || ""),
                meter: String(example.meterId || meter.id || "")
            });
            tryLink.href = `index.html?${query.toString()}`;
            actions.append(tryLink);
            if (example.source && example.source.url) {
                const sourceLink = node(document, "a", "meter-example-source", "Source");
                sourceLink.href = example.source.url;
                sourceLink.rel = "noreferrer";
                actions.append(document.createTextNode(" · "), sourceLink);
            }
            article.append(heading, byline, review, verse, actions);
            section.append(article);
        });
        body.append(section);
    }

    function meterCard(document, meter) {
        const details = node(document, "details", "meter-catalog-item");
        details.dataset.kind = meter.kind;
        const summary = node(document, "summary", "");
        const name = node(document, "span", "meter-catalog-name", meter.name);
        const meta = node(
            document,
            "span",
            "meter-catalog-meta",
            `${meter.kindLabel} · ${meter.summary}`
        );
        const body = node(document, "div", "meter-catalog-body");
        summary.append(name, meta);
        details.append(summary, body);

        details.addEventListener("toggle", () => {
            if (!details.open || body.dataset.rendered) {
                return;
            }
            if (meter.kind === "fixed") {
                renderFixedDetails(document, meter, body);
                renderExamples(document, meter, body);
            } else {
                renderStructuralDetails(document, meter, body);
            }
            body.dataset.rendered = "true";
        });

        return details;
    }

    function renderCatalog(document, meters, query, kind, exampleFilter) {
        const list = document.getElementById("meter-catalog-list");
        const status = document.getElementById("meter-catalog-status");
        const foldedQuery = foldSearch(query);
        const matching = meters.filter((meter) =>
            (!kind || kind === "all" || meter.kind === kind) &&
            (exampleFilter !== "verified" || meter.hasVerifiedExample) &&
            (exampleFilter !== "missing" || !meter.hasVerifiedExample) &&
            (!foldedQuery || meter.searchText.includes(foldedQuery))
        );
        const fragment = document.createDocumentFragment();

        matching.forEach((meter) => fragment.append(meterCard(document, meter)));
        list.replaceChildren(fragment);
        status.textContent = `${matching.length.toLocaleString("en")} of ` +
            `${meters.length.toLocaleString("en")} supported meters shown.`;
    }

    async function initializeMeterCatalog(document) {
        const list = document.getElementById("meter-catalog-list");
        if (!list) {
            return;
        }

        const status = document.getElementById("meter-catalog-status");
        const search = document.getElementById("meter-catalog-search");
        const filter = document.getElementById("meter-catalog-kind");
        const exampleFilter = document.getElementById("meter-catalog-examples");

        try {
            const [
                fixedResponse,
                structuralResponse,
                corpusResponse,
                apteResponse
            ] = await Promise.all([
                fetch("mishra.json", { cache: "force-cache" }),
                fetch("structural_meters.json", { cache: "force-cache" }),
                fetch("examples/field_guide_corpus.json", { cache: "force-cache" }),
                fetch("examples/apte_sanskrit_examples.json", { cache: "force-cache" })
            ]);
            if (!fixedResponse.ok || !structuralResponse.ok ||
                    !corpusResponse.ok || !apteResponse.ok) {
                throw new Error("Catalog request failed");
            }
            const fixedCatalog = await fixedResponse.json();
            const structuralCatalog = await structuralResponse.json();
            const corpus = await corpusResponse.json();
            const apteCorpus = await apteResponse.json();
            const allExamples = [
                ...corpusExamples(corpus),
                ...corpusExamples(apteCorpus)
            ];
            const examplesByMeter = new Map();
            allExamples.forEach((example) => {
                const examples = examplesByMeter.get(example.meterId) || [];
                examples.push(example);
                examplesByMeter.set(example.meterId, examples);
            });
            const structural = structuralCatalog.meters.map((entry) =>
                structuralMeter({
                    ...entry,
                    examples: examplesByMeter.get(entry.id) || []
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
            const fixed = [
                ...(fixedCatalog.metres || []),
                ...(structuralCatalog.fixedMeters || [])
            ].map((entry, index) => fixedMeter(
                entry,
                index,
                examplesByMeter.get(String(entry[0])) || []
            ))
                .sort((a, b) => a.name.localeCompare(b.name));
            const meters = [...structural, ...fixed];
            meters.forEach((meter) => {
                meter.hasVerifiedExample = meter.examples.some((example) =>
                    example.verificationStatus === "source-verified" &&
                    example.childSafety === "reviewed-safe");
            });
            document.getElementById("meter-catalog-total").textContent =
                `${meters.length.toLocaleString("en")} meters`;
            document.getElementById("meter-catalog-fixed-count").textContent =
                `${fixed.length.toLocaleString("en")} fixed vṛttas`;
            document.getElementById("meter-catalog-structural-count").textContent =
                `${structural.length.toLocaleString("en")} structural or mātrā meters`;
            const verifiedMeterCount = new Set(meters
                .filter((meter) => meter.hasVerifiedExample)
                .map((meter) => meter.name)).size;
            document.getElementById("meter-catalog-example-count").textContent =
                `${verifiedMeterCount.toLocaleString("en")} meters currently have ` +
                "authenticated, child-safe examples.";
            const update = () => renderCatalog(
                document,
                meters,
                search.value,
                filter.value,
                exampleFilter.value
            );

            search.addEventListener("input", update);
            filter.addEventListener("change", update);
            exampleFilter.addEventListener("change", update);
            update();
        } catch (error) {
            status.textContent = "The meter catalog could not be loaded. " +
                "The prosody muse may be offline before her first visit.";
            list.replaceChildren();
        }
    }

    return {
        fixedVersePatterns,
        foldSearch,
        ganaReading,
        corpusExamples,
        exampleFitsFixedPatterns,
        initializeMeterCatalog,
        structuralMeter
    };
}));
