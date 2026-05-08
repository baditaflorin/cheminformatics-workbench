# 0002 - Architecture Overview

## Status

Accepted

## Context

The app needs clear boundaries between UI, static data, molecular calculations, prediction, docking-style scoring, and visualization.

## Decision

Use a static React app with feature code under `src/features/workbench`. Go code under `cmd/` and `internal/` owns artifact generation. Pages serves the built frontend and generated data from `docs/`.

## Consequences

The browser owns user workflows. The generator can evolve without adding a runtime API. Feature modules stay small and testable.

## Alternatives Considered

A monolithic frontend file was rejected because chemistry, prediction, export, and visualization need separate tests and adapter seams.
