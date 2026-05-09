# 0041 - Input Robustness And Normalization Policy

## Status

Accepted

## Context

Real molecule inputs arrive with BOMs, NBSPs, smart quotes, comments, CRLFs, CSV/TSV structure, JSON, SDF aliases, salts, and truncation.

## Decision

Normalize text at the boundary before any descriptor logic. Classification runs before scoring. Unsupported or malformed formats become recoverable domain errors.

## Consequences

Descriptor and prediction code no longer sees arbitrary text as chemistry. Users get extraction notes instead of silent wrongness.

## Alternatives Considered

Continuing to pass raw textarea contents to descriptor code was rejected because it created fake formulas and predictions.
