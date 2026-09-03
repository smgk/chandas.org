<!--
Copyright © 2025–2026 Ganesh Krishna Shankarathota
SPDX-License-Identifier: GPL-3.0-only
-->

# English Prosody Analysis Plan

**Status:** M1 through M5 complete; M6 awaits owner approval

**Updated:** 2026-09-02

**Approval gate:** Do not begin M6 accentual and alliterative integration until the
project owner explicitly approves it.

## 1. Conclusion

English meter support is feasible, but it must be implemented as a stress-based
analyzer beside the existing Indic Guru–Laghu analyzer. English verse normally
organizes stressed and unstressed syllables rather than short and long
syllables. Reusing Guru/Laghu classification would therefore produce
misleading results.

The safest first release is an explicit **English · stress meter** input mode.
It should use an offline pronunciation lexicon, retain alternative
pronunciations, align pronounced syllables to the user's original spelling,
and compare whole-line candidates against weak/strong metrical grids. It must
express uncertainty rather than marking every plausible variation as an error.

## 2. Scope and terminology

In this plan, “English meters” means meters conventionally used in English,
regardless of where their ancestors originated. Iambic pentameter, for
example, is central to English poetry even though the terminology and formal
history are not exclusively English.

Meter and poetic form are related but distinct:

- **Meter** describes the rhythmic organization of a line, such as iambic
  pentameter.
- **Form** combines line count, stanza organization, meter, rhyme, and
  sometimes repetition, such as an English sonnet.

Chandas should rank the base meter first. Once enough verse is present, it may
add a likely form without filling the meter list with rhythmically duplicate
entries.

## 3. English metrical systems

| System | Primary evidence | Examples | Planned priority |
| --- | --- | --- | --- |
| Accentual-syllabic | Syllable count and alternating stress | Iambic pentameter, trochaic tetrameter | Initial release |
| Accentual | Number of stressed beats; slack syllables vary | Ballad, nursery rhyme, modern alliterative verse | Initial/second release |
| Syllabic | Syllables per line | Fixed syllable-count poems | Initial release |
| Alliterative | Stresses, half-lines, caesura, alliteration | Old English-derived verse | Later |
| Sprung rhythm | Stress-led feet with variable unstressed syllables | Gerard Manley Hopkins | Later |
| Quantitative | Long and short syllables | Experimental quantitative English verse | Deferred |

The core weak/strong foot signatures are:

```text
Iamb       ˘ /       WS
Trochee    / ˘       SW
Anapest    ˘ ˘ /     WWS
Dactyl     / ˘ ˘     SWW
```

Spondees and pyrrhics should initially be treated as substitutions inside a
dominant meter, not as common top-level suggestions. Amphibrachic realization
should be considered where it helps describe limericks and other ternary
verse, without forcing every ternary line into one footing convention.

## 4. Initial catalog

### 4.1 Base line meters

- Iambic dimeter, trimeter, tetrameter, pentameter,
  hexameter/Alexandrine, and heptameter/fourteener.
- Trochaic dimeter through pentameter, common catalectic forms, and trochaic
  octameter.
- Anapestic dimeter, trimeter, and tetrameter.
- Dactylic dimeter, tetrameter, and English dactylic hexameter.
- Generic two-, three-, and four-beat accentual lines.
- User-selected syllabic line counts and stanza patterns.

Popularity metadata should keep iambic pentameter, iambic tetrameter, common
measure, and other widely used patterns above obscure mathematically possible
combinations when their metrical evidence is comparable. Popularity must never
override a clearly better match.

### 4.2 Named forms built on those meters

- Blank verse: unrhymed iambic pentameter.
- Heroic couplets: rhyming iambic-pentameter pairs.
- Common measure: alternating four- and three-stress iambic lines, normally
  8/6/8/6.
- Ballad meter: alternating four- and three-beat lines, commonly `ABCB`.
- Long measure: 8/8/8/8.
- Short measure: 6/6/8/6.
- Fourteener and Poulter's measure.
- Limerick: normally three/three/two/two/three beats with `AABBA`, accepting
  reviewed anapestic and amphibrachic realizations.
- English, Spenserian, and Petrarchan sonnet forms.
- Rhyme royal, ottava rima, terza rima, and Spenserian stanza.

Before enough lines exist to identify a form, the UI should say only what the
evidence supports—for example, **iambic pentameter**, not **blank verse**.

## 5. Why English scansion is difficult

