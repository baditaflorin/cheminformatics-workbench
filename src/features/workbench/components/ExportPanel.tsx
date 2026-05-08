import { Download, FileJson } from "lucide-react";
import type {
  DescriptorVector,
  DockingResult,
  MoleculeInput,
  Prediction,
} from "../types/domain";
import { downloadText, exportCsv } from "../lib/export";

type Props = {
  molecule: MoleculeInput | null;
  descriptors: DescriptorVector | null;
  prediction: Prediction | null;
  docking: DockingResult | null;
};

export function ExportPanel({
  molecule,
  descriptors,
  prediction,
  docking,
}: Props) {
  const disabled = !molecule || !descriptors || !prediction;

  return (
    <section className="panel">
      <div className="section-heading">
        <FileJson className="size-4" aria-hidden="true" />
        <h2>SAR export</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          className="secondary-button"
          type="button"
          disabled={disabled}
          onClick={() => {
            if (molecule && descriptors && prediction) {
              downloadText(
                "sar-export.csv",
                exportCsv(molecule, descriptors, prediction, docking),
                "text/csv",
              );
            }
          }}
        >
          <Download className="size-4" aria-hidden="true" />
          CSV
        </button>
        <button
          className="secondary-button"
          type="button"
          disabled={disabled}
          onClick={() => {
            if (molecule && descriptors && prediction) {
              downloadText(
                "sar-export.json",
                JSON.stringify(
                  { molecule, descriptors, prediction, docking },
                  null,
                  2,
                ),
                "application/json",
              );
            }
          }}
        >
          <Download className="size-4" aria-hidden="true" />
          JSON
        </button>
      </div>
    </section>
  );
}
