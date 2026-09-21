import type { SemanticRole, DataType } from "@/types/mapping";

export interface DictionaryRule {
  role: SemanticRole;
  targetType: DataType;
  keywords: string[];
  patterns: RegExp[];
  confidence: number;
}

export const LOCAL_DICTIONARY_RULES: DictionaryRule[] = [
  {
    role: "identifier",
    targetType: "text",
    keywords: [
      "id",
      "id transaksi",
      "id_transaksi",
      "no transaksi",
      "trx id",
      "transaction id",
      "no pesanan",
      "nomor resi",
      "order id",
      "invoice",
      "no invoice",
      "kode",
      "sku",
      "kode produk",
      "kode barang",
      "kode item",
    ],
    patterns: [/^(id|id_|no_|nomor_|code_|kode_|trx_|sku)/i, /(_id|_no|_code|_sku)$/i],
    confidence: 0.98,
  },
  {
    role: "quantity_sold",
    targetType: "numeric",
    keywords: [
      "jumlah terjual",
      "qty",
      "quantity",
      "jumlah pesanan",
      "kuantitas",
      "banyaknya",
      "volume",
      "jumlah item",
      "pcs",
      "terjual",
    ],
    patterns: [/^(jumlah_terjual|qty|kuantitas|volume|pcs|terjual)(_|\s)?/i],
    confidence: 0.95,
  },
  {
    role: "shipping_cost",
    targetType: "currency",
    keywords: [
      "ongkir",
      "biaya kirim",
      "ongkos kirim",
      "tarif pengiriman",
      "ongkos",
      "shipping fee",
      "shipping cost",
      "ongkir dibayar",
      "biaya pengiriman",
      "ongkos pengiriman",
    ],
    patterns: [/ongk(ir|os)/i, /biaya_?(kirim|pengiriman)/i, /pengiriman/i, /shipping/i],
    confidence: 0.95,
  },
  {
    role: "order_date",
    targetType: "datetime",
    keywords: [
      "tanggal transaksi",
      "waktu transaksi",
      "waktu pesanan",
      "tgl bayar",
      "tgl order",
      "waktu pembayaran",
      "tanggal checkout",
      "tgl pesanan",
      "created at",
      "order date",
      "waktu dibuat",
      "tanggal",
      "tgl",
      "waktu",
      "date",
      "datetime",
      "timestamp",
    ],
    patterns: [/^(tgl|tanggal|waktu|date|time|timestamp|created_at|updated_at)/i],
    confidence: 0.95,
  },
  {
    role: "revenue",
    targetType: "currency",
    keywords: [
      "total pendapatan",
      "omset",
      "omzet",
      "total bayar",
      "nilai transaksi",
      "harga total",
      "penjualan bersih",
      "gross revenue",
      "total harga",
      "subtotal",
      "grand total",
      "total",
      "pendapatan",
      "omzet penjualan",
    ],
    patterns: [/^(total_bayar|total_penjualan|omset|omzet|pendapatan|revenue|grand_total)/i, /(bayar|penjualan)$/i],
    confidence: 0.93,
  },
  {
    role: "unit_price",
    targetType: "currency",
    keywords: [
      "harga satuan",
      "harga produk",
      "harga jual",
      "harga pokok",
      "unit price",
      "harga",
      "price",
      "tarif",
    ],
    patterns: [/^(harga|price|tarif)/i],
    confidence: 0.92,
  },
  {
    role: "payment_method",
    targetType: "categorical",
    keywords: [
      "metode pembayaran",
      "metode_pembayaran",
      "tipe bayar",
      "channel pembayaran",
      "metode bayar",
      "payment method",
      "cara bayar",
    ],
    patterns: [/^(metode|cara|channel|tipe)_?(bayar|pembayaran|payment)/i],
    confidence: 0.95,
  },
  {
    role: "product_category",
    targetType: "categorical",
    keywords: [
      "kategori pesanan",
      "kategori_pesanan",
      "kategori produk",
      "jenis barang",
      "varian",
      "kelompok produk",
      "kategori",
      "category",
      "tipe barang",
      "segmen",
      "channel",
      "platform",
    ],
    patterns: [/^(kategori|category|jenis|kelompok|segmen|channel|platform)/i],
    confidence: 0.92,
  },
  {
    role: "product_name",
    targetType: "text",
    keywords: [
      "nama menu",
      "nama_menu",
      "nama produk",
      "nama barang",
      "item",
      "produk",
      "deskripsi produk",
      "product name",
      "nama item",
      "menu",
    ],
    patterns: [/^(nama_menu|nama_produk|nama_barang|menu|produk|item|barang)/i],
    confidence: 0.92,
  },
  {
    role: "customer_name",
    targetType: "text",
    keywords: [
      "nama pembeli",
      "nama pelanggan",
      "customer",
      "konsumen",
      "pembeli",
      "client",
      "nama user",
    ],
    patterns: [/^(customer|pembeli|pelanggan|konsumen|user)/i],
    confidence: 0.88,
  },
  {
    role: "city",
    targetType: "geolocation",
    keywords: [
      "kota",
      "kabupaten",
      "kota tujuan",
      "wilayah",
      "daerah",
      "city",
      "kab",
      "lokasi",
    ],
    patterns: [/^(kota|kabupaten|kab|city|wilayah)/i],
    confidence: 0.89,
  },
  {
    role: "province",
    targetType: "geolocation",
    keywords: ["provinsi", "province", "propinsi"],
    patterns: [/^(provinsi|propinsi|province)/i],
    confidence: 0.9,
  },
  {
    role: "discount",
    targetType: "currency",
    keywords: [
      "diskon",
      "potongan harga",
      "voucher",
      "cashback",
      "discount",
      "promo",
      "potongan",
    ],
    patterns: [/^(diskon|discount|voucher|potongan|cashback)/i],
    confidence: 0.9,
  },
  {
    role: "profit",
    targetType: "currency",
    keywords: ["keuntungan", "laba", "margin", "laba bersih", "profit", "net profit"],
    patterns: [/^(laba|profit|keuntungan|margin)/i],
    confidence: 0.9,
  },
];

export function matchLocalDictionary(headerName: string): {
  role: SemanticRole;
  suggestedType: DataType;
  confidence: number;
} {
  const normalized = headerName.trim().toLowerCase();

  for (const rule of LOCAL_DICTIONARY_RULES) {
    // Exact match in keywords
    if (rule.keywords.includes(normalized)) {
      return {
        role: rule.role,
        suggestedType: rule.targetType,
        confidence: rule.confidence,
      };
    }

    // Pattern regex match
    for (const pattern of rule.patterns) {
      if (pattern.test(normalized)) {
        return {
          role: rule.role,
          suggestedType: rule.targetType,
          confidence: Math.max(0.75, rule.confidence - 0.05),
        };
      }
    }
  }

  return {
    role: "general",
    suggestedType: "text",
    confidence: 0.5,
  };
}
