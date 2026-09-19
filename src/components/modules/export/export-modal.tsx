"use client";

import React, { useState } from "react";
import { useInsightStore } from "@/stores/insight-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import {
  exportDashboardToJson,
  exportDataToCsv,
  triggerPrintToPdf,
} from "@/core/export/export-manager";
import { Button } from "@/components/ui/button";

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, closeExportModal, insights } = useInsightStore();
  const { dashboard } = useDashboardStore();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isExportModalOpen || !dashboard) return null;

  const handleExportJson = () => {
    exportDashboardToJson(dashboard, insights);
    setDownloadSuccess("JSON");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportCsv = () => {
    // Gather all chart data points into a flat tabular format
    const flatRows: Array<Record<string, unknown>> = [];
    dashboard.mainCharts.forEach((chart) => {
      chart.data.forEach((dp) => {
        flatRows.push({
          chart_title: chart.title,
          chart_type: chart.chartType,
          label: dp.label,
          value: dp.value,
          category: dp.category || "-",
        });
      });
    });

    exportDataToCsv(flatRows, `${dashboard.title.toLowerCase().replace(/\s+/g, "_")}.csv`);
    setDownloadSuccess("CSV");
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportPdf = () => {
    closeExportModal();
    setTimeout(() => {
      triggerPrintToPdf();
    }, 200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ekspor Laporan Dasbor"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeExportModal();
      }}
    >
      <div className="w-full max-w-[520px] bg-paper-white border border-slate-gray/20 rounded-none shadow-subtle-3 p-6 space-y-6">
        <div className="flex items-start justify-between border-b border-slate-gray/15 pb-4">
          <div>
            <span className="text-[12px] font-semibold text-sienna-brown uppercase tracking-wider font-mono">
              Ekspor Hasil Analisis
            </span>
            <h3 className="font-signifier text-[24px] text-ink-black font-normal">
              Pilih Format Unduhan
            </h3>
          </div>
          <button
            type="button"
            onClick={closeExportModal}
            className="text-slate-gray hover:text-ink-black p-1.5 rounded-none hover:bg-mist-gray transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {downloadSuccess && (
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] rounded-none p-3 text-[13px] font-medium flex items-center justify-between">
            <span>Berkas {downloadSuccess} berhasil diunduh ke perangkat Anda.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportPdf}
            className="p-4 rounded-none border border-slate-gray/20 hover:border-ink-black/40 bg-mist-gray/40 hover:bg-mist-gray text-left transition flex flex-col justify-between space-y-2 cursor-pointer"
          >
            <div>
              <span className="text-[11px] font-mono uppercase bg-paper-white px-2 py-0.5 rounded-none border border-slate-gray/20 text-ink-black">
                PDF
              </span>
              <h4 className="text-[15px] font-medium text-ink-black mt-2">
                Cetak Dokumen PDF
              </h4>
              <p className="text-[12px] text-slate-gray mt-1">
                Format editorial siap cetak atau simpan via print dialog peramban.
              </p>
            </div>
            <span className="text-[12px] font-medium text-sienna-brown mt-2">
              Cetak Sekarang &rarr;
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="p-4 rounded-none border border-slate-gray/20 hover:border-ink-black/40 bg-mist-gray/40 hover:bg-mist-gray text-left transition flex flex-col justify-between space-y-2 cursor-pointer"
          >
            <div>
              <span className="text-[11px] font-mono uppercase bg-paper-white px-2 py-0.5 rounded-none border border-slate-gray/20 text-ink-black">
                JSON
              </span>
              <h4 className="text-[15px] font-medium text-ink-black mt-2">
                Format Metadata JSON
              </h4>
              <p className="text-[12px] text-slate-gray mt-1">
                Struktur data konfigurasi, metrik KPI, dan narasi insight lengkap.
              </p>
            </div>
            <span className="text-[12px] font-medium text-sienna-brown mt-2">
              Unduh JSON &rarr;
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="p-4 rounded-none border border-slate-gray/20 hover:border-ink-black/40 bg-mist-gray/40 hover:bg-mist-gray text-left transition flex flex-col justify-between space-y-2 cursor-pointer"
          >
            <div>
              <span className="text-[11px] font-mono uppercase bg-paper-white px-2 py-0.5 rounded-none border border-slate-gray/20 text-ink-black">
                CSV
              </span>
              <h4 className="text-[15px] font-medium text-ink-black mt-2">
                Tabel Ringkasan CSV
              </h4>
              <p className="text-[12px] text-slate-gray mt-1">
                Data visualisasi teragregasi untuk dibuka kembali di spreadsheet.
              </p>
            </div>
            <span className="text-[12px] font-medium text-sienna-brown mt-2">
              Unduh CSV &rarr;
            </span>
          </button>

          <div className="p-4 rounded-none border border-slate-gray/20 bg-mist-gray/20 text-left flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[11px] font-mono uppercase bg-paper-white px-2 py-0.5 rounded-none border border-slate-gray/20 text-ink-black">
                PNG
              </span>
              <h4 className="text-[15px] font-medium text-ink-black mt-2">
                Tangkapan Gambar PNG
              </h4>
              <p className="text-[12px] text-slate-gray mt-1">
                Tersedia tombol PNG tersendiri di sudut kanan atas tiap kartu chart.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-gray/15">
          <Button variant="ghost" size="sm" className="rounded-none" onClick={closeExportModal}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
