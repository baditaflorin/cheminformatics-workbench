# 0048 - Determinism And Reproducibility

## Status

Accepted

## Context

Random molecule IDs and timestamp-heavy exports make fixture testing and reruns unstable.

## Decision

Use deterministic IDs derived from source format, source identifier, and SMILES. Export functions accept a caller-provided timestamp for deterministic tests and include app/schema/provenance metadata.

## Consequences

Same input can produce byte-identical normalized analysis and export in tests.

## Alternatives Considered

Using `crypto.randomUUID()` for analyzed molecules was rejected.
