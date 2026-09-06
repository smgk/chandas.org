/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function englishProsodyModule(root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.ChandasEnglish = api;
    }
}(typeof window !== "undefined" ? window : globalThis,
    function createEnglishProsodyApi() {
        "use strict";

        const WORD_RE = /\p{L}+(?:[’'\-]\p{L}+)*/gu;
        const MARK_RE = /\p{Mark}/gu;
        const VOWEL_RE = /[aeiouy]/;
        const FUNCTION_WORDS = new Set([
            "a", "an", "and", "are", "as", "at", "be", "been", "being",
            "but", "by", "can", "could", "did", "do", "does", "for", "from",
            "had", "has", "have", "he", "her", "hers", "him", "his", "i",
            "if", "in", "into", "is", "it", "its", "may", "me", "might",
            "must", "my", "nor", "not", "of", "on", "or", "our", "shall",
            "she", "should", "so", "than", "that", "the", "their", "them",
            "there", "these", "they", "this", "those", "through", "to", "us",
            "was", "we", "were", "what", "when", "where", "which", "who",
            "whom", "whose", "why", "will", "with", "would", "you", "your"
        ]);
        const VERB_CUES = new Set([
            "to", "can", "could", "did", "do", "does", "may", "might",
            "must", "shall", "should", "will", "would"
        ]);
        const SUBJECT_CUES = new Set([
            "i", "you", "he", "she", "it", "we", "they", "who"
        ]);
        const NOUN_CUES = new Set([
            "a", "an", "the", "this", "that", "these", "those", "my",
            "your", "his", "her", "its", "our", "their", "each", "every"
        ]);
        const LEXICON_CACHE = new WeakMap();

        function compareText(left, right) {
            return left < right ? -1 : left > right ? 1 : 0;
        }

        function normalizeWord(value) {
            return String(value || "")
                .normalize("NFKD")
                .replace(MARK_RE, "")
                .replace(/[’‘]/g, "'")
                .toLocaleLowerCase("en-US")
                .replace(/^[^a-z']+|[^a-z']+$/g, "");
        }

        function createLexicon(document) {
            if (!document || document.schemaVersion !== 1 ||
                !Array.isArray(document.entries)) {
                throw new Error("Invalid English pronunciation document");
            }
            const entries = new Map();
            for (const entry of document.entries) {
                if (!Array.isArray(entry) || typeof entry[0] !== "string" ||
                    !Array.isArray(entry[1])) {
                    throw new Error("Invalid English pronunciation entry");
                }
                const patterns = [...new Set(entry[1])]
                    .filter((pattern) => /^[012]+$/.test(pattern));
                if (patterns.length) {
                    entries.set(entry[0], patterns);
                }
            }
            return {
                metadata: {
                    schemaVersion: document.schemaVersion,
                    accent: document.accent,
                    source: document.source,
                    counts: document.counts
                },
                entries
            };
        }

        function normalizeLexicon(value) {
            if (value && value.entries instanceof Map) {
                return value;
            }
            if (value && typeof value === "object" && LEXICON_CACHE.has(value)) {
                return LEXICON_CACHE.get(value);
            }
            const lexicon = createLexicon(value);
            if (value && typeof value === "object") {
                LEXICON_CACHE.set(value, lexicon);
            }
            return lexicon;
        }

        function splitLines(text) {
            const source = String(text || "");
            const lines = [];
            let start = 0;
            for (let index = 0; index <= source.length; index += 1) {
                if (index !== source.length && source[index] !== "\n") {
                    continue;
                }
                const contentEnd = index > start && source[index - 1] === "\r"
                    ? index - 1
                    : index;
                lines.push({
                    text: source.slice(start, contentEnd),
                    start,
                    end: contentEnd,
                    breakEnd: index < source.length ? index + 1 : index
                });
                start = index + 1;
            }
            return lines;
        }

        function tokenize(text, offset) {
            const source = String(text || "");
            const base = Number(offset) || 0;
            return [...source.matchAll(WORD_RE)].map((match, index) => ({
                index,
                text: match[0],
                normalized: normalizeWord(match[0]),
                start: base + match.index,
                end: base + match.index + match[0].length
            }));
        }

        function writtenVowelNuclei(word) {
            const source = String(word || "");
            const nuclei = [];
            let sourceIndex = 0;
            let active = null;
            for (const character of source) {
                const base = character.normalize("NFKD")
                    .replace(MARK_RE, "")
                    .toLocaleLowerCase("en-US");
                const vowel = [...base].some((item) => VOWEL_RE.test(item)) &&
                    !(base === "y" && sourceIndex === 0);
                if (vowel) {
                    if (!active || active.end !== sourceIndex) {
                        active = { start: sourceIndex, end: sourceIndex + character.length };
                        nuclei.push(active);
                    } else {
                        active.end = sourceIndex + character.length;
                    }
                } else {
                    active = null;
                }
                sourceIndex += character.length;
            }
            return nuclei;
        }

        function adjustedNuclei(word, syllableCount) {
            const source = String(word || "");
            let nuclei = writtenVowelNuclei(source);
            let confidence = "high";
            if (nuclei.length > syllableCount && nuclei.length > 1) {
                const last = nuclei[nuclei.length - 1];
                const ending = source.slice(last.start).toLocaleLowerCase("en-US");
                const before = source[last.start - 1] || "";
                if (ending === "e" && before.toLocaleLowerCase("en-US") !== "l") {
                    nuclei = nuclei.slice(0, -1);
                    confidence = "medium";
                }
            }
            while (nuclei.length > syllableCount && nuclei.length > 1) {
                let bestIndex = 1;
                let bestGap = Infinity;
                for (let index = 1; index < nuclei.length; index += 1) {
                    const gap = nuclei[index].start - nuclei[index - 1].end;
                    if (gap < bestGap) {
                        bestGap = gap;
                        bestIndex = index;
                    }
                }
                nuclei.splice(bestIndex, 1);
                confidence = "medium";
            }
            while (nuclei.length < syllableCount) {
                const splittable = nuclei.findIndex((nucleus) =>
                    nucleus.end - nucleus.start > 1);
                if (splittable < 0) {
                    break;
                }
                const nucleus = nuclei[splittable];
                const midpoint = nucleus.start + 1;
                nuclei.splice(splittable, 1,
                    { start: nucleus.start, end: midpoint },
                    { start: midpoint, end: nucleus.end });
                confidence = "medium";
            }
            if (nuclei.length !== syllableCount) {
                nuclei = Array.from({ length: syllableCount }, (_, index) => {
                    const center = Math.min(
                        source.length - 1,
                        Math.max(0, Math.floor(((index + 0.5) * source.length) /
                            syllableCount))
                    );
                    return { start: center, end: center + 1 };
                });
                confidence = "low";
            }
            return { nuclei, confidence };
        }

        function alignWordSyllables(token, pattern) {
            const count = pattern.length;
            const local = adjustedNuclei(token.text, count);
            const boundaries = [0];
            for (let index = 1; index < local.nuclei.length; index += 1) {
                const left = local.nuclei[index - 1];
                const right = local.nuclei[index];
                const boundary = Math.max(
                    boundaries[boundaries.length - 1] + 1,
                    Math.min(token.text.length - (count - index),
                        Math.floor((left.end + right.start) / 2))
                );
                boundaries.push(boundary);
            }
            boundaries.push(token.text.length);
            return [...pattern].map((stress, index) => ({
                text: token.text.slice(boundaries[index], boundaries[index + 1]),
                start: token.start + boundaries[index],
                end: token.start + boundaries[index + 1],
                lexicalStress: Number(stress),
                word: token.text,
                normalizedWord: token.normalized,
                wordIndex: token.index,
                wordSyllableCount: count,
                alignmentConfidence: local.confidence
            }));
        }

        function heuristicSyllableCount(word) {
            const normalized = normalizeWord(word);
            if (!normalized) {
                return 0;
            }
            let working = normalized;
            const consonantLe = /[^aeiou]le$/.test(working);
            if (/e$/.test(working) && !consonantLe && !/(?:ee|ye)$/.test(working)) {
                working = working.slice(0, -1);
            }
            let count = (working.match(/[aeiouy]+/g) || []).length;
            if (consonantLe) {
                count += 1;
            }
            if (count > 1 && /(?:[^td]ed|[^sxz]es)$/.test(working)) {
                count -= 1;
            }
            return Math.max(1, count);
        }

        function heuristicStressPattern(word) {
            const count = heuristicSyllableCount(word);
            if (count <= 1) {
                return "1";
            }
            const normalized = normalizeWord(word);
            let primary = 0;
            if (/(?:tion|sion|cian|ic|ity|graphy|logy)$/.test(normalized)) {
                primary = Math.max(0, count - 2);
            } else if (/(?:ee|eer|ese|ette)$/.test(normalized)) {
                primary = count - 1;
            }
            return Array.from({ length: count }, (_, index) =>
                index === primary ? "1" : "0").join("");
        }

        function overridePatterns(word, overrides, token) {
            if (!overrides) {
                return [];
            }
            const sourceKey = token && Number.isInteger(token.start) &&
                Number.isInteger(token.end)
                ? `${token.start}:${token.end}`
                : "";
            const value = sourceKey && overrides[sourceKey] !== undefined
                ? overrides[sourceKey]
                : overrides[word];
            const values = Array.isArray(value) ? value : [value];
            return [...new Set(values.map(String).filter((item) => /^[012]+$/.test(item)))];
        }

        function contextualRole(tokens, tokenIndex) {
            const previous = tokens[tokenIndex - 1] &&
                tokens[tokenIndex - 1].normalized;
            const previousPrevious = tokens[tokenIndex - 2] &&
                tokens[tokenIndex - 2].normalized;
            if (VERB_CUES.has(previous) || SUBJECT_CUES.has(previous) ||
                (previous === "not" && (VERB_CUES.has(previousPrevious) ||
                    SUBJECT_CUES.has(previousPrevious)))) {
                return { role: "verb", reason: "verb-context" };
            }
            if (NOUN_CUES.has(previous)) {
                return { role: "noun", reason: "noun-context" };
            }
            return { role: "unknown", reason: "context-ambiguous" };
        }

        function contextualPatternCost(pattern, alternatives, context) {
            if (!context || context.role === "unknown" ||
                pattern.length < 2 || alternatives.length < 2) {
                return 0;
            }
            // CMUdict's digits are categories, not numeric intensity:
            // primary (1) is stronger than secondary (2).
            const strength = (stress) => stress === "1" ? 2 : stress === "2" ? 1 : 0;
            const first = strength(pattern[0]);
            const last = strength(pattern.at(-1));
            const initiallyStressed = first > last;
            const finallyStressed = last > first;
            if (context.role === "noun") {
                return initiallyStressed ? -0.08 : finallyStressed ? 0.2 : 0;
            }
            return finallyStressed ? -0.08 : initiallyStressed ? 0.2 : 0;
        }

        function lookupPatterns(token, lexicon, overrides, tokens) {
            const overridden = overridePatterns(token.normalized, overrides, token);
            if (overridden.length) {
                return overridden.map((pattern) => ({
                    pattern,
                    provenance: "override",
                    confidence: "certain",
                    cost: 0,
                    contextualRole: "user",
                    contextualReason: "user-override"
                }));
            }
            const exact = lexicon.entries.get(token.normalized);
            if (exact && exact.length) {
                const patterns = FUNCTION_WORDS.has(token.normalized) &&
                    exact.every((pattern) => pattern.length === 1)
                    ? [exact.includes("0") ? "0" : exact[0]]
                    : exact;
                const context = contextualRole(tokens || [token], token.index || 0);
                return patterns.map((pattern, index) => ({
                    pattern,
                    provenance: "cmudict",
                    confidence: "dictionary",
                    cost: Math.max(0, index * 0.02 +
                        contextualPatternCost(pattern, patterns, context)),
                    contextualRole: context.role,
                    contextualReason: context.reason
                }));
            }
            if (token.normalized.endsWith("'s")) {
                const base = lexicon.entries.get(token.normalized.slice(0, -2));
                if (base && base.length) {
                    return base.map((pattern, index) => ({
                        pattern,
                        provenance: "cmudict-possessive",
                        confidence: "derived",
                        cost: 0.12 + index * 0.02,
                        contextualRole: "noun",
                        contextualReason: "possessive"
                    }));
                }
            }
            return [{
                pattern: heuristicStressPattern(token.normalized),
                provenance: "heuristic",
                confidence: "guessed",
                cost: 1.25,
                contextualRole: "unknown",
                contextualReason: "out-of-vocabulary"
            }];
        }

        function lineRealizations(text, offset, lexiconValue, options) {
            const lexicon = normalizeLexicon(lexiconValue);
            const tokens = tokenize(text, offset);
            const limit = Math.max(1, Number(options && options.maxPronunciations) || 256);
            let beams = [{ syllables: [], words: [], pronunciationCost: 0 }];
            for (const token of tokens) {
                const pronunciations = lookupPatterns(
                    token,
                    lexicon,
                    options && options.overrides,
                    tokens
                );
                const next = [];
                for (const beam of beams) {
                    for (const pronunciation of pronunciations) {
                        const syllables = alignWordSyllables(token, pronunciation.pattern)
                            .map((syllable) => ({
                                ...syllable,
                                pronunciationProvenance: pronunciation.provenance,
                                pronunciationConfidence: pronunciation.confidence,
                                contextualRole: pronunciation.contextualRole,
                                contextualReason: pronunciation.contextualReason
                            }));
                        next.push({
                            syllables: [...beam.syllables, ...syllables],
                            words: [...beam.words, {
                                ...token,
                                stress: pronunciation.pattern,
                                pronunciationProvenance: pronunciation.provenance,
                                pronunciationConfidence: pronunciation.confidence,
                                contextualRole: pronunciation.contextualRole,
                                contextualReason: pronunciation.contextualReason,
                                pronunciationAlternatives: pronunciations.map((item) =>
                                    item.pattern)
                            }],
                            pronunciationCost: beam.pronunciationCost + pronunciation.cost
                        });
                    }
                }
                const unique = new Map();
                next.sort((left, right) =>
                    left.pronunciationCost - right.pronunciationCost ||
                    compareText(
                        left.syllables.map((item) => item.lexicalStress).join(""),
                        right.syllables.map((item) => item.lexicalStress).join("")
                    ));
                for (const realization of next) {
                    const key = realization.syllables
                        .map((item) => item.lexicalStress)
                        .join("");
                    if (!unique.has(key)) {
                        unique.set(key, realization);
                    }
                    if (unique.size >= limit) {
                        break;
                    }
                }
                beams = [...unique.values()];
            }
            return { tokens, realizations: beams };
        }

        function isBeatMeter(meter) {
            return meter && ["accentual", "sprung"].includes(meter.analysisMode);
        }

        function templateVariants(meter) {
            if (isBeatMeter(meter)) {
                return [{
                    pattern: "S".repeat(meter.beats),
                    cost: 0,
                    variations: []
                }];
            }
            const canonical = meter.pattern.repeat(meter.feet);
            const variants = [{ pattern: canonical, cost: 0, variations: [] }];
            const rules = meter.rules || {};
            if (rules.initialInversion && canonical.startsWith("WS")) {
                variants.push({
                    pattern: `SW${canonical.slice(2)}`,
                    cost: 0.25,
                    variations: ["initial-inversion"]
                });
            }
            const edgeVariants = [...variants];
            if (rules.feminineEnding) {
                edgeVariants.forEach((variant) => variants.push({
                    pattern: `${variant.pattern}W`,
                    cost: variant.cost + 0.18,
                    variations: [...variant.variations, "feminine-ending"]
                }));
            }
            if (rules.catalexis && canonical.endsWith("W")) {
                variants.push({
                    pattern: canonical.slice(0, -1),
                    cost: 0.15,
                    variations: ["catalexis"]
                });
            }
            if (rules.initialSlackOmission && canonical.startsWith("WW")) {
                variants.push({
                    pattern: canonical.slice(1),
                    cost: 0.15,
                    variations: ["initial-slack-omission"]
                });
            }
            if (rules.weakResolution) {
                for (let position = 0; position < canonical.length; position += 1) {
                    if (canonical[position] !== "W") {
                        continue;
                    }
                    variants.push({
                        pattern: `${canonical.slice(0, position)}WW${canonical.slice(position + 1)}`,
                        cost: 0.45,
                        variations: [`weak-resolution-${position + 1}`]
                    });
                }
            }
            const unique = new Map();
            variants.forEach((variant) => {
                const previous = unique.get(variant.pattern);
                if (!previous || variant.cost < previous.cost) {
                    unique.set(variant.pattern, variant);
                }
            });
            return [...unique.values()];
        }

        function stressCost(syllable, expected, meter) {
            const stress = syllable.lexicalStress;
            const flexible = syllable.start !== syllable.end &&
                FUNCTION_WORDS.has(syllable.normalizedWord) &&
                syllable.wordIndex !== undefined;
            const ternary = meter && ["anapest", "dactyl"].includes(meter.foot);
            if (expected === "S") {
                if (stress === 1) {
                    return { cost: 0, kind: null };
                }
                if (stress === 2) {
                    return {
                        cost: ternary ? 0.08 : 0.12,
                        kind: "secondary-as-beat"
                    };
                }
                if (flexible) {
                    return {
                        cost: ternary ? 0.22 : 0.16,
                        kind: "promotion"
                    };
                }
                return {
                    cost: ternary ? 1.05 : 1.35,
                    kind: "unstressed-in-strong"
                };
            }
            if (stress === 0) {
                return { cost: 0, kind: null };
            }
            if (stress === 2) {
                return {
                    cost: ternary ? 0.12 : 0.4,
                    kind: "secondary-in-weak"
                };
            }
            if (flexible) {
                return { cost: 0.18, kind: "demotion" };
            }
            if (syllable.wordSyllableCount === 1) {
                return {
                    cost: ternary ? 0.16 : 0.72,
                    kind: ternary ? "stress-in-slack" : "content-word-in-weak"
                };
            }
            return {
                cost: ternary ? 0.72 : 1.5,
                kind: "primary-in-weak"
            };
        }

        function alignToTemplate(syllables, template, partial, meter) {
            const observedCount = syllables.length;
            const expectedCount = template.length;
            const rows = Array.from({ length: observedCount + 1 }, () =>
                Array(expectedCount + 1).fill(null));
            rows[0][0] = { cost: 0, previous: null, operation: null };
            for (let index = 1; index <= observedCount; index += 1) {
                rows[index][0] = {
                    cost: rows[index - 1][0].cost + 2.5,
                    previous: [index - 1, 0],
                    operation: "extra"
                };
            }
            for (let index = 1; index <= expectedCount; index += 1) {
                rows[0][index] = {
                    cost: rows[0][index - 1].cost + (partial ? 0 : 2),
                    previous: [0, index - 1],
                    operation: "missing"
                };
            }
            for (let observed = 1; observed <= observedCount; observed += 1) {
                for (let expected = 1; expected <= expectedCount; expected += 1) {
                    const match = stressCost(
                        syllables[observed - 1],
                        template[expected - 1],
                        meter
                    );
                    const choices = [
                        {
                            cost: rows[observed - 1][expected - 1].cost + match.cost,
                            previous: [observed - 1, expected - 1],
                            operation: "match",
                            evidence: match
                        },
                        {
                            cost: rows[observed - 1][expected].cost + 2.5,
                            previous: [observed - 1, expected],
                            operation: "extra"
                        },
                        {
                            cost: rows[observed][expected - 1].cost +
                                (partial && observed === observedCount ? 0 : 2),
                            previous: [observed, expected - 1],
                            operation: "missing"
                        }
                    ];
                    choices.sort((left, right) => left.cost - right.cost ||
                        ["match", "missing", "extra"].indexOf(left.operation) -
                        ["match", "missing", "extra"].indexOf(right.operation));
                    rows[observed][expected] = choices[0];
                }
            }

            const assignments = Array(observedCount).fill(null);
            const deviations = [];
            let missingCount = 0;
            let extraCount = 0;
            let cursor = [observedCount, expectedCount];
            while (cursor[0] > 0 || cursor[1] > 0) {
                const cell = rows[cursor[0]][cursor[1]];
                if (cell.operation === "match") {
                    const observedIndex = cursor[0] - 1;
                    const expectedIndex = cursor[1] - 1;
                    assignments[observedIndex] = {
                        expectedStress: template[expectedIndex],
                        expectedIndex,
                        deviation: cell.evidence.kind,
                        cost: cell.evidence.cost
                    };
                    if (cell.evidence.kind && cell.evidence.cost >= 0.35) {
                        deviations.push({
                            kind: cell.evidence.kind,
                            expectedStress: template[expectedIndex],
                            syllable: syllables[observedIndex]
                        });
                    }
                } else if (cell.operation === "extra") {
                    const observedIndex = cursor[0] - 1;
                    extraCount += 1;
                    assignments[observedIndex] = {
                        expectedStress: null,
                        expectedIndex: null,
                        deviation: "extra-syllable",
                        cost: 2.5
                    };
                    deviations.push({
                        kind: "extra-syllable",
                        expectedStress: null,
                        syllable: syllables[observedIndex]
                    });
                } else if (cell.operation === "missing") {
                    missingCount += 1;
                }
                cursor = cell.previous;
            }
            deviations.reverse();
            return {
                cost: rows[observedCount][expectedCount].cost,
                assignments,
                deviations,
                missingCount,
                extraCount
            };
        }

        function naturalBeatCost(syllable) {
            if (syllable.lexicalStress === 1) {
                return FUNCTION_WORDS.has(syllable.normalizedWord) ? 0.25 : 0;
            }
            if (syllable.lexicalStress === 2) {
                return 0.08;
            }
            if (FUNCTION_WORDS.has(syllable.normalizedWord)) {
                return 0.48;
            }
            return syllable.wordSyllableCount === 1 ? 0.12 : 0.8;
        }

        function chooseAccentualBeats(syllables, beatCount, sprung) {
            if (!syllables.length || beatCount < 1) {
                return { indexes: [], cost: beatCount * 1.5 };
            }
            const rows = Array.from({ length: beatCount + 1 }, () =>
                Array(syllables.length).fill(null));
            for (let index = 0; index < syllables.length; index += 1) {
                rows[1][index] = {
                    cost: naturalBeatCost(syllables[index]) + index * 0.015,
                    previous: -1
                };
            }
            for (let count = 2; count <= beatCount; count += 1) {
                for (let index = count - 1; index < syllables.length; index += 1) {
                    let best = null;
                    for (let previous = count - 2; previous < index; previous += 1) {
                        const prior = rows[count - 1][previous];
                        if (!prior) {
                            continue;
                        }
                        const candidate = {
                            cost: prior.cost + naturalBeatCost(syllables[index]) +
                                (!sprung && index - previous === 1 ? 0.16 : 0),
                            previous
                        };
                        if (!best || candidate.cost < best.cost) {
                            best = candidate;
                        }
                    }
                    rows[count][index] = best;
                }
            }
            let finalIndex = -1;
            let final = null;
            for (let index = beatCount - 1; index < syllables.length; index += 1) {
                const cell = rows[beatCount][index];
                if (!cell) {
                    continue;
                }
                const cost = cell.cost +
                    (syllables.length - 1 - index) * 0.015;
                if (!final || cost < final.cost) {
                    final = { ...cell, cost };
                    finalIndex = index;
                }
            }
            if (!final) {
                return {
                    indexes: syllables.map((_, index) => index),
                    cost: Math.max(0, beatCount - syllables.length) * 1.5
                };
            }
            const indexes = [];
            let count = beatCount;
            let index = finalIndex;
            while (count > 0 && index >= 0) {
                indexes.push(index);
                index = rows[count][index].previous;
                count -= 1;
            }
            return { indexes: indexes.reverse(), cost: final.cost };
        }

        function fitAccentualRealization(realization, meter, options) {
            const partial = Boolean(options && options.partial);
            const requested = meter.beats;
            const available = realization.syllables.length;
            const chosenCount = Math.min(requested, available);
            const sprung = meter.analysisMode === "sprung";
            const chosen = chooseAccentualBeats(
                realization.syllables,
                chosenCount,
                sprung
            );
            const beatIndexes = new Set(chosen.indexes);
            const assignments = realization.syllables.map((syllable, index) => ({
                expectedStress: beatIndexes.has(index) ? "S" : "W",
                expectedIndex: beatIndexes.has(index)
                    ? chosen.indexes.indexOf(index)
                    : null,
                deviation: null,
                cost: beatIndexes.has(index) ? naturalBeatCost(syllable) : 0
            }));
            const audibleStrong = realization.syllables.filter((syllable) =>
                syllable.lexicalStress > 0 &&
                !FUNCTION_WORDS.has(syllable.normalizedWord)).length;
            const surplusProminence = Math.max(0, audibleStrong - requested);
            const beatGaps = chosen.indexes.slice(0, -1).map((index, beatIndex) =>
                chosen.indexes[beatIndex + 1] - index);
            const overlongSprungFeet = sprung
                ? beatGaps.filter((gap) => gap > 4).length
                : 0;
            const missingCount = Math.max(0, requested - chosenCount);
            const rawScore = chosen.cost + surplusProminence * (sprung ? 0.1 : 0.16) +
                overlongSprungFeet * 0.35 +
                (partial ? 0 : missingCount * 1.5) + realization.pronunciationCost;
            return {
                rawScore,
                score: rawScore / Math.max(requested, 1),
                variant: {
                    pattern: "S".repeat(requested),
                    cost: 0,
                    variations: []
                },
                aligned: {
                    cost: rawScore,
                    assignments,
                    deviations: [],
                    missingCount,
                    extraCount: 0
                },
                realization,
                beatCount: chosenCount,
                partial,
                analysisMode: meter.analysisMode
            };
        }

        function fitRealization(realization, meter, options) {
            if (isBeatMeter(meter)) {
                return fitAccentualRealization(realization, meter, options);
            }
            const partial = Boolean(options && options.partial);
            let best = null;
            const variants = templateVariants(meter);
            const observedCount = realization.syllables.length;
            const minimumLengthDistance = Math.min(...variants.map((variant) =>
                Math.abs(variant.pattern.length - observedCount)));
            const relevantVariants = partial
                ? variants
                : variants.filter((variant) =>
                    !variant.variations.length ||
                    Math.abs(variant.pattern.length - observedCount) ===
                        minimumLengthDistance);
            for (const variant of relevantVariants) {
                const aligned = alignToTemplate(
                    realization.syllables,
                    variant.pattern,
                    partial,
                    meter
                );
                const rawScore = aligned.cost + variant.cost +
                    realization.pronunciationCost;
                const candidate = {
                    rawScore,
                    score: rawScore / Math.max(variant.pattern.length, 1),
                    variant,
                    aligned,
                    realization
                };
                if (!best || candidate.rawScore < best.rawScore ||
                    (candidate.rawScore === best.rawScore &&
                        candidate.variant.cost < best.variant.cost)) {
                    best = candidate;
                }
            }
            return best;
        }

        function matchLevel(fit) {
            if (["accentual", "sprung"].includes(fit.analysisMode)) {
                if (fit.aligned.missingCount) {
                    return fit.partial ? "incomplete" : "approximate";
                }
                if (fit.score <= 0.13) {
                    return "exact";
                }
                if (fit.score <= 0.38) {
                    return "compatible";
                }
                return "approximate";
            }
            if (fit.aligned.extraCount ||
                (fit.aligned.missingCount && !fit.partial)) {
                return "approximate";
            }
            if (fit.aligned.missingCount) {
                return "incomplete";
            }
            if (fit.score <= 0.08) {
                return "exact";
            }
            if (fit.score <= 0.22) {
                return "compatible";
            }
            return "approximate";
        }

        function footSubstitutions(syllables, meter, variations) {
            if (isBeatMeter(meter) ||
                !["iamb", "trochee"].includes(meter.foot) ||
                (variations || []).some((variation) =>
                    variation.startsWith("weak-resolution-"))) {
                return [];
            }
            const substitutions = [];
            for (let footIndex = 0; footIndex < meter.feet; footIndex += 1) {
                const firstExpected = footIndex * 2;
                const footSyllables = syllables.filter((syllable) =>
                    syllable.expectedIndex === firstExpected ||
                    syllable.expectedIndex === firstExpected + 1);
                if (footSyllables.length !== 2) {
                    continue;
                }
                const realization = footSyllables.map((syllable) =>
                    syllable.lexicalStress === 0 ? "W" : "S").join("");
                const kind = realization === "SS"
                    ? "spondee"
                    : realization === "WW" ? "pyrrhic" : null;
                if (!kind) {
                    continue;
                }
                substitutions.push({
                    foot: footIndex + 1,
                    kind,
                    realization,
                    start: footSyllables[0].start,
                    end: footSyllables.at(-1).end,
                    syllables: footSyllables
                });
            }
            return substitutions;
        }

        function meterCandidate(meter, realizations, options) {
            let best = null;
            const fits = [];
            for (const realization of realizations) {
                const fit = fitRealization(realization, meter, options);
                fits.push(fit);
                if (!best || fit.rawScore < best.rawScore) {
                    best = fit;
                }
            }
            const syllables = best.realization.syllables.map((syllable, index) => ({
                ...syllable,
                ...(best.aligned.assignments[index] || {})
            }));
            const guessedWords = best.realization.words.filter((word) =>
                word.pronunciationConfidence === "guessed");
            const partial = Boolean(options && options.partial);
            const completionPenalty = partial
                ? best.aligned.missingCount * 0.025
                : 0;
            const alternateRealizations = fits
                .filter((fit) => fit !== best &&
                    fit.rawScore <= best.rawScore + 0.3)
                .slice(0, 4)
                .map((fit) => ({
                    observedLexicalPattern: fit.realization.syllables
                        .map((item) => item.lexicalStress === 0 ? "W" : "S")
                        .join(""),
                    rawScore: fit.rawScore,
                    pronunciationProvenance: fit.realization.words.map((word) => ({
                        word: word.text,
                        stress: word.stress,
                        provenance: word.pronunciationProvenance
                    }))
                }));
            const level = matchLevel({ ...best, partial });
            const alignmentConfidence = syllables.some((syllable) =>
                syllable.alignmentConfidence === "low")
                ? "low"
                : syllables.some((syllable) =>
                    syllable.alignmentConfidence === "medium")
                    ? "medium"
                    : "high";
            const confidence = guessedWords.length || level === "approximate"
                ? "low"
                : alignmentConfidence === "high" && level === "exact"
                    ? "high"
                    : "medium";
            return {
                id: meter.id,
                name: meter.name,
                aliases: meter.aliases || [],
                foot: meter.foot,
                feet: meter.feet,
                analysisMode: meter.analysisMode || "accentual-syllabic",
                beats: meter.beats || meter.feet,
                beatCount: best.beatCount,
                canonicalPattern: isBeatMeter(meter)
                    ? "S".repeat(meter.beats)
                    : meter.pattern.repeat(meter.feet),
                expectedPattern: best.variant.pattern,
                observedLexicalPattern: syllables.map((syllable) =>
                    syllable.lexicalStress === 0 ? "W" : "S").join(""),
                score: best.score,
                rawScore: best.rawScore,
                effectiveScore: best.score + completionPenalty +
                    (meter.analysisMode === "accentual" ? 0.25 :
                        meter.analysisMode === "sprung" ? 0.42 : 0) +
                    (["anapest", "dactyl"].includes(meter.foot) ? 0.05 : 0) -
                    (Number(meter.prominence) || 0) * 0.008,
                matchLevel: level,
                confidence,
                alignmentConfidence,
                missingCount: best.aligned.missingCount,
                extraCount: best.aligned.extraCount,
                variations: best.variant.variations,
                deviations: best.aligned.deviations,
                guessedWordCount: guessedWords.length,
                guessedWords: guessedWords.map((word) => word.text),
                alternateRealizations,
                substitutions: footSubstitutions(
                    syllables,
                    meter,
                    best.variant.variations
                ),
                syllables,
                words: best.realization.words
            };
        }

        function validateCatalog(document) {
            if (!document || document.analysisSystem !== "english-stress" ||
                !Array.isArray(document.meters) || !document.meters.length) {
                throw new Error("Invalid English meter catalog");
            }
            const ids = new Set();
            for (const meter of document.meters) {
                const accentual = isBeatMeter(meter);
                if (!meter.id || ids.has(meter.id) || !meter.name ||
                    (accentual
                        ? (!Number.isInteger(meter.beats) || meter.beats < 1 ||
                            meter.beats > 8)
                        : (!/^(?:WS|SW|WWS|SWW)$/.test(meter.pattern) ||
                            !Number.isInteger(meter.feet) || meter.feet < 1))) {
                    throw new Error(`Invalid English meter: ${meter.id || "(missing id)"}`);
                }
                ids.add(meter.id);
            }
            return document;
        }

        function compareCandidates(left, right) {
            return left.effectiveScore - right.effectiveScore ||
                (left.missingCount || 0) - (right.missingCount || 0) ||
                (left.extraCount || 0) - (right.extraCount || 0) ||
                compareText(left.id, right.id);
        }

        function ambiguitySummary(candidates, options) {
            if (!candidates.length || !Number.isFinite(candidates[0].effectiveScore)) {
                return { ambiguous: false, nearTies: [] };
            }
            const margin = Math.max(0,
                Number(options && options.ambiguityMargin) || 0.035);
            const nearTies = candidates.slice(1).filter((candidate) =>
                candidate.effectiveScore - candidates[0].effectiveScore <= margin);
            return {
                ambiguous: nearTies.length > 0,
                nearTies: nearTies.map((candidate) => ({
                    id: candidate.id,
                    name: candidate.name,
                    score: candidate.score,
                    effectiveScore: candidate.effectiveScore,
                    matchLevel: candidate.matchLevel
                }))
            };
        }

        function analyzeLine(text, lexiconValue, catalogValue, options) {
            const catalog = validateCatalog(catalogValue);
            const line = String(text || "");
            const offset = Number(options && options.offset) || 0;
            const realizationSet = lineRealizations(
                line,
                offset,
                lexiconValue,
                options || {}
            );
            if (!realizationSet.realizations.length || !realizationSet.tokens.length) {
                return {
                    text: line,
                    start: offset,
                    end: offset + line.length,
                    tokens: realizationSet.tokens,
                    syllables: [],
                    candidates: [],
                    selected: null,
                    bestCandidate: null,
                    ambiguous: false,
                    nearTies: []
                };
            }
            const candidates = catalog.meters
                .map((meter) => meterCandidate(
                    meter,
                    realizationSet.realizations,
                    options || {}
                ))
                .sort(compareCandidates);
            const selectedId = options && options.selectedMeterId;
            const selected = selectedId
                ? candidates.find((candidate) => candidate.id === selectedId) || null
                : null;
            const best = selected || candidates[0];
            const ambiguity = ambiguitySummary(candidates, options);
            return {
                text: line,
                start: offset,
                end: offset + line.length,
                tokens: realizationSet.tokens,
                syllables: best ? best.syllables : [],
                candidates,
                selected,
                bestCandidate: candidates[0] || null,
                ...ambiguity
            };
        }

        function analyzeComposition(text, lexiconValue, catalogValue, options) {
            const source = String(text || "");
            const catalog = validateCatalog(catalogValue);
            const lexicon = normalizeLexicon(lexiconValue);
            const baseOffset = Number(options && options.offset) || 0;
            const sourceLines = splitLines(source);
            const nonempty = sourceLines.filter((line) => tokenize(line.text).length);
            const lastNonemptyStart = nonempty.length ? nonempty.at(-1).start : -1;
            const lines = sourceLines.map((line) => analyzeLine(
                line.text,
                lexicon,
                catalog,
                {
                    ...(options || {}),
                    offset: baseOffset + line.start,
                    partial: Boolean(options && options.partialLastLine &&
                        line.start === lastNonemptyStart)
                }
            ));
            const scoredLines = lines.filter((line) => line.candidates.length);
            if (!scoredLines.length) {
                return {
                    text: source,
                    lines,
                    candidates: [],
                    dominantFeet: [],
                    bestCandidate: null,
                    ambiguous: false,
                    nearTies: []
                };
            }
            const candidates = catalog.meters.map((meter) => {
                const perLine = scoredLines.map((line) =>
                    line.candidates.find((candidate) => candidate.id === meter.id));
                const rawScore = perLine.reduce((sum, candidate) =>
                    sum + candidate.rawScore, 0);
                const score = perLine.length
                    ? perLine.reduce((sum, candidate) => sum + candidate.score, 0) /
                        perLine.length
                    : Infinity;
                const effectiveScore = perLine.length
                    ? perLine.reduce((sum, candidate) =>
                        sum + candidate.effectiveScore, 0) / perLine.length
                    : Infinity;
                return {
                    id: meter.id,
                    name: meter.name,
                    foot: meter.foot,
                    feet: meter.feet,
                    lineCount: perLine.length,
                    rawScore,
                    score,
                    effectiveScore,
                    exactLines: perLine.filter((candidate) =>
                        candidate.matchLevel === "exact").length,
                    compatibleLines: perLine.filter((candidate) =>
                        ["exact", "compatible"].includes(candidate.matchLevel)).length,
                    lines: perLine
                };
            }).sort(compareCandidates);
            const footScores = new Map();
            for (const line of scoredLines) {
                const byFoot = new Map();
                for (const candidate of line.candidates) {
                    const previous = byFoot.get(candidate.foot);
                    if (!previous || candidate.effectiveScore <
                        previous.effectiveScore) {
                        byFoot.set(candidate.foot, candidate);
                    }
                }
                for (const [foot, candidate] of byFoot) {
                    const current = footScores.get(foot) || { total: 0, lines: 0 };
                    current.total += candidate.effectiveScore;
                    current.lines += 1;
                    footScores.set(foot, current);
                }
            }
            const dominantFeet = [...footScores]
                .map(([foot, value]) => ({
                    foot,
                    score: value.total / value.lines,
                    lineCount: value.lines
                }))
                .sort((left, right) => left.score - right.score ||
                    compareText(left.foot, right.foot));
            const ambiguity = ambiguitySummary(candidates, options);
            return {
                text: source,
                lines,
                candidates,
                dominantFeet,
                bestCandidate: candidates[0] || null,
                ...ambiguity
            };
        }

        return {
            alignWordSyllables,
            analyzeComposition,
            analyzeLine,
            createLexicon,
            heuristicStressPattern,
            heuristicSyllableCount,
            lineRealizations,
            normalizeWord,
            splitLines,
            templateVariants,
            tokenize,
            validateCatalog,
            writtenVowelNuclei,
            footSubstitutions
        };
    }));
