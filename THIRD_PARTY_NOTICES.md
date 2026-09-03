# Third-party notices

## Sanskrit meter catalog

`mishra.json` contains a list of 1,348 meters input by Dr. Dhaval Patel,
based on Mārcis Gasūns's scraping of the site by Anand Mishra:

<http://sanskrit.sai.uni-heidelberg.de/Chanda/HTML/>

The matching source file is distributed by the
[`shreevatsa/sanskrit`](https://github.com/shreevatsa/sanskrit) project, which
is licensed under the GNU General Public License version 2. A copy of that
license is available from:

<https://github.com/shreevatsa/sanskrit/blob/master/LICENSE>

The catalog's attribution is retained in `mishra.json`. Chandas.org does not
claim authorship of the catalog.

## Structural and mātrā rule references

`structural_meters.json` is an original, machine-readable rule catalog created
for Chandas.org. Its initial pathyā Anuṣṭubh rule is documented against
“A Study on the Sanskrit Meter: Anuṣṭubh”:

<https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001963953>

The initial Āryā-family mātrā-group totals are documented against DHARMA's
Prosodic Patterns:

<https://dharmalekha.info/prosody>

The provisional Pañcamātrā Chaupadi (Kagga form) rule is documented in
`docs/rules/panchamatra-chaupadi.md` against:

- University of Mysore Encyclopaedia, *Kannada Prosody*:
  <https://kn.wikisource.org/wiki/ಮೈಸೂರು_ವಿಶ್ವವಿದ್ಯಾನಿಲಯ_ವಿಶ್ವಕೋಶ/ಕನ್ನಡ_ಛಂದಸ್ಸು>
- *Kannada metres*, Kannada Wikipedia, including the historical signatures and
  Kannada Campakamāle/Mahāsragdharā derivation formulas:
  <https://kn.wikipedia.org/wiki/ಕನ್ನಡ_ಛಂದಸ್ಸು>
- Shrikaanth K.'s Kannada meter overview and Kagga example:
  <https://threadreaderapp.com/thread/1262155137545654273.html>
- *Music and Prosody*, Prekshaa:
  <https://www.prekshaa.in/Music-Prosody-Chandas-Sangita>

These references establish the Chaupadi family, five-mātrā gait, and Kagga
usage. Their examples and page content are not bundled with the application.

The provisional Kannada Kanda rhythm rules are documented in
`docs/rules/kanda.md` against:

- Vishweshwar V. Dixit's *Chanda Nikasha (Naga-Pingala)*:
  <https://kannadakali.com/crav/dev/docs/ChandaNikasha-English.pdf>
- *Kandapadya*, Kannada Chandassu:
  <https://chandassu.onrender.com/chandassu/kandapadya>
- *Kanda Padya*, Classical Kannada:
  <https://shastriyakannada.org/database/english/literature/KANDA%20PADYA%20HTML.htm>

These references are citations for prosodic facts and terminology; their page
content is not bundled with the application.

The provisional Utsāha, Mandānila, and Lalita Ragaḷe rules are documented in
`docs/rules/ragale.md` against:

- *Ragale*, Classical Kannada:
  <https://shastriyakannada.org/database/english/literature/RAGALE%20%20HTML.htm>
- Vishweshwar V. Dixit's *Chanda Nikasha (Naga-Pingala)*:
  <https://kannadakali.com/crav/dev/docs/ChandaNikasha-English.pdf>
- Gil Ben-Herut's discussion of the Ragaḷe meter in Harihara's work:
  <https://etd.library.emory.edu/downloads/k3569460z?locale=e>
- *ರಗಳೆ*, Kannada Kanaja:
  <https://kannadakanaja-vyakarana.blogspot.com/2018/02/blog-post_26.html>

These references supply rule facts and terminology. Their examples and page
content are not bundled with the application.

The provisional six-form Ṣaṭpadi and aṃśa-family rules are documented in
`docs/rules/shatpadi.md` and `docs/rules/amsha-meters.md` against:

- Nāgavarma's *Canarese Prosody*, Ferdinand Kittel edition:
  <https://archive.org/details/nagavarmascanare00nagarich>
- University of Mysore Encyclopaedia, *Kannada Prosody*:
  <https://kn.wikisource.org/wiki/ಮೈಸೂರು_ವಿಶ್ವವಿದ್ಯಾನಿಲಯ_ವಿಶ್ವಕೋಶ/ಕನ್ನಡ_ಛಂದಸ್ಸು>
- *Ṣaṭpadi*, Classical Kannada:
  <https://shastriyakannada.org/database/english/literature/SHATPADI%20HTML.htm>
- Vishweshwar V. Dixit's *Chanda Nikasha (Naga-Pingala)*:
  <https://kannadakali.com/crav/dev/docs/ChandaNikasha-English.pdf>

These public references supply prosodic facts, terminology, and catalog
frames. Their scans, articles, and examples are not bundled with the
application.

The separate provisional folk Tripadi mātrā frame and sung-Laghu annotation
are documented in `docs/rules/folk-tripadi.md` against:

- *Tripadi*, Classical Kannada:
  <https://shastriyakannada.org/database/english/literature/TRIPADI%20HTML.htm>
- *Akshara Gana, Matra Gana and Amshagana*, Classical Kannada:
  <https://shastriyakannada.org/database/english/literature/AKSHARA%20GANA%2C%20MATRA%20GANA%20AND%20AMSHAGANA%20HTML.htm>

These references supply rule facts and terminology. Their page content is not
bundled with the application.

## Telugu deśi rules and field-guide examples

The Telugu Sūrya/Indra-gaṇa rules and meter frames are documented in
`docs/rules/telugu-desi-meters.md`. Principal references include C. P. Brown's
public-domain *A Grammar of the Telugu Language* and *The Prosody of the
Telugu and Sanskrit Languages Explained*, along with the individually linked
Telugu teaching references recorded in `structural_meters.json`.

`examples/field_guide_corpus.json` bundles short, attributed examples for
offline learning and regression testing. The classical and traditional poems
are public-domain originals. Wikisource and other transcription/source links,
authors, titles, and rights notes are retained with each example; Chandas.org
does not claim authorship of those poems. The corpus structure, expected
analysis data, and original explanatory copy are Chandas.org work under the
repository license.

## Apte Sanskrit prosody examples

`examples/apte_sanskrit_examples.json` contains thirty-six short Sanskrit meter
illustrations transcribed from Vaman Shivram Apte's 1890 *Appendix A: Sanskrit
Prosody*:

<https://www.sanskrit-lexicon.uni-koeln.de/scans/csldev/csldoc/build/dictionaries/prefaces/ap90app1.html>

The corresponding public-domain scan used for page verification is:

<https://archive.org/details/standardsanskri00unkngoog>

The underlying 1890 text and the classical or traditional verses it records
are in the public domain. The source link, compiler attribution, and
transcription attribution are retained with every example. Chandas.org's
selection, child-safety review, scansion expectations, and corpus structure are
repository work under GPL-3.0-only.

## Internet Archive research sources

`research/archive_sources.json` records the public-domain scans used for the
catalog-wide meter audit. The source texts and OCR are not bundled with the
application. Internet Archive is used as a scan host and page-finding resource;
OCR matches are not treated as meter attribution.

The Mandākrāntā example in `examples/field_guide_corpus.json` is the opening
verse of Kālidāsa's public-domain *Meghadūta*, checked against K. B. Pathak's
1916 edition:

<https://archive.org/details/kalidasas-meghaduta-skt-eng-kb-pathak-1916>

## Offline synonym data

`data/synonyms/kn-alar-v1.json` contains information from
[V. Krishna's Alar Kannada–English dictionary](https://github.com/alar-dict/data),
made available under the
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
The complete adapted JSON database and deterministic transformation are
distributed with Chandas, and the adapted database remains ODbL-1.0.

`data/synonyms/sa-amarakosha-v1.json` contains direct synonym sets from
Amarasiṃha's *Nāmaliṅgānuśāsana* (*Amarakośa*) using the
[Cologne Digital Sanskrit Lexicon edition](https://github.com/sanskrit-lexicon/AMAR),
released under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Attribution
is retained for Amarasiṃha, the University of Hyderabad SCL digitisation, and
CDSL's conversion and correction contributors. The resulting Sanskrit JSON
remains CC BY-SA 4.0.

The two databases are separate data works and are not relicensed under the
GPL license of the Chandas application. The complete data notices are in
`data/synonyms/DATA_LICENSES.md`.

## English pronunciation data

`data/english/en-cmudict-stress-v1.json` and
`data/english/en-cmudict-rhyme-v1.json` are deterministic stress-only and
final-rime derivatives of the
[CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict), pinned to
commit `74790861f652b15e4ac49015a90074ad62a27690`.

CMUdict is copyright © 1993–2015 Carnegie Mellon University and contributors
and is redistributed under its BSD-style terms. Those terms are reproduced in
`data/english/CMUDICT_LICENSE`. The generated data file remains governed by
those terms; the Chandas builder and analysis implementation are separate
GPL-3.0-only work.

`examples/english_prosody_corpus.json` contains short lines from attributed
public-domain poems. The Chandas selection, scansion expectations, test
metadata, and rule packet are original repository work under GPL-3.0-only.
No annotations from the externally referenced *For Better For Verse* project
are bundled because its repository does not publish clear redistribution
terms.
