/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const output = path.join(root, "dist");
const assets = [
    "index.html",
    "styles.css",
    "app.js",
    "roman_transliteration.js",
    "analytics.js",
    "poem_store.js",
    "meter_analysis.js",
    "synonym_engine.js",
    "scansion.js",
    "shithila_dvitva.js",
    "strong_template.js",
    "custom_meter.js",
    "english_analysis.js",
    "english_composer.js",
    "english_forms.js",
    "english_meters.json",
    "english_forms.json",
    "mishra.json",
    "structural_meters.json",
    "data/synonyms/kn-alar-v1.json",
    "data/synonyms/sa-amarakosha-v1.json",
    "data/synonyms/README.md",
    "data/synonyms/DATA_LICENSES.md",
    "data/english/en-cmudict-stress-v1.json",
    "data/english/en-cmudict-rhyme-v1.json",
    "data/english/README.md",
    "data/english/CMUDICT_LICENSE",
    "examples/field_guide_corpus.json",
    "examples/apte_sanskrit_examples.json",
    "examples/english_prosody_corpus.json",
    "docs/research/archive-meter-audit.md",
    "docs/rules/gujarati-meters.md",
    "docs/rules/english-stress-meters.md",
    "docs/rules/english-rhyme-forms.md",
    "manifest.webmanifest",
    "service-worker.js",
    "icon.svg",
    "documentation.html",
    "documentation.js",
    "about.html",
    "roadmap.html",
    "privacy.html",
    "terms.html",
    "notices.html",
    "COPYRIGHT.md",
    "LICENSE.md",
    "THIRD_PARTY_NOTICES.md"
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const asset of assets) {
    const destination = path.join(output, asset);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(root, asset), destination);
}

console.log(`Built ${assets.length} static assets in ${path.relative(root, output)}/.`);
