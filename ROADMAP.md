# Chandas.org Roadmap

**Status:** Active post-MVP plan

**Updated:** 2026-08-30

**Baseline:** `mvp-baseline`

This roadmap records what remains after the large post-MVP implementation
cycle. `requirements.md` remains the product authority. Detailed English
research is in [englishprosodyplan.md](englishprosodyplan.md).

## Completed foundation

The following work has shipped in the repository and is no longer an upcoming
roadmap item:

- Offline-first website/PWA and Android wrapper sharing the same static assets.
- Kannada, Devanagari, Telugu, and Gujarati Guru–Laghu analysis with
  source-safe inline rendering.
- Fixed vṛtta, Anuṣṭubh vipulā, mātrā, aṃśa, Kannada structural, Telugu deśi,
  and initial Gujarati traditional meter catalogs.
- Ranked partial/exact detection, stanza-level selection, prāsa, karṣaṇa,
  śithila-dvitva, scansion groups, whole-verse Ghost guides, and fixed-vṛtta
  Strong templates.
- IAST, ISO 15919, ITRANS, and Harvard-Kyoto analysis plus reversible
  whole-buffer conversion among supported native and Roman schemes.
- Anonymous recovery, named saved poems, readable text export, full backup and
  restore, analysis links, and per-poem sharing without a Chandas cloud
  database.
- On-device custom-form learning and validation.
- Offline Kannada and Sanskrit synonym suggestions with metrical-fit guidance.
- User-facing Learn, About, privacy, roadmap, examples, update notification,
  and four interface localizations.

Some native meter entries remain provisional until scholarly examples and
exception rules are reviewed. Engineering support does not by itself promote
a provisional entry to an exact scholarly claim.

## Current milestones

### M1 — English rule specification and golden corpus

**Status:** Proposed; not started; explicit owner approval required

- Pin authoritative descriptions for the first English meter families.
- Define accepted variations and confidence semantics before writing the
  detector.
- Assemble redistributable positive, negative, incomplete, and ambiguous
  examples with reviewed scansions.
- Define accuracy, latency, offline-size, and Indic-regression gates.

**Exit gate:** A reviewable rule packet and golden corpus exist. No production
English analyzer or UI behavior is part of M1.

### M2 — English pronunciation and source alignment

- Pin and attribute an offline pronunciation source, initially CMUdict.
- Build and measure a compact stress lexicon.
- Preserve pronunciation alternatives, source ranges, and confidence.
- Prototype spelling-to-syllable alignment, unknown-word fallback, and local
  pronunciation overrides.
- Keep English selection explicit so ASCII English cannot silently replace
  Romanized Indic analysis.

### M3 — Core English meter analyzer

- Implement iambic, trochaic, anapestic, and dactylic meters.
- Model common inversion, substitution, feminine ending, catalexis,
  resolution, and incomplete-prefix behavior.
- Rank whole-line and whole-poem evidence while retaining genuine ambiguity.
- Keep English stress analysis isolated from Indic Guru–Laghu classification.

### M4 — English composer experience

- Render weak/strong marks, foot boundaries, line and cursor counts, selected
  meter deviations, uncertainty, and Ghost guides on the authored spelling.
- Lazy-load and offline-cache the English data pack so the Indic startup size
  is unchanged.
- Preserve URL sharing, local recovery, accessibility, mobile behavior, and
  Android-compatible static assets.

### M5 — English rhyme and named forms

- Add perfect end-rhyme and rhyme-scheme analysis.
- Recognize blank verse, heroic couplets, common and ballad measure,
  limericks, sonnets, and selected stanza forms.
- Keep form inference separate from its underlying line meter so equivalent
  rhythm names do not crowd the candidate list.

### M6 — Finish reviewed Indic rule families

- Complete scholarly review gates for Kanda, Ragale, Ṣaṭpadi, Tripadi,
  Sāṅgatya, Akkara, Telugu yati-maitri, Gujarati pronunciation-dependent
  realizations, and unresolved historical variants.
- Complete internal Āryā-family restrictions.
- Add family-aware Strong guidance only after a rule family and corpus justify
  the slot model.
- Continue the sourced, child-safe example corpus and promote provisional
  claims individually.

### M7 — Android distribution

- Rebuild the wrapper from the settled web assets.
- Complete device, offline-update, file hand-off, accessibility, and backup
  testing.
- Establish reproducible signing, release notes, privacy disclosure, and a
  public download or store channel.
- Keep the website deployable independently while Android is prepared.

### M8 — Further language and prosody expansion

- Add additional Indic scripts one at a time using the existing
  normalization, source-range, golden-corpus, and regression gates.
- Expand English into accentual and modern alliterative verse, then separately
  research genuine Old English and sprung rhythm.
- Add optional performance/timing layers to custom forms without changing the
  reproducible written-text model.
- Improve dictionary register, dialect, and provenance labels where licensed
  evidence permits.

### M9 — Optional user-owned infrastructure

- Evaluate client-side-compressed analysis links before considering any
  hosted short-code service.
- Keep plain versioned analysis links as the permanent free and offline
  fallback.
- Improve Android file hand-off for text export and full backup.
- Do not introduce accounts, a paid database, or recurring cloud-storage
  liability without a separate product decision and approved privacy model.

## Delivery rules

1. Pin and record sources and licenses before importing data or examples.
2. Build a reviewable rule packet and corpus before implementing a new meter
   family.
3. Preserve the exact authored text and source ranges.
4. Distinguish exact, compatible, approximate, incomplete, ambiguous, and
   unsupported results.
5. Keep optional language traditions isolated from existing analyzers.
6. Test positive, negative, partial, ambiguous, offline, mobile, performance,
   and migration behavior.
7. Promote provisional rules only after the relevant scholarly gate.

## Immediate approval gate

The next proposed work is **M1 — English rule specification and golden
corpus**. Do not start it until the project owner explicitly approves M1.
