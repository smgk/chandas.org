/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function englishComposerModule(root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.ChandasEnglishComposer = api;
    }
}(typeof window !== "undefined" ? window : globalThis,
    function createEnglishComposerApi() {
        "use strict";

        function parseStanzas(text) {
            const source = String(text || "");
            const stanzas = [];
            const separator = /\n[\t ]*\n+/g;
            let start = 0;
            let match;

            function append(end) {
                const raw = source.slice(start, end);
                const leading = raw.search(/\S/);
                if (leading < 0) {
                    return;
                }
                const trailingWhitespace = /\s*$/.exec(raw)[0].length;
                const stanzaStart = start + leading;
                const stanzaEnd = end - trailingWhitespace;
                stanzas.push({
                    index: stanzas.length,
                    start: stanzaStart,
                    end: stanzaEnd,
                    text: source.slice(stanzaStart, stanzaEnd)
                });
            }

            while ((match = separator.exec(source))) {
                append(match.index);
                start = match.index + match[0].length;
            }
            append(source.length);
            return stanzas;
        }

        function normalizeMeters(catalog) {
            if (!catalog || catalog.analysisSystem !== "english-stress" ||
                !Array.isArray(catalog.meters)) {
                throw new Error("Invalid English meter catalog");
            }
            return catalog.meters.map((meter) => ({
                ...meter,
                kind: "english",
                patterns: [["accentual", "sprung"].includes(meter.analysisMode)
                    ? "S".repeat(meter.beats)
                    : meter.pattern.repeat(meter.feet)],
                linePolicy: {
                    type: "repeating",
                    unit: "line",
                    min: 1,
                    previewCount: 1
                }
            }));
        }

        function aggregateMatchLevel(lines) {
            const levels = lines.map((line) => line.matchLevel);
            if (levels.includes("approximate")) {
                return "approximate";
            }
            if (levels.includes("incomplete")) {
                return "incomplete";
            }
            if (levels.length && levels.every((level) => level === "exact")) {
                return "exact";
            }
            return "compatible";
        }

        const MATCH_LEVEL_RANK = Object.freeze({
            exact: 0,
            compatible: 1,
            incomplete: 2,
            approximate: 3
        });

        function compareComposerCandidates(left, right) {
            // effectiveScore already includes completion, family, and
            // prominence priors. Rank by that evidence before the coarse
            // human-facing label so a generic accentual "exact" does not
            // outrank a materially stronger named-foot reading.
            return (left.effectiveScore ?? left.score ?? Infinity) -
                    (right.effectiveScore ?? right.score ?? Infinity) ||
                (MATCH_LEVEL_RANK[left.matchLevel] ?? 4) -
                    (MATCH_LEVEL_RANK[right.matchLevel] ?? 4) ||
                (left.missingCount || 0) - (right.missingCount || 0) ||
                String(left.id).localeCompare(String(right.id));
        }

        function candidateView(candidate, meter) {
            const lines = candidate.lines || [];
            const activeLine = lines.at(-1) || null;
            const matchLevel = aggregateMatchLevel(lines);
            const missingCount = lines.reduce((sum, line) =>
                sum + line.missingCount, 0);
            const extraCount = lines.reduce((sum, line) =>
                sum + line.extraCount, 0);
            const deviationCount = lines.reduce((sum, line) =>
                sum + line.deviations.length, 0);
            const guessedWords = Array.from(new Set(lines.flatMap((line) =>
                line.guessedWords || [])));
            return {
                ...candidate,
                kind: "english",
                aliases: meter.aliases || [],
                prominence: meter.prominence || 0,
                patterns: [["accentual", "sprung"].includes(meter.analysisMode)
                    ? "S".repeat(meter.beats)
                    : meter.pattern.repeat(meter.feet)],
                analysisMode: meter.analysisMode || "accentual-syllabic",
                beats: meter.beats || meter.feet,
                matchLevel,
                status: matchLevel,
                missingCount,
                extraCount,
                deviationCount,
                guessedWords,
                guessedWordCount: guessedWords.length,
                observedSyllables: activeLine ? activeLine.syllables.length : 0,
                expectedSyllables: ["accentual", "sprung"].includes(meter.analysisMode)
                    ? null
                    : activeLine ? activeLine.expectedPattern.length :
                        meter.pattern.length * meter.feet,
                activeLine,
                confidence: guessedWords.length || matchLevel === "approximate"
                    ? "low"
                    : lines.every((line) => line.confidence === "high")
                        ? "high"
                        : "medium"
            };
        }

        function bestAllowedCandidate(line, meterIds) {
            const allowed = new Set(meterIds || []);
            return [...(line.candidates || [])]
                .filter((candidate) => allowed.has(candidate.id))
                .sort((left, right) =>
                    (MATCH_LEVEL_RANK[left.matchLevel] ?? 4) -
                        (MATCH_LEVEL_RANK[right.matchLevel] ?? 4) ||
                    compareComposerCandidates(left, right))[0] || null;
        }

        function chosenLineCandidate(line, selectedMeterId, formMeterIds,
            dominantMeterId) {
            if (selectedMeterId) {
                return line.candidates.find((candidate) =>
                    candidate.id === selectedMeterId) || line.bestCandidate;
            }
            const formCandidate = bestAllowedCandidate(line, formMeterIds);
            if (formCandidate) {
                return formCandidate;
            }
            if (dominantMeterId) {
                const dominant = line.candidates.find((candidate) =>
                    candidate.id === dominantMeterId);
                if (dominant && ["exact", "compatible", "incomplete"]
                    .includes(dominant.matchLevel)) {
                    return dominant;
                }
            }
            return [...line.candidates].sort(compareComposerCandidates)[0] ||
                line.bestCandidate;
        }

        function lineView(line, selectedMeterId, index, options) {
            const formMeterIds = options && options.formMeterIds;
            const formSelected = Boolean(formMeterIds && formMeterIds.length);
            const chosen = chosenLineCandidate(
                line,
                selectedMeterId,
                formMeterIds,
                options && options.dominantMeterId
            );
            const validates = Boolean(selectedMeterId || formSelected);
            const hardDeviations = new Set((validates && chosen
                ? chosen.deviations || []
                : [])
                .map((item) => `${item.syllable.start}:${item.syllable.end}`));
            const syllables = (chosen && chosen.syllables || []).map((syllable) => ({
                ...syllable,
                script: "english",
                violation: hardDeviations.has(`${syllable.start}:${syllable.end}`),
                uncertain: syllable.pronunciationConfidence === "guessed" ||
                    syllable.alignmentConfidence === "low"
            }));
            return {
                ...line,
                index,
                syllables,
                pattern: chosen ? chosen.observedLexicalPattern : "",
                expectedPattern: chosen ? chosen.expectedPattern : "",
                stressCount: syllables.filter((syllable) =>
                    syllable.lexicalStress > 0).length,
                chosenCandidate: chosen,
                selectedCandidate: selectedMeterId ? chosen : null,
                formTargetCandidate: formSelected ? chosen : null,
                validationCandidate: validates ? chosen : null
            };
        }

        function formMeterChoices(form, lineIndex) {
            if (!form || ["advisory", "custom"].includes(form.meterPolicy)) {
                return [];
            }
            if (form.repeatMeterSequence) {
                return form.meterSequence[lineIndex % form.meterSequence.length] || [];
            }
            return form.meterSequence[lineIndex] || [];
        }

        function analyze(text, selections, lexicon, catalog, engine, formTools) {
            if (!engine || typeof engine.analyzeComposition !== "function") {
                throw new Error("English analysis engine is unavailable");
            }
            const source = String(text || "");
            const meters = normalizeMeters(catalog);
            const meterById = new Map(meters.map((meter) => [meter.id, meter]));
            const segments = [];
            const unsupported = [];
            const seenUnsupported = new Set();
            const stanzas = parseStanzas(source).map((frame) => {
                const selectedMeterId = meterById.has(selections[frame.index])
                    ? selections[frame.index]
                    : "";
                const selectedFormId = formTools && formTools.selectedForms
                    ? formTools.selectedForms[frame.index] || ""
                    : "";
                const selectedForm = formTools && formTools.catalog
                    ? formTools.catalog.forms.find((form) =>
                        form.id === selectedFormId) || null
                    : null;
                const result = engine.analyzeComposition(
                    frame.text,
                    lexicon,
                    catalog,
                    {
                        offset: frame.start,
                        selectedMeterId,
                        partialLastLine: true,
                        overrides: formTools && formTools.overrides
                    }
                );
                const lines = result.lines.map((line, index) =>
                    lineView(line, selectedMeterId, index, {
                        formMeterIds: formMeterChoices(selectedForm, index),
                        dominantMeterId: result.bestCandidate &&
                            result.bestCandidate.id
                    }));
                lines.forEach((line) => {
                    segments.push(...line.syllables);
                    (line.chosenCandidate && line.chosenCandidate.words || [])
                        .filter((word) =>
                            word.pronunciationConfidence === "guessed")
                        .forEach((word) => {
                            const key = `${word.start}:${word.end}`;
                            if (!seenUnsupported.has(key)) {
                                seenUnsupported.add(key);
                                unsupported.push({
                                    start: word.start,
                                    end: word.end,
                                    reason: "guessed-pronunciation",
                                    text: word.text
                                });
                            }
                        });
                });
                const candidates = result.candidates.map((candidate) =>
                    candidateView(candidate, meterById.get(candidate.id)))
                    .sort(compareComposerCandidates);
                const selectedCandidate = selectedMeterId
                    ? candidates.find((candidate) => candidate.id === selectedMeterId) || null
                    : null;
                const selectedMeter = selectedMeterId
                    ? meterById.get(selectedMeterId) || null
                    : null;
                const violationCount = lines.reduce((sum, line) =>
                    sum + line.syllables.filter((syllable) => syllable.violation).length,
                0);
                const formAnalysis = formTools && formTools.engine &&
                    formTools.rhymeLexicon && formTools.catalog
                    ? formTools.engine.analyzeStanza(
                        lines,
                        formTools.rhymeLexicon,
                        formTools.catalog,
                        {
                            selectedFormId,
                            rhymeOverrides: formTools.rhymeOverrides,
                            readingProfile: formTools.readingProfile
                        }
                    )
                    : null;
                return {
                    ...frame,
                    lines,
                    scripts: ["english"],
                    patterns: lines.map((line) => line.pattern),
                    matraPattern: [],
                    candidates,
                    selectedMeterId,
                    selectedMeter,
                    selectedCandidate,
                    violationCount,
                    missingCount: selectedCandidate ? selectedCandidate.missingCount : 0,
                    guessedWordCount: lines.reduce((sum, line) =>
                        sum + (line.chosenCandidate
                            ? line.chosenCandidate.guessedWordCount
                            : 0), 0),
                    ambiguous: result.ambiguous,
                    nearTies: result.nearTies,
                    dominantFeet: result.dominantFeet,
                    bestCandidate: candidates[0] || null,
                    rhyme: formAnalysis ? formAnalysis.rhyme : null,
                    alliteration: formAnalysis ? formAnalysis.alliteration : [],
                    forms: formAnalysis ? formAnalysis.forms : [],
                    bestForm: formAnalysis ? formAnalysis.bestForm : null,
                    selectedForm: formAnalysis ? formAnalysis.selectedForm : null,
                    formProgress: formAnalysis ? formAnalysis.formProgress : null
                };
            });
            return {
                analysisVersion: "english-stress-3.0.0",
                analysisSystem: "english-stress",
                text: source,
                stanzas,
                segments,
                unsupported
            };
        }

        return {
            aggregateMatchLevel,
            analyze,
            normalizeMeters,
            parseStanzas
        };
    }));
