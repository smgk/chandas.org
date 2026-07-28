# Chandas.org Roadmap

**Status:** Active post-MVP plan
**Updated:** 2026-07-27  
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
- Pathyā Anuṣṭubh, without vipulā variants.
- Initial Āryā-family detection using published mātrā-group totals.
- First-class provisional Kannada Kanda validation, kept separate from
  Āryāgīti.
- Provisional Utsāha, Mandānila, and Lalita Ragaḷe detection with repeatable
  lines, pairwise antya-prāsa, and no invented future lines.
- All six quantitative Ṣaṭpadi forms with complete six-line templates and
  short/extended-line validation.
- Provisional aṃśa-frame detection for Tripadi, Sāṅgatya, and all five Akkara
  forms.
- Per-line syllable and mātrā totals, inline violations, meter ranking, and
  ghost templates.

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
5. Additional Kannada traditions such as Tripadi, Sāṅgatya, and Akkara

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
2. **Utsāha Ragale** — four three-mātrā groups per line.
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
ghost guides. Their quantitative frames and lagam restriction are encoded;
ādi-prāsa, historical exceptions, and the golden corpora still require expert
approval.

### M5 — Further Kannada meters

**Status:** Core aṃśa frames engineering-complete; expert rule/corpus approval
pending

**Target:** Promote families individually after their corpus gates

**Estimate:** 3–5 weeks plus review

Initial priority:

- Tripadi
- Sāṅgatya
- Piriyakkara, Doreyakkara, Naḍuvaṇakkara, Eḍeyakkara, and Kiriyakkara

The shared evaluator represents Brahma, Viṣṇu, and Rudra aṃśa-gaṇas, gaṇa
alternatives, required Tripadi positions, yati boundaries, and fixed family
frames. It deliberately labels melodic substitutions, prāsa, sung repetition,
and sparsely attested variants as unchecked until reviewed examples settle
their accepted scope.

Other mātrā, aṃśa, mixed, and regional traditions stay in the backlog and
follow the same source, corpus, expert-review, versioning, and test gates.
Meter count is not a success metric; trustworthy results are.

### M6 — Strong templates for reviewed meters

**Target:** Fixed-vṛtta prototype may begin after M1; native Kannada forms
follow M2–M5

**Estimate:** 3–5 weeks for the shared editor model, then approximately one
week per meter-family presentation

- Offer Ghost and Strong modes.
- Allow content to be entered at arbitrary later positions while earlier
  positions remain blank.
- Store authored spans separately from empty metrical positions.
- Preserve Kannada and Devanagari IME input, selection, paste, undo, and redo.
- Restore partially filled templates from anonymous local recovery.
- Copy and share only authored text.
- Use different presentations where the rules differ:
  - fixed slots for fixed vṛttas;
  - mātrā-group capacity for Kanda and Ragale;
  - six-line structural relationships for Ṣaṭpadi.

### M7 — Complete existing structural families

**Estimate:** 2–4 weeks plus review

- Add accepted Anuṣṭubh vipulā variants.
- Add full internal gaṇa restrictions and reviewed regional variants for the
  Āryā family.
- Revisit compatibility scoring between Sanskrit/Prakrit-derived forms and
  Kannada adaptations without merging independently governed traditions.

### M8 — Synonyms and script expansion

- Select synonym data whose license permits bundled web and Android use.
- Prefer an offline-first index; label meaning, register, grammatical
  differences, and metrical fit.
- Add script modules one at a time with normalization and golden-corpus tests.
- Treat transliteration as a separate, optional layer, never as a replacement
  for preserving the original text.

### M9 — Accounts and synchronization

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

M4 and M5 now have provisional catalog entries, rule packets, source-range
validation, whole-verse ghost guides, tests, web UI, and offline-compatible
assets through catalog `3.0.0`. Scholarly review of rules and golden corpora
remains the promotion gate.

Next, begin new M6 with a fixed-vṛtta strong-template prototype against the
stable rule interface. Native Kannada strong templates should be enabled
family by family only after their rule and corpus reviews.
