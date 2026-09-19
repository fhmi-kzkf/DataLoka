import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as XLSX from "xlsx";
import { parseCsvContent, cleanHeaderName } from "@/core/parser/csv-parser";
import { parseExcelArrayBuffer } from "@/core/parser/excel-parser";
import { parseGoogleSheetUrl } from "@/core/parser/gsheet-parser";
import { parseClipboardText } from "@/core/parser/clipboard-parser";
import { parseFile } from "@/core/parser/file-parser";
import { useDatasetStore } from "@/stores/dataset-store";
import { IngestDropzone } from "@/components/modules/ingest/ingest-dropzone";
import { GSheetInput } from "@/components/modules/ingest/gsheet-input";
import { ClipboardPasteArea } from "@/components/modules/ingest/clipboard-paste-area";
import { TablePreview } from "@/components/modules/ingest/table-preview";
import { IngestProgress } from "@/components/modules/ingest/ingest-progress";

describe("Modul 2: Ingest Data Engine & Parsers", () => {
  describe("CSV Parser & Header Sanitizer", () => {
    it("cleans formula injection prefixes from header names", () => {
      expect(cleanHeaderName("=cmd|' /C calc'!A0", 0)).toBe("cmd|' /C calc'!A0");
      expect(cleanHeaderName("+Ongkir", 1)).toBe("Ongkir");
      expect(cleanHeaderName("@Total", 2)).toBe("Total");
      expect(cleanHeaderName("", 3)).toBe("Kolom_4");
    });

    it("parses valid CSV content into structured DatasetSchema", async () => {
      const csv = `Produk,Kategori,Jumlah,Harga\nKaos Polos,Pakaian,10,50000\nCelana Jeans,Pakaian,5,150000\nSepatu Sneaker,Alas Kaki,2,300000`;
      const progressFn = vi.fn();

      const dataset = await parseCsvContent(csv, {
        name: "penjualan.csv",
        onProgress: progressFn,
      });

      expect(dataset.name).toBe("penjualan.csv");
      expect(dataset.headers).toEqual(["Produk", "Kategori", "Jumlah", "Harga"]);
      expect(dataset.rowCount).toBe(3);
      expect(dataset.rows[0].Produk).toBe("Kaos Polos");
      expect(dataset.rows[0].Jumlah).toBe(10);
      expect(dataset.sampleRows.length).toBe(3);
      expect(progressFn).toHaveBeenCalled();
    });

    it("rejects empty CSV content", async () => {
      await expect(parseCsvContent("")).rejects.toThrow("File CSV tidak memiliki baris data");
    });
  });

  describe("Excel Parser (XLSX / SheetJS)", () => {
    it("parses XLSX binary array buffer into DatasetSchema", async () => {
      // Create an in-memory workbook
      const wsData = [
        ["Nama", "Kota", "Omset"],
        ["Toko A", "Jakarta", 5000000],
        ["Toko B", "Surabaya", 3500000],
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Penjualan_Jawa");
      const wbArrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const dataset = await parseExcelArrayBuffer(wbArrayBuffer, {
        name: "laporan.xlsx",
      });

      expect(dataset.name).toBe("laporan.xlsx");
      expect(dataset.headers).toEqual(["Nama", "Kota", "Omset"]);
      expect(dataset.rowCount).toBe(2);
      expect(dataset.rows[0].Nama).toBe("Toko A");
      expect(dataset.rows[0].Omset).toBe(5000000);
      expect(dataset.sheetNames).toEqual(["Penjualan_Jawa"]);
      expect(dataset.activeSheet).toBe("Penjualan_Jawa");
    });
  });

  describe("Google Sheets URL Parser", () => {
    it("extracts sheet ID and gid correctly from standard share URL", () => {
      const url = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=123456";
      const parsed = parseGoogleSheetUrl(url);

      expect(parsed).not.toBeNull();
      expect(parsed?.sheetId).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");
      expect(parsed?.gid).toBe("123456");
      expect(parsed?.exportCsvUrl).toBe(
        "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv&gid=123456"
      );
    });

    it("defaults gid to 0 when missing", () => {
      const url = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit";
      const parsed = parseGoogleSheetUrl(url);

      expect(parsed).not.toBeNull();
      expect(parsed?.gid).toBe("0");
    });

    it("returns null for non-Google Sheets URL", () => {
      expect(parseGoogleSheetUrl("https://example.com/sheet.xlsx")).toBeNull();
    });
  });

  describe("Clipboard Parser", () => {
    it("parses tab-separated TSV text from clipboard", async () => {
      const tsv = "ID\tNama Pelanggan\tTotal Transaksi\n1\tAhmad\t150000\n2\tBudi\t250000";
      const dataset = await parseClipboardText(tsv);

      expect(dataset.headers).toEqual(["ID", "Nama Pelanggan", "Total Transaksi"]);
      expect(dataset.rowCount).toBe(2);
      expect(dataset.sourceType).toBe("clipboard");
    });

    it("rejects single line clipboard text", async () => {
      await expect(parseClipboardText("Hanya Satu Baris")).rejects.toThrow(
        "Data clipboard harus memiliki minimal 1 baris header dan 1 baris data"
      );
    });
  });

  describe("File Parser Orchestrator & Size Validation", () => {
    it("rejects files exceeding 25 MB limit", async () => {
      const mockLargeFile = new File([new ArrayBuffer(26 * 1024 * 1024)], "huge.csv", {
        type: "text/csv",
      });

      await expect(parseFile(mockLargeFile)).rejects.toThrow(/melebihi batas pemrosesan lokal 25 MB/);
    });

    it("rejects unsupported file formats like .pdf", async () => {
      const mockPdf = new File(["dummy pdf content"], "doc.pdf", {
        type: "application/pdf",
      });

      await expect(parseFile(mockPdf)).rejects.toThrow(/Format berkas "\.pdf" tidak didukung/);
    });
  });

  describe("Zustand Dataset Store", () => {
    beforeEach(() => {
      useDatasetStore.getState().reset();
    });

    it("manages active tab selection and clears errors", () => {
      const store = useDatasetStore.getState();
      store.setActiveTab("gsheet");
      expect(useDatasetStore.getState().activeTab).toBe("gsheet");

      store.setActiveTab("clipboard");
      expect(useDatasetStore.getState().activeTab).toBe("clipboard");
    });

    it("resets store state properly", () => {
      const store = useDatasetStore.getState();
      store.setDataset({
        id: "test",
        name: "test.csv",
        sourceType: "file",
        headers: ["A"],
        rows: [{ A: 1 }],
        rowCount: 1,
        columnCount: 1,
        fileSizeBytes: 100,
        sampleRows: [{ A: 1 }],
        createdAt: "now",
      });

      expect(useDatasetStore.getState().dataset).not.toBeNull();
      store.reset();
      expect(useDatasetStore.getState().dataset).toBeNull();
    });
  });

  describe("Ingest UI Components", () => {
    it("IngestDropzone handles file input selection", () => {
      const handleFileSelected = vi.fn();
      render(<IngestDropzone onFileSelected={handleFileSelected} />);

      const input = screen.getByTestId("file-input-hidden");
      const file = new File(["col1,col2\n1,2"], "test.csv", { type: "text/csv" });

      fireEvent.change(input, { target: { files: [file] } });
      expect(handleFileSelected).toHaveBeenCalledWith(file);
    });

    it("GSheetInput validates empty submission", () => {
      const handleSubmit = vi.fn();
      render(<GSheetInput onSubmit={handleSubmit} />);

      const submitBtn = screen.getByRole("button", { name: /muat google sheets/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/silakan masukkan tautan google sheets/i)).toBeInTheDocument();
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("ClipboardPasteArea warns on invalid line count", () => {
      const handlePaste = vi.fn();
      render(<ClipboardPasteArea onPasteSubmit={handlePaste} />);

      const textarea = screen.getByPlaceholderText(/Nama Produk/);
      fireEvent.change(textarea, { target: { value: "Satu Baris Saja" } });

      const submitBtn = screen.getByRole("button", { name: /proses data clipboard/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/data harus memiliki minimal 2 baris/i)).toBeInTheDocument();
      expect(handlePaste).not.toHaveBeenCalled();
    });

    it("IngestProgress displays percentage and stage message", () => {
      render(
        <IngestProgress percentage={45} stage="parsing" message="Sedang membaca data..." />
      );

      expect(screen.getByText("45%")).toBeInTheDocument();
      expect(screen.getByText("Membedah baris")).toBeInTheDocument();
      expect(screen.getByText("Sedang membaca data...")).toBeInTheDocument();
      const fillBar = screen.getByTestId("progress-bar-fill");
      expect(fillBar).toHaveStyle({ width: "45%" });
    });

    it("TablePreview renders headers, rows, and summary information", () => {
      const mockDataset = {
        id: "ds_1",
        name: "laporan_toko.csv",
        sourceType: "file" as const,
        headers: ["Produk", "Stok", "Harga"],
        rows: [
          { Produk: "Baju", Stok: 12, Harga: 75000 },
          { Produk: "Celana", Stok: 8, Harga: 120000 },
        ],
        rowCount: 2,
        columnCount: 3,
        fileSizeBytes: 2048,
        sampleRows: [
          { Produk: "Baju", Stok: 12, Harga: 75000 },
          { Produk: "Celana", Stok: 8, Harga: 120000 },
        ],
        createdAt: "2026-09-18T00:00:00Z",
      };

      const handleProceed = vi.fn();
      const handleReset = vi.fn();

      render(
        <TablePreview
          dataset={mockDataset}
          onProceed={handleProceed}
          onReset={handleReset}
        />
      );

      expect(screen.getByText("laporan_toko.csv")).toBeInTheDocument();
      expect(screen.getByText(/2 baris • 3 kolom • 2.0 KB/i)).toBeInTheDocument();
      expect(screen.getByText("Produk")).toBeInTheDocument();
      expect(screen.getByText("Baju")).toBeInTheDocument();

      const proceedBtn = screen.getByRole("button", { name: /lanjutkan ke pemetaan/i });
      fireEvent.click(proceedBtn);
      expect(handleProceed).toHaveBeenCalled();
    });
  });
});
