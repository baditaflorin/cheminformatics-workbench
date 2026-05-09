# 0043 - Domain Vocabulary And UI Language

## Status

Accepted

## Context

Errors like "undefined" or generic parse failures are not useful to chemists.

## Decision

Messages use domain terms: SMILES, InChI, SDF record, PubChem property, ChEMBL molecule, salt/counterion, canonical SMILES, descriptor, docking score, and confidence.

## Consequences

Failures explain what happened in the user's vocabulary and suggest a next step.

## Alternatives Considered

Developer-centric parser messages were rejected.
