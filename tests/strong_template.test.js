/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const Chandas = require("../meter_analysis.js");
const StrongTemplate = require("../strong_template.js");

const catalog = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "mishra.json"), "utf8")
);
const madhu = Chandas.normalizeCatalog(catalog)
    .find((meter) => meter.id === "madhu");

function stanzaFor(text) {
    return Chandas.analyzeComposition(text, catalog).stanzas[0];
}

test("creates fixed-vritta slots without literal placeholders", () => {
    const draft = StrongTemplate.createFixedDraft(
        madhu,
        stanzaFor("ಕ ಕಾ"),
        { catalogVersion: "test", analysisVersion: "test" }
    );

    assert.equal(draft.lines.length, 4);
    assert.deepEqual(draft.lines.map((line) => line.expected), [
        ["L", "L"],
        ["L", "L"],
        ["L", "L"],
        ["L", "L"]
    ]);
    assert.deepEqual(draft.lines[0].slots, ["ಕ ", "ಕಾ"]);
    assert.deepEqual(draft.lines[1].slots, ["", ""]);
    assert.equal(StrongTemplate.serializeDraft(draft), "ಕ ಕಾ");
    assert.doesNotMatch(StrongTemplate.serializeDraft(draft), /[ಲಗ]/);
});

test("retains arbitrary later-position associations while other slots are blank", () => {
    const draft = StrongTemplate.createFixedDraft(
        madhu,
        stanzaFor("ಕ"),
        { catalogVersion: "test", analysisVersion: "test" }
    );
    draft.lines.forEach((line) => {
        line.slots.fill("");
    });
    draft.lines[0].slots[1] = "ಕಾ";
    draft.lines[3].slots[0] = "द";

    assert.equal(draft.lines[0].slots[0], "");
    assert.equal(draft.lines[0].slots[1], "ಕಾ");
    assert.equal(draft.lines[3].slots[0], "द");
    assert.equal(StrongTemplate.serializeDraft(draft), "ಕಾ\n\n\nद");

    const inspection = StrongTemplate.inspectDraft(draft);
    assert.equal(inspection.missingCount, 6);
    assert.equal(inspection.violationCount, 1);
});

test("preserves punctuation and whitespace as authored slot content", () => {
    assert.deepEqual(
        StrongTemplate.authoredUnits("ಕ,  ಕ್ರ।"),
        ["ಕ,  ", "ಕ್ರ।"]
    );
    assert.deepEqual(
        StrongTemplate.authoredUnits("क।  क्र"),
        ["क।  ", "क्र"]
    );
});

test("keeps leading empty verse lines when the first authored pāda is later", () => {
    const stanza = stanzaFor("\n\n\nಕಾ");
    const draft = StrongTemplate.createFixedDraft(
        madhu,
        stanza,
        {
            catalogVersion: "test",
            analysisVersion: "test",
            lineOffset: 3,
            sourceStart: 0
        }
    );

    assert.deepEqual(draft.lines.slice(0, 3).map((line) => line.slots), [
        ["", ""],
        ["", ""],
        ["", ""]
    ]);
    assert.deepEqual(draft.lines[3].slots, ["ಕಾ", ""]);
    assert.equal(draft.sourceStart, 0);
    assert.equal(StrongTemplate.serializeDraft(draft), "\n\n\nಕಾ");
});

test("keeps conjunct onsets intact in supported-script Strong slots", () => {
    assert.deepEqual(
        StrongTemplate.authoredUnits("ಪಾರ್ಥಾಯ ಪ್ರತಿಬೋಧಿತಾಂ"),
        ["ಪಾ", "ರ್ಥಾ", "ಯ ", "ಪ್ರ", "ತಿ", "ಬೋ", "ಧಿ", "ತಾಂ"]
    );
    assert.deepEqual(
        StrongTemplate.authoredUnits("पार्थाय प्रतिबोधिताम्"),
        ["पा", "र्था", "य ", "प्र", "ति", "बो", "धि", "ताम्"]
    );
    assert.deepEqual(
        StrongTemplate.authoredUnits("ನಿಶ್ಚಲ"),
        ["ನಿ", "ಶ್ಚ", "ಲ"]
    );
    assert.deepEqual(
        StrongTemplate.authoredUnits("निश्चल"),
        ["नि", "श्च", "ल"]
    );
    assert.deepEqual(
        StrongTemplate.authoredUnits("పార్థాయ ప్రతిబోధితాం"),
        ["పా", "ర్థా", "య ", "ప్ర", "తి", "బో", "ధి", "తాం"]
    );
    assert.deepEqual(
        StrongTemplate.authoredUnits("నిశ్చల"),
        ["ని", "శ్చ", "ల"]
    );
});

