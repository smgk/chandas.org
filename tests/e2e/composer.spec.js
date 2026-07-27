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

test("selects and validates a meter for only the active stanza", async ({ page }) => {
    await page.locator("#composition").fill("ಕಾಂ ಕಾ\n\nಕವಿ");
    await page.locator("#previous-stanza").click();
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");

    await expect(page.locator("#validation-summary")).toHaveClass(/has-errors/);
    await expect(page.locator("#highlight-layer .violation")).toHaveCount(2);

    await page.locator("#next-stanza").click();
    await expect(page.locator("#validation-summary")).not.toHaveClass(/has-errors/);
    await expect(page.locator("#validation-summary")).toContainText("Choose a meter");
});

test("recovers the anonymous local draft and meter selection", async ({ page }) => {
    const composition = "ಕವಿ\n\nकाव्य";
    await page.locator("#composition").fill(composition);
    await page.locator("#meter-picker summary").click();
    await page.locator("#meter-search").fill("madhu");
    await page.locator("#meter-select").selectOption("madhu");
    await page.waitForTimeout(400);

    await page.reload();
    await expect(page.locator("#composition")).toHaveValue(composition);
    await expect(page.locator("#validation-summary")).toContainText("madhu");
});

test("switches to the Kannada interface", async ({ page }) => {
    await page.locator("#language").selectOption("kn");

    await expect(page.locator("#page-title")).toHaveText("ನೀವು ಬರೆಯುತ್ತಿದ್ದಂತೆ ಲಯ ಕಾಣಿಸಲಿ.");
    await expect(page.locator("html")).toHaveAttribute("lang", "kn");
});

test("share options are explicit and default to composition only", async ({ page }) => {
    await page.locator("#composition").fill("ಕವಿ");
    await page.locator("#share").click();

    await expect(page.locator("#share-dialog")).toBeVisible();
    await expect(page.locator("#include-meter")).not.toBeChecked();
    await expect(page.locator("#include-link")).not.toBeChecked();
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
