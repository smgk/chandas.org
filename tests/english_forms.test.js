/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const test = require("node:test");

const English = require("../english_analysis.js");
const Composer = require("../english_composer.js");
const Forms = require("../english_forms.js");
const Builder = require("../scripts/build-english-rhyme.js");
const meters = require("../english_meters.json");
const formCatalog = require("../english_forms.json");
const corpus = require("../examples/english_prosody_corpus.json");
const stressLexicon = English.createLexicon(
    require("../data/english/en-cmudict-stress-v1.json")
);
const rhymeDocument = require("../data/english/en-cmudict-rhyme-v1.json");
const rhymeLexicon = Forms.createRhymeLexicon(rhymeDocument);

test("builds deterministic final-stressed-vowel rhyme keys", () => {
    const source = [
        "FEARED F IH1 R D",
        "BEARD B IH1 R D",
        "CITY S IH1 T IY0",
        "PITY P IH1 T IY0",
        "A AH0",
        ""
    ].join("\n");
    const first = Builder.buildDocument(source, { revision: "fixture" });
    const second = Builder.buildDocument(source, { revision: "fixture" });

    assert.deepEqual(first, second);
    assert.deepEqual(new Map(first.entries).get("feared"), [["IH.R.D", 0]]);
    assert.deepEqual(new Map(first.entries).get("city"), [["IH.T.IY", 1]]);
    assert.deepEqual(new Map(first.entries).get("a"), [["AH", 0]]);
    assert.match(first.source.sha256, /^[a-f0-9]{64}$/);
});

test("ships the pinned, attributed M5 rhyme pack", () => {
    assert.equal(rhymeDocument.schemaVersion, 1);
    assert.equal(rhymeDocument.representation, "final-stressed-vowel-rime");
    assert.equal(rhymeDocument.license, "BSD-2-Clause");
    assert.equal(rhymeDocument.source.revision,
        "74790861f652b15e4ac49015a90074ad62a27690");
    assert.equal(rhymeDocument.source.sha256,
        "81917843c7f44ce2b094ac63873c2c7a4cf802040792c455ba3ca406891c3d22");
    assert.ok(rhymeDocument.counts.entries >= 126000);
    assert.ok(fs.statSync(path.join(__dirname, "..", "data", "english",
        "en-cmudict-rhyme-v1.json")).size < 4 * 1024 * 1024);
});

test("detects perfect rhyme, rhyme type, schemes, and unknown endings", () => {
    const lines = ["beard", "feared", "city", "pity", "Zorbathiel"]
        .map((word, index) => ({
            index,
            end: index * 10 + word.length,
            tokens: [{
                text: word,
                normalized: word.toLowerCase(),
                start: index * 10,
                end: index * 10 + word.length
            }]
        }));
    const result = Forms.analyzeRhymes(lines, rhymeLexicon);

    assert.equal(result.scheme, "AABB?");
    assert.equal(result.endings[0].kind, "masculine");
    assert.equal(result.endings[2].kind, "feminine");
    assert.equal(result.unknownCount, 1);
    assert.deepEqual(result.repeatedGroups.map((group) => group.lines), [
        [1, 2], [3, 4]
    ]);
});

function mockRhymeLexicon(scheme) {
    const entries = scheme.split("").map((label, index) => [
        `${label.toLowerCase()}word${index}`,
        [[`R${label}`, 0]]
    ]);
    return Forms.createRhymeLexicon({
        schemaVersion: 1,
        representation: "final-stressed-vowel-rime",
        entries
    });
}

function mockLines(meterIds, scheme) {
    return meterIds.map((meterId, index) => {
        const word = `${scheme[index].toLowerCase()}word${index}`;
        return {
            start: index * 20,
            end: index * 20 + word.length,
            tokens: [{
                text: word,
                normalized: word,
                start: index * 20,
                end: index * 20 + word.length
            }],
            candidates: [{
                id: meterId,
                canonicalPattern: "WS",
                syllables: [{}, {}],
                matchLevel: "exact",
                missingCount: 0,
                extraCount: 0,
                score: 0.01
            }]
        };
    });
}

