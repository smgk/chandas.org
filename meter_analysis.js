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
    const AMSHA_PATTERNS = Object.freeze({
        B: Object.freeze(["GG", "LLG", "GL", "LLL"]),
        V: Object.freeze([
            "GGG", "LLGG", "GLG", "LLLG",
            "GGL", "LLGL", "GLL", "LLLL"
        ]),
        R: Object.freeze([
            "GGGG", "LLGGG", "GLGG", "LLLGG",
            "GGLG", "LLGLG", "GLLG", "LLLLG",
            "GGGL", "LLGGL", "GLGL", "LLLGL",
            "GGLL", "LLGLL", "GLLL", "LLLLL"
        ])
    });

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

    function parsePadas(stanza, lines) {
        const padas = [];
        const delimiter = /[।॥|]+/gu;

        for (const line of lines) {
            let chunkStart = line.start;
            let match;

            while ((match = delimiter.exec(line.text)) !== null) {
                appendPada(chunkStart, line.start + match.index, line);
                chunkStart = line.start + match.index + match[0].length;
            }
            appendPada(chunkStart, line.end, line);
            delimiter.lastIndex = 0;
        }

        function appendPada(rawStart, rawEnd, sourceLine) {
            let start = rawStart;
            let end = rawEnd;
            while (start < end && /\s/u.test(stanza.text[start - stanza.start])) {
                start += 1;
            }
            while (end > start && /\s/u.test(stanza.text[end - stanza.start - 1])) {
                end -= 1;
            }

            const syllables = lines.flatMap((line) => line.syllables)
                .filter((syllable) => syllable.start >= start && syllable.end <= end);
            if (!syllables.length) {
                return;
            }

            padas.push({
                index: padas.length,
                lineIndex: sourceLine.index,
                sourceLineStart: sourceLine.start,
                sourceLineEnd: sourceLine.end,
                sourceLineText: sourceLine.text,
                start,
                end,
                text: stanza.text.slice(start - stanza.start, end - stanza.start),
                syllables,
                pattern: syllables.map((item) => item.classification).join(""),
                matras: syllables.reduce(
                    (total, item) => total + (item.classification === GURU ? 2 : 1),
                    0
                )
            });
        }

        return padas;
    }

    function sanitizePattern(pattern) {
        return String(pattern || "").toUpperCase().replace(/[^GL]/g, "");
    }

    function expandFixedVersePatterns(patterns, lineCount) {
        const count = Number.isInteger(lineCount) && lineCount > 0 ? lineCount : 4;
        if (!patterns.length) {
            return [];
        }
        if (patterns.length === count) {
            return patterns.slice();
        }
        if (patterns.length === 2 && count === 4) {
            return [patterns[0], patterns[1], patterns[0], patterns[1]];
        }
        return Array.from({ length: count }, (_, index) =>
            patterns[index % patterns.length]);
    }

    function normalizeCatalog(catalog) {
        if (!catalog) {
            return [];
        }

        const rawEntries = Array.isArray(catalog) ? catalog : catalog.metres;
        const fixedMeters = (Array.isArray(rawEntries) ? rawEntries : [])
            .filter((entry) => Array.isArray(entry) && entry.length >= 2)
            .map((entry, index) => {
                const rawPatterns = Array.isArray(entry[1]) ? entry[1] : [entry[1]];
                const patterns = rawPatterns.map(sanitizePattern).filter(Boolean);
                const linePolicy = { type: "fixed", count: 4 };
                return {
                    id: String(entry[0]),
                    name: String(entry[0]),
                    sourceIndex: index,
                    kind: "fixed",
                    aliases: [],
                    patterns,
                    linePolicy,
                    versePatterns: expandFixedVersePatterns(patterns, linePolicy.count)
                };
            })
            .filter((meter) => meter.patterns.length > 0);

        const structuralEntries = !Array.isArray(catalog) &&
            Array.isArray(catalog.structuralMeters)
            ? catalog.structuralMeters
            : [];
        const structuralMeters = structuralEntries
            .filter((entry) => entry && entry.id && entry.name &&
                (entry.kind === "matra" || entry.kind === "amsha" ||
                    entry.kind === "syllable-structural"))
            .map((entry, index) => ({
                ...entry,
                id: String(entry.id),
                name: String(entry.name),
                aliases: Array.isArray(entry.aliases) ? entry.aliases.map(String) : [],
                sourceIndex: index,
                patterns: Array.isArray(entry.signatureLines)
                    ? entry.signatureLines.map(String)
                    : []
            }));

        return fixedMeters.concat(structuralMeters);
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
        if (!meter) {
            return "";
        }
        const versePatterns = meter.versePatterns ||
            expandFixedVersePatterns(meter.patterns || [], 4);
        if (lineIndex < 0 || lineIndex >= versePatterns.length) {
            return "";
        }
        return versePatterns[lineIndex] || "";
    }

    function scoreMeter(linePatterns, meter) {
        const expectedLines = meter.versePatterns ||
            expandFixedVersePatterns(meter.patterns || [], 4);
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

        if (linePatterns.length > expectedLines.length) {
            prefixCompatible = false;
            exactLines = false;
        }

        const hasExpectedLineCount = linePatterns.length === expectedLines.length;
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
        const scored = meters.filter((meter) => meter.kind === "fixed").map((meter) => ({
            id: meter.id,
            name: meter.name,
            kind: meter.kind,
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

    function setViolation(syllable, reason, expected, shouldMark) {
        if (!shouldMark) {
            return;
        }
        syllable.violation = true;
        syllable.violationReason = reason;
        if (expected) {
            syllable.expected = expected;
        }
    }

    function matraValue(syllable) {
        return syllable.classification === GURU ? 2 : 1;
    }

    function collectMatraGroups(pada, capacities, globalOffset) {
        const groups = [];
        let syllableIndex = 0;

        for (let localIndex = 0; localIndex < capacities.length; localIndex += 1) {
            const capacity = capacities[localIndex];
            const syllables = [];
            let matras = 0;

            while (syllableIndex < pada.syllables.length && matras < capacity) {
                const syllable = pada.syllables[syllableIndex];
                syllables.push(syllable);
                matras += matraValue(syllable);
                syllableIndex += 1;
            }

            groups.push({
                globalIndex: globalOffset + localIndex + 1,
                localIndex: localIndex + 1,
                capacity,
                matras,
                complete: matras === capacity,
                overrun: matras > capacity,
                syllables,
                pattern: syllables.map((syllable) => syllable.classification).join("")
            });
        }

        return groups;
    }

    function ruleTargetsGroup(rule, group, padaIndex) {
        const hasSelector = Boolean(
            rule.everyGroup ||
            Array.isArray(rule.globalGroups) ||
            Array.isArray(rule.padas) ||
            Array.isArray(rule.localGroups)
        );
        if (!hasSelector) {
            return false;
        }
        if (Array.isArray(rule.globalGroups) &&
            !rule.globalGroups.includes(group.globalIndex)) {
            return false;
        }
        if (Array.isArray(rule.padas) && !rule.padas.includes(padaIndex + 1)) {
            return false;
        }
        if (Array.isArray(rule.localGroups) &&
            !rule.localGroups.includes(group.localIndex)) {
            return false;
        }
        return true;
    }

    function markGroupRuleViolation(group, reason, expected, shouldMark) {
        const syllable = group.syllables[group.syllables.length - 1];
        if (syllable) {
            setViolation(syllable, reason || "invalid-matra-gana", expected, shouldMark);
        }
    }

    function evaluateMatraGroupRules(group, pada, padaIndex, meter, shouldMark) {
        if (!group.complete || group.overrun) {
            return 0;
        }

        let failures = 0;
        for (const rule of meter.groupRules || []) {
            if (!ruleTargetsGroup(rule, group, padaIndex)) {
                continue;
            }

            const allowed = Array.isArray(rule.allowedPatterns)
                ? rule.allowedPatterns
                : [];
            const forbidden = Array.isArray(rule.forbiddenPatterns)
                ? rule.forbiddenPatterns
                : [];
            const forbiddenPrefixes = Array.isArray(rule.forbiddenPrefixes)
                ? rule.forbiddenPrefixes
                : [];
            const allowedPrefixes = Array.isArray(rule.allowedPrefixes)
                ? rule.allowedPrefixes
                : [];
            const violatesAllowed = allowed.length > 0 && !allowed.includes(group.pattern);
            const violatesForbidden = forbidden.includes(group.pattern);
            const forbiddenPrefix = forbiddenPrefixes.find((prefix) =>
                group.pattern.startsWith(prefix));
            const violatesAllowedPrefix = allowedPrefixes.length > 0 &&
                !allowedPrefixes.some((prefix) => group.pattern.startsWith(prefix));
            if (!violatesAllowed && !violatesForbidden && !forbiddenPrefix &&
                !violatesAllowedPrefix) {
                continue;
            }

            failures += 1;
            const expected = violatesAllowed
                ? allowed.join(" or ")
                : violatesAllowedPrefix
                    ? `beginning ${allowedPrefixes.join(" or ")}`
                : forbiddenPrefix
                    ? `not beginning ${forbiddenPrefix}`
                    : `not ${group.pattern}`;
            markGroupRuleViolation(
                group,
                rule.violationReason,
                expected,
                shouldMark
            );
        }

        for (const rule of meter.boundaryRules || []) {
            if (!ruleTargetsGroup(rule, group, padaIndex)) {
                continue;
            }
            if (Array.isArray(rule.whenPatterns) &&
                !rule.whenPatterns.includes(group.pattern)) {
                continue;
            }

            const boundaryIndex = Number(rule.afterSyllable);
            const before = group.syllables[boundaryIndex - 1];
            const after = group.syllables[boundaryIndex];
            if (!before || !after) {
                continue;
            }
            const gap = pada.text.slice(
                before.end - pada.start,
                after.start - pada.start
            );
            if (gap && METRIC_BOUNDARY_RE.test(gap)) {
                continue;
            }

            failures += 1;
            setViolation(
                after,
                rule.violationReason || "required-boundary",
                `boundary after syllable ${boundaryIndex}`,
                shouldMark
            );
        }

        return failures;
    }

    function amshaSlotClasses(slot) {
        const classes = Array.isArray(slot) ? slot : [slot];
        return classes.map((item) => String(item || "").toUpperCase())
            .filter((item) => AMSHA_PATTERNS[item]);
    }

    function amshaSlotPatterns(slot) {
        return Array.from(new Set(amshaSlotClasses(slot)
            .flatMap((item) => AMSHA_PATTERNS[item])));
    }

    function amshaGroupLabel(slot) {
        return amshaSlotClasses(slot).join("/") || "?";
    }

    function matchAmshaPada(pada, slots, globalGroupOffset) {
        const actual = pada.pattern;
        let states = [{
            position: 0,
            groups: []
        }];
        const completedLevels = [states];

        for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
            const patterns = amshaSlotPatterns(slots[slotIndex]);
            const nextByPosition = new Map();
            for (const state of states) {
                for (const pattern of patterns) {
                    if (!actual.startsWith(pattern, state.position)) {
                        continue;
                    }
                    const end = state.position + pattern.length;
                    const candidate = {
                        position: end,
                        groups: state.groups.concat({
                            localIndex: slotIndex + 1,
                            globalIndex: globalGroupOffset + slotIndex + 1,
                            expectedClass: amshaGroupLabel(slots[slotIndex]),
                            pattern,
                            complete: true,
                            overrun: false,
                            syllables: pada.syllables.slice(state.position, end)
                        })
                    };
                    if (!nextByPosition.has(end)) {
                        nextByPosition.set(end, candidate);
                    }
                }
            }
            states = Array.from(nextByPosition.values());
            completedLevels.push(states);
            if (!states.length) {
                break;
            }
        }

        const exact = states.find((state) =>
            state.groups.length === slots.length && state.position === actual.length);
        if (exact) {
            return {
                groups: exact.groups,
                ruleFailures: 0,
                missingCount: 0,
                invalidIndex: -1,
                extraStart: -1
            };
        }

        const completeWithExtra = states
            .filter((state) => state.groups.length === slots.length)
            .sort((left, right) => right.position - left.position)[0];
        if (completeWithExtra && completeWithExtra.position < actual.length) {
            return {
                groups: completeWithExtra.groups,
                ruleFailures: actual.length - completeWithExtra.position,
                missingCount: 0,
                invalidIndex: -1,
                extraStart: completeWithExtra.position
            };
        }

        let bestPartial = null;
        for (let level = 0; level < completedLevels.length; level += 1) {
            for (const state of completedLevels[level]) {
                if (state.position > actual.length) {
                    continue;
                }
                const remaining = actual.slice(state.position);
                const nextSlot = slots[state.groups.length];
                const isPrefix = remaining.length === 0 ||
                    (nextSlot && amshaSlotPatterns(nextSlot)
                        .some((pattern) => pattern.startsWith(remaining)));
                if (!isPrefix) {
                    continue;
                }
                if (!bestPartial || state.position > bestPartial.position ||
                    (state.position === bestPartial.position &&
                        state.groups.length > bestPartial.groups.length)) {
                    bestPartial = state;
                }
            }
        }
        if (bestPartial && (bestPartial.position === actual.length ||
            amshaSlotPatterns(slots[bestPartial.groups.length] || [])
                .some((pattern) => pattern.startsWith(
                    actual.slice(bestPartial.position))))) {
            return {
                groups: bestPartial.groups,
                ruleFailures: 0,
                missingCount: Math.max(1, slots.length - bestPartial.groups.length),
                invalidIndex: -1,
                extraStart: -1
            };
        }

        const allStates = completedLevels.flat();
        const best = allStates.sort((left, right) =>
            right.position - left.position ||
            right.groups.length - left.groups.length)[0] || {
            position: 0,
            groups: []
        };
        return {
            groups: best.groups,
            ruleFailures: 1,
            missingCount: Math.max(0, slots.length - best.groups.length - 1),
            invalidIndex: Math.min(best.position, Math.max(0, actual.length - 1)),
            extraStart: -1
        };
    }

    function evaluateLineBoundaryRules(pada, groups, padaIndex, meter, shouldMark) {
        let failures = 0;
        for (const rule of meter.lineBoundaryRules || []) {
            if (Array.isArray(rule.padas) && !rule.padas.includes(padaIndex + 1)) {
                continue;
            }
            const boundaryIndex = Number(rule.afterGroup);
            const beforeGroup = groups[boundaryIndex - 1];
            const afterGroup = groups[boundaryIndex];
            const before = beforeGroup && beforeGroup.syllables.at(-1);
            const after = afterGroup && afterGroup.syllables[0];
            if (!before || !after) {
                continue;
            }
            const gap = pada.text.slice(
                before.end - pada.start,
                after.start - pada.start
            );
            if (gap && METRIC_BOUNDARY_RE.test(gap)) {
                continue;
            }
            failures += 1;
            setViolation(
                after,
                rule.violationReason || "required-yati",
                `boundary after gaṇa ${boundaryIndex}`,
                shouldMark
            );
        }
        return failures;
    }

    function evaluateAmshaMeter(padas, meter, shouldMark) {
        let ruleFailures = 0;
        let missingCount = 0;
        let expectedUnits = 0;
        let globalGroupOffset = 0;
        const expectedPadas = meter.amshaGroups || [];
        const lineCount = Math.max(padas.length, expectedPadas.length);

        for (let padaIndex = 0; padaIndex < lineCount; padaIndex += 1) {
            const pada = padas[padaIndex];
            const slots = expectedPadas[padaIndex];
            if (!slots) {
                if (pada) {
                    ruleFailures += pada.syllables.length;
                    pada.syllables.forEach((syllable) =>
                        setViolation(syllable, "extra-pada", "", shouldMark));
                }
                continue;
            }
            expectedUnits += slots.length;
            if (!pada) {
                missingCount += slots.length;
                globalGroupOffset += slots.length;
                continue;
            }

            const matched = matchAmshaPada(pada, slots, globalGroupOffset);
            ruleFailures += matched.ruleFailures;
            missingCount += matched.missingCount;
            if (shouldMark && matched.extraStart >= 0) {
                pada.syllables.slice(matched.extraStart).forEach((syllable) =>
                    setViolation(syllable, "extra-amsha", "", true));
            } else if (shouldMark && matched.invalidIndex >= 0) {
                const syllable = pada.syllables[matched.invalidIndex];
                setViolation(
                    syllable,
                    "invalid-amsha-gana",
                    amshaGroupLabel(slots[matched.groups.length]),
                    true
                );
            }
            for (const group of matched.groups) {
                ruleFailures += evaluateMatraGroupRules(
                    group,
                    pada,
                    padaIndex,
                    meter,
                    shouldMark
                );
            }
            ruleFailures += evaluateLineBoundaryRules(
                pada,
                matched.groups,
                padaIndex,
                meter,
                shouldMark
            );
            globalGroupOffset += slots.length;
        }

        ruleFailures += evaluateLineRelations(padas, meter, shouldMark);
        const result = structuralScore(
            padas,
            expectedPadas.length,
            ruleFailures,
            missingCount,
            expectedUnits
        );
        if (result.status === "exact" && meter.ruleCompleteness !== "complete") {
            result.status = "compatible";
        }
        return result;
    }

    function repeatingLinePolicy(meter) {
        return meter.linePolicy &&
            (meter.linePolicy.type === "repeating" ||
                meter.linePolicy.type === "variable");
    }

    function indexedRule(rules, index, meter) {
        if (!Array.isArray(rules) || rules.length === 0) {
            return null;
        }
        if (repeatingLinePolicy(meter)) {
            return rules[index % rules.length];
        }
        return rules[index] || null;
    }

    function matraGroupOptions(meter, padaIndex) {
        const configured = indexedRule(meter.padaGroupOptions, padaIndex, meter);
        if (Array.isArray(configured) && configured.length > 0) {
            return configured;
        }
        const groups = indexedRule(meter.padaGroups, padaIndex, meter);
        return Array.isArray(groups) ? [groups] : [];
    }

    function evaluateMatraPada(pada, groups, globalGroupOffset, padaIndex, meter, shouldMark) {
        let ruleFailures = 0;
        let missingCount = 0;
        const target = groups.reduce((sum, value) => sum + value, 0);
        const boundaries = new Set();
        let boundary = 0;
        groups.slice(0, -1).forEach((group) => {
            boundary += group;
            boundaries.add(boundary);
        });

        let running = 0;
        let hasExcessFailure = false;
        for (const syllable of pada.syllables) {
            const previous = running;
            running += matraValue(syllable);
            const crossedBoundary = Array.from(boundaries)
                .find((value) => previous < value && running > value);
            if (crossedBoundary !== undefined) {
                ruleFailures += 1;
                setViolation(
                    syllable,
                    "matra-group-overrun",
                    `${crossedBoundary} mātrā boundary`,
                    shouldMark
                );
            } else if (previous >= target) {
                ruleFailures += 1;
                hasExcessFailure = true;
                setViolation(syllable, "extra-matra", `${target} mātrās`, shouldMark);
            }
        }

        if (running < target) {
            missingCount += target - running;
        } else if (running > target && !hasExcessFailure) {
            ruleFailures += 1;
            const last = pada.syllables[pada.syllables.length - 1];
            setViolation(last, "extra-matra", `${target} mātrās`, shouldMark);
        }

        const collectedGroups = collectMatraGroups(pada, groups, globalGroupOffset);
        for (const group of collectedGroups) {
            ruleFailures += evaluateMatraGroupRules(
                group,
                pada,
                padaIndex,
                meter,
                shouldMark
            );
        }

        return {
            groups,
            target,
            ruleFailures,
            missingCount
        };
    }

    function rhymeKeyForPada(pada) {
        const syllable = pada && pada.syllables[pada.syllables.length - 1];
        const config = syllable && SCRIPT_CONFIG[syllable.script];
        if (!syllable || !config) {
            return null;
        }
        const consonants = codePoints(syllable.text)
            .filter((point) => inRange(point.cp, config.consonant))
            .map((point) => point.char)
            .join("");
        return consonants ? { key: consonants, syllable } : null;
    }

    function evaluateLineRelations(padas, meter, shouldMark) {
        let failures = 0;
        for (const relation of meter.lineRelations || []) {
            if (relation.type !== "pairwise-antya-prasa") {
                continue;
            }
            const pairSize = Number.isInteger(relation.pairSize) && relation.pairSize > 1
                ? relation.pairSize
                : 2;
            for (let start = 0; start + pairSize <= padas.length; start += pairSize) {
                const reference = rhymeKeyForPada(padas[start]);
                if (!reference) {
                    continue;
                }
                for (let offset = 1; offset < pairSize; offset += 1) {
                    const current = rhymeKeyForPada(padas[start + offset]);
                    if (!current || current.syllable.script !== reference.syllable.script ||
                        current.key === reference.key) {
                        continue;
                    }
                    failures += 1;
                    setViolation(
                        current.syllable,
                        relation.violationReason || "antya-prasa-mismatch",
                        `ending consonant ${reference.key}`,
                        shouldMark
                    );
                }
            }
        }
        return failures;
    }

    function mergePadasByLine(padas) {
        const lines = [];
        for (const pada of padas) {
            const previous = lines[lines.length - 1];
            if (!previous || previous.lineIndex !== pada.lineIndex) {
                lines.push({
                    ...pada,
                    index: lines.length,
                    start: pada.sourceLineStart,
                    end: pada.sourceLineEnd,
                    text: pada.sourceLineText,
                    syllables: pada.syllables.slice()
                });
                continue;
            }
            previous.syllables.push(...pada.syllables);
            previous.pattern = previous.syllables
                .map((syllable) => syllable.classification).join("");
            previous.matras = previous.syllables.reduce(
                (sum, syllable) => sum + matraValue(syllable),
                0
            );
        }
        return lines;
    }

    function evaluateSyllableStructuralMeter(padas, meter, shouldMark) {
        let ruleFailures = 0;
        let missingCount = 0;
        const expectedPadas = meter.padas || [];

        for (let padaIndex = 0; padaIndex < Math.max(padas.length, expectedPadas.length);
            padaIndex += 1) {
            const pada = padas[padaIndex];
            const rule = expectedPadas[padaIndex];
            if (!rule) {
                if (pada) {
                    ruleFailures += pada.syllables.length;
                    pada.syllables.forEach((syllable) =>
                        setViolation(syllable, "extra-pada", "", shouldMark));
                }
                continue;
            }
            if (!pada) {
                missingCount += rule.syllables;
                continue;
            }

            if (pada.syllables.length > rule.syllables) {
                const extras = pada.syllables.slice(rule.syllables);
                ruleFailures += extras.length;
                extras.forEach((syllable) =>
                    setViolation(syllable, "extra-syllable", "", shouldMark));
            } else {
                missingCount += rule.syllables - pada.syllables.length;
            }

            if (rule.cadence) {
                const cadenceStart = rule.cadence.start - 1;
                for (let offset = 0; offset < rule.cadence.pattern.length; offset += 1) {
                    const syllable = pada.syllables[cadenceStart + offset];
                    const expected = rule.cadence.pattern[offset];
                    if (syllable && syllable.classification !== expected) {
                        ruleFailures += 1;
                        setViolation(syllable, "weight-mismatch", expected, shouldMark);
                    }
                }
            }

            for (const forbidden of rule.forbidden || []) {
                const sequenceStart = forbidden.start - 1;
                const sequenceEnd = sequenceStart + forbidden.patterns[0].length;
                if (pada.syllables.length < sequenceEnd) {
                    continue;
                }
                const actual = pada.syllables.slice(sequenceStart, sequenceEnd)
                    .map((syllable) => syllable.classification).join("");
                if (forbidden.patterns.includes(actual)) {
                    ruleFailures += 1;
                    pada.syllables.slice(sequenceStart, sequenceEnd).forEach((syllable) =>
                        setViolation(
                            syllable,
                            "forbidden-sequence",
                            `not ${actual}`,
                            shouldMark
                        ));
                }
            }
        }

        const result = structuralScore(
            padas,
            expectedPadas.length,
            ruleFailures,
            missingCount,
            expectedPadas.reduce((sum, rule) => sum + rule.syllables, 0)
        );
        return result;
    }

    function evaluateMatraMeter(padas, meter, shouldMark) {
        let ruleFailures = 0;
        let missingCount = 0;
        const expectedPadas = meter.padaGroups || [];
        const isRepeating = repeatingLinePolicy(meter);
        const minimumLines = isRepeating
            ? Math.max(1, Number(meter.linePolicy.min) || 1)
            : expectedPadas.length;
        const maximumLines = isRepeating && Number.isInteger(meter.linePolicy.max)
            ? meter.linePolicy.max
            : Infinity;
        const evaluatedLineCount = isRepeating
            ? Math.max(padas.length, minimumLines)
            : Math.max(padas.length, expectedPadas.length);
        let globalGroupOffset = 0;
        let expectedUnits = 0;

        for (let padaIndex = 0; padaIndex < evaluatedLineCount; padaIndex += 1) {
            const pada = padas[padaIndex];
            const options = matraGroupOptions(meter, padaIndex);
            if (!options.length || padaIndex >= maximumLines) {
                if (pada) {
                    ruleFailures += pada.syllables.length;
                    pada.syllables.forEach((syllable) =>
                        setViolation(syllable, "extra-pada", "", shouldMark));
                }
                continue;
            }

            const primaryGroups = options[0];
            const target = primaryGroups.reduce((sum, value) => sum + value, 0);
            expectedUnits += target;
            if (!pada) {
                missingCount += target;
                globalGroupOffset += primaryGroups.length;
                continue;
            }

            const candidates = options.map((groups, optionIndex) => ({
                optionIndex,
                ...evaluateMatraPada(
                    pada,
                    groups,
                    globalGroupOffset,
                    padaIndex,
                    meter,
                    false
                )
            })).sort((left, right) =>
                left.ruleFailures - right.ruleFailures ||
                left.missingCount - right.missingCount ||
                left.optionIndex - right.optionIndex);
            const selected = shouldMark
                ? evaluateMatraPada(
                    pada,
                    candidates[0].groups,
                    globalGroupOffset,
                    padaIndex,
                    meter,
                    true
                )
                : candidates[0];
            ruleFailures += selected.ruleFailures;
            missingCount += selected.missingCount;
            globalGroupOffset += selected.groups.length;
        }

        ruleFailures += evaluateLineRelations(padas, meter, shouldMark);
        const lineCountComplete = isRepeating
            ? padas.length >= minimumLines && padas.length <= maximumLines
            : padas.length === expectedPadas.length;
        const result = structuralScore(
            padas,
            isRepeating ? padas.length : expectedPadas.length,
            ruleFailures,
            missingCount,
            expectedUnits,
            lineCountComplete
        );
        if (result.status === "exact" && meter.ruleCompleteness !== "complete") {
            result.status = "compatible";
        }
        return result;
    }

    function structuralScore(
        padas,
        expectedPadaCount,
        ruleFailures,
        missingCount,
        expectedUnits,
        lineCountComplete
    ) {
        const complete = (lineCountComplete === undefined
            ? padas.length === expectedPadaCount
            : lineCountComplete) && missingCount === 0;
        const status = ruleFailures === 0
            ? complete ? "exact" : "compatible"
            : "approximate";
        const comparedLength = Math.max(
            1,
            padas.reduce((sum, pada) => sum + pada.syllables.length, 0)
        );

        return {
            status,
            distance: ruleFailures + missingCount,
            score: (ruleFailures + (missingCount * 0.05)) /
                Math.max(comparedLength, expectedUnits || 1),
            missingCount,
            violationCount: ruleFailures
        };
    }

    function scoreStructuralMeter(padas, meter, shouldMark) {
        const metricUnits = meter.linePolicy && meter.linePolicy.unit === "line"
            ? mergePadasByLine(padas)
            : padas;
        if (meter.kind === "syllable-structural") {
            return evaluateSyllableStructuralMeter(metricUnits, meter, shouldMark);
        }
        if (meter.kind === "amsha") {
            return evaluateAmshaMeter(metricUnits, meter, shouldMark);
        }
        return evaluateMatraMeter(metricUnits, meter, shouldMark);
    }

    function rankStructuralMeters(padas, meters) {
        return meters
            .filter((meter) => meter.kind !== "fixed")
            .map((meter) => ({
                id: meter.id,
                name: meter.name,
                kind: meter.kind,
                patterns: meter.patterns,
                ruleCompleteness: meter.ruleCompleteness || "",
                ...scoreStructuralMeter(padas, meter, false)
            }));
    }

    function sortCandidates(candidates, limit) {
        const statusRank = { exact: 0, compatible: 1, approximate: 2 };
        const completenessRank = {
            complete: 0,
            pathyā: 0,
            "provisional-rhythm": 1,
            "group-totals": 2
        };
        return candidates.sort((left, right) =>
            statusRank[left.status] - statusRank[right.status] ||
            (completenessRank[left.ruleCompleteness] ?? 1) -
                (completenessRank[right.ruleCompleteness] ?? 1) ||
            left.score - right.score ||
            left.distance - right.distance ||
            left.name.localeCompare(right.name)
        ).slice(0, limit || 8);
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
            const selectedFixedMeter = selectedMeter && selectedMeter.kind === "fixed"
                ? selectedMeter
                : null;
            const lines = stanza.lines.map((line, lineIndex) => {
                const segmented = segmentLine(line.text, line.start);
                if (segmented.script !== "unknown") {
                    scripts.add(segmented.script);
                }

                const expectedPattern = expectedForLine(selectedFixedMeter, lineIndex);
                const syllables = segmented.syllables.map((syllable, syllableIndex) => {
                    const expected = expectedPattern[syllableIndex] || "";
                    const violation = Boolean(selectedFixedMeter) &&
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
                    matraCount: syllables.reduce(
                        (total, item) =>
                            total + (item.classification === GURU ? 2 : 1),
                        0
                    ),
                    expectedPattern,
                    missingCount: selectedFixedMeter
                        ? Math.max(0, expectedPattern.length - syllables.length)
                        : 0,
                    violationCount: syllables.filter((item) => item.violation).length
                };
            });

            const linePatterns = lines.map((line) => line.pattern);
            const padas = parsePadas(stanza, lines);
            const displayedPadas = selectedMeter &&
                selectedMeter.linePolicy &&
                selectedMeter.linePolicy.unit === "line"
                ? mergePadasByLine(padas)
                : padas;
            let structuralValidation = null;
            if (selectedMeter && selectedMeter.kind !== "fixed") {
                structuralValidation = scoreStructuralMeter(padas, selectedMeter, true);
                lines.forEach((line) => {
                    line.violationCount = line.syllables
                        .filter((item) => item.violation).length;
                    line.missingCount = 0;
                });
            }
            const candidates = sortCandidates([
                ...rankMeters(linePatterns, meters, meters.length),
                ...rankStructuralMeters(padas, meters)
            ], 8);
            const violationCount = lines.reduce((sum, line) => sum + line.violationCount, 0);
            const missingCount = structuralValidation
                ? structuralValidation.missingCount
                : lines.reduce((sum, line) => sum + line.missingCount, 0) +
                    (selectedFixedMeter
                        ? selectedFixedMeter.versePatterns.slice(lines.length)
                            .reduce((sum, pattern) => sum + pattern.length, 0)
                        : 0);

            return {
                ...stanza,
                index: stanzaIndex,
                lines,
                padas,
                patterns: linePatterns,
                matraPattern: displayedPadas.map((pada) => pada.matras),
                scripts: Array.from(new Set(lines.map((line) => line.script)
                    .filter((script) => script !== "unknown"))),
                candidates,
                selectedMeterId: selectedMeter ? selectedMeter.id : "",
                selectedMeter: selectedMeter ? {
                    id: selectedMeter.id,
                    name: selectedMeter.name,
                    kind: selectedMeter.kind,
                    patterns: selectedMeter.patterns,
                    ruleCompleteness: selectedMeter.ruleCompleteness || "fixed",
                    uncheckedRules: Array.isArray(selectedMeter.uncheckedRules)
                        ? selectedMeter.uncheckedRules
                        : []
                } : null,
                violationCount,
                missingCount
            };
        });

        return {
            text: originalText,
            analysisVersion: "2.4.0",
            catalogVersion: catalog && catalog.structuralCatalogVersion
                ? String(catalog.structuralCatalogVersion)
                : "",
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
            detectedmeter: firstCandidate && firstCandidate.status !== "approximate"
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
        AMSHA_PATTERNS,
        SCRIPT_CONFIG,
        analyzeComposition,
        analyzeMeter,
        detectScript,
        editDistance,
        expandFixedVersePatterns,
        normalizeCatalog,
        parsePadas,
        parseStanzas,
        rankMeters,
        rankStructuralMeters,
        rhymeKeyForPada,
        mergePadasByLine,
        sanitizePattern,
        scoreStructuralMeter,
        segmentLine
    };
}));
