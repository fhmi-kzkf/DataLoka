import type { DatasetRow, DatasetValue } from "@/types/dataset";
import type { ColumnMetadata } from "@/types/mapping";
import type { MissingValueIssue } from "@/types/quality";

export function detectMissingValues(
  rows: DatasetRow[],
  columns: Record<string, ColumnMetadata>
): MissingValueIssue[] {
  const issues: MissingValueIssue[] = [];
  if (!rows || rows.length === 0) return issues;

  for (const [colName, colMeta] of Object.entries(columns)) {
    const missingIndices: number[] = [];
    const validValues: DatasetValue[] = [];

    for (let i = 0; i < rows.length; i++) {
      const val = rows[i][colName];
      if (val === null || val === undefined || val === "" || (typeof val === "number" && isNaN(val))) {
        missingIndices.push(i);
      } else {
        validValues.push(val);
      }
    }

    if (missingIndices.length === 0) continue;

    const missingPercentage = Math.round((missingIndices.length / rows.length) * 100);

    // Compute statistical suggestions
    let meanValue: number | undefined;
    let medianValue: number | undefined;
    let modeValue: string | number | undefined;
    let suggestedAction: MissingValueIssue["suggestedAction"] = "drop_rows";
    let suggestedValue: number | string | boolean | undefined;

    if (colMeta.effectiveType === "numeric" || colMeta.effectiveType === "currency") {
      const numbers = validValues
        .map((v) => {
          if (typeof v === "number") return v;
          const cleaned = String(v).replace(/^(rp|idr|\$)\s*/i, "").replace(/,/g, "");
          return parseFloat(cleaned);
        })
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);

      if (numbers.length > 0) {
        const sum = numbers.reduce((acc, curr) => acc + curr, 0);
        meanValue = Math.round((sum / numbers.length) * 100) / 100;

        const mid = Math.floor(numbers.length / 2);
        medianValue =
          numbers.length % 2 !== 0
            ? numbers[mid]
            : (numbers[mid - 1] + numbers[mid]) / 2;

        suggestedAction = "fill_median";
        suggestedValue = medianValue;
      }
    } else if (colMeta.effectiveType === "categorical" || colMeta.effectiveType === "text") {
      // Compute mode (most frequent value)
      const freqMap = new Map<string, number>();
      for (const val of validValues) {
        const str = String(val);
        freqMap.set(str, (freqMap.get(str) || 0) + 1);
      }

      let maxFreq = 0;
      for (const [val, freq] of freqMap.entries()) {
        if (freq > maxFreq) {
          maxFreq = freq;
          modeValue = val;
        }
      }

      if (modeValue) {
        suggestedAction = "fill_mode";
        suggestedValue = modeValue;
      } else {
        suggestedAction = "fill_constant";
        suggestedValue = "Tidak Diketahui";
      }
    }

    issues.push({
      type: "missing_values",
      severity: missingPercentage > 20 ? "critical" : missingPercentage > 5 ? "warning" : "info",
      title: `${missingIndices.length} nilai kosong pada kolom "${colName}" (${missingPercentage}%)`,
      column: colName,
      dataType: colMeta.effectiveType,
      missingCount: missingIndices.length,
      missingPercentage,
      missingRowIndices: missingIndices,
      suggestedAction,
      suggestedValue,
      meanValue,
      medianValue,
      modeValue,
    });
  }

  return issues;
}
