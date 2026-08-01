/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Chandas = require("../meter_analysis.js");
const Shithila = require("../shithila_dvitva.js");

const twoSyllableCatalog = {
    metres: [
        ["two-light", "LL"],
        ["heavy-light", "GL"]
    ]
};

test("the disabled optional pass is identical to the baseline analyzer", () => {
    const text = "ಎರ್ದೆ";
    const baseline = Chandas.analyzeComposition(
        text,
        twoSyllableCatalog,
        "two-light"
    );
    const disabled = Shithila.analyzeComposition(
        text,
        twoSyllableCatalog,
        "two-light",
        { detect: false }
    );

    assert.deepEqual(disabled, baseline);
    assert.equal(disabled.segments[0].classification, Chandas.GURU);
});

test("the optional pass recomputes a reviewed repha realization as Laghu", () => {
    const result = Shithila.analyzeComposition(
        "ಎರ್ದೆ",
        twoSyllableCatalog,
        "two-light",
        { detect: true }
    );
    const stanza = result.stanzas[0];
    const realized = result.segments[0];

    assert.deepEqual(stanza.patterns, ["LL"]);
    assert.deepEqual(stanza.matraPattern, [2]);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.shithilaDvitvaCount, 1);
    assert.equal(realized.classification, Chandas.LAGHU);
    assert.equal(realized.orthographicClassification, Chandas.GURU);
    assert.ok(realized.reasons.includes("shithila-dvitva"));
    assert.equal(realized.shithilaDvitva.marker, "*");
    assert.equal("ಎರ್ದೆ".slice(
        realized.shithilaDvitva.conjunctStart,
        realized.shithilaDvitva.conjunctEnd
    ), "ರ್ದ");
});

test("ordinary exact scansion remains preferred when no meter is selected", () => {
    const result = Shithila.analyzeComposition(
        "ಎರ್ದೆ",
        twoSyllableCatalog,
        {},
        { detect: true }
    );

    assert.equal(result.segments[0].classification, Chandas.GURU);
    assert.equal(result.shithilaDvitva.realizationCount, 0);
    assert.equal(result.stanzas[0].candidates[0].name, "heavy-light");
});

test("meter detection can use the alternate realization when it improves fit", () => {
    const result = Shithila.analyzeComposition(
        "ಎರ್ದೆ",
        { metres: [["two-light", "LL"]] },
        {},
        { detect: true }
    );

    assert.equal(result.segments[0].classification, Chandas.LAGHU);
    assert.notEqual(result.stanzas[0].candidates[0].status, "approximate");
    assert.equal(result.stanzas[0].candidates[0].distance, 0);
});

test("the pass keeps only the śithila realization needed by the meter", () => {
    const result = Shithila.analyzeComposition(
        "ಎರ್ದೆ ಕರ್ದೆ",
        { metres: [["one-relaxation", "LLGL"]] },
        "one-relaxation",
        { detect: true }
    );

    assert.equal(result.stanzas[0].violationCount, 0);
    assert.equal(result.stanzas[0].shithilaDvitvaCount, 1);
    assert.equal(result.segments[0].classification, Chandas.LAGHU);
    assert.equal(result.segments[2].classification, Chandas.GURU);
});

test("aspirated followers are not relaxed by the conservative rule", () => {
    const result = Shithila.analyzeComposition(
        "ಕರ್ಧೆ",
        { metres: [["two-light", "LL"]] },
        "two-light",
        { detect: true }
    );

    assert.equal(result.segments[0].classification, Chandas.GURU);
    assert.equal(result.shithilaDvitva.candidateCount, 0);
});

test("historical Kannada ೞ is Guru ordinarily and optionally realizes as Laghu", () => {
    const text = "ಕೞ್ದ";
    const baseline = Chandas.analyzeComposition(text, twoSyllableCatalog, "two-light");
    const enabled = Shithila.analyzeComposition(
        text,
        twoSyllableCatalog,
        "two-light",
        { detect: true }
    );

    assert.equal(baseline.unsupported.length, 0);
    assert.deepEqual(baseline.stanzas[0].patterns, ["GL"]);
    assert.equal(baseline.segments[0].classification, Chandas.GURU);
    assert.equal(enabled.unsupported.length, 0);
    assert.deepEqual(enabled.stanzas[0].patterns, ["LL"]);
    assert.equal(enabled.segments[0].classification, Chandas.LAGHU);
    assert.equal(enabled.segments[0].orthographicClassification, Chandas.GURU);
    assert.equal(enabled.stanzas[0].shithilaDvitvaCount, 1);
    assert.equal(enabled.segments[0].shithilaDvitva.evidence, "historical-lateral");
});
