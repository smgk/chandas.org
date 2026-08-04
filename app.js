/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function chandasApp() {
    "use strict";

    const DRAFT_KEY = "chandas.draft.v1";
    const LANGUAGE_KEY = "chandas.language.v1";
    const SAVE_DELAY_MS = 280;
    const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

    const messages = {
        en: {
            skip: "Skip to composition",
            brandTagline: "say it in-verse",
            learn: "Learn",
            savedPoems: "Saved poems",
            onThisDevice: "On this device",
            savedPoemsNote: "These poems never leave this device unless you export or share them. Keep a backup before clearing browser or app data.",
            searchSavedPoems: "Search saved poems",
            saveBackup: "Save all to .txt",
            downloadBackup: "Full backup",
            importBackup: "Restore full backup",
            exportHelp: "The text export is for reading and copying. Use Full backup to restore your complete Chandas workspace.",
            noSavedPoems: "No saved poems yet. Your next line will fix that.",
            savedPoemCount: "{count} saved poem(s)",
            openPoem: "Open",
            renamePoem: "Rename",
            duplicatePoem: "Duplicate",
            deletePoem: "Delete",
            saveName: "Save name",
            cancel: "Cancel",
            activePoem: "Current",
            untitledPoem: "Untitled poem",
            poemCopySuffix: "copy",
            deletePoemConfirm: "Delete this saved poem from this device?",
            backupDownloaded: "Full backup downloaded",
            backupShared: "Full backup share sheet opened",
            poemsDownloaded: "Readable poems downloaded",
            poemsShared: "Readable poems share sheet opened",
            poemsFileTitle: "CHANDAS POEMS",
            exportedAtLabel: "Exported",
            lastEditedLabel: "Last edited",
            metersLabel: "Selected meters",
            noSelectedMeters: "None",
            backupImported: "Imported {added}; kept {conflicts} conflict copy/copies; skipped {skipped} duplicate(s).",
            backupInvalid: "That file is not a valid Chandas backup.",
            localStorageUnavailable: "Saved Poems is unavailable, but the current draft will still recover locally.",
            language: "Interface language",
            newDraft: "New",
            updateAvailable: "Update available",
            updating: "Updating…",
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
            prasaMatchLegend: "Prāsa found",
            prasaMismatchLegend: "Prāsa mismatch",
            openingWeightLegend: "Opening weight mismatch",
            syllableShort: "S",
            matraShort: "M",
            cursorMetrics: "Syllable {syllable} · Mātrās {matras}",
            cursorMetricsLabel: "Counts from the beginning of the line to the cursor",
            stanzaHelp: "Leave a blank line between stanzas.",
            activeStanza: "Active stanza",
            stanza: "Stanza {number} of {total}",
            analysisEmpty: "Your meter suggestions will appear here.",
            chooseMeterFirst: "Choose a meter or begin writing",
            pattern: "Current pattern",
            matras: "Mātrās by pāda",
            scansion: "Scansion",
            scansionAuto: "Auto",
            scansionWeights: "Guru–laghu",
            scansionAmsha: "Aṃśagaṇa · V/B/R",
            scansionMatra35: "Mātrā gait · 3+5",
            scansionMatra53: "Mātrā gait · 5+3",
            scansionOff: "Off",
            detectShithilaDvitva: "Detect shithila dvitva",
            shithilaApplied: "{count} śithila-dvitva realization(s) marked *.",
            realizedAmsha: "Realized aṃśa: {scan}",
            recitalSubstitutions: "{count} reviewed recital-dependent gaṇa substitution(s) are shown in the realized aṃśa scan.",
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
            exactPada: "Exact pāda",
            exactUnit: "Unit fits",
            strongPrefix: "Strong prefix",
            earlyPossibility: "Early possibility",
            commonMeter: "Common",
            syllableProgress: "{observed}/{expected} syllables",
            padaProgress: "{completed}/{expected} pādas",
            unitProgress: "{completed}/{expected} units",
            compatible: "Possible",
            approximate: "Closest",
            selected: "Selected",
            noMeterSelected: "Choose a meter to check this stanza.",
            meterReady: "{meter} is ready. Start typing when the line arrives.",
            validMeter: "This stanza follows {meter}.",
            sungExtensionsValid: "{meter} fits with {count} sung extension(s), marked ಽ.",
            karshanaValid: "{meter} fits; {count} recital lengthening(s) are marked ಽ.",
            karshanaAmbiguousValid: "{meter} fits; {count} certain recital lengthening(s) are marked ಽ. {ambiguous} line(s) have alternate gaṇa divisions.",
            detectedKarshana: "Detected {meter}; {count} recital lengthening(s) are marked ಽ. Select it to validate.",
            detectedKarshanaAmbiguous: "Detected {meter}; {count} certain recital lengthening(s) are marked ಽ. {ambiguous} line(s) have alternate gaṇa divisions; select the meter to validate.",
            validationIssues: "{violations} mismatched and {missing} missing syllables for {meter}.",
            incompleteMeter: "{meter} is still possible; {missing} metrical units remain.",
            supportedRulesValid: "This stanza follows the supported rules for {meter}.",
            uncheckedRulesValid: "This stanza follows the encoded rhythm for {meter}; {rules} is not checked yet.",
            uncheckedRulesValidPlural: "This stanza follows the encoded rhythm for {meter}; {rules} are not checked yet.",
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
            urlStrongFallback: "This meter currently supports Ghost guidance only.",
            prasaHeading: "Prāsa",
            "dvitiyakshara-prasa": "Dvitīyākṣara-prāsa",
            "antya-prasa": "Antya-prāsa",
            "adi-prasa": "Ādi-prāsa",
            prasaMatches: "{type} matches on {key}.",
            prasaMismatches: "{type}: {count} mismatch(es).",
            automaticPrasaMatches: "Automatic Kannada-script {type} matches on {key}.",
            automaticPrasaMismatches: "Automatic Kannada-script {type}: {count} mismatch(es).",
            prasaWeightMismatches: "The first syllable’s Guru/Laghu weight differs in {count} place(s).",
            adiPrasaFound: "Ādi-prāsa found on {key}."
        },
        kn: {
            skip: "ರಚನೆಗೆ ಹೋಗಿ",
            brandTagline: "ಪದ್ಯದಲ್ಲಿ ಹೇಳಿ",
            learn: "ಕಲಿಯಿರಿ",
            savedPoems: "ಉಳಿಸಿದ ಪದ್ಯಗಳು",
            onThisDevice: "ಈ ಸಾಧನದಲ್ಲಿ",
            savedPoemsNote: "ನೀವು ರಫ್ತು ಅಥವಾ ಹಂಚಿಕೆ ಮಾಡದ ಹೊರತು ಈ ಪದ್ಯಗಳು ಸಾಧನದಿಂದ ಹೊರಹೋಗುವುದಿಲ್ಲ. ಬ್ರೌಸರ್ ಅಥವಾ ಆ್ಯಪ್ ದತ್ತಾಂಶ ಅಳಿಸುವ ಮೊದಲು ಬ್ಯಾಕಪ್ ಇಟ್ಟುಕೊಳ್ಳಿ.",
            searchSavedPoems: "ಉಳಿಸಿದ ಪದ್ಯಗಳನ್ನು ಹುಡುಕಿ",
            saveBackup: "ಎಲ್ಲ ಪದ್ಯಗಳನ್ನು .txtಗೆ ಉಳಿಸಿ",
            downloadBackup: "ಸಂಪೂರ್ಣ ಬ್ಯಾಕಪ್",
            importBackup: "ಸಂಪೂರ್ಣ ಬ್ಯಾಕಪ್ ಮರುಸ್ಥಾಪಿಸಿ",
            exportHelp: "ಓದಲು ಮತ್ತು ನಕಲಿಸಲು ಪಠ್ಯ ರಫ್ತು ಬಳಸಿ. ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಛಂದಸ್ ಕೆಲಸವನ್ನು ಮರುಸ್ಥಾಪಿಸಲು ಸಂಪೂರ್ಣ ಬ್ಯಾಕಪ್ ಬಳಸಿ.",
            noSavedPoems: "ಇನ್ನೂ ಪದ್ಯಗಳು ಉಳಿದಿಲ್ಲ. ನಿಮ್ಮ ಮುಂದಿನ ಸಾಲು ಅದನ್ನು ಸರಿಪಡಿಸುತ್ತದೆ.",
            savedPoemCount: "ಉಳಿಸಿದ ಪದ್ಯಗಳು: {count}",
            openPoem: "ತೆರೆಯಿರಿ",
            renamePoem: "ಹೆಸರು ಬದಲಿಸಿ",
            duplicatePoem: "ಪ್ರತಿ ಮಾಡಿ",
            deletePoem: "ಅಳಿಸಿ",
            saveName: "ಹೆಸರು ಉಳಿಸಿ",
            cancel: "ರದ್ದು",
            activePoem: "ಪ್ರಸ್ತುತ",
            untitledPoem: "ಹೆಸರಿಲ್ಲದ ಪದ್ಯ",
            poemCopySuffix: "ಪ್ರತಿ",
            deletePoemConfirm: "ಈ ಸಾಧನದಿಂದ ಈ ಪದ್ಯವನ್ನು ಅಳಿಸಬೇಕೆ?",
            backupDownloaded: "ಸಂಪೂರ್ಣ ಬ್ಯಾಕಪ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ",
            backupShared: "ಸಂಪೂರ್ಣ ಬ್ಯಾಕಪ್ ಹಂಚಿಕೆ ತೆರೆಯಲಾಗಿದೆ",
            poemsDownloaded: "ಓದಲು ಸುಲಭವಾದ ಪದ್ಯಗಳು ಡೌನ್‌ಲೋಡ್ ಆಗಿವೆ",
            poemsShared: "ಪದ್ಯಗಳ ಹಂಚಿಕೆ ತೆರೆಯಲಾಗಿದೆ",
            poemsFileTitle: "ಛಂದಸ್ ಪದ್ಯಗಳು",
            exportedAtLabel: "ರಫ್ತು ಮಾಡಿದ ಸಮಯ",
            lastEditedLabel: "ಕೊನೆಯ ಬದಲಾವಣೆ",
            metersLabel: "ಆಯ್ದ ಛಂದಸ್ಸುಗಳು",
            noSelectedMeters: "ಯಾವುದೂ ಇಲ್ಲ",
            backupImported: "{added} ಆಮದು; {conflicts} ಭಿನ್ನ ಪ್ರತಿಗಳು ಉಳಿದವು; {skipped} ನಕಲುಗಳನ್ನು ಬಿಟ್ಟಿದೆ.",
            backupInvalid: "ಇದು ಸರಿಯಾದ ಛಂದಸ್ ಬ್ಯಾಕಪ್ ಅಲ್ಲ.",
            localStorageUnavailable: "ಉಳಿಸಿದ ಪದ್ಯಗಳ ಪಟ್ಟಿ ಲಭ್ಯವಿಲ್ಲ; ಪ್ರಸ್ತುತ ಕರಡು ಸ್ಥಳೀಯವಾಗಿ ಮರುಪಡೆಯುತ್ತದೆ.",
            language: "ತೆರೆಯ ಭಾಷೆ",
            newDraft: "ಹೊಸದು",
            updateAvailable: "ನವೀಕರಣ ಲಭ್ಯ",
            updating: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ…",
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
            prasaMatchLegend: "ಪ್ರಾಸ ಹೊಂದಿದೆ",
            prasaMismatchLegend: "ಪ್ರಾಸ ವ್ಯತ್ಯಾಸ",
            openingWeightLegend: "ಮೊದಲ ಅಕ್ಷರದ ಗುರು–ಲಘು ವ್ಯತ್ಯಾಸ",
            syllableShort: "ಅ",
            matraShort: "ಮಾ",
            cursorMetrics: "ಅಕ್ಷರ {syllable} · ಮಾತ್ರೆ {matras}",
            cursorMetricsLabel: "ಸಾಲಿನ ಆರಂಭದಿಂದ ಕರ್ಸರ್‌ವರೆಗಿನ ಎಣಿಕೆ",
            stanzaHelp: "ಪದ್ಯಗಳ ನಡುವೆ ಒಂದು ಖಾಲಿ ಸಾಲು ಬಿಡಿ.",
            activeStanza: "ಪ್ರಸ್ತುತ ಪದ್ಯ",
            stanza: "ಪದ್ಯ {number} / {total}",
            analysisEmpty: "ಛಂದಸ್ಸಿನ ಸೂಚನೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
            chooseMeterFirst: "ಛಂದಸ್ಸನ್ನು ಆರಿಸಿ ಅಥವಾ ಬರೆಯಲು ಆರಂಭಿಸಿ",
            pattern: "ಪ್ರಸ್ತುತ ಗಣ ವಿನ್ಯಾಸ",
            matras: "ಪಾದದ ಮಾತ್ರೆಗಳು",
            scansion: "ಛಂದೋವಿನ್ಯಾಸ",
            scansionAuto: "ಸ್ವಯಂ",
            scansionWeights: "ಗುರು–ಲಘು",
            scansionAmsha: "ಅಂಶಗಣ · V/B/R",
            scansionMatra35: "ಮಾತ್ರಾಗತಿ · 3+5",
            scansionMatra53: "ಮಾತ್ರಾಗತಿ · 5+3",
            scansionOff: "ಬೇಡ",
            detectShithilaDvitva: "ಶಿಥಿಲ ದ್ವಿತ್ವವನ್ನು ಗುರುತಿಸಿ",
            shithilaApplied: "{count} ಶಿಥಿಲ ದ್ವಿತ್ವ ಪ್ರಯೋಗವನ್ನು * ಗುರುತಿಸಿದೆ.",
            realizedAmsha: "ಬಳಕೆಯಾದ ಅಂಶಗಣ: {scan}",
            recitalSubstitutions: "ಬಳಕೆಯಾದ ಅಂಶಗಣದ ವಿನ್ಯಾಸದಲ್ಲಿ ಪರಿಶೀಲಿತ {count} ಗಾಯನಾಧಾರಿತ ಪರ್ಯಾಯ ಗಣಗಳಿವೆ.",
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
            exactPada: "ಪಾದ ಸರಿಯಾಗಿ",
            exactUnit: "ಘಟಕ ಸರಿಯಾಗಿ",
            strongPrefix: "ಬಲವಾದ ಆರಂಭ",
            earlyPossibility: "ಆರಂಭಿಕ ಸಾಧ್ಯತೆ",
            commonMeter: "ಪ್ರಚಲಿತ",
            syllableProgress: "{observed}/{expected} ಅಕ್ಷರಗಳು",
            padaProgress: "{completed}/{expected} ಪಾದಗಳು",
            unitProgress: "{completed}/{expected} ಘಟಕಗಳು",
            compatible: "ಸಾಧ್ಯ",
            approximate: "ಸಮೀಪ",
            selected: "ಆಯ್ಕೆ",
            noMeterSelected: "ಈ ಪದ್ಯವನ್ನು ಪರೀಕ್ಷಿಸಲು ಛಂದಸ್ಸನ್ನು ಆರಿಸಿ.",
            meterReady: "{meter} ಸಿದ್ಧವಾಗಿದೆ. ಪದ್ಯ ಹೊಳೆದಾಗ ಬರೆಯಲು ಆರಂಭಿಸಿ.",
            validMeter: "ಈ ಪದ್ಯವು {meter} ಛಂದಸ್ಸಿಗೆ ಹೊಂದುತ್ತದೆ.",
            sungExtensionsValid: "{meter}ಗೆ {count} ಗಾಯನ ವಿಸ್ತರಣೆಗಳು ಹೊಂದುತ್ತವೆ; ಅವನ್ನು ಽ ಗುರುತಿಸಿದೆ.",
            karshanaValid: "{meter} ಹೊಂದುತ್ತದೆ; {count} ಕರ್ಷಣಗಳನ್ನು ಽ ಗುರುತಿಸಿದೆ.",
            karshanaAmbiguousValid: "{meter} ಹೊಂದುತ್ತದೆ; ಖಚಿತವಾದ {count} ಕರ್ಷಣಗಳನ್ನು ಽ ಗುರುತಿಸಿದೆ. {ambiguous} ಸಾಲುಗಳಿಗೆ ಪರ್ಯಾಯ ಗಣವಿಭಾಗಗಳಿವೆ.",
            detectedKarshana: "{meter} ಪತ್ತೆಯಾಗಿದೆ; {count} ಕರ್ಷಣಗಳನ್ನು ಽ ಗುರುತಿಸಿದೆ. ಪರಿಶೀಲಿಸಲು ಛಂದಸ್ಸನ್ನು ಆರಿಸಿ.",
            detectedKarshanaAmbiguous: "{meter} ಪತ್ತೆಯಾಗಿದೆ; ಖಚಿತವಾದ {count} ಕರ್ಷಣಗಳನ್ನು ಽ ಗುರುತಿಸಿದೆ. {ambiguous} ಸಾಲುಗಳಿಗೆ ಪರ್ಯಾಯ ಗಣವಿಭಾಗಗಳಿವೆ; ಪರಿಶೀಲಿಸಲು ಛಂದಸ್ಸನ್ನು ಆರಿಸಿ.",
            validationIssues: "{meter}: {violations} ವ್ಯತ್ಯಾಸ, {missing} ಕೊರತೆಯ ಅಕ್ಷರಗಳು.",
            incompleteMeter: "{meter} ಇನ್ನೂ ಸಾಧ್ಯ; {missing} ಛಂದೋಘಟಕಗಳು ಬಾಕಿಯಿವೆ.",
            supportedRulesValid: "ಈ ಪದ್ಯವು {meter}ಗಾಗಿ ಬೆಂಬಲಿತ ನಿಯಮಗಳಿಗೆ ಹೊಂದುತ್ತದೆ.",
            uncheckedRulesValid: "ಈ ಪದ್ಯವು {meter}ಯ ಲಯದ ನಿಯಮಗಳಿಗೆ ಹೊಂದುತ್ತದೆ; {rules} ಇನ್ನೂ ಪರಿಶೀಲಿಸಿಲ್ಲ.",
            uncheckedRulesValidPlural: "ಈ ಪದ್ಯವು {meter}ಯ ಲಯದ ನಿಯಮಗಳಿಗೆ ಹೊಂದುತ್ತದೆ; {rules} ಇನ್ನೂ ಪರಿಶೀಲಿಸಿಲ್ಲ.",
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
            urlStrongFallback: "ಈ ಛಂದಸ್ಸಿಗೆ ಈಗ ಮಂದ ಮಾದರಿ ಮಾತ್ರ ಲಭ್ಯ.",
            prasaHeading: "ಪ್ರಾಸ",
            "dvitiyakshara-prasa": "ದ್ವಿತೀಯಾಕ್ಷರ ಪ್ರಾಸ",
            "antya-prasa": "ಅಂತ್ಯಪ್ರಾಸ",
            "adi-prasa": "ಆದಿಪ್ರಾಸ",
            prasaMatches: "{type} {key} ಅಕ್ಷರದಲ್ಲಿ ಹೊಂದಿದೆ.",
            prasaMismatches: "{type}: {count} ವ್ಯತ್ಯಾಸ.",
            automaticPrasaMatches: "ಕನ್ನಡ ಲಿಪಿಯ ಸ್ವಯಂ ಪರಿಶೀಲನೆ: {type} {key} ಅಕ್ಷರದಲ್ಲಿ ಹೊಂದಿದೆ.",
            automaticPrasaMismatches: "ಕನ್ನಡ ಲಿಪಿಯ ಸ್ವಯಂ ಪರಿಶೀಲನೆ: {type} {count} ಕಡೆ ಭಿನ್ನವಾಗಿದೆ.",
            prasaWeightMismatches: "ಮೊದಲ ಅಕ್ಷರದ ಗುರು–ಲಘು {count} ಕಡೆ ಭಿನ್ನವಾಗಿದೆ.",
            adiPrasaFound: "{key} ಅಕ್ಷರದಲ್ಲಿ ಆದಿಪ್ರಾಸ ಕಂಡಿದೆ."
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
        scansionMode: "auto",
        detectShithilaDvitva: false,
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
        toastTimer: null,
        serviceWorkerRegistration: null,
        waitingServiceWorker: null,
        updateCheckTimer: null,
        updateRequested: false,
        repository: null,
        activePoemId: null,
        activePoemTitle: "",
        activePoemCreatedAt: null,
        activePoemRevision: 0,
        activePoemPersisted: false,
        saveChain: Promise.resolve(),
        savedPoems: [],
        sharingPoem: null
    };

    function cacheElements() {
        [
            "composition", "highlight-layer", "editor-shell", "draft-state", "cursor-metrics",
            "language", "new-draft", "saved-poems", "app-update", "copy", "share", "analysis-title",
            "previous-stanza", "next-stanza", "empty-analysis", "analysis-content",
            "pattern-block", "active-pattern", "active-matras",
            "active-amsha-realization",
            "scansion-mode", "detect-shithila-dvitva",
            "selected-meter-reference", "selected-meter-name",
            "selected-meter-signature", "candidate-list", "meter-picker",
            "suggestion-heading",
            "meter-search", "meter-select", "clear-meter", "show-template",
            "template-mode-picker", "template-mode-ghost", "template-mode-strong",
            "strong-template-availability", "whole-verse-template",
            "strong-template-editor", "strong-template-lines",
            "validation-summary", "prasa-summary", "share-dialog",
            "include-meter", "include-link", "system-share", "twitter-share",
            "facebook-share", "dialog-copy", "copy-analysis-url", "toast",
            "saved-poems-dialog", "close-saved-poems", "saved-poems-search",
            "saved-poems-count", "saved-poems-list", "saved-poems-empty",
            "backup-share", "backup-download", "backup-import", "backup-file"
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
        if (elements["saved-poems-dialog"].open) {
            renderSavedPoems();
        }
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
        const linkVersion = Math.max(1, Number(params.get("v")) || 1);
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
                if (linkVersion < 2) {
                    continue;
                }
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

        const hasShithilaOption = params.has("sd") ||
            params.has("shithilaDvitva");
        const rawShithilaOption = params.has("sd")
            ? params.get("sd")
            : params.get("shithilaDvitva");
        const detectShithilaDvitva = hasShithilaOption
            ? !["0", "false", "off", "no"].includes(
                String(rawShithilaOption || "1").trim().toLocaleLowerCase()
            )
            : null;
        const hasScansionMode = params.has("scan") || params.has("scansion");
        const scansionMode = hasScansionMode
            ? ChandasScansion.normalizeMode(
                params.has("scan") ? params.get("scan") : params.get("scansion")
            )
            : null;
        const consumed = verse !== null || meter !== null || hasTemplate ||
            hasShithilaOption || hasScansionMode ||
            Object.keys(stanzaOptions).length > 0;
        return consumed
            ? {
                verse,
                meter,
                guideMode,
                stanzaOptions,
                detectShithilaDvitva,
                scansionMode
            }
            : null;
    }

    function normalizeImportedVerse(value) {
        return String(value === null || value === undefined ? "" : value)
            .replace(/\r\n?/g, "\n");
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
        const incoming = normalizeImportedVerse(payload.verse);
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

        if (payload.detectShithilaDvitva !== null) {
            state.detectShithilaDvitva = payload.detectShithilaDvitva;
            elements["detect-shithila-dvitva"].checked =
                state.detectShithilaDvitva;
            runAnalysis();
        }
        if (payload.scansionMode !== null) {
            state.scansionMode = payload.scansionMode;
            elements["scansion-mode"].value = state.scansionMode;
            renderOverlay();
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
        if (!targetIndices.length && payload.meter !== null &&
            payload.meter !== undefined) {
            const meter = meterFromUrlToken(payload.meter);
            if (meter) {
                state.selections[0] = meter.id;
                selectionChanged = true;
            } else {
                missingMeter = true;
            }
        }
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
        if (!targetIndices.length && payload.guideMode !== null &&
            payload.guideMode !== undefined && state.selections[0]) {
            const selected = meterForId(state.selections[0]);
            let mode = payload.guideMode;
            if (mode === "strong") {
                mode = "ghost";
                fellBack = true;
            }
            setTemplateMode(0, selected ? mode : "off");
            templateChanged = true;
        }
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

    function strongSourceFrame(stanza, meter) {
        const prefix = elements.composition.value.slice(0, stanza.start);
        const lineCount = Array.isArray(meter.versePatterns)
            ? meter.versePatterns.length
            : Number(meter.linePolicy && meter.linePolicy.count) || 1;
        const trailingBlankRun = prefix.match(/(?:[^\S\n]*\n)+$/);
        if (!trailingBlankRun) {
            return { lineOffset: 0, sourceStart: stanza.start };
        }
        const totalLineBreaks = (trailingBlankRun[0].match(/\n/g) || []).length;
        const hasEarlierText = prefix.slice(0, trailingBlankRun.index).trim().length > 0;
        const stanzaSeparatorBreaks = hasEarlierText ? Math.min(2, totalLineBreaks) : 0;
        const blankLines = Math.max(0, totalLineBreaks - stanzaSeparatorBreaks);
        const lineOffset = Math.min(blankLines, Math.max(0, lineCount - 1));
        const trailingBlankLines = lineOffset
            ? prefix.match(new RegExp(`(?:[^\\S\\n]*\\n){${lineOffset}}$`))
            : null;
        return {
            lineOffset,
            sourceStart: trailingBlankLines
                ? stanza.start - trailingBlankLines[0].length
                : stanza.start
        };
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
        const sourceFrame = strongSourceFrame(stanza, meter);
        const draft = ChandasStrongTemplate.createFixedDraft(meter, stanza, {
            catalogVersion: strongCatalogVersion(),
            analysisVersion: state.analysis && state.analysis.analysisVersion,
            ...sourceFrame
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
                start: Number.isFinite(draft.sourceStart)
                    ? draft.sourceStart
                    : stanza.start,
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
        const sourceStart = Number.isFinite(draft.sourceStart)
            ? draft.sourceStart
            : stanza.start;
        elements.composition.value =
            text.slice(0, sourceStart) + authored + text.slice(stanza.end);
        const caret = sourceStart + authored.length;
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

        function annotationAt(position) {
            const annotation = byPosition.get(position) || {
                position,
                metrics: "",
                ghost: "",
                scansion: [],
                groupStarts: [],
                groupEnds: []
            };
            if (!Array.isArray(annotation.scansion)) {
                annotation.scansion = [];
            }
            if (!Array.isArray(annotation.groupStarts)) {
                annotation.groupStarts = [];
            }
            if (!Array.isArray(annotation.groupEnds)) {
                annotation.groupEnds = [];
            }
            byPosition.set(position, annotation);
            return annotation;
        }

        function addScansionMarker(marker) {
            if (!marker || !Number.isFinite(marker.position)) {
                return;
            }
            const markers = annotationAt(marker.position).scansion;
            if (!markers.some((existing) =>
                existing.kind === marker.kind &&
                Boolean(existing.crossed) === Boolean(marker.crossed))) {
                markers.push(marker);
            }
        }

        function addScansionGroups(rawGroups) {
            const groups = Chandas.projectHighlightRanges(
                elements.composition.value,
                rawGroups
            );
            groups.forEach((group) => {
                annotationAt(group.start).groupStarts.push(group);
                annotationAt(group.end).groupEnds.push(group);
            });
            if (groups.length) {
                addScansionMarker({
                    position: groups[0].start,
                    kind: groups[0].kind,
                    crossed: false
                });
            }
            groups.forEach((group) => addScansionMarker({
                position: group.end,
                kind: group.kind,
                crossed: Boolean(group.crossed)
            }));
        }

        for (const stanza of state.analysis ? state.analysis.stanzas : []) {
            const templateMeter = templateMode(stanza.index) === "ghost"
                ? meterForId(stanza.selectedMeterId)
                : null;

            for (const line of stanza.lines) {
                const lastSyllable = line.syllables[line.syllables.length - 1];
                if (!lastSyllable) {
                    continue;
                }
                const annotation = annotationAt(lastSyllable.end);
                annotation.metrics =
                    `${t("syllableShort")}${line.syllables.length} · ` +
                    `${t("matraShort")}${line.matraCount}`;

                const ghost = ghostGuideForLine(stanza, line, templateMeter);
                if (ghost) {
                    const ghostAnnotation = annotationAt(line.end);
                    ghostAnnotation.ghost = ghost;
                }
            }

            let mode = state.scansionMode;
            if (mode === "auto") {
                mode = (stanza.selectedMeter &&
                    stanza.selectedMeter.kind === "amsha") ||
                    (!stanza.selectedMeter && stanza.detectedAmshaMeter)
                    ? "amsha"
                    : "weights";
            }
            if (mode === "amsha") {
                (stanza.amshaGroupRanges || []).forEach((lineGroups) =>
                    addScansionGroups(ChandasScansion.amshaGroups([lineGroups])));
            } else if (mode === "matra-35" || mode === "matra-53") {
                const cycle = mode === "matra-35" ? [3, 5] : [5, 3];
                stanza.lines.forEach((line) => {
                    const scan = ChandasScansion.scanMatraGait(
                        line.syllables,
                        cycle
                    );
                    addScansionGroups(scan.groups);
                    const lastSyllable = line.syllables.at(-1);
                    if (lastSyllable && scan.residual > 0) {
                        const annotation = annotationAt(lastSyllable.end);
                        annotation.metrics = `${annotation.metrics} · x=${
                            scan.residual}`;
                    }
                });
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
        const scansion = (annotation.scansion || []).map((marker) => {
            const classes = [
                "scansion-boundary",
                `scansion-${marker.kind || "boundary"}`,
                marker.crossed ? "crossed" : ""
            ].filter(Boolean).join(" ");
            return `<span class="${classes}" aria-hidden="true"></span>`;
        }).join("");
        return `<span class="inline-metric-anchor">${metrics}${ghost}${
            scansion}</span>`;
    }

    function scansionGroupOpenHtml(group) {
        const classes = [
            "scansion-group",
            `scansion-group-${group.kind || "unknown"}`,
            group.crossed ? "crossed" : "",
            group.substituted ? "substituted" : ""
        ].filter(Boolean).join(" ");
        return `<span class="${classes}"><span class="scansion-group-label" ` +
            `aria-hidden="true">${escapeHtml(group.label)}</span>`;
    }

    function highlightedRangeHtml(range, text) {
        const highlighted = `<span class="${range.className}">${
            escapeHtml(text.slice(range.start, range.end))
        }</span>`;
        if (!range.recitalMarker && !range.shithilaMarker) {
            return highlighted;
        }
        const markerClass = range.extensionKind === "sung"
            ? "sung-extension-marker"
            : "amsha-karshana-marker";
        const recital = range.recitalMarker
            ? `<span class="recital-extension-marker ${markerClass}" ` +
                `aria-hidden="true">${escapeHtml(range.recitalMarker)}</span>`
            : "";
        const shithila = range.shithilaMarker
            ? `<span class="shithila-dvitva-marker" aria-hidden="true">${
                escapeHtml(range.shithilaMarker)
            }</span>`
            : "";
        return `<span class="recital-extension-anchor">${highlighted}${
            recital}${shithila}</span>`;
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

    function positionScansionLabels() {
        if (!elements["highlight-layer"]) {
            return;
        }
        elements["highlight-layer"].querySelectorAll(".scansion-group")
            .forEach((group) => {
                const label = group.firstElementChild;
                const firstContent = label && label.nextSibling;
                if (!label || !label.classList.contains("scansion-group-label") ||
                    !firstContent) {
                    return;
                }
                label.style.transform = "";
                const fragments = Array.from(group.querySelectorAll(
                    ".guru, .laghu, .uncertain"
                )).map((node) => node.getBoundingClientRect())
                    .filter((rect) => rect.width > 0 && rect.height > 0);
                if (!fragments.length) {
                    return;
                }

                const lines = [];
                fragments.forEach((rect) => {
                    let line = lines.find((item) =>
                        Math.abs(item.top - rect.top) < 1);
                    if (!line) {
                        line = {
                            top: rect.top,
                            left: rect.left,
                            right: rect.right
                        };
                        lines.push(line);
                    } else {
                        line.left = Math.min(line.left, rect.left);
                        line.right = Math.max(line.right, rect.right);
                    }
                });
                const target = lines.sort((left, right) =>
                    (right.right - right.left) - (left.right - left.left))[0];
                const firstLine = lines.sort((left, right) => left.top - right.top)[0];
                const labelRect = label.getBoundingClientRect();
                const targetCenter = target.left + (target.right - target.left) / 2;
                const currentCenter = labelRect.left + labelRect.width / 2;
                const horizontalShift = targetCenter - currentCenter;
                const verticalShift = target.top - firstLine.top;
                label.style.transform = `translateX(-50%) translate(${
                    horizontalShift}px, ${verticalShift}px)`;
            });
    }

    function renderOverlay() {
        const text = elements.composition.value;
        if (!state.analysis || !text) {
            renderPlainOverlay();
            return;
        }

        const ranges = Chandas.projectHighlightRanges(text, [
            ...state.analysis.segments.map((segment) => {
                const prasaClasses = (segment.prasaAnnotations || []).map((annotation) =>
                    annotation.status === "match"
                        ? "prasa-match"
                        : annotation.status === "weight-mismatch"
                            ? "prasa-weight-mismatch"
                            : "prasa-mismatch");
                const extension = segment.recitalExtension ||
                    segment.sungExtension;
                const classificationClass = state.scansionMode === "off"
                    ? ""
                    : segment.classification === Chandas.GURU ? "guru" : "laghu";
                return {
                    start: segment.start,
                    end: segment.end,
                    className: [
                        classificationClass,
                        segment.violation ? "violation" : "",
                        ...prasaClasses
                    ].filter(Boolean).join(" "),
                    recitalMarker: extension
                        ? (extension.marker || "ಽ").repeat(
                            Math.max(1, Number(extension.matras) || 1)
                        )
                        : "",
                    shithilaMarker: segment.shithilaDvitva
                        ? segment.shithilaDvitva.marker || "*"
                        : "",
                    extensionKind: segment.recitalExtension
                        ? "karshana"
                        : "sung"
                };
            }),
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
                for (const group of annotation.groupEnds || []) {
                    html += "</span>";
                }
                for (const group of annotation.groupStarts || []) {
                    html += scansionGroupOpenHtml(group);
                }
                html += annotationHtml(annotation);
            }
        }

        for (const range of ranges) {
            appendAnnotationsThrough(range.start);
            if (range.start < cursor || range.start > text.length) {
                continue;
            }
            html += escapeHtml(text.slice(cursor, range.start));
            html += highlightedRangeHtml(range, text);
            cursor = Math.max(cursor, range.end);
            appendAnnotationsThrough(cursor);
        }
        appendAnnotationsThrough(text.length);
        html += escapeHtml(text.slice(cursor));
        // A final newline ensures matching textarea height and scroll behavior.
        elements["highlight-layer"].innerHTML = `${html}\n`;
        positionScansionLabels();
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
        const previouslyActive = Math.max(
            0,
            Math.min(state.activeStanzaIndex, oldStanzas.length - 1)
        );
        const selectedOldIndex = Object.keys(oldSelections)
            .map(Number)
            .find((index) => Number.isInteger(index) && oldSelections[index]);
        const sourceOldIndex = oldSelections[previouslyActive]
            ? previouslyActive
            : oldSelections[oldActive]
                ? oldActive
                : selectedOldIndex;
        if (sourceOldIndex !== undefined &&
            !nextSelections[newActive] && oldSelections[sourceOldIndex]) {
            copyStanzaState(sourceOldIndex, newActive);
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
        window.clearTimeout(state.renderTimer);
        state.renderTimer = null;
        const text = elements.composition.value;
        const oldStanzas = state.analysis ? state.analysis.stanzas : null;
        const parsedStanzas = Chandas.parseStanzas(text);
        reconcileSelections(oldStanzas, parsedStanzas, elements.composition.selectionStart);

        state.analysis = state.detectShithilaDvitva
            ? ChandasShithilaDvitva.analyzeComposition(
                text,
                state.catalog,
                state.selections,
                { detect: true }
            )
            : Chandas.analyzeComposition(text, state.catalog, state.selections);
        state.activeStanzaIndex = stanzaAtOffset(
            state.analysis.stanzas,
            elements.composition.selectionStart
        );

        if (window.ChandasAnalytics) {
            window.ChandasAnalytics.trackCompositionScripts(state.analysis);
        }

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

    function candidateStatus(candidate, selectedMeterId) {
        if (candidate.id === selectedMeterId) {
            return t("selected");
        }
        if (candidate.matchLevel === "exact-verse") {
            return t("exact");
        }
        if (candidate.matchLevel === "exact-unit") {
            return t(candidate.kind === "fixed" ? "exactPada" : "exactUnit");
        }
        if (candidate.matchLevel === "strong-prefix") {
            return t("strongPrefix");
        }
        if (candidate.matchLevel === "structural-partial") {
            return t("earlyPossibility");
        }
        return t(candidate.status);
    }

    function candidateDetails(candidate) {
        const details = [];
        if (candidate.kind === "fixed" && candidate.expectedSyllables) {
            details.push(t("syllableProgress", {
                observed: candidate.observedSyllables,
                expected: candidate.expectedSyllables
            }));
            if (candidate.completedUnitCount > 0) {
                details.push(t("padaProgress", {
                    completed: candidate.completedUnitCount,
                    expected: candidate.expectedUnitCount
                }));
            }
        } else {
            if (candidate.completedUnitCount > 0 && candidate.expectedUnitCount) {
                details.push(t("unitProgress", {
                    completed: candidate.completedUnitCount,
                    expected: candidate.expectedUnitCount
                }));
            }
            if (candidate.patterns[0]) {
                details.push(candidate.patterns[0]);
            }
        }
        return details;
    }

    function candidateButton(candidate, selectedMeterId, index) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `candidate${candidate.id === selectedMeterId ? " selected" : ""}${index === 0 ? " best-candidate" : ""}`;
        button.dataset.status = candidate.status;
        button.dataset.matchLevel = candidate.matchLevel || candidate.status;
        button.dataset.meterId = candidate.id;
        button.setAttribute("aria-pressed", candidate.id === selectedMeterId ? "true" : "false");

        const identity = document.createElement("span");
        identity.className = "candidate-identity";
        const name = document.createElement("span");
        name.className = "candidate-name";
        name.textContent = candidate.name;
        const nameRow = document.createElement("span");
        nameRow.className = "candidate-name-row";
        nameRow.append(name);
        if (candidate.prominence >= 3) {
            const prominence = document.createElement("small");
            prominence.className = "candidate-prominence";
            prominence.textContent = t("commonMeter");
            nameRow.append(prominence);
        }
        identity.append(nameRow);
        const details = candidateDetails(candidate);
        if (details.length) {
            const detail = document.createElement("small");
            detail.className = "candidate-detail";
            detail.textContent = details.join(" · ");
            identity.append(detail);
        }

        const status = document.createElement("span");
        status.className = "candidate-status";
        status.textContent = candidateStatus(candidate, selectedMeterId);

        button.append(identity, status);
        button.addEventListener("click", () => selectMeter(candidate.id));
        return button;
    }

    function renderAnalysisPanel() {
        const stanzas = state.analysis ? state.analysis.stanzas : [];
        const hasStanzas = stanzas.length > 0;

        elements["detect-shithila-dvitva"].checked =
            state.detectShithilaDvitva;
        elements["scansion-mode"].value = state.scansionMode;

        elements["empty-analysis"].hidden = hasStanzas;
        elements["analysis-content"].hidden = false;
        elements["previous-stanza"].disabled = !hasStanzas || state.activeStanzaIndex <= 0;
        elements["next-stanza"].disabled = !hasStanzas ||
            state.activeStanzaIndex >= stanzas.length - 1;

        if (!hasStanzas) {
            const selectedMeter = meterForId(state.selections[0]);
            elements["analysis-title"].textContent = t("chooseMeterFirst");
            elements["pattern-block"].hidden = true;
            elements["active-amsha-realization"].hidden = true;
            elements["active-amsha-realization"].textContent = "";
            elements["suggestion-heading"].hidden = true;
            elements["candidate-list"].hidden = true;
            elements["candidate-list"].replaceChildren();
            elements["selected-meter-reference"].hidden = !selectedMeter;
            elements["show-template"].checked = false;
            elements["show-template"].disabled = true;
            elements["template-mode-picker"].hidden = true;
            elements["prasa-summary"].hidden = true;
            elements["prasa-summary"].replaceChildren();
            if (selectedMeter) {
                elements["selected-meter-name"].textContent = selectedMeter.name;
                elements["selected-meter-signature"].replaceChildren(
                    ...selectedMeter.patterns.map((pattern, index, patterns) => {
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
            }
            filterMeterOptions(elements["meter-search"].value);
            elements["meter-select"].value = selectedMeter ? selectedMeter.id : "";
            elements["validation-summary"].classList.remove("has-errors");
            elements["validation-summary"].textContent = selectedMeter
                ? t("meterReady", { meter: selectedMeter.name })
                : t("noMeterSelected");
            renderWholeVerseTemplate();
            renderStrongTemplate();
            return;
        }

        elements["pattern-block"].hidden = false;
        elements["suggestion-heading"].hidden = false;
        elements["candidate-list"].hidden = false;
        elements["show-template"].disabled = false;
        const stanza = stanzas[state.activeStanzaIndex];
        elements["analysis-title"].textContent = t("stanza", {
            number: state.activeStanzaIndex + 1,
            total: stanzas.length
        });
        elements["active-pattern"].textContent = stanza.patterns.join(" / ") || "—";
        elements["active-matras"].textContent = stanza.matraPattern.length
            ? `${t("matras")}: ${stanza.matraPattern.join(" | ")}`
            : "";
        const realizedAmsha = (stanza.realizedAmshaScan || [])
            .filter(Boolean);
        elements["active-amsha-realization"].hidden =
            realizedAmsha.length === 0;
        elements["active-amsha-realization"].textContent =
            realizedAmsha.length
                ? t("realizedAmsha", {
                    scan: realizedAmsha.join(" · ")
                })
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

        const candidateScroll = elements["candidate-list"].scrollTop;
        elements["candidate-list"].replaceChildren(
            ...stanza.candidates.slice(0, 8)
                .map((candidate, index) => candidateButton(
                    candidate,
                    stanza.selectedMeterId,
                    index
                ))
        );
        elements["candidate-list"].scrollTop = candidateScroll;

        filterMeterOptions(elements["meter-search"].value);
        elements["meter-select"].value = stanza.selectedMeterId;

        const summary = elements["validation-summary"];
        summary.classList.remove("has-errors");
        if (!stanza.selectedMeter) {
            if (stanza.detectedAmshaMeter &&
                (stanza.karshanaCount || stanza.karshanaAmbiguityCount)) {
                summary.textContent = t(
                    stanza.karshanaAmbiguityCount
                        ? "detectedKarshanaAmbiguous"
                        : "detectedKarshana",
                    {
                        meter: stanza.detectedAmshaMeter.name,
                        count: stanza.karshanaCount,
                        ambiguous: stanza.karshanaAmbiguityCount
                    }
                );
            } else {
                summary.textContent = t("noMeterSelected");
            }
        } else if (stanza.violationCount === 0 && stanza.missingCount === 0) {
            const uncheckedRules = stanza.selectedMeter.uncheckedRules || [];
            if (stanza.karshanaCount || stanza.karshanaAmbiguityCount) {
                summary.textContent = t(
                    stanza.karshanaAmbiguityCount
                        ? "karshanaAmbiguousValid"
                        : "karshanaValid",
                    {
                        meter: stanza.selectedMeter.name,
                        count: stanza.karshanaCount,
                        ambiguous: stanza.karshanaAmbiguityCount
                    }
                );
            } else if (stanza.sungExtensionCount) {
                summary.textContent = t("sungExtensionsValid", {
                    meter: stanza.selectedMeter.name,
                    count: stanza.sungExtensionCount
                });
            } else if (uncheckedRules.length) {
                summary.textContent = t(
                    uncheckedRules.length === 1
                        ? "uncheckedRulesValid"
                        : "uncheckedRulesValidPlural",
                    {
                        meter: stanza.selectedMeter.name,
                        rules: uncheckedRules.join(", ")
                    }
                );
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
        if (stanza.substitutionCount) {
            summary.append(` ${t("recitalSubstitutions", {
                count: stanza.substitutionCount
            })}`);
        }
        if (stanza.shithilaDvitvaCount) {
            summary.append(` ${t("shithilaApplied", {
                count: stanza.shithilaDvitvaCount
            })}`);
        }
        renderPrasaSummary(stanza);
        renderWholeVerseTemplate();
        renderStrongTemplate();
    }

    function renderPrasaSummary(stanza) {
        const output = elements["prasa-summary"];
        const prasa = stanza && stanza.prasa;
        const reports = [
            ...((prasa && prasa.checks) || []).filter((report) =>
                report.status !== "incomplete"),
            ...((prasa && prasa.findings) || [])
        ];
        output.hidden = reports.length === 0;
        output.replaceChildren();
        if (!reports.length) {
            return;
        }

        const heading = document.createElement("strong");
        heading.textContent = t("prasaHeading");
        const list = document.createElement("ul");
        for (const report of reports) {
            const item = document.createElement("li");
            const isAutomaticKannada = report.provenance === "automatic-kannada";
            if (report.type === "adi-prasa" && report.status === "found") {
                item.textContent = t("adiPrasaFound", { key: report.key });
                item.className = "is-match";
            } else if (report.status === "match") {
                item.textContent = t(
                    isAutomaticKannada ? "automaticPrasaMatches" : "prasaMatches",
                    {
                        type: t(report.type),
                        key: report.key
                    }
                );
                item.className = "is-match";
            } else {
                item.textContent = t(
                    isAutomaticKannada ? "automaticPrasaMismatches" : "prasaMismatches",
                    {
                        type: t(report.type),
                        count: report.failures
                    }
                );
                item.className = "is-mismatch";
                if (report.weightFailures) {
                    item.textContent += ` ${t("prasaWeightMismatches", {
                        count: report.weightFailures
                    })}`;
                    item.classList.add("has-weight-mismatch");
                }
            }
            list.append(item);
        }
        output.append(heading, list);
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
            if (meterId) {
                state.selections[0] = meterId;
            } else {
                delete state.selections[0];
                delete state.templates[0];
                delete state.templateModes[0];
            }
            renderAnalysisPanel();
            scheduleSave();
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

    function currentDraftSnapshot() {
        return {
            version: 5,
            poemId: state.activePoemId,
            text: elements.composition.value,
            selections: state.selections,
            templates: state.templates,
            templateModes: state.templateModes,
            strongDrafts: state.strongDrafts,
            scansionMode: state.scansionMode,
            detectShithilaDvitva: state.detectShithilaDvitva,
            language: state.language,
            selectionStart: elements.composition.selectionStart,
            selectionEnd: elements.composition.selectionEnd,
            updatedAt: new Date().toISOString()
        };
    }

    function meaningfulDraft(draft) {
        return Boolean(draft.text || Object.keys(draft.selections).length ||
            Object.keys(draft.templates).length ||
            Object.keys(draft.strongDrafts).length ||
            draft.scansionMode !== "auto" ||
            draft.detectShithilaDvitva);
    }

    function saveDraft() {
        const draft = currentDraftSnapshot();

        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch (error) {
            elements["draft-state"].textContent = t("copyFailed");
        }

        if (!state.repository || !state.activePoemId ||
            (!state.activePoemPersisted && !meaningfulDraft(draft))) {
            elements["draft-state"].textContent = t("savedLocally");
            return Promise.resolve();
        }

        const record = {
            ...draft,
            id: state.activePoemId,
            title: state.activePoemTitle,
            createdAt: state.activePoemCreatedAt || draft.updatedAt
        };
        const baseRevision = state.activePoemRevision;
        state.saveChain = state.saveChain.then(async () => {
            const saved = await state.repository.put({
                ...record,
                revision: baseRevision + 1
            });
            if (saved.id === state.activePoemId) {
                state.activePoemCreatedAt = saved.createdAt;
                state.activePoemRevision = saved.revision;
                state.activePoemPersisted = true;
                await state.repository.setMeta("activePoemId", saved.id);
            }
            elements["draft-state"].textContent = t("savedLocally");
            if (elements["saved-poems-dialog"].open) {
                await refreshSavedPoems();
            }
        }).catch((error) => {
            console.warn("Saved Poems storage failed", error);
            elements["draft-state"].textContent = t("savedLocally");
        });
        return state.saveChain;
    }

    function parseLegacyDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) {
                return null;
            }
            const draft = JSON.parse(raw);
            if (!draft || ![1, 2, 3, 4, 5].includes(draft.version) ||
                typeof draft.text !== "string") {
                return null;
            }
            return draft;
        } catch (error) {
            return null;
        }
    }

    function applyStoredPoem(poem) {
        elements.composition.value = poem.text || "";
        state.selections = poem.selections && typeof poem.selections === "object"
            ? poem.selections
            : {};
        state.templates = poem.templates && typeof poem.templates === "object"
            ? poem.templates
            : {};
        state.templateModes = poem.templateModes &&
            typeof poem.templateModes === "object"
            ? poem.templateModes
            : Object.fromEntries(Object.keys(state.templates).map((key) => [key, "ghost"]));
        state.strongDrafts = poem.strongDrafts && typeof poem.strongDrafts === "object"
            ? poem.strongDrafts
            : {};
        state.scansionMode = ChandasScansion.normalizeMode(poem.scansionMode);
        state.detectShithilaDvitva = poem.detectShithilaDvitva === true;
        state.strongHistory = {};
        state.strongFuture = {};
        state.analysis = null;
        state.activeStanzaIndex = 0;
        if (poem.language && messages[poem.language]) {
            state.language = poem.language;
        }
        state.restoreSelectionFrame = requestAnimationFrame(() => {
            const start = Math.min(poem.selectionStart || 0, elements.composition.value.length);
            const end = Math.min(poem.selectionEnd || start, elements.composition.value.length);
            elements.composition.setSelectionRange(start, end);
            state.restoreSelectionFrame = null;
        });
    }

    async function restoreDraft() {
        const legacy = parseLegacyDraft();
        try {
            state.repository = new ChandasPoemStore.PoemRepository();
            await state.repository.open();
            let activeId = await state.repository.getMeta("activePoemId");
            const migrated = await state.repository.getMeta("legacyDraftMigrated");
            if (legacy && (!migrated || !activeId)) {
                const migratedPoem = ChandasPoemStore.normalizePoem({
                    ...legacy,
                    language: legacy.language || state.language,
                    id: legacy.poemId || ChandasPoemStore.createId()
                });
                await state.repository.put(migratedPoem);
                activeId = migratedPoem.id;
                await state.repository.setMeta("activePoemId", activeId);
                await state.repository.setMeta("legacyDraftMigrated", true);
            } else if (!migrated) {
                await state.repository.setMeta("legacyDraftMigrated", true);
            }
            let poem = activeId ? await state.repository.get(activeId) : null;
            if (!poem) {
                poem = (await state.repository.list())[0] || null;
            }
            if (poem && legacy && legacy.poemId === poem.id &&
                Date.parse(legacy.updatedAt || 0) > Date.parse(poem.updatedAt || 0)) {
                poem = { ...poem, ...legacy, id: poem.id };
            }
            if (poem) {
                state.activePoemId = poem.id;
                state.activePoemTitle = poem.title || "";
                state.activePoemCreatedAt = poem.createdAt;
                state.activePoemRevision = poem.revision || 0;
                state.activePoemPersisted = true;
                applyStoredPoem(poem);
            }
            if (navigator.storage && navigator.storage.persist) {
                navigator.storage.persist().catch(() => {});
            }
        } catch (error) {
            console.warn("Saved Poems is unavailable", error);
            state.repository = null;
            if (legacy) {
                state.activePoemId = legacy.poemId || ChandasPoemStore.createId();
                applyStoredPoem(legacy);
            }
        }
        if (!state.activePoemId) {
            state.activePoemId = ChandasPoemStore.createId();
        }
        if ((legacy && legacy.text) || elements.composition.value) {
            showToast(t("restored"));
        }
    }

    async function clearDraft() {
        window.clearTimeout(state.saveTimer);
        const pendingSave = saveDraft();
        state.activePoemId = ChandasPoemStore.createId();
        state.activePoemTitle = "";
        state.activePoemCreatedAt = null;
        state.activePoemRevision = 0;
        state.activePoemPersisted = false;
        elements.composition.value = "";
        state.selections = {};
        state.templates = {};
        state.templateModes = {};
        state.strongDrafts = {};
        state.scansionMode = "auto";
        state.detectShithilaDvitva = false;
        state.strongHistory = {};
        state.strongFuture = {};
        state.analysis = null;
        state.activeStanzaIndex = 0;
        renderPlainOverlay();
        renderCursorMetrics();
        renderAnalysisPanel();
        saveDraft();
        await pendingSave;
        if (state.repository) {
            await state.repository.setMeta("activePoemId", state.activePoemId);
        }
        if (elements["saved-poems-dialog"].open) {
            elements["saved-poems-dialog"].close();
        }
        elements["draft-state"].textContent = t("savedLocally");
        elements.composition.focus();
    }

    function analysisUrl() {
        if (state.sharingPoem) {
            return savedPoemAnalysisUrl(state.sharingPoem);
        }
        const url = new URL("https://chandas.org/");
        url.searchParams.set("v", "3");
        url.searchParams.set("verse", authoredCompositionText());
        if (state.detectShithilaDvitva) {
            url.searchParams.set("sd", "1");
        }
        if (state.scansionMode !== "auto") {
            url.searchParams.set("scan", state.scansionMode);
        }
        const stanzas = state.analysis ? state.analysis.stanzas : [];
        if (!stanzas.length && state.selections[0]) {
            url.searchParams.set("meter", state.selections[0]);
        }
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

    function savedPoemAnalysisUrl(poem) {
        const url = new URL("https://chandas.org/");
        url.searchParams.set("v", "3");
        url.searchParams.set("verse", poem.text);
        if (poem.detectShithilaDvitva === true) {
            url.searchParams.set("sd", "1");
        }
        const scansionMode = ChandasScansion.normalizeMode(poem.scansionMode);
        if (scansionMode !== "auto") {
            url.searchParams.set("scan", scansionMode);
        }
        const stanzaIndexes = new Set([
            ...Object.keys(poem.selections || {}),
            ...Object.keys(poem.templateModes || {}),
            ...Object.keys(poem.templates || {}),
            ...Object.keys(poem.strongDrafts || {}).map((key) => key.split(":")[0])
        ]);
        Array.from(stanzaIndexes).map(Number).filter(Number.isInteger)
            .sort((a, b) => a - b).forEach((index) => {
                const meterId = poem.selections && poem.selections[index];
                if (meterId) {
                    url.searchParams.set(`meter${index + 1}`, meterId);
                }
                const mode = poem.templateModes && poem.templateModes[index] ||
                    (poem.templates && poem.templates[index] ? "ghost" : "off");
                if (mode !== "off") {
                    url.searchParams.set(`template${index + 1}`, mode);
                }
                if (mode === "strong" && meterId) {
                    const draft = poem.strongDrafts && poem.strongDrafts[
                        strongDraftKey(index, meterId)
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
        const savedPoem = state.sharingPoem;
        let text = savedPoem ? savedPoem.text : authoredCompositionText();
        if (elements["include-meter"].checked) {
            const meterNames = savedPoem
                ? Array.from(new Set(Object.values(savedPoem.selections || {})))
                    .filter(Boolean)
                    .map((meterId) => {
                        const meter = meterForId(meterId);
                        return meter ? meter.name : meterId;
                    })
                : state.analysis
                    ? Array.from(new Set(state.analysis.stanzas
                        .map((stanza) =>
                            stanza.selectedMeter && stanza.selectedMeter.name)
                        .filter(Boolean)))
                    : [];
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

    function closeShareDialog() {
        const dialog = elements["share-dialog"];
        if (dialog && dialog.open) {
            dialog.close();
        }
    }

    function openComposerShare() {
        state.sharingPoem = null;
        elements["share-dialog"].showModal();
    }

    function openSavedPoemShare(poem) {
        state.sharingPoem = poem;
        elements["saved-poems-dialog"].close();
        elements["share-dialog"].showModal();
    }

    function poemDisplayTitle(poem) {
        if (poem.title) {
            return poem.title;
        }
        const generated = ChandasPoemStore.defaultTitle(poem.text);
        return generated === "Untitled poem" ? t("untitledPoem") : generated;
    }

    function poemPreview(poem) {
        return poem.text.split("\n").map((line) => line.trim())
            .filter(Boolean).slice(0, 2).join("\n") || "—";
    }

    async function openStoredPoem(id) {
        if (!state.repository || id === state.activePoemId) {
            elements["saved-poems-dialog"].close();
            elements.composition.focus();
            return;
        }
        window.clearTimeout(state.saveTimer);
        await saveDraft();
        const poem = await state.repository.get(id);
        if (!poem) {
            await refreshSavedPoems();
            return;
        }
        state.activePoemId = poem.id;
        state.activePoemTitle = poem.title || "";
        state.activePoemCreatedAt = poem.createdAt;
        state.activePoemRevision = poem.revision || 0;
        state.activePoemPersisted = true;
        applyStoredPoem(poem);
        await state.repository.setMeta("activePoemId", poem.id);
        updateLanguage();
        runAnalysis();
        elements["saved-poems-dialog"].close();
        elements.composition.focus();
    }

    async function renameStoredPoem(poem, card) {
        const actions = card.querySelector(".saved-poem-actions");
        const form = document.createElement("div");
        form.className = "saved-poem-rename";
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 160;
        input.value = poem.title || poemDisplayTitle(poem);
        input.setAttribute("aria-label", t("renamePoem"));
        const save = document.createElement("button");
        save.type = "button";
        save.textContent = t("saveName");
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = t("cancel");
        form.append(input, save, cancel);
        actions.replaceWith(form);
        input.focus();
        input.select();
        const commit = async () => {
            const updated = {
                ...poem,
                title: input.value.trim(),
                updatedAt: new Date().toISOString(),
                revision: poem.revision + 1
            };
            await state.repository.put(updated);
            if (poem.id === state.activePoemId) {
                state.activePoemTitle = updated.title;
                state.activePoemRevision = updated.revision;
            }
            await refreshSavedPoems();
        };
        save.addEventListener("click", commit);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                commit();
            } else if (event.key === "Escape") {
                refreshSavedPoems();
            }
        });
        cancel.addEventListener("click", refreshSavedPoems);
    }

    function savedPoemButton(label, handler, className) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        if (className) {
            button.classList.add(className);
        }
        button.addEventListener("click", handler);
        return button;
    }

    function renderSavedPoems() {
        const query = elements["saved-poems-search"].value.trim().toLocaleLowerCase();
        const poems = state.savedPoems.filter((poem) =>
            !query || `${poem.title}\n${poem.text}`.toLocaleLowerCase().includes(query));
        elements["saved-poems-list"].replaceChildren();
        elements["saved-poems-count"].textContent = t("savedPoemCount", {
            count: poems.length
        });
        elements["saved-poems-empty"].hidden = poems.length > 0;
        for (const poem of poems) {
            const card = document.createElement("article");
            card.className = "saved-poem-card";
            if (poem.id === state.activePoemId) {
                card.classList.add("active");
            }
            const title = document.createElement("h3");
            title.textContent = poemDisplayTitle(poem);
            const time = document.createElement("time");
            time.dateTime = poem.updatedAt;
            time.textContent = new Intl.DateTimeFormat(state.language, {
                dateStyle: "medium",
                timeStyle: "short"
            }).format(new Date(poem.updatedAt));
            const preview = document.createElement("p");
            preview.className = "saved-poem-preview";
            preview.textContent = poemPreview(poem);
            const actions = document.createElement("div");
            actions.className = "saved-poem-actions";
            actions.append(
                savedPoemButton(
                    poem.id === state.activePoemId ? t("activePoem") : t("openPoem"),
                    () => openStoredPoem(poem.id)
                ),
                savedPoemButton(
                    t("share"),
                    () => openSavedPoemShare(poem),
                    "saved-poem-share"
                ),
                savedPoemButton(t("renamePoem"), () => renameStoredPoem(poem, card)),
                savedPoemButton(t("duplicatePoem"), async () => {
                    const now = new Date().toISOString();
                    await state.repository.put({
                        ...poem,
                        id: ChandasPoemStore.createId(),
                        title: `${poemDisplayTitle(poem)} (${t("poemCopySuffix")})`,
                        createdAt: now,
                        updatedAt: now,
                        revision: 0
                    });
                    await refreshSavedPoems();
                }),
                savedPoemButton(t("deletePoem"), async () => {
                    if (!window.confirm(t("deletePoemConfirm"))) {
                        return;
                    }
                    await state.repository.remove(poem.id);
                    if (poem.id === state.activePoemId) {
                        window.clearTimeout(state.saveTimer);
                        elements.composition.value = "";
                        state.selections = {};
                        state.templates = {};
                        state.templateModes = {};
                        state.strongDrafts = {};
                        state.activePoemPersisted = false;
                        await clearDraft();
                        elements["saved-poems-dialog"].showModal();
                    }
                    await refreshSavedPoems();
                })
            );
            card.append(title, time, preview, actions);
            elements["saved-poems-list"].append(card);
        }
    }

    async function refreshSavedPoems() {
        if (!state.repository) {
            state.savedPoems = [];
            renderSavedPoems();
            return;
        }
        state.savedPoems = await state.repository.list();
        renderSavedPoems();
    }

    async function showSavedPoems() {
        window.clearTimeout(state.saveTimer);
        await saveDraft();
        await refreshSavedPoems();
        elements["saved-poems-dialog"].showModal();
        elements["saved-poems-search"].focus();
    }

    function backupFile(poems) {
        const json = JSON.stringify(ChandasPoemStore.makeBackup(poems), null, 2);
        const date = new Date().toISOString().slice(0, 10);
        return new File([json], `chandas-backup-${date}.json`, {
            type: "application/json"
        });
    }

    function readablePoemsText(poems) {
        const dateFormatter = new Intl.DateTimeFormat(state.language, {
            dateStyle: "long",
            timeStyle: "short"
        });
        const divider = "=".repeat(64);
        const rule = "-".repeat(64);
        const sections = poems.map((poem, index) => {
            const meterNames = Array.from(new Set(Object.values(poem.selections || {})))
                .filter(Boolean)
                .map((meterId) => {
                    const meter = meterForId(meterId);
                    return meter ? meter.name : meterId;
                });
            const edited = Number.isFinite(Date.parse(poem.updatedAt))
                ? dateFormatter.format(new Date(poem.updatedAt))
                : "—";
            return [
                divider,
                `${index + 1}. ${poemDisplayTitle(poem)}`,
                `${t("lastEditedLabel")}: ${edited}`,
                `${t("metersLabel")}: ${meterNames.join(", ") || t("noSelectedMeters")}`,
                rule,
                poem.text
            ].join("\n");
        });
        return [
            t("poemsFileTitle"),
            `${t("exportedAtLabel")}: ${dateFormatter.format(new Date())}`,
            "",
            ...sections,
            ""
        ].join("\n");
    }

    function readablePoemsFile(poems) {
        const date = new Date().toISOString().slice(0, 10);
        return new File(["\uFEFF", readablePoemsText(poems)],
            `chandas-poems-${date}.txt`, {
                type: "text/plain;charset=utf-8"
            });
    }

    function downloadFile(file, messageKey) {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast(t(messageKey));
    }

    async function exportReadablePoems() {
        if (!state.repository) {
            showToast(t("localStorageUnavailable"));
            return;
        }
        await saveDraft();
        const file = readablePoemsFile(await state.repository.list());
        if (navigator.share && navigator.canShare &&
            navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: t("poemsFileTitle")
                });
                showToast(t("poemsShared"));
                return;
            } catch (error) {
                if (error && error.name === "AbortError") {
                    return;
                }
            }
        }
        downloadFile(file, "poemsDownloaded");
    }

    async function exportFullBackup() {
        if (!state.repository) {
            showToast(t("localStorageUnavailable"));
            return;
        }
        await saveDraft();
        downloadFile(backupFile(await state.repository.list()), "backupDownloaded");
    }

    async function importBackupFile(file) {
        if (!state.repository || !file || file.size > ChandasPoemStore.MAX_BACKUP_BYTES) {
            showToast(t("backupInvalid"));
            return;
        }
        try {
            const result = await state.repository.import(await file.text());
            await refreshSavedPoems();
            showToast(t("backupImported", result));
        } catch (error) {
            console.warn("Backup import rejected", error);
            showToast(t("backupInvalid"));
        } finally {
            elements["backup-file"].value = "";
        }
    }

    function dismissSavedPoemsFromBackdrop(event) {
        const dialog = elements["saved-poems-dialog"];
        if (event.target !== dialog) {
            return;
        }
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) {
            dialog.close();
        }
    }

    function dismissShareDialogFromBackdrop(event) {
        const dialog = elements["share-dialog"];
        if (event.target !== dialog) {
            return;
        }
        const bounds = dialog.getBoundingClientRect();
        const outside = event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;
        if (outside) {
            closeShareDialog();
        }
    }

    function exposeAppUpdate(worker) {
        if (!worker || !elements["app-update"] || state.updateRequested) {
            return;
        }
        state.waitingServiceWorker = worker;
        elements["app-update"].hidden = false;
        elements["app-update"].disabled = false;
        elements["app-update"].textContent = t("updateAvailable");
    }

    function watchInstallingWorker(worker) {
        if (!worker) {
            return;
        }
        worker.addEventListener("statechange", () => {
            if (worker.state === "installed" &&
                navigator.serviceWorker.controller) {
                exposeAppUpdate(worker);
            }
        });
    }

    async function checkForAppUpdate() {
        const registration = state.serviceWorkerRegistration;
        if (!registration || navigator.onLine === false) {
            return;
        }
        try {
            await registration.update();
            if (registration.waiting) {
                exposeAppUpdate(registration.waiting);
            }
        } catch (error) {
            console.warn("Application update check failed", error);
        }
    }

    async function activateAppUpdate() {
        const worker = state.waitingServiceWorker ||
            (state.serviceWorkerRegistration &&
                state.serviceWorkerRegistration.waiting);
        if (!worker) {
            checkForAppUpdate();
            return;
        }
        await saveDraft();
        state.updateRequested = true;
        elements["app-update"].disabled = true;
        elements["app-update"].textContent = t("updating");
        worker.postMessage({ type: "SKIP_WAITING" });
    }

    async function initializeServiceWorker() {
        if (!("serviceWorker" in navigator) ||
            location.protocol === "file:" ||
            location.hostname === "appassets.androidplatform.net") {
            return;
        }

        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (!state.updateRequested) {
                return;
            }
            state.updateRequested = false;
            window.location.reload();
        });

        try {
            const registration = await navigator.serviceWorker.register(
                "service-worker.js",
                { updateViaCache: "none" }
            );
            state.serviceWorkerRegistration = registration;
            if (registration.waiting && navigator.serviceWorker.controller) {
                exposeAppUpdate(registration.waiting);
            }
            watchInstallingWorker(registration.installing);
            registration.addEventListener("updatefound", () => {
                watchInstallingWorker(registration.installing);
            });

            state.updateCheckTimer = window.setInterval(
                checkForAppUpdate,
                UPDATE_CHECK_INTERVAL_MS
            );
            window.addEventListener("online", checkForAppUpdate);
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "visible") {
                    checkForAppUpdate();
                }
            });
            checkForAppUpdate();
        } catch (error) {
            console.warn("Service worker registration failed", error);
        }
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
            metres: [
                ...(fixedCatalog.metres || []),
                ...(structuralCatalog.fixedMeters || [])
            ],
            structuralMeters: structuralCatalog.meters,
            meterProminence: structuralCatalog.meterProminence || {},
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
        elements["saved-poems"].addEventListener("click", showSavedPoems);
        elements["close-saved-poems"].addEventListener("click", () =>
            elements["saved-poems-dialog"].close());
        elements["saved-poems-dialog"].addEventListener(
            "click",
            dismissSavedPoemsFromBackdrop
        );
        elements["saved-poems-search"].addEventListener("input", renderSavedPoems);
        elements["backup-share"].addEventListener("click", exportReadablePoems);
        elements["backup-download"].addEventListener("click", exportFullBackup);
        elements["backup-import"].addEventListener("click", () =>
            elements["backup-file"].click());
        elements["backup-file"].addEventListener("change", () =>
            importBackupFile(elements["backup-file"].files[0]));
        elements["app-update"].addEventListener("click", activateAppUpdate);
        elements.copy.addEventListener("click", () => copyText(authoredCompositionText()));
        elements.share.addEventListener("click", openComposerShare);
        elements["share-dialog"].addEventListener(
            "click",
            dismissShareDialogFromBackdrop
        );
        elements["dialog-copy"].addEventListener("click", () => {
            closeShareDialog();
            copyText(shareText());
        });
        elements["copy-analysis-url"].addEventListener("click", () => {
            closeShareDialog();
            copyText(analysisUrl(), "analysisLinkCopied");
        });
        elements["system-share"].addEventListener("click", () => {
            closeShareDialog();
            systemShare();
        });
        elements["twitter-share"].addEventListener("click", () => {
            closeShareDialog();
            openTwitterShare();
        });
        elements["facebook-share"].addEventListener("click", () => {
            closeShareDialog();
            openFacebookShare();
        });

        elements["previous-stanza"].addEventListener("click", () =>
            setActiveStanza(state.activeStanzaIndex - 1, true));
        elements["next-stanza"].addEventListener("click", () =>
            setActiveStanza(state.activeStanzaIndex + 1, true));

        elements["meter-search"].addEventListener("input", () =>
            filterMeterOptions(elements["meter-search"].value));
        elements["meter-select"].addEventListener("change", () =>
            selectMeter(elements["meter-select"].value));
        elements["clear-meter"].addEventListener("click", () => selectMeter(""));
        elements["detect-shithila-dvitva"].addEventListener("change", () => {
            state.detectShithilaDvitva =
                elements["detect-shithila-dvitva"].checked;
            runAnalysis();
        });
        elements["scansion-mode"].addEventListener("change", () => {
            state.scansionMode = ChandasScansion.normalizeMode(
                elements["scansion-mode"].value
            );
            renderOverlay();
            scheduleSave();
        });
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
        window.addEventListener("pagehide", saveDraft);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") {
                saveDraft();
            }
        });
        window.addEventListener("resize", positionScansionLabels);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(positionScansionLabels).catch(() => {});
        }
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
        await restoreDraft();
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

        initializeServiceWorker();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
}());
