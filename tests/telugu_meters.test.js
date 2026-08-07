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

const catalog = {
    ...fixedCatalog,
    metres: [...fixedCatalog.metres, ...(structuralCatalog.fixedMeters || [])],
    structuralMeters: structuralCatalog.meters,
    meterProminence: structuralCatalog.meterProminence,
    structuralCatalogVersion: structuralCatalog.catalogVersion
};

const GANA_PATTERN = { S: "GL", I: "GLL" };

function teluguForPattern(pattern) {
    return Array.from(pattern, (weight) => weight === "G" ? "కా" : "క").join(" ");
}

function devanagariForPattern(pattern) {
    return Array.from(pattern, (weight) => weight === "G" ? "का" : "क").join(" ");
}

function textForGanaLines(lines) {
    return lines.map((groups) => teluguForPattern(
        groups.map((group) => GANA_PATTERN[group] || group).join("")
    )).join("\n");
}

function selectedAnalysis(text, meterId) {
    return Chandas.analyzeComposition(text, catalog, meterId).stanzas[0];
}

test("defines the traditional Telugu Sūrya and Indra gaṇa sets", () => {
    assert.deepEqual(Chandas.TELUGU_GANA_PATTERNS.S, ["GL", "LLL"]);
    assert.deepEqual(
        Chandas.TELUGU_GANA_PATTERNS.I,
        ["LLLL", "LLLG", "LLGL", "GLL", "GLG", "GGL"]
    );
});

test("loads every planned Telugu deśi family as script-scoped catalog entries", () => {
    const meters = Chandas.normalizeCatalog(catalog);
    const ids = new Set(meters.map((meter) => meter.id));
    for (const id of [
        "structural:ataveladi-telugu",
        "structural:tetagiti-telugu",
        "structural:kandamu-telugu",
        "structural:dvipada-telugu",
        "structural:manjari-dvipada-telugu",
        "structural:sisa-telugu",
        "structural:mutyala-saralu",
        "structural:taruvoja-telugu",
        "structural:madhyakkara-telugu",
        "structural:ragada-hayaprachara-telugu",
        "structural:ragada-turagavalgana-telugu",
        "structural:ragada-vijayamangala-telugu",
        "structural:ragada-madhuragati-telugu",
        "structural:ragada-harigati-telugu",
        "structural:ragada-dviradagati-telugu",
        "structural:ragada-vijayabhadra-telugu",
        "structural:ragada-harinagati-telugu",
        "structural:ragada-vrishabhagati-telugu",
        "structural:ragada-hamsagati-telugu"
    ]) {
        assert.ok(ids.has(id), id);
        assert.deepEqual(meters.find((meter) => meter.id === id).scripts, ["telugu"]);
    }
});

test("recognizes a public-domain Vemana Āṭaveladi", () => {
    const stanza = selectedAnalysis(
        "ఉప్పు కప్పురంబు నొక్కపోలికనుండుఁ\n" +
        "జూడఁ జూడ రుచుల జాడ వేఱు\n" +
        "పురుషులందు పుణ్య పురుషులు వేఱయా\n" +
        "విశ్వదాభిరామ వినర వేమ!",
        "structural:ataveladi-telugu"
    );
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
});

test("recognizes a sourced Tēṭagīti teaching example", () => {
    const stanza = selectedAnalysis(
        "విని దశగ్రీవు డంగజ వివశు డగుచు\n" +
        "నర్థి బంచిన బసిడిఱ్రి యై నటించు\n" +
        "నీచు మారీచు రాముడు నెఱి వధించె\n" +
        "నంతలో సీత గొనిపోయె నసురవిభుడు",
        "structural:tetagiti-telugu"
    );
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
});

test("marks an invalid Telugu gaṇa at its original source syllable", () => {
    const meter = structuralCatalog.meters.find((entry) =>
        entry.id === "structural:ataveladi-telugu");
    const lines = meter.amshaGroups.map((groups) => teluguForPattern(
        groups.map((group) => GANA_PATTERN[group]).join("")
    ));
    lines[0] = lines[0].replace(/^కా క/, "కా కా");
    const stanza = selectedAnalysis(lines.join("\n"), meter.id);
    const marked = stanza.padas[0].syllables.filter((syllable) => syllable.violation);
    assert.equal(marked.length, 1);
    assert.equal(marked[0].start, 0);
    assert.equal(marked[0].violationReason, "invalid-amsha-gana");
});

test("recognizes Gurajada's public-domain Mutyāla Sarālu gait", () => {
    const stanza = selectedAnalysis(
        "గుత్తునా ముత్యాల సరములు\n" +
        "కూర్చుకొని తేటైన మాటల,\n" +
        "కొత్త పాతల మేలు కలయిక\n" +
        "క్రొమ్మెరుంగులు జిమ్మగా.",
        "structural:mutyala-saralu"
    );
    assert.deepEqual(stanza.matraPattern, [14, 14, 14, 12]);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
});

