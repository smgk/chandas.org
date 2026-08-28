/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function romanTransliterationModule(root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.ChandasRoman = api;
    }
}(typeof window !== "undefined" ? window : globalThis, function createRomanApi() {
    "use strict";

    const VERSION = "1.0.0";
    const VIRAMA = "्";

    const VOWELS = {
        a: ["अ", ""], aa: ["आ", "ा"], i: ["इ", "ि"], ii: ["ई", "ी"],
        u: ["उ", "ु"], uu: ["ऊ", "ू"], r: ["ऋ", "ृ"], rr: ["ॠ", "ॄ"],
        l: ["ऌ", "ॢ"], ll: ["ॡ", "ॣ"], e_short: ["ऎ", "ॆ"],
        e: ["ए", "े"], ai: ["ऐ", "ै"], o_short: ["ऒ", "ॊ"],
        o: ["ओ", "ो"], au: ["औ", "ौ"]
    };

    const CONSONANTS = {
        k: "क", kh: "ख", g: "ग", gh: "घ", ng: "ङ",
        c: "च", ch: "छ", j: "ज", jh: "झ", ny: "ञ",
        tt: "ट", tth: "ठ", dd: "ड", ddh: "ढ", nn: "ण",
        t: "त", th: "थ", d: "द", dh: "ध", n: "न",
        p: "प", ph: "फ", b: "ब", bh: "भ", m: "म",
        y: "य", r: "र", l: "ल", v: "व", sh: "श", ss: "ष",
        s: "स", h: "ह", retro_l: "ळ", old_l: "ऴ", retro_r: "ऱ"
    };

    function vowel(key) {
        return { type: "vowel", value: VOWELS[key] };
    }

    function consonant(key) {
        return { type: "consonant", value: CONSONANTS[key] };
    }

    function mark(value) {
        return { type: "mark", value };
    }

    function literal(value) {
        return { type: "literal", value };
    }

    function entries(values) {
        return Object.fromEntries(values);
    }

    const COMMON_IAST_CONSONANTS = [
        ["kh", consonant("kh")], ["gh", consonant("gh")],
        ["ch", consonant("ch")], ["jh", consonant("jh")],
        ["ṭh", consonant("tth")], ["ḍh", consonant("ddh")],
        ["th", consonant("th")], ["dh", consonant("dh")],
        ["ph", consonant("ph")], ["bh", consonant("bh")],
        ["k", consonant("k")], ["g", consonant("g")],
        ["ṅ", consonant("ng")], ["c", consonant("c")],
        ["j", consonant("j")], ["ñ", consonant("ny")],
        ["ṭ", consonant("tt")], ["ḍ", consonant("dd")],
        ["ṇ", consonant("nn")], ["t", consonant("t")],
        ["d", consonant("d")], ["n", consonant("n")],
        ["p", consonant("p")], ["b", consonant("b")],
        ["m", consonant("m")], ["y", consonant("y")],
        ["r", consonant("r")], ["l", consonant("l")],
        ["v", consonant("v")], ["ś", consonant("sh")],
        ["ṣ", consonant("ss")], ["s", consonant("s")],
        ["h", consonant("h")], ["ḻ", consonant("old_l")]
    ];

    const IAST = entries([
        ["ai", vowel("ai")], ["au", vowel("au")],
        ["ā", vowel("aa")], ["ī", vowel("ii")], ["ū", vowel("uu")],
        ["ṝ", vowel("rr")], ["ṛ", vowel("r")],
        ["ḹ", vowel("ll")], ["ḷ", vowel("l")],
        ["a", vowel("a")], ["i", vowel("i")], ["u", vowel("u")],
        ["e", vowel("e")], ["o", vowel("o")],
        ...COMMON_IAST_CONSONANTS,
        ["m̐", mark("ँ")], ["ṃ", mark("ं")], ["ṁ", mark("ं")],
        ["ḥ", mark("ः")], ["'", literal("ऽ")], ["’", literal("ऽ")]
    ]);

    const ISO = entries([
        ["r̥̄", vowel("rr")], ["l̥̄", vowel("ll")],
        ["r̥", vowel("r")], ["l̥", vowel("l")],
        ["ai", vowel("ai")], ["au", vowel("au")],
        ["ā", vowel("aa")], ["ī", vowel("ii")], ["ū", vowel("uu")],
        ["ē", vowel("e")], ["ō", vowel("o")],
        ["a", vowel("a")], ["i", vowel("i")], ["u", vowel("u")],
        ["e", vowel("e_short")], ["o", vowel("o_short")],
        ...COMMON_IAST_CONSONANTS,
        ["ḷ", consonant("retro_l")],
        ["ṁ", mark("ं")], ["ṃ", mark("ं")], ["m̐", mark("ँ")],
        ["ḥ", mark("ः")], ["'", literal("ऽ")], ["’", literal("ऽ")]
    ]);

    const ITRANS = entries([
        ["R^I", vowel("rr")], ["R^i", vowel("r")],
        ["L^I", vowel("ll")], ["L^i", vowel("l")],
        ["RRi", vowel("rr")], ["RRI", vowel("rr")],
        ["LLi", vowel("ll")], ["LLI", vowel("ll")],
        ["kSh", { type: "cluster", value: "क्ष" }],
        ["j~n", { type: "cluster", value: "ज्ञ" }],
        ["GY", { type: "cluster", value: "ज्ञ" }],
        ["chh", consonant("ch")], ["Ch", consonant("ch")],
        ["kh", consonant("kh")], ["gh", consonant("gh")],
        ["jh", consonant("jh")], ["Th", consonant("tth")],
        ["Dh", consonant("ddh")], ["th", consonant("th")],
        ["dh", consonant("dh")], ["ph", consonant("ph")],
        ["bh", consonant("bh")], ["~N", consonant("ng")],
        ["~n", consonant("ny")], ["aa", vowel("aa")],
        ["ii", vowel("ii")], ["uu", vowel("uu")],
        ["ai", vowel("ai")], ["au", vowel("au")],
        ["A", vowel("aa")], ["I", vowel("ii")], ["U", vowel("uu")],
        ["a", vowel("a")], ["i", vowel("i")], ["u", vowel("u")],
        ["e", vowel("e")], ["o", vowel("o")],
        ["k", consonant("k")], ["g", consonant("g")],
        ["ch", consonant("c")], ["c", consonant("c")],
        ["j", consonant("j")], ["T", consonant("tt")],
        ["D", consonant("dd")], ["N", consonant("nn")],
        ["t", consonant("t")], ["d", consonant("d")],
        ["n", consonant("n")], ["p", consonant("p")],
        ["b", consonant("b")], ["m", consonant("m")],
        ["y", consonant("y")], ["r", consonant("r")],
        ["l", consonant("l")], ["v", consonant("v")],
        ["sh", consonant("sh")], ["Sh", consonant("ss")],
        ["s", consonant("s")], ["h", consonant("h")],
        [".m", mark("ं")], [".n", mark("ँ")], ["M", mark("ं")],
        ["H", mark("ः")], [".a", literal("ऽ")], ["'", literal("ऽ")]
    ]);

    const HK = entries([
        ["lRR", vowel("ll")], ["lR", vowel("l")],
        ["RR", vowel("rr")], ["R", vowel("r")],
        ["ai", vowel("ai")], ["au", vowel("au")],
        ["kh", consonant("kh")], ["gh", consonant("gh")],
        ["ch", consonant("ch")], ["jh", consonant("jh")],
        ["Th", consonant("tth")], ["Dh", consonant("ddh")],
        ["th", consonant("th")], ["dh", consonant("dh")],
        ["ph", consonant("ph")], ["bh", consonant("bh")],
        ["A", vowel("aa")], ["I", vowel("ii")], ["U", vowel("uu")],
        ["a", vowel("a")], ["i", vowel("i")], ["u", vowel("u")],
        ["e", vowel("e")], ["o", vowel("o")],
        ["k", consonant("k")], ["g", consonant("g")],
        ["G", consonant("ng")], ["c", consonant("c")],
        ["j", consonant("j")], ["J", consonant("ny")],
        ["T", consonant("tt")], ["D", consonant("dd")],
        ["N", consonant("nn")], ["t", consonant("t")],
        ["d", consonant("d")], ["n", consonant("n")],
        ["p", consonant("p")], ["b", consonant("b")],
        ["m", consonant("m")], ["y", consonant("y")],
        ["r", consonant("r")], ["l", consonant("l")],
        ["v", consonant("v")], ["z", consonant("sh")],
        ["S", consonant("ss")], ["s", consonant("s")],
        ["h", consonant("h")], ["M", mark("ं")], ["H", mark("ः")],
        ["'", literal("ऽ")]
    ]);

    const SCHEMES = Object.freeze({
        native: { id: "native", label: "Indic scripts (automatic)", tokens: null },
        iast: { id: "iast", label: "IAST", tokens: IAST, caseInsensitive: true },
        iso15919: { id: "iso15919", label: "ISO 15919", tokens: ISO, caseInsensitive: true },
        itrans: { id: "itrans", label: "ITRANS", tokens: ITRANS },
        hk: { id: "hk", label: "Harvard-Kyoto", tokens: HK }
    });

    function normalizeScheme(value) {
        const normalized = String(value || "native").trim().toLocaleLowerCase()
            .replace(/[ _-]/g, "");
        const aliases = {
            native: "native", automatic: "native", indic: "native",
            iast: "iast", iso: "iso15919", iso15919: "iso15919",
            itrans: "itrans", harvardkyoto: "hk", hk: "hk"
        };
        return aliases[normalized] || "native";
    }

    function normalizedSource(text, caseInsensitive) {
        let normalized = "";
        const spans = [];
        for (let index = 0; index < text.length;) {
            const start = index;
            const first = String.fromCodePoint(text.codePointAt(index));
            index += first.length;
            while (index < text.length) {
                const next = String.fromCodePoint(text.codePointAt(index));
                if (!/^\p{Mark}$/u.test(next)) {
                    break;
                }
                index += next.length;
            }
            let cluster = text.slice(start, index).normalize("NFC");
            if (caseInsensitive) {
                cluster = cluster.toLocaleLowerCase();
            }
            normalized += cluster;
            for (let unit = 0; unit < cluster.length; unit += 1) {
                spans.push({ start, end: index });
            }
        }
        return { text: normalized, spans };
    }

    function transliterate(sourceValue, schemeValue) {
        const sourceText = String(sourceValue || "").replace(/\r\n?/g, "\n");
        const scheme = normalizeScheme(schemeValue);
        if (scheme === "native") {
            return {
                version: VERSION,
                scheme,
                sourceText,
                analysisText: sourceText,
                outputSpans: Array.from(sourceText, (character, index) => ({
                    start: index,
                    end: index + character.length
                })).flatMap((span, index) => {
                    const character = Array.from(sourceText)[index];
                    return Array(character.length).fill(span);
                }),
                warnings: []
            };
        }

        const definition = SCHEMES[scheme];
        const normalized = normalizedSource(sourceText, definition.caseInsensitive);
        const tokenKeys = Object.keys(definition.tokens)
            .map((key) => key.normalize("NFC"))
            .sort((left, right) => right.length - left.length);
        const output = [];
        const outputSpans = [];
        const warnings = [];
        let pendingConsonant = null;

        function emit(value, span) {
            output.push(value);
            for (let index = 0; index < value.length; index += 1) {
                outputSpans.push({ start: span.start, end: span.end });
            }
        }

        function closeConsonant() {
            if (pendingConsonant) {
                emit(VIRAMA, pendingConsonant);
                pendingConsonant = null;
            }
        }

        function applyToken(token, span) {
            if (token.type === "vowel") {
                if (pendingConsonant) {
                    if (token.value[1]) {
                        emit(token.value[1], span);
                    } else if (outputSpans.length) {
                        outputSpans[outputSpans.length - 1] = {
                            start: outputSpans[outputSpans.length - 1].start,
                            end: span.end
                        };
                    }
                    pendingConsonant = null;
                } else {
                    emit(token.value[0], span);
                }
                return;
            }
            if (token.type === "consonant") {
                closeConsonant();
                emit(token.value, span);
                pendingConsonant = span;
                return;
            }
            if (token.type === "cluster") {
                closeConsonant();
                emit(token.value, span);
                pendingConsonant = span;
                return;
            }
            if (token.type === "mark") {
                pendingConsonant = null;
                emit(token.value, span);
                return;
            }
            closeConsonant();
            emit(token.value, span);
        }

        for (let index = 0; index < normalized.text.length;) {
            const key = tokenKeys.find((candidate) =>
                normalized.text.startsWith(candidate, index));
            if (key) {
                const tokenSpans = normalized.spans.slice(index, index + key.length);
                const span = {
                    start: tokenSpans[0].start,
                    end: tokenSpans.at(-1).end
                };
                applyToken(definition.tokens[key], span);
                index += key.length;
                continue;
            }

            closeConsonant();
            const character = String.fromCodePoint(normalized.text.codePointAt(index));
            const unitSpans = normalized.spans.slice(index, index + character.length);
            const span = {
                start: unitSpans[0].start,
                end: unitSpans.at(-1).end
            };
            const original = sourceText.slice(span.start, span.end);
            emit(original, span);
            if (/\p{Script=Latin}/u.test(character)) {
                warnings.push({
                    start: span.start,
                    end: span.end,
                    text: original,
                    reason: "unrecognized-roman-token"
                });
            }
            index += character.length;
        }
        closeConsonant();

        return {
            version: VERSION,
            scheme,
            sourceText,
            analysisText: output.join(""),
            outputSpans,
            warnings
        };
    }

    function mapRange(conversion, start, end) {
        if (conversion.scheme === "native") {
            return { start, end };
        }
        const spans = conversion.outputSpans.slice(start, end);
        if (spans.length) {
            return { start: spans[0].start, end: spans.at(-1).end };
        }
        if (start >= conversion.outputSpans.length) {
            return {
                start: conversion.sourceText.length,
                end: conversion.sourceText.length
            };
        }
        const boundary = conversion.outputSpans[start];
        return { start: boundary.start, end: boundary.start };
    }

    function projectRange(value, conversion) {
        const projected = { ...value };
        const mapped = mapRange(conversion, value.start, value.end);
        projected.analysisStart = value.start;
        projected.analysisEnd = value.end;
        projected.start = mapped.start;
        projected.end = mapped.end;
        if (typeof value.text === "string") {
            projected.analysisText = value.text;
            projected.text = conversion.sourceText.slice(mapped.start, mapped.end);
        }
        if (typeof value.syllable === "string") {
            projected.analysisSyllable = value.syllable;
            projected.syllable = conversion.sourceText.slice(mapped.start, mapped.end);
        }
        if (value.script === "devanagari") {
            projected.analysisScript = value.script;
            projected.script = "roman";
        }
        return projected;
    }

    function projectAnalysis(rawAnalysis, conversion) {
        if (conversion.scheme === "native") {
            return rawAnalysis;
        }
        const result = {
            ...rawAnalysis,
            text: conversion.sourceText,
            analysisText: conversion.analysisText,
            transliterationVersion: VERSION,
            inputScheme: conversion.scheme,
            transliterationWarnings: conversion.warnings.map((warning) => ({ ...warning })),
            scripts: ["roman"]
        };
        result.segments = (rawAnalysis.segments || []).map((segment) =>
            projectRange(segment, conversion));
        result.unsupported = (rawAnalysis.unsupported || []).map((range) =>
            projectRange(range, conversion));
        result.stanzas = (rawAnalysis.stanzas || []).map((stanza) => {
            const projectedStanza = projectRange(stanza, conversion);
            projectedStanza.scripts = ["roman"];
            projectedStanza.lines = (stanza.lines || []).map((line) => {
                const projectedLine = projectRange(line, conversion);
                projectedLine.syllables = (line.syllables || []).map((syllable) =>
                    projectRange(syllable, conversion));
                return projectedLine;
            });
            projectedStanza.padas = (stanza.padas || []).map((pada) => {
                const projectedPada = projectRange(pada, conversion);
                const sourceLine = mapRange(
                    conversion,
                    pada.sourceLineStart,
                    pada.sourceLineEnd
                );
                projectedPada.analysisSourceLineStart = pada.sourceLineStart;
                projectedPada.analysisSourceLineEnd = pada.sourceLineEnd;
                projectedPada.analysisSourceLineText = pada.sourceLineText;
                projectedPada.sourceLineStart = sourceLine.start;
                projectedPada.sourceLineEnd = sourceLine.end;
                projectedPada.sourceLineText = conversion.sourceText.slice(
                    sourceLine.start,
                    sourceLine.end
                );
                projectedPada.syllables = (pada.syllables || []).map((syllable) =>
                    projectRange(syllable, conversion));
                return projectedPada;
            });
            projectedStanza.amshaGroupRanges = (stanza.amshaGroupRanges || [])
                .map((groups) => groups.map((group) =>
                    projectRange(group, conversion)));
            return projectedStanza;
        });
        return result;
    }

    return {
        VERSION,
        SCHEMES,
        normalizeScheme,
        transliterate,
        mapRange,
        projectAnalysis
    };
}));
