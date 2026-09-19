import type { DatasetRow } from "@/types/dataset";
import type { ColumnMetadata } from "@/types/mapping";
import type { OutlierIssue } from "@/types/quality";

export function detectStatisticalOutliers(
  rows: DatasetRow[],
  columns: Record<string, ColumnMetadata>
): OutlierIssue[] {
  const issues: OutlierIssue[] = [];
  if (!rows || rows.length < 8) return issues; // Statistical outliers require adequate sample size

  for (const [colName, colMeta] of Object.entries(columns)) {
    if (colMeta.effectiveType !== "numeric" && colMeta.effectiveType !== "currency") {
      continue;
    }

    // Extract valid numeric values with row index
    const indexedNumbers: { value: number; index: number }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const val = rows[i][colName];
      if (val !== null && val !== undefined && val !== "") {
        let num: number;
        if (typeof val === "number") {
          num = val;
        } else {
          const cleaned = String(val).replace(/^(rp|idr|\$)\s*/i, "").replace(/,/g, "");
          num = parseFloat(cleaned);
        }

        if (!isNaN(num)) {
          indexedNumbers.push({ value: num, index: i });
        }
      }
    }

    if (indexedNumbers.length < 8) continue;

    // Sort ascending for quartile computation
    indexedNumbers.sort((a, b) => a.value - b.value);
    const n = indexedNumbers.length;

    const q1Idx = Math.floor(n * 0.25);
    const q3Idx = Math.floor(n * 0.75);

    const q1 = indexedNumbers[q1Idx].value;
    const q3 = indexedNumbers[q3Idx].value;
    const iqr = q3 - q1;

    // Zero IQR happens when >50% values are identical
    if (iqr <= 0) continue;

    const lowerBound = Math.round((q1 - 1.5 * iqr) * 100) / 100;
    const upperBound = Math.round((q3 + 1.5 * iqr) * 100) / 100;

    const outlierValues: number[] = [];
    const outlierRowIndices: number[] = [];

    for (const item of indexedNumbers) {
      if (item.value < lowerBound || item.value > upperBound) {
        outlierValues.push(item.value);
        outlierRowIndices.push(item.index);
      }
    }

    if (outlierValues.length > 0) {
      issues.push({
        type: "statistical_outliers",
        severity: outlierValues.length > rows.length * 0.1 ? "warning" : "info",
        title: `Ditemukan ${outlierValues.length} nilai anomali/pencilan pada kolom "${colName}"`,
        column: colName,
        outlierCount: outlierValues.length,
        lowerBound,
        upperBound,
        outlierValues,
        outlierRowIndices,
      });
    }
  }

  return issues;
}
