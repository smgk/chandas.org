"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { performance } = require("node:perf_hooks");

const Chandas = require("../meter_analysis.js");
const catalog = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "mishra.json"),
    "utf8"
));
const structuralCatalog = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "structural_meters.json"),
    "utf8"
));
const kandaFixture = JSON.parse(fs.readFileSync(
    path.join(__dirname, "fixtures", "kanda.json"),
    "utf8"
));
const combinedCatalog = {
    ...catalog,
    structuralMeters: structuralCatalog.meters
};

function textForPattern(pattern) {
    return Array.from(pattern, (weight) => weight === "G" ? "ಕಾ" : "ಕ").join(" ");
}

function devanagariTextForPattern(pattern) {
    return Array.from(pattern, (weight) => weight === "G" ? "का" : "क").join(" ");
}

test("loads every meter and alternate pattern from mishra.json", () => {
    const meters = Chandas.normalizeCatalog(catalog);
    assert.equal(meters.length, catalog.metres.length);

    meters.forEach((meter, index) => {
        assert.equal(meter.name, catalog.metres[index][0]);
        const sourcePatterns = Array.isArray(catalog.metres[index][1])
            ? catalog.metres[index][1]
            : [catalog.metres[index][1]];
        assert.deepEqual(meter.patterns, sourcePatterns.map(Chandas.sanitizePattern));
    });
});

test("splits stanzas only at blank lines and preserves source offsets", () => {
    const text = "ಮೊದಲ ಸಾಲು\nಎರಡನೇ ಸಾಲು\n\nप्रथम पाद\nद्वितीय पाद";
    const stanzas = Chandas.parseStanzas(text);

    assert.equal(stanzas.length, 2);
    assert.equal(stanzas[0].text, "ಮೊದಲ ಸಾಲು\nಎರಡನೇ ಸಾಲು");
    assert.equal(stanzas[1].text, "प्रथम पाद\nद्वितीय पाद");
    assert.equal(text.slice(stanzas[1].start, stanzas[1].end), stanzas[1].text);
});

test("detects Kannada and Devanagari scripts independently of language", () => {
    assert.equal(Chandas.detectScript("ಕಾವ್ಯ"), "kannada");
    assert.equal(Chandas.detectScript("काव्य"), "devanagari");
    assert.equal(Chandas.detectScript("plain text"), "unknown");
});

test("classifies short, long, anusvara, and visarga syllables", () => {
    const kannada = Chandas.segmentLine("ಕ ಕಾ ಕಂ ಕಃ", 0);
    assert.deepEqual(
        kannada.syllables.map((item) => item.classification),
        ["L", "G", "G", "G"]
    );

    const devanagari = Chandas.segmentLine("क का कं कः", 0);
    assert.deepEqual(
        devanagari.syllables.map((item) => item.classification),
        ["L", "G", "G", "G"]
    );
});

test("a following conjunct closes the preceding syllable", () => {
    const kannada = Chandas.segmentLine("ಪದ್ಯ", 0);
    const devanagari = Chandas.segmentLine("पद्य", 0);

    assert.equal(kannada.syllables[0].classification, "G");
    assert.equal(devanagari.syllables[0].classification, "G");
    assert.ok(kannada.syllables[0].reasons.includes("closed-by-conjunct"));
    assert.ok(devanagari.syllables[0].reasons.includes("closed-by-conjunct"));
});

test("a conjunct after whitespace or punctuation makes the preceding Laghu Guru", () => {
    const kannada = Chandas.segmentLine("ಕ,   ಕ್ರ", 0);
    const devanagari = Chandas.segmentLine("क।   क्र", 0);
    const ordinaryOnset = Chandas.segmentLine("ಕ,   ಕ", 0);

    assert.deepEqual(
        kannada.syllables.map((item) => item.classification),
        ["G", "L"]
    );
    assert.deepEqual(
        devanagari.syllables.map((item) => item.classification),
        ["G", "L"]
    );
    assert.ok(kannada.syllables[0].reasons.includes("followed-by-conjunct"));
    assert.ok(devanagari.syllables[0].reasons.includes("followed-by-conjunct"));
    assert.equal(ordinaryOnset.syllables[0].classification, "L");
});

test("source ranges reconstruct the analyzed syllables without shifting punctuation", () => {
    const text = "  ಕಂ, ಕಾ!  ";
    const result = Chandas.analyzeComposition(text, catalog, {});

    result.segments.forEach((segment) => {
        assert.equal(text.slice(segment.start, segment.end), segment.text);
    });
    assert.equal(result.text, text);
    assert.equal(result.stanzas[0].lines[0].matraCount, 4);
});

