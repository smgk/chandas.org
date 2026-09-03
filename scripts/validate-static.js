/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const required = [
    "index.html",
    "styles.css",
    "app.js",
    "roman_transliteration.js",
    "analytics.js",
    "poem_store.js",
    "meter_analysis.js",
    "synonym_engine.js",
    "scansion.js",
    "shithila_dvitva.js",
    "strong_template.js",
    "custom_meter.js",
    "english_analysis.js",
    "english_composer.js",
    "english_forms.js",
    "english_meters.json",
    "english_forms.json",
    "mishra.json",
    "structural_meters.json",
    "data/synonyms/kn-alar-v1.json",
    "data/synonyms/sa-amarakosha-v1.json",
    "data/synonyms/README.md",
    "data/synonyms/DATA_LICENSES.md",
    "data/english/en-cmudict-stress-v1.json",
    "data/english/en-cmudict-rhyme-v1.json",
    "data/english/README.md",
    "data/english/CMUDICT_LICENSE",
    "examples/field_guide_corpus.json",
    "examples/apte_sanskrit_examples.json",
    "examples/english_prosody_corpus.json",
    "docs/research/archive-meter-audit.md",
    "docs/rules/gujarati-meters.md",
    "docs/rules/english-stress-meters.md",
    "docs/rules/english-rhyme-forms.md",
    "manifest.webmanifest",
    "service-worker.js",
    "icon.svg",
    "documentation.html",
    "documentation.js",
    "about.html",
    "roadmap.html",
    "privacy.html",
    "terms.html",
    "notices.html",
    "COPYRIGHT.md",
    "LICENSE.md",
    "THIRD_PARTY_NOTICES.md"
];

for (const file of required) {
    const target = path.join(root, file);
    const stat = fs.statSync(target);
    if (!stat.isFile() || stat.size === 0) {
        throw new Error(`Missing or empty production asset: ${file}`);
    }
}

const packageMetadata = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8")
);
const about = fs.readFileSync(path.join(root, "about.html"), "utf8");
if (!about.includes(`data-app-version="${packageMetadata.version}"`) ||
    !about.includes(`Version <strong>${packageMetadata.version}</strong>`)) {
    throw new Error("about.html must display the package version");
}

const catalog = JSON.parse(fs.readFileSync(path.join(root, "mishra.json"), "utf8"));
if (!Array.isArray(catalog.metres) || catalog.metres.length === 0) {
    throw new Error("mishra.json does not contain a non-empty metres array");
}

const structuralCatalog = JSON.parse(
    fs.readFileSync(path.join(root, "structural_meters.json"), "utf8")
);
if (!structuralCatalog.catalogVersion ||
    !Array.isArray(structuralCatalog.meters) ||
    structuralCatalog.meters.length === 0) {
    throw new Error("structural_meters.json does not contain a versioned meter list");
}

const englishCatalog = JSON.parse(
    fs.readFileSync(path.join(root, "english_meters.json"), "utf8")
);
if (!englishCatalog.catalogVersion ||
    englishCatalog.analysisSystem !== "english-stress" ||
    !Array.isArray(englishCatalog.meters) || englishCatalog.meters.length < 17) {
    throw new Error("english_meters.json does not contain the versioned M3 catalog");
}
const englishIds = new Set();
for (const meter of englishCatalog.meters) {
    if (!meter.id || englishIds.has(meter.id) || !meter.name ||
        !["iamb", "trochee", "anapest", "dactyl"].includes(meter.foot) ||
        !/^(?:WS|SW|WWS|SWW)$/.test(meter.pattern) ||
        !Number.isInteger(meter.feet) || meter.feet < 1) {
        throw new Error(`Invalid English meter metadata: ${meter.id || "(empty)"}`);
    }
    englishIds.add(meter.id);
}

const englishLexicon = JSON.parse(fs.readFileSync(
    path.join(root, "data", "english", "en-cmudict-stress-v1.json"),
    "utf8"
));
if (englishLexicon.schemaVersion !== 1 || englishLexicon.language !== "en" ||
    englishLexicon.license !== "BSD-2-Clause" ||
    englishLexicon.source.revision !==
        "74790861f652b15e4ac49015a90074ad62a27690" ||
    !/^[a-f0-9]{64}$/.test(englishLexicon.source.sha256) ||
    !Array.isArray(englishLexicon.entries) ||
    englishLexicon.entries.length !== englishLexicon.counts.entries ||
    englishLexicon.entries.length < 126000) {
    throw new Error("English pronunciation data has incomplete or stale metadata");
}

