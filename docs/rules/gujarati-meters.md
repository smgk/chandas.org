<!--
Copyright © 2025–2026 Ganesh Krishna Shankarathota
SPDX-License-Identifier: GPL-3.0-only
-->

# Gujarati traditional-meter rule packet

**Catalog version:** 5.4.0  
**Application version:** 1.29.0  
**Scope:** Gujarati-script automatic detection only

The Gujarati scanner remains the same orthographic Guru/Laghu scanner used for
Gujarati-script Sanskrit. Native meters are a separate catalog layer: writing
Gujarati does not itself assert a Gujarati meter, and these entries do not enter
automatic Kannada or Devanagari results.

## Executable first catalog

- **Caupāī:** four 15-mātrā caraṇas, `4+4+4+3`, ending `GL`; four-line and
  compact two-line input.
- **Doharō:** `13+11 / 13+11`; four caraṇas or two compact lines. The current
  rule checks the totals and keeps regional rhyme practice advisory.
- **Soraṭhō:** `11+13 / 11+13`; its traditional first/third-caraṇa *tuk* is
  documented but not yet painted red.
- **Harigīt:** four 28-mātrā lines ending Guru. The traditional tāla positions
  are shown as a guide, not forced into artificial syllable boundaries.
- **Jhūḷaṇā:** four 37-mātrā lines modeled as seven pañcakal units plus a final
  Guru. Sung realization still needs a reviewed corpus.
- **Savaiyā:** the sourced 31-mātrā form ends `GL`; the separately named
  32-mātrā Batrīsā form remains provisional.
- **Roḷā:** `11+13 / 11+13`, with caraṇas 2 and 4 ending Guru; four-caraṇa and
  compact two-line input.
- **Kaṭāv:** repeatable `4+4+4+4` written units. Fully flowing typography is
  deferred.
- **Manhar and Ghanākṣarī:** conservative 31- and 32-akṣara count entries.
  Relaxed yati, rhyme, and printed half-line variants remain advisory.

The Learn page exposes each entry's recognition level, signature, aliases,
unchecked rules, and available authenticated example. A `Complete` label means
the encoded structural claim is complete; it does not claim that every
historical or performed variant has been solved.

## Sources

- Dalpatram, [*Gujarati Piṅgaḷ* (1909 edition)](https://rekhtagujarati.org/ebooks/detail/gujarati-pingal-ebooks).
- R. V. Pathak, [*Bṛhat Piṅgaḷ* overview](https://gujaratisahityaparishad.com/prakashan/sarjako/savishesh/Savishesh-Ra-Vi-Pathak.html), Gujarati Sahitya Parishad.
- [Sardar Patel University Gujarati meter curriculum](https://www.spuvvn.edu/orbit-cdn/uploads//Syllabi_data/ba/sixth_semester_2023_24/BA_Gujarati_Sem6-HistoryofModernGujaratiLiterature.pdf).
- Gujarati Wikisource grammar pages for [Caupāī](https://gu.wikisource.org/wiki/વ્યાકરણ/છંદ/ચોપાઈ), [Doharō](https://gu.wikisource.org/wiki/વ્યાકરણ/છંદ/દોહરો), [Soraṭhō](https://gu.wikisource.org/wiki/વ્યાકરણ/છંદ/સોરઠો), [Harigīt](https://gu.wikisource.org/wiki/વ્યાકરણ/છંદ/હરિગીત), [Jhūḷaṇā](https://gu.wikisource.org/wiki/વ્યાકરણ/છંદ/ઝુલણા), [Savaiyā](https://gu.wikisource.org/wiki/વ્યાકરણ/છંદ/સવૈયા), [Roḷā](https://gu.wikisource.org/wiki/વ્યાકરણ/છંદ/રોળાવૃત્ત), [Manhar](https://gu.wikisource.org/wiki/વ્યાકરણ/છંદ/મનહર), and [Ghanākṣarī](https://gu.wikisource.org/wiki/વ્યાકરણ/છંદ/ધનાક્ષરી).

## Deliberately deferred

Gujarati pronunciation can make the performed mātrā count differ from a purely
orthographic count. Those cases need Gujarati-only alternate realizations and
positive/negative examples; they must not become global schwa or stretching
rules. Gulbaṅkī and Vanavelī also need a flowing-text model. Garbī, garbā,
pada, bhajan, and prabhātiyā are not treated as single metrical signatures.
