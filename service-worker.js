/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const CACHE_NAME = "chandas-shell-v65";
const ENGLISH_CACHE_NAME = "chandas-english-v1";
const UPDATE_UI_BOOTSTRAP_CACHE = "chandas-shell-v30";
const ENGLISH_ASSET_PATHS = [
    "/english_analysis.js",
    "/english_composer.js",
    "/english_meters.json",
    "/data/english/en-cmudict-stress-v1.json"
];
const CORE_ASSETS = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./roman_transliteration.js",
    "./analytics.js",
    "./poem_store.js",
    "./meter_analysis.js",
    "./synonym_engine.js",
    "./scansion.js",
    "./shithila_dvitva.js",
    "./strong_template.js",
    "./custom_meter.js",
    "./mishra.json",
    "./structural_meters.json",
    "./data/synonyms/README.md",
    "./data/synonyms/DATA_LICENSES.md",
    "./examples/field_guide_corpus.json",
    "./examples/apte_sanskrit_examples.json",
    "./docs/research/archive-meter-audit.md",
    "./docs/rules/gujarati-meters.md",
    "./manifest.webmanifest",
    "./icon.svg",
    "./documentation.html",
    "./documentation.js",
    "./about.html",
    "./roadmap.html",
    "./privacy.html",
    "./terms.html",
    "./notices.html",
    "./COPYRIGHT.md",
    "./LICENSE.md",
    "./THIRD_PARTY_NOTICES.md"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(CORE_ASSETS))
            // Existing releases activated workers immediately and cannot show
            // the new update button. Bridge those caches once; later workers
            // remain waiting until the user accepts the update.
            .then(() => caches.keys())
            .then((keys) => {
                const hasLegacyShell = CACHE_NAME === UPDATE_UI_BOOTSTRAP_CACHE &&
                    keys.some((key) =>
                        key.startsWith("chandas-shell-v") &&
                        key !== CACHE_NAME);
                return hasLegacyShell ? self.skipWaiting() : undefined;
            })
    );
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        event.waitUntil(self.skipWaiting());
    }
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys
                .filter((key) => ![CACHE_NAME, ENGLISH_CACHE_NAME].includes(key))
                .map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(event.request.url);
    const isEnglishAsset = ENGLISH_ASSET_PATHS.some((path) =>
        requestUrl.pathname.endsWith(path));
    const isAppQueryNavigation = event.request.mode === "navigate" &&
        Boolean(requestUrl.search) &&
        (requestUrl.pathname.endsWith("/") ||
            requestUrl.pathname.endsWith("/index.html"));
    const cacheRequest = isAppQueryNavigation
        ? "./index.html"
        : event.request;
    const shouldReadCache = event.request.cache !== "reload" &&
        event.request.cache !== "no-store";
    const runtimeCacheName = isEnglishAsset ? ENGLISH_CACHE_NAME : CACHE_NAME;
    const cachedResponse = shouldReadCache
        ? caches.open(runtimeCacheName).then((cache) => cache.match(cacheRequest))
        : Promise.resolve(undefined);
    event.respondWith(
        cachedResponse.then((cached) => {
            if (cached) {
                return cached;
            }
            return fetch(event.request).then(async (response) => {
                if (!response || response.status !== 200 || response.type === "opaque") {
                    return response;
                }
                const copy = response.clone();
                const cache = await caches.open(runtimeCacheName);
                await cache.put(cacheRequest, copy);
                return response;
            }).catch(() => {
                if (event.request.mode === "navigate") {
                    return caches.match("./index.html");
                }
                throw new Error("Resource unavailable offline");
            });
        })
    );
});
