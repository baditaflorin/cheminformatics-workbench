import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { analyzeMoleculeInput } from "./inputIntelligence";

type Expected = {
  expectedKind: "candidates" | "error";
  sourceFormat: string;
  minCandidates?: number;
  firstSmiles?: string;
  firstName?: string;
  minConfidence?: number;
  requiredIssueCode?: string;
  allowPrediction: boolean;
  maxElapsedMs?: number;
};

const fixtureDir = "test/fixtures/realdata";
const expectedFiles = readdirSync(fixtureDir)
  .filter((file) => file.endsWith(".expected.json"))
  .sort();

describe("Phase 2 real-data input intelligence", () => {
  it.each(expectedFiles)("%s", (expectedFile) => {
    const base = expectedFile.replace(".expected.json", "");
    const inputFile = readdirSync(fixtureDir).find(
      (file) => file.startsWith(`${base}.`) && !file.endsWith(".expected.json"),
    );
    if (!inputFile) {
      throw new Error(`Missing input fixture for ${base}`);
    }

    const input = readFileSync(join(fixtureDir, inputFile), "utf8");
    const expected = JSON.parse(
      readFileSync(join(fixtureDir, expectedFile), "utf8"),
    ) as Expected;
    const first = analyzeMoleculeInput(input, {
      sourceName: inputFile,
      appVersion: "0.2.0-test",
    });
    const second = analyzeMoleculeInput(input, {
      sourceName: inputFile,
      appVersion: "0.2.0-test",
    });

    expect(first.sourceFormat).toBe(expected.sourceFormat);
    expect(first.canPredict).toBe(expected.allowPrediction);
    expect(canonical(first)).toEqual(canonical(second));
    if (expected.requiredIssueCode) {
      expect(
        first.issues.some((issue) => issue.code === expected.requiredIssueCode),
      ).toBe(true);
    }
    if (expected.expectedKind === "error") {
      expect(first.candidates).toHaveLength(0);
      expect(first.issues.some((issue) => issue.severity === "error")).toBe(
        true,
      );
      return;
    }

    expect(first.candidates.length).toBeGreaterThanOrEqual(
      expected.minCandidates ?? 1,
    );
    expect(first.candidates[0].smiles).toBe(expected.firstSmiles);
    if (expected.firstName) {
      expect(first.candidates[0].name).toBe(expected.firstName);
    }
    if (expected.minConfidence) {
      expect(first.candidates[0].confidence).toBeGreaterThanOrEqual(
        expected.minConfidence,
      );
    }
    if (expected.maxElapsedMs) {
      expect(first.performance.elapsedMs).toBeLessThanOrEqual(
        expected.maxElapsedMs,
      );
    }
  });
});

function canonical(value: ReturnType<typeof analyzeMoleculeInput>) {
  return {
    state: value.state,
    sourceFormat: value.sourceFormat,
    candidates: value.candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      smiles: candidate.smiles,
      confidence: candidate.confidence,
      issues: candidate.warnings.map((issue) => issue.code),
    })),
    issues: value.issues.map((issue) => issue.code),
    canPredict: value.canPredict,
    provenance: value.provenance,
  };
}
