import { parseCsvContent } from "./csv-parser";
import type { DatasetSchema, ParseProgressEvent } from "@/types/dataset";

export async function parseClipboardText(
  rawText: string,
  options: { name?: string; onProgress?: (progress: ParseProgressEvent) => void } = {}
): Promise<DatasetSchema> {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error("Clipboard kosong atau tidak memiliki teks yang valid");
  }

  // Check if text has multiple lines or delimiter
  const lines = trimmed.split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error("Data clipboard harus memiliki minimal 1 baris header dan 1 baris data");
  }

  return parseCsvContent(trimmed, {
    name: options.name || `Tabel_Clipboard_${new Date().toLocaleTimeString("id-ID").replace(/:/g, "-")}`,
    sourceType: "clipboard",
    onProgress: options.onProgress,
  });
}
