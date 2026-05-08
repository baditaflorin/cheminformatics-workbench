import type {
  BioactivityModel,
  ChemblRecord,
  DescriptorVector,
  DockingReceptor,
  DockingResult,
  Prediction,
} from "../types/domain";
import { calculateDescriptors, tanimotoLike } from "./chemistry";

export function predictBioactivity(
  descriptors: DescriptorVector,
  model: BioactivityModel,
  library: ChemblRecord[],
): Prediction {
  const score = Object.entries(model.coefficients).reduce(
    (sum, [key, coefficient]) => {
      const value = Number(descriptors[key as keyof DescriptorVector] ?? 0);
      const mean = model.featureMeans[key] ?? 0;
      const scale = model.featureScales[key] || 1;
      return sum + ((value - mean) / scale) * coefficient;
    },
    model.intercept,
  );
  const probability = sigmoid(score);
  const nearest = library
    .map((record) => ({
      record,
      similarity: tanimotoLike(
        descriptors,
        calculateDescriptors(record.smiles),
      ),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(({ record }) => record);

  return {
    target: model.target,
    probability,
    label: probability >= model.threshold ? "active-like" : "inactive-like",
    score,
    nearest,
  };
}

export function scoreDocking(
  descriptors: DescriptorVector,
  receptor: DockingReceptor,
): DockingResult {
  const terms = Object.entries(receptor.weights).reduce<Record<string, number>>(
    (acc, [key, weight]) => {
      const value = Number(descriptors[key as keyof DescriptorVector] ?? 0);
      acc[key] = round(value * weight);
      return acc;
    },
    {},
  );
  const rawScore = Object.values(terms).reduce((sum, term) => sum + term, -4.2);
  const scoreKcalMol = round(Math.max(-13.5, Math.min(-1.5, rawScore)));

  return {
    receptorId: receptor.id,
    receptorName: receptor.name,
    scoreKcalMol,
    ligandEfficiency: round(scoreKcalMol / Math.max(1, descriptors.heavyAtoms)),
    confidence: "screening",
    terms,
  };
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
