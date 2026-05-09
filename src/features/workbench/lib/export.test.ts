import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { calculateDescriptors } from "./chemistry";
import { exportCsv, exportJson } from "./export";
import { analyzeMoleculeInput } from "./inputIntelligence";
import { predictBioactivity, scoreDocking } from "./prediction";
import type { ArtifactBundle } from "../types/domain";

const data = JSON.parse(
  readFileSync("public/data/v1/bundle.json", "utf8"),
) as ArtifactBundle;

describe("Phase 2 export provenance", () => {
  it("exports deterministic provenance when timestamp is fixed", () => {
    const analysis = analyzeMoleculeInput("CC(=O)OC1=CC=CC=C1C(=O)O", {
      sourceName: "fixture.smi",
      appVersion: "0.2.0-test",
    });
    const molecule = analysis.candidates[0];
    const descriptors = calculateDescriptors(molecule.smiles);
    const prediction = predictBioactivity(
      descriptors,
      data.model,
      data.chemblSubset,
    );
    const docking = scoreDocking(descriptors, data.receptors[0]);

    const first = exportJson(
      molecule,
      descriptors,
      prediction,
      docking,
      analysis,
      "2026-05-10T00:00:00.000Z",
    );
    const second = exportJson(
      molecule,
      descriptors,
      prediction,
      docking,
      analysis,
      "2026-05-10T00:00:00.000Z",
    );
    expect(first).toBe(second);
    expect(first).toContain('"schemaVersion": "sar-export-v2"');
    expect(first).toContain('"sourceFormat": "smiles"');

    const csv = exportCsv(molecule, descriptors, prediction, docking, analysis);
    expect(csv).toContain("sourceFormat");
    expect(csv).toContain("extractionConfidence");
  });
});
