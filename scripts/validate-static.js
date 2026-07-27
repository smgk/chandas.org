"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const required = [
    "index.html",
    "styles.css",
    "app.js",
    "meter_analysis.js",
    "mishra.json",
    "manifest.webmanifest",
    "service-worker.js",
    "icon.svg",
    "privacy.html",
    "terms.html",
    "notices.html"
];

for (const file of required) {
    const target = path.join(root, file);
    const stat = fs.statSync(target);
    if (!stat.isFile() || stat.size === 0) {
        throw new Error(`Missing or empty production asset: ${file}`);
    }
}

const catalog = JSON.parse(fs.readFileSync(path.join(root, "mishra.json"), "utf8"));
if (!Array.isArray(catalog.metres) || catalog.metres.length === 0) {
    throw new Error("mishra.json does not contain a non-empty metres array");
}

console.log(`Validated ${required.length} production assets and ${catalog.metres.length} meters.`);
