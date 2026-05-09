# 0046 - Performance Budgets

## Status

Accepted

## Context

Large payloads can take hundreds of milliseconds when treated as raw SMILES.

## Decision

Input classification should complete under 300 ms for ordinary fixtures. Inputs over 1 MB are classified as large and must not proceed to descriptor scoring unless a supported extractor can parse them safely.

## Consequences

Large malformed data becomes a recoverable input issue rather than a UI-blocking fake molecule.

## Alternatives Considered

Letting descriptor code scan large arbitrary text was rejected.
