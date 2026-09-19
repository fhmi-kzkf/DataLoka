import { describe, it, expect } from "vitest";
import {
  humanizeColumnName,
  humanizeChartTitle,
  formatCurrencyIDR,
  formatCompactNumber,
} from "@/lib/formatters";

describe("Formatters & Text Humanizer Utilities", () => {
  describe("humanizeColumnName", () => {
    it("converts snake_case to natural Title Case Indonesian labels", () => {
      expect(humanizeColumnName("total_penjualan")).toBe("Total Penjualan");
      expect(humanizeColumnName("jumlah_pesanan")).toBe("Jumlah Pesanan");
      expect(humanizeColumnName("wilayah")).toBe("Wilayah");
      expect(humanizeColumnName("kategori")).toBe("Kategori");
      expect(humanizeColumnName("harga_satuan")).toBe("Harga Satuan");
    });

    it("handles ALL_CAPS and camelCase column names gracefully", () => {
      expect(humanizeColumnName("TOTAL_PENJUALAN")).toBe("Total Penjualan");
      expect(humanizeColumnName("JUMLAH_PESANAN")).toBe("Jumlah Pesanan");
      expect(humanizeColumnName("totalPenjualan")).toBe("Total Penjualan");
      expect(humanizeColumnName("avgOrderValue")).toBe("AOV Aktual");
    });

    it("handles null, undefined, or empty strings safely", () => {
      expect(humanizeColumnName("")).toBe("");
      expect(humanizeColumnName(null)).toBe("");
      expect(humanizeColumnName(undefined)).toBe("");
    });
  });

  describe("humanizeChartTitle", () => {
    it("cleans raw snake_case combinations in chart titles", () => {
      expect(
        humanizeChartTitle("Tren total_penjualan & jumlah_pesanan Berdasarkan Waktu")
      ).toBe("Tren Total Penjualan & Jumlah Pesanan Berdasarkan Waktu");

      expect(
        humanizeChartTitle("Sebaran total_penjualan Berdasarkan wilayah")
      ).toBe("Sebaran Total Penjualan Berdasarkan Wilayah");
    });
  });

  describe("formatCurrencyIDR & formatCompactNumber", () => {
    it("formats Indonesian Rupiah values correctly", () => {
      const formatted = formatCurrencyIDR(154406);
      expect(formatted).toContain("154.406");
      expect(formatted).toContain("Rp");
    });

    it("formats compact numeric values with proper suffix", () => {
      expect(formatCompactNumber(10000000, true)).toContain("Jt");
      expect(formatCompactNumber(1500000000, true)).toContain("Miliar");
      expect(formatCompactNumber(250000, true)).toContain("rb");
    });
  });
});
