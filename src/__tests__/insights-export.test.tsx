import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { generateEditorialInsights } from "@/core/insight/insight-generator";
import {
  exportDashboardToJson,
  exportDataToCsv,
  triggerPrintToPdf,
} from "@/core/export/export-manager";
import {
  createSharePayload,
  encodeShareToken,
  decodeShareToken,
  generateShareUrl,
} from "@/core/share/share-manager";
import { useInsightStore } from "@/stores/insight-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { InsightCard } from "@/components/modules/insight/insight-card";
import { InsightGrid } from "@/components/modules/insight/insight-grid";
import { ExportModal } from "@/components/modules/export/export-modal";
import { ShareModal } from "@/components/modules/share/share-modal";
import type { ChartRecommendation } from "@/types/chart";
import type { DashboardState } from "@/types/template";
import type { EditorialInsight } from "@/types/insight";

// Mock echarts
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

describe("Modul 9: Insight Generation, Share & Export", () => {
  beforeEach(() => {
    useInsightStore.getState().reset();
    useDashboardStore.getState().reset();
  });

  const mockKpis: ChartRecommendation[] = [
    {
      id: "kpi_rev",
      chartType: "kpi_card",
      title: "Total Revenue",
      subtitle: "YTD",
      confidenceScore: 0.95,
      reasoning: "Sum",
      yAxisColumns: ["revenue"],
      aggregationType: "sum",
      data: [],
      kpiMetric: {
        title: "Total Revenue",
        value: 120000000,
        formattedValue: "Rp 120.000.000",
        deltaText: "+15.2% vs bulan lalu",
        isPositive: true,
      },
      orderIndex: 0,
      availableAlternativeTypes: ["kpi_card"],
    },
  ];

  const mockCharts: ChartRecommendation[] = [
    {
      id: "chart_cat",
      chartType: "donut",
      title: "Share Kategori",
      subtitle: "Komposisi",
      confidenceScore: 0.85,
      reasoning: "Category share",
      xAxisColumn: "Kategori",
      yAxisColumns: ["Nilai"],
      aggregationType: "sum",
      data: [
        { label: "Fashion Wanita", value: 70000000 },
        { label: "Elektronik", value: 30000000 },
        { label: "Makanan", value: 20000000 },
      ],
      orderIndex: 0,
      availableAlternativeTypes: ["donut", "bar"],
    },
    {
      id: "chart_time",
      chartType: "line",
      title: "Tren Penjualan",
      subtitle: "Mingguan",
      confidenceScore: 0.9,
      reasoning: "Time-series",
      xAxisColumn: "Minggu",
      yAxisColumns: ["Omset"],
      aggregationType: "sum",
      data: [
        { label: "W1", value: 20000000 },
        { label: "W2", value: 30000000 },
        { label: "W3", value: 35000000 },
        { label: "W4", value: 45000000 },
      ],
      orderIndex: 1,
      availableAlternativeTypes: ["line", "area"],
    },
  ];

  const mockDashboard: DashboardState = {
    id: "dash_test_1",
    title: "Executive Retail Performance",
    subtitle: "Analisis Penjualan Q1",
    datasetId: "ds_1",
    templateId: "ecommerce",
    kpiCards: mockKpis,
    mainCharts: mockCharts,
    createdAt: new Date().toISOString(),
  };

  describe("Insight Generation Engine", () => {
    it("generates top performer insight with contribution percentage", () => {
      const insights = generateEditorialInsights(mockKpis, mockCharts);
      const topPerformer = insights.find((i) => i.type === "top_performer");

      expect(topPerformer).toBeDefined();
      expect(topPerformer?.title).toContain("Fashion Wanita");
      expect(topPerformer?.metricValue).toBe("58.3%");
      expect(topPerformer?.sentiment).toBe("positive");
    });

    it("detects concentration risk when top categories dominate over 60%", () => {
      const insights = generateEditorialInsights(mockKpis, mockCharts);
      const concentration = insights.find((i) => i.type === "concentration");

      expect(concentration).toBeDefined();
      expect(concentration?.title).toBe("Konsentrasi Pendapatan Terpusat");
      expect(concentration?.metricValue).toBe("83.3%");
    });

    it("calculates trend growth velocity across time periods", () => {
      const insights = generateEditorialInsights(mockKpis, mockCharts);
      const trend = insights.find((i) => i.type === "trend_growth");

      expect(trend).toBeDefined();
      expect(trend?.title).toBe("Lintasan Pertumbuhan Positif");
      expect(trend?.metricValue).toBe("+60.0%");
      expect(trend?.sentiment).toBe("positive");
    });

    it("generates primary KPI narrative snapshot", () => {
      const insights = generateEditorialInsights(mockKpis, mockCharts);
      const kpiInsight = insights.find((i) => i.type === "general");

      expect(kpiInsight).toBeDefined();
      expect(kpiInsight?.title).toContain("Total Revenue");
      expect(kpiInsight?.description).toContain("Rp 120.000.000");
    });
  });

  describe("Export Manager", () => {
    it("creates JSON blob and triggers download", () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

      exportDashboardToJson(mockDashboard, []);

      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });

    it("formats CSV with UTF-8 BOM and triggers download", () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

      exportDataToCsv([{ item: "Baju", qty: 10, total: 150000 }], "data_test.csv");

      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });

    it("triggers window.print for PDF generation", () => {
      const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
      triggerPrintToPdf();
      expect(printSpy).toHaveBeenCalled();
      printSpy.mockRestore();
    });
  });

  describe("Share Manager (Zero-Backend)", () => {
    it("encodes and decodes share payloads losslessly", () => {
      const payload = createSharePayload(mockDashboard, "Penjualan_Q1.xlsx");
      expect(payload.title).toBe("Executive Retail Performance");
      expect(payload.kpiCards).toHaveLength(1);
      expect(payload.mainCharts).toHaveLength(2);

      const token = encodeShareToken(payload);
      expect(token).toBeTypeOf("string");
      expect(token.length).toBeGreaterThan(10);

      const decoded = decodeShareToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.title).toBe(payload.title);
      expect(decoded?.templateId).toBe(payload.templateId);
      expect(decoded?.mainCharts).toHaveLength(2);
    });

    it("generates correct public share URL", () => {
      const url = generateShareUrl("mock_token_123", "https://dataloka.id");
      expect(url).toBe("https://dataloka.id/shared/mock_token_123");
    });
  });

  describe("Insight & Export UI Components", () => {
    const mockInsight: EditorialInsight = {
      id: "ins_1",
      type: "top_performer",
      title: "Kontributor Utama: Fashion",
      description: "Fashion menyumbang 58% dari total omset.",
      metricValue: "58%",
      sentiment: "positive",
      confidenceScore: 0.9,
      recommendedAction: "Tingkatkan inventori toko.",
    };

    it("renders InsightCard with sentiment badge and recommendation", () => {
      render(<InsightCard insight={mockInsight} />);

      expect(screen.getByText("Kontributor Utama: Fashion")).toBeInTheDocument();
      expect(screen.getByText("58%")).toBeInTheDocument();
      expect(screen.getByText(/Fashion menyumbang 58%/)).toBeInTheDocument();
      expect(screen.getByText(/Tingkatkan inventori toko/)).toBeInTheDocument();
    });

    it("renders InsightGrid with multiple cards", () => {
      render(<InsightGrid insights={[mockInsight]} />);
      expect(screen.getByText("Temuan & Anomali Utama")).toBeInTheDocument();
    });

    it("renders ExportModal and handles download actions", () => {
      useDashboardStore.setState({ dashboard: mockDashboard });
      act(() => {
        useInsightStore.getState().openExportModal();
      });

      render(<ExportModal />);

      expect(screen.getByRole("dialog", { name: "Ekspor Laporan Dasbor" })).toBeInTheDocument();
      expect(screen.getByText("Pilih Format Unduhan")).toBeInTheDocument();

      const jsonBtn = screen.getByText("Unduh JSON →");
      fireEvent.click(jsonBtn);

      expect(screen.getByText(/Berkas JSON berhasil diunduh/)).toBeInTheDocument();
    });

    it("renders ShareModal and handles copy action", async () => {
      act(() => {
        useInsightStore.getState().openShareModal(mockDashboard, "Penjualan.xlsx");
      });

      render(<ShareModal />);

      expect(screen.getByRole("dialog", { name: "Bagikan Dasbor" })).toBeInTheDocument();
      expect(screen.getByText("Bagikan Snapshot Dasbor")).toBeInTheDocument();

      const copyBtn = screen.getByText("Salin");
      fireEvent.click(copyBtn);

      expect(screen.getByText("Tersalin!")).toBeInTheDocument();
    });
  });
});
