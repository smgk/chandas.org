<!--
Copyright © 2025–2026 Ganesh Krishna Shankarathota
SPDX-License-Identifier: GPL-3.0-only
-->

# Pañcamātrā Chaupadi — Kagga-form rule packet

**Catalog ID:** `structural:panchamatra-chaupadi-kagga`
**Status:** Provisional written-text frame; expert corpus review pending

## Scope

Chaupadi is a family of four-line Kannada meters, not one invariant modern
pattern. The University of Mysore Encyclopaedia describes both aṃśa and mātrā
forms and gives the historical mātrā form as three five-mātrā gaṇas followed
by a three-mātrā gaṇa.

D. V. Gundappa's *Mankuthimmana Kagga* is commonly identified as
pañcamātrā chaupadi, but its familiar written form has a distinct modal line
profile. This entry deliberately recognizes that **Kagga form** instead of
claiming to implement every historical chaupadi.

## Encoded written-text frame

| Line | Gaṇa capacities | Written mātrās |
| --- | --- | ---: |
| 1 | `5 + 5 + 5 + 5` | 20 |
| 2 | `5 + 5 + 5 + 3` | 18 |
| 3 | `5 + 5 + 5 + 5` | 20 |
| 4 | `5 + 5 + 5 + 1` | 16 |

The final written Laghu in the fourth line may be lengthened at pādānta in
recitation. Chandas currently displays and validates the written syllable
weight, so the catalog keeps the written one-mātrā cadence and states the
recitational behavior separately.

## Deliberately provisional

The first implementation checks:

- exactly four written lines;
- the modal `5555 / 5553 / 5555 / 5551` group capacities;
- group-boundary overruns, missing mātrās, and extra mātrās;
- opening dvitīyākṣara-prāsa across the four lines; and
- line-ending antya-prāsa across the four lines.

It does not yet check pādānta lengthening, śithila-dvitva, historical prāsa
equivalence classes, or every historical and modern chaupadi variant. Those
rules need a redistributable, expert-reviewed corpus before the detector can
safely accept more alternatives.

## References

- University of Mysore Encyclopaedia, “Kannada Prosody,” discussion of
  aṃśa and mātrā Chaupadi:
  <https://kn.wikisource.org/wiki/ಮೈಸೂರು_ವಿಶ್ವವಿದ್ಯಾನಿಲಯ_ವಿಶ್ವಕೋಶ/ಕನ್ನಡ_ಛಂದಸ್ಸು>
- Shrikaanth K., Kannada meter overview identifying Kagga as pañcamātrā
  chaupadi and giving a representative stanza:
  <https://threadreaderapp.com/thread/1262155137545654273.html>
- Prekshaa, “Music and Prosody,” discussion of five-mātrā-gaṇa Chaupadi
  cadences:
  <https://www.prekshaa.in/Music-Prosody-Chandas-Sangita>
