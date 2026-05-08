# 0011 - Logging

## Status

Accepted

## Context

Mode B has no server logs. Browser console noise should be minimal.

## Decision

The frontend avoids production console logging. The Go generator uses `log/slog` for local generation messages.

## Consequences

Operational debugging is local and simple. User-facing errors are rendered in the UI instead of relying on console output.

## Alternatives Considered

Remote logging was rejected because it would introduce telemetry and a runtime service.
