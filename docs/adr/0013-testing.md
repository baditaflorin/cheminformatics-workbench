# 0013 - Testing Strategy

## Status

Accepted

## Context

The project needs fast local checks because GitHub Actions are not used.

## Decision

Use Go tests for the generator, Vitest for frontend logic, Playwright for one happy-path browser workflow, and `scripts/smoke.sh` for build-plus-e2e smoke testing.

## Consequences

`make test` and `make smoke` are the main quality gates. Hooks call the same commands.

## Alternatives Considered

Skipping e2e tests was rejected because Pages base-path regressions are easy to miss.
