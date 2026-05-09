import { get, set } from "idb-keyval";
import type { MoleculeInput } from "../types/domain";

const LAST_MOLECULE_KEY = "cheminformatics-workbench:last-molecule";
const DEFAULT_RECEPTOR_KEY = "cheminformatics-workbench:default-receptor";

export async function saveLastMolecule(molecule: MoleculeInput) {
  await set(LAST_MOLECULE_KEY, molecule);
}

export async function loadLastMolecule() {
  return get<MoleculeInput>(LAST_MOLECULE_KEY);
}

export async function saveDefaultReceptor(receptorId: string) {
  await set(DEFAULT_RECEPTOR_KEY, receptorId);
}

export async function loadDefaultReceptor() {
  return get<string>(DEFAULT_RECEPTOR_KEY);
}
