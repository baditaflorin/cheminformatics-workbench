/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __APP_COMMIT__: string;
declare const __REPO_URL__: string;
declare const __PAYPAL_URL__: string;

type ThreeDmolViewer = {
  addModel: (model: string, format: string) => void;
  setStyle: (
    selection: Record<string, unknown>,
    style: Record<string, unknown>,
  ) => void;
  zoomTo: () => void;
  render: () => void;
};

type ThreeDmolModule = {
  createViewer: (
    element: HTMLElement,
    options?: Record<string, unknown>,
  ) => ThreeDmolViewer;
};

declare module "3dmol" {
  const value: ThreeDmolModule;
  export = value;
}

declare module "@rdkit/rdkit" {
  type RDKitMolecule = {
    get_molblock: () => string;
    delete: () => void;
  };

  type RDKitModule = {
    get_mol: (smiles: string) => RDKitMolecule | null;
  };

  const initRDKitModule: () => Promise<RDKitModule>;
  export default initRDKitModule;
}
