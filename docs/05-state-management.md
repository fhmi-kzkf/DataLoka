# 05. State Management & Cross-Filtering Lifecycle

Manajemen state pada DataLoka dikelola menggunakan pustaka **Zustand** dengan prinsip pemisahan domain tanggung jawab (*Separation of Concerns*). Setiap store dirancang dengan granularitas tinggi untuk mencegah *unnecessary re-renders* dan memastikan performa 60 FPS saat memproses dataset besar.

---

## 1. Topologi Zustand Store

```
+-----------------------------------------------------------------------------------+
|                                ZUSTAND STORE TOPOLOGY                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +------------------------+  +------------------------+  +---------------------+  |
|  | useDatasetStore        |  | useDashboardStore      |  | useQualityStore     |  |
|  |------------------------|  |------------------------|  |---------------------|  |
|  | - rawData: Row[]       |  | - charts: ChartSlot[]  |  | - issues: Issue[]   |  |
|  | - columns: Column[]    |  | - datePreset: string   |  | - healthScore: num  |  |
|  | - filteredData: Row[]  |  | - customDateRange: obj |  | - appliedActions[]  |  |
|  | - activeTemplate: str  |  | - globalCategoryFilter |  | - runAudit()        |  |
|  | - setDataset()         |  | - setDatePreset()      |  | - applyCleansing()  |  |
|  +------------------------+  +------------------------+  +---------------------+  |
|               ^                          ^                          ^             |
|               |                          |                          |             |
|  +------------------------+  +------------------------+  +---------------------+  |
|  | useAuthStore           |  | useCommandStore        |  | useChartStore       |  |
|  |------------------------|  |------------------------|  |---------------------|  |
|  | - user: User | null    |  | - isOpen: boolean      |  | - activeType: map   |  |
|  | - isAuthenticated: bool|  | - chatMessages: Msg[]  |  | - sortMode: map     |  |
|  | - tier: "free"|"pro"   |  | - history: string[]    |  | - exportFormat      |  |
|  | - login() / logout()   |  | - executeCommand()     |  | - updateSlot()      |  |
|  +------------------------+  +------------------------+  +---------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Rincian Store Utama

### A. `useDatasetStore` (`src/stores/dataset-store.ts`)
Mengelola data mentah dan data hasil pemfilteran:
- **`rawData`**: Array baris asli dari file CSV/Excel.
- **`columns`**: Metadata kolom terklasifikasi (`name`, `type`, `role`).
- **`activeTemplate`**: Template aktif (`sales` | `ecommerce` | `umkm` | `finance`).

### B. `useDashboardStore` (`src/stores/dashboard-store.ts`)
Mengelola konfigurasi dasbor aktif dan filter global:
- **`datePreset`**: `"all"` | `"7d"` | `"30d"` | `"this_month"` | `"custom"`.
- **`customDateRange`**: `{ start: string; end: string } | null`.
- **`globalCategoryFilter`**: Nilai kategori aktif saat pengguna melakukan *cross-filtering* (misal: `"Fashion Wanita"`).
- **`charts`**: Daftar kartu visualisasi grafik aktif yang dapat ditambah, dihapus, atau dipin dari AI.
- **`isUnderlyingDataOpen`**: Status buka/tutup drawer data mentah (*Underlying Data Sheet*).

### C. `useAuthStore` (`src/stores/auth-store.ts`)
Mengelola sesi pengguna, status autentikasi, serta hak akses fitur:
- Mendukung integrasi **Firebase Authentication** dengan fallback otomatis ke **LocalStorage Resilient Auth Engine**.
- Menyimpan tier langganan (`free`, `starter`, `pro`, `enterprise`).

### D. `useQualityStore` (`src/stores/quality-store.ts`)
Mengelola status kesehatan data, metrik anomali (*duplicate*, *missing*, *outliers*), dan riwayat tindakan pembersihan data (*cleansing actions*).

---

## 3. Siklus Hidup Cross-Filtering Antargrafik

```
[ User mengklik irisan grafik ECharts (contoh: Kategori "Elektronik") ]
                           |
                           v
[ universal-chart-renderer.tsx menangkap onChartClick(params) ]
                           |
                           v
[ dashboard-composer.tsx memanggil setGlobalCategoryFilter("Elektronik") ]
                           |
                           +--------------------------------------------------+
                           |                                                  |
                           v                                                  v
             [ 1. Recompute KPI Metrics ]                       [ 2. Re-filter Data Sheet ]
             - Total Penjualan (Elektronik)                     - Tabel data mentah hanya
             - Jumlah Pesanan (Elektronik)                        menampilkan baris Elektronik
             - AOV Aktual (Elektronik)                          - Ekspor CSV khusus segmen
                           |
                           v
             [ 3. Update Chart Highlights ]
             - Grafik lain memperbarui agregat
             - Muncul badge "Cross-Filter: Elektronik [✕]"
```

Siklus cross-filter ini dieksekusi secara instan (< 16ms) tanpa perlu request round-trip ke server.
