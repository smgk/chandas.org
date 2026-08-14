/*
 * Copyright © 2025–2026 Ganesh Krishna Shankarathota
 * SPDX-License-Identifier: GPL-3.0-only
 */

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const createAnalytics = require("../analytics.js");

function environment(hostname = "chandas.org") {
    const requests = [];
    const images = [];
    const timers = new Map();
    let timerId = 0;

    class CountingImage {
        constructor() {
            images.push(this);
        }

        set src(value) {
            requests.push(value);
            if (this.onload) {
                this.onload();
            }
        }
    }

    return {
        requests,
        images,
        timers,
        root: {
            location: {
                hostname,
                pathname: "/",
                search: "?verse=%E0%B2%95%E0%B2%BE%E0%B2%B5%E0%B3%8D%E0%B2%AF",
                hash: "#private-fragment"
            },
            document: { title: "Chandas - say it in-verse" },
            Image: CountingImage,
            setTimeout(callback) {
                timerId += 1;
                timers.set(timerId, callback);
                return timerId;
            },
            clearTimeout(id) {
                timers.delete(id);
            }
        },
        runTimers() {
            const callbacks = Array.from(timers.values());
            timers.clear();
            callbacks.forEach((callback) => callback());
        }
    };
}

function analysisFor(...scripts) {
    return {
        stanzas: [{
            lines: [{
                syllables: scripts.map((script) => ({ script }))
            }]
        }]
    };
}

function requestPaths(requests) {
    return requests.map((request) => new URL(request).searchParams.get("p"));
}

test("production page counts omit shared composition queries and referrers", () => {
    const fake = environment();
    const analytics = createAnalytics(fake.root);

    assert.equal(analytics.trackPageview(), true);
    assert.equal(fake.requests.length, 1);
    const request = new URL(fake.requests[0]);
    assert.equal(request.searchParams.get("p"), "/");
    assert.equal(request.searchParams.has("q"), false);
    assert.doesNotMatch(fake.requests[0], /verse=|private-fragment|ಕಾವ್ಯ|%E0%B2%95/i);
    assert.equal(fake.images[0].referrerPolicy, "no-referrer");
});

test("writing-script events wait for meaningful stable input and deduplicate", () => {
    const fake = environment();
    const analytics = createAnalytics(fake.root);

    analytics.trackCompositionScripts(analysisFor("kannada", "kannada"));
    fake.runTimers();
    assert.deepEqual(fake.requests, []);

    analytics.trackCompositionScripts(analysisFor(
        "kannada", "kannada", "kannada"
    ));
    assert.equal(fake.requests.length, 0);
    fake.runTimers();
    assert.deepEqual(requestPaths(fake.requests), ["writing-script-kannada"]);
    assert.equal(new URL(fake.requests[0]).searchParams.get("e"), "1");

    analytics.trackCompositionScripts(analysisFor(
        "kannada", "kannada", "kannada", "kannada"
    ));
    fake.runTimers();
    assert.equal(fake.requests.length, 1);
});

test("mixed writing emits individual presence and mixed events without text", () => {
    const fake = environment();
    const analytics = createAnalytics(fake.root);

    analytics.trackCompositionScripts(analysisFor(
        "kannada", "devanagari", "kannada"
    ));
    fake.runTimers();

    assert.deepEqual(requestPaths(fake.requests), [
        "writing-script-kannada",
        "writing-script-devanagari",
        "writing-script-mixed"
    ]);
    fake.requests.forEach((request) => {
        assert.doesNotMatch(request, /verse|syllable|draft/);
    });
});

test("Gujarati writing emits only its aggregate script event", () => {
    const fake = environment();
    const analytics = createAnalytics(fake.root);

    analytics.trackCompositionScripts(analysisFor(
        "gujarati", "gujarati", "gujarati"
    ));
    fake.runTimers();

    assert.deepEqual(requestPaths(fake.requests), ["writing-script-gujarati"]);
});

test("Telugu writing emits its stable script event", () => {
    const fake = environment();
    const analytics = createAnalytics(fake.root);

    analytics.trackCompositionScripts(analysisFor(
        "telugu", "telugu", "telugu"
    ));
    fake.runTimers();

    assert.deepEqual(requestPaths(fake.requests), ["writing-script-telugu"]);
});

test("analytics stays disabled outside the production website", () => {
    const fake = environment("smgk.github.io");
    const analytics = createAnalytics(fake.root);

    assert.equal(analytics.trackPageview(), false);
    analytics.trackCompositionScripts(analysisFor(
        "kannada", "kannada", "kannada"
    ));
    fake.runTimers();
    assert.deepEqual(fake.requests, []);
});
