"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
    fixedVersePatterns,
    foldSearch,
    ganaReading,
    structuralMeter
} = require("../documentation.js");

test("documentation search accepts ordinary Roman spellings", () => {
    assert.equal(foldSearch("anuṣṭubh"), "anustubh");
    assert.equal(foldSearch("ĀRYĀGĪTI"), "aryagiti");

    const meter = structuralMeter({
        name: "āryā",
        aliases: ["aarya"],
        kind: "matra",
        signatureLines: ["12 | 18 mātrās"],
        padaGroups: [[4, 4, 4]]
    });
    assert.match(meter.searchText, /arya/);

    const amsha = structuralMeter({
        name: "naḍuvaṇakkara",
        aliases: ["naduvanakkara"],
        kind: "amsha",
        signatureLines: ["BVVVR"],
        amshaGroups: [["B", "V", "V", "V", "R"]]
    });
    assert.match(amsha.searchText, /naduvanakkara/);
    assert.equal(amsha.kindLabel, "Aṃśa meter");
});

test("documentation expands fixed signatures to the whole four-pāda verse", () => {
    assert.deepEqual(fixedVersePatterns("LG"), ["LG", "LG", "LG", "LG"]);
    assert.deepEqual(
        fixedVersePatterns(["LG", "GL"]),
        ["LG", "GL", "LG", "GL"]
    );
    assert.deepEqual(
        fixedVersePatterns(["L", "G", "LL", "GG"]),
        ["L", "G", "LL", "GG"]
    );
});

test("documentation names the traditional three-syllable gaṇas", () => {
    assert.deepEqual(ganaReading("LGGGGL"), ["ya-gaṇa", "ta-gaṇa"]);
    assert.deepEqual(ganaReading("LLLG"), ["na-gaṇa", "Guru"]);
});
