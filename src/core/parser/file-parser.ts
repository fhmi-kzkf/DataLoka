import { parseCsvContent } from "./csv-parser";
import { parseExcelArrayBuffer } from "./excel-parser";
import type { DatasetSchema, ParseProgressEvent } from "@/types/dataset";

export const MAX_CLIENT_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const SUPPORTED_EXTENSIONS = [".csv", ".tsv", ".xlsx", ".xls", ".ods"];

export async function parseFile(
  file: File,
  options: {
    sheetName?: string;
    onProgress?: (progress: ParseProgressEvent) => void;
  } = {}
): Promise<DatasetSchema> {
  if (!file) {
    throw new Error("Berkas tidak ditemukan");
  }

  if (file.size > MAX_CLIENT_FILE_SIZE_BYTES) {
    throw new Error(
      `Ukuran berkas (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas pemrosesan lokal 25 MB.`
    );
  }

  const fileName = file.name;
  const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `Format berkas "${extension}" tidak didukung. Format yang didukung: ${SUPPORTED_EXTENSIONS.join(", ")}`
    );
  }

  options.onProgress?.({
    percentage: 10,
    stage: "reading",
    message: `Membaca berkas ${fileName}...`,
  });

  if (extension === ".csv" || extension === ".tsv") {
    const text = await file.text();
    return parseCsvContent(text, {
      name: fileName,
      fileSizeBytes: file.size,
      sourceType: "file",
      onProgress: options.onProgress,
    });
  }

  if (extension === ".xlsx" || extension === ".xls" || extension === ".ods") {
    const buffer = await file.arrayBuffer();
    return parseExcelArrayBuffer(buffer, {
      name: fileName,
      fileSizeBytes: file.size,
      sheetName: options.sheetName,
      onProgress: options.onProgress,
    });
  }

  throw new Error(`Format ${extension} tidak dapat diproses`);
}
