"use client";

import React, { useState } from "react";
import { X, UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2 } from "lucide-react";
import { IngestContainer } from "@/components/modules/ingest/ingest-container";
import { useDatasetStore } from "@/stores/dataset-store";
import { useMappingStore } from "@/stores/mapping-store";
import { useChartStore } from "@/stores/chart-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { Tag } from "@/components/ui/tag";

interface DashboardUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardUploadModal: React.FC<DashboardUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { dataset, reset } = useDatasetStore();
  const { generateMapping } = useMappingStore();
  const { generateRecommendations } = useChartStore();
  const { initializeFromEngine } = useDashboardStore();

  if (!isOpen) return null;

  const handleApplyNewDataset = () => {
    if (!dataset) return;
    const mappingObj = generateMapping(dataset);
    const engineRes = generateRecommendations(dataset, mappingObj);
    const cleanName = dataset.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

    initializeFromEngine(
      dataset.id,
      `Dashboard ${cleanName}`,
      "Ikhtisar performa dan visualisasi data otomatis",
      engineRes.kpiCards,
      engineRes.mainCharts,
      dataset.headers,
      mappingObj
    );

    onClose();
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-xs antialiased overflow-y-auto"
    >
      <div
        className="relative w-full max-w-[840px] bg-paper-white border border-slate-gray/30 p-6 sm:p-8 shadow-subtle text-left transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-none bg-mist-gray hover:bg-ink-black text-ink-black hover:text-paper-white border border-slate-gray/30 hover:border-ink-black transition-all cursor-pointer shadow-2xs group"
          aria-label="Tutup dialog upload"
        >
          <X className="w-4 h-4 stroke-[2.5] transition-transform group-hover:scale-110" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-6 pb-4 border-b border-slate-gray/15">
          <div className="flex items-center gap-2">
            <Tag label="Impor Data Langsung" />
            <span className="text-[11.5px] font-mono text-slate-gray">
              100% Client-Side Memory
            </span>
          </div>
          <h3 className="font-signifier text-[26px] sm:text-[30px] font-normal text-ink-black">
            Unggah Spreadsheet ke Workspace
          </h3>
          <p className="text-[13.5px] text-slate-gray">
            Pilih file Excel (.xlsx, .xls), CSV, TSV, atau tautan Google Sheets publik untuk memuat dataset baru secara instan.
          </p>
        </div>

        {/* Embedded Ingest Workflow */}
        <div className="py-2">
          <IngestContainer onProceedToMapping={handleApplyNewDataset} />
        </div>
      </div>
    </div>
  );
};
