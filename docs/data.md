# Static Data Contract

Schema version: `v1`

Artifact path on Pages:

```text
https://baditaflorin.github.io/cheminformatics-workbench/data/v1/
```

Files:

- `bundle.json`: complete static artifact bundle.
- `chembl.json`: curated local ChEMBL subset.
- `descriptors.json`: descriptor metadata.
- `model.json`: static logistic bioactivity model metadata and coefficients.
- `receptors.json`: example docking receptor grid metadata.
- `samples.json`: sample molecules with molblocks.
- `bundle.meta.json`: generation timestamp, source commit, checksums, schema version.

Regenerate:

```bash
make data
make build
```

Breaking schema changes must use a new path such as `/data/v2/`.
