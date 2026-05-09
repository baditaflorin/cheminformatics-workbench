# 0042 - Inference Engine

## Status

Accepted

## Context

Users paste molecule-bearing payloads, not just bare SMILES.

## Decision

Infer input shape in this order: empty, SDF/multi-SDF, JSON, InChI, CSV/TSV, SMILES-like text, unsupported text. Extract molecule candidates with stable IDs, confidence, reasons, warnings, source metadata, and raw provenance.

## Consequences

The app can make a useful first guess from real inputs. Low-confidence or unsupported inputs are blocked before prediction.

## Alternatives Considered

Asking users to manually select the format was rejected because Phase 2 is about useful first guesses.
