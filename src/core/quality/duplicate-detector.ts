import type { DatasetRow } from "@/types/dataset";
import type { DuplicateIssue } from "@/types/quality";

export function detectDuplicateRows(rows: DatasetRow[]): DuplicateIssue | null {
  if (!rows || rows.length <= 1) return null;

  const seenHashes = new Map<string, number>();
  const duplicateIndices: number[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // Hash based on canonical serialized keys
    const sortedKeys = Object.keys(row).sort();
    const hash = sortedKeys.map((k) => `${k}:${String(row[k] ?? "")}`).join("|");

    if (seenHashes.has(hash)) {
      duplicateIndices.push(i);
    } else {
      seenHashes.set(hash, i);
    }
  }

  if (duplicateIndices.length === 0) {
    return null;
  }

  const affectedPercentage = Math.round((duplicateIndices.length / rows.length) * 100);

  return {
    type: "duplicate_rows",
    severity: duplicateIndices.length > 5 ? "warning" : "info",
    title: `Ditemukan ${duplicateIndices.length} baris data duplikat`,
    duplicateCount: duplicateIndices.length,
    duplicateIndices,
    affectedPercentage,
  };
}
