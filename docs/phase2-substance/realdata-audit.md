# Phase 2 Substance Real-Data Audit

Date: 2026-05-10

Mode remains Mode B: GitHub Pages plus pre-built data.

## Sources

- PubChem aspirin CID 2244 SDF: https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244/SDF
- PubChem caffeine CID 2519 SDF: https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2519/SDF
- PubChem aspirin+caffeine multi-record SDF: https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244,2519/SDF
- PubChem metformin hydrochloride property lookup: https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/metformin%20hydrochloride/property/CanonicalSMILES/JSON
- ChEMBL CHEMBL25 JSON: https://www.ebi.ac.uk/chembl/api/data/molecule/CHEMBL25.json
- ChEMBL 1000-molecule API payload: https://www.ebi.ac.uk/chembl/api/data/molecule.json?limit=1000&molecule_properties__full_mwt__lte=500

## Audit Method

I walked each input through the v1 happy path: typed input uses the SMILES box plus Analyze; SDF input uses the file/drop parser. I recorded the actual molecule identity, extracted SMILES, descriptors, prediction, docking score, elapsed time, and failure mode.

V1 pass rate using the Phase 2 bar: 1/10 partial pass, 0/10 full real-data pass.

## Fixture Candidates

| ID                             | Real Input                                                                                      | What v1 Did                                                                                                                                                                                                 | What It Should Have Done                                                                                                            | Failure Mode                                     | Manual Work v1 Forces                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| 01-clean-pubchem-smiles        | Clean PubChem aspirin SMILES: `CC(=O)OC1=CC=CC=C1C(=O)O`                                        | Completed the flow, but named it `Query molecule`, inferred formula `C9O4`, MW `172.1` instead of PubChem `C9H8O4` / `180.16`, predicted inactive-like `0.065`, docking `-5.06`.                            | Parse as aspirin-like SMILES, calculate chemically defensible descriptors including implicit hydrogens, and preserve provenance.    | Partial/wrong-but-confident scientific values.   | User must know descriptors are approximate and must manually label/provenance the molecule. |
| 02-word-email-smiles           | Aspirin SMILES copied from Word/email with UTF-8 BOM, smart quotes, NBSP, and trailing comment. | Treated the whole string as SMILES: formula `C10NO5P2S`, MW `318.93`, probability `0.041`.                                                                                                                  | Normalize BOM/NBSP/smart quotes, strip comment text, extract the valid SMILES, and show a normalization note.                       | Wrong-but-confident.                             | User must manually clean invisible characters, quotes, and prose.                           |
| 03-chembl-csv-row              | `CHEMBL25,ASPIRIN,CC(=O)Oc1ccccc1C(=O)O,PTGS2,IC50,5.34`                                        | Treated CSV fields as atoms: formula `C11NO4P2S2I3`, MW `727.71`, probability `0.502`.                                                                                                                      | Detect CSV shape, identify ChEMBL ID/name/SMILES/target/activity, extract the molecule, and carry activity metadata into export.    | Wrong-but-confident.                             | User has to copy only the SMILES out of a row and loses metadata.                           |
| 04-salt-mixture-metformin-hcl  | PubChem metformin hydrochloride connectivity SMILES: `CN(C)C(=N)N=C(N)N.Cl`                     | Treated salt and parent as one molecule: formula `C4N5Cl`, MW `153.53`, no component warning, inactive-like `0.025`.                                                                                        | Recognize multi-component salt, identify parent vs counterion, score the parent or explicitly expose component handling confidence. | Domain-brittle, low-confidence not surfaced.     | User must know salts/counterions affect scoring and edit the SMILES manually.               |
| 05-pubchem-inchi-aspirin       | PubChem aspirin InChI.                                                                          | Tokenized the InChI as if it were SMILES: formula `C3NOSI2`, MW `351.91`, active-like `0.644`, docking `-6.34`.                                                                                             | Detect InChI immediately, either convert or stop with a domain-specific unsupported-format message.                                 | Wrong-but-confident, worst category.             | User must know InChI is unsupported and translate it elsewhere.                             |
| 06-pubchem-aspirin-sdf         | Real PubChem SDF for aspirin CID 2244.                                                          | SDF parser ignored `PUBCHEM_SMILES`; fell back to `C`, named molecule `2244`, predicted a one-carbon molecule.                                                                                              | Read PubChem property names such as `PUBCHEM_SMILES`, formula, MW, InChIKey, and CID.                                               | Wrong-but-confident.                             | User must inspect SDF properties or paste SMILES separately.                                |
| 07-pubchem-multi-sdf           | Real PubChem multi-record SDF for aspirin and caffeine.                                         | Returned name `2244` but extracted caffeine SMILES because the heuristic scanned the whole file for `caffeine`; analyzed one inconsistent record.                                                           | Split SDF on `$$$$`, analyze both records, preserve per-record identity and provenance.                                             | Wrong-but-confident identity mix-up.             | User must split multi-record SDFs manually.                                                 |
| 08-chembl-json-single          | Real ChEMBL molecule JSON for CHEMBL25.                                                         | Treated 11 KB JSON as SMILES: formula `C66N86O52F3P26S51I6`, MW `6347.52`, active-like `1.0`, docking floor `-13.5`.                                                                                        | Detect ChEMBL JSON, extract `molecule_structures.canonical_smiles`, `pref_name`, ID, and properties.                                | Wrong-but-confident.                             | User must dig through JSON and copy canonical SMILES manually.                              |
| 09-empty-whitespace            | Empty/whitespace-only input with NBSP.                                                          | Analyze path is a no-op because `trim()` is empty; no user-facing reason.                                                                                                                                   | Show an actionable empty-input message and keep prior results coherent.                                                             | Silent failure.                                  | User has to infer why nothing happened.                                                     |
| 10-large-truncated-chembl-json | Large real ChEMBL API JSON payload for 1000 molecules, truncated during transfer, 3.6 MB.       | Scanned the full partial JSON as SMILES on the main path in `456.64 ms`; produced absurd formula `C80816N116306O48927F4017P24759S51039Cl884Br242I2919`, MW `6516589.63`, and no progress/cancel affordance. | Recognize large partial JSON, avoid main-thread blocking, identify truncation, and offer recovery instead of scoring garbage.       | Wrong-but-confident plus performance dishonesty. | User must diagnose truncation, extract rows, and avoid pasting large data.                  |

