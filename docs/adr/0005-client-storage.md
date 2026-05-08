# 0005 - Client Storage

## Status

Accepted

## Context

The app should remember recent work locally without accounts or sync.

## Decision

Use IndexedDB through `idb-keyval` for the last analyzed molecule. Avoid server persistence in v1.

## Consequences

User data stays local to the browser. Clearing site data clears saved molecules.

## Alternatives Considered

`localStorage` was rejected for larger SDF payloads. Server storage was rejected because auth and sync are non-goals.
