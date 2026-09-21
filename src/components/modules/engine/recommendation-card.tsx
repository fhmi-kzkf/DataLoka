import React from "react";
import { Card } from "@/components/ui/card";
import { ConfidenceIndicator } from "@/components/modules/mapping/confidence-indicator";
import type { ChartRecommendation, ChartType } from "@/types/chart";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface RecommendationCardProps {
  recommendation: ChartRecommendation;
  onSwapType?: (newType: ChartType) => void;
  onRemove?: () => void;
  className?: string;
}

export function RecommendationCard({
  recommendation,
  onSwapType,
  onRemove,
  className,
}: RecommendationCardProps) {
  const {
    chartType,
    title,
    subtitle,
    confidenceScore,
    reasoning,
    data,
    kpiMetric,
    availableAlternativeTypes,
  } = recommendation;

  const typeLabels: Record<ChartType, string> = {
    line: "Garis (Line)",
    area: "Area",
    bar: "Batang (Bar)",
    horizontal_bar: "Bar Horizontal",
    donut: "Donut",
    pie: "Pie",
    grouped_bar: "Grouped Bar",
    scatter: "Scatter",
    kpi_card: "KPI Ringkasan",
    table: "Tabel",
  };

  if (chartType === "kpi_card" && kpiMetric) {
    return (
      <Card
        surface="elevated"
        padding="md"
        className={cn("flex flex-col justify-between min-h-[140px] border border-[#ececec]", className)}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[var(--color-slate-gray)] font-normal uppercase tracking-wider">
                {title}
              </span>
              <ConfidenceIndicator score={confidenceScore} />
            </div>
            <p className="text-[26px] font-medium text-[var(--color-ink-black)] tracking-tight font-mono">
              {kpiMetric.formattedValue}
            </p>
          </div>
          {kpiMetric.deltaText && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-0.5",
                kpiMetric.isPositive
                  ? "bg-[#d1fae5] text-[#065f46]"
                  : "bg-red-100 text-red-700"
              )}
            >
              {kpiMetric.isPositive ? "↑" : "↓"} {kpiMetric.deltaText}
            </span>
          )}
        </div>

        {kpiMetric.sparklineData && kpiMetric.sparklineData.length > 0 && (
          <div className="w-full h-8 mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 32" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="var(--color-sienna-brown)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={kpiMetric.sparklineData
                  .map((val, idx, arr) => {
                    const min = Math.min(...arr);
                    const max = Math.max(...arr);
                    const range = max - min || 1;
                    const x = (idx / (arr.length - 1)) * 100;
                    const y = 30 - ((val - min) / range) * 26;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ")}
              />
            </svg>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card
      surface="elevated"
      padding="lg"
      className={cn("border border-[#ececec] flex flex-col justify-between transition-all hover:border-[var(--color-slate-gray)]", className)}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[11px] font-mono uppercase bg-[var(--color-mist-gray)] rounded text-[var(--color-ink-black)]">
                {typeLabels[chartType] || chartType}
              </span>
              <ConfidenceIndicator score={confidenceScore} />
            </div>
            <h3 className="text-[18px] font-medium text-[var(--color-ink-black)]">{title}</h3>
            <p className="text-[13px] text-[var(--color-slate-gray)]">{subtitle}</p>
          </div>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-[var(--color-slate-gray)] hover:text-red-600 text-xs p-1"
              title="Hapus chart ini"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Reasoning */}
        <div className="my-3 p-2.5 bg-[var(--color-fog-white)] rounded-lg text-xs text-[var(--color-slate-gray)] border border-[#ececec]">
          <span className="font-semibold text-[var(--color-ink-black)] mr-1">Rasional Heuristik:</span>
          {reasoning}
        </div>

        {/* Data Sample Preview */}
        <div className="my-3 flex items-center gap-2 overflow-x-auto py-1">
          {data.slice(0, 5).map((point, idx) => (
            <div
              key={idx}
              className="px-2 py-1 bg-[var(--color-mist-gray)]/60 rounded text-xs text-[var(--color-ink-black)] font-mono whitespace-nowrap"
            >
              <span className="text-[var(--color-slate-gray)] mr-1">{point.label}:</span>
              <span>{typeof point.value === "number" ? point.value.toLocaleString("id-ID") : point.value}</span>
            </div>
          ))}
          {data.length > 5 && (
            <span className="text-xs text-[var(--color-slate-gray)] whitespace-nowrap">
              +{data.length - 5} data lainnya
            </span>
          )}
        </div>
      </div>

      {/* Alternative Type Switcher */}
      {availableAlternativeTypes && availableAlternativeTypes.length > 1 && (
        <div className="pt-3 border-t border-[#ececec] flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="text-[var(--color-slate-gray)]">Ganti Tipe:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {availableAlternativeTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onSwapType?.(type)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer",
                  chartType === type
                    ? "bg-[var(--color-ink-black)] text-white font-medium"
                    : "bg-[var(--color-mist-gray)] text-[var(--color-ink-black)] hover:bg-[#e4e4e6]"
                )}
              >
                {typeLabels[type] || type}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
