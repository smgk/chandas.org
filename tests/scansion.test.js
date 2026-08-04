/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Scansion = require("../scansion.js");

function syllables(pattern) {
    return Array.from(pattern, (classification, index) => ({
        classification,
        start: index,
        end: index + 1
    }));
}

test("projects the Rathoddhatā pattern onto an exact 3+5 gait", () => {
    const scan = Scansion.scanMatraGait(
        syllables("GLGLLLGLGLG"),
        [3, 5]
    );

    assert.deepEqual(scan.boundaries.map((boundary) => ({
        position: boundary.position,
        crossed: boundary.crossed
    })), [
        { position: 2, crossed: false },
        { position: 6, crossed: false },
        { position: 8, crossed: false },
        { position: 11, crossed: false }
    ]);
    assert.deepEqual(scan.groups, [
        { start: 0, end: 2, label: "3", kind: "matra", crossed: false },
        { start: 2, end: 6, label: "5", kind: "matra", crossed: false },
        { start: 6, end: 8, label: "3", kind: "matra", crossed: false },
        { start: 8, end: 11, label: "5", kind: "matra", crossed: false }
    ]);
    assert.equal(scan.totalMatras, 16);
    assert.equal(scan.residual, 0);
});

test("retains the requested x remainder after repeated 3+5 groups", () => {
    const scan = Scansion.scanMatraGait(syllables("L".repeat(25)), [3, 5]);

    assert.deepEqual(
        scan.boundaries.map((boundary) => boundary.target),
        [3, 8, 11, 16, 19, 24]
    );
    assert.equal(scan.residual, 1);
});

test("keeps a Guru intact when a rhythmic boundary crosses it", () => {
    const scan = Scansion.scanMatraGait(syllables("GG"), [3]);

    assert.equal(scan.boundaries.length, 1);
    assert.equal(scan.boundaries[0].position, 2);
    assert.equal(scan.boundaries[0].crossed, true);
    assert.equal(scan.residual, 1);
});

test("turns realized aṃśagaṇa ranges into labelled groups", () => {
    const groups = Scansion.amshaGroups([[
        { start: 0, end: 3, expectedClass: "V", actualClass: "V" },
        {
            start: 3,
            end: 7,
            expectedClass: "V",
            actualClass: "R",
            isSubstitution: true
        }
    ]]);

    assert.deepEqual(groups, [
        {
            start: 0,
            end: 3,
            label: "V",
            kind: "amsha",
            substituted: false
        },
        {
            start: 3,
            end: 7,
            label: "R",
            kind: "amsha",
            substituted: true
        }
    ]);
});

test("normalizes unknown saved and URL modes safely to Auto", () => {
    assert.equal(Scansion.normalizeMode("matra-53"), "matra-53");
    assert.equal(Scansion.normalizeMode("future-mode"), "auto");
});
