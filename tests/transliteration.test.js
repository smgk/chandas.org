/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Roman = require("../roman_transliteration.js");
const Chandas = require("../meter_analysis.js");

const fixture = JSON.parse(fs.readFileSync(path.join(
    __dirname,
    "fixtures/aksharamukha_roman_devanagari.json"
), "utf8"));
const conversionFixture = JSON.parse(fs.readFileSync(path.join(
    __dirname,
    "fixtures/aksharamukha_conversion.json"
), "utf8"));

test("matches Aksharamukha-verified verse for all four Roman schemes", () => {
    for (const item of fixture.cases) {
        const result = Roman.transliterate(item.input, item.scheme);
        assert.equal(result.analysisText, item.expected, item.scheme);
        assert.deepEqual(result.warnings, [], item.scheme);
    }
});

test("matches the Aksharamukha-verified sound inventory for each scheme", () => {
    for (const item of fixture.cases) {
        assert.equal(
            Roman.transliterate(item.inventoryInput, item.scheme).analysisText,
            fixture.inventoryExpected[item.scheme],
            item.scheme
        );
    }
});

test("keeps the IAST and ISO 15919 vowel conventions distinct", () => {
    assert.equal(Roman.transliterate("e o", "iast").analysisText, "ए ओ");
    assert.equal(Roman.transliterate("e ē o ō", "iso15919").analysisText,
        "ऎ ए ऒ ओ");
});

test("accepts canonically decomposed diacritics without losing source ranges", () => {
    const input = "kr\u0325s\u0323n\u0323ah\u0323";
    const result = Roman.transliterate(input, "iso15919");
    assert.equal(result.analysisText, "कृष्णः");
    const mapped = Roman.mapRange(result, 0, result.analysisText.length);
    assert.deepEqual(mapped, { start: 0, end: input.length });
});

test("projects Devanagari syllable ranges onto untouched Roman groups", () => {
    const source = "pārthāya pratibodhitāṃ";
    const conversion = Roman.transliterate(source, "iast");
    const raw = Chandas.analyzeComposition(conversion.analysisText, { metres: [] });
    const projected = Roman.projectAnalysis(raw, conversion);
    assert.equal(projected.text, source);
    assert.equal(projected.analysisText, "पार्थाय प्रतिबोधितां");
    assert.equal(projected.segments.map((item) => item.text).join(""),
        "pārthāyapratibodhitāṃ");
    assert.ok(projected.segments.every((item) =>
        source.slice(item.start, item.end) === item.text));
    assert.deepEqual(projected.scripts, ["roman"]);
});

test("Roman and Aksharamukha-equivalent Devanagari produce identical meter scans", () => {
    for (const item of fixture.cases) {
        const conversion = Roman.transliterate(item.input, item.scheme);
        const romanRaw = Chandas.analyzeComposition(
            conversion.analysisText,
            { metres: [] }
        );
        const devanagari = Chandas.analyzeComposition(item.expected, { metres: [] });
        assert.deepEqual(
            romanRaw.stanzas.map((stanza) => stanza.patterns),
            devanagari.stanzas.map((stanza) => stanza.patterns),
            item.scheme
        );
        assert.deepEqual(
            romanRaw.segments.map((segment) => segment.classification),
            devanagari.segments.map((segment) => segment.classification),
            item.scheme
        );
    }
});

test("preserves newlines, punctuation, and unknown text", () => {
    const result = Roman.transliterate("kavi,\nq!", "iast");
    assert.equal(result.analysisText, "कवि,\nq!");
    assert.equal(result.sourceText, "kavi,\nq!");
    assert.equal(result.warnings[0].text, "q");
});

test("native mode is an exact no-op", () => {
    const source = "ಕನ್ನಡ । देवनागरी\nతెలుగు ગુજરાતી";
    const conversion = Roman.transliterate(source, "native");
    assert.equal(conversion.analysisText, source);
    const analysis = { text: source, stanzas: [] };
    assert.equal(Roman.projectAnalysis(analysis, conversion), analysis);
});

test("converts one phoneme stream to every Aksharamukha-verified target", () => {
    for (const [target, expected] of Object.entries(conversionFixture.targets)) {
        const result = Roman.convert(
            conversionFixture.input,
            conversionFixture.sourceScheme,
            target
        );
        assert.equal(result.text, expected, target);
        assert.equal(result.lossy, target === "colloquial", target);
        assert.deepEqual(result.warnings, [], target);
    }
});

test("converts all four native scripts to the same IAST text", () => {
    for (const target of ["devanagari", "kannada", "telugu", "gujarati"]) {
        const native = conversionFixture.targets[target];
        assert.equal(
            Roman.convert(native, "native", "iast").text,
            conversionFixture.targets.iast,
            target
        );
    }
});

test("exact Roman targets round-trip through the analysis shadow", () => {
    const expected = conversionFixture.targets.devanagari;
    for (const scheme of ["iast", "iso15919", "itrans", "hk"]) {
        const roman = Roman.convert(expected, "native", scheme).text;
        assert.equal(Roman.transliterate(roman, scheme).analysisText, expected, scheme);
    }
});

test("conversion preserves verse layout, punctuation, and numerals", () => {
    const source = "ಕೃಷ್ಣಃ, ಪಾರ್ಥಾಯ।\n\nಸ್ವಯಮ್ ೧೨";
    const converted = Roman.convert(source, "native", "devanagari");
    assert.equal(converted.text, "कृष्णः, पार्थाय।\n\nस्वयम् १२");
    assert.deepEqual(converted.warnings, []);
});

test("unsupported native letters stay visible and produce a warning", () => {
    const result = Roman.convert("ૹ", "native", "devanagari");
    assert.equal(result.text, "ૹ");
    assert.equal(result.warnings[0].reason, "unsupported-native-character");
});
