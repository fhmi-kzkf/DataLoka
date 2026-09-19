export type PlanTierId = "free" | "starter" | "pro" | "business";

export type BillingCycle = "monthly" | "annual";

export interface PricingFeature {
  title: string;
  included: boolean;
  highlight?: boolean;
  badge?: string;
}

export interface PricingTier {
  id: PlanTierId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPricePerMonth: number;
  currency: string;
  isPopular?: boolean;
  ctaText: string;
  ctaVariant: "outline" | "filled";
  limits: {
    maxDashboards: string;
    maxFileSize: string;
    maxRows: string;
    teamMembers: string;
    storage: string;
  };
  features: PricingFeature[];
}

export interface FeatureComparisonItem {
  name: string;
  description?: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
  business: string | boolean;
}

export interface FeatureComparisonGroup {
  groupName: string;
  items: FeatureComparisonItem[];
}

export interface PricingFaqItem {
  question: string;
  answer: string;
  category: "umum" | "pembayaran" | "keamanan" | "teknis";
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Untuk pemilik toko online dan eksplorasi data dasar tanpa biaya.",
    monthlyPrice: 0,
    annualPricePerMonth: 0,
    currency: "Rp",
    isPopular: false,
    ctaText: "Mulai Gratis",
    ctaVariant: "outline",
    limits: {
      maxDashboards: "3 Dashboard Aktif",
      maxFileSize: "5 MB per file",
      maxRows: "10.000 baris data",
      teamMembers: "1 Pengguna",
      storage: "50 MB Cloud Storage",
    },
    features: [
      { title: "Deteksi Otomatis & Auto-Chart Engine", included: true },
      { title: "8 Template Domain Bisnis Terkurasi", included: true },
      { title: "100% Client-Side Processing & Privacy", included: true },
      { title: "Bagikan Snapshot Link Publik (View-Only)", included: true },
      { title: "Ekspor Laporan PDF & Raw CSV", included: true },
      { title: "Tanya Data AI Assistant (50 Query/Bulan)", included: true },
      { title: "Live-Sync Google Sheets Otomatis", included: false },
      { title: "Notifikasi & Alert WhatsApp", included: false },
      { title: "Custom Branding & Domain", included: false },
      { title: "Akses API & Webhook", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Ideal untuk UMKM bertumbuh yang membutuhkan sinkronisasi data live.",
    monthlyPrice: 49000,
    annualPricePerMonth: 39000,
    currency: "Rp",
    isPopular: false,
    ctaText: "Pilih Paket Starter",
    ctaVariant: "outline",
    limits: {
      maxDashboards: "15 Dashboard Aktif",
      maxFileSize: "25 MB per file",
      maxRows: "100.000 baris data",
      teamMembers: "3 Anggota Tim",
      storage: "1 GB Cloud Storage",
    },
    features: [
      { title: "Semua fitur paket Free", included: true },
      { title: "Live-Sync Google Sheets (Interval 15 Menit)", included: true, highlight: true },
      { title: "Notifikasi & Alert Ambang Batas WhatsApp", included: true },
      { title: "Ekspor PDF Beresolusi Tinggi & Excel Sanitized", included: true },
      { title: "Tanya Data AI Assistant (500 Query/Bulan)", included: true },
      { title: "Simpan & Sinkronisasi Cloud Workspace", included: true },
      { title: "Prioritas Komputasi Mesin Heuristik", included: true },
      { title: "Command-Bar NLP Custom Editing", included: false },
      { title: "Custom Branding & White-Label", included: false },
      { title: "Akses API & Webhook", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pilihan paling populer untuk analis, startup, dan agensi data profesional.",
    monthlyPrice: 149000,
    annualPricePerMonth: 119000,
    currency: "Rp",
    isPopular: true,
    ctaText: "Upgrade ke Pro",
    ctaVariant: "filled",
    limits: {
      maxDashboards: "Unlimited Dashboard",
      maxFileSize: "100 MB per file",
      maxRows: "500.000 baris data",
      teamMembers: "10 Anggota Tim",
      storage: "10 GB Cloud Storage",
    },
    features: [
      { title: "Semua fitur paket Starter", included: true },
      { title: "Unlimited Dashboard & Dataset", included: true, highlight: true },
      { title: "Dedicated AI Inference Engine", included: true, highlight: true },
      { title: "Command-Bar NLP Editing & Chart Morphing", included: true },
      { title: "Live-Sync Google Sheets (Interval 5 Menit)", included: true },
      { title: "Embed Dashboard Interaktif via iFrame", included: true },
      { title: "Custom Branding (Logo & Palet Warna Perusahaan)", included: true },
      { title: "Dukungan Multi-Workspace & Role Member", included: true },
      { title: "Ekspor PPTX, PNG HD, dan Cleaned Data", included: true },
      { title: "Dukungan Pelanggan Prioritas WhatsApp (SLA < 2 Jam)", included: true },
    ],
  },
  {
    id: "business",
    name: "Business / Team",
    tagline: "Solusi analitik terpadu untuk korporasi dengan kepatuhan data ketat.",
    monthlyPrice: 499000,
    annualPricePerMonth: 399000,
    currency: "Rp",
    isPopular: false,
    ctaText: "Hubungi Sales Enterprise",
    ctaVariant: "outline",
    limits: {
      maxDashboards: "Unlimited Dashboard",
      maxFileSize: "Sesuai Kebutuhan",
      maxRows: "Skala Jutaan Baris",
      teamMembers: "Unlimited Anggota Tim",
      storage: "Dedicated Storage",
    },
    features: [
      { title: "Semua fitur paket Pro", included: true },
      { title: "Dedicated Private Cloud Workspace", included: true, highlight: true },
      { title: "Single Sign-On (SAML / Google Workspace SSO)", included: true },
      { title: "Audit Log Keamanan Lengkap (UU PDP Compliant)", included: true },
      { title: "Akses REST API & Webhooks Penuh", included: true },
      { title: "Live-Sync Real-Time Polling (< 1 Menit)", included: true },
      { title: "Custom LLM Model & On-Premise Integration", included: true },
      { title: "Dedicated Account Manager & SLA 99.9%", included: true },
    ],
  },
];

export const FEATURE_COMPARISON_GROUPS: FeatureComparisonGroup[] = [
  {
    groupName: "Kapasitas & Batasan Data",
    items: [
      { name: "Jumlah Dashboard Aktif", free: "3 Dashboard", starter: "15 Dashboard", pro: "Unlimited", business: "Unlimited" },
      { name: "Maksimal Ukuran File", free: "5 MB", starter: "25 MB", pro: "100 MB", business: "Kustom (>500 MB)" },
      { name: "Maksimal Baris per Dataset", free: "10.000", starter: "100.000", pro: "500.000", business: "Jutaan Baris" },
      { name: "Penyimpanan Cloud Workspace", free: "50 MB", starter: "1 GB", pro: "10 GB", business: "Dedicated Storage" },
      { name: "Anggota Tim per Workspace", free: "1 Pengguna", starter: "3 Pengguna", pro: "10 Pengguna", business: "Unlimited" },
    ],
  },
  {
    groupName: "Kecerdasan Buatan & Tanya Data AI",
    items: [
      { name: "Auto-Chart Heuristic Engine", free: true, starter: true, pro: true, business: true },
      { name: "Tanya Data AI Assistant", free: "50 Query / bln", starter: "500 Query / bln", pro: "Unlimited Kuota", business: "Dedicated Engine" },
      { name: "Sintesis Narasi Eksekutif Otomatis", free: "Dasar", starter: "Lengkap", pro: "Lengkap + Strategis", business: "Kustom Prompting" },
      { name: "Command-Bar NLP Editing", free: false, starter: false, pro: true, business: true },
    ],
  },
  {
    groupName: "Integrasi & Sinkronisasi",
    items: [
      { name: "Upload Excel (.xlsx, .xls) & CSV", free: true, starter: true, pro: true, business: true },
      { name: "Impor Google Sheets Publik", free: true, starter: true, pro: true, business: true },
      { name: "Google Sheets Live-Sync", free: false, starter: "15 Menit", pro: "5 Menit", business: "< 1 Menit" },
      { name: "Notifikasi & Alert WhatsApp", free: false, starter: true, pro: true, business: true },
      { name: "REST API & Webhooks", free: false, starter: false, pro: false, business: true },
    ],
  },
  {
    groupName: "Kolaborasi, Ekspor & Keamanan",
    items: [
      { name: "Tautan Berbagi Snapshot Publik", free: true, starter: true, pro: true, business: true },
      { name: "Ekspor Laporan PDF Standar", free: true, starter: true, pro: true, business: true },
      { name: "Ekspor Cleaned CSV & Excel Formulasi Aman", free: true, starter: true, pro: true, business: true },
      { name: "Embed iFrame ke Website Eksternal", free: false, starter: false, pro: true, business: true },
      { name: "Custom Branding & White-Label", free: false, starter: false, pro: true, business: true },
      { name: "Single Sign-On (SSO) & Audit Trail", free: false, starter: false, pro: false, business: true },
      { name: "SLA Garansi Uptime", free: "99.0%", starter: "99.5%", pro: "99.9%", business: "99.99% Dedicated" },
    ],
  },
];

export const PRICING_FAQS: PricingFaqItem[] = [
  {
    question: "Bagaimana privasi data saya dijamin aman?",
    answer: "DataLoka memproses spreadsheet langsung di peramban (client-side) menggunakan WebAssembly dan memori lokal. Dataset mentah Anda tidak pernah diunggah ke server pihak ketiga tanpa persetujuan eksplisit Anda saat menggunakan fitur sinkronisasi cloud.",
    category: "keamanan",
  },
  {
    question: "Metode pembayaran apa saja yang didukung di Indonesia?",
    answer: "Kami mendukung QRIS (BCA, GoPay, OVO, Dana, ShopeePay, LinkAja), Transfer Virtual Account (BCA, Mandiri, BNI, BRI, Permata), serta Kartu Debit/Kredit Visa & Mastercard melalui integrasi Payment Gateway lokal resmi.",
    category: "pembayaran",
  },
  {
    question: "Apakah saya bisa membatalkan atau mengubah paket kapan saja?",
    answer: "Ya, Anda dapat menaikkan paket (upgrade), menurunkan (downgrade), atau membatalkan langganan kapan saja dari dasbor akun tanpa biaya penalti tersembunyi.",
    category: "pembayaran",
  },
  {
    question: "Bagaimana cara kerja diskon 20% untuk paket tahunan?",
    answer: "Saat Anda memilih penagihan tahunan, Anda mendapatkan potongan harga langsung sebesar 20% yang diakumulasikan dalam 1 faktur tahunan. Contohnya untuk paket Pro, Anda hanya membayar Rp 119.000/bulan dibandingkan Rp 149.000/bulan.",
    category: "umum",
  },
  {
    question: "Apakah ada batasan kuota untuk ekspor PDF dan laporan?",
    answer: "Tidak ada batasan frekuensi untuk ekspor PDF, grafik PNG, atau pembersihan data Excel pada seluruh tier, termasuk pengguna tier Free.",
    category: "teknis",
  },
];
