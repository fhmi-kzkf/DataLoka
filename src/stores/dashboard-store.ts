import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChartRecommendation, ChartType } from "@/types/chart";
import type { DatasetMapping } from "@/types/mapping";
import type { DashboardAccentCard, DashboardState, TemplateId } from "@/types/template";
import { getBestTemplate } from "@/core/template/template-matcher";

const DEFAULT_ACCENT_CARDS: Record<TemplateId, DashboardAccentCard> = {
  ecommerce: {
    title: "Editorial Snapshot",
    quote: "Kategori produk teratas mendominasi lebih dari separuh total omset dengan frekuensi transaksi yang stabil.",
    author: "DataLoka Intelligence",
    role: "Retail & Commerce Heuristic",
  },
  sales: {
    title: "Executive Synthesis",
    quote: "Pipeline konversi bergerak dinamis didorong oleh peningkatan nilai kesepakatan pada akun bernilai tinggi.",
    author: "DataLoka Intelligence",
    role: "B2B Sales Heuristic",
  },
  finance: {
    title: "Fiscal Overview",
    quote: "Struktur margin operasional dan arus kas berada pada lintasan sehat menuju target pertumbuhan berkelanjutan.",
    author: "DataLoka Intelligence",
    role: "Financial Heuristic",
  },
  marketing: {
    title: "Growth Takeaway",
    quote: "Efisiensi akuisisi channel berbayar menghasilkan ROAS yang konsisten dengan volume akuisisi terakselerasi.",
    author: "DataLoka Intelligence",
    role: "Marketing Heuristic",
  },
  operational: {
    title: "Operational Brief",
    quote: "Tingkat pemenuhan SLA dan kecepatan pengiriman terjaga pada efisiensi optimal tanpa hambatan distribusi.",
    author: "DataLoka Intelligence",
    role: "Operations Heuristic",
  },
  hr: {
    title: "People & Culture",
    quote: "Sebaran headcount dan retensi karyawan kunci mencerminkan stabilitas organisasi di seluruh divisi.",
    author: "DataLoka Intelligence",
    role: "HR Analytics Heuristic",
  },
  survey: {
    title: "Voice of User",
    quote: "Mayoritas responden memberikan respons positif dengan indeks kepuasan yang mengungguli kuartal sebelumnya.",
    author: "DataLoka Intelligence",
    role: "Customer Sentiment Heuristic",
  },
  general: {
    title: "Editorial Summary",
    quote: "Indikator kunci menunjukkan lintasan positif dengan pola sebaran data yang terdistribusi secara seimbang.",
    author: "DataLoka Intelligence",
    role: "General Analytics Heuristic",
  },
};

export type DateFilterPreset = "all" | "7d" | "30d" | "this_month" | "custom";

export interface CustomDateRange {
  startDate: string;
  endDate: string;
}

interface DashboardStoreState {
  dashboard: DashboardState | null;
  activeTemplateId: TemplateId;
  globalCategoryFilter: string | null;
  searchFilter: string;
  datePreset: DateFilterPreset;
  customDateRange: CustomDateRange | null;
  isEditingLayout: boolean;