const englishRhymeLexicon = JSON.parse(fs.readFileSync(
    path.join(root, "data", "english", "en-cmudict-rhyme-v1.json"),
    "utf8"
));
if (englishRhymeLexicon.schemaVersion !== 1 ||
    englishRhymeLexicon.representation !== "final-stressed-vowel-rime" ||
    englishRhymeLexicon.license !== "BSD-2-Clause" ||
    englishRhymeLexicon.source.revision !== englishLexicon.source.revision ||
    englishRhymeLexicon.source.sha256 !== englishLexicon.source.sha256 ||
    !Array.isArray(englishRhymeLexicon.entries) ||
    englishRhymeLexicon.entries.length !== englishRhymeLexicon.counts.entries ||
    englishRhymeLexicon.entries.length < 126000) {
    throw new Error("English rhyme data has incomplete or stale metadata");
}

const englishFormCatalog = JSON.parse(fs.readFileSync(
    path.join(root, "english_forms.json"), "utf8"
));
if (!englishFormCatalog.catalogVersion ||
    englishFormCatalog.analysisSystem !== "english-form" ||
    !Array.isArray(englishFormCatalog.forms) ||
    englishFormCatalog.forms.length < 17 ||
    new Set(englishFormCatalog.forms.map((form) => form.id)).size !==
        englishFormCatalog.forms.length) {
    throw new Error("English form catalog is incomplete");
}

const englishCorpus = JSON.parse(fs.readFileSync(
    path.join(root, "examples", "english_prosody_corpus.json"),
    "utf8"
));
if (englishCorpus.analysisSystem !== "english-stress" ||
    !Array.isArray(englishCorpus.examples) || englishCorpus.examples.length < 21 ||
    englishCorpus.examples.some((example) =>
        !example.id || !englishIds.has(example.meterId) || !example.text ||
        !example.source || !example.source.url || example.rights !== "Public domain")) {
    throw new Error("English golden corpus has incomplete provenance or expectations");
}

