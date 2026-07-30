# Chandas.org Product Requirements

**Status:** Draft for stakeholder review

**Last updated:** 2026-07-27

**Products:** `chandas.org` website and Android application

## 1. Product Vision

Chandas.org helps a poet compose metrical verse by analyzing text while it is
being written. The product identifies each syllable as **Laghu (L)** or
**Guru (G)**, suggests the closest matching chandas (meters), and, when the
user chooses a meter, marks departures from that meter directly in the
composition.

The experience must support natural typing in Indic Unicode scripts without
interrupting the writer. Analysis and secondary controls must remain helpful
but visually unobtrusive.

## 2. Terminology and Script Scope

- **Akshara/syllable:** The unit used by the analysis engine for Guru/Laghu
  classification. The precise linguistic rules and exceptions must be
  documented with the meter corpus.
- **Laghu (L):** A light syllable.
- **Guru (G):** A heavy syllable.
- **Chandas/meter:** A metrical pattern or rule set against which a verse is
  compared.
- **Script and language:** Kannada and Devanagari are scripts; Sanskrit and
  Kannada are languages. Guru/Laghu classification is based on syllable length,
  not the language of the composition. The engine therefore detects the script
  needed for Unicode parsing but MUST NOT choose metrical rules based on a
  presumed language.

### Initial release

- Kannada-script text, including Sanskrit compositions.
- Devanagari-script text, including Sanskrit compositions.
- Unicode input produced by standard desktop and Android Indic keyboards.
- The existing segmentation and Guru/Laghu behavior in `meter_analysis.js` is
  the implementation baseline.

### Later releases

- Additional Indic Unicode scripts, added through script-specific
  segmentation/rule modules without changing the editor experience.
- Mixed-script analysis where a single composition contains more than one
  supported script.

Transliteration from Latin text is not part of the initial release unless
separately approved.

## 3. Users and Primary Journey

The primary user is a poet, student, teacher, or scholar composing or checking
metrical verse.

1. The user opens the editor and types or pastes a composition.
2. The product analyzes complete and in-progress lines without requiring a
   submit action.
3. Guru/Laghu classification appears inline on the same text.
4. A compact control lists the closest meters in ranked order.
5. The user may select a suggested meter or choose another supported meter.
6. The user may select a different meter for each stanza.
7. When a meter is selected, the user may enable a faint, non-destructive
   ghost template as a composition guide.
8. Violations of each stanza's selected meter appear inline in red while
   editing continues.
9. The user's composition is recovered locally after an accidental refresh or
   restart.
10. The user copies or shares the composition.

## 4. Release Scope

### 4.1 Minimum viable product (MVP)

- Web application at `https://chandas.org`.
- Android application using the same analysis rules and core user experience.
- Unicode-safe Kannada and Devanagari input.
- Live akshara segmentation and Guru/Laghu classification.
- Inline Guru/Laghu presentation.
- Ranked meter suggestions in a non-obtrusive dropdown.
- Stanza-level meter selection, validation, and inline violation highlighting.
- An optional ghost template for the selected stanza's meter.
- Anonymous on-device draft recovery without login.
- Copy and operating-system-supported sharing, including paths to X/Twitter and
  Facebook when those destinations are available.
- Kannada and English interface languages.
- Responsive, accessible UI with on-device analysis.
- Full offline operation of the installed Android application for the core
  composition workflow.

### 4.2 Post-MVP

- Accounts and authentication.
- Saving, naming, reopening, and syncing drafts and completed compositions.
- Synonyms for the current word in a second non-obtrusive dropdown.
- A strong template mode for structured, arbitrary-position composition while
  retaining the ghost template as an alternative.
- More Indic scripts and meter traditions.
- Optional transliteration.

## 5. Functional Requirements

Requirement keywords **MUST**, **SHOULD**, and **MAY** indicate mandatory,
recommended, and optional behavior.

### FR-1: Composition editor

1. The product MUST provide a multiline Unicode composition editor.
2. The editor MUST preserve the user's text, line breaks, punctuation, caret,
   and selection while analysis results update.
3. The editor MUST handle input-method-editor (IME) composition correctly.
   Analysis MUST NOT corrupt or prematurely commit partially composed Indic
   characters.
4. Pasting, deleting, undoing, redoing, and selecting text MUST continue to
   behave as users expect from a native text editor.
5. The website MUST be usable on current desktop and mobile browsers. The
   Android editor MUST work with commonly used Kannada and Devanagari
   keyboards.
6. The editor MUST perform analysis locally so typing does not depend on a
   network round trip.
7. The default composition font SHOULD favor fitting a useful poetic line
   without wrapping while remaining at least 16 CSS pixels on mobile and fully
   legible for Kannada and Devanagari combining marks.
8. The website MUST accept a URL-encoded verse as the raw query string in the
   form `chandas.org?<verse>`.
9. The website MUST also accept `verse` (with `text` as an alias), `meter`, and
   `template` query parameters. `template` MUST accept `ghost` and `strong`.
10. If a non-empty anonymous draft is recovered, a URL-imported verse MUST be
    appended as a new padya separated by a blank line rather than replacing the
    existing draft.
11. A URL meter value MUST resolve exact catalog IDs, displayed names, aliases,
    and common Roman spellings without diacritics. It MUST apply independently
    to each stanza imported by that URL.
12. A URL template choice MUST show the requested guide. A requested Strong
    guide MUST fall back to Ghost when Strong mode is unavailable for that
    meter family.
13. After a recognized URL import is applied, the consumed query MUST be
    removed from the visible URL without reloading the page. Refreshing MUST
    NOT append the same imported verse again.
14. Offline navigation caching MUST normalize verse-bearing navigation
    requests to the application shell and MUST NOT retain the full
    query-bearing URL as a separate cache key.
15. User documentation MUST warn that placing verse in a URL can expose it to
    browser history, messaging systems, and hosting request logs even though
    analysis remains local.
16. The meter catalog and selection control MUST remain available before any
    composition text exists. A meter selected in the empty editor MUST apply
    to the first stanza when typing begins and survive local draft recovery.
