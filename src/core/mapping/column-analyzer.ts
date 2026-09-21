import type { DatasetSchema } from "@/types/dataset";
import type { DatasetMapping, ColumnMetadata, ColumnStats, DataType } from "@/types/mapping";
import { inferColumnType } from "./type-detector";
import { matchLocalDictionary } from "./local-dictionary";
import { parseFlexibleDate } from "./date-normalizer";

export function analyzeDatasetColumns(dataset: DatasetSchema): DatasetMapping {
  const { id, headers, rows, rowCount } = dataset;
  const columns: Record<string, ColumnMetadata> = {};

  let primaryDateColumn: string | undefined;
  let primaryCategoryColumn: string | undefined;
  let primaryNumericColumn: string | undefined;

  for (const header of headers) {
    const rawValues = rows.map((r) => r[header]);
    const nonNullValues = rawValues.filter((v) => v !== null && v !== undefined && v !== "");

    const totalNulls = rowCount - nonNullValues.length;
    const nullableRatio = rowCount > 0 ? totalNulls / rowCount : 0;

    const uniqueSet = new Set(nonNullValues.map(String));
    const cardinality = uniqueSet.size;

    // Detect type and dictionary role
    const typeDetection = inferColumnType(rawValues, header);
    const dictMatch = matchLocalDictionary(header);

    // Reconcile detected type with dictionary suggestion
    let effectiveType: DataType = typeDetection.inferredType;
    let confidenceScore = typeDetection.confidence;

    // If header looks like an identifier, force text/identifier
    if (/^(id_|no_|kode_|trx_|sku|uuid)/i.test(header) || /(_id|_code|_no)$/i.test(header) || dictMatch.role === "identifier") {
      effectiveType = "text";
      confidenceScore = 0.98;
    } else if (dictMatch.confidence >= 0.85) {
      if (dictMatch.role === "product_name" || dictMatch.role === "customer_name") {
        effectiveType = "text";
      } else if (dictMatch.suggestedType === "currency" && (effectiveType === "numeric" || effectiveType === "currency")) {
        effectiveType = "currency";
      } else if (dictMatch.suggestedType === "datetime") {
        effectiveType = "datetime";
      } else if (dictMatch.suggestedType === "categorical") {
        effectiveType = "categorical";
      }
      confidenceScore = Math.max(confidenceScore, dictMatch.confidence);
    }

    // Compute column stats
    const stats: ColumnStats = {
      totalNulls,
    };

    if (effectiveType === "numeric" || effectiveType === "currency") {
      const numbers = nonNullValues
        .map((v) => {
          if (typeof v === "number") return v;
          const cleaned = String(v).replace(/^(rp|idr|\$)\s*/i, "").replace(/,/g, "");
          return parseFloat(cleaned);
        })
        .filter((n) => !isNaN(n));

      if (numbers.length > 0) {
        stats.min = Math.min(...numbers);
        stats.max = Math.max(...numbers);
        stats.sum = numbers.reduce((acc, curr) => acc + curr, 0);
        stats.avg = stats.sum / numbers.length;
      }
    } else if (effectiveType === "datetime") {
      const dates = nonNullValues
        .map((v) => parseFlexibleDate(v))
        .filter((d): d is Date => d !== null);

      if (dates.length > 0) {
        const timestamps = dates.map((d) => d.getTime());
        stats.minDate = new Date(Math.min(...timestamps)).toISOString();
        stats.maxDate = new Date(Math.max(...timestamps)).toISOString();
      }
    } else if (effectiveType === "categorical") {
      stats.uniqueCategories = Array.from(uniqueSet).slice(0, 10);
    }

    // Extract sample non-null values
    const sampleValues = Array.from(new Set(nonNullValues)).slice(0, 4) as (string | number | boolean | null)[];

    columns[header] = {
      name: header,
      inferredType: typeDetection.inferredType,
      effectiveType,
      semanticRole: dictMatch.role,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      cardinality,
      nullableRatio: Math.round(nullableRatio * 100) / 100,
      sampleValues,
      stats,
    };
  }

  // Two-pass primary dimension selection
  // 1. Primary Date: must be datetime and not identifier
  for (const header of headers) {
    const col = columns[header];
    if (!col) continue;

    if (col.effectiveType === "datetime" && col.semanticRole !== "identifier" && !/^(id_|no_|kode_|trx_)/i.test(header) && !primaryDateColumn) {
      primaryDateColumn = header;
    }
  }

  // 2. Primary Category: prioritize product_category, payment_method, or categorical columns with clean cardinality
  for (const header of headers) {
    const col = columns[header];
    if (!col) continue;

    if (col.semanticRole === "product_category" && !primaryCategoryColumn) {
      primaryCategoryColumn = header;
    } else if (col.semanticRole === "payment_method" && !primaryCategoryColumn) {
      primaryCategoryColumn = header;
    } else if (col.effectiveType === "categorical" && col.cardinality >= 2 && col.cardinality <= 30 && !primaryCategoryColumn) {
      primaryCategoryColumn = header;
    }
  }

  // 3. Primary Numeric: match quantity_sold or revenue in header order
  for (const header of headers) {
    const col = columns[header];
    if (!col) continue;

    if ((col.semanticRole === "quantity_sold" || col.semanticRole === "revenue") && !primaryNumericColumn) {
      primaryNumericColumn = header;
    }
  }

  // Fallback for primary numeric
  if (!primaryNumericColumn) {
    for (const header of headers) {
      const col = columns[header];
      if (col && (col.effectiveType === "numeric" || col.effectiveType === "currency")) {
        primaryNumericColumn = header;
        break;
      }
    }
  }

  return {
    datasetId: id,
    columns,
    primaryDateColumn,
    primaryCategoryColumn,
    primaryNumericColumn,
    createdAt: new Date().toISOString(),
  };
}
