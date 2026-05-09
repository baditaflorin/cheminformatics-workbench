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
import { analyzeMoleculeInput } from "./lib/inputIntelligence";
import { predictBioactivity, scoreDocking } from "./lib/prediction";
import { loadLastMolecule, saveLastMolecule } from "./lib/storage";
import type {
  DockingResult,
  InputAnalysis,
  MoleculeInput as MoleculeInputType,
} from "./types/domain";

export function Workbench() {
  const [smiles, setSmiles] = useState("CC(=O)Oc1ccccc1C(=O)O");
  const [molecule, setMolecule] = useState<MoleculeInputType | null>(null);
  const [selectedSample, setSelectedSample] = useState("");
  const [selectedReceptor, setSelectedReceptor] = useState("");
  const [docking, setDocking] = useState<DockingResult | null>(null);
  const [analysis, setAnalysis] = useState<InputAnalysis | null>(null);

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
    if (!molecule?.smiles || !analysis?.canPredict) {
      return null;
    }
    return calculateDescriptors(molecule.smiles);
  }, [analysis?.canPredict, molecule]);

  const prediction = useMemo(() => {
    if (!bundle || !descriptors || !analysis?.canPredict) {
      return null;
    }
    return predictBioactivity(descriptors, bundle.model, bundle.chemblSubset);
  }, [analysis?.canPredict, bundle, descriptors]);

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

  function analyzeRawInput(rawInput: string, sourceName?: string) {
    const nextAnalysis = analyzeMoleculeInput(rawInput, {
      sourceName,
      appVersion: __APP_VERSION__,
    });
    setAnalysis(nextAnalysis);
    setDocking(null);
    const active = nextAnalysis.candidates[0] ?? null;
    setMolecule(active);
    if (active) {
      setSmiles(active.originalSmiles ?? active.smiles);
      void saveLastMolecule(active);
    }
  }

  function setSample(next: MoleculeInputType) {
    const nextAnalysis = analyzeMoleculeInput(next.smiles, {
      sourceName: `sample:${next.id}`,
      appVersion: __APP_VERSION__,
    });
    const active = nextAnalysis.candidates[0]
      ? {
          ...nextAnalysis.candidates[0],
          id: next.id,
          name: next.name,
          molBlock: next.molBlock,
          target: next.target,
          source: "sample" as const,
        }
      : null;
    setAnalysis({
      ...nextAnalysis,
      candidates: active ? [active] : [],
      activeCandidateId: active?.id,
    });
    setAndPersist(active ?? next);
  }

  function runDocking() {
    if (!bundle || !descriptors || !analysis?.canPredict) {
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
              onMolecule={setSample}
              onInput={analyzeRawInput}
              onSampleChange={setSelectedSample}
            />
            <ExportPanel
              molecule={molecule}
              descriptors={descriptors}
              prediction={prediction}
              docking={docking}
              analysis={analysis}
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
            <AnalysisIssues analysis={analysis} />
            <PredictionPanel prediction={prediction} />
            <DockingPanel
              receptors={bundle?.receptors ?? []}
              selectedReceptor={effectiveReceptor}
              result={docking}
              disabled={!descriptors || !bundle || !analysis?.canPredict}
              onSelect={setSelectedReceptor}
              onRun={runDocking}
            />
            <DebugState analysis={analysis} />
          </div>
        </div>
      </main>
    </div>
  );
}

function AnalysisIssues({ analysis }: { analysis: InputAnalysis | null }) {
  if (!analysis?.issues.length) {
    return null;
  }
  return (
    <section className="panel">
      <div className="section-heading">
        <AlertTriangle className="size-4" aria-hidden="true" />
        <h2>Input review</h2>
      </div>
      <ul className="space-y-2">
        {analysis.issues.map((issue) => (
          <li
            key={issue.code}
            className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
          >
            <p className="font-semibold text-slate-950">{issue.title}</p>
            <p className="mt-1 text-slate-700">{issue.what}</p>
            <p className="mt-1 text-slate-600">{issue.why}</p>
            <p className="mt-1 font-medium text-slate-800">{issue.nextStep}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DebugState({ analysis }: { analysis: InputAnalysis | null }) {
  if (
    !analysis ||
    new URLSearchParams(window.location.search).get("debug") !== "1"
  ) {
    return null;
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <Database className="size-4" aria-hidden="true" />
        <h2>Debug</h2>
      </div>
      <pre className="max-h-80 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
        {JSON.stringify(
          {
            state: analysis.state,
            sourceFormat: analysis.sourceFormat,
            confidence: analysis.confidence,
            candidates: analysis.candidates.map((candidate) => ({
              id: candidate.id,
              name: candidate.name,
              smiles: candidate.smiles,
              confidence: candidate.confidence,
              reasons: candidate.reasons,
            })),
            issues: analysis.issues.map((issue) => issue.code),
            performance: analysis.performance,
          },
          null,
          2,
        )}
      </pre>
    </section>
  );
}
