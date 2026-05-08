# 0010 - GitHub Pages Publishing

## Status

Accepted

## Context

The live URL must work from the first public push, and the built frontend must be committed.

## Decision

Serve GitHub Pages from `main` branch `/docs`. Vite builds with base `/cheminformatics-workbench/`, hashed assets, `.nojekyll`, and a copied `404.html` SPA fallback.

## Consequences

`docs/` is not gitignored. Source documentation and built assets coexist, so Vite uses `emptyOutDir: false`.

## Alternatives Considered

A `gh-pages` branch was rejected because committing `docs/` keeps publishing visible and local-only.
