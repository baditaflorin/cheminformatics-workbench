import type {
  ConfidenceLabel,
  DomainIssue,
  InputAnalysis,
  MoleculeCandidate,
  SourceFormat,
} from "../types/domain";

const LARGE_INPUT_BYTES = 1_000_000;
const SCHEMA_VERSION = "phase2-analysis-v1";
const SMILES_ALIASES = [
  "SMILES",
  "PUBCHEM_SMILES",
  "PUBCHEM_OPENEYE_CAN_SMILES",
  "PUBCHEM_CONNECTIVITY_SMILES",
  "PUBCHEM_ISOMERIC_SMILES",
  "CANONICAL_SMILES",
];
const NAME_ALIASES = [
  "NAME",
  "PUBCHEM_IUPAC_TRADITIONAL_NAME",
  "PUBCHEM_IUPAC_NAME",
  "PUBCHEM_IUPAC_OPENEYE_NAME",
  "PUBCHEM_IUPAC_SYSTEMATIC_NAME",
];

type AnalysisOptions = {
  sourceName?: string;
  sourceHint?: SourceFormat;
  appVersion?: string;
};

type ExtractionResult = {
  format: SourceFormat;
  candidates: MoleculeCandidate[];
  issues: DomainIssue[];
  method: string;
};

export function analyzeMoleculeInput(
  rawInput: string,
  options: AnalysisOptions = {},
): InputAnalysis {
  const started = performance.now();
  const normalized = normalizeInputText(rawInput);
  const inputBytes = new TextEncoder().encode(rawInput).length;
  const largeInput = inputBytes > LARGE_INPUT_BYTES;
  const base = {
    sourceName: options.sourceName ?? "typed input",
    appVersion: options.appVersion ?? __APP_VERSION__,
  };

  const extraction = classifyAndExtract(normalized.text, {
    ...base,
    rawInput,
    normalizedChanged: normalized.changed,
    sourceHint: options.sourceHint,
    largeInput,
  });
  const issues = [...normalized.issues, ...extraction.issues];
  const blockingIssue = issues.find(
    (issue) => issue.severity === "error" && !extraction.candidates.length,
  );
  const state = determineState(extraction.candidates, issues, blockingIssue);
  const confidence = extraction.candidates[0]?.confidence ?? 0;
  const elapsedMs = round(performance.now() - started);

  return {
    state,
    sourceFormat: extraction.format,
    normalizedText: normalized.text,
    candidates: extraction.candidates,
    activeCandidateId: extraction.candidates[0]?.id,
    issues,
    canPredict: extraction.candidates.length > 0 && !blockingIssue,
    confidence,
    provenance: {
      sourceId: stableId(
        `${extraction.format}:${base.sourceName}:${normalized.text.slice(0, 500)}`,
      ),
      sourceName: base.sourceName,
      extractionMethod: extraction.method,
      schemaVersion: SCHEMA_VERSION,
      appVersion: base.appVersion,
    },
    performance: {
      inputBytes,
      elapsedMs,
      largeInput,
    },
  };
}

export function issue(
  code: string,
  severity: DomainIssue["severity"],
  title: string,
  what: string,
  why: string,
  nextStep: string,
  recoverable = true,
): DomainIssue {
  return { code, severity, recoverable, title, what, why, nextStep };
}

function classifyAndExtract(
  text: string,
  options: AnalysisOptions & {
    rawInput: string;
    normalizedChanged: boolean;
    largeInput: boolean;
  },
): ExtractionResult {
  if (!text.trim()) {
    return {
      format: "empty",
      method: "empty-input",
      candidates: [],
      issues: [
        issue(
          "empty-input",
          "error",
          "No molecule input",
          "The input is empty after whitespace normalization.",
          "There is no SMILES, SDF record, ChEMBL JSON, or table row to analyze.",
          "Paste a SMILES, drop an SDF, or choose a sample molecule.",
        ),
      ],
    };
  }

  if (looksLikeJson(text)) {
    return extractJson(text, options);
  }

  if (looksLikeSdf(text)) {
    return extractSdf(text, options);
  }

  if (/^InChI=/i.test(text.trim())) {
    return {
      format: "inchi",
      method: "inchi-detection",
      candidates: [],
      issues: [
        issue(
          "inchi-unsupported",
          "error",
          "InChI detected",
          "The input is an InChI string, not a SMILES string.",
          "The v1 browser engine cannot convert InChI to a validated molecule yet.",
          "Convert the InChI to SMILES first, or paste an SDF that contains a SMILES property.",
        ),
      ],
    };
  }

  if (looksDelimited(text)) {
    return extractDelimited(text, options);
  }

  return extractSmiles(text, options);
}

