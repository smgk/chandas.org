# Chandas.org Roadmap

**Status:** Active post-MVP plan

**Updated:** 2026-08-13

**Baseline:** `mvp-baseline`

This roadmap turns the post-MVP requirements into an implementation order. It
is a living plan; `requirements.md` remains the product authority.

## Product priorities

1. Improve the correctness and breadth of meter detection.
2. Add strong, structured composition guidance.
3. Preserve offline use and anonymous use.
4. Add features requiring external data or servers only after their licensing,
   privacy, and security questions are settled.

Native Kannada mātrā and structural meters are therefore an **immediate
post-MVP track**, not a distant “more meters someday” item.

## What works today

- Fixed Guru/Laghu vṛttas from `mishra.json`.
- Classical pathyā and na/bha/ma/ra-vipulā Anuṣṭubh in both four one-pāda
  lines and conservative two-line `8 + 8 / 8 + 8` form.
- Initial Āryā-family detection using published mātrā-group totals.
- First-class provisional Kannada Kanda validation, kept separate from
  Āryāgīti.
- Provisional Utsāha, Mandānila, and Lalita Ragaḷe detection with repeatable
  lines, pairwise antya-prāsa, no invented future lines, and both 12- and
  24-mātrā Utsāha lines.
- All six quantitative Ṣaṭpadi forms with complete six-line templates and
  short/extended-line validation, plus Uddaṇḍa and aṃśa Ṣaṭpadi.
- Provisional aṃśa-frame detection for Tripadi, Sāṅgatya, and all five Akkara
  forms, now joined by Eḷe, Sobagina Sone, Nāgavarma's Chandovatamsa,
  Akkarike and Madanavatī, and Jayakīrti's Ādivarāha.
- Historical mātrā Tripadi and both historical mātrā and aṃśa Chaupadi,
  without weakening their folk, classical, or Kagga-form neighbors.
- Sourced Kannada Campakamāle and Mahāsragdharā fixed-vṛtta extensions,
  composed with the unchanged attributed `mishra.json` baseline.
- Per-line syllable and mātrā totals, inline violations, meter ranking, and
  ghost templates.
- A compact, mutually exclusive scansion view for Guru–Laghu, realized
  aṃśagaṇa `V/B/R` boundaries, and advisory `3+5` / `5+3` mātrā gait.
- Fixed-vṛtta Strong templates with arbitrary-position entry, local recovery,
  authored-text-only copy/share, preserved blank-row placement, and
  Ghost/Strong switching.
- Candidate-specific fixed-vṛtta alignment across four one-pāda lines and two
  two-pāda half-verse lines, with bounded inference and source-local errors.
- One-shot URL verse import with exact line-break preservation,
  recovered-draft appending, and optional per-stanza meter/template selection.

The UI must not label a result “exact Kanda,” “exact Ragale,” or “exact
Ṣaṭpadi” until the relevant internal gaṇa, line-structure, and exception rules
have been implemented and reviewed.

## Delivery tracks

### Track A — Kannada meter detection

This is the next core-analysis track. Its order is:

1. General meter-rule framework and reviewed corpus
2. Kanda
3. Ragale: Mandānila, Utsāha, and Lalita
4. Ṣaṭpadi: Bhāminī first, followed by the remaining forms
5. Pañcamātrā Chaupadi: the Kagga-form written frame first
6. Additional Kannada traditions such as Tripadi, Sāṅgatya, and Akkara

### Track B — Strong template

The first strong-template slice may use fixed vṛttas while Track A's catalogs
are being reviewed. Strong templates for Kanda, Ragale, and Ṣaṭpadi must wait
for each meter family's rule model and golden corpus; the template must never
teach a simplification that the detector itself cannot justify.

### Track C — Services and language expansion

Synonyms, additional scripts, transliteration, accounts, and cloud sync follow
the core detection work. Accounts remain last because they introduce the
largest privacy, security, retention, deletion, and operational burden.

## Milestones

Engineering estimates below assume one primary developer and exclude waiting
time for scholarly review. They are planning ranges, not release promises.

### M0 — Preserve the pre-beta baseline

**Status:** Complete

- Keep the existing analyzer and catalogs versioned.
- Keep the website and Android core workflow offline-capable.
- Preserve local drafts across compatible releases.
- Do not silently reinterpret previously saved analysis.

### M1 — Generalized Kannada prosody rules

**Status:** Repeating/variable mātrā-line policies complete in catalog 2.1;
broader aṃśa and mixed-gaṇa primitives continue with later families
**Target:** Extend the framework for Ṣaṭpadi line relationships
**Estimate:** 1–2 weeks

Extend the structural catalog and evaluator so a rule can express:

