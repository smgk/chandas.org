/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

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
    assert.match(html, /scansion\.js/);
    assert.match(html, /shithila_dvitva\.js/);
    assert.match(html, /strong_template\.js/);
    assert.match(html, /poem_store\.js/);
    assert.match(html, /analytics\.js/);
    assert.match(html, /app\.js/);
});

test("Telugu localization covers every interface message", () => {
    const app = read("app.js");
    const html = read("index.html");
    const startMarker = "const messages = ";
    const endMarker = ";\n\n    const elements";
    const start = app.indexOf(startMarker) + startMarker.length;
    const end = app.indexOf(endMarker, start);
    const messages = Function(`return (${app.slice(start, end)})`)();
    const englishKeys = Object.keys(messages.en).sort();

    assert.ok(englishKeys.length > 150);
    assert.deepEqual(Object.keys(messages.kn).sort(), englishKeys);
    assert.deepEqual(Object.keys(messages.te).sort(), englishKeys);
    for (const key of englishKeys) {
        const variables = (value) =>
            Array.from(String(value).matchAll(/\{([^}]+)\}/g), (match) => match[1])
                .sort();
        assert.deepEqual(variables(messages.te[key]), variables(messages.en[key]), key);
    }
    assert.match(html, /<option value="te">తెలుగు<\/option>/);
    assert.match(app, /state\.language = browserLanguage/);
    assert.match(read("poem_store.js"), /\["en", "kn", "te"\]/);
});

