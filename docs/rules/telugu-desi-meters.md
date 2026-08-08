# Telugu deśi metre rule packet

**Catalog version:** 5.0.0  
**Status:** Structural gaṇas and principal layouts implemented; broader
traditional yati-maitri equivalence still needs expert corpus review.

## Sūrya and Indra gaṇas

Telugu deśi metres use gaṇa classes, not one immutable Guru/Laghu string.
The analyser keeps them separate from Kannada Brahma–Viṣṇu–Rudra aṃśas.

| Class | Accepted Guru/Laghu realizations |
| --- | --- |
| Sūrya (`S`) | `GL`, `LLL` |
| Indra (`I`) | `LLLL`, `LLLG`, `LLGL`, `GLL`, `GLG`, `GGL` |

This is the traditional pair of Sūrya gaṇas (`ga-la`, `na`) and six Indra
gaṇas (`nala`, `naga`, `sala`, `bha`, `ra`, `ta`). The classes intentionally
contain different syllable and mātrā counts. Treating every Indra as a plain
four-mātrā bucket would reject valid Telugu verse.

## Implemented frames

| Form | Encoded frame |
| --- | --- |
| Āṭaveladi | `SSSII / SSSSS / SSSII / SSSSS` |
| Tēṭagīti | four lines of `SIISS` |
| Dvipada | two lines of `IIIS`, with dvitīyākṣara-prāsa |
| Mañjarī Dvipada | the same `IIIS` couplet without compulsory prāsa |
| Sīsamu | four `IIIIIISS` long lines, or eight written half-lines; optional conventional ettugīti layout |
| Taruvoja | four long lines of `IIISIIIS`, also accepted as eight half-lines |
| Madhyākkara | four long lines of `IISIIS`, also accepted as eight half-lines |
| Telugu Kandamu | 3/5/3/5 four-mātrā gaṇas with Telugu Kanda restrictions and prāsa |
| Mutyāla Sarālu | `14/14/14/7–14` mātrās; first three lines use `3+4+3+4` |

Sīsamu accepts an attached four-line Tēṭagīti or Āṭaveladi as its conventional
ettugīti. The ordinary four-long-line and eight-half-line spellings remain
equivalent, so line wrapping is not mistaken for a different metre.

## Ragaḍa family

The catalog records ten named gaits described in the cited Telugu rule packet:

- Hayapracāra: four 3-mātrā gaṇas;
- Turagavalgana: eight 3-mātrā gaṇas;
- Vijayamaṅgala: sixteen 3-mātrā gaṇas;
- Madhuragati and Harigati: four or eight 4-mātrā gaṇas;
- Dviradagati and Vijayabhadra: four or eight 5-mātrā gaṇas;
- Hariṇagati: `3+4+3+4`;
- Vṛṣabhagati: `3+4` repeated four times; and
- Haṃsagati: `5+5+3+3`.

Ragaḍa lines are evaluated as couplets. Both opening dvitīyākṣara-prāsa and
ending rhyme are checked pairwise. Their musical delivery permits more nuance
than a written mātrā grid, so the catalog calls these documented gaits rather
than claiming every historical performance license.

## Yati and prāsa boundary

The catalog records the traditional yati anchor gaṇas so the field guide and
future overlay can place the junction correctly. Dvipada, Kandamu, Taruvoja,
Madhyākkara and Ragaḍa also apply their encoded prāsa rules now.

Telugu yati-maitri is wider than literal character equality. Until an approved
corpus covers vowel friendship, consonant friendship, prāsa-yati and
historical exceptions, the analyser does not turn a merely non-identical yati
pair red. This is deliberate: an incomplete yati table should not teach a
false rule with great confidence.

## Pādānta lengthening and Telugu

The script does not decide whether a final Laghu may satisfy Guru. A
Sanskrit-derived fixed vṛtta receives its traditional pādānta allowance when
written in Telugu just as it does in Kannada or Devanagari. Native Telugu
jāti, upajāti, and deśi entries do not inherit that allowance automatically.
Their Sūrya/Indra endings and literal final-Guru requirements remain as each
meter defines them. In particular, the current Telugu Kandamu entry continues
to require its cataloged terminal Guru on lines 2 and 4; it does not borrow the
separate Kannada Kanda exception.

Terminal stretching in a song can make a final Laghu Guru-equivalent in
performance. That recital realization remains separate from strict written
meter validation until an individual sung form has an explicit sourced rule.

## Corpus policy

`examples/field_guide_corpus.json` contains offline regression examples with
source and rights notes. Public-domain Vemana, Baddena, Pālkuriki Somanātha,
Gurajada, Piṅgaḷi Sūrana, Sarvajña, Kālidāsa and traditional material form the
curated field-guide set. Mechanical signature tests cover every new layout
without pretending repeated test syllables are poetry.

## References

- C. P. Brown, *A Grammar of the Telugu Language*, Book XI:
  <https://te.wikisource.org/wiki/A_grammar_of_the_Telugu_language/BOOK_ELEVENTH>
- C. P. Brown, *The Prosody of the Telugu and Sanskrit Languages Explained*,
  p. 47:
  <https://te.wikisource.org/wiki/పుట:The_Prosody_of_the_Telugu_and_Sanscrit_L.pdf/47>
- *Little Masters Sulabha Vyakaranamu*, Kandamu:
  <https://te.wikisource.org/wiki/పుట:Little_Masters_Sulabha_Vyakaranamu.pdf/111>
- Andhra Bharati, “Ragaḍa” rule packet:
  <https://www.andhrabharati.com/bhAshha/ChaMdassu/ragaDalu.html>
- *Sukavi Manoranjanamu*, discussion of optional pādānta Laghu in vṛttas:
  <https://te.wikisource.org/wiki/సుకవి_మనోరంజనము/పంచమాశ్వాసము>
- J. K. Mohana Rao, “Pṛthvī Vṛttamu,” discussion of pādānta pause in Telugu
  vṛttas: <https://eemaata.com/em/issues/202210/29701.html>
- Gurajada Apparao, *Mutyāla Saramulu*:
  <https://te.wikisource.org/wiki/ముత్యాల_సరాలు/ముత్యాల_సరములు>
