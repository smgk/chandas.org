/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function synonymEngineModule(root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.ChandasSynonyms = api;
    }
}(typeof globalThis !== "undefined" ? globalThis : this, function synonymFactory() {
    "use strict";

    const WORD_CHARACTER = /[\p{Letter}\p{Mark}\u200C\u200D]/u;

    function normalizedWord(value) {
        return String(value || "").normalize("NFC");
    }

    function wordRange(textValue, caretValue) {
        const text = String(textValue || "");
        const caret = Math.max(0, Math.min(Number(caretValue) || 0, text.length));
        let pivot = caret;
        if (pivot > 0 && !WORD_CHARACTER.test(text[pivot] || "") &&
            WORD_CHARACTER.test(text[pivot - 1] || "")) {
            pivot -= 1;
        }
        if (!WORD_CHARACTER.test(text[pivot] || "")) {
            return null;
        }
        let start = pivot;
        let end = pivot + 1;
        while (start > 0 && WORD_CHARACTER.test(text[start - 1])) {
            start -= 1;
        }
        while (end < text.length && WORD_CHARACTER.test(text[end])) {
            end += 1;
        }
        return { start, end, word: text.slice(start, end).normalize("NFC") };
    }

    function validateDocument(documentValue) {
        const document = documentValue && typeof documentValue === "object"
            ? documentValue
            : null;
        if (!document || document.schemaVersion !== 1 ||
            !document.source || !document.source.id ||
            !Array.isArray(document.concepts)) {
            throw new Error("Unsupported synonym data document");
        }
        return document;
    }

    function createIndex(documentValues) {
        const documents = (documentValues || []).map(validateDocument);
        const byWord = new Map();
        for (const document of documents) {
            for (const concept of document.concepts) {
                if (!concept || !concept.id || !Array.isArray(concept.words) ||
                    concept.words.length < 2) {
                    continue;
                }
                for (const wordRecord of concept.words) {
                    const word = normalizedWord(wordRecord && wordRecord[0]);
                    if (!word) {
                        continue;
                    }
                    if (!byWord.has(word)) {
                        byWord.set(word, []);
                    }
                    byWord.get(word).push({ document, concept, wordRecord });
                }
            }
        }
        return { documents, byWord };
    }

    function lookup(index, termValues, maximumSenses = 8) {
        if (!index || !(index.byWord instanceof Map)) {
            return [];
        }
        const terms = Array.from(new Set((termValues || [])
            .map(normalizedWord).filter(Boolean)));
        const seen = new Set();
        const matches = [];
        for (const term of terms) {
            for (const reference of index.byWord.get(term) || []) {
                const key = `${reference.document.source.id}:${reference.concept.id}`;
                if (seen.has(key)) {
                    continue;
                }
                seen.add(key);
                matches.push({
                    id: key,
                    term,
                    language: reference.document.language,
                    license: reference.document.license,
                    source: reference.document.source,
                    label: reference.concept.label || "",
                    pos: reference.concept.pos || "",
                    relation: reference.concept.relation || "",
                    category: reference.concept.category || "",
                    section: reference.concept.section || "",
                    words: reference.concept.words
                });
                if (matches.length >= maximumSenses) {
                    return matches;
                }
            }
        }
        return matches;
    }

    return {
        createIndex,
        lookup,
        normalizedWord,
        validateDocument,
        wordRange
    };
}));