function normalizeInputText(rawInput: string) {
  let text = rawInput
    .replace(/^\uFEFF/, "")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .normalize("NFKC");
  const beforeTrim = text;
  text = text.trim();
  const issues: DomainIssue[] = [];
  if (text !== beforeTrim || text !== rawInput.trim()) {
    issues.push(
      issue(
        "input-normalized",
        "info",
        "Input normalized",
        "Whitespace or copy/paste characters were normalized before analysis.",
        "Molecule strings copied from email, documents, or web pages often include invisible characters.",
        "Review the extracted molecule and confidence before exporting.",
      ),
    );
  }

  return { text, changed: issues.length > 0, issues };
}

function extractSmiles(
  rawText: string,
  options: AnalysisOptions & { sourceName?: string; rawInput: string },
): ExtractionResult {
  const cleaned = stripSmilesDecorations(rawText);
  const issues: DomainIssue[] = [];
  if (cleaned !== rawText.trim()) {
    issues.push(
      issue(
        "input-normalized",
        "info",
        "SMILES text cleaned",
        "Surrounding quotes, trailing comments, or copied prose were removed.",
        "The molecule-like token was clear enough to extract safely.",
        "Verify the extracted SMILES if the source text contained notes.",
      ),
    );
  }

  if (!looksLikeSmiles(cleaned)) {
    return {
      format: "unsupported",
      method: "unsupported-text",
      candidates: [],
      issues: [
        ...issues,
        issue(
          "no-smiles-found",
          "error",
          "No molecule string found",
          "The input did not look like SMILES, SDF, ChEMBL JSON, PubChem JSON, CSV, or InChI.",
          "Scoring arbitrary text would create fake chemistry.",
          "Paste a canonical SMILES or upload a molecule file with a SMILES property.",
        ),
      ],
    };
  }

  const { smiles, saltIssue, components } = chooseParentComponent(cleaned);
  if (saltIssue) {
    issues.push(saltIssue);
  }

  return {
    format: "smiles",
    method: "raw-smiles",
    issues,
    candidates: [
      makeCandidate({
        name: "Query molecule",
        smiles,
        sourceFormat: "smiles",
        sourceName: options.sourceName ?? "typed input",
        confidence: saltIssue ? 0.72 : cleaned === rawText.trim() ? 0.9 : 0.78,
        reasons: [
          "Input matched SMILES-like token rules.",
          ...(saltIssue
            ? ["Largest non-counterion component selected as parent molecule."]
            : []),
        ],
        warnings: saltIssue ? [saltIssue] : [],
        originalSmiles: cleaned,
        components,
      }),
    ],
  };
}

function extractSdf(
  text: string,
  options: AnalysisOptions & { sourceName?: string },
): ExtractionResult {
  const records = text
    .split(/\$\$\$\$/)
    .map((record) => record.trim())
    .filter(Boolean);
  const issues: DomainIssue[] = [];
  if (records.length > 1) {
    issues.push(
      issue(
        "multiple-molecules-detected",
        "warning",
        "Multiple SDF records detected",
        `${records.length} SDF records were found.`,
        "Multi-record SDF files represent a screening list, not a single molecule.",
        "The first molecule is active; export/debug metadata preserves all detected candidates.",
      ),
    );
  }

  const candidates = records
    .map((record, index) => {
      const props = parseSdfProperties(record);
      const smiles = firstProperty(props, SMILES_ALIASES);
      if (!smiles || !looksLikeSmiles(smiles)) {
        return null;
      }
      const cid = props.PUBCHEM_COMPOUND_CID;
      const name = cid
        ? `CID ${cid}`
        : (firstProperty(props, NAME_ALIASES) ?? `SDF record ${index + 1}`);
      return makeCandidate({
        name,
        smiles,
        sourceFormat: "sdf",
        sourceName: options.sourceName ?? "uploaded.sdf",
        confidence: 0.96,
        reasons: [
          `SMILES extracted from SDF property ${findPropertyKey(props, SMILES_ALIASES)}.`,
        ],
        metadata: {
          recordIndex: index + 1,
          ...(cid ? { pubchemCid: cid } : {}),
          ...(props.PUBCHEM_MOLECULAR_FORMULA
            ? { formula: props.PUBCHEM_MOLECULAR_FORMULA }
            : {}),
          ...(props.PUBCHEM_MOLECULAR_WEIGHT
            ? { molecularWeight: props.PUBCHEM_MOLECULAR_WEIGHT }
            : {}),
          ...(props.PUBCHEM_IUPAC_INCHIKEY
            ? { inchikey: props.PUBCHEM_IUPAC_INCHIKEY }
            : {}),
        },
        molBlock: record,
      });
    })
    .filter((candidate): candidate is MoleculeCandidate => Boolean(candidate));

  if (!candidates.length) {
    issues.push(
      issue(
        "sdf-smiles-missing",
        "error",
        "SDF has no recognized SMILES property",
        "The SDF parsed as a molecule file, but no SMILES alias was found.",
        "The browser descriptor path needs a SMILES property to avoid guessing from coordinates.",
        "Export the SDF with a SMILES property such as PUBCHEM_SMILES or CANONICAL_SMILES.",
      ),
    );
  }

  return {
    format: "sdf",
    method: "sdf-property-aliases",
    issues,
    candidates,
  };
}

