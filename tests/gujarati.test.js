/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const Chandas = require("../meter_analysis.js");
const catalog = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "mishra.json"),
    "utf8"
));

function gujaratiForPattern(pattern) {
    return Array.from(pattern, (weight) => weight === "G" ? "કા" : "ક").join(" ");
}

function devanagariForPattern(pattern) {
    return Array.from(pattern, (weight) => weight === "G" ? "का" : "क").join(" ");
}

test("detects Gujarati letters and ignores Gujarati digits as script evidence", () => {
    assert.equal(Chandas.detectScript("ગુજરાતી કાવ્ય"), "gujarati");
    assert.equal(Chandas.detectScript("ક।॥૧॥"), "gujarati");
    assert.equal(Chandas.detectScript("ૹા"), "gujarati");
    assert.equal(Chandas.detectScript("૧૨૩"), "unknown");

    const withVerseNumber = Chandas.segmentLine("ક ॥૧॥ કા", 0);
    assert.deepEqual(
        withVerseNumber.syllables.map((syllable) => syllable.classification),
        ["L", "G"]
    );
    assert.deepEqual(withVerseNumber.unsupported, []);
});

test("classifies Gujarati independent vowel quantity", () => {
    const line = Chandas.segmentLine(
        "અ આ ઇ ઈ ઉ ઊ ઋ ૠ ઌ ૡ ઍ એ ઐ ઑ ઓ ઔ",
        0
    );

    assert.deepEqual(
        line.syllables.map((syllable) => syllable.classification).join(""),
        "LGLGLGLGLGLGGLGG"
    );
    assert.deepEqual(line.unsupported, []);
});

test("classifies Gujarati dependent vowels, anusvāra, visarga, and avagraha", () => {
    const line = Chandas.segmentLine(
        "ક કા કિ કી કુ કૂ કૃ કૄ કૅ કે કૈ કૉ કો કૌ કં કઃ કઁ ઽક",
        0
    );

    assert.deepEqual(
        line.syllables.map((syllable) => syllable.classification).join(""),
        "LGLGLGLGLGGLGGGGLL"
    );
    assert.deepEqual(line.unsupported, []);
});

test("handles Gujarati conjunct closure and punctuation-separated conjuncts", () => {
    const internal = Chandas.segmentLine("પદ્ય", 0);
    const boundary = Chandas.segmentLine("ક,   ક્ર", 0);

    assert.equal(internal.syllables[0].classification, "G");
    assert.ok(internal.syllables[0].reasons.includes("closed-by-conjunct"));
    assert.deepEqual(
        boundary.syllables.map((syllable) => syllable.classification),
        ["G", "L"]
    );
    assert.ok(boundary.syllables[0].reasons.includes("followed-by-conjunct"));
});

test("Gujarati and Devanagari Sanskrit patterns remain equivalent", () => {
    const pattern = "GLGLLGGLLGLG";
    const gujarati = Chandas.segmentLine(gujaratiForPattern(pattern), 0);
    const devanagari = Chandas.segmentLine(devanagariForPattern(pattern), 0);

    assert.equal(gujarati.script, "gujarati");
    assert.equal(
        gujarati.syllables.map((syllable) => syllable.classification).join(""),
        devanagari.syllables.map((syllable) => syllable.classification).join("")
    );
    assert.deepEqual(gujarati.unsupported, []);
});

test("matches fixed vṛttas from Gujarati text without a Gujarati meter catalog", () => {
    const tinyCatalog = { metres: [["gujarati-script-vrtta", "GLGL"]] };
    const text = Array(4).fill(gujaratiForPattern("GLGL")).join("\n");
    const stanza = Chandas.analyzeComposition(
        text,
        tinyCatalog,
        "gujarati-script-vrtta"
    ).stanzas[0];

    assert.deepEqual(stanza.scripts, ["gujarati"]);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
    assert.equal(stanza.candidates[0].status, "exact");
});

test("Gujarati source ranges reconstruct syllables without moving punctuation", () => {
    const text = "કાવ્ય, સુગંધિતં॥";
    const result = Chandas.analyzeComposition(text, catalog, {});
    const syllables = result.segments;

    syllables.forEach((syllable) => {
        assert.equal(text.slice(syllable.start, syllable.end), syllable.text);
    });
    assert.deepEqual(result.scripts, ["gujarati"]);
});
