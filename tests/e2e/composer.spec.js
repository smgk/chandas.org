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
        .toHaveText("Repeatable line template");
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

test("opens documentation and searches the complete prosody catalog", async ({ page }) => {
    const learnLink = page.locator(".header-link");
    await expect(learnLink).toBeVisible();
    await expect(learnLink).toHaveText("Learn");
    await learnLink.click();

    await expect(page).toHaveURL(/documentation\.html$/);
    await expect(page.locator("h1")).toHaveText("How to use Chandas");
    await expect(page.locator("main")).toContainText("tea break");
    await expect(page.locator("#meter-catalog-status"))
        .toHaveText("1,374 of 1,374 supported meters shown.");

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
    await page.getByText("Return to Chandas").click();
    await expect(page.locator("#composition")).toBeVisible();
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
    await page.waitForTimeout(400);
    await page.reload();
    await expect(page.locator("#active-pattern")).toHaveText("LG");

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator("#composition")).toHaveValue("ಕ ಕಾ");
    await expect(page.locator("#active-pattern")).toHaveText("LG");
});
