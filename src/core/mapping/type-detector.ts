import type { DataType } from "@/types/mapping";
import { isDateLike } from "./date-normalizer";

export function isNumericString(val: unknown): boolean {
  if (typeof val === "number") return !isNaN(val);
  if (typeof val !== "string") return false;
  const str = val.trim();
  if (!str) return false;
  // Strip currency symbols and whitespace
  const cleaned = str.replace(/^(rp|idr|\$)\s*/i, "").replace(/,/g, "");
  return !isNaN(Number(cleaned)) && !isNaN(parseFloat(cleaned));
}

export function isCurrencyString(val: unknown): boolean {
  if (typeof val !== "string") return false;
  const str = val.trim();
  return /^(rp|idr|\$|€|£)\s*[\d.,]+/i.test(str) || /[\d.,]+\s*(idr|rupiah)$/i.test(str);
}

export function isPercentageString(val: unknown): boolean {
  if (typeof val !== "string") return false;
  return /^\s*-?\d+([.,]\d+)?\s*%\s*$/.test(val);
}

export function isBooleanLike(val: unknown): boolean {
  if (typeof val === "boolean") return true;
  if (typeof val !== "string") return false;
  const str = val.trim().toLowerCase();
  return ["true", "false", "ya", "tidak", "yes", "no", "lunas", "belum"].includes(str);
}

export interface TypeDetectionResult {
  inferredType: DataType;
  confidence: number;
}

export function inferColumnType(
  values: unknown[],
  headerName: string = ""
): TypeDetectionResult {
  const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonNullValues.length === 0) {
    return { inferredType: "text", confidence: 0.3 };
  }

  const sampleSize = Math.min(nonNullValues.length, 100);
  const sample = nonNullValues.slice(0, sampleSize);

  let dateMatches = 0;
  let numericMatches = 0;
  let currencyMatches = 0;
  let percentageMatches = 0;
  let booleanMatches = 0;

  for (const val of sample) {
    if (isCurrencyString(val)) {
      currencyMatches++;
    } else if (isPercentageString(val)) {
      percentageMatches++;
    } else if (isBooleanLike(val)) {
      booleanMatches++;
    } else if (typeof val === "number" || isNumericString(val)) {
      numericMatches++;
    } else if (isDateLike(val)) {
      dateMatches++;
    }
  }

  const ratio = (count: number) => count / sampleSize;

  // High confidence thresholds (>= 75% of sample rows match)
  if (ratio(currencyMatches) >= 0.7) {
    return { inferredType: "currency", confidence: 0.95 };
  }

  if (ratio(percentageMatches) >= 0.7) {
    return { inferredType: "percentage", confidence: 0.95 };
  }

  if (ratio(dateMatches) >= 0.7) {
    return { inferredType: "datetime", confidence: 0.95 };
  }

  if (ratio(booleanMatches) >= 0.8) {
    return { inferredType: "boolean", confidence: 0.9 };
  }

  if (ratio(numericMatches) >= 0.8) {
    // Check if header name implies currency
    if (/harga|omset|pendapatan|ongkir|biaya|total|diskon|tarif|nominal/i.test(headerName)) {
      return { inferredType: "currency", confidence: 0.9 };
    }
    return { inferredType: "numeric", confidence: 0.92 };
  }

  // Check geolocation by header name
  if (/^(kota|provinsi|kabupaten|negara|latitude|longitude|lat|lng|wilayah)/i.test(headerName)) {
    return { inferredType: "geolocation", confidence: 0.85 };
  }

  // Cardinality check for Categorical vs Text
  const uniqueSet = new Set(nonNullValues.map(String));
  const cardinality = uniqueSet.size;
  const cardinalityRatio = cardinality / nonNullValues.length;

  if (cardinality <= 25 || cardinalityRatio < 0.2) {
    return { inferredType: "categorical", confidence: 0.85 };
  }

  return { inferredType: "text", confidence: 0.8 };
}
