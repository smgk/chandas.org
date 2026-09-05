<!--
Copyright © 2025–2026 Ganesh Krishna Shankarathota
SPDX-License-Identifier: GPL-3.0-only
-->

# English Stress Prosody Improvement Plan

**Status:** E1–E6 implemented in version 1.50.0; E7 remains future work

**Updated:** 2026-09-05

## 1. Direction

The next English milestone should not primarily add more meter names. It
should make Chandas interpret English rhythm more like a poet and guide
composition more like a patient teacher.

This follows the project mission stated on the About page: lower the barrier
to learning prosody through composition, provide live but unobtrusive
feedback, and keep writing verse enjoyable.

## 2. Reflection on the current implementation

### What is working well

- English is explicitly selected, so it cannot interfere with Indic
  transliteration.
- Analysis stays offline and private.
- Pronunciation alternatives and uncertainty are retained.
- Authored spelling and source ranges are preserved.
- Red violations appear only after the writer chooses a target.
- Meter and poetic form remain conceptually separate.

### What needs reconsideration

#### Dictionary stress is not spoken rhythm

CMUdict supplies word-level North American pronunciations, not the prominence
of words inside a sentence. Grammar, meaning, phrasing, contrast, and
performance affect stress. A flat row of dictionary stresses is therefore
evidence, not the final scansion.

#### Meter families should not share one mismatch model

The current scorer treats weak and strong mismatches similarly across iambic,
trochaic, anapestic, and dactylic meters. Research and existing
constraint-based parsers indicate that binary and ternary meters regulate
different things. Iambic verse strongly constrains weak positions; ternary
verse often cares more that its principal beats are stressed while permitting
greater freedom among the intervening slack syllables.

This is an important cause of poor limerick behavior. A singable limerick may
retain three beats without fitting a rigid `WWS WWS WWS` sequence.

#### Forms were implemented as classifiers rather than composition tools

Keeping sonnets and limericks out of the line-meter list is formally correct,
but a writer still needs to choose a form before composing it. Waiting until a
complete stanza satisfies every condition gives help too late.

#### Current validation is too small

The initial corpus establishes that the engineering pipeline works, but it is
not broad literary validation. Complete authentic poems, alternative expert
scansions, historical pronunciation, dialect differences, and varied
performance styles need substantially more coverage.

## 3. Working model

English scansion should be treated as a sequence of related interpretations:

```text
dictionary pronunciation
        ↓
contextual spoken prominence
        ↓
possible rhythmic realizations
        ↕
underlying metrical expectation
        ↓
poem-level interpretation
```

Meter is the underlying expectation; rhythm is how the authored words play
with that expectation. Chandas should explain ordinary variations rather than
reducing every departure from a binary stress string to an error.

Useful descriptions include:

- Five-beat iambic line with an opening reversal.
- Three-beat line with a variable pickup.
- Two plausible readings.
- Likely pentameter, but one pronunciation is uncertain.

## 4. Proposed milestones

Implementation note: E1–E6 now form the English Ear v2 release. E7 remains
deliberately separate because historical language traditions and free verse
need their own evidence and interaction design.

### E1 — English Ear v2

This is the highest-priority improvement.

- Give iambic, trochaic, and ternary meters separate constraint profiles.
- Infer phrase prominence using conservative grammatical context.
- Distinguish lexical stress, likely spoken prominence, and metrical position.
- Use completed lines to infer a dominant rhythm, then reconsider ambiguous
  individual lines in that context.
- Retain several near-equal scans instead of manufacturing one correct answer.
- Report named variations rather than generic departures.

This milestone should start with a substantially larger expert-reviewed
corpus rather than tuning behavior against a few examples.

### E2 — Tap-to-correct pronunciation and stress

When Chandas is uncertain, allow the poet to tap a word and choose:

- an alternate pronunciation;
- a noun or verb realization;
- syllable contraction or expansion;
- which syllable carries the beat; or
- a custom “as I pronounce it” stress pattern.

The override should remain local and travel in an analysis link only when it
is required to reproduce the reading. Human authority is preferable to
pretending an automatic parser is infallible.

### E3 — Guided “Write as…” forms

When English mode is selected, add one quiet control:

```text
Write as: No chosen form ▾
```

Initial choices can include Limerick, English sonnet, Petrarchan sonnet, blank
verse, heroic couplets, common measure, and ballad stanza.

After selection, show only the immediate target by default:

```text
Line 6 of 14 · rhyme B · about 5 beats
```

An expanded view can show the complete structure. Form evidence should be
graded rather than all-or-nothing. For example:

```text
14 lines                    ✓
ABAB CDCD EFEF GG rhyme    6 of 7 pairs
pentameter                  12 strong, 2 plausible
overall                     Strong English-sonnet shape
```

Only a selected form should generate corrective feedback. Automatically
detected possibilities should remain advisory.

### E4 — Accentual beat mode

Implement this before full historical alliterative verse. Accentual verse
counts beats while allowing the number of unstressed syllables to vary. It
covers nursery rhymes, songs, ballads, comic verse, and much beginner
composition.

Support:

- two-, three-, and four-beat lines;
- variable pickups;
- variable slack between beats;
- the `3/3/2/2/3` limerick contour;
- optional manual beat tapping; and
- recurring cadence learned from preceding lines.

This would let Chandas recognize limerick rhythm without requiring every
line to use one debatable division into anapests or amphibrachs.

