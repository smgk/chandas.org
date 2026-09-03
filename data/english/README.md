# Offline English pronunciation packs

`en-cmudict-stress-v1.json` is a deterministic, compact derivative of the
[CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict). It retains
only a normalized spelling and every distinct lexical-stress sequence found
for that spelling. It intentionally omits phonemes because M2 and M3 need
syllable count and stress, not speech synthesis.

`en-cmudict-rhyme-v1.json` is the separately lazy-loaded M5 companion. For
each pronunciation it retains only the final stressed vowel and following
phonemes, plus the number of trailing syllables needed to distinguish
masculine and feminine rhyme. It is not a speech or general phoneme database.

The source is pinned to commit
`74790861f652b15e4ac49015a90074ad62a27690`. The generated JSON records the
source file's SHA-256 digest and row counts so a build can be audited. Rebuild
it from an independently checked-out copy with:

```sh
node scripts/build-english-lexicon.js \
  --source /path/to/cmudict.dict \
  --revision 74790861f652b15e4ac49015a90074ad62a27690 \
  --output data/english/en-cmudict-stress-v1.json

node scripts/build-english-rhyme.js \
  --source /path/to/cmudict.dict \
  --revision 74790861f652b15e4ac49015a90074ad62a27690 \
  --output data/english/en-cmudict-rhyme-v1.json
```

The runtime shape is deliberately simple:

```json
["record", ["01", "10"]]
```

The rhyme pack stores compact `[rime-key, trailing-syllables]` records:

```json
["feared", [["IH.R.D", 0]]]
```

The source dictionary and this derived data file are distributed under
CMUdict's BSD-style terms reproduced in `CMUDICT_LICENSE`. The Chandas build
script and English analysis code remain GPL-3.0-only. No text being composed
is sent to CMU, Chandas, or another pronunciation service.

This first pack represents mainly North American English pronunciation.
Alternate dictionary pronunciations are retained, unknown words are marked as
guesses, and a caller can supply local per-word stress overrides. Those limits
remain visible in the composer. M5 reports only dictionary-backed perfect end
rhyme; slant, eye, internal, and dialect-sensitive rhyme remain future work.
