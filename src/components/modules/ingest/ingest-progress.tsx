import React from "react";
import { Card } from "@/components/ui/card";
import type { ParseStage } from "@/types/dataset";

export interface IngestProgressProps {
  percentage: number;
  stage: ParseStage;
  message: string;
}

export function IngestProgress({ percentage, stage, message }: IngestProgressProps) {
  const stageLabels: Record<ParseStage, string> = {
    reading: "Membaca berkas",
    parsing: "Membedah baris",
    structuring: "Menyusun kolom",
    completed: "Selesai",
  };

  return (
    <Card surface="elevated" padding="lg" className="w-full max-w-[500px] mx-auto text-center animate-fade-in">
      <div className="flex items-center justify-between text-[14px] text-[var(--color-slate-gray)] mb-3">
        <span className="font-medium text-[var(--color-ink-black)]">
          {stageLabels[stage] || "Memproses..."}
        </span>
        <span className="font-mono">{percentage}%</span>
      </div>

      <div className="w-full h-2 bg-[var(--color-mist-gray)] rounded-full overflow-hidden mb-4">
        <div
          data-testid="progress-bar-fill"
          className="h-full bg-[var(--color-ink-black)] transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
        />
      </div>

      <p className="text-[14px] text-[var(--color-slate-gray)] truncate">{message}</p>
    </Card>
  );
}
