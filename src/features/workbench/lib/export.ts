import type {
  DescriptorVector,
  DockingResult,
  InputAnalysis,
  MoleculeInput,
  Prediction,
} from "../types/domain";

export function exportCsv(
  molecule: MoleculeInput,
  descriptors: DescriptorVector,
  prediction: Prediction,
  docking: DockingResult | null,
  analysis: InputAnalysis | null = null,
) {
  const candidate =
    analysis?.candidates.find((item) => item.id === molecule.id) ??
    analysis?.candidates[0];
  const fields: Record<string, string | number> = {
    name: molecule.name,
    smiles: molecule.smiles,
    sourceFormat: analysis?.sourceFormat ?? molecule.source,
    extractionConfidence: candidate?.confidence ?? "",
    issueCodes: analysis?.issues.map((item) => item.code).join("|") ?? "",
    formula: descriptors.formula,
    molecularWeight: descriptors.molecularWeight,
    logP: descriptors.logP,
    hBondDonors: descriptors.hBondDonors,
    hBondAcceptors: descriptors.hBondAcceptors,
    tpsa: descriptors.tpsa,
    rotatableBonds: descriptors.rotatableBonds,
    ringCount: descriptors.ringCount,
    aromaticAtoms: descriptors.aromaticAtoms,
    target: prediction.target,
    activeProbability: prediction.probability.toFixed(4),
    prediction: prediction.label,
    dockingScore: docking?.scoreKcalMol ?? "",
    receptor: docking?.receptorName ?? "",
  };
  return `${Object.keys(fields).join(",")}\n${Object.values(fields)
    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
    .join(",")}\n`;
}

export function exportJson(
  molecule: MoleculeInput,
  descriptors: DescriptorVector,
  prediction: Prediction,
  docking: DockingResult | null,
  analysis: InputAnalysis | null,
  generatedAt = new Date().toISOString(),
) {
  return `${JSON.stringify(
    {
      schemaVersion: "sar-export-v2",
      appVersion: __APP_VERSION__,
      generatedAt,
      molecule,
      descriptors,
      prediction,
      docking,
      provenance: analysis?.provenance,
      input: analysis
        ? {
            state: analysis.state,
            sourceFormat: analysis.sourceFormat,
            confidence: analysis.confidence,
            issues: analysis.issues,
            candidates: analysis.candidates.map((candidate) => ({
              id: candidate.id,
              name: candidate.name,
              smiles: candidate.smiles,
              sourceFormat: candidate.sourceFormat,
              confidence: candidate.confidence,
              confidenceLabel: candidate.confidenceLabel,
              reasons: candidate.reasons,
              warnings: candidate.warnings,
              metadata: candidate.metadata,
              originalSmiles: candidate.originalSmiles,
              components: candidate.components,
            })),
            performance: analysis.performance,
          }
        : null,
    },
    null,
    2,
  )}\n`;
}

export function downloadText(filename: string, body: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([body], { type: mimeType }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
