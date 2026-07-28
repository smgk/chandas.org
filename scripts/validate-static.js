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
    "documentation.html",
    "documentation.js",
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
    if (!Array.isArray(rules) || rules.length === 0) {
        throw new Error(`${meter.id} must define at least one pāda`);
    }
    if (meter.linePolicy && meter.linePolicy.type === "fixed" &&
        meter.linePolicy.count !== rules.length) {
        throw new Error(`${meter.id} fixed line count does not match its pāda rules`);
    }
    if (meter.kind !== "matra") {
        continue;
    }

    const capacities = meter.padaGroups.flat();
    for (const [ruleType, groupRules] of [
        ["group", meter.groupRules || []],
        ["boundary", meter.boundaryRules || []]
    ]) {
        if (!Array.isArray(groupRules)) {
            throw new Error(`${meter.id} ${ruleType} rules must be an array`);
        }
        for (const rule of groupRules) {
            if (!rule.everyGroup &&
                !Array.isArray(rule.globalGroups) &&
                !Array.isArray(rule.padas) &&
                !Array.isArray(rule.localGroups)) {
                throw new Error(`${meter.id} ${ruleType} rule has no group selector`);
            }
            for (const groupNumber of rule.globalGroups || []) {
                if (!Number.isInteger(groupNumber) ||
                    groupNumber < 1 || groupNumber > capacities.length) {
                    throw new Error(
                        `${meter.id} ${ruleType} rule has invalid group ${groupNumber}`
                    );
                }
                for (const pattern of [
                    ...(rule.allowedPatterns || []),
                    ...(rule.forbiddenPatterns || []),
                    ...(rule.whenPatterns || [])
                ]) {
                    const matras = Array.from(pattern).reduce(
                        (sum, weight) => sum + (weight === "G" ? 2 : weight === "L" ? 1 : 0),
                        0
                    );
                    if (!/^[GL]+$/.test(pattern) || matras !== capacities[groupNumber - 1]) {
                        throw new Error(
                            `${meter.id} pattern ${pattern} does not fit group ${groupNumber}`
                        );
                    }
                }
            }
            if (ruleType === "boundary" &&
                (!Number.isInteger(rule.afterSyllable) || rule.afterSyllable < 1)) {
                throw new Error(`${meter.id} boundary rule needs afterSyllable`);
            }
        }
    }
}

console.log(
    `Validated ${required.length} production assets and ` +
    `${catalog.metres.length + structuralCatalog.meters.length} meters.`
);
