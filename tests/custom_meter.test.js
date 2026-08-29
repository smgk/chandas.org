/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Chandas = require("../meter_analysis.js");
const Roman = require("../roman_transliteration.js");
const Custom = require("../custom_meter.js");

function learn(text, options) {
    const analysis = Chandas.analyzeComposition(text, { metres: [] });
    const inference = Custom.infer(analysis, {
        activeStanzaIndex: 0,
        sourceScheme: "native",
        romanApi: Roman
    });
    return {
        inference,
        form: Custom.buildForm(inference, {
            name: "My cadence",
            mode: options && options.mode || "exact",
            enforceCadence: true,
            enforceAntya: Boolean(options && options.enforceAntya),
            enforceDvitiyakshara: false,
            enforceYati: false,
            enforceRefrain: false
        })
    };
}

test("infers repeated line roles, quantitative ranges, cadence, and evidence", () => {
    const { inference } = learn("ಕ ಕಾ\nಗ ಗಾ\n\nಚ ಚಾ\nಜ ಜಾ");
    assert.equal(inference.lineCount, 2);
    assert.equal(inference.sampleCount, 2);
    assert.equal(inference.roles[0].syllables.preferred, 2);
    assert.equal(inference.roles[0].matras.preferred, 3);
    assert.equal(inference.roles[0].cadence, "LG");
    assert.equal(inference.examples.length, 2);
});

test("turns an exact inferred form into a selectable validating meter", () => {
    const source = "ಕ ಕಾ\nಗ ಗಾ";
    const { form } = learn(source);
    const meter = Custom.toCatalogMeter(form);
    const catalog = { metres: [], structuralMeters: [meter] };
    const exact = Chandas.analyzeComposition(source, catalog, { 0: form.id });
    assert.equal(exact.stanzas[0].selectedMeterId, form.id);
    assert.equal(exact.stanzas[0].violationCount, 0);
    assert.equal(exact.stanzas[0].missingCount, 0);

    const changed = Chandas.analyzeComposition("ಕ ಕ\nಗ ಗಾ", catalog, { 0: form.id });
    assert.ok(changed.stanzas[0].violationCount > 0);
    assert.ok(changed.stanzas[0].lines[0].syllables.some((item) => item.violation));
});

test("stores inferred end-rhyme groups as custom meter relations", () => {
    const source = "ಕ ಕಾ\nಗ ಕಾ\n\nಚ ಚಾ\nಜ ಚಾ";
    const { inference, form } = learn(source, { enforceAntya: true });
    assert.equal(inference.rhyme.antya.scheme, "AA");
    assert.deepEqual(inference.rhyme.antya.lineGroups, [[1, 2]]);
    const meter = Custom.toCatalogMeter(form);
    const result = Chandas.analyzeComposition(
        "ತ ತಾ\nದ ತಾ",
        { metres: [], structuralMeters: [meter] },
        { 0: form.id }
    );
    assert.equal(result.stanzas[0].prasa.checks[0].status, "match");
    assert.equal(result.stanzas[0].violationCount, 0);
});

test("balanced and loose modes widen only their documented constraints", () => {
    const { inference } = learn("ಕ ಕಾ\nಗ ಗಾ");
    const balanced = Custom.buildForm(inference, {
        name: "Balanced", mode: "balanced", enforceCadence: false
    });
    const loose = Custom.buildForm(inference, {
        name: "Loose", mode: "loose", enforceCadence: false
    });
    assert.equal(balanced.rules[0].syllables.min, 2);
    assert.equal(balanced.rules[0].syllables.max, 2);
    assert.equal(loose.rules[0].syllables.min, 1);
    assert.equal(loose.rules[0].syllables.max, 3);
    assert.equal(loose.rules[0].matras.min, 1);
    assert.equal(loose.rules[0].matras.max, 5);
});

test("normalization rejects malformed records and limits stored forms", () => {
    assert.throws(() => Custom.normalizeForm({ name: "No rules" }), /Invalid/);
    const { form } = learn("ಕ ಕಾ\nಗ ಗಾ");
    const duplicates = Custom.normalizeForms([form, form]);
    assert.equal(duplicates.length, 1);

    const bounded = Custom.normalizeForm({
        ...form,
        rhyme: {
            antya: { lineGroups: [[0, 1, 99], [1, 2, 2]] },
            dvitiyakshara: { lineGroups: "not an array" }
        },
        refrains: [
            { line: 99, text: "outside" },
            { line: 1, text: "kept" }
        ],
        evidence: {
            examples: Array(20).fill("example"),
            confidence: 8
        }
    });
    assert.deepEqual(bounded.rhyme.antya.lineGroups, [[1, 2]]);
    assert.equal(bounded.rhyme.dvitiyakshara, null);
    assert.deepEqual(bounded.refrains, [{ line: 1, text: "kept" }]);
    assert.equal(bounded.evidence.examples.length, 5);
    assert.equal(bounded.evidence.confidence, 1);
});
