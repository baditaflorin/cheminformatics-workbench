import { z } from "zod";
import type { ArtifactBundle, ArtifactMeta } from "../types/domain";

const recordSchema = z.object({
  compoundId: z.string(),
  name: z.string(),
  smiles: z.string(),
  target: z.string(),
  activity: z.number(),
  units: z.string(),
  pchembl: z.number(),
  assayType: z.string(),
  tags: z.array(z.string()),
  properties: z.record(z.string(), z.number()),
});

const descriptorSchema = z.object({
  key: z.string(),
  label: z.string(),
  units: z.string(),
  description: z.string(),
  minimum: z.number(),
  maximum: z.number(),
});

const bundleSchema = z.object({
  schemaVersion: z.string(),
  generatedAt: z.string(),
  chemblSubset: z.array(recordSchema),
  descriptors: z.array(descriptorSchema),
  model: z.object({
    id: z.string(),
    version: z.string(),
    target: z.string(),
    runtime: z.string(),
    threshold: z.number(),
    intercept: z.number(),
    coefficients: z.record(z.string(), z.number()),
    featureMeans: z.record(z.string(), z.number()),
    featureScales: z.record(z.string(), z.number()),
    metrics: z.record(z.string(), z.number()),
  }),
  receptors: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      target: z.string(),
      description: z.string(),
      gridCenter: z.tuple([z.number(), z.number(), z.number()]),
      gridSize: z.tuple([z.number(), z.number(), z.number()]),
      weights: z.record(z.string(), z.number()),
    }),
  ),
  samples: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      smiles: z.string(),
      target: z.string(),
      molBlock: z.string(),
    }),
  ),
});

const metaSchema = z.object({
  generatedAt: z.string(),
  sourceCommit: z.string(),
  inputChecksums: z.record(z.string(), z.string()),
  schemaVersion: z.string(),
  artifactVersion: z.string(),
});

export async function fetchBundle(): Promise<ArtifactBundle> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/v1/bundle.json`,
  );
  if (!response.ok) {
    throw new Error(`Failed to load static data bundle: ${response.status}`);
  }
  return bundleSchema.parse(await response.json()) as ArtifactBundle;
}

export async function fetchMeta(): Promise<ArtifactMeta> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/v1/bundle.meta.json`,
  );
  if (!response.ok) {
    throw new Error(`Failed to load artifact metadata: ${response.status}`);
  }
  return metaSchema.parse(await response.json()) as ArtifactMeta;
}

export async function fetchLiveCommit() {
  const response = await fetch(
    "https://api.github.com/repos/baditaflorin/cheminformatics-workbench/commits/main",
    {
      headers: { Accept: "application/vnd.github+json" },
    },
  );
  if (!response.ok) {
    return __APP_COMMIT__;
  }
  const payload = (await response.json()) as { sha?: string };
  return payload.sha?.slice(0, 7) ?? __APP_COMMIT__;
}
