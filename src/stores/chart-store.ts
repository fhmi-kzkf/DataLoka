import { create } from "zustand";
import type { DatasetSchema } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";
import type { AutoChartEngineResult, ChartRecommendation, ChartType } from "@/types/chart";
import { generateAutoCharts, transformChartForNewType } from "@/core/engine/engine";

export interface ChartState {
  engineResult: AutoChartEngineResult | null;
  activeRecommendations: ChartRecommendation[];
  selectedChartId: string | null;

  generateRecommendations: (dataset: DatasetSchema, mapping: DatasetMapping) => AutoChartEngineResult;
  swapChartType: (
    chartId: string,
    newType: ChartType,
    dataset: DatasetSchema,
    mapping: DatasetMapping
  ) => void;
  updateChartTitle: (chartId: string, newTitle: string) => void;
  removeChart: (chartId: string) => void;
  reorderCharts: (sourceIndex: number, targetIndex: number) => void;
  setSelectedChartId: (id: string | null) => void;
  resetCharts: () => void;
}

export const useChartStore = create<ChartState>((set, get) => ({
  engineResult: null,
  activeRecommendations: [],
  selectedChartId: null,

  generateRecommendations: (dataset: DatasetSchema, mapping: DatasetMapping) => {
    const result = generateAutoCharts(dataset, mapping);
    set({
      engineResult: result,
      activeRecommendations: result.allRecommendations,
      selectedChartId: result.mainCharts[0]?.id || null,
    });
    return result;
  },

  swapChartType: (
    chartId: string,
    newType: ChartType,
    dataset: DatasetSchema,
    mapping: DatasetMapping
  ) => {
    const { activeRecommendations, engineResult } = get();
    const updated = activeRecommendations.map((rec) => {
      if (rec.id === chartId) {
        return transformChartForNewType(rec, newType, dataset, mapping);
      }
      return rec;
    });

    set({
      activeRecommendations: updated,
      engineResult: engineResult
        ? {
            ...engineResult,
            kpiCards: updated.filter((r) => r.chartType === "kpi_card"),
            mainCharts: updated.filter((r) => r.chartType !== "kpi_card"),
            allRecommendations: updated,
          }
        : null,
    });
  },

  updateChartTitle: (chartId: string, newTitle: string) => {
    const { activeRecommendations, engineResult } = get();
    const updated = activeRecommendations.map((rec) =>
      rec.id === chartId ? { ...rec, title: newTitle } : rec
    );

    set({
      activeRecommendations: updated,
      engineResult: engineResult
        ? {
            ...engineResult,
            kpiCards: updated.filter((r) => r.chartType === "kpi_card"),
            mainCharts: updated.filter((r) => r.chartType !== "kpi_card"),
            allRecommendations: updated,
          }
        : null,
    });
  },

  removeChart: (chartId: string) => {
    const { activeRecommendations, engineResult } = get();
    const updated = activeRecommendations.filter((rec) => rec.id !== chartId);

    set({
      activeRecommendations: updated,
      engineResult: engineResult
        ? {
            ...engineResult,
            kpiCards: updated.filter((r) => r.chartType === "kpi_card"),
            mainCharts: updated.filter((r) => r.chartType !== "kpi_card"),
            allRecommendations: updated,
          }
        : null,
    });
  },

  reorderCharts: (sourceIndex: number, targetIndex: number) => {
    const { activeRecommendations } = get();
    const items = Array.from(activeRecommendations);
    const [moved] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, moved);

    set({ activeRecommendations: items });
  },

  setSelectedChartId: (selectedChartId: string | null) => set({ selectedChartId }),

  resetCharts: () =>
    set({
      engineResult: null,
      activeRecommendations: [],
      selectedChartId: null,
    }),
}));
