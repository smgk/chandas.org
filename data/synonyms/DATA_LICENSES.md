# Synonym-data licenses and attribution

The Chandas application code is GPL-3.0-only. The lexical data below is
distributed separately under its source data licenses.

## Kannada: Alar-derived candidates

Contains information from [V. Krishna's Alar Kannada–English dictionary](https://github.com/alar-dict/data),
which is made available under the [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).

Copyright and database attribution: Alar dictionary corpus © V. Krishna.

`kn-alar-v1.json` is an adapted database and is itself offered under ODbL 1.0.
The complete machine-readable adapted database is the JSON file distributed
with Chandas; no separate server-side data is required to reproduce its public
output. The deterministic transformation is in `scripts/build-synonyms.js`.

## Sanskrit: Amarakośa

`sa-amarakosha-v1.json` is derived from the
[Amarakośa in CDSL format](https://github.com/sanskrit-lexicon/AMAR), released
under [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Attribution: Amarasiṃha, *Nāmaliṅgānuśāsana* (*Amarakośa*); University of
Hyderabad SCL digitisation; conversion, corrections and publication by the
Cologne Digital Sanskrit Lexicon contributors. Chandas converted the encoded
SLP1 synsets to Devanagari and selected groups containing at least two words.

The resulting Sanskrit JSON is offered under CC BY-SA 4.0.

