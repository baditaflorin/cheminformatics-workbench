# 0004 - Static Data Contract

## Status

Accepted

## Context

The frontend needs descriptors, a ChEMBL subset, receptor metadata, sample molecules, and model coefficients without a database server.

## Decision

Publish JSON artifacts under `/data/v1/` with sibling `bundle.meta.json` metadata. The frontend validates artifacts with Zod before use.

## Consequences

Artifacts are easy to inspect, diff, and cache. Large future artifacts may move to GitHub Releases while retaining the same schema versioning policy.

## Alternatives Considered

SQLite or Parquet-only artifacts were deferred because the v1 curated subset is small enough for JSON.
