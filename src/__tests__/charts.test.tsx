import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { buildEChartsOption } from "@/components/charts/options-builder";
import { UniversalChartRenderer } from "@/components/charts/universal-chart-renderer";
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

describe("Modul 6: ECharts Rendering Engine", () => {
  const sampleData = [
    { label: "Jan", value: 1000000, secondaryValue: 500000 },
    { label: "Feb", value: 1500000, secondaryValue: 800000 },
    { label: "Mar", value: 2000000, secondaryValue: 1200000 },
  ];

  describe("Options Builder", () => {
    it("builds options for line and area charts with Sienna Brown stroke", () => {
      const lineRec: ChartRecommendation = {
        id: "c_line",
        chartType: "line",
        title: "Tren Penjualan",
        subtitle: "Bulanan",
        confidenceScore: 0.9,
        reasoning: "Time-series",
        xAxisColumn: "Bulan",
        yAxisColumns: ["Penjualan"],
        aggregationType: "sum",
        data: sampleData,
        orderIndex: 0,
        availableAlternativeTypes: ["line", "area"],
      };

      const lineOption = buildEChartsOption(lineRec) as Record<string, unknown>;
      const xAxis = lineOption.xAxis as { type: string; data: string[] };
      const series = lineOption.series as Array<{ type: string; itemStyle: { color: string } }>;
      expect(xAxis.type).toBe("category");
      expect(xAxis.data).toEqual(["Jan", "Feb", "Mar"]);
      expect(series[0].type).toBe("line");
      expect(series[0].itemStyle.color).toBe("#5d2a1a");

      // Area chart option
      const areaRec: ChartRecommendation = {
        ...lineRec,
        chartType: "area",
      };
      const areaOption = buildEChartsOption(areaRec) as Record<string, unknown>;
      const areaSeries = areaOption.series as Array<{ areaStyle?: unknown }>;
      expect(areaSeries[0].areaStyle).toBeDefined();
    });

    it("builds Dual Y-Axis options for line chart with multiple metrics", () => {
      const dualRec: ChartRecommendation = {
        id: "c_dual",
        chartType: "line",
        title: "Tren Penjualan & Pesanan",
        subtitle: "Bulanan",
        confidenceScore: 0.9,
        reasoning: "Dual metric",
        xAxisColumn: "Bulan",
        yAxisColumns: ["total_penjualan", "jumlah_pesanan"],
        aggregationType: "sum",
        data: sampleData,
        orderIndex: 0,
        availableAlternativeTypes: ["line", "area"],
      };

      const option = buildEChartsOption(dualRec) as Record<string, unknown>;
      const yAxis = option.yAxis as Array<{ type: string; position?: string }>;
      expect(Array.isArray(yAxis)).toBe(true);
      expect(yAxis).toHaveLength(2);
      expect(yAxis[0].type).toBe("value");
      expect(yAxis[1].position).toBe("right");

      const series = option.series as Array<{ yAxisIndex?: number }>;
      expect(series[0].yAxisIndex).toBe(0);
      expect(series[1].yAxisIndex).toBe(1);
    });

    it("builds options for horizontal bar chart with reversed axes", () => {
      const hbarRec: ChartRecommendation = {
        id: "c_hbar",
        chartType: "horizontal_bar",
        title: "Top Kategori",
        subtitle: "Kategori Produk",
        confidenceScore: 0.85,
        reasoning: "Ranking",
        xAxisColumn: "Kategori",
        yAxisColumns: ["Nilai"],
        aggregationType: "sum",
        data: sampleData,
        orderIndex: 0,
        availableAlternativeTypes: ["horizontal_bar"],
      };

      const hbarOption = buildEChartsOption(hbarRec) as Record<string, unknown>;
      const xAxis = hbarOption.xAxis as { type: string };
      const yAxis = hbarOption.yAxis as { type: string; data: string[] };
      expect(xAxis.type).toBe("value");
      expect(yAxis.type).toBe("category");
      expect(yAxis.data).toEqual(["Mar", "Feb", "Jan"]); // reversed
    });

    it("builds options for donut chart with inner and outer radius", () => {
      const donutRec: ChartRecommendation = {
        id: "c_donut",
        chartType: "donut",
        title: "Proporsi",
        subtitle: "Kategori",
        confidenceScore: 0.75,
        reasoning: "Proporsi",
        xAxisColumn: "Kategori",
        yAxisColumns: ["Nilai"],
        aggregationType: "sum",
        data: sampleData,
        orderIndex: 0,
        availableAlternativeTypes: ["donut", "pie"],
      };

      const donutOption = buildEChartsOption(donutRec) as Record<string, unknown>;
      const series = donutOption.series as Array<{ type: string; radius: string[] }>;
      expect(series[0].type).toBe("pie");
      expect(series[0].radius).toEqual(["50%", "75%"]);
    });

    it("builds options for scatter plot with coordinate pairs", () => {
      const scatterRec: ChartRecommendation = {
        id: "c_scatter",
        chartType: "scatter",
        title: "Korelasi",
        subtitle: "Sebaran",
        confidenceScore: 0.7,
        reasoning: "Korelasi",
        xAxisColumn: "X",
        yAxisColumns: ["Y"],
        aggregationType: "none",
        data: sampleData,
        orderIndex: 0,
        availableAlternativeTypes: ["scatter"],
      };

      const scatterOption = buildEChartsOption(scatterRec) as Record<string, unknown>;
      const series = scatterOption.series as Array<{ type: string; data: number[][] }>;
      expect(series[0].type).toBe("scatter");
      expect(series[0].data).toEqual([
        [1000000, 500000],
        [1500000, 800000],
        [2000000, 1200000],
      ]);
    });
  });

  describe("Universal Chart Renderer Component", () => {
    const mockRec: ChartRecommendation = {
      id: "rec_render_test",
      chartType: "bar",
      title: "Penjualan per Wilayah",
      subtitle: "Wilayah Indonesia",
      confidenceScore: 0.9,
      reasoning: "Kategori bar",
      xAxisColumn: "Kota",
      yAxisColumns: ["Omset"],
      aggregationType: "sum",
      data: [
        { label: "Jakarta", value: 5000000 },
        { label: "Surabaya", value: 3000000 },
      ],
      orderIndex: 0,
      availableAlternativeTypes: ["bar", "line", "donut"],
    };

    it("renders card title, confidence indicator, and alternative type switchers", () => {
      const handleSwap = vi.fn();
      render(<UniversalChartRenderer recommendation={mockRec} onSwapType={handleSwap} />);

      expect(screen.getByText("Penjualan per Wilayah")).toBeInTheDocument();
      expect(screen.getByText("Wilayah Indonesia")).toBeInTheDocument();
      expect(screen.getByText("90%")).toBeInTheDocument();

      // Check alternative type button
      const lineBtn = screen.getByRole("button", { name: "Garis" });
      fireEvent.click(lineBtn);
      expect(handleSwap).toHaveBeenCalledWith("line");
    });
  });
});