test("meter suggestions stay compact and explain evidence rather than absence", () => {
    const styles = read("styles.css");
    const app = read("app.js");
    const catalog = JSON.parse(read("structural_meters.json"));

    assert.match(styles, /\.candidate-list\s*\{[\s\S]*?max-height:/);
    assert.match(styles, /\.candidate-list\s*\{[\s\S]*?overflow-y:\s*auto/);
    assert.match(styles, /\.candidate\.best-candidate\s*\{[\s\S]*?position:\s*sticky/);
    assert.match(app, /exactPada: "Exact pāda"/);
    assert.match(app, /strongPrefix: "Strong prefix"/);
    assert.match(app, /earlyPossibility: "Early possibility"/);
    assert.match(app, /slice\(0, 8\)/);
    assert.equal(catalog.meterProminence["śārdūlavikrīḍitam"], "common");
    assert.equal(catalog.meterProminence["structural:naduvanakkara"], "specialist");
});

test("saved poems use only on-device storage and user-owned backups", () => {
    const store = read("poem_store.js");
    const app = read("app.js");
    const manifest = read("android/app/src/main/AndroidManifest.xml");

    assert.match(store, /indexedDB/);
    assert.match(app, /navigator\.storage\.persist/);
    assert.match(app, /navigator\.canShare\(\{ files: \[file\] \}\)/);
    assert.doesNotMatch(store, /fetch\(|XMLHttpRequest|WebSocket|https?:\/\//);
    assert.doesNotMatch(app, /firebase|firestore|googleapis|supabase/i);
    assert.match(manifest, /android:allowBackup="false"/);
    assert.match(read("requirements.md"), /MUST NOT incur cloud database/);
});

test("original source declares Ganesh Krishna Shankarathota under GPLv3 only", () => {
    const copyrightLine =
        "Copyright © 2025–2026 Ganesh Krishna Shankarathota";
    const sourceFiles = [
        "app.js",
        "analytics.js",
        "meter_analysis.js",
        "scansion.js",
        "strong_template.js",
        "poem_store.js",
        "documentation.js",
        "service-worker.js",
        "styles.css",
        "index.html",
        "about.html",
        "documentation.html",
        "roadmap.html",
        "privacy.html",
        "terms.html",
        "notices.html",
        "icon.svg",
        "scripts/build-static.js",
        "scripts/static-server.js",
        "scripts/validate-static.js",
        "android/app/src/main/java/org/chandas/app/MainActivity.java"
    ];

    sourceFiles.forEach((file) => {
        const contents = read(file);
        assert.match(contents, new RegExp(copyrightLine), file);
        assert.match(contents, /SPDX-License-Identifier: GPL-3\.0-only/, file);
    });

    const packageMetadata = JSON.parse(read("package.json"));
    const originalCatalog = JSON.parse(read("structural_meters.json"));
    const copyrightNotice = read("COPYRIGHT.md");

    assert.equal(packageMetadata.author, "Ganesh Krishna Shankarathota");
    assert.equal(packageMetadata.license, "GPL-3.0-only");
    assert.equal(originalCatalog.copyright, copyrightLine);
    assert.equal(originalCatalog.license, "GPL-3.0-only");
    assert.match(copyrightNotice, /GNU General Public License, version 3\s+only/);
    assert.match(copyrightNotice, /No “or any later version” option is granted/);
    assert.match(copyrightNotice, /mishra\.json/);
    assert.doesNotMatch(read("mishra.json"), /Ganesh Krishna Shankarathota/);
});

test("service worker pre-caches every core web asset", () => {
    const worker = read("service-worker.js");
    const expectedAssets = [
        "index.html",
        "styles.css",
        "app.js",
        "analytics.js",
        "meter_analysis.js",
        "scansion.js",
        "strong_template.js",
        "poem_store.js",
        "mishra.json",
        "structural_meters.json",
        "examples/field_guide_corpus.json",
        "examples/apte_sanskrit_examples.json",
        "docs/research/archive-meter-audit.md",
        "manifest.webmanifest",
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

    expectedAssets.forEach((asset) => {
        assert.match(worker, new RegExp(asset.replace(".", "\\.")));
        assert.ok(fs.existsSync(path.join(root, asset)), `${asset} is missing`);
    });
    assert.match(worker, /event\.request\.mode === "navigate"/);
    assert.match(worker, /cache\.put\(cacheRequest, copy\)/);
    assert.doesNotMatch(worker, /cache\.put\(event\.request, copy\)/);
    assert.match(worker, /event\.data\.type === "SKIP_WAITING"/);
    assert.match(worker, /hasLegacyShell \? self\.skipWaiting\(\)/);
    assert.match(read("app.js"), /UPDATE_CHECK_INTERVAL_MS = 15 \* 60 \* 1000/);
    assert.match(read("app.js"), /updateViaCache: "none"/);
    assert.match(read("app.js"), /visibilitychange/);
    assert.match(read("app.js"), /controllerchange/);
    assert.match(
        read("index.html"),
        /id="app-update"[^>]*aria-live="polite"[^>]*hidden/
    );
});

test("the composition control and live regions have accessible labels", () => {
    const html = read("index.html");

    assert.match(html, /<label for="composition"/);
    assert.match(html, /id="draft-state"[^>]*aria-live="polite"/);
    assert.match(html, /id="validation-summary"[^>]*aria-live="polite"/);
    assert.match(html, /id="toast"[^>]*role="status"[^>]*aria-live="polite"/);
    assert.match(html, /id="cursor-metrics"/);
    assert.match(html, /id="show-template"[^>]*type="checkbox"/);
    assert.match(html, /id="detect-shithila-dvitva"[^>]*type="checkbox"/);
    assert.match(html, /id="scansion-mode"/);
    assert.match(html, /value="amsha"[^>]*data-i18n="scansionAmsha"/);
    assert.match(html, /value="matra-35"[^>]*data-i18n="scansionMatra35"/);
    assert.match(html, /id="template-mode-strong"[^>]*type="radio"/);
    assert.match(html, /id="copy-analysis-url"[^>]*type="button"/);
    assert.match(html, /id="saved-poems-dialog"[^>]*aria-labelledby="saved-poems-title"/);
    assert.match(html, /id="saved-poems-count"[^>]*aria-live="polite"/);
    assert.match(html, /Save all to \.txt/);
    assert.match(html, /Full backup/);
    assert.match(html, /Restore full backup/);
    assert.match(read("app.js"), /openSavedPoemShare\(poem\)/);
    assert.match(read("app.js"), /"saved-poem-share"/);
    assert.match(
        html,
        /id="strong-template-editor"[^>]*aria-labelledby="strong-template-title"/
    );
    assert.match(html, /id="whole-verse-template"[^>]*aria-label="Meter template"/);
});

test("compact header and composer actions use the approved placement", () => {
    const html = read("index.html");
    const headerActionsStart = html.indexOf('class="header-actions"');
    const headerActionsEnd = html.indexOf("</div>", headerActionsStart);
    const composerActionsStart = html.indexOf('class="composer-actions"');
    const composerActionsEnd = html.indexOf("</div>", composerActionsStart);
    const newDraft = html.indexOf('id="new-draft"');

    assert.match(
        html,
        /class="release-badge">PRE-BETA<\/span>\s*<button[^>]+id="app-update"/
    );
    assert.ok(newDraft > composerActionsStart && newDraft < composerActionsEnd);
    assert.ok(newDraft < 0 || newDraft < headerActionsStart || newDraft > headerActionsEnd);
    assert.match(read("styles.css"), /\.app-update-button\s*\{[\s\S]*?font-size:\s*0\.52rem/);
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
    const prasaRules = [
        "prasa-match",
        "prasa-mismatch",
        "prasa-weight-mismatch"
    ].map((className) => styles.match(
        new RegExp(`\\.highlight-layer \\.${className}\\s*\\{([^}]*)\\}`)
    ));

    assert.match(styles, /letter-spacing:\s*normal/);
    assert.ok(violationRule);
    assert.doesNotMatch(violationRule[1], /font-weight/);
    for (const rule of prasaRules) {
        assert.ok(rule);
        assert.match(rule[1], /background:\s*#[0-9a-f]{6}/i);
        assert.doesNotMatch(rule[1], /border-bottom|outline/);
        assert.doesNotMatch(rule[1], /text-decoration/);
    }
    assert.match(
        styles,
        /\.highlight-layer \.laghu\.prasa-weight-mismatch[\s\S]*?text-decoration-style:\s*dotted/
    );
    assert.match(
        styles,
        /\.highlight-layer \.guru\.prasa-weight-mismatch[\s\S]*?text-decoration-style:\s*solid/
    );
    assert.match(styles, /\.recital-extension-anchor\s*\{[\s\S]*?position:\s*relative/);
    assert.match(styles, /\.recital-extension-marker\s*\{[\s\S]*?left:\s*50%/);
    assert.match(
        styles,
        /\.recital-extension-marker\s*\{[\s\S]*?transform:\s*translateX\(-50%\)/
    );
    assert.match(read("app.js"), /class="recital-extension-anchor"/);
});

test("branding and public navigation use the compact approved copy", () => {
    const index = read("index.html");
    const about = read("about.html");
    const packageMetadata = JSON.parse(read("package.json"));
    const publicPages = [index, read("privacy.html"), read("terms.html")].join("\n");

    assert.match(index, /say it in-verse/);
    assert.match(index, /class="release-badge">PRE-BETA<\/span>/);
    assert.doesNotMatch(index, /Let the rhythm appear as you write/i);
    assert.doesNotMatch(publicPages, /github\.com\/smgk\/chandas\.org/);
    assert.match(about, /href="https:\/\/x\.com\/ganeshkrishna"[^>]*>@ganeshkrishna<\/a>/);
    assert.match(about, /Ganesh Krishna Shankarathota/);
    assert.doesNotMatch(about, /Ganesha Krishna Shankarathota/);
    assert.match(
        about,
        new RegExp(`data-app-version="${packageMetadata.version}"`)
    );
    assert.match(
        about,
        new RegExp(`Version <strong>${packageMetadata.version}</strong>`)
    );
    assert.match(index, /© 2025–2026 Ganesh Krishna Shankarathota/);
    assert.match(
        index,
        /href="about\.html">About<\/a>\s*<a href="roadmap\.html">Roadmap<\/a>/
    );
});

test("the public roadmap is concise, forward-looking, and available offline", () => {
    const roadmap = read("roadmap.html");
    const items = roadmap.match(/<li>/g) || [];

    assert.equal(items.length, 9);
    assert.match(roadmap, /Review Kannada meter rules/);
    assert.match(roadmap, /Stronger guided composition/);
    assert.match(roadmap, /Android distribution/);
    assert.match(roadmap, /Synonym suggestions/);
    assert.match(roadmap, /Short analysis links/);
    assert.match(roadmap, /Better user-owned backups/);
    assert.match(roadmap, /never need a paid/);
    assert.match(roadmap, /Anonymous composition/);
    assert.doesNotMatch(roadmap, /Estimate:|weeks|Target:/);
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
    assert.match(documentation, /Pañcamātrā Chaupadi/);
    assert.match(documentation, /ಪಾ · ರ್ಥಾ/);
    assert.match(documentation, /tea break/);
    assert.match(documentation, /id="meter-catalog-total"/);
    assert.match(documentation, /id="meter-catalog-search"/);
    assert.match(documentation, /id="meter-catalog-examples"/);
    assert.match(documentation, /id="meter-catalog-example-count"/);
    assert.match(documentation, /src="documentation\.js"/);
});

test("the Anuṣṭubh rule packet exposes the accepted classical vipulās", () => {
    const catalog = JSON.parse(read("structural_meters.json"));
    const anushtubh = catalog.meters.find((meter) =>
        meter.id === "structural:anushtubh-pathya");
    const oddRealizations = anushtubh.padas[0].realizations;

    assert.equal(catalog.catalogVersion, "5.3.0");
    assert.equal(anushtubh.name, "anuṣṭubh (śloka)");
    assert.deepEqual(oddRealizations.map((item) => item.id), [
        "pathya",
        "na-vipula",
        "bha-vipula",
        "ma-vipula",
        "ra-vipula"
    ]);
    assert.deepEqual(oddRealizations[3].boundariesAfter, [5]);
    assert.deepEqual(oddRealizations[4].boundariesAfter, [4]);
    assert.deepEqual(
        anushtubh.padas[2].realizations,
        oddRealizations
    );
    assert.ok(fs.existsSync(path.join(
        root,
        "docs",
        "rules",
        "anushtubh.md"
    )));
});

test("public-domain Apte examples retain visible source attribution", () => {
    const notices = read("notices.html");
    const thirdParty = read("THIRD_PARTY_NOTICES.md");

    assert.match(notices, /Apte’s 1890/);
    assert.match(notices, /apte_sanskrit_examples\.json/);
    assert.match(thirdParty, /Apte Sanskrit prosody examples/);
    assert.match(thirdParty, /public domain/);
});

test("the provisional Kanda rule packet and attribution are retained", () => {
    const catalog = JSON.parse(read("structural_meters.json"));
    const kanda = catalog.meters.find((meter) =>
        meter.id === "structural:kanda-kannada");

    assert.equal(catalog.catalogVersion, "5.3.0");
    assert.equal(kanda.ruleCompleteness, "provisional-rhythm");
    assert.deepEqual(kanda.uncheckedRules, ["historical prāsa variants"]);
    assert.deepEqual(kanda.padantaLengtheningPadas, [2, 4]);
    assert.deepEqual(kanda.lineRelations, [{ type: "dvitiyakshara-prasa" }]);
    assert.ok(fs.existsSync(path.join(root, "docs", "rules", "kanda.md")));
    assert.match(read("THIRD_PARTY_NOTICES.md"), /Chanda Nikasha/);
    assert.match(read("notices.html"), /Kannada Kanda/);
});

test("the provisional Kagga-form Chaupadi packet and references are retained", () => {
    const catalog = JSON.parse(read("structural_meters.json"));
    const chaupadi = catalog.meters.find((meter) =>
        meter.id === "structural:panchamatra-chaupadi-kagga");

    assert.equal(catalog.catalogVersion, "5.3.0");
    assert.equal(chaupadi.ruleCompleteness, "provisional-rhythm");
    assert.deepEqual(chaupadi.padaGroups, [
        [5, 5, 5, 5],
        [5, 5, 5, 3],
        [5, 5, 5, 5],
        [5, 5, 5, 1]
    ]);
    assert.deepEqual(
        chaupadi.lineRelations.map((relation) => relation.type),
        ["dvitiyakshara-prasa", "antya-prasa"]
    );
    assert.ok(chaupadi.aliases.includes("panchamatra chowpadi"));
    assert.ok(chaupadi.aliases.includes("ಕಗ್ಗ"));
    assert.ok(fs.existsSync(path.join(
        root,
        "docs",
        "rules",
        "panchamatra-chaupadi.md"
    )));
    assert.match(read("THIRD_PARTY_NOTICES.md"), /Pañcamātrā Chaupadi/);
    assert.match(read("notices.html"), /Mankuthimmana Kagga/);
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

    assert.equal(catalog.catalogVersion, "5.3.0");
    assert.equal(shatpadis.length, 8);
    assert.equal(amsha.length, 15);
    shatpadis.forEach((meter) => {
        assert.equal(meter.linePolicy.count, 6);
        assert.equal(
            (meter.padaGroups || meter.amshaGroups).length,
            6
        );
        assert.deepEqual(meter.lineRelations, [{ type: "dvitiyakshara-prasa" }]);
    });
    const padantaMeters = shatpadis.filter((meter) =>
        Array.isArray(meter.padantaLengtheningPadas));
    assert.deepEqual(padantaMeters.map((meter) => meter.id), [
        "structural:shara-shatpadi",
        "structural:kusuma-shatpadi",
        "structural:bhoga-shatpadi",
        "structural:bhamini-shatpadi",
        "structural:parivardhini-shatpadi",
        "structural:vardhaka-shatpadi",
        "structural:uddanda-shatpadi"
    ]);
    padantaMeters.forEach((meter) =>
        assert.deepEqual(meter.padantaLengtheningPadas, [3, 6]));
    const tripadi = amsha.find((meter) => meter.id === "structural:tripadi-kannada");
    const sangatya = amsha.find((meter) => meter.id === "structural:sangatya");
    amsha.forEach((meter) => {
        assert.deepEqual(meter.recitalPolicy, {
            type: "noninitial-laghu-karshana",
            marker: "ಽ",
            matrasPerMark: 1
        });
    });
    assert.deepEqual(tripadi.lineRelations[0].internalAnchors, [{
        pada: 1,
        group: 3,
        syllable: 2
    }]);
    assert.deepEqual(sangatya.lineRelations, [{ type: "dvitiyakshara-prasa" }]);
    assert.ok(fs.existsSync(path.join(root, "docs", "rules", "shatpadi.md")));
    assert.ok(fs.existsSync(path.join(root, "docs", "rules", "amsha-meters.md")));
    assert.match(read("documentation.html"), /Akkara forms/);
    assert.match(read("documentation.html"), /Aṃśa meters/);
    assert.match(read("documentation.html"), /G Lಽ Lಽ/);
    assert.match(read("docs/rules/amsha-meters.md"), /Recital karṣaṇa/);
    assert.match(read("requirements.md"), /equally preferred gaṇa divisions/);
});

test("the historical Kannada expansion retains explicit authorities and variants", () => {
    const catalog = JSON.parse(read("structural_meters.json"));
    const ids = new Set(catalog.meters.map((meter) => meter.id));
    const required = [
        "structural:ele-kannada",
        "structural:tripadi-matra-historical",
        "structural:chaupadi-amsha-kannada",
        "structural:chaupadi-matra-historical",
        "structural:amsha-shatpadi",
        "structural:uddanda-shatpadi",
        "structural:sobagina-sone",
        "structural:chandovatamsa-nagavarma",
        "structural:adivaraha-jayakirti",
        "structural:akkarike-nagavarma",
        "structural:madanavati-nagavarma"
    ];
    required.forEach((id) => assert.ok(ids.has(id), id));

    const chandovatamsa = catalog.meters.find((meter) =>
        meter.id === "structural:chandovatamsa-nagavarma");
    const adivaraha = catalog.meters.find((meter) =>
        meter.id === "structural:adivaraha-jayakirti");
    const madanavati = catalog.meters.find((meter) =>
        meter.id === "structural:madanavati-nagavarma");
    assert.deepEqual(chandovatamsa.amshaGroups[0], ["V", "V", "V", "B"]);
    assert.deepEqual(chandovatamsa.amshaSubstitutions, [
        {
            padas: [2],
            localGroups: [2],
            expectedClass: "V",
            actualClass: "R",
            realizedMatras: 6,
            realization: "contracted",
            karshana: "none",
            authority: "poet-reviewed example"
        },
        {
            padas: [3],
            localGroups: [4],
            expectedClass: "B",
            actualClass: "V",
            realizedMatras: 4,
            realization: "contracted",
            karshana: "none",
            authority: "poet-reviewed example"
        }
    ]);
    assert.deepEqual(adivaraha.amshaGroups[0], ["V", "B", "B", "B", "B"]);
    assert.deepEqual(madanavati.amshaGroups[0], ["V", "V", "V", "V", "V", "G"]);
    assert.deepEqual(madanavati.padantaLengtheningPadas, [1, 2, 3, 4]);
    assert.deepEqual(catalog.fixedMeters, [
        ["campakamāle (Kannada)", "LLLLGLGLLLGLLGLLGLGLG"],
        ["mahāsragdharā (Kannada)", "LLGGGLGGLLLLLLGGLGGLGG"]
    ]);
    assert.match(read("docs/rules/amsha-meters.md"), /Chandovatamsa/);
    assert.match(read("docs/rules/amsha-meters.md"), /VVVB \/ VRVB \/ VVVV \/ VVVB/);
    assert.match(read("documentation.html"), /poet-reviewed realization/);
    assert.match(read("requirements.md"), /canonical frame separate/);
    assert.match(read("docs/rules/shatpadi.md"), /Uddaṇḍa/);
    assert.match(read("docs/rules/ragale.md"), /24 mātrās/);
});

test("folk Tripadi remains separate from classical Tripadi and documents sung marks", () => {
    const catalog = JSON.parse(read("structural_meters.json"));
    const classical = catalog.meters.find((meter) =>
        meter.id === "structural:tripadi-kannada");
    const folk = catalog.meters.find((meter) =>
        meter.id === "structural:tripadi-folk-kannada");

    assert.equal(classical.kind, "amsha");
    assert.equal(classical.sourceRef, "amshaSource");
    assert.equal(folk.kind, "matra");
    assert.equal(folk.sourceRef, "folkTripadiSource");
    assert.deepEqual(folk.padaGroups, [
        [5, 5, 5, 5],
        [5, 4, 5, 5],
        [5, 4, 5]
    ]);
    assert.deepEqual(folk.sungLaghuExtension, {
        maxMatras: 1,
        marker: "ಽ"
    });
    assert.ok(fs.existsSync(path.join(root, "docs", "rules", "folk-tripadi.md")));
    assert.match(read("documentation.html"), /Folk Tripadi \(Kannada\)/);
    assert.match(read("documentation.html"), /superscript/);
    assert.match(read("requirements.md"), /MUST NOT weaken or\s+replace classical/);
});
