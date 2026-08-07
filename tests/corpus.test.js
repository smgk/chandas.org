/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const Chandas = require("../meter_analysis.js");
const fixedCatalog = require("../mishra.json");
const structuralCatalog = require("../structural_meters.json");
const corpus = require("../examples/field_guide_corpus.json");

const catalog = {
    ...fixedCatalog,
    metres: [...fixedCatalog.metres, ...(structuralCatalog.fixedMeters || [])],
    structuralMeters: structuralCatalog.meters,
    meterProminence: structuralCatalog.meterProminence,
    structuralCatalogVersion: structuralCatalog.catalogVersion
};

test("the field-guide corpus has stable provenance and unique IDs", () => {
    assert.match(corpus.corpusVersion, /^\d+\.\d+\.\d+$/);
    assert.ok(corpus.examples.length >= 11);
    assert.equal(new Set(corpus.examples.map((example) => example.id)).size,
        corpus.examples.length);
    corpus.examples.forEach((example) => {
        assert.ok(example.meterId, example.id);
        assert.ok(example.text.includes("\n"), example.id);
        assert.ok(example.source && example.source.title, example.id);
        assert.ok(example.rights, example.id);
        assert.ok(example.expected, example.id);
    });
});

test("every curated field-guide poem satisfies its stored scansion expectations", () => {
    for (const example of corpus.examples) {
        const stanza = Chandas.analyzeComposition(
            example.text,
            catalog,
            example.meterId
        ).stanzas[0];
        assert.equal(stanza.violationCount, example.expected.violations, example.id);
        assert.equal(stanza.missingCount, 0, example.id);
        if (example.expected.matras) {
            assert.deepEqual(stanza.matraPattern, example.expected.matras, example.id);
        }
        if (example.expected.syllables) {
            assert.deepEqual(
                stanza.lines.map((line) => line.syllables.length),
                example.expected.syllables,
                example.id
            );
        }
    }
});
