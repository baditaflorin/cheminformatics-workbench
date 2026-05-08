# 0016 - Local Git Hooks

## Status

Accepted

## Context

No GitHub Actions are allowed, so quality gates must run locally.

## Decision

Use `.githooks/` with `core.hooksPath`. Hooks call Make targets for pre-commit, commit-msg, pre-push, post-merge, and post-checkout.

## Consequences

Contributors must run `make install-hooks`. Hooks are idempotent and can be run manually.

## Alternatives Considered

Lefthook was considered, but plain hooks avoid another tool dependency.