## Top 5 Logic Gaps

1. The input engine assumes everything in the SMILES box is SMILES. It does not classify InChI, CSV/TSV, JSON, SDF text, comments, names, or mixed payloads before descriptor/prediction logic runs.
2. The SDF parser only recognizes `<SMILES>` and `<NAME>`, so real PubChem SDFs with `PUBCHEM_SMILES` collapse to fallback `C`; multi-record SDFs can mix one record's name with another record's SMILES.
3. Descriptor logic tokenizes strings instead of validating molecules first. Non-chemical text becomes chemical-looking formulas, probabilities, and docking scores.
4. The app has no confidence model. Low-confidence inferred identity, unsupported formats, salt mixtures, and malformed inputs flow into outputs as if they were equally trustworthy.
5. The app only handles one molecule at a time even when real inputs commonly arrive as rows, multi-record SDFs, or API exports; users have to split and normalize data manually.

## Top 3 Intuition Failures

1. Pasting an InChI or ChEMBL JSON produces active/inactive and docking results instead of an unsupported-format or extraction message.
2. A real PubChem aspirin SDF is analyzed as methane-like `C`, which is surprising and chemically wrong.
3. Empty input silently does nothing, leaving the user unsure whether the button failed, the app is loading, or the input was rejected.

## Top 3 Feels-Stupid Moments

1. The user must manually copy a SMILES out of CSV/JSON/SDF even when the canonical SMILES is plainly present.
2. The user must manually clean smart quotes, comments, NBSP, and BOM characters from copied SMILES.
3. The user must know salts/counterions and multi-component molecules need special handling; the app does not even warn.

## What Smart Means For This Product

1. Pasting or uploading a molecule-bearing payload should first classify the payload shape: SMILES, InChI, SDF, multi-SDF, CSV/TSV, ChEMBL JSON, PubChem JSON/SDF, empty, malformed, or too large/partial.
2. The app should extract the best molecule candidates automatically, keep source metadata, and show confidence. The user corrects extraction; they do not start by cleaning text.
3. The app should refuse to score unsupported or invalid chemistry unless it has a validated molecule. No more formulas, predictions, or docking scores for JSON, InChI-as-text, or truncated payloads.
4. Common cheminformatics conventions should be baked in: SDF property aliases, multi-record splitting, salt/component detection, implicit-hydrogen-aware descriptors, canonical stable IDs, and reproducible exports.
5. Every output should carry provenance: source format, source identifier, extraction method, confidence, app version, schema version, and parameters.

## Phase 2 Substance Success Metrics

1. Real-data pass rate: at least 7/10 audit fixtures complete the primary workflow with no manual extraction or cleanup.
2. No silent wrongness: 10/10 fixtures either produce validated molecule results with confidence or an actionable domain error; zero unsupported payloads receive predictions/docking scores.
3. Determinism: each fixture produces byte-identical normalized output and export on two consecutive runs.
4. SDF handling: PubChem single SDF extracts aspirin correctly; PubChem multi-record SDF yields two stable molecule records with correct identities.
5. Format inference: CSV/TSV, ChEMBL JSON, PubChem SDF, empty input, and InChI are classified correctly with confidence.
6. Performance honesty: any fixture taking over 300 ms records progress/performance metadata; the 3.6 MB truncated ChEMBL JSON does not block the UI path without an in-progress/cancellable state.
7. Export provenance: CSV/JSON exports include source identifier, schema version, app version, extraction confidence, and per-field confidence for all successful fixtures.

## Out Of Scope For Phase 2 Substance

- No new deployment mode; remain Mode B.
- No runtime backend, auth, collaboration, account sync, or server-side compute.
- No new visual polish, dark mode, landing page, command palette, or marketing work.
- No broad new feature surface beyond deepening the existing input, descriptor, prediction, docking, visualization, storage, and export workflows.
- No claim of full AutoDock Vina or full Open Babel parity unless an actual maintained browser/offline adapter is implemented and tested.
- No expansion into large production ChEMBL model training beyond static artifacts needed to validate the existing prediction workflow.
