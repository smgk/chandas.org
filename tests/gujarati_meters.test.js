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

const SCRIPT_UNITS = {
    gujarati: { L: "ક", G: "કા" },
    kannada: { L: "ಕ", G: "ಕಾ" },
    devanagari: { L: "क", G: "का" }
};

function patternForMatras(matras) {
    if (matras % 2 === 0) {
        return "G".repeat(matras / 2);
    }
    return `${"G".repeat((matras - 3) / 2)}LG`;
}

function textForPattern(pattern, script = "gujarati") {
    const symbols = SCRIPT_UNITS[script];
    return Array.from(pattern, (weight) => symbols[weight]).join(" ");
}

function lineForGroups(groups, script = "gujarati", finalPattern = "") {
    const patterns = groups.map(patternForMatras);
    if (finalPattern) {
        patterns[patterns.length - 1] = finalPattern;
    }
    return patterns.map((pattern) => textForPattern(pattern, script)).join("  ");
}

function selected(text, meterId) {
    return Chandas.analyzeComposition(text, catalog, meterId).stanzas[0];
}

test("loads the scoped Gujarati traditional-meter catalog", () => {
    const meters = Chandas.normalizeCatalog(catalog);
    const expected = [
        "structural:chaupai-gujarati",
        "structural:doharo-gujarati",
        "structural:soratho-gujarati",
        "structural:harigit-gujarati",
        "structural:jhulana-gujarati",
        "structural:savaiya-ekatrisa-gujarati",
        "structural:savaiya-batrisa-gujarati",
        "structural:rola-gujarati",
        "structural:katav-gujarati",
        "structural:manhar-gujarati",
        "structural:ghanakshari-gujarati"
    ];

    expected.forEach((id) => {
        const meter = meters.find((entry) => entry.id === id);
        assert.ok(meter, id);
        assert.deepEqual(meter.scripts, ["gujarati"], id);
    });
});

test("recognizes the source-published Gujarati caupāī example", () => {
    const stanza = selected(
        "આકાશે તારાની ભાત\n" +
        "ધરતી હૈયે ફૂલબિછાત\n" +
        "સર્જી, તો કાં સર્જી તાત!\n" +
        "માનવના મનમાં મધરાત!",
        "structural:chaupai-gujarati"
    );

    assert.deepEqual(stanza.matraPattern, [15, 15, 15, 15]);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
    assert.equal(
        stanza.candidates.find((candidate) =>
            candidate.id === "structural:chaupai-gujarati").status,
        "exact"
    );
});

test("recognizes the source-published compact doharō example", () => {
    const stanza = selected(
        "કરતાં જાળ કરોળિયો, ભોંય પડી ગભરાય\n" +
        "વણ તૂટેલે તાંતણે, ઉપર ચઢવા જાય.",
        "structural:doharo-gujarati"
    );
    const candidate = stanza.candidates.find((item) =>
        item.id === "structural:doharo-gujarati");

    assert.deepEqual(stanza.matraPattern, [24, 23]);
    assert.equal(stanza.violationCount, 0);
    assert.equal(stanza.missingCount, 0);
    assert.equal(candidate.status, "exact");
    assert.equal(candidate.compactMatraLayout, true);
});

test("accepts Gujarati four-caraṇa and compact two-line layouts", () => {
    for (const [id, groups] of [
        ["structural:chaupai-gujarati", [[4, 4, 4, 3], [4, 4, 4, 3]]],
        ["structural:doharo-gujarati", [[4, 4, 5], [4, 4, 3]]],
        ["structural:soratho-gujarati", [[4, 4, 3], [4, 4, 5]]]
    ]) {
        const terminalPattern = id.includes("chaupai") ? "GL" : "";
        const fourCaraṇas = [groups[0], groups[1], groups[0], groups[1]]
            .map((line) => lineForGroups(line, "gujarati", terminalPattern))
            .join("\n");
        const compact = Array(2).fill(
            `${lineForGroups(groups[0], "gujarati", terminalPattern)}, ` +
            `${lineForGroups(groups[1], "gujarati", terminalPattern)}`
        ).join("\n");

        for (const [layout, text] of [["four", fourCaraṇas], ["compact", compact]]) {
            const stanza = selected(text, id);
            const candidate = stanza.candidates.find((item) => item.id === id);
            assert.equal(stanza.violationCount, 0, `${id} ${layout}`);
            assert.equal(stanza.missingCount, 0, `${id} ${layout}`);
            assert.equal(candidate.status, id.includes("soratho")
                ? "compatible" : "exact", `${id} ${layout}`);
            assert.equal(Boolean(candidate.compactMatraLayout), layout === "compact");
        }
    }
});

