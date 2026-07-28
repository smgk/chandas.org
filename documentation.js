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

    function fixedMeter(entry, index) {
        const name = String(entry[0] || `Meter ${index + 1}`);
        const versePatterns = fixedVersePatterns(entry[1]);
        const syllableCounts = Array.from(new Set(versePatterns.map((pattern) => pattern.length)));
        return {
            id: `fixed:${index}`,
            name,
            kind: "fixed",
            kindLabel: "Fixed vṛtta",
            aliases: [],
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
        const repeating = entry.linePolicy &&
            ["repeating", "variable"].includes(entry.linePolicy.type);
        return {
            ...entry,
            kindLabel: isMatra ? "Mātrā meter" : "Structural syllabic meter",
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
            "group-totals": "Mātrā-group totals",
            "provisional-rhythm": "Provisional rhythmic rules",
            "pathyā": "Pathyā rules"
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
        } else {
            const lines = meter.padas.map((pada, index) => {
                const cadence = pada.cadence
                    ? `; positions ${pada.cadence.start}–` +
                        `${pada.cadence.start + pada.cadence.pattern.length - 1} = ` +
                        `${pada.cadence.pattern}`
                    : "";
                const forbidden = (pada.forbidden || []).map((rule) =>
                    `; positions ${rule.start}–${rule.start + rule.patterns[0].length - 1} ` +
                    `cannot be ${rule.patterns.join(" or ")}`).join("");
                return `Pāda ${index + 1}: ${pada.syllables} syllables${cadence}${forbidden}`;
            });
            addDefinition(document, definitions, "Line-by-line", lines.join(" · "));
        }

        (meter.groupRules || []).forEach((rule) => {
            const condition = Array.isArray(rule.allowedPatterns)
                ? `must be ${rule.allowedPatterns.join(" or ")}`
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
        (meter.lineRelations || []).forEach((relation) => {
            if (relation.type === "pairwise-antya-prasa") {
                addDefinition(
                    document,
                    definitions,
                    "Line relationship",
                    `Each group of ${relation.pairSize} adjacent lines shares its ending consonant`
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
            } else {
                renderStructuralDetails(document, meter, body);
            }
            body.dataset.rendered = "true";
        });

        return details;
    }

    function renderCatalog(document, meters, query, kind) {
        const list = document.getElementById("meter-catalog-list");
        const status = document.getElementById("meter-catalog-status");
        const foldedQuery = foldSearch(query);
        const matching = meters.filter((meter) =>
            (!kind || kind === "all" || meter.kind === kind) &&
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

        try {
            const [fixedResponse, structuralResponse] = await Promise.all([
                fetch("mishra.json", { cache: "force-cache" }),
                fetch("structural_meters.json", { cache: "force-cache" })
            ]);
            if (!fixedResponse.ok || !structuralResponse.ok) {
                throw new Error("Catalog request failed");
            }
            const fixedCatalog = await fixedResponse.json();
            const structuralCatalog = await structuralResponse.json();
            const structural = structuralCatalog.meters.map(structuralMeter)
                .sort((a, b) => a.name.localeCompare(b.name));
            const fixed = fixedCatalog.metres.map(fixedMeter)
                .sort((a, b) => a.name.localeCompare(b.name));
            const meters = [...structural, ...fixed];
            document.getElementById("meter-catalog-total").textContent =
                `${meters.length.toLocaleString("en")} meters`;
            document.getElementById("meter-catalog-fixed-count").textContent =
                `${fixed.length.toLocaleString("en")} fixed vṛttas`;
            document.getElementById("meter-catalog-structural-count").textContent =
                `${structural.length.toLocaleString("en")} structural or mātrā meters`;
            const update = () => renderCatalog(document, meters, search.value, filter.value);

            search.addEventListener("input", update);
            filter.addEventListener("change", update);
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
        initializeMeterCatalog,
        structuralMeter
    };
}));
