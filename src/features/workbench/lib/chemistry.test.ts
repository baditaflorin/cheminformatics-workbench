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

  it("parses V2000 atom blocks when no SMILES property is present", () => {
    // Minimal V2000 molfile for ethanol (C2H6O) — three heavy atoms, two
    // single bonds. The previous implementation returned "C" (methane) for
    // any molfile that didn't contain the word "aspirin" or "caffeine".
    const ethanol = [
      "ethanol",
      "  Mrv2014",
      "",
      "  3  2  0  0  0  0            999 V2000",
      "    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0",
      "    1.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0",
      "    2.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0",
      "  1  2  1  0  0  0  0",
      "  2  3  1  0  0  0  0",
      "M  END",
      "",
    ].join("\n");

    const molecule = parseSdf(ethanol, "ethanol.mol");
    // The pseudo-SMILES we emit isn't canonical, but its descriptors must
    // reflect the real atom count: two carbons and one oxygen, not methane.
    const descriptors = calculateDescriptors(molecule.smiles);
    expect(descriptors.heavyAtoms).toBe(3);
    expect(descriptors.molecularWeight).toBeGreaterThan(40);
    expect(descriptors.molecularWeight).toBeLessThan(50);
    expect(descriptors.hBondAcceptors).toBeGreaterThanOrEqual(1);
  });
});
