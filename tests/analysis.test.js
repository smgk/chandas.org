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

test("projects highlight spans away from Kannada and Devanagari conjuncts", () => {
    for (const text of ["ನಿಶ್ಚಲ", "निश्चल"]) {
        const segmented = Chandas.segmentLine(text, 0);
        const logicalRanges = segmented.syllables.map((syllable) => ({
            start: syllable.start,
            end: syllable.end,
            className: syllable.classification
        }));
        const displayRanges = Chandas.projectHighlightRanges(text, logicalRanges);

        assert.deepEqual(
            segmented.syllables.map((syllable) => syllable.text),
            text === "ನಿಶ್ಚಲ" ? ["ನಿಶ್", "ಚ", "ಲ"] : ["निश्", "च", "ल"]
        );
        assert.deepEqual(
            displayRanges.map((range) => text.slice(range.start, range.end)),
            text === "ನಿಶ್ಚಲ" ? ["ನಿ", "ಶ್ಚ", "ಲ"] : ["नि", "श्च", "ल"]
        );
        assert.deepEqual(
            displayRanges.map((range) => range.className),
            ["G", "L", "L"]
        );
    }
});

test("preserves explicit ZWNJ breaks but protects ZWJ conjunct shaping", () => {
    const joined = "ನಿಶ್‍ಚಲ";
    const separated = "ನಿಶ್‌ಚಲ";
    const joinedBoundary = joined.indexOf("ಚ");
    const separatedBoundary = separated.indexOf("ಚ");

    const [joinedRange] = Chandas.projectHighlightRanges(joined, [{
        start: joinedBoundary,
        end: joinedBoundary + 1
    }]);
    const [separatedRange] = Chandas.projectHighlightRanges(separated, [{
        start: separatedBoundary,
        end: separatedBoundary + 1
    }]);

    assert.equal(joined.slice(joinedRange.start, joinedRange.end), "ಶ್‍ಚ");
    assert.equal(separatedRange.start, separatedBoundary);
    assert.equal(separated.slice(separatedRange.start, separatedRange.end), "ಚ");
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
    const ranked = Chandas.rankMeters(
        ["LG", "LG", "LG", "LG"],
        Chandas.normalizeCatalog(tinyCatalog)
    );

    assert.equal(ranked[0].name, "exact-meter");
    assert.equal(ranked[0].status, "exact");
    assert.equal(ranked[1].name, "prefix-meter");
    assert.equal(ranked[1].status, "compatible");
});

test("expands one, two, and four fixed-vṛtta patterns to four-line verses", () => {
    const tinyCatalog = {
        metres: [
            ["unequal", ["LG", "GL"]],
            ["explicit", ["LL", "LG", "GL", "GG"]],
            ["same", "GG"]
        ]
    };
    const meters = Chandas.normalizeCatalog(tinyCatalog);
    assert.deepEqual(
        meters.find((meter) => meter.id === "unequal").versePatterns,
        ["LG", "GL", "LG", "GL"]
    );
    assert.deepEqual(
        meters.find((meter) => meter.id === "explicit").versePatterns,
        ["LL", "LG", "GL", "GG"]
    );
    assert.deepEqual(
        meters.find((meter) => meter.id === "same").versePatterns,
        ["GG", "GG", "GG", "GG"]
    );

    const ranked = Chandas.rankMeters(
        ["LG", "GL", "LG", "GL"],
        meters
    );

    assert.equal(ranked[0].name, "unequal");
    assert.equal(ranked[0].status, "exact");
});

test("counts untyped fixed-vṛtta lines as missing without marking red violations", () => {
    const tinyCatalog = { metres: [["four-light-lines", "LL"]] };
    const stanza = Chandas.analyzeComposition(
        "ಕ ಕ",
        tinyCatalog,
        "four-light-lines"
    ).stanzas[0];

    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 6);
    assert.equal(stanza.candidates[0].status, "compatible");
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
    assert.equal(result.analysisVersion, "2.4.0");
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
    assert.equal(result.analysisVersion, "2.4.0");
    assert.equal(result.catalogVersion, "3.0.0");
});

test("loads and validates all six quantitative Ṣaṭpadi forms as six-line verses", () => {
    const meters = Chandas.normalizeCatalog(combinedCatalog);
    const shatpadis = meters.filter((meter) => meter.id.endsWith("-shatpadi"));
    const patternForCapacity = {
        2: "G",
        3: "GL",
        4: "GG",
        5: "GGL"
    };

    assert.deepEqual(shatpadis.map((meter) => meter.name), [
        "śara ṣaṭpadi",
        "kusuma ṣaṭpadi",
        "bhoga ṣaṭpadi",
        "bhāminī ṣaṭpadi",
        "parivardhinī ṣaṭpadi",
        "vārdhaka ṣaṭpadi"
    ]);
    for (const meter of shatpadis) {
        assert.equal(meter.linePolicy.count, 6, meter.name);
        const text = meter.padaGroups.map((groups) =>
            textForPattern(groups.map((capacity) =>
                patternForCapacity[capacity]).join(""))).join("\n");
        const stanza = Chandas.analyzeComposition(
            text,
            combinedCatalog,
            meter.id
        ).stanzas[0];
        const candidate = stanza.candidates.find((item) => item.id === meter.id);

        assert.equal(stanza.padas.length, 6, meter.name);
        assert.equal(stanza.violationCount, 0, meter.name);
        assert.equal(stanza.missingCount, 0, meter.name);
        assert.equal(candidate.status, "compatible", meter.name);
        assert.deepEqual(
            stanza.matraPattern,
            meter.padaGroups.map((groups) =>
                groups.reduce((sum, value) => sum + value, 0)),
            meter.name
        );
    }
});