- fixed, minimum, maximum, or unbounded line counts;
- relationships among lines in a stanza;
- mātrā-gaṇa, akṣara-gaṇa, aṃśa-gaṇa, and mixed-gaṇa sequences;
- alternative and optional gaṇas;
- allowed and forbidden Guru/Laghu realizations within a mātrā group;
- line-ending, position, yati, and pāda constraints;
- pairwise prāsa constraints, kept separate from rhythmic matching so the UI
  can explain which part failed;
- rules that apply to every line versus selected lines;
- exact, compatible, approximate, incomplete, and unsupported results;
- stable reason codes and original source ranges for every violation.

This milestone also decides how to handle Kannada-specific reading choices such
as śithila-dvitva. Such choices must be explicit and reviewable; they must not
silently change the baseline Guru/Laghu classification for every composition.

**Exit gate**

- Versioned catalog schema and validation.
- Unit tests for every rule primitive.
- Ranking tests proving exact matches outrank partial structural matches.
- No regression in the existing `mishra.json`, Anuṣṭubh, or Āryā-family tests.
- Equivalent web and offline Android results.

### M2 — First-class Kannada Kanda

**Status:** Engineering complete; expert rule/corpus approval pending
**Target:** Promote from provisional after the corpus gate
**Estimate:** 1–2 weeks plus review

- Replace the current `kanda` alias approximation with a first-class,
  independently versioned Kannada Kanda entry.
- Encode its reviewed line/pāda form, mātrā-gaṇa alternatives, mandatory
  positions, endings, and other accepted constraints.
- Keep Āryāgīti as its own entry; do not assume that the two names imply
  identical validation rules in every tradition.
- Add Kannada aliases and common Roman spellings.
- Show the Kanda gaṇa signature and progress in the meter reference and ghost
  guide.
- Rank Kanda independently rather than inheriting the Āryāgīti score.

**Corpus gate**

- Reviewed positive examples from more than one author or source.
- Near misses for every encoded rule.
- Incomplete-line and extra-mātrā examples.
- Examples that distinguish Kanda from Āryāgīti and nearby mātrā patterns.

### M3 — Ragale family

**Status:** Engineering complete; expert rule/corpus approval pending
**Target:** After Kanda  
**Estimate:** 2–3 weeks plus review

Implement Ragale as a variable-length composition form: it does not require a
fixed number of lines, but each applicable line follows the selected rhythmic
form.

Order:

1. **Mandānila Ragale** — four four-mātrā groups per line.
2. **Utsāha Ragale** — four or eight three-mātrā groups per line.
3. **Lalita Ragale** — four five-mātrā groups per line.

For every form:

- validate group boundaries, accepted realizations, and reviewed exceptions;
- detect a continuing run of matching lines without requiring an invented
  fixed stanza length;
- show line-local errors without marking future unwritten lines as missing;
- add pairwise prāsa checking as a separately reported rule;
- distinguish classical Ragale from later flexible forms such as Sarala
  Ragale rather than treating them as exact equivalents.

**Exit gate**

- Exact detection and validation for all three classical forms.
- Correct behavior for 2, 4, and longer line sequences.
- No false “missing stanza line” error at the end of a valid Ragale passage.
- Reviewed positive, negative, incomplete, and cross-family confusion tests.

### M4 — Ṣaṭpadi family

**Status:** Engineering complete; expert rule/corpus approval pending

**Target:** Promote from provisional after the corpus gate

**Estimate:** 3–5 weeks plus review

First implement six-line stanza parsing and relationships among lines. Then add:

1. Bhāminī Ṣaṭpadi
2. Vardhaka Ṣaṭpadi
3. Parivardhinī Ṣaṭpadi
4. Śara Ṣaṭpadi
5. Kusuma Ṣaṭpadi
6. Bhoga Ṣaṭpadi
7. Uddaṇḍa Ṣaṭpadi
8. Aṃśa Ṣaṭpadi

Each form needs its own reviewed gaṇa model. “Six lines” alone is never enough
for an exact match.

The implementation must:

- preserve the ordinary blank-line stanza model while recognizing the six
  logical lines inside a Ṣaṭpadi stanza;
- encode which lines share a pattern and which lines have extended or distinct
  endings;
- support mātrā- and aṃśa-based rules without flattening both into one total;
- report missing or extra material only after enough input exists to make that
  judgment;
- keep prāsa and optional literary constraints explainable;
- provide a structural ghost guide before adding a strong template.

The catalog now checks all six forms as full verses and provides six-line
ghost guides. Their quantitative frames, lagam restriction, and opening
dvitīyākṣara-prāsa are encoded; historical prāsa equivalences, exceptions, and
the golden corpora still require expert approval.

### M5 — Further Kannada meters

**Status:** Core aṃśa frames engineering-complete; expert rule/corpus approval
pending

