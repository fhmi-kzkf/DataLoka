# 06. Backend API Reference & Endpoints

Seluruh API route DataLoka diimplementasikan menggunakan Next.js App Router API Handlers (`src/app/api/*`) dengan arsitektur stateless dan validasi skema ketat.

---

## 1. Daftar Endpoint REST API

| Endpoint | Metode | Deskripsi | Autentikasi |
| :--- | :--- | :--- | :--- |
| `/api/ai/query` | `POST` | Inferensi NLP bahasa alami & sintesis SQL via failover chain NVIDIA NIM. | Opsional |
| `/api/mapping/classify` | `POST` | Klasifikasi semantik header kolom dataset. | Public |
| `/api/quality/audit` | `POST` | Audit anomali dataset dan kalkulasi Health Score. | Public |
| `/api/quality/cleanse` | `POST` | Eksekusi pipeline transformasi dan sanitasi data. | Public |
| `/api/export/data` | `POST` | Ekspor data ke format CSV dengan proteksi formula injection. | Public |
| `/api/share` | `POST` / `GET` | Generate dan decode token snapshot dasbor publik terenkripsi. | Public |
| `/api/health` | `GET` | Telemetri kesehatan layanan dan latency monitor. | Public |

---

## 2. Spesifikasi Rinci Setiap Endpoint

### A. `POST /api/ai/query`
Mengeksekusi pertanyaan bahasa alami pengguna dan menghasilkan sintesis kueri SQL beserta rekomendasi grafik.

#### Request Body:
```json
{
  "prompt": "Tampilkan top 5 produk paling laris",
  "schemaSummary": {
    "columns": [
      { "name": "nama_produk", "type": "string", "role": "dimension" },
      { "name": "total_penjualan", "type": "number", "role": "metric" },
      { "name": "tanggal", "type": "date", "role": "date" }
    ],
    "rowCount": 250
  }
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "intent": "top_ranking",
    "confidence": 0.95,
    "summary": "5 produk teratas menghasilkan kontribusi sebesar Rp 45.000.000.",
    "sqlQuery": "SELECT nama_produk, SUM(total_penjualan) AS total FROM dataset GROUP BY nama_produk ORDER BY total DESC LIMIT 5;",
    "chartRecommendation": {
      "type": "bar",
      "title": "Top 5 Produk Paling Laris",
      "dimensionColumn": "nama_produk",
      "metricColumns": ["total_penjualan"],
      "aggregation": "sum"
    }
  },
  "telemetry": {
    "latencyMs": 85,
    "modelUsed": "meta/llama-3.1-70b-instruct",
    "requestId": "f4c1ff91-2c37-4e96-bbcd-de2a2c90956e"
  }
}
```

---

### B. `POST /api/mapping/classify`
Mengklasifikasikan peran semantik daftar kolom berdasarkan nama dan sampel nilai.

#### Request Body:
```json
{
  "columns": ["tanggal_transaksi", "kategori_barang", "nilai_omset"],
  "sampleRows": [
    { "tanggal_transaksi": "2026-01-01", "kategori_barang": "Fashion", "nilai_omset": 150000 }
  ]
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "classifications": [
      { "name": "tanggal_transaksi", "type": "date", "role": "date", "confidence": 0.98 },
      { "name": "kategori_barang", "type": "string", "role": "dimension", "confidence": 0.95 },
      { "name": "nilai_omset", "type": "number", "role": "metric", "confidence": 0.99 }
    ]
  }
}
```

---

### C. `POST /api/quality/audit`
Mengaudit kesehatan dataset mentah dan menghasilkan daftar anomali serta rekomendasi aksi perbaikan.

#### Request Body:
```json
{
  "rows": [ ... ],
  "columns": [ ... ]
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "healthScore": 92,
    "status": "clean",
    "totalIssues": 2,
    "issues": [
      { "id": "iss-1", "type": "missing_values", "column": "kategori", "count": 3 },
      { "id": "iss-2", "type": "outlier", "column": "total_penjualan", "count": 1 }
    ]
  }
}
```

---

### D. `POST /api/export/data`
Menerima array data dan menghasilkan berkas CSV yang telah disanitasi dari potensi formula injection.

#### Request Body:
```json
{
  "filename": "laporan_penjualan_segmen.csv",
  "data": [
    { "kategori": "Elektronik", "omset": 5000000, "catatan": "=SUM(A1:A10)" }
  ]
}
```

#### Response (200 OK):
- **Headers**: `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="laporan_penjualan_segmen.csv"`
- **Body**: Baris teks CSV dengan karakter formula (`=`, `+`, `-`, `@`) yang telah di-escape dengan kutip tunggal (`'`).

---

### E. `POST & GET /api/share`
- **POST**: Mengenkripsi payload konfigurasi dasbor menjadi URL token snapshot ringkas.
- **GET `?token=<snapshotToken>`**: Mendekode token snapshot menjadi konfigurasi dasbor publik.

---

### F. `GET /api/health`
Mengembalikan status telemetri server backend, uptime, dan ketersediaan layanan inferensi AI.

#### Response (200 OK):
```json
{
  "status": "healthy",
  "service": "DataLoka-Backend",
  "timestamp": "2026-09-19T12:33:45.693Z",
  "aiEngine": {
    "nimConfigured": true,
    "fallbackActive": true,
    "primaryModel": "meta/llama-3.1-70b-instruct"
  }
}
```
