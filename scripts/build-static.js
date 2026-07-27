"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const output = path.join(root, "dist");
const assets = [
    "index.html",
    "styles.css",
    "app.js",
    "meter_analysis.js",
    "mishra.json",
    "structural_meters.json",
    "manifest.webmanifest",
    "service-worker.js",
    "icon.svg",
    "about.html",
    "privacy.html",
    "terms.html",
    "notices.html"
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const asset of assets) {
    fs.copyFileSync(path.join(root, asset), path.join(output, asset));
}

console.log(`Built ${assets.length} static assets in ${path.relative(root, output)}/.`);