17. URL import MUST preserve authored line breaks exactly, including leading
    blank pādas used for samasyā-pūraṇa and trailing or interior blank lines.

### FR-2: Live analysis

1. Analysis MUST update automatically as the user types, pastes, deletes, or
   changes a line.
2. Analysis MUST use Unicode grapheme/akshara-aware segmentation rather than
   treating code points as visible characters.
3. Canonically equivalent Unicode input MUST produce equivalent results. Input
   MAY be normalized internally, but the exact user-entered text MUST remain
   unchanged in the editor and when copied.
4. The engine MUST identify the script for each analyzed line and apply the
   appropriate rules.
5. The engine MUST classify each analyzable akshara as Guru or Laghu and retain
   the source-text range used for inline presentation.
6. Whitespace, punctuation, verse delimiters, digits, and unsupported
   characters MUST NOT shift highlights onto the wrong text.
7. Whitespace and punctuation MUST be metrically transparent. Within a line, a
   Laghu followed by any sequence of whitespace or punctuation and then an
   akshara beginning with a conjunct MUST be classified as Guru; the
   intervening characters MUST remain outside the highlighted source range.
8. The UI MUST distinguish among:
   - valid analyzed input;
   - incomplete input still being composed;
   - unsupported script or character sequence; and
   - input the engine cannot classify with confidence.
9. Empty and partially typed lines MUST NOT be reported as meter violations.

### FR-3: Inline Guru/Laghu presentation

1. Guru/Laghu status MUST be visible on the same text being edited, not only in
   a detached result panel.
2. Guru and Laghu MUST have distinct visual treatments.
3. The meaning MUST NOT depend on color alone; a compact legend and a second
   cue such as underline style, marker, or optional L/G labels MUST be
   available.
4. Highlighting MUST remain aligned during scrolling, wrapping, font resizing,
   and responsive layout changes.
5. Updates SHOULD feel immediate and MUST NOT cause visible caret jumps,
   flicker, or layout shifts.
6. Each non-empty logical line MUST show faint, non-editable syllable and
   mātrā totals immediately above its final analyzed letter. These counters
   MUST NOT affect wrapping, source offsets, selection, analysis, copy, or
   sharing.
7. The editor MUST show the syllable ordinal and accumulated mātrā count from
   the beginning of the caret's logical line to the caret. The count MUST reset
   after every explicit line break. Moving the caret without editing MUST
   update these counts.
8. Inline styling MUST NOT divide a Kannada or Devanagari conjunct shaping
   cluster. When a metrical syllable boundary falls inside a visible conjunct,
   the analysis offsets MUST remain unchanged while the display boundary is
   moved to a shaping-safe position. An explicit ZWNJ MUST continue to prevent
   joined shaping.

### FR-4: Meter detection and suggestions

1. The engine MUST compare the current composition with a versioned catalog of
   supported meters.
2. Exact matches MUST rank above approximate matches.
3. When no exact match exists, the engine MUST return the closest applicable
   meters using a documented distance/scoring method.
4. More than one candidate MAY be returned because meters can be equally close
   or compatible with an incomplete composition.
5. Suggestions MUST update as the composition changes.
6. The suggestion control MUST show:
   - meter name;
   - exact, compatible/incomplete, or approximate status; and
   - enough compact detail to distinguish similarly ranked choices.
7. Low-confidence results MUST be labeled as suggestions rather than asserted
   as detected facts.
8. Meter names SHOULD be available in the interface language and in a
   consistent scholarly/transliterated form where applicable.
9. Scholarly meter names containing diacritics MUST remain unchanged for
   display but MUST also be searchable using unaccented and common Roman
   spellings, including `sh` for `ś`/`ṣ` and `ri` for `ṛ`.
10. Detection MUST support both fixed Guru/Laghu vṛttas and meters expressed
    through pāda structure or mātrā-group totals.
11. A pāda boundary MUST be recognized at a non-empty line break, danda,
    double danda, single Roman bar, or double Roman bar. Other punctuation
    remains metrically transparent and MUST NOT create a pāda.

### FR-5: Meter selection

1. Meter suggestions MUST appear in a compact, keyboard-accessible dropdown
   that does not obscure the composition.
2. The user MUST be able to select any supported meter, including one not in
   the current short list of closest matches.
3. Meter detection, suggestions, and selection MUST operate independently for
   each stanza.
4. For MVP, a stanza is a block of one or more non-empty lines separated from
   adjacent stanzas by one or more blank lines. The UI MUST make detected
   stanza boundaries understandable.
5. The dropdown MUST act on the stanza containing the caret and MUST clearly
   identify that stanza when more than one exists.
6. The product MUST retain each stanza's explicit selection while the user
   edits that stanza or moves among stanzas. It MUST NOT silently replace a
   selection with a newly detected meter.
7. Inserting or deleting text around stanza boundaries MUST preserve meter
   selections where the association remains unambiguous. The product MUST
   define and test how selections are handled when stanzas split or merge.
8. A user MUST be able to clear a stanza's selection and return that stanza to
   suggestion-only mode.
   The clear action MUST remain available with the selected-meter reference
   outside the expanded **Choose any meter** control.
9. When no meter has been selected for a stanza, approximate differences in
   that stanza MUST NOT be shown as errors.
10. When a meter is selected, its name and applicable signature—fixed
    Guru/Laghu pattern, structural rule, or mātrā groups—MUST remain visibly
    available for reference in the active stanza panel.

### FR-6: Selected-meter validation

1. After a meter is selected for a stanza, the engine MUST compare each
   applicable akshara/position and structural rule in that stanza with the
   selected meter.
2. Violations MUST be highlighted inline in red on the same text being edited.
3. Red MUST be accompanied by a non-color cue that is distinguishable from the
   normal Guru/Laghu treatment.
4. The UI MUST provide a concise explanation of a focused or selected
   violation, including expected and observed values where meaningful.
5. The validator MUST distinguish a genuine mismatch from a verse that is
   merely incomplete.
