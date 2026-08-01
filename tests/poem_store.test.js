/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
    BACKUP_FORMAT,
    defaultTitle,
    makeBackup,
    mergePoems,
    normalizePoem,
    parseBackup
} = require("../poem_store.js");

function poem(overrides) {
    return normalizePoem({
        id: "one",
        text: "\nಕಾವ್ಯ\nಪದ್ಯ",
        selections: { 0: "madhu" },
        templates: { 0: true },
        templateModes: { 0: "strong" },
        strongDrafts: { "0:madhu": { slots: [["ಕ", ""]] } },
        language: "kn",
        selectionStart: 2,
        selectionEnd: 2,
        createdAt: "2026-07-30T10:00:00.000Z",
        updatedAt: "2026-07-31T10:00:00.000Z",
        revision: 3,
        ...overrides
    });
}

test("normalizes Unicode poems without losing newlines or Strong blank slots", () => {
    const value = poem();
    assert.equal(value.text, "\nಕಾವ್ಯ\nಪದ್ಯ");
    assert.deepEqual(value.strongDrafts["0:madhu"].slots, [["ಕ", ""]]);
    assert.equal(defaultTitle(value.text), "ಕಾವ್ಯ");
});

test("exports and parses a portable versioned backup", () => {
    const backup = makeBackup([poem()]);
    assert.equal(backup.format, BACKUP_FORMAT);
    assert.equal(backup.version, 1);
    const restored = parseBackup(JSON.stringify(backup));
    assert.equal(restored.length, 1);
    assert.equal(restored[0].text, "\nಕಾವ್ಯ\nಪದ್ಯ");
    assert.deepEqual(restored[0].selections, { 0: "madhu" });
});

test("rejects foreign, malformed, and duplicate-id backups", () => {
    assert.throws(() => parseBackup("not json"), /valid JSON/);
    assert.throws(() => parseBackup(JSON.stringify({ format: "foreign", poems: [] })),
        /supported Chandas/);
    const backup = makeBackup([poem(), poem()]);
    assert.throws(() => parseBackup(JSON.stringify(backup)), /duplicate poem/);
});

test("safe merge skips identical poems and preserves conflicting versions", () => {
    const local = poem();
    const identical = mergePoems([local], [local], () => "copy-id");
    assert.deepEqual(identical, { additions: [], skipped: 1, conflicts: 0 });

    const conflict = mergePoems(
        [local],
        [poem({ text: "ಬೇರೆಯ ಪದ್ಯ" })],
        () => "copy-id"
    );
    assert.equal(conflict.additions.length, 1);
    assert.equal(conflict.additions[0].id, "copy-id");
    assert.equal(conflict.additions[0].text, "ಬೇರೆಯ ಪದ್ಯ");
    assert.match(conflict.additions[0].title, /imported copy/);
    assert.equal(conflict.conflicts, 1);

    const repeated = mergePoems(
        [local, conflict.additions[0]],
        [poem({ text: "ಬೇರೆಯ ಪದ್ಯ" })],
        () => "another-copy"
    );
    assert.deepEqual(repeated, { additions: [], skipped: 1, conflicts: 0 });
});
