/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function scansionModule(root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.ChandasScansion = api;
    }
}(typeof window !== "undefined" ? window : globalThis, function createScansionApi() {
    "use strict";

    const MODES = Object.freeze([
        "auto",
        "weights",
        "amsha",
        "matra-35",
        "matra-53",
        "off"
    ]);

    function normalizeMode(value) {
        const mode = String(value || "").trim().toLocaleLowerCase();
        return MODES.includes(mode) ? mode : "auto";
    }

    function matraValue(syllable) {
        return syllable && syllable.classification === "G" ? 2 : 1;
    }

    /*
     * A gait boundary is a point in sung time, so a two-mātrā Guru can span it.
     * In that case the marker stays attached to the complete Unicode syllable and
     * is flagged as crossed; the authored text is never split or marked invalid.
     */
    function scanMatraGait(syllables, cycle) {
        const source = Array.isArray(syllables) ? syllables : [];
        const capacities = (Array.isArray(cycle) ? cycle : [])
            .map(Number)
            .filter((value) => Number.isInteger(value) && value > 0);
        if (!source.length || !capacities.length) {
            return { boundaries: [], groups: [], residual: 0, totalMatras: 0 };
        }

        const cumulative = [];
        let totalMatras = 0;
        source.forEach((syllable) => {
            totalMatras += matraValue(syllable);
            cumulative.push(totalMatras);
        });

        const boundaries = [];
        const groups = [];
        let target = 0;
        let cycleIndex = 0;
        let syllableIndex = 0;
        let groupStartIndex = 0;
        while (true) {
            const capacity = capacities[cycleIndex % capacities.length];
            target += capacity;
            if (target > totalMatras) {
                break;
            }
            while (syllableIndex < cumulative.length &&
                cumulative[syllableIndex] < target) {
                syllableIndex += 1;
            }
            const syllable = source[syllableIndex];
            if (!syllable) {
                break;
            }
            const boundary = {
                position: syllable.end,
                capacity,
                target,
                crossed: cumulative[syllableIndex] > target
            };
            boundaries.push(boundary);
            groups.push({
                start: source[groupStartIndex].start,
                end: syllable.end,
                label: String(capacity),
                kind: "matra",
                crossed: boundary.crossed
            });
            groupStartIndex = syllableIndex + 1;
            cycleIndex += 1;
        }

        return {
            boundaries,
            groups,
            residual: totalMatras - (boundaries.at(-1)?.target || 0),
            totalMatras
        };
    }

    function amshaGroups(groupRanges) {
        const lines = Array.isArray(groupRanges) ? groupRanges : [];
        return lines.flatMap((groups) => (Array.isArray(groups) ? groups : []))
            .filter((group) => Number.isFinite(group.start) &&
                Number.isFinite(group.end) && group.end > group.start)
            .map((group) => ({
                start: group.start,
                end: group.end,
                label: String(group.actualClass || group.expectedClass || "?"),
                kind: "amsha",
                substituted: Boolean(group.isSubstitution)
            }));
    }

    return {
        MODES,
        amshaGroups,
        matraValue,
        normalizeMode,
        scanMatraGait
    };
}));
