# Phase 2 State Taxonomy

## Input States

- `idle`: no analyzed molecule yet; user can type, paste, upload, or choose sample.
- `loaded-empty`: input is empty or whitespace; user can enter molecule data.
- `classifying`: input is being normalized and classified.
- `loaded-valid`: one validated molecule candidate is active.
- `loaded-many`: multiple molecule candidates were found; first candidate is active and the candidate list is preserved.
- `loaded-warning`: active molecule is usable but has recoverable warnings such as salt/counterion handling.
- `error-recoverable`: input could not produce a molecule, but user work is intact and next steps are shown.
- `error-fatal`: reserved for unrecoverable static-data/runtime failures; user can export debug state or retry after reload.

## Operation States

- `prediction-ready`: descriptors exist and the molecule is validated.
- `prediction-blocked`: unsupported/invalid input blocked prediction to avoid silent wrongness.
- `docking-ready`: descriptors and receptor exist.
- `docking-blocked`: receptor or validated descriptors are missing.
- `export-ready`: canonical state exists.
- `export-blocked`: no valid analysis state exists.

## Concurrency Rule

Latest input wins. Re-analyzing replaces prior recoverable errors and clears stale docking results.
