import type { ChartRecommendation } from "./chart";

export type TemplateId =
  | "ecommerce"
  | "sales"
  | "finance"
  | "marketing"
  | "operational"
  | "hr"
  | "survey"
  | "general";

export type LayoutStyle =
  | "grid_2col"
  | "collage"
  | "kpi_heavy"
  | "full_width"
  | "retail_grid"
  | "funnel_flow"
  | "fiscal_ledger"
  | "growth_matrix"
  | "logistics_dispatch"
  | "people_pulse"
  | "sentiment_polar"
  | "swiss_dense";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  category: string;
  matchingKeywords: string[];
  recommendedLayout: LayoutStyle;
  suggestedKpiCount: number;
  suggestedChartTypes: string[];
  badge?: string;
  personaTag?: string;
  accentColor?: string;
  themeStyle?: string;
  tagline?: string;
  heroMetricLabel?: string;
  heroMetricValue?: string;
  specializedMetricsHeader?: string;
}

export interface DashboardAccentCard {
  title: string;
  quote: string;
  author: string;
  role: string;
}

export interface DashboardState {
  id: string;
  title: string;
  subtitle: string;
  datasetId: string;
  templateId: TemplateId;
  kpiCards: ChartRecommendation[];
  mainCharts: ChartRecommendation[];
  accentCard?: DashboardAccentCard;
  selectedCategoryFilter?: string;
  searchFilter?: string;
  createdAt: string;
}