6. Meter-specific rules beyond a fixed G/L sequence, including line/pāda
   structure, optional positions, substitutions, and exceptions, MUST be
   representable by the meter catalog.
7. Validation and highlighting in one stanza MUST NOT be affected by the meter
   selected for another stanza.
8. Where one source range causes multiple rule failures, the UI SHOULD combine
   them without stacking unreadable decoration.

### FR-7: Copy and sharing

1. A **Copy** action MUST copy the original composition text without analysis
   markup.
2. The product MUST provide clear success or failure feedback for copying.
3. A **Share** action MUST use the platform share mechanism where available.
4. On Android, sharing MUST use the system share sheet so installed apps,
   including X/Twitter and Facebook when available, can receive the text.
5. On the web, the product MUST offer X/Twitter and Facebook share paths where
   supported by those platforms and browsers, with a copy fallback when direct
   text transfer is restricted.
6. The user MUST review or initiate the final post; the product MUST NOT publish
   automatically.
7. The default shared content MUST be the original composition only.
8. The user MAY explicitly choose to add the applicable selected meter name or
   names and a `chandas.org` link. Optional additions MUST NOT unexpectedly
   replace or truncate the composition.
9. The Share dialog MUST provide a **Copy analysis link** action with clear
   success or failure feedback.
10. A copied analysis link MUST use the canonical `https://chandas.org/`
    origin and include a versioned, URL-encoded authored composition.
11. The link MUST preserve each stanza's selected meter and Ghost/Strong mode
    independently using stable, one-based stanza parameters. For Strong mode,
    it MUST also preserve filled and unfilled slot structure without treating
    empty slots as authored characters. Unselected meters and hidden guides MAY
    be omitted.
12. Loading a copied analysis link into a clean editor MUST reconstruct the
    authored composition, per-stanza selections, supported template modes, and
    Strong slot associations. Empty Strong positions and guide symbols MUST NOT
    become authored text.
13. Plain analysis-link creation MUST remain local and available offline.
    Short-link creation that requires storage or a network service is deferred
    to its roadmap milestone.
14. Analysis links MUST round-trip leading, interior, and trailing authored
    line breaks without trimming. A Strong-mode link MUST preserve the complete
    slot matrix so an unfilled earlier pāda or metrical position remains empty
    when the recipient opens the link.

### FR-8: Anonymous local draft recovery

1. Without requiring login, the website and Android app MUST keep the current
   composition in private on-device application storage.
2. Recovery data MUST include the original text and per-stanza meter
   selections. It SHOULD include the caret/selection and interface language.
3. Recovery MUST update automatically after changes without interrupting
   typing or requiring an explicit save action.
4. After an accidental refresh, browser restart, or Android process restart,
   the user MUST be offered or shown the most recent locally recovered draft.
5. Recovery MUST work while the installed Android application is offline.
6. A user MUST be able to clear the locally recovered draft.
7. The UI MUST explain that anonymous recovery is device-local and is not
   synchronized, backed up, or associated with an account.
8. Application updates MUST preserve compatible local drafts. Any incompatible
   migration MUST protect the original text and provide a recovery/export path.

### FR-9: Synonyms (post-MVP)

1. The product SHOULD determine the current word from the caret position,
   without changing the composition.
2. A second compact dropdown SHOULD list synonyms relevant to that word's
   language and script.
3. Selecting a synonym SHOULD replace only the intended word and preserve the
   caret, surrounding punctuation, undo history, and subsequent live analysis.
4. The dropdown MUST remain closed or visually minimal until useful suggestions
   exist or the user requests it.
5. Synonyms MUST be labeled when meaning, register, gender, case, or metrical
   fit differs.
6. The source and license of synonym data MUST permit use in both the website
   and Android application.

### FR-10: Accounts and saved work (post-MVP)

1. Anonymous use MUST remain available unless a later product decision changes
   this requirement.
2. A signed-in user SHOULD be able to save both incomplete drafts and completed
   compositions.
3. Saved work SHOULD include original text, per-stanza selected meters, title,
   timestamps, completion state, and sufficient version information to
   reproduce analysis.
4. Autosave SHOULD recover recent progress without interrupting typing.
5. Users MUST be able to view, reopen, rename, and delete their own saved work.
6. Sync conflict, privacy, retention, export, and account-deletion behavior
   MUST be specified before account functionality is implemented.

### FR-11: Guided composition templates

#### FR-11.1: Ghost template (first version)

1. When a stanza has a selected meter, the UI MUST offer a **Show template**
   checkbox outside the general meter-picker expansion.
2. Enabling the checkbox MUST display a faint metrical guide associated with
   the selected stanza while preserving the ordinary free-text editor.
3. The guide MUST be presentation-only. Template symbols and empty positions
   MUST NOT become characters in the composition, be analyzed as authored
   syllables, alter source offsets, or appear in copy/share output.
4. The guide MUST show the selected meter's complete logical verse shape even
   when the user has typed only part of its first line. Existing authored
   lines MAY also retain an inline remaining-pattern hint.
5. A fixed vṛtta MUST show four logical lines. A single catalog pattern repeats
   on all four lines; a two-pattern ardhasama entry alternates `A/B/A/B`; and
   an explicit four-pattern entry uses all four patterns in order.
6. A fixed-line structural meter MUST use its cataloged line count: four lines
   for Anuṣṭubh and Kanda, six for a Ṣaṭpadi, and the declared count for future
   forms. A variable-length form such as Ragale MUST use an explicit preview
   policy and MUST NOT be presented as a fictitious fixed stanza.
7. For a fixed Guru/Laghu meter, the guide MUST show its Laghu and Guru
   signature using symbols appropriate to the selected language or active
   composition script.
8. For a structural meter, the guide MUST distinguish fixed positions from
   variable or rule-constrained positions rather than inventing a single fixed
   Guru/Laghu sequence.
9. For a mātrā meter, the guide MUST show mātrā-group capacities and progress
   rather than implying that the meter has one mandatory Guru/Laghu sequence.
