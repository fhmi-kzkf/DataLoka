# 03. Analytics, Aggregator, & Heuristic Engine

Engine analitik DataLoka mengoperasikan pipeline komputasi data langsung di thread utama/Web Worker klien menggunakan algoritma agregasi in-memory dan generator konfigurasi Apache ECharts berkinerja tinggi.

---

## 1. Modul Agregasi Data (`src/core/engine/aggregator.ts`)

Modul agregator mengeksekusi operasi `GROUP BY`, `SUM`, `AVG`, `COUNT`, `MIN`, dan `MAX` dalam kompleksitas waktu $O(N)$ linear.

```typescript
export interface AggregationOptions {
  dimension: string;
  metric: string;
  operation: "sum" | "avg" | "count" | "min" | "max";
  sortBy?: "value" | "label";
  sortOrder?: "asc" | "desc";
  limit?: number;
  filterPredicate?: (row: Record<string, unknown>) => boolean;
}
```

### Perhitungan Metrik Eksekutif Utama (KPI Summary)
1. **Total Revenue / Omset**: $\sum \text{metric}_{\text{sales}}$
2. **Total Transaksi / Volume**: $\sum \text{metric}_{\text{orders}}$ atau $N_{\text{rows}}$
3. **AOV Aktual (Average Order Value)**:
   $$\text{AOV} = \frac{\text{Total Penjualan}}{\text{Jumlah Pesanan}}$$
4. **Sparkline Tren Harian**: Agregasi nilai harian selama periode aktif untuk disematkan pada kartu KPI.

---

## 2. Mesin Aturan Heuristik Visualisasi (`src/core/engine/heuristic-rules.ts`)

Engine heuristik mengevaluasi struktur kolom dataset dan secara otomatis merekomendasikan konfigurasi grafik yang paling optimal:

| Pola Karakteristik Kolom | Rekomendasi Tipe Grafik | Alasan Analitik |
| :--- | :--- | :--- |
| Terdapat kolom `date` + 1 atau 2 `metric` | **Line Chart / Area Chart** | Visualisasi tren pergerakan nilai terhadap waktu (kronologis). |
| Terdapat kolom `dimension` dengan kardinalitas rendah ($\le 6$ kategori) + 1 `metric` | **Donut Chart / Pie Chart** | Visualisasi komposisi dan proporsi pangsa pasar. |
| Terdapat kolom `dimension` dengan kardinalitas sedang (7 - 25 kategori) + 1 `metric` | **Bar Chart (Horizontal / Vertical)** | Visualisasi perbandingan ranking kontributor dan performa. |
| Terdapat $\ge 2$ `metric` tanpa dimensi kategori yang jelas | **Scatter Plot / Dual Bar** | Pengujian korelasi dan distribusi antarvariabel. |

---

## 3. Builder Opsi ECharts & Skala Ganda (Dual Y-Axis)

File `src/components/charts/options-builder.ts` mengonfigurasi opsi render Apache ECharts.

### Arsitektur Dual Y-Axis pada Grafik Tren Waktu
Untuk grafik deret waktu yang memadukan metrik moneter berskala besar (contoh: Omset jutaan Rupiah) dan metrik kuantitas berskala kecil (contoh: Jumlah order puluhan/ratusan unit), sistem menerapkan **Dual Y-Axis**:

```typescript
// Konfigurasi Dual Y-Axis di options-builder.ts
yAxis: isMultiMetricTime
  ? [
      {
        type: "value",
        name: humanizeColumnName(metricColumns[0]),
        position: "left",
        axisLabel: {
          formatter: (val: number) => formatCompactCurrency(val),
        },
      },
      {
        type: "value",
        name: humanizeColumnName(metricColumns[1]),
        position: "right",
        splitLine: { show: false }, // Mencegah tumpang tindih garis grid
        axisLabel: {
          formatter: (val: number) => formatCompactNumber(val),
        },
      },
    ]
  : [
      {
        type: "value",
        axisLabel: {
          formatter: (val: number) => formatCompactCurrency(val),
        },
      },
    ];
```

Dengan konfigurasi ini:
- Garis **Total Penjualan** terikat pada sumbu kiri (`yAxisIndex: 0`).
- Garis **Jumlah Pesanan** terikat pada sumbu kanan (`yAxisIndex: 1`).
- Kedua metrik terbaca fluktuasinya secara presisi tanpa ada garis yang menempel di dasar sumbu.

---

## 4. Formatters & Humanisasi Teks (`src/lib/formatters.ts`)

Sistem menerapkan humanisasi otomatis terhadap seluruh nama kolom mentah (*snake_case*, *kebab-case*, *camelCase*) sebelum dirender ke UI:

```typescript
// Contoh transformasi:
humanizeColumnName("total_penjualan"); // Hasil: "Total Penjualan"
humanizeColumnName("jumlah_pesanan");  // Hasil: "Jumlah Pesanan"
humanizeColumnName("kategori_produk"); // Hasil: "Kategori Produk"

humanizeChartTitle("Tren total_penjualan & jumlah_pesanan Berdasarkan Waktu");
// Hasil: "Tren Total Penjualan & Jumlah Pesanan Berdasarkan Waktu"
```