test("keeps an unfinished Ṣaṭpadi compatible and marks a written line overrun", () => {
    const partial = Chandas.analyzeComposition(
        textForPattern("GLGGG"),
        combinedCatalog,
        "structural:bhamini-shatpadi"
    ).stanzas[0];
    assert.equal(partial.violationCount, 0);
    assert.ok(partial.missingCount > 0);

    const lines = [
        textForPattern("GLGGGLGGG"),
        textForPattern("GLGGGLGG"),
        textForPattern("GLGGGLGGGLGGG"),
        textForPattern("GLGGGLGG"),
        textForPattern("GLGGGLGG"),
        textForPattern("GLGGGLGGGLGGG")
    ];
    const text = lines.join("\n");
    const excessive = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:bhamini-shatpadi"
    ).stanzas[0];

    assert.ok(excessive.violationCount > 0);
    assert.equal(excessive.padas[0].syllables.at(-1).violationReason, "extra-matra");
    assert.equal(
        text.slice(
            excessive.padas[0].syllables.at(-1).start,
            excessive.padas[0].syllables.at(-1).end
        ),
        excessive.padas[0].syllables.at(-1).text
    );
});

test("loads the Tripadi, Sāṅgatya, and five Akkara aṃśa families", () => {
    const meters = Chandas.normalizeCatalog(combinedCatalog);
    const amshaMeters = meters.filter((meter) => meter.kind === "amsha");

    assert.deepEqual(amshaMeters.map((meter) => meter.id), [
        "structural:tripadi-kannada",
        "structural:sangatya",
        "structural:piriyakkara",
        "structural:doreyakkara",
        "structural:naduvanakkara",
        "structural:edeyakkara",
        "structural:kiriyakkara"
    ]);
    amshaMeters.forEach((meter) => {
        assert.equal(meter.linePolicy.count, meter.amshaGroups.length);
        assert.ok(meter.aliases.some((alias) => /[\u0c80-\u0cff]/u.test(alias)));
    });
});

test("validates canonical aṃśa frames and cataloged Piriyakkara alternatives", () => {
    const classPattern = { B: "GG", V: "GGG", R: "GGGG" };
    const amshaMeters = structuralCatalog.meters.filter((meter) =>
        meter.kind === "amsha" && meter.id !== "structural:tripadi-kannada");

    for (const meter of amshaMeters) {
        const text = meter.amshaGroups.map((slots) =>
            textForPattern(slots.map((slot) =>
                classPattern[Array.isArray(slot) ? slot[0] : slot]).join(""))
        ).join("\n");
        const stanza = Chandas.analyzeComposition(text, combinedCatalog, meter.id).stanzas[0];

        assert.equal(stanza.violationCount, 0, meter.name);
        assert.equal(stanza.missingCount, 0, meter.name);
        assert.equal(
            stanza.candidates.find((candidate) => candidate.id === meter.id).status,
            "compatible",
            meter.name
        );
    }

    const piri = structuralCatalog.meters.find((meter) =>
        meter.id === "structural:piriyakkara");
    const alternative = piri.amshaGroups.map((slots) =>
        textForPattern(slots.map((slot) =>
            classPattern[Array.isArray(slot) ? slot[1] : slot]).join(""))
    ).join("\n");
    const stanza = Chandas.analyzeComposition(
        alternative,
        combinedCatalog,
        piri.id
    ).stanzas[0];
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
});

test("enforces the core Tripadi aṃśa positions at original source ranges", () => {
    const validPatterns = [
        "GGG".repeat(4),
        `GGG${"GG"}${"LLGG"}${"GGG"}`,
        `GGG${"GG"}${"LLGG"}`
    ];
    const valid = Chandas.analyzeComposition(
        validPatterns.map(textForPattern).join("\n"),
        combinedCatalog,
        "structural:tripadi-kannada"
    ).stanzas[0];

    assert.equal(valid.violationCount, 0);
    assert.equal(valid.missingCount, 0);

    const text = [
        "GGG".repeat(4),
        `GGG${"GG"}${"GGG"}${"GGG"}`,
        `GGG${"GG"}${"GGG"}`
    ].map(textForPattern).join("\n");
    const invalid = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:tripadi-kannada"
    ).stanzas[0];
    const violations = invalid.padas.flatMap((pada) => pada.syllables)
        .filter((syllable) =>
            syllable.violationReason === "required-double-laghu-opening");

    assert.equal(violations.length, 2);
    violations.forEach((syllable) => {
        assert.equal(text.slice(syllable.start, syllable.end), syllable.text);
    });
});

