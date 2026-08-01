/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

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
    metres: [...catalog.metres, ...(structuralCatalog.fixedMeters || [])],
    structuralMeters: structuralCatalog.meters
};

function textForPattern(pattern) {
    return Array.from(pattern, (weight) => weight === "G" ? "ಕಾ" : "ಕ").join(" ");
}

function devanagariTextForPattern(pattern) {
    return Array.from(pattern, (weight) => weight === "G" ? "का" : "क").join(" ");
}

function compactTextForPattern(pattern) {
    return Array.from(pattern, (weight) => weight === "G" ? "ಕಾ" : "ಕ").join("");
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
    assert.equal(Chandas.detectScript("ಕ।॥೧॥"), "kannada");
    assert.equal(Chandas.detectScript("क।॥१॥"), "devanagari");
    assert.equal(Chandas.detectScript("।॥೧१॥"), "unknown");
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

test("recognizes historical Kannada ೞ as a consonant in vowels and conjuncts", () => {
    const closed = Chandas.segmentLine("ಕೞ್ದ", 0);
    const onset = Chandas.segmentLine("ೞ್ದೆ", 0);
    const vowels = Chandas.segmentLine("ೞಿ ೞಾ", 0);
    const displayRanges = Chandas.projectHighlightRanges(
        "ಕೞ್ದ",
        closed.syllables.map((syllable) => ({
            start: syllable.start,
            end: syllable.end,
            className: syllable.classification
        }))
    );

    assert.deepEqual(
        closed.syllables.map((syllable) => [syllable.text, syllable.classification]),
        [["ಕೞ್", "G"], ["ದ", "L"]]
    );
    assert.deepEqual(closed.unsupported, []);
    assert.deepEqual(
        onset.syllables.map((syllable) => [syllable.text, syllable.classification]),
        [["ೞ್ದೆ", "L"]]
    );
    assert.deepEqual(
        vowels.syllables.map((syllable) => syllable.classification),
        ["L", "G"]
    );
    assert.deepEqual(
        displayRanges.map((range) => "ಕೞ್ದ".slice(range.start, range.end)),
        ["ಕ", "ೞ್ದ"]
    );
    for (const comparison of ["ಕಲ್ದ", "ಕಳ್ದ", "ಕಱ್ದ", "ಕರ್ದೆ"]) {
        const segmented = Chandas.segmentLine(comparison, 0);
        assert.equal(segmented.syllables[0].classification, "G", comparison);
        assert.deepEqual(segmented.unsupported, [], comparison);
    }
});

test("uses historical Kannada ೞ in automatic dvitīyākṣara-prāsa", () => {
    const stanza = Chandas.analyzeComposition(
        "ಕೞಿ\nಜೞಿ",
        { metres: [] },
        {}
    ).stanzas[0];
    const check = stanza.prasa.checks[0];

    assert.equal(check.status, "match");
    assert.equal(check.key, "ೞ");
    assert.equal(check.provenance, "automatic-kannada");
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

test("matches dvitīyākṣara-prāsa through an ottu and highlights its whole cluster", () => {
    const prasaCatalog = {
        metres: [],
        structuralMeters: [{
            id: "test:dvitiyakshara",
            name: "test dvitīyākṣara",
            kind: "matra",
            linePolicy: { type: "fixed", count: 2 },
            padaGroups: [[3], [3]],
            lineRelations: [{ type: "dvitiyakshara-prasa" }]
        }]
    };
    const text = "ಮಲ್ಪ\nಜಂಪ";
    const stanza = Chandas.analyzeComposition(
        text,
        prasaCatalog,
        "test:dvitiyakshara"
    ).stanzas[0];
    const check = stanza.prasa.checks[0];
    const firstTarget = stanza.padas[0].syllables[1];
    const [projected] = Chandas.projectHighlightRanges(text, [{
        start: firstTarget.start,
        end: firstTarget.end
    }]);

    assert.equal(check.status, "match");
    assert.equal(check.key, "ಪ");
    assert.equal(check.failures, 0);
    assert.equal(check.provenance, "meter-rule");
    assert.equal(check.required, true);
    assert.equal(stanza.prasa.checks.length, 1);
    assert.ok(firstTarget.prasaAnnotations.some((item) =>
        item.status === "match"));
    assert.equal(text.slice(projected.start, projected.end), "ಲ್ಪ");
});

test("ignores a trailing dead consonant when extracting dvitīyākṣara-prāsa", () => {
    const text = [
        "ಕಟ್ಟಿದಸಿಂಘಮನ್ ಕೆಟ್ಟೋದೇನೆಮಗೆಂದು",
        "ಬಿಟ್ಟವೋಲ್ ಕಲಿಗೆವಿಪರೀತಂಗಹಿತರ್ಕಳ್",
        "ಕೆಟ್ಟರ್ಮೇಣ್ಸತ್ತರವಿಚಾರಂ"
    ].join("\n");
    const stanza = Chandas.analyzeComposition(text, combinedCatalog).stanzas[0];
    const check = stanza.prasa.checks[0];
    const targets = stanza.padas.map((pada) => pada.syllables[1]);

    assert.equal(check.status, "match");
    assert.equal(check.key, "ಟ");
    assert.equal(check.failures, 0);
    assert.deepEqual(targets.map((syllable) => syllable.text), [
        "ಟಿ", "ಟ", "ಟರ್"
    ]);
    targets.forEach((syllable) => {
        assert.ok(syllable.prasaAnnotations.some((annotation) =>
            annotation.status === "match" &&
            annotation.detail === "ಟ"));
    });
});

test("retains a trailing dead consonant as the antya-prāsa key", () => {
    const prasaCatalog = {
        metres: [],
        structuralMeters: [{
            id: "test:antya-coda",
            name: "test antya coda",
            kind: "matra",
            linePolicy: { type: "fixed", count: 2 },
            padaGroups: [[4], [4]],
            lineRelations: [{ type: "antya-prasa" }]
        }]
    };
    const stanza = Chandas.analyzeComposition(
        "ಕಾಕಳ್\nಮಾಮಳ್",
        prasaCatalog,
        "test:antya-coda"
    ).stanzas[0];
    const check = stanza.prasa.checks.find((item) =>
        item.type === "antya-prasa");

    assert.equal(check.status, "match");
    assert.equal(check.key, "ಳ");
    assert.equal(check.failures, 0);
});

test("reports consonant and opening Guru/Laghu prāsa failures separately", () => {
    const prasaCatalog = {
        metres: [],
        structuralMeters: [{
            id: "test:dvitiyakshara",
            name: "test dvitīyākṣara",
            kind: "matra",
            linePolicy: { type: "fixed", count: 2 },
            padaGroups: [[3], [3]],
            lineRelations: [{ type: "dvitiyakshara-prasa" }]
        }]
    };
    const consonant = Chandas.analyzeComposition(
        "ಮಲ್ಪ\nಜಂತ",
        prasaCatalog,
        "test:dvitiyakshara"
    ).stanzas[0];
    const weight = Chandas.analyzeComposition(
        "ಮಲ್ಪ\nಜಪ",
        prasaCatalog,
        "test:dvitiyakshara"
    ).stanzas[0];

    assert.equal(consonant.prasa.checks[0].failures, 1);
    assert.equal(
        consonant.padas[1].syllables[1].violationReason,
        "dvitiyakshara-prasa-mismatch"
    );
    assert.equal(weight.prasa.checks[0].weightFailures, 1);
    assert.ok(weight.padas[1].syllables[0].prasaAnnotations.some((item) =>
        item.status === "weight-mismatch"));
    assert.equal(
        weight.padas[1].syllables[0].violationReason,
        "prasa-opening-weight-mismatch"
    );
});

test("checks Kannada dvitīyākṣara-prāsa without requiring a selected meter", () => {
    const matching = Chandas.analyzeComposition("ಕಪ\nಜಪ", catalog, {}).stanzas[0];
    const mismatching = Chandas.analyzeComposition("ಕಪ\nಜತ", catalog, {}).stanzas[0];
    const match = matching.prasa.checks.find((item) =>
        item.type === "dvitiyakshara-prasa");
    const mismatch = mismatching.prasa.checks.find((item) =>
        item.type === "dvitiyakshara-prasa");
    const mismatchedSyllable = mismatching.padas[1].syllables[1];

    assert.equal(match.status, "match");
    assert.equal(match.provenance, "automatic-kannada");
    assert.equal(match.required, false);
    assert.equal(mismatch.status, "mismatch");
    assert.equal(mismatch.failures, 1);
    assert.equal(mismatch.required, false);
    assert.equal(mismatching.violationCount, 0);
    assert.equal(mismatchedSyllable.violation, false);
    assert.notEqual(
        mismatchedSyllable.violationReason,
        "dvitiyakshara-prasa-mismatch"
    );
    assert.ok(mismatchedSyllable.prasaAnnotations.some((item) =>
        item.status === "mismatch" &&
        item.provenance === "automatic-kannada" &&
        item.required === false));
});

test("keeps automatic Kannada prāsa active for a selected fixed vṛtta", () => {
    const fixedCatalog = { metres: [["test-vritta", "LL"]] };
    const stanza = Chandas.analyzeComposition(
        "ಕಪ\nಜಪ",
        fixedCatalog,
        "test-vritta"
    ).stanzas[0];
    const check = stanza.prasa.checks.find((item) =>
        item.type === "dvitiyakshara-prasa");

    assert.equal(stanza.selectedMeterId, "test-vritta");
    assert.equal(check.status, "match");
    assert.equal(check.provenance, "automatic-kannada");
    assert.equal(check.required, false);
});

test("does not apply automatic Kannada prāsa across other or mixed scripts", () => {
    const devanagari = Chandas.analyzeComposition("कप\nजप", catalog, {}).stanzas[0];
    const mixed = Chandas.analyzeComposition("ಕಪ\nजप", catalog, {}).stanzas[0];

    assert.equal(devanagari.prasa.checks.length, 0);
    assert.equal(mixed.prasa.checks.length, 0);
});

test("treats danda, verse numbers, and Markdown as neutral in Kannada prāsa", () => {
    const text = [
        "**ಶ್ರೀಯನರಾತಿ ಸಾಧನ ಪಯೋನಿಧಿಯೊಳ್ ಪಡೆದುಂ ಧರಿತ್ರಿಯಂ**",
        "**ಜೀಯೆನೆ ಬೇಡಿಕೊಳ್ಳದೆ ವಿರೋಧಿ ನರೇಂದ್ರರನೊತ್ತಿಕೊಂಡುಮಾ।**",
        "**ತ್ಮೀಯ ಸುಪುಷ್ಪಪಟ್ಟಮನೊಡಂಬಡೆ ತಾಳ್ದಿಯುಮಿಂತುದಾತ್ತ ನಾ**",
        "**ರಾಯಣನಾದ ದೇವನೆಮಗೀಗರಿಕೇಸರಿ ಸೌಖ್ಯಕೋಟಿಯಂ ॥೧॥**"
    ].join("\n");
    for (const selectedMeter of [{}, "utpalamālikā"]) {
        const stanza = Chandas.analyzeComposition(
            text,
            catalog,
            selectedMeter
        ).stanzas[0];
        const check = stanza.prasa.checks.find((item) =>
            item.type === "dvitiyakshara-prasa");
        const highlighted = stanza.padas.map((pada) =>
            pada.syllables.find((syllable) =>
                (syllable.prasaAnnotations || []).some((item) =>
                    item.kind === "dvitiyakshara-prasa" &&
                    item.status === "match")));

        assert.equal(stanza.candidates[0].id, "utpalamālikā");
        assert.equal(stanza.candidates[0].status, "exact");
        assert.equal(check.status, "match");
        assert.equal(check.key, "ಯ");
        assert.equal(check.provenance, "automatic-kannada");
        assert.deepEqual(highlighted.map((syllable) => syllable.text), [
            "ಯ", "ಯೆ", "ಯ", "ಯ"
        ]);
    }
});

test("finds matching first letters as positive Ādi-prāsa", () => {
    const stanza = Chandas.analyzeComposition("ಮಲ್ಪ\nಮಂಪ", catalog, {}).stanzas[0];
    const finding = stanza.prasa.findings.find((item) =>
        item.type === "adi-prasa");

    assert.equal(finding.status, "found");
    assert.equal(finding.key, "ಮ");
    assert.ok(stanza.padas.every((pada) =>
        pada.syllables[0].prasaAnnotations.some((item) =>
            item.kind === "adi-prasa" && item.status === "match")));
});

test("does not treat the current end of an unfinished line as antya-prāsa", () => {
    const prasaCatalog = {
        metres: [],
        structuralMeters: [{
            id: "test:antya",
            name: "test antya",
            kind: "matra",
            linePolicy: { type: "fixed", count: 2 },
            padaGroups: [[2], [2]],
            lineRelations: [{ type: "antya-prasa" }]
        }]
    };
    const stanza = Chandas.analyzeComposition(
        "ಕಪ\nಜ",
        prasaCatalog,
        "test:antya"
    ).stanzas[0];

    assert.equal(stanza.prasa.checks[0].status, "incomplete");
    assert.equal(stanza.prasa.failures, 0);
    assert.equal(stanza.padas[1].syllables[0].prasaAnnotations, undefined);
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

    assert.equal(
        meters.length,
        catalog.metres.length +
            structuralCatalog.fixedMeters.length +
            structuralCatalog.meters.length
    );
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
    assert.equal(result.analysisVersion, "2.11.1");
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
    assert.deepEqual(stanza.selectedMeter.uncheckedRules, ["historical prāsa variants"]);
    assert.equal(result.analysisVersion, "2.11.1");
    assert.equal(result.catalogVersion, "4.1.0");
});

test("loads and validates the Pañcamātrā Chaupadi Kagga form", () => {
    const meter = Chandas.normalizeCatalog(combinedCatalog).find((entry) =>
        entry.id === "structural:panchamatra-chaupadi-kagga");
    const fiveMatras = "GGL";
    const text = [
        fiveMatras.repeat(4),
        `${fiveMatras.repeat(3)}GL`,
        fiveMatras.repeat(4),
        `${fiveMatras.repeat(3)}L`
    ].map(textForPattern).join("\n");
    const stanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        meter.id
    ).stanzas[0];
    const candidate = stanza.candidates.find((entry) => entry.id === meter.id);

    assert.equal(meter.name, "pañcamātrā chaupadi (Kagga form)");
    assert.ok(meter.aliases.includes("panchamatra choupadi"));
    assert.ok(meter.aliases.includes("ಮಂಕುತಿಮ್ಮನ ಕಗ್ಗ"));
    assert.deepEqual(meter.padaGroups, [
        [5, 5, 5, 5],
        [5, 5, 5, 3],
        [5, 5, 5, 5],
        [5, 5, 5, 1]
    ]);
    assert.deepEqual(stanza.matraPattern, [20, 18, 20, 16]);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
    assert.equal(candidate.status, "compatible");
    assert.deepEqual(stanza.selectedMeter.uncheckedRules, [
        "pādānta lengthening",
        "śithila-dvitva",
        "historical prāsa variants",
        "historical chaupadi variants"
    ]);
});

test("marks a written mātrā beyond the Kagga-form fourth-line cadence", () => {
    const fiveMatras = "GGL";
    const text = [
        fiveMatras.repeat(4),
        `${fiveMatras.repeat(3)}GL`,
        fiveMatras.repeat(4),
        `${fiveMatras.repeat(3)}LL`
    ].map(textForPattern).join("\n");
    const stanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:panchamatra-chaupadi-kagga"
    ).stanzas[0];
    const violations = stanza.padas[3].syllables.filter((syllable) =>
        syllable.violationReason === "extra-matra");

    assert.equal(stanza.missingCount, 0);
    assert.equal(violations.length, 1);
    assert.equal(text.slice(violations[0].start, violations[0].end), "ಕ");
});

test("loads and validates all six quantitative Ṣaṭpadi forms as six-line verses", () => {
    const meters = Chandas.normalizeCatalog(combinedCatalog);
    const quantitativeIds = new Set([
        "structural:shara-shatpadi",
        "structural:kusuma-shatpadi",
        "structural:bhoga-shatpadi",
        "structural:bhamini-shatpadi",
        "structural:parivardhini-shatpadi",
        "structural:vardhaka-shatpadi"
    ]);
    const shatpadis = meters.filter((meter) => quantitativeIds.has(meter.id));
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

test("loads every cataloged Kannada aṃśa family", () => {
    const meters = Chandas.normalizeCatalog(combinedCatalog);
    const amshaMeters = meters.filter((meter) => meter.kind === "amsha");

    assert.deepEqual(amshaMeters.map((meter) => meter.id), [
        "structural:tripadi-kannada",
        "structural:sangatya",
        "structural:piriyakkara",
        "structural:doreyakkara",
        "structural:naduvanakkara",
        "structural:edeyakkara",
        "structural:kiriyakkara",
        "structural:ele-kannada",
        "structural:chaupadi-amsha-kannada",
        "structural:amsha-shatpadi",
        "structural:sobagina-sone",
        "structural:chandovatamsa-nagavarma",
        "structural:adivaraha-jayakirti",
        "structural:akkarike-nagavarma",
        "structural:madanavati-nagavarma"
    ]);
    amshaMeters.forEach((meter) => {
        assert.equal(meter.linePolicy.count, meter.amshaGroups.length);
        assert.ok(meter.aliases.some((alias) => /[\u0c80-\u0cff]/u.test(alias)));
        assert.deepEqual(meter.recitalPolicy, {
            type: "noninitial-laghu-karshana",
            marker: "ಽ",
            matrasPerMark: 1
        });
    });
});

test("validates canonical aṃśa frames, a literal cadence, and Piriyakkara alternatives", () => {
    const classPattern = { B: "GG", V: "GGG", R: "GGGG", G: "G", L: "L" };
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

test("distinguishes the selected historical aṃśa signatures", () => {
    const expected = new Map([
        ["structural:chandovatamsa-nagavarma", ["V", "V", "V", "B"]],
        ["structural:adivaraha-jayakirti", ["V", "B", "B", "B", "B"]],
        ["structural:akkarike-nagavarma", ["V", "B", "V", "B", "V", "R"]],
        ["structural:madanavati-nagavarma", ["V", "V", "V", "V", "V", "G"]]
    ]);

    for (const [id, signature] of expected) {
        const meter = structuralCatalog.meters.find((entry) => entry.id === id);
        assert.deepEqual(meter.amshaGroups, Array.from(
            { length: 4 },
            () => signature
        ));
        assert.equal(meter.sourceRef, "historicalKannadaSource");
    }
    assert.match(
        structuralCatalog.meters.find((entry) =>
            entry.id === "structural:chandovatamsa-nagavarma").notes,
        /Nāgavarma/
    );
    assert.match(
        structuralCatalog.meters.find((entry) =>
            entry.id === "structural:adivaraha-jayakirti").notes,
        /Jayakīrti/
    );
});

test("accepts the reviewed Chandovatamsa realizations without inventing karṣaṇa", () => {
    const text = [
        "ಕಡಿದಾದ ಕಣಿವೆಯ ಬೆಳ್ಳಿಯೇ? ಕೆನೆಯೇ!",
        "ಸಿಡಿಲಿನ ಕುಡಿಯ ಒಳನಂಜಿನ ಹನಿಯೇ",
        "ಕೊಡದಲ್ಲಿ ತುಳುಕಿದೆ ಬುಡದಲ್ಲಿ ಬಳುಕಿದೆ.",
        "ನೋಡದ ಶಿಖರದ ಮಂಜಿನ ಖನಿಯೇ!"
    ].join("\n");
    const stanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:chandovatamsa-nagavarma"
    ).stanzas[0];
    const candidate = stanza.candidates.find((entry) =>
        entry.id === "structural:chandovatamsa-nagavarma");
    const violations = stanza.padas.flatMap((pada) => pada.syllables)
        .filter((syllable) => syllable.violation);

    assert.equal(stanza.missingCount, 0);
    assert.deepEqual(stanza.canonicalAmshaScan, [
        "VVVB", "VVVB", "VVVB", "VVVB"
    ]);
    assert.deepEqual(stanza.realizedAmshaScan, [
        "VVVB", "VRVB", "VVVV", "VVVB"
    ]);
    assert.deepEqual(
        stanza.amshaSubstitutions.map((item) => ({
            pada: item.pada,
            group: item.group,
            expectedClass: item.expectedClass,
            actualClass: item.actualClass,
            realizedMatras: item.realizedMatras,
            realization: item.realization,
            karshana: item.karshana,
            text: text.slice(item.start, item.end)
        })),
        [
            {
                pada: 2,
                group: 2,
                expectedClass: "V",
                actualClass: "R",
                realizedMatras: 6,
                realization: "contracted",
                karshana: "none",
                text: "ಕುಡಿಯ ಒಳ"
            },
            {
                pada: 3,
                group: 4,
                expectedClass: "B",
                actualClass: "V",
                realizedMatras: 4,
                realization: "contracted",
                karshana: "none",
                text: "ಬಳುಕಿದೆ"
            }
        ]
    );
    assert.equal(stanza.substitutionCount, 2);
    assert.equal(candidate.substitutionCount, 2);
    assert.equal(candidate.status, "approximate");
    assert.deepEqual(
        violations.map((syllable) => [
            syllable.text,
            syllable.violationReason
        ]),
        [["ನೋ", "prasa-opening-weight-mismatch"]]
    );
    for (const substitution of stanza.amshaSubstitutions) {
        const substitutedSyllables = stanza.padas
            .flatMap((pada) => pada.syllables)
            .filter((syllable) =>
                syllable.start >= substitution.start &&
                syllable.end <= substitution.end);
        assert.ok(substitutedSyllables.length > 0);
        assert.equal(
            substitutedSyllables.some((syllable) =>
                syllable.recitalExtension),
            false
        );
    }
    assert.equal(
        candidate.karshanaExtensions.some((extension) =>
            [6, 12].includes(extension.globalGroup)),
        false
    );
});

test("ranks canonical Chandovatamsa above its scoped substituted realization", () => {
    const vishnu = compactTextForPattern("LLLL");
    const brahma = compactTextForPattern("LLL");
    const rudra = compactTextForPattern("LLLLL");
    const canonical = Array.from({ length: 4 }, () =>
        [vishnu, vishnu, vishnu, brahma].join(" ")).join("\n");
    const substituted = [
        [vishnu, vishnu, vishnu, brahma],
        [vishnu, rudra, vishnu, brahma],
        [vishnu, vishnu, vishnu, vishnu],
        [vishnu, vishnu, vishnu, brahma]
    ].map((groups) => groups.join(" ")).join("\n");
    const unscoped = [
        [vishnu, rudra, vishnu, brahma],
        [vishnu, vishnu, vishnu, brahma],
        [vishnu, vishnu, vishnu, brahma],
        [vishnu, vishnu, vishnu, brahma]
    ].map((groups) => groups.join(" ")).join("\n");
    const id = "structural:chandovatamsa-nagavarma";
    const canonicalStanza = Chandas.analyzeComposition(
        canonical,
        combinedCatalog,
        id
    ).stanzas[0];
    const substitutedStanza = Chandas.analyzeComposition(
        substituted,
        combinedCatalog,
        id
    ).stanzas[0];
    const unscopedStanza = Chandas.analyzeComposition(
        unscoped,
        combinedCatalog,
        id
    ).stanzas[0];
    const canonicalCandidate = canonicalStanza.candidates.find((entry) =>
        entry.id === id);
    const substitutedCandidate = substitutedStanza.candidates.find((entry) =>
        entry.id === id);

    assert.equal(canonicalStanza.violationCount, 0);
    assert.equal(canonicalCandidate.substitutionCount, 0);
    assert.equal(substitutedStanza.violationCount, 0);
    assert.equal(substitutedStanza.missingCount, 0);
    assert.equal(substitutedCandidate.status, "compatible");
    assert.equal(substitutedCandidate.substitutionCount, 2);
    assert.ok(canonicalCandidate.score < substitutedCandidate.score);
    assert.ok(unscopedStanza.violationCount > 0);
    assert.notDeepEqual(unscopedStanza.realizedAmshaScan, [
        "VRVB", "VVVB", "VVVB", "VVVB"
    ]);
});

test("validates the added historical Tripadi, Chaupadi, Ṣaṭpadi, and song frames", () => {
    const matraPattern = {
        3: "GL",
        4: "GG",
        5: "GGL"
    };
    const amshaPattern = { B: "GG", V: "GGG", R: "GGGG", G: "G" };
    const ids = [
        "structural:ele-kannada",
        "structural:tripadi-matra-historical",
        "structural:chaupadi-amsha-kannada",
        "structural:chaupadi-matra-historical",
        "structural:amsha-shatpadi",
        "structural:uddanda-shatpadi",
        "structural:sobagina-sone"
    ];

    for (const id of ids) {
        const meter = structuralCatalog.meters.find((entry) => entry.id === id);
        const lines = meter.kind === "amsha"
            ? meter.amshaGroups.map((groups) => textForPattern(groups
                .map((group) => amshaPattern[Array.isArray(group) ? group[0] : group])
                .join("")))
            : meter.padaGroups.map((groups) => textForPattern(groups
                .map((capacity) => matraPattern[capacity])
                .join("")));
        const stanza = Chandas.analyzeComposition(
            lines.join("\n"),
            combinedCatalog,
            id
        ).stanzas[0];

        assert.equal(stanza.violationCount, 0, meter.name);
        assert.equal(stanza.missingCount, 0, meter.name);
        assert.equal(
            stanza.candidates.find((candidate) => candidate.id === id).status,
            "compatible",
            meter.name
        );
    }
});

test("enforces historical mātrā Tripadi yati at the original syllable", () => {
    const lineOne = compactTextForPattern("GGL".repeat(4));
    const text = [
        lineOne,
        textForPattern("GGLGLGGLGGL"),
        textForPattern("GGLGLGGL")
    ].join("\n");
    const stanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:tripadi-matra-historical"
    ).stanzas[0];
    const violations = stanza.padas.flatMap((pada) => pada.syllables)
        .filter((syllable) => syllable.violationReason === "required-yati");

    assert.equal(violations.length, 1);
    assert.equal(violations[0], stanza.padas[0].syllables[6]);
    assert.equal(text.slice(violations[0].start, violations[0].end), "ಕಾ");
});

test("loads the two sourced Kannada fixed-vṛtta extensions without rewriting mishra", () => {
    assert.deepEqual(structuralCatalog.fixedMeters, [
        ["campakamāle (Kannada)", "LLLLGLGLLLGLLGLLGLGLG"],
        ["mahāsragdharā (Kannada)", "LLGGGLGGLLLLLLGGLGGLGG"]
    ]);
    assert.equal(
        catalog.metres.some((entry) => /\(Kannada\)$/.test(entry[0])),
        false
    );

    for (const [name, pattern] of structuralCatalog.fixedMeters) {
        const text = Array.from({ length: 4 }, () =>
            textForPattern(pattern)).join("\n");
        const stanza = Chandas.analyzeComposition(
            text,
            combinedCatalog,
            name
        ).stanzas[0];
        assert.equal(stanza.violationCount, 0, name);
        assert.equal(stanza.missingCount, 0, name);
        assert.equal(
            stanza.candidates.find((candidate) => candidate.id === name).status,
            "exact",
            name
        );
    }
});

test("shows karṣaṇa in every supported classical aṃśa meter", () => {
    const shortPatterns = {
        B: "GL",
        V: "GLL",
        R: "GLLL",
        G: "G",
        L: "L"
    };
    const amshaMeters = structuralCatalog.meters.filter((meter) =>
        meter.kind === "amsha");

    for (const meter of amshaMeters) {
        let globalGroup = 0;
        const text = meter.amshaGroups.map((slots) =>
            slots.map((slot) => {
                globalGroup += 1;
                const amshaClass = Array.isArray(slot) ? slot[0] : slot;
                const pattern = meter.id === "structural:tripadi-kannada" &&
                    [7, 11].includes(globalGroup)
                    ? "LLLL"
                    : shortPatterns[amshaClass];
                return compactTextForPattern(pattern);
            }).join(" ")
        ).join("\n");
        const stanza = Chandas.analyzeComposition(
            text,
            combinedCatalog,
            meter.id
        ).stanzas[0];

        assert.equal(stanza.violationCount, 0, meter.name);
        assert.equal(stanza.missingCount, 0, meter.name);
        assert.ok(stanza.karshanaCount > 0, meter.name);
        assert.equal(stanza.karshanaAmbiguityCount, 0, meter.name);
        stanza.padas.flatMap((pada) => pada.syllables)
            .filter((syllable) => syllable.recitalExtension)
            .forEach((syllable) => {
                assert.equal(syllable.classification, "L", meter.name);
                assert.equal(
                    syllable.recitalExtension.reason,
                    "amsha-karshana",
                    meter.name
                );
            });
    }
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

test("marks each non-initial aṃśa Laghu without marking the opening LL", () => {
    const meter = {
        id: "test:amsha-karshana",
        name: "test aṃśa karṣaṇa",
        kind: "amsha",
        aliases: [],
        signatureLines: ["BVR"],
        ruleCompleteness: "complete",
        recitalPolicy: {
            type: "noninitial-laghu-karshana",
            marker: "ಽ",
            matrasPerMark: 1
        },
        linePolicy: { type: "fixed", unit: "line", count: 1 },
        amshaGroups: [["B", "V", "R"]]
    };
    const catalog = { metres: [], structuralMeters: [meter] };
    const text = [
        compactTextForPattern("LLL"),
        compactTextForPattern("LLLL"),
        compactTextForPattern("GLLL")
    ].join(" ");
    const stanza = Chandas.analyzeComposition(text, catalog, meter.id).stanzas[0];
    const syllables = stanza.padas[0].syllables;
    const markedIndexes = syllables
        .map((syllable, index) => syllable.recitalExtension ? index : -1)
        .filter((index) => index >= 0);

    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
    assert.equal(stanza.karshanaCount, 6);
    assert.equal(stanza.karshanaAmbiguityCount, 0);
    assert.deepEqual(markedIndexes, [2, 5, 6, 8, 9, 10]);
    markedIndexes.forEach((index) => {
        assert.equal(syllables[index].classification, "L");
        assert.equal(syllables[index].violation, false);
        assert.equal(syllables[index].recitalExtension.marker, "ಽ");
        assert.equal(syllables[index].recitalExtension.matras, 1);
        assert.equal(
            syllables[index].recitalExtension.reason,
            "amsha-karshana"
        );
    });
    assert.equal(stanza.padas[0].syllables[0].recitalExtension, undefined);
    assert.equal(stanza.padas[0].syllables[1].recitalExtension, undefined);
    assert.equal(stanza.padas[0].syllables[3].recitalExtension, undefined);
    assert.equal(stanza.padas[0].syllables[4].recitalExtension, undefined);
    assert.equal(stanza.padas[0].syllables[7].recitalExtension, undefined);
});

test("shows a unique detected aṃśa recital guide and preserves selected provenance", () => {
    const vishnu = compactTextForPattern("GLL");
    const brahma = compactTextForPattern("GL");
    const text = [
        [vishnu, vishnu, vishnu, vishnu],
        [vishnu, vishnu, brahma],
        [vishnu, vishnu, vishnu, vishnu],
        [vishnu, vishnu, brahma]
    ].map((groups) => groups.join(" ")).join("\n");

    const detected = Chandas.analyzeComposition(text, combinedCatalog).stanzas[0];
    const detectedMarks = detected.padas.flatMap((pada) => pada.syllables)
        .filter((syllable) => syllable.recitalExtension);

    assert.deepEqual(detected.detectedAmshaMeter, {
        id: "structural:sangatya",
        name: "sāṅgatya"
    });
    assert.equal(detected.karshanaCount, 26);
    assert.equal(detected.karshanaAmbiguityCount, 0);
    assert.equal(detectedMarks.length, 26);
    detectedMarks.forEach((syllable) => {
        assert.equal(syllable.recitalExtension.provenance, "detected-meter");
    });

    const selected = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        "structural:sangatya"
    ).stanzas[0];
    const selectedMarks = selected.padas.flatMap((pada) => pada.syllables)
        .filter((syllable) => syllable.recitalExtension);

    assert.equal(selected.detectedAmshaMeter, null);
    assert.equal(selected.karshanaCount, 26);
    assert.equal(selectedMarks.length, 26);
    selectedMarks.forEach((syllable) => {
        assert.equal(syllable.recitalExtension.provenance, "selected-meter");
    });
});

test("withholds uncertain karṣaṇa positions until a gaṇa boundary resolves them", () => {
    const meter = {
        id: "test:ambiguous-amsha",
        name: "ambiguous aṃśa",
        kind: "amsha",
        aliases: [],
        signatureLines: ["V/B V/B"],
        ruleCompleteness: "complete",
        recitalPolicy: {
            type: "noninitial-laghu-karshana",
            marker: "ಽ",
            matrasPerMark: 1
        },
        linePolicy: { type: "fixed", unit: "line", count: 1 },
        amshaGroups: [[["V", "B"], ["V", "B"]]]
    };
    const catalog = { metres: [], structuralMeters: [meter] };
    const ambiguous = Chandas.analyzeComposition(
        compactTextForPattern("GGLLLG"),
        catalog,
        meter.id
    ).stanzas[0];

    assert.equal(ambiguous.violationCount, 0);
    assert.equal(ambiguous.missingCount, 0);
    assert.equal(ambiguous.karshanaAmbiguityCount, 1);
    assert.equal(ambiguous.karshanaCount, 0);
    assert.equal(
        ambiguous.padas[0].syllables.some((syllable) =>
            syllable.recitalExtension),
        false
    );

    const resolved = Chandas.analyzeComposition(
        `${compactTextForPattern("GGL")} ${compactTextForPattern("LLG")}`,
        catalog,
        meter.id
    ).stanzas[0];
    const marked = resolved.padas[0].syllables
        .map((syllable, index) => syllable.recitalExtension ? index : -1)
        .filter((index) => index >= 0);

    assert.equal(resolved.karshanaAmbiguityCount, 0);
    assert.equal(resolved.karshanaCount, 1);
    assert.deepEqual(marked, [2]);
});

test("keeps classical Tripadi strict while folk Tripadi marks sung Laghu extensions", () => {
    const text = [
        "ಕೂಸು ಇದ್ದ ಮನೆಗೆ ಬೀಸಣಿಗೆ ಯಾತಕ",
        "ಕೂಸು ಕಂದಯ್ಯ ಒಳಹೊರಗ ಆಡಿದರ",
        "ಬೀಸಣಿಗೆ ಗಾಳಿ ಬೀಸ್ಯಾವ"
    ].join("\n");
    const meters = Chandas.normalizeCatalog(combinedCatalog);
    const classical = meters.find((meter) =>
        meter.id === "structural:tripadi-kannada");
    const folk = meters.find((meter) =>
        meter.id === "structural:tripadi-folk-kannada");

    assert.equal(classical.kind, "amsha");
    assert.deepEqual(classical.amshaGroups, [
        ["V", "V", "V", "V"],
        ["V", "B", "V", "V"],
        ["V", "B", "V"]
    ]);
    assert.equal(folk.kind, "matra");
    assert.deepEqual(folk.padaGroups, [
        [5, 5, 5, 5],
        [5, 4, 5, 5],
        [5, 4, 5]
    ]);
    assert.deepEqual(folk.sungLaghuExtension, {
        maxMatras: 1,
        marker: "ಽ"
    });

    const folkStanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        folk.id
    ).stanzas[0];
    const extensions = folkStanza.padas
        .flatMap((pada) => pada.syllables)
        .filter((syllable) => syllable.sungExtension);

    assert.equal(folkStanza.violationCount, 0);
    assert.equal(folkStanza.missingCount, 0);
    assert.equal(folkStanza.sungExtensionCount, 4);
    assert.equal(extensions.length, 4);
    extensions.forEach((syllable) => {
        assert.equal(syllable.classification, "L");
        assert.equal(syllable.violation, false);
        assert.deepEqual(syllable.sungExtension, {
            marker: "ಽ",
            matras: 1,
            reason: "sung-laghu-extension"
        });
    });
    assert.equal(folkStanza.prasa.checks[0].status, "match");
    assert.equal(folkStanza.prasa.checks[0].key, "ಸ");
    assert.equal(
        folkStanza.candidates.find((candidate) => candidate.id === folk.id).status,
        "compatible"
    );

    const classicalStanza = Chandas.analyzeComposition(
        text,
        combinedCatalog,
        classical.id
    ).stanzas[0];
    const classicalViolations = classicalStanza.padas
        .flatMap((pada) => pada.syllables)
        .filter((syllable) => syllable.violation)
        .map((syllable) => syllable.text);

    assert.equal(classicalStanza.violationCount, 3);
    assert.deepEqual(classicalViolations, ["ಗೆ", "ಗ", "ಗೆ"]);
    assert.equal(classicalStanza.sungExtensionCount, 0);
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

test("accepts the twenty-four-mātrā Utsāha Ragaḷe line variant", () => {
    const line = textForPattern("GL".repeat(8));
    const stanza = Chandas.analyzeComposition(
        `${line}\n${line}`,
        combinedCatalog,
        "structural:utsaha-ragale"
    ).stanzas[0];

    assert.deepEqual(stanza.matraPattern, [24, 24]);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
    assert.equal(
        stanza.candidates.find((candidate) =>
            candidate.id === "structural:utsaha-ragale").status,
        "compatible"
    );
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
        devanagariTextForPattern("GL".repeat(9)),
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
