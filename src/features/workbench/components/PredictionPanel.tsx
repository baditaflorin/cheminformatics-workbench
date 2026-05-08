import { Activity, Gauge } from "lucide-react";
import type { Prediction } from "../types/domain";

type Props = {
  prediction: Prediction | null;
};

export function PredictionPanel({ prediction }: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <Activity className="size-4" aria-hidden="true" />
        <h2>Bioactivity</h2>
      </div>
      {!prediction ? (
        <p className="empty-state">Prediction pending.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                {prediction.target}
              </span>
              <span className="font-semibold text-slate-950">
                {Math.round(prediction.probability * 100)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{
                  width: `${Math.round(prediction.probability * 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
            <Gauge className="size-4" aria-hidden="true" />
            {prediction.label}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              Nearest local ChEMBL records
            </h3>
            <ul className="space-y-2">
              {prediction.nearest.map((record) => (
                <li
                  key={record.compoundId}
                  className="rounded-md border border-slate-200 p-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-950">
                      {record.name}
                    </span>
                    <span className="text-slate-600">
                      pChEMBL {record.pchembl}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-slate-500">
                    {record.smiles}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
