import type { DatasetSchema, DatasetRow, DatasetValue } from "@/types/dataset";
import { parseFlexibleDate } from "@/core/mapping/date-normalizer";

// Payment Method Canonical Map
const PAYMENT_CANONICAL_MAP: Record<string, string> = {
  qris: "QRIS",
  "q-ris": "QRIS",
  ovo: "OVO",
  gopay: "GoPay",
  "go-pay": "GoPay",
  "gopay-later": "GoPay Later",
  "spay": "ShopeePay",
  shopeepay: "ShopeePay",
  "shopee pay": "ShopeePay",
  "shopee-pay": "ShopeePay",
  tunai: "Tunai",
  cash: "Tunai",
  bca: "Transfer BCA",
  "transfer bca": "Transfer BCA",
  "bca transfer": "Transfer BCA",
  "transfer_bca": "Transfer BCA",
  mandiri: "Transfer Mandiri",
  "transfer mandiri": "Transfer Mandiri",
  bri: "Transfer BRI",
  "transfer bri": "Transfer BRI",
  bni: "Transfer BNI",
  "transfer bni": "Transfer BNI",
  "kartu kredit": "Kartu Kredit",
  "credit card": "Kartu Kredit",
  "kartu debit": "Kartu Debit",
  "debit card": "Kartu Debit",
  dana: "DANA",
  linkaja: "LinkAja",
  "link aja": "LinkAja",
};

// Channel / Platform Canonical Map
const CHANNEL_CANONICAL_MAP: Record<string, string> = {
  shopeefood: "ShopeeFood",
  "shopee food": "ShopeeFood",
  "shopee-food": "ShopeeFood",
  shopee: "Shopee",
  gofood: "GoFood",
  "go food": "GoFood",
  "go-food": "GoFood",
  gojek: "GoFood",
  grabfood: "GrabFood",
  "grab food": "GrabFood",
  "grab-food": "GrabFood",
  grab: "GrabFood",
  "dine in": "Dine In",
  "dine-in": "Dine In",
  dinein: "Dine In",
  "makan di tempat": "Dine In",
  "take away": "Take Away",
  "take-away": "Take Away",
  takeaway: "Take Away",
  bungkus: "Take Away",
  tokopedia: "Tokopedia",
  tokped: "Tokopedia",
  "tiktok shop": "TikTok Shop",
  tiktok: "TikTok Shop",
  "direct web": "Direct Web",
  whatsapp: "WhatsApp",
  wa: "WhatsApp",
};

export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeCategoryValue(val: unknown, colName: string = ""): string {
  if (val === null || val === undefined) return "Lainnya";
  const str = String(val).trim();
  if (!str) return "Lainnya";

  const lower = str.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
  const normalizedKey = str.toLowerCase().replace(/[\s_-]/g, "");

  // 1. Payment method column check
  if (/metode|pembayaran|payment|bayar/i.test(colName) || PAYMENT_CANONICAL_MAP[lower] || PAYMENT_CANONICAL_MAP[normalizedKey]) {
    if (PAYMENT_CANONICAL_MAP[lower]) return PAYMENT_CANONICAL_MAP[lower];
    if (PAYMENT_CANONICAL_MAP[normalizedKey]) return PAYMENT_CANONICAL_MAP[normalizedKey];
  }

  // 2. Channel / Platform column check
  if (/kategori_pesanan|channel|platform|kanal|marketplace|order_type/i.test(colName) || CHANNEL_CANONICAL_MAP[lower] || CHANNEL_CANONICAL_MAP[normalizedKey]) {
    if (CHANNEL_CANONICAL_MAP[lower]) return CHANNEL_CANONICAL_MAP[lower];
    if (CHANNEL_CANONICAL_MAP[normalizedKey]) return CHANNEL_CANONICAL_MAP[normalizedKey];
  }

  // 3. SKU Code Standardization (e.g. gp-ori -> GP-ORI, GP_MZZ -> GP-MZZ)
  if (/sku|kode_barang|kode_item|code/i.test(colName) || /^[a-zA-Z]{2,4}[-_][a-zA-Z0-9]{2,5}$/.test(str)) {
    return str.toUpperCase().replace(/_/g, "-").trim();
  }

  // 4. Product Name or General Text: Convert to Title Case if all uppercase or lowercase
  if (str === str.toUpperCase() || str === str.toLowerCase()) {
    return toTitleCase(str);
  }

  return str;
}