test("classifies visual Strong slots with prosody across conjunct boundaries", () => {
    const draft = {
        version: StrongTemplate.MODEL_VERSION,
        meterId: "test",
        meterName: "test",
        catalogVersion: "test",
        analysisVersion: "test",
        lines: [{
            expected: Array.from("GGGLLGLG"),
            slots: StrongTemplate.authoredUnits("ಪಾರ್ಥಾಯ ಪ್ರತಿಬೋಧಿತಾಂ")
        }]
    };
    const inspection = StrongTemplate.inspectDraft(draft);

    assert.deepEqual(draft.lines[0].slots, [
        "ಪಾ", "ರ್ಥಾ", "ಯ ", "ಪ್ರ", "ತಿ", "ಬೋ", "ಧಿ", "ತಾಂ"
    ]);
    assert.equal(StrongTemplate.serializeDraft(draft), "ಪಾರ್ಥಾಯ ಪ್ರತಿಬೋಧಿತಾಂ");
    assert.equal(inspection.lines[0].pattern, "GGGLLGLG");
    assert.equal(inspection.violationCount, 0);
    assert.equal(inspection.missingCount, 0);
    assert.equal(inspection.lines[0].slots[2].status, "match");
    assert.equal(inspection.lines[0].slots[2].actual, "G");
    assert.equal(inspection.lines[0].slots[3].actual, "L");
});

test("does not infer a conjunct across an intentionally blank Strong slot", () => {
    const draft = {
        version: StrongTemplate.MODEL_VERSION,
        meterId: "test",
        meterName: "test",
        catalogVersion: "test",
        analysisVersion: "test",
        lines: [{
            expected: ["L", "L", "L"],
            slots: ["ಯ", "", "ಪ್ರ"]
        }]
    };
    const inspection = StrongTemplate.inspectDraft(draft);

    assert.deepEqual(
        inspection.lines[0].slots.map((slot) => slot.actual),
        ["L", "", "L"]
    );
    assert.equal(inspection.violationCount, 0);
    assert.equal(inspection.missingCount, 1);
});

test("merges ghost-mode edits back into previously occupied strong positions", () => {
    const draft = StrongTemplate.createFixedDraft(
        madhu,
        stanzaFor("ಕ"),
        { catalogVersion: "test", analysisVersion: "test" }
    );
    draft.lines.forEach((line) => {
        line.slots.fill("");
    });
    draft.lines[0].slots[1] = "ಕ";
    draft.lines[3].slots[0] = "द";

    assert.ok(StrongTemplate.synchronizeFixedDraft(
        draft,
        stanzaFor("ಕಾ\nद")
    ));
    assert.equal(draft.lines[0].slots[0], "");
    assert.equal(draft.lines[0].slots[1], "ಕಾ");
    assert.equal(draft.lines[3].slots[0], "द");
});

test("distributes multiline paste from the selected slot and supports snapshots", () => {
    const draft = StrongTemplate.createFixedDraft(
        madhu,
        stanzaFor("ಕ"),
        { catalogVersion: "test", analysisVersion: "test" }
    );
    draft.lines.forEach((line) => {
        line.slots.fill("");
    });
    const before = StrongTemplate.cloneSlots(draft);
    const finalPosition = StrongTemplate.distributeText(
        draft,
        1,
        1,
        "ಕ ಕಾ\nक का"
    );

    assert.deepEqual(finalPosition, { lineIndex: 2, slotIndex: 1 });
    assert.equal(draft.lines[1].slots[0], "");
    assert.equal(draft.lines[1].slots[1], "ಕ ಕಾ");
    assert.deepEqual(draft.lines[2].slots, ["क ", "का"]);
    const malformed = before.map((slots) => slots.slice());
    malformed[0][0] = { not: "authored text" };
    assert.equal(StrongTemplate.restoreSlots(draft, malformed), false);
    assert.ok(StrongTemplate.restoreSlots(draft, before));
    assert.equal(StrongTemplate.serializeDraft(draft), "");
});
