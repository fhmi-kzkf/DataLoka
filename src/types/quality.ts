import type { DataType } from "./mapping";
import type { DatasetRow } from "./dataset";

export type QualityIssueType =
  | "duplicate_rows"
  | "missing_values"
  | "category_inconsistency"
  | "statistical_outliers";

export type QualitySeverity = "info" | "warning" | "critical";

export type ImputationStrategy =
  | "fill_mean"
  | "fill_median"
  | "fill_mode"
  | "fill_constant"
  | "drop_rows";

export interface DuplicateIssue {
  type: "duplicate_rows";
  severity: QualitySeverity;
  title: string;
  duplicateCount: number;
  duplicateIndices: number[];
  affectedPercentage: number;
}

export interface MissingValueIssue {
  type: "missing_values";
  severity: QualitySeverity;
  title: string;
  column: string;
  dataType: DataType;
  missingCount: number;
  missingPercentage: number;
  missingRowIndices: number[];
  suggestedAction: ImputationStrategy;
  suggestedValue?: number | string | boolean;
  meanValue?: number;
  medianValue?: number;
  modeValue?: string | number;
}

export interface CategoryCluster {
  canonical: string;
  variants: string[];
  totalOccurrences: number;
}

export interface CategoryInconsistencyIssue {
  type: "category_inconsistency";
  severity: QualitySeverity;
  title: string;
  column: string;
  clusters: CategoryCluster[];
}

export interface OutlierIssue {
  type: "statistical_outliers";
  severity: QualitySeverity;
  title: string;
  column: string;
  outlierCount: number;
  lowerBound: number;
  upperBound: number;
  outlierValues: number[];
  outlierRowIndices: number[];
}

export type QualityIssue =
  | DuplicateIssue
  | MissingValueIssue
  | CategoryInconsistencyIssue
  | OutlierIssue;

export interface QualityReport {
  datasetId: string;
  totalScore: number; // 0 - 100
  totalRows: number;
  totalColumns: number;
  issues: QualityIssue[];
  cleanRowCount: number;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  columnAffected?: string;
  rowsAffected: number;
  previousRowsSnapshot?: DatasetRow[];
}
