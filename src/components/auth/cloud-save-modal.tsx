"use client";

import React, { useState } from "react";
import { X, Cloud, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useDatasetStore } from "@/stores/dataset-store";
import { CloudWorkspaceService } from "@/core/storage/cloud-workspace-service";
import { Button } from "@/components/ui/button";

interface CloudSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSaveModal: React.FC<CloudSaveModalProps> = ({ isOpen, onClose }) => {
  const { user, openAuthModal } = useAuthStore();
  const { title, subtitle, templateId, kpiCards, mainCharts, accentCard } = useDashboardStore();
  const { dataset } = useDatasetStore();

  const [customTitle, setCustomTitle] = useState(title);
  const [customSubtitle, setCustomSubtitle] = useState(subtitle);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const userId = user?.uid || "guest";
    const dashboardState = {
      title: customTitle || title,
      subtitle: customSubtitle || subtitle,
      templateId,
      kpiCards,
      mainCharts,
      accentCard,
    };

    try {
      await CloudWorkspaceService.saveDashboard(
        userId,
        dashboardState,
        dataset?.name || "Dataset",
        dataset?.rowCount || 0,
        dataset?.headers.length || 0
      );
      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1200);
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-xs antialiased"
    >
      <div
        className="relative w-full max-w-[480px] bg-paper-white border border-slate-gray/30 p-6 sm:p-8 shadow-subtle text-left transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-gray hover:text-ink-black hover:bg-fog-white border border-transparent hover:border-slate-gray/20 transition-all"
          aria-label="Tutup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6 pb-4 border-b border-slate-gray/15">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-slate-gray tracking-wider">
            <Cloud className="w-3.5 h-3.5 text-sienna-brown" />
            <span>Sinkronisasi Cloud</span>
          </div>
          <h3 className="font-signifier text-[26px] font-normal text-ink-black">
            Simpan ke Cloud Workspace
          </h3>
          <p className="text-[13px] text-slate-gray">
            Simpan konfigurasi dasbor, kalkulasi metrik, dan kustomisasi Anda ke cloud untuk diakses kembali kapan saja.
          </p>
        </div>

        {!user && (
          <div className="mb-5 p-3 bg-blush-peach/20 border border-sienna-brown/20 text-[12.5px] text-sienna-brown flex items-start justify-between gap-3">
            <span>
              Anda belum masuk. Dashboard akan tersimpan di cache lokal peramban. Masuk untuk menyimpan permanen di akun Cloud.
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal("login");
              }}
              className="underline font-semibold shrink-0"
            >
              Masuk
            </button>
          </div>
        )}

        {saveSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#059669] mx-auto animate-bounce" />
            <h4 className="font-signifier text-[20px] text-ink-black font-normal">
              Dashboard Berhasil Disimpan!
            </h4>
            <p className="text-[12.5px] text-slate-gray font-mono">
              Tersinkronisasi ke ruang kerja cloud Anda.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[11.5px] font-mono uppercase text-slate-gray mb-1">
                Judul Dashboard
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Nama dashboard"
                className="w-full bg-fog-white border border-slate-gray/25 px-3 py-2 text-[13.5px] text-ink-black focus:outline-none focus:border-ink-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11.5px] font-mono uppercase text-slate-gray mb-1">
                Deskripsi / Subtitle
              </label>
              <input
                type="text"
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                placeholder="Deskripsi singkat"
                className="w-full bg-fog-white border border-slate-gray/25 px-3 py-2 text-[13.5px] text-ink-black focus:outline-none focus:border-ink-black transition-colors"
              />
            </div>

            <div className="p-3 bg-fog-white border border-slate-gray/15 text-[12px] font-mono space-y-1">
              <div className="flex justify-between text-slate-gray">
                <span>Domain Template:</span>
                <span className="font-semibold text-ink-black uppercase">{templateId}</span>
              </div>
              <div className="flex justify-between text-slate-gray">
                <span>Dataset Terkait:</span>
                <span className="text-ink-black">{dataset?.name || "Dataset"}</span>
              </div>
              <div className="flex justify-between text-slate-gray">
                <span>Grafik &amp; KPI:</span>
                <span className="text-ink-black">{kpiCards.length} KPI &bull; {mainCharts.length} Charts</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="md"
                type="button"
                onClick={onClose}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                variant="filled"
                size="md"
                type="submit"
                disabled={isSaving}
                className="gap-2 bg-sienna-brown hover:bg-sienna-brown/90 text-paper-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan ke Cloud</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
