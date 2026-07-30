/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function strongTemplateModule(root, factory) {
    "use strict";

    const api = factory(
        typeof module === "object" && module.exports
            ? require("./meter_analysis.js")
            : root.Chandas
    );
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.ChandasStrongTemplate = api;
    }
}(typeof globalThis !== "undefined" ? globalThis : this, function buildStrongTemplate(Chandas) {
    "use strict";

    const MODEL_VERSION = 3;

    function fixedPatterns(meter) {
        if (!meter || meter.kind !== "fixed") {
            return [];
        }
        if (Array.isArray(meter.versePatterns) && meter.versePatterns.length) {
            return meter.versePatterns.slice();
        }
        return Chandas.expandFixedVersePatterns(
            meter.patterns || [],
            meter.linePolicy && meter.linePolicy.count
        );
    }

    function authoredUnits(text, absoluteOffset, forcedScript) {
        const source = String(text || "");
        if (!source) {
            return [];
        }
        const offset = Number.isFinite(absoluteOffset) ? absoluteOffset : 0;
        const segmented = Chandas.segmentLine(source, offset, forcedScript);
        if (!segmented.syllables.length) {
            return [source];
        }

        // Prosodic segmentation assigns a consonant+virāma coda to the
        // preceding syllable: ಪಾರ್ಥಾ scans as ಪಾರ್ + ಥಾ. Strong-mode boxes
        // are visual editing units, so the same text must be displayed as
        // ಪಾ + ರ್ಥಾ to keep the shaped conjunct intact. The highlight
        // projector already finds that shaping-safe boundary on both Kannada
        // and Devanagari, including Safari's finer grapheme behavior.
        const starts = segmented.syllables.map((syllable) => {
            const localStart = syllable.start - offset;
            const projected = Chandas.projectHighlightRanges(source, [{
                start: localStart,
                end: source.length
            }]);
            return projected.length ? projected[0].start : localStart;
        });

        return starts.map((start, index) =>
            source.slice(start, starts[index + 1] ?? source.length));
    }

    function placeUnits(slotCount, units) {
        const slots = Array.from({ length: slotCount }, () => "");
        if (!slotCount || !units.length) {
            return slots;
        }
        units.forEach((unit, index) => {
            const target = Math.min(index, slotCount - 1);
            slots[target] += unit;
        });
        return slots;
    }

    function createFixedDraft(meter, stanza, metadata) {
        const patterns = fixedPatterns(meter);
        if (!patterns.length) {
            return null;
        }
        const stanzaLines = stanza && Array.isArray(stanza.lines) ? stanza.lines : [];
        const lineOffset = Math.max(
            0,
            Math.min(
                Number(metadata && metadata.lineOffset) || 0,
                patterns.length - 1
            )
        );
        const lines = patterns.map((pattern, lineIndex) => {
            const sourceLine = stanzaLines[lineIndex - lineOffset];
            const units = sourceLine
                ? authoredUnits(sourceLine.text, sourceLine.start, sourceLine.script)
                : [];
            return {
                expected: Array.from(pattern),
                slots: placeUnits(pattern.length, units)
            };
        });

        if (stanzaLines.length > lines.length && lines.length) {
            const overflow = stanzaLines.slice(lines.length)
                .map((line) => line.text)
                .join("\n");
            const finalSlots = lines.at(-1).slots;
            finalSlots[finalSlots.length - 1] +=
                `${finalSlots[finalSlots.length - 1] ? "\n" : ""}${overflow}`;
        }

        return {
            version: MODEL_VERSION,
            meterId: meter.id,
            meterName: meter.name,
            catalogVersion: String(metadata && metadata.catalogVersion || ""),
            analysisVersion: String(metadata && metadata.analysisVersion || ""),
            sourceStart: Number.isFinite(metadata && metadata.sourceStart)
                ? metadata.sourceStart
                : Number(stanza && stanza.start) || 0,
            lines
        };
    }

    function isCompatibleDraft(draft, meter) {
        const patterns = fixedPatterns(meter);
        return Boolean(
            draft &&
            draft.version === MODEL_VERSION &&
            draft.meterId === meter.id &&
            Array.isArray(draft.lines) &&
            draft.lines.length === patterns.length &&
            draft.lines.every((line, lineIndex) =>
                Array.isArray(line.slots) &&
                line.slots.length === patterns[lineIndex].length &&
                line.slots.every((value) => typeof value === "string") &&
                Array.isArray(line.expected) &&
                line.expected.join("") === patterns[lineIndex])
        );
    }

    function synchronizeFixedDraft(draft, stanza) {
        if (!draft || !stanza || !Array.isArray(stanza.lines)) {
            return false;
        }
        const occupiedByLine = draft.lines.map((line) =>
            line.slots.flatMap((value, index) => value ? [index] : []));
        const previouslyAuthoredLines = occupiedByLine
            .flatMap((occupied, index) => occupied.length ? [index] : []);
        const availableLines = draft.lines.map((_, index) => index);
        const chosenLines = new Set();
        const targetLines = stanza.lines.map((_, index) => {
            const preferred = previouslyAuthoredLines[index];
            const target = preferred !== undefined
                ? preferred
                : availableLines.find((lineIndex) => !chosenLines.has(lineIndex));
            chosenLines.add(target);
            return target;
        });

        draft.lines.forEach((line) => {
            line.slots.fill("");
        });
        stanza.lines.forEach((sourceLine, sourceIndex) => {
            const targetLineIndex = targetLines[sourceIndex];
            const targetLine = draft.lines[targetLineIndex];
            if (!targetLine) {
                const fallback = draft.lines.at(-1);
                fallback.slots[fallback.slots.length - 1] +=
                    `${fallback.slots.at(-1) ? "\n" : ""}${sourceLine.text}`;
                return;
            }
            const units = authoredUnits(
                sourceLine.text,
                sourceLine.start,
                sourceLine.script
            );
            const occupied = occupiedByLine[targetLineIndex];
            const targets = occupied.concat(
                targetLine.slots
                    .map((_, index) => index)
                    .filter((index) => !occupied.includes(index))
            );
            units.forEach((unit, unitIndex) => {
                const slotIndex = targets[Math.min(unitIndex, targets.length - 1)];
                const overflowed = unitIndex >= targets.length;
                targetLine.slots[slotIndex] = overflowed
                    ? `${targetLine.slots[slotIndex]}${unit}`
                    : unit;
            });
        });
        return true;
    }

    function cloneSlots(draft) {
        return draft.lines.map((line) => line.slots.slice());
    }

    function restoreSlots(draft, snapshot) {
        if (!draft || !Array.isArray(snapshot) ||
            snapshot.length !== draft.lines.length) {
            return false;
        }
        for (let lineIndex = 0; lineIndex < draft.lines.length; lineIndex += 1) {
            if (!Array.isArray(snapshot[lineIndex]) ||
                snapshot[lineIndex].length !== draft.lines[lineIndex].slots.length ||
                snapshot[lineIndex].some((value) => typeof value !== "string")) {
                return false;
            }
        }
        snapshot.forEach((slots, lineIndex) => {
            draft.lines[lineIndex].slots = slots.slice();
        });
        return true;
    }

    function serializeDraft(draft) {
        if (!draft || !Array.isArray(draft.lines)) {
            return "";
        }
        const lines = draft.lines.map((line) => line.slots.join(""));
        let finalAuthoredLine = lines.length - 1;
        while (finalAuthoredLine >= 0 && lines[finalAuthoredLine].length === 0) {
            finalAuthoredLine -= 1;
        }
        return lines.slice(0, finalAuthoredLine + 1).join("\n");
    }

    function inspectSlot(value, expected) {
        const source = String(value || "");
        const segmented = Chandas.segmentLine(source, 0);
        const syllables = segmented.syllables;
        if (!source.length) {
            return {
                status: "empty",
                actual: "",
                matras: 0,
                syllableCount: 0
            };
        }
        if (syllables.length !== 1) {
            return {
                status: "invalid",
                actual: syllables.map((item) => item.classification).join(""),
                matras: syllables.reduce(
                    (sum, item) => sum + (item.classification === Chandas.GURU ? 2 : 1),
                    0
                ),
                syllableCount: syllables.length
            };
        }
        const actual = syllables[0].classification;
        return {
            status: actual === expected ? "match" : "mismatch",
            actual,
            matras: actual === Chandas.GURU ? 2 : 1,
            syllableCount: 1
        };
    }

    function inspectLineSlots(line) {
        const slots = line.slots.map((value, index) =>
            inspectSlot(value, line.expected[index]));
        let start = 0;

        while (start < line.slots.length) {
            if (!line.slots[start]) {
                start += 1;
                continue;
            }

            let end = start + 1;
            while (end < line.slots.length && line.slots[end]) {
                end += 1;
            }

            const authored = line.slots.slice(start, end);
            const source = authored.join("");
            const syllables = Chandas.segmentLine(source, 0).syllables;
            const visualUnits = authoredUnits(source, 0);
            const aligned = visualUnits.length === authored.length &&
                visualUnits.every((unit, index) => unit === authored[index]);
            if (aligned && syllables.length === authored.length) {
                syllables.forEach((syllable, index) => {
                    const slotIndex = start + index;
                    const actual = syllable.classification;
                    slots[slotIndex] = {
                        status: actual === line.expected[slotIndex]
                            ? "match"
                            : "mismatch",
                        actual,
                        matras: actual === Chandas.GURU ? 2 : 1,
                        syllableCount: 1
                    };
                });
            }

            start = end;
        }

        return slots;
    }

    function inspectDraft(draft) {
        const lines = draft.lines.map((line) => {
            const slots = inspectLineSlots(line);
            return {
                pattern: slots.map((slot) => slot.actual || "○").join(""),
                matras: slots.reduce((sum, slot) => sum + slot.matras, 0),
                slots
            };
        });
        return {
            lines,
            missingCount: lines.flatMap((line) => line.slots)
                .filter((slot) => slot.status === "empty").length,
            violationCount: lines.flatMap((line) => line.slots)
                .filter((slot) =>
                    slot.status === "mismatch" || slot.status === "invalid").length
        };
    }

    function distributeText(draft, startLine, startSlot, text) {
        const sourceLines = String(text || "").split(/\r?\n/);
        let finalPosition = { lineIndex: startLine, slotIndex: startSlot };

        sourceLines.forEach((sourceLine, sourceLineIndex) => {
            const lineIndex = startLine + sourceLineIndex;
            const line = draft.lines[lineIndex];
            if (!line) {
                const fallback = draft.lines.at(-1);
                fallback.slots[fallback.slots.length - 1] +=
                    `${fallback.slots.at(-1) ? "\n" : ""}${sourceLine}`;
                finalPosition = {
                    lineIndex: draft.lines.length - 1,
                    slotIndex: fallback.slots.length - 1
                };
                return;
            }
            const firstSlot = sourceLineIndex === 0 ? startSlot : 0;
            const units = authoredUnits(sourceLine, 0);
            if (!units.length) {
                return;
            }
            units.forEach((unit, unitIndex) => {
                const target = Math.min(firstSlot + unitIndex, line.slots.length - 1);
                const hasOverflowed = firstSlot + unitIndex >= line.slots.length;
                line.slots[target] = hasOverflowed
                    ? `${line.slots[target] || ""}${unit}`
                    : unit;
                finalPosition = { lineIndex, slotIndex: target };
            });
        });
        return finalPosition;
    }

    return {
        MODEL_VERSION,
        authoredUnits,
        cloneSlots,
        createFixedDraft,
        distributeText,
        fixedPatterns,
        inspectDraft,
        inspectSlot,
        isCompatibleDraft,
        restoreSlots,
        serializeDraft,
        synchronizeFixedDraft
    };
}));
