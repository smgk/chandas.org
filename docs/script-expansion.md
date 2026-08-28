# Indic Script Expansion Research

**Status:** Active roadmap note; Telugu and Gujarati adapters implemented
**Updated:** 2026-08-13

This note records the initial assessment of which Indic scripts can reuse the
current Guru/Laghu engine. Telugu and Gujarati are now supported first-class adapters; the
remaining entries are research, not a claim that their scripts or native
prosody traditions are already supported.

## Product boundary

Script support and language or meter-tradition support are separate:

- A script adapter identifies orthographic syllables and their Guru/Laghu
  weight. It can initially support Sanskrit or other quantitative verse written
  in that script.
- It does not by itself implement native Telugu, Gujarati, Odia, Bengali,
  Tamil, Malayalam, Sinhala, or Punjabi meters.
- Script detection must not be treated as language detection. A language may
  be written in several scripts, and one script may write several languages.
- Script affinity may make automatic suggestions less noisy, but every meter
  remains searchable and explicitly selectable. In particular, Kannada-script
  Sanskrit vṛttas must not be hidden merely because the script is Kannada.

The Unicode Standard gives Bengali, Gurmukhi, Gujarati, Odia, Tamil, Telugu,
Kannada, and Malayalam a layout parallel to Devanagari. They share the
consonant with inherent vowel, dependent-vowel, virāma, and conjunct model that
the current analyzer expects. Unicode nevertheless warns that script-specific
behavior must be implemented and tested rather than inferred solely by shifting
code points.

## Proposed implementation order

| Order | Script | Fit with current engine | Important exception |
| --- | --- | --- | --- |
| 1 | Telugu | Excellent | Historic consonants and alternate vowel encodings |
| 2 | Gujarati | Implemented | Orthographic quantity does not imply complete native-language prosody |
| 3 | Odia | Very good | Additional letters and AU-length representation |
| 4 | Bengali/Assamese | Good | Khanda-ta is an atomically encoded dead consonant |
| 5 | Tamil | Good for basic quantity | Native meters require an eḻuttu/asai/cīr layer; Sanskrit transcription has reduced consonant distinctions |
| 6 | Sinhala | Moderate | Compatible syllable structure but a different code-point layout |
| 7 | Malayalam | Moderate to difficult | Atomic chillus, legacy chillus, and samvruthokaram |
| 8 | Gurmukhi | Moderate to difficult | Addak marks following-consonant gemination without the ordinary virāma sequence |
| 9 | Grantha | Moderate to difficult | Supplementary-plane offsets and offline font availability |
| 10 | Tulu-Tigalari | Difficult | Virāma and conjunct conjoiner are different characters |

### Telugu

**Implemented in version 1.21.0.** Telugu was the strongest first addition.
Its block organization, vowel-length distinctions, virāma sequences, and
subjoined conjunct representation closely match Kannada. Much of the Kannada
characterization corpus can be transliterated to create paired tests.

The adapter includes historic consonants `ౘ`, `ౙ`, and `ౚ`, Telugu length
marks, canonical and alternate vowel representations, atomic nakaara pollu,
native Ghost-template symbols, analytics identifiers, and shaping-safe source
ranges. Android and Safari rendering remain part of release verification.

### Gujarati

**Script adapter implemented in version 1.28.0; initial native-meter catalog
implemented in version 1.29.0.** Gujarati has an isolated, offline adapter
for native script detection, short and long independent vowels and vowel
signs, virāma conjuncts, anusvāra, visarga, candrabindu, avagraha, Gujarati
digits, and additional consonant `ૹ`. It also has native Laghu/Guru template
symbols, aggregate script analytics, saved-language persistence, automatic
`gu-IN` interface selection, and a complete Gujarati UI translation.

The adapter supports Gujarati-script Sanskrit and other orthographically
quantitative verse against the existing script-independent meter catalog. A
separate Gujarati-scoped packet now adds Caupāī, Doharō, Soraṭhō, Harigīt,
Jhūḷaṇā, Savaiyā, Roḷā, Kaṭāv, Manhar, and Ghanākṣarī. It does not modify the
shared Kannada/Devanagari scanner. Pronunciation-dependent realizations,
flowing Kaṭāv, Gulbaṅkī, and Vanavelī remain explicit later work.

### Odia

Odia follows the ordinary virāma/conjunct model closely enough for a small,
isolated adapter. It needs reviewed vowel-quantity tables, consonants outside
the principal range, normalization fixtures, punctuation tests, and native
guide symbols.

The first release should promise orthographic Guru/Laghu analysis, especially
for Sanskrit-style quantitative verse. It must not imply that every
language-specific pronunciation or native meter rule has been modeled.

### Bengali and Assamese

The ordinary hasant/conjunct model fits the engine, and the Bengali Unicode
block also covers modern Assamese orthography. Before this adapter is added,
the engine needs an explicit `deadConsonants` category for `ৎ` (khanda-ta),
which has no inherent vowel and needs no hasant. Assamese-specific letters and
both current and legacy representations require corpus coverage.

### Tamil

