/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const fs = require("node:fs/promises");
const { expect, test } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
    const errors = [];
    page.on("console", (message) => {
        if (message.type() === "error") {
            errors.push(message.text());
        }
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator("#composition")).toBeVisible();
    await expect(page.locator("#draft-state"))
        .toContainText(/device|ಸಾಧನ|పరికరం|ઉપકરણ/);
    page.__runtimeErrors = errors;
});

test.afterEach(async ({ page }) => {
    expect(page.__runtimeErrors || []).toEqual([]);
});

test("analyzes Kannada, Telugu, and Devanagari stanzas inline", async ({ page }) => {
    await expect(page.locator(".release-badge")).toHaveText("PRE-BETA");
    await page.locator("#composition").fill("ಕ ಕಾ ಕಂ\n\nक का कं\n\nక కా కం");

    await expect(page.locator("#analysis-title")).toHaveText("Stanza 3 of 3");
    await page.locator("#previous-stanza").click();
    await page.locator("#previous-stanza").click();
    await expect(page.locator("#analysis-title")).toHaveText("Stanza 1 of 3");
    await expect(page.locator("#active-pattern")).toHaveText("LGG");
    await expect(page.locator("#highlight-layer .laghu")).toHaveCount(3);
    await expect(page.locator("#highlight-layer .guru")).toHaveCount(6);

    await page.locator("#next-stanza").click();
    await page.locator("#next-stanza").click();
    await expect(page.locator("#analysis-title")).toHaveText("Stanza 3 of 3");
    await expect(page.locator("#active-pattern")).toHaveText("LGG");
});

test("analyzes Roman schemes while highlighting the authored letter groups", async ({
    page,
    context,
    browser
}) => {
    await page.locator("#input-scheme").selectOption("iast");
    await page.locator("#composition").fill("ka kā kaṃ");

    await expect(page.locator("#active-pattern")).toHaveText("LGG");
    await expect(page.locator("#highlight-layer .laghu")).toHaveText(["ka"]);
    await expect(page.locator("#highlight-layer .guru")).toHaveText(["kā", "kaṃ"]);
    await expect(page.locator("#detect-shithila-dvitva")).toBeHidden();

    await page.locator("#composition").fill("ka ka\nka ka\nka ka\nka ka");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#show-template").check();
    await expect(page.locator("#template-mode-strong")).toBeDisabled();
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText(Array(4).fill("L L"));

    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator("#share").click();
    await page.locator("#copy-analysis-url").click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    const copiedUrl = new URL(copied);
    expect(copiedUrl.searchParams.get("scheme")).toBe("iast");
    expect(copiedUrl.searchParams.get("verse"))
        .toBe("ka ka\nka ka\nka ka\nka ka");

    const linkedContext = await browser.newContext();
    const linkedPage = await linkedContext.newPage();
    const localUrl = new URL("/", page.url());
    localUrl.search = copiedUrl.search;
    await linkedPage.goto(localUrl.toString());
    await expect(linkedPage.locator("#composition"))
        .toHaveValue("ka ka\nka ka\nka ka\nka ka");
    await expect(linkedPage.locator("#input-scheme")).toHaveValue("iast");

    await linkedPage.reload();
    await expect(linkedPage.locator("#input-scheme")).toHaveValue("iast");
    await expect(linkedPage.locator("#active-pattern"))
        .toHaveText("LL / LL / LL / LL");
    await linkedContext.close();
});

test("shows Telugu-native Guru and Laghu template symbols", async ({ page }) => {
    await page.locator("#composition").fill("క");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#show-template").check();

    await expect(page.locator("#highlight-layer .ghost-template")).toHaveText("ల");
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText(["ల ల", "ల ల", "ల ల", "ల ల"]);

    await page.locator("#meter-search").fill("anushtup");
    await page.locator("#meter-select").selectOption("structural:anushtubh-pathya");
    await expect(page.locator("#highlight-layer .ghost-template"))
        .toContainText("గా");
});

test("shows Gujarati-native analysis and template symbols", async ({ page }) => {
    await page.locator("#composition").fill("ક કા કં");
    await expect(page.locator("#active-pattern")).toHaveText("LGG");
    await page.locator("#composition").fill("ક");

    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#show-template").check();

    await expect(page.locator("#highlight-layer .ghost-template")).toHaveText("લ");
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText(["લ લ", "લ લ", "લ લ", "લ લ"]);

    await page.locator("#meter-search").fill("anushtup");
    await page.locator("#meter-select").selectOption("structural:anushtubh-pathya");
    await expect(page.locator("#highlight-layer .ghost-template"))
        .toContainText("ગા");
});

test("selects Gujarati meters by Roman name and shows a whole-verse guide", async ({
    page
}) => {
    await page.locator("#composition").fill(
        "આકાશે તારાની ભાત\n" +
        "ધરતી હૈયે ફૂલબિછાત\n" +
        "સર્જી, તો કાં સર્જી તાત!\n" +
        "માનવના મનમાં મધરાત!"
    );

    const chaupaiCandidate = page.locator(
        '.candidate[data-meter-id="structural:chaupai-gujarati"]'
    );
    await expect(chaupaiCandidate).toBeVisible();
    await expect(chaupaiCandidate.locator(".candidate-status"))
        .toHaveText("Exact");

    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("chaupai");
    await expect(page.locator("#meter-select option")).toHaveText([
        "caupāī (Gujarati)"
    ]);
    await page.locator("#meter-select")
        .selectOption("structural:chaupai-gujarati");
    await page.locator("#show-template").check();

    await expect(page.locator("#whole-verse-template .whole-template-heading"))
        .toHaveText("caupāī (Gujarati) template");
    await expect(page.locator("#whole-verse-template .whole-template-line"))
        .toHaveCount(4);
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText(Array(4).fill("M 15 · 4|4|4|3"));
});

test("allows choosing a meter before the first syllable is typed", async ({ page }) => {
    await expect(page.locator("#analysis-content")).toBeVisible();
    await expect(page.locator("#meter-picker")).toBeVisible();
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");

    await expect(page.locator("#selected-meter-name")).toHaveText("madhu");
    await expect(page.locator("#validation-summary"))
        .toContainText("madhu is ready");
    await page.waitForTimeout(350);
    await page.reload();
    await expect(page.locator("#selected-meter-name")).toHaveText("madhu");
    await page.locator("#composition").fill("ಕ");
    await expect(page.locator("#selected-meter-name")).toHaveText("madhu");
    await expect(page.locator("#active-pattern")).toHaveText("L");
});

test("keeps mātrā gait scansion advisory, exclusive, and shareable", async ({
    page,
    context
}) => {
    const text = Array.from({ length: 25 }, () => "ಕ").join(" ");
    const selector = page.locator("#scansion-mode");
    await page.locator("#composition").fill(text);
    await selector.selectOption("matra-35");

    const gaitGroups = page.locator(
        "#highlight-layer .scansion-group-matra"
    );
    await expect(gaitGroups.locator(".scansion-group-label"))
        .toHaveText(["3", "5", "3", "5", "3", "5"]);
    await expect(gaitGroups).toHaveCount(6);
    const gaitCenterOffsets = await gaitGroups.evaluateAll((groups) =>
        groups.map((group) => {
            const labelNode = group.querySelector(".scansion-group-label");
            const label = labelNode.getBoundingClientRect();
            const lines = [];
            const textRects = Array.from(group.querySelectorAll(
                ".guru, .laghu, .uncertain"
            )).map((node) => node.getBoundingClientRect());
            textRects
                .forEach((rect) => {
                    let line = lines.find((item) =>
                        Math.abs(item.top - rect.top) < 1);
                    if (!line) {
                        line = { top: rect.top, left: rect.left, right: rect.right };
                        lines.push(line);
                    } else {
                        line.left = Math.min(line.left, rect.left);
                        line.right = Math.max(line.right, rect.right);
                    }
                });
            const widest = lines.sort((left, right) =>
                (right.right - right.left) - (left.right - left.left))[0];
            return {
                horizontal: Math.abs(
                    (widest.left + widest.right) / 2 -
                    (label.left + label.width / 2)
                ),
                superscript: Math.min(...textRects.map((rect) => rect.top)) -
                    label.top
            };
        }));
    expect(Math.max(...gaitCenterOffsets.map((item) => item.horizontal)))
        .toBeLessThanOrEqual(1);
    expect(Math.min(...gaitCenterOffsets.map((item) => item.superscript)))
        .toBeGreaterThan(0);
    await expect(page.locator("#highlight-layer .scansion-boundary.scansion-matra"))
        .toHaveCount(7);
    await expect(page.locator("#highlight-layer .line-metrics-badge"))
        .toContainText("x=1");
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(0);
    await expect(page.locator("#composition")).toHaveValue(text);

    await selector.selectOption("off");
    await expect(page.locator("#highlight-layer .scansion-boundary")).toHaveCount(0);
    await expect(page.locator("#highlight-layer .laghu")).toHaveCount(0);
    await selector.selectOption("weights");
    await expect(page.locator("#highlight-layer .laghu")).toHaveCount(25);

    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await selector.selectOption("matra-53");
    await page.locator("#share").click();
    await page.locator("#copy-analysis-url").click();
    const copied = new URL(await page.evaluate(() => navigator.clipboard.readText()));
    expect(copied.searchParams.get("scan")).toBe("matra-53");
});

