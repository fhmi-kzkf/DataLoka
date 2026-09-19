import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  aggregateByCategory,
  aggregateByDate,
  computeKpiMetric,
} from "@/core/engine/aggregator";
import { evaluateHeuristicRules } from "@/core/engine/heuristic-rules";
import { useChartStore } from "@/stores/chart-store";
import { RecommendationCard } from "@/components/modules/engine/recommendation-card";
import { EnginePreviewContainer } from "@/components/modules/engine/engine-preview-container";
import type { DatasetSchema, DatasetRow } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";
import type { ChartRecommendation } from "@/types/chart";

describe("Modul 5: Auto-Chart Decision Engine", () => {
  describe("Aggregator Module", () => {
    it("aggregates sum per category and clusters into Lainnya when exceeding topN", () => {
      const rows: DatasetRow[] = [
        { Kategori: "A", Omset: 100 },
        { Kategori: "A", Omset: 50 },
        { Kategori: "B", Omset: 80 },
        { Kategori: "C", Omset: 40 },
        { Kategori: "D", Omset: 20 },
      ];

      // Top 2 + Lainnya
      const result = aggregateByCategory(rows, "Kategori", "Omset", "sum", 2);
      expect(result.length).toBe(3);
      expect(result[0].label).toBe("A");
      expect(result[0].value).toBe(150);
      expect(result[1].label).toBe("B");
      expect(result[1].value).toBe(80);
      expect(result[2].label).toBe("Lainnya");
      expect(result[2].value).toBe(60); // 40 + 20
    });

    it("aggregates data chronologically by date", () => {
      const rows: DatasetRow[] = [
        { Tgl: "20/09/2026", Jml: 5 },
        { Tgl: "18/09/2026", Jml: 10 },
        { Tgl: "18/09/2026", Jml: 15 },
      ];

      const result = aggregateByDate(rows, "Tgl", ["Jml"], "sum");
      expect(result.length).toBe(2);
      expect(result[0].value).toBe(25); // 18 Sep sum
      expect(result[1].value).toBe(5); // 20 Sep sum
    });

    it("computes KPI metric with currency formatting and growth delta", () => {
      const rows: DatasetRow[] = [
        { Tgl: "01/09/2026", Revenue: 1000000 },
        { Tgl: "15/09/2026", Revenue: 2000000 },
      ];

      const kpi = computeKpiMetric(rows, "Revenue", "Total Omset", true, "Tgl");
      expect(kpi.value).toBe(3000000);
      expect(kpi.formattedValue).toContain("Rp");
      expect(kpi.isPositive).toBe(true);
      expect(kpi.deltaText).toContain("%");
    });
  });

  describe("Heuristic Decision Rules", () => {
    const mockDataset: DatasetSchema = {
      id: "ds_heuristic",
      name: "laporan.csv",
      sourceType: "file",
      headers: ["Tanggal", "Kategori", "Penjualan", "Ongkir", "Kota"],
      rows: [
        { Tanggal: "18/09/2026", Kategori: "Pakaian", Penjualan: 500000, Ongkir: 20000, Kota: "Jakarta" },
        { Tanggal: "19/09/2026", Kategori: "Elektronik", Penjualan: 1200000, Ongkir: 50000, Kota: "Surabaya" },
        { Tanggal: "20/09/2026", Kategori: "Pakaian", Penjualan: 300000, Ongkir: 15000, Kota: "Bandung" },
      ],
      rowCount: 3,
      columnCount: 5,
      fileSizeBytes: 1000,
      sampleRows: [],
      createdAt: "now",
    };

    const mockMapping: DatasetMapping = {
      datasetId: "ds_heuristic",
      primaryDateColumn: "Tanggal",
      primaryCategoryColumn: "Kategori",
      primaryNumericColumn: "Penjualan",
      columns: {
        Tanggal: {
          name: "Tanggal",
          inferredType: "datetime",
          effectiveType: "datetime",
          semanticRole: "order_date",
          confidenceScore: 0.95,
          cardinality: 3,
          nullableRatio: 0,
          sampleValues: ["18/09/2026"],
          stats: { totalNulls: 0 },
        },
        Kategori: {
          name: "Kategori",
          inferredType: "categorical",
          effectiveType: "categorical",
          semanticRole: "product_category",
          confidenceScore: 0.9,
          cardinality: 2, // <= 7 triggers Donut
          nullableRatio: 0,
          sampleValues: ["Pakaian", "Elektronik"],
          stats: { totalNulls: 0 },
        },
        Penjualan: {
          name: "Penjualan",
          inferredType: "numeric",
          effectiveType: "currency",
          semanticRole: "revenue",
          confidenceScore: 0.95,
          cardinality: 3,
          nullableRatio: 0,
          sampleValues: [500000],
          stats: { totalNulls: 0, sum: 2000000 },
        },
        Ongkir: {
          name: "Ongkir",
          inferredType: "numeric",
          effectiveType: "currency",
          semanticRole: "shipping_cost",
          confidenceScore: 0.95,
          cardinality: 3,
          nullableRatio: 0,
          sampleValues: [20000],
          stats: { totalNulls: 0, sum: 85000 },
        },
        Kota: {
          name: "Kota",
          inferredType: "geolocation",
          effectiveType: "geolocation",
          semanticRole: "city",
          confidenceScore: 0.9,
          cardinality: 3,
          nullableRatio: 0,
          sampleValues: ["Jakarta"],
          stats: { totalNulls: 0 },
        },
      },
      createdAt: "now",
    };

    it("evaluates rules and generates KPI cards and time-series charts", () => {
      const recs = evaluateHeuristicRules(mockDataset, mockMapping);

      // Rule 10: KPI Card
      const kpis = recs.filter((r) => r.chartType === "kpi_card");
      expect(kpis.length).toBeGreaterThanOrEqual(1);
      expect(kpis[0].confidenceScore).toBe(0.95);

      // Rule 1/2: Time-series Area/Line
      const timeChart = recs.find((r) => r.chartType === "area" || r.chartType === "line");
      expect(timeChart).toBeDefined();
      expect(timeChart?.xAxisColumn).toBe("Tanggal");

      // Rule 3: Donut for cardinality <= 7
      const donutChart = recs.find((r) => r.chartType === "donut");
      expect(donutChart).toBeDefined();
      expect(donutChart?.categoryColumn).toBe("Kategori");

      // Rule 8: Regional bar for Geolocation
      const geoChart = recs.find((r) => r.xAxisColumn === "Kota");
      expect(geoChart).toBeDefined();
    });
  });

  describe("Auto-Chart Zustand Store", () => {
    beforeEach(() => {
      useChartStore.getState().resetCharts();
    });

    it("generates recommendations and allows swapping chart types", () => {
      const mockDataset: DatasetSchema = {
        id: "ds_chart_store",
        name: "data.csv",
        sourceType: "file",
        headers: ["Kategori", "Nilai"],
        rows: [
          { Kategori: "A", Nilai: 10 },
          { Kategori: "B", Nilai: 20 },
        ],
        rowCount: 2,
        columnCount: 2,
        fileSizeBytes: 200,
        sampleRows: [],
        createdAt: "now",
      };

      const mockMapping: DatasetMapping = {
        datasetId: "ds_chart_store",
        primaryCategoryColumn: "Kategori",
        primaryNumericColumn: "Nilai",
        columns: {
          Kategori: {
            name: "Kategori",
            inferredType: "categorical",
            effectiveType: "categorical",
            semanticRole: "product_category",
            confidenceScore: 0.9,
            cardinality: 2,
            nullableRatio: 0,
            sampleValues: ["A"],
            stats: { totalNulls: 0 },
          },
          Nilai: {
            name: "Nilai",
            inferredType: "numeric",
            effectiveType: "numeric",
            semanticRole: "general",
            confidenceScore: 0.9,
            cardinality: 2,
            nullableRatio: 0,
            sampleValues: [10],
            stats: { totalNulls: 0, sum: 30 },
          },
        },
        createdAt: "now",
      };

      const store = useChartStore.getState();
      const res = store.generateRecommendations(mockDataset, mockMapping);
      expect(res.allRecommendations.length).toBeGreaterThan(0);

      const targetChart = res.mainCharts[0];
      if (targetChart) {
        store.swapChartType(targetChart.id, "bar", mockDataset, mockMapping);
        const updated = useChartStore.getState().activeRecommendations.find((r) => r.id === targetChart.id);
        expect(updated?.chartType).toBe("bar");
      }
    });
  });

  describe("Engine UI Components", () => {
    it("RecommendationCard renders KPI metric with sparkline", () => {
      const mockRec: ChartRecommendation = {
        id: "kpi_1",
        chartType: "kpi_card",
        title: "Total Omset",
        subtitle: "Total semua penjualan",
        confidenceScore: 0.95,
        reasoning: "Metrik agregat tunggal",
        yAxisColumns: ["Omset"],
        aggregationType: "sum",
        data: [],
        kpiMetric: {
          title: "Total Omset",
          value: 15000000,
          formattedValue: "Rp 15.000.000",
          deltaText: "12% vs periode lalu",
          isPositive: true,
          sparklineData: [10, 20, 15, 30],
        },
        orderIndex: 0,
        availableAlternativeTypes: ["kpi_card"],
      };

      render(<RecommendationCard recommendation={mockRec} />);
      expect(screen.getByText(/total omset/i)).toBeInTheDocument();
      expect(screen.getByText("Rp 15.000.000")).toBeInTheDocument();
      expect(screen.getByText(/12% vs periode lalu/i)).toBeInTheDocument();
    });

    it("EnginePreviewContainer renders recommendation overview", () => {
      const mockDataset: DatasetSchema = {
        id: "ds_ui_engine",
        name: "penjualan.csv",
        sourceType: "file",
        headers: ["Tanggal", "Omset"],
        rows: [{ Tanggal: "18/09/2026", Omset: 500000 }],
        rowCount: 1,
        columnCount: 2,
        fileSizeBytes: 100,
        sampleRows: [],
        createdAt: "now",
      };

      const mockMapping: DatasetMapping = {
        datasetId: "ds_ui_engine",
        primaryDateColumn: "Tanggal",
        primaryNumericColumn: "Omset",
        columns: {
          Tanggal: {
            name: "Tanggal",
            inferredType: "datetime",
            effectiveType: "datetime",
            semanticRole: "order_date",
            confidenceScore: 0.95,
            cardinality: 1,
            nullableRatio: 0,
            sampleValues: ["18/09/2026"],
            stats: { totalNulls: 0 },
          },
          Omset: {
            name: "Omset",
            inferredType: "numeric",
            effectiveType: "currency",
            semanticRole: "revenue",
            confidenceScore: 0.95,
            cardinality: 1,
            nullableRatio: 0,
            sampleValues: [500000],
            stats: { totalNulls: 0, sum: 500000 },
          },
        },
        createdAt: "now",
      };

      const handleProceed = vi.fn();
      render(
        <EnginePreviewContainer
          dataset={mockDataset}
          mapping={mockMapping}
          onProceedToRenderer={handleProceed}
        />
      );

      expect(screen.getByText("Rekomendasi Visualisasi Otomatis")).toBeInTheDocument();
      const proceedBtn = screen.getByRole("button", { name: /render echarts dashboard/i });
      fireEvent.click(proceedBtn);
      expect(handleProceed).toHaveBeenCalled();
    });
  });
});
