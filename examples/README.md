# Example corpus policy

The Learn field guide displays a verse only when its source and reuse status are
recorded. Examples must be suitable for young readers and must scan without a
violation under the meter attached to them.

The application does not invent verses to fill catalog gaps. A meter without a
defensible example says so explicitly.

## Sources presently included

- Public-domain literary and traditional verses in
  `field_guide_corpus.json`, with the transcription source retained.
- Thirty-six illustrations from V. S. Apte's public-domain 1890 *Appendix A:
  Sanskrit Prosody* in `apte_sanskrit_examples.json`.
- Kālidāsa's opening *Meghadūta* stanza, checked against K. B. Pathak's
  public-domain 1916 edition on Internet Archive. It also exercises the
  traditional pādānta-lengthening rule.

The catalog-wide Internet Archive source inventory and reproducible gap audit
are documented in `docs/research/archive-meter-audit.md`. OCR is used to find
pages, never as sole authority for a verse or its meter.

Apte prints 99 examples. The current import omits damaged mixed-script
transcriptions, text that does not scan cleanly in the current engine, uncertain
meter-name mappings, and material that is not clearly suitable for children.
Those omissions are intentional; a plausible-looking verse is not the same as
a verified one.

## Admission checklist

1. Identify a named work, author or traditional collection, and a stable source.
2. Record why the underlying text may be redistributed.
3. Review the passage for young readers.
4. Select its intended meter and require zero analyzer violations in tests.
5. Preserve source spelling. Record editorial changes instead of silently
   repairing a verse to fit a pattern.
