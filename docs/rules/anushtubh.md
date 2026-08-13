<!--
Copyright © 2025–2026 Ganesh Krishna Shankarathota
SPDX-License-Identifier: GPL-3.0-only
-->

# Anuṣṭubh (Śloka) rule packet

**Stable catalog ID:** `structural:anushtubh-pathya`  
**Catalog version expanded:** `5.3.0`  
**Recognition level:** classical pathyā and four standard vipulās

The stable ID retains `pathyā` so saved poems and analysis links from older
versions continue to resolve. The display name now says *Anuṣṭubh (śloka)*
because odd pādas are no longer restricted to pathyā alone.

## Shared frame

- Four pādas of eight syllables; positions 1 and 8 are anceps.
- Positions 2 and 3 must not both be Laghu.
- Even pādas require positions 5–7 = `LGL` and exclude `GLG` at positions
  2–4 in addition to the shared opening restriction.
- Four separately written pādas and two complete `8 + 8 / 8 + 8` half-verses
  are equivalent. The compact interpretation remains conservative while a
  verse is incomplete.

## Accepted odd-pāda realizations

| Realization | Encoded constraint | Boundary |
| --- | --- | --- |
| pathyā | positions 5–7 = `LGG` | none |
| na-vipulā | positions 4–7 = `GLLL` | none |
| bha-vipulā | positions 2–7 = `GLGGLL` | none |
| ma-vipulā | positions 2–7 = `GLGGGG` | visible caesura after syllable 5 |
| ra-vipulā | positions 4–7 = `GGLG` | visible caesura after syllable 4 |

The engine chooses a realization independently for odd pādas 1 and 3. It
recomputes the winning realization before placing violations, so a valid
vipulā is not painted as a broken pathyā.

Ma- and ra-vipulā can place their caesura at a word or compound-member
boundary. Plain Unicode text exposes a word boundary reliably but does not
expose every internal compound boundary. Catalog 5.3 therefore accepts a
visible whitespace or punctuation boundary and does not guess an invisible
morphological boundary.

Rare, early, or disputed realizations—including sa-vipulā and uncommon
bha-vipulā substitutions—are not accepted by this conservative release.

## Sources

- Seong Baeg-In, [A Study on the Sanskrit Meter:
  Anuṣṭubh](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001963953).
- DHARMA Project, [Encoding Guide for Diplomatic
  Editions](https://erc-dharma.github.io/project-documentation/encoding-diplomatic/DHARMA%20EGD%20v1%20release.pdf),
  prosody appendix tables for pathyā and vipulā forms.

## Regression coverage

- Positive fixtures for pathyā and each accepted vipulā.
- Both odd pādas may select their realization independently.
- Ma- and ra-vipulā fail locally when the required visible caesura is absent.
- Invalid eight-syllable sequences remain violations rather than becoming a
  generic permissive Anuṣṭubh match.
- Existing four-line, compact two-line, danda, partial-input, and source-range
  behavior remains covered.
