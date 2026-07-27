(function chandasModule(globalScope, factory) {
    const api = factory();

    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }

    if (globalScope) {
        globalScope.Chandas = api;
        // Backwards-compatible entry point for the original prototype.
        globalScope.analyzeMeter = api.analyzeMeter;
    }
}(typeof globalThis !== "undefined" ? globalThis : this, function createChandasApi() {
    "use strict";

    const LAGHU = "L";
    const GURU = "G";

    const SCRIPT_CONFIG = {
        devanagari: {
            label: "Devanagari",
            block: [0x0900, 0x097f],
            consonant: [0x0915, 0x0939],
            independentShort: new Set([0x0905, 0x0907, 0x0909, 0x090b, 0x090c, 0x090f, 0x0913]),
            independentLong: new Set([0x0906, 0x0908, 0x090a, 0x0960, 0x0961, 0x0910, 0x0914]),
            dependentShort: new Set([0x093f, 0x0941, 0x0943, 0x0944, 0x0946, 0x094a]),
            dependentLong: new Set([0x093e, 0x0940, 0x0942, 0x0947, 0x0948, 0x094b, 0x094c]),
            virama: 0x094d,
            heavyMarks: new Set([0x0902, 0x0903]),
            ignoredMarks: new Set([0x0901, 0x093c, 0x0951, 0x0952, 0x0953, 0x0954])
        },
        kannada: {
            label: "Kannada",
            block: [0x0c80, 0x0cff],
            consonant: [0x0c95, 0x0cb9],
            independentShort: new Set([0x0c85, 0x0c87, 0x0c89, 0x0c8b, 0x0c8c, 0x0c8e, 0x0c92]),
            independentLong: new Set([0x0c86, 0x0c88, 0x0c8a, 0x0ce0, 0x0ce1, 0x0c90, 0x0c94]),
            dependentShort: new Set([0x0cbf, 0x0cc1, 0x0cc3, 0x0cc4, 0x0cc6, 0x0cca]),
            dependentLong: new Set([0x0cbe, 0x0cc0, 0x0cc2, 0x0cc7, 0x0cc8, 0x0ccb, 0x0ccc]),
            virama: 0x0ccd,
            heavyMarks: new Set([0x0c82, 0x0c83]),
            ignoredMarks: new Set([0x0c81, 0x0cbc])
        }
    };

    const MARK_RE = /\p{Mark}/u;
    const METRIC_BOUNDARY_RE = /^[\p{White_Space}\p{Punctuation}]+$/u;

    function codePoints(text, offset) {
        const points = [];
        let index = 0;
        const baseOffset = offset || 0;

        for (const char of text) {
            points.push({
                char,
                cp: char.codePointAt(0),
                start: baseOffset + index,
                end: baseOffset + index + char.length
            });
            index += char.length;
        }

        return points;
    }

    function inRange(cp, range) {
        return cp >= range[0] && cp <= range[1];
    }

    function isConsonant(point, config) {
        return Boolean(point) && inRange(point.cp, config.consonant);
    }

    function isIndependentVowel(point, config) {
        return Boolean(point) &&
            (config.independentShort.has(point.cp) || config.independentLong.has(point.cp));
    }

    function isJoiner(point) {
        return Boolean(point) && (point.cp === 0x200c || point.cp === 0x200d);
    }

    function detectScript(text) {
        const counts = { devanagari: 0, kannada: 0 };

        for (const point of codePoints(text)) {
            for (const [name, config] of Object.entries(SCRIPT_CONFIG)) {
                if (inRange(point.cp, config.block)) {
                    counts[name] += 1;
                }
            }
        }

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted[0][1] > 0 ? sorted[0][0] : "unknown";
    }

    function consumeMarks(points, index, config, state) {
        let cursor = index;

        while (cursor < points.length) {
            const point = points[cursor];

            if (config.dependentLong.has(point.cp)) {
                state.isLong = true;
                state.reasons.add("long-vowel");
                cursor += 1;
                continue;
            }

            if (config.dependentShort.has(point.cp)) {
                cursor += 1;
                continue;
            }

            if (config.heavyMarks.has(point.cp)) {
                state.isHeavy = true;
                state.reasons.add("anusvara-or-visarga");
                cursor += 1;
                continue;
            }

            if (config.ignoredMarks.has(point.cp) || isJoiner(point) || MARK_RE.test(point.char)) {
                cursor += 1;
                continue;
            }

            break;
        }

        return cursor;
    }

    function consumeConsonantViramaPair(points, index, config) {
        if (!isConsonant(points[index], config) || !points[index + 1] ||
            points[index + 1].cp !== config.virama) {
            return index;
        }

        let cursor = index + 2;
        while (isJoiner(points[cursor])) {
            cursor += 1;
        }
        return cursor;
    }

    function consumeOnset(points, index, config) {
        let cursor = index;

        while (isConsonant(points[cursor], config)) {
            const afterPair = consumeConsonantViramaPair(points, cursor, config);
            if (afterPair === cursor || !isConsonant(points[afterPair], config)) {
                break;
            }
            cursor = afterPair;
        }

        return cursor;
    }

    function beginsWithConjunct(text, config) {
        const points = codePoints(text);
        const afterPair = consumeConsonantViramaPair(points, 0, config);
        return afterPair > 0 && isConsonant(points[afterPair], config);
    }

    function applyBoundaryConjunctRule(text, absoluteOffset, config, syllables) {
        for (let index = 1; index < syllables.length; index += 1) {
            const previous = syllables[index - 1];
            const current = syllables[index];

            if (previous.classification !== LAGHU ||
                !beginsWithConjunct(current.text, config)) {
                continue;
            }

            const gap = text.slice(
                previous.end - absoluteOffset,
                current.start - absoluteOffset
            );
            if (!gap || !METRIC_BOUNDARY_RE.test(gap)) {
                continue;
            }

            previous.classification = GURU;
            previous.actual = GURU;
            previous.reasons.push("followed-by-conjunct");
        }
    }

    function segmentLine(text, absoluteOffset, forcedScript) {
        const script = forcedScript && SCRIPT_CONFIG[forcedScript]
            ? forcedScript
            : detectScript(text);

        if (!SCRIPT_CONFIG[script]) {
            return {
                script: "unknown",
                syllables: [],
                unsupported: text.trim() ? [{
                    start: absoluteOffset,
                    end: absoluteOffset + text.length,
                    reason: "unsupported-script"
                }] : []
            };
        }

        const config = SCRIPT_CONFIG[script];
        const points = codePoints(text, absoluteOffset);
        const syllables = [];
        const unsupported = [];
        let cursor = 0;

        while (cursor < points.length) {
            const first = points[cursor];

            if (!isConsonant(first, config) && !isIndependentVowel(first, config)) {
                const unsupportedStart = cursor;
                cursor += 1;
                while (cursor < points.length &&
                    !isConsonant(points[cursor], config) &&
                    !isIndependentVowel(points[cursor], config)) {
                    cursor += 1;
                }
                const raw = text.slice(
                    points[unsupportedStart].start - absoluteOffset,
                    points[cursor - 1].end - absoluteOffset
                );
                if (raw.trim() && /[\p{Letter}\p{Number}]/u.test(raw)) {
                    unsupported.push({
                        start: points[unsupportedStart].start,
                        end: points[cursor - 1].end,
                        reason: "unsupported-sequence"
                    });
                }
                continue;
            }

            const startCursor = cursor;
            const state = {
                isHeavy: false,
                isLong: false,
                reasons: new Set()
            };

            if (isIndependentVowel(points[cursor], config)) {
                if (config.independentLong.has(points[cursor].cp)) {
                    state.isLong = true;
                    state.reasons.add("long-vowel");
                }
                cursor += 1;
            } else {
                // A conjunct at the beginning of a word is the onset of this syllable.
                cursor = consumeOnset(points, cursor, config);
                if (!isConsonant(points[cursor], config)) {
                    cursor = startCursor + 1;
                } else {
                    cursor += 1;
                }
            }

            cursor = consumeMarks(points, cursor, config, state);

            // As in the original implementation, a following consonant+virama
            // closes the preceding syllable and makes it Guru.
            let closedByConjunct = false;
            while (cursor < points.length) {
                const afterPair = consumeConsonantViramaPair(points, cursor, config);
                if (afterPair === cursor) {
                    break;
                }
                cursor = afterPair;
                closedByConjunct = true;
            }

            if (closedByConjunct) {
                state.isHeavy = true;
                state.reasons.add("closed-by-conjunct");
            }

            const start = points[startCursor].start;
            const end = points[Math.max(startCursor, cursor - 1)].end;
            const classification = state.isHeavy || state.isLong ? GURU : LAGHU;

            syllables.push({
                syllable: text.slice(start - absoluteOffset, end - absoluteOffset),
                text: text.slice(start - absoluteOffset, end - absoluteOffset),
                start,
                end,
                classification,
                actual: classification,
                script,
                reasons: Array.from(state.reasons)
            });
        }

        // Whitespace and punctuation are metrically transparent. A conjunct
        // beginning the next written word therefore closes a preceding Laghu
        // without expanding that syllable's highlight range.
        applyBoundaryConjunctRule(text, absoluteOffset, config, syllables);

        return { script, syllables, unsupported };
    }

    function parseStanzas(text) {
        const lines = [];
        const matcher = /([^\n]*)(\n|$)/g;
        let match;

        while ((match = matcher.exec(text)) !== null) {
            if (match.index === text.length && match[0] === "") {
                break;
            }
            lines.push({
                text: match[1],
                start: match.index,
                end: match.index + match[1].length,
                hasNewline: match[2] === "\n"
            });
            if (match[2] === "") {
                break;
            }
        }

        const stanzas = [];
        let current = null;

        for (const line of lines) {
            if (!line.text.trim()) {
                if (current) {
                    current.end = current.lines[current.lines.length - 1].end;
                    stanzas.push(current);
                    current = null;
                }
                continue;
            }

            if (!current) {
                current = {
                    index: stanzas.length,
                    start: line.start,
                    end: line.end,
                    text: "",
                    lines: []
                };
            }

            current.lines.push(line);
            current.end = line.end;
        }

        if (current) {
            stanzas.push(current);
        }

        for (const stanza of stanzas) {
            stanza.text = text.slice(stanza.start, stanza.end);
        }

        return stanzas;
    }

    function sanitizePattern(pattern) {
        return String(pattern || "").toUpperCase().replace(/[^GL]/g, "");
    }

    function normalizeCatalog(catalog) {
        if (!catalog) {
            return [];
        }

        const rawEntries = Array.isArray(catalog) ? catalog : catalog.metres;
        if (!Array.isArray(rawEntries)) {
            return [];
        }

        return rawEntries
            .filter((entry) => Array.isArray(entry) && entry.length >= 2)
            .map((entry, index) => {
                const rawPatterns = Array.isArray(entry[1]) ? entry[1] : [entry[1]];
                return {
                    id: String(entry[0]),
                    name: String(entry[0]),
                    sourceIndex: index,
                    patterns: rawPatterns.map(sanitizePattern).filter(Boolean)
                };
            })
            .filter((meter) => meter.patterns.length > 0);
    }

    function sanitizedEditDistance(left, right) {
        if (left === right) {
            return 0;
        }

        let longer = left;
        let shorter = right;
        if (longer.length < shorter.length) {
            longer = right;
            shorter = left;
        }
        if (shorter.length === 0) {
            return longer.length;
        }

        // Reuse one compact row instead of allocating an array for every
        // character. Meter patterns are short, so keeping the shorter string
        // on this axis also bounds memory during long in-progress lines.
        const row = new Uint32Array(shorter.length + 1);
        for (let index = 0; index <= shorter.length; index += 1) {
            row[index] = index;
        }

        for (let i = 1; i <= longer.length; i += 1) {
            let diagonal = row[0];
            row[0] = i;

            for (let j = 1; j <= shorter.length; j += 1) {
                const above = row[j];
                row[j] = Math.min(
                    row[j - 1] + 1,
                    above + 1,
                    diagonal + (longer.charCodeAt(i - 1) === shorter.charCodeAt(j - 1) ? 0 : 1)
                );
                diagonal = above;
            }
        }

        return row[shorter.length];
    }

    function editDistance(left, right) {
        return sanitizedEditDistance(sanitizePattern(left), sanitizePattern(right));
    }

    function expectedForLine(meter, lineIndex) {
        if (!meter || meter.patterns.length === 0) {
            return "";
        }
        if (meter.patterns.length === 1) {
            return meter.patterns[0];
        }
        return meter.patterns[lineIndex] || "";
    }

    function scoreMeter(linePatterns, meter) {
        let distance = 0;
        let comparedLength = 0;
        let prefixCompatible = linePatterns.length > 0;
        let exactLines = linePatterns.length > 0;

        for (let index = 0; index < linePatterns.length; index += 1) {
            const actual = linePatterns[index];
            const expected = expectedForLine(meter, index);
            if (!expected) {
                distance += Math.max(1, actual.length);
                comparedLength += Math.max(1, actual.length);
                prefixCompatible = false;
                exactLines = false;
                continue;
            }

            // Both values are already normalized to G/L-only strings.
            distance += sanitizedEditDistance(actual, expected);
            comparedLength += Math.max(actual.length, expected.length, 1);
            prefixCompatible = prefixCompatible && expected.startsWith(actual);
            exactLines = exactLines && actual === expected;
        }

        if (meter.patterns.length > 1 && linePatterns.length > meter.patterns.length) {
            prefixCompatible = false;
            exactLines = false;
        }

        const hasExpectedLineCount = meter.patterns.length === 1 ||
            linePatterns.length === meter.patterns.length;
        const status = exactLines && hasExpectedLineCount
            ? "exact"
            : prefixCompatible
                ? "compatible"
                : "approximate";

        return {
            status,
            distance,
            score: comparedLength ? distance / comparedLength : 1
        };
    }

    function rankMeters(linePatterns, meters, limit) {
        const statusRank = { exact: 0, compatible: 1, approximate: 2 };
        const scored = meters.map((meter) => ({
            id: meter.id,
            name: meter.name,
            patterns: meter.patterns,
            ...scoreMeter(linePatterns, meter)
        }));

        scored.sort((left, right) =>
            statusRank[left.status] - statusRank[right.status] ||
            left.score - right.score ||
            left.distance - right.distance ||
            left.name.localeCompare(right.name)
        );

        return scored.slice(0, limit || 8);
    }

    function selectedMeterFor(index, selectedMeters) {
        if (!selectedMeters) {
            return "";
        }
        if (typeof selectedMeters === "string") {
            return selectedMeters;
        }
        if (Array.isArray(selectedMeters)) {
            return selectedMeters[index] || "";
        }
        return selectedMeters[index] || selectedMeters[String(index)] || "";
    }

    function analyzeComposition(text, catalog, selectedMeters) {
        const originalText = String(text || "");
        const meters = normalizeCatalog(catalog);
        const meterById = new Map(meters.map((meter) => [meter.id, meter]));
        const parsedStanzas = parseStanzas(originalText);
        const allSegments = [];
        const unsupported = [];
        const scripts = new Set();

        const stanzas = parsedStanzas.map((stanza, stanzaIndex) => {
            const selectedMeterId = selectedMeterFor(stanzaIndex, selectedMeters);
            const selectedMeter = meterById.get(selectedMeterId) || null;
            const lines = stanza.lines.map((line, lineIndex) => {
                const segmented = segmentLine(line.text, line.start);
                if (segmented.script !== "unknown") {
                    scripts.add(segmented.script);
                }

                const expectedPattern = expectedForLine(selectedMeter, lineIndex);
                const syllables = segmented.syllables.map((syllable, syllableIndex) => {
                    const expected = expectedPattern[syllableIndex] || "";
                    const violation = Boolean(selectedMeter) &&
                        (!expected || expected !== syllable.classification);
                    const result = {
                        ...syllable,
                        expected,
                        violation,
                        violationReason: !expected
                            ? "extra-syllable"
                            : violation
                                ? "weight-mismatch"
                                : ""
                    };
                    allSegments.push(result);
                    return result;
                });
                unsupported.push(...segmented.unsupported);

                return {
                    ...line,
                    index: lineIndex,
                    script: segmented.script,
                    syllables,
                    pattern: syllables.map((item) => item.classification).join(""),
                    expectedPattern,
                    missingCount: selectedMeter
                        ? Math.max(0, expectedPattern.length - syllables.length)
                        : 0,
                    violationCount: syllables.filter((item) => item.violation).length
                };
            });

            const linePatterns = lines.map((line) => line.pattern);
            const candidates = rankMeters(linePatterns, meters, 8);
            const violationCount = lines.reduce((sum, line) => sum + line.violationCount, 0);
            const missingCount = lines.reduce((sum, line) => sum + line.missingCount, 0);

            return {
                ...stanza,
                index: stanzaIndex,
                lines,
                patterns: linePatterns,
                scripts: Array.from(new Set(lines.map((line) => line.script)
                    .filter((script) => script !== "unknown"))),
                candidates,
                selectedMeterId: selectedMeter ? selectedMeter.id : "",
                selectedMeter: selectedMeter ? {
                    id: selectedMeter.id,
                    name: selectedMeter.name,
                    patterns: selectedMeter.patterns
                } : null,
                violationCount,
                missingCount
            };
        });

        return {
            text: originalText,
            stanzas,
            segments: allSegments.sort((a, b) => a.start - b.start),
            unsupported,
            scripts: Array.from(scripts),
            meterCount: meters.length
        };
    }

    function analyzeMeter(text, selectedMeter, catalog) {
        const activeCatalog = catalog ||
            (typeof globalThis !== "undefined" ? globalThis.CHANDAS_METER_CATALOG : null);
        const result = analyzeComposition(text, activeCatalog, selectedMeter || "");
        const firstStanza = result.stanzas[0];
        const firstCandidate = firstStanza && firstStanza.candidates[0];

        return {
            pattern: result.segments.map((item, index) => ({
                syllable: item.text,
                expected: item.expected,
                actual: item.actual,
                index,
                start: item.start,
                end: item.end,
                violation: item.violation
            })),
            detectedScript: result.scripts[0] || "Unknown",
            detectedmeter: firstCandidate && firstCandidate.status === "exact"
                ? firstCandidate.name
                : "Unknown",
            aproxmeters: firstStanza
                ? firstStanza.candidates.map((candidate) => candidate.name)
                : [],
            selectedMeter: selectedMeter || null,
            stanzas: result.stanzas
        };
    }

    return {
        GURU,
        LAGHU,
        SCRIPT_CONFIG,
        analyzeComposition,
        analyzeMeter,
        detectScript,
        editDistance,
        normalizeCatalog,
        parseStanzas,
        rankMeters,
        sanitizePattern,
        segmentLine
    };
}));
