import type { ChartType } from "@/types/chart";
import type { TemplateId } from "@/types/template";
import type { ParsedCommand } from "@/types/command";

const CHART_TYPE_MAP: Record<string, ChartType> = {
  bar: "bar",
  batang: "bar",
  kolom: "bar",
  line: "line",
  garis: "line",
  tren: "line",
  area: "area",
  donut: "donut",
  donat: "donut",
  pie: "pie",
  lingkaran: "donut",
  horizontal: "horizontal_bar",
  "horizontal bar": "horizontal_bar",
  "bar horizontal": "horizontal_bar",
  scatter: "scatter",
  sebaran: "scatter",
  korelasi: "scatter",
  tabel: "table",
  table: "table",
};

const TEMPLATE_MAP: Record<string, TemplateId> = {
  ecommerce: "ecommerce",
  "e-commerce": "ecommerce",
  retail: "ecommerce",
  toko: "ecommerce",
  sales: "sales",
  penjualan: "sales",
  pipeline: "sales",
  finance: "finance",
  keuangan: "finance",
  fiskal: "finance",
  marketing: "marketing",
  pemasaran: "marketing",
  iklan: "marketing",
  campaign: "marketing",
  operational: "operational",
  operasional: "operational",
  logistik: "operational",
  hr: "hr",
  sdm: "hr",
  karyawan: "hr",
  survey: "survey",
  survei: "survey",
  feedback: "survey",
  kepuasan: "survey",
  general: "general",
  umum: "general",
  standar: "general",
};

export function parseNaturalLanguageCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) {
    return {
      rawInput: input,
      intent: "unknown",
      confidenceScore: 0,
      humanReadableExplanation: "Kueri kosong",
    };
  }

  // 1. Reset / Clear filters
  if (
    lower.includes("reset filter") ||
    lower.includes("hapus filter") ||
    lower.includes("clear filter") ||
    lower.includes("tampilkan semua") ||
    lower.includes("semua data")
  ) {
    return {
      rawInput: input,
      intent: "clear_filters",
      confidenceScore: 0.95,
      humanReadableExplanation: "Menghapus semua filter aktif dan menampilkan seluruh data.",
    };
  }

  // 2. Toggle edit layout
  if (
    lower.includes("sesuaikan layout") ||
    lower.includes("edit layout") ||
    lower.includes("atur layout") ||
    lower.includes("atur posisi") ||
    lower.includes("sesuaikan posisi") ||
    lower.includes("ubah tata letak")
  ) {
    return {
      rawInput: input,
      intent: "toggle_edit_layout",
      confidenceScore: 0.9,
      humanReadableExplanation: "Mengaktifkan/menonaktifkan mode penyesuaian susunan tata letak dasbor.",
    };
  }

  // 3. Export PNG / Download
  if (
    lower.includes("ekspor") ||
    lower.includes("export") ||
    lower.includes("download") ||
    lower.includes("unduh")
  ) {
    return {
      rawInput: input,
      intent: "export_png",
      confidenceScore: 0.9,
      humanReadableExplanation: "Memicu pengunduhan cuplikan visualisasi dasbor sebagai gambar.",
    };
  }

  // 4. Switch Template
  for (const [key, tmplId] of Object.entries(TEMPLATE_MAP)) {
    if (
      lower.includes(`template ${key}`) ||
      lower.includes(`tema ${key}`) ||
      lower.includes(`ke ${key}`) ||
      lower.includes(`ganti ${key}`)
    ) {
      return {
        rawInput: input,
        intent: "switch_template",
        targetTemplateId: tmplId,
        confidenceScore: 0.9,
        humanReadableExplanation: `Mengubah format dasbor ke tema editorial ${key.toUpperCase()}.`,
      };
    }
  }

  // 5. Change Chart Type (sort keys by length descending so compound phrases match first)
  const chartEntries = Object.entries(CHART_TYPE_MAP).sort((a, b) => b[0].length - a[0].length);
  const words = lower.split(/\s+/);
  for (const [key, chartType] of chartEntries) {
    if (
      lower.includes(`ke ${key}`) ||
      lower.includes(`jadi ${key}`) ||
      lower.includes(`menjadi ${key}`) ||
      lower.includes(`tipe ${key}`) ||
      lower.includes(`grafik ${key}`) ||
      lower.includes(`chart ${key}`) ||
      lower.includes(`bentuk ${key}`) ||
      lower.includes(`${key} chart`) ||
      lower.includes(`tampilkan ${key}`) ||
      lower.includes(`lihat ${key}`) ||
      lower.includes(key) ||
      words.includes(key) ||
      lower === key ||
      lower === `${key} chart`
    ) {
      return {
        rawInput: input,
        intent: "change_chart_type",
        targetChartType: chartType,
        confidenceScore: 0.92,
        humanReadableExplanation: `Mengubah jenis visualisasi chart utama menjadi ${key.toUpperCase()}.`,
      };
    }
  }

  // 6. Sort Data
  if (
    lower.includes("terbesar") ||
    lower.includes("tertinggi") ||
    lower.includes("desc") ||
    lower.includes("paling banyak") ||
    lower.includes("banyak ke sedikit")
  ) {
    return {
      rawInput: input,
      intent: "sort_data",
      sortDirection: "desc",
      confidenceScore: 0.88,
      humanReadableExplanation: "Mengurutkan data visualisasi dari nilai tertinggi ke terendah (Descending).",
    };
  }

  if (
    lower.includes("terkecil") ||
    lower.includes("terendah") ||
    lower.includes("asc") ||
    lower.includes("paling sedikit") ||
    lower.includes("sedikit ke banyak")
  ) {
    return {
      rawInput: input,
      intent: "sort_data",
      sortDirection: "asc",
      confidenceScore: 0.88,
      humanReadableExplanation: "Mengurutkan data visualisasi dari nilai terendah ke tertinggi (Ascending).",
    };
  }

  // 7. Filter Category (preserve exact casing from original input)
  const filterMatch = trimmed.match(/(?:filter|saring|hanya tampilkan|fokus)\s+(?:kategori\s+)?([a-zA-Z0-9_\s&-]+)/i);
  if (filterMatch && filterMatch[1]) {
    const targetCat = filterMatch[1].trim();
    if (targetCat.length > 1) {
      return {
        rawInput: input,
        intent: "filter_category",
        targetCategory: targetCat,
        confidenceScore: 0.85,
        humanReadableExplanation: `Menyaring visualisasi khusus untuk kategori "${targetCat}".`,
      };
    }
  }

  // 8. Search Query (preserve exact casing from original input)
  const searchMatch = trimmed.match(/(?:cari|temukan|search)\s+([a-zA-Z0-9_\s&-]+)/i);
  if (searchMatch && searchMatch[1]) {
    const query = searchMatch[1].trim();
    return {
      rawInput: input,
      intent: "search_query",
      searchQuery: query,
      confidenceScore: 0.85,
      humanReadableExplanation: `Mencari label atau entitas yang memuat kata "${query}".`,
    };
  }

  // Fallback: If non-empty but general text
  return {
    rawInput: input,
    intent: "search_query",
    searchQuery: trimmed,
    confidenceScore: 0.5,
    humanReadableExplanation: `Menjalankan pencarian teks bebas untuk "${trimmed}".`,
  };
}
