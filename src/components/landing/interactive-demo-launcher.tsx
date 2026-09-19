"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDatasetStore } from "@/stores/dataset-store";
import { useMappingStore } from "@/stores/mapping-store";
import { useChartStore } from "@/stores/chart-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { Button } from "@/components/ui/button";
import type { DatasetSchema, DatasetRow } from "@/types/dataset";
import type { TemplateId } from "@/types/template";

interface DemoPreset {
  id: string;
  title: string;
  subtitle: string;
  templateId: TemplateId;
  category: string;
  sampleRowsCount: number;
  highlightMetric: string;
  data: DatasetRow[];
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "preset_ecommerce",
    title: "Toko Retail & E-Commerce Omnichannel",
    subtitle: "Analisis performa penjualan Shopee & Tokopedia, variasi kategori, dan ongkos kirim.",
    templateId: "ecommerce",
    category: "Retail & UMKM",
    sampleRowsCount: 1540,
    highlightMetric: "Rp 148,2 jt GMV",
    data: [
      { tanggal: "2026-01-01", kategori: "Fashion Wanita", produk: "Kemeja Linen Sage", total_penjualan: 4500000, jumlah_pesanan: 30, wilayah: "Jakarta", ongkir: 18000 },
      { tanggal: "2026-01-02", kategori: "Fashion Pria", produk: "Celana Chino Slim", total_penjualan: 3200000, jumlah_pesanan: 20, wilayah: "Bandung", ongkir: 15000 },
      { tanggal: "2026-01-03", kategori: "Elektronik", produk: "TWS Earbuds ANC", total_penjualan: 8900000, jumlah_pesanan: 45, wilayah: "Surabaya", ongkir: 22000 },
      { tanggal: "2026-01-04", kategori: "Kecantikan", produk: "Serum Niacinamide", total_penjualan: 6100000, jumlah_pesanan: 52, wilayah: "Jakarta", ongkir: 14000 },
      { tanggal: "2026-01-05", kategori: "Fashion Wanita", produk: "Dress Katun Floral", total_penjualan: 5400000, jumlah_pesanan: 34, wilayah: "Semarang", ongkir: 19000 },
      { tanggal: "2026-01-06", kategori: "Makanan & Minuman", produk: "Kopi Arabika Gayo", total_penjualan: 2800000, jumlah_pesanan: 38, wilayah: "Yogyakarta", ongkir: 16000 },
      { tanggal: "2026-01-07", kategori: "Elektronik", produk: "Smartwatch AMOLED", total_penjualan: 9400000, jumlah_pesanan: 42, wilayah: "Jakarta", ongkir: 21000 },
    ],
  },
  {
    id: "preset_sales",
    title: "B2B Sales Pipeline & Quota",
    subtitle: "Pelacakan deal ARR, win rate per sales executive, dan akselerasi tahapan negosiasi.",
    templateId: "sales",
    category: "B2B SaaS",
    sampleRowsCount: 420,
    highlightMetric: "Rp 850 jt Pipeline",
    data: [
      { tanggal: "2026-01-10", sales_rep: "Aditya Pratama", stage: "Closed Won", deal_size: 150000000, client: "Bank Mandiri Mitra", kategori: "Enterprise" },
      { tanggal: "2026-01-12", sales_rep: "Sarah Utami", stage: "Negotiation", deal_size: 85000000, client: "Logistik Nusantara", kategori: "Mid-Market" },
      { tanggal: "2026-01-15", sales_rep: "Budi Santoso", stage: "Closed Won", deal_size: 120000000, client: "Retailindo Group", kategori: "Enterprise" },
      { tanggal: "2026-01-18", sales_rep: "Sarah Utami", stage: "Proposal", deal_size: 60000000, client: "Apotek Medika", kategori: "Mid-Market" },
      { tanggal: "2026-01-20", sales_rep: "Aditya Pratama", stage: "Closed Won", deal_size: 210000000, client: "Fintech Maju Bersama", kategori: "Enterprise" },
      { tanggal: "2026-01-22", sales_rep: "Budi Santoso", stage: "Discovery", deal_size: 45000000, client: "Klinik Sehat", kategori: "Mid-Market" },
    ],
  },
  {
    id: "preset_finance",
    title: "Laporan Laba Rugi & Arus Kas UMKM",
    subtitle: "Struktur beban operasional, margin kotor, dan proyeksi likuiditas bulanan.",
    templateId: "finance",
    category: "Fiskal & Keuangan",
    sampleRowsCount: 680,
    highlightMetric: "32.4% Net Margin",
    data: [
      { bulan: "Januari", revenue: 85000000, cogs: 42000000, opex: 18000000, net_profit: 25000000, kategori: "Restoran & Kafe" },
      { bulan: "Februari", revenue: 92000000, cogs: 45000000, opex: 19000000, net_profit: 28000000, kategori: "Restoran & Kafe" },
      { bulan: "Maret", revenue: 108000000, cogs: 51000000, opex: 21000000, net_profit: 36000000, kategori: "Restoran & Kafe" },
      { bulan: "April", revenue: 115000000, cogs: 53000000, opex: 22000000, net_profit: 40000000, kategori: "Restoran & Kafe" },
      { bulan: "Mei", revenue: 124000000, cogs: 57000000, opex: 24000000, net_profit: 43000000, kategori: "Restoran & Kafe" },
    ],
  },
];

