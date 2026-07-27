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
    "structural_meters.json",
    "manifest.webmanifest",
    "service-worker.js",
    "icon.svg",
    "about.html",
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

const structuralCatalog = JSON.parse(
    fs.readFileSync(path.join(root, "structural_meters.json"), "utf8")
);
if (!structuralCatalog.catalogVersion ||
    !Array.isArray(structuralCatalog.meters) ||
    structuralCatalog.meters.length === 0) {
    throw new Error("structural_meters.json does not contain a versioned meter list");
}
if (!structuralCatalog.meters.some((meter) => meter.id === "structural:anushtubh-pathya")) {
    throw new Error("structural_meters.json must include pathyā Anuṣṭubh");
}
const structuralIds = new Set();
for (const meter of structuralCatalog.meters) {
    if (!meter.id || structuralIds.has(meter.id)) {
        throw new Error(`Missing or duplicate structural meter id: ${meter.id || "(empty)"}`);
    }
    structuralIds.add(meter.id);
    if (!meter.name || !Array.isArray(meter.aliases) ||
        !Array.isArray(meter.signatureLines) || !meter.signatureLines.length ||
        !meter.ruleCompleteness || (!meter.source && !meter.sourceRef)) {
        throw new Error(`Incomplete structural meter metadata: ${meter.id}`);
    }
    if (meter.sourceRef && !structuralCatalog[meter.sourceRef]) {
        throw new Error(`Unknown source reference for ${meter.id}: ${meter.sourceRef}`);
    }
    const rules = meter.kind === "matra" ? meter.padaGroups : meter.padas;
    if (!Array.isArray(rules) || rules.length !== 4) {
        throw new Error(`${meter.id} must define four pādas`);
    }
}

console.log(
    `Validated ${required.length} production assets and ` +
    `${catalog.metres.length + structuralCatalog.meters.length} meters.`
);