10. For an aṃśa meter, the guide MUST show its Brahma/Viṣṇu/Rudra gaṇa frame
    and accepted cataloged alternatives rather than inventing fixed syllable
    weights.
11. The guide MUST follow the stanza's selected meter and MUST update or close
   predictably when that selection changes or is cleared.
12. Showing or hiding the guide MUST NOT move the caret, change wrapping,
   corrupt IME composition, or interfere with selection, undo, redo, paste,
   highlighting, scrolling, or accessibility.
13. The first-version ghost template MAY assume sequential free-text
   composition. It is not required to let the user fill a later empty metrical
   position while earlier positions remain empty.

#### FR-11.2: Strong template (post-MVP)

1. A post-MVP release MUST offer both **Ghost template** and **Strong template**
   choices when guided composition is available.
2. Strong template mode MUST provide structured, fillable metrical positions.
   The user MUST be able to populate arbitrary positions while any other
   positions remain blank.
3. Empty strong-template positions MUST remain UI/model state rather than
   literal placeholder characters in the authored composition.
4. A filled position MUST retain its association with the intended metrical
   slot when other positions are filled, cleared, or edited.
5. Strong template mode MUST support Kannada and Devanagari IMEs, Unicode
   aksharas, punctuation, whitespace, paste, selection, undo/redo, and
   accessible keyboard and touch navigation.
6. Anonymous recovery and future synchronized drafts MUST preserve the
   selected template mode, filled positions, unfilled positions, meter/catalog
   version, and enough structure to restore the guided draft without loss.
7. Switching between ghost and strong modes, or temporarily hiding a guide,
   MUST NOT discard authored text or filled-slot structure.
8. Copying or sharing MUST exclude unfilled positions and template symbols and
   MUST include only text authored by the user, subject to the existing
   optional meter-name and link settings. Empty Strong rows before or between
   authored rows MUST remain line breaks so the authored pāda keeps its verse
   position; no placeholder character may be inserted for an empty slot.
9. Fixed, structural, and mātrā meters MAY use different strong-template slot
   representations, but each representation MUST expose only constraints
   actually supported by the versioned meter catalog.
10. The first production Strong-template slice MUST be limited to fixed
    vṛttas. Strong layouts for provisional structural, mātrā, and aṃśa
    families MUST remain unavailable until that family has a reviewed rule
    model and golden corpus.
11. Strong-mode boxes MUST use shaping-safe visual syllable boundaries in
    Kannada and Devanagari. A conjunct onset MUST remain intact in the following
    box (`ಪಾ · ರ್ಥಾ`, `पा · र्था`) even when prosodic syllabification assigns
    its closing consonant to the preceding syllable.
12. Guru/Laghu validation MUST still operate across adjacent occupied Strong
    boxes. Moving a conjunct onset visually MUST NOT make a preceding short
    syllable Laghu when the conjunct closes it metrically. Blank positions MUST
    remain real boundaries and MUST NOT create an inferred conjunct.

### FR-12: Prosody reference

1. The documentation MUST list every meter recognized by the currently shipped
   fixed and structural meter catalogs.
2. The list MUST be searchable with both the displayed scholarly
   transliteration and ordinary Roman spelling without diacritics.
3. A fixed vṛtta entry MUST show the complete four-pāda signature, including
   repeated or alternating patterns, and a traditional three-syllable gaṇa
   reading.
4. A structural, mātrā, or aṃśa entry MUST show its line count, signature, group
   totals or syllable constraints, recognition level, and known unchecked
   rules.
5. The reference MUST explain Laghu, Guru, mātrā, pāda, and gaṇa notation in
   concise language suitable for a learner.
6. The reference MUST be generated from the same catalog assets used by the
   analyzer, remain available offline, and avoid claiming support for rules
   that the catalog marks provisional, partial, or unchecked.

## 6. Analysis Engine Requirements

The existing `meter_analysis.js` implementation is the baseline for
Kannada/Devanagari script detection, akshara segmentation, and Guru/Laghu
classification. Before it is refactored or integrated into new delivery
layers, its current intended behavior MUST be recorded in characterization
tests. The baseline does not waive the Unicode safety, correctness,
performance, or cross-platform acceptance criteria in this document.

The entries and patterns in `mishra.json` are the initial MVP meter list.
Entries with multiple patterns MUST retain all listed valid alternatives.
Catalog migration or schema changes MUST preserve the source attribution,
meter names, patterns, and alternatives without silent loss.

### 6.1 Input and output contract

The analysis engine MUST be reusable by both web and Android delivery layers.
For an input composition and optional per-stanza selected meters, it MUST
return a structured result containing at least:

- original stanzas and lines with stable source-text ranges;
- detected script per line;
- segmented aksharas with Guru/Laghu classifications and applicable reason
  codes;
- syllable and mātrā counts where applicable;
- exact and approximate meter candidates with score/status per stanza;
- selected-meter validation results per stanza;
- unsupported or uncertain spans; and
- analysis-engine and meter-catalog version identifiers.

Presentation labels, colors, and rendered HTML MUST NOT be embedded in the core
analysis result.

### 6.2 Rules and extensibility

1. Script segmentation rules MUST be modular enough to add new Indic scripts
   without rewriting the editor. The same syllable-length analysis MUST apply
   regardless of the language represented by a supported script.
2. `mishra.json` MUST be treated as the source list for the initial meter
   catalog. The runtime representation MAY be transformed during the build,
   provided tests prove that every source entry and pattern is retained.
3. The production meter catalog MUST add or derive stable meter identifiers,
   display names, aliases, source/reference notes, structural rules, and
   version information without overwriting the source data.
4. The scoring and tie-breaking rules for approximate matches MUST be
   deterministic and testable.
5. Known optional rules and differences among metrical traditions MUST be
   explicit rather than hidden in special-case UI code.
6. Diagnostics MAY be enabled in development but MUST NOT expose noisy console
   logs or user composition text in production telemetry.

### 6.3 Structural, mātrā, and aṃśa catalog

1. `structural_meters.json` is the versioned extension catalog for meters that
   cannot be represented faithfully as one fixed Guru/Laghu string.
