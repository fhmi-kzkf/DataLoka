"use client";

import React, { useRef, useState } from "react";
import type { EChartsType } from "echarts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfidenceIndicator } from "@/components/modules/mapping/confidence-indicator";
import { ChartContainer } from "./chart-container";
import { buildEChartsOption } from "./options-builder";
import type { ChartRecommendation, ChartType } from "@/types/chart";
import { cn } from "@/lib/utils";

export interface UniversalChartRendererProps {
  recommendation: ChartRecommendation;
  onSwapType?: (newType: ChartType) => void;
  onChartClick?: (params: { name?: string; seriesName?: string; dataIndex?: number }) => void;
  height?: number | string;
  className?: string;
}

export function UniversalChartRenderer({
  recommendation,
  onSwapType,
  onChartClick,
  height = 320,
  className,
}: UniversalChartRendererProps) {
  const chartInstanceRef = useRef<EChartsType | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    chartType,
    title,
    subtitle,
    confidenceScore,
    availableAlternativeTypes,
  } = recommendation;

  const option = React.useMemo(() => {
    return buildEChartsOption(recommendation);
  }, [recommendation]);

  const handleExportPNG = () => {
    if (!chartInstanceRef.current) return;
    const dataURL = chartInstanceRef.current.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = `${title.toLowerCase().replace(/\s+/g, "_")}.png`;
    link.href = dataURL;
    link.click();
  };

  const typeLabels: Record<ChartType, string> = {
    line: "Garis",
    area: "Area",
    bar: "Batang",
    horizontal_bar: "Bar Horizontal",
    donut: "Donut",
    pie: "Pie",
    grouped_bar: "Grouped Bar",
    scatter: "Scatter",
    kpi_card: "KPI",
    table: "Tabel",
  };

  return (
    <Card
      surface="elevated"
      padding="lg"
      className={cn(
        "border border-slate-gray/20 rounded-none bg-paper-white shadow-xs flex flex-col justify-between transition-all",
        isFullscreen && "fixed inset-4 z-50 shadow-2xl bg-paper-white",
        className
      )}
    >
      {/* Chart Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-gray/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-mono uppercase bg-[var(--color-mist-gray)] rounded-none border border-slate-gray/15 text-[var(--color-ink-black)]">
              {typeLabels[chartType] || chartType}
            </span>
            <ConfidenceIndicator score={confidenceScore} />
            <span className="text-[10.5px] font-mono text-slate-gray/70 hidden md:inline ml-1">
              &bull; Klik elemen untuk filter
            </span>
          </div>
          <h3 className="text-[18px] font-medium text-[var(--color-ink-black)] tracking-tight">
            {title}
          </h3>
          <p className="text-[13px] text-[var(--color-slate-gray)]">{subtitle}</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExportPNG} title="Unduh PNG" className="rounded-none text-[12px] px-2.5 py-1">
            PNG
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Perbesar Tampilan"
            className="rounded-none text-[12px] px-2.5 py-1"
          >
            {isFullscreen ? "Kecilkan" : "Layar Penuh"}
          </Button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="py-2 flex-1 flex items-center justify-center">
        <ChartContainer
          option={option}
          height={isFullscreen ? 540 : height}
          onChartReady={(inst) => {
            chartInstanceRef.current = inst;
          }}
          onChartClick={onChartClick}
        />
      </div>

      {/* Footer Type Switcher */}
      {availableAlternativeTypes && availableAlternativeTypes.length > 1 && (
        <div className="pt-3 border-t border-slate-gray/15 flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="text-[var(--color-slate-gray)] font-mono text-[11px]">TIPE ALTERNATIF:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {availableAlternativeTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onSwapType?.(type)}
                className={cn(
                  "px-2.5 py-1 rounded-none text-xs transition-colors cursor-pointer select-none border",
                  chartType === type
                    ? "bg-[var(--color-ink-black)] text-paper-white font-medium border-ink-black"
                    : "bg-[var(--color-mist-gray)] text-[var(--color-ink-black)] border-slate-gray/20 hover:bg-[#e4e4e6]"
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
