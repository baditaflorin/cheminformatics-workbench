import { Crosshair, Target } from "lucide-react";
import type { DockingReceptor, DockingResult } from "../types/domain";

type Props = {
  receptors: DockingReceptor[];
  selectedReceptor: string;
  result: DockingResult | null;
  disabled: boolean;
  onSelect: (id: string) => void;
  onRun: () => void;
};

export function DockingPanel({
  receptors,
  selectedReceptor,
  result,
  disabled,
  onSelect,
  onRun,
}: Props) {
  const receptor =
    receptors.find((item) => item.id === selectedReceptor) ?? receptors[0];

  return (
    <section className="panel">
      <div className="section-heading">
        <Crosshair className="size-4" aria-hidden="true" />
        <h2>Docking</h2>
      </div>
      <select
        className="field"
        value={selectedReceptor}
        onChange={(event) => onSelect(event.target.value)}
        aria-label="Docking receptor"
      >
        {receptors.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      {receptor ? (
        <p className="mt-2 text-sm text-slate-600">
          {receptor.target} - grid {receptor.gridSize.join(" x ")}
        </p>
      ) : null}
      <button
        className="primary-button mt-4 w-full"
        type="button"
        disabled={disabled}
        onClick={onRun}
      >
        <Target className="size-4" aria-hidden="true" />
        Score pocket
      </button>
      {result ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase text-slate-500">
            Estimated affinity
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-950">
            {result.scoreKcalMol} kcal/mol
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Ligand efficiency {result.ligandEfficiency}
          </p>
        </div>
      ) : (
        <p className="empty-state mt-4">No docking score yet.</p>
      )}
    </section>
  );
}
