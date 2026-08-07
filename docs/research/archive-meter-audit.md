# Internet Archive meter audit

This audit covers every meter entry exposed by Chandas.org, including obscure
fixed vṛttas. It does **not** pretend that finding a name in bad OCR proves the
meter of a nearby verse.

The source inventory is versioned in `research/archive_sources.json`. It starts
with public-domain scans of Apte, Brown, Nāgavarma/Kittel, two independent
Vṛttaratnākara–Chandomañjarī editions, and Pathak's *Meghadūta*. The audit
script classifies every catalog entry as having a verified example, having an
example whose source is still pending, or still needing research:

```sh
npm run audit:meters
```

The 2026-08-06 OCR sweep checked all 1,408 catalog entries (1,399 unique IDs)
against those six sources and produced 121 normalized Roman-name leads. That
number is intentionally not shown as “covered”: generic names, Devanagari-only
indexes, and OCR damage create both false positives and false negatives.

Researchers who have downloaded an Archive `*_djvu.txt` file can add one or
more OCR indexes. The source ID must come from the inventory:

```sh
node scripts/audit-meter-sources.js \
  --ocr brown-1869=/path/to/brown_djvu.txt \
  --ocr nagavarma-kittel-1875=/path/to/nagavarma_djvu.txt
```

Use `--json` for the complete per-entry ledger. An `archiveOcrLeads` value is a
page-finding lead only. Before a verse enters Learn, a human must inspect its
source page, verify the attribution and meter, check that it is suitable for
children, and make it pass the corpus regression test without violations.

## Finding so far: pādānta lengthening

The Vṛttaratnākara–Chandomañjarī scans preserve the traditional option by
which a Laghu at the end of a pāda may fill a final Guru position. Brown also
notes the treatment of a final syllable. This matters in the opening verse of
Kālidāsa's *Meghadūta*: the third and fourth Mandākrāntā pādas end in
short `षु`, although the catalog signature ends in Guru.

Chandas therefore accepts only `L → G` at a real or confidently inferred
pāda boundary. It does not relax an internal syllable, turn final Guru into
Laghu, or use an arbitrary visual line wrap as a metrical boundary. The
orthographic syllable stays Laghu in the analysis data and carries an explicit
`padanta-lengthening` adjustment; the selected-meter display shows its effective
Guru value without marking a violation.

## What “full” means here

The catalog is much larger than the set of securely located literary examples.
Every entry is present in the generated ledger, so research gaps are measurable
and cannot disappear behind a hand-picked list. “Research pending” means no
example has passed the admission process yet; it does not mean that no example
exists. This is intentionally slower than manufacturing plausible Sanskrit and
calling it evidence.
