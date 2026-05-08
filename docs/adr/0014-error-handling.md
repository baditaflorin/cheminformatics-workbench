# 0014 - Error Handling

## Status

Accepted

## Context

Static data fetches, SDF parsing, and lazy module loading can fail in ordinary browsers.

## Decision

Frontend functions throw typed errors or render clear status states. The Go generator returns errors and uses `HandleErrorOrLogWithMessages` instead of panicking.

## Consequences

Failures are visible without crashing the whole app. Generator failures exit non-zero for scripts and hooks.

## Alternatives Considered

Swallowing lazy module errors was rejected because users need to know when visualization is unavailable.