test("ranks exact patterns above compatible and approximate patterns", () => {
    const tinyCatalog = {
        metres: [
            ["exact-meter", "LG"],
            ["prefix-meter", "LGG"],
            ["different-meter", "GG"]
        ]
    };
    const ranked = Chandas.rankMeters(["LG"], Chandas.normalizeCatalog(tinyCatalog));

    assert.equal(ranked[0].name, "exact-meter");
    assert.equal(ranked[0].status, "exact");
    assert.equal(ranked[1].name, "prefix-meter");
    assert.equal(ranked[1].status, "compatible");
});

test("supports multi-line meter patterns from catalog arrays", () => {
    const tinyCatalog = {
        metres: [
            ["unequal", ["LG", "GL"]],
            ["other", ["GG", "GG"]]
        ]
    };
    const ranked = Chandas.rankMeters(
        ["LG", "GL"],
        Chandas.normalizeCatalog(tinyCatalog)
    );

    assert.equal(ranked[0].name, "unequal");
    assert.equal(ranked[0].status, "exact");
});

test("loads the versioned structural catalog without changing mishra entries", () => {
    const meters = Chandas.normalizeCatalog(combinedCatalog);
    const anushtubh = meters.find((meter) =>
        meter.id === "structural:anushtubh-pathya");

    assert.equal(meters.length, catalog.metres.length + structuralCatalog.meters.length);
    assert.equal(anushtubh.name, "anuṣṭubh (pathyā)");
    assert.ok(anushtubh.aliases.includes("anushtup"));
    assert.equal(anushtubh.kind, "syllable-structural");
});

test("splits pādas at newlines, danda, double danda, and Roman bars", () => {
    const text = [
        `${textForPattern("LLLL")} । ${textForPattern("GGGG")} ॥`,
        `${textForPattern("LGLG")} | ${textForPattern("GLGL")} ||`
    ].join("\n");
    const stanza = Chandas.analyzeComposition(text, combinedCatalog, {}).stanzas[0];

    assert.equal(stanza.padas.length, 4);
    assert.deepEqual(stanza.padas.map((pada) => pada.pattern), [
        "LLLL", "GGGG", "LGLG", "GLGL"
    ]);
    stanza.padas.forEach((pada) => {
        assert.equal(text.slice(pada.start, pada.end), pada.text);
    });
});

test("detects and validates pathyā Anuṣṭubh across four pādas", () => {
    const patterns = [
        "GLGGLGGG",
        "GLGGLGLG",
        "GLGGLGGG",
        "GLGGLGLG"
    ];
    const text = patterns.map(textForPattern).join("\n");
    const result = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:anushtubh-pathya"
    );
    const stanza = result.stanzas[0];

    assert.equal(stanza.padas.length, 4);
    assert.equal(stanza.selectedMeter.name, "anuṣṭubh (pathyā)");
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
    assert.equal(
        stanza.candidates.find((candidate) =>
            candidate.id === "structural:anushtubh-pathya").status,
        "exact"
    );
});

test("marks an Anuṣṭubh cadence violation at its original syllable", () => {
    const patterns = [
        "GLGGLGGG",
        "GLGGLGGG",
        "GLGGLGGG",
        "GLGGLGLG"
    ];
    const text = patterns.map(textForPattern).join("\n");
    const stanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:anushtubh-pathya"
    ).stanzas[0];
    const wrong = stanza.padas[1].syllables[6];

    assert.equal(stanza.violationCount, 1);
    assert.equal(wrong.violationReason, "weight-mismatch");
    assert.equal(wrong.expected, "L");
    assert.equal(text.slice(wrong.start, wrong.end), wrong.text);
});

test("keeps an incomplete structural meter compatible without red violations", () => {
    const text = textForPattern("GLGGLG");
    const result = Chandas.analyzeComposition(
        text,
        {
            ...combinedCatalog,
            structuralCatalogVersion: structuralCatalog.catalogVersion
        },
        "structural:anushtubh-pathya"
    );
    const stanza = result.stanzas[0];

    assert.equal(stanza.violationCount, 0);
    assert.ok(stanza.missingCount > 0);
    assert.equal(result.analysisVersion, "2.2.0");
    assert.equal(result.catalogVersion, structuralCatalog.catalogVersion);
});

