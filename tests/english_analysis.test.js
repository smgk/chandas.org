/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { performance } = require("node:perf_hooks");

const English = require("../english_analysis.js");
const EnglishComposer = require("../english_composer.js");
const meters = require("../english_meters.json");
const lexiconDocument = require("../data/english/en-cmudict-stress-v1.json");
const corpus = require("../examples/english_prosody_corpus.json");
const LexiconBuilder = require("../scripts/build-english-lexicon.js");
const lexicon = English.createLexicon(lexiconDocument);

test("builds a deterministic stress-only lexicon from pinned CMUdict rows", () => {
    const source = [
        ";;; comment",
        "RECORD R AH0 K AO1 R D",
        "RECORD(2) R EH1 K ER0 D",
        "CAFE K AE0 F EY1",
        "PUNCT! P AH1 NG K T",
        ""
    ].join("\n");
    const first = LexiconBuilder.buildDocument(source, { revision: "fixture" });
    const second = LexiconBuilder.buildDocument(source, { revision: "fixture" });

    assert.deepEqual(first, second);
    assert.deepEqual(first.entries, [
        ["cafe", ["01"]],
        ["record", ["01", "10"]]
    ]);
    assert.equal(first.license, "BSD-2-Clause");
    assert.match(first.source.sha256, /^[a-f0-9]{64}$/);
});

test("ships the pinned, attributed CMUdict-derived M2 data pack", () => {
    assert.equal(lexiconDocument.schemaVersion, 1);
    assert.equal(lexiconDocument.language, "en");
    assert.equal(lexiconDocument.accent, "en-US");
    assert.equal(lexiconDocument.license, "BSD-2-Clause");
    assert.equal(lexiconDocument.source.revision,
        "74790861f652b15e4ac49015a90074ad62a27690");
    assert.equal(lexiconDocument.source.sha256,
        "81917843c7f44ce2b094ac63873c2c7a4cf802040792c455ba3ca406891c3d22");
    assert.ok(lexiconDocument.counts.entries >= 126000);
    assert.ok(lexiconDocument.counts.stressPatterns >=
        lexiconDocument.counts.entries);
    assert.deepEqual(lexicon.entries.get("record"), ["01", "10"]);
    assert.ok(fs.statSync(path.join(__dirname, "..", "data", "english",
        "en-cmudict-stress-v1.json")).size < 2.5 * 1024 * 1024);
});

test("tokenization and syllable alignment preserve authored source ranges", () => {
    const text = "  Café's light—record!";
    const tokens = English.tokenize(text, 12);
    assert.deepEqual(tokens.map((token) => token.text), ["Café's", "light", "record"]);
    tokens.forEach((token) => {
        assert.equal(text.slice(token.start - 12, token.end - 12), token.text);
    });

    const result = English.analyzeLine(text, lexicon, meters, {
        offset: 12,
        overrides: { "cafe's": "01" }
    });
    for (const word of result.bestCandidate.words) {
        const syllables = result.bestCandidate.syllables.filter((syllable) =>
            syllable.wordIndex === word.index);
        assert.equal(syllables.map((syllable) => syllable.text).join(""), word.text);
        syllables.forEach((syllable) => {
            assert.equal(text.slice(syllable.start - 12, syllable.end - 12),
                syllable.text);
            assert.ok(syllable.start < syllable.end);
        });
    }
});

test("composition offsets project English syllables into their authored stanza", () => {
    const prefix = "Earlier stanza\n\n";
    const line = "The time has come, the Walrus said";
    const result = English.analyzeComposition(line, lexicon, meters, {
        offset: prefix.length
    });
    assert.equal(result.lines[0].start, prefix.length);
    result.lines[0].syllables.forEach((syllable) => {
        assert.equal(`${prefix}${line}`.slice(syllable.start, syllable.end),
            syllable.text);
    });
});

test("retains alternatives, local overrides, and honest unknown-word confidence", () => {
    const alternatives = English.lineRealizations("record", 0, lexicon, {});
    assert.deepEqual(alternatives.realizations.map((item) =>
        item.syllables.map((syllable) => syllable.lexicalStress).join("")),
    ["01", "10"]);

    const overridden = English.lineRealizations("record", 0, lexicon, {
        overrides: { record: "10" }
    });
    assert.equal(overridden.realizations.length, 1);
    assert.equal(overridden.realizations[0].words[0].pronunciationProvenance,
        "override");

    const guessed = English.analyzeLine("Zorbathiel sings", lexicon, meters, {});
    assert.ok(guessed.bestCandidate.guessedWords.includes("Zorbathiel"));
    assert.equal(guessed.bestCandidate.words[0].pronunciationConfidence, "guessed");
});