test("recognizes Harigīt, Jhūḷaṇā, and both Savaiyā totals", () => {
    const cases = [
        ["structural:harigit-gujarati", [28]],
        ["structural:jhulana-gujarati", [5, 5, 5, 5, 5, 5, 5, 2]],
        ["structural:savaiya-ekatrisa-gujarati", [4, 4, 4, 4, 4, 4, 4, 3]],
        ["structural:savaiya-batrisa-gujarati", [4, 4, 4, 4, 4, 4, 4, 4]]
    ];

    for (const [id, groups] of cases) {
        const terminalPattern = id.includes("ekatrisa") ? "GL" : "";
        const stanza = selected(Array(4).fill(
            lineForGroups(groups, "gujarati", terminalPattern)
        ).join("\n"), id);
        assert.equal(stanza.violationCount, 0, id);
        assert.equal(stanza.missingCount, 0, id);
        const candidate = stanza.candidates.find((item) => item.id === id);
        assert.notEqual(candidate.status, "approximate", id);
    }
});

test("validates Roḷā, repeatable Kaṭāv, Manhar, and Ghanākṣarī", () => {
    const rolaPadas = [[11], [13], [11], [13]];
    const rola = selected(
        rolaPadas.map((groups) => lineForGroups(groups)).join("\n"),
        "structural:rola-gujarati"
    );
    assert.equal(rola.violationCount, 0);
    assert.equal(rola.missingCount, 0);

    const compactRola = selected(
        Array(2).fill(
            `${lineForGroups([11])}, ${lineForGroups([13])}`
        ).join("\n"),
        "structural:rola-gujarati"
    );
    assert.equal(compactRola.violationCount, 0);
    assert.equal(compactRola.missingCount, 0);

    const katav = selected(
        Array(3).fill(lineForGroups([4, 4, 4, 4])).join("\n"),
        "structural:katav-gujarati"
    );
    assert.equal(katav.violationCount, 0);
    assert.equal(katav.missingCount, 0);

    for (const [id, count] of [
        ["structural:manhar-gujarati", 31],
        ["structural:ghanakshari-gujarati", 32]
    ]) {
        const stanza = selected(
            Array(4).fill(textForPattern("L".repeat(count))).join("\n"),
            id
        );
        assert.equal(stanza.violationCount, 0, id);
        assert.equal(stanza.missingCount, 0, id);
    }
});

test("marks fixed Gujarati terminal violations without moving source ranges", () => {
    const valid = lineForGroups([4, 4, 4]);
    const invalidEnding = textForPattern("LLL");
    const text = Array(4).fill(`${valid} ${invalidEnding}`).join("\n");
    const stanza = selected(text, "structural:chaupai-gujarati");
    const marked = stanza.padas.flatMap((pada) =>
        pada.syllables.filter((syllable) => syllable.violation));

    assert.equal(stanza.missingCount, 0);
    assert.equal(stanza.violationCount, 4);
    assert.equal(marked.length, 4);
    marked.forEach((syllable) => {
        assert.equal(syllable.violationReason, "required-gujarati-chaupai-ending");
        assert.equal(text.slice(syllable.start, syllable.end), syllable.text);
    });
});

test("Gujarati meters never enter Kannada or Devanagari candidate lists", () => {
    const gujaratiIds = new Set(structuralCatalog.meters
        .filter((meter) => meter.scripts && meter.scripts.includes("gujarati"))
        .map((meter) => meter.id));

    for (const script of ["kannada", "devanagari"]) {
        const text = Array(4).fill(
            lineForGroups([4, 4, 4, 3], script)
        ).join("\n");
        const stanza = Chandas.analyzeComposition(text, catalog, {}).stanzas[0];
        assert.ok(stanza.candidates.every((candidate) =>
            !gujaratiIds.has(candidate.id)), script);
    }
});
