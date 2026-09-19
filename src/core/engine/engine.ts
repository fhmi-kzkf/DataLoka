import type { DatasetSchema } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";
import type { AutoChartEngineResult, ChartRecommendation, ChartType } from "@/types/chart";
import { evaluateHeuristicRules } from "./heuristic-rules";
import { aggregateByCategory, aggregateByDate } from "./aggregator";

export function generateAutoCharts(
  dataset: DatasetSchema,
  mapping: DatasetMapping
): AutoChartEngineResult {
  const allRecommendations = evaluateHeuristicRules(dataset, mapping);

  const kpiCards = allRecommendations.filter((r) => r.chartType === "kpi_card");
  const mainCharts = allRecommendations.filter((r) => r.chartType !== "kpi_card");

  return {
    datasetId: dataset.id,
    kpiCards,
    mainCharts,
    allRecommendations,
    createdAt: new Date().toISOString(),
  };
}

export function transformChartForNewType(
  recommendation: ChartRecommendation,
  newType: ChartType,
  dataset: DatasetSchema,
  mapping: DatasetMapping
): ChartRecommendation {
  if (recommendation.chartType === newType) return recommendation;

  const { rows } = dataset;
  const primaryDate = recommendation.xAxisColumn || mapping.primaryDateColumn;
  const primaryCategory = recommendation.categoryColumn || mapping.primaryCategoryColumn;
  const primaryNumeric = recommendation.yAxisColumns[0] || mapping.primaryNumericColumn || "";

  let updatedData = recommendation.data;

  if (newType === "donut" || newType === "pie") {
    if (primaryCategory && primaryNumeric) {
      updatedData = aggregateByCategory(rows, primaryCategory, primaryNumeric, "sum", 7);
    }
  } else if (newType === "horizontal_bar" || newType === "bar") {
    if (primaryCategory && primaryNumeric) {
      updatedData = aggregateByCategory(rows, primaryCategory, primaryNumeric, "sum", 10);
    } else if (primaryDate && primaryNumeric) {
      updatedData = aggregateByDate(rows, primaryDate, [primaryNumeric], "sum");
    }
  } else if (newType === "line" || newType === "area") {
    if (primaryDate && primaryNumeric) {
      updatedData = aggregateByDate(rows, primaryDate, [primaryNumeric], "sum");
    }
  }

  return {
    ...recommendation,
    chartType: newType,
    data: updatedData,
  };
}
