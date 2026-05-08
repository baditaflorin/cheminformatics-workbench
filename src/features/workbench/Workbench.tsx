import { useEffect, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Database, Loader2 } from "lucide-react";
import { Header } from "./components/Header";
import { MoleculeInput } from "./components/MoleculeInput";
import { DescriptorTable } from "./components/DescriptorTable";
import { PredictionPanel } from "./components/PredictionPanel";
import { DockingPanel } from "./components/DockingPanel";
import { MoleculeViewer } from "./components/MoleculeViewer";
import { ExportPanel } from "./components/ExportPanel";
import { calculateDescriptors } from "./lib/chemistry";
import { fetchBundle, fetchMeta } from "./lib/data";
import { predictBioactivity, scoreDocking } from "./lib/prediction";
import { loadLastMolecule, saveLastMolecule } from "./lib/storage";
import type {
  DockingResult,
  MoleculeInput as MoleculeInputType,
} from "./types/domain";

export function Workbench() {
  const [smiles, setSmiles] = useState("CC(=O)Oc1ccccc1C(=O)O");
  const [molecule, setMolecule] = useState<MoleculeInputType | null>(null);
  const [selectedSample, setSelectedSample] = useState("");
  const [selectedReceptor, setSelectedReceptor] = useState("");
  const [docking, setDocking] = useState<DockingResult | null>(null);

  const [{ data: bundle, isLoading, error }, { data: meta }] = useQueries({
    queries: [
      {
        queryKey: ["artifact-bundle"],
        queryFn: fetchBundle,
        staleTime: Number.POSITIVE_INFINITY,
      },
      {
        queryKey: ["artifact-meta"],
        queryFn: fetchMeta,
        staleTime: Number.POSITIVE_INFINITY,
      },
    ],
  });

  useEffect(() => {
    void loadLastMolecule().then((saved) => {
      if (saved) {
        setMolecule(saved);
        setSmiles(saved.smiles);
      }
    });
  }, []);

  const descriptors = useMemo(() => {
    if (!molecule?.smiles) {
      return null;
    }
    return calculateDescriptors(molecule.smiles);
  }, [molecule]);

  const prediction = useMemo(() => {
    if (!bundle || !descriptors) {
      return null;
    }
    return predictBioactivity(descriptors, bundle.model, bundle.chemblSubset);
  }, [bundle, descriptors]);

  const updatedAge = useMemo(() => {
    if (!meta?.generatedAt) {
      return "unknown";
    }
    return meta.generatedAt.slice(0, 10);
  }, [meta]);
  const effectiveReceptor = selectedReceptor || bundle?.receptors[0]?.id || "";

  function setAndPersist(next: MoleculeInputType) {
    setMolecule(next);
    setDocking(null);
    void saveLastMolecule(next);
  }

  function runDocking() {
    if (!bundle || !descriptors) {
      return;
    }
    const receptor =
      bundle.receptors.find((item) => item.id === effectiveReceptor) ??
      bundle.receptors[0];
    if (receptor) {
      setDocking(scoreDocking(descriptors, receptor));
    }
  }

  const dataStatus = useQuery({
    queryKey: ["duckdb-status", bundle?.schemaVersion],
    queryFn: async () => {
      await import("@duckdb/duckdb-wasm");
      return "DuckDB-WASM adapter available";
    },
    enabled: Boolean(bundle),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        {isLoading ? (
          <div className="status-strip">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading static molecular artifacts
          </div>
        ) : null}
        {error ? (
          <div className="status-strip border-red-200 bg-red-50 text-red-900">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Static data failed to load.
          </div>
        ) : null}
        {bundle ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5">
              <Database className="size-4" aria-hidden="true" />
              {bundle.chemblSubset.length} ChEMBL records -{" "}
              {bundle.schemaVersion} - updated {updatedAge}
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5">
              {dataStatus.data ?? "DuckDB-WASM lazy"}
            </span>
          </div>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <MoleculeInput
              samples={bundle?.samples ?? []}
              smiles={smiles}
              selectedSample={selectedSample}
              onSmilesChange={setSmiles}
              onMolecule={setAndPersist}
              onSampleChange={setSelectedSample}
            />
            <ExportPanel
              molecule={molecule}
              descriptors={descriptors}
              prediction={prediction}
              docking={docking}
            />
          </div>
          <div className="space-y-4">
            <MoleculeViewer molecule={molecule} />
            <DescriptorTable
              descriptors={descriptors}
              specs={bundle?.descriptors ?? []}
            />
          </div>
          <div className="space-y-4">
            <PredictionPanel prediction={prediction} />
            <DockingPanel
              receptors={bundle?.receptors ?? []}
              selectedReceptor={effectiveReceptor}
              result={docking}
              disabled={!descriptors || !bundle}
              onSelect={setSelectedReceptor}
              onRun={runDocking}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
