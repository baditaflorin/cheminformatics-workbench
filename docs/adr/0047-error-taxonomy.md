# 0047 - Error Taxonomy And Messaging

## Status

Accepted

## Context

The app needs actionable errors with what, why, and now what.

## Decision

Represent issues as `info`, `warning`, or `error`, and as recoverable or fatal. Each issue includes a title, what happened, why it matters, and the next step.

## Consequences

UI and exports can surface the same domain-aware error details.

## Alternatives Considered

Throwing raw exceptions from deep helpers was rejected.