function extractJson(
  text: string,
  options: AnalysisOptions & { sourceName?: string; largeInput: boolean },
): ExtractionResult {
  try {
    const parsed = JSON.parse(text) as unknown;
    const chemblSingle = extractChemblMolecule(parsed, options);
    if (chemblSingle) {
      return {
        format: "chembl-json",
        method: "chembl-single-json",
        issues: [],
        candidates: [chemblSingle],
      };
    }

    const molecules = extractChemblMoleculeList(parsed, options);
    if (molecules.length) {
      return {
        format: "chembl-json",
        method: "chembl-list-json",
        issues: [
          issue(
            "multiple-molecules-detected",
            "warning",
            "Multiple ChEMBL molecules detected",
            `${molecules.length} molecule records were extracted from JSON.`,
            "This payload is a screening list; the first molecule is active in the current workbench surface.",
            "Use export/debug metadata to inspect all extracted candidates.",
          ),
        ],
        candidates: molecules,
      };
    }

    return {
      format: "unsupported",
      method: "json-unsupported-shape",
      candidates: [],
      issues: [
        issue(
          "json-no-molecule",
          "error",
          "JSON did not contain a recognized molecule",
          "The JSON parsed successfully, but no ChEMBL or PubChem molecule fields were found.",
          "Scoring generic JSON would produce fake descriptors.",
          "Paste a JSON object with molecule_structures.canonical_smiles or a PubChem property table.",
        ),
      ],
    };
  } catch {
    return {
      format:
        text.length > LARGE_INPUT_BYTES / 2 ? "partial-json" : "unsupported",
      method: "json-parse-error",
      candidates: [],
      issues: [
        issue(
          "partial-json",
          "error",
          "JSON looks truncated or malformed",
          "The input starts like JSON but cannot be parsed.",
          options.largeInput
            ? "Large copy/paste transfers often stop before the final closing braces."
            : "A missing comma, quote, or closing brace can make molecule fields unreliable.",
          "Re-download the JSON or paste a smaller complete ChEMBL/PubChem record.",
        ),
      ],
    };
  }
}

