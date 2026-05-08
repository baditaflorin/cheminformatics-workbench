# 0017 - Dependency Policy

## Status

Accepted

## Context

The project spans frontend chemistry, visualization, static data, and tests.

## Decision

Prefer production-ready libraries: React, Vite, Tailwind CSS, Zod, TanStack Query, RDKit.js, 3Dmol.js, DuckDB-WASM, ONNX Runtime Web, Vitest, Playwright, and Go stdlib. Add new dependencies only when they replace meaningful custom code.

## Consequences

The codebase stays smaller and benefits from maintained ecosystems. Heavy modules are lazy-loaded.

## Alternatives Considered

Hand-rolled visualization, query caching, and molecule rendering were rejected.
