# 0012 - Metrics And Observability

## Status

Accepted

## Context

The project has no runtime server and no need to collect user behavior in v1.

## Decision

Ship no analytics by default. Use local tests, smoke checks, and visible artifact metadata for operational confidence.

## Consequences

No PII or usage telemetry is collected. Popularity must be inferred from GitHub stars, issues, and voluntary feedback.

## Alternatives Considered

Plausible or beacon analytics were rejected for v1 to keep privacy simple.
