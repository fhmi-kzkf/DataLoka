import React from "react";
import { cn } from "@/lib/utils";

export interface ConfidenceIndicatorProps {
  score: number; // 0 - 1
  className?: string;
}

export function ConfidenceIndicator({ score, className }: ConfidenceIndicatorProps) {
  const percentage = Math.round(score * 100);

  let colorClass = "bg-[#059669] text-[#059669]";
  let label = "Tinggi";

  if (score < 0.6) {
    colorClass = "bg-[var(--color-slate-gray)] text-[var(--color-slate-gray)]";
    label = "Rendah";
  } else if (score < 0.85) {
    colorClass = "bg-[#d97706] text-[#d97706]";
    label = "Sedang";
  }

  return (
    <div
      className={cn("inline-flex items-center gap-1.5 text-xs font-medium select-none", className)}
      title={`Tingkat keyakinan deteksi: ${percentage}% (${label})`}
    >
      <div className="w-2 h-2 rounded-full overflow-hidden">
        <div className={cn("w-full h-full", colorClass.split(" ")[0])} />
      </div>
      <span className={cn("font-mono text-[11px]", colorClass.split(" ")[1])}>{percentage}%</span>
    </div>
  );
}