test("retains noun-verb stress alternatives without inventing grammar context", () => {
    const expected = {
        suspect: ["01", "12"],
        conflict: ["01", "10"],
        protest: ["01", "12"],
        convert: ["01", "10"]
    };

    for (const [word, patterns] of Object.entries(expected)) {
        assert.deepEqual(lexicon.entries.get(word), patterns, word);
        const realizations = English.lineRealizations(word, 0, lexicon, {});
        assert.deepEqual(realizations.realizations.map((item) =>
            item.syllables.map((syllable) => syllable.lexicalStress).join("")),
        patterns, word);
    }
});

test("validates the versioned M3 catalog and controlled template variations", () => {
    assert.equal(English.validateCatalog(meters), meters);
    assert.equal(meters.meters.length, 17);
    assert.deepEqual(new Set(meters.meters.map((meter) => meter.foot)),
        new Set(["iamb", "trochee", "anapest", "dactyl"]));

    const iamb = meters.meters.find((meter) =>
        meter.id === "english:iambic-pentameter");
    const iambVariants = English.templateVariants(iamb);
    assert.ok(iambVariants.some((item) =>
        item.variations.includes("initial-inversion")));
    assert.ok(iambVariants.some((item) =>
        item.variations.includes("feminine-ending")));
    assert.ok(iambVariants.some((item) =>
        item.variations.some((variation) => variation.startsWith("weak-resolution-"))));

    const trochee = meters.meters.find((meter) =>
        meter.id === "english:trochaic-tetrameter");
    assert.ok(English.templateVariants(trochee).some((item) =>
        item.variations.includes("catalexis")));

    const anapest = meters.meters.find((meter) =>
        meter.id === "english:anapestic-tetrameter");
    assert.ok(English.templateVariants(anapest).some((item) =>
        item.variations.includes("initial-slack-omission")));
    assert.ok(English.templateVariants(anapest).some((item) =>
        item.variations.some((variation) => variation.startsWith("weak-resolution-"))));
});

