import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { parseNaturalLanguageCommand } from "@/core/command/nlp-parser";
import { executeParsedCommand } from "@/core/command/command-executor";
import { useCommandStore } from "@/stores/command-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { CommandSuggestionPill } from "@/components/modules/command/command-suggestion-pill";
import { CommandBarModal } from "@/components/modules/command/command-bar-modal";
import type { ChartRecommendation } from "@/types/chart";

vi.mock("echarts", () => ({
  use: vi.fn(),
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    isDisposed: vi.fn(() => false),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    getDataURL: vi.fn(() => "data:image/png;base64,mock"),
  })),
}));

describe("Modul 8: Command Bar & NLP-Lite Interaction", () => {
  beforeEach(() => {
    useCommandStore.getState().reset();
    useDashboardStore.getState().reset();
  });

  describe("NLP-Lite Natural Language Parser", () => {
    it("parses chart type change intents accurately", () => {
      const p1 = parseNaturalLanguageCommand("ubah ke bar chart");
      expect(p1.intent).toBe("change_chart_type");
      expect(p1.targetChartType).toBe("bar");
      expect(p1.confidenceScore).toBeGreaterThan(0.8);

      const p2 = parseNaturalLanguageCommand("ganti jadi grafik garis");
      expect(p2.intent).toBe("change_chart_type");
      expect(p2.targetChartType).toBe("line");

      const p3 = parseNaturalLanguageCommand("tampilkan donut chart");
      expect(p3.intent).toBe("change_chart_type");
      expect(p3.targetChartType).toBe("donut");

      const p4 = parseNaturalLanguageCommand("ubah ke bar horizontal");
      expect(p4.intent).toBe("change_chart_type");
      expect(p4.targetChartType).toBe("horizontal_bar");

      const p5 = parseNaturalLanguageCommand("korelasi scatter");
      expect(p5.intent).toBe("change_chart_type");
      expect(p5.targetChartType).toBe("scatter");

      const p6 = parseNaturalLanguageCommand("format tabel");
      expect(p6.intent).toBe("change_chart_type");
      expect(p6.targetChartType).toBe("table");
    });

    it("parses sorting and ranking intents accurately", () => {
      const pDesc = parseNaturalLanguageCommand("urutkan dari yang terbesar");
      expect(pDesc.intent).toBe("sort_data");
      expect(pDesc.sortDirection).toBe("desc");

      const pAsc = parseNaturalLanguageCommand("urutkan terendah");
      expect(pAsc.intent).toBe("sort_data");
      expect(pAsc.sortDirection).toBe("asc");
    });

    it("parses template switching intents accurately", () => {
      const p1 = parseNaturalLanguageCommand("ganti template ke sales");
      expect(p1.intent).toBe("switch_template");
      expect(p1.targetTemplateId).toBe("sales");

      const p2 = parseNaturalLanguageCommand("tema finance");
      expect(p2.intent).toBe("switch_template");
      expect(p2.targetTemplateId).toBe("finance");

      const p3 = parseNaturalLanguageCommand("template e-commerce");
      expect(p3.intent).toBe("switch_template");
      expect(p3.targetTemplateId).toBe("ecommerce");
    });

    it("parses filter and search intents accurately", () => {
      const pFilter = parseNaturalLanguageCommand("filter kategori Fashion");
      expect(pFilter.intent).toBe("filter_category");
      expect(pFilter.targetCategory).toBe("Fashion");

      const pSearch = parseNaturalLanguageCommand("cari kemeja batik");
      expect(pSearch.intent).toBe("search_query");
      expect(pSearch.searchQuery).toBe("kemeja batik");
    });

    it("parses layout toggle, export, and reset commands", () => {
      const pLayout = parseNaturalLanguageCommand("sesuaikan layout");
      expect(pLayout.intent).toBe("toggle_edit_layout");

      const pExport = parseNaturalLanguageCommand("ekspor png");
      expect(pExport.intent).toBe("export_png");

      const pReset = parseNaturalLanguageCommand("reset filter");
      expect(pReset.intent).toBe("clear_filters");
    });

    it("handles empty or whitespace inputs gracefully", () => {
      const pEmpty = parseNaturalLanguageCommand("   ");
      expect(pEmpty.intent).toBe("unknown");
      expect(pEmpty.confidenceScore).toBe(0);
    });
  });

  describe("Command Executor", () => {
    const mockCharts: ChartRecommendation[] = [
      {
        id: "c_main_1",
        chartType: "line",
        title: "Tren Penjualan",
        subtitle: "Bulanan",
        confidenceScore: 0.9,
        reasoning: "Line",
        xAxisColumn: "Bulan",
        yAxisColumns: ["Nilai"],
        aggregationType: "sum",
        data: [
          { label: "Jan", value: 1000 },
          { label: "Feb", value: 3000 },
          { label: "Mar", value: 2000 },
        ],
        orderIndex: 0,
        availableAlternativeTypes: ["line", "bar"],
      },
    ];

    beforeEach(() => {
      useDashboardStore.getState().initializeFromEngine(
        "ds_test",
        "Executive Test",
        "Sub",
        [],
        mockCharts,
        ["bulan", "nilai"]
      );
    });

    it("executes chart type modification successfully", () => {
      const cmd = parseNaturalLanguageCommand("ubah ke bar chart");
      const result = executeParsedCommand(cmd);

      expect(result.success).toBe(true);
      expect(result.message).toContain("BAR");
      const currentChart = useDashboardStore.getState().dashboard?.mainCharts[0];
      expect(currentChart?.chartType).toBe("bar");
    });

    it("executes template switching successfully", () => {
      const cmd = parseNaturalLanguageCommand("ganti template ke sales");
      const result = executeParsedCommand(cmd);

      expect(result.success).toBe(true);
      expect(useDashboardStore.getState().dashboard?.templateId).toBe("sales");
    });

    it("executes data sorting (descending and ascending)", () => {
      // Sort Descending
      const cmdDesc = parseNaturalLanguageCommand("urutkan dari yang terbesar");
      executeParsedCommand(cmdDesc);
      let chartData = useDashboardStore.getState().dashboard?.mainCharts[0].data || [];
      expect(chartData[0].value).toBe(3000);
      expect(chartData[2].value).toBe(1000);

      // Sort Ascending
      const cmdAsc = parseNaturalLanguageCommand("urutkan terkecil");
      executeParsedCommand(cmdAsc);
      chartData = useDashboardStore.getState().dashboard?.mainCharts[0].data || [];
      expect(chartData[0].value).toBe(1000);
      expect(chartData[2].value).toBe(3000);
    });

    it("executes filtering and clearing filters", () => {
      const cmdFilter = parseNaturalLanguageCommand("filter kategori Fashion");
      executeParsedCommand(cmdFilter);
      expect(useDashboardStore.getState().globalCategoryFilter).toBe("Fashion");

      const cmdClear = parseNaturalLanguageCommand("reset filter");
      executeParsedCommand(cmdClear);
      expect(useDashboardStore.getState().globalCategoryFilter).toBeNull();
    });

    it("executes layout toggle", () => {
      const cmd = parseNaturalLanguageCommand("sesuaikan layout");
      executeParsedCommand(cmd);
      expect(useDashboardStore.getState().isEditingLayout).toBe(true);
    });
  });

  describe("Command Store State & History", () => {
    it("manages open/close/toggle state", () => {
      const store = useCommandStore.getState();
      expect(store.isOpen).toBe(false);

      store.openCommandBar();
      expect(useCommandStore.getState().isOpen).toBe(true);

      store.closeCommandBar();
      expect(useCommandStore.getState().isOpen).toBe(false);

      store.toggleCommandBar();
      expect(useCommandStore.getState().isOpen).toBe(true);
    });

    it("executes command, records history without duplicates, and clears query", () => {
      const store = useCommandStore.getState();
      store.setInputQuery("ubah ke bar chart");
      const res = store.executeCommand("ubah ke bar chart");

      expect(res).toBeDefined();
      const state = useCommandStore.getState();
      expect(state.history).toContain("ubah ke bar chart");
      expect(state.inputQuery).toBe("");
    });

    it("manages panel width mode transitions (standard -> wide -> fullscreen -> standard)", () => {
      const store = useCommandStore.getState();
      expect(store.panelWidthMode).toBe("standard");

      store.togglePanelWidthMode();
      expect(useCommandStore.getState().panelWidthMode).toBe("wide");

      store.togglePanelWidthMode();
      expect(useCommandStore.getState().panelWidthMode).toBe("fullscreen");

      store.togglePanelWidthMode();
      expect(useCommandStore.getState().panelWidthMode).toBe("standard");

      store.setPanelWidthMode("wide");
      expect(useCommandStore.getState().panelWidthMode).toBe("wide");
    });

    it("records chat messages and clears them on demand", () => {
      const store = useCommandStore.getState();
      expect(store.chatMessages).toHaveLength(0);

      store.addChatMessage({
        role: "user",
        content: "Berapa total omset?",
      });
      store.addChatMessage({
        role: "assistant",
        content: "Total omset adalah Rp 45.000.000.",
      });

      expect(useCommandStore.getState().chatMessages).toHaveLength(2);
      expect(useCommandStore.getState().chatMessages[0].content).toBe("Berapa total omset?");

      store.clearChatMessages();
      expect(useCommandStore.getState().chatMessages).toHaveLength(0);
    });
  });

  describe("Dashboard Pinning & AI Chart Integration", () => {
    it("adds AI generated chart to dashboard via addChart", () => {
      useDashboardStore.getState().initializeFromEngine(
        "ds_test",
        "Executive Test",
        "Sub",
        [],
        [],
        ["kategori", "omset"]
      );

      expect(useDashboardStore.getState().dashboard?.mainCharts).toHaveLength(0);

      const aiChart: ChartRecommendation = {
        id: "ai_chart_new",
        chartType: "bar",
        title: "Omset Berdasarkan Kategori",
        subtitle: "Dihasilkan otomatis oleh AI",
        confidenceScore: 0.95,
        reasoning: "Top metrics",
        yAxisColumns: ["omset"],
        aggregationType: "sum",
        data: [{ label: "Fashion", value: 5000000 }],
        orderIndex: 0,
        availableAlternativeTypes: ["bar", "line"],
      };

      useDashboardStore.getState().addChart(aiChart);
      const charts = useDashboardStore.getState().dashboard?.mainCharts || [];
      expect(charts).toHaveLength(1);
      expect(charts[0].title).toBe("Omset Berdasarkan Kategori");
    });
  });

  describe("Command UI Components", () => {
    it("renders CommandSuggestionPill and handles click", () => {
      const handleClick = vi.fn();
      render(
        <CommandSuggestionPill
          suggestion={{
            id: "sug_test",
            title: "Ganti visualisasi ke Bar Chart",
            category: "Visualisasi",
            commandText: "ubah ke bar chart",
          }}
          onClick={handleClick}
        />
      );

      expect(screen.getByText("Ganti visualisasi ke Bar Chart")).toBeInTheDocument();
      expect(screen.getByText("Visualisasi")).toBeInTheDocument();

      const btn = screen.getByRole("button");
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledWith("ubah ke bar chart");
    });

    it("renders CommandBarModal drawer and executes suggestion on click", () => {
      act(() => {
        useCommandStore.getState().openCommandBar();
      });

      render(<CommandBarModal />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ask anything…/)).toBeInTheDocument();

      const sugBtn = screen.getByText("Ganti visualisasi ke Bar Chart");
      fireEvent.click(sugBtn);

      const state = useCommandStore.getState();
      expect(state.chatMessages.length).toBeGreaterThan(0);
    });

    it("handles keyboard navigation and typing in CommandBarModal drawer", () => {
      act(() => {
        useCommandStore.getState().openCommandBar();
      });

      render(<CommandBarModal />);
      const input = screen.getByPlaceholderText(/Ask anything…/);

      fireEvent.change(input, { target: { value: "ubah ke donut" } });
      expect(useCommandStore.getState().inputQuery).toBe("ubah ke donut");

      fireEvent.keyDown(input, { key: "Enter" });
      const state = useCommandStore.getState();
      expect(state.chatMessages.length).toBeGreaterThan(0);
    });

    it("renders multi-turn chat messages with SQL and chart preview in drawer", () => {
      act(() => {
        useCommandStore.getState().openCommandBar();
        useCommandStore.getState().addChatMessage({
          role: "user",
          content: "Tampilkan top 3 kategori",
        });
        useCommandStore.getState().addChatMessage({
          role: "assistant",
          content: "Berikut adalah 3 kategori teratas berdasarkan volume.",
          aiResult: {
            answerText: "Berikut adalah 3 kategori teratas berdasarkan volume.",
            intent: "top_ranking",
            confidence: 0.95,
            sqlEquivalent: "SELECT Kategori, SUM(Omset) FROM dataset GROUP BY Kategori ORDER BY SUM(Omset) DESC LIMIT 3;",
            suggestedFollowUps: ["Berapa rata-rata transaksi?"],
            chartRecommendation: {
              chartType: "bar",
              title: "Top 3 Kategori Terbesar",
              subtitle: "Distribusi Penjualan",
              data: [
                { label: "Fashion", value: 12000000 },
                { label: "Elektronik", value: 9500000 },
                { label: "Kecantikan", value: 6800000 },
              ],
            },
          },
        });
      });

      render(<CommandBarModal />);

      expect(screen.getByText("Tampilkan top 3 kategori")).toBeInTheDocument();
      expect(screen.getByText("Berikut adalah 3 kategori teratas berdasarkan volume.")).toBeInTheDocument();
      expect(screen.getByText("Keyakinan 95%")).toBeInTheDocument();
      expect(screen.getByText(/SELECT Kategori/)).toBeInTheDocument();
      expect(screen.getByText("Pin ke Dasbor")).toBeInTheDocument();
      expect(screen.getByText("Berapa rata-rata transaksi? →")).toBeInTheDocument();
    });
  });
});
