import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { useChartStore } from "@/stores/chart-store";
import { RecommendationCard } from "./recommendation-card";
import type { DatasetSchema } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";

export interface EnginePreviewContainerProps {
  dataset: DatasetSchema;
  mapping: DatasetMapping;
  onProceedToRenderer?: () => void;
  onBackToQuality?: () => void;
  className?: string;
}

export function EnginePreviewContainer({
  dataset,
  mapping,
  onProceedToRenderer,
  onBackToQuality,
  className,
}: EnginePreviewContainerProps) {
  const {
    engineResult,
    activeRecommendations,
    generateRecommendations,
    swapChartType,
    removeChart,
  } = useChartStore();

  React.useEffect(() => {
    if (!engineResult || engineResult.datasetId !== dataset.id) {
      generateRecommendations(dataset, mapping);
    }
  }, [dataset, mapping, engineResult, generateRecommendations]);

  if (!engineResult) {
    return (
      <Card surface="mist" padding="lg" className="text-center">
        <p className="text-[15px] text-[var(--color-slate-gray)]">
          Menjalankan mesin heuristik auto-chart...
        </p>
      </Card>
    );
  }

  const kpis = activeRecommendations.filter((r) => r.chartType === "kpi_card");
  const charts = activeRecommendations.filter((r) => r.chartType !== "kpi_card");

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#ececec]">
        <div>
          <Tag label="Auto-Chart Decision Engine" className="mb-1" />
          <h2 className="text-[24px] font-serif font-normal text-[var(--color-ink-black)]">
            Rekomendasi Visualisasi Otomatis
          </h2>
          <p className="text-[14px] text-[var(--color-slate-gray)] mt-1">
            Dihasilkan berdasarkan aturan heuristik statistik, tipe data, dan skor keyakinan ({activeRecommendations.length} chart disarankan).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onBackToQuality && (
            <Button variant="ghost" size="sm" onClick={onBackToQuality}>
              Kembali ke Kualitas Data
            </Button>
          )}
          <Button variant="filled" size="sm" onClick={onProceedToRenderer}>
            Render ECharts Dashboard →
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      {kpis.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-[var(--color-slate-gray)] font-medium mb-3">
            Ringkasan Metrik Utama (KPI)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <RecommendationCard
                key={kpi.id}
                recommendation={kpi}
                onSwapType={(newType) => swapChartType(kpi.id, newType, dataset, mapping)}
                onRemove={() => removeChart(kpi.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Charts Grid */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-[var(--color-slate-gray)] font-medium mb-3">
          Visualisasi Tren & Distribusi ({charts.length})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart) => (
            <RecommendationCard
              key={chart.id}
              recommendation={chart}
              onSwapType={(newType) => swapChartType(chart.id, newType, dataset, mapping)}
              onRemove={() => removeChart(chart.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
