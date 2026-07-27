"use strict";

const { chromium, devices } = require("@playwright/test");

(async () => {
    const browser = await chromium.launch();
    const scenarios = [
        {
            name: "desktop",
            context: { viewport: { width: 1440, height: 1000 } },
            path: "/tmp/chandas-desktop.png"
        },
        {
            name: "mobile",
            context: devices["Pixel 7"],
            path: "/tmp/chandas-mobile.png"
        }
    ];

    for (const scenario of scenarios) {
        const context = await browser.newContext(scenario.context);
        const page = await context.newPage();
        await page.goto("http://127.0.0.1:4173");
        await page.locator("#composition").fill(
            "ಕಾವ್ಯಂ ಮಧುರಂ ಮನೋಹರಮ್\nಛಂದೋಬದ್ಧಂ ಸುಶೋಭನಮ್\n\nकाव्यं मधुरं मनोहरम्\nछन्दोबद्धं सुशोभनम्"
        );
        await page.locator("#previous-stanza").click();
        await page.locator("#meter-picker summary").click();
        await page.locator("#meter-search").fill("shardulavikriditam");
        await page.locator("#meter-select").selectOption("śārdūlavikrīḍitam");
        await page.locator("#meter-picker summary").click();
        await page.locator("#show-template").check();
        await page.screenshot({ path: scenario.path, fullPage: true });
        await context.close();
    }

    await browser.close();
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
