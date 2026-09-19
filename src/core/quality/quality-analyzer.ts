import type { DatasetSchema } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";
import type { QualityReport, QualityIssue } from "@/types/quality";
import { detectDuplicateRows } from "./duplicate-detector";
import { detectMissingValues } from "./missing-value-detector";
import { detectCategoryInconsistencies } from "./fuzzy-unifier";
import { detectStatisticalOutliers } from "./outlier-detector";

export function analyzeDataQuality(
  dataset: DatasetSchema,
  mapping: DatasetMapping
): QualityReport {
  const { id, rows, rowCount, columnCount } = dataset;
  const issues: QualityIssue[] = [];

  // 1. Detect Duplicates
  const duplicateIssue = detectDuplicateRows(rows);
  if (duplicateIssue) {
    issues.push(duplicateIssue);
  }

  // 2. Detect Missing Values
  const missingIssues = detectMissingValues(rows, mapping.columns);
  issues.push(...missingIssues);

  // 3. Detect Category Inconsistencies
  const inconsistencyIssues = detectCategoryInconsistencies(rows, mapping.columns);
  issues.push(...inconsistencyIssues);

  // 4. Detect Statistical Outliers
  const outlierIssues = detectStatisticalOutliers(rows, mapping.columns);
  issues.push(...outlierIssues);

  // Compute Total Quality Score (0 - 100)
  let totalDeductions = 0;

  if (duplicateIssue) {
    totalDeductions += Math.min(25, duplicateIssue.affectedPercentage * 1.2);
  }

  for (const m of missingIssues) {
    totalDeductions += Math.min(15, m.missingPercentage * 0.8);
  }

  for (const c of inconsistencyIssues) {
    totalDeductions += Math.min(10, c.clusters.length * 3);
  }

  for (const o of outlierIssues) {
    totalDeductions += Math.min(10, (o.outlierCount / Math.max(1, rowCount)) * 50);
  }

  const totalScore = Math.max(10, Math.min(100, Math.round(100 - totalDeductions)));

  // Calculate clean row count (rows with no duplicate and no missing values)
  const problematicRowIndices = new Set<number>();
  if (duplicateIssue) {
    duplicateIssue.duplicateIndices.forEach((idx) => problematicRowIndices.add(idx));
  }
  missingIssues.forEach((m) => {
    m.missingRowIndices.forEach((idx) => problematicRowIndices.add(idx));
  });

  const cleanRowCount = Math.max(0, rowCount - problematicRowIndices.size);

  return {
    datasetId: id,
    totalScore,
    totalRows: rowCount,
    totalColumns: columnCount,
    issues,
    cleanRowCount,
    createdAt: new Date().toISOString(),
  };
}
