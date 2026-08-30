# Chandas synonym data

The two runtime files are deliberately separate datasets:

- `kn-alar-v1.json` contains Kannada synonym candidates derived from Alar's
  explicitly shared definition identifiers and deterministic English-meaning
  anchors. Inferred groups are marked `english-meaning` so the interface can
  distinguish them from source-explicit relationships.
- `sa-amarakosha-v1.json` contains the direct synonym sets encoded in the
  Cologne Digital Sanskrit Lexicon edition of the *Amarakośa*.

The browser combines search results at runtime. It does not merge or relicense
the source databases. See `DATA_LICENSES.md` for attribution and reuse terms.

## Rebuilding

Download these pinned source files outside the repository:

- Alar `alar.yml` at revision
  `8651ccf8e92184ca17e234eeb6c947d8d52dd5c4`
- CDSL `AMAR/amar.txt` at revision
  `f5575c3a7742effabb3b79a8aa37d9b2d57bbb98`

Then run:

```sh
node scripts/build-synonyms.js \
  --alar /path/to/alar.yml \
  --amara /path/to/amar.txt \
  --out-dir data/synonyms \
  --review research/synonyms/alar-review-v1.json
```

The build is deterministic. It rejects generic descriptions and usage notes,
keeps only one concise meaning anchor per definition, caps inferred group size,
and withholds broader groups in the readable review file.
