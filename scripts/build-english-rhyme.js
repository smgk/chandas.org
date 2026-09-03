/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_SOURCE_URL = "https://github.com/cmusphinx/cmudict";
const VOWEL = /^([A-Z]+)([012])$/;

function parseArguments(argv) {
    const values = {};
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (!argument.startsWith("--")) {
            continue;
        }
        const value = argv[index + 1];
        if (!value || value.startsWith("--")) {
            throw new Error(`Missing value for ${argument}`);
        }
        values[argument.slice(2)] = value;
        index += 1;
    }
    return values;
}

function normalizeEntry(entry) {
    return entry.replace(/\(\d+\)$/, "").toLocaleLowerCase("en-US");
}

function rhymeRecord(pronunciation) {
    const phones = String(pronunciation || "").trim().split(/\s+/).filter(Boolean);
    const vowels = phones.map((phone, index) => {
        const match = VOWEL.exec(phone);
        return match ? { index, phone: match[1], stress: match[2] } : null;
    }).filter(Boolean);
    if (!vowels.length) {
        return null;
    }
    const stressed = vowels.filter((vowel) => vowel.stress !== "0");
    const anchor = stressed.at(-1) || vowels.at(-1);
    const key = phones.slice(anchor.index)
        .map((phone) => phone.replace(/[012]$/, ""))
        .join(".");
    const trailingSyllables = vowels.filter((vowel) =>
        vowel.index > anchor.index).length;
    return [key, trailingSyllables];
}

function parseCmudict(source) {
    const byWord = new Map();
    let sourceRows = 0;
    let skippedRows = 0;
    for (const rawLine of String(source || "").split(/\r?\n/)) {
        const line = rawLine.replace(/\s+#.*$/, "").trim();
        if (!line || line.startsWith(";;;")) {
            continue;
        }
        const separator = line.search(/\s/);
        if (separator < 1) {
            skippedRows += 1;
            continue;
        }
        sourceRows += 1;
        const word = normalizeEntry(line.slice(0, separator));
        const record = rhymeRecord(line.slice(separator + 1));
        if (!/^(?:[a-z][a-z.'-]*|'[a-z][a-z.'-]*)$/.test(word) || !record) {
            skippedRows += 1;
            continue;
        }
        if (!byWord.has(word)) {
            byWord.set(word, new Map());
        }
        byWord.get(word).set(record.join("|"), record);
    }
    const entries = [...byWord]
        .sort(([left], [right]) => left.localeCompare(right, "en"))
        .map(([word, records]) => [
            word,
            [...records.values()].sort((left, right) =>
                left[0].localeCompare(right[0], "en") || left[1] - right[1])
        ]);
    return { entries, sourceRows, skippedRows };
}

function buildDocument(source, options) {
    const parsed = parseCmudict(source);
    return {
        schemaVersion: 1,
        language: "en",
        accent: "en-US",
        representation: "final-stressed-vowel-rime",
        license: "BSD-2-Clause",
        licenseFile: "CMUDICT_LICENSE",
        source: {
            name: "CMU Pronouncing Dictionary",
            url: DEFAULT_SOURCE_URL,
            revision: options.revision,
            file: "cmudict.dict",
            sha256: crypto.createHash("sha256").update(source).digest("hex")
        },
        counts: {
            entries: parsed.entries.length,
            rhymeKeys: parsed.entries.reduce((sum, entry) =>
                sum + entry[1].length, 0),
            sourceRows: parsed.sourceRows,
            skippedRows: parsed.skippedRows
        },
        entries: parsed.entries
    };
}

function main() {
    const args = parseArguments(process.argv.slice(2));
    if (!args.source || !args.output || !args.revision) {
        throw new Error(
            "Usage: node scripts/build-english-rhyme.js " +
            "--source <cmudict.dict> --revision <git-sha> --output <json>"
        );
    }
    const source = fs.readFileSync(path.resolve(args.source), "utf8");
    const document = buildDocument(source, { revision: args.revision });
    const output = path.resolve(args.output);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(document)}\n`);
    process.stdout.write(
        `Built ${document.counts.entries} English rhyme entries with ` +
        `${document.counts.rhymeKeys} keys.\n`
    );
}

if (require.main === module) {
    main();
}

module.exports = {
    buildDocument,
    normalizeEntry,
    parseCmudict,
    rhymeRecord
};
