/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const Synonyms = require("../synonym_engine.js");
const Builder = require("../scripts/build-synonyms.js");

const root = path.join(__dirname, "..");

test("finds the complete Indic word at and immediately after the caret", () => {
    const text = "ಮುಂದು ಕೃಷ್ಣ, ಹಿಂದೆ";
    const inside = Synonyms.wordRange(text, text.indexOf("ಷ"));
    const after = Synonyms.wordRange(text, text.indexOf(","));
    assert.deepEqual(inside, after);
    assert.equal(inside.word, "ಕೃಷ್ಣ");
    assert.equal(text.slice(inside.start, inside.end), "ಕೃಷ್ಣ");
    assert.equal(Synonyms.wordRange(text, text.indexOf(",") + 1), null);
});

test("indexes separate licensed databases without merging their senses", () => {
    const alar = {
        schemaVersion: 1,
        language: "kn",
        license: "ODbL-1.0",
        source: { id: "alar" },
        concepts: [{
            id: "kn:1",
            label: "sky",
            words: [["ಆಕಾಶ"], ["ಬಾನು"]]
        }]
    };
    const amara = {
        schemaVersion: 1,
        language: "sa",
        license: "CC-BY-SA-4.0",
        source: { id: "amara" },
        concepts: [{
            id: "sa:1",
            label: "आकाश",
            words: [["आकाश"], ["वियत्"]]
        }]
    };
    const index = Synonyms.createIndex([alar, amara]);
    assert.equal(Synonyms.lookup(index, ["ಆಕಾಶ"])[0].source.id, "alar");
    assert.equal(Synonyms.lookup(index, ["आकाश"])[0].source.id, "amara");
});

test("Alar builder groups only explicit shared sense ids", () => {
    const source = [
        "- id: 1",
        "  entry: ಬಾನು",
        "  defs:",
        "  - id: 10",
        "    entry: the open sky.",
        "    type: noun",
        "- id: 2",
        "  entry: ಆಕಾಶ",
        "  defs:",
        "  - id: 10",
        "    entry: open sky;",
        "    type: noun",
        "- id: 3",
        "  entry: ಗಗನ",
        "  defs:",
        "  - id: 11",
        "    entry: the open sky.",
        "    type: noun"
    ].join("\n");
    const built = Builder.buildAlarDatabase(source);
    assert.equal(built.concepts.length, 1);
    assert.deepEqual(
        built.concepts[0].words.map((word) => word[0]).sort(),
        ["ಆಕಾಶ", "ಬಾನು"].sort()
    );
});

test("Amarakośa builder converts SLP1 synsets to Devanagari", () => {
    const source = [
        '<info kvvv="<s>praTamaM kARqam</s>, <s>svargavargaH</s>"/>',
        '<eid>2<syns><s>amara-puM,deva-puM,sura-puM</s>'
    ].join("\n");
    const built = Builder.buildAmaraDatabase(source);
    assert.equal(built.concepts.length, 1);
    assert.equal(built.concepts[0].category, "स्वर्गवर्गः");
    assert.deepEqual(
        built.concepts[0].words.map((word) => word[0]),
        ["अमर", "देव", "सुर"]
    );
});

test("production synonym data is compact, attributed, and non-empty", () => {
    const files = [
        "data/synonyms/kn-alar-v1.json",
        "data/synonyms/sa-amarakosha-v1.json"
    ];
    const documents = files.map((file) =>
        JSON.parse(fs.readFileSync(path.join(root, file), "utf8")));
    assert.equal(documents[0].license, "ODbL-1.0");
    assert.equal(documents[1].license, "CC-BY-SA-4.0");
    assert.ok(documents[0].counts.concepts > 5000);
    assert.ok(documents[1].counts.concepts > 4000);
    assert.ok(documents.every((document) => document.source.revision));
    assert.ok(files.every((file) =>
        fs.statSync(path.join(root, file)).size < 1_500_000));
});
