export type ChartType =
  | "line"
  | "area"
  | "bar"
  | "horizontal_bar"
  | "donut"
  | "pie"
  | "grouped_bar"
  | "scatter"
  | "kpi_card"
  | "table";

export type AggregationType = "sum" | "avg" | "count" | "min" | "max" | "none";

export interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
  [key: string]: unknown;
}

export interface KpiMetric {
  title: string;
  value: number | string;
  formattedValue: string;
  deltaText?: string;
  isPositive?: boolean;
  sparklineData?: number[];
}

export interface ChartRecommendation {
  id: string;
  chartType: ChartType;
  title: string;
  subtitle: string;
  confidenceScore: number;
  reasoning: string;
  xAxisColumn?: string;
  yAxisColumns: string[];
  categoryColumn?: string;
  secondaryCategoryColumn?: string;
  aggregationType: AggregationType;
  data: DataPoint[];
  kpiMetric?: KpiMetric;
  orderIndex: number;
  availableAlternativeTypes: ChartType[];
}

export interface AutoChartEngineResult {
  datasetId: string;
  kpiCards: ChartRecommendation[];
  mainCharts: ChartRecommendation[];
  allRecommendations: ChartRecommendation[];
  createdAt: string;
}
