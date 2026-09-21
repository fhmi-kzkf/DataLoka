"use client";

import React, { useState } from "react";
import { useInsightStore } from "@/stores/insight-store";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, closeShareModal, shareUrl } = useInsightStore();
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bagikan Dasbor"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeShareModal();
      }}
    >
      <div className="w-full max-w-[540px] bg-paper-white border border-slate-gray/20 rounded-none shadow-subtle-3 p-6 space-y-6">
        <div className="flex items-start justify-between border-b border-slate-gray/15 pb-4">
          <div>
            <span className="text-[12px] font-semibold text-sienna-brown uppercase tracking-wider font-mono">
              Kolaborasi &amp; Berbagi
            </span>
            <h3 className="font-signifier text-[24px] text-ink-black font-normal">
              Bagikan Snapshot Dasbor
            </h3>
          </div>
          <button
            type="button"
            onClick={closeShareModal}
            className="flex items-center justify-center w-8 h-8 rounded-none bg-mist-gray hover:bg-ink-black text-ink-black hover:text-paper-white border border-slate-gray/30 hover:border-ink-black transition-all cursor-pointer shadow-2xs group"
            aria-label="Tutup dialog bagikan"
          >
            <X className="w-4 h-4 stroke-[2.5] transition-transform group-hover:scale-110" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-[13px] font-medium text-slate-gray block">
            Tautan Akses Publik (Read-Only)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-mist-gray border border-slate-gray/20 rounded-none px-3.5 py-2.5 text-[13px] text-ink-black select-all font-mono outline-none"
            />
            <Button
              variant={copied ? "filled" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={handleCopyLink}
            >
              {copied ? "Tersalin!" : "Salin"}
            </Button>
          </div>
        </div>

        {/* Security & Privacy Editorial Badge */}
        <div className="bg-blush-peach/40 border border-sienna-brown/20 rounded-none p-4 text-[13px] text-sienna-brown space-y-1">
          <div className="font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-none bg-sienna-brown" />
            Privasi Terjamin &bull; Client-First Architecture
          </div>
          <p className="text-[12px] leading-relaxed opacity-90">
            Tautan ini mengemas snapshot visual dasbor secara terenkripsi langsung di URL. Data mentah spreadsheet Anda tidak pernah disimpan di server cloud pihak ketiga.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-gray/15">
          <Button variant="ghost" size="sm" className="rounded-none" onClick={closeShareModal}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
