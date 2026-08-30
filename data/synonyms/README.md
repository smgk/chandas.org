# Chandas synonym data

The two runtime files are deliberately separate datasets:

- `kn-alar-v1.json` contains conservative Kannada synonym candidates derived
  from Alar's explicitly shared definition identifiers. It does not infer a
  relationship merely because two English definitions happen to look alike.
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

The build is deterministic. Broad Alar groups are withheld into the readable
review file rather than being exposed as trustworthy suggestions.

