import { Download, FileJson } from "lucide-react";
import type {
  DescriptorVector,
  DockingResult,
  InputAnalysis,
  MoleculeInput,
  Prediction,
} from "../types/domain";
import { downloadText, exportCsv, exportJson } from "../lib/export";

type Props = {
  molecule: MoleculeInput | null;
  descriptors: DescriptorVector | null;
  prediction: Prediction | null;
  docking: DockingResult | null;
  analysis: InputAnalysis | null;
};

export function ExportPanel({
  molecule,
  descriptors,
  prediction,
  docking,
  analysis,
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
                exportCsv(molecule, descriptors, prediction, docking, analysis),
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
                exportJson(
                  molecule,
                  descriptors,
                  prediction,
                  docking,
                  analysis,
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
