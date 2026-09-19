# DataLoka Documentation Index

Selamat datang di repositori dokumentasi teknis **DataLoka** — platform Business Intelligence & Analytics modern berbasis arsitektur *Hybrid Client-Side* dengan *Zero-Cloud Raw Data Exposure* dan kapabilitas inferensi AI terdedikasi.

Dokumentasi ini disusun secara modular dan mendalam untuk kebutuhan arsitek sistem, insinyur backend, insinyur frontend, dan tim operasional.

---

## Navigasi Dokumentasi

| Modul Dokumen | Berkas Sumber | Cakupan Teknis |
| :--- | :--- | :--- |
| **01. System Architecture** | [01-system-architecture.md](file:///d:/Ethermind_Agency/DataLoka/docs/01-system-architecture.md) | Topologi arsitektur hibrida, batas isolasi data klien vs awan, diagram alur sistem, dan tata letak direktori repositori. |
| **02. Data Ingestion & Cleansing** | [02-data-ingestion-and-processing.md](file:///d:/Ethermind_Agency/DataLoka/docs/02-data-ingestion-and-processing.md) | Parsing CSV/Excel via Web Worker/PapaParse/XLSX, klasifikasi semantik header, audit anomali data, dan pipeline sanitasi sel. |
| **03. Analytics & Heuristic Engine** | [03-analytics-and-heuristic-engine.md](file:///d:/Ethermind_Agency/DataLoka/docs/03-analytics-and-heuristic-engine.md) | Komputasi agregasi multi-dimensi, aturan heuristik penentuan visualisasi grafik, dual Y-axis ECharts builder, dan metrik AOV. |
| **04. AI & Inference Pipeline** | [04-ai-and-inference-pipeline.md](file:///d:/Ethermind_Agency/DataLoka/docs/04-ai-and-inference-pipeline.md) | Jalur inferensi AI, rantai fallback multi-tingkat NVIDIA NIM, sintesis kueri SQL otomatis, dan mesin NLP deterministik lokal. |
| **05. State Management** | [05-state-management.md](file:///d:/Ethermind_Agency/DataLoka/docs/05-state-management.md) | Arsitektur Zustand store, siklus hidup state cross-filtering antargrafik, persistence layer, dan sinkronisasi dataset. |
| **06. Backend API Reference** | [06-backend-api-reference.md](file:///d:/Ethermind_Agency/DataLoka/docs/06-backend-api-reference.md) | Spesifikasi lengkap seluruh endpoint REST API (`/api/ai/query`, `/api/mapping/classify`, `/api/quality/*`, `/api/export/*`, `/api/share`, `/api/health`). |
| **07. Auth & Security Governance** | [07-auth-and-security.md](file:///d:/Ethermind_Agency/DataLoka/docs/07-auth-and-security.md) | Arsitektur otentikasi Firebase & Local fallback, mitigasi CSV Formula Injection, CSP headers, dan tokenisasi enkripsi snapshot. |
| **08. Testing & Deployment Guide** | [08-testing-and-deployment.md](file:///d:/Ethermind_Agency/DataLoka/docs/08-testing-and-deployment.md) | Topologi pengujian otomatis Vitest (15 suites / 185 unit & integration tests), variabel lingkungan, build Turbopack, dan deployment. |

---

## Ringkasan Spesifikasi Sistem

- **Framework Core**: Next.js 15.5+ (App Router & Turbopack)
- **Bahasa Pemrograman**: TypeScript 5.0+ (Strict Type Checking)
- **Mesin Grafik**: Apache ECharts 5.5+
- **Manajemen State**: Zustand 5.0+
- **Inference Engine**: NVIDIA NIM Multi-Tier Failover Chain & Local Indonesian NLP Fallback
- **Otentikasi & Penyimpanan**: Firebase v10 / LocalStorage Resilient Session Engine
- **Test Runner**: Vitest 3.0+ & Testing Library