**Target:** Promote families individually after their corpus gates

**Estimate:** 3–5 weeks plus review

Initial priority:

- Pañcamātrā Chaupadi (Kagga form)
- Tripadi
- Sāṅgatya
- Piriyakkara, Doreyakkara, Naḍuvaṇakkara, Eḍeyakkara, and Kiriyakkara

The Kagga-form engineering slice now recognizes the modal written frame
`5555 / 5553 / 5555 / 5551`, opening dvitīyākṣara-prāsa, line-ending
antya-prāsa, and a four-line ghost guide. It remains provisional: pādānta
lengthening, śithila-dvitva, historical equivalences, and the broader
Chaupadi family still need expert-reviewed corpora.

The shared evaluator represents Brahma, Viṣṇu, and Rudra aṃśa-gaṇas, gaṇa
alternatives, required Tripadi positions, yati boundaries, and fixed family
frames. It checks opening dvitīyākṣara-prāsa (including Tripadi's internal
first-line recurrence) while leaving melodic substitutions, sung and
historical prāsa equivalences, and sparsely attested variants provisional.

The classical aṃśa recital guide now marks every non-initial Laghu with
superscript `ಽ`, including conservative unique-meter detection and
ambiguity-safe gaṇa division. These karṣaṇa marks are display-only.

A separate folk Tripadi slice recognizes the later
`5555 / 5455 / 545` mātrā frame. It may infer one sung mātrā from a
gaṇa-final Laghu and displays that inference as superscript `ಽ`; the classical
aṃśa entry is unchanged. Broader melodic and regional realizations still need
expert-reviewed corpora.

The completed catalog 4.0 expansion adds Eḷe, historical mātrā Tripadi, historical mātrā and
aṃśa Chaupadi, aṃśa Ṣaṭpadi, Uddaṇḍa, Sobagina Sone, Nāgavarma
Chandovatamsa/Akkarike/Madanavatī, and Jayakīrti Ādivarāha as distinct,
source-labeled entries. Kannada Gītike and a separately native Utsāha remain
deferred until implementable signatures are approved.

Other mātrā, aṃśa, mixed, and regional traditions stay in the backlog and
follow the same source, corpus, expert-review, versioning, and test gates.
Meter count is not a success metric; trustworthy results are.

### M6 — Strong templates for reviewed meters

**Status:** In progress; fixed-vṛtta slice complete

**Target:** Fixed-vṛtta prototype may begin after M1; native Kannada forms
follow M2–M5

**Estimate:** 3–5 weeks for the shared editor model, then approximately one
week per meter-family presentation

- [x] Offer Ghost and Strong modes for fixed vṛttas.
- [x] Allow content to be entered at arbitrary later positions while earlier
  positions remain blank.
- [x] Store authored spans separately from empty metrical positions.
- [x] Preserve Kannada and Devanagari IME input, selection, paste, keyboard
  navigation, undo, and redo in the fixed-slot editor.
- [x] Restore partially filled fixed templates from anonymous local recovery.
- [x] Copy and share only authored text.
- [ ] Add reviewed family-specific presentations:
  - mātrā-group capacity for Kanda and Ragale;
  - six-line structural relationships for Ṣaṭpadi;
  - reviewed slot semantics for syllable-structural and aṃśa meters.

### M7 — Complete existing structural families

**Status:** Anuṣṭubh pathyā/vipulā slice complete; Āryā-family completion next

**Estimate:** 2–4 weeks plus review

- [x] Add the standard classical na-, bha-, ma-, and ra-vipulā variants while
  preserving pathyā, compact layouts, source-local errors, and conservative
  treatment of caesura and rare variants.
- Add full internal gaṇa restrictions and reviewed regional variants for the
  Āryā family.
- Revisit compatibility scoring between Sanskrit/Prakrit-derived forms and
  Kannada adaptations without merging independently governed traditions.

### M8 — Synonyms and script expansion

- Preserve the researched implementation order and adapter prerequisites in
  [Indic Script Expansion Research](docs/script-expansion.md).
- [x] Add native, offline Telugu script detection, segmentation, Guru/Laghu
  analysis, templates, analytics classification, and source-safe highlighting.
- [x] Add the isolated Telugu Sūrya/Indra-gaṇa engine and the first deśi
  catalog: Āṭaveladi, Tēṭagīti, Telugu Kandamu, Dvipada, Mañjarī Dvipada,
  Sīsamu with ettugīti layouts, Mutyāla Sarālu, Taruvoja, Madhyākkara, and
  ten named Ragaḍa gaits.
- [x] Add an offline, provenance-bearing Kannada/Telugu/Devanagari field-guide
  corpus and validate every bundled example in CI.
