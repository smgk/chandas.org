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
    assert.match(html, /app\.js/);
});

test("service worker pre-caches every core web asset", () => {
    const worker = read("service-worker.js");
    const expectedAssets = [
        "index.html",
        "styles.css",
        "app.js",
        "meter_analysis.js",
        "mishra.json",
        "structural_meters.json",
        "manifest.webmanifest",
        "icon.svg",
        "about.html",
        "privacy.html",
        "terms.html",
        "notices.html"
    ];

    expectedAssets.forEach((asset) => {
        assert.match(worker, new RegExp(asset.replace(".", "\\.")));
        assert.ok(fs.existsSync(path.join(root, asset)), `${asset} is missing`);
    });
});

test("the composition control and live regions have accessible labels", () => {
    const html = read("index.html");

    assert.match(html, /<label for="composition"/);
    assert.match(html, /id="draft-state"[^>]*aria-live="polite"/);
    assert.match(html, /id="validation-summary"[^>]*aria-live="polite"/);
    assert.match(html, /id="toast"[^>]*role="status"[^>]*aria-live="polite"/);
    assert.match(html, /id="cursor-metrics"/);
    assert.match(html, /id="show-template"[^>]*type="checkbox"/);
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

test("branding and public navigation use the compact approved copy", () => {
    const index = read("index.html");
    const about = read("about.html");
    const publicPages = [index, read("privacy.html"), read("terms.html")].join("\n");

    assert.match(index, /say it in-verse/);
    assert.doesNotMatch(index, /Let the rhythm appear as you write/i);
    assert.doesNotMatch(publicPages, /github\.com\/smgk\/chandas\.org/);
    assert.match(about, /href="https:\/\/x\.com\/ganeshkrishna"[^>]*>@ganeshkrishna<\/a>/);
});
