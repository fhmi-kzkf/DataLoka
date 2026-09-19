import type { AiColumnClassification } from "./ai-types";

interface SemanticRule {
  patterns: RegExp[];
  role: "time" | "category" | "metric" | "identifier" | "location" | "general";
  dataType: "datetime" | "categorical" | "numeric" | "currency" | "percentage" | "text";
  standardizedAlias: string;
  confidence: number;
}

const INDONESIAN_SEMANTIC_RULES: SemanticRule[] = [
  // 1. Time / Date Dimensions
  {
    patterns: [/tanggal/i, /tgl/i, /date/i, /waktu/i, /periode/i, /bulan/i, /tahun/i, /created_at/i, /transaksi_date/i],
    role: "time",
    dataType: "datetime",
    standardizedAlias: "dim_waktu",
    confidence: 0.95,
  },
  // 2. Financial Metrics / Revenue / GMV
  {
    patterns: [/total_penjualan/i, /omset/i, /omzet/i, /revenue/i, /pendapatan/i, /harga/i, /subtotal/i, /gmv/i, /grand_total/i, /total_bayar/i],
    role: "metric",
    dataType: "currency",
    standardizedAlias: "metrik_omset",
    confidence: 0.96,
  },
  // 3. Operational Costs / Shipping
  {
    patterns: [/ongkir/i, /ongkos_kirim/i, /shipping/i, /cogs/i, /hpp/i, /biaya/i, /beban/i, /diskon/i, /potongan/i],
    role: "metric",
    dataType: "currency",
    standardizedAlias: "metrik_biaya",
    confidence: 0.92,
  },
  // 4. Volume Metrics / Quantities
  {
    patterns: [/jumlah/i, /qty/i, /quantity/i, /pesanan/i, /order_count/i, /volume/i, /stok/i, /terjual/i, /total_unit/i],
    role: "metric",
    dataType: "numeric",
    standardizedAlias: "metrik_kuantitas",
    confidence: 0.94,
  },
  // 5. Margin / Rates / Percentages
  {
    patterns: [/margin/i, /persen/i, /percent/i, /rate/i, /roas/i, /ctr/i, /roi/i, /ratio/i, /rasio/i],
    role: "metric",
    dataType: "percentage",
    standardizedAlias: "metrik_rasio",
    confidence: 0.9,
  },
  // 6. Marketplace & Product Categories
  {
    patterns: [/kategori/i, /category/i, /produk/i, /nama_barang/i, /item/i, /sku/i, /brand/i, /merek/i, /tipe/i, /channel/i, /platform/i],
    role: "category",
    dataType: "categorical",
    standardizedAlias: "dim_kategori",
    confidence: 0.93,
  },
  // 7. Regional / Location Dimensions
  {
    patterns: [/wilayah/i, /kota/i, /provinsi/i, /region/i, /lokasi/i, /alamat/i, /area/i, /cabang/i],
    role: "location",
    dataType: "categorical",
    standardizedAlias: "dim_wilayah",
    confidence: 0.91,
  },
  // 8. Order / Transaction Identifiers
  {
    patterns: [/id/i, /no_pesanan/i, /invoice/i, /nomor/i, /resi/i, /kode/i, /trx_id/i],
    role: "identifier",
    dataType: "text",
    standardizedAlias: "id_transaksi",
    confidence: 0.88,
  },
];

export class AiColumnMapper {
  static classifyColumn(columnName: string, sampleValues: unknown[] = []): AiColumnClassification {
    const cleanName = columnName.trim().toLowerCase();

    for (const rule of INDONESIAN_SEMANTIC_RULES) {
      if (rule.patterns.some((pattern) => pattern.test(cleanName))) {
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
    const nonNullValues = sampleValues.filter((v) => v !== null && v !== undefined && v !== "");
    if (nonNullValues.length > 0) {
      const allNumeric = nonNullValues.every((v) => typeof v === "number" || (!isNaN(Number(v)) && String(v).trim() !== ""));
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
