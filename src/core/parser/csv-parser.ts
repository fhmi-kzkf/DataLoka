import Papa from "papaparse";
import type { DatasetSchema, DatasetRow, ParseProgressEvent } from "@/types/dataset";
import { sanitizeAndEngineerDataset } from "@/core/quality/data-sanitizer";

export interface ParseCsvOptions {
  name?: string;
  fileSizeBytes?: number;
  sourceType?: "file" | "clipboard";
  onProgress?: (progress: ParseProgressEvent) => void;
}

export function cleanHeaderName(header: string, index: number): string {
  const trimmed = header ? header.trim() : "";
  if (!trimmed) {
    return `Kolom_${index + 1}`;
  }
  // Sanitize formula injection prefixes
  return trimmed.replace(/^[=\-+@]/, "");
}

export function parseCsvContent(
  csvText: string,
  options: ParseCsvOptions = {}
): Promise<DatasetSchema> {
  return new Promise((resolve, reject) => {
    const {
      name = "dataset.csv",
      fileSizeBytes = new Blob([csvText]).size,
      sourceType = "file",
      onProgress,
    } = options;

    if (!csvText || !csvText.trim()) {
      return reject(new Error("File CSV tidak memiliki baris data"));
    }

    onProgress?.({
      percentage: 20,
      stage: "reading",
      message: "Membaca struktur baris CSV...",
    });

    Papa.parse<DatasetRow>(csvText, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: true,
      transformHeader: (header, index) => cleanHeaderName(header, index),
      complete: (results) => {
        onProgress?.({
          percentage: 80,
          stage: "structuring",
          message: "Menyusun skema data...",
        });

        if (results.errors.length > 0 && results.data.length === 0) {
          return reject(
            new Error(`Gagal memproses CSV: ${results.errors[0]?.message || "Format tidak valid"}`)
          );
        }

        const rawRows = results.data;
        if (!rawRows || rawRows.length === 0) {
          return reject(new Error("File CSV tidak memiliki baris data"));
        }

        const headers = results.meta.fields || Object.keys(rawRows[0] || {});
        if (headers.length === 0) {
          return reject(new Error("File CSV tidak memiliki kolom header"));
        }

        // Filter completely empty rows
        const validRows = rawRows.filter((row) =>
          Object.values(row).some((val) => val !== null && val !== undefined && val !== "")
        );

        if (validRows.length === 0) {
          return reject(new Error("File CSV hanya berisi baris kosong"));
        }

        const rawDataset: DatasetSchema = {
          id: `ds_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name,
          sourceType,
          headers,
          rows: validRows,
          rowCount: validRows.length,
          columnCount: headers.length,
          fileSizeBytes,
          sampleRows: validRows.slice(0, 5),
          createdAt: new Date().toISOString(),
        };

        const engineeredDataset = sanitizeAndEngineerDataset(rawDataset);

        onProgress?.({
          percentage: 100,
          stage: "completed",
          message: "Parsing CSV selesai",
        });

        resolve(engineeredDataset);
      },
      error: (error: Error) => {
        reject(new Error(`Kesalahan saat memproses CSV: ${error.message}`));
      },
    });
  });
}
