import { describe, expect, it } from "vitest";
import { calculateDescriptors } from "./chemistry";
import { predictBioactivity, scoreDocking } from "./prediction";
import type {
  BioactivityModel,
  ChemblRecord,
  DockingReceptor,
} from "../types/domain";

const model: BioactivityModel = {
  id: "test",
  version: "0.1.0",
  target: "EGFR",
  runtime: "json-logistic",
  threshold: 0.5,
  intercept: 0,
  coefficients: { molecularWeight: 1, logP: 0.2 },
  featureMeans: { molecularWeight: 150, logP: 1 },
  featureScales: { molecularWeight: 100, logP: 2 },
  metrics: {},
};

const library: ChemblRecord[] = [
  {
    compoundId: "CHEMBL1",
    name: "Ethanol",
    smiles: "CCO",
    target: "EGFR",
    activity: 1,
    units: "IC50",
    pchembl: 5,
    assayType: "B",
    tags: [],
    properties: {},
  },
];

describe("predictBioactivity", () => {
  it("returns probability and nearest records", () => {
    const result = predictBioactivity(
      calculateDescriptors("CCO"),
      model,
      library,
    );

    expect(result.probability).toBeGreaterThan(0);
    expect(result.nearest).toHaveLength(1);
  });
});

describe("scoreDocking", () => {
  it("scores a receptor with stable ligand efficiency", () => {
    const receptor: DockingReceptor = {
      id: "r1",
      name: "Pocket",
      target: "EGFR",
      description: "test",
      gridCenter: [0, 0, 0],
      gridSize: [10, 10, 10],
      weights: { molecularWeight: -0.01 },
    };
    const result = scoreDocking(calculateDescriptors("CCO"), receptor);

    expect(result.scoreKcalMol).toBeLessThan(0);
    expect(result.ligandEfficiency).toBeLessThan(0);
  });
});
