# Kannada aṃśa-meter rule packet

**Catalog IDs:** `structural:tripadi-kannada`,
`structural:sangatya`, `structural:piriyakkara`,
`structural:doreyakkara`, `structural:naduvanakkara`,
`structural:edeyakkara`, `structural:kiriyakkara`,
`structural:ele-kannada`, `structural:chaupadi-amsha-kannada`,
`structural:amsha-shatpadi`, `structural:sobagina-sone`,
`structural:chandovatamsa-nagavarma`,
`structural:adivaraha-jayakirti`,
`structural:akkarike-nagavarma`,
`structural:madanavati-nagavarma`
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
| Eḷe | 2 | `VVVV / VBV` |
| Aṃśa Chaupadi | 4 | `VR` on each line |
| Aṃśa Ṣaṭpadi | 6 | `VV / VV / VVR`, repeated |
| Sobagina Sone | 4 | `VVVV / VVV / VVVV / VVV` |
| Chandovatamsa (Nāgavarma) | 4 | `VVVB` on each line |
| Ādivarāha (Jayakīrti) | 4 | `VBBBB` on each line |
| Akkarike (Nāgavarma) | 4 | `VBVBVR` on each line |
| Madanavatī (Nāgavarma) | 4 | `VVVVV+G` on each line |

Tripadi additionally checks Brahma gaṇas 6 and 10, double-Laghu openings at
gaṇas 7 and 11, yati after gaṇa 2 of line 1, yati after gaṇa 3 of line 2,
opening dvitīyākṣara-prāsa across all three lines, and its internal recurrence
at the second syllable of the first line's third gaṇa.

Sāṅgatya and the five Akkara forms check opening dvitīyākṣara-prāsa across all
four lines. In every such check, the second akṣara's terminal consonant and the
Guru/Laghu weight of the first syllable are independent conditions.

Eḷe also checks the yati after its first line's second gaṇa and the internal
prāsa in the following gaṇa. Madanavatī's terminal `G` is a literal final Guru,
not a fourth aṃśa class. Its equal-mātrā `4V+R` division is documented as an
unchecked alternative until the evaluator can retain alternative whole-line
aṃśa divisions without choosing one arbitrarily.

## Deliberately provisional

Aṃśa meters are sung forms with documented substitution and recitational
freedom. The current release does not pretend that every such choice can be
deduced from a short prose rule. Historical prāsa equivalences, melodic
substitutions, Tripadi repetition, folk variation, and substitutions not
explicitly represented in the catalog remain provisional until a prosody
expert approves redistributable examples.

## Recital karṣaṇa (`ಽ`)

The three classes have full sung capacities of four, six, and eight mātrās:

| Class | First aṃśa | Later aṃśas | Full sung duration |
| --- | --- | --- | ---: |
| Brahma (`B`) | `G` or `LL` | one syllable | 4 |
| Viṣṇu (`V`) | `G` or `LL` | two syllables | 6 |
| Rudra (`R`) | `G` or `LL` | three syllables | 8 |

The opening `G` or `LL` fills the first aṃśa and is not marked. Every Laghu
occupying a later aṃśa is lengthened by one mātrā in recitation. Chandas keeps
that syllable visibly Laghu and places a faint superscript avagraha `ಽ` after
it. Thus:

- Brahma `GL` is displayed as `G Lಽ`;
- Viṣṇu `GLL` is displayed as `G Lಽ Lಽ`;
- Rudra `GLLL` is displayed as `G Lಽ Lಽ Lಽ`; and
- in `LLLL`, the opening `LL` is unmarked while the last two Laghus receive
  `ಽ`.

The guide is shown whenever one of these aṃśa meters is selected. It may also
appear before selection when exactly one complete aṃśa meter is detected.
When equally good gaṇa divisions imply different karṣaṇa positions, only
positions shared by every best division are marked and the UI reports the
ambiguity. The marks are analysis overlays: editor text, copy, sharing, and
analysis URLs retain only the authored poem.

## References

- Nāgavarma, *Canarese Prosody*, Ferdinand Kittel edition (1875), rules
  271–281: <https://archive.org/details/nagavarmascanare00nagarich>
- University of Mysore Encyclopaedia, “Kannada Prosody”:
  <https://kn.wikisource.org/wiki/ಮೈಸೂರು_ವಿಶ್ವವಿದ್ಯಾನಿಲಯ_ವಿಶ್ವಕೋಶ/ಕನ್ನಡ_ಛಂದಸ್ಸು>
- *Chanda Nikasha: Verification and Identification of meters in Kannada
  Prosody*: <https://kannadakali.com/crav/dev/docs/ChandaNikasha-English.pdf>
