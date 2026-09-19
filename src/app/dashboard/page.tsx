"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UploadCloud, Sparkles } from "lucide-react";
import { useDatasetStore } from "@/stores/dataset-store";
import { useMappingStore } from "@/stores/mapping-store";
import { useChartStore } from "@/stores/chart-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useInsightStore } from "@/stores/insight-store";
import { useCommandStore } from "@/stores/command-store";
import { DashboardComposer } from "@/components/modules/dashboard/dashboard-composer";
import { DashboardUploadModal } from "@/components/modules/dashboard/dashboard-upload-modal";
import { CommandBarModal } from "@/components/modules/command/command-bar-modal";
import { ExportModal } from "@/components/modules/export/export-modal";
import { ShareModal } from "@/components/modules/share/share-modal";
import { AuthModal } from "@/components/auth/auth-modal";
import { SavedWorkspacesModal } from "@/components/auth/saved-workspaces-modal";
import { CheckoutModal } from "@/components/pricing/checkout-modal";
import { UserProfileMenu } from "@/components/auth/user-profile-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useCommandBarShortcut } from "@/hooks/use-command-bar";
import { Button } from "@/components/ui/button";
import type { DatasetSchema } from "@/types/dataset";

const DEFAULT_WORKSPACE_DATA = [
  { tanggal: "2026-01-01", kategori: "Fashion Wanita", produk: "Kemeja Linen Sage", total_penjualan: 4500000, jumlah_pesanan: 30, wilayah: "Jakarta" },
  { tanggal: "2026-01-02", kategori: "Fashion Pria", produk: "Celana Chino Slim", total_penjualan: 3200000, jumlah_pesanan: 20, wilayah: "Bandung" },
  { tanggal: "2026-01-03", kategori: "Elektronik", produk: "TWS Earbuds ANC", total_penjualan: 8900000, jumlah_pesanan: 45, wilayah: "Surabaya" },
  { tanggal: "2026-01-04", kategori: "Kecantikan", produk: "Serum Niacinamide", total_penjualan: 6100000, jumlah_pesanan: 52, wilayah: "Jakarta" },
  { tanggal: "2026-01-05", kategori: "Fashion Wanita", produk: "Dress Katun Floral", total_penjualan: 5400000, jumlah_pesanan: 34, wilayah: "Semarang" },
  { tanggal: "2026-01-06", kategori: "Makanan & Minuman", produk: "Kopi Arabika Gayo", total_penjualan: 2800000, jumlah_pesanan: 38, wilayah: "Yogyakarta" },
  { tanggal: "2026-01-07", kategori: "Elektronik", produk: "Smartwatch AMOLED", total_penjualan: 9400000, jumlah_pesanan: 42, wilayah: "Jakarta" },
];

export default function DashboardPage() {
  const { dataset, setDataset } = useDatasetStore();
  const { mapping, generateMapping } = useMappingStore();
  const { engineResult, generateRecommendations } = useChartStore();
  const { dashboard, initializeFromEngine } = useDashboardStore();
  const { openExportModal, openShareModal } = useInsightStore();
  const { initializeAuth } = useAuthStore();
  const { openCommandBar } = useCommandStore();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useCommandBarShortcut();

  useEffect(() => {
    const unsub = initializeAuth();
    return () => unsub();
  }, [initializeAuth]);

  // Ensure workspace is never empty when opened: auto-initialize default executive dashboard if none exists
  useEffect(() => {
    if (!dashboard && !dataset) {
      const datasetId = "workspace_primary_dataset";
      const headers = Object.keys(DEFAULT_WORKSPACE_DATA[0]);
      const defaultDataset: DatasetSchema = {
        id: datasetId,
        name: "Laporan Penjualan Omnichannel.xlsx",
        sourceType: "file",
        headers,
        rows: DEFAULT_WORKSPACE_DATA,
        rowCount: DEFAULT_WORKSPACE_DATA.length,
        columnCount: headers.length,
        fileSizeBytes: 24500,
        sampleRows: DEFAULT_WORKSPACE_DATA.slice(0, 5),
        createdAt: new Date().toISOString(),
      };

      setDataset(defaultDataset);
      const mappingObj = generateMapping(defaultDataset);
      const engineRes = generateRecommendations(defaultDataset, mappingObj);

      initializeFromEngine(
        datasetId,
        "Dashboard Performa Penjualan Omnichannel",
        "Ikhtisar terpadu tren transaksi, sebaran omset kategori, dan produktivitas regional",
        engineRes.kpiCards,
        engineRes.mainCharts,
        defaultDataset.headers,
        mappingObj,
        "ecommerce"
      );
    }
  }, [dashboard, dataset, setDataset, generateMapping, generateRecommendations, initializeFromEngine]);

  const handleOpenShare = () => {
    if (dashboard) {
      openShareModal(dashboard, dataset?.name);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper-white)] text-ink-black antialiased">
      {/* Top Header Nav */}
      <header className="no-print w-full bg-[var(--color-paper-white)] border-b border-slate-gray/15 py-5 sm:py-6">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between">
          <div className="flex items-center gap-3.5 shrink-0">
            <Link href="/" className="font-signifier text-[22px] sm:text-[26px] tracking-tight text-ink-black hover:opacity-80">
              DataLoka
            </Link>
            <span className="text-[14px] text-slate-gray/60">/</span>
            <span className="text-[12px] sm:text-[13px] font-mono text-slate-gray uppercase tracking-widest bg-mist-gray px-2 py-0.5 border border-slate-gray/15">
              Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-[12.5px] sm:text-[13px] px-3.5 py-1.5 rounded-none">
                &larr; Beranda
              </Button>
            </Link>

            <Button
              variant="filled"
              size="sm"
              onClick={() => setUploadModalOpen(true)}
              className="text-[12.5px] sm:text-[13px] px-4 py-1.5 rounded-none shadow-xs gap-1.5 bg-sienna-brown hover:bg-sienna-brown/90 text-paper-white"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Unggah Spreadsheet</span>
            </Button>

            <div className="pl-1 border-l border-slate-gray/20">
              <UserProfileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area: Direct Dashboard View */}
      <main className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 py-8 sm:py-12">
        <DashboardComposer
          rowCount={dataset?.rowCount}
          onExport={openExportModal}
          onShare={handleOpenShare}
        />
      </main>

      {/* In-Dashboard Upload Modal */}
      <DashboardUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

      {/* Floating Quick Launcher: Tanya Data AI */}
      <aside aria-label="Akses Cepat Asisten AI" className="fixed bottom-6 right-6 z-40 no-print animate-fadeIn">
        <button
          type="button"
          onClick={openCommandBar}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-ink-black hover:bg-sienna-brown text-paper-white shadow-2xl border border-slate-gray/30 transition-all duration-200 cursor-pointer group"
          title="Buka Tanya Data AI Assistant (⌘K)"
        >
          <Sparkles className="w-4 h-4 text-sienna-brown group-hover:text-paper-white transition-colors" />
          <span className="font-signifier text-[14.5px] tracking-wide">Tanya Data AI</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-paper-white/20 border border-paper-white/20 text-paper-white">
            ⌘K
          </kbd>
        </button>
      </aside>

      {/* Global Workspace Modals */}
      <CommandBarModal />
      <ExportModal />
      <ShareModal />
      <AuthModal />
      <SavedWorkspacesModal />
      <CheckoutModal />
    </div>
  );
}
