/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ALAR_REVISION = "8651ccf8e92184ca17e234eeb6c947d8d52dd5c4";
const AMARA_REVISION = "f5575c3a7742effabb3b79a8aa37d9b2d57bbb98";

const SLP1_VOWELS = new Map([
    ["a", ["अ", ""]], ["A", ["आ", "ा"]],
    ["i", ["इ", "ि"]], ["I", ["ई", "ी"]],
    ["u", ["उ", "ु"]], ["U", ["ऊ", "ू"]],
    ["f", ["ऋ", "ृ"]], ["F", ["ॠ", "ॄ"]],
    ["x", ["ऌ", "ॢ"]], ["X", ["ॡ", "ॣ"]],
    ["e", ["ए", "े"]], ["E", ["ऐ", "ै"]],
    ["o", ["ओ", "ो"]], ["O", ["औ", "ौ"]]
]);
const SLP1_CONSONANTS = new Map(Object.entries({
    k: "क", K: "ख", g: "ग", G: "घ", N: "ङ",
    c: "च", C: "छ", j: "ज", J: "झ", Y: "ञ",
    w: "ट", W: "ठ", q: "ड", Q: "ढ", R: "ण",
    t: "त", T: "थ", d: "द", D: "ध", n: "न",
    p: "प", P: "फ", b: "ब", B: "भ", m: "म",
    y: "य", r: "र", l: "ल", v: "व",
    S: "श", z: "ष", s: "स", h: "ह", L: "ळ"
}));
const SLP1_MARKS = new Map([
    ["M", "ं"], ["H", "ः"], ["~", "ँ"], ["'", "ऽ"]
]);

function slp1ToDevanagari(value) {
    const source = Array.from(String(value || ""));
    let output = "";
    for (let index = 0; index < source.length; index += 1) {
        const character = source[index];
        if (SLP1_VOWELS.has(character)) {
            output += SLP1_VOWELS.get(character)[0];
            continue;
        }
        if (SLP1_CONSONANTS.has(character)) {
            output += SLP1_CONSONANTS.get(character);
            const next = source[index + 1];
            if (SLP1_VOWELS.has(next)) {
                output += SLP1_VOWELS.get(next)[1];
                index += 1;
            } else {
                output += "्";
            }
            continue;
        }
        output += SLP1_MARKS.get(character) || character;
    }
    return output.normalize("NFC");
}

function normalizeAlarGloss(value) {
    return String(value || "")
        .normalize("NFC")
        .trim()
        .replace(/[.;:]+$/g, "")
        .replace(/^(?:a|an|the)\s+/i, "")
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("en");
}

