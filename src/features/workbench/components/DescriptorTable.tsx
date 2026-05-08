import { Atom } from "lucide-react";
import type { DescriptorSpec, DescriptorVector } from "../types/domain";

type Props = {
  descriptors: DescriptorVector | null;
  specs: DescriptorSpec[];
};

const preferred = [
  "molecularWeight",
  "logP",
  "hBondDonors",
  "hBondAcceptors",
  "tpsa",
  "rotatableBonds",
  "ringCount",
  "aromaticAtoms",
] as const;

export function DescriptorTable({ descriptors, specs }: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <Atom className="size-4" aria-hidden="true" />
        <h2>Descriptors</h2>
      </div>
      {!descriptors ? (
        <p className="empty-state">No molecule analyzed.</p>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <Metric label="Formula" value={descriptors.formula || "n/a"} />
            <Metric label="Heavy atoms" value={descriptors.heavyAtoms} />
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Descriptor</th>
                  <th>Value</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {preferred.map((key) => {
                  const spec = specs.find((item) => item.key === key);
                  return (
                    <tr key={key}>
                      <td>{spec?.label ?? key}</td>
                      <td>{descriptors[key]}</td>
                      <td>{spec?.units || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}