test("loads all three Ragale forms with repeating line policies", () => {
    const meters = Chandas.normalizeCatalog(combinedCatalog);
    const ragale = meters.filter((meter) => meter.id.endsWith("-ragale"));

    assert.deepEqual(ragale.map((meter) => meter.name), [
        "mandānila ragaḷe",
        "utsāha ragaḷe",
        "lalita ragaḷe"
    ]);
    ragale.forEach((meter) => {
        assert.equal(meter.linePolicy.type, "repeating");
        assert.equal(meter.linePolicy.min, 1);
        assert.ok(meter.aliases.some((alias) => /ರಗಳೆ/u.test(alias)));
    });
});

test("validates unbounded Utsāha Ragale without inventing future lines", () => {
    const line = textForPattern("GLGLGLGL");

    for (const lineCount of [1, 2, 4, 6]) {
        const stanza = Chandas.analyzeComposition(
            Array(lineCount).fill(line).join("\n"),
            combinedCatalog,
            "structural:utsaha-ragale"
        ).stanzas[0];
        const candidate = stanza.candidates.find((item) =>
            item.id === "structural:utsaha-ragale");

        assert.equal(stanza.violationCount, 0, `${lineCount} lines`);
        assert.equal(stanza.missingCount, 0, `${lineCount} lines`);
        assert.equal(candidate.status, "compatible", `${lineCount} lines`);
    }
});

test("keeps Ragale missing units local to the unfinished current line", () => {
    const stanza = Chandas.analyzeComposition(
        textForPattern("GLGL"),
        combinedCatalog,
        "structural:utsaha-ragale"
    ).stanzas[0];

    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 6);
    assert.equal(stanza.padas.length, 1);
});

test("treats danda as transparent inside a repeating Ragale line", () => {
    const half = textForPattern("GLGL");
    const text = `${half} । ${half}\n${half} ॥ ${half}`;
    const stanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:utsaha-ragale"
    ).stanzas[0];

    assert.equal(stanza.padas.length, 4);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
});

test("accepts both Mandānila group layouts and enforces lagam-varjya", () => {
    const regular = textForPattern("GLLGLLGLLGLL");
    const alternate = textForPattern("GLGGLGLGGL");

    for (const line of [regular, alternate]) {
        const stanza = Chandas.analyzeComposition(
            `${line}\n${line}`,
            combinedCatalog,
            "structural:mandanila-ragale"
        ).stanzas[0];
        assert.equal(stanza.violationCount, 0, line);
        assert.equal(stanza.missingCount, 0, line);
    }

    const forbidden = textForPattern("LGLGGGGGG");
    const stanza = Chandas.analyzeComposition(
        `${forbidden}\n${forbidden}`,
        combinedCatalog,
        "structural:mandanila-ragale"
    ).stanzas[0];
    const reasons = stanza.padas.flatMap((pada) => pada.syllables)
        .filter((syllable) => syllable.violation)
        .map((syllable) => syllable.violationReason);

    assert.equal(
        reasons.filter((reason) => reason === "forbidden-lagam-opening").length,
        2
    );
});

test("validates Lalita Ragale and marks pairwise antya-prāsa at its source", () => {
    const line = textForPattern("GGLGGLGGLGGL");
    const matching = Chandas.analyzeComposition(
        `${line}\n${line}`,
        combinedCatalog,
        "structural:lalita-ragale"
    ).stanzas[0];
    assert.deepEqual(matching.matraPattern, [20, 20]);
    assert.equal(matching.violationCount, 0);

    const mismatchingLine = `${line.slice(0, -1)}ತ`;
    const text = `${line}\n${mismatchingLine}`;
    const mismatching = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:lalita-ragale"
    ).stanzas[0];
    const violation = mismatching.padas[1].syllables.at(-1);

    assert.equal(mismatching.violationCount, 1);
    assert.equal(violation.violationReason, "antya-prasa-mismatch");
    assert.equal(text.slice(violation.start, violation.end), "ತ");
});

test("applies repeating Ragale rules in Devanagari and marks line excess", () => {
    const line = devanagariTextForPattern("GLGLGLGL");
    const valid = Chandas.analyzeComposition(
        `${line}\n${line}`,
        combinedCatalog,
        "structural:utsaha-ragale"
    ).stanzas[0];
    assert.deepEqual(valid.scripts, ["devanagari"]);
    assert.equal(valid.violationCount, 0);
    assert.equal(valid.missingCount, 0);

    const excessive = Chandas.analyzeComposition(
        devanagariTextForPattern("GLGLGLGLG"),
        combinedCatalog,
        "structural:utsaha-ragale"
    ).stanzas[0];
    assert.ok(excessive.violationCount > 0);
    assert.equal(excessive.padas[0].syllables.at(-1).violationReason, "extra-matra");
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
