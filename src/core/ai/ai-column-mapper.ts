import type { AiColumnClassification } from "./ai-types";

interface SemanticRule {
  patterns: RegExp[];
  role: "time" | "category" | "metric" | "identifier" | "location" | "general";
  dataType: "datetime" | "categorical" | "numeric" | "currency" | "percentage" | "text";
  standardizedAlias: string;
  confidence: number;
}

const INDONESIAN_SEMANTIC_RULES: SemanticRule[] = [
  // 1. Order / Transaction Identifiers
  {
    patterns: [/^id$/i, /id_transaksi/i, /no_pesanan/i, /invoice/i, /nomor_resi/i, /resi/i, /trx_id/i, /kode_pesanan/i],
    role: "identifier",
    dataType: "text",
    standardizedAlias: "id_transaksi",
    confidence: 0.95,
  },
  // 2. Marketplace, Categories & Product Names
  {
    patterns: [/kategori/i, /category/i, /produk/i, /nama_barang/i, /item/i, /sku/i, /brand/i, /merek/i, /tipe/i, /channel/i, /platform/i, /status/i, /metode/i],
    role: "category",
    dataType: "categorical",
    standardizedAlias: "dim_kategori",
    confidence: 0.96,
  },
  // 3. Regional / Location Dimensions
  {
    patterns: [/wilayah/i, /kota/i, /provinsi/i, /region/i, /lokasi/i, /alamat/i, /area/i, /cabang/i],
    role: "location",
    dataType: "categorical",
    standardizedAlias: "dim_wilayah",
    confidence: 0.94,
  },
  // 4. Time / Date Dimensions
  {
    patterns: [/tanggal/i, /tgl/i, /date/i, /waktu/i, /periode/i, /bulan/i, /tahun/i, /created_at/i, /transaksi_date/i],
    role: "time",
    dataType: "datetime",
    standardizedAlias: "dim_waktu",
    confidence: 0.95,
  },
  // 5. Financial Metrics / Revenue / GMV
  {
    patterns: [/total_penjualan/i, /omset/i, /omzet/i, /revenue/i, /pendapatan/i, /harga/i, /subtotal/i, /gmv/i, /grand_total/i, /total_bayar/i, /nilai/i],
    role: "metric",
    dataType: "currency",
    standardizedAlias: "metrik_omset",
    confidence: 0.96,
  },
  // 6. Operational Costs / Shipping
  {
    patterns: [/ongkir/i, /ongkos_kirim/i, /shipping/i, /cogs/i, /hpp/i, /biaya/i, /beban/i, /diskon/i, /potongan/i],
    role: "metric",
    dataType: "currency",
    standardizedAlias: "metrik_biaya",
    confidence: 0.92,
  },
  // 7. Volume Metrics / Quantities
  {
    patterns: [/jumlah/i, /qty/i, /quantity/i, /volume/i, /stok/i, /terjual/i, /total_unit/i, /jumlah_pesanan/i, /total_pesanan/i, /banyak_pesanan/i],
    role: "metric",
    dataType: "numeric",
    standardizedAlias: "metrik_kuantitas",
    confidence: 0.94,
  },
  // 8. Margin / Rates / Percentages
  {
    patterns: [/margin/i, /persen/i, /percent/i, /rate/i, /roas/i, /ctr/i, /roi/i, /ratio/i, /rasio/i],
    role: "metric",
    dataType: "percentage",
    standardizedAlias: "metrik_rasio",
    confidence: 0.9,
  },
];

export class AiColumnMapper {
  static classifyColumn(columnName: string, sampleValues: unknown[] = []): AiColumnClassification {
    const cleanName = columnName.trim().toLowerCase();
    const nonNullValues = sampleValues.filter((v) => v !== null && v !== undefined && v !== "");

    // If we have sample values and they are non-numeric strings (e.g. "Fashion", "Baju", "Selesai"), it cannot be a metric
    const isExplicitString = nonNullValues.length > 0 && nonNullValues.some((v) => typeof v === "string" && isNaN(Number(v.replace(/[^0-9.-]/g, ""))));

    for (const rule of INDONESIAN_SEMANTIC_RULES) {
      if (rule.patterns.some((pattern) => pattern.test(cleanName))) {
        // If classified as metric but sample values are clearly text, demote to category
        if (rule.role === "metric" && isExplicitString) {
          return {
            columnName,
            semanticRole: "category",
            detectedDataType: "categorical",
            confidence: 0.9,
            rationale: `Header '${columnName}' berisi sampel teks kategorikal.`,
            standardizedAlias: `dim_${cleanName.replace(/\W+/g, "_")}`,
          };
        }

        return {
          columnName,
          semanticRole: rule.role,
          detectedDataType: rule.dataType,
          confidence: rule.confidence,
          rationale: `Pola header '${columnName}' cocok dengan kamus semantic Indonesia [${rule.standardizedAlias}].`,
          standardizedAlias: rule.standardizedAlias,
        };
      }
    }

    // Heuristic analysis based on sample values
    if (nonNullValues.length > 0) {
      const allNumeric = nonNullValues.every((v) => typeof v === "number" || (!isNaN(Number(String(v).replace(/[^0-9.-]/g, ""))) && String(v).trim() !== ""));
      if (allNumeric) {
        return {
          columnName,
          semanticRole: "metric",
          detectedDataType: "numeric",
          confidence: 0.75,
          rationale: `Nilai sampel kolom '${columnName}' seluruhnya bernilai numerik.`,
          standardizedAlias: `metrik_${cleanName.replace(/\W+/g, "_")}`,
        };
      }

      const isDateLikely = nonNullValues.some((v) => !isNaN(Date.parse(String(v))) && !/^\d+$/.test(String(v)));
      if (isDateLikely) {
        return {
          columnName,
          semanticRole: "time",
          detectedDataType: "datetime",
          confidence: 0.78,
          rationale: `Nilai sampel kolom '${columnName}' terdeteksi sebagai format timestamp/kalender.`,
          standardizedAlias: `waktu_${cleanName.replace(/\W+/g, "_")}`,
        };
      }
    }

    return {
      columnName,
      semanticRole: "general",
      detectedDataType: "text",
      confidence: 0.5,
      rationale: `Kolom '${columnName}' diklasifikasikan sebagai atribut tekstual umum.`,
      standardizedAlias: `col_${cleanName.replace(/\W+/g, "_")}`,
    };
  }

  static classifyAllColumns(headers: string[], sampleRows: Array<Record<string, unknown>> = []): AiColumnClassification[] {
    return headers.map((header) => {
      const samples = sampleRows.map((r) => r[header]);
      return this.classifyColumn(header, samples);
    });
  }
}
