import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQualityStore } from "@/stores/quality-store";
import { QualityScoreCard } from "./quality-score-card";
import { QualityIssueCard } from "./quality-issue-card";
import { AuditLogPanel } from "./audit-log-panel";
import type { DatasetSchema } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";

export interface QualityAssistantContainerProps {
  dataset: DatasetSchema;
  mapping: DatasetMapping;
  onProceedToAutoChart?: () => void;
  onBackToMapping?: () => void;
  className?: string;
}

export function QualityAssistantContainer({
  dataset,
  mapping,
  onProceedToAutoChart,
  onBackToMapping,
  className,
}: QualityAssistantContainerProps) {
  const {
    report,
    auditLogs,
    runAnalysis,
    fixDuplicates,
    fixMissingValues,
    unifyCategory,
    clipOutlierColumn,
    applyAllRecommendations,
    undoLastAction,
  } = useQualityStore();

  // Run analysis if not already loaded or dataset changed
  React.useEffect(() => {
    if (!report || report.datasetId !== dataset.id) {
      runAnalysis(dataset, mapping);
    }
  }, [dataset, mapping, report, runAnalysis]);

  if (!report) {
    return (
      <Card surface="mist" padding="lg" className="text-center">
        <p className="text-[15px] text-[var(--color-slate-gray)]">
          Menganalisis kesehatan dan integritas data...
        </p>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Top Score Overview */}
      <QualityScoreCard report={report} className="mb-6" />

      {/* Batch Actions & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {report.issues.length > 0 && (
            <Button
              variant="filled"
              size="sm"
              onClick={() => applyAllRecommendations()}
            >
              Terapkan Semua Rekomendasi ({report.issues.length})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onBackToMapping && (
            <Button variant="ghost" size="sm" onClick={onBackToMapping}>
              Kembali ke Pemetaan
            </Button>
          )}
          <Button variant="filled" size="sm" onClick={onProceedToAutoChart}>
            Lanjut ke Pembuatan Chart Otomatis →
          </Button>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4 mb-6">
        {report.issues.map((issue, idx) => (
          <QualityIssueCard
            key={idx}
            issue={issue}
            onFixDuplicates={fixDuplicates}
            onFixMissingValues={fixMissingValues}
            onUnifyCategory={unifyCategory}
            onClipOutliers={clipOutlierColumn}
          />
        ))}

        {report.issues.length === 0 && (
          <Card surface="mist" padding="lg" className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-[#d1fae5] text-[#065f46] flex items-center justify-center mx-auto mb-3 font-semibold text-lg">
              ✓
            </div>
            <h3 className="text-[18px] font-medium text-[var(--color-ink-black)] mb-1">
              Data Sempurna & Siap Dibuatkan Chart
            </h3>
            <p className="text-[14px] text-[var(--color-slate-gray)] max-w-md mx-auto">
              Tidak ditemukan baris duplikat, nilai kosong, atau anomali penulisan. Anda dapat langsung melanjutkan ke visualisasi.
            </p>
          </Card>
        )}
      </div>

      {/* Audit Log Panel */}
      <AuditLogPanel logs={auditLogs} onUndo={undoLastAction} />
    </div>
  );
}
