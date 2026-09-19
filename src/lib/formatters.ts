/**
 * Formatters and Text Humanization Utilities for DataLoka
 */

const DICTIONARY: Record<string, string> = {
  total_penjualan: "Total Penjualan",
  jumlah_pesanan: "Jumlah Pesanan",
  total_transaksi: "Total Transaksi",
  total_pendapatan: "Total Pendapatan",
  omset: "Total Omset",
  omzet: "Total Omzet",
  wilayah: "Wilayah",
  kategori: "Kategori",
  tanggal: "Tanggal",
  produk: "Produk",
  harga_satuan: "Harga Satuan",
  nilai: "Nilai",
  kuantitas: "Kuantitas",
  qty: "Jumlah Unit (Qty)",
  margin: "Margin Keuntungan",
  profit: "Keuntungan Bersih",
  pelanggan: "Pelanggan",
  customer: "Pelanggan",
  kota: "Kota",
  provinsi: "Provinsi",
  status: "Status Transaksi",
  metode_pembayaran: "Metode Pembayaran",
  aov: "AOV Aktual",
  avg_order_value: "AOV Aktual",
  avgordervalue: "AOV Aktual",
  cac: "CAC (Biaya Akuisisi)",
  roas: "ROAS (Return on Ad Spend)",
  ltv: "LTV (Nilai Umur Pelanggan)",
};

/**
 * Humanizes raw column names from snake_case, kebab-case, camelCase, or ALL_CAPS
 * into natural Title Case Indonesian business terminology.
 */
export function humanizeColumnName(raw: string | undefined | null): string {
  if (!raw) return "";

  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  const stripped = lower.replace(/[^a-z0-9]/g, "");

  // 1. Direct dictionary match
  if (DICTIONARY[lower]) {
    return DICTIONARY[lower];
  }
  if (DICTIONARY[stripped]) {
    return DICTIONARY[stripped];
  }

  // 2. Clean snake_case, kebab-case, or periods
  let cleaned = trimmed
    .replace(/[_\-.]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2"); // split camelCase

  // 3. Title case words
  const words = cleaned.split(/\s+/).filter(Boolean);
  const capitalized = words.map((word) => {
    const wLower = word.toLowerCase();
    if (DICTIONARY[wLower]) return DICTIONARY[wLower];
    if (["dan", "atau", "per", "di", "ke", "dari", "vs", "pada"].includes(wLower)) {
      return wLower;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return capitalized.join(" ");
}

/**
 * Humanizes chart titles and subtitles, replacing raw column identifiers
 */
export function humanizeChartTitle(rawTitle: string | undefined | null): string {
  if (!rawTitle) return "";

  let result = rawTitle;

  // Replace common patterns like "total_penjualan & jumlah_pesanan"
  Object.keys(DICTIONARY).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    result = result.replace(regex, DICTIONARY[key]);
  });

  // Clean remaining snake_cases
  result = result.replace(/([a-zA-Z0-9]+)_([a-zA-Z0-9]+)/g, (_, p1, p2) => {
    return `${humanizeColumnName(p1)} ${humanizeColumnName(p2)}`;
  });

  return result;
}

/**
 * Formats a number to Indonesian Rupiah currency string
 */
export function formatCurrencyIDR(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Formats a number into compact string (e.g., Rp 1,5M, 250k)
 */
export function formatCompactNumber(val: number, isCurrency = false): string {
  if (val >= 1_000_000_000) {
    const formatted = (val / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 });
    return isCurrency ? `Rp ${formatted} Miliar` : `${formatted}B`;
  }
  if (val >= 1_000_000) {
    const formatted = (val / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 });
    return isCurrency ? `Rp ${formatted} Jt` : `${formatted}M`;
  }
  if (val >= 1_000) {
    const formatted = (val / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 });
    return isCurrency ? `Rp ${formatted} rb` : `${formatted}k`;
  }
  return isCurrency ? formatCurrencyIDR(val) : val.toLocaleString("id-ID");
}
