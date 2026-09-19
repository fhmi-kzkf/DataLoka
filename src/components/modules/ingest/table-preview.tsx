import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DatasetSchema } from "@/types/dataset";

export interface TablePreviewProps {
  dataset: DatasetSchema;
  onProceed?: () => void;
  onReset?: () => void;
  onSwitchSheet?: (sheetName: string) => void;
  className?: string;
}

export function TablePreview({
  dataset,
  onProceed,
  onReset,
  onSwitchSheet,
  className,
}: TablePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card surface="elevated" padding="lg" className={className}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ececec]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-mono uppercase bg-[var(--color-mist-gray)] rounded text-[var(--color-ink-black)]">
              {dataset.sourceType}
            </span>
            <h3 className="text-[18px] font-medium text-[var(--color-ink-black)] truncate max-w-[320px]">
              {dataset.name}
            </h3>
          </div>
          <p className="text-[14px] text-[var(--color-slate-gray)]">
            {dataset.rowCount.toLocaleString("id-ID")} baris &bull; {dataset.columnCount} kolom &bull;{" "}
            {formatFileSize(dataset.fileSizeBytes)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Ganti File
          </Button>
          <Button variant="filled" size="sm" className="rounded-none bg-ink-black text-paper-white" onClick={onProceed}>
            Lanjutkan ke Pemetaan &amp; Dashboard →
          </Button>
        </div>
      </div>

      {/* Sheet Selector if multi-sheet Excel */}
      {dataset.sheetNames && dataset.sheetNames.length > 1 && (
        <div className="flex items-center gap-2 py-3 overflow-x-auto border-b border-slate-gray/15">
          <span className="text-xs text-[var(--color-slate-gray)] whitespace-nowrap font-mono">LEMBAR:</span>
          {dataset.sheetNames.map((sheet) => (
            <button
              key={sheet}
              onClick={() => onSwitchSheet?.(sheet)}
              className={`px-3 py-1 text-xs rounded-none border transition-colors whitespace-nowrap cursor-pointer ${
                dataset.activeSheet === sheet
                  ? "bg-[var(--color-ink-black)] text-white border-ink-black font-medium"
                  : "bg-[var(--color-mist-gray)] text-[var(--color-ink-black)] border-slate-gray/20 hover:bg-[#e4e4e6]"
              }`}
            >
              {sheet}
            </button>
          ))}
        </div>
      )}

      {/* Table Preview Grid */}
      <div className="mt-4 overflow-x-auto rounded-none border border-slate-gray/20">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="bg-[var(--color-fog-white)] border-b border-[#ececec]">
              <th className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-slate-gray)] w-12 text-center">
                #
              </th>
              {dataset.headers.map((header) => (
                <th
                  key={header}
                  className="py-2.5 px-3 font-medium text-[var(--color-ink-black)] whitespace-nowrap border-l border-[#ececec]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataset.sampleRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-[#f0f0f0] hover:bg-[var(--color-mist-gray)]/40 transition-colors"
              >
                <td className="py-2 px-3 font-mono text-[11px] text-[var(--color-slate-gray)] text-center bg-[var(--color-fog-white)]/60">
                  {rowIdx + 1}
                </td>
                {dataset.headers.map((header) => (
                  <td
                    key={header}
                    className="py-2 px-3 text-[var(--color-ink-black)] whitespace-nowrap border-l border-[#f0f0f0] truncate max-w-[200px]"
                  >
                    {row[header] !== null && row[header] !== undefined
                      ? String(row[header])
                      : <span className="text-[var(--color-smoke-gray)] italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-right">
        <span className="text-xs text-[var(--color-slate-gray)]">
          Menampilkan 5 baris pertama dari total {dataset.rowCount.toLocaleString("id-ID")} baris.
        </span>
      </div>
    </Card>
  );
}
