import type { ChartType } from "./chart";
import type { TemplateId } from "./template";

export type CommandIntentType =
  | "change_chart_type"
  | "sort_data"
  | "filter_category"
  | "search_query"
  | "switch_template"
  | "toggle_edit_layout"
  | "export_png"
  | "clear_filters"
  | "unknown";

export interface ParsedCommand {
  rawInput: string;
  intent: CommandIntentType;
  targetChartType?: ChartType;
  sortDirection?: "asc" | "desc";
  targetCategory?: string;
  searchQuery?: string;
  targetTemplateId?: TemplateId;
  confidenceScore: number;
  humanReadableExplanation: string;
}

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  executedCommand: ParsedCommand;
}

export interface SuggestedCommand {
  id: string;
  title: string;
  category: "Visualisasi" | "Filter & Sort" | "Template" | "Tindakan";
  commandText: string;
  shortcutBadge?: string;
}