const synonymDocuments = [
    ["data/synonyms/kn-alar-v1.json", "kn", "ODbL-1.0"],
    ["data/synonyms/sa-amarakosha-v1.json", "sa", "CC-BY-SA-4.0"]
].map(([file, language, license]) => {
    const document = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    if (document.schemaVersion !== 1 || document.language !== language ||
        document.license !== license || !document.licenseUrl ||
        !document.source || !document.source.revision ||
        !Array.isArray(document.concepts) || !document.concepts.length) {
        throw new Error(`${file} has incomplete synonym metadata`);
    }
    const ids = new Set();
    let wordSenses = 0;
    for (const concept of document.concepts) {
        if (!concept.id || ids.has(concept.id) || !concept.label ||
            !Array.isArray(concept.words) || concept.words.length < 2 ||
            concept.words.some((word) => !Array.isArray(word) || !word[0])) {
            throw new Error(`${file} contains an invalid synonym concept`);
        }
        ids.add(concept.id);
        wordSenses += concept.words.length;
    }
    if (!document.counts || document.counts.concepts !== ids.size ||
        document.counts.wordSenses !== wordSenses) {
        throw new Error(`${file} synonym counts are stale`);
    }
    return document;
});
if (synonymDocuments[0].counts.concepts < 5000 ||
    synonymDocuments[1].counts.concepts < 4000) {
    throw new Error("Synonym databases are unexpectedly incomplete");
}
const prominenceValues = new Set(["specialist", "neutral", "established", "common"]);
if (!structuralCatalog.meterProminence ||
    Object.values(structuralCatalog.meterProminence)
        .some((value) => !prominenceValues.has(value))) {
    throw new Error("structural_meters.json contains invalid prominence metadata");
}
if (!Array.isArray(structuralCatalog.fixedMeters) ||
    structuralCatalog.fixedMeters.some((entry) =>
        !Array.isArray(entry) || entry.length < 2 || !/^[GL]+$/.test(entry[1]))) {
    throw new Error("structural_meters.json contains invalid fixed-vṛtta extensions");
}
if (!structuralCatalog.meters.some((meter) => meter.id === "structural:anushtubh-pathya")) {
    throw new Error("structural_meters.json must include pathyā Anuṣṭubh");
}
if (!structuralCatalog.meters.some((meter) =>
    meter.id === "structural:tripadi-folk-kannada")) {
    throw new Error("structural_meters.json must include folk Tripadi");
}
const structuralIds = new Set();
for (const meter of structuralCatalog.meters) {
    if (!meter.id || structuralIds.has(meter.id)) {
        throw new Error(`Missing or duplicate structural meter id: ${meter.id || "(empty)"}`);
    }
    structuralIds.add(meter.id);
    if (!meter.name || !Array.isArray(meter.aliases) ||
        !Array.isArray(meter.signatureLines) || !meter.signatureLines.length ||
        !meter.ruleCompleteness || (!meter.source && !meter.sourceRef)) {
        throw new Error(`Incomplete structural meter metadata: ${meter.id}`);
    }
    if (meter.sourceRef && !structuralCatalog[meter.sourceRef]) {
        throw new Error(`Unknown source reference for ${meter.id}: ${meter.sourceRef}`);
    }
    if (!["matra", "amsha", "telugu-gana", "syllable-structural"].includes(meter.kind)) {
        throw new Error(`${meter.id} has an unknown structural kind`);
    }
    const rules = meter.kind === "matra"
        ? meter.padaGroups
        : meter.kind === "amsha" || meter.kind === "telugu-gana"
            ? meter.amshaGroups
            : meter.padas;
    if (!Array.isArray(rules) || rules.length === 0) {
        throw new Error(`${meter.id} must define at least one pāda`);
    }
    if (meter.linePolicy && meter.linePolicy.type === "fixed" &&
        meter.linePolicy.count !== rules.length) {
        throw new Error(`${meter.id} fixed line count does not match its pāda rules`);
    }
    if (meter.linePolicy &&
        !["fixed", "repeating", "variable"].includes(meter.linePolicy.type)) {
        throw new Error(`${meter.id} has an unknown line policy`);
    }
    if (meter.linePolicy &&
        ["repeating", "variable"].includes(meter.linePolicy.type)) {
        const minimum = meter.linePolicy.min;
        const maximum = meter.linePolicy.max;
        if (!Number.isInteger(minimum) || minimum < 1 ||
            !["line", "pada"].includes(meter.linePolicy.unit || "pada") ||
            (maximum !== undefined &&
                (!Number.isInteger(maximum) || maximum < minimum)) ||
            (meter.linePolicy.previewCount !== undefined &&
                (!Number.isInteger(meter.linePolicy.previewCount) ||
                    meter.linePolicy.previewCount < 1))) {
            throw new Error(`${meter.id} has an invalid repeating-line policy`);
        }
    }
    if (meter.kind === "amsha") {
        if (meter.recitalPolicy !== undefined) {
            const policy = meter.recitalPolicy;
            if (!policy ||
                policy.type !== "noninitial-laghu-karshana" ||
                typeof policy.marker !== "string" || !policy.marker.trim() ||
                policy.matrasPerMark !== 1) {
                throw new Error(`${meter.id} has an invalid aṃśa recital policy`);
            }
        }
        for (const line of meter.amshaGroups) {
            if (!Array.isArray(line) || !line.length) {
                throw new Error(`${meter.id} has an empty aṃśa line`);
            }
            for (const slot of line) {
                const options = Array.isArray(slot) ? slot : [slot];
                if (!options.length ||
                    options.some((item) => !["B", "V", "R", "G", "L"].includes(item))) {
                    throw new Error(`${meter.id} has an invalid aṃśa slot`);
                }
            }
        }
        const substitutionTargets = new Set();
        for (const rule of meter.amshaSubstitutions || []) {
            const padas = rule && rule.padas;
            const localGroups = rule && rule.localGroups;
            if (!Array.isArray(padas) || !padas.length ||
                !Array.isArray(localGroups) || !localGroups.length ||
                !["B", "V", "R"].includes(rule.expectedClass) ||
                !["B", "V", "R"].includes(rule.actualClass) ||
                rule.expectedClass === rule.actualClass ||
                rule.realization !== "contracted" ||
                rule.karshana !== "none" ||
                !Number.isInteger(rule.realizedMatras) ||
                rule.realizedMatras < 1 ||
                padas.some((pada) =>
                    !Number.isInteger(pada) ||
                    pada < 1 ||
                    pada > meter.amshaGroups.length) ||
                localGroups.some((group) =>
                    !Number.isInteger(group) || group < 1)) {
                throw new Error(`${meter.id} has an invalid aṃśa substitution`);
            }
            for (const pada of padas) {
                for (const group of localGroups) {
                    const canonical = meter.amshaGroups[pada - 1][group - 1];
                    const canonicalClasses = Array.isArray(canonical)
                        ? canonical
                        : [canonical];
                    const key = `${pada}:${group}:${rule.actualClass}`;
                    if (!canonical ||
                        !canonicalClasses.includes(rule.expectedClass) ||
                        substitutionTargets.has(key)) {
                        throw new Error(
                            `${meter.id} has an invalid aṃśa substitution target`
                        );
                    }
                    substitutionTargets.add(key);
                }
            }
        }
        for (const rule of meter.groupRules || []) {
            if (!Array.isArray(rule.globalGroups) ||
                !(rule.allowedPrefixes || []).every((prefix) => /^[GL]+$/.test(prefix))) {
                throw new Error(`${meter.id} has an invalid aṃśa group rule`);
            }
        }
        for (const rule of meter.lineBoundaryRules || []) {
            if (!Array.isArray(rule.padas) ||
                !Number.isInteger(rule.afterGroup) || rule.afterGroup < 1) {
                throw new Error(`${meter.id} has an invalid line boundary rule`);
            }
        }
        continue;
    }
    if (meter.kind !== "matra") {
        continue;
    }

    const capacities = meter.padaGroups.flat();
    if (meter.compactMatraLayout !== undefined) {
        const layout = meter.compactMatraLayout;
        if (!layout || meter.linePolicy.type !== "fixed" ||
            !Number.isInteger(layout.sourceUnitCount) ||
            layout.sourceUnitCount < 1 ||
            !Number.isInteger(layout.padasPerSourceUnit) ||
            layout.padasPerSourceUnit < 2 ||
            layout.sourceUnitCount * layout.padasPerSourceUnit !==
                meter.padaGroups.length) {
            throw new Error(`${meter.id} has an invalid compact mātrā layout`);
        }
    }
    for (const rule of meter.padaEndRules || []) {
        if (!Array.isArray(rule.padas) || !rule.padas.length ||
            rule.padas.some((pada) => !Number.isInteger(pada) ||
                pada < 1 || pada > meter.padaGroups.length) ||
            !Array.isArray(rule.allowedPatterns) || !rule.allowedPatterns.length ||
            rule.allowedPatterns.some((pattern) => !/^[GL]+$/.test(pattern))) {
            throw new Error(`${meter.id} has an invalid pāda-ending rule`);
        }
    }
    for (const rule of meter.lineBoundaryRules || []) {
        if (!Array.isArray(rule.padas) || !rule.padas.length ||
            !Number.isInteger(rule.afterGroup) || rule.afterGroup < 1 ||
            rule.padas.some((pada) => !Number.isInteger(pada) ||
                pada < 1 || pada > meter.padaGroups.length ||
                rule.afterGroup >= meter.padaGroups[pada - 1].length)) {
            throw new Error(`${meter.id} has an invalid mātrā line-boundary rule`);
        }
    }
    if (meter.sungLaghuExtension !== undefined) {
        const policy = meter.sungLaghuExtension;
        if (!policy || !Number.isInteger(policy.maxMatras) ||
            policy.maxMatras < 1 || policy.maxMatras > 2 ||
            typeof policy.marker !== "string" || !policy.marker.trim()) {
            throw new Error(`${meter.id} has an invalid sung-Laghu policy`);
        }
    }
    if (meter.padaGroupOptions !== undefined) {
        if (!Array.isArray(meter.padaGroupOptions) ||
            meter.padaGroupOptions.length !== meter.padaGroups.length) {
            throw new Error(`${meter.id} mātrā-group options must match its line rules`);
        }
        meter.padaGroupOptions.forEach((options, lineIndex) => {
            if (options === null) {
                return;
            }
            const primary = meter.padaGroups[lineIndex];
            const primaryTotal = primary.reduce((sum, value) => sum + value, 0);
            if (!Array.isArray(options) || options.length < 2) {
                throw new Error(`${meter.id} line ${lineIndex + 1} needs multiple options`);
            }
            options.forEach((option) => {
                if (!Array.isArray(option) ||
                    (!meter.allowDifferentOptionTotals &&
                        (option.length !== primary.length ||
                            option.reduce((sum, value) => sum + value, 0) !==
                                primaryTotal)) ||
                    option.some((value) => !Number.isInteger(value) || value < 1)) {
                    throw new Error(`${meter.id} has an incompatible mātrā-group option`);
                }
            });
        });
    }
    for (const [ruleType, groupRules] of [
        ["group", meter.groupRules || []],
        ["boundary", meter.boundaryRules || []]
    ]) {
        if (!Array.isArray(groupRules)) {
            throw new Error(`${meter.id} ${ruleType} rules must be an array`);
        }
        for (const rule of groupRules) {
            if (!rule.everyGroup &&
                !Array.isArray(rule.globalGroups) &&
                !Array.isArray(rule.padas) &&
                !Array.isArray(rule.localGroups)) {
                throw new Error(`${meter.id} ${ruleType} rule has no group selector`);
            }
            for (const groupNumber of rule.globalGroups || []) {
                if (!Number.isInteger(groupNumber) ||
                    groupNumber < 1 || groupNumber > capacities.length) {
                    throw new Error(
                        `${meter.id} ${ruleType} rule has invalid group ${groupNumber}`
                    );
                }
                for (const pattern of [
                    ...(rule.allowedPatterns || []),
                    ...(rule.forbiddenPatterns || []),
                    ...(rule.whenPatterns || [])
                ]) {
                    const matras = Array.from(pattern).reduce(
                        (sum, weight) => sum + (weight === "G" ? 2 : weight === "L" ? 1 : 0),
                        0
                    );
                    if (!/^[GL]+$/.test(pattern) || matras !== capacities[groupNumber - 1]) {
                        throw new Error(
                            `${meter.id} pattern ${pattern} does not fit group ${groupNumber}`
                        );
                    }
                }
            }
            for (const prefix of [
                ...(rule.forbiddenPrefixes || []),
                ...(rule.allowedPrefixes || [])
            ]) {
                if (!/^[GL]+$/.test(prefix)) {
                    throw new Error(`${meter.id} has invalid group prefix ${prefix}`);
                }
            }
            if (ruleType === "boundary" &&
                (!Number.isInteger(rule.afterSyllable) || rule.afterSyllable < 1)) {
                throw new Error(`${meter.id} boundary rule needs afterSyllable`);
            }
        }
    }
    for (const relation of meter.lineRelations || []) {
        const supported = [
            "dvitiyakshara-prasa",
            "pairwise-dvitiyakshara-prasa",
            "antya-prasa",
            "pairwise-antya-prasa"
        ];
        const invalidPair = (relation.type === "pairwise-antya-prasa" ||
            relation.type === "pairwise-dvitiyakshara-prasa") &&
            (!Number.isInteger(relation.pairSize) || relation.pairSize < 2);
        const invalidAnchors = (relation.internalAnchors || []).some((anchor) =>
            !Number.isInteger(anchor.pada) || anchor.pada < 1 ||
            !Number.isInteger(anchor.group) || anchor.group < 1 ||
            !Number.isInteger(anchor.syllable) || anchor.syllable < 1);
        if (!supported.includes(relation.type) || invalidPair || invalidAnchors) {
            throw new Error(`${meter.id} has an invalid line relationship`);
        }
    }
}

console.log(
    `Validated ${required.length} production assets and ` +
    `${catalog.metres.length + structuralCatalog.fixedMeters.length +
        structuralCatalog.meters.length} meters.`
);
