import type { ChartType, DataPoint } from "@/types/chart";

export type AiIntentType =
  | "top_ranking"
  | "bottom_ranking"
  | "aggregate_sum"
  | "aggregate_avg"
  | "aggregate_count"
  | "filter_by_dimension"
  | "chart_transform"
  | "trend_analysis"
  | "explain_dataset";

export interface ParsedAiIntent {
  intent: AiIntentType;
  targetMetricColumn?: string;
  targetDimensionColumn?: string;
  filterValue?: string;
  limit?: number;
  recommendedChartType?: ChartType;
  confidence: number;
}

export interface AiQueryResult {
  answerText: string;
  calculatedValue?: string | number;
  intent: AiIntentType;
  confidence: number;
  chartRecommendation?: {
    chartType: ChartType;
    title: string;
    subtitle: string;
    data: DataPoint[];
  };
  sqlEquivalent?: string;
  suggestedFollowUps: string[];
}

export interface AiColumnClassification {
  columnName: string;
  semanticRole: "time" | "category" | "metric" | "identifier" | "location" | "general";
  detectedDataType: "datetime" | "categorical" | "numeric" | "currency" | "percentage" | "text";
  confidence: number;
  rationale: string;
  standardizedAlias: string;
}

export interface AiExecutiveNarrative {
  headline: string;
  executiveSummary: string;
  keyInsights: Array<{
    title: string;
    narrative: string;
    severity: "positive" | "warning" | "neutral";
    metricValue?: string;
  }>;
  strategicRecommendations: string[];
  datasetHealthSummary: string;
}
