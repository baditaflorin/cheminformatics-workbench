# 0045 - State Taxonomy And State Machine

## Status

Accepted

## Context

V1 had silent empty input and stale state risks.

## Decision

Use explicit analysis states documented in `docs/phase2-substance/states.md`. Latest input wins, stale docking is cleared on new input, and recoverable errors leave user input intact.

## Consequences

No reachable input state should leave the user stuck.

## Alternatives Considered

Implicit state derived only from nullable molecule/descriptor values was rejected.
