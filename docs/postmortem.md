# Postmortem

## Built

- Mode B GitHub Pages app with a Go static data generator.
- React/Vite workbench for SMILES/SDF input, descriptors, local bioactivity scoring, docking-style scoring, 3Dmol/RDKit lazy visualization, and SAR export.
- Static v1 artifacts for a curated ChEMBL subset, descriptor metadata, receptor examples, sample molblocks, and model coefficients.
- Local hooks, ADRs, smoke tests, and Pages-ready `docs/` output.

## Mode Review

Mode B was the right choice for v1. The ChEMBL subset and model metadata benefit from reproducible generation, but the public app does not need auth, writes, secrets, or a runtime API.

Could it have stayed Mode A? Only if the ChEMBL/model/receptor artifacts were hand-authored. That would be less reproducible and harder to expand.

## What Worked

- GitHub Pages base-path build is covered by Playwright.
- Browser-first data flow keeps user molecules local.
- Lazy module boundaries keep heavy chemistry libraries out of the initial shell.

## What Did Not

- Full Open Babel and AutoDock Vina WASM packages were not available through maintained npm packages during implementation.
- ONNX Runtime Web is installed and the adapter slot is present, but the v1 scoring path uses a transparent JSON logistic model.
- 3Dmol.js ships a large lazy chunk and emits a build-time eval warning from upstream code.

## Surprises

- `go test ./...` discovered a Go package inside `node_modules`, so Make now filters project packages.
- Local preview ports can collide with other Codex projects, so smoke tests use a dedicated strict port.

## Accepted Tech Debt

- Docking is a documented screening-style score, not full AutoDock Vina.
- Descriptor calculations are fast estimates with RDKit.js used for molblock conversion when available.
- The ChEMBL subset is intentionally tiny for v0.1.0.

## Next Improvements

1. Add a true ONNX model artifact generated from a larger DeepChem training pipeline.
2. Add a maintained Vina/Open Babel WASM adapter or an offline docking artifact pipeline.
3. Move large data artifacts to GitHub Releases with DuckDB/Parquet querying in the browser.

## Time

Estimated: 1-2 focused days for a production-polished academic prototype.

Actual in this pass: one accelerated implementation session, with scope reduced where upstream browser packages were not available.
