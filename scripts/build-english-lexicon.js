/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_SOURCE_URL = "https://github.com/cmusphinx/cmudict";

function parseArguments(argv) {
    const values = {};
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (!argument.startsWith("--")) {
            continue;
        }
        const key = argument.slice(2);
        const value = argv[index + 1];
        if (!value || value.startsWith("--")) {
            throw new Error(`Missing value for --${key}`);
        }
        values[key] = value;
        index += 1;
    }
    return values;
}

function compareText(left, right) {
    return left < right ? -1 : left > right ? 1 : 0;
}

function pronunciationStress(pronunciation) {
    return pronunciation
        .trim()
        .split(/\s+/)
        .map((phone) => /([012])$/.exec(phone))
        .filter(Boolean)
        .map((match) => match[1])
        .join("");
}

function normalizeEntry(entry) {
    return entry.replace(/\(\d+\)$/, "").toLocaleLowerCase("en-US");
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
        if (!/^(?:[a-z][a-z.'-]*|'[a-z][a-z.'-]*)$/.test(word)) {
            skippedRows += 1;
            continue;
        }
        const stress = pronunciationStress(line.slice(separator + 1));
        if (!stress) {
            skippedRows += 1;
            continue;
        }
        if (!byWord.has(word)) {
            byWord.set(word, new Set());
        }
        byWord.get(word).add(stress);
    }

    const entries = [...byWord]
        .sort(([left], [right]) => compareText(left, right))
        .map(([word, patterns]) => [
            word,
            [...patterns].sort((left, right) =>
                left.length - right.length || compareText(left, right))
        ]);
    return { entries, sourceRows, skippedRows };
}

function buildDocument(source, options) {
    const parsed = parseCmudict(source);
    const stressPatterns = parsed.entries.reduce((count, entry) =>
        count + entry[1].length, 0);
    return {
        schemaVersion: 1,
        language: "en",
        accent: "en-US",
        representation: "lexical-stress-only",
        stressLegend: {
            "0": "unstressed",
            "1": "primary",
            "2": "secondary"
        },
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
            stressPatterns,
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
            "Usage: node scripts/build-english-lexicon.js " +
            "--source <cmudict.dict> --revision <git-sha> --output <json>"
        );
    }
    const source = fs.readFileSync(path.resolve(args.source), "utf8");
    const document = buildDocument(source, { revision: args.revision });
    const output = path.resolve(args.output);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(document)}\n`);
    process.stdout.write(
        `Built ${document.counts.entries} English entries with ` +
        `${document.counts.stressPatterns} stress patterns.\n`
    );
}

if (require.main === module) {
    main();
}

module.exports = {
    buildDocument,
    normalizeEntry,
    parseCmudict,
    pronunciationStress
};