function extractDelimited(
  text: string,
  options: AnalysisOptions & { sourceName?: string },
): ExtractionResult {
  const delimiter = sniffDelimiter(text);
  const rows = text
    .split("\n")
    .map((line) => parseDelimitedLine(line, delimiter))
    .filter((row) => row.some((cell) => cell.trim()));
  const candidates = rows
    .slice(0, 500)
    .map((row, index) => {
      const smilesIndex = row.findIndex((cell) => looksLikeSmiles(cell.trim()));
      if (smilesIndex < 0) {
        return null;
      }
      const smiles = row[smilesIndex].trim();
      const chemblId = row
        .find((cell) => /^CHEMBL\d+$/i.test(cell.trim()))
        ?.trim();
      const name = row.find((cell, cellIndex) => {
        const value = cell.trim();
        return (
          cellIndex !== smilesIndex &&
          !/^CHEMBL\d+$/i.test(value) &&
          /^[A-Za-z][A-Za-z0-9 _-]{2,40}$/.test(value) &&
          !looksLikeSmiles(value)
        );
      });
      return makeCandidate({
        name: name?.trim() || chemblId || `Delimited row ${index + 1}`,
        smiles,
        sourceFormat: "delimited",
        sourceName: options.sourceName ?? "pasted table",
        confidence: 0.82,
        reasons: [
          `Detected ${delimiter === "\t" ? "tab" : "comma"}-delimited row.`,
          `Column ${smilesIndex + 1} matched SMILES-like token rules.`,
        ],
        metadata: {
          rowIndex: index + 1,
          ...(chemblId ? { chemblId } : {}),
        },
      });
    })
    .filter((candidate): candidate is MoleculeCandidate => Boolean(candidate));

  if (!candidates.length) {
    return {
      format: "delimited",
      method: "delimited-no-smiles",
      candidates: [],
      issues: [
        issue(
          "table-smiles-missing",
          "error",
          "Table row has no recognizable SMILES column",
          "Delimited data was detected, but no field looked like a molecule string.",
          "The app cannot infer descriptors without a molecule column.",
          "Include a SMILES column or paste the molecule string directly.",
        ),
      ],
    };
  }

  return {
    format: "delimited",
    method: "delimited-smiles-column",
    candidates,
    issues:
      candidates.length > 1
        ? [
            issue(
              "multiple-molecules-detected",
              "warning",
              "Multiple table molecules detected",
              `${candidates.length} table rows contain SMILES-like fields.`,
              "The workbench activates the first candidate while preserving the extracted list.",
              "Check debug/export metadata for the full candidate list.",
            ),
          ]
        : [],
  };
}

function extractChemblMolecule(
  value: unknown,
  options: AnalysisOptions & { sourceName?: string },
) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  const structures = record.molecule_structures as Record<
    string,
    unknown
  > | null;
  const smiles =
    typeof structures?.canonical_smiles === "string"
      ? structures.canonical_smiles
      : "";
  if (!looksLikeSmiles(smiles)) {
    return null;
  }
  const name =
    typeof record.pref_name === "string" && record.pref_name
      ? record.pref_name
      : "ChEMBL molecule";
  const chemblId =
    typeof record.molecule_chembl_id === "string"
      ? record.molecule_chembl_id
      : undefined;
  return makeCandidate({
    name,
    smiles,
    sourceFormat: "chembl-json",
    sourceName: options.sourceName ?? "ChEMBL JSON",
    confidence: 0.96,
    reasons: [
      "Extracted molecule_structures.canonical_smiles from a ChEMBL molecule record.",
    ],
    metadata: {
      ...(chemblId ? { chemblId } : {}),
    },
  });
}

function extractChemblMoleculeList(
  value: unknown,
  options: AnalysisOptions & { sourceName?: string },
) {
  if (!value || typeof value !== "object") {
    return [];
  }
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.molecules)) {
    return [];
  }
  return record.molecules
    .slice(0, 500)
    .map((item) => extractChemblMolecule(item, options))
    .filter((candidate): candidate is MoleculeCandidate => Boolean(candidate));
}

function makeCandidate(input: {
  name: string;
  smiles: string;
  sourceFormat: SourceFormat;
  sourceName: string;
  confidence: number;
  reasons: string[];
  warnings?: DomainIssue[];
  metadata?: Record<string, string | number | boolean>;
  molBlock?: string;
  originalSmiles?: string;
  components?: string[];
}): MoleculeCandidate {
  const sourceId = stableId(
    `${input.sourceFormat}:${input.sourceName}:${input.smiles}:${input.name}`,
  );
  return {
    id: `mol-${sourceId}`,
    sourceId,
    name: input.name,
    smiles: input.smiles,
    source:
      input.sourceFormat === "sdf"
        ? "sdf"
        : input.sourceFormat === "smiles"
          ? "typed"
          : "typed",
    sourceFormat: input.sourceFormat,
    confidence: round(input.confidence),
    confidenceLabel: confidenceLabel(input.confidence),
    reasons: input.reasons,
    warnings: input.warnings ?? [],
    metadata: input.metadata ?? {},
    rawText: input.originalSmiles ?? input.smiles,
    molBlock: input.molBlock,
    originalSmiles: input.originalSmiles,
    components: input.components,
  };
}

