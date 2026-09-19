# 04. AI Inference & Natural Language Pipeline

Pipeline AI pada DataLoka memungkinkan pengguna untuk mengeksplorasi data, menghasilkan sintesis SQL, dan memodifikasi dasbor menggunakan bahasa alami bahasa Indonesia maupun bahasa Inggris.

---

## 1. Arsitektur Inferensi AI

```
[ User Natural Language Query ] (contoh: "Top 5 Kategori Omset Terbesar")
               |
               v
  [ POST /api/ai/query ]
               |
               +---> Check API Key (`NVIDIA_NIM_API_KEY`)
               |
               |-- (Key Ada) --> [ NVIDIA NIM Failover Orchestrator ]
               |                    |
               |                    |-- Model 1: meta/llama-3.1-70b-instruct (Primary)
               |                    |      | (Network Error / Timeout / 429)
               |                    |-- Model 2: meta/llama-3.3-70b-instruct
               |                    |      | (Failover)
               |                    |-- Model 3: mistralai/mixtral-8x22b-instruct
               |                    |      | (Failover)
               |                    |-- Model 4: meta/llama3-8b-instruct
               |                    |      | (Semua Model Remote Gagal)
               |                    v
               +------------------> [ Local Deterministic Indonesian NLP Engine ]
                                    (0ms Latency, Heuristic Regex & Rule Matcher)
                                           |
                                           v
                          [ Structured Query Result JSON ]
                          - Intent Type
                          - SQL Expression
                          - Chart Recommendation
                          - Executive Business Summary
```

---

## 2. Rantai Model Cadangan NVIDIA NIM (`src/core/ai/nvidia-nim-client.ts`)

Untuk menjamin ketersediaan layanan (*high availability*), klien inferensi mengimplementasikan rantai failover otomatis:

| Prioritas | Identifier Model | Bobot / Peran |
| :--- | :--- | :--- |
| **Tier 1 (Primary)** | `meta/llama-3.1-70b-instruct` | Akurasi sintesis SQL tertinggi dan pemahaman kontekstual bahasa Indonesia mendalam. |
| **Tier 2 (Fallback 1)** | `meta/llama-3.3-70b-instruct` | Model kapasitas tinggi generasi terbaru untuk redundansi. |
| **Tier 3 (Fallback 2)** | `mistralai/mixtral-8x22b-instruct` | MoE (Mixture of Experts) untuk latensi cepat dan parsing kueri analitik. |
| **Tier 4 (Fallback 3)** | `meta/llama3-8b-instruct` | Model inferensi cepat berukuran ringkas. |
| **Tier 5 (Offline)** | `Local-Heuristic-Engine` | Fallback lokal bebas jaringan tanpa dependensi API eksternal. |

---

## 3. Format Prompt System & Kontrak JSON

Prompt sistem (`system prompt`) memaksa model untuk merespons **hanya** dalam format JSON terstruktur yang valid tanpa teks markdown pembuka:

```json
{
  "intent": "top_ranking" | "trend_analysis" | "proportion" | "summary" | "filter_command",
  "confidence": 0.95,
  "summary": "Analisis ringkas temuan data dalam bahasa Indonesia formal.",
  "sqlQuery": "SELECT kategori, SUM(total_penjualan) AS total_omset FROM dataset GROUP BY kategori ORDER BY total_omset DESC LIMIT 5;",
  "chartRecommendation": {
    "type": "bar" | "line" | "donut" | "scatter",
    "title": "Top 5 Kategori Penjualan",
    "dimensionColumn": "kategori",
    "metricColumns": ["total_penjualan"],
    "aggregation": "sum"
  }
}
```

---

## 4. Mesin NLP Deterministik Bahasa Indonesia (`src/core/ai/indonesian-nlp-engine.ts`)

Jika tidak ada koneksi internet atau kunci API tidak dikonfigurasi, engine lokal mengevaluasi kueri pengguna menggunakan pola ekspresi reguler dan pencocokan semantik:

```typescript
// Contoh Pola NLP Deterministik
const PATTERNS = [
  {
    regex: /(?:top|tertinggi|terbesar|peringkat|ranking)\s*(\d+)?/i,
    intent: "top_ranking",
    chartType: "bar",
    sortOrder: "desc",
  },
  {
    regex: /(?:tren|waktu|hari|bulan|tahun|historis|kronologis)/i,
    intent: "trend_analysis",
    chartType: "line",
  },
  {
    regex: /(?:proporsi|persentase|porsi|bagian|kontribusi|komposisi)/i,
    intent: "proportion",
    chartType: "donut",
  },
  {
    regex: /(?:rata-rata|aov|mean|average)/i,
    intent: "summary",
    operation: "avg",
  }
];
```

Hasil dari mesin NLP lokal diuji secara berkala dalam unit test `src/__tests__/backend-api.test.ts` dan memberikan akurasi tinggi pada berbagai format pertanyaan bisnis Indonesia.