  // Actions
  initializeFromEngine: (
    datasetId: string,
    title: string,
    subtitle: string,
    kpis: ChartRecommendation[],
    mainCharts: ChartRecommendation[],
    columnNames: string[],
    mapping?: DatasetMapping | null,
    forcedTemplateId?: TemplateId
  ) => void;
  setTemplate: (templateId: TemplateId) => void;
  setGlobalCategoryFilter: (cat: string | null) => void;
  setSearchFilter: (query: string) => void;
  setDatePreset: (preset: DateFilterPreset) => void;
  setCustomDateRange: (range: CustomDateRange | null) => void;
  reorderKpis: (sourceIdx: number, targetIdx: number) => void;
  reorderMainCharts: (sourceIdx: number, targetIdx: number) => void;
  changeChartType: (chartId: string, newType: ChartType) => void;
  addChart: (chart: ChartRecommendation) => void;
  setAccentCard: (accent: DashboardAccentCard) => void;
  toggleEditLayout: () => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardStoreState>()(
  persist(
    (set) => ({
      dashboard: null,
      activeTemplateId: "general",
      globalCategoryFilter: null,
      searchFilter: "",
      datePreset: "all",
      customDateRange: null,
      isEditingLayout: false,

  initializeFromEngine: (
    datasetId,
    title,
    subtitle,
    kpis,
    mainCharts,
    columnNames,
    mapping,
    forcedTemplateId
  ) => {
    const templateId = forcedTemplateId || getBestTemplate(columnNames, mapping);
    const accent = DEFAULT_ACCENT_CARDS[templateId] || DEFAULT_ACCENT_CARDS.general;

    const newDashboard: DashboardState = {
      id: `dash_${Date.now()}`,
      title: title || "Executive Editorial Overview",
      subtitle: subtitle || "Ringkasan performa dan sintesis analitik terstruktur",
      datasetId,
      templateId,
      kpiCards: [...kpis],
      mainCharts: [...mainCharts],
      accentCard: accent,
      selectedCategoryFilter: undefined,
      searchFilter: "",
      createdAt: new Date().toISOString(),
    };

    set({
      dashboard: newDashboard,
      activeTemplateId: templateId,
      globalCategoryFilter: null,
      searchFilter: "",
    });
  },

  setTemplate: (templateId: TemplateId) => {
    set((state) => {
      if (!state.dashboard) return { activeTemplateId: templateId };
      const accent = DEFAULT_ACCENT_CARDS[templateId] || DEFAULT_ACCENT_CARDS.general;
      return {
        activeTemplateId: templateId,
        dashboard: {
          ...state.dashboard,
          templateId,
          accentCard: accent,
        },
      };
    });
  },

  setGlobalCategoryFilter: (cat: string | null) => {
    set((state) => {
      if (!state.dashboard) return { globalCategoryFilter: cat };
      return {
        globalCategoryFilter: cat,
        dashboard: {
          ...state.dashboard,
          selectedCategoryFilter: cat ?? undefined,
        },
      };
    });
  },

  setSearchFilter: (query: string) => {
    set((state) => {
      if (!state.dashboard) return { searchFilter: query };
      return {
        searchFilter: query,
        dashboard: {
          ...state.dashboard,
          searchFilter: query,
        },
      };
    });
  },

  setDatePreset: (preset: DateFilterPreset) => {
    set({ datePreset: preset });
  },

  setCustomDateRange: (range: CustomDateRange | null) => {
    set({ customDateRange: range });
  },

  reorderKpis: (sourceIdx: number, targetIdx: number) => {
    set((state) => {
      if (!state.dashboard) return state;
      const kpis = [...state.dashboard.kpiCards];
      if (sourceIdx < 0 || sourceIdx >= kpis.length || targetIdx < 0 || targetIdx >= kpis.length) {
        return state;
      }
      const [removed] = kpis.splice(sourceIdx, 1);
      kpis.splice(targetIdx, 0, removed);
      return {
        dashboard: {
          ...state.dashboard,
          kpiCards: kpis,
        },
      };
    });
  },

  reorderMainCharts: (sourceIdx: number, targetIdx: number) => {
    set((state) => {
      if (!state.dashboard) return state;
      const charts = [...state.dashboard.mainCharts];
      if (sourceIdx < 0 || sourceIdx >= charts.length || targetIdx < 0 || targetIdx >= charts.length) {
        return state;
      }
      const [removed] = charts.splice(sourceIdx, 1);
      charts.splice(targetIdx, 0, removed);
      return {
        dashboard: {
          ...state.dashboard,
          mainCharts: charts,
        },
      };
    });
  },

  changeChartType: (chartId: string, newType: ChartType) => {
    set((state) => {
      if (!state.dashboard) return state;
      const updatedMain = state.dashboard.mainCharts.map((ch) =>
        ch.id === chartId ? { ...ch, chartType: newType } : ch
      );
      return {
        dashboard: {
          ...state.dashboard,
          mainCharts: updatedMain,
        },
      };
    });
  },

  addChart: (chart: ChartRecommendation) => {
    set((state) => {
      if (!state.dashboard) return state;
      const chartWithId: ChartRecommendation = {
        ...chart,
        id: chart.id || `pinned_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderIndex: state.dashboard.mainCharts.length,
      };
      return {
        dashboard: {
          ...state.dashboard,
          mainCharts: [...state.dashboard.mainCharts, chartWithId],
        },
      };
    });
  },

  setAccentCard: (accent: DashboardAccentCard) => {
    set((state) => {
      if (!state.dashboard) return state;
      return {
        dashboard: {
          ...state.dashboard,
          accentCard: accent,
        },
      };
    });
  },

  toggleEditLayout: () => {
    set((state) => ({ isEditingLayout: !state.isEditingLayout }));
  },

    reset: () => {
      set({
        dashboard: null,
        activeTemplateId: "general",
        globalCategoryFilter: null,
        searchFilter: "",
        datePreset: "all",
        customDateRange: null,
        isEditingLayout: false,
      });
    },
    }),
    {
      name: "dataloka_dashboard_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dashboard: state.dashboard,
        activeTemplateId: state.activeTemplateId,
        globalCategoryFilter: state.globalCategoryFilter,
        searchFilter: state.searchFilter,
        datePreset: state.datePreset,
        customDateRange: state.customDateRange,
      }),
    }
  )
);
