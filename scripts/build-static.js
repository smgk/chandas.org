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
    "poem_store.js",
    "meter_analysis.js",
    "shithila_dvitva.js",
    "strong_template.js",
    "mishra.json",
    "structural_meters.json",
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
    fs.copyFileSync(path.join(root, asset), path.join(output, asset));
}

console.log(`Built ${assets.length} static assets in ${path.relative(root, output)}/.`);
