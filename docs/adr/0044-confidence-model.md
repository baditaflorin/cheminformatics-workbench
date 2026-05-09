# 0044 - Confidence Model

## Status

Accepted

## Context

V1 showed every output with equal confidence, even when the input was JSON or InChI misread as SMILES.

## Decision

Every molecule candidate carries a numeric confidence, label, reasons, and warnings. Exports include confidence. Prediction/docking are blocked when no validated candidate exists.

## Consequences

Users can tell extraction quality before trusting descriptors or predictions.

## Alternatives Considered

Binary valid/invalid was rejected because many real cases are usable with warnings.
