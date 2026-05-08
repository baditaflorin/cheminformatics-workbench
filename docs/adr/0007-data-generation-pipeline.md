# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

Mode B needs reproducible artifact generation without deploying a server.

## Decision

Use `cmd/build-artifacts` as the Go generator. `make data` writes development artifacts. `make build` writes Pages artifacts and keeps metadata alongside outputs.

## Consequences

Artifacts are deterministic and can be regenerated locally. Future larger runs can use the existing `--start`, `--end`, `--concurrency`, and `--save_every` flags.

## Alternatives Considered

Python-only generation was deferred because the project requested Go layout for Mode B pipeline commands.
