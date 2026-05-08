# 0008 - Go Backend Project Layout

## Status

Accepted

## Context

Mode B has no runtime backend, but it does have build-time generator binaries.

## Decision

Use `cmd/build-artifacts`, `internal/artifacts`, and `internal/utils` following the spirit of golang-standards/project-layout. No `cmd/server` is created.

## Consequences

The Go code remains generator-only. Runtime deployment and Docker sections are skipped.

## Alternatives Considered

A root-level script was rejected because the generator should be testable and extensible.
