<!--
Copyright © 2025–2026 Ganesh Krishna Shankarathota
SPDX-License-Identifier: GPL-3.0-only
-->

# English stress-meter rules — English Ear v2

**Rule version:** 2.0.0

**Analysis system:** `english-stress`
**Status:** engineering-reviewed baseline; expert literary review remains
welcome

## Purpose and boundary

English meter is analyzed from syllable count and relative stress, not from
Indic Guru/Laghu quantity. This packet therefore governs a separate analyzer.
It does not add Latin letters to the Indic analyzer and it does not change the
meaning of the existing Roman-transliteration modes.

`W` denotes a metrically weak position and `S` a metrically strong position.
The four initial foot families are:

| Foot | Canonical grid | Common line lengths in the first catalog |
| --- | --- | --- |
| Iamb | `WS` | 2–7 feet |
| Trochee | `SW` | 2–5 and 8 feet |
| Anapest | `WWS` | 2–4 feet |
| Dactyl | `SWW` | 2, 4, and 6 feet |

The v2 catalog also includes two-, three-, and four-beat **accentual**
lines. Their signatures count principal beats rather than syllables; pickups
and the amount of unstressed slack may vary.

These definitions follow the Poetry Foundation's pedagogical descriptions of
[meter](https://www.poetryfoundation.org/education/glossary/Meter),
[foot](https://www.poetryfoundation.org/education/glossary/Foot), and
[stress](https://www.poetryfoundation.org/education/glossary/stress). The
constraint and scoring model is informed by the documented approach of the
open-source [Prosodic](https://github.com/quadrismegistus/prosodic) project;
the Chandas implementation and annotations are original.

## Pronunciation evidence

The pronunciation layer consumes CMUdict lexical stress:

- `0`: unstressed;
- `1`: primary stress;
- `2`: secondary stress.

All dictionary alternatives survive into line analysis. An exact dictionary
entry is `dictionary` confidence; a regular possessive derived from it is
`derived`; a local user override is `certain`; and an out-of-vocabulary rule
is `guessed`. “Exact meter” never upgrades a guessed pronunciation to a
certain pronunciation.

Primary stress normally prefers `S`, unstressed prefers `W`, and secondary
stress is intermediate. Monosyllabic function words may be promoted or
demoted at low cost. A primary-stressed polysyllabic syllable in `W`, or an
unstressed content syllable in `S`, is stronger contrary evidence.

For multiply pronounced words, a conservative local grammar cue may rank one
reading first—for example, *the suspect* versus *we suspect*. This is a
contextual preference, not a deletion: all dictionary readings remain
available, and the writer may tap the word to choose or enter the spoken
stress pattern. Such overrides are source-local and travel with local saves
and analysis links.

Binary and ternary meters use different mismatch profiles. Ternary verse
protects its principal beat more strongly while allowing greater freedom in
the weak positions. Completed-line evidence may help an ambiguous line follow
the poem's dominant family, but near-equal scans remain visible.

## Controlled variations

M3 admits only the following named departures. They are encoded on a meter
family, scored, and reported; the parser does not silently invent arbitrary
feet.

- **Initial inversion:** the first `WS` of an iambic line may surface as
  `SW`.
- **Feminine ending:** an iambic line may carry one final weak syllable.
- **Catalexis:** a trochaic or dactylic line may omit its final weak
  position.
- **Initial slack omission:** an anapestic line may omit its first weak
  position.
- **Weak resolution:** one weak metrical position may be realized by two
  syllables where enabled.
- **Promotion and demotion:** flexible function words can bear or relinquish
  a beat without being called a hard violation.
- **Substitution evidence:** other stress clashes remain visible in the cost
  and deviation list; they do not automatically disqualify the dominant
  meter.

The release does not claim full syntactic parsing, historical pronunciation,
dialect inference, sprung rhythm, or genuine Old English scansion.

## Result vocabulary

- **Exact:** complete line, no missing or extra syllables, normalized fit
  score at most `0.08`.
- **Compatible:** complete line with a controlled or light stress variation,
  score at most `0.22`.
- **Approximate:** complete line with stronger conflicts, or with an
  unlicensed missing/extra syllable.
- **Incomplete:** a user-requested partial line is a valid prefix of the
  candidate grid.
- **Ambiguous:** two candidates or pronunciation realizations remain close
  enough that the available text does not justify choosing one exclusively.
- **Guessed pronunciation:** one or more words used the deterministic
  out-of-vocabulary fallback.

Popularity is only a small tie-breaker. It may order similarly fitting meters
but must not defeat materially better metrical evidence.

## Source alignment contract

Every authored word keeps its original start/end offsets. Pronounced
syllables are aligned to likely written vowel nuclei without rewriting the
text. Silent final `e`, vowel digraphs, consonant-`le`, apostrophes, and Unicode
diacritics receive deterministic handling. Low-confidence internal boundaries
must be reported as such. Punctuation and line breaks remain outside the word
tokens and can always be reconstructed from the source.

## Golden-corpus policy

`examples/english_prosody_corpus.json` uses public-domain poem text with
original Chandas metadata and expected meter assertions. It contains positive,
variant, incomplete, ambiguous, and negative cases. The University of
Virginia's *For Better For Verse* is a useful external validation reference,
but its repository publishes no clear redistribution license; none of its
annotations are copied into this corpus.

## M1–M3 gates

- Every golden positive places the expected meter within its recorded top-N
  bound; strict fixtures require top-one.
- Every source range is ordered, lies inside the original line, and extracts
  exactly the reported text.
- Alternate pronunciations, overrides, unknown-word confidence, incomplete
  prefixes, and every controlled variation have tests.
- A 2,000-character English composition completes in under 300 ms on the
  project CI runner after the lexicon has loaded.
- The compact stress data is pinned, attributed, deterministic, and below
  2.5 MB uncompressed and 900 KB gzip-compressed.
- The English data is not part of the core PWA pre-cache or initial HTML load
  before M4.
- The complete existing Indic, transliteration, storage, static, and browser
  test suites remain green.

## References

- [Poetry Foundation: Meter](https://www.poetryfoundation.org/education/glossary/Meter)
- [Poetry Foundation: Foot](https://www.poetryfoundation.org/education/glossary/Foot)
- [Poetry Foundation: Stress](https://www.poetryfoundation.org/education/glossary/stress)
- [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict)
- [Prosodic metrical parsing documentation](https://github.com/quadrismegistus/prosodic/blob/master/docs/methods/metrical-parsing.qmd)
- [For Better For Verse](https://scholarslab.lib.virginia.edu/work/for-better-for-verse/) — validation lead only
