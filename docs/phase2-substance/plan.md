# Phase 2 Substance Plan

Priority is ranked by real-data impact on the 10 audit fixtures.

## Picklist

1. A1: Fuzz parser with the 10 real fixtures plus synthetic edge cases.
2. A2: Normalize UTF-8 BOM, NBSP, smart quotes, CRLF/LF, comments, and whitespace.
3. A3: Define large-input size budget and test the large ChEMBL JSON fixture.
4. A4: Handle partial/truncated inputs with recoverable domain errors.
5. A5: Reject adversarial non-molecule payloads before descriptor scoring.
6. B6: Auto-detect payload structure: SMILES, InChI, SDF, multi-SDF, CSV/TSV, ChEMBL JSON, empty, malformed.
7. B7: Auto-classify molecule-bearing fields in CSV/TSV/JSON/SDF.
8. B8: Produce a useful first guess immediately after input.
9. B9: Normalize molecule text and source fields by default.
10. C11: Use cheminformatics vocabulary in domain messages.
11. C12: Add domain-aware validation for unsupported InChI, salts, malformed SDF/JSON, and no molecule found.
12. C13: Recognize common molecule payload shapes: single SMILES, SDF, multi-record SDF, ChEMBL JSON, row exports.
13. C14: Add domain-aware export provenance and confidence metadata.
14. C15: Bake in SDF property aliases and CSV delimiter sniffing.
15. D16: Attach confidence scores to every extracted molecule and inference.
16. D17: Suggest fixes for empty, InChI, partial JSON, and missing SMILES.
17. D18: Surface anomalies: multiple records, salt/counterion, too-large/partial payloads.
18. D19: Explain inference reasons in exported/debug metadata.
19. E21: Make JSON export a canonical round-trip-ish state envelope for the analyzed molecule.
20. E22: Use stable deterministic molecule IDs derived from source and SMILES.
21. F24: Enumerate reachable input/analysis states.
22. F25: Ensure every state has an actionable exit.
23. F27: Define double-click/concurrency behavior as latest input wins.
24. G28: Measure fixture performance and record before/after.
25. G31: Cache derived descriptor/prediction inputs by stable molecule ID.
26. H32: Make errors actionable: what failed, why, now what.
27. H33: Validate at input boundaries before descriptor/prediction/docking.
28. H34: Mark recoverable vs fatal issues explicitly.
29. I35: Test deterministic extraction/export for all fixtures.
30. I37: Add `?debug=1` internal state surface.
31. I38: Include output provenance in JSON/CSV export.
32. J39: Remember session correction defaults for salt parent selection and selected receptor.

## Initial Pass Target

Close the top 5 audit gaps enough to reach at least 7/10 fixture pass rate without manual extraction. Unsupported formats pass when they fail gracefully and do not produce fake predictions.
