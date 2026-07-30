# Kannada aṃśa-meter rule packet

**Catalog IDs:** `structural:tripadi-kannada`,
`structural:sangatya`, `structural:piriyakkara`,
`structural:doreyakkara`, `structural:naduvanakkara`,
`structural:edeyakkara`, `structural:kiriyakkara`  
**Status:** Provisional core frames; expert corpus review pending

## Aṃśa classes

The evaluator keeps aṃśa-gaṇas distinct from simple mātrā totals. It recognizes
the documented realizations of:

- `B`: Brahma, four patterns spanning three or four mātrās;
- `V`: Viṣṇu, eight patterns spanning four through six mātrās;
- `R`: Rudra, sixteen patterns spanning five through eight mātrās.

This is necessary because overlapping mātrā totals alone do not identify an
aṃśa class.

## Encoded family frames

| Meter | Lines | Core frame |
| --- | ---: | --- |
| Tripadi | 3 | `VVVV / VBVV / VBV` |
| Sāṅgatya | 4 | `VVVV / VVB / VVVV / VVB` |
| Piriyakkara | 4 | `B(V/B)V(V/B)VVR` on each line |
| Doreyakkara | 4 | `VVBVVB` on each line |
| Naḍuvaṇakkara | 4 | `BVVVR` on each line |
| Eḍeyakkara | 4 | `BVVR` on each line |
| Kiriyakkara | 4 | `VVR` on each line |

Tripadi additionally checks Brahma gaṇas 6 and 10, double-Laghu openings at
gaṇas 7 and 11, yati after gaṇa 2 of line 1, yati after gaṇa 3 of line 2,
opening dvitīyākṣara-prāsa across all three lines, and its internal recurrence
at the second syllable of the first line's third gaṇa.

Sāṅgatya and the five Akkara forms check opening dvitīyākṣara-prāsa across all
four lines. In every such check, the second akṣara's terminal consonant and the
Guru/Laghu weight of the first syllable are independent conditions.

## Deliberately provisional

Aṃśa meters are sung forms with documented substitution and recitational
freedom. The current release does not pretend that every such choice can be
deduced from a short prose rule. Historical prāsa equivalences, melodic
elongation, Tripadi repetition, folk variation, and substitutions not
explicitly represented in the catalog remain provisional until a prosody
expert approves redistributable examples.

## References

- Nāgavarma, *Canarese Prosody*, Ferdinand Kittel edition (1875), rules
  271–281: <https://archive.org/details/nagavarmascanare00nagarich>
- University of Mysore Encyclopaedia, “Kannada Prosody”:
  <https://kn.wikisource.org/wiki/ಮೈಸೂರು_ವಿಶ್ವವಿದ್ಯಾನಿಲಯ_ವಿಶ್ವಕೋಶ/ಕನ್ನಡ_ಛಂದಸ್ಸು>
- *Chanda Nikasha: Verification and Identification of meters in Kannada
  Prosody*: <https://kannadakali.com/crav/dev/docs/ChandaNikasha-English.pdf>
