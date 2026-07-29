(function chandasApp() {
    "use strict";

    const DRAFT_KEY = "chandas.draft.v1";
    const LANGUAGE_KEY = "chandas.language.v1";
    const SAVE_DELAY_MS = 280;

    const messages = {
        en: {
            skip: "Skip to composition",
            brandTagline: "say it in-verse",
            learn: "Learn",
            language: "Interface language",
            newDraft: "New",
            eyebrow: "A live prosody companion",
            title: "Chandas - say it in-verse",
            intro: "Type Kannada or Devanagari verse. Guru and Laghu appear in place, and the closest meters stay quietly within reach.",
            composition: "Composition",
            savedLocally: "Saved privately on this device",
            saving: "Saving on this device…",
            restored: "Local draft restored",
            copy: "Copy",
            copied: "Composition copied",
            copyFailed: "Copy was unavailable",
            share: "Share",
            placeholder: "ಕನ್ನಡ ಅಥವಾ देवनागरीಯಲ್ಲಿ ಬರೆಯಿರಿ…",
            laghu: "Laghu",
            guru: "Guru",
            violation: "Violation",
            syllableShort: "S",
            matraShort: "M",
            cursorMetrics: "Syllable {syllable} · Mātrās {matras}",
            cursorMetricsLabel: "Counts from the beginning of the line to the cursor",
            stanzaHelp: "Leave a blank line between stanzas.",
            activeStanza: "Active stanza",
            stanza: "Stanza {number} of {total}",
            analysisEmpty: "Your meter suggestions will appear here.",
            pattern: "Current pattern",
            matras: "Mātrās by pāda",
            selectedMeterReference: "Selected meter",
            closestMeters: "Closest meters",
            suggestionNote: "Suggestions adjust while you type.",
            chooseAnother: "Choose any meter",
            findMeter: "Find a meter",
            searchMeters: "Search meters…",
            clearSelection: "Clear selected meter",
            showTemplate: "Show template",
            templateMode: "Template mode",
            ghostTemplate: "Ghost",
            strongTemplate: "Strong",
            guidedComposition: "Guided composition",
            strongTemplateHelp: "Fill any position. Empty positions stay empty and are never copied.",
            strongTemplateAvailable: "Strong mode is available for fixed vṛttas.",
            strongTemplateUnavailable: "Strong mode will follow rule review for this meter family.",
            strongLine: "Line {number}",
            strongSlot: "Line {line}, position {position}: expected {weight}",
            strongOpen: "{missing} positions open.",
            strongValid: "Every filled position follows {meter}; {missing} positions remain open.",
            strongIssues: "{violations} filled positions need attention; {missing} positions remain open.",
            expectedLaghu: "Laghu",
            expectedGuru: "Guru",
            meterTemplate: "{meter} template",
            templateLine: "Line {number}",
            repeatableLine: "Each line",
            exact: "Exact",
            compatible: "Possible",
            approximate: "Closest",
            selected: "Selected",
            noMeterSelected: "Choose a meter to check this stanza.",
            validMeter: "This stanza follows {meter}.",
            validationIssues: "{violations} mismatched and {missing} missing syllables for {meter}.",
            incompleteMeter: "{meter} is still possible; {missing} metrical units remain.",
            supportedRulesValid: "This stanza follows the supported rules for {meter}.",
            uncheckedRulesValid: "This stanza follows the encoded rhythm for {meter}; {rules} is not checked yet.",
            privateTitle: "Your verse stays with you.",
            privateText: "Analysis and draft recovery happen on this device, including when Android is offline.",
            shareComposition: "Share composition",
            includeMeter: "Include selected meter names",
            includeLink: "Include chandas.org link",
            deviceShare: "Device share",
            copyText: "Copy text",
            copyAnalysisLink: "Copy analysis link",
            analysisLinkCopied: "Analysis link copied",
            shared: "Share sheet opened",
            facebookCopied: "Text copied; paste it into your Facebook post.",
            shareUnavailable: "Sharing is unavailable; the text was copied instead.",
            clearConfirm: "Clear this local draft and begin a new composition?",
            catalogError: "The meter catalog could not be loaded.",
            noResults: "No matching meters",
            previousStanza: "Previous stanza",
            nextStanza: "Next stanza",
            urlImported: "Verse added from the link",
            urlMeterMissing: "The meter in this link was not found.",
            urlStrongFallback: "This meter currently supports Ghost guidance only."
        },
        kn: {
            skip: "ರಚನೆಗೆ ಹೋಗಿ",
            brandTagline: "ಪದ್ಯದಲ್ಲಿ ಹೇಳಿ",
            learn: "ಕಲಿಯಿರಿ",
            language: "ತೆರೆಯ ಭಾಷೆ",
            newDraft: "ಹೊಸದು",
            eyebrow: "ಛಂದದ ಪದ್ಯದ ಸಂಗಾತಿ",
            title: "ಛಂದಸ್ - ಪದ್ಯದಲ್ಲಿ ಹೇಳಿ",
            intro: "ಕನ್ನಡ ಅಥವಾ ದೇವನಾಗರಿ ಪದ್ಯವನ್ನು ಬರೆಯಿರಿ. ಗುರು–ಲಘು ಅದೇ ಪಠ್ಯದಲ್ಲಿ ಕಾಣುತ್ತದೆ; ಸಮೀಪದ ಛಂದಸ್ಸುಗಳು ಪಕ್ಕದಲ್ಲಿರುತ್ತವೆ.",
            composition: "ರಚನೆ",
            savedLocally: "ಈ ಸಾಧನದಲ್ಲಿ ಖಾಸಗಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ",
            saving: "ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತಿದೆ…",
            restored: "ಸ್ಥಳೀಯ ಕರಡು ಮರುಪಡೆಯಲಾಗಿದೆ",
            copy: "ನಕಲಿಸಿ",
            copied: "ರಚನೆಯನ್ನು ನಕಲಿಸಲಾಗಿದೆ",
            copyFailed: "ನಕಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ",
            share: "ಹಂಚಿಕೊಳ್ಳಿ",
            placeholder: "ಕನ್ನಡ ಅಥವಾ देवनागरीಯಲ್ಲಿ ಬರೆಯಿರಿ…",
            laghu: "ಲಘು",
            guru: "ಗುರು",
            violation: "ದೋಷ",
            syllableShort: "ಅ",
            matraShort: "ಮಾ",
            cursorMetrics: "ಅಕ್ಷರ {syllable} · ಮಾತ್ರೆ {matras}",
            cursorMetricsLabel: "ಸಾಲಿನ ಆರಂಭದಿಂದ ಕರ್ಸರ್‌ವರೆಗಿನ ಎಣಿಕೆ",
            stanzaHelp: "ಪದ್ಯಗಳ ನಡುವೆ ಒಂದು ಖಾಲಿ ಸಾಲು ಬಿಡಿ.",
            activeStanza: "ಪ್ರಸ್ತುತ ಪದ್ಯ",
            stanza: "ಪದ್ಯ {number} / {total}",
            analysisEmpty: "ಛಂದಸ್ಸಿನ ಸೂಚನೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
            pattern: "ಪ್ರಸ್ತುತ ಗಣ ವಿನ್ಯಾಸ",
            matras: "ಪಾದದ ಮಾತ್ರೆಗಳು",
            selectedMeterReference: "ಆಯ್ದ ಛಂದಸ್ಸು",
            closestMeters: "ಸಮೀಪದ ಛಂದಸ್ಸುಗಳು",
            suggestionNote: "ಬರೆಯುತ್ತಿದ್ದಂತೆ ಸೂಚನೆಗಳು ಬದಲಾಗುತ್ತವೆ.",
            chooseAnother: "ಬೇರೆ ಛಂದಸ್ಸನ್ನು ಆರಿಸಿ",
            findMeter: "ಛಂದಸ್ಸನ್ನು ಹುಡುಕಿ",
            searchMeters: "ಛಂದಸ್ಸು ಹುಡುಕಿ…",
            clearSelection: "ಆಯ್ದ ಛಂದಸ್ಸನ್ನು ತೆರವುಗೊಳಿಸಿ",
            showTemplate: "ಮಾದರಿಯನ್ನು ತೋರಿಸಿ",
            templateMode: "ಮಾದರಿಯ ವಿಧ",
            ghostTemplate: "ಮಂದ ಮಾದರಿ",
            strongTemplate: "ದೃಢ ಮಾದರಿ",
            guidedComposition: "ಮಾರ್ಗದರ್ಶಿತ ರಚನೆ",
            strongTemplateHelp: "ಯಾವ ಸ್ಥಾನವನ್ನಾದರೂ ತುಂಬಿ. ಖಾಲಿ ಸ್ಥಾನಗಳು ನಕಲಾಗುವುದಿಲ್ಲ.",
            strongTemplateAvailable: "ದೃಢ ಮಾದರಿ ವೃತ್ತಗಳಿಗೆ ಲಭ್ಯವಿದೆ.",
            strongTemplateUnavailable: "ಈ ಛಂದದ ನಿಯಮ ಪರಿಶೀಲನೆಯ ನಂತರ ದೃಢ ಮಾದರಿ ಲಭ್ಯವಾಗುತ್ತದೆ.",
            strongLine: "ಸಾಲು {number}",
            strongSlot: "ಸಾಲು {line}, ಸ್ಥಾನ {position}: ನಿರೀಕ್ಷಿತ {weight}",
            strongOpen: "{missing} ಸ್ಥಾನಗಳು ಖಾಲಿ.",
            strongValid: "ತುಂಬಿದ ಸ್ಥಾನಗಳು {meter}ಗೆ ಹೊಂದುತ್ತವೆ; {missing} ಸ್ಥಾನಗಳು ಖಾಲಿ.",
            strongIssues: "{violations} ಸ್ಥಾನಗಳನ್ನು ಸರಿಪಡಿಸಬೇಕು; {missing} ಸ್ಥಾನಗಳು ಖಾಲಿ.",
            expectedLaghu: "ಲಘು",
            expectedGuru: "ಗುರು",
            meterTemplate: "{meter} ಮಾದರಿ",
            templateLine: "ಸಾಲು {number}",
            repeatableLine: "ಪ್ರತಿ ಸಾಲು",
            exact: "ಸರಿಯಾಗಿ",
            compatible: "ಸಾಧ್ಯ",
            approximate: "ಸಮೀಪ",
            selected: "ಆಯ್ಕೆ",
            noMeterSelected: "ಈ ಪದ್ಯವನ್ನು ಪರೀಕ್ಷಿಸಲು ಛಂದಸ್ಸನ್ನು ಆರಿಸಿ.",
            validMeter: "ಈ ಪದ್ಯವು {meter} ಛಂದಸ್ಸಿಗೆ ಹೊಂದುತ್ತದೆ.",
            validationIssues: "{meter}: {violations} ವ್ಯತ್ಯಾಸ, {missing} ಕೊರತೆಯ ಅಕ್ಷರಗಳು.",
            incompleteMeter: "{meter} ಇನ್ನೂ ಸಾಧ್ಯ; {missing} ಛಂದೋಘಟಕಗಳು ಬಾಕಿಯಿವೆ.",
            supportedRulesValid: "ಈ ಪದ್ಯವು {meter}ಗಾಗಿ ಬೆಂಬಲಿತ ನಿಯಮಗಳಿಗೆ ಹೊಂದುತ್ತದೆ.",
            uncheckedRulesValid: "ಈ ಪದ್ಯವು {meter}ಯ ಲಯದ ನಿಯಮಗಳಿಗೆ ಹೊಂದುತ್ತದೆ; {rules} ಇನ್ನೂ ಪರಿಶೀಲಿಸಿಲ್ಲ.",
            privateTitle: "ನಿಮ್ಮ ಪದ್ಯ ನಿಮ್ಮಲ್ಲೇ ಉಳಿಯುತ್ತದೆ.",
            privateText: "ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಕರಡು ಮರುಪಡೆಯುವಿಕೆ ಈ ಸಾಧನದಲ್ಲೇ ನಡೆಯುತ್ತದೆ; Android ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿಯೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
            shareComposition: "ರಚನೆಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
            includeMeter: "ಆಯ್ದ ಛಂದಸ್ಸಿನ ಹೆಸರು ಸೇರಿಸಿ",
            includeLink: "chandas.org ಕೊಂಡಿ ಸೇರಿಸಿ",
            deviceShare: "ಸಾಧನದ ಮೂಲಕ",
            copyText: "ಪಠ್ಯ ನಕಲಿಸಿ",
            copyAnalysisLink: "ವಿಶ್ಲೇಷಣೆಯ ಕೊಂಡಿ ನಕಲಿಸಿ",
            analysisLinkCopied: "ವಿಶ್ಲೇಷಣೆಯ ಕೊಂಡಿ ನಕಲಾಗಿದೆ",
            shared: "ಹಂಚಿಕೆ ತೆರೆಯಲಾಗಿದೆ",
            facebookCopied: "ಪಠ್ಯ ನಕಲಾಗಿದೆ; Facebook ಪೋಸ್ಟ್‌ಗೆ ಅಂಟಿಸಿ.",
            shareUnavailable: "ಹಂಚಿಕೆ ಲಭ್ಯವಿಲ್ಲ; ಪಠ್ಯವನ್ನು ನಕಲಿಸಲಾಗಿದೆ.",
            clearConfirm: "ಈ ಸ್ಥಳೀಯ ಕರಡನ್ನು ಅಳಿಸಿ ಹೊಸ ರಚನೆ ಆರಂಭಿಸಬೇಕೆ?",
            catalogError: "ಛಂದಸ್ಸಿನ ಪಟ್ಟಿ ತೆರೆಯಲಾಗಲಿಲ್ಲ.",
            noResults: "ಹೊಂದುವ ಛಂದಸ್ಸುಗಳಿಲ್ಲ",
            previousStanza: "ಹಿಂದಿನ ಪದ್ಯ",
            nextStanza: "ಮುಂದಿನ ಪದ್ಯ",
            urlImported: "ಕೊಂಡಿಯಿಂದ ಪದ್ಯವನ್ನು ಸೇರಿಸಲಾಗಿದೆ",
            urlMeterMissing: "ಈ ಕೊಂಡಿಯಲ್ಲಿರುವ ಛಂದಸ್ಸು ದೊರೆಯಲಿಲ್ಲ.",
            urlStrongFallback: "ಈ ಛಂದಸ್ಸಿಗೆ ಈಗ ಮಂದ ಮಾದರಿ ಮಾತ್ರ ಲಭ್ಯ."
        }
    };

    const elements = {};
    const state = {
        catalog: null,
        meters: [],
        filteredMeters: [],
        analysis: null,
        selections: {},
        templates: {},
        templateModes: {},
        strongDrafts: {},
        strongHistory: {},
        strongFuture: {},
        activeStanzaIndex: 0,
        language: "en",
        composing: false,
        strongComposing: false,
        strongCompositionSnapshot: null,
        restoreSelectionFrame: null,
        saveTimer: null,
        renderTimer: null,
        toastTimer: null
    };

    function cacheElements() {
        [
            "composition", "highlight-layer", "editor-shell", "draft-state", "cursor-metrics",
            "language", "new-draft", "copy", "share", "analysis-title",
            "previous-stanza", "next-stanza", "empty-analysis", "analysis-content",
            "active-pattern", "active-matras", "selected-meter-reference", "selected-meter-name",
            "selected-meter-signature", "candidate-list", "meter-picker",
            "meter-search", "meter-select", "clear-meter", "show-template",
            "template-mode-picker", "template-mode-ghost", "template-mode-strong",
            "strong-template-availability", "whole-verse-template",
            "strong-template-editor", "strong-template-lines",
            "validation-summary", "share-dialog",
            "include-meter", "include-link", "system-share", "twitter-share",
            "facebook-share", "dialog-copy", "copy-analysis-url", "toast"
        ].forEach((id) => {
            elements[id] = document.getElementById(id);
        });
    }

    function t(key, replacements) {
        let value = (messages[state.language] && messages[state.language][key]) ||
            messages.en[key] || key;
        for (const [name, replacement] of Object.entries(replacements || {})) {
            value = value.replace(`{${name}}`, String(replacement));
        }
        return value;
    }

    function updateLanguage() {
        document.documentElement.lang = state.language;
        elements.language.value = state.language;

        document.querySelectorAll("[data-i18n]").forEach((node) => {
            node.textContent = t(node.dataset.i18n);
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
            node.placeholder = t(node.dataset.i18nPlaceholder);
        });

        elements["previous-stanza"].setAttribute("aria-label", t("previousStanza"));
        elements["next-stanza"].setAttribute("aria-label", t("nextStanza"));
        elements["cursor-metrics"].setAttribute("aria-label", t("cursorMetricsLabel"));
        renderCursorMetrics();
        renderOverlay();
        renderAnalysisPanel();
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function simpleRomanFold(value) {
        return String(value || "")
            .toLocaleLowerCase()
            .normalize("NFD")
            .replace(/\p{Mark}+/gu, "");
    }

    function commonRomanFold(value) {
        const replacements = {
            ā: "a", ī: "i", ū: "u",
            ṛ: "ri", ṝ: "ri", ḷ: "li", ḹ: "li",
            ṅ: "n", ñ: "n", ṇ: "n",
            ṭ: "t", ḍ: "d",
            ś: "sh", ṣ: "sh",
            ṃ: "m", ṁ: "m", ḥ: "h"
        };

        return String(value || "")
            .toLocaleLowerCase()
            .replace(/[āīūṛṝḷḹṅñṇṭḍśṣṃṁḥ]/g, (character) => replacements[character])
            .normalize("NFD")
            .replace(/\p{Mark}+/gu, "");
    }

    function meterSearchKeys(value) {
        return Array.from(new Set([
            simpleRomanFold(value),
            commonRomanFold(value)
        ].map((item) => item.trim()).filter(Boolean)));
    }

    function meterForId(meterId) {
        return state.meters.find((meter) => meter.id === meterId) || null;
    }

    function decodeQueryPart(value) {
        try {
            return decodeURIComponent(String(value || "").replace(/\+/g, " "));
        } catch (error) {
            return "";
        }
    }

    function guideModeFromUrl(value) {
        const normalized = String(value || "")
            .trim()
            .toLocaleLowerCase();
        if (normalized === "strong") {
            return "strong";
        }
        if (["off", "false", "0", "none", "hide"].includes(normalized)) {
            return "off";
        }
        return "ghost";
    }

    function parseUrlImport() {
        const raw = window.location.search.replace(/^\?/, "");
        if (!raw) {
            return null;
        }
        const params = new URLSearchParams(raw);
        let verse = params.has("verse")
            ? params.get("verse")
            : params.has("text")
                ? params.get("text")
                : null;
        if (verse === null) {
            const firstPart = raw.split("&", 1)[0];
            if (firstPart && !firstPart.includes("=")) {
                verse = decodeQueryPart(firstPart);
            }
        }

        const meter = params.has("meter")
            ? params.get("meter")
            : params.has("chandas")
                ? params.get("chandas")
                : null;
        const hasTemplate = params.has("template") ||
            params.has("showTemplate");
        const rawTemplate = params.has("template")
            ? params.get("template")
            : params.has("showTemplate")
                ? params.get("showTemplate") || "ghost"
                : null;
        const guideMode = hasTemplate
            ? guideModeFromUrl(rawTemplate)
            : null;
        const stanzaOptions = {};
        for (const [key, value] of params.entries()) {
            const match = /^(meter|template|slots)[._-]?(\d+)$/i.exec(key);
            if (!match) {
                continue;
            }
            const stanzaIndex = Number(match[2]) - 1;
            if (!Number.isInteger(stanzaIndex) || stanzaIndex < 0) {
                continue;
            }
            const option = stanzaOptions[stanzaIndex] ||
                (stanzaOptions[stanzaIndex] = {});
            const optionType = match[1].toLocaleLowerCase();
            if (optionType === "meter") {
                option.meter = value;
            } else if (optionType === "template") {
                option.guideMode = guideModeFromUrl(value);
            } else {
                try {
                    const slots = JSON.parse(value);
                    if (Array.isArray(slots)) {
                        option.strongSlots = slots;
                    }
                } catch (error) {
                    // Ignore malformed optional slot state; authored text still loads.
                }
            }
        }

        const consumed = verse !== null || meter !== null || hasTemplate ||
            Object.keys(stanzaOptions).length > 0;
        return consumed
            ? { verse, meter, guideMode, stanzaOptions }
            : null;
    }

    function stripOuterLineBreaks(value) {
        return String(value || "")
            .replace(/^(?:\r?\n)+/, "")
            .replace(/(?:\r?\n)+$/, "");
    }

    function appendAsPadya(existing, incoming) {
        if (!existing) {
            return { text: incoming, insertionStart: 0 };
        }
        let separator = "\n\n";
        if (/\n[^\S\n]*\n[^\S\n]*$/.test(existing)) {
            separator = "";
        } else if (/\n[^\S\n]*$/.test(existing)) {
            separator = "\n";
        }
        return {
            text: `${existing}${separator}${incoming}`,
            insertionStart: existing.length + separator.length
        };
    }

    function meterFromUrlToken(token) {
        const source = String(token || "").trim();
        if (!source) {
            return null;
        }
        const idMatch = state.meters.find((meter) =>
            meter.id.toLocaleLowerCase() === source.toLocaleLowerCase());
        if (idMatch) {
            return idMatch;
        }
        const tokenKeys = meterSearchKeys(source);
        return state.meters.find((meter) => {
            const identityKeys = [
                meter.name,
                ...(meter.aliases || [])
            ].flatMap(meterSearchKeys);
            return tokenKeys.some((key) => identityKeys.includes(key));
        }) || null;
    }

    function clearConsumedUrlQuery() {
        try {
            window.history.replaceState(
                window.history.state,
                "",
                `${window.location.pathname}${window.location.hash}`
            );
        } catch (error) {
            // The import still succeeds if a restrictive container keeps the URL.
        }
    }

    function importFromUrl() {
        const payload = parseUrlImport();
        if (!payload) {
            return;
        }
        if (state.restoreSelectionFrame !== null) {
            window.cancelAnimationFrame(state.restoreSelectionFrame);
            state.restoreSelectionFrame = null;
        }

        let insertionStart = null;
        const incoming = stripOuterLineBreaks(payload.verse);
        let importMessage = incoming ? t("urlImported") : "";
        if (incoming) {
            const appended = appendAsPadya(authoredCompositionText(), incoming);
            insertionStart = appended.insertionStart;
            elements.composition.value = appended.text;
            elements.composition.setSelectionRange(
                appended.text.length,
                appended.text.length
            );
            runAnalysis();
        }

        const targetIndices = state.analysis
            ? state.analysis.stanzas
                .filter((stanza) =>
                    insertionStart === null
                        ? stanza.index === state.activeStanzaIndex
                        : stanza.start >= insertionStart)
                .map((stanza) => stanza.index)
            : [];
        let selectionChanged = false;
        let missingMeter = false;
        targetIndices.forEach((stanzaIndex, relativeIndex) => {
            const option = payload.stanzaOptions[relativeIndex] || {};
            const meterToken = Object.hasOwn(option, "meter")
                ? option.meter
                : payload.meter;
            if (meterToken === null || meterToken === undefined) {
                return;
            }
            const meter = meterFromUrlToken(meterToken);
            if (!meter) {
                missingMeter = true;
                return;
            }
            state.selections[stanzaIndex] = meter.id;
            selectionChanged = true;
        });
        if (missingMeter) {
            importMessage = t("urlMeterMissing");
        }
        if (selectionChanged) {
            runAnalysis();
        }

        let fellBack = false;
        let templateChanged = false;
        targetIndices.forEach((stanzaIndex, relativeIndex) => {
            const option = payload.stanzaOptions[relativeIndex] || {};
            const requestedMode = Object.hasOwn(option, "guideMode")
                ? option.guideMode
                : payload.guideMode;
            if (requestedMode === null || requestedMode === undefined) {
                return;
            }
            const selected = meterForId(state.selections[stanzaIndex]);
            let mode = selected ? requestedMode : "off";
            if (mode === "strong" && !supportsStrongTemplate(selected)) {
                mode = "ghost";
                fellBack = true;
            }
            setTemplateMode(stanzaIndex, mode);
            templateChanged = true;
        });
        if (fellBack) {
            importMessage = t("urlStrongFallback");
        }
        if (templateChanged) {
            renderOverlay();
            renderAnalysisPanel();
        }
        let restoredStrongSlots = false;
        targetIndices.forEach((stanzaIndex, relativeIndex) => {
            const option = payload.stanzaOptions[relativeIndex] || {};
            if (!Array.isArray(option.strongSlots) ||
                templateMode(stanzaIndex) !== "strong") {
                return;
            }
            const stanza = state.analysis && state.analysis.stanzas[stanzaIndex];
            const meter = stanza && meterForId(state.selections[stanzaIndex]);
            if (!stanza || !supportsStrongTemplate(meter)) {
                return;
            }
            const draft = strongDraftFor(stanza, meter, true);
            if (ChandasStrongTemplate.restoreSlots(draft, option.strongSlots)) {
                restoredStrongSlots = true;
            }
        });
        if (restoredStrongSlots) {
            renderAnalysisPanel();
        }

        if (targetIndices.length) {
            if (incoming) {
                const end = elements.composition.value.length;
                elements.composition.setSelectionRange(end, end);
            }
            setActiveStanza(targetIndices.at(-1), false);
        }
        clearConsumedUrlQuery();
        if (importMessage) {
            showToast(importMessage);
        }
        scheduleSave();
    }

    function templateMode(stanzaIndex) {
        if (state.templateModes[stanzaIndex]) {
            return state.templateModes[stanzaIndex];
        }
        return state.templates[stanzaIndex] ? "ghost" : "off";
    }

    function setTemplateMode(stanzaIndex, mode) {
        if (mode === "off") {
            delete state.templateModes[stanzaIndex];
            delete state.templates[stanzaIndex];
            return;
        }
        state.templateModes[stanzaIndex] = mode;
        state.templates[stanzaIndex] = true;
    }

    function supportsStrongTemplate(meter) {
        return Boolean(
            meter &&
            meter.kind === "fixed" &&
            meter.linePolicy &&
            meter.linePolicy.type === "fixed"
        );
    }

    function strongDraftKey(stanzaIndex, meterId) {
        return `${stanzaIndex}|${meterId}`;
    }

    function activeStrongContext() {
        const stanza = state.analysis &&
            state.analysis.stanzas[state.activeStanzaIndex];
        const meter = stanza ? meterForId(stanza.selectedMeterId) : null;
        if (!stanza || !meter ||
            templateMode(state.activeStanzaIndex) !== "strong" ||
            !supportsStrongTemplate(meter)) {
            return null;
        }
        return {
            stanza,
            meter,
            key: strongDraftKey(state.activeStanzaIndex, meter.id)
        };
    }

    function strongCatalogVersion() {
        const structuralVersion = state.catalog &&
            state.catalog.structuralCatalogVersion;
        return `mishra-baseline+structural-${structuralVersion || "unknown"}`;
    }

    function strongDraftFor(stanza, meter, create) {
        const key = strongDraftKey(stanza.index, meter.id);
        const existing = state.strongDrafts[key];
        if (ChandasStrongTemplate.isCompatibleDraft(existing, meter)) {
            return existing;
        }
        if (!create) {
            return null;
        }
        const draft = ChandasStrongTemplate.createFixedDraft(meter, stanza, {
            catalogVersion: strongCatalogVersion(),
            analysisVersion: state.analysis && state.analysis.analysisVersion
        });
        state.strongDrafts[key] = draft;
        state.strongHistory[key] = [];
        state.strongFuture[key] = [];
        return draft;
    }

    function activeStrongDraft(create) {
        const context = activeStrongContext();
        return context
            ? strongDraftFor(context.stanza, context.meter, create)
            : null;
    }

    function authoredCompositionText() {
        let text = elements.composition ? elements.composition.value : "";
        if (!state.analysis || !state.analysis.stanzas.length) {
            return text;
        }

        const replacements = [];
        state.analysis.stanzas.forEach((stanza) => {
            const meterId = state.selections[stanza.index];
            if (templateMode(stanza.index) !== "strong" || !meterId) {
                return;
            }
            const draft = state.strongDrafts[strongDraftKey(stanza.index, meterId)];
            if (!draft) {
                return;
            }
            replacements.push({
                start: stanza.start,
                end: stanza.end,
                text: ChandasStrongTemplate.serializeDraft(draft)
            });
        });
        replacements.sort((left, right) => right.start - left.start)
            .forEach((replacement) => {
                text = text.slice(0, replacement.start) +
                    replacement.text +
                    text.slice(replacement.end);
            });
        return text;
    }

    function weightSymbols(script) {
        if (script === "kannada") {
            return { L: "ಲ", G: "ಗಾ", variable: "○" };
        }
        if (script === "devanagari") {
            return { L: "ल", G: "गा", variable: "○" };
        }
        return state.language === "kn"
            ? { L: "ಲ", G: "ಗಾ", variable: "○" }
            : { L: "L", G: "G", variable: "○" };
    }

    function formatWeightGuide(pattern, script, consumed) {
        const symbols = weightSymbols(script);
        return Array.from(pattern).slice(consumed || 0)
            .map((weight) => symbols[weight] || symbols.variable)
            .join("\u2009");
    }

    function amshaSymbols(script) {
        if (script === "kannada") {
            return { B: "ಬ್ರ", V: "ವಿ", R: "ರು" };
        }
        if (script === "devanagari") {
            return { B: "ब्र", V: "वि", R: "रु" };
        }
        return { B: "B", V: "V", R: "R" };
    }

    function formatAmshaSlot(slot, script) {
        const symbols = amshaSymbols(script);
        const options = Array.isArray(slot) ? slot : [slot];
        return options.map((item) => symbols[item] || item).join("/");
    }

    function structuralPadaGuide(meter, padaIndex, pada, script, wholeLine) {
        if (meter.kind === "matra") {
            const repeating = meter.linePolicy &&
                ["repeating", "variable"].includes(meter.linePolicy.type);
            const ruleIndex = repeating && meter.padaGroups && meter.padaGroups.length
                ? padaIndex % meter.padaGroups.length
                : padaIndex;
            const groups = meter.padaGroups && meter.padaGroups[ruleIndex];
            if (!groups) {
                return "";
            }
            const target = groups.reduce((sum, value) => sum + value, 0);
            const options = meter.padaGroupOptions &&
                meter.padaGroupOptions[ruleIndex];
            const groupGuide = Array.isArray(options) && options.length
                ? options.map((option) => option.join("|")).join(" or ")
                : groups.join("|");
            return wholeLine
                ? `${t("matraShort")} ${target} · ${groupGuide}`
                : `${t("matraShort")} ${pada ? pada.matras : 0}/${target} · ` +
                    groupGuide;
        }

        if (meter.kind === "amsha") {
            const groups = meter.amshaGroups && meter.amshaGroups[padaIndex];
            if (!groups) {
                return "";
            }
            return `aṃśa · ${groups.map((slot) =>
                formatAmshaSlot(slot, script)).join("|")}`;
        }

        const rule = meter.padas && meter.padas[padaIndex];
        if (!rule) {
            return "";
        }
        const guide = Array(rule.syllables).fill("?");
        if (rule.cadence) {
            Array.from(rule.cadence.pattern).forEach((weight, offset) => {
                guide[rule.cadence.start - 1 + offset] = weight;
            });
        }
        return formatWeightGuide(
            guide.map((item) => item === "?" ? "○" : item).join(""),
            script,
            wholeLine || !pada ? 0 : pada.syllables.length
        );
    }

    function meterVerseLineCount(meter) {
        if (!meter) {
            return 0;
        }
        if (meter.linePolicy && meter.linePolicy.type === "fixed") {
            return meter.linePolicy.count;
        }
        if (meter.linePolicy && meter.linePolicy.type === "repeating") {
            return meter.linePolicy.previewCount || meter.linePolicy.min || 1;
        }
        if (meter.kind === "fixed") {
            return 4;
        }
        if (Array.isArray(meter.padas)) {
            return meter.padas.length;
        }
        if (Array.isArray(meter.padaGroups)) {
            return meter.padaGroups.length;
        }
        if (Array.isArray(meter.amshaGroups)) {
            return meter.amshaGroups.length;
        }
        return 0;
    }

    function fixedVersePattern(meter, lineIndex) {
        if (Array.isArray(meter.versePatterns)) {
            return meter.versePatterns[lineIndex] || "";
        }
        const patterns = Chandas.expandFixedVersePatterns(
            meter.patterns || [],
            meterVerseLineCount(meter)
        );
        return patterns[lineIndex] || "";
    }

    function wholeVerseGuideLine(meter, stanza, lineIndex, script) {
        if (meter.kind === "fixed") {
            return formatWeightGuide(fixedVersePattern(meter, lineIndex), script, 0);
        }
        return structuralPadaGuide(
            meter,
            lineIndex,
            stanza.padas[lineIndex] || null,
            script,
            true
        );
    }

    function renderWholeVerseTemplate() {
        const container = elements["whole-verse-template"];
        if (!container) {
            return;
        }

        const stanza = state.analysis &&
            state.analysis.stanzas[state.activeStanzaIndex];
        const meter = stanza && templateMode(state.activeStanzaIndex) === "ghost"
            ? meterForId(stanza.selectedMeterId)
            : null;
        const lineCount = meterVerseLineCount(meter);
        if (!stanza || !meter || !lineCount) {
            container.hidden = true;
            container.replaceChildren();
            return;
        }

        const script = stanza.scripts[0] ||
            (stanza.lines[0] && stanza.lines[0].script) ||
            "unknown";
        const heading = document.createElement("span");
        heading.className = "whole-template-heading";
        const repeating = meter.linePolicy &&
            ["repeating", "variable"].includes(meter.linePolicy.type);
        const templateLabel = t("meterTemplate", { meter: meter.name });
        heading.textContent = templateLabel;

        const lines = document.createElement("span");
        lines.className = "whole-template-lines";
        for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
            const row = document.createElement("span");
            row.className = "whole-template-line";

            const label = document.createElement("span");
            label.className = "whole-template-line-label";
            label.textContent = repeating
                ? t("repeatableLine")
                : t("templateLine", { number: lineIndex + 1 });

            const guide = document.createElement("span");
            guide.className = "whole-template-line-guide";
            guide.textContent = wholeVerseGuideLine(
                meter,
                stanza,
                lineIndex,
                script
            );
            row.append(label, guide);
            lines.append(row);
        }

        container.setAttribute("aria-label", templateLabel);
        container.replaceChildren(heading, lines);
        container.hidden = false;
    }

    function strongSlotWeightName(weight) {
        return weight === Chandas.GURU ? t("expectedGuru") : t("expectedLaghu");
    }

    function renderStrongValidation(draft, meter) {
        const inspection = ChandasStrongTemplate.inspectDraft(draft);
        elements["active-pattern"].textContent = inspection.lines
            .map((line) => line.pattern)
            .join(" / ") || "—";
        elements["active-matras"].textContent = `${t("matras")}: ${
            inspection.lines.map((line) => line.matras).join(" | ")
        }`;

        const summary = elements["validation-summary"];
        summary.classList.toggle("has-errors", inspection.violationCount > 0);
        summary.textContent = inspection.violationCount > 0
            ? t("strongIssues", {
                violations: inspection.violationCount,
                missing: inspection.missingCount
            })
            : t("strongValid", {
                meter: meter.name,
                missing: inspection.missingCount
            });

        const slotElements = elements["strong-template-lines"]
            .querySelectorAll(".strong-template-slot");
        slotElements.forEach((input) => {
            const lineIndex = Number(input.dataset.lineIndex);
            const slotIndex = Number(input.dataset.slotIndex);
            const result = inspection.lines[lineIndex].slots[slotIndex];
            input.classList.remove(
                "is-empty", "is-match", "is-mismatch", "is-invalid"
            );
            input.classList.add(`is-${result.status}`);
            input.setAttribute("aria-invalid",
                ["mismatch", "invalid"].includes(result.status) ? "true" : "false");
        });
        elements["strong-template-lines"]
            .querySelectorAll(".strong-template-line-metrics")
            .forEach((output) => {
                const lineIndex = Number(output.dataset.lineIndex);
                const line = inspection.lines[lineIndex];
                output.textContent =
                    `${t("syllableShort")}${line.slots.reduce(
                        (sum, slot) => sum + slot.syllableCount,
                        0
                    )} · ${t("matraShort")}${line.matras}`;
            });
        return inspection;
    }

    function renderStrongTemplate(focusPosition) {
        const context = activeStrongContext();
        const editor = elements["strong-template-editor"];
        const normalEditor = elements["editor-shell"];
        if (!context) {
            editor.hidden = true;
            normalEditor.hidden = false;
            elements["strong-template-lines"].replaceChildren();
            return;
        }

        const draft = strongDraftFor(context.stanza, context.meter, true);
        const script = context.stanza.scripts[0] ||
            (context.stanza.lines[0] && context.stanza.lines[0].script) ||
            "unknown";
        const symbols = weightSymbols(script);
        const fragment = document.createDocumentFragment();

        draft.lines.forEach((line, lineIndex) => {
            const row = document.createElement("div");
            row.className = "strong-template-line";

            const lineReference = document.createElement("span");
            lineReference.className = "strong-template-line-reference";
            const label = document.createElement("span");
            label.className = "strong-template-line-label";
            label.textContent = t("strongLine", { number: lineIndex + 1 });
            const metrics = document.createElement("output");
            metrics.className = "strong-template-line-metrics";
            metrics.dataset.lineIndex = String(lineIndex);
            lineReference.append(label, metrics);

            const slots = document.createElement("div");
            slots.className = "strong-template-slots";
            line.slots.forEach((value, slotIndex) => {
                const slot = document.createElement("label");
                slot.className = "strong-template-position";

                const symbol = document.createElement("span");
                symbol.className = "strong-template-symbol";
                symbol.textContent = symbols[line.expected[slotIndex]];
                symbol.setAttribute("aria-hidden", "true");

                const input = document.createElement("input");
                input.type = "text";
                input.className = "strong-template-slot";
                input.value = value;
                input.autocomplete = "off";
                input.spellcheck = false;
                input.dataset.lineIndex = String(lineIndex);
                input.dataset.slotIndex = String(slotIndex);
                input.setAttribute("aria-label", t("strongSlot", {
                    line: lineIndex + 1,
                    position: slotIndex + 1,
                    weight: strongSlotWeightName(line.expected[slotIndex])
                }));
                slot.append(symbol, input);
                slots.append(slot);
            });
            row.append(lineReference, slots);
            fragment.append(row);
        });

        elements["strong-template-lines"].replaceChildren(fragment);
        normalEditor.hidden = true;
        editor.hidden = false;
        renderStrongValidation(draft, context.meter);

        if (focusPosition) {
            const target = elements["strong-template-lines"].querySelector(
                `[data-line-index="${focusPosition.lineIndex}"]` +
                `[data-slot-index="${focusPosition.slotIndex}"]`
            );
            if (target) {
                target.focus();
                target.setSelectionRange(target.value.length, target.value.length);
            }
        }
    }

    function pushStrongHistory(key, draft, snapshot) {
        const history = state.strongHistory[key] || (state.strongHistory[key] = []);
        const nextSnapshot = snapshot || ChandasStrongTemplate.cloneSlots(draft);
        const previous = history.at(-1);
        if (!previous ||
            JSON.stringify(previous) !== JSON.stringify(nextSnapshot)) {
            history.push(nextSnapshot);
            if (history.length > 100) {
                history.shift();
            }
        }
        state.strongFuture[key] = [];
    }

    function stepStrongHistory(direction, focusPosition) {
        const context = activeStrongContext();
        const draft = activeStrongDraft(false);
        if (!context || !draft) {
            return;
        }
        const from = direction === "undo"
            ? state.strongHistory[context.key] || []
            : state.strongFuture[context.key] || [];
        if (!from.length) {
            return;
        }
        const to = direction === "undo"
            ? state.strongFuture[context.key] || (state.strongFuture[context.key] = [])
            : state.strongHistory[context.key] || (state.strongHistory[context.key] = []);
        to.push(ChandasStrongTemplate.cloneSlots(draft));
        const snapshot = from.pop();
        if (ChandasStrongTemplate.restoreSlots(draft, snapshot)) {
            renderStrongTemplate(focusPosition);
            scheduleSave();
        }
    }

    function commitStrongDraftToComposition(stanzaIndex, meterId) {
        const stanza = state.analysis && state.analysis.stanzas[stanzaIndex];
        const draft = state.strongDrafts[strongDraftKey(stanzaIndex, meterId)];
        if (!stanza || !draft) {
            return;
        }
        const authored = ChandasStrongTemplate.serializeDraft(draft);
        const text = elements.composition.value;
        elements.composition.value =
            text.slice(0, stanza.start) + authored + text.slice(stanza.end);
        const caret = stanza.start + authored.length;
        elements.composition.setSelectionRange(caret, caret);
    }

    function ghostGuideForLine(stanza, line, meter) {
        if (!meter) {
            return "";
        }
        if (meter.kind === "fixed") {
            const pattern = meter.patterns.length === 1
                ? meter.patterns[0]
                : meter.patterns[line.index] || "";
            return formatWeightGuide(pattern, line.script, line.syllables.length);
        }

        const padas = stanza.padas.filter((pada) =>
            pada.start >= line.start && pada.end <= line.end);
        const pada = meter.linePolicy && meter.linePolicy.unit === "line"
            ? {
                index: line.index,
                syllables: padas.flatMap((item) => item.syllables),
                matras: padas.reduce((sum, item) => sum + item.matras, 0)
            }
            : padas[padas.length - 1];
        return pada
            ? structuralPadaGuide(meter, pada.index, pada, line.script, false)
            : "";
    }

    function buildOverlayAnnotations() {
        const byPosition = new Map();

        for (const stanza of state.analysis ? state.analysis.stanzas : []) {
            const templateMeter = templateMode(stanza.index) === "ghost"
                ? meterForId(stanza.selectedMeterId)
                : null;

            for (const line of stanza.lines) {
                const lastSyllable = line.syllables[line.syllables.length - 1];
                if (!lastSyllable) {
                    continue;
                }
                const annotation = byPosition.get(lastSyllable.end) || {
                    position: lastSyllable.end,
                    metrics: "",
                    ghost: ""
                };
                annotation.metrics =
                    `${t("syllableShort")}${line.syllables.length} · ` +
                    `${t("matraShort")}${line.matraCount}`;
                byPosition.set(lastSyllable.end, annotation);

                const ghost = ghostGuideForLine(stanza, line, templateMeter);
                if (ghost) {
                    const ghostAnnotation = byPosition.get(line.end) || {
                        position: line.end,
                        metrics: "",
                        ghost: ""
                    };
                    ghostAnnotation.ghost = ghost;
                    byPosition.set(line.end, ghostAnnotation);
                }
            }
        }

        return Array.from(byPosition.values()).sort((left, right) =>
            left.position - right.position);
    }

    function annotationHtml(annotation) {
        const metrics = annotation.metrics
            ? `<span class="line-metrics-badge">${escapeHtml(annotation.metrics)}</span>`
            : "";
        const ghost = annotation.ghost
            ? `<span class="ghost-template">${escapeHtml(annotation.ghost)}</span>`
            : "";
        return `<span class="inline-metric-anchor">${metrics}${ghost}</span>`;
    }

    function renderCursorMetrics() {
        if (!elements["cursor-metrics"]) {
            return;
        }
        const caret = elements.composition ? elements.composition.selectionStart : 0;
        const text = elements.composition ? elements.composition.value : "";
        const lineStart = caret > 0 ? text.lastIndexOf("\n", caret - 1) + 1 : 0;
        const segments = state.analysis ? state.analysis.segments : [];
        const preceding = segments.filter((segment) => segment.start < caret);
        const precedingOnLine = preceding.filter((segment) => segment.start >= lineStart);
        const matras = precedingOnLine.reduce(
            (sum, segment) =>
                sum + (segment.classification === Chandas.GURU ? 2 : 1),
            0
        );
        elements["cursor-metrics"].textContent = t("cursorMetrics", {
            syllable: precedingOnLine.length,
            matras
        });
    }

    function renderPlainOverlay() {
        elements["highlight-layer"].innerHTML =
            `${escapeHtml(elements.composition.value)}\n`;
        syncScroll();
    }

    function renderOverlay() {
        const text = elements.composition.value;
        if (!state.analysis || !text) {
            renderPlainOverlay();
            return;
        }

        const ranges = Chandas.projectHighlightRanges(text, [
            ...state.analysis.segments.map((segment) => ({
                start: segment.start,
                end: segment.end,
                className: segment.violation
                    ? "violation"
                    : segment.classification === Chandas.GURU
                        ? "guru"
                        : "laghu"
            })),
            ...state.analysis.unsupported.map((range) => ({
                start: range.start,
                end: range.end,
                className: "uncertain"
            }))
        ]).sort((left, right) => left.start - right.start || left.end - right.end);
        const annotations = buildOverlayAnnotations();

        let cursor = 0;
        let html = "";
        let annotationIndex = 0;

        function appendAnnotationsThrough(position) {
            while (annotationIndex < annotations.length &&
                annotations[annotationIndex].position <= position) {
                const annotation = annotations[annotationIndex];
                annotationIndex += 1;
                if (annotation.position < cursor || annotation.position > text.length) {
                    continue;
                }
                html += escapeHtml(text.slice(cursor, annotation.position));
                cursor = annotation.position;
                html += annotationHtml(annotation);
            }
        }

        for (const range of ranges) {
            appendAnnotationsThrough(range.start);
            if (range.start < cursor || range.start > text.length) {
                continue;
            }
            html += escapeHtml(text.slice(cursor, range.start));
            html += `<span class="${range.className}">${escapeHtml(text.slice(range.start, range.end))}</span>`;
            cursor = Math.max(cursor, range.end);
            appendAnnotationsThrough(cursor);
        }
        appendAnnotationsThrough(text.length);
        html += escapeHtml(text.slice(cursor));
        // A final newline ensures matching textarea height and scroll behavior.
        elements["highlight-layer"].innerHTML = `${html}\n`;
        syncScroll();
    }

    function syncScroll() {
        elements["highlight-layer"].scrollTop = elements.composition.scrollTop;
        elements["highlight-layer"].scrollLeft = elements.composition.scrollLeft;
    }

    function stanzaAtOffset(stanzas, offset) {
        if (!stanzas.length) {
            return 0;
        }

        const containing = stanzas.findIndex((stanza) =>
            offset >= stanza.start && offset <= stanza.end);
        if (containing >= 0) {
            return containing;
        }

        let nearest = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        stanzas.forEach((stanza, index) => {
            const distance = Math.min(
                Math.abs(offset - stanza.start),
                Math.abs(offset - stanza.end)
            );
            if (distance < nearestDistance) {
                nearest = index;
                nearestDistance = distance;
            }
        });
        return nearest;
    }

    function reconcileSelections(oldStanzas, newStanzas, caretOffset) {
        if (!oldStanzas || oldStanzas.length === newStanzas.length) {
            return;
        }

        const oldSelections = { ...state.selections };
        const oldTemplates = { ...state.templates };
        const oldModes = { ...state.templateModes };
        const oldStrongDrafts = { ...state.strongDrafts };
        const nextSelections = {};
        const nextTemplates = {};
        const nextModes = {};
        const nextStrongDrafts = {};
        const usedOld = new Set();

        function copyStanzaState(oldIndex, newIndex) {
            if (oldSelections[oldIndex]) {
                nextSelections[newIndex] = oldSelections[oldIndex];
            }
            if (oldTemplates[oldIndex]) {
                nextTemplates[newIndex] = true;
            }
            if (oldModes[oldIndex]) {
                nextModes[newIndex] = oldModes[oldIndex];
            }
            Object.entries(oldStrongDrafts).forEach(([key, draft]) => {
                const separator = key.indexOf("|");
                if (separator < 0 || Number(key.slice(0, separator)) !== oldIndex) {
                    return;
                }
                nextStrongDrafts[`${newIndex}${key.slice(separator)}`] = draft;
            });
        }

        newStanzas.forEach((newStanza, newIndex) => {
            const exactIndex = oldStanzas.findIndex((oldStanza, oldIndex) =>
                !usedOld.has(oldIndex) &&
                oldStanza.text.trim() === newStanza.text.trim());
            if (exactIndex >= 0) {
                copyStanzaState(exactIndex, newIndex);
                usedOld.add(exactIndex);
            }
        });

        const oldActive = stanzaAtOffset(oldStanzas, caretOffset);
        const newActive = stanzaAtOffset(newStanzas, caretOffset);
        if (!nextSelections[newActive] && oldSelections[oldActive]) {
            copyStanzaState(oldActive, newActive);
        }

        state.selections = nextSelections;
        state.templates = nextTemplates;
        state.templateModes = nextModes;
        state.strongDrafts = nextStrongDrafts;
        state.strongHistory = {};
        state.strongFuture = {};
    }

    function scheduleAnalysis() {
        window.clearTimeout(state.renderTimer);
        if (state.composing) {
            renderPlainOverlay();
            return;
        }
        state.renderTimer = window.setTimeout(runAnalysis, 35);
    }

    function runAnalysis() {
        const text = elements.composition.value;
        const oldStanzas = state.analysis ? state.analysis.stanzas : null;
        const parsedStanzas = Chandas.parseStanzas(text);
        reconcileSelections(oldStanzas, parsedStanzas, elements.composition.selectionStart);

        state.analysis = Chandas.analyzeComposition(text, state.catalog, state.selections);
        state.activeStanzaIndex = stanzaAtOffset(
            state.analysis.stanzas,
            elements.composition.selectionStart
        );

        renderOverlay();
        renderCursorMetrics();
        renderAnalysisPanel();
        scheduleSave();
    }

    function setActiveStanza(index, moveCaret) {
        if (!state.analysis || !state.analysis.stanzas.length) {
            state.activeStanzaIndex = 0;
            renderCursorMetrics();
            renderAnalysisPanel();
            return;
        }

        state.activeStanzaIndex = Math.max(
            0,
            Math.min(index, state.analysis.stanzas.length - 1)
        );
        if (moveCaret) {
            const stanza = state.analysis.stanzas[state.activeStanzaIndex];
            elements.composition.focus();
            elements.composition.setSelectionRange(stanza.start, stanza.start);
        }
        renderCursorMetrics();
        renderAnalysisPanel();
    }

    function updateActiveFromCaret() {
        renderCursorMetrics();
        if (!state.analysis) {
            return;
        }
        const nextIndex = stanzaAtOffset(
            state.analysis.stanzas,
            elements.composition.selectionStart
        );
        if (nextIndex !== state.activeStanzaIndex) {
            state.activeStanzaIndex = nextIndex;
            renderAnalysisPanel();
        }
    }

    function candidateButton(candidate, selectedMeterId) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `candidate${candidate.id === selectedMeterId ? " selected" : ""}`;
        button.dataset.status = candidate.status;
        button.dataset.meterId = candidate.id;
        button.setAttribute("aria-pressed", candidate.id === selectedMeterId ? "true" : "false");

        const identity = document.createElement("span");
        identity.className = "candidate-identity";
        const name = document.createElement("span");
        name.className = "candidate-name";
        name.textContent = candidate.name;
        identity.append(name);
        if (candidate.kind !== "fixed" && candidate.patterns[0]) {
            const detail = document.createElement("small");
            detail.className = "candidate-detail";
            detail.textContent = candidate.patterns[0];
            identity.append(detail);
        }

        const status = document.createElement("span");
        status.className = "candidate-status";
        status.textContent = candidate.id === selectedMeterId
            ? t("selected")
            : t(candidate.status);

        button.append(identity, status);
        button.addEventListener("click", () => selectMeter(candidate.id));
        return button;
    }

    function renderAnalysisPanel() {
        const stanzas = state.analysis ? state.analysis.stanzas : [];
        const hasStanzas = stanzas.length > 0;

        elements["empty-analysis"].hidden = hasStanzas;
        elements["analysis-content"].hidden = !hasStanzas;
        elements["previous-stanza"].disabled = !hasStanzas || state.activeStanzaIndex <= 0;
        elements["next-stanza"].disabled = !hasStanzas ||
            state.activeStanzaIndex >= stanzas.length - 1;

        if (!hasStanzas) {
            elements["analysis-title"].textContent = "—";
            elements["selected-meter-reference"].hidden = true;
            elements["show-template"].checked = false;
            elements["template-mode-picker"].hidden = true;
            renderWholeVerseTemplate();
            renderStrongTemplate();
            return;
        }

        const stanza = stanzas[state.activeStanzaIndex];
        elements["analysis-title"].textContent = t("stanza", {
            number: state.activeStanzaIndex + 1,
            total: stanzas.length
        });
        elements["active-pattern"].textContent = stanza.patterns.join(" / ") || "—";
        elements["active-matras"].textContent = stanza.matraPattern.length
            ? `${t("matras")}: ${stanza.matraPattern.join(" | ")}`
            : "";

        const selectedReference = elements["selected-meter-reference"];
        selectedReference.hidden = !stanza.selectedMeter;
        let mode = templateMode(state.activeStanzaIndex);
        const selectedMeter = meterForId(stanza.selectedMeterId);
        if (mode === "strong" && !supportsStrongTemplate(selectedMeter)) {
            setTemplateMode(state.activeStanzaIndex, "ghost");
            mode = "ghost";
        }
        elements["show-template"].checked = mode !== "off";
        elements["template-mode-picker"].hidden =
            !stanza.selectedMeter || mode === "off";
        elements["template-mode-ghost"].checked = mode === "ghost";
        elements["template-mode-strong"].checked = mode === "strong";
        elements["template-mode-strong"].disabled =
            !supportsStrongTemplate(selectedMeter);
        elements["strong-template-availability"].textContent =
            supportsStrongTemplate(selectedMeter)
                ? t("strongTemplateAvailable")
                : t("strongTemplateUnavailable");
        if (stanza.selectedMeter) {
            elements["selected-meter-name"].textContent = stanza.selectedMeter.name;
            elements["selected-meter-signature"].replaceChildren(
                ...stanza.selectedMeter.patterns.map((pattern, index, patterns) => {
                    const line = document.createElement("span");
                    line.textContent = patterns.length > 1
                        ? `${index + 1}. ${pattern}`
                        : pattern;
                    return line;
                })
            );
        } else {
            elements["selected-meter-name"].textContent = "";
            elements["selected-meter-signature"].replaceChildren();
            elements["show-template"].checked = false;
            elements["template-mode-picker"].hidden = true;
        }

        elements["candidate-list"].replaceChildren(
            ...stanza.candidates.slice(0, 4)
                .map((candidate) => candidateButton(candidate, stanza.selectedMeterId))
        );

        filterMeterOptions(elements["meter-search"].value);
        elements["meter-select"].value = stanza.selectedMeterId;

        const summary = elements["validation-summary"];
        summary.classList.remove("has-errors");
        if (!stanza.selectedMeter) {
            summary.textContent = t("noMeterSelected");
        } else if (stanza.violationCount === 0 && stanza.missingCount === 0) {
            const uncheckedRules = stanza.selectedMeter.uncheckedRules || [];
            if (uncheckedRules.length) {
                summary.textContent = t("uncheckedRulesValid", {
                    meter: stanza.selectedMeter.name,
                    rules: uncheckedRules.join(", ")
                });
            } else {
                summary.textContent = t(
                    stanza.selectedMeter.ruleCompleteness === "group-totals"
                        ? "supportedRulesValid"
                        : "validMeter",
                    { meter: stanza.selectedMeter.name }
                );
            }
        } else if (stanza.violationCount === 0) {
            summary.textContent = t("incompleteMeter", {
                meter: stanza.selectedMeter.name,
                missing: stanza.missingCount
            });
        } else {
            summary.textContent = t("validationIssues", {
                meter: stanza.selectedMeter.name,
                violations: stanza.violationCount,
                missing: stanza.missingCount
            });
            summary.classList.add("has-errors");
        }
        renderWholeVerseTemplate();
        renderStrongTemplate();
    }

    function filterMeterOptions(query) {
        const queryKeys = meterSearchKeys(query);
        const activeStanza = state.analysis &&
            state.analysis.stanzas[state.activeStanzaIndex];
        const selectedId = activeStanza ? activeStanza.selectedMeterId : "";

        state.filteredMeters = state.meters.filter((meter) =>
            !queryKeys.length ||
            queryKeys.some((key) => meter.searchText.includes(key))
        ).slice(0, 250);

        const fragment = document.createDocumentFragment();
        if (!state.filteredMeters.length) {
            const empty = document.createElement("option");
            empty.disabled = true;
            empty.textContent = t("noResults");
            fragment.append(empty);
        } else {
            for (const meter of state.filteredMeters) {
                const option = document.createElement("option");
                option.value = meter.id;
                option.textContent = meter.name;
                option.selected = meter.id === selectedId;
                fragment.append(option);
            }
        }
        elements["meter-select"].replaceChildren(fragment);
    }

    function selectMeter(meterId) {
        if (!state.analysis || !state.analysis.stanzas[state.activeStanzaIndex]) {
            return;
        }
        const currentMeterId = state.selections[state.activeStanzaIndex] || "";
        if (templateMode(state.activeStanzaIndex) === "strong" &&
            currentMeterId && currentMeterId !== meterId) {
            commitStrongDraftToComposition(state.activeStanzaIndex, currentMeterId);
            setTemplateMode(state.activeStanzaIndex, meterId ? "ghost" : "off");
        }
        if (meterId) {
            state.selections[state.activeStanzaIndex] = meterId;
        } else {
            delete state.selections[state.activeStanzaIndex];
            delete state.templates[state.activeStanzaIndex];
            delete state.templateModes[state.activeStanzaIndex];
        }
        runAnalysis();
    }

    function scheduleSave() {
        window.clearTimeout(state.saveTimer);
        elements["draft-state"].textContent = t("saving");
        state.saveTimer = window.setTimeout(saveDraft, SAVE_DELAY_MS);
    }

    function saveDraft() {
        const draft = {
            version: 3,
            text: elements.composition.value,
            selections: state.selections,
            templates: state.templates,
            templateModes: state.templateModes,
            strongDrafts: state.strongDrafts,
            language: state.language,
            selectionStart: elements.composition.selectionStart,
            selectionEnd: elements.composition.selectionEnd,
            updatedAt: new Date().toISOString()
        };

        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            elements["draft-state"].textContent = t("savedLocally");
        } catch (error) {
            elements["draft-state"].textContent = t("copyFailed");
        }
    }

    function restoreDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) {
                return;
            }
            const draft = JSON.parse(raw);
            if (!draft || ![1, 2, 3].includes(draft.version) ||
                typeof draft.text !== "string") {
                return;
            }

            elements.composition.value = draft.text;
            state.selections = draft.selections && typeof draft.selections === "object"
                ? draft.selections
                : {};
            state.templates = draft.version >= 2 &&
                draft.templates && typeof draft.templates === "object"
                ? draft.templates
                : {};
            state.templateModes = draft.version >= 3 &&
                draft.templateModes && typeof draft.templateModes === "object"
                ? draft.templateModes
                : Object.fromEntries(
                    Object.keys(state.templates).map((key) => [key, "ghost"])
                );
            state.strongDrafts = draft.version >= 3 &&
                draft.strongDrafts && typeof draft.strongDrafts === "object"
                ? draft.strongDrafts
                : {};
            if (draft.language && messages[draft.language]) {
                state.language = draft.language;
            }
            state.restoreSelectionFrame = requestAnimationFrame(() => {
                const start = Math.min(draft.selectionStart || 0, draft.text.length);
                const end = Math.min(draft.selectionEnd || start, draft.text.length);
                elements.composition.setSelectionRange(start, end);
                state.restoreSelectionFrame = null;
            });
            if (draft.text) {
                showToast(t("restored"));
            }
        } catch (error) {
            localStorage.removeItem(DRAFT_KEY);
        }
    }

    function clearDraft() {
        if (authoredCompositionText() && !window.confirm(t("clearConfirm"))) {
            return;
        }
        window.clearTimeout(state.saveTimer);
        localStorage.removeItem(DRAFT_KEY);
        elements.composition.value = "";
        state.selections = {};
        state.templates = {};
        state.templateModes = {};
        state.strongDrafts = {};
        state.strongHistory = {};
        state.strongFuture = {};
        state.analysis = null;
        state.activeStanzaIndex = 0;
        renderPlainOverlay();
        renderCursorMetrics();
        renderAnalysisPanel();
        elements["draft-state"].textContent = t("savedLocally");
        elements.composition.focus();
    }

    function analysisUrl() {
        const url = new URL("https://chandas.org/");
        url.searchParams.set("v", "1");
        url.searchParams.set("verse", authoredCompositionText());
        const stanzas = state.analysis ? state.analysis.stanzas : [];
        stanzas.forEach((stanza, index) => {
            const meterId = state.selections[stanza.index] ||
                stanza.selectedMeterId;
            if (meterId) {
                url.searchParams.set(`meter${index + 1}`, meterId);
            }
            const mode = templateMode(stanza.index);
            if (mode !== "off") {
                url.searchParams.set(`template${index + 1}`, mode);
            }
            if (mode === "strong" && meterId) {
                const draft = state.strongDrafts[
                    strongDraftKey(stanza.index, meterId)
                ];
                if (draft) {
                    url.searchParams.set(
                        `slots${index + 1}`,
                        JSON.stringify(ChandasStrongTemplate.cloneSlots(draft))
                    );
                }
            }
        });
        return url.toString();
    }

    async function copyText(text, successMessage) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const helper = document.createElement("textarea");
                helper.value = text;
                helper.style.position = "fixed";
                helper.style.opacity = "0";
                document.body.append(helper);
                helper.select();
                const successful = document.execCommand("copy");
                helper.remove();
                if (!successful) {
                    throw new Error("Copy command failed");
                }
            }
            showToast(t(successMessage || "copied"));
            return true;
        } catch (error) {
            showToast(t("copyFailed"));
            return false;
        }
    }

    function shareText() {
        let text = authoredCompositionText();
        if (elements["include-meter"].checked && state.analysis) {
            const meterNames = Array.from(new Set(state.analysis.stanzas
                .map((stanza) => stanza.selectedMeter && stanza.selectedMeter.name)
                .filter(Boolean)));
            if (meterNames.length) {
                text += `\n\n— ${meterNames.join(", ")}`;
            }
        }
        if (elements["include-link"].checked) {
            text += "\nhttps://chandas.org";
        }
        return text;
    }

    async function systemShare() {
        const text = shareText();
        try {
            if (window.AndroidShare && typeof window.AndroidShare.share === "function") {
                window.AndroidShare.share(text);
                showToast(t("shared"));
            } else if (navigator.share) {
                await navigator.share({ text });
                showToast(t("shared"));
            } else {
                await copyText(text);
                showToast(t("shareUnavailable"));
            }
        } catch (error) {
            if (error && error.name !== "AbortError") {
                await copyText(text);
            }
        }
    }

    function openTwitterShare() {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText())}`;
        window.open(url, "_blank", "noopener,noreferrer");
    }

    async function openFacebookShare() {
        await copyText(shareText());
        showToast(t("facebookCopied"));
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://chandas.org")}`;
        window.open(url, "_blank", "noopener,noreferrer");
    }

    function showToast(message) {
        window.clearTimeout(state.toastTimer);
        elements.toast.textContent = message;
        elements.toast.classList.add("show");
        state.toastTimer = window.setTimeout(() => {
            elements.toast.classList.remove("show");
        }, 2600);
    }

    async function loadCatalog() {
        const [fixedResponse, structuralResponse] = await Promise.all([
            fetch("mishra.json", { cache: "force-cache" }),
            fetch("structural_meters.json", { cache: "force-cache" })
        ]);
        if (!fixedResponse.ok || !structuralResponse.ok) {
            throw new Error(
                `Catalog request failed: ${fixedResponse.status}/${structuralResponse.status}`
            );
        }
        const fixedCatalog = await fixedResponse.json();
        const structuralCatalog = await structuralResponse.json();
        state.catalog = {
            ...fixedCatalog,
            structuralMeters: structuralCatalog.meters,
            structuralCatalogVersion: structuralCatalog.catalogVersion
        };
        state.meters = Chandas.normalizeCatalog(state.catalog)
            .map((meter) => ({
                ...meter,
                searchText: meterSearchKeys(
                    [meter.name, ...(meter.aliases || [])].join(" ")
                ).join(" ")
            }))
            .sort((left, right) => left.name.localeCompare(right.name));
        filterMeterOptions("");
    }

    function strongInputPosition(input) {
        return {
            lineIndex: Number(input.dataset.lineIndex),
            slotIndex: Number(input.dataset.slotIndex)
        };
    }

    function focusStrongSlot(lineIndex, slotIndex) {
        const draft = activeStrongDraft(false);
        if (!draft) {
            return;
        }
        const boundedLine = Math.max(0, Math.min(lineIndex, draft.lines.length - 1));
        const boundedSlot = Math.max(
            0,
            Math.min(slotIndex, draft.lines[boundedLine].slots.length - 1)
        );
        const target = elements["strong-template-lines"].querySelector(
            `[data-line-index="${boundedLine}"]` +
            `[data-slot-index="${boundedSlot}"]`
        );
        if (target) {
            target.focus();
            target.setSelectionRange(target.value.length, target.value.length);
        }
    }

    function updateStrongInput(input) {
        const context = activeStrongContext();
        const draft = activeStrongDraft(false);
        if (!context || !draft) {
            return;
        }
        const position = strongInputPosition(input);
        draft.lines[position.lineIndex].slots[position.slotIndex] = input.value;
        if (!state.strongComposing) {
            renderStrongValidation(draft, context.meter);
            renderStrongCursorMetrics(input);
            scheduleSave();
        }
    }

    function renderStrongCursorMetrics(input) {
        const draft = activeStrongDraft(false);
        if (!draft || !input) {
            return;
        }
        const position = strongInputPosition(input);
        const line = draft.lines[position.lineIndex];
        const caret = input.selectionStart === null
            ? input.value.length
            : input.selectionStart;
        const textThroughCaret = line.slots
            .slice(0, position.slotIndex)
            .join("") + input.value.slice(0, caret);
        const segmented = Chandas.segmentLine(textThroughCaret, 0);
        const matras = segmented.syllables.reduce(
            (sum, syllable) =>
                sum + (syllable.classification === Chandas.GURU ? 2 : 1),
            0
        );
        elements["cursor-metrics"].textContent = t("cursorMetrics", {
            syllable: segmented.syllables.length,
            matras
        });
    }

    function handleStrongPaste(event, input) {
        const context = activeStrongContext();
        const draft = activeStrongDraft(false);
        const text = event.clipboardData && event.clipboardData.getData("text");
        if (!context || !draft || typeof text !== "string") {
            return;
        }
        event.preventDefault();
        pushStrongHistory(context.key, draft);
        const position = strongInputPosition(input);
        const finalPosition = ChandasStrongTemplate.distributeText(
            draft,
            position.lineIndex,
            position.slotIndex,
            text
        );
        renderStrongTemplate(finalPosition);
        scheduleSave();
    }

    function handleStrongKeydown(event, input) {
        const context = activeStrongContext();
        const draft = activeStrongDraft(false);
        if (!context || !draft) {
            return;
        }
        const position = strongInputPosition(input);
        const commandKey = event.ctrlKey || event.metaKey;
        if (commandKey && !event.altKey && event.key.toLowerCase() === "z") {
            event.preventDefault();
            stepStrongHistory(event.shiftKey ? "redo" : "undo", position);
            return;
        }
        if (commandKey && !event.altKey && event.key.toLowerCase() === "y") {
            event.preventDefault();
            stepStrongHistory("redo", position);
            return;
        }
        if (event.altKey || commandKey) {
            return;
        }

        const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
        const atEnd = input.selectionStart === input.value.length &&
            input.selectionEnd === input.value.length;
        if (event.key === "ArrowLeft" && atStart) {
            event.preventDefault();
            if (position.slotIndex > 0) {
                focusStrongSlot(position.lineIndex, position.slotIndex - 1);
            } else if (position.lineIndex > 0) {
                focusStrongSlot(
                    position.lineIndex - 1,
                    draft.lines[position.lineIndex - 1].slots.length - 1
                );
            }
        } else if (event.key === "ArrowRight" && atEnd) {
            event.preventDefault();
            if (position.slotIndex < draft.lines[position.lineIndex].slots.length - 1) {
                focusStrongSlot(position.lineIndex, position.slotIndex + 1);
            } else if (position.lineIndex < draft.lines.length - 1) {
                focusStrongSlot(position.lineIndex + 1, 0);
            }
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            focusStrongSlot(position.lineIndex - 1, position.slotIndex);
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            focusStrongSlot(position.lineIndex + 1, position.slotIndex);
        } else if (event.key === "Enter") {
            event.preventDefault();
            focusStrongSlot(position.lineIndex + 1, position.slotIndex);
        } else if (event.key === "Backspace" && atStart && !input.value) {
            event.preventDefault();
            if (position.slotIndex > 0) {
                focusStrongSlot(position.lineIndex, position.slotIndex - 1);
            }
        }
    }

    function bindEvents() {
        elements.composition.addEventListener("compositionstart", () => {
            state.composing = true;
        });
        elements.composition.addEventListener("compositionend", () => {
            state.composing = false;
            scheduleAnalysis();
        });
        elements.composition.addEventListener("input", scheduleAnalysis);
        elements.composition.addEventListener("scroll", syncScroll, { passive: true });
        elements.composition.addEventListener("click", updateActiveFromCaret);
        elements.composition.addEventListener("keyup", updateActiveFromCaret);
        elements.composition.addEventListener("select", updateActiveFromCaret);
        document.addEventListener("selectionchange", () => {
            if (document.activeElement === elements.composition) {
                updateActiveFromCaret();
            }
        });

        elements.language.addEventListener("change", () => {
            state.language = elements.language.value;
            localStorage.setItem(LANGUAGE_KEY, state.language);
            updateLanguage();
            scheduleSave();
        });

        elements["new-draft"].addEventListener("click", clearDraft);
        elements.copy.addEventListener("click", () => copyText(authoredCompositionText()));
        elements.share.addEventListener("click", () => elements["share-dialog"].showModal());
        elements["dialog-copy"].addEventListener("click", () => copyText(shareText()));
        elements["copy-analysis-url"].addEventListener("click", () =>
            copyText(analysisUrl(), "analysisLinkCopied"));
        elements["system-share"].addEventListener("click", systemShare);
        elements["twitter-share"].addEventListener("click", openTwitterShare);
        elements["facebook-share"].addEventListener("click", openFacebookShare);

        elements["previous-stanza"].addEventListener("click", () =>
            setActiveStanza(state.activeStanzaIndex - 1, true));
        elements["next-stanza"].addEventListener("click", () =>
            setActiveStanza(state.activeStanzaIndex + 1, true));

        elements["meter-search"].addEventListener("input", () =>
            filterMeterOptions(elements["meter-search"].value));
        elements["meter-select"].addEventListener("change", () =>
            selectMeter(elements["meter-select"].value));
        elements["clear-meter"].addEventListener("click", () => selectMeter(""));
        elements["show-template"].addEventListener("change", () => {
            if (!state.analysis ||
                !state.analysis.stanzas[state.activeStanzaIndex] ||
                !state.analysis.stanzas[state.activeStanzaIndex].selectedMeter) {
                elements["show-template"].checked = false;
                return;
            }
            if (elements["show-template"].checked) {
                setTemplateMode(state.activeStanzaIndex, "ghost");
            } else {
                if (templateMode(state.activeStanzaIndex) === "strong") {
                    const meterId = state.selections[state.activeStanzaIndex];
                    commitStrongDraftToComposition(state.activeStanzaIndex, meterId);
                    setTemplateMode(state.activeStanzaIndex, "off");
                    runAnalysis();
                    return;
                }
                setTemplateMode(state.activeStanzaIndex, "off");
            }
            renderOverlay();
            renderAnalysisPanel();
            scheduleSave();
        });
        elements["template-mode-ghost"].addEventListener("change", () => {
            if (!elements["template-mode-ghost"].checked) {
                return;
            }
            const meterId = state.selections[state.activeStanzaIndex];
            if (templateMode(state.activeStanzaIndex) === "strong") {
                commitStrongDraftToComposition(state.activeStanzaIndex, meterId);
            }
            setTemplateMode(state.activeStanzaIndex, "ghost");
            runAnalysis();
        });
        elements["template-mode-strong"].addEventListener("change", () => {
            if (!elements["template-mode-strong"].checked) {
                return;
            }
            if (!state.analysis ||
                state.analysis.text !== elements.composition.value) {
                runAnalysis();
            }
            const stanza = state.analysis &&
                state.analysis.stanzas[state.activeStanzaIndex];
            const meter = stanza && meterForId(stanza.selectedMeterId);
            if (!stanza || !supportsStrongTemplate(meter)) {
                elements["template-mode-ghost"].checked = true;
                return;
            }
            const existingDraft = strongDraftFor(stanza, meter, false);
            if (existingDraft &&
                ChandasStrongTemplate.serializeDraft(existingDraft) !== stanza.text) {
                pushStrongHistory(
                    strongDraftKey(stanza.index, meter.id),
                    existingDraft
                );
                ChandasStrongTemplate.synchronizeFixedDraft(existingDraft, stanza);
            }
            setTemplateMode(state.activeStanzaIndex, "strong");
            strongDraftFor(stanza, meter, true);
            renderOverlay();
            renderAnalysisPanel();
            scheduleSave();
            requestAnimationFrame(() => focusStrongSlot(0, 0));
        });
        elements["strong-template-lines"].addEventListener("beforeinput", (event) => {
            const input = event.target.closest(".strong-template-slot");
            const context = activeStrongContext();
            const draft = activeStrongDraft(false);
            if (!input || !context || !draft || state.strongComposing ||
                event.inputType === "historyUndo" ||
                event.inputType === "historyRedo") {
                return;
            }
            pushStrongHistory(context.key, draft);
        });
        elements["strong-template-lines"].addEventListener("input", (event) => {
            const input = event.target.closest(".strong-template-slot");
            if (input) {
                updateStrongInput(input);
            }
        });
        elements["strong-template-lines"].addEventListener("compositionstart", () => {
            const context = activeStrongContext();
            const draft = activeStrongDraft(false);
            if (context && draft) {
                state.strongCompositionSnapshot =
                    ChandasStrongTemplate.cloneSlots(draft);
                state.strongComposing = true;
            }
        });
        elements["strong-template-lines"].addEventListener("compositionend", (event) => {
            const input = event.target.closest(".strong-template-slot");
            const context = activeStrongContext();
            const draft = activeStrongDraft(false);
            state.strongComposing = false;
            if (input && context && draft) {
                pushStrongHistory(
                    context.key,
                    draft,
                    state.strongCompositionSnapshot
                );
                state.strongCompositionSnapshot = null;
                updateStrongInput(input);
            }
        });
        elements["strong-template-lines"].addEventListener("paste", (event) => {
            const input = event.target.closest(".strong-template-slot");
            if (input) {
                handleStrongPaste(event, input);
            }
        });
        elements["strong-template-lines"].addEventListener("keydown", (event) => {
            const input = event.target.closest(".strong-template-slot");
            if (input) {
                handleStrongKeydown(event, input);
            }
        });
        elements["strong-template-lines"].addEventListener("focusin", (event) => {
            const input = event.target.closest(".strong-template-slot");
            if (input) {
                renderStrongCursorMetrics(input);
            }
        });
        elements["strong-template-lines"].addEventListener("keyup", (event) => {
            const input = event.target.closest(".strong-template-slot");
            if (input) {
                renderStrongCursorMetrics(input);
            }
        });
        window.addEventListener("beforeunload", saveDraft);
    }

    async function initialize() {
        cacheElements();
        const preferredLanguage = localStorage.getItem(LANGUAGE_KEY);
        if (preferredLanguage && messages[preferredLanguage]) {
            state.language = preferredLanguage;
        } else if (navigator.language && navigator.language.toLowerCase().startsWith("kn")) {
            state.language = "kn";
        }

        bindEvents();
        restoreDraft();
        updateLanguage();
        renderPlainOverlay();

        try {
            await loadCatalog();
            runAnalysis();
        } catch (error) {
            console.error(error);
            showToast(t("catalogError"));
            state.catalog = { metres: [] };
            runAnalysis();
        }
        importFromUrl();

        if ("serviceWorker" in navigator &&
            location.protocol !== "file:" &&
            location.hostname !== "appassets.androidplatform.net") {
            navigator.serviceWorker.register("service-worker.js").catch((error) => {
                console.warn("Service worker registration failed", error);
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
}());
