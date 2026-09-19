import * as XLSX from "xlsx";
import type { DatasetSchema, DatasetRow, DatasetValue, ParseProgressEvent } from "@/types/dataset";
import { cleanHeaderName } from "./csv-parser";

export interface ParseExcelOptions {
  name?: string;
  fileSizeBytes?: number;
  sheetIndex?: number;
  sheetName?: string;
  onProgress?: (progress: ParseProgressEvent) => void;
}

export async function parseExcelArrayBuffer(
  buffer: ArrayBuffer,
  options: ParseExcelOptions = {}
): Promise<DatasetSchema> {
  const {
    name = "dataset.xlsx",
    fileSizeBytes = buffer.byteLength,
    sheetIndex = 0,
    sheetName,
    onProgress,
  } = options;

  onProgress?.({
    percentage: 15,
    stage: "reading",
    message: "Membaca workbook Excel...",
  });

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    cellNF: false,
    cellText: false,
  });

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error("Workbook Excel tidak memiliki sheet yang dapat dibaca");
  }

  onProgress?.({
    percentage: 50,
    stage: "parsing",
    message: "Memproses lembar kerja terpilih...",
  });

  const targetSheetName = sheetName && sheetNames.includes(sheetName)
    ? sheetName
    : sheetNames[sheetIndex] || sheetNames[0];

  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${targetSheetName}" tidak ditemukan`);
  }

  // Convert to JSON with headers
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
    blankrows: false,
    raw: true,
  });

  if (!rawData || rawData.length === 0) {
    throw new Error("Sheet Excel kosong");
  }

  // First row is header
  const rawHeaders = rawData[0] || [];
  const headers = rawHeaders.map((h: unknown, idx: number) =>
    cleanHeaderName(h !== null && h !== undefined ? String(h) : "", idx)
  );

  if (headers.length === 0) {
    throw new Error("Header kolom tidak ditemukan dalam sheet Excel");
  }

  onProgress?.({
    percentage: 80,
    stage: "structuring",
    message: "Menyusun skema baris...",
  });

  const dataRows = rawData.slice(1);
  const rows: DatasetRow[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const rawRow = dataRows[i];
    if (!rawRow || rawRow.length === 0) continue;

    const rowObj: DatasetRow = {};
    let hasAnyValue = false;

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const val = rawRow[j] as DatasetValue;
      if (val !== undefined && val !== null && val !== "") {
        hasAnyValue = true;
      }
      rowObj[header] = val ?? null;
    }

    if (hasAnyValue) {
      rows.push(rowObj);
    }
  }

  if (rows.length === 0) {
    throw new Error("Sheet Excel tidak memiliki baris data setelah header");
  }

  onProgress?.({
    percentage: 100,
    stage: "completed",
    message: "Parsing Excel selesai",
  });

  return {
    id: `ds_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    sourceType: "file",
    headers,
    rows,
    rowCount: rows.length,
    columnCount: headers.length,
    fileSizeBytes,
    sheetNames,
    activeSheet: targetSheetName,
    sampleRows: rows.slice(0, 5),
    createdAt: new Date().toISOString(),
  };
}
