"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");

function read(file) {
    return fs.readFileSync(path.join(root, file), "utf8");
}

test("the web shell has no external runtime asset dependencies", () => {
    const html = read("index.html");
    const externalAssets = Array.from(
        html.matchAll(/(?:<script[^>]+src|<link[^>]+href)=["'](https?:\/\/[^"']+)/g),
        (match) => match[1]
    );

    assert.deepEqual(externalAssets, []);
    assert.match(html, /manifest\.webmanifest/);
    assert.match(html, /meter_analysis\.js/);
    assert.match(html, /strong_template\.js/);
    assert.match(html, /app\.js/);
});

test("service worker pre-caches every core web asset", () => {
    const worker = read("service-worker.js");
    const expectedAssets = [
        "index.html",
        "styles.css",
        "app.js",
        "meter_analysis.js",
        "strong_template.js",
        "mishra.json",
        "structural_meters.json",
        "manifest.webmanifest",
        "icon.svg",
        "documentation.html",
        "documentation.js",
        "about.html",
        "privacy.html",
        "terms.html",
        "notices.html"
    ];

    expectedAssets.forEach((asset) => {
        assert.match(worker, new RegExp(asset.replace(".", "\\.")));
        assert.ok(fs.existsSync(path.join(root, asset)), `${asset} is missing`);
    });
    assert.match(worker, /event\.request\.mode === "navigate"/);
    assert.match(worker, /cache\.put\(cacheRequest, copy\)/);
    assert.doesNotMatch(worker, /cache\.put\(event\.request, copy\)/);
});

test("the composition control and live regions have accessible labels", () => {
    const html = read("index.html");

    assert.match(html, /<label for="composition"/);
    assert.match(html, /id="draft-state"[^>]*aria-live="polite"/);
    assert.match(html, /id="validation-summary"[^>]*aria-live="polite"/);
    assert.match(html, /id="toast"[^>]*role="status"[^>]*aria-live="polite"/);
    assert.match(html, /id="cursor-metrics"/);
    assert.match(html, /id="show-template"[^>]*type="checkbox"/);
    assert.match(html, /id="template-mode-strong"[^>]*type="radio"/);
    assert.match(html, /id="copy-analysis-url"[^>]*type="button"/);
    assert.match(
        html,
        /id="strong-template-editor"[^>]*aria-labelledby="strong-template-title"/
    );
    assert.match(html, /id="whole-verse-template"[^>]*aria-label="Meter template"/);
});

test("selected-meter actions remain outside the full meter picker", () => {
    const html = read("index.html");
    const selectedReference = html.indexOf('id="selected-meter-reference"');
    const clearAction = html.indexOf('id="clear-meter"');
    const meterPicker = html.indexOf('id="meter-picker"');

    assert.ok(selectedReference >= 0);
    assert.ok(clearAction > selectedReference);
    assert.ok(clearAction < meterPicker);
    assert.match(read("styles.css"), /font-size:\s*clamp\(1\.05rem,\s*1\.8vw,\s*1\.3rem\)/);
});

test("editor styling preserves Indic shaping across highlight states", () => {
    const styles = read("styles.css");
    const violationRule = styles.match(
        /\.highlight-layer \.violation\s*\{([^}]*)\}/
    );

    assert.match(styles, /letter-spacing:\s*normal/);
    assert.ok(violationRule);
    assert.doesNotMatch(violationRule[1], /font-weight/);
});

test("branding and public navigation use the compact approved copy", () => {
    const index = read("index.html");
    const about = read("about.html");
    const publicPages = [index, read("privacy.html"), read("terms.html")].join("\n");

    assert.match(index, /say it in-verse/);
    assert.match(index, /class="release-badge">PRE-BETA<\/span>/);
    assert.doesNotMatch(index, /Let the rhythm appear as you write/i);
    assert.doesNotMatch(publicPages, /github\.com\/smgk\/chandas\.org/);
    assert.match(about, /href="https:\/\/x\.com\/ganeshkrishna"[^>]*>@ganeshkrishna<\/a>/);
});

test("documentation includes the searchable, offline meter catalog", () => {
    const index = read("index.html");
    const documentation = read("documentation.html");

    assert.match(
        index,
        /class="header-link" href="documentation\.html" data-i18n="learn">Learn<\/a>/
    );
    assert.doesNotMatch(index, /<footer[\s\S]*href="documentation\.html"/);
    assert.match(documentation, /How to use Chandas/);
    assert.match(documentation, /Show template/);
    assert.match(documentation, /Open a verse from a link/);
    assert.match(documentation, /Copy analysis link/);
    assert.match(documentation, /\?verse=&lt;verse&gt;&amp;meter=madhu/);
    assert.match(documentation, /hosting request logs/);
    assert.match(documentation, /Kannada Kanda/);
    assert.match(documentation, /tea break/);
    assert.match(documentation, /id="meter-catalog-total"/);
    assert.match(documentation, /id="meter-catalog-search"/);
    assert.match(documentation, /src="documentation\.js"/);
});

test("the provisional Kanda rule packet and attribution are retained", () => {
    const catalog = JSON.parse(read("structural_meters.json"));
    const kanda = catalog.meters.find((meter) =>
        meter.id === "structural:kanda-kannada");

    assert.equal(catalog.catalogVersion, "3.0.0");
    assert.equal(kanda.ruleCompleteness, "provisional-rhythm");
    assert.deepEqual(kanda.uncheckedRules, ["prāsa"]);
    assert.ok(fs.existsSync(path.join(root, "docs", "rules", "kanda.md")));
    assert.match(read("THIRD_PARTY_NOTICES.md"), /Chanda Nikasha/);
    assert.match(read("notices.html"), /Kannada Kanda/);
});

test("the provisional Ragale rule packet and references are retained", () => {
    const catalog = JSON.parse(read("structural_meters.json"));
    const ragale = catalog.meters.filter((meter) => meter.id.endsWith("-ragale"));

    assert.equal(ragale.length, 3);
    assert.deepEqual(
        ragale.map((meter) => meter.linePolicy.type),
        ["repeating", "repeating", "repeating"]
    );
    assert.ok(fs.existsSync(path.join(root, "docs", "rules", "ragale.md")));
    assert.match(read("THIRD_PARTY_NOTICES.md"), /Mandānila/);
    assert.match(read("notices.html"), /Kannada Ragale/);
});

test("the Ṣaṭpadi and aṃśa milestones retain their catalogs and rule packets", () => {
    const catalog = JSON.parse(read("structural_meters.json"));
    const shatpadis = catalog.meters.filter((meter) =>
        meter.id.endsWith("-shatpadi"));
    const amsha = catalog.meters.filter((meter) => meter.kind === "amsha");

    assert.equal(catalog.catalogVersion, "3.0.0");
    assert.equal(shatpadis.length, 6);
    assert.equal(amsha.length, 7);
    shatpadis.forEach((meter) => {
        assert.equal(meter.linePolicy.count, 6);
        assert.equal(meter.padaGroups.length, 6);
    });
    assert.ok(fs.existsSync(path.join(root, "docs", "rules", "shatpadi.md")));
    assert.ok(fs.existsSync(path.join(root, "docs", "rules", "amsha-meters.md")));
    assert.match(read("documentation.html"), /five Akkara forms/);
    assert.match(read("documentation.html"), /Aṃśa meters/);
});
