import { describe, expect, it } from "vitest";
import { calculateDescriptors, parseSdf } from "./chemistry";

describe("calculateDescriptors", () => {
  it("estimates descriptor values from SMILES", () => {
    const descriptors = calculateDescriptors("CC(=O)Oc1ccccc1C(=O)O");

    expect(descriptors.molecularWeight).toBeGreaterThan(170);
    expect(descriptors.hBondAcceptors).toBeGreaterThanOrEqual(4);
    expect(descriptors.ringCount).toBe(1);
  });
});

describe("parseSdf", () => {
  it("extracts SMILES property blocks", () => {
    const molecule = parseSdf(
      "Example\n\n\n> <SMILES>\nCCO\n\n$$$$",
      "example.sdf",
    );

    expect(molecule.name).toBe("Example");
    expect(molecule.smiles).toBe("CCO");
    expect(molecule.source).toBe("sdf");
  });
});