test("keeps śithila-dvitva optional, isolated, and shareable", async ({ page }) => {
    const option = page.locator("#detect-shithila-dvitva");
    await expect(option).not.toBeChecked();
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#composition").fill("ಎರ್ದೆ");

    await expect(page.locator("#active-pattern")).toHaveText("GL");
    await expect(page.locator("#validation-summary")).toContainText("1 mismatched");
    await option.check();
    await expect(page.locator("#active-pattern")).toHaveText("LL");
    await expect(page.locator("#validation-summary"))
        .toContainText("1 śithila-dvitva realization");
    await expect(page.locator("#highlight-layer .shithila-dvitva-marker"))
        .toHaveText("*");

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator("#share").click();
    await page.locator("#copy-analysis-url").click();
    const copied = new URL(await page.evaluate(() => navigator.clipboard.readText()));
    expect(copied.searchParams.get("sd")).toBe("1");

    await option.uncheck();
    await expect(page.locator("#active-pattern")).toHaveText("GL");
    await expect(page.locator("#highlight-layer .shithila-dvitva-marker"))
        .toHaveCount(0);
});

test("shows advisory Kannada prāsa with no meter and with a fixed vṛtta", async ({
    page
}) => {
    const editor = page.locator("#composition");
    await editor.fill("ಕಪ\nಜಪ");

    await expect(page.locator("#prasa-summary")).toContainText(
        "Automatic Kannada-script Dvitīyākṣara-prāsa matches on ಪ."
    );
    await expect(page.locator("#highlight-layer .prasa-match")).toHaveText(["ಪ", "ಪ"]);

    await editor.fill("ಕಪ\nಜತ");
    await expect(page.locator("#prasa-summary")).toContainText(
        "Automatic Kannada-script Dvitīyākṣara-prāsa: 1 mismatch(es)."
    );
    await expect(page.locator("#highlight-layer .prasa-mismatch")).toHaveText("ತ");
    await expect(page.locator("#highlight-layer .prasa-mismatch.violation")).toHaveCount(0);
    await expect(page.locator("#validation-summary")).toHaveText(
        "Choose a meter to check this stanza."
    );

    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await expect(page.locator("#prasa-summary")).toContainText(
        "Automatic Kannada-script Dvitīyākṣara-prāsa"
    );

    await editor.fill("कप\nजप");
    await expect(page.locator("#prasa-summary")).toBeHidden();
});

test("keeps Kannada prāsa active around danda and verse numbers", async ({ page }) => {
    const text = [
        "**ಶ್ರೀಯನರಾತಿ ಸಾಧನ ಪಯೋನಿಧಿಯೊಳ್ ಪಡೆದುಂ ಧರಿತ್ರಿಯಂ**",
        "**ಜೀಯೆನೆ ಬೇಡಿಕೊಳ್ಳದೆ ವಿರೋಧಿ ನರೇಂದ್ರರನೊತ್ತಿಕೊಂಡುಮಾ।**",
        "**ತ್ಮೀಯ ಸುಪುಷ್ಪಪಟ್ಟಮನೊಡಂಬಡೆ ತಾಳ್ದಿಯುಮಿಂತುದಾತ್ತ ನಾ**",
        "**ರಾಯಣನಾದ ದೇವನೆಮಗೀಗರಿಕೇಸರಿ ಸೌಖ್ಯಕೋಟಿಯಂ ॥೧॥**"
    ].join("\n");
    await page.locator("#composition").fill(text);

    await expect(page.locator("#candidate-list .candidate-name").first())
        .toHaveText("utpalamālikā");
    await expect(page.locator("#prasa-summary")).toContainText(
        "Automatic Kannada-script Dvitīyākṣara-prāsa matches on ಯ."
    );
    await expect(page.locator("#highlight-layer .prasa-match")).toHaveText([
        "ಯ", "ಯೆ", "ಯ", "ಯ"
    ]);

    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("utpalamalika");
    await page.locator("#meter-select").selectOption("utpalamālikā");
    await expect(page.locator("#prasa-summary")).toContainText(
        "Automatic Kannada-script Dvitīyākṣara-prāsa matches on ಯ."
    );
    await expect(page.locator("#highlight-layer .prasa-match")).toHaveText([
        "ಯ", "ಯೆ", "ಯ", "ಯ"
    ]);
});

test("treats the trailing dead ರ್ in ಟರ್ as a coda for prāsa", async ({ page }) => {
    const text = [
        "ಕಟ್ಟಿದಸಿಂಘಮನ್ ಕೆಟ್ಟೋದೇನೆಮಗೆಂದು",
        "ಬಿಟ್ಟವೋಲ್ ಕಲಿಗೆವಿಪರೀತಂಗಹಿತರ್ಕಳ್",
        "ಕೆಟ್ಟರ್ಮೇಣ್ಸತ್ತರವಿಚಾರಂ"
    ].join("\n");
    await page.locator("#composition").fill(text);

    await expect(page.locator("#prasa-summary")).toContainText(
        "Automatic Kannada-script Dvitīyākṣara-prāsa matches on ಟ."
    );
    await expect(page.locator("#highlight-layer .prasa-match")).toHaveText([
        "ಟ್ಟಿ", "ಟ್ಟ", "ಟ್ಟ"
    ]);
    await expect(page.locator("#highlight-layer .prasa-mismatch")).toHaveCount(0);
});

test("keeps supported-script conjuncts joined across highlight changes", async ({
    page
}) => {
    await page.locator("#composition").fill("ನಿಶ್ಚಲ\n\nनिश्चल\n\nనిశ్చల");

    await expect(page.locator("#highlight-layer .guru")).toHaveText(["ನಿ", "नि", "ని"]);
    await expect(page.locator("#highlight-layer .laghu")).toHaveText([
        "ಶ್ಚ",
        "ಲ",
        "श्च",
        "ल",
        "శ్చ",
        "ల"
    ]);

    const editorTracking = await page.locator("#composition").evaluate((editor) =>
        getComputedStyle(editor).letterSpacing);
    expect(editorTracking).toBe("normal");
});

test("prioritizes strong vritta evidence in a compact scrollable list", async ({
    page
}) => {
    const editor = page.locator("#composition");
    await editor.fill("ಪಾರ್ಥಾಯ ಪ್ರತಿಭೋದಿತಾಂ ಭಗವತಾ ನಾರಾಯ");

    const candidates = page.locator("#candidate-list .candidate");
    await expect(candidates).toHaveCount(8);
    await expect(candidates.first().locator(".candidate-name"))
        .toHaveText("śārdūlavikrīḍitam");
    await expect(candidates.first().locator(".candidate-status"))
        .toHaveText("Strong prefix");
    await expect(candidates.first().locator(".candidate-detail"))
        .toContainText("15/19 syllables");
    await expect(candidates.first().locator(".candidate-prominence"))
        .toHaveText("Common");
    const scrolling = await page.locator("#candidate-list").evaluate((list) => ({
        overflowY: getComputedStyle(list).overflowY,
        scrollHeight: list.scrollHeight,
        clientHeight: list.clientHeight
    }));
    expect(scrolling.overflowY).toBe("auto");
    expect(scrolling.scrollHeight).toBeGreaterThan(scrolling.clientHeight);

    await editor.fill("ಪಾರ್ಥಾಯ ಪ್ರತಿಭೋದಿತಾಂ ಭಗವತಾ ನಾರಾಯಣೇನ ಸ್ವಯಂ");
    await expect(candidates.first().locator(".candidate-name"))
        .toHaveText("śārdūlavikrīḍitam");
    await expect(candidates.first().locator(".candidate-status"))
        .toHaveText("Exact pāda");
    await expect(candidates.first().locator(".candidate-detail"))
        .toContainText("19/19 syllables · 1/4 pādas");
});

test("recognizes Devanagari long vowels and two-line fixed-vṛtta verses", async ({
    page
}) => {
    const editor = page.locator("#composition");
    await editor.fill("ए ओ ये वो");
    await expect(page.locator("#active-pattern")).toHaveText("GGGG");

    const pattern = "GLGLLLGLGLG";
    const writePattern = (value) => Array.from(value, (weight) =>
        weight === "G" ? "का" : "क").join(" ");
    const halfVerse = `${writePattern(pattern)} ${writePattern(pattern)}`;
    await editor.fill(`${halfVerse}\n${halfVerse}`);

    const rathoddhata = page.locator("#candidate-list .candidate")
        .filter({ hasText: "rathoddhatā" });
    await expect(rathoddhata.locator(".candidate-status")).toHaveText("Exact");
    await expect(rathoddhata.locator(".candidate-detail"))
        .toContainText("11/11 syllables · 4/4 pādas");

    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("rathoddhata");
    await page.locator("#meter-select").selectOption("rathoddhatā");
    await expect(page.locator("#validation-summary"))
        .toHaveText("This stanza follows rathoddhatā.");
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(0);
});

test("shows pādānta-lengthened Laghu as Guru in Mandākrāntā", async ({ page }) => {
    const verse = [
        "कश्चित्कान्ताविरहगुरुणा स्वाधिकारात्प्रमत्तः",
        "शापेनास्तङ्गमितमहिमा वर्षभोग्येण भर्तुः ।",
        "यक्षश्चक्रे जनकतनयास्नानपुण्योदकेषु",
        "स्निग्धच्छायातरुषु वसतिं रामगिर्याश्रमेषु॥१.१॥"
    ].join("\n");
    await page.locator("#composition").fill(verse);
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("mandakranta");
    await page.locator("#meter-select").selectOption("mandākrāntā");

    await expect(page.locator("#validation-summary"))
        .toHaveText("This stanza follows mandākrāntā.");
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(0);
    await expect(page.locator("#highlight-layer .guru").filter({ hasText: "षु" }))
        .toHaveCount(2);
});

test("loads a raw-query verse once and appends it to a recovered draft", async ({ page }) => {
    const imported = "ಕಾವ್ಯ\nಪದ್ಯ";
    await page.locator("#composition").fill("ಮೊದಲ ಪದ್ಯ");
    await page.waitForTimeout(400);

    await page.goto(`/?${encodeURIComponent(imported)}`);
    await expect(page.locator("#composition"))
        .toHaveValue(`ಮೊದಲ ಪದ್ಯ\n\n${imported}`);
    await expect(page).toHaveURL(/\/$/);

    await page.reload();
    await expect(page.locator("#composition"))
        .toHaveValue(`ಮೊದಲ ಪದ್ಯ\n\n${imported}`);
});

