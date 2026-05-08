# 0009 - Configuration And Secrets

## Status

Accepted

## Context

The frontend must not contain secrets. The generator currently needs no private credentials.

## Decision

Use `.env.example` for placeholders. Keep `.env*` ignored except `.env.example`. Secret scanning is wired through `gitleaks` in the pre-commit hook when installed.

## Consequences

No runtime secret management is required. Any future private data source must run offline and publish only sanitized artifacts.

## Alternatives Considered

Embedding encrypted frontend secrets was rejected because frontend secrets are still public.
