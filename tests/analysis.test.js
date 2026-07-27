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

test("source ranges reconstruct the analyzed syllables without shifting punctuation", () => {
    const text = "  ಕಂ, ಕಾ!  ";
    const result = Chandas.analyzeComposition(text, catalog, {});

    result.segments.forEach((segment) => {
        assert.equal(text.slice(segment.start, segment.end), segment.text);
    });
    assert.equal(result.text, text);
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
    const result = Chandas.analyzeComposition(text, catalog, {});
    const elapsed = performance.now() - started;

    assert.ok(result.segments.length > 0);
    assert.ok(elapsed < 250, `analysis took ${elapsed.toFixed(1)} ms`);
});