function acceptableAlarGloss(value) {
    const gloss = normalizeAlarGloss(value);
    if (gloss.length < 4 || gloss.length > 84 ||
        /[\u0C80-\u0CFF]/u.test(gloss) ||
        /[(),;:"'!?]/u.test(gloss) ||
        /\b(?:etc|especially|usually|figuratively|metaphorically)\b/u.test(gloss)) {
        return false;
    }
    return !/^(?:act|action|state|quality|kind|type|name|one|person|thing|place|way|form|part|piece|member|used|having|being|be|become|make|do|go|come|give|take)(?:\s|$)/u
        .test(gloss);
}

function acceptableKannadaLemma(value) {
    const lemma = String(value || "").normalize("NFC").trim();
    return lemma.length >= 2 && lemma.length <= 36 &&
        /^[\p{Script=Kannada}\p{Mark}\u200C\u200D]+$/u.test(lemma);
}

function parseAlar(source) {
    const records = [];
    let record = null;
    let definition = null;
    for (const line of String(source || "").split(/\r?\n/u)) {
        let match = line.match(/^- id:\s*(\d+)\s*$/u);
        if (match) {
            if (record) {
                records.push(record);
            }
            record = { id: Number(match[1]), lemma: "", definitions: [] };
            definition = null;
            continue;
        }
        if (!record) {
            continue;
        }
        match = line.match(/^\s{2}entry:\s*(.*)$/u);
        if (match && !record.lemma) {
            record.lemma = match[1].trim();
            continue;
        }
        match = line.match(/^\s{2}- id:\s*(\d+)\s*$/u);
        if (match) {
            definition = { id: Number(match[1]), gloss: "", pos: "" };
            record.definitions.push(definition);
            continue;
        }
        if (!definition) {
            continue;
        }
        match = line.match(/^\s{4}entry:\s*(.*)$/u);
        if (match) {
            definition.gloss = match[1].trim();
            continue;
        }
        match = line.match(/^\s{4}type:\s*(.*)$/u);
        if (match) {
            definition.pos = match[1].trim().toLocaleLowerCase("en");
        }
    }
    if (record) {
        records.push(record);
    }
    return records;
}

function buildAlarDatabase(source) {
    const groups = new Map();
    for (const record of parseAlar(source)) {
        if (!acceptableKannadaLemma(record.lemma)) {
            continue;
        }
        for (const definition of record.definitions) {
            const gloss = normalizeAlarGloss(definition.gloss);
            const pos = definition.pos || "unknown";
            if (!acceptableAlarGloss(gloss) ||
                !["noun", "verb", "adjective", "adverb"].includes(pos)) {
                continue;
            }
            // Alar reuses a definition id across headwords that share that
            // dictionary sense.  Treat that explicit source relationship as
            // the grouping signal; equal prose alone is not strong enough.
            const key = `${pos}\u0000${definition.id}`;
            if (!groups.has(key)) {
                groups.set(key, { label: gloss, pos, words: new Map() });
            }
            const group = groups.get(key);
            if (!group.words.has(record.lemma)) {
                group.words.set(record.lemma, [record.id, definition.id]);
            }
        }
    }

    const concepts = [];
    const review = [];
    let ordinal = 0;
    for (const group of groups.values()) {
        const words = Array.from(group.words.entries())
            .sort((left, right) => left[0].localeCompare(right[0], "kn"));
        if (words.length < 2) {
            continue;
        }
        const compact = {
            id: `kn:${String(++ordinal).padStart(5, "0")}`,
            label: group.label,
            pos: group.pos,
            words: words.map(([word, provenance]) => [word, ...provenance])
        };
        if (words.length <= 10) {
            concepts.push(compact);
        } else {
            review.push({ ...compact, reason: "broad-exact-gloss" });
        }
    }
    concepts.sort((left, right) =>
        left.label.localeCompare(right.label, "en") ||
        left.pos.localeCompare(right.pos, "en"));
    concepts.forEach((concept, index) => {
        concept.id = `kn:${String(index + 1).padStart(5, "0")}`;
    });
    return { concepts, review };
}

function splitAmaraSynonym(value) {
    const separator = value.lastIndexOf("-");
    if (separator <= 0) {
        return { lemma: value, grammar: "" };
    }
    return {
        lemma: value.slice(0, separator),
        grammar: value.slice(separator + 1)
    };
}

function parseAmara(source) {
    const contextPattern = /<info\s+kvvv="<s>([^<]*)<\/s>,\s*<s>([^<]*)<\/s>"\s*\/>/gu;
    const entryPattern = /<eid>(\d+)<syns><s>([^<]+)<\/s>/gu;
    const contexts = [];
    let match;
    while ((match = contextPattern.exec(source)) !== null) {
        contexts.push({ offset: match.index, kanda: match[1], varga: match[2] });
    }
    const groups = [];
    let contextIndex = 0;
    while ((match = entryPattern.exec(source)) !== null) {
        while (contextIndex + 1 < contexts.length &&
            contexts[contextIndex + 1].offset < match.index) {
            contextIndex += 1;
        }
        const words = match[2].split(",").map((item) => {
            const parsed = splitAmaraSynonym(item.trim());
            return [
                slp1ToDevanagari(parsed.lemma),
                parsed.grammar,
                parsed.lemma
            ];
        }).filter((item) => item[0] &&
            /^[\p{Script=Devanagari}\p{Mark}\u200C\u200Dऽ]+$/u.test(item[0]));
        const unique = Array.from(new Map(words.map((word) => [word[0], word])).values());
        if (unique.length >= 2) {
            const context = contexts[contextIndex] || { kanda: "", varga: "" };
            groups.push({
                sourceId: Number(match[1]),
                kanda: slp1ToDevanagari(context.kanda),
                varga: slp1ToDevanagari(context.varga),
                words: unique
            });
        }
    }
    return groups;
}

function buildAmaraDatabase(source) {
    const concepts = parseAmara(source).map((group, index) => ({
        id: `sa:${String(index + 1).padStart(5, "0")}`,
        label: group.words[0][0],
        category: group.varga,
        section: group.kanda,
        sourceId: group.sourceId,
        words: group.words
    }));
    return { concepts };
}

function dataDocument({ language, license, licenseUrl, source, concepts }) {
    const wordCount = concepts.reduce((sum, concept) => sum + concept.words.length, 0);
    return {
        schemaVersion: 1,
        language,
        license,
        licenseUrl,
        source,
        counts: { concepts: concepts.length, wordSenses: wordCount },
        concepts
    };
}

function parseArguments(argv) {
    const result = {};
    for (let index = 0; index < argv.length; index += 2) {
        const key = argv[index];
        const value = argv[index + 1];
        if (!key || !key.startsWith("--") || !value) {
            throw new Error("Arguments must be supplied as --name value pairs");
        }
        result[key.slice(2)] = value;
    }
    return result;
}

function writeJson(target, value) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(value)}\n`, "utf8");
}

function main() {
    const args = parseArguments(process.argv.slice(2));
    for (const required of ["alar", "amara", "out-dir", "review"]) {
        if (!args[required]) {
            throw new Error(`Missing --${required}`);
        }
    }
    const alar = buildAlarDatabase(fs.readFileSync(args.alar, "utf8"));
    const amara = buildAmaraDatabase(fs.readFileSync(args.amara, "utf8"));
    const alarDocument = dataDocument({
        language: "kn",
        license: "ODbL-1.0",
        licenseUrl: "https://opendatacommons.org/licenses/odbl/1-0/",
        source: {
            id: "alar",
            title: "V. Krishna's Alar Kannada–English dictionary",
            url: "https://github.com/alar-dict/data",
            revision: ALAR_REVISION,
            attribution: "Alar dictionary corpus © V. Krishna"
        },
        concepts: alar.concepts
    });
    const amaraDocument = dataDocument({
        language: "sa",
        license: "CC-BY-SA-4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        source: {
            id: "cdsl-amarakosha",
            title: "Amarakośa in CDSL format",
            url: "https://github.com/sanskrit-lexicon/AMAR",
            revision: AMARA_REVISION,
            attribution: "Amarasiṃha; digitisation and corrections by CDSL contributors"
        },
        concepts: amara.concepts
    });
    writeJson(path.join(args["out-dir"], "kn-alar-v1.json"), alarDocument);
    writeJson(path.join(args["out-dir"], "sa-amarakosha-v1.json"), amaraDocument);
    writeJson(args.review, {
        schemaVersion: 1,
        sourceRevision: ALAR_REVISION,
        note: "Exact-gloss groups withheld from the product because they are too broad; review before promotion.",
        groups: alar.review
    });
    console.log(JSON.stringify({
        kannada: alarDocument.counts,
        sanskrit: amaraDocument.counts,
        withheldKannadaGroups: alar.review.length
    }, null, 2));
}

if (require.main === module) {
    main();
}

module.exports = {
    acceptableAlarGloss,
    buildAlarDatabase,
    buildAmaraDatabase,
    normalizeAlarGloss,
    parseAlar,
    parseAmara,
    slp1ToDevanagari
};
