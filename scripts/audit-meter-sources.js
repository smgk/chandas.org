/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

function fold(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function corpusExamples(corpus) {
    const defaults = corpus.defaults || {};
    return (corpus.examples || []).map((example) => ({
        ...defaults,
        ...example,
        source: example.source || defaults.source
    }));
}

function loadAudit(ocrFiles = {}) {
    const fixed = require(path.join(root, "mishra.json"));
    const structural = require(path.join(root, "structural_meters.json"));
    const research = require(path.join(root, "research", "archive_sources.json"));
    const examples = [
        require(path.join(root, "examples", "field_guide_corpus.json")),
        require(path.join(root, "examples", "apte_sanskrit_examples.json"))
    ].flatMap(corpusExamples);
    const entries = [
        ...(fixed.metres || []).map((entry) => ({
            id: String(entry[0]),
            name: String(entry[0]),
            kind: "fixed",
            aliases: []
        })),
        ...(structural.fixedMeters || []).map((entry) => ({
            id: String(entry[0]),
            name: String(entry[0]),
            kind: "fixed",
            aliases: []
        })),
        ...(structural.meters || []).map((entry) => ({
            id: String(entry.id),
            name: String(entry.name),
            kind: String(entry.kind),
            aliases: (entry.aliases || []).map(String)
        }))
    ];
    const verified = new Set(examples.filter((example) =>
        example.verificationStatus === "source-verified" &&
        example.childSafety === "reviewed-safe").map((example) => example.meterId));
    const pending = new Set(examples.filter((example) =>
        example.verificationStatus !== "source-verified").map((example) =>
        example.meterId));
    const sourceIds = new Set(research.sources.map((source) => source.id));
    const ocr = Object.entries(ocrFiles).map(([sourceId, filename]) => {
        if (!sourceIds.has(sourceId)) {
            throw new Error(`Unknown Archive source id: ${sourceId}`);
        }
        return {
            sourceId,
            text: ` ${fold(fs.readFileSync(filename, "utf8"))} `
        };
    });
    const ledger = entries.map((entry) => {
        const terms = [...new Set([entry.id, entry.name, ...entry.aliases]
            .map(fold).filter((term) => term.length >= 4))];
        const ocrLeads = ocr.filter((source) => terms.some((term) =>
            source.text.includes(` ${term} `))).map((source) => source.sourceId);
        return {
            ...entry,
            status: verified.has(entry.id)
                ? "verified-example"
                : pending.has(entry.id)
                    ? "source-pending-example"
                    : "research-pending",
            archiveOcrLeads: ocrLeads
        };
    });
    const uniqueIds = new Set(ledger.map((entry) => entry.id));
    const verifiedIds = new Set(ledger.filter((entry) =>
        entry.status === "verified-example").map((entry) => entry.id));
    const pendingIds = new Set(ledger.filter((entry) =>
        entry.status === "source-pending-example").map((entry) => entry.id));
    const leadIds = new Set(ledger.filter((entry) =>
        entry.archiveOcrLeads.length).map((entry) => entry.id));

    return {
        auditVersion: research.auditVersion,
        checkedOn: research.checkedOn,
        archiveSourceCount: research.sources.length,
        catalogEntries: ledger.length,
        uniqueMeterIds: uniqueIds.size,
        duplicateCatalogEntries: ledger.length - uniqueIds.size,
        verifiedExampleMeters: verifiedIds.size,
        sourcePendingExampleMeters: pendingIds.size,
        researchPendingMeters: uniqueIds.size - verifiedIds.size - pendingIds.size,
        recordedArchiveOcrLeadMeters:
            Number(research.ocrSweep &&
                research.ocrSweep.romanizedNameLeadMeters) || 0,
        archiveOcrLeadMeters: leadIds.size,
        warning: "OCR leads are locators only; they are not verified examples.",
        ledger
    };
}

function parseArguments(arguments_) {
    const result = { json: false, ocrFiles: {} };
    for (let index = 0; index < arguments_.length; index += 1) {
        const argument = arguments_[index];
        if (argument === "--json") {
            result.json = true;
        } else if (argument === "--ocr") {
            const mapping = arguments_[index + 1] || "";
            const separator = mapping.indexOf("=");
            if (separator < 1) {
                throw new Error("--ocr expects source-id=/path/to/djvu.txt");
            }
            result.ocrFiles[mapping.slice(0, separator)] =
                mapping.slice(separator + 1);
            index += 1;
        } else {
            throw new Error(`Unknown argument: ${argument}`);
        }
    }
    return result;
}

function report(audit) {
    return [
        `Archive audit ${audit.auditVersion} (${audit.checkedOn})`,
        `${audit.catalogEntries} catalog entries; ${audit.uniqueMeterIds} unique IDs; ` +
            `${audit.duplicateCatalogEntries} duplicate entries`,
        `${audit.verifiedExampleMeters} meters with authenticated, child-safe examples`,
        `${audit.sourcePendingExampleMeters} meters with a source-pending example`,
        `${audit.researchPendingMeters} meters still awaiting an admitted example`,
        `${audit.archiveSourceCount} public-domain Archive sources in the research set`,
        `${audit.recordedArchiveOcrLeadMeters} meter-name leads in the recorded full ` +
            `OCR sweep; ${audit.archiveOcrLeadMeters} in OCR supplied to this run`,
        audit.warning
    ].join("\n");
}

if (require.main === module) {
    const options = parseArguments(process.argv.slice(2));
    const audit = loadAudit(options.ocrFiles);
    process.stdout.write(options.json
        ? `${JSON.stringify(audit, null, 2)}\n`
        : `${report(audit)}\n`);
}

module.exports = { fold, loadAudit, parseArguments, report };
