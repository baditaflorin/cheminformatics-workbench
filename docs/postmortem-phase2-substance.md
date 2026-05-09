# Phase 2 Substance Postmortem

## Real-Data Pass Rate

Before: 0/10 full pass, 1/10 partial pass.

After: 10/10 pass under the Phase 2 bar. Seven fixtures produce validated molecule candidates with confidence; three fixtures correctly stop as recoverable input errors without fake prediction or docking output.

| Fixture                 | Before                                  | After                                        |
| ----------------------- | --------------------------------------- | -------------------------------------------- |
| 01 clean PubChem SMILES | Partial, formula/MW weak                | Valid candidate, stable ID, confidence       |
| 02 Word/email SMILES    | Wrong-confident fake formula            | Extracted normalized SMILES                  |
| 03 ChEMBL CSV row       | Wrong-confident fake formula            | Extracted SMILES/name/row metadata           |
| 04 metformin HCl salt   | No salt awareness                       | Parent component selected with warning       |
| 05 PubChem InChI        | Wrong-confident active/docking result   | Recoverable InChI unsupported error          |
| 06 PubChem aspirin SDF  | Parsed as `C`                           | Extracted `PUBCHEM_SMILES`, CID, formula, MW |
| 07 PubChem multi-SDF    | Mixed aspirin name with caffeine SMILES | Detected 2 candidates, first active, warning |
| 08 ChEMBL JSON          | Scored JSON as molecule                 | Extracted canonical SMILES/name/properties   |
| 09 empty input          | Silent no-op                            | Recoverable empty-input error                |
| 10 large truncated JSON | Scored 3.6 MB garbage                   | Recoverable partial JSON error in 12.41 ms   |

## Top 5 Logic Gaps

1. Raw input was assumed to be SMILES. Closed with input classification for empty, SMILES, InChI, SDF, delimited rows, ChEMBL JSON, partial JSON, and unsupported text.
2. PubChem SDF aliases were ignored. Closed with SDF property alias extraction and multi-record splitting.
3. Arbitrary text became fake chemistry. Closed by blocking descriptor/prediction/docking unless a molecule candidate is validated.
4. No confidence model existed. Closed with candidate confidence, reasons, warnings, and issue codes in UI/export/debug metadata.
5. One-molecule-only assumptions broke lists. Partially closed with multi-candidate extraction and active-first behavior while preserving all candidates in debug/export metadata.

## Smart Behaviors Delivered

- The app now guesses the payload shape before scoring.
- The app extracts obvious molecule candidates from real PubChem SDF, multi-SDF, ChEMBL JSON, CSV rows, and copied SMILES.
- Unsupported or malformed inputs explain what happened, why it matters, and what to do next.
- Exports include schema version, app version, source format, confidence, issue codes, and provenance.
- Stable molecule IDs make repeated runs reproducible.

## Determinism

All 10 fixtures pass deterministic extraction tests. JSON export is byte-identical when the caller supplies a fixed timestamp.

## Performance

Median fixture classification: 0.30 ms.

p95: 12.41 ms.

Worst: 12.41 ms on the 3.6 MB truncated ChEMBL JSON fixture.

Details: `docs/perf/phase2-fixtures.md`.

## Cold Walk-Through

Fresh input: PubChem ibuprofen CID 3672 SDF, not part of the 10 audit fixtures.

Result: loaded as SDF, extracted `CC(C)CC1=CC=C(C=C1)C(C)C(=O)O`, source name `CID 3672`, confidence `0.96`, formula `C13H18O2`, molecular weight `206.28`.

Huh moments still observed:

- The active-first behavior for multi-record files is useful but still under-exposes the rest of the candidate list in the normal UI.
- Clean typed SMILES still relies on approximate browser descriptors unless source metadata supplies formula/MW.
- InChI is detected honestly but not converted.

## Surprises

- ChEMBL JSON contains embedded molfile text with `M  END`, so JSON detection must run before SDF detection.
- The largest real-data failure was not slow after classification was added; the real risk was fake chemistry, not raw throughput.
- PubChem SDF gives enough metadata to avoid many weak descriptor guesses if the app trusts source properties.

## Still Open For Phase 3

1. True RDKit-backed descriptor computation for typed SMILES.
2. First-class multi-molecule table UI instead of active-first metadata preservation.
3. InChI conversion through a maintained browser/offline adapter.
4. User-correctable candidate selection and learned correction patterns.
5. Web Worker classification for much larger valid screening-list files.

## Honest Take

It no longer feels like a toy at the input boundary: it recognizes common real cheminformatics payloads, refuses fake scoring, and explains failures in domain terms. It still feels prototype-like for multi-molecule workflows and exact descriptor science because the UI activates one candidate and typed SMILES descriptors remain approximate without RDKit-derived property calculation.
