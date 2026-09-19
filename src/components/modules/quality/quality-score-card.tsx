import React from "react";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import type { QualityReport } from "@/types/quality";
import { cn } from "@/lib/utils";

export interface QualityScoreCardProps {
  report: QualityReport;
  className?: string;
}

export function QualityScoreCard({ report, className }: QualityScoreCardProps) {
  const { totalScore, totalRows, cleanRowCount, issues } = report;

  let scoreColor = "text-[#059669]";
  let statusBadge = "Data Bersih & Siap";
  let statusBg = "bg-[#d1fae5] text-[#065f46]";

  if (totalScore < 60) {
    scoreColor = "text-red-600";
    statusBadge = "Kualitas Kritis";
    statusBg = "bg-red-100 text-red-700";
  } else if (totalScore < 85) {
    scoreColor = "text-amber-600";
    statusBadge = "Perlu Perhatian";
    statusBg = "bg-amber-100 text-amber-800";
  }

  return (
    <Card surface="elevated" padding="lg" className={cn("flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-none border border-slate-gray/20", className)}>
      <div className="flex items-center gap-6">
        {/* Score Box */}
        <div className="relative w-24 h-24 rounded-none bg-[var(--color-mist-gray)] flex items-center justify-center shrink-0 border border-slate-gray/20">
          <span className={cn("text-[32px] font-medium font-mono", scoreColor)}>
            {totalScore}
          </span>
          <span className="text-xs text-[var(--color-slate-gray)] absolute bottom-2 font-mono">/ 100</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag label="Asisten Kualitas Data" />
            <span className={cn("px-2.5 py-0.5 text-xs font-medium rounded-none border", statusBg)}>
              {statusBadge}
            </span>
          </div>
          <h2 className="text-[20px] font-serif font-normal text-[var(--color-ink-black)]">
            Kesehatan & Integritas Dataset
          </h2>
          <p className="text-[14px] text-[var(--color-slate-gray)] mt-0.5">
            {cleanRowCount.toLocaleString("id-ID")} dari {totalRows.toLocaleString("id-ID")} baris data bebas dari anomali ({issues.length} isu terdeteksi).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-center divide-x divide-slate-gray/15 pt-4 md:pt-0 border-t md:border-t-0 border-slate-gray/15">
        <div className="px-4">
          <p className="text-[18px] font-medium text-[var(--color-ink-black)] font-mono">{totalRows}</p>
          <p className="text-xs text-[var(--color-slate-gray)]">Total Baris</p>
        </div>
        <div className="px-4">
          <p className="text-[18px] font-medium text-[var(--color-ink-black)] font-mono">{issues.length}</p>
          <p className="text-xs text-[var(--color-slate-gray)]">Isu Terdeteksi</p>
        </div>
        <div className="px-4">
          <p className="text-[18px] font-medium text-[#059669] font-mono">
            {Math.round((cleanRowCount / Math.max(1, totalRows)) * 100)}%
          </p>
          <p className="text-xs text-[var(--color-slate-gray)]">Tingkat Kebersihan</p>
        </div>
      </div>
    </Card>
  );
}