### E5 — Better rhyme evidence

Replace the perfect-rhyme-or-nothing model with separately labeled evidence:

- perfect rhyme;
- near or slant rhyme;
- feminine rhyme;
- eye rhyme;
- pronunciation-dependent rhyme;
- historical rhyme; and
- user-declared rhyme.

For an unknown or dialect-dependent rhyme, the writer should be able to tap
two endings and declare that they rhyme in the intended reading. Chandas can
remember that decision locally.

A later “Words that fit” drawer could use the existing stress and rhyme data
to suggest common words matching the remaining rhythm and rhyme target. It
should assist the poet rather than generate the poem.

### E6 — Beginner explanations

Turn analysis into small, contextual lessons:

- “A trochee replaces the opening iamb; this is common.”
- “This line has five beats although it has eleven syllables.”
- “Both pronunciations work; tap to choose yours.”
- “Your A rhyme is established. Lines 3 and 5 can return to it.”

Use progressive disclosure:

- **Beginner view:** beats, rhyme, and gentle line-shape guidance.
- **Prosody view:** feet, inversions, substitutions, lexical stress, and
  alternative scans.

### E7 — Later traditions

After the central listening and composition model is trustworthy, consider:

- syllabic composition and user-defined syllable patterns;
- modern alliterative verse with half-lines, caesura, and stressed onsets;
- historical Old and Middle English as separate language traditions;
- dialect and historical-pronunciation profiles;
- sprung rhythm;
- strong English templates designed around whole words; and
- nonjudgmental free-verse rhythm profiles.

Free verse must not appear as failed regular meter. An optional profile could
instead show recurring beats, line-length echoes, pauses, sound repetition,
and emerging patterns without declaring violations.

## 5. Suggested implementation order

1. Expand and independently review the English corpus.
2. Introduce meter-family-specific scoring.
3. Add contextual prominence and poem-level rescansion.
4. Expose pronunciation and stress correction.
5. Add the guided “Write as…” form composer.
6. Add accentual beat mode.
7. Improve rhyme evidence and word-fitting assistance.
8. Add advanced and historical traditions individually behind explicit modes.

## 6. Validation strategy

The corpus should include complete, child-safe, public-domain examples across
periods and traditions, not just isolated regular lines. It should record
multiple accepted scans where experts disagree.

Measure:

- whether a reviewed human scansion appears among the retained alternatives;
- top-one and top-three meter identification;
- form-component recall rather than only exact-form recall;
- false corrective-highlight rate;
- pronunciation and syllable-count accuracy;
- dialect and historical-rhyme uncertainty;
- live latency on desktop and Android browsers; and
- absence of regressions in Indic and Roman-transliteration modes.

For the Chandas mission, false red corrections are more damaging than a
cautious “I hear two possibilities.”

## 7. Things to avoid

- Do not expand the catalog with dozens of mathematically possible feet before
  improving interpretation.
- Do not treat CMUdict or any pronunciation dictionary as spoken truth.
- Do not silently infer English from Latin text and disrupt Romanized Indic.
- Do not require a cloud model or paid service for contextual analysis.
- Do not call a complete poetic form invalid because of one plausible
  variation or historical rhyme.
- Do not claim to detect semantic elements such as a sonnet's volta
  automatically; guide the writer instead.
- Do not treat free verse as broken metrical verse.

## 8. Research references

- [Chandas About page](about.html)
- [Harvard Guide to Prosody](https://poetry.harvard.edu/guide-prosody)
- [Poetry Foundation: Meter](https://www.poetryfoundation.org/education/glossary/meter)
- [Poetry Foundation: Accentual verse](https://www.poetryfoundation.org/education/glossary/accentual-verse)
- [Poetry Foundation: Syllabic verse](https://www.poetryfoundation.org/education/glossary/syllabic-verse)
- [Poetry Foundation: Rhyme](https://www.poetryfoundation.org/education/glossary/rhyme)
- [Poetry Foundation: Free verse](https://www.poetryfoundation.org/education/glossary/free-verse)
- [Poetry Foundation: Sprung rhythm](https://www.poetryfoundation.org/education/glossary/sprung-rhythm)
- [Folger Shakespeare Library: Write a sonnet](https://www.folger.edu/explore/write-a-sonnet/)
- [CMU Pronouncing Dictionary](https://github.com/words/cmu-pronouncing-dictionary/blob/master/readme.md)
- [Paul Kiparsky: Stress, syntax, and meter](https://www.cambridge.org/core/journals/language/article/abs/stress-syntax-and-meter/B840E2313B1426AF6DD64451977ACD6C)
- [Prosodic metrical-parsing documentation](https://github.com/quadrismegistus/prosodic/blob/master/docs/methods/metrical-parsing.qmd)
- [Machine Learning for Metrical Analysis of English Poetry](https://aclanthology.org/C16-1074/)
- [Metrical Tagging in the Wild](https://aclanthology.org/2021.eacl-main.325/)
- [ZeuScansion](https://jlm.ipipan.waw.pl/index.php/JLM/article/view/102)
- [For Better For Verse](https://scholarslab.lib.virginia.edu/work/for-better-for-verse/)

## 9. Recommended next decision

Approve or revise **E1 — English Ear v2**, beginning with corpus expansion and
family-specific scoring. This changes the English analyzer from a pattern
detector with a poetry catalog into a private, friendly companion that helps a
writer acquire an ear for verse by writing it.