test("validates Telugu Kandamu without borrowing the Kannada catalog entry", () => {
    const groups = [
        ["GG", "GG", "GG"],
        ["GG", "GG", "LGL", "GG", "GG"],
        ["GG", "GG", "GG"],
        ["GG", "GG", "LGL", "GG", "GG"]
    ];
    const text = groups.map((line) => teluguForPattern(line.join(""))).join("\n");
    const stanza = selectedAnalysis(text, "structural:kandamu-telugu");
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
    assert.equal(stanza.selectedMeter.name, "kandamu (Telugu)");
});

test("validates Dvipada and distinguishes prāsa-free Mañjarī Dvipada", () => {
    const meter = structuralCatalog.meters.find((entry) =>
        entry.id === "structural:dvipada-telugu");
    const matching = textForGanaLines(meter.amshaGroups);
    const changed = matching.split("\n");
    changed[1] = changed[1].replace(/కా క/, "కా ట");

    assert.equal(selectedAnalysis(matching, meter.id).violationCount, 0);
    assert.ok(selectedAnalysis(changed.join("\n"), meter.id).violationCount > 0);
    assert.equal(
        selectedAnalysis(
            changed.join("\n"),
            "structural:manjari-dvipada-telugu"
        ).violationCount,
        0
    );
});

test("accepts Sīsamu as four long lines, eight half-lines, and with ettugīti", () => {
    const meter = structuralCatalog.meters.find((entry) =>
        entry.id === "structural:sisa-telugu");
    const longLines = textForGanaLines(meter.amshaGroups);
    const halfLayout = meter.ganaLayouts.find((layout) =>
        layout.id === "eight-half-lines");
    const withTetagiti = meter.ganaLayouts.find((layout) =>
        layout.id === "four-lines-tetagiti");

    for (const [text, layout] of [
        [longLines, "default"],
        [textForGanaLines(halfLayout.groups), "eight-half-lines"],
        [textForGanaLines(withTetagiti.groups), "four-lines-tetagiti"]
    ]) {
        const stanza = selectedAnalysis(text, meter.id);
        assert.equal(stanza.violationCount, 0, layout);
        assert.equal(stanza.missingCount, 0, layout);
        const candidate = stanza.candidates.find((item) => item.id === meter.id);
        assert.equal(candidate.ganaLayout, layout);
    }
});

test("validates Taruvoja and Madhyākkara in long- and half-line layouts", () => {
    for (const id of [
        "structural:taruvoja-telugu",
        "structural:madhyakkara-telugu"
    ]) {
        const meter = structuralCatalog.meters.find((entry) => entry.id === id);
        const half = meter.ganaLayouts[0];
        assert.equal(selectedAnalysis(
            textForGanaLines(meter.amshaGroups), id
        ).violationCount, 0, `${id} long`);
        assert.equal(selectedAnalysis(
            textForGanaLines(half.groups), id
        ).violationCount, 0, `${id} half`);
    }
});

test("validates every cataloged Telugu Ragaḍa gait and its pairwise rhymes", () => {
    const meters = structuralCatalog.meters.filter((meter) =>
        meter.id.startsWith("structural:ragada-"));
    assert.equal(meters.length, 10);

    for (const meter of meters) {
        const pattern = meter.padaGroups[0].map((capacity) =>
            capacity === 3 ? "GL" : capacity === 4 ? "GG" : "GGL").join("");
        const line = `${teluguForPattern(pattern)}.`;
        const stanza = selectedAnalysis(`${line}\n${line}`, meter.id);
        assert.equal(stanza.violationCount, 0, meter.id);
        assert.equal(stanza.missingCount, 0, meter.id);
    }
});

test("suppresses Telugu-specific candidates when only Kannada or Devanagari is present", () => {
    const teluguMeter = structuralCatalog.meters.find((entry) =>
        entry.id === "structural:tetagiti-telugu");
    const telugu = textForGanaLines(teluguMeter.amshaGroups);
    const kannada = telugu.replace(/[\u0C00-\u0C7F]/g, (character) => {
        const cp = character.codePointAt(0);
        return cp >= 0x0c00 && cp <= 0x0c7f
            ? String.fromCodePoint(cp + 0x80)
            : character;
    });
    const devanagari = Array(4).fill(
        devanagariForPattern("GLGLLGLLGLLGL")
    ).join("\n");

    assert.ok(Chandas.analyzeComposition(telugu, catalog, {}).stanzas[0].candidates
        .some((candidate) => candidate.id === teluguMeter.id));
    assert.ok(!Chandas.analyzeComposition(kannada, catalog, {}).stanzas[0].candidates
        .some((candidate) => candidate.id === teluguMeter.id));
    assert.ok(!Chandas.analyzeComposition(devanagari, catalog, {}).stanzas[0].candidates
        .some((candidate) => candidate.id === teluguMeter.id));
});

test("auto-detects every curated Telugu example as its intended native form", () => {
    const examples = require("../examples/field_guide_corpus.json").examples.filter(
        (entry) => entry.script === "telugu"
    );
    for (const example of examples) {
        const stanza = Chandas.analyzeComposition(example.text, catalog, {}).stanzas[0];
        assert.equal(stanza.candidates[0].id, example.meterId, example.id);
    }
});
