/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

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
    await expect(page.locator("#draft-state")).toContainText(/device|ಸಾಧನ/);
    page.__runtimeErrors = errors;
});

test.afterEach(async ({ page }) => {
    expect(page.__runtimeErrors || []).toEqual([]);
});

test("analyzes Kannada and Devanagari stanzas inline", async ({ page }) => {
    await expect(page.locator(".release-badge")).toHaveText("PRE-BETA");
    await page.locator("#composition").fill("ಕ ಕಾ ಕಂ\n\nक का कं");

    await expect(page.locator("#analysis-title")).toHaveText("Stanza 2 of 2");
    await page.locator("#previous-stanza").click();
    await expect(page.locator("#analysis-title")).toHaveText("Stanza 1 of 2");
    await expect(page.locator("#active-pattern")).toHaveText("LGG");
    await expect(page.locator("#highlight-layer .laghu")).toHaveCount(2);
    await expect(page.locator("#highlight-layer .guru")).toHaveCount(4);

    await page.locator("#next-stanza").click();
    await expect(page.locator("#analysis-title")).toHaveText("Stanza 2 of 2");
    await expect(page.locator("#active-pattern")).toHaveText("LGG");
});

test("keeps Kannada and Devanagari conjuncts joined across highlight changes", async ({
    page
}) => {
    await page.locator("#composition").fill("ನಿಶ್ಚಲ\n\nनिश्चल");

    await expect(page.locator("#highlight-layer .guru")).toHaveText(["ನಿ", "नि"]);
    await expect(page.locator("#highlight-layer .laghu")).toHaveText([
        "ಶ್ಚ",
        "ಲ",
        "श्च",
        "ल"
    ]);

    const editorTracking = await page.locator("#composition").evaluate((editor) =>
        getComputedStyle(editor).letterSpacing);
    expect(editorTracking).toBe("normal");
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
        .toBe("ಕಾ\nद");

    await page.locator("#template-mode-ghost").check();
    await expect(page.locator("#strong-template-editor")).toBeHidden();
    await expect(page.locator("#editor-shell")).toBeVisible();
    await expect(page.locator("#composition")).toHaveValue("ಕಾ\nद");
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
        "anuṣṭubh (pathyā)"
    ]);
    await page.locator("#meter-select").selectOption("structural:anushtubh-pathya");

    await expect(page.locator("#selected-meter-signature"))
        .toContainText("4 pādas × 8 syllables");
    await expect(page.locator("#active-matras"))
        .toHaveText("Mātrās by pāda: 14 | 13 | 14 | 13");
    await expect(page.locator("#validation-summary"))
        .toHaveText("This stanza follows anuṣṭubh (pathyā).");
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
        .toContainText("prāsa is not checked yet");
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
            "pādānta lengthening, śithila-dvitva, prāsa, " +
            "historical chaupadi variants are not checked yet"
        );
    await expect(page.locator("#validation-summary")).not.toHaveClass(/has-errors/);
    await expect(page.locator("#whole-verse-template .whole-template-line-guide"))
        .toHaveText([
            "M 20 · 5|5|5|5",
            "M 18 · 5|5|5|3",
            "M 20 · 5|5|5|5",
            "M 16 · 5|5|5|1"
        ]);
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
        .toHaveText("M 12 · 3|3|3|3");

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

test("switches to the Kannada interface", async ({ page }) => {
    await page.locator("#language").selectOption("kn");

    await expect(page.locator("#page-title")).toHaveText("ಛಂದಸ್ - ಪದ್ಯದಲ್ಲಿ ಹೇಳಿ");
    await expect(page.locator(".intro .eyebrow")).toHaveText("ಛಂದದ ಪದ್ಯದ ಸಂಗಾತಿ");
    await expect(page.locator(".header-link")).toHaveText("ಕಲಿಯಿರಿ");
    await expect(page.locator("html")).toHaveAttribute("lang", "kn");
});

test("share options are explicit and default to composition only", async ({ page }) => {
    await page.locator("#composition").fill("ಕವಿ");
    await page.locator("#share").click();

    await expect(page.locator("#share-dialog")).toBeVisible();
    await expect(page.locator("#include-meter")).not.toBeChecked();
    await expect(page.locator("#include-link")).not.toBeChecked();
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
    expect(copied.searchParams.get("v")).toBe("1");
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

test("opens documentation and searches the complete prosody catalog", async ({ page }) => {
    const learnLink = page.locator(".header-link");
    await expect(learnLink).toBeVisible();
    await expect(learnLink).toHaveText("Learn");
    await learnLink.click();

    await expect(page).toHaveURL(/documentation\.html$/);
    await expect(page.locator("h1")).toContainText("How to use Chandas");
    await expect(page.locator("main")).toContainText("tea break");
    await expect(page.locator("#meter-catalog-status"))
        .toHaveText("1,375 of 1,375 supported meters shown.");

    await page.locator("#meter-catalog-search").fill("anushtup");
    await expect(page.locator(".meter-catalog-item")).toHaveCount(1);
    await expect(page.locator(".meter-catalog-name")).toHaveText("anuṣṭubh (pathyā)");
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

    await page.getByText("Return to Chandas").click();
    await expect(page.locator("#composition")).toBeVisible();
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