test("loads meter and Strong-template choices from explicit URL parameters", async ({ page }) => {
    const params = new URLSearchParams({
        verse: "ಕ\n\nಕಾ",
        meter: "shardulavikriditam",
        template: "strong"
    });
    await page.goto(`/?${params.toString()}`);

    await expect(page.locator("#composition")).toHaveValue("ಕ\n\nಕಾ");
    await expect(page.locator("#analysis-title")).toHaveText("Stanza 2 of 2");
    await expect(page.locator("#selected-meter-name"))
        .toHaveText("śārdūlavikrīḍitam");
    await expect(page.locator("#show-template")).toBeChecked();
    await expect(page.locator("#template-mode-strong")).toBeChecked();
    await expect(page.locator("#strong-template-editor")).toBeVisible();
    await page.locator("#previous-stanza").click();
    await expect(page.locator("#selected-meter-name"))
        .toHaveText("śārdūlavikrīḍitam");
    await expect(page.locator("#template-mode-strong")).toBeChecked();
    await expect(page).toHaveURL(/\/$/);
});

test("shows compact line totals and counts from the current line at the cursor", async ({ page }) => {
    await page.locator("#composition").fill("ಕ ಕಾ\nಕಂ");

    await expect(page.locator("#highlight-layer .line-metrics-badge")).toHaveText([
        "S2 · M3",
        "S1 · M2"
    ]);
    await expect(page.locator("#cursor-metrics"))
        .toHaveText("Syllable 1 · Mātrās 2");

    await page.locator("#composition").evaluate((editor) => {
        editor.focus();
        editor.setSelectionRange(1, 1);
        editor.dispatchEvent(new Event("select", { bubbles: true }));
    });
    await expect(page.locator("#cursor-metrics"))
        .toHaveText("Syllable 1 · Mātrās 1");

    const fontSize = await page.locator("#composition").evaluate((editor) =>
        Number.parseFloat(getComputedStyle(editor).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(16);
    expect(fontSize).toBeLessThanOrEqual(21);
});

test("treats punctuation as transparent before a following conjunct", async ({ page }) => {
    await page.locator("#composition").fill("ಕ, ಕ್ರ\n\nक। क्र");

    await expect(page.locator("#active-pattern")).toHaveText("GL");
    await page.locator("#previous-stanza").click();
    await expect(page.locator("#active-pattern")).toHaveText("GL");
    await expect(page.locator("#highlight-layer .guru")).toHaveCount(2);
});

test("selects and validates a meter for only the active stanza", async ({ page }) => {
    await page.locator("#composition").fill("ಕಾಂ ಕಾ\n\nಕವಿ");
    await page.locator("#previous-stanza").click();
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#show-template").check();

    await expect(page.locator("#validation-summary")).toHaveClass(/has-errors/);
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(2);

    await page.locator("#next-stanza").click();
    await expect(page.locator("#validation-summary")).not.toHaveClass(/has-errors/);
    await expect(page.locator("#validation-summary")).toContainText("Choose a meter");
    await expect(page.locator("#selected-meter-reference")).toBeHidden();

    await page.locator("#previous-stanza").click();
    await expect(page.locator("#show-template")).toBeChecked();
});

test("finds scholarly meter names with common Roman spelling and shows the signature", async ({ page }) => {
    await page.locator("#composition").fill("ಕವಿ");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("shardulavikriditam");

    await expect(page.locator("#meter-select option")).toHaveText([
        "śārdūlavikrīḍitam"
    ]);
    await page.locator("#meter-select").selectOption("śārdūlavikrīḍitam");

    await expect(page.locator("#selected-meter-reference")).toBeVisible();
    await expect(page.locator("#selected-meter-name")).toHaveText("śārdūlavikrīḍitam");
    await expect(page.locator("#selected-meter-signature"))
        .toHaveText("GGGLLGLGLLLGGGLGGLG");
});

test("keeps clear and the ghost guide available outside the meter picker", async ({ page }) => {
    const editor = page.locator("#composition");
    await editor.fill("ಕ");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#meter-picker summary").click();

    await expect(page.locator("#meter-picker")).not.toHaveAttribute("open", "");
    await expect(page.locator("#clear-meter")).toBeVisible();
    await page.locator("#show-template").check();
    await expect(page.locator("#highlight-layer .ghost-template")).toHaveText("ಲ");
    await expect(page.locator("#whole-verse-template")).toBeVisible();
    await expect(page.locator("#whole-verse-template .whole-template-heading"))
        .toHaveText("madhu template");
    await expect(page.locator("#whole-verse-template .whole-template-line")).toHaveCount(4);
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText(["ಲ ಲ", "ಲ ಲ", "ಲ ಲ", "ಲ ಲ"]);
    await expect(editor).toHaveValue("ಕ");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator("#copy").click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe("ಕ");

    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("anushtup");
    await page.locator("#meter-select").selectOption("structural:anushtubh-pathya");
    await expect(page.locator("#show-template")).toBeChecked();
    await expect(page.locator("#highlight-layer .ghost-template")).toContainText("○");
    await expect(page.locator("#highlight-layer .ghost-template")).toContainText("ಗಾ");
    await expect(page.locator("#whole-verse-template .whole-template-line")).toHaveCount(4);
    await expect(page.locator("#whole-verse-template .whole-template-line-guide").first())
        .toContainText("ಲ");

    await page.locator("#meter-search").fill("arya");
    await page.locator("#meter-select").selectOption("structural:arya");
    await expect(page.locator("#highlight-layer .ghost-template"))
        .toHaveText("M 1/12 · 4|4|4");
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText([
            "M 12 · 4|4|4",
            "M 18 · 4|4|4|4|2",
            "M 12 · 4|4|4",
            "M 15 · 4|4|1|4|2"
        ]);

    await page.locator("#meter-picker summary").click();
    await page.locator("#clear-meter").click();
    await expect(page.locator("#selected-meter-reference")).toBeHidden();
    await expect(page.locator("#highlight-layer .ghost-template")).toHaveCount(0);
    await expect(page.locator("#whole-verse-template")).toBeHidden();
    await expect(editor).toHaveValue("ಕ");
});

test("fills fixed-vritta strong-template positions out of order without copying blanks", async ({ page }) => {
    await page.locator("#composition").fill("ಕ");
    await expect(page.locator("#active-pattern")).toHaveText("L");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#show-template").check();

    await expect(page.locator("#template-mode-strong")).toBeEnabled();
    await page.locator("#template-mode-strong").check();
    await expect(page.locator("#strong-template-editor")).toBeVisible();
    await expect(page.locator("#editor-shell")).toBeHidden();
    await expect(page.locator(".strong-template-line")).toHaveCount(4);
    await expect(page.locator(".strong-template-slot")).toHaveCount(8);

    const first = page.locator('.strong-template-slot[data-line-index="0"][data-slot-index="0"]');
    const later = page.locator('.strong-template-slot[data-line-index="0"][data-slot-index="1"]');
    const fourthLine = page.locator('.strong-template-slot[data-line-index="3"][data-slot-index="0"]');
    await expect(first).toHaveValue("ಕ");
    await page.waitForTimeout(60);
    await first.fill("");
    await expect(first).toHaveValue("");
    await later.fill("ಕಾ");
    await later.press("Control+z");
    await expect(later).toHaveValue("");
    await later.press("Control+y");
    await expect(later).toHaveValue("ಕಾ");
    await expect(first).toHaveValue("");
    await fourthLine.fill("द");

    await expect(first).toHaveValue("");
    await expect(later).toHaveClass(/is-mismatch/);
    await expect(fourthLine).toHaveClass(/is-match/);
    await expect(page.locator("#validation-summary")).toContainText("need attention");

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator("#copy").click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe("ಕಾ\n\n\nद");

    await page.locator("#template-mode-ghost").check();
    await expect(page.locator("#strong-template-editor")).toBeHidden();
    await expect(page.locator("#editor-shell")).toBeVisible();
    await expect(page.locator("#composition")).toHaveValue("ಕಾ\n\n\nद");
    await page.locator("#composition").fill("ಕ\nद");

    await page.locator("#template-mode-strong").check();
    await expect(later).toHaveValue("ಕ");
    await expect(fourthLine).toHaveValue("द");
    await page.waitForTimeout(400);
    await page.reload();
    await expect(page.locator("#strong-template-editor")).toBeVisible();
    await expect(later).toHaveValue("ಕ");
    await expect(fourthLine).toHaveValue("द");
    await page.context().setOffline(true);
    await page.reload();
    await expect(page.locator("#strong-template-editor")).toBeVisible();
    await expect(later).toHaveValue("ಕ");
    await expect(fourthLine).toHaveValue("द");
});

test("keeps conjunct onsets whole while Strong mode scans across slots", async ({
    page
}) => {
    await page.locator("#composition").fill("ನಿಶ್ಚಲ");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("mandari");
    await page.locator("#meter-select").selectOption("mandari");
    await page.locator("#show-template").check();
    await page.locator("#template-mode-strong").check();

    const firstLine = page.locator(
        '.strong-template-slot[data-line-index="0"]'
    );
    await expect.poll(() => firstLine.evaluateAll((inputs) =>
        inputs.map((input) => input.value)))
        .toEqual(["ನಿ", "ಶ್ಚ", "ಲ"]);
    await expect(firstLine.nth(0)).toHaveClass(/is-match/);
    await expect(firstLine.nth(1)).toHaveClass(/is-match/);
    await expect(firstLine.nth(2)).toHaveClass(/is-match/);
    await expect(page.locator("#active-pattern")).toContainText("GLL");
    await expect(page.locator("#validation-summary"))
        .toContainText("Every filled position follows mandari");

    await page.locator("#template-mode-ghost").check();
    await expect(page.locator("#composition")).toHaveValue("ನಿಶ್ಚಲ");
});

test("rebuilds version-one analysis-link slots with conjunct-safe boundaries", async ({
    page
}) => {
    const oldSlots = [
        ["ನಿಶ್", "ಚ", "ಲ"],
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];
    const params = new URLSearchParams({
        v: "1",
        verse: "ನಿಶ್ಚಲ",
        meter1: "mandari",
        template1: "strong",
        slots1: JSON.stringify(oldSlots)
    });

    await page.goto(`/?${params.toString()}`);
    await expect(page.locator("#template-mode-strong")).toBeChecked();
    const firstLine = page.locator(
        '.strong-template-slot[data-line-index="0"]'
    );
    await expect.poll(() => firstLine.evaluateAll((inputs) =>
        inputs.map((input) => input.value)))
        .toEqual(["ನಿ", "ಶ್ಚ", "ಲ"]);
});

test("keeps strong mode unavailable for provisional structural meter guides", async ({ page }) => {
    const params = new URLSearchParams({
        verse: "ಕವಿ",
        meter: "kandapadya",
        template: "strong"
    });
    await page.goto(`/?${params.toString()}`);

    await expect(page.locator("#selected-meter-name")).toHaveText("kanda (Kannada)");
    await expect(page.locator("#template-mode-ghost")).toBeChecked();
    await expect(page.locator("#template-mode-strong")).toBeDisabled();
    await expect(page.locator("#strong-template-availability"))
        .toContainText("rule review");
});

test("finds Anuṣṭubh as anushtup and shows structural and mātrā references", async ({ page }) => {
    const pathya = [
        "ಕಾ ಕ ಕಾ ಕಾ ಕ ಕಾ ಕಾ ಕಾ",
        "ಕಾ ಕ ಕಾ ಕಾ ಕ ಕಾ ಕ ಕಾ",
        "ಕಾ ಕ ಕಾ ಕಾ ಕ ಕಾ ಕಾ ಕಾ",
        "ಕಾ ಕ ಕಾ ಕಾ ಕ ಕಾ ಕ ಕಾ"
    ].join("\n");
    await page.locator("#composition").fill(pathya);
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("anushtup");

    await expect(page.locator("#meter-select option")).toHaveText([
        "anuṣṭubh (śloka)"
    ]);
    await page.locator("#meter-select").selectOption("structural:anushtubh-pathya");

    await expect(page.locator("#selected-meter-signature"))
        .toContainText("4 pādas × 8 syllables");
    await expect(page.locator("#active-matras"))
        .toHaveText("Mātrās by pāda: 14 | 13 | 14 | 13");
    await expect(page.locator("#validation-summary"))
        .toHaveText("This stanza follows anuṣṭubh (śloka).");

    const compactPathya = [
        "ಕಾ ಕ ಕಾ ಕಾ ಕ ಕಾ ಕಾ ಕಾ ಕಾ ಕ ಕಾ ಕಾ ಕ ಕಾ ಕ ಕಾ",
        "ಕಾ ಕ ಕಾ ಕಾ ಕ ಕಾ ಕಾ ಕಾ ಕಾ ಕ ಕಾ ಕಾ ಕ ಕಾ ಕ ಕಾ"
    ].join("\n");
    await page.locator("#composition").fill(compactPathya);
    const compactCandidate = page.locator("#candidate-list .candidate")
        .filter({ hasText: "anuṣṭubh (śloka)" });
    await expect(compactCandidate).toHaveAttribute("data-match-level", "exact-verse");
    await expect(compactCandidate.locator(".candidate-status")).toHaveText("Selected");
    await expect(compactCandidate.locator(".candidate-detail"))
        .toContainText("4/4 units");
    await expect(page.locator("#validation-summary"))
        .toHaveText("This stanza follows anuṣṭubh (śloka).");
    await page.locator("#show-template").check();
    await expect(page.locator("#whole-verse-template .whole-template-line"))
        .toHaveCount(4);
});

test("finds and validates provisional Kannada Kanda independently", async ({ page }) => {
    const kanda = [
        "ಕಾವೇರಿಯಿಂದ ಮಾಗೋ",
        "ದಾವರಿವರ ಮಿರ್ಪ ನಾಡದಾ ಕನ್ನಡದೊಳ್",
        "ಭಾವಿಸಿದ ಜನಪದಂ ವಸು",
        "ಧಾವಳಯ ವಿಲೀನ ವಿಶದ ವಿಷಯ ವಿಶೇಷಂ"
    ].join("\n");
    await page.locator("#composition").fill(kanda);
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("ಕಂದಪದ್ಯ");
    await expect(page.locator("#meter-select option")).toHaveText([
        "kanda (Kannada)"
    ]);
    await page.locator("#meter-search").fill("kandapadya");
    await page.locator("#meter-select").selectOption("structural:kanda-kannada");
    await page.locator("#show-template").check();

    await expect(page.locator("#selected-meter-signature"))
        .toContainText("12 | 20 | 12 | 20 mātrās");
    await expect(page.locator("#active-matras"))
        .toHaveText("Mātrās by pāda: 12 | 20 | 12 | 20");
    await expect(page.locator("#validation-summary"))
        .toContainText("historical prāsa variants is not checked yet");
    await expect(page.locator("#prasa-summary"))
        .toContainText("Dvitīyākṣara-prāsa matches on ವ.");
    await expect(page.locator("#validation-summary")).not.toHaveClass(/has-errors/);
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(0);
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText([
            "M 12 · 4|4|4",
            "M 20 · 4|4|4|4|4",
            "M 12 · 4|4|4",
            "M 20 · 4|4|4|4|4"
        ]);
});

test("finds, guides, and validates Pañcamātrā Chaupadi in the Kagga form", async ({
    page
}) => {
    const textForPattern = (pattern) =>
        Array.from(pattern, (weight) => weight === "G" ? "ಕಾ" : "ಕ").join(" ");
    const fiveMatras = "GGL";
    const kaggaFrame = [
        fiveMatras.repeat(4),
        `${fiveMatras.repeat(3)}GL`,
        fiveMatras.repeat(4),
        `${fiveMatras.repeat(3)}L`
    ].map(textForPattern).join("\n");

    await page.locator("#composition").fill(kaggaFrame);
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("panchamatra choupadi");
    await expect(page.locator("#meter-select option")).toHaveText([
        "pañcamātrā chaupadi (Kagga form)"
    ]);
    await page.locator("#meter-search").fill("ಕಗ್ಗ");
    await page.locator("#meter-select")
        .selectOption("structural:panchamatra-chaupadi-kagga");
    await page.locator("#show-template").check();

    await expect(page.locator("#selected-meter-signature"))
        .toContainText("20 | 18 | 20 | 16 written mātrās");
    await expect(page.locator("#active-matras"))
        .toHaveText("Mātrās by pāda: 20 | 18 | 20 | 16");
    await expect(page.locator("#validation-summary"))
        .toContainText(
            "pādānta lengthening, śithila-dvitva, historical prāsa variants, " +
            "historical chaupadi variants are not checked yet"
        );
    await expect(page.locator("#prasa-summary"))
        .toContainText("Dvitīyākṣara-prāsa matches on ಕ.");
    await expect(page.locator("#validation-summary")).not.toHaveClass(/has-errors/);
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText([
            "M 20 · 5|5|5|5",
            "M 18 · 5|5|5|3",
            "M 20 · 5|5|5|5",
            "M 16 · 5|5|5|1"
        ]);
});

test("colors ottu prāsa safely and reports consonant, weight, and ādi findings", async ({
    page
}) => {
    const editor = page.locator("#composition");
    await editor.fill("ಮಲ್ಪ\nಜಂಪ\nಸಲ್ಪ\nದಂಪ");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("kandapadya");
    await page.locator("#meter-select").selectOption("structural:kanda-kannada");

    await expect(page.locator("#prasa-summary"))
        .toContainText("Dvitīyākṣara-prāsa matches on ಪ.");
    await expect(page.locator("#highlight-layer .prasa-match")).toHaveText([
        "ಲ್ಪ", "ಪ", "ಲ್ಪ", "ಪ"
    ]);
    await expect(page.locator("#highlight-layer .prasa-match").first())
        .toHaveCSS("background-color", "rgb(184, 229, 221)");

    await editor.fill("ಮಲ್ಪ\nಜಂಪ\nಸಲ್ಪ\nದಂತ");
    await expect(page.locator("#prasa-summary"))
        .toContainText("Dvitīyākṣara-prāsa: 1 mismatch(es).");
    await expect(page.locator("#highlight-layer .prasa-mismatch")).toHaveText("ತ");
    await expect(page.locator("#highlight-layer .prasa-mismatch"))
        .toHaveCSS("background-color", "rgb(244, 190, 185)");

    await editor.fill("ಮಲ್ಪ\nಜಂಪ\nಸಲ್ಪ\nದಪ");
    await expect(page.locator("#prasa-summary"))
        .toContainText("first syllable’s Guru/Laghu weight differs");
    await expect(page.locator("#highlight-layer .prasa-weight-mismatch"))
        .toHaveText("ದ");
    await expect(page.locator("#highlight-layer .prasa-weight-mismatch"))
        .toHaveCSS("background-color", "rgb(241, 207, 143)");
    await expect(page.locator("#highlight-layer .prasa-weight-mismatch"))
        .toHaveClass(/laghu/);
    await expect(page.locator("#highlight-layer .prasa-weight-mismatch"))
        .toHaveCSS("text-decoration-style", "dotted");

    await editor.fill("ಮಲ್ಪ\nಮಂಪ");
    await expect(page.locator("#prasa-summary"))
        .toContainText("Ādi-prāsa found on ಮ.");
});

test("finds, guides, and validates all three repeatable Ragale forms", async ({ page }) => {
    const utsahaLine = "ಕಾ ಕ ಕಾ ಕ ಕಾ ಕ ಕಾ ಕ";
    const editor = page.locator("#composition");
    await editor.fill(`${utsahaLine}\n${utsahaLine}`);
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("ಉತ್ಸಾಹ ರಗಳೆ");
    await expect(page.locator("#meter-select option")).toHaveText([
        "utsāha ragaḷe"
    ]);
    await page.locator("#meter-search").fill("utsaha ragale");
    await page.locator("#meter-select").selectOption("structural:utsaha-ragale");
    await page.locator("#show-template").check();

    await expect(page.locator("#active-matras"))
        .toHaveText("Mātrās by pāda: 12 | 12");
    await expect(page.locator("#validation-summary")).not.toHaveClass(/has-errors/);
    await expect(page.locator("#whole-verse-template .whole-template-heading"))
        .toHaveText("utsāha ragaḷe template");
    await expect(page.locator("#whole-verse-template .whole-template-line")).toHaveCount(1);
    await expect(page.locator("#whole-verse-template .whole-template-line-label"))
        .toHaveText("Each line");
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText("M 12 · 3|3|3|3 or 3|3|3|3|3|3|3|3");

    await editor.fill(`${utsahaLine}\n${utsahaLine.slice(0, -1)}ತ`);
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(1);
    await expect(page.locator("#validation-summary")).toHaveClass(/has-errors/);

    const mandanilaAlternate = "ಕಾ ಕ ಕಾ ಕಾ ಕ ಕಾ ಕ ಕಾ ಕಾ ಕ";
    await editor.fill(`${mandanilaAlternate}\n${mandanilaAlternate}`);
    await page.locator("#meter-search").fill("mandanila ragale");
    await page.locator("#meter-select").selectOption("structural:mandanila-ragale");
    await expect(page.locator("#validation-summary")).not.toHaveClass(/has-errors/);
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText("M 16 · 4|4|4|4 or 3|5|3|5");

    await page.locator("#meter-search").fill("lalita ragale");
    await expect(page.locator("#meter-select option")).toHaveText([
        "lalita ragaḷe"
    ]);
});

test("shows complete Ṣaṭpadi and aṃśa ghost frames", async ({ page }) => {
    const textForPattern = (pattern) =>
        Array.from(pattern, (weight) => weight === "G" ? "ಕಾ" : "ಕ").join(" ");
    const short = textForPattern("GLGGGLGG");
    const extended = textForPattern("GLGGGLGGGLGGG");
    await page.locator("#composition").fill([
        short,
        short,
        extended,
        short,
        short,
        extended
    ].join("\n"));
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("bhamini shatpadi");
    await expect(page.locator("#meter-select option")).toHaveText([
        "bhāminī ṣaṭpadi"
    ]);
    await page.locator("#meter-select").selectOption("structural:bhamini-shatpadi");
    await page.locator("#show-template").check();

    await expect(page.locator("#selected-meter-signature"))
        .toContainText("14 | 14 | 23 / 14 | 14 | 23 mātrās");
    await expect(page.locator("#validation-summary")).not.toHaveClass(/has-errors/);
    await expect(page.locator("#whole-verse-template .whole-template-line")).toHaveCount(6);
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText([
            "M 14 · 3|4|3|4",
            "M 14 · 3|4|3|4",
            "M 23 · 3|4|3|4|3|4|2",
            "M 14 · 3|4|3|4",
            "M 14 · 3|4|3|4",
            "M 23 · 3|4|3|4|3|4|2"
        ]);

    const longAmshaLine = Array(12).fill("ಕಾ").join(" ");
    const shortAmshaLine = Array(8).fill("ಕಾ").join(" ");
    await page.locator("#composition").fill([
        longAmshaLine,
        shortAmshaLine,
        longAmshaLine,
        shortAmshaLine
    ].join("\n"));
    await page.locator("#meter-search").fill("sangatya");
    await page.locator("#meter-select").selectOption("structural:sangatya");

    await expect(page.locator("#validation-summary")).not.toHaveClass(/has-errors/);
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText([
            "aṃśa · ವಿ|ವಿ|ವಿ|ವಿ",
            "aṃśa · ವಿ|ವಿ|ಬ್ರ",
            "aṃśa · ವಿ|ವಿ|ವಿ|ವಿ",
            "aṃśa · ವಿ|ವಿ|ಬ್ರ"
        ]);
});

test("shows classical aṃśa karṣaṇa after detection and selection", async ({
    page
}) => {
    const compactTextForPattern = (pattern) =>
        Array.from(pattern, (weight) => weight === "G" ? "ಕಾ" : "ಕ").join("");
    const vishnu = compactTextForPattern("GLL");
    const brahma = compactTextForPattern("GL");
    const text = [
        [vishnu, vishnu, vishnu, vishnu],
        [vishnu, vishnu, brahma],
        [vishnu, vishnu, vishnu, vishnu],
        [vishnu, vishnu, brahma]
    ].map((groups) => groups.join(" ")).join("\n");
    const editor = page.locator("#composition");
    await editor.fill(text);

    await expect(page.locator("#candidate-list .candidate-name").first())
        .toHaveText("sāṅgatya");
    await expect(page.locator("#validation-summary")).toContainText(
        "Detected sāṅgatya; 26 recital lengthening(s) are marked ಽ"
    );
    await expect(page.locator("#highlight-layer .recital-extension-marker"))
        .toHaveCount(26);
    await expect(page.locator("#highlight-layer .recital-extension-marker").first())
        .toHaveText("ಽ");
    const markerOffsets = await page.locator(
        "#highlight-layer .recital-extension-anchor"
    ).evaluateAll((anchors) => anchors.map((anchor) => {
        const syllable = anchor.firstElementChild.getBoundingClientRect();
        const marker = anchor.lastElementChild.getBoundingClientRect();
        return Math.abs(
            (syllable.left + syllable.width / 2) -
            (marker.left + marker.width / 2)
        );
    }));
    expect(Math.max(...markerOffsets)).toBeLessThanOrEqual(1);
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(0);
    await expect(editor).toHaveValue(text);
    await expect(page.locator(
        "#highlight-layer .scansion-group-amsha .scansion-group-label"
    )).toHaveCount(14);
    await expect(page.locator(
        "#highlight-layer .scansion-group-amsha .scansion-group-label"
    ).first()).toHaveText("V");
    const amshaGroups = page.locator("#highlight-layer .scansion-group-amsha");
    const amshaCenterOffsets = await amshaGroups.evaluateAll((groups) =>
        groups.map((group) => {
            const labelNode = group.querySelector(".scansion-group-label");
            const label = labelNode.getBoundingClientRect();
            const fragments = Array.from(group.querySelectorAll(
                ".guru, .laghu, .uncertain"
            )).map((node) => node.getBoundingClientRect());
            const left = Math.min(...fragments.map((rect) => rect.left));
            const right = Math.max(...fragments.map((rect) => rect.right));
            const karshana = group.querySelector(".recital-extension-marker")
                .getBoundingClientRect();
            return {
                horizontal: Math.abs(
                    (left + right) / 2 -
                    (label.left + label.width / 2)
                ),
                karshanaLevel: Math.abs(label.top - karshana.top)
            };
        }));
    expect(Math.max(...amshaCenterOffsets.map((item) => item.horizontal)))
        .toBeLessThanOrEqual(1);
    expect(Math.max(...amshaCenterOffsets.map((item) => item.karshanaLevel)))
        .toBeLessThanOrEqual(2);
    await expect(page.locator("#highlight-layer .scansion-boundary.scansion-amsha"))
        .toHaveCount(18);

    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("sangatya");
    await page.locator("#meter-select").selectOption("structural:sangatya");

    await expect(page.locator("#validation-summary")).toContainText(
        "sāṅgatya fits; 26 recital lengthening(s) are marked ಽ"
    );
    await expect(page.locator("#highlight-layer .recital-extension-marker"))
        .toHaveCount(26);
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(0);
    await expect(editor).toHaveValue(text);
});

test("shows the reviewed Chandovatamsa realization without false gaṇa errors", async ({
    page
}) => {
    const text = [
        "ಕಡಿದಾದ ಕಣಿವೆಯ ಬೆಳ್ಳಿಯೇ? ಕೆನೆಯೇ!",
        "ಸಿಡಿಲಿನ ಕುಡಿಯ ಒಳನಂಜಿನ ಹನಿಯೇ",
        "ಕೊಡದಲ್ಲಿ ತುಳುಕಿದೆ ಬುಡದಲ್ಲಿ ಬಳುಕಿದೆ.",
        "ನೋಡದ ಶಿಖರದ ಮಂಜಿನ ಖನಿಯೇ!"
    ].join("\n");
    const editor = page.locator("#composition");
    await editor.fill(text);
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("chandovatamsa");
    await page.locator("#meter-select")
        .selectOption("structural:chandovatamsa-nagavarma");

    await expect(page.locator("#selected-meter-signature"))
        .toContainText("VVVB | VVVB | VVVB | VVVB");
    await expect(page.locator("#active-amsha-realization")).toHaveText(
        "Realized gaṇas: VVVB · VRVB · VVVV · VVVB"
    );
    await expect(page.locator("#validation-summary"))
        .toContainText("2 reviewed recital-dependent gaṇa substitution(s)");
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(1);
    await expect(page.locator("#highlight-layer .violation")).toHaveText("ನೋ");
    await expect(page.locator("#highlight-layer .amsha-karshana-marker"))
        .toHaveCount(18);
    await expect(editor).toHaveValue(text);
});

test("marks inferred sung Laghu in folk Tripadi without changing the poem", async ({
    page
}) => {
    const text = [
        "ಕೂಸು ಇದ್ದ ಮನೆಗೆ ಬೀಸಣಿಗೆ ಯಾತಕ",
        "ಕೂಸು ಕಂದಯ್ಯ ಒಳಹೊರಗ ಆಡಿದರ",
        "ಬೀಸಣಿಗೆ ಗಾಳಿ ಬೀಸ್ಯಾವ"
    ].join("\n");
    const editor = page.locator("#composition");
    await editor.fill(text);

    await expect(page.locator("#candidate-list .candidate-name").first())
        .toHaveText("folk tripadi (Kannada)");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("janapada tripadi");
    await expect(page.locator("#meter-select option")).toHaveText([
        "folk tripadi (Kannada)"
    ]);
    await page.locator("#meter-select")
        .selectOption("structural:tripadi-folk-kannada");

    await expect(page.locator("#validation-summary")).toContainText(
        "fits with 4 sung extension(s), marked ಽ"
    );
    await expect(page.locator("#validation-summary")).not.toHaveClass(/has-errors/);
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(0);
    await expect(page.locator("#highlight-layer .sung-extension-marker"))
        .toHaveText(["ಽ", "ಽ", "ಽ", "ಽ"]);
    await expect(page.locator("#prasa-summary"))
        .toContainText("Dvitīyākṣara-prāsa matches on ಸ.");
    await expect(editor).toHaveValue(text);

    await page.locator("#meter-search").fill("tripadi");
    await page.locator("#meter-select")
        .selectOption("structural:tripadi-kannada");
    await expect(page.locator("#highlight-layer .sung-extension-marker"))
        .toHaveCount(0);
    await expect(page.locator("#highlight-layer .amsha-karshana-marker"))
        .toHaveCount(11);
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(3);
});

test("recovers the anonymous local draft and meter selection", async ({ page }) => {
    const composition = "ಕವಿ\n\nकाव्य";
    await page.locator("#composition").fill(composition);
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#show-template").check();
    await page.waitForTimeout(400);

    await page.reload();
    await expect(page.locator("#composition")).toHaveValue(composition);
    await expect(page.locator("#validation-summary")).toContainText("madhu");
    await expect(page.locator("#show-template")).toBeChecked();
});

test("migrates a version-one local draft without template state", async ({ page }) => {
    await page.addInitScript((draft) => {
        localStorage.setItem("chandas.draft.v1", JSON.stringify(draft));
    }, {
            version: 1,
            text: "ಕವಿ",
            selections: { 0: "madhu" },
            language: "en",
            selectionStart: 2,
            selectionEnd: 2
    });
    await page.reload();

    await expect(page.locator("#composition")).toHaveValue("ಕವಿ");
    await expect(page.locator("#selected-meter-name")).toHaveText("madhu");
    await expect(page.locator("#show-template")).not.toBeChecked();
});

test("migrates a version-two ghost draft into the template-mode model", async ({ page }) => {
    await page.addInitScript((draft) => {
        localStorage.setItem("chandas.draft.v1", JSON.stringify(draft));
    }, {
        version: 2,
        text: "ಕವಿ",
        selections: { 0: "madhu" },
        templates: { 0: true },
        language: "en",
        selectionStart: 2,
        selectionEnd: 2
    });
    await page.reload();

    await expect(page.locator("#composition")).toHaveValue("ಕವಿ");
    await expect(page.locator("#show-template")).toBeChecked();
    await expect(page.locator("#template-mode-ghost")).toBeChecked();
    await expect(page.locator("#strong-template-editor")).toBeHidden();
});

test("New shelves the current poem and Saved poems reopens it", async ({ page }) => {
    const editor = page.locator("#composition");
    await editor.fill("ಮೊದಲ ಸಾಲು\nಎರಡನೆಯ ಸಾಲು");
    await page.waitForTimeout(400);
    await page.locator("#new-draft").click();
    await expect(editor).toHaveValue("");

    await page.locator("#saved-poems").click();
    await expect(page.locator("#saved-poems-dialog")).toBeVisible();
    await expect(page.locator(".saved-poem-card h3")).toHaveText("ಮೊದಲ ಸಾಲು");
    await expect(page.locator(".saved-poem-preview"))
        .toContainText("ಎರಡನೆಯ ಸಾಲು");
    await page.locator(".saved-poem-card button").filter({ hasText: /Open|ತೆರೆಯಿರಿ/ }).click();
    await expect(editor).toHaveValue("ಮೊದಲ ಸಾಲು\nಎರಡನೆಯ ಸಾಲು");
    await expect(page.locator("#saved-poems-dialog")).toBeHidden();
});

test("Saved poems search, rename, duplicate, and delete stay on-device", async ({ page }) => {
    await page.locator("#composition").fill("ಕಾವ್ಯ ಹುಡುಕು\nಪದ್ಯ");
    await page.waitForTimeout(400);
    await page.locator("#saved-poems").click();
    await page.locator("#saved-poems-search").fill("ಹುಡುಕು");
    await expect(page.locator(".saved-poem-card")).toHaveCount(1);

    await page.getByRole("button", { name: "Rename" }).click();
    await page.locator(".saved-poem-rename input").fill("ನನ್ನ ಕಾವ್ಯ");
    await page.getByRole("button", { name: "Save name" }).click();
    await page.locator("#saved-poems-search").fill("");
    await expect(page.locator(".saved-poem-card h3")).toHaveText("ನನ್ನ ಕಾವ್ಯ");

    await page.getByRole("button", { name: "Duplicate" }).click();
    await expect(page.locator(".saved-poem-card")).toHaveCount(2);
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator(".saved-poem-card").last()
        .getByRole("button", { name: "Delete" }).click();
    await expect(page.locator(".saved-poem-card")).toHaveCount(1);
});

test("shares a saved poem with every composer Share action without opening it", async ({
    page
}) => {
    const editor = page.locator("#composition");
    await editor.fill("ಉಳಿಸಿದ ಮೊದಲ ಪದ್ಯ");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.waitForTimeout(400);
    await page.locator("#new-draft").click();
    await editor.fill("ಈಗ ಬರೆಯುತ್ತಿರುವ ಪದ್ಯ");
    await page.waitForTimeout(400);
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    const shareSavedPoem = async () => {
        await page.locator("#saved-poems").click();
        const card = page.locator(".saved-poem-card", {
            hasText: "ಉಳಿಸಿದ ಮೊದಲ ಪದ್ಯ"
        });
        await expect(card).toHaveCount(1);
        const shareButton = card.getByRole("button", { name: "Share", exact: true });
        await shareButton.scrollIntoViewIfNeeded();
        await shareButton.focus();
        await shareButton.press("Enter");
        await expect(page.locator("#saved-poems-dialog")).toBeHidden();
        await expect(page.locator("#share-dialog")).toBeVisible();
    };

    await shareSavedPoem();
    await page.locator("#include-meter").check();
    await page.locator("#include-link").check();
    await page.locator("#dialog-copy").click();
    const sharedText = await page.evaluate(() => navigator.clipboard.readText());
    expect(sharedText).toContain("ಉಳಿಸಿದ ಮೊದಲ ಪದ್ಯ");
    expect(sharedText).toContain("madhu");
    expect(sharedText).toContain("https://chandas.org");
    expect(sharedText).not.toContain("ಈಗ ಬರೆಯುತ್ತಿರುವ ಪದ್ಯ");

    await shareSavedPoem();
    await page.locator("#copy-analysis-url").click();
    const copiedUrl = new URL(await page.evaluate(() => navigator.clipboard.readText()));
    expect(copiedUrl.searchParams.get("verse")).toBe("ಉಳಿಸಿದ ಮೊದಲ ಪದ್ಯ");
    expect(copiedUrl.searchParams.get("meter1")).toBe("madhu");
    await expect(editor).toHaveValue("ಈಗ ಬರೆಯುತ್ತಿರುವ ಪದ್ಯ");
});

test("downloads a portable local backup with Unicode and template state", async ({ page }) => {
    await page.locator("#composition").fill("\nಕಾವ್ಯ\nಪದ್ಯ");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#show-template").check();
    await page.waitForTimeout(400);
    await page.locator("#saved-poems").click();

    const downloadPromise = page.waitForEvent("download");
    await page.locator("#backup-download").click();
    const download = await downloadPromise;
    const contents = JSON.parse(await fs.readFile(await download.path(), "utf8"));
    expect(contents.format).toBe("chandas-poems-backup");
    expect(contents.version).toBe(1);
    expect(contents.poems).toHaveLength(1);
    expect(contents.poems[0].text).toBe("\nಕಾವ್ಯ\nಪದ್ಯ");
    expect(contents.poems[0].selections[0]).toBe("madhu");
    expect(contents.poems[0].templateModes[0]).toBe("ghost");
});

test("saves and shares every poem as readable UTF-8 text", async ({ page }) => {
    await page.locator("#composition").fill("ಮೊದಲ ಸಾಲು\nಎರಡನೆಯ ಸಾಲು");
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.waitForTimeout(400);
    await page.locator("#new-draft").click();
    await page.locator("#composition").fill("ಇನ್ನೊಂದು ಪದ್ಯ");
    await page.waitForTimeout(400);
    await page.locator("#saved-poems").click();
    await page.evaluate(() => Object.defineProperty(navigator, "canShare", {
        configurable: true,
        value: () => false
    }));

    const downloadPromise = page.waitForEvent("download");
    await page.locator("#backup-share").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^chandas-poems-\d{4}-\d{2}-\d{2}\.txt$/);
    const contents = await fs.readFile(await download.path(), "utf8");
    expect(contents).toContain("CHANDAS POEMS");
    expect(contents).toContain("ಮೊದಲ ಸಾಲು\nಎರಡನೆಯ ಸಾಲು");
    expect(contents).toContain("ಇನ್ನೊಂದು ಪದ್ಯ");
    expect(contents).toContain("Selected meters: madhu");
    expect(contents).not.toContain("strongDrafts");
    expect(contents).not.toContain('"format": "chandas-poems-backup"');
});

test("imports backups without overwriting or multiplying conflicts", async ({ page }) => {
    await page.locator("#composition").fill("ಸ್ಥಳೀಯ ಪದ್ಯ");
    await page.waitForTimeout(400);
    await page.locator("#saved-poems").click();

    const imported = {
        id: "shared-poem-id",
        schemaVersion: 1,
        title: "ಆಮದು ಪದ್ಯ",
        text: "ಆಮದು ಸಾಲು\nಎರಡು",
        selections: {},
        templates: {},
        templateModes: {},
        strongDrafts: {},
        language: "kn",
        selectionStart: 0,
        selectionEnd: 0,
        createdAt: "2026-07-30T10:00:00.000Z",
        updatedAt: "2026-07-30T10:00:00.000Z",
        revision: 1
    };
    const backup = (poem) => JSON.stringify({
        format: "chandas-poems-backup",
        version: 1,
        exportedAt: "2026-07-31T10:00:00.000Z",
        poems: [poem]
    });
    const upload = async (contents) => page.locator("#backup-file").setInputFiles({
        name: "chandas-backup.json",
        mimeType: "application/json",
        buffer: Buffer.from(contents)
    });

    await upload(backup(imported));
    await expect(page.locator(".saved-poem-card")).toHaveCount(2);
    await expect(page.locator(".saved-poem-card h3", { hasText: "ಆಮದು ಪದ್ಯ" }))
        .toHaveCount(1);
    await upload(backup(imported));
    await expect(page.locator(".saved-poem-card")).toHaveCount(2);

    await upload(backup({ ...imported, text: "ಬದಲಾದ ಆಮದು ಸಾಲು" }));
    await expect(page.locator(".saved-poem-card")).toHaveCount(3);
    await upload(backup({ ...imported, text: "ಬದಲಾದ ಆಮದು ಸಾಲು" }));
    await expect(page.locator(".saved-poem-card")).toHaveCount(3);
});

test("switches to the Kannada interface", async ({ page }) => {
    await page.locator("#language").selectOption("kn");

    await expect(page.locator("#page-title")).toHaveText("ಛಂದಸ್ - ಪದ್ಯದಲ್ಲಿ ಹೇಳಿ");
    await expect(page.locator(".intro .eyebrow")).toHaveText("ಛಂದದ ಪದ್ಯದ ಸಂಗಾತಿ");
    await expect(page.locator(".header-link")).toHaveText("ಕಲಿಯಿರಿ");
    await expect(page.locator("html")).toHaveAttribute("lang", "kn");
});

test("switches to the complete Telugu interface", async ({ page }) => {
    await page.locator("#language").selectOption("te");

    await expect(page.locator("#page-title"))
        .toHaveText("ఛందస్ — పద్యంగా చెప్పండి");
    await expect(page.locator(".intro .eyebrow"))
        .toHaveText("ఛందోపద్య రచనా సహచరి");
    await expect(page.locator(".header-link")).toHaveText("నేర్చుకోండి");
    await expect(page.locator("#composition"))
        .toHaveAttribute("placeholder", "ಕನ್ನಡ, తెలుగు, ગુજરાતી లేదా देवनागरीలో రాయండి…");
    await expect(page.locator("html")).toHaveAttribute("lang", "te");
    await expect(page).toHaveTitle("ఛందస్ — పద్యంగా చెప్పండి");

    await page.locator("#saved-poems").click();
    await expect(page.locator("#saved-poems-title"))
        .toHaveText("భద్రపరిచిన పద్యాలు");
    await expect(page.locator("#backup-download")).toHaveText("పూర్తి బ్యాకప్");
    const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});

test("switches to the complete Gujarati interface", async ({ page }) => {
    await page.locator("#language").selectOption("gu");

    await expect(page.locator("#page-title")).toHaveText("છંદસ — પદ્યમાં કહો");
    await expect(page.locator(".intro .eyebrow"))
        .toHaveText("છંદોબદ્ધ પદ્યનો સાથી");
    await expect(page.locator(".header-link")).toHaveText("શીખો");
    await expect(page.locator("#composition"))
        .toHaveAttribute(
            "placeholder",
            "ಕನ್ನಡ, తెలుగు, ગુજરાતી અથવા देवनागरीમાં લખો…"
        );
    await expect(page.locator("html")).toHaveAttribute("lang", "gu");
    await expect(page).toHaveTitle("છંદસ — પદ્યમાં કહો");

    await page.locator("#saved-poems").click();
    await expect(page.locator("#saved-poems-title")).toHaveText("સાચવેલાં પદ્યો");
    await expect(page.locator("#backup-download")).toHaveText("સંપૂર્ણ બૅકઅપ");
    const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});

test.describe("Telugu browser locale", () => {
    test.use({ locale: "te-IN" });

    test("chooses Telugu automatically on a fresh visit", async ({ page }) => {
        await expect(page.locator("#language")).toHaveValue("te");
        await expect(page.locator("html")).toHaveAttribute("lang", "te");
        await expect(page.locator("#page-title"))
            .toHaveText("ఛందస్ — పద్యంగా చెప్పండి");
    });
});

test.describe("Gujarati browser locale", () => {
    test.use({ locale: "gu-IN" });

    test("chooses Gujarati automatically on a fresh visit", async ({ page }) => {
        await expect(page.locator("#language")).toHaveValue("gu");
        await expect(page.locator("html")).toHaveAttribute("lang", "gu");
        await expect(page.locator("#page-title"))
            .toHaveText("છંદસ — પદ્યમાં કહો");
    });
});

test("share options are explicit and default to composition only", async ({ page }) => {
    await page.locator("#composition").fill("ಕವಿ");
    await page.locator("#share").click();

    await expect(page.locator("#share-dialog")).toBeVisible();
    await expect(page.locator("#include-meter")).not.toBeChecked();
    await expect(page.locator("#include-link")).not.toBeChecked();

    await page.mouse.click(1, 1);
    await expect(page.locator("#share-dialog")).toBeHidden();
});

test("dismisses the share overlay after every share action", async ({ page }) => {
    await page.locator("#composition").fill("ಕವಿ");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.evaluate(() => {
        window.open = () => null;
        Object.defineProperty(navigator, "share", {
            configurable: true,
            value: async () => undefined
        });
    });

    for (const selector of [
        "#system-share",
        "#twitter-share",
        "#facebook-share",
        "#dialog-copy",
        "#copy-analysis-url"
    ]) {
        await page.locator("#share").click();
        await expect(page.locator("#share-dialog")).toBeVisible();
        await page.locator(selector).click();
        await expect(page.locator("#share-dialog")).toBeHidden();
    }
});

test("copies and round-trips a per-stanza analysis link", async ({ page, browser }) => {
    const composition = "ಕ\n\nಕಾ";
    await page.locator("#composition").fill(composition);
    await page.locator("#previous-stanza").click();
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#show-template").check();

    await page.locator("#next-stanza").click();
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#show-template").check();
    await page.locator("#template-mode-strong").check();
    const firstStrongSlot =
        page.locator('.strong-template-slot[data-line-index="0"][data-slot-index="0"]');
    const laterStrongSlot =
        page.locator('.strong-template-slot[data-line-index="0"][data-slot-index="1"]');
    await firstStrongSlot.fill("");
    await laterStrongSlot.fill("ಕಾ");

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator("#share").click();
    await expect(page.locator("#copy-analysis-url")).toBeVisible();
    await page.locator("#copy-analysis-url").click();
    await expect(page.locator("#toast")).toHaveText("Analysis link copied");
    const copied = new URL(await page.evaluate(() => navigator.clipboard.readText()));

    expect(copied.origin).toBe("https://chandas.org");
    expect(copied.searchParams.get("v")).toBe("4");
    expect(copied.searchParams.get("verse")).toBe(composition);
    expect(copied.searchParams.get("meter1")).toBe("madhu");
    expect(copied.searchParams.get("template1")).toBe("ghost");
    expect(copied.searchParams.get("meter2")).toBe("madhu");
    expect(copied.searchParams.get("template2")).toBe("strong");
    const copiedSlots = JSON.parse(copied.searchParams.get("slots2"));
    expect(copiedSlots[0]).toEqual(["", "ಕಾ"]);

    const importedContext = await browser.newContext();
    const importedPage = await importedContext.newPage();
    const runtimeErrors = [];
    importedPage.on("pageerror", (error) => runtimeErrors.push(error.message));
    const localUrl = new URL("/", page.url());
    localUrl.search = copied.search;
    await importedPage.goto(localUrl.toString());

    await expect(importedPage.locator("#composition")).toHaveValue(composition);
    await expect(importedPage.locator("#analysis-title")).toHaveText("Stanza 2 of 2");
    await expect(importedPage.locator("#selected-meter-name")).toHaveText("madhu");
    await expect(importedPage.locator("#template-mode-strong")).toBeChecked();
    await expect(importedPage.locator(
        '.strong-template-slot[data-line-index="0"][data-slot-index="0"]'
    )).toHaveValue("");
    await expect(importedPage.locator(
        '.strong-template-slot[data-line-index="0"][data-slot-index="1"]'
    )).toHaveValue("ಕಾ");
    await importedPage.locator("#previous-stanza").click();
    await expect(importedPage.locator("#selected-meter-name")).toHaveText("madhu");
    await expect(importedPage.locator("#template-mode-ghost")).toBeChecked();
    expect(runtimeErrors).toEqual([]);
    await importedContext.close();
});

test("preserves a samasyā-pūraṇa frame and blank Strong slots in its link", async ({
    page,
    browser
}) => {
    const composition = "\n\n\nಕಾ";
    await page.locator("#composition").fill(composition);
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.locator("#show-template").check();
    await page.locator("#template-mode-strong").check();

    const firstLine = page.locator(
        '.strong-template-slot[data-line-index="0"][data-slot-index="0"]'
    );
    const finalLine = page.locator(
        '.strong-template-slot[data-line-index="3"][data-slot-index="0"]'
    );
    await expect(firstLine).toHaveValue("");
    await expect(finalLine).toHaveValue("ಕಾ");

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator("#share").click();
    await page.locator("#copy-analysis-url").click();
    const copied = new URL(await page.evaluate(() => navigator.clipboard.readText()));
    const slots = JSON.parse(copied.searchParams.get("slots1"));

    expect(copied.searchParams.get("verse")).toBe(composition);
    expect(slots.slice(0, 3)).toEqual([
        ["", ""],
        ["", ""],
        ["", ""]
    ]);
    expect(slots[3]).toEqual(["ಕಾ", ""]);

    const importedContext = await browser.newContext();
    const importedPage = await importedContext.newPage();
    const localUrl = new URL("/", page.url());
    localUrl.search = copied.search;
    await importedPage.goto(localUrl.toString());

    await expect(importedPage.locator("#composition")).toHaveValue(composition);
    await expect(importedPage.locator("#template-mode-strong")).toBeChecked();
    await expect(importedPage.locator(
        '.strong-template-slot[data-line-index="0"][data-slot-index="0"]'
    )).toHaveValue("");
    await expect(importedPage.locator(
        '.strong-template-slot[data-line-index="3"][data-slot-index="0"]'
    )).toHaveValue("ಕಾ");
    await importedPage.locator("#template-mode-ghost").check();
    await expect(importedPage.locator("#composition")).toHaveValue(composition);
    await importedContext.close();

    const appendContext = await browser.newContext();
    await appendContext.addInitScript(() => {
        localStorage.setItem("chandas.draft.v1", JSON.stringify({
            version: 3,
            text: "ಮುನ್ನುಡಿ",
            selections: {},
            templates: {},
            templateModes: {},
            strongDrafts: {},
            language: "en",
            selectionStart: 7,
            selectionEnd: 7
        }));
    });
    const appendPage = await appendContext.newPage();
    await appendPage.goto(localUrl.toString());
    await expect(appendPage.locator("#composition"))
        .toHaveValue(`ಮುನ್ನುಡಿ\n\n${composition}`);
    await expect(appendPage.locator(
        '.strong-template-slot[data-line-index="3"][data-slot-index="0"]'
    )).toHaveValue("ಕಾ");
    await appendContext.close();
});

test("opens documentation and searches the complete prosody catalog", async ({ page }) => {
    const learnLink = page.locator(".header-link");
    await expect(learnLink).toBeVisible();
    await expect(learnLink).toHaveText("Learn");
    await learnLink.click();

    await expect(page).toHaveURL(/documentation\.html$/);
    await expect(page.locator("h1")).toContainText("How to use Chandas");
    await expect(page.locator("main")).toContainText("tea break");
    await expect(page.locator("#meter-catalog-status"))
        .toHaveText("1,419 of 1,419 supported meters shown.");
    await expect(page.locator("#meter-catalog-example-count"))
        .toHaveText("51 meters currently have authenticated, child-safe examples.");

    await page.locator("#meter-catalog-examples").selectOption("verified");
    await expect(page.locator("#meter-catalog-status"))
        .toHaveText("51 of 1,419 supported meters shown.");
    await page.locator("#meter-catalog-examples").selectOption("all");

    await page.locator("#meter-catalog-search").fill("anushtup");
    await expect(page.locator(".meter-catalog-item")).toHaveCount(1);
    await expect(page.locator(".meter-catalog-name")).toHaveText("anuṣṭubh (śloka)");
    await page.locator(".meter-catalog-item summary").click();
    await expect(page.locator(".meter-definitions")).toContainText("Pāda 4: 8 syllables");

    await page.locator("#meter-catalog-search").fill("madhumalli");
    await expect(page.locator(".meter-catalog-name")).toContainText(["madhumallī"]);

    await page.locator("#meter-catalog-search").fill("mandanila ragale");
    await expect(page.locator(".meter-catalog-item")).toHaveCount(1);
    await page.locator(".meter-catalog-item summary").click();
    await expect(page.locator(".meter-definitions"))
        .toContainText("4 + 4 + 4 + 4 or 3 + 5 + 3 + 5 = 16 mātrās");
    await expect(page.locator(".meter-definitions"))
        .toContainText("Each group of 2 adjacent lines shares its ending consonant");

    await page.locator("#meter-catalog-search").fill("panchamatra choupadi");
    await expect(page.locator(".meter-catalog-item")).toHaveCount(1);
    await page.locator(".meter-catalog-item summary").click();
    await expect(page.locator(".meter-definitions"))
        .toContainText("Line 4: 5 + 5 + 5 + 1 = 16 mātrās");

    await page.locator("#meter-catalog-search").fill("ataveladi");
    const ataveladi = page.locator(".meter-catalog-item").filter({
        has: page.getByText("āṭaveladi (Telugu)", { exact: true })
    });
    await expect(ataveladi).toHaveCount(1);
    await ataveladi.locator("summary").click();
    await expect(ataveladi.locator(".meter-definitions"))
        .toContainText("S = Sūrya (GL or LLL)");
    await expect(ataveladi.locator(".meter-example")).toContainText("Vemana");

    await page.locator("#meter-catalog-search").fill("chaupai");
    const gujaratiChaupai = page.locator(".meter-catalog-item");
    await expect(gujaratiChaupai).toHaveCount(1);
    await gujaratiChaupai.locator("summary").click();
    await expect(gujaratiChaupai.locator(".meter-example-text"))
        .toContainText("આકાશે તારાની ભાત");

    await page.locator("#meter-catalog-search").fill("indravajra");
    const indravajra = page.locator(".meter-catalog-item");
    await expect(indravajra).toHaveCount(1);
    await indravajra.locator("summary").click();
    await expect(indravajra.locator(".meter-example-text"))
        .toContainText("गोष्ठे गिरिं");
    await expect(indravajra.locator(".meter-example-review"))
        .toHaveText("Source verified · reviewed for young readers");

    await page.locator("#meter-catalog-search").fill("mandakranta");
    const mandakranta = page.locator(".meter-catalog-item");
    await expect(mandakranta).toHaveCount(1);
    await mandakranta.locator("summary").click();
    await expect(mandakranta.locator(".meter-example-text"))
        .toContainText("कश्चित्कान्ताविरहगुरुणा");
    await expect(mandakranta.locator(".meter-example-source"))
        .toHaveAttribute("href", /archive\.org\/details\/kalidasas-meghaduta/);

    await page.getByText("Return to Chandas").click();
    await expect(page.locator("#composition")).toBeVisible();
});

test("offers a downloaded application update and preserves the draft on reload", async ({
    browser
}) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
        const controllerListeners = [];
        const alreadyActivated =
            sessionStorage.getItem("chandas.fake-update-activated") === "yes";
        const serviceWorker = {
            controller: {},
            addEventListener(type, listener) {
                if (type === "controllerchange") {
                    controllerListeners.push(listener);
                }
            },
            async register(url, options) {
                window.__fakeServiceWorkerRegistration = { url, options };
                return registration;
            }
        };
        const worker = {
            state: "installed",
            addEventListener() {},
            postMessage(message) {
                if (message && message.type === "SKIP_WAITING") {
                    sessionStorage.setItem(
                        "chandas.fake-update-activated",
                        "yes"
                    );
                    setTimeout(() => {
                        controllerListeners.forEach((listener) => listener());
                    }, 0);
                }
            }
        };
        const registration = {
            waiting: alreadyActivated ? null : worker,
            installing: null,
            addEventListener() {},
            async update() {
                window.__fakeUpdateChecks =
                    (window.__fakeUpdateChecks || 0) + 1;
            }
        };
        Object.defineProperty(navigator, "serviceWorker", {
            configurable: true,
            value: serviceWorker
        });
    });
    const updatePage = await context.newPage();
    await updatePage.goto("/");

    const updateButton = updatePage.locator("#app-update");
    await expect(updateButton).toBeVisible();
    await expect(updateButton).toHaveText("Update available");
    await expect.poll(() => updatePage.evaluate(() =>
        window.__fakeUpdateChecks || 0)).toBeGreaterThan(0);
    await expect(updatePage.evaluate(() =>
        window.__fakeServiceWorkerRegistration.options.updateViaCache
    )).resolves.toBe("none");

    await updatePage.locator("#composition").fill("ಕಾವ್ಯ ಇನ್ನೂ ಮುಗಿದಿಲ್ಲ");
    await updateButton.click();

    await expect(updatePage.locator("#composition"))
        .toHaveValue("ಕಾವ್ಯ ಇನ್ನೂ ಮುಗಿದಿಲ್ಲ");
    await expect(updatePage.locator("#app-update")).toBeHidden();
    await context.close();
});

