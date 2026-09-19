import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { parseFlexibleDate, isDateLike } from "@/core/mapping/date-normalizer";
import { matchLocalDictionary } from "@/core/mapping/local-dictionary";
import { inferColumnType, isCurrencyString, isPercentageString } from "@/core/mapping/type-detector";
import { analyzeDatasetColumns } from "@/core/mapping/column-analyzer";
import { useMappingStore } from "@/stores/mapping-store";
import { ColumnRow } from "@/components/modules/mapping/column-row";
import { MappingPanel } from "@/components/modules/mapping/mapping-panel";
import type { DatasetSchema } from "@/types/dataset";
import type { ColumnMetadata } from "@/types/mapping";

describe("Modul 3: Auto Column Mapping & Kamus Lokal", () => {
  describe("Date Normalizer", () => {
    it("parses ISO date string", () => {
      const d = parseFlexibleDate("2026-09-18");
      expect(d).not.toBeNull();
      expect(d?.getFullYear()).toBe(2026);
      expect(d?.getMonth()).toBe(8); // September is 8 (0-indexed)
      expect(d?.getDate()).toBe(18);
    });

    it("parses Indonesian DD/MM/YYYY and DD-MM-YYYY formats", () => {
      const d1 = parseFlexibleDate("18/09/2026");
      expect(d1?.getFullYear()).toBe(2026);
      expect(d1?.getMonth()).toBe(8);
      expect(d1?.getDate()).toBe(18);

      const d2 = parseFlexibleDate("25-12-2025");
      expect(d2?.getFullYear()).toBe(2025);
      expect(d2?.getMonth()).toBe(11); // December is 11
      expect(d2?.getDate()).toBe(25);
    });

    it("parses Indonesian month names (Januari, September, Mei)", () => {
      const d1 = parseFlexibleDate("18 September 2026");
      expect(d1?.getFullYear()).toBe(2026);
      expect(d1?.getMonth()).toBe(8);
      expect(d1?.getDate()).toBe(18);

      const d2 = parseFlexibleDate("12 Jan 2026");
      expect(d2?.getFullYear()).toBe(2026);
      expect(d2?.getMonth()).toBe(0);
      expect(d2?.getDate()).toBe(12);

      const d3 = parseFlexibleDate("1 Mei 2025");
      expect(d3?.getFullYear()).toBe(2025);
      expect(d3?.getMonth()).toBe(4);
      expect(d3?.getDate()).toBe(1);
    });

    it("returns null for non-date strings", () => {
      expect(parseFlexibleDate("Kemeja Polos")).toBeNull();
      expect(parseFlexibleDate("")).toBeNull();
      expect(isDateLike("Bukan Tanggal")).toBe(false);
    });
  });

  describe("Local Indonesian Business & Marketplace Dictionary", () => {
    it("matches Ongkir and Biaya Kirim to shipping_cost role", () => {
      const res1 = matchLocalDictionary("Ongkir");
      expect(res1.role).toBe("shipping_cost");
      expect(res1.suggestedType).toBe("currency");
      expect(res1.confidence).toBeGreaterThanOrEqual(0.9);

      const res2 = matchLocalDictionary("Biaya Pengiriman");
      expect(res2.role).toBe("shipping_cost");
    });

    it("matches Qty and Jumlah Terjual to quantity_sold role", () => {
      const res1 = matchLocalDictionary("Jumlah Terjual");
      expect(res1.role).toBe("quantity_sold");
      expect(res1.suggestedType).toBe("numeric");

      const res2 = matchLocalDictionary("qty");
      expect(res2.role).toBe("quantity_sold");
    });

    it("matches Omset and Total Bayar to revenue role", () => {
      const res1 = matchLocalDictionary("Omset");
      expect(res1.role).toBe("revenue");
      expect(res1.suggestedType).toBe("currency");

      const res2 = matchLocalDictionary("Total Pendapatan");
      expect(res2.role).toBe("revenue");
    });

    it("matches Tanggal Transaksi to order_date role", () => {
      const res = matchLocalDictionary("Tanggal Transaksi");
      expect(res.role).toBe("order_date");
      expect(res.suggestedType).toBe("datetime");
    });

    it("matches Kota Tujuan to city role", () => {
      const res = matchLocalDictionary("Kota Tujuan");
      expect(res.role).toBe("city");
      expect(res.suggestedType).toBe("geolocation");
    });
  });

  describe("Type Detector Inferencing", () => {
    it("detects currency patterns correctly", () => {
      expect(isCurrencyString("Rp 50.000")).toBe(true);
      expect(isCurrencyString("IDR 1500000")).toBe(true);
      expect(isCurrencyString("50000")).toBe(false);

      const detection = inferColumnType(["Rp 10.000", "Rp 25.000", "Rp 50.000"]);
      expect(detection.inferredType).toBe("currency");
      expect(detection.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("detects percentage patterns correctly", () => {
      expect(isPercentageString("15%")).toBe(true);
      expect(isPercentageString("88.5 %")).toBe(true);
      expect(isPercentageString("100")).toBe(false);

      const detection = inferColumnType(["10%", "25%", "45%"]);
      expect(detection.inferredType).toBe("percentage");
    });

    it("detects categorical for small cardinality text sets", () => {
      const detection = inferColumnType([
        "Pakaian",
        "Elektronik",
        "Pakaian",
        "Kuliner",
        "Pakaian",
      ]);
      expect(detection.inferredType).toBe("categorical");
    });
  });

  describe("Column Analyzer Orchestration", () => {
    const mockDataset: DatasetSchema = {
      id: "ds_test_123",
      name: "laporan_penjualan.xlsx",
      sourceType: "file",
      headers: ["Tgl Transaksi", "Nama Produk", "Kategori", "Jumlah Terjual", "Harga Satuan", "Omset"],
      rows: [
        {
          "Tgl Transaksi": "18/09/2026",
          "Nama Produk": "Kemeja Oxford",
          Kategori: "Pakaian Pria",
          "Jumlah Terjual": 10,
          "Harga Satuan": 150000,
          Omset: 1500000,
        },
        {
          "Tgl Transaksi": "19/09/2026",
          "Nama Produk": "Celana Chino",
          Kategori: "Pakaian Pria",
          "Jumlah Terjual": 5,
          "Harga Satuan": 200000,
          Omset: 1000000,
        },
      ],
      rowCount: 2,
      columnCount: 6,
      fileSizeBytes: 4096,
      sampleRows: [],
      createdAt: "2026-09-18T00:00:00Z",
    };

    it("analyzes dataset columns with statistical metadata and primary candidates", () => {
      const mapping = analyzeDatasetColumns(mockDataset);

      expect(mapping.datasetId).toBe("ds_test_123");
      expect(mapping.primaryDateColumn).toBe("Tgl Transaksi");
      expect(mapping.primaryCategoryColumn).toBe("Kategori");
      expect(mapping.primaryNumericColumn).toBe("Jumlah Terjual");

      const tglCol = mapping.columns["Tgl Transaksi"];
      expect(tglCol.effectiveType).toBe("datetime");
      expect(tglCol.semanticRole).toBe("order_date");

      const omsetCol = mapping.columns["Omset"];
      expect(omsetCol.effectiveType).toBe("currency");
      expect(omsetCol.semanticRole).toBe("revenue");
      expect(omsetCol.stats.sum).toBe(2500000);
      expect(omsetCol.stats.avg).toBe(1250000);
    });
  });

  describe("Mapping Zustand Store", () => {
    beforeEach(() => {
      useMappingStore.getState().resetMapping();
    });

    const mockDataset: DatasetSchema = {
      id: "ds_store_test",
      name: "test.csv",
      sourceType: "file",
      headers: ["Kategori", "Jumlah"],
      rows: [{ Kategori: "A", Jumlah: 10 }],
      rowCount: 1,
      columnCount: 2,
      fileSizeBytes: 100,
      sampleRows: [],
      createdAt: "2026-09-18T00:00:00Z",
    };

    it("generates mapping and allows overriding column type", () => {
      const store = useMappingStore.getState();
      store.generateMapping(mockDataset);

      const mapping = useMappingStore.getState().mapping;
      expect(mapping).not.toBeNull();
      expect(mapping?.columns["Jumlah"].effectiveType).toBe("numeric");

      // Override type
      store.updateColumnType("Jumlah", "currency");
      const updated = useMappingStore.getState().mapping;
      expect(updated?.columns["Jumlah"].effectiveType).toBe("currency");
      expect(updated?.columns["Jumlah"].userOverrideType).toBe("currency");
    });
  });

  describe("Mapping UI Components", () => {
    const mockColumn: ColumnMetadata = {
      name: "Total Pendapatan",
      inferredType: "numeric",
      effectiveType: "currency",
      semanticRole: "revenue",
      confidenceScore: 0.95,
      cardinality: 15,
      nullableRatio: 0,
      sampleValues: ["Rp 100.000", "Rp 250.000"],
      stats: { totalNulls: 0, sum: 350000 },
    };

    it("ColumnRow renders column details and triggers onTypeChange on select", () => {
      const handleTypeChange = vi.fn();
      render(<ColumnRow column={mockColumn} onTypeChange={handleTypeChange} />);

      expect(screen.getByText("Total Pendapatan")).toBeInTheDocument();
      expect(screen.getByText(/Peran: Total Pendapatan \/ Omset/i)).toBeInTheDocument();
      expect(screen.getByText("95%")).toBeInTheDocument();

      const select = screen.getByLabelText(/Tipe Data:/i);
      fireEvent.change(select, { target: { value: "numeric" } });
      expect(handleTypeChange).toHaveBeenCalledWith("numeric");
    });

    it("MappingPanel renders filter and primary dimensions", () => {
      const mockDataset: DatasetSchema = {
        id: "ds_ui",
        name: "data.csv",
        sourceType: "file",
        headers: ["Tanggal", "Produk"],
        rows: [{ Tanggal: "2026-09-18", Produk: "Sepatu" }],
        rowCount: 1,
        columnCount: 2,
        fileSizeBytes: 200,
        sampleRows: [],
        createdAt: "now",
      };

      useMappingStore.getState().generateMapping(mockDataset);

      const handleProceed = vi.fn();
      render(<MappingPanel onProceed={handleProceed} />);

      expect(screen.getByText("Konfigurasi Struktur Data")).toBeInTheDocument();
      expect(screen.getByText(/Daftar Kolom \(2\)/i)).toBeInTheDocument();

      const proceedBtn = screen.getByRole("button", { name: /lanjutkan ke analisis data/i });
      fireEvent.click(proceedBtn);
      expect(handleProceed).toHaveBeenCalled();
    });
  });
});