English spelling does not determine pronunciation reliably. Words such as
`fire`, `flower`, `every`, `heaven`, and `poem` may have alternate syllabic
realizations. Words such as `record`, `conduct`, and `invalid` may depend on
part of speech or meaning. Archaic contractions, names, dialect, and deliberate
poetic elision add more choices.

Lexical stress and metrical stress are also not identical:

- The pronunciation lexicon supplies primary, secondary, and unstressed
  syllables.
- Monosyllabic content words are normally prominent but can participate in
  substitutions.
- Function words such as articles, conjunctions, pronouns, prepositions, and
  auxiliaries are frequently flexible.
- Syntax and meaning influence sentence prominence.
- A poet may use initial inversion, spondees, pyrrhics, feminine endings,
  catalexis, resolution, or elision while remaining within the chosen meter.

The engine must therefore preserve more than one possible pronunciation and
scansion until the line and poem provide enough evidence. Automatic English
scansion is an interpretation with confidence, not a mechanical fact like a
dictionary lookup.

## 6. Architecture

### 6.1 Keep the Indic analyzer isolated

Do not add Latin letters to the Indic script table or reinterpret the existing
Roman-transliteration mode. The English analyzer should be a sibling module
with its own tokenization, pronunciation, stress, catalog, and scoring rules.
It should return the same source-range-oriented presentation contract wherever
practical so the editor can reuse rendering infrastructure safely.

### 6.2 Explicit input selection

ASCII English and Romanized Indic text are inherently ambiguous. `rama`, for
example, could be an English name or Indic transliteration. Add
**English · stress meter** to the existing input-encoding selector and do not
change current automatic Roman-Indic behavior.

Later, Chandas may suggest English mode when dictionary coverage and sentence
evidence are strong, but it must not silently switch analysis traditions.

### 6.3 Pronunciation layer

Use a pinned release of the Carnegie Mellon Pronouncing Dictionary as the
initial source. It contains more than 134,000 North American English entries,
alternative pronunciations, vowel phonemes, and lexical stress values. Its
documented terms permit research, commercial use, and redistribution while
requesting acknowledgement.

For each source word retain:

```text
word source range
pronunciation alternatives
phoneme sequence
syllable stress sequence: 0, 1, 2
pronunciation provenance
confidence
```

The line parser, not a greedy word lookup, should choose among alternative
pronunciations. A user must be able to override an uncertain word's syllable
count, stress, and elision. Overrides remain on-device and travel in an
analysis link only when needed to reproduce the result.

### 6.4 Unknown words

Use a small deterministic grapheme-to-phoneme fallback for names, new words,
and inflections not present in the dictionary. Its output must be marked
**guessed**. Unknown-word output must never appear as certain merely because it
fits the selected meter.

An early implementation should prefer understandable rules and user
correction over an opaque model. A later learned ranker may improve guesses if
it can remain offline, reproducible, suitably licensed, and small enough for
the website and Android app.

### 6.5 Source alignment

CMUdict identifies pronounced vowels but does not provide character ranges in
the authored spelling. Chandas needs a separate alignment pass:

1. Identify likely written vowel nuclei and conventional syllable boundaries.
2. Align pronounced vowel phonemes to written nuclei with dynamic programming.
3. Handle silent `e`, vowel digraphs, consonant-plus-`le`, apostrophes,
   contractions, and common exceptional endings.
4. Preserve punctuation and the exact authored spelling.
5. Attach a confidence score to every internal word boundary.

If internal letter-to-syllable alignment is uncertain, the UI should keep the
word visually intact and place its sequence of stress marks over the word. It
must not split or rewrite the word merely to make the display look definite.

### 6.6 Constraint-based metrical parser

For each line:

1. Generate viable pronunciation and lexical-stress sequences.
2. Generate candidate metrical positions for applicable meters.
3. Align linguistic prominence with each weak/strong template.
4. Apply meter-family variation rules and weighted constraints.
5. Keep tied or near-tied parses when the distinction is genuinely ambiguous.
6. Combine evidence across completed lines to rank the poem's dominant meter.

The initial parser should understand:

- initial inversion in an iambic line;
- feminine endings;
- catalectic trochaic endings;
- spondaic and pyrrhic substitutions;
- optional initial slack in ternary meters;
- one- or two-syllable metrical positions where the selected tradition allows
  resolution;
- alternate dictionary pronunciations;
- flexible monosyllabic function words; and
- incomplete-line prefixes that remain compatible with a meter.

The result should explain a line as, for example, **regular iambic pentameter
with an initial inversion**, rather than reducing every variation to a red
syllable.

### 6.7 Rhyme and form layer

