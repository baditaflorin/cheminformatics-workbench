import { FileUp, FlaskConical, Play, RotateCcw } from "lucide-react";
import type {
  SampleMolecule,
  MoleculeInput as MoleculeInputType,
} from "../types/domain";

type Props = {
  samples: SampleMolecule[];
  smiles: string;
  selectedSample: string;
  onSmilesChange: (value: string) => void;
  onMolecule: (molecule: MoleculeInputType) => void;
  onInput: (rawInput: string, sourceName?: string) => void;
  onSampleChange: (id: string) => void;
};

export function MoleculeInput({
  samples,
  smiles,
  selectedSample,
  onSmilesChange,
  onMolecule,
  onInput,
  onSampleChange,
}: Props) {
  function runTyped() {
    onInput(smiles, "typed input");
  }

  async function handleFile(file: File) {
    const text = await file.text();
    onInput(text, file.name);
  }

  function loadSample(id: string) {
    const sample = samples.find((item) => item.id === id);
    onSampleChange(id);
    if (!sample) {
      return;
    }
    onSmilesChange(sample.smiles);
    onMolecule({
      id: sample.id,
      name: sample.name,
      smiles: sample.smiles,
      source: "sample",
      molBlock: sample.molBlock,
      target: sample.target,
    });
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <FlaskConical className="size-4" aria-hidden="true" />
        <h2>Molecule</h2>
      </div>
      <label className="field-label" htmlFor="smiles-input">
        SMILES
      </label>
      <textarea
        id="smiles-input"
        className="field min-h-28 resize-y font-mono text-sm"
        value={smiles}
        onChange={(event) => onSmilesChange(event.target.value)}
        placeholder="CC(=O)Oc1ccccc1C(=O)O"
      />
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          className="field"
          value={selectedSample}
          onChange={(event) => loadSample(event.target.value)}
          aria-label="Sample molecule"
        >
          <option value="">Samples</option>
          {samples.map((sample) => (
            <option key={sample.id} value={sample.id}>
              {sample.name} - {sample.target}
            </option>
          ))}
        </select>
        <button className="primary-button" type="button" onClick={runTyped}>
          <Play className="size-4" aria-hidden="true" />
          Analyze
        </button>
      </div>
      <label
        className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm font-medium text-slate-700 hover:border-emerald-500 hover:bg-emerald-50"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files.item(0);
          if (file) {
            void handleFile(file);
          }
        }}
      >
        <FileUp className="size-4" aria-hidden="true" />
        Drop SDF/MOL or choose file
        <input
          className="sr-only"
          type="file"
          accept=".sdf,.mol,chemical/x-mdl-sdfile"
          onChange={(event) => {
            const file = event.target.files?.item(0);
            if (file) {
              void handleFile(file);
            }
          }}
        />
      </label>
      <button
        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        type="button"
        onClick={() => {
          onSmilesChange("");
          onSampleChange("");
          onInput("", "typed input");
        }}
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Clear input
      </button>
    </section>
  );
}