export const InteractiveDemoLauncher: React.FC = () => {
  const router = useRouter();
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const { setDataset } = useDatasetStore();
  const { generateMapping } = useMappingStore();
  const { generateRecommendations } = useChartStore();
  const { initializeFromEngine } = useDashboardStore();

  const handleLaunchPreset = (preset: DemoPreset) => {
    setLaunchingId(preset.id);
    const datasetId = `demo_${preset.id}_${Date.now()}`;
    const headers = Object.keys(preset.data[0]);

    const datasetObj: DatasetSchema = {
      id: datasetId,
      name: `${preset.title.replace(/\s+/g, "_")}.xlsx`,
      sourceType: "file",
      headers,
      rows: preset.data,
      rowCount: preset.sampleRowsCount,
      columnCount: headers.length,
      fileSizeBytes: 32000,
      sampleRows: preset.data.slice(0, 5),
      createdAt: new Date().toISOString(),
    };

    setDataset(datasetObj);
    const mappingObj = generateMapping(datasetObj);
    const engineRes = generateRecommendations(datasetObj, mappingObj);

    initializeFromEngine(
      datasetId,
      preset.title,
      preset.subtitle,
      engineRes.kpiCards,
      engineRes.mainCharts,
      headers,
      mappingObj,
      preset.templateId
    );

    router.push("/dashboard");
  };

  return (
    <div className="w-full space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-sienna-brown uppercase tracking-wider block">
            Uji Coba 1-Klik Tanpa File
          </span>
          <h3 className="font-signifier text-[28px] sm:text-[36px] text-ink-black font-normal tracking-tight">
            Eksplorasi Dataset Sampel Industri
          </h3>
        </div>
        <span className="text-[12.5px] font-mono text-slate-gray">
          Instant preview &bull; &lt;1 detik
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEMO_PRESETS.map((preset) => {
          const isLaunching = launchingId === preset.id;
          return (
            <div
              key={preset.id}
              className="bg-paper-white border border-slate-gray/20 hover:border-sienna-brown/60 rounded-none p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all duration-200 group cursor-pointer"
              onClick={() => handleLaunchPreset(preset)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase bg-mist-gray px-2.5 py-0.5 rounded-none text-ink-black font-medium">
                    {preset.category}
                  </span>
                  <span className="text-[12px] font-mono font-medium text-sienna-brown">
                    {preset.highlightMetric}
                  </span>
                </div>

                <h4 className="font-signifier text-[19px] sm:text-[21px] text-ink-black group-hover:text-sienna-brown transition-colors leading-snug font-normal">
                  {preset.title}
                </h4>

                <p className="text-[13.5px] text-slate-gray leading-relaxed">
                  {preset.subtitle}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-gray/10 flex items-center justify-between">
                <span className="text-[11.5px] text-slate-gray font-mono">
                  {preset.sampleRowsCount.toLocaleString("id-ID")} baris data
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLaunching}
                  className="text-[13px] group-hover:text-sienna-brown font-medium rounded-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunchPreset(preset);
                  }}
                >
                  {isLaunching ? "Membuka..." : "Buka Demo \u2192"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
