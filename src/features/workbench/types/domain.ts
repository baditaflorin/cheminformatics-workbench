export type DescriptorVector = {
  molecularWeight: number;
  formula: string;
  logP: number;
  hBondDonors: number;
  hBondAcceptors: number;
  tpsa: number;
  rotatableBonds: number;
  ringCount: number;
  aromaticAtoms: number;
  heavyAtoms: number;
};

export type MoleculeInput = {
  id: string;
  name: string;
  smiles: string;
  source: "typed" | "sdf" | "sample";
  rawText?: string;
  molBlock?: string;
  target?: string;
};

export type DescriptorSpec = {
  key: keyof DescriptorVector;
  label: string;
  units: string;
  description: string;
  minimum: number;
  maximum: number;
};

export type ChemblRecord = {
  compoundId: string;
  name: string;
  smiles: string;
  target: string;
  activity: number;
  units: string;
  pchembl: number;
  assayType: string;
  tags: string[];
  properties: Record<string, number>;
};

export type BioactivityModel = {
  id: string;
  version: string;
  target: string;
  runtime: string;
  threshold: number;
  intercept: number;
  coefficients: Record<string, number>;
  featureMeans: Record<string, number>;
  featureScales: Record<string, number>;
  metrics: Record<string, number>;
};

export type DockingReceptor = {
  id: string;
  name: string;
  target: string;
  description: string;
  gridCenter: [number, number, number];
  gridSize: [number, number, number];
  weights: Record<string, number>;
};

export type SampleMolecule = {
  id: string;
  name: string;
  smiles: string;
  target: string;
  molBlock: string;
};

export type ArtifactBundle = {
  schemaVersion: string;
  generatedAt: string;
  chemblSubset: ChemblRecord[];
  descriptors: DescriptorSpec[];
  model: BioactivityModel;
  receptors: DockingReceptor[];
  samples: SampleMolecule[];
};

export type ArtifactMeta = {
  generatedAt: string;
  sourceCommit: string;
  inputChecksums: Record<string, string>;
  schemaVersion: string;
  artifactVersion: string;
};

export type Prediction = {
  target: string;
  probability: number;
  label: "active-like" | "inactive-like";
  score: number;
  nearest: ChemblRecord[];
};

export type DockingResult = {
  receptorId: string;
  receptorName: string;
  scoreKcalMol: number;
  ligandEfficiency: number;
  confidence: "screening" | "review";
  terms: Record<string, number>;
};
