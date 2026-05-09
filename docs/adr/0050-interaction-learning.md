# 0050 - Interaction Learning Policy

## Status

Accepted

## Context

Some repeated choices, such as receptor selection and salt parent handling, should remain stable within a browser session.

## Decision

Remember lightweight, transparent local defaults in existing client storage. Do not infer private profiles or sync preferences.

## Consequences

The app can feel less repetitive without adding accounts or telemetry.

## Alternatives Considered

Server-side or cross-device learning was rejected because Phase 2 must keep Mode B.
