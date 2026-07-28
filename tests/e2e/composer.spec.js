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

test("shows compact line totals and counts from the beginning at the cursor", async ({ page }) => {
    await page.locator("#composition").fill("ಕ ಕಾ\nಕಂ");

    await expect(page.locator("#highlight-layer .line-metrics-badge")).toHaveText([
        "S2 · M3",
        "S1 · M2"
    ]);
    await expect(page.locator("#cursor-metrics"))
        .toHaveText("Syllable 3 · Mātrās 5");

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

    await page.locator("#meter-search").fill("arya");
    await page.locator("#meter-select").selectOption("structural:arya");
    await expect(page.locator("#highlight-layer .ghost-template"))
        .toHaveText("M 1/12 · 4|4|4");

    await page.locator("#meter-picker summary").click();
    await page.locator("#clear-meter").click();
    await expect(page.locator("#selected-meter-reference")).toBeHidden();
    await expect(page.locator("#highlight-layer .ghost-template")).toHaveCount(0);
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
    await expect(page.locator("html")).toHaveAttribute("lang", "kn");
});

test("share options are explicit and default to composition only", async ({ page }) => {
    await page.locator("#composition").fill("ಕವಿ");
    await page.locator("#share").click();

    await expect(page.locator("#share-dialog")).toBeVisible();
    await expect(page.locator("#include-meter")).not.toBeChecked();
    await expect(page.locator("#include-link")).not.toBeChecked();
});

test("opens the short documentation from the public links", async ({ page }) => {
    await page.locator('a[href="documentation.html"]').click();

    await expect(page).toHaveURL(/documentation\.html$/);
    await expect(page.locator("h1")).toHaveText("How to use Chandas");
    await expect(page.locator("main")).toContainText("tea break");
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