- [x] Audit every catalog entry against a versioned public-domain Internet
  Archive source set; keep OCR hits as research leads and expose verified
  examples separately from unresolved gaps.
- [ ] Obtain Telugu prosody review for full yati-maitri equivalence, historical
  Sīsa variants, specialist written-line conventions, and musical Ragaḍa
  licenses before promoting those rules beyond their catalog labels.
- Select synonym data whose license permits bundled web and Android use.
- Prefer an offline-first index; label meaning, register, grammatical
  differences, and metrical fit.
- Add remaining script modules one at a time with normalization and
  golden-corpus tests.
- Treat transliteration as a separate, optional layer, never as a replacement
  for preserving the original text.

### M9 — Privacy-preserving short analysis links

**Prerequisite:** Plain, versioned analysis links remain the permanent
offline fallback

- Benchmark compressed URL fragments on the Kannada and Sanskrit corpus.
- Decide whether short links expire and whether users can delete them.
- Prefer a Chandas-controlled short-code service over a product dependency on
  a third-party shortener.
- Evaluate client-side compression and encryption, with any decryption key
  retained in the URL fragment rather than sent to storage.
- Define payload limits, rate limiting, abuse controls, retention, monitoring,
  DNS, backup, and service-failure behavior before launch.
- Preserve the versioned verse, per-stanza meter choices, and template modes
  without storing analysis markup as authored text.
- Keep **Copy analysis link** working when the short-link service is offline.

### M10 — Accounts and synchronization

Before implementation, approve:

- threat model and authentication provider;
- encryption and access-control design;
- conflict-resolution behavior;
- retention, export, account deletion, and backup policy;
- version preservation for text, selected meters, catalogs, and strong
  templates.

Anonymous offline composition remains available.

## Rule and corpus workflow

No native meter moves directly from a prose description into production code.

1. **Rule packet:** collect primary/standard references, spellings, aliases,
   formal constraints, known variations, and ambiguous cases.
2. **Corpus:** collect redistributable positive examples, near misses, and
   incomplete examples in original Unicode.
3. **Independent encoding:** represent the rule in the versioned catalog
   without special-casing a meter name in UI code.
4. **Characterization:** record syllable ranges, Guru/Laghu values, mātrā
   groups, stanza structure, and expected reasons.
5. **Expert review:** approve both the rule packet and golden corpus.
6. **Implementation:** add detection, selected-meter validation, inline
   reasons, reference display, and ghost guidance.
7. **Release:** run web, Android, offline, accessibility, performance, and
   migration checks.

## Definition of done for a meter

A meter is “supported” only when:

- its source and redistribution status are recorded;
- Kannada and common Roman names are searchable;
- complete and partial input are ranked sensibly;
- exact, compatible, and approximate results are not conflated;
- selected-meter errors identify the violated rule at the correct source
  position;
- its signature is understandable without opening documentation;
- its guide represents actual constraints rather than a fabricated fixed
  Guru/Laghu sequence;
- golden positive and negative examples are expert-reviewed;
- analysis stays within the 2,000-character performance budget;
- website and bundled Android results match and work offline;
- catalog changes have an explicit version and migration behavior.

## Initial research references

These are starting points, not automatic authority for production rules:

- [Chanda Nikasha: Verification and Identification of meters in Kannada
  Prosody](https://kannadakali.com/crav/dev/docs/ChandaNikasha-English.pdf) —
  describes a rule grammar supporting mātrā, akṣara, aṃśa, mixed gaṇas,
  alternatives, constraints, and meter recognition.
- [Classical Kannada: Kanda
  Padya](https://shastriyakannada.org/database/english/literature/KANDA%20PADYA%20HTML.htm)
- [Classical Kannada:
  Ragale](https://shastriyakannada.org/database/english/literature/RAGALE%20%20HTML.htm)
- [Classical Kannada:
  Ṣaṭpadi](https://shastriyakannada.org/database/english/literature/SHATPADI%20HTML.htm)
- Nagavarma's *Chandombudhi*, Kittel's *Canarese Prosody*, and the Kannada
  prosody references listed in the Chanda Nikasha bibliography.

Production rule packets should cite page-level sources and record permission
or licensing for every bundled corpus.

## Recommended immediate work

M6 now has its fixed-vṛtta Strong-template slice: arbitrary-position slots,
IME-safe authored text, undo/redo, local recovery, Ghost/Strong switching, and
authored-text-only copy/share. Web and bundled Android assets carry the same
offline editor.

Next, complete the scholarly review gates for native Kannada families before
enabling their family-specific Strong layouts. M7's Anuṣṭubh vipulā slice is
complete; full Āryā-family gaṇa restrictions and reviewed variants are the
next independent catalog task while those reviews are underway.
