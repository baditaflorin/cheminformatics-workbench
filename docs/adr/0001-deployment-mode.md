# 0001 - Deployment Mode

## Status

Accepted

## Context

The default target is GitHub Pages. The workbench needs molecular compute, visualization, and a local ChEMBL subset, but no cross-user writes, auth, or secrets in v1.

## Decision

Use Mode B: GitHub Pages plus pre-built data. The frontend is static. A Go data-generation pipeline writes versioned JSON artifacts to `public/data/v1` for development and `docs/data/v1` for Pages.

## Consequences

The public surface has no runtime server to operate. Heavy or sensitive work must be done offline before artifacts are published. Browser compute is bounded by local device limits.

## Alternatives Considered

- Mode A: rejected because ChEMBL/model/receptor artifacts need reproducible offline generation.
- Mode C: rejected because v1 does not require auth, mutations, secrets, or server-side long-running jobs.
