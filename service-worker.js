/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const CACHE_NAME = "chandas-shell-v55";
const UPDATE_UI_BOOTSTRAP_CACHE = "chandas-shell-v30";
const CORE_ASSETS = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./analytics.js",
    "./poem_store.js",
    "./meter_analysis.js",
    "./scansion.js",
    "./shithila_dvitva.js",
    "./strong_template.js",
    "./mishra.json",
    "./structural_meters.json",
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
                .filter((key) => key !== CACHE_NAME)
                .map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(event.request.url);
    const isAppQueryNavigation = event.request.mode === "navigate" &&
        Boolean(requestUrl.search) &&
        (requestUrl.pathname.endsWith("/") ||
            requestUrl.pathname.endsWith("/index.html"));
    const cacheRequest = isAppQueryNavigation
        ? "./index.html"
        : event.request;
    event.respondWith(
        caches.match(cacheRequest).then((cached) => {
            if (cached) {
                return cached;
            }
            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type === "opaque") {
                    return response;
                }
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(cacheRequest, copy));
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
