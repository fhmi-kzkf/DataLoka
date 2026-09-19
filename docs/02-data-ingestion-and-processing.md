# 02. Data Ingestion, Auto-Mapping, & Cleansing Pipeline

Modul Data Ingestion dan Data Cleansing pada DataLoka bertanggung jawab untuk membaca berkas data mentah tabular pengguna, melakukan normalisasi skema, mendeteksi inkonsistensi tipe data, serta mengeksekusi transformasi sanitasi secara instan di sisi klien.

---

## 1. Alur Kerja Pipeline Ingesti

```
+-------------------------------------------------------------------------------+
|                             DATA INGESTION PIPELINE                           |
|                                                                               |
|  [ File Upload: CSV / XLSX / XLS ]                                            |
|                |                                                              |
|                v                                                              |
|  [ 1. Parser Dispatcher ]                                                     |
|       - CSV  -> PapaParse (Streaming Worker / Chunk Buffer)                   |
|       - XLSX -> SheetJS (ArrayBuffer Reader -> Sheet JSON)                    |
|                |                                                              |
|                v                                                              |
|  [ 2. Header Normalization & Type Inference ]                                 |
|       - Trim whitespace & strip invalid characters                            |
|       - Deteksi format nilai: ISO Date, IDR Currency, Number, String          |
|                |                                                              |
|                v                                                              |
|  [ 3. Semantic Auto-Classification Engine ]                                  |
|       - Pencocokan kamus semantik istilah bisnis Indonesia & Inggris          |
|       - Penentuan peran kolom: DATE | DIMENSION | METRIC                      |
|                |                                                              |
|                v                                                              |
|  [ 4. Quality Audit Engine ]                                                  |
|       - Pengecekan Missing Values (Null/Empty)                                |
|       - Pengecekan Duplikat Baris                                             |
|       - Pengecekan Outlier Numerik (Metode IQR / Z-Score)                     |
|       - Pengecekan Anomali Tipe Data Campuran                                 |
|                |                                                              |
|                v                                                              |
|  [ 5. Interactive Cleansing Actions ]                                         |
|       - Drop Missing / Fill with Median or Mode                               |
|       - Deduplicate Rows                                                      |
|       - Trim Whitespace & Standardize Casing                                  |
+-------------------------------------------------------------------------------+
```

---

## 2. Spesifikasi Parser Berkas

### A. Parser CSV (`src/core/parser/csv-parser.ts`)
Menggunakan **PapaParse** dengan konfigurasi:
- `header: true` untuk memetakan baris pertama sebagai daftar nama kolom (*headers*).
- `skipEmptyLines: true` untuk mengabaikan baris kosong di akhir berkas.
- `dynamicTyping: true` untuk mengonversi angka dan boolean secara otomatis.

### B. Parser Excel (`src/core/parser/excel-parser.ts`)
Menggunakan pustaka **SheetJS (xlsx)**:
- Membaca binary stream melalui `read(data, { type: "array" })`.
- Mengambil lembar kerja pertama (`Sheets[SheetNames[0]]`).
- Menghasilkan array objek JSON yang dinormalisasi.

---

## 3. Aturan Klasifikasi Semantik Kolom (`src/core/mapping/auto-mapper.ts`)

Sistem mengklasifikasikan setiap kolom ke dalam salah satu dari tiga peran (*semantic role*):

| Peran Kolom (*Role*) | Tipe Data Utama | Kamus Kata Kunci Pendeteksi (Case-Insensitive) |
| :--- | :--- | :--- |
| **`date`** | `Date`, `ISO-8601`, `DD/MM/YYYY` | `tanggal`, `date`, `waktu`, `time`, `periode`, `bulan`, `created_at`, `transaksi_date` |
| **`metric`** | `Number`, `Float`, `Currency` | `total`, `omset`, `harga`, `price`, `penjualan`, `sales`, `jumlah`, `qty`, `diskon`, `profit`, `keuntungan`, `biaya`, `hpp`, `transaksi` |
| **`dimension`** | `String`, `Category`, `Enum` | `kategori`, `category`, `produk`, `product`, `cabang`, `wilayah`, `kota`, `provinsi`, `metode_bayar`, `status`, `pelanggan`, `sku` |

```typescript
// Contoh Output Klasifikasi Semantik Kolom
export interface ColumnClassification {
  name: string;
  type: "string" | "number" | "date" | "boolean";
  role: "metric" | "dimension" | "date";
  confidence: number; // 0.0 - 1.0
  sampleValues: (string | number)[];
  distinctCount: number;
  nullCount: number;
}
```

---

## 4. Mesin Audit Kualitas Data (`src/core/quality/audit-engine.ts`)

Audit kualitas data menghasilkan skor kesehatan (*Health Score*) dari skala 0 hingga 100 berdasarkan formula penalti terbobot:

$$\text{HealthScore} = \max\left(0, 100 - \sum (\text{Penalty} \times \text{Weight})\right)$$

### Aturan Penalti:
1. **Missing Values**:
   - Jika persentase baris dengan nilai kosong $> 1\%$, penalti = $\min(25, \text{persentase} \times 2)$.
2. **Duplicate Rows**:
   - Jika terdapat baris identik, penalti = $\min(20, \text{jumlah duplikat} \times 1.5)$.
3. **Outlier Anomaly**:
   - Nilai numerik melebihi $Q_3 + 1.5 \times \text{IQR}$ atau kurang dari $Q_1 - 1.5 \times \text{IQR}$, penalti = $\min(15, \text{jumlah outlier})$.
4. **Data Type Inconsistency**:
   - Sel yang memiliki tipe data campur aduk (contoh: teks di dalam kolom numerik), penalti = $\min(20, \text{sel anomali} \times 3)$.

---

## 5. Pipeline Transformasi Pembersihan Data (`src/core/quality/cleansing-pipeline.ts`)

Pengguna dapat mengeksekusi aksi pembersihan secara terisolasi atau bersamaan:

```typescript
export type CleansingActionType =
  | "drop_null_rows"
  | "fill_null_median"
  | "fill_null_mode"
  | "deduplicate"
  | "trim_whitespace"
  | "remove_outliers";

export interface CleansingAction {
  id: string;
  type: CleansingActionType;
  targetColumn?: string;
  applied: boolean;
}
```

Hasil pembersihan data mentransmisikan data yang telah dinormalisasi ke `useDatasetStore` dan meregenerasi visualisasi dasbor secara reaktif.