export function sanitizeNumericValue(
  val: unknown,
  hint: "price" | "qty" | "total" | "general" = "general"
): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  if (!str) return 0;

  // Handle shifted columns like "1 Rp 16000,0" in quantity column
  if (hint === "qty") {
    const qtyMatch = str.match(/^(\d+)(?:\s*(?:pcs|porsi|item|unit|pack|pax|buah|lembar|kg|gr))?(?:\s+(?:rp|idr)?\s*[\d.,]+)?/i);
    if (qtyMatch && qtyMatch[1]) {
      const parsedQty = parseInt(qtyMatch[1], 10);
      if (!isNaN(parsedQty) && parsedQty > 0 && parsedQty <= 1000) {
        return parsedQty;
      }
    }
  }

  // Handle shifted price like "15000 2 porsi" in price column
  if (hint === "price" || hint === "total") {
    const pricePrefixMatch = str.match(/^(?:rp|idr|\$)?\s*([\d.,]+)(?:\s+\d+\s*(?:pcs|porsi|item)?)?/i);
    if (pricePrefixMatch && pricePrefixMatch[1]) {
      str = pricePrefixMatch[1];
    }
  }

  // Strip currency prefixes & words
  str = str.replace(/^(rp|idr|\$|€|£)\s*/i, "");
  str = str.replace(/\s*(porsi|pcs|item|unit|pack|pax|buah|lembar|kg|gr|rupiah)$/i, "");

  // Handle Indonesian decimal format: e.g. "16000,0" or "18000,00" -> "16000"
  if (/^\d+,\d{1,2}$/.test(str)) {
    str = str.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(str)) {
    // "18.000,00" -> thousand dot and decimal comma
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(str)) {
    // "18,000.00" -> standard US format
    str = str.replace(/,/g, "");
  } else {
    // Strip all non-numeric except decimal point
    str = str.replace(/,/g, "");
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function sanitizeAndEngineerDataset(dataset: DatasetSchema): DatasetSchema {
  const { headers, rows } = dataset;
  if (!rows || rows.length === 0) return dataset;

  // Identify column semantics
  const priceCol = headers.find((h) => /harga_satuan|harga_jual|unit_price|harga|price/i.test(h));
  const qtyCol = headers.find((h) => /jumlah_terjual|qty|quantity|jumlah_pesanan|kuantitas|banyaknya/i.test(h));
  const totalCol = headers.find((h) => /total_bayar|total_penjualan|omset|omzet|revenue|subtotal|grand_total|total/i.test(h));
  const dateCol = headers.find((h) => /waktu_transaksi|tanggal_transaksi|tgl_transaksi|waktu|tanggal|created_at|date/i.test(h) && !/^(id_|no_|kode_|trx_)/i.test(h));
  const paymentCol = headers.find((h) => /metode_pembayaran|metode_bayar|cara_bayar|payment_method/i.test(h));
  const channelCol = headers.find((h) => /kategori_pesanan|channel|platform|kanal|marketplace/i.test(h));
  const productCol = headers.find((h) => /nama_menu|nama_produk|produk|nama_barang|item/i.test(h));
  const skuCol = headers.find((h) => /sku|kode_barang|kode_item/i.test(h));

  const engineeredRows: DatasetRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    const newRow: DatasetRow = { ...rawRow };

    // 1. Sanitize & Normalize Categorical Columns
    for (const header of headers) {
      const val = rawRow[header];
      if (val === null || val === undefined) continue;

      if (header === paymentCol || /metode/i.test(header)) {
        newRow[header] = normalizeCategoryValue(val, "metode_pembayaran");
      } else if (header === channelCol || /kategori_pesanan|channel/i.test(header)) {
        newRow[header] = normalizeCategoryValue(val, "kategori_pesanan");
      } else if (header === productCol || /menu|produk|barang/i.test(header)) {
        newRow[header] = normalizeCategoryValue(val, "nama_menu");
      } else if (header === skuCol || /sku/i.test(header)) {
        newRow[header] = normalizeCategoryValue(val, "sku");
      } else if (typeof val === "string" && !/id_|uuid|code|no_/i.test(header)) {
        // Light trim on text
        newRow[header] = val.trim();
      }
    }

    // 2. Clean and Engineer Numerical Columns
    let price = priceCol ? sanitizeNumericValue(newRow[priceCol], "price") : 0;
    let qty = qtyCol ? sanitizeNumericValue(newRow[qtyCol], "qty") : 0;
    let total = totalCol ? sanitizeNumericValue(newRow[totalCol], "total") : 0;

    // Feature Engineering: Auto-Derive & Correct Column Values
    if (price > 0 && qty > 0 && total <= 0) {
      total = price * qty;
    } else if (total > 0 && price > 0 && (qty <= 0 || qty > 500)) {
      qty = Math.round(total / price);
    } else if (total > 0 && qty > 0 && price <= 0) {
      price = Math.round(total / qty);
    }

    if (priceCol) newRow[priceCol] = price;
    if (qtyCol) newRow[qtyCol] = qty;
    if (totalCol) newRow[totalCol] = total;

    // 3. Normalize Date Formats
    if (dateCol) {
      const rawDate = newRow[dateCol];
      const parsedDate = parseFlexibleDate(rawDate);
      if (parsedDate) {
        // Keep clean ISO date format YYYY-MM-DD HH:mm:ss if time existed, else YYYY-MM-DD
        const iso = parsedDate.toISOString();
        const hasTime = String(rawDate).includes(":") || (parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0);
        if (hasTime) {
          const hours = String(parsedDate.getHours()).padStart(2, "0");
          const mins = String(parsedDate.getMinutes()).padStart(2, "0");
          const secs = String(parsedDate.getSeconds()).padStart(2, "0");
          newRow[dateCol] = `${iso.split("T")[0]} ${hours}:${mins}:${secs}`;
        } else {
          newRow[dateCol] = iso.split("T")[0];
        }
      }
    }

    engineeredRows.push(newRow);
  }

  return {
    ...dataset,
    rows: engineeredRows,
    sampleRows: engineeredRows.slice(0, 5),
  };
}