test("detects Āryā using mātrā groups and exposes per-pāda totals", () => {
    const patterns = [
        "GGGGGG",
        "GGGGGGGGG",
        "GGGGGG",
        "GGGGLGGG"
    ];
    const text = patterns.map(textForPattern).join("\n");
    const stanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:arya"
    ).stanzas[0];

    assert.deepEqual(stanza.matraPattern, [12, 18, 12, 15]);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
    assert.equal(
        stanza.candidates.find((candidate) => candidate.id === "structural:arya").status,
        "compatible"
    );
});

test("validates every initial Āryā-family mātrā signature", () => {
    const matraMeters = structuralCatalog.meters.filter((meter) =>
        meter.kind === "matra" && meter.ruleCompleteness === "group-totals");

    for (const meter of matraMeters) {
        const text = meter.padaGroups.map((groups) =>
            textForPattern(groups.map((group) => {
                if (group === 4) {
                    return "GG";
                }
                if (group === 2) {
                    return "G";
                }
                return "L";
            }).join(""))
        ).join("\n");
        const stanza = Chandas.analyzeComposition(text, combinedCatalog, meter.id).stanzas[0];

        assert.equal(stanza.violationCount, 0, meter.name);
        assert.equal(stanza.missingCount, 0, meter.name);
        assert.deepEqual(
            stanza.matraPattern,
            meter.padaGroups.map((groups) =>
                groups.reduce((sum, value) => sum + value, 0)),
            meter.name
        );
    }
});

test("loads Kannada Kanda independently from Āryāgīti", () => {
    const meters = Chandas.normalizeCatalog(combinedCatalog);
    const kanda = meters.find((meter) => meter.id === "structural:kanda-kannada");
    const aryagiti = meters.find((meter) => meter.id === "structural:aryagiti");

    assert.equal(kanda.name, "kanda (Kannada)");
    assert.ok(kanda.aliases.includes("ಕಂದಪದ್ಯ"));
    assert.ok(kanda.aliases.includes("kandapadya"));
    assert.ok(!aryagiti.aliases.includes("kanda"));
    assert.deepEqual(kanda.padaGroups.map((groups) => groups.length), [3, 5, 3, 5]);
});

test("recognizes the provisional Kannada Kanda characterization fixture", () => {
    const result = Chandas.analyzeComposition(
        kandaFixture.text,
        {
            ...combinedCatalog,
            structuralCatalogVersion: structuralCatalog.catalogVersion
        },
        "structural:kanda-kannada"
    );
    const stanza = result.stanzas[0];
    const kandaCandidate = stanza.candidates.find((candidate) =>
        candidate.id === "structural:kanda-kannada");
    const aryagitiCandidate = stanza.candidates.find((candidate) =>
        candidate.id === "structural:aryagiti");

    assert.deepEqual(stanza.patterns, kandaFixture.patterns);
    assert.deepEqual(stanza.matraPattern, kandaFixture.matras);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
    assert.equal(kandaCandidate.status, "compatible");
    assert.equal(aryagitiCandidate.status, "compatible");
    assert.ok(
        stanza.candidates.indexOf(kandaCandidate) <
        stanza.candidates.indexOf(aryagitiCandidate)
    );
    assert.equal(stanza.selectedMeter.ruleCompleteness, "provisional-rhythm");
    assert.deepEqual(stanza.selectedMeter.uncheckedRules, ["prāsa"]);
    assert.equal(result.analysisVersion, "2.2.0");
    assert.equal(result.catalogVersion, "2.0.0");
});

test("enforces Kannada Kanda gaṇa and ending rules at original ranges", () => {
    const invalidGroups = [
        ["LGL", "GG", "GG"],
        ["GG", "GG", "GG", "GG", "GLL"],
        ["GG", "GG", "GG"],
        ["GG", "GG", "LGL", "GG", "GLL"]
    ];
    const text = invalidGroups.map((groups) =>
        textForPattern(groups.join(""))).join("\n");
    const stanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:kanda-kannada"
    ).stanzas[0];
    const reasons = stanza.padas.flatMap((pada) =>
        pada.syllables.filter((syllable) => syllable.violation)
            .map((syllable) => syllable.violationReason));

    assert.ok(reasons.includes("forbidden-jagana"));
    assert.ok(reasons.includes("required-jagana-or-all-laghu"));
    assert.equal(
        reasons.filter((reason) => reason === "required-final-guru").length,
        2
    );
    stanza.padas.flatMap((pada) => pada.syllables)
        .filter((syllable) => syllable.violation)
        .forEach((syllable) => {
            assert.equal(text.slice(syllable.start, syllable.end), syllable.text);
        });
});

