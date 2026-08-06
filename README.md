<!--
Copyright © 2025–2026 Ganesh Krishna Shankarathota
SPDX-License-Identifier: GPL-3.0-only
-->

# Chandas — say it in-verse

[Chandas.org](https://chandas.org) is an offline-first, pre-beta composition
companion for Indic prosody. Type or paste Kannada, Telugu, or Devanagari verse
and it marks syllables as Laghu or Guru, suggests likely meters, and highlights
departures from a selected meter directly on the text.

The project is a static website/PWA with an Android WebView wrapper. Analysis
runs locally; composing does not require an account, server, or cloud database.

## What it does

- Analyzes Kannada, Telugu, and Devanagari Unicode while the user types.
- Preserves the original text, punctuation, line breaks, caret, and Indic IME
  behavior.
- Suggests and ranks fixed vṛttas, syllable-structural meters, mātrā meters,
  and aṃśa meters.
- Supports independent meter selection and validation for each stanza.
- Shows source-local Guru/Laghu, prāsa, karṣaṇa, and violation markings.
- Provides four-pāda and compact two-line handling for fixed vṛttas, plus
  conservative `8 + 8 / 8 + 8` Anuṣṭubh detection.
- Offers non-destructive Ghost guides and fixed-vṛtta Strong templates.
- Saves poems privately in browser storage and supports readable text export,
  full backup, restore, copy, sharing, and analysis links.
- Works as an installable PWA and keeps the core workflow available offline.
- Provides Kannada and English interface languages.

Some native Kannada structural rules remain explicitly provisional pending
expert review. The interface and documentation distinguish provisional
compatibility from a fully reviewed exact claim.

## Try it

Open [chandas.org](https://chandas.org). The **Learn** page explains the
markings, templates, supported meters, and the small amount of terminology
needed to get happily lost in prosody.

An analysis link may contain the poem itself in its URL. Such a link can appear
in browser history, messages, or hosting request logs; use it only for text you
are comfortable sharing.

## Run locally

Requirements:

- Node.js 22 or newer
- npm

```sh
npm ci
npm run serve
```

Then open <http://127.0.0.1:4173>.

The application has no external runtime asset dependency. `npm` dependencies
are used for development and browser testing.

## Validate and test

```sh
npm run check
npm test
```

Install Chromium once and run the desktop/mobile browser suite with:

```sh
npx playwright install chromium
npm run test:e2e
```

Build the deployable static site into `dist/`:

```sh
npm run build
```

## Android

The Android project wraps the same local web assets, so its analysis behavior
and offline editor stay aligned with the website. It requires JDK 17 and an
Android SDK capable of compiling API 36.

```sh
cd android
./gradlew :app:assembleDebug
```

The debug APK is produced under `android/app/build/outputs/apk/debug/`. A
production bundle must be signed before publication. See
[android/README.md](android/README.md) for release details. No public Android
download is currently promised by this repository.

## Deployment

The website is deployed as static files through GitHub Pages. A push to `main`
triggers `.github/workflows/pages.yml`, which validates the source, runs unit
tests, builds `dist/`, and deploys the Pages artifact. GitHub Pages must be
configured to use **GitHub Actions** as its source.

The custom domain `chandas.org` points to the GitHub Pages deployment. The
Android application is built and released separately.

## Project map

| Path | Purpose |
| --- | --- |
| `meter_analysis.js` | Unicode syllable analysis, meter scoring, validation, and prāsa |
| `mishra.json` | Attributed baseline fixed-vṛtta catalog |
| `structural_meters.json` | Versioned structural, mātrā, aṃśa, and sourced fixed-meter extensions |
| `app.js` | Composer UI, templates, URL import/share, and local state orchestration |
| `poem_store.js` | On-device saved poems, export, backup, and restore |
| `strong_template.js` | Structured fixed-vṛtta composition model |
| `shithila_dvitva.js` | Optional, isolated śithila-dvitva recomputation |
| `service-worker.js` | Offline shell and update lifecycle |
| `documentation.html` | User-facing Learn page and supported-meter catalog |
| `requirements.md` | Product and correctness requirements |
| `ROADMAP.md` | Post-MVP engineering plan and completed capabilities |
| `docs/` | Rule packets and future script-expansion research |
| `tests/` | Unit, static, persistence, and Playwright browser tests |
| `android/` | Offline Android wrapper |

## Contributing to meter rules

Correctness is more important than adding a long list of impressive names.
Meter changes should include:

1. A primary or otherwise reviewable source.
2. A machine-readable rule that does not special-case the displayed meter
   name in UI code.
3. Positive, negative, incomplete, and ambiguous Unicode examples.
4. Source-range tests for every reported violation.
5. An honest completeness label for rules or variants not yet encoded.
6. Expert review before a provisional native rule is promoted as exact.

Do not rewrite the attributed `mishra.json` baseline to add structural
behavior. Add independently sourced extensions to the versioned structural
catalog. Preserve user-authored text exactly even when analysis uses a
normalized or alternate internal interpretation.

Start with [requirements.md](requirements.md), then consult
[ROADMAP.md](ROADMAP.md) and the relevant rule packet under `docs/rules/`.

## Privacy

- Composition analysis happens on the device.
- Drafts and saved poems remain in local browser/app storage unless the user
  explicitly copies, shares, exports, or places them in an analysis URL.
- Chandas.org has no per-user cloud database and is designed not to incur
  storage charges on a user's behalf.
- Production traffic uses privacy-conscious aggregate GoatCounter page/script
  events without sending composition text.

See [privacy.html](privacy.html) for the user-facing policy.

## Copyright and license

Copyright © 2025–2026 Ganesh Krishna Shankarathota.

Except where a file or notice says otherwise, the original Chandas.org source,
interface, documentation, and rule structures are licensed under
[GNU GPL version 3 only](LICENSE.md) (`GPL-3.0-only`). There is no “or any later
version” option.

Third-party material retains its own attribution and terms. See
[COPYRIGHT.md](COPYRIGHT.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
