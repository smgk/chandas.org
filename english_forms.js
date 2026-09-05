/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function englishFormsModule(root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.ChandasEnglishForms = api;
    }
}(typeof window !== "undefined" ? window : globalThis,
    function createEnglishFormsApi() {
        "use strict";

        const MATCH_COST = Object.freeze({
            exact: 0,
            compatible: 0.12,
            incomplete: 0.8,
            approximate: 0.65
        });

        function normalizeWord(value) {
            return String(value || "")
                .normalize("NFKD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[’‘]/g, "'")
                .toLocaleLowerCase("en-US");
        }

        function validateRhymeDocument(document) {
            if (!document || document.schemaVersion !== 1 ||
                document.representation !== "final-stressed-vowel-rime" ||
                !Array.isArray(document.entries)) {
                throw new Error("Invalid English rhyme dictionary");
            }
            return document;
        }

        function createRhymeLexicon(document) {
            validateRhymeDocument(document);
            const entries = new Map();
            for (const entry of document.entries) {
                if (!Array.isArray(entry) || typeof entry[0] !== "string" ||
                    !Array.isArray(entry[1])) {
                    continue;
                }
                const records = entry[1].filter((record) =>
                    Array.isArray(record) && typeof record[0] === "string" &&
                    Number.isInteger(record[1]) && record[1] >= 0)
                    .map((record) => ({ key: record[0], trailing: record[1] }));
                if (records.length) {
                    entries.set(entry[0], records);
                }
            }
            return {
                metadata: {
                    accent: document.accent,
                    source: document.source,
                    counts: document.counts
                },
                entries
            };
        }

        function validateCatalog(catalog) {
            if (!catalog || catalog.analysisSystem !== "english-form" ||
                !Array.isArray(catalog.forms) || !catalog.forms.length) {
                throw new Error("Invalid English form catalog");
            }
            const ids = new Set();
            for (const form of catalog.forms) {
                if (!form.id || !form.name || ids.has(form.id) ||
                    !form.lineCount ||
                    (form.meterPolicy !== "advisory" &&
                        (!Array.isArray(form.meterSequence) ||
                            !form.meterSequence.length))) {
                    throw new Error(`Invalid English form: ${form.id || "(missing id)"}`);
                }
                ids.add(form.id);
            }
            for (const form of catalog.forms) {
                if (form.suppressedBy && !ids.has(form.suppressedBy)) {
                    throw new Error(`Unknown suppressing form: ${form.suppressedBy}`);
                }
                if (form.beatSequence &&
                    (!Array.isArray(form.beatSequence) ||
                        !Array.isArray(form.meterSequence) ||
                        form.beatSequence.length !== form.meterSequence.length ||
                        form.beatSequence.some((beat) =>
                            !Number.isInteger(beat) || beat < 1))) {
                    throw new Error(`Invalid beat sequence: ${form.id}`);
                }
            }
            return catalog;
        }

        function lookupRecords(word, lexicon) {
            const normalized = normalizeWord(word);
            const direct = lexicon.entries.get(normalized);
            if (direct) {
                return direct;
            }
            if (normalized.endsWith("'s")) {
                return lexicon.entries.get(normalized.slice(0, -2)) || null;
            }
            return null;
        }

        function recordsIntersect(left, right) {
            const rightKeys = new Set(right.map((record) => record.key));
            return left.some((record) => rightKeys.has(record.key));
        }

        function phonemeParts(record) {
            return String(record && record.key || "").split(".").filter(Boolean);
        }

        function slantRhymeKind(left, right) {
            for (const leftRecord of left || []) {
                const leftParts = phonemeParts(leftRecord);
                for (const rightRecord of right || []) {
                    const rightParts = phonemeParts(rightRecord);
                    if (!leftParts.length || !rightParts.length) {
                        continue;
                    }
                    if (leftParts[0] === rightParts[0]) {
                        return "assonance";
                    }
                    if (leftParts.at(-1) === rightParts.at(-1)) {
                        return "consonance";
                    }
                }
            }
            return "";
        }

        function spellingRime(word) {
            const normalized = normalizeWord(word).replace(/[^a-z]/g, "");
            const vowel = Math.max(
                normalized.lastIndexOf("a"),
                normalized.lastIndexOf("e"),
                normalized.lastIndexOf("i"),
                normalized.lastIndexOf("o"),
                normalized.lastIndexOf("u"),
                normalized.lastIndexOf("y")
            );
            return vowel >= 0 ? normalized.slice(vowel) : normalized.slice(-2);
        }

        function overridePairKey(left, right) {
            return [left.start, right.start].sort((a, b) => a - b).join(":");
        }

        function rhymeKind(records) {
            if (!records || !records.length) {
                return "unknown";
            }
            const kinds = new Set(records.map((record) =>
                record.trailing > 0 ? "feminine" : "masculine"));
            return kinds.size === 1 ? [...kinds][0] : "ambiguous";
        }

        function schemeLabel(index) {
            const letter = String.fromCharCode(65 + (index % 26));
            return index < 26 ? letter : `${letter}${Math.floor(index / 26)}`;
        }

        function analyzeRhymes(lines, lexicon, options) {
            const groups = [];
            const endings = (lines || []).map((line, lineIndex) => {
                const token = line.tokens && line.tokens.at(-1);
                const word = token ? token.text : "";
                const records = token ? lookupRecords(token.normalized || word, lexicon) : null;
                if (!records) {
                    return {
                        line: lineIndex + 1,
                        word,
                        start: token ? token.start : line.end,
                        end: token ? token.end : line.end,
                        label: "?",
                        confidence: "unknown",
                        kind: "unknown",
                        keys: []
                    };
                }
                const matches = groups.map((group, index) =>
                    recordsIntersect(records, group.records) ? index : -1)
                    .filter((index) => index >= 0);
                const groupIndex = matches.length ? matches[0] : groups.length;
                if (!groups[groupIndex]) {
                    groups[groupIndex] = { records: [...records], lines: [] };
                } else {
                    const known = new Set(groups[groupIndex].records.map((item) =>
                        `${item.key}|${item.trailing}`));
                    records.forEach((record) => {
                        const key = `${record.key}|${record.trailing}`;
                        if (!known.has(key)) {
                            known.add(key);
                            groups[groupIndex].records.push(record);
                        }
                    });
                }
                groups[groupIndex].lines.push(lineIndex + 1);
                return {
                    line: lineIndex + 1,
                    word,
                    start: token.start,
                    end: token.end,
                    label: schemeLabel(groupIndex),
                    confidence: matches.length > 1 ? "ambiguous" : "dictionary",
                    kind: rhymeKind(records),
                    keys: records.map((record) => record.key)
                };
            });
            const repeatedGroups = groups.filter((group) => group.lines.length > 1);
            const relations = [];
            for (let leftIndex = 0; leftIndex < endings.length; leftIndex += 1) {
                for (let rightIndex = leftIndex + 1;
                    rightIndex < endings.length; rightIndex += 1) {
                    const left = endings[leftIndex];
                    const right = endings[rightIndex];
                    let kind = "";
                    if (left.label !== "?" && left.label === right.label) {
                        kind = "perfect";
                    } else if (options && options.rhymeOverrides &&
                        options.rhymeOverrides[overridePairKey(left, right)]) {
                        kind = "user";
                    } else if (left.keys.length && right.keys.length) {
                        kind = slantRhymeKind(
                            left.keys.map((key) => ({ key })),
                            right.keys.map((key) => ({ key }))
                        );
                    }
                    if (!kind && left.word && right.word &&
                        spellingRime(left.word).length > 1 &&
                        spellingRime(left.word) === spellingRime(right.word)) {
                        kind = "eye";
                    }
                    if (kind) {
                        relations.push({
                            lines: [left.line, right.line],
                            words: [left.word, right.word],
                            kind,
                            key: overridePairKey(left, right)
                        });
                    }
                }
            }
            return {
                scheme: endings.map((ending) => ending.label).join(""),
                displayScheme: endings.map((ending) => ending.label).join(" "),
                endings,
                knownCount: endings.filter((ending) => ending.label !== "?").length,
                unknownCount: endings.filter((ending) => ending.label === "?").length,
                repeatedGroups: repeatedGroups.map((group, index) => ({
                    label: schemeLabel(groups.indexOf(group)),
                    lines: group.lines,
                    kind: rhymeKind(group.records)
                })),
                relations
            };
        }

        function lineCountMatches(rule, count) {
            if (Number.isInteger(rule.exact)) {
                return count === rule.exact;
            }
            if (Number.isInteger(rule.min) && count < rule.min) {
                return false;
            }
            return !Number.isInteger(rule.multiple) || count % rule.multiple === 0;
        }

        function canonicalTerzaRima(lineCount) {
            const labels = [];
            for (let tercet = 0; tercet < lineCount / 3; tercet += 1) {
                labels.push(
                    schemeLabel(tercet),
                    schemeLabel(tercet + 1),
                    schemeLabel(tercet)
                );
            }
            return labels.join("");
        }

        function expectedSchemes(form, lineCount) {
            if (form.rhymePolicy === "terza-rima") {
                return [canonicalTerzaRima(lineCount)];
            }
            return form.rhymeSchemes || [];
        }

        function rhymeFit(form, rhyme, lineCount) {
            if (form.rhymePolicy === "advisory") {
                return { mismatchCount: 0, expected: "", exact: true };
            }
            if (form.rhymePolicy === "unrhymed") {
                const repeated = rhyme.repeatedGroups.reduce((sum, group) =>
                    sum + group.lines.length - 1, 0);
                return {
                    mismatchCount: repeated,
                    expected: "unrhymed",
                    exact: repeated === 0 && rhyme.unknownCount === 0
                };
            }
            let best = null;
            for (const expected of expectedSchemes(form, lineCount)) {
                let mismatchCount = 0;
                for (let index = 0; index < expected.length; index += 1) {
                    if (rhyme.scheme[index] !== "?" &&
                        rhyme.scheme[index] !== expected[index]) {
                        mismatchCount += 1;
                    }
                }
                const candidate = {
                    mismatchCount,
                    expected,
                    exact: mismatchCount === 0 && rhyme.unknownCount === 0
                };
                if (!best || candidate.mismatchCount < best.mismatchCount) {
                    best = candidate;
                }
            }
            return best || { mismatchCount: 0, expected: "", exact: true };
        }

        function meterChoices(form, lineIndex) {
            if (form.repeatMeterSequence) {
                return form.meterSequence[lineIndex % form.meterSequence.length];
            }
            return form.meterSequence[lineIndex] || [];
        }

        function lineMeterFit(line, choices, tolerance) {
            const candidates = (line.candidates || []).filter((candidate) =>
                choices.includes(candidate.id));
            if (!candidates.length) {
                return null;
            }
            const flexible = tolerance === "ternary" || tolerance === "flexible";
            const maximumDistance = flexible ? 1 : 0;
            const maximumApproximateScore = flexible ? 0.34 : 0.24;
            const normalized = candidates.map((candidate) => {
                // Accentual verse counts beats, not syllables. Comparing its
                // three-beat signature with a five- or seven-syllable line
                // would reject exactly the variable slack it is meant to
                // permit.
                const canonicalDistance = candidate.analysisMode === "accentual"
                    ? 0
                    : Math.abs(
                        candidate.canonicalPattern.length - candidate.syllables.length
                    );
                const recoverPartial = candidate.matchLevel === "incomplete" &&
                    (canonicalDistance === 0 ||
                        (flexible && canonicalDistance <= 1));
                return {
                    candidate,
                    canonicalDistance,
                    level: recoverPartial ? "compatible" : candidate.matchLevel,
                    score: candidate.score + (recoverPartial ? 0.12 : 0)
                };
            }).sort((left, right) =>
                (MATCH_COST[left.level] ?? 1) - (MATCH_COST[right.level] ?? 1) ||
                left.score - right.score);
            const best = normalized[0];
            if (best.level === "incomplete" ||
                best.canonicalDistance > maximumDistance ||
                best.candidate.extraCount > maximumDistance ||
                (best.level === "approximate" && best.score >
                    maximumApproximateScore)) {
                return null;
            }
            return {
                id: best.candidate.id,
                level: best.level,
                score: (MATCH_COST[best.level] ?? 1) + best.score
            };
        }

        function compareForms(left, right) {
            const levelRank = { exact: 0, compatible: 1 };
            return levelRank[left.matchLevel] - levelRank[right.matchLevel] ||
                left.score - right.score ||
                right.specificity - left.specificity ||
                right.prominence - left.prominence ||
                left.name.localeCompare(right.name, "en");
        }

        function analyzeForms(lines, rhyme, catalog) {
            validateCatalog(catalog);
            const lineCount = lines.length;
            const matches = catalog.forms.map((form) => {
                if (!lineCountMatches(form.lineCount, lineCount)) {
                    return null;
                }
                const meterFits = form.meterPolicy === "advisory"
                    ? []
                    : lines.map((line, index) =>
                        lineMeterFit(
                            line,
                            meterChoices(form, index),
                            form.meterTolerance
                        ));
                if (form.meterPolicy !== "advisory" &&
                    meterFits.some((fit) => !fit)) {
                    return null;
                }
                const rhymeResult = rhymeFit(form, rhyme, lineCount);
                if (rhymeResult.mismatchCount > 0 ||
                    (form.requireKnownRhymes && rhyme.unknownCount > 0)) {
                    return null;
                }
                const approximateMeters = meterFits.filter((fit) =>
                    fit.level === "approximate").length;
                const meterScore = meterFits.length
                    ? meterFits.reduce((sum, fit) => sum + fit.score, 0) /
                        lineCount
                    : 0;
                const exact = form.meterPolicy !== "advisory" &&
                    !approximateMeters && rhymeResult.exact;
                const specificity = Number.isInteger(form.lineCount.exact)
                    ? form.lineCount.exact
                    : 1;
                return {
                    id: form.id,
                    name: form.name,
                    aliases: form.aliases || [],
                    matchLevel: exact ? "exact" : "compatible",
                    lineCount,
                    meterFits,
                    expectedRhyme: rhymeResult.expected,
                    observedRhyme: rhyme.scheme,
                    unknownRhymes: rhyme.unknownCount,
                    prominence: form.prominence || 0,
                    specificity,
                    suppressedBy: form.suppressedBy || "",
                    score: meterScore + rhyme.unknownCount * 0.08 -
                        (form.prominence || 0) * 0.008 - specificity * 0.002,
                    sourceRef: form.sourceRef
                };
            }).filter(Boolean);
            const matchedIds = new Set(matches.map((form) => form.id));
            return matches.filter((form) =>
                !form.suppressedBy || !matchedIds.has(form.suppressedBy))
                .sort(compareForms);
        }

        function expectedLineCount(form, observedCount) {
            if (Number.isInteger(form.lineCount.exact)) {
                return form.lineCount.exact;
            }
            if (Number.isInteger(form.lineCount.multiple)) {
                return Math.max(
                    form.lineCount.min || form.lineCount.multiple,
                    Math.ceil(Math.max(observedCount, 1) /
                        form.lineCount.multiple) * form.lineCount.multiple
                );
            }
            return Math.max(form.lineCount.min || 1, observedCount);
        }

        function bestProgressScheme(form, totalLines) {
            const schemes = expectedSchemes(form, totalLines);
            return schemes[0] || "";
        }

        function rhymeProgress(expected, rhyme) {
            if (!expected || expected === "unrhymed") {
                return {
                    expectedPairs: 0,
                    matchedPairs: 0,
                    plausiblePairs: 0,
                    mismatchedPairs: 0,
                    unknownPairs: 0
                };
            }
            const typed = Math.min(expected.length, rhyme.endings.length);
            const relationByLines = new Map((rhyme.relations || []).map((relation) =>
                [relation.lines.join(":"), relation.kind]));
            let expectedPairs = 0;
            let matchedPairs = 0;
            let plausiblePairs = 0;
            let mismatchedPairs = 0;
            let unknownPairs = 0;
            for (let left = 0; left < typed; left += 1) {
                for (let right = left + 1; right < typed; right += 1) {
                    if (expected[left] !== expected[right]) {
                        continue;
                    }
                    expectedPairs += 1;
                    const relation = relationByLines.get(`${left + 1}:${right + 1}`);
                    if (relation === "perfect" || relation === "user") {
                        matchedPairs += 1;
                    } else if (["assonance", "consonance", "eye"]
                        .includes(relation)) {
                        plausiblePairs += 1;
                    } else if (rhyme.endings[left].label === "?" ||
                        rhyme.endings[right].label === "?") {
                        unknownPairs += 1;
                    } else {
                        mismatchedPairs += 1;
                    }
                }
            }
            return {
                expectedPairs,
                matchedPairs,
                plausiblePairs,
                mismatchedPairs,
                unknownPairs
            };
        }

        function analyzeFormProgress(form, lines, rhyme) {
            if (!form) {
                return null;
            }
            const observedLines = lines.length;
            const targetLines = expectedLineCount(form, observedLines);
            const expectedRhyme = form.rhymePolicy === "unrhymed"
                ? "unrhymed"
                : bestProgressScheme(form, targetLines);
            const meterLines = lines.map((line, index) => {
                if (form.meterPolicy === "advisory") {
                    return { line: index + 1, status: "advisory", fit: null };
                }
                const choices = meterChoices(form, index);
                const candidates = (line.candidates || [])
                    .filter((candidate) => choices.includes(candidate.id))
                    .sort((left, right) =>
                        (MATCH_COST[left.matchLevel] ?? 1) -
                            (MATCH_COST[right.matchLevel] ?? 1) ||
                        (left.effectiveScore ?? left.score ?? Infinity) -
                            (right.effectiveScore ?? right.score ?? Infinity));
                const candidate = candidates[0] || null;
                return {
                    line: index + 1,
                    choices,
                    candidateId: candidate && candidate.id,
                    status: candidate ? candidate.matchLevel : "unknown",
                    fit: candidate
                };
            });
            const rhymeEvidence = rhymeProgress(expectedRhyme, rhyme);
            const matchingMeterLines = meterLines.filter((item) =>
                item.status === "exact" || item.status === "compatible").length;
            const plausibleMeterLines = meterLines.filter((item) =>
                item.status === "incomplete" || item.status === "approximate").length;
            const nextLineIndex = observedLines >= targetLines
                ? targetLines - 1
                : Math.max(0, observedLines - 1);
            const nextChoices = form.meterPolicy === "advisory"
                ? []
                : meterChoices(form, nextLineIndex);
            const beatTarget = Array.isArray(form.beatSequence)
                ? form.beatSequence[nextLineIndex % form.beatSequence.length]
                : null;
            return {
                id: form.id,
                name: form.name,
                observedLines,
                targetLines,
                remainingLines: Math.max(0, targetLines - observedLines),
                overflowLines: Math.max(0, observedLines - targetLines),
                expectedRhyme,
                currentLine: Math.min(Math.max(observedLines, 1), targetLines),
                currentRhyme: expectedRhyme && expectedRhyme !== "unrhymed"
                    ? expectedRhyme[Math.min(Math.max(observedLines - 1, 0),
                        expectedRhyme.length - 1)]
                    : "",
                currentMeterChoices: nextChoices,
                currentBeatTarget: beatTarget,
                matchingMeterLines,
                plausibleMeterLines,
                meterLines,
                rhyme: rhymeEvidence,
                complete: observedLines === targetLines &&
                    !rhymeEvidence.mismatchedPairs &&
                    !rhymeEvidence.unknownPairs &&
                    (form.meterPolicy === "advisory" ||
                        matchingMeterLines === observedLines)
            };
        }

        function analyzeStanza(lines, rhymeLexicon, catalog, options) {
            const activeLines = (lines || []).filter((line) =>
                line.tokens && line.tokens.length);
            const rhyme = analyzeRhymes(activeLines, rhymeLexicon, options);
            const forms = analyzeForms(activeLines, rhyme, catalog);
            const selectedForm = catalog.forms.find((form) =>
                form.id === (options && options.selectedFormId)) || null;
            return {
                analysisSystem: "english-form",
                rhyme,
                forms,
                bestForm: forms[0] || null,
                selectedForm,
                formProgress: analyzeFormProgress(selectedForm, activeLines, rhyme)
            };
        }

        return {
            analyzeForms,
            analyzeFormProgress,
            analyzeRhymes,
            analyzeStanza,
            canonicalTerzaRima,
            createRhymeLexicon,
            normalizeWord,
            validateCatalog,
            validateRhymeDocument
        };
    }));
