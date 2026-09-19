import { create } from "zustand";
import type { ChartRecommendation } from "@/types/chart";
import type { DashboardState } from "@/types/template";
import type { EditorialInsight } from "@/types/insight";
import { generateEditorialInsights } from "@/core/insight/insight-generator";
import { createSharePayload, encodeShareToken, generateShareUrl } from "@/core/share/share-manager";

export interface InsightStoreState {
  insights: EditorialInsight[];
  isGenerating: boolean;
  isExportModalOpen: boolean;
  isShareModalOpen: boolean;
  shareUrl: string;

  generateInsights: (kpis: ChartRecommendation[], charts: ChartRecommendation[]) => EditorialInsight[];
  openExportModal: () => void;
  closeExportModal: () => void;
  openShareModal: (dashboard: DashboardState, datasetName?: string) => string;
  closeShareModal: () => void;
  reset: () => void;
}

export const useInsightStore = create<InsightStoreState>((set) => ({
  insights: [],
  isGenerating: false,
  isExportModalOpen: false,
  isShareModalOpen: false,
  shareUrl: "",

  generateInsights: (kpis, charts) => {
    set({ isGenerating: true });
    const generated = generateEditorialInsights(kpis, charts);
    set({ insights: generated, isGenerating: false });
    return generated;
  },

  openExportModal: () => set({ isExportModalOpen: true }),
  closeExportModal: () => set({ isExportModalOpen: false }),

  openShareModal: (dashboard, datasetName) => {
    const payload = createSharePayload(dashboard, datasetName);
    const token = encodeShareToken(payload);
    const url = generateShareUrl(token);
    set({ isShareModalOpen: true, shareUrl: url });
    return url;
  },

  closeShareModal: () => set({ isShareModalOpen: false }),

  reset: () =>
    set({
      insights: [],
      isGenerating: false,
      isExportModalOpen: false,
      isShareModalOpen: false,
      shareUrl: "",
    }),
}));
