import { get, set } from "idb-keyval";
import type { MoleculeInput } from "../types/domain";

const LAST_MOLECULE_KEY = "cheminformatics-workbench:last-molecule";

export async function saveLastMolecule(molecule: MoleculeInput) {
  await set(LAST_MOLECULE_KEY, molecule);
}

export async function loadLastMolecule() {
  return get<MoleculeInput>(LAST_MOLECULE_KEY);
}
