# 0006 - WASM Modules

## Status

Accepted

## Context

Molecular conversion, local querying, and model execution benefit from browser-native compiled modules, but initial load must stay small.

## Decision

Lazy-load RDKit.js, DuckDB-WASM, and ONNX Runtime Web only when needed. 3Dmol.js is lazy-loaded by the structure viewer. Pyodide and Open Babel/Vina adapters remain documented extension points for larger v1.x work.

## Consequences

Initial load remains focused on the workbench shell. Some advanced functions depend on browser WASM support and GitHub Pages-compatible static asset loading.

## Alternatives Considered

Bundling every module up front was rejected because it would violate the initial payload budget.