test("requires yati after the first Laghu in an all-Laghu special Kanda gaṇa", () => {
    const lines = [
        textForPattern("GGGGGG"),
        [
            textForPattern("GG"),
            textForPattern("GG"),
            "ಕಕಕಕ",
            textForPattern("GG"),
            textForPattern("GG")
        ].join(" "),
        textForPattern("GGGGGG"),
        [
            textForPattern("GG"),
            textForPattern("GG"),
            "ಕ ಕಕಕ",
            textForPattern("GG"),
            textForPattern("GG")
        ].join(" ")
    ];
    const stanza = Chandas.analyzeComposition(
        lines.join("\n"),
        combinedCatalog,
        "structural:kanda-kannada"
    ).stanzas[0];
    const yatiViolations = stanza.padas.flatMap((pada) => pada.syllables)
        .filter((syllable) => syllable.violationReason === "required-yati");

    assert.equal(yatiViolations.length, 1);
    assert.equal(yatiViolations[0].text, "ಕ");
});

test("keeps an incomplete Kannada Kanda stanza possible without red violations", () => {
    const stanza = Chandas.analyzeComposition(
        textForPattern("GGL"),
        combinedCatalog,
        "structural:kanda-kannada"
    ).stanzas[0];

    assert.equal(stanza.violationCount, 0);
    assert.ok(stanza.missingCount > 0);
    assert.equal(
        stanza.candidates.find((candidate) =>
            candidate.id === "structural:kanda-kannada").status,
        "compatible"
    );
});

test("applies Kannada Kanda rhythm rules to Devanagari-script text", () => {
    const validGroups = [
        ["GG", "GG", "GG"],
        ["GG", "GG", "LGL", "GG", "GG"],
        ["GG", "GG", "GG"],
        ["GG", "GG", "LGL", "GG", "GG"]
    ];
    const text = validGroups.map((groups) =>
        devanagariTextForPattern(groups.join(""))).join("\n");
    const stanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:kanda-kannada"
    ).stanzas[0];

    assert.deepEqual(stanza.scripts, ["devanagari"]);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
});

test("marks a syllable that crosses a required mātrā-group boundary", () => {
    const text = [
        textForPattern("GLG"),
        textForPattern("GGGGGGGGG"),
        textForPattern("GGGGGG"),
        textForPattern("GGGGLGGG")
    ].join("\n");
    const stanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:arya"
    ).stanzas[0];

    assert.ok(stanza.violationCount > 0);
    assert.equal(stanza.padas[0].syllables[2].violationReason, "matra-group-overrun");
});

test("validates different selected meters independently per stanza", () => {
    const tinyCatalog = {
        metres: [
            ["all-light", "LL"],
            ["all-heavy", "GG"]
        ]
    };
    const text = "ಕವಿ\n\nಕಾಂ ತಾಂ";
    const result = Chandas.analyzeComposition(text, tinyCatalog, {
        0: "all-light",
        1: "all-heavy"
    });

    assert.equal(result.stanzas.length, 2);
    assert.equal(result.stanzas[0].selectedMeterId, "all-light");
    assert.equal(result.stanzas[0].violationCount, 0);
    assert.equal(result.stanzas[1].selectedMeterId, "all-heavy");
    assert.equal(result.stanzas[1].violationCount, 0);
});

test("marks weight mismatches and extra syllables at their original ranges", () => {
    const tinyCatalog = { metres: [["one-light", "L"]] };
    const text = "ಕಾಂ ಕ";
    const result = Chandas.analyzeComposition(text, tinyCatalog, "one-light");

    assert.equal(result.stanzas[0].violationCount, 2);
    assert.equal(result.segments[0].violationReason, "weight-mismatch");
    assert.equal(result.segments[1].violationReason, "extra-syllable");
    assert.equal(text.slice(result.segments[0].start, result.segments[0].end), "ಕಾಂ");
});

test("legacy analyzeMeter API remains available", () => {
    const result = Chandas.analyzeMeter("ಕ", null, { metres: [["light", "L"]] });

    assert.equal(result.detectedScript, "kannada");
    assert.equal(result.detectedmeter, "light");
    assert.deepEqual(result.aproxmeters, ["light"]);
    assert.equal(result.pattern[0].actual, "L");
});

test("analyzes a 2,000-character composition within the MVP budget", () => {
    const text = "ಕವಿ ".repeat(500).slice(0, 2000);
    const started = performance.now();
    const result = Chandas.analyzeComposition(text, combinedCatalog, {});
    const elapsed = performance.now() - started;

    assert.ok(result.segments.length > 0);
    assert.ok(elapsed < 250, `analysis took ${elapsed.toFixed(1)} ms`);
});
