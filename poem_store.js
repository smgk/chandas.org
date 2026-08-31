/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function poemStoreModule(root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.ChandasPoemStore = api;
    }
}(typeof window !== "undefined" ? window : globalThis, function createPoemStoreApi() {
    "use strict";

    const DB_NAME = "chandas-local";
    const DB_VERSION = 1;
    const BACKUP_FORMAT = "chandas-poems-backup";
    const BACKUP_VERSION = 1;
    const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
    const MAX_POEMS = 5000;
    const MAX_CUSTOM_FORMS = 100;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function objectOrEmpty(value) {
        return value && typeof value === "object" && !Array.isArray(value)
            ? clone(value)
            : {};
    }

    function createId() {
        if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
            return globalThis.crypto.randomUUID();
        }
        return `poem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }

    function defaultTitle(text) {
        const firstLine = String(text || "").split(/\r?\n/)
            .map((line) => line.trim())
            .find(Boolean);
        if (!firstLine) {
            return "Untitled poem";
        }
        return firstLine.length > 72 ? `${firstLine.slice(0, 69)}…` : firstLine;
    }

    function normalizePoem(value, options) {
        if (!value || typeof value !== "object") {
            throw new Error("Invalid poem record");
        }
        const now = new Date().toISOString();
        const text = typeof value.text === "string"
            ? value.text.replace(/\r\n?/g, "\n")
            : "";
        const suppliedTitle = typeof value.title === "string"
            ? value.title.trim().slice(0, 160)
            : "";
        const createdAt = Number.isFinite(Date.parse(value.createdAt))
            ? new Date(value.createdAt).toISOString()
            : now;
        const updatedAt = Number.isFinite(Date.parse(value.updatedAt))
            ? new Date(value.updatedAt).toISOString()
            : now;
        const selectionStart = Math.max(0, Math.min(
            Number.isInteger(value.selectionStart) ? value.selectionStart : 0,
            text.length
        ));
        const selectionEnd = Math.max(selectionStart, Math.min(
            Number.isInteger(value.selectionEnd) ? value.selectionEnd : selectionStart,
            text.length
        ));
        return {
            id: options && options.newId ? createId() :
                (typeof value.id === "string" && value.id ? value.id : createId()),
            schemaVersion: 1,
            title: suppliedTitle,
            text,
            selections: objectOrEmpty(value.selections),
            templates: objectOrEmpty(value.templates),
            templateModes: objectOrEmpty(value.templateModes),
            strongDrafts: objectOrEmpty(value.strongDrafts),
            scansionMode: [
                "auto", "weights", "amsha", "matra-35", "matra-53", "off"
            ].includes(value.scansionMode) ? value.scansionMode : "auto",
            detectShithilaDvitva: value.detectShithilaDvitva === true,
            inputScheme: ["native", "english", "iast", "iso15919", "itrans", "hk"]
                .includes(value.inputScheme) ? value.inputScheme : "native",
            language: ["en", "kn", "te", "gu"].includes(value.language)
                ? value.language
                : "en",
            selectionStart,
            selectionEnd,
            createdAt,
            updatedAt,
            revision: Number.isInteger(value.revision) && value.revision >= 0
                ? value.revision
                : 0,
            importedFrom: typeof value.importedFrom === "string"
                ? value.importedFrom
                : undefined
        };
    }

    function comparablePoem(poem) {
        const copy = normalizePoem(poem);
        delete copy.id;
        delete copy.title;
        delete copy.createdAt;
        delete copy.updatedAt;
        delete copy.revision;
        delete copy.importedFrom;
        return JSON.stringify(copy);
    }

    function makeBackup(poems, customForms) {
        return {
            format: BACKUP_FORMAT,
            version: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),
            poems: poems.map((poem) => normalizePoem(poem)),
            customForms: Array.isArray(customForms) ? clone(customForms) : []
        };
    }

    function parseBackupEnvelope(input) {
        const text = typeof input === "string" ? input : JSON.stringify(input);
        if (text.length > MAX_BACKUP_BYTES) {
            throw new Error("Backup file is too large");
        }
        let data;
        try {
            data = typeof input === "string" ? JSON.parse(input) : clone(input);
        } catch (error) {
            throw new Error("Backup is not valid JSON");
        }
        if (!data || data.format !== BACKUP_FORMAT ||
            data.version !== BACKUP_VERSION || !Array.isArray(data.poems)) {
            throw new Error("This is not a supported Chandas backup");
        }
        if (data.poems.length > MAX_POEMS) {
            throw new Error("Backup contains too many poems");
        }
        if (data.customForms !== undefined &&
            (!Array.isArray(data.customForms) ||
                data.customForms.length > MAX_CUSTOM_FORMS)) {
            throw new Error("Backup contains invalid custom forms");
        }
        const seen = new Set();
        const poems = data.poems.map((poem) => {
            if (!poem || typeof poem !== "object" || Array.isArray(poem) ||
                typeof poem.id !== "string" || !poem.id ||
                typeof poem.text !== "string") {
                throw new Error("Backup contains an invalid poem record");
            }
            const normalized = normalizePoem(poem);
            if (seen.has(normalized.id)) {
                throw new Error("Backup contains duplicate poem identifiers");
            }
            seen.add(normalized.id);
            return normalized;
        });
        return {
            poems,
            customForms: clone(data.customForms || [])
        };
    }

    function parseBackup(input) {
        return parseBackupEnvelope(input).poems;
    }

    function parseWorkspaceBackup(input) {
        return parseBackupEnvelope(input);
    }

    function mergePoems(existingPoems, importedPoems, idFactory) {
        const existing = new Map(existingPoems.map((poem) => [poem.id, normalizePoem(poem)]));
        const additions = [];
        let skipped = 0;
        let conflicts = 0;
        for (const incomingValue of importedPoems) {
            const incoming = normalizePoem(incomingValue);
            const local = existing.get(incoming.id);
            if (!local) {
                additions.push(incoming);
                existing.set(incoming.id, incoming);
                continue;
            }
            if (comparablePoem(local) === comparablePoem(incoming)) {
                skipped += 1;
                continue;
            }
            const priorConflict = Array.from(existing.values()).some((candidate) =>
                candidate.importedFrom === incoming.id &&
                comparablePoem(candidate) === comparablePoem(incoming));
            if (priorConflict) {
                skipped += 1;
                continue;
            }
            const conflict = normalizePoem({
                ...incoming,
                id: (idFactory || createId)(),
                title: `${incoming.title || defaultTitle(incoming.text)} (imported copy)`,
                importedFrom: incoming.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                revision: 0
            });
            additions.push(conflict);
            existing.set(conflict.id, conflict);
            conflicts += 1;
        }
        return { additions, skipped, conflicts };
    }

    function requestResult(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error("Storage request failed"));
        });
    }

    function transactionDone(transaction) {
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error("Storage transaction failed"));
            transaction.onabort = () => reject(transaction.error || new Error("Storage transaction was aborted"));
        });
    }

    class PoemRepository {
        constructor(indexedDb) {
            this.indexedDB = indexedDb || globalThis.indexedDB;
            this.db = null;
        }

        async open() {
            if (this.db) {
                return this;
            }
            if (!this.indexedDB) {
                throw new Error("IndexedDB is unavailable");
            }
            const request = this.indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains("poems")) {
                    const poems = db.createObjectStore("poems", { keyPath: "id" });
                    poems.createIndex("updatedAt", "updatedAt");
                }
                if (!db.objectStoreNames.contains("meta")) {
                    db.createObjectStore("meta", { keyPath: "key" });
                }
            };
            this.db = await requestResult(request);
            this.db.onversionchange = () => {
                this.db.close();
                this.db = null;
            };
            return this;
        }

        async list() {
            const tx = this.db.transaction("poems", "readonly");
            const poems = await requestResult(tx.objectStore("poems").getAll());
            await transactionDone(tx);
            return poems.map((poem) => normalizePoem(poem))
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        }

        async get(id) {
            const tx = this.db.transaction("poems", "readonly");
            const value = await requestResult(tx.objectStore("poems").get(id));
            await transactionDone(tx);
            return value ? normalizePoem(value) : null;
        }

        async put(value) {
            const poem = normalizePoem(value);
            const tx = this.db.transaction("poems", "readwrite");
            tx.objectStore("poems").put(poem);
            await transactionDone(tx);
            return poem;
        }

        async remove(id) {
            const tx = this.db.transaction("poems", "readwrite");
            tx.objectStore("poems").delete(id);
            await transactionDone(tx);
        }

        async getMeta(key) {
            const tx = this.db.transaction("meta", "readonly");
            const value = await requestResult(tx.objectStore("meta").get(key));
            await transactionDone(tx);
            return value ? value.value : undefined;
        }

        async setMeta(key, value) {
            const tx = this.db.transaction("meta", "readwrite");
            tx.objectStore("meta").put({ key, value });
            await transactionDone(tx);
        }

        async import(input) {
            const imported = parseBackup(input);
            const merged = mergePoems(await this.list(), imported);
            if (merged.additions.length) {
                const tx = this.db.transaction("poems", "readwrite");
                const store = tx.objectStore("poems");
                merged.additions.forEach((poem) => store.put(poem));
                await transactionDone(tx);
            }
            return {
                added: merged.additions.length,
                skipped: merged.skipped,
                conflicts: merged.conflicts
            };
        }
    }

    return {
        BACKUP_FORMAT,
        BACKUP_VERSION,
        MAX_BACKUP_BYTES,
        MAX_CUSTOM_FORMS,
        PoemRepository,
        createId,
        defaultTitle,
        makeBackup,
        mergePoems,
        normalizePoem,
        parseBackup,
        parseWorkspaceBackup
    };
}));
