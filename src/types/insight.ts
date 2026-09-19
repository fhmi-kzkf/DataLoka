import type { TemplateId } from "./template";

export type InsightType =
  | "top_performer"
  | "trend_growth"
  | "concentration"
  | "anomaly"
  | "general";

export type InsightSentiment = "positive" | "negative" | "neutral";

export interface EditorialInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  metricValue?: string | number;
  metricDelta?: string;
  sentiment: InsightSentiment;
  confidenceScore: number;
  recommendedAction?: string;
}

export type ExportFormat = "png" | "pdf" | "csv" | "json";

export interface SharePayload {
  version: string;
  title: string;
  subtitle: string;
  templateId: TemplateId;
  datasetName: string;
  kpiCards: Array<{
    title: string;
    formattedValue: string;
    deltaText?: string;
    isPositive?: boolean;
  }>;
  mainCharts: Array<{
    title: string;
    chartType: string;
    data: Array<{
      label: string;
      value: number;
      category?: string;
    }>;
  }>;
  accentCard?: {
    title: string;
    quote: string;
    author: string;
    role: string;
  };
  createdAt: string;
}