2. Each structural entry MUST have a stable identifier, display name, common
   search aliases, meter kind, human-readable signature, machine-readable
   pāda rules, rule-completeness label, and source reference.
3. The initial structural release MUST include pathyā Anuṣṭubh as four
   eight-syllable pādas with its odd/even cadence and forbidden-position rules.
   Vipulā variations are explicitly deferred until an expert-reviewed rule set
   and corpus are available.
4. The initial mātrā release MUST include the core Āryā-family patterns:
   Āryā, Gīti, Upagīti, Udgīti, Āryāgīti, Sugīti, Anugīti, and Vallarī.
5. Initial Āryā-family validation checks the published mātrā-group totals.
   Additional gaṇa restrictions and regional variants MUST NOT be implied by
   an exact label until they are added to the catalog and expert-reviewed.
6. Kannada Kanda MUST be a first-class entry independent of Āryāgīti. Its
   encoded rules MUST include the `12 | 20 | 12 | 20` line totals, sixteen
   four-mātrā gaṇas, forbidden jagaṇa at odd gaṇa positions, the special
   sixth and fourteenth gaṇas, Guru endings at gaṇas eight and sixteen, and
   conditional yati for an all-Laghu special gaṇa.
7. Kannada Kanda MUST remain visibly provisional rather than exact until its
   rule packet and golden corpus receive subject-matter approval. Its opening
   dvitīyākṣara-prāsa MUST be checked; historical equivalence and sung
   variants MUST remain identified as unchecked.
8. The catalog MUST support repeating or variable line policies with minimum,
   optional maximum, and guide-preview counts. Such policies MUST validate
   every written line without inventing missing future lines.
9. The initial Kannada Ragaḷe release MUST include Utsāha as four three-mātrā
   gaṇas, Mandānila as four four-mātrā gaṇas, and Lalita as four five-mātrā
   gaṇas on every repeatable line.
10. Mandānila MUST also accept the reviewed `3+5+3+5` alternative and MUST
    reject a gaṇa beginning `LG` under the encoded lagam-varjya rule.
11. Ragaḷe validation MUST check pairwise antya-prāsa independently from
    rhythmic matching and attach a mismatch to the ending syllable's original
    source range. The three forms MUST remain visibly provisional until their
    rule packet and golden corpus receive subject-matter approval.
12. Laghu contributes one mātrā and Guru contributes two mātrās. The engine
   MUST expose the observed total for each pāda and MUST mark the source
   syllable that overruns a required group boundary.
13. Fixed-pattern entries in `mishra.json` MUST remain unchanged. Structural
   rules MUST be composed with them at runtime rather than rewriting the source
   list.
14. The quantitative Ṣaṭpadi release MUST include Śara, Kusuma, Bhoga,
    Bhāminī, Parivardhinī, and Vārdhaka as six-line entries. Lines 1, 2, 4,
    and 5 MUST use each form's short frame; lines 3 and 6 MUST use its extended
    frame and final two-mātrā cadence.
15. Selecting a Ṣaṭpadi MUST validate and guide the complete six-line verse.
    Six lines without the cataloged internal gaṇas MUST NOT be labeled an exact
    match. Opening dvitīyākṣara-prāsa MUST be checked across all six lines;
    historical and sung prāsa variants MUST remain visibly provisional.
16. The catalog and evaluator MUST represent Brahma, Viṣṇu, and Rudra
    aṃśa-gaṇas independently from simple mātrā totals, including alternative
    gaṇa classes in a position.
17. The initial aṃśa release MUST include the core frames for Kannada Tripadi,
    Sāṅgatya, Piriyakkara, Doreyakkara, Naḍuvaṇakkara, Eḍeyakkara, and
    Kiriyakkara. Tripadi MUST encode its 4/4/3 gaṇa line shape, Brahma gaṇas at
    positions 6 and 10, the documented yati boundaries, and the double-Laghu
    openings at positions 7 and 11.
18. Tripadi MUST check opening dvitīyākṣara-prāsa across its three lines and
    the recurrence at the second syllable of the first line's third gaṇa.
    Sāṅgatya and the five Akkara forms MUST check opening
    dvitīyākṣara-prāsa across their four lines. Melodic elongation, folk
    variation, sung repetition, historical prāsa equivalences, and substitute
    gaṇas MUST remain named as provisional where the corpus does not justify a
    deterministic rule.
19. Pañcamātrā Chaupadi MUST initially be scoped to the familiar written-text
    form used by D. V. Gundappa's *Mankuthimmana Kagga*, with four lines
    encoded as `5555 / 5553 / 5555 / 5551`, or
    `20 | 18 | 20 | 16` observed mātrās.
20. The Kagga-form entry MUST remain visibly provisional. It MUST check
    opening dvitīyākṣara-prāsa and line-ending antya-prāsa across all four
    lines. Pādānta lengthening, śithila-dvitva, historical prāsa equivalences,
    and broader Chaupadi variants MUST remain named as unchecked rather than
    silently accepted or rejected.
21. Dvitīyākṣara-prāsa comparison MUST use the terminal consonant of the
    second displayed akṣara while preserving a shaping-safe display range.
    Thus `ಮಲ್ಪ` and `ಜಂಪ` compare on `ಪ`, while the complete `ಲ್ಪ` cluster may
    be highlighted. The Guru/Laghu weight of the preceding first syllable MUST
    match independently.
22. Punctuation and whitespace MUST be transparent to prāsa extraction.
    Successful prāsa, consonant failure, and first-syllable weight failure MUST
    have distinguishable letter-level color fills and accessible text reports.
    A highlighted akṣara MUST retain its ordinary dotted Laghu or solid Guru
    underline so its syllable weight remains readable.
23. When the first consonant of every available pāda matches, the UI MUST
    report “Ādi-prāsa found.” Unless a selected meter explicitly requires
    first-letter prāsa, its absence MUST NOT be reported as a violation.
