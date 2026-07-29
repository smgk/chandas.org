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
    assert.equal(StrongTemplate.serializeDraft(draft), "ಕಾ\nद");

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
