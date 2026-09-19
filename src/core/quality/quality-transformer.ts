import type { DatasetRow, DatasetValue } from "@/types/dataset";
import type { AuditLogEntry, ImputationStrategy } from "@/types/quality";

export interface TransformResult {
  newRows: DatasetRow[];
  auditLog: AuditLogEntry;
}

export function applyRemoveDuplicates(
  rows: DatasetRow[],
  duplicateIndices: number[]
): TransformResult {
  const duplicateSet = new Set(duplicateIndices);
  const newRows = rows.filter((_, idx) => !duplicateSet.has(idx));

  const auditLog: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString("id-ID"),
    action: "Hapus Duplikat",
    details: `Menghapus ${duplicateIndices.length} baris data yang identik secara otomatis.`,
    rowsAffected: duplicateIndices.length,
    previousRowsSnapshot: rows,
  };

  return { newRows, auditLog };
}

export function applyMissingValueFix(
  rows: DatasetRow[],
  column: string,
  strategy: ImputationStrategy,
  customValue?: DatasetValue
): TransformResult {
  let rowsAffected = 0;
  let newRows: DatasetRow[] = [];

  if (strategy === "drop_rows") {
    newRows = rows.filter((r) => {
      const val = r[column];
      const isMissing = val === null || val === undefined || val === "" || (typeof val === "number" && isNaN(val));
      if (isMissing) rowsAffected++;
      return !isMissing;
    });

    const auditLog: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString("id-ID"),
      action: "Hapus Baris Kosong",
      details: `Menghapus ${rowsAffected} baris dengan nilai kosong pada kolom "${column}".`,
      columnAffected: column,
      rowsAffected,
      previousRowsSnapshot: rows,
    };

    return { newRows, auditLog };
  }

  // Imputation replacement
  newRows = rows.map((r) => {
    const val = r[column];
    const isMissing = val === null || val === undefined || val === "" || (typeof val === "number" && isNaN(val));
    if (isMissing) {
      rowsAffected++;
      return { ...r, [column]: customValue ?? null };
    }
    return r;
  });

  const strategyLabels: Record<ImputationStrategy, string> = {
    fill_mean: `Imputasi Rata-rata (${customValue})`,
    fill_median: `Imputasi Nilai Tengah / Median (${customValue})`,
    fill_mode: `Imputasi Nilai Terbanyak / Mode (${customValue})`,
    fill_constant: `Imputasi Nilai Konstan (${customValue})`,
    drop_rows: "Hapus Baris",
  };

  const auditLog: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString("id-ID"),
    action: strategyLabels[strategy] || "Imputasi Nilai Kosong",
    details: `Mengisi ${rowsAffected} baris kosong pada kolom "${column}" dengan nilai ${customValue}.`,
    columnAffected: column,
    rowsAffected,
    previousRowsSnapshot: rows,
  };

  return { newRows, auditLog };
}

export function applyUnifyCategories(
  rows: DatasetRow[],
  column: string,
  canonical: string,
  variants: string[]
): TransformResult {
  const variantSet = new Set(variants.map((v) => v.trim().toLowerCase()));
  let rowsAffected = 0;

  const newRows = rows.map((r) => {
    const val = r[column];
    if (val !== null && val !== undefined) {
      const str = String(val).trim().toLowerCase();
      if (variantSet.has(str) && String(val) !== canonical) {
        rowsAffected++;
        return { ...r, [column]: canonical };
      }
    }
    return r;
  });

  const auditLog: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString("id-ID"),
    action: "Unifikasi Kategori",
    details: `Menyatukan variasi penulisan [${variants.join(", ")}] menjadi "${canonical}" pada ${rowsAffected} baris.`,
    columnAffected: column,
    rowsAffected,
    previousRowsSnapshot: rows,
  };

  return { newRows, auditLog };
}

export function applyClipOutliers(
  rows: DatasetRow[],
  column: string,
  lowerBound: number,
  upperBound: number
): TransformResult {
  let rowsAffected = 0;

  const newRows = rows.map((r) => {
    const val = r[column];
    if (val !== null && val !== undefined && typeof val === "number") {
      if (val < lowerBound) {
        rowsAffected++;
        return { ...r, [column]: lowerBound };
      }
      if (val > upperBound) {
        rowsAffected++;
        return { ...r, [column]: upperBound };
      }
    }
    return r;
  });

  const auditLog: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString("id-ID"),
    action: "Batas Outlier (Clipping)",
    details: `Membatasi ${rowsAffected} nilai pencilan pada rentang [${lowerBound} - ${upperBound}] pada kolom "${column}".`,
    columnAffected: column,
    rowsAffected,
    previousRowsSnapshot: rows,
  };

  return { newRows, auditLog };
}
