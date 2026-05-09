# 0040 - Real-Data Audit Findings And Substance Success Metrics

## Status

Accepted

## Context

The v1 app works on curated SMILES but produces wrong-confident output for common molecule payloads such as PubChem SDF, ChEMBL JSON, InChI, CSV rows, empty input, and large malformed data.

## Decision

Use the 10 fixtures in `docs/phase2-substance/realdata-audit.md` as the Phase 2 grading rubric. Phase 2 success requires at least 7/10 fixtures to either produce validated molecule results or a domain-specific recoverable error with no fake prediction/docking output.

## Consequences

Implementation priority follows fixture impact rather than visual polish or new feature ideas.

## Alternatives Considered

Using only synthetic tests was rejected because it would repeat the v1 happy-path bias.