test("recognizes every cataloged M5 form without adding forms to meter choices", () => {
    const penta = "english:iambic-pentameter";
    const tetra = "english:iambic-tetrameter";
    const tri = "english:iambic-trimeter";
    const hexa = "english:iambic-hexameter";
    const hepta = "english:iambic-heptameter";
    const anTri = "english:anapestic-trimeter";
    const anDi = "english:anapestic-dimeter";
    const cases = [
        ["english-form:blank-verse", [penta, penta], "AB"],
        ["english-form:heroic-couplet", [penta, penta], "AA"],
        ["english-form:common-measure", [tetra, tri, tetra, tri], "ABCD"],
        ["english-form:ballad-stanza", [tetra, tri, tetra, tri], "ABCB"],
        ["english-form:long-measure", [tetra, tetra, tetra, tetra], "AABB"],
        ["english-form:short-measure", [tri, tri, tetra, tri], "AABB"],
        ["english-form:fourteener-verse", [hepta, hepta], "AB"],
        ["english-form:poulters-measure", [hexa, hepta], "AA"],
        ["english-form:limerick", [anTri, anTri, anDi, anDi, anTri], "AABBA"],
        ["english-form:common-limerick", [tri, tri, "english:trochaic-dimeter", "english:iambic-dimeter", tri], "AABBA"],
        ["english-form:limerick-y", Array(5).fill(penta), "AABBA"],
        ["english-form:english-sonnet", Array(14).fill(penta), "ABABCDCDEFEFGG"],
        ["english-form:spenserian-sonnet", Array(14).fill(penta), "ABABBCBCCDCDEE"],
        ["english-form:petrarchan-sonnet", Array(14).fill(penta), "ABBAABBACDECDE"],
        ["english-form:rhyme-royal", Array(7).fill(penta), "ABABBCC"],
        ["english-form:ottava-rima", Array(8).fill(penta), "ABABABCC"],
        ["english-form:terza-rima", Array(6).fill(penta), "ABABCB"],
        ["english-form:spenserian-stanza", [
            ...Array(8).fill(penta), hexa
        ], "ABABBCBCC"]
    ];

    Forms.validateCatalog(formCatalog);
    assert.equal(formCatalog.forms.length, cases.length);
    for (const [expectedId, meterIds, scheme] of cases) {
        const result = Forms.analyzeStanza(
            mockLines(meterIds, scheme),
            mockRhymeLexicon(scheme),
            formCatalog
        );
        assert.ok(result.forms.some((form) => form.id === expectedId), expectedId);
    }
    assert.equal(meters.meters.some((meter) =>
        meter.id.startsWith("english-form:")), false);
});

test("recognizes the public-domain common-measure and limerick fixtures", () => {
    const fixtures = corpus.formFixtures;
    assert.equal(fixtures.length, 2);
    for (const fixture of fixtures) {
        const analysis = Composer.analyze(
            fixture.text,
            {},
            stressLexicon,
            meters,
            English,
            { engine: Forms, rhymeLexicon, catalog: formCatalog }
        );
        const stanza = analysis.stanzas[0];
        assert.ok(stanza.rhyme);
        assert.ok(stanza.forms.some((form) =>
            form.id === `english-form:${fixture.form}`), fixture.id);
        if (fixture.expectedRhymeScheme) {
            assert.equal(stanza.rhyme.scheme, fixture.expectedRhymeScheme);
        }
        if (fixture.form === "limerick") {
            assert.equal(stanza.forms.some((form) =>
                form.id === "english-form:common-limerick"), false);
            assert.equal(stanza.forms.some((form) =>
                form.id === "english-form:limerick-y"), false);
        }
    }
});

test("recognizes any fully known five-line AABBA verse as limerick-y", () => {
    const analysis = Composer.analyze(
        "cat\nhat\nbee\ntree\nbat",
        {},
        stressLexicon,
        meters,
        English,
        { engine: Forms, rhymeLexicon, catalog: formCatalog }
    );
    const stanza = analysis.stanzas[0];

    assert.equal(stanza.rhyme.scheme, "AABBA");
    assert.deepEqual(stanza.forms.map((form) => form.id), [
        "english-form:limerick-y"
    ]);
    assert.equal(stanza.forms[0].matchLevel, "compatible");
    assert.deepEqual(stanza.forms[0].meterFits, []);
});

test("does not guess limerick-y when an AABBA ending is unknown", () => {
    const analysis = Composer.analyze(
        "cat\nhat\nbee\ntree\nZorbathiel",
        {},
        stressLexicon,
        meters,
        English,
        { engine: Forms, rhymeLexicon, catalog: formCatalog }
    );

    assert.equal(analysis.stanzas[0].rhyme.scheme, "AABB?");
    assert.equal(analysis.stanzas[0].forms.some((form) =>
        form.id === "english-form:limerick-y"), false);
});

test("recognizes a flexible 3/3/2/2/3 AABBA poem as a common limerick", () => {
    const text = "once there was a bird\nnot a song it heard\n" +
        "pooped a lot\nin every spot\nso I shot the little bird";
    const analysis = Composer.analyze(
        text,
        {},
        stressLexicon,
        meters,
        English,
        { engine: Forms, rhymeLexicon, catalog: formCatalog }
    );
    const stanza = analysis.stanzas[0];

    assert.equal(stanza.rhyme.scheme, "AABBA");
    assert.equal(stanza.forms[0].id, "english-form:common-limerick");
    assert.deepEqual(
        stanza.forms[0].meterFits.map((fit) => fit.id),
        [
            "english:trochaic-trimeter",
            "english:trochaic-trimeter",
            "english:trochaic-dimeter",
            "english:iambic-dimeter",
            "english:iambic-trimeter"
        ]
    );
});

test("keeps M5 rhyme and form analysis inside the live-composition budget", () => {
    const line = "The time has come, the Walrus said.\n";
    const text = line.repeat(Math.ceil(2000 / line.length)).slice(0, 2000);
    const started = performance.now();
    const analysis = Composer.analyze(
        text,
        {},
        stressLexicon,
        meters,
        English,
        { engine: Forms, rhymeLexicon, catalog: formCatalog }
    );
    const duration = performance.now() - started;

    assert.ok(analysis.stanzas[0].rhyme.endings.length > 50);
    assert.ok(duration < 500,
        `English M5 analysis took ${duration.toFixed(1)} ms`);
});