function determineState(
  candidates: MoleculeCandidate[],
  issues: DomainIssue[],
  blockingIssue: DomainIssue | undefined,
) {
  if (blockingIssue) {
    return blockingIssue.recoverable ? "error-recoverable" : "error-fatal";
  }
  if (!candidates.length) {
    return "loaded-empty";
  }
  if (candidates.length > 1) {
    return "loaded-many";
  }
  if (issues.some((item) => item.severity === "warning")) {
    return "loaded-warning";
  }
  return "loaded-valid";
}

function parseSdfProperties(record: string) {
  const lines = record.split("\n");
  const props: Record<string, string> = {};
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^>\s*<([^>]+)>/);
    if (!match) {
      continue;
    }
    const key = match[1].trim();
    const values: string[] = [];
    i += 1;
    while (i < lines.length && !/^>\s*</.test(lines[i])) {
      const value = lines[i].trim();
      if (value) {
        values.push(value);
      }
      i += 1;
    }
    i -= 1;
    props[key] = values.join("\n");
  }
  return props;
}

function firstProperty(props: Record<string, string>, aliases: string[]) {
  const key = findPropertyKey(props, aliases);
  return key ? props[key] : undefined;
}

function findPropertyKey(props: Record<string, string>, aliases: string[]) {
  const upperToKey = new Map(
    Object.keys(props).map((key) => [key.toUpperCase(), key]),
  );
  return aliases
    .map((alias) => upperToKey.get(alias.toUpperCase()))
    .find(Boolean);
}

function stripSmilesDecorations(value: string) {
  let text = value.trim();
  text = text.replace(/\s+#.*$/s, "").trim();
  text = text.replace(/\s+\/\/.*$/s, "").trim();
  text = text.replace(/^["'`]+|["'`]+$/g, "").trim();
  return text;
}

function chooseParentComponent(smiles: string) {
  const components = smiles
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);
  if (components.length <= 1) {
    return { smiles, components };
  }
  const parent =
    components
      .filter((component) => !isCounterion(component))
      .sort((a, b) => atomTokenCount(b) - atomTokenCount(a))[0] ??
    components[0];
  return {
    smiles: parent,
    components,
    saltIssue: issue(
      "salt-counterion-detected",
      "warning",
      "Salt or counterion detected",
      `The input has ${components.length} dot-separated components.`,
      "Descriptor and docking screens are usually run on the parent organic molecule, not the counterion.",
      "The largest non-counterion component was selected; verify before exporting.",
    ),
  };
}

function isCounterion(component: string) {
  return /^(Cl|Br|I|F|Na|K|Li|HCl|\[?Cl-?\]?|\[?Na\+?\]?)$/i.test(component);
}

function looksLikeSdf(text: string) {
  return /M\s+END/.test(text) || /\$\$\$\$/.test(text);
}

function looksLikeJson(text: string) {
  const trimmed = text.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function looksDelimited(text: string) {
  const firstLines = text.split("\n").slice(0, 5).join("\n");
  return (
    /,|\t/.test(firstLines) &&
    firstLines.split(/\n/).some((line) => line.split(/,|\t/).length >= 3)
  );
}

export function looksLikeSmiles(value: string) {
  const text = stripSmilesDecorations(value);
  if (!text || /^InChI=/i.test(text) || /\s/.test(text) || text.length > 1000) {
    return false;
  }
  if (!/^[A-Za-z0-9@+\-[\]()=#$\\/%.]+$/.test(text)) {
    return false;
  }
  if (!/[BCNOFPSIbcno]/.test(text)) {
    return false;
  }
  return (
    atomTokenCount(text) > 0 &&
    !/[AEGJKLMQRTUVWXYZ]/.test(text.replace(/Cl|Br/g, ""))
  );
}

function atomTokenCount(smiles: string) {
  return (smiles.match(/Cl|Br|[BCNOFPSIbcno]|\[[^\]]+\]/g) ?? []).length;
}

function sniffDelimiter(text: string) {
  const first = text.split("\n")[0] ?? "";
  return (first.match(/\t/g) ?? []).length > (first.match(/,/g) ?? []).length
    ? "\t"
    : ",";
}

function parseDelimitedLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === delimiter && !quoted) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

function confidenceLabel(value: number): ConfidenceLabel {
  if (value >= 0.85) {
    return "high";
  }
  if (value >= 0.65) {
    return "medium";
  }
  return "low";
}

export function stableId(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
