import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QualityIssue, ImputationStrategy } from "@/types/quality";
import { cn } from "@/lib/utils";

export interface QualityIssueCardProps {
  issue: QualityIssue;
  onFixDuplicates?: () => void;
  onFixMissingValues?: (column: string, strategy: ImputationStrategy, customValue?: string | number | boolean) => void;
  onUnifyCategory?: (column: string, canonical: string, variants: string[]) => void;
  onClipOutliers?: (column: string, lowerBound: number, upperBound: number) => void;
  className?: string;
}

export function QualityIssueCard({
  issue,
  onFixDuplicates,
  onFixMissingValues,
  onUnifyCategory,
  onClipOutliers,
  className,
}: QualityIssueCardProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<ImputationStrategy>(
    issue.type === "missing_values" ? issue.suggestedAction : "fill_median"
  );

  const severityColors = {
    critical: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <Card
      surface="canvas"
      padding="md"
      className={cn("border border-[#ececec] hover:border-[var(--color-slate-gray)] transition-all", className)}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "px-2 py-0.5 text-[11px] font-mono uppercase rounded font-medium border",
                severityColors[issue.severity]
              )}
            >
              {issue.type.replace("_", " ")}
            </span>
            <h4 className="text-[16px] font-medium text-[var(--color-ink-black)]">
              {issue.title}
            </h4>
          </div>

          {/* Details per issue type */}
          {issue.type === "duplicate_rows" && (
            <p className="text-[14px] text-[var(--color-slate-gray)]">
              Ditemukan {issue.duplicateCount} baris ({issue.affectedPercentage}% dari total data) dengan seluruh nilai kolom identik. Menghapus baris duplikat akan mencegah distorsi kalkulasi agregasi.
            </p>
          )}

          {issue.type === "missing_values" && (
            <div className="space-y-3 text-[14px] text-[var(--color-slate-gray)]">
              <p>
                Kolom &ldquo;<strong className="text-[var(--color-ink-black)]">{issue.column}</strong>&rdquo; memiliki {issue.missingCount} baris kosong ({issue.missingPercentage}%).
              </p>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-medium text-[var(--color-ink-black)]">Opsi Perbaikan:</span>
                <button
                  type="button"
                  onClick={() => setSelectedStrategy("fill_median")}
                  className={cn(
                    "px-2.5 py-1 rounded-none border transition-colors cursor-pointer",
                    selectedStrategy === "fill_median"
                      ? "bg-[var(--color-ink-black)] text-white font-medium border-[var(--color-ink-black)]"
                      : "bg-[var(--color-mist-gray)] border-[#ececec] text-[var(--color-ink-black)]"
                  )}
                >
                  Isi Median ({issue.medianValue ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStrategy("fill_mean")}
                  className={cn(
                    "px-2.5 py-1 rounded-none border transition-colors cursor-pointer",
                    selectedStrategy === "fill_mean"
                      ? "bg-[var(--color-ink-black)] text-white font-medium border-[var(--color-ink-black)]"
                      : "bg-[var(--color-mist-gray)] border-[#ececec] text-[var(--color-ink-black)]"
                  )}
                >
                  Isi Rata-rata ({issue.meanValue ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStrategy("drop_rows")}
                  className={cn(
                    "px-2.5 py-1 rounded-none border transition-colors cursor-pointer",
                    selectedStrategy === "drop_rows"
                      ? "bg-red-600 text-white font-medium border-red-600"
                      : "bg-[var(--color-mist-gray)] border-[#ececec] text-[var(--color-ink-black)]"
                  )}
                >
                  Hapus Baris Kosong
                </button>
              </div>
            </div>
          )}

          {issue.type === "category_inconsistency" && (
            <div className="space-y-2 text-[14px] text-[var(--color-slate-gray)]">
              <p>
                Variasi penulisan berbeda ditemukan pada kolom &ldquo;
                <strong className="text-[var(--color-ink-black)]">{issue.column}</strong>&rdquo;:
              </p>
              <div className="space-y-1">
                {issue.clusters.map((cluster, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-mono bg-[var(--color-fog-white)] p-2 rounded-none border border-[#ececec]">
                    <span className="text-red-500 line-through">[{cluster.variants.join(", ")}]</span>
                    <span>&rarr;</span>
                    <span className="text-[#059669] font-medium">{cluster.canonical}</span>
                    <span className="text-[var(--color-slate-gray)]">({cluster.totalOccurrences} baris)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {issue.type === "statistical_outliers" && (
            <div className="space-y-2 text-[14px] text-[var(--color-slate-gray)]">
              <p>
                Nilai berada di luar rentang normal IQR [{issue.lowerBound} &ndash; {issue.upperBound}]:
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {issue.outlierValues.slice(0, 5).map((val, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-mono bg-red-100 text-red-800 rounded-none border border-red-200">
                    {val.toLocaleString("id-ID")}
                  </span>
                ))}
                {issue.outlierValues.length > 5 && (
                  <span className="text-xs text-[var(--color-slate-gray)] font-mono">
                    +{issue.outlierValues.length - 5} lainnya
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0 self-end sm:self-center">
          {issue.type === "duplicate_rows" && (
            <Button variant="filled" size="sm" className="rounded-none" onClick={onFixDuplicates}>
              Hapus Duplikat (1-Klik)
            </Button>
          )}

          {issue.type === "missing_values" && (
            <Button
              variant="filled"
              size="sm"
              className="rounded-none"
              onClick={() => {
                const fillVal =
                  selectedStrategy === "fill_median"
                    ? issue.medianValue
                    : selectedStrategy === "fill_mean"
                    ? issue.meanValue
                    : issue.modeValue;
                onFixMissingValues?.(issue.column, selectedStrategy, fillVal);
              }}
            >
              Terapkan Perbaikan
            </Button>
          )}

          {issue.type === "category_inconsistency" && (
            <Button
              variant="filled"
              size="sm"
              className="rounded-none"
              onClick={() => {
                const firstCluster = issue.clusters[0];
                if (firstCluster) {
                  onUnifyCategory?.(issue.column, firstCluster.canonical, firstCluster.variants);
                }
              }}
            >
              Satukan Kategori
            </Button>
          )}

          {issue.type === "statistical_outliers" && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none"
              onClick={() => onClipOutliers?.(issue.column, issue.lowerBound, issue.upperBound)}
            >
              Batasi Nilai Outlier
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
