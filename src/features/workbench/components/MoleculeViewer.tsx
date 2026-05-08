import { Box, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MoleculeInput } from "../types/domain";

type Props = {
  molecule: MoleculeInput | null;
};

export function MoleculeViewer({ molecule }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!containerRef.current || !molecule) {
        return;
      }
      setStatus("Loading renderer");
      containerRef.current.innerHTML = "";

      try {
        const lib = await import("3dmol");
        const moduleWithDefault = lib as ThreeDmolModule & {
          default?: ThreeDmolModule;
        };
        const threeDmol = moduleWithDefault.default ?? moduleWithDefault;
        const molBlock =
          molecule.molBlock || (await smilesToMolBlock(molecule.smiles));
        if (cancelled || !containerRef.current) {
          return;
        }
        const viewer = threeDmol.createViewer(containerRef.current, {
          backgroundColor: "#f8fafc",
        });
        viewer.addModel(molBlock, "sdf");
        viewer.setStyle(
          {},
          { stick: { radius: 0.16 }, sphere: { scale: 0.24 } },
        );
        viewer.zoomTo();
        viewer.render();
        setStatus("Rendered");
      } catch {
        if (!cancelled) {
          setStatus("2D/3D structure unavailable for this input");
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [molecule]);

  return (
    <section className="panel min-h-[420px]">
      <div className="section-heading">
        <Box className="size-4" aria-hidden="true" />
        <h2>Structure</h2>
      </div>
      <div
        ref={containerRef}
        className="mt-3 h-[340px] rounded-md border border-slate-200 bg-slate-50"
        aria-label="Molecular structure viewer"
      />
      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
        {status === "Loading renderer" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {status}
      </div>
    </section>
  );
}

async function smilesToMolBlock(smiles: string) {
  const initRDKitModule = (await import("@rdkit/rdkit")).default;
  const RDKit = await initRDKitModule();
  const molecule = RDKit.get_mol(smiles);
  try {
    if (!molecule) {
      throw new Error("RDKit could not parse SMILES");
    }
    return molecule.get_molblock();
  } finally {
    molecule?.delete?.();
  }
}