Tamil has explicit short and long vowels and a puḷḷi/virāma, so basic
orthographic quantity is tractable. Tamil normally shows explicit puḷḷi and
uses relatively few conjunct forms. Sanskrit transcription may use superscript
digits because the Tamil consonant inventory does not preserve every Sanskrit
distinction.

Native Tamil prosody is not merely a Sanskrit Guru/Laghu catalog: its
eḻuttu/asai/cīr structure requires a later, independently reviewed rule layer.

### Sinhala

Sinhala has explicit short and long vowels, a virāma, and South Indian-style
syllable structure, and is also used for Pali and Sanskrit. Its Unicode layout
is not ISCII-parallel, so the character classes must be authored and reviewed
independently rather than derived by offset.

### Malayalam

Malayalam cannot be added safely as a plain character table. Atomic chillus
such as `ൻ`, `ർ`, `ൽ`, and `ൾ` are dead consonants without an inherent vowel,
and older text may encode chillus as consonant + virāma + ZWJ. The
candrakkala/virāma can also participate in samvruthokaram (“half-u”), not only
vowel deletion. These cases require explicit engine capabilities and a strong
golden corpus.

### Gurmukhi

Gurmukhi `ੱ` (addak) means that the following consonant is geminated. The
current engine would ignore it as an ordinary combining mark and fail to close
the preceding syllable. A generic `followingGeminationMarks` capability should
precede this adapter.

### Grantha

Grantha is a valuable target for Sanskrit but is encoded outside the Basic
Multilingual Plane. Segmentation already iterates Unicode code points, while
some backwards-looking highlight-boundary logic still assumes single UTF-16
code units. That logic must become code-point-safe before Grantha highlighting
can be trusted. Offline font coverage must also be tested on Android, Safari,
and macOS.

### Tulu-Tigalari

Tulu-Tigalari must have a dedicated adapter. Its virāma can modify vowels and
represent special Tulu vowels, while a separate conjoiner forms conjuncts. It
also has a looped virāma and a gemination mark. This conflicts with the current
assumption that one virāma is both vowel killer and conjunct operator.

## Shared foundation before the first expansion

1. Derive script-detection counters from the registered adapter set instead of
   hard-coding Kannada and Devanagari.
2. Permit multiple consonant ranges and explicit consonant sets.
3. Add separate categories for atomic dead consonants, vowel killers, conjunct
   joiners, and following-gemination marks.
4. Keep vowel quantity in small manually reviewed tables; Unicode structural
   properties do not decide poetic quantity.
5. Make every source and highlight offset safe for supplementary-plane code
   points.
6. Use Unicode `Indic_Syllabic_Category` data to generate structural character
   classes at build time, then ship a compact offline table with reviewed
   script-specific overrides.
7. Add paired positive, negative, incomplete, conjunct, punctuation,
   normalization, URL, template, copy/share, offline, and cross-browser tests
   for every script.
8. Add stable analytics identifiers and native Laghu/Guru guide symbols without
   transmitting composition text.
9. Test system-font coverage first. Bundle a font only when reliable offline
   rendering cannot otherwise be achieved, and measure that cost separately
   for each script.
10. Preserve meter-tradition metadata independently from script metadata so
    suggestion filtering never changes validation or explicit selection.

## Proposed delivery slices

1. [x] Generalize script detection while proving that Kannada and Devanagari
   results do not change.
2. [x] Add Telugu with paired Telugu/Devanagari characterization tests.
3. [x] Add Gujarati script analysis and Gujarati interface localization.
4. [x] Add the first separately sourced Gujarati traditional-meter packet.
5. [x] Add an offline Roman adapter for IAST, ISO 15919, ITRANS, and
   Harvard-Kyoto. Analysis uses an internal Devanagari shadow while authored
   text and highlight ranges remain Roman. Aksharamukha is a differential test
   oracle only; it is not a runtime dependency.
6. Add Odia.
7. Add atomic dead-consonant support, then Bengali/Assamese.
8. Choose Tamil or Sinhala next based on user demand and available reviewers.
9. Add Malayalam only after chillu and half-u review.
10. Treat Gurmukhi, Grantha, and Tulu-Tigalari as specialized later passes.

## Primary technical references

- [Unicode Standard, Chapter 12: South and Central Asia—I](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-12/)
- [Unicode Standard, Chapter 13: South and Central Asia—II](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-13/)
- [Unicode Standard, Chapter 15: South and Central Asia—IV](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-15/)
- [Unicode FAQ: Indic Scripts and Languages](https://www.unicode.org/faq/indic.html)
- [Unicode Character Database property specification](https://www.unicode.org/reports/tr44/)
- [Telugu Unicode code chart](https://www.unicode.org/charts/PDF/U0C00.pdf)
- [Gujarati Unicode code chart](https://www.unicode.org/charts/PDF/U0A80.pdf)
- [Grantha Unicode code chart](https://www.unicode.org/charts/PDF/U11300.pdf)
- [Tulu-Tigalari Unicode code chart](https://www.unicode.org/charts/PDF/U11380.pdf)
