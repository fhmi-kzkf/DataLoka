# DataLoka

**DataLoka** adalah platform *Business Intelligence* (BI) dan *Analytics* modern berarsitektur **Hybrid Client-First** dengan jaminan **Zero-Cloud Raw Data Exposure** dan asisten inferensi kecerdasan buatan (*AI-Assisted Natural Language Querying*).

Platform ini dirancang khusus untuk membedah data transaksi, laporan penjualan omnichannel, dan pembukuan UMKM secara instan tanpa mengunggah rekaman data mentah pengguna ke server eksternal.

---

## Arsitektur & Keunggulan Inti

```
+-----------------------------------------------------------------------------------+
|                            CLIENT-SIDE RAW DATA PLANE                             |
|                                                                                   |
|  [ File Ingest (CSV/XLSX) ]  -->  [ Auto-Mapping & Audit ]  -->  [ ECharts Engine ]|
|  (In-Memory Stream Parsing)       (Semantic Header Engine)       (Dual Y-Axis)    |
|                                                                         ^         |
|                                                                         |         |
|  [ Underlying Sheet ]        <--  [ Cross-Filter State ]    <--  [ KPI Cards ]    |
|  (Anti-Formula Injection)         (Sub-16ms Reactive Sync)       (AOV & Sparklines|
+-----------------------------------------------------------------------------------+
                                         | (Hanya Schema Metadata & Query Text)
                                         v
+-----------------------------------------------------------------------------------+
|                             BACKEND INFERENCE PLANE                               |
|                                                                                   |
|  [ NVIDIA NIM Tier 1 (Llama-3.1-70B) ]  -->  [ Multi-Tier Failover (Mixtral) ]    |
|                                         -->  [ Local Deterministic NLP Engine ]   |
+-----------------------------------------------------------------------------------+
```

1. **100% Client-Side Data Privacy (*Zero-Cloud Raw Data Exposure*)**: Pemrosesan baris transaksi (CSV, XLSX, XLS) dieksekusi 100% di memori peramban pengguna. Tidak ada data mentah, data pribadi (PII), atau angka omset riil yang disimpan di basis data server.
2. **Asisten "Tanya Data AI" & Failover Cerdas**: Eksplorasi data berbasis bahasa alami (*Natural Language Querying*) dengan sintesis kueri SQL otomatis melalui failover chain **NVIDIA NIM** (`meta/llama-3.1-70b-instruct`, `meta/llama-3.3-70b-instruct`, `mistralai/mixtral-8x22b-instruct`) dan mesin NLP deterministik lokal.
3. **Visualisasi Apache ECharts dengan Dual Y-Axis**: Visualisasi deret waktu dengan skala ganda independen (sumbu kiri untuk Rupiah omset, sumbu kanan untuk kuantitas pesanan) guna mencegah anomali pembacaan metrik.
4. **Cross-Filtering Reaktif Instan**: Interaksi klik pada elemen grafik (bar atau donut) menyaring seluruh komponen dasbor, kartu KPI, dan lembar data mentah secara *real-time* tanpa latensi jaringan.
5. **Mitigasi Keamanan CSV Formula Injection (CWE-1236)**: Seluruh fungsi ekspor tabel dan CSV memvalidasi karakter awal formula (`=`, `+`, `-`, `@`) guna melindungi spreadsheet pengguna dari eksekusi kode berbahaya.
6. **Audit Kualitas Data & Pipeline Pembersihan**: Deteksi otomatis nilai kosong (*missing values*), baris duplikat, anomali tipe data, dan pencilan (*IQR outliers*) dengan skor kesehatan data (*Health Score*).

---

## Spesifikasi Teknologi

| Komponen Sistem | Teknologi Terpilih | Versi / Spesifikasi |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router, Turbopack) | 15.5+ |
| **Bahasa Pemrograman** | TypeScript (Strict Mode) | 5.0+ |
| **Engine Visualisasi** | Apache ECharts | 5.5+ |
| **State Management** | Zustand (Modular Atomic Stores) | 5.0+ |
| **Parsing Engine** | PapaParse & SheetJS (xlsx) | Web Worker / Stream |
| **Inference Orchestrator** | NVIDIA NIM API & Deterministic NLP | Multi-Tier Failover Chain |
| **Autentikasi** | Firebase Auth & Resilient Local Fallback | Dual-Layer Session Engine |
| **Test Runner** | Vitest & React Testing Library | 15 Suites / 185 Tests Passing |

---

## Panduan Memulai Cepat (Quick Start)

### 1. Kloning Repositori
```bash
git clone https://github.com/Ethermind-Agency/DataLoka.git
cd DataLoka
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Salin templat konfigurasi lingkungan `.env.example`:
```bash
cp .env.example .env
```

Sesuaikan parameter di dalam `.env`:
```ini
# NVIDIA NIM AI Inference Engine
NVIDIA_NIM_API_KEY=nvapi-your-key-here
NVIDIA_NIM_PRIMARY_MODEL=meta/llama-3.1-70b-instruct

# Firebase Authentication (Opsional - Menggunakan local fallback jika kosong)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Akses aplikasi melalui peramban di `http://localhost:3000`.

### 5. Menjalankan Pengujian Otomatis
```bash
npm run test
```

---

## Dokumentasi Teknis Terperinci

Seluruh dokumentasi teknis sistem tersedia secara terpisah pada direktori [docs/](docs/):

- [docs/01-system-architecture.md](docs/01-system-architecture.md) — Topologi arsitektur sistem dan batas isolasi data.
- [docs/02-data-ingestion-and-processing.md](docs/02-data-ingestion-and-processing.md) — Parsing berkas, auto-mapping semantik, dan audit sanitasi data.
- [docs/03-analytics-and-heuristic-engine.md](docs/03-analytics-and-heuristic-engine.md) — Algoritma agregasi, visualisasi ECharts, dan kalkulasi AOV.
- [docs/04-ai-and-inference-pipeline.md](docs/04-ai-and-inference-pipeline.md) — Rantai inferensi model NVIDIA NIM dan sintesis SQL.
- [docs/05-state-management.md](docs/05-state-management.md) — Topologi Zustand store dan siklus cross-filtering.
- [docs/06-backend-api-reference.md](docs/06-backend-api-reference.md) — Spesifikasi REST API Next.js dan kontrak skema.
- [docs/07-auth-and-security.md](docs/07-auth-and-security.md) — Tata kelola keamanan, anti-formula injection, dan enkripsi.
- [docs/08-testing-and-deployment.md](docs/08-testing-and-deployment.md) — Panduan pengujian otomatis Vitest dan deployment produksi.

---

## Status Verifikasi & Kualitas Kode

```
 Test Files  15 passed (15)
      Tests  185 passed (185)
```

---

## Lisensi & Keamanan

Hak Cipta © 2026 Ethermind Agency. Seluruh hak cipta dilindungi undang-undang.
