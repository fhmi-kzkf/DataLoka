import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TEMPLATE_REGISTRY, ALL_TEMPLATES, getTemplateById } from "@/core/template/template-registry";
import { matchTemplate, getBestTemplate } from "@/core/template/template-matcher";
import { useDashboardStore } from "@/stores/dashboard-store";
import { TemplateSelectorPill } from "@/components/modules/dashboard/template-selector-pill";
import { EditorialAccentCard } from "@/components/modules/dashboard/editorial-accent-card";
import { GlobalFilterBar } from "@/components/modules/dashboard/global-filter-bar";
import { DashboardHeader } from "@/components/modules/dashboard/dashboard-header";
import { DashboardComposer } from "@/components/modules/dashboard/dashboard-composer";
import type { ChartRecommendation } from "@/types/chart";

// Mock echarts.init for jsdom
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

describe("Modul 7: Dashboard Composer & Editorial Templates", () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
  });

  describe("Template Registry", () => {
    it("provides 8 editorial domain templates with valid attributes", () => {
      expect(ALL_TEMPLATES).toHaveLength(8);
      const templateIds = ALL_TEMPLATES.map((t) => t.id);
      expect(templateIds).toContain("ecommerce");
      expect(templateIds).toContain("sales");
      expect(templateIds).toContain("finance");
      expect(templateIds).toContain("marketing");
      expect(templateIds).toContain("operational");
      expect(templateIds).toContain("hr");
      expect(templateIds).toContain("survey");
      expect(templateIds).toContain("general");
    });

    it("retrieves template by ID or falls back to general", () => {
      const ecom = getTemplateById("ecommerce");
      expect(ecom.name).toBe("E-Commerce & Retail");
      expect(ecom.recommendedLayout).toBe("retail_grid");

      // @ts-expect-error testing invalid ID
      const fallback = getTemplateById("non_existent");
      expect(fallback.id).toBe("general");
    });
  });

  describe("Template Matcher", () => {
    it("matches e-commerce datasets accurately and computes ranked match scores", () => {
      const ecomCols = ["tanggal_pesanan", "sku_produk", "harga_satuan", "omset_gmv", "kota"];
      const scores = matchTemplate(ecomCols);
      expect(scores.length).toBeGreaterThan(0);
      expect(scores[0].template.id).toBe("ecommerce");
      expect(scores[0].score).toBeGreaterThan(0);

      const best = getBestTemplate(ecomCols);
      expect(best).toBe("ecommerce");
    });

    it("matches B2B sales pipeline accurately", () => {
      const salesCols = ["lead_id", "sales_rep", "deal_stage", "arr_value", "closing_date"];
      const best = getBestTemplate(salesCols);
      expect(best).toBe("sales");
    });

    it("matches finance and P&L accurately", () => {
      const finCols = ["periode", "revenue", "ebitda", "opex_cost", "net_profit"];
      const best = getBestTemplate(finCols);
      expect(best).toBe("finance");
    });

    it("matches marketing & growth accurately", () => {
      const mktCols = ["ad_campaign", "roas", "cac", "impressions", "clicks", "spend"];
      const best = getBestTemplate(mktCols);
      expect(best).toBe("marketing");
    });

    it("matches survey accurately", () => {
      const surveyCols = ["responden_id", "nps_score", "csat_rating", "kepuasan_layanan"];
      const best = getBestTemplate(surveyCols);
      expect(best).toBe("survey");
    });

    it("falls back to general when column names are generic or unassigned", () => {
      const genericCols = ["col_a", "col_b", "col_c"];
      const best = getBestTemplate(genericCols);
      expect(best).toBe("general");
    });
  });

  describe("Dashboard Store State & Actions", () => {
    const mockKpis: ChartRecommendation[] = [
      {
        id: "kpi_1",
        chartType: "kpi_card",
        title: "Total GMV",
        subtitle: "Akumulasi",
        confidenceScore: 0.95,
        reasoning: "Sum",
        yAxisColumns: ["gmv"],
        aggregationType: "sum",
        data: [],
        kpiMetric: { title: "Total GMV", value: 100000000, formattedValue: "Rp 100.000.000" },
        orderIndex: 0,
        availableAlternativeTypes: ["kpi_card"],
      },
      {
        id: "kpi_2",
        chartType: "kpi_card",
        title: "Jumlah Pesanan",
        subtitle: "Volume",
        confidenceScore: 0.9,
        reasoning: "Count",
        yAxisColumns: ["orders"],
        aggregationType: "count",
        data: [],
        kpiMetric: { title: "Jumlah Pesanan", value: 520, formattedValue: "520 pesanan" },
        orderIndex: 1,
        availableAlternativeTypes: ["kpi_card"],
      },
    ];

    const mockCharts: ChartRecommendation[] = [
      {
        id: "chart_1",
        chartType: "line",
        title: "Tren Penjualan",
        subtitle: "Harian",
        confidenceScore: 0.9,
        reasoning: "Time-series",
        xAxisColumn: "Tanggal",
        yAxisColumns: ["Penjualan"],
        aggregationType: "sum",
        data: [
          { label: "2026-01-01", value: 5000000, category: "Fashion" },
          { label: "2026-01-02", value: 8000000, category: "Elektronik" },
        ],
        orderIndex: 0,
        availableAlternativeTypes: ["line", "bar"],
      },
      {
        id: "chart_2",
        chartType: "donut",
        title: "Share Kategori",
        subtitle: "Komposisi",
        confidenceScore: 0.85,
        reasoning: "Kategori",
        xAxisColumn: "Kategori",
        yAxisColumns: ["Nilai"],
        aggregationType: "sum",
        data: [
          { label: "Fashion", value: 5000000 },
          { label: "Elektronik", value: 8000000 },
        ],
        orderIndex: 1,
        availableAlternativeTypes: ["donut", "pie", "bar"],
      },
    ];

    it("initializes dashboard with recommendations and auto-matches template", () => {
      const store = useDashboardStore.getState();
      store.initializeFromEngine(
        "ds_123",
        "Executive Dashboard",
        "Deskripsi",
        mockKpis,
        mockCharts,
        ["gmv", "sku", "pesanan"]
      );

      const state = useDashboardStore.getState();
      expect(state.dashboard).toBeDefined();
      expect(state.dashboard?.templateId).toBe("ecommerce");
      expect(state.dashboard?.kpiCards).toHaveLength(2);
      expect(state.dashboard?.mainCharts).toHaveLength(2);
      expect(state.dashboard?.accentCard).toBeDefined();
    });

    it("switches template and updates accent card", () => {
      const store = useDashboardStore.getState();
      store.initializeFromEngine(
        "ds_123",
        "Executive Dashboard",
        "Deskripsi",
        mockKpis,
        mockCharts,
        ["gmv"]
      );

      store.setTemplate("finance");
      const state = useDashboardStore.getState();
      expect(state.activeTemplateId).toBe("finance");
      expect(state.dashboard?.templateId).toBe("finance");
      expect(state.dashboard?.accentCard?.title).toBe("Fiscal Overview");
    });

    it("reorders KPI cards correctly", () => {
      const store = useDashboardStore.getState();
      store.initializeFromEngine(
        "ds_123",
        "Dashboard",
        "Sub",
        mockKpis,
        mockCharts,
        ["gmv"]
      );

      store.reorderKpis(0, 1);
      const state = useDashboardStore.getState();
      expect(state.dashboard?.kpiCards[0].id).toBe("kpi_2");
      expect(state.dashboard?.kpiCards[1].id).toBe("kpi_1");
    });

    it("changes chart type in main charts", () => {
      const store = useDashboardStore.getState();
      store.initializeFromEngine(
        "ds_123",
        "Dashboard",
        "Sub",
        mockKpis,
        mockCharts,
        ["gmv"]
      );

      store.changeChartType("chart_1", "bar");
      const state = useDashboardStore.getState();
      expect(state.dashboard?.mainCharts[0].chartType).toBe("bar");
    });

    it("updates global category filter and search query", () => {
      const store = useDashboardStore.getState();
      store.initializeFromEngine(
        "ds_123",
        "Dashboard",
        "Sub",
        mockKpis,
        mockCharts,
        ["gmv"]
      );

      store.setGlobalCategoryFilter("Fashion");
      store.setSearchFilter("2026-01-01");
      const state = useDashboardStore.getState();
      expect(state.globalCategoryFilter).toBe("Fashion");
      expect(state.searchFilter).toBe("2026-01-01");
    });
  });

  describe("UI Components Rendering", () => {
    it("renders TemplateSelectorPill and fires onSelectTemplate", () => {
      const handleSelect = vi.fn();
      render(
        <TemplateSelectorPill
          activeTemplateId="ecommerce"
          onSelectTemplate={handleSelect}
        />
      );

      expect(screen.getByText("E-Commerce & Retail")).toBeInTheDocument();
      expect(screen.getByText("Financial & P&L")).toBeInTheDocument();

      const finBtn = screen.getByText("Financial & P&L");
      fireEvent.click(finBtn);
      expect(handleSelect).toHaveBeenCalledWith("finance");
    });

    it("renders EditorialAccentCard with quote and author", () => {
      render(
        <EditorialAccentCard
          accent={{
            title: "Editorial Snapshot",
            quote: "Omset stabil didukung penjualan produk hero.",
            author: "DataLoka Intelligence",
            role: "Commerce Heuristic",
          }}
        />
      );

      expect(screen.getByText("Editorial Snapshot")).toBeInTheDocument();
      expect(screen.getByText(/Omset stabil didukung penjualan/)).toBeInTheDocument();
      expect(screen.getByText("DataLoka Intelligence")).toBeInTheDocument();
    });

    it("renders GlobalFilterBar with categories and search input", () => {
      const handleCat = vi.fn();
      const handleSearch = vi.fn();
      const handleReset = vi.fn();

      render(
        <GlobalFilterBar
          categories={["Fashion", "Elektronik", "Kecantikan"]}
          selectedCategory="Fashion"
          onSelectCategory={handleCat}
          searchQuery="Kemeja"
          onSearchChange={handleSearch}
          onResetFilters={handleReset}
        />
      );

      expect(screen.getAllByText("Fashion")[0]).toBeInTheDocument();
      expect(screen.getByText("Elektronik")).toBeInTheDocument();
      const resetBtn = screen.getByText("Reset");
      fireEvent.click(resetBtn);
      expect(handleReset).toHaveBeenCalled();
    });

    it("renders DashboardHeader with title, subtitle, and badges", () => {
      const handleToggle = vi.fn();
      render(
        <DashboardHeader
          title="Executive Performance Q1"
          subtitle="Analisis Tren Penjualan"
          template={TEMPLATE_REGISTRY.ecommerce}
          rowCount={1500}
          isEditingLayout={false}
          onToggleEditLayout={handleToggle}
        />
      );

      expect(screen.getByText("Executive Performance Q1")).toBeInTheDocument();
      expect(screen.getByText("Analisis Tren Penjualan")).toBeInTheDocument();
      expect(screen.getByText("1.500 baris data teranalisis")).toBeInTheDocument();

      const editBtn = screen.getByText("Sesuaikan Layout");
      fireEvent.click(editBtn);
      expect(handleToggle).toHaveBeenCalled();
    });

    it("renders full DashboardComposer and handles empty / active states", () => {
      const { rerender } = render(<DashboardComposer />);
      expect(screen.getByText("Belum ada dashboard aktif")).toBeInTheDocument();

      // Initialize store
      act(() => {
        useDashboardStore.getState().initializeFromEngine(
          "ds_test",
          "Dashboard Aktif Toko",
          "Ringkasan performa",
          [
            {
              id: "kpi_1",
              chartType: "kpi_card",
              title: "Total Revenue",
              subtitle: "YTD",
              confidenceScore: 0.9,
              reasoning: "Sum",
              yAxisColumns: ["rev"],
              aggregationType: "sum",
              data: [],
              kpiMetric: { title: "Total Revenue", value: "Rp 50.000.000", formattedValue: "Rp 50.000.000" },
              orderIndex: 0,
              availableAlternativeTypes: ["kpi_card"],
            },
          ],
          [
            {
              id: "chart_1",
              chartType: "bar",
              title: "Omset per Kategori",
              subtitle: "Q1",
              confidenceScore: 0.85,
              reasoning: "Bar",
              xAxisColumn: "Kategori",
              yAxisColumns: ["Omset"],
              aggregationType: "sum",
              data: [{ label: "Fashion", value: 30000000 }],
              orderIndex: 0,
              availableAlternativeTypes: ["bar", "line"],
            },
          ],
          ["rev", "kategori"]
        );
      });

      rerender(<DashboardComposer rowCount={500} />);
      expect(screen.getByText("Dashboard Aktif Toko")).toBeInTheDocument();
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
      expect(screen.getByText("Omset per Kategori")).toBeInTheDocument();
    });
  });
});
