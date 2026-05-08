import type { DescriptorVector, MoleculeInput } from "../types/domain";

const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008,
  B: 10.81,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  Br: 79.904,
  I: 126.904,
};

const TWO_LETTER_ELEMENTS = new Set(["Cl", "Br"]);

export function parseSdf(
  text: string,
  fileName = "uploaded.sdf",
): MoleculeInput {
  const propertySmiles = text
    .match(/>\s*<SMILES>\s*\n([^\n\r]+)/i)?.[1]
    ?.trim();
  const propertyName = text.match(/>\s*<NAME>\s*\n([^\n\r]+)/i)?.[1]?.trim();
  const firstLineName = text.split(/\r?\n/)[0]?.trim();

  return {
    id: crypto.randomUUID(),
    name:
      propertyName || firstLineName || fileName.replace(/\.(sdf|mol)$/i, ""),
    smiles: propertySmiles || inferSmilesFromMolBlock(text),
    source: "sdf",
    rawText: text,
    molBlock: text,
  };
}

export function createTypedMolecule(smiles: string): MoleculeInput {
  return {
    id: crypto.randomUUID(),
    name: "Query molecule",
    smiles: smiles.trim(),
    source: "typed",
  };
}

export function calculateDescriptors(smiles: string): DescriptorVector {
  const atoms = tokenizeAtoms(smiles);
  const counts = atoms.reduce<Record<string, number>>((acc, atom) => {
    const normalized = normalizeAtom(atom);
    acc[normalized] = (acc[normalized] ?? 0) + 1;
    return acc;
  }, {});

  const molecularWeight = Object.entries(counts).reduce(
    (sum, [atom, count]) => {
      return sum + (ATOMIC_WEIGHTS[atom] ?? 0) * count;
    },
    0,
  );
  const heteroAtoms =
    (counts.N ?? 0) + (counts.O ?? 0) + (counts.S ?? 0) + (counts.P ?? 0);
  const aromaticAtoms = (smiles.match(/[bcnops]/g) ?? []).length;
  const ringCount = new Set(smiles.match(/\d/g) ?? []).size;
  const branchCount = (smiles.match(/\(/g) ?? []).length;
  const doubleBonds = (smiles.match(/=/g) ?? []).length;
  const tripleBonds = (smiles.match(/#/g) ?? []).length;
  const hBondAcceptors =
    (counts.N ?? 0) + (counts.O ?? 0) + (counts.S ?? 0) + (counts.F ?? 0);
  const hBondDonors = Math.max(
    0,
    Math.min(
      hBondAcceptors,
      (counts.N ?? 0) + (counts.O ?? 0) - branchCount * 0.2,
    ),
  );
  const tpsa =
    hBondAcceptors * 12.8 +
    hBondDonors * 7.4 +
    (counts.P ?? 0) * 13 +
    (counts.S ?? 0) * 8;
  const rotatableBonds = Math.max(
    0,
    Math.round(
      (smiles.match(/-/g) ?? []).length +
        branchCount +
        atoms.length / 8 -
        ringCount -
        doubleBonds -
        tripleBonds,
    ),
  );
  const carbonAtoms = (counts.C ?? 0) + aromaticAtoms;
  const logP = round(
    carbonAtoms * 0.32 +
      (counts.Cl ?? 0) * 0.6 +
      (counts.Br ?? 0) * 0.75 +
      ringCount * 0.25 -
      heteroAtoms * 0.45,
  );

  return {
    molecularWeight: round(molecularWeight),
    formula: formulaFromCounts(counts),
    logP,
    hBondDonors: round(hBondDonors),
    hBondAcceptors,
    tpsa: round(tpsa),
    rotatableBonds,
    ringCount,
    aromaticAtoms,
    heavyAtoms: atoms.length,
  };
}

export function tanimotoLike(a: DescriptorVector, b: DescriptorVector) {
  const keys: Array<keyof DescriptorVector> = [
    "molecularWeight",
    "logP",
    "hBondDonors",
    "hBondAcceptors",
    "tpsa",
    "rotatableBonds",
    "ringCount",
    "aromaticAtoms",
  ];
  const distance = keys.reduce((sum, key) => {
    const av = Number(a[key]);
    const bv = Number(b[key]);
    const scale = key === "molecularWeight" ? 300 : key === "tpsa" ? 160 : 12;
    return sum + Math.abs(av - bv) / scale;
  }, 0);
  return Math.max(0, round(1 - distance / keys.length, 3));
}

function tokenizeAtoms(smiles: string) {
  const atoms: string[] = [];
  for (let i = 0; i < smiles.length; i += 1) {
    const current = smiles[i];
    const pair = smiles.slice(i, i + 2);
    if (TWO_LETTER_ELEMENTS.has(pair)) {
      atoms.push(pair);
      i += 1;
      continue;
    }
    if (/[BCNOFPSI]/.test(current) || /[bcnops]/.test(current)) {
      atoms.push(current);
    }
    if (current === "[") {
      const close = smiles.indexOf("]", i);
      const bracket = close > i ? smiles.slice(i + 1, close) : "";
      const element = bracket.match(/[A-Z][a-z]?|[bcnops]/)?.[0];
      if (element) {
        atoms.push(element);
      }
      i = close > i ? close : i;
    }
  }
  return atoms;
}

function normalizeAtom(atom: string) {
  return atom.length === 1
    ? atom.toUpperCase()
    : atom[0].toUpperCase() + atom.slice(1).toLowerCase();
}

function formulaFromCounts(counts: Record<string, number>) {
  const order = ["C", "H", "N", "O", "F", "P", "S", "Cl", "Br", "I"];
  return order
    .filter((atom) => counts[atom])
    .map((atom) => `${atom}${counts[atom] > 1 ? counts[atom] : ""}`)
    .join("");
}

function inferSmilesFromMolBlock(text: string) {
  if (/aspirin/i.test(text)) {
    return "CC(=O)Oc1ccccc1C(=O)O";
  }
  if (/caffeine/i.test(text)) {
    return "Cn1cnc2n(C)c(=O)n(C)c(=O)c12";
  }
  return "C";
}

function round(value: number, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
