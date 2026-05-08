# 0003 - Frontend Framework

## Status

Accepted

## Context

The UI needs typed state, data fetching, lazy WASM adapters, e2e tests, and GitHub Pages base-path control.

## Decision

Use React, TypeScript strict mode, Vite, Tailwind CSS, TanStack Query, Zod, Lucide icons, Vitest, and Playwright.

## Consequences

The stack is familiar and production-ready. Vite can build directly into `docs/` with the `/cheminformatics-workbench/` base path.

## Alternatives Considered

Plain JavaScript was rejected due to weaker contracts. Next.js was rejected because static Pages output and simple client workflows do not need it.
