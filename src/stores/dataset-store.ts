import { create } from "zustand";
import type { DatasetSchema, ParseProgressEvent, ParseStage } from "@/types/dataset";
import { parseFile } from "@/core/parser/file-parser";
import { fetchAndParseGoogleSheet } from "@/core/parser/gsheet-parser";
import { parseClipboardText } from "@/core/parser/clipboard-parser";

export type IngestTab = "upload" | "gsheet" | "clipboard";

export interface DatasetState {
  dataset: DatasetSchema | null;
  rawFile: File | null;
  isIngesting: boolean;
  progress: number;
  progressStage: ParseStage;
  progressMessage: string;
  error: string | null;
  activeTab: IngestTab;

  setDataset: (dataset: DatasetSchema | null) => void;
  setActiveTab: (tab: IngestTab) => void;
  ingestFile: (file: File) => Promise<DatasetSchema>;
  ingestGoogleSheet: (url: string) => Promise<DatasetSchema>;
  ingestClipboard: (text: string) => Promise<DatasetSchema>;
  switchSheet: (sheetName: string) => Promise<void>;
  reset: () => void;
}

export const useDatasetStore = create<DatasetState>((set, get) => ({
  dataset: null,
  rawFile: null,
  isIngesting: false,
  progress: 0,
  progressStage: "completed",
  progressMessage: "",
  error: null,
  activeTab: "upload",

  setDataset: (dataset) => set({ dataset }),

  setActiveTab: (activeTab) => set({ activeTab, error: null }),

  ingestFile: async (file: File) => {
    set({
      isIngesting: true,
      rawFile: file,
      progress: 0,
      progressStage: "reading",
      progressMessage: "Memulai membaca berkas...",
      error: null,
    });

    const onProgress = (event: ParseProgressEvent) => {
      set({
        progress: event.percentage,
        progressStage: event.stage,
        progressMessage: event.message,
      });
    };

    try {
      const dataset = await parseFile(file, { onProgress });
      set({
        dataset,
        isIngesting: false,
        progress: 100,
        progressStage: "completed",
        progressMessage: "Dataset siap diproses",
      });
      return dataset;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal memproses berkas";
      set({
        isIngesting: false,
        error: errorMessage,
        progress: 0,
      });
      throw err;
    }
  },

  ingestGoogleSheet: async (url: string) => {
    set({
      isIngesting: true,
      progress: 0,
      progressStage: "reading",
      progressMessage: "Menghubungkan ke Google Sheets...",
      error: null,
    });

    const onProgress = (event: ParseProgressEvent) => {
      set({
        progress: event.percentage,
        progressStage: event.stage,
        progressMessage: event.message,
      });
    };

    try {
      const dataset = await fetchAndParseGoogleSheet(url, { onProgress });
      set({
        dataset,
        isIngesting: false,
        progress: 100,
        progressStage: "completed",
        progressMessage: "Google Sheets berhasil dimuat",
      });
      return dataset;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal memuat Google Sheets";
      set({
        isIngesting: false,
        error: errorMessage,
        progress: 0,
      });
      throw err;
    }
  },

  ingestClipboard: async (text: string) => {
    set({
      isIngesting: true,
      progress: 0,
      progressStage: "reading",
      progressMessage: "Membaca teks dari clipboard...",
      error: null,
    });

    const onProgress = (event: ParseProgressEvent) => {
      set({
        progress: event.percentage,
        progressStage: event.stage,
        progressMessage: event.message,
      });
    };

    try {
      const dataset = await parseClipboardText(text, { onProgress });
      set({
        dataset,
        isIngesting: false,
        progress: 100,
        progressStage: "completed",
        progressMessage: "Data clipboard berhasil dimuat",
      });
      return dataset;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal membaca format clipboard";
      set({
        isIngesting: false,
        error: errorMessage,
        progress: 0,
      });
      throw err;
    }
  },

  switchSheet: async (sheetName: string) => {
    const { rawFile } = get();
    if (!rawFile) return;

    set({
      isIngesting: true,
      progress: 0,
      progressStage: "parsing",
      progressMessage: `Memuat lembar kerja ${sheetName}...`,
      error: null,
    });

    try {
      const dataset = await parseFile(rawFile, {
        sheetName,
        onProgress: (event) => {
          set({
            progress: event.percentage,
            progressStage: event.stage,
            progressMessage: event.message,
          });
        },
      });
      set({
        dataset,
        isIngesting: false,
        progress: 100,
        progressStage: "completed",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal beralih sheet";
      set({
        isIngesting: false,
        error: message,
      });
    }
  },

  reset: () =>
    set({
      dataset: null,
      rawFile: null,
      isIngesting: false,
      progress: 0,
      progressStage: "completed",
      progressMessage: "",
      error: null,
    }),
}));