24. A stanza containing at least two eligible Kannada-script pādas MUST receive
    an automatic dvitīyākṣara-prāsa check even when no meter is selected or a
    fixed/Sanskrit-vṛtta catalog meter is selected. The result MUST be marked
    as an advisory Kannada-script observation and MUST NOT change meter
    validity. When the selected meter already declares dvitīyākṣara-prāsa, its
    required rule MUST take precedence without a duplicate automatic report.
    Each nonblank line and each danda/pipe-delimited span is a pāda; blank lines
    reset the comparison. Mixed Kannada–Devanagari stanzas MUST NOT be compared
    across scripts. Script detection MUST use letters and combining marks;
    danda, double danda, numerals, Markdown marks, and other punctuation MUST
    remain script-neutral.

## 7. User Experience and Accessibility

1. The composition MUST remain the primary visual focus.
2. Meter and synonym dropdowns MUST be compact, dismissible, and must not cover
   the caret or active line where avoidable.
3. The UI MUST support keyboard-only navigation, visible focus, screen-reader
   labels, and touch targets appropriate for Android/mobile use.
4. Text and non-text contrast MUST meet WCAG 2.2 AA.
5. Guru, Laghu, selected-meter errors, uncertainty, and focus states MUST be
   distinguishable without color alone.
6. The editor MUST support zoom and dynamic text sizing without losing
   highlights or controls.
7. The interface MUST support Kannada and English initially; Sanskrit terms
   SHOULD be displayed accurately. Localization architecture MUST allow more
   interface languages later.
8. Motion MUST be subtle and respect the user's reduced-motion preference.

## 8. Non-Functional Requirements

### Performance

- For a typical composition of up to 2,000 Unicode characters on a supported
  mid-range Android device, updated analysis SHOULD be visible within 100 ms
  after a short input debounce and MUST remain within 250 ms at the 95th
  percentile.
- Typing MUST remain responsive even when analysis takes longer; stale analysis
  results MUST NOT overwrite newer results.
- Initial application assets SHOULD be kept small enough for practical mobile
  use on slow connections, and repeat visits SHOULD work from cache.

### Reliability and offline behavior

- The installed Android application MUST support core editing, analysis,
  per-stanza meter selection, validation, copying, and local draft recovery
  without a network connection.
- The website SHOULD support the same core workflow offline after it has loaded
  successfully.
- A failure in sharing, telemetry, future synonym lookup, or future sync MUST
  NOT lose or corrupt composition text.
- The current unsaved text and per-stanza selections MUST survive an accidental
  refresh or process restart on the same device, subject to the documented
  local-storage behavior.

### Privacy and security

- MVP composition analysis MUST occur on-device and MUST NOT transmit text to a
  server.
- Any future transmission for sync, synonym services, diagnostics, or AI
  features MUST be disclosed and protected in transit.
- Telemetry MUST avoid composition text and other sensitive content by default.
- Authentication and saved-work features require a threat model, access
  controls, encryption decisions, retention policy, and account deletion flow
  before release.
- Dependencies, web headers, Android permissions, and release artifacts MUST be
  security-reviewed. The Android app MUST request only permissions needed for
  user-visible features.

### Compatibility

- The website MUST define and test a supported browser matrix covering current
  Chrome/Chromium, Firefox, Safari, and Android Chrome.
- The Android minimum SDK and supported device range MUST be chosen before
  implementation and recorded in the release plan.
- Web and Android MUST produce equivalent analysis for the same normalized
  input, rules version, and meter catalog version.

### Observability

- Production monitoring SHOULD capture availability, performance, application
  errors, and analysis failure reason codes without recording composition text.
- Every release MUST expose an application version and analysis/catalog version
  for support and reproducibility.

## 9. Acceptance Criteria for MVP

The MVP is acceptable when:

1. A user can type and paste representative Kannada-script and
   Devanagari-script verses with a standard Indic keyboard and the text remains
   intact.
2. Guru/Laghu status appears inline and stays aligned through editing,
   scrolling, wrapping, and resizing.
3. The expected result is produced for the approved expert-reviewed corpus of
   segmentation, classification, and meter examples, including
   characterization cases derived from `meter_analysis.js`.
4. Exact and closest meter candidates are ranked deterministically; ties and
   incomplete verses are presented without false certainty, and every meter
   and pattern in `mishra.json` is available.
5. Different meters can be selected for two or more stanzas in one
   composition. Each selection produces validation only within its associated
   stanza and survives navigation and ordinary editing.
6. Selecting a meter marks genuine mismatches inline in red with an accessible
   secondary cue and does not mark unfinished input as a confirmed error.
7. Copy returns exactly the original composition, and sharing opens an
   appropriate web or Android destination with a documented fallback.
8. The Android core workflow and recovery of the latest anonymous local draft
   remain usable in airplane mode after installation.
9. The latest anonymous draft and its per-stanza meter selections survive a
   refresh or process restart and can be cleared by the user.
10. Automated checks pass on the agreed browser/device matrix, and no
   release-blocking accessibility, data-loss, privacy, or correctness defects
   remain.
11. A subject-matter expert signs off on the supported rules, meter catalog, and
   validation corpus.
12. Enabling or disabling the selected meter's ghost template leaves the
    original composition, analysis ranges, caret, copy output, and share output
    unchanged.
13. For a fixed vṛtta, Strong mode permits out-of-order entry, restores filled
    and empty positions after restart, marks a filled weight mismatch without
    treating blank positions as violations, and copies or shares only authored
    text.
14. **Copy analysis link** produces a canonical URL that round-trips the
    authored text and each stanza's selected meter and supported template mode
    in desktop, mobile, and offline browser tests.
15. A user may select a meter in an empty editor, and that selection remains
    active when the first syllable is typed.
16. A samasyā-pūraṇa link containing only a later pāda retains its leading
    blank lines through URL copy/import and Ghost/Strong switching. Its Strong
    slot matrix retains all earlier blank rows and cells.

## 10. Test Strategy

### 10.1 Test data and linguistic validation

- Build a version-controlled, license-compatible corpus covering prose,
  complete verses, partial verses, and intentionally incorrect verses.
