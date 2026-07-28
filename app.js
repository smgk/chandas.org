(function chandasApp() {
    "use strict";

    const DRAFT_KEY = "chandas.draft.v1";
    const LANGUAGE_KEY = "chandas.language.v1";
    const SAVE_DELAY_MS = 280;

    const messages = {
        en: {
            skip: "Skip to composition",
            brandTagline: "say it in-verse",
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
            wholeVerseTemplate: "Whole verse template",
            templateLine: "Line {number}",
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
            shared: "Share sheet opened",
            facebookCopied: "Text copied; paste it into your Facebook post.",
            shareUnavailable: "Sharing is unavailable; the text was copied instead.",
            clearConfirm: "Clear this local draft and begin a new composition?",
            catalogError: "The meter catalog could not be loaded.",
            noResults: "No matching meters",
            previousStanza: "Previous stanza",
            nextStanza: "Next stanza"
        },
        kn: {
            skip: "ರಚನೆಗೆ ಹೋಗಿ",
            brandTagline: "ಪದ್ಯದಲ್ಲಿ ಹೇಳಿ",
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
            wholeVerseTemplate: "ಪೂರ್ಣ ಪದ್ಯದ ಮಾದರಿ",
            templateLine: "ಸಾಲು {number}",
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
            shared: "ಹಂಚಿಕೆ ತೆರೆಯಲಾಗಿದೆ",
            facebookCopied: "ಪಠ್ಯ ನಕಲಾಗಿದೆ; Facebook ಪೋಸ್ಟ್‌ಗೆ ಅಂಟಿಸಿ.",
            shareUnavailable: "ಹಂಚಿಕೆ ಲಭ್ಯವಿಲ್ಲ; ಪಠ್ಯವನ್ನು ನಕಲಿಸಲಾಗಿದೆ.",
            clearConfirm: "ಈ ಸ್ಥಳೀಯ ಕರಡನ್ನು ಅಳಿಸಿ ಹೊಸ ರಚನೆ ಆರಂಭಿಸಬೇಕೆ?",
            catalogError: "ಛಂದಸ್ಸಿನ ಪಟ್ಟಿ ತೆರೆಯಲಾಗಲಿಲ್ಲ.",
            noResults: "ಹೊಂದುವ ಛಂದಸ್ಸುಗಳಿಲ್ಲ",
            previousStanza: "ಹಿಂದಿನ ಪದ್ಯ",
            nextStanza: "ಮುಂದಿನ ಪದ್ಯ"
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
        activeStanzaIndex: 0,
        language: "en",
        composing: false,
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
            "whole-verse-template",
            "validation-summary", "share-dialog",
            "include-meter", "include-link", "system-share", "twitter-share",
            "facebook-share", "dialog-copy", "toast"
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

    function structuralPadaGuide(meter, padaIndex, pada, script, wholeLine) {
        if (meter.kind === "matra") {
            const groups = meter.padaGroups && meter.padaGroups[padaIndex];
            if (!groups) {
                return "";
            }
            const target = groups.reduce((sum, value) => sum + value, 0);
            return wholeLine
                ? `${t("matraShort")} ${target} · ${groups.join("|")}`
                : `${t("matraShort")} ${pada ? pada.matras : 0}/${target} · ` +
                    groups.join("|");
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
        const meter = stanza && state.templates[state.activeStanzaIndex]
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
        heading.textContent = t("wholeVerseTemplate");

        const lines = document.createElement("span");
        lines.className = "whole-template-lines";
        for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
            const row = document.createElement("span");
            row.className = "whole-template-line";

            const label = document.createElement("span");
            label.className = "whole-template-line-label";
            label.textContent = t("templateLine", { number: lineIndex + 1 });

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

        container.setAttribute("aria-label", t("wholeVerseTemplate"));
        container.replaceChildren(heading, lines);
        container.hidden = false;
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
        const pada = padas[padas.length - 1];
        return pada
            ? structuralPadaGuide(meter, pada.index, pada, line.script, false)
            : "";
    }

    function buildOverlayAnnotations() {
        const byPosition = new Map();

        for (const stanza of state.analysis ? state.analysis.stanzas : []) {
            const templateMeter = state.templates[stanza.index]
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

        const ranges = [
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
        ].sort((left, right) => left.start - right.start || left.end - right.end);
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
        const nextSelections = {};
        const nextTemplates = {};
        const usedOld = new Set();

        newStanzas.forEach((newStanza, newIndex) => {
            const exactIndex = oldStanzas.findIndex((oldStanza, oldIndex) =>
                !usedOld.has(oldIndex) &&
                oldStanza.text.trim() === newStanza.text.trim());
            if (exactIndex >= 0) {
                if (oldSelections[exactIndex]) {
                    nextSelections[newIndex] = oldSelections[exactIndex];
                }
                if (oldTemplates[exactIndex]) {
                    nextTemplates[newIndex] = true;
                }
                usedOld.add(exactIndex);
            }
        });

        const oldActive = stanzaAtOffset(oldStanzas, caretOffset);
        const newActive = stanzaAtOffset(newStanzas, caretOffset);
        if (!nextSelections[newActive] && oldSelections[oldActive]) {
            nextSelections[newActive] = oldSelections[oldActive];
        }
        if (!nextTemplates[newActive] && oldTemplates[oldActive]) {
            nextTemplates[newActive] = true;
        }

        state.selections = nextSelections;
        state.templates = nextTemplates;
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
            renderWholeVerseTemplate();
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
        elements["show-template"].checked = Boolean(state.templates[state.activeStanzaIndex]);
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
        if (meterId) {
            state.selections[state.activeStanzaIndex] = meterId;
        } else {
            delete state.selections[state.activeStanzaIndex];
            delete state.templates[state.activeStanzaIndex];
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
            version: 2,
            text: elements.composition.value,
            selections: state.selections,
            templates: state.templates,
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
            if (!draft || ![1, 2].includes(draft.version) ||
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
            if (draft.language && messages[draft.language]) {
                state.language = draft.language;
            }
            requestAnimationFrame(() => {
                const start = Math.min(draft.selectionStart || 0, draft.text.length);
                const end = Math.min(draft.selectionEnd || start, draft.text.length);
                elements.composition.setSelectionRange(start, end);
            });
            if (draft.text) {
                showToast(t("restored"));
            }
        } catch (error) {
            localStorage.removeItem(DRAFT_KEY);
        }
    }

    function clearDraft() {
        if (elements.composition.value && !window.confirm(t("clearConfirm"))) {
            return;
        }
        window.clearTimeout(state.saveTimer);
        localStorage.removeItem(DRAFT_KEY);
        elements.composition.value = "";
        state.selections = {};
        state.templates = {};
        state.analysis = null;
        state.activeStanzaIndex = 0;
        renderPlainOverlay();
        renderCursorMetrics();
        renderAnalysisPanel();
        elements["draft-state"].textContent = t("savedLocally");
        elements.composition.focus();
    }

    async function copyText(text) {
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
            showToast(t("copied"));
            return true;
        } catch (error) {
            showToast(t("copyFailed"));
            return false;
        }
    }

    function shareText() {
        let text = elements.composition.value;
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
        elements.copy.addEventListener("click", () => copyText(elements.composition.value));
        elements.share.addEventListener("click", () => elements["share-dialog"].showModal());
        elements["dialog-copy"].addEventListener("click", () => copyText(shareText()));
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
                state.templates[state.activeStanzaIndex] = true;
            } else {
                delete state.templates[state.activeStanzaIndex];
            }
            renderOverlay();
            renderWholeVerseTemplate();
            scheduleSave();
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
