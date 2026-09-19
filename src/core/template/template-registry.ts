import type { TemplateDefinition, TemplateId } from "@/types/template";

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  ecommerce: {
    id: "ecommerce",
    name: "E-Commerce & Retail",
    description: "Analisis performa GMV, volume pesanan, rata-rata nilai keranjang (AOV), dan share kategori produk lintas kanal marketplace.",
    category: "Retail & E-Commerce",
    badge: "Marketplace Multi-Channel",
    personaTag: "UMKM & Brand Owner",
    accentColor: "#9e472a", // Sienna Warm
    themeStyle: "ecommerce_terracotta",
    tagline: "Live Multi-Channel Commerce & SKU Velocity Hub",
    heroMetricLabel: "Gross Merchandise Value (GMV)",
    heroMetricValue: "Rp 148,2 Juta",
    specializedMetricsHeader: "Performa Kanal Penjualan, Share Marketplace & Perputaran SKU",
    matchingKeywords: [
      "gmv", "omset", "order", "pesanan", "sku", "produk", "product", "qty", "quantity",
      "harga", "price", "diskon", "discount", "customer", "pembeli", "resi", "ongkir",
      "marketplace", "shopee", "tokopedia", "tiktok", "lazada", "cart", "keranjang"
    ],
    recommendedLayout: "retail_grid",
    suggestedKpiCount: 4,
    suggestedChartTypes: ["line", "donut", "bar", "table"],
  },
  sales: {
    id: "sales",
    name: "B2B Sales & Pipeline",
    description: "Pelacakan pipeline deal, win rate, kontribusi sales rep, dan proyeksi pencapaian target berkala.",
    category: "Sales & Revenue",
    badge: "B2B Deal Pipeline",
    personaTag: "Sales Director & Account Exec",
    accentColor: "#1d4ed8", // Deep Navy / Royal
    themeStyle: "sales_navy",
    tagline: "High-Velocity Deal Flow & Quota Attainment Ledger",
    heroMetricLabel: "Weighted Pipeline Value",
    heroMetricValue: "Rp 1,18 Miliar",
    specializedMetricsHeader: "Tahapan Konversi Funnel, Deal Velocity & Quota Attainment",
    matchingKeywords: [
      "lead", "prospect", "deal", "pipeline", "stage", "rep", "salesperson", "quota",
      "closing", "won", "lost", "arr", "mrr", "contract", "kontrak", "klien", "client"
    ],
    recommendedLayout: "funnel_flow",
    suggestedKpiCount: 4,
    suggestedChartTypes: ["bar", "horizontal_bar", "line", "table"],
  },
  finance: {
    id: "finance",
    name: "Financial & P&L",
    description: "Evaluasi pendapatan bersih, rasio profitabilitas margin, struktur beban operasional (OPEX/COGS), dan arus kas bulanan.",
    category: "Finance & Accounting",
    badge: "Fiscal & Margin Ledger",
    personaTag: "CFO & Finance Controller",
    accentColor: "#047857", // Emerald Ledger
    themeStyle: "finance_emerald",
    tagline: "Double-Entry Fiscal Ledger & Working Capital Barometer",
    heroMetricLabel: "Net Operating Margin",
    heroMetricValue: "32.4% (Rp 170 Jt)",
    specializedMetricsHeader: "Struktur Beban Pokok, EBITDA, Runway & Solvabilitas",
    matchingKeywords: [
      "revenue", "pendapatan", "profit", "laba", "rugi", "loss", "ebitda", "opex", "cogs",
      "biaya", "cost", "margin", "cash", "kas", "ar", "ap", "pajak", "tax", "budget", "anggaran"
    ],
    recommendedLayout: "fiscal_ledger",
    suggestedKpiCount: 4,
    suggestedChartTypes: ["area", "bar", "line", "table"],
  },
  marketing: {
    id: "marketing",
    name: "Growth & Campaign",
    description: "Pemantauan efisiensi channel akuisisi berbayar, ROAS, rasio CAC terhadap LTV, CTR, dan tingkat konversi kampanye promosi.",
    category: "Marketing & Growth",
    badge: "Multi-Touch Attribution",
    personaTag: "Growth Marketer & Media Buyer",
    accentColor: "#6d28d9", // Electric Indigo / Purple
    themeStyle: "marketing_purple",
    tagline: "Omni-Channel Acquisition ROAS & LTV:CAC Engine",
    heroMetricLabel: "Blended Return on Ad Spend (ROAS)",
    heroMetricValue: "4.85x ROAS",
    specializedMetricsHeader: "Efisiensi Akuisisi Berbayar, Skala ROAS & CAC Blended",
    matchingKeywords: [
      "campaign", "kampanye", "roas", "cac", "cpa", "cpc", "ctr", "impression", "click",
      "traffic", "visitor", "pengunjung", "channel", "ad", "ads", "facebook", "meta", "google", "spend"
    ],
    recommendedLayout: "growth_matrix",
    suggestedKpiCount: 4,
    suggestedChartTypes: ["line", "donut", "grouped_bar", "table"],
  },
  operational: {
    id: "operational",
    name: "Operations & Supply Chain",
    description: "Metrik pemenuhan SLA ekspedisi, ketepatan pengiriman kurir, perputaran stok gudang, dan tingkat cacat produksi.",
    category: "Operations",
    badge: "Logistics & Fulfillment",
    personaTag: "Ops Manager & Supply Lead",
    accentColor: "#b45309", // Industrial Amber
    themeStyle: "operational_amber",
    tagline: "Fleet Mission Control & Cross-Dock SLA Barometer",
    heroMetricLabel: "Courier Fleet On-Time SLA",
    heroMetricValue: "98.4% On-Time",
    specializedMetricsHeader: "Kepatuhan SLA Ekspedisi, Lead Time Pengiriman & Defect Rate",
    matchingKeywords: [
      "delivery", "pengiriman", "sla", "lead_time", "warehouse", "gudang", "inventory", "stok",
      "stock", "defect", "cacat", "courier", "kurir", "transit", "fulfillment", "shipment"
    ],
    recommendedLayout: "logistics_dispatch",
    suggestedKpiCount: 3,
    suggestedChartTypes: ["bar", "line", "horizontal_bar", "table"],
  },
  hr: {
    id: "hr",
    name: "People & Organization",
    description: "Distribusi headcount antar divisi, rasio retensi karyawan, kepuasan eNPS tim, dan pemenuhan kuota rekrutmen.",
    category: "Human Resources",
    badge: "Talent & Culture Pulse",
    personaTag: "People Ops & HR Business Partner",
    accentColor: "#be185d", // Rose Blush
    themeStyle: "hr_rose",
    tagline: "Organizational Health, Retention & eNPS Radar",
    heroMetricLabel: "Total Active Headcount",
    heroMetricValue: "148 Karyawan (eNPS +58)",
    specializedMetricsHeader: "Sebaran Departemen, Retensi Karyawan, eNPS & Cohort Tenure",
    matchingKeywords: [
      "karyawan", "employee", "departemen", "department", "divisi", "division", "turnover",
      "attrition", "tenure", "gaji", "salary", "headcount", "performance", "kinerja", "rating"
    ],
    recommendedLayout: "people_pulse",
    suggestedKpiCount: 3,
    suggestedChartTypes: ["donut", "horizontal_bar", "bar", "table"],
  },
  survey: {
    id: "survey",
    name: "Voice of Customer",
    description: "Distribusi skor kepuasan CSAT/NPS, analisis sentimen masukan responden, dan segmentasi rating ulasan.",
    category: "Research & Survey",
    badge: "CSAT & Feedback Polar",
    personaTag: "Product & Customer Experience",
    accentColor: "#0284c7", // Azure Sky
    themeStyle: "survey_azure",
    tagline: "Customer Polarity, Net Promoter Index & Verbatim Radar",
    heroMetricLabel: "Overall CSAT Rating",
    heroMetricValue: "4.82 / 5.00 (NPS +68)",
    specializedMetricsHeader: "Distribusi Skor CSAT, Net Promoter Score & Sentimen Responden",
    matchingKeywords: [
      "nps", "csat", "score", "skor", "rating", "satisfaction", "kepuasan", "feedback",
      "responden", "respondent", "survey", "pertanyaan", "question", "jawaban", "komentar"
    ],
    recommendedLayout: "sentiment_polar",
    suggestedKpiCount: 3,
    suggestedChartTypes: ["donut", "horizontal_bar", "bar", "table"],
  },
  general: {
    id: "general",
    name: "Editorial Analytics",
    description: "Ikhtisar komprehensif metrik performa universal, visualisasi tren berkala Swiss-style, dan sebaran kontribusi Pareto 80/20.",
    category: "General",
    badge: "Universal Synthesis",
    personaTag: "Executive & Data Analyst",
    accentColor: "#111827", // Ink Carbon
    themeStyle: "general_swiss",
    tagline: "Swiss Typographic Universal Synthesis & Pareto Engine",
    heroMetricLabel: "Pareto Top 20% Impact Share",
    heroMetricValue: "78.4% Kontribusi",
    specializedMetricsHeader: "Ikhtisar Distribusi Universal, Analisis Pareto 80/20 & IQR",
    matchingKeywords: [],
    recommendedLayout: "swiss_dense",
    suggestedKpiCount: 4,
    suggestedChartTypes: ["line", "bar", "donut", "table"],
  },
};

export const ALL_TEMPLATES: TemplateDefinition[] = Object.values(TEMPLATE_REGISTRY);

export function getTemplateById(id: TemplateId): TemplateDefinition {
  return TEMPLATE_REGISTRY[id] || TEMPLATE_REGISTRY.general;
}