- Include Kannada and Devanagari examples for short/long vowels, independent
  and dependent vowels, conjuncts, virāma/halant, anusvāra, visarga, avagraha,
  Vedic or extended marks if supported, punctuation, danda/double danda,
  whitespace, zero-width characters, and canonically equivalent Unicode.
- Include cross-boundary fixtures where whitespace, commas, danda marks, and
  other punctuation precede a conjunct in both Kannada and Devanagari.
- Include search fixtures proving that scholarly names remain displayed with
  diacritics while unaccented and common Roman spellings find them.
- Include every supported meter, exact matches, near matches, ties, allowed
  variations, wrong line counts, extra/missing syllables, and ambiguous cases.
- Include pathyā Anuṣṭubh fixtures using both one-pāda-per-line and
  danda-delimited two-pāda lines, plus wrong cadence, forbidden positions,
  missing pādas, and extra syllables.
- Include each Āryā-family mātrā signature, exact group boundaries, a Guru that
  crosses a four-mātrā boundary, incomplete pādas, and extra mātrās.
- Use `mishra.json` as the initial meter inventory and create coverage proving
  that every entry and every alternate pattern can be loaded and matched.
- Derive characterization fixtures from the intended Kannada/Devanagari
  segmentation and Guru/Laghu behavior in `meter_analysis.js` before changing
  that code. Review any intentional behavior change rather than silently
  updating expected output.
- Record the expected segmentation and classification with reference notes.
  A qualified Kannada/Sanskrit prosody reviewer must approve this golden corpus.

### 10.2 Automated tests

- **Unit tests:** Unicode segmentation, normalization equivalence, script
  detection, Guru/Laghu rules, range mapping, meter rules, distance scoring,
  tie-breaking, and reason codes.
- **Golden/regression tests:** Run the reviewed corpus against each analysis
  engine and meter-catalog change. Intentional changes require a reviewed
  fixture update.
- **Property/fuzz tests:** Generate unusual Unicode sequences and editing
  operations to confirm there are no crashes, infinite loops, invalid ranges,
  or mutations of original text.
- **Contract tests:** Verify the analysis result schema and identical core
  results across web and Android.
- **Component tests:** Editor/highlight alignment, meter dropdown behavior,
  line-end syllable/mātrā counters, caret-position counting, stanza boundary
  handling, shaping-safe Kannada and Devanagari conjunct highlighting,
  preservation of explicit ZWNJ breaks, per-stanza selected-meter persistence,
  the always-available clear action, anonymous local draft recovery/clearing,
  ghost-template toggling and alignment, proof that ghost symbols never enter
  source text, copy, share fallback, URL-import parsing and one-shot appending,
  URL meter/template choices, and synonym-dropdown placeholder behavior where
  present.
- **End-to-end tests:** Type with simulated IME events; paste; undo/redo; select
  different meters in multiple stanzas; split and merge stanzas; repair a
  violation; enable and disable a ghost template without changing the poem;
  recover a draft after restart; copy; and initiate sharing on representative
  viewports.
- **Strong-template tests:** For fixed vṛttas, fill positions out of order,
  retain blank positions, edit and clear filled slots, switch between ghost
  and strong modes, restore a partially filled structured draft, and verify
  that copy and sharing contain only authored text while retaining meaningful
  blank rows. Repeat the suite for each
  structural, mātrā, or aṃśa presentation before enabling that family.
- **URL-import tests:** Cover raw and named query forms, Kannada and
  Devanagari line breaks, appending to recovered drafts, multiple imported
  stanzas, catalog IDs and common Roman meter names, Ghost/Strong choices,
  out-of-order Strong slot restoration, malformed optional slot state,
  leading-line samasyā-pūraṇa frames, unsupported-Strong fallback, query
  removal, refresh, offline reload, and query-free navigation cache keys.
- **Accessibility tests:** Automated checks plus manual keyboard,
  screen-reader, contrast, zoom, dynamic-type, and color-vision checks.
- **Performance tests:** Record input latency and analysis duration for typical,
  long, and adversarial compositions on a reference mid-range Android device
  and desktop browser.
- **Security tests:** Dependency and secret scanning, static analysis, web
  security headers, Android manifest/permission review, and abuse tests for any
  future server APIs.

### 10.3 Manual and release testing

- Test physical Android keyboards/IMEs for Kannada and Devanagari, because
  synthetic browser events do not fully reproduce composition behavior.
- Test current supported browsers and a representative set of phone sizes,
  orientations, fonts, zoom levels, and low/offline network states. Include
  Kannada and Devanagari conjuncts whose metrical boundary falls between a
  virāma and consonant on physical macOS Safari and iPhone Safari.
- On a physical Android device, install the release candidate, enable airplane
  mode, restart the app, and complete the full edit/analyze/select/validate/copy
  and local-recovery workflow.
- Have subject-matter experts review both correct output and the clarity of
  explanations for errors and ambiguous suggestions.
- Run a small beta with poets/students before public launch, focusing on
  correctness, distraction level, and whether inline markings help composition.
- Maintain a release checklist and block deployment on data loss, text
  corruption, highlight misalignment, major linguistic regressions, or
  inaccessible core controls.

## 11. Deployment Strategy

### 11.1 Shared delivery approach

- Evolve the existing `meter_analysis.js` baseline into one versioned analysis
  engine shared by the website and Android app, and use `mishra.json` as the
  initial versioned meter source.
- Build a responsive, installable web application for the common interface and
  prototype an Android web/native container first.
- The Android artifact MUST bundle all core application, analysis, localization,
  and meter-catalog assets needed for full offline operation. It MUST NOT rely
  on a first-run network fetch to enable the core workflow.
- The container prototype MUST verify IME behavior, inline highlighting,
  offline operation, local recovery, sharing, accessibility, lifecycle
  restoration, and Play policy compliance.
- If the container approach cannot meet editor quality or performance
  requirements, retain the shared analysis engine and implement a native
  Android editor/presentation layer.
- Use separate development, staging, and production environments. Test data and
  future account data MUST NOT be copied from production into lower
  environments without anonymization and approval.

