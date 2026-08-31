/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function chandasAnalyticsModule(root, factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory;
        return;
    }

    root.ChandasAnalytics = factory(root);
    root.ChandasAnalytics.trackPageview();
}(typeof globalThis !== "undefined" ? globalThis : this,
    function createChandasAnalytics(environment, options) {
        "use strict";

        const settings = options || {};
        const endpoint = settings.endpoint ||
            "https://chandas.goatcounter.com/count";
        const productionHosts = new Set(settings.productionHosts || [
            "chandas.org",
            "www.chandas.org"
        ]);
        const supportedScripts = new Set(settings.supportedScripts || [
            "kannada",
            "devanagari",
            "telugu",
            "gujarati",
            "roman",
            "english"
        ]);
        const minimumSyllables = settings.minimumSyllables || 3;
        const scriptDelayMs = settings.scriptDelayMs === undefined
            ? 1500
            : settings.scriptDelayMs;
        const sentEvents = new Set();
        const pendingImages = new Set();
        let scriptTimer = null;
        let pendingAnalysis = null;
        let pageviewSent = false;

        function isProductionWebsite() {
            const location = environment && environment.location;
            return Boolean(location && productionHosts.has(location.hostname));
        }

        function safePagePath() {
            const location = environment && environment.location;
            if (!location || !location.pathname) {
                return "/";
            }
            return location.pathname;
        }

        function sendCount(path, title, event) {
            if (!isProductionWebsite() ||
                !environment || typeof environment.Image !== "function") {
                return false;
            }

            const url = new URL(endpoint);
            url.searchParams.set("p", path);
            url.searchParams.set("t", title);
            if (event) {
                url.searchParams.set("e", "1");
            }
            // GoatCounter ignores rnd; it only prevents a browser or proxy from
            // serving a cached pixel instead of recording the aggregate count.
            url.searchParams.set("rnd", String(Date.now()));

            const image = new environment.Image();
            pendingImages.add(image);
            const release = () => pendingImages.delete(image);
            image.onload = release;
            image.onerror = release;
            image.referrerPolicy = "no-referrer";
            image.src = url.toString();
            return true;
        }

        function trackPageview() {
            if (pageviewSent) {
                return false;
            }
            const sent = sendCount(
                safePagePath(),
                environment.document && environment.document.title
                    ? environment.document.title
                    : "Chandas",
                false
            );
            if (sent) {
                pageviewSent = true;
            }
            return sent;
        }

        function scriptsInAnalysis(analysis) {
            const scripts = new Set();
            let syllableCount = 0;
            const stanzas = analysis && Array.isArray(analysis.stanzas)
                ? analysis.stanzas
                : [];

            stanzas.forEach((stanza) => {
                const lines = Array.isArray(stanza.lines) ? stanza.lines : [];
                lines.forEach((line) => {
                    const syllables = Array.isArray(line.syllables)
                        ? line.syllables
                        : [];
                    syllables.forEach((syllable) => {
                        if (syllable && supportedScripts.has(syllable.script)) {
                            scripts.add(syllable.script);
                            syllableCount += 1;
                        }
                    });
                });
            });

            return { scripts, syllableCount };
        }

        function emitScriptEvents(analysis) {
            const detected = scriptsInAnalysis(analysis);
            if (detected.syllableCount < minimumSyllables) {
                return [];
            }

            const names = Array.from(detected.scripts,
                (script) => `writing-script-${script}`);
            if (detected.scripts.size > 1) {
                names.push("writing-script-mixed");
            }

            return names.filter((name) => {
                if (sentEvents.has(name)) {
                    return false;
                }
                const label = name.replace("writing-script-", "");
                const sent = sendCount(
                    name,
                    `Writing script: ${label}`,
                    true
                );
                if (sent) {
                    sentEvents.add(name);
                }
                return sent;
            });
        }

        function trackCompositionScripts(analysis) {
            pendingAnalysis = analysis;
            if (scriptTimer !== null) {
                environment.clearTimeout(scriptTimer);
                scriptTimer = null;
            }

            const detected = scriptsInAnalysis(analysis);
            if (!isProductionWebsite() ||
                detected.syllableCount < minimumSyllables) {
                return;
            }

            scriptTimer = environment.setTimeout(() => {
                scriptTimer = null;
                emitScriptEvents(pendingAnalysis);
            }, scriptDelayMs);
        }

        return {
            safePagePath,
            trackPageview,
            trackCompositionScripts,
            emitScriptEvents
        };
    }));
