import type {
  DescriptorVector,
  DockingResult,
  MoleculeInput,
  Prediction,
} from "../types/domain";

export function exportCsv(
  molecule: MoleculeInput,
  descriptors: DescriptorVector,
  prediction: Prediction,
  docking: DockingResult | null,
) {
  const fields: Record<string, string | number> = {
    name: molecule.name,
    smiles: molecule.smiles,
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

export function downloadText(filename: string, body: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([body], { type: mimeType }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
