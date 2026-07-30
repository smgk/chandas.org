# Kannada Ragaḷe rule packet

**Catalog IDs:** `structural:mandanila-ragale`,
`structural:utsaha-ragale`, `structural:lalita-ragale`  
**Rule status:** Implemented, provisional pending expert corpus approval  
**Catalog version introduced:** `2.1.0`

## Scope

This packet documents the three classical Kannada Ragaḷe forms encoded by
Chandas.org. Ragaḷe is a repeatable mātrā-gaṇa form: every written line follows
the selected rhythm, but the passage has no fixed total number of lines.

The implementation does not treat later flexible forms such as Sarala Ragaḷe
as exact equivalents.

## Shared structure

- Each line has four mātrā gaṇas.
- A passage may continue for an unbounded number of lines.
- Adjacent lines form end-rhyme pairs.
- Laghu (`L`) contributes one mātrā and Guru (`G`) contributes two.
- A syllable may not cross a declared mātrā-gaṇa boundary.
- An unfinished current line reports only its own remaining mātrās. Chandas
  does not invent missing future Ragaḷe lines.

The encoded pairwise antya-prāsa rule compares the terminal consonant of the
final akṣara in adjacent lines: lines 1–2, 3–4, and so on. The complete shaped
cluster is highlighted even when the matching consonant is an ottu. An
unpaired line in a composition still in progress is not marked as missing.

## Utsāha Ragaḷe

Every line has four three-mātrā gaṇas:

```text
3 + 3 + 3 + 3 = 12 mātrās
```

## Mandānila Ragaḷe

The regular line has four four-mātrā gaṇas:

```text
4 + 4 + 4 + 4 = 16 mātrās
```

The documented alternating realization is also accepted:

```text
3 + 5 + 3 + 5 = 16 mātrās
```

The encoded *lagam-varjya* condition rejects a gaṇa beginning `LG`. The
Chanda Nikasha rule example expresses this as a whole-passage condition over
four gaṇas per line; the catalog applies the same condition independently to
every written line.

## Lalita Ragaḷe

Every line has four five-mātrā gaṇas:

```text
5 + 5 + 5 + 5 = 20 mātrās
```

## Engine behavior

The catalog uses a repeating line policy with a one-line guide preview.
Validation and ranking work for one, two, four, six, or longer passages.
Mātrā excess, boundary overrun, Mandānila lagam, and antya-prāsa violations
are attached to their original Unicode syllable ranges.

All three entries remain labeled **provisional rhythmic rules**. Chandas does
not claim an expert-approved exact result yet.

## References

- Vishweshwar V. Dixit, [*Chanda Nikasha (Naga-Pingala): Verification and
  Identification of meters in Kannada
  Prosody*](https://kannadakali.com/crav/dev/docs/ChandaNikasha-English.pdf),
  especially the general meter grammar and Mandānila lagam condition.
- [*Ragale*, Classical
  Kannada](https://shastriyakannada.org/database/english/literature/RAGALE%20%20HTML.htm).
- Gil Ben-Herut, [discussion of Kannada Ragaḷe structure in *Śiva's Saints:
  The Origins of Devotion in
  Kannada*](https://etd.library.emory.edu/downloads/k3569460z?locale=e),
  pp. 97–101.
- [ರಗಳೆ, Kannada
  Kanaja](https://kannadakanaja-vyakarana.blogspot.com/2018/02/blog-post_26.html),
  for the three forms, the `3+5+3+5` Mandānila example, and pairwise end-rhyme.

These pages provide prosodic facts and examples; their page content is not
bundled with Chandas.org.

## Review still required

Before changing these entries from provisional to complete:

- identify the subject-matter reviewer;
- approve a redistributable corpus from more than one work or author;
- confirm the full historical range of accepted gaṇa realizations;
- confirm consonant-cluster equivalence rules for antya-prāsa;
- define how śithila-dvitva is entered and reported;
- characterize odd unpaired lines at intentional passage endings; and
- document differences between classical Ragaḷe and later flexible forms.