test("opens the concise public roadmap from the footer and keeps it offline", async ({
    page,
    context
}) => {
    const roadmapLink = page.locator(".site-footer").getByRole("link", {
        name: "Roadmap"
    });
    await expect(roadmapLink).toBeVisible();
    await roadmapLink.click();

    await expect(page).toHaveURL(/roadmap\.html$/);
    await expect(page.locator("h1")).toHaveText("Roadmap");
    await expect(page.locator(".public-roadmap li")).toHaveCount(9);
    await expect(page.locator("main")).toContainText("Anonymous composition");

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator(".public-roadmap li")).toHaveCount(9);
});

test("has no horizontal overflow at the target viewport", async ({ page }) => {
    await page.locator("#composition").fill("ಕಾವ್ಯ ".repeat(30));
    const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});

test("reloads the core workflow while offline", async ({ page, context }) => {
    await page.locator("#composition").fill("ಕ ಕಾ");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.waitForTimeout(400);
    await page.reload();
    await expect(page.locator("#active-pattern")).toHaveText("LG");

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator("#composition")).toHaveValue("ಕ ಕಾ");
    await expect(page.locator("#active-pattern")).toHaveText("LG");
    await page.locator("#share").click();
    await page.locator("#copy-analysis-url").click();
    await expect.poll(async () => {
        const copied = new URL(await page.evaluate(() => navigator.clipboard.readText()));
        return copied.searchParams.get("verse");
    }).toBe("ಕ ಕಾ");
});