test("the M1 public-domain golden corpus has complete provenance", () => {
    assert.equal(corpus.analysisSystem, "english-stress");
    assert.match(corpus.corpusVersion, /^\d+\.\d+\.\d+$/);
    assert.ok(corpus.examples.length >= 21);
    assert.equal(new Set(corpus.examples.map((example) => example.id)).size,
        corpus.examples.length);
    corpus.examples.forEach((example) => {
        assert.ok(example.text && example.meterId && example.humanGrid, example.id);
        assert.ok(example.source.author && example.source.work &&
            /^https:\/\//.test(example.source.url), example.id);
        assert.equal(example.rights, "Public domain", example.id);
        assert.match(example.humanGrid, /^[WS]+$/, example.id);
    });
    assert.deepEqual(new Set(corpus.futureFormFixtures.map((example) =>
        example.form)), new Set([
        "common-measure", "limerick", "accentual-nursery-rhyme"
    ]));
    corpus.futureFormFixtures.forEach((example) => {
        assert.ok(example.source.author && example.source.work &&
            /^https:\/\//.test(example.source.url), example.id);
        assert.equal(example.rights, "Public domain", example.id);
    });
});

test("every M1 golden example meets its independent top-N expectation", () => {
    for (const example of corpus.examples) {
        const result = English.analyzeLine(example.text, lexicon, meters, {
            overrides: example.overrides
        });
        const rank = result.candidates.findIndex((candidate) =>
            candidate.id === example.meterId) + 1;
        const candidate = result.candidates[rank - 1];
        assert.ok(rank > 0 && rank <= example.expected.topRankMax,
            `${example.id}: expected top ${example.expected.topRankMax}, got ${rank}`);
        assert.ok(example.expected.levels.includes(candidate.matchLevel),
            `${example.id}: ${candidate.matchLevel}`);
        assert.equal(candidate.syllables.length, example.expected.syllables,
            example.id);
        if (example.expected.variation) {
            assert.ok(candidate.variations.includes(example.expected.variation),
                example.id);
        }
    }
});

test("partial lines, negative scansions, and poem-level evidence stay explicit", () => {
    const partialFixture = corpus.diagnostics.find((item) =>
        item.id === "partial-iambic-pentameter");
    const partial = English.analyzeLine(
        partialFixture.text,
        lexicon,
        meters,
        partialFixture.options
    );
    const partialRank = partial.candidates.findIndex((candidate) =>
        candidate.id === partialFixture.meterId) + 1;
    const partialCandidate = partial.candidates[partialRank - 1];
    assert.ok(partialRank <= partialFixture.expected.topRankMax);
    assert.equal(partialCandidate.matchLevel, "incomplete");
    assert.equal(partialCandidate.missingCount, 1);

    const negativeFixture = corpus.diagnostics.find((item) =>
        item.id === "selected-meter-stress-conflict");
    const negative = English.analyzeLine(
        negativeFixture.text,
        lexicon,
        meters,
        { selectedMeterId: negativeFixture.meterId }
    );
    assert.equal(negative.selected.matchLevel, negativeFixture.expected.level);
    assert.ok(negative.selected.deviations.length >=
        negativeFixture.expected.minimumDeviations);
    assert.equal(negative.selected.confidence, "low");
    assert.ok(negative.selected.substitutions.every((item) =>
        item.kind === "spondee"));
    assert.ok(negative.selected.substitutions.length >= 4);
    negative.selected.deviations.forEach((deviation) => {
        assert.equal(negativeFixture.text.slice(
            deviation.syllable.start,
            deviation.syllable.end
        ), deviation.syllable.text);
    });

    const poem = English.analyzeComposition(
        "The time has come, the Walrus said\nA slumber did my spirit seal",
        lexicon,
        meters,
        {}
    );
    assert.equal(poem.bestCandidate.id, "english:iambic-tetrameter");
    assert.equal(poem.bestCandidate.exactLines, 2);
    assert.equal(poem.dominantFeet[0].foot, "iamb");
});

test("reports close candidates instead of hiding genuine ambiguity", () => {
    const result = English.analyzeLine("A record of the record", lexicon, meters, {
        partial: true,
        ambiguityMargin: 0.08
    });
    assert.equal(result.ambiguous, true);
    assert.ok(result.nearTies.length >= 1);
    assert.ok(result.candidates.some((candidate) =>
        candidate.alternateRealizations.length > 0));
});

test("an empty English composition makes no metrical claim", () => {
    const result = English.analyzeComposition(" \n\n", lexicon, meters, {});
    assert.deepEqual(result.candidates, []);
    assert.equal(result.bestCandidate, null);
    assert.equal(result.ambiguous, false);
});

test("the M4 adapter keeps stanza selections and deviations source-local", () => {
    const text = "The time has come, the Walrus said\nA slumber did my spirit seal\n\n" +
        "Bright bright bright bright bright bright bright bright bright bright";
    const analysis = EnglishComposer.analyze(text, {
        0: "english:iambic-tetrameter",
        1: "english:iambic-pentameter"
    }, lexicon, meters, English);

    assert.equal(analysis.analysisSystem, "english-stress");
    assert.equal(analysis.stanzas.length, 2);
    assert.equal(analysis.stanzas[0].selectedCandidate.matchLevel, "exact");
    assert.equal(analysis.stanzas[0].violationCount, 0);
    assert.ok(analysis.stanzas[1].violationCount >= 4);
    assert.ok(analysis.stanzas[1].lines[0].syllables.every((syllable) =>
        text.slice(syllable.start, syllable.end) === syllable.text));
    assert.ok(analysis.segments.every((syllable) => syllable.script === "english"));
});

test("analyzes a 2,000-character English composition inside the M3 budget", () => {
    const line = "The time has come, the Walrus said.\n";
    const text = line.repeat(Math.ceil(2000 / line.length)).slice(0, 2000);
    const started = performance.now();
    const result = English.analyzeComposition(text, lexicon, meters, {});
    const duration = performance.now() - started;

    assert.ok(result.lines.length > 50);
    assert.ok(result.lines[0].syllables.length >= 8);
    assert.ok(duration < 300, `English analysis took ${duration.toFixed(1)} ms`);
});
