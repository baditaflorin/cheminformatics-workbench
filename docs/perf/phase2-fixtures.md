# Phase 2 Fixture Performance

Measured with `analyzeMoleculeInput` against `test/fixtures/realdata` on 2026-05-10.

## Summary

- Median: 0.30 ms
- p95: 12.41 ms
- Worst: 12.41 ms
- Largest fixture: `10-large-truncated-chembl-json.json`, 3,612,897 bytes

## Per Fixture

| Fixture                             |     Bytes | Elapsed ms | State             | Format       | Candidates | Predicts |
| ----------------------------------- | --------: | ---------: | ----------------- | ------------ | ---------: | -------- |
| 01-clean-pubchem-smiles.smi         |        25 |       0.67 | loaded-valid      | smiles       |          1 | yes      |
| 02-word-email-smiles.txt            |        60 |       0.30 | loaded-valid      | smiles       |          1 | yes      |
| 03-chembl-csv-row.csv               |        55 |       0.46 | loaded-valid      | delimited    |          1 | yes      |
| 04-salt-mixture-metformin-hcl.smi   |        21 |       0.18 | loaded-warning    | smiles       |          1 | yes      |
| 05-pubchem-inchi-aspirin.inchi      |        69 |       0.02 | error-recoverable | inchi        |          0 | no       |
| 06-pubchem-aspirin-sdf.sdf          |     3,630 |       0.42 | loaded-valid      | sdf          |          1 | yes      |
| 07-pubchem-multi-sdf.sdf            |     7,632 |       0.15 | loaded-many       | sdf          |          2 | yes      |
| 08-chembl-json-single.json          |    11,498 |       0.21 | loaded-valid      | chembl-json  |          1 | yes      |
| 09-empty-whitespace.txt             |         8 |       0.02 | error-recoverable | empty        |          0 | no       |
| 10-large-truncated-chembl-json.json | 3,612,897 |      12.41 | error-recoverable | partial-json |          0 | no       |

The 3.6 MB malformed JSON fixture now exits before descriptor/prediction/docking, rather than scanning the entire payload as a fake molecule.