English perfect rhyme conventionally compares the final stressed vowel and
the sounds following it. The pronunciation layer can therefore support:

- perfect end rhyme;
- masculine and feminine rhyme;
- stanza rhyme schemes; and
- form inference from meter, line count, stanza shape, and rhyme.

Slant rhyme, eye rhyme, internal rhyme, and dialect-sensitive rhyme should be
later, separately labeled capabilities. Rhyme should begin as advisory rather
than a hard red violation.

## 7. Scoring and confidence

The engine should distinguish the abstract metrical grid from the likely
spoken realization. Suggested initial penalty classes are:

- **Hard conflict:** no retained pronunciation can supply the required number
  of syllables, or a fixed lexical stress maximum is forced into a strongly
  prohibited position.
- **Ordinary variation:** documented inversion, feminine ending, catalexis,
  or accepted substitution.
- **Flexible realization:** promotion or demotion of a context-sensitive
  monosyllable.
- **Uncertain evidence:** unknown word, multiple equally good pronunciations,
  or low-confidence source alignment.
- **Incomplete:** untyped suffix positions, which are not violations.

Candidate ranking should combine line fit, number of completed matching lines,
consistency across the stanza, rule severity, uncertainty, and a modest
editorial popularity prior. Exact evidence must always outrank popularity.

## 8. Composer experience

English mode should preserve the current unobtrusive Chandas interaction:

- faint `˘` and `/` stress marks above the original text;
- subtle vertical foot boundaries and centered foot names;
- line-local syllable and beat counts;
- cursor status such as `syllable 7 · beat 4`;
- candidate details such as `9/10 syllables · strong iambic prefix`;
- a selected-meter signature such as `˘ / × 5`;
- a whole-verse Ghost guide appropriate to the selected line or stanza form;
- red only for unavoidable selected-meter departures; and
- a small uncertainty control for alternate or guessed pronunciation.

The user should be able to tap an uncertain word and choose another
pronunciation without opening a large settings panel.

Strong templates should follow later. English words routinely occupy several
metrical positions, so a naïve slot-per-syllable editor would fragment words
and repeat the class of problem already solved for Indic conjuncts.

## 9. Offline data and footprint

The upstream CMU dictionary is approximately 3.45 MB uncompressed. The first
engineering spike should measure two derived packs:

- a compact word-to-stress pack for meter analysis; and
- an optional phoneme/rime pack for rhyme analysis.

A preliminary expectation for the stress pack is roughly 0.6–1 MB compressed,
but this is not an acceptance figure until a deterministic build measures it.
M2 measured the pinned stress-only pack at 2,532,230 bytes uncompressed and
462,026 bytes with gzip level 9 (126,045 spellings and 129,142 distinct stress
patterns).

The English data must not increase the initial Indic page download:

- Load it only when English mode is first selected.
- Cache the pinned pack for subsequent offline use.
- Offer a clear offline-ready state after the pack is stored.
- Bundle it directly in the eventual Android release.
- Keep analysis entirely on-device; no pronunciation or poem text goes to an
  API.

## 10. Corpus and validation

Build an expert-reviewed, redistributable corpus covering at least:

- Shakespeare: iambic pentameter and sonnets;
- Milton: blank verse;
- Wordsworth: iambic tetrameter;
- Blake: catalectic trochaic tetrameter;
- Byron: anapestic tetrameter;
- Longfellow: English dactylic hexameter;
- Dickinson and public-domain hymns: common measure;
- child-safe Edward Lear limericks;
- public-domain nursery rhymes: accentual meter;
- deliberately ambiguous lines and documented alternative scansions; and
- negative examples differing by one syllable, one fixed stress, an ending,
  or a stanza rule.

The University of Virginia's *For Better For Verse* provides more than forty
expert-scanned teaching poems and is a valuable validation lead. Confirm the
redistribution status of its annotations before copying them. Public-domain
poem text may instead be combined with independently reviewed Chandas
annotations.

Measure:

- dictionary and fallback word coverage;
- syllable-count accuracy;
- whether the accepted human scansion is among retained alternatives;
- top-one and top-three meter classification;
- false red-violation rate;
- source-range reconstruction;
- live-analysis latency on desktop and Android Firefox; and
- absence of regressions in every existing Indic and Roman-transliteration
  test.

## 11. Milestones

### M1 — English rule specification and golden corpus

**Status:** Complete in version 1.35.0

- Pin primary and pedagogically authoritative references.
- Define the initial meter and variation schema.
- Assemble redistributable positive, negative, incomplete, and ambiguous
  examples.
