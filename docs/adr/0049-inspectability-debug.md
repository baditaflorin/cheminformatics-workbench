# 0049 - Inspectability And Debug Surface

## Status

Accepted

## Context

Support and power users need to see why an input was classified a certain way.

## Decision

When `?debug=1` is present, expose a compact internal analysis state with format, confidence, issues, reasons, and candidate IDs.

## Consequences

The debug surface helps diagnose real-data failures without adding telemetry.

## Alternatives Considered

Console-only debugging was rejected because production console output is intentionally minimal.
