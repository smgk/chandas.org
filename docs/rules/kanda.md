# Kannada Kanda rule packet

**Catalog ID:** `structural:kanda-kannada`  
**Rule status:** Implemented, provisional pending expert corpus approval  
**Catalog version introduced:** `2.0.0`

## Scope

This packet documents the rhythmic rules encoded for Kannada Kanda
(ಕಂದಪದ್ಯ). It intentionally keeps Kannada Kanda separate from Āryāgīti even
though they share the same top-level `12 | 20 | 12 | 20` mātrā totals.

The implementation checks mātrā groups, special gaṇa realizations, required
line endings, and the conditional yati described below. Prāsa is recorded as
an unchecked rule and is not used to claim that every literary requirement is
satisfied.

## Structure

Kanda has four lines:

1. `4 + 4 + 4 = 12` mātrās
2. `4 + 4 + 4 + 4 + 4 = 20` mātrās
3. `4 + 4 + 4 = 12` mātrās
4. `4 + 4 + 4 + 4 + 4 = 20` mātrās

The stanza therefore contains sixteen four-mātrā gaṇas.

Laghu (`L`) contributes one mātrā and Guru (`G`) contributes two. The possible
realizations of an unconstrained four-mātrā gaṇa are:

- `GG`
- `GLL`
- `LGL`
- `LLG`
- `LLLL`

## Encoded constraints

Gaṇas are numbered globally from 1 through 16 across the four lines.

1. Odd gaṇas `1, 3, 5, 7, 9, 11, 13, 15` must not be `LGL`
   (jagaṇa/madhyaguru).
2. Gaṇas `6` and `14` must be either `LGL` or `LLLL`.
3. Gaṇas `8` and `16` must end in Guru. For a four-mātrā gaṇa this permits
   `LLG` or `GG`.
4. When gaṇa `6` or `14` is `LLLL`, a yati/word boundary is required after its
   first syllable.
5. Every syllable must fit wholly within its four-mātrā group; a Guru may not
   straddle a group boundary.

## Source reconciliation

The Chanda Nikasha formal example specifies two half-stanza lines:

```text
[GG/GLL/LLG/LLLL] 4 [GG/GLL/LLG/LLLL]
4 [GG/GLL/LLG/LLLL] [LGL/LLLL] [GG/GLL/LLG/LLLL] [LLG/GG]
```

The same two-line rule repeats for the second half. This produces the global
special-gaṇa numbers 6 and 14 and the required endings at 8 and 16.

The Kannada Chandassu description independently gives global gaṇas 6 and 14.
Kannada Deevige describes the special gaṇa as the sixth gaṇa within each
eight-gaṇa half, which is again global 6 and 14.

The English Classical Kannada page says “sixth and twelfth” in one sentence,
but its four-line structure and the two formal encodings above support 6 and
14. The catalog therefore uses 6 and 14 and records this discrepancy for
expert review rather than silently choosing a source.

## References

- Vishweshwar V. Dixit, [*Chanda Nikasha (Naga-Pingala): Verification and
  Identification of meters in Kannada
  Prosody*](https://kannadakali.com/crav/dev/docs/ChandaNikasha-English.pdf),
  especially the Kanda specification in Table 2 and the rule grammar in
  Table 3.
- [Kandapadya, Kannada
  Chandassu](https://chandassu.onrender.com/chandassu/kandapadya).
- [Kanda Padya, Classical
  Kannada](https://shastriyakannada.org/database/english/literature/KANDA%20PADYA%20HTML.htm).
- [ಕಂದಪದ್ಯ, Kannada
  Deevige](https://kannadadeevige.blogspot.com/2013/11/blog-post_555.html).

These pages provide rule facts and examples; their page content is not bundled
with Chandas.org.

## Provisional characterization example

The following example is cited by Kannada Chandassu and is used only as a
provisional characterization fixture:

```text
ಕಾವೇರಿಯಿಂದ ಮಾಗೋ
ದಾವರಿವರ ಮಿರ್ಪ ನಾಡದಾ ಕನ್ನಡದೊಳ್
ಭಾವಿಸಿದ ಜನಪದಂ ವಸು
ಧಾವಳಯ ವಿಲೀನ ವಿಶದ ವಿಷಯ ವಿಶೇಷಂ
```

With the current baseline segmentation it yields:

```text
GGLGLGG          = 12
GLLLLGLGLGGLLG   = 20
GLLLLLLGLL       = 12
GLLLLGLLLLLLLLGG = 20
```

Expected gaṇas:

```text
GG | LGL | GG
GLL | LLG | LGL | GG | LLG
GLL | LLLL | GLL
GLL | LLG | LLLL | LLLL | GG
```

The all-Laghu fourteenth gaṇa has a word boundary after its first syllable.

## Review still required

Before changing the catalog entry from `provisional-rhythm` to `complete`:

- identify the subject-matter reviewer;
- verify this packet against a standard printed Kannada prosody reference;
- approve a redistributable golden corpus from multiple authors or works;
- confirm how śithila-dvitva should be entered and reported;
- specify and implement the required prāsa checks;
- review intentional differences between Kannada Kanda and Āryāgīti.