- Record expert scansions and permitted alternatives independently from the
  implementation.
- Define accuracy, uncertainty, latency, download-size, and regression gates.

**Exit gate:** A reviewable rule packet and golden corpus exist before any
production detector or UI behavior is added.

### M2 — Pronunciation and source-alignment spike

**Status:** Complete in version 1.35.0

- Pin and attribute CMUdict.
- Build and measure the compact offline stress pack.
- Tokenize English while preserving source offsets.
- Retain pronunciation alternatives.
- Prototype spelling-to-syllable alignment, unknown-word fallback, and local
  pronunciation overrides.
- Decide whether the alignment quality is sufficient for letter-local marks.

### M3 — Core English stress parser

**Status:** Complete in version 1.35.0

- Implement iambic, trochaic, anapestic, and dactylic line meters.
- Add controlled variation and confidence scoring.
- Rank partial lines and whole-poem evidence without overclaiming.
- Validate against the M1 corpus and performance gates.

### M4 — English composer integration

**Status:** Complete in version 1.36.0

- Add explicit English analysis selection.
- Render stress, foot, progress, uncertainty, and selected-meter feedback.
- Add Ghost guides and URL/local-state persistence.
- Lazy-load and offline-cache the English data pack.
- Preserve all existing Indic behavior and load cost.

### M5 — English rhyme and named forms

**Status:** Complete in version 1.41.0

- Detect perfect rhyme and rhyme schemes.
- Add blank verse, heroic couplets, common/ballad/long/short measure,
  limericks, sonnets, and selected stanza forms.
- Keep form inference subordinate to meter and available evidence.

### M6 — Accentual and alliterative meters

- Add generic two-, three-, and four-beat verse.
- Add modern alliterative verse with half-line and caesura guidance.
- Treat genuine Old English language and Sievers-type classification as a
  separate researched extension rather than pretending modern pronunciation
  data can analyze *Beowulf* correctly.

### M7 — Advanced English prosody

- Sprung rhythm.
- Slant and internal rhyme.
- Dialect profiles and improved historical pronunciation.
- Strong templates designed around whole words.
- Learned custom English stress forms.

## 12. Risks and safeguards

- **Roman-input conflict:** require explicit English selection.
- **False precision:** retain alternatives and show uncertainty.
- **Dialect bias:** identify the initial lexicon as mainly North American and
  support local overrides before claiming broader dialect coverage.
- **Unknown names:** mark guesses and make correction easy.
- **Catalog clutter:** rank common meters prominently without overriding fit.
- **Copyright:** use public-domain poem text or separately permitted excerpts;
  record annotation rights.
- **Dependency risk:** derive a pinned, audited static data pack rather than
  calling an external service.
- **Indic regressions:** keep modules and test corpora isolated.

## 13. Research references

- [Poetry Foundation: Meter](https://www.poetryfoundation.org/education/glossary/Meter)
- [Poetry Foundation: Foot](https://www.poetryfoundation.org/education/glossary/Foot)
- [Poetry Foundation: Stress](https://www.poetryfoundation.org/education/glossary/stress)
- [Poetry Foundation: Accentual verse](https://www.poetryfoundation.org/education/glossary/accentual-verse)
- [Poetry Foundation: Syllabic verse](https://www.poetryfoundation.org/education/glossary/syllabic-verse)
- [Poetry Foundation: Common measure](https://www.poetryfoundation.org/education/glossary/common-measure)
- [Poetry Foundation: Blank verse](https://www.poetryfoundation.org/education/glossary/blank-verse)
- [Poetry Foundation: Rhyme](https://www.poetryfoundation.org/education/glossary/rhyme)
- [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict)
- [Prosodic metrical parsing documentation](https://github.com/quadrismegistus/prosodic/blob/master/docs/methods/metrical-parsing.qmd)
- [Machine Learning for Metrical Analysis of English Poetry](https://aclanthology.org/C16-1074/)
- [ZeuScansion](https://jlm.ipipan.waw.pl/index.php/JLM/article/view/102)
- [For Better For Verse](https://scholarslab.lib.virginia.edu/work/for-better-for-verse/)

## 14. Next decision

M1–M5 now provide the sourced rule packet, pinned offline stress and rhyme
lexicons,
source-aligned pronunciation alternatives, 17-meter catalog, ambiguity-aware
parser, public-domain corpus, explicitly selected composer experience, and a
separate advisory layer for perfect end rhyme and named poetic forms.
The English pack remains outside the initial load and core cache. The next
decision is whether to approve **M6 — accentual and alliterative meters**.
