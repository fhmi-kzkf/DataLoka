# 01. System Architecture & Core Topology

Platform **DataLoka** dibangun dengan arsitektur **Hybrid Client-First Analytics Engine**. Prinsip inti dari arsitektur ini adalah menjamin privasi data 100% (*Zero-Cloud Raw Data Exposure*) di mana file dataset mentah pengguna (CSV, XLSX, XLS) diproses, dibersihkan, dihitung, dan dirender sepenuhnya di dalam browser (Client Memory / IndexedDB), sementara server backend hanya menangani tugas inferensi stateless berbasis metadata agregat dan tokenisasi snapshot.

---

## 1. Topologi Arsitektur Tingkat Tinggi

```
+-------------------------------------------------------------------------------+
|                             CLIENT-SIDE (BROWSER)                             |
|                                                                               |
|  +-------------------+      +---------------------+     +------------------+  |
|  | File Ingestion    | ---> | PapaParse / XLSX    | --> | Classification   |  |
|  | (Drag & Drop)     |      | (Web Worker Stream) |     | & Auto-Mapping   |  |
|  +-------------------+      +---------------------+     +------------------+  |
|                                                                   |           |
|  +-------------------+      +---------------------+               v           |
|  | Apache ECharts    | <--- | Aggregator & Rules  | <--- [ Quality Audit   ]  |
|  | Visual Engine     |      | Analytics Engine    |      [ & Cleanse Trans ]  |
|  +-------------------+      +---------------------+                           |
|           ^                            ^                                      |
|           |                            |                                      |
|  +-------------------+      +---------------------+                           |
|  | Cross-Filtering   |      | Tanya Data AI Modal |                           |
|  | State Coordinator |      | (Command Bar Drawer)|                           |
|  +-------------------+      +---------------------+                           |
|                                        | (Hanya mengirim Ringkasan Schema     |
|                                        |  & Kueri Pertanyaan - Tanpa Data     |
|                                        |  Baris Mentah / PII Pengguna)        |
+----------------------------------------|--------------------------------------+
                                         v
+-------------------------------------------------------------------------------+
|                             BACKEND API (NEXT.JS)                             |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | POST /api/ai/query                                                      |  |
|  |                                                                         |  |
|  |   [ 1. NVIDIA NIM Primary Engine ] (meta/llama-3.1-70b-instruct)        |  |
|  |             | (Fallback On Fail)                                        |  |
|  |   [ 2. Multi-Tier NIM Candidate Chain ]                                 |  |
|  |             | (Fallback On All Remote Fails)                            |  |
|  |   [ 3. Local Deterministic Indonesian NLP Engine ]                      |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-----------------------+  +-----------------------+  +-------------------+  |
|  | POST /api/quality/*   |  | POST /api/share       |  | POST /api/export  |  |
|  | Sanitasi & Audit API  |  | Enkripsi Snapshot URL |  | CSV Anti-Injection|  |
|  +-----------------------+  +-----------------------+  +-------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 2. Batas Isolasi Data (Privacy & Security Boundary)

DataLoka membagi lapisan data menjadi dua domain terisolasi:

| Lapisan Domain | Lokasi Eksekusi | Data yang Diizinkan | Jaminan Keamanan |
| :--- | :--- | :--- | :--- |
| **Raw Data Plane** | Klien (Browser RAM / IndexedDB) | Seluruh baris data transaksi, kolom PII, nilai numerik mentah, file CSV/XLSX asli. | Data mentah **tidak pernah** dikirimkan melalui jaringan HTTP ke server analitik pihak ketiga. |
| **Metadata & Query Plane** | Server Backend / NVIDIA NIM | Nama kolom (*header*), tipe data (`date`, `metric`, `dimension`), ringkasan statistik (total baris, rentang nilai), teks prompt pertanyaan. | Payload ringan (< 10 KB), bebas dari data rahasia individual pengguna. |

---

## 3. Struktur Tata Letak Repositori

```
DataLoka/
├── docs/                        # Dokumentasi arsitektur dan panduan teknis
├── public/                      # Aset statis dan dataset sampel
│   └── datasets/                # File CSV/XLSX sampel uji analitik
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # Serverless API routes
│   │   │   ├── ai/query/        # Inferensi AI & Sintesis SQL
│   │   │   ├── export/data/     # Sanitasi ekspor data anti-formula-injection
│   │   │   ├── health/          # Telemetri & status layanan backend
│   │   │   ├── mapping/         # Klasifikasi semantik kolom
│   │   │   ├── quality/         # Audit anomali & cleansing pipeline
│   │   │   └── share/           # Tokenisasi snapshot dasbor terenkripsi
│   │   ├── dashboard/           # Halaman dasbor analitik utama
│   │   ├── globals.css          # Desain sistem CSS & tema editorial
│   │   ├── layout.tsx           # Root layout & providers
│   │   └── page.tsx             # Landing page institusional
│   ├── components/              # Komponen antarmuka React
│   │   ├── auth/                # Modal login, register, & reset password
│   │   ├── charts/              # ECharts wrappers & options builder
│   │   ├── composite/           # Komponen layout gabungan
│   │   ├── landing/             # Bagian halaman depan & FAQ interaktif
│   │   ├── modules/             # Modul fungsional dasbor (Command Bar, Ingestion, Quality, Sheet)
│   │   ├── pricing/             # Komponen tabel harga & simulasi checkout
│   │   └── ui/                  # Primitif UI (Button, Card, Input, Modal, Badge)
│   ├── core/                    # Engine bisnis independen
│   │   ├── ai/                  # NVIDIA NIM client & fallback chain
│   │   ├── auth/                # Firebase adapter & local auth fallback
│   │   ├── command/             # Parsing & eksekusi kueri dasbor
│   │   ├── engine/              # Aggregator & aturan heuristik visualisasi
│   │   ├── export/              # Generator CSV, PDF, dan sanitasi formula
│   │   ├── insight/             # Generator narasi tren bisnis otomatis
│   │   ├── mapping/             # Heuristik auto-mapping header Indonesia
│   │   ├── parser/              # Parser CSV & XLSX (PapaParse, SheetJS)
│   │   ├── quality/             # Deteksi anomali data & transformation rules
│   │   ├── share/               # Encoder/decoder snapshot token
│   │   ├── storage/             # IndexedDB & LocalStorage adapters
│   │   └── template/            # Preset dashboard template (Sales, E-commerce, UMKM)
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilitas murni & formatters
│   ├── stores/                  # Zustand state stores
│   └── types/                   # Definisi TypeScript interface & types
└── vitest.config.mts            # Konfigurasi pengujian Vitest
```

---

## 4. Pola Desain (Design Patterns) Kunci

1. **Deterministic Heuristic Engine First**: Sebelum memanggil inferensi LLM eksternal, sistem selalu menjalankan aturan heuristik deterministik lokal untuk menjamin latensi sub-5ms pada perintah dasbor umum.
2. **Multi-Tier Fault Tolerant Failover**: Jika layanan eksternal AI mengalami *rate limit*, *timeout*, atau kegagalan jaringan, sistem otomatis berpindah ke model cadangan hingga ke mesin NLP lokal tanpa menghentikan pengalaman pengguna.
3. **Reactive State Coordination**: Menggunakan **Zustand** dengan *unidirectional data flow*, memastikan sinkronisasi instan antara filter tanggal, pemilihan kategori (*cross-filtering*), grafik ECharts, dan tabel data mentah (*underlying sheet*).
