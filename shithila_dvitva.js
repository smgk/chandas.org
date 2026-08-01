/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function shithilaDvitvaModule(root, factory) {
    "use strict";
    const dependency = typeof module === "object" && module.exports
        ? require("./meter_analysis.js")
        : root.Chandas;
    const api = factory(dependency);
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.ChandasShithilaDvitva = api;
    }
}(typeof globalThis !== "undefined" ? globalThis : this,
function createShithilaDvitvaApi(Chandas) {
    "use strict";

    const VIRAMA = "್";
    const HISTORICAL_LATERAL = "ೞ";
    const RELAXABLE_CODAS = new Set(["ರ", "ಱ", "ಳ", HISTORICAL_LATERAL]);
    // Conservative, unaspirated followers found in the traditional rule
    // environments. Aspirates and retroflex stops stay on the ordinary scan.
    const SIMPLE_FOLLOWERS = new Set(Array.from("ಕಗಚಜತದಪಬಮಯರಲವ"));
    const MAX_METRICAL_CANDIDATES = 16;

    function characterAt(text, index) {
        return Array.from(String(text || "").slice(index))[0] || "";
    }

    function codaCandidate(text, segment) {
        if (!segment || segment.script !== "kannada" ||
            segment.classification !== Chandas.GURU ||
            !(segment.reasons || []).includes("closed-by-conjunct") ||
            (segment.reasons || []).some((reason) =>
                ["long-vowel", "anusvara", "visarga"].includes(reason))) {
            return null;
        }
        const points = Array.from(segment.text || "");
        if (points.length < 2 || points.at(-1) !== VIRAMA ||
            !RELAXABLE_CODAS.has(points.at(-2))) {
            return null;
        }
        const follower = characterAt(text, segment.end);
        if (!SIMPLE_FOLLOWERS.has(follower)) {
            return null;
        }
        return {
            id: `shithila:${segment.start}`,
            segmentStart: segment.start,
            stanzaIndex: segment.stanzaIndex,
            classification: Chandas.LAGHU,
            conjunctStart: Math.max(segment.start, segment.end - 2),
            conjunctEnd: segment.end + follower.length,
            evidence: "repha-lateral-rule",
            suppressUnsupported: null
        };
    }

    function historicalCandidates(text, analysis) {
        const candidates = [];
        const source = String(text || "");
        const expression = /ೞ್([ಕಗಚಜತದಪಬಮಯರಲವ])/gu;
        let match;
        while ((match = expression.exec(source)) !== null) {
            const previous = analysis.segments.find((segment) =>
                segment.script === "kannada" &&
                segment.end === match.index &&
                segment.classification === Chandas.LAGHU);
            if (!previous) {
                continue;
            }
            const unsupported = analysis.unsupported.find((range) =>
                range.start === match.index && range.end === match.index + 2);
            candidates.push({
                id: `shithila-historical:${previous.start}`,
                segmentStart: previous.start,
                stanzaIndex: previous.stanzaIndex,
                classification: Chandas.LAGHU,
                conjunctStart: match.index,
                conjunctEnd: match.index + match[0].length,
                evidence: "historical-lateral",
                suppressUnsupported: unsupported || null,
                inherent: true
            });
        }
        return candidates;
    }

    function findCandidates(text, analysis) {
        const stanzaByOffset = [];
        for (const stanza of analysis.stanzas || []) {
            stanzaByOffset.push(stanza);
        }
        const annotatedSegments = (analysis.segments || []).map((segment) => {
            const stanza = stanzaByOffset.find((item) =>
                segment.start >= item.start && segment.start <= item.end);
            return { ...segment, stanzaIndex: stanza ? stanza.index : 0 };
        });
        const modern = annotatedSegments
            .map((segment) => codaCandidate(text, segment))
            .filter(Boolean);
        const withAnnotatedSegments = { ...analysis, segments: annotatedSegments };
        return modern.concat(historicalCandidates(text, withAnnotatedSegments));
    }

    function analysisScore(analysis) {
        const statusRank = { exact: 0, compatible: 1, approximate: 2 };
        return (analysis.stanzas || []).reduce((total, stanza) => {
            if (stanza.selectedMeter) {
                return total + (stanza.violationCount || 0) * 10000 +
                    (stanza.missingCount || 0) * 100;
            }
            const candidate = stanza.candidates && stanza.candidates[0];
            if (!candidate) {
                return total + 1000000;
            }
            return total + (statusRank[candidate.status] ?? 3) * 10000 +
                (candidate.violationCount || 0) * 1000 +
                (candidate.missingCount || 0) * 100 +
                (candidate.distance || 0) * 10 +
                (candidate.score || 0);
        }, 0);
    }

    function coreOptions(candidates) {
        const weightOverrides = {};
        const suppressedUnsupportedRanges = [];
        for (const candidate of candidates) {
            weightOverrides[candidate.segmentStart] = {
                classification: candidate.classification,
                reason: "shithila-dvitva",
                conjunctStart: candidate.conjunctStart,
                conjunctEnd: candidate.conjunctEnd,
                evidence: candidate.evidence,
                marker: "*"
            };
            if (candidate.suppressUnsupported) {
                suppressedUnsupportedRanges.push(candidate.suppressUnsupported);
            }
        }
        return { weightOverrides, suppressedUnsupportedRanges };
    }

    function analyzeWith(text, catalog, selectedMeters, candidates) {
        return Chandas.analyzeComposition(
            text,
            catalog,
            selectedMeters,
            coreOptions(candidates)
        );
    }

    function finalize(analysis, candidateCount) {
        const realizationCount = (analysis.segments || []).filter((segment) =>
            Boolean(segment.shithilaDvitva)).length;
        return {
            ...analysis,
            shithilaDvitva: {
                enabled: true,
                candidateCount,
                realizationCount
            }
        };
    }

    function analyzeComposition(text, catalog, selectedMeters, options) {
        if (!options || options.detect !== true) {
            return Chandas.analyzeComposition(text, catalog, selectedMeters);
        }
        const baseline = Chandas.analyzeComposition(text, catalog, selectedMeters);
        const candidates = findCandidates(text, baseline);
        if (!candidates.length) {
            return finalize(baseline, 0);
        }

        const inherent = candidates.filter((candidate) => candidate.inherent);
        const metrical = candidates.filter((candidate) => !candidate.inherent)
            .slice(0, MAX_METRICAL_CANDIDATES);
        let chosen = inherent.slice();
        let best = chosen.length
            ? analyzeWith(text, catalog, selectedMeters, chosen)
            : baseline;
        let bestScore = analysisScore(best);

        const all = chosen.concat(metrical);
        const allAnalysis = analyzeWith(text, catalog, selectedMeters, all);
        const allScore = analysisScore(allAnalysis);
        if (allScore < bestScore) {
            chosen = all;
            best = allAnalysis;
            bestScore = allScore;
            // Remove every relaxation that is not needed for the best fit.
            for (const candidate of metrical) {
                const reduced = chosen.filter((item) => item.id !== candidate.id);
                const trial = analyzeWith(text, catalog, selectedMeters, reduced);
                const trialScore = analysisScore(trial);
                if (trialScore <= bestScore) {
                    chosen = reduced;
                    best = trial;
                    bestScore = trialScore;
                }
            }
        } else {
            // If relaxing every candidate overshoots the rhythm, add only
            // individually useful realizations.
            for (const candidate of metrical) {
                const trialCandidates = chosen.concat(candidate);
                const trial = analyzeWith(text, catalog, selectedMeters, trialCandidates);
                const trialScore = analysisScore(trial);
                if (trialScore < bestScore) {
                    chosen = trialCandidates;
                    best = trial;
                    bestScore = trialScore;
                }
            }
        }

        return finalize(best, candidates.length);
    }

    return {
        analyzeComposition,
        findCandidates
    };
}));
