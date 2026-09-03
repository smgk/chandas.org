<!--
Copyright © 2025–2026 Ganesh Krishna Shankarathota
SPDX-License-Identifier: GPL-3.0-only
-->

# English rhyme and named forms — M5 rule packet

**Status:** Implemented in version 1.41.0; limerick fallbacks completed in 1.42.1
**Updated:** 2026-09-02

## Scope

M5 adds an advisory layer above the English line-meter analyzer. It does not
change lexical-stress analysis, select a meter, or mark a poetic form as a
source-text violation.

The layer reports:

- perfect end rhyme from the final stressed vowel through the end of the word;
- masculine endings (no syllable after that vowel), feminine endings (one or
  more), and pronunciation-dependent ambiguous endings;
- a stanza rhyme scheme, retaining `?` for endings absent from the dictionary;
- named-form matches that combine line count, meter evidence, and rhyme.

Slant rhyme, eye rhyme, internal rhyme, dialect profiles, historical
pronunciation, and semantic or spelling-based guesses are deliberately not
treated as perfect rhyme in this milestone.

## Data and reproducibility

`data/english/en-cmudict-rhyme-v1.json` is deterministically generated from the
same pinned CMU Pronouncing Dictionary revision as the M2 stress pack. The
builder strips onset sounds and stress digits, retaining the final stressed
vowel and every following phoneme as the rhyme key. Alternate dictionary
pronunciations remain alternate keys.

The data is BSD-2-Clause and retains its source revision, SHA-256 digest, and
license reference. It is loaded only after explicit English-mode selection and
is cached in the separate English offline cache. A missing rhyme pack must not
disable stress scansion.

## Initial catalog

The declarative `english_forms.json` catalog contains blank verse, heroic
couplets, common measure, ballad stanzas, long measure, short measure,
fourteener verse, Poulter's measure, strict and common limericks, English
sonnets, Spenserian sonnets, Petrarchan sonnets, rhyme royal, ottava rima,
terza rima, and the Spenserian stanza.

Strict limerick retains the anapestic three/three/two/two/three-foot model.
Common limerick is its lower-prominence fallback: it requires five lines and
perfect `AABBA` rhyme, preserves the `3/3/2/2/3` beat contour, and accepts
compatible iambic, trochaic, or anapestic line realizations. When both rules
match, only the stricter Limerick result is returned.

Limerick-y is the final fallback. It requires exactly five nonempty lines and
a fully dictionary-known `AABBA` scheme, but deliberately makes no meter claim.
It is always reported as compatible/possible, never exact. Strict Limerick
suppresses Common limerick, and either stronger match suppresses Limerick-y.

The form engine and catalog use a catalog-version query in their lazy-load
URLs. This prevents a still-active older service worker from returning stale
form rules to a newer application shell; the much larger unchanged rhyme pack
keeps its stable cache key.

Common measure accepts its `8/6/8/6` iambic shape with rhyme as advisory because
historical poems frequently use slant rhyme that M5 intentionally does not
claim as perfect rhyme. Other forms retain their declared exact rhyme schemes.
An exact label requires known rhyme endings and compatible line-meter evidence;
otherwise the interface says “Possible form” or makes no form claim.

## Sources

- [Poetry Foundation: Rhyme](https://www.poetryfoundation.org/education/glossary/rhyme)
- [Poetry Foundation: Blank verse](https://www.poetryfoundation.org/education/glossary/blank-verse)
- [Poetry Foundation: Common measure](https://www.poetryfoundation.org/education/glossary/common-measure)
- [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict)

Public-domain fixtures are recorded with provenance in
`examples/english_prosody_corpus.json`. Synthetic catalog tests isolate form
rules from the pronunciation and line-meter analyzers; they do not masquerade
as literary evidence.
