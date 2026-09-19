# 08. Testing, Environment Config, & Deployment Guide

Dokumen ini memuat panduan lengkap mengenai topologi pengujian otomatis, konfigurasi variabel lingkungan (*environment variables*), dan prosedur deployment produksi.

---

## 1. Topologi Pengujian Otomatis (Vitest Test Suites)

DataLoka memiliki cakupan pengujian komprehensif dengan **15 test suite** dan **185 skenario uji** (100% lulus):

| Berkas Pengujian | Target Cakupan Modul | Jumlah Uji |
| :--- | :--- | :--- |
| `src/__tests__/auth-storage.test.tsx` | Registrasi, login, reset password, dan fallback LocalStorage | 10 |
| `src/__tests__/backend-api.test.ts` | Endpoint API, fallback NVIDIA NIM, proteksi formula injection | 21 |
| `src/__tests__/charts.test.tsx` | Dual Y-axis ECharts builder, chart options, tooltip formatting | 6 |
| `src/__tests__/checkout-upgrade.test.tsx` | Alur upgrade paket langganan dan aktivasi tier | 5 |
| `src/__tests__/command.test.tsx` | Drawer Tanya Data AI, keyboard shortcuts, history pills | 19 |
| `src/__tests__/engine.test.tsx` | Heuristic rules visualisasi, KPI computation, AOV | 7 |
| `src/__tests__/formatters.test.ts` | Humanize column/chart titles, format currency IDR, compact numbers | 6 |
| `src/__tests__/ingest.test.tsx` | Parser CSV & Excel, drop-zone file validation | 18 |
| `src/__tests__/insights-export.test.tsx` | Narasi bisnis otomatis, ekspor PNG, PDF, dan CSV | 13 |
| `src/__tests__/landing.test.tsx` | Landing page, navigasi, FAQ accordion interaktif | 10 |
| `src/__tests__/mapping.test.tsx` | Auto-mapping heuristik semantik kolom Indonesia & Inggris | 16 |
| `src/__tests__/pricing.test.tsx` | Tabel harga, tier comparison, billing cycle switcher | 6 |
| `src/__tests__/primitives.test.tsx` | Primitif UI (Button, Card, Input, Modal, Badge) | 14 |
| `src/__tests__/quality.test.tsx` | Deteksi anomali data, IQR outlier, audit score, cleansing | 15 |
| `src/__tests__/templates.test.tsx` | Template preset (Sales, E-commerce, UMKM, Finance) | 18 |
| **Total Keseluruhan** | **15 Test Suites** | **185 Tests** |

### Menjalankan Seluruh Pengujian:
```bash
# Menjalankan seluruh test suite sekali jalan
npm run test

# Menjalankan test dalam mode watch interaktif
npm run test -- --watch

# Menjalankan file pengujian spesifik
npm run test -- src/__tests__/backend-api.test.ts
```

---

## 2. Variabel Lingkungan (*Environment Variables*)

Salin berkas `.env.example` ke `.env`:

```bash
cp .env.example .env
```

### Daftar Variabel Lingkungan:

```ini
# ==============================================================================
# NVIDIA NIM AI INFERENCE ENGINE
# ==============================================================================
# Kunci API resmi NVIDIA NIM untuk inferensi Llama-3.1-70B & Mixtral
NVIDIA_NIM_API_KEY=nvapi-your-key-here

# Model utama yang digunakan
NVIDIA_NIM_PRIMARY_MODEL=meta/llama-3.1-70b-instruct

# ==============================================================================
# FIREBASE AUTHENTICATION CONFIGURATION (OPTIONAL)
# ==============================================================================
# Jika dikosongkan, sistem otomatis menggunakan Local Resilient Auth Engine
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef

# ==============================================================================
# APPLICATION RUNTIME SETTINGS
# ==============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 3. Panduan Build & Deployment Produksi

### A. Membangun Bundle Produksi:
```bash
npm run build
```

Sistem Next.js dengan Turbopack akan mengompilasi halaman statis dan serverless functions secara optimal dengan optimasi tree-shaking untuk Apache ECharts dan Lucide Icons.

### B. Menjalankan Server Produksi:
```bash
npm run start
```

### C. Deployment ke Platform Serverless (Vercel / Cloudflare Pages):
1. Hubungkan repositori GitHub/GitLab ke Vercel.
2. Atur Framework Preset: **Next.js**.
3. Masukkan seluruh variabel lingkungan dari `.env` ke dashboard Environment Variables Vercel.
4. Deploy dengan branch target `main`.
