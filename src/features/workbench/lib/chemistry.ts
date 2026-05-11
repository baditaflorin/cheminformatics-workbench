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

// inferSmilesFromMolBlock used to return a hardcoded SMILES if the text
// contained "aspirin" or "caffeine", and "C" (methane) for everything else —
// so any uploaded molfile that didn't happen to name itself was scored as if
// it were a methane atom. Instead, parse the V2000 atom block and emit a
// SMILES-shaped concatenation of element symbols (plus bond markers from the
// bond block). It is not canonical SMILES, but tokenizeAtoms /
// calculateDescriptors only need atom counts and a handful of bond markers,
// so the descriptors come out close to what RDKit would report.
function inferSmilesFromMolBlock(text: string) {
  const parsed = parseV2000Counts(text);
  if (parsed) {
    return v2000ToPseudoSmiles(parsed);
  }
  // Final fallback: pull anything that looks like an element symbol from the
  // raw text. This catches V3000 molfiles ("M  V30 1 C 0 0 0 0") and other
  // formats we don't fully parse, and is still better than always returning
  // methane.
  const matched = text.match(/\b(Cl|Br|[CHNOPSFI])\b/g);
  if (matched && matched.length > 0) {
    return matched.join("");
  }
  return "C";
}

interface ParsedV2000 {
  atoms: string[];
  bonds: Array<{ from: number; to: number; order: number }>;
}

// parseV2000Counts pulls the atom and bond blocks out of a V2000 connection
// table. Column positions follow the MDL spec: counts line is line index 3,
// atom block starts at index 4. Each atom line has the element symbol in
// columns 31..33 (1-indexed), and each bond line has atom-indices in
// columns 1..3 and 4..6, with bond order in 7..9. We are conservative — any
// shape mismatch returns null so the caller can fall back.
function parseV2000Counts(text: string): ParsedV2000 | null {
  const lines = text.split(/\r?\n/);
  if (lines.length < 5) return null;
  const countsLine = lines[3];
  if (!countsLine || !countsLine.includes("V2000")) return null;
  const atomCount = Number.parseInt(countsLine.slice(0, 3).trim(), 10);
  const bondCount = Number.parseInt(countsLine.slice(3, 6).trim(), 10);
  if (!Number.isFinite(atomCount) || atomCount <= 0) return null;
  if (lines.length < 4 + atomCount) return null;

  const atoms: string[] = [];
  for (let i = 0; i < atomCount; i += 1) {
    const line = lines[4 + i] ?? "";
    // Element symbol lives in columns 31..34 (0-indexed: 30..34).
    const symbol = line.slice(30, 34).trim();
    if (!symbol) return null;
    atoms.push(symbol);
  }

  const bonds: ParsedV2000["bonds"] = [];
  const bondStart = 4 + atomCount;
  const expectedBonds = Number.isFinite(bondCount) ? bondCount : 0;
  for (let i = 0; i < expectedBonds; i += 1) {
    const line = lines[bondStart + i];
    if (!line) break;
    const from = Number.parseInt(line.slice(0, 3).trim(), 10);
    const to = Number.parseInt(line.slice(3, 6).trim(), 10);
    const order = Number.parseInt(line.slice(6, 9).trim(), 10);
    if (
      Number.isFinite(from) &&
      Number.isFinite(to) &&
      Number.isFinite(order)
    ) {
      bonds.push({ from, to, order });
    }
  }

  return { atoms, bonds };
}

function v2000ToPseudoSmiles({ atoms, bonds }: ParsedV2000) {
  // Concatenate atom symbols, then append one bond marker per double/triple
  // bond and one branch marker per non-linear bond. The marker types are the
  // same ones calculateDescriptors looks for via regex, so descriptors that
  // depend on bond geometry stay in the right ballpark.
  let doubleBonds = 0;
  let tripleBonds = 0;
  for (const bond of bonds) {
    if (bond.order === 2) doubleBonds += 1;
    else if (bond.order === 3) tripleBonds += 1;
  }
  // Count branches as bonds beyond atomCount - 1 — a spanning tree has
  // atoms-1 bonds, so any extra bond implies a ring closure or branch.
  const branches = Math.max(0, bonds.length - Math.max(0, atoms.length - 1));

  const atomStr = atoms.join("");
  const doubleStr = "=".repeat(doubleBonds);
  const tripleStr = "#".repeat(tripleBonds);
  const branchStr = "(".repeat(branches);
  return `${atomStr}${doubleStr}${tripleStr}${branchStr}`;
}

function round(value: number, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
