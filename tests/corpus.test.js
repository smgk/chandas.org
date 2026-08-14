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
const Documentation = require("../documentation.js");
const corpora = [
    require("../examples/field_guide_corpus.json"),
    require("../examples/apte_sanskrit_examples.json")
];
const examples = corpora.flatMap(Documentation.corpusExamples);
const ArchiveAudit = require("../scripts/audit-meter-sources.js");

const catalog = {
    ...fixedCatalog,
    metres: [...fixedCatalog.metres, ...(structuralCatalog.fixedMeters || [])],
    structuralMeters: structuralCatalog.meters,
    meterProminence: structuralCatalog.meterProminence,
    structuralCatalogVersion: structuralCatalog.catalogVersion
};

test("the field-guide corpus has stable provenance and unique IDs", () => {
    corpora.forEach((corpus) => assert.match(corpus.corpusVersion, /^\d+\.\d+\.\d+$/));
    assert.ok(examples.length >= 50);
    assert.equal(new Set(examples.map((example) => example.id)).size,
        examples.length);
    examples.forEach((example) => {
        assert.ok(example.meterId, example.id);
        assert.ok(example.text.includes("\n"), example.id);
        assert.ok(example.source && example.source.title, example.id);
        assert.ok(example.rights, example.id);
        assert.ok(["source-verified", "source-pending"].includes(
            example.verificationStatus), example.id);
        assert.equal(example.childSafety, "reviewed-safe", example.id);
        if (example.verificationStatus === "source-verified") {
            assert.ok(example.source.url, example.id);
        }
        assert.ok(example.expected, example.id);
    });
});

test("every curated field-guide poem satisfies its stored scansion expectations", () => {
    for (const example of examples) {
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

test("the authenticated example catalog never uses generated filler", () => {
    const verified = examples.filter((example) =>
        example.verificationStatus === "source-verified");

    assert.ok(verified.length >= 50);
    verified.forEach((example) => {
        assert.doesNotMatch(example.author || "", /generated|synthetic/i, example.id);
        assert.doesNotMatch(example.rights, /unknown|pending/i, example.id);
    });
});

test("the Archive audit accounts for every supported catalog entry", () => {
    const audit = ArchiveAudit.loadAudit();

    assert.equal(audit.catalogEntries, 1419);
    assert.equal(audit.uniqueMeterIds, 1410);
    assert.equal(audit.duplicateCatalogEntries, 9);
    assert.equal(audit.verifiedExampleMeters, 51);
    assert.equal(audit.sourcePendingExampleMeters, 0);
    assert.equal(audit.researchPendingMeters, 1359);
    assert.equal(audit.recordedArchiveOcrLeadMeters, 121);
    assert.equal(audit.ledger.length, audit.catalogEntries);
    assert.ok(audit.ledger.every((entry) => [
        "verified-example",
        "source-pending-example",
        "research-pending"
    ].includes(entry.status)));
});