### 11.2 Continuous delivery

1. On each change, run formatting, linting, unit, golden, contract, component,
   accessibility, security, and production-build checks.
2. Produce immutable, versioned web and Android artifacts from a tagged commit.
3. Deploy to an internal/staging URL and Android internal-testing track.
4. Run smoke, browser/device, offline, and expert corpus checks against the
   release candidate.
5. Promote the exact tested artifacts:
   - website first to a small percentage/canary when infrastructure permits,
     then to all traffic;
   - Android through internal, closed/open testing as appropriate, then a
     staged production rollout.
6. Monitor crashes, client errors, latency, share failures, and anonymous
   analysis failure codes. Do not collect composition text.
7. Pause or roll back when release thresholds are exceeded.

### 11.3 Web deployment

- Serve `chandas.org` over HTTPS with automatic certificate renewal, secure
  headers, compressed immutable assets, cache versioning, and a tested service
  worker/offline fallback.
- Host the static application and local analysis assets through a CDN or
  equivalent highly available platform.
- Keep DNS and hosting configuration versioned where possible.
- Use atomic deployments and retain at least the previous known-good version
  for rapid rollback.
- Add privacy, terms, support/contact, and version information before public
  launch.

### 11.4 Android deployment

- Use a stable application ID and managed Play App Signing/release keys.
- Build Android App Bundles for Google Play and keep signing credentials out of
  the repository.
- Configure internal testing before any public track, then use staged rollout.
- Verify deep links/app links, offline assets, system share behavior, back
  navigation, anonymous draft recovery, lifecycle restoration, and update
  behavior on physical devices.
- Block release if a clean installation cannot complete the core workflow in
  airplane mode without a server dependency.
- Publish required store listing, privacy/data-safety declarations,
  accessibility information, support contact, and content disclosures.
- Coordinate web and Android releases so both use compatible analysis and
  meter-catalog versions.

### 11.5 Rollback and data evolution

- Web rollback MUST restore the previous known-good immutable build.
- Android cannot assume immediate client rollback; fixes MUST preserve backward
  compatibility and may require halting rollout followed by a patched release.
- Meter catalog and analysis changes MUST be versioned. Saved compositions
  introduced later MUST retain their original analysis version and be
  re-analyzed explicitly rather than silently changing historical results.
- Future storage schema changes MUST use tested, reversible migrations and
  backups with restore drills.

## 12. Confirmed Decisions and Remaining Questions

### Confirmed

1. Sanskrit written in both Kannada and Devanagari scripts is in MVP.
2. Guru/Laghu analysis depends on syllable length and supported-script parsing,
   not on language identification.
3. `meter_analysis.js` is the analysis baseline.
4. `mishra.json` provides the initial meter list and patterns.
5. Kannada and English are the initial interface languages.
6. Meter selection and validation operate independently per stanza.
7. Sharing defaults to the original composition only; meter information and a
   `chandas.org` link are optional additions.
8. Anonymous on-device draft recovery is in MVP.
9. The Android application must perform the full core workflow offline.
10. An installable web application with an Android container is the first
    delivery approach to prototype; a native Android UI remains the fallback.
11. Structural meters are maintained in a separate versioned catalog;
    pathyā Anuṣṭubh and the initial Āryā-family group-total rules are the first
    supported set.
12. The first template release uses a non-destructive ghost guide. A later
    release offers both ghost and strong templates, with the strong template
    supporting arbitrary out-of-order position filling.
13. Kannada Kanda is cataloged separately from Āryāgīti. Its engineering
    release checks the sourced rhythm, yati, and dvitīyākṣara-prāsa rules and
    remains provisional pending expert corpus approval.
14. Utsāha, Mandānila, and Lalita Ragaḷe use an unbounded repeating-line
    policy. Their first engineering release checks mātrā groups, Mandānila
    alternatives and lagam, and pairwise end-rhyme while remaining provisional
    pending expert corpus approval.
15. Pañcamātrā Chaupadi initially means the modal written-text Kagga form,
    encoded as `5555 / 5553 / 5555 / 5551`. It remains provisional and does
    not imply that every historical Chaupadi shares that frame.

### Remaining review and expansion work

1. Confirm that blank-line-separated blocks are the intended definition of a
   stanza for selection and validation.
2. Choose the precise inline visual treatment for Guru, Laghu, violations, and
   uncertainty.
3. Identify the subject-matter reviewer who will approve characterization
   fixtures, additional test cases, and any intentional changes to baseline
   analysis.
4. Confirm that the source attribution and license for `mishra.json` permit web
   and Android redistribution. Every listed meter remains part of the initial
   catalog.
5. Choose the minimum Android version and supported browser window.
6. Obtain expert approval for the pathyā Anuṣṭubh corpus and determine which
   vipulā variations the next catalog version will accept.
7. Obtain expert approval for the Kannada Kanda rule packet, prāsa
   equivalence classes, and golden corpus before promoting it from
   provisional.
8. Add and review the remaining jāti/mātrā traditions and the full internal
   gaṇa constraints for the initial Āryā-family entries.
9. Obtain expert approval for the Kagga-form Pañcamātrā Chaupadi corpus,
   including pādānta lengthening and śithila-dvitva, before broadening it to
   other Chaupadi traditions.

## 13. Explicitly Out of Scope for MVP

- Automatic posting without the user's confirmation.
- Cloud accounts, cross-device synchronization, and collaborative editing.
- Synonym replacement and external dictionary services.
- Automatic translation or transliteration.
- Server-side storage or analysis of composition text.
- Support for every Indic script or every regional prosody tradition.
- Claims of meter correctness outside the reviewed meter catalog and ruleset.
- Strong-template editing and arbitrary out-of-order slot filling; the first
  version includes only the ghost template.

## 14. Change Control

Requirements, linguistic rules, and the meter catalog MUST be versioned.
Material changes to supported scripts, correctness rules, data handling,
sharing behavior, or deployment targets require stakeholder review and updated
acceptance tests before implementation or release.
