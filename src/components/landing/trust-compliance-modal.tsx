"use client";

import React from "react";
import { X, ShieldCheck, Lock, Database, EyeOff, FileText, CheckCircle2 } from "lucide-react";

interface TrustComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: "zero_cloud" | "uu_pdp";
}

export const TrustComplianceModal: React.FC<TrustComplianceModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = "zero_cloud",
}) => {
  const [activeTopic, setActiveTopic] = React.useState<"zero_cloud" | "uu_pdp">(defaultTopic);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTopic(defaultTopic);
    }
  }, [isOpen, defaultTopic]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-xs antialiased"
    >
      <div
        className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto bg-paper-white border border-slate-gray/30 p-6 sm:p-8 shadow-subtle text-left transition-all"
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

        {/* Header */}
        <div className="space-y-1 mb-6 pb-4 border-b border-slate-gray/15">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-slate-gray tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-sienna-brown" />
            <span>Spesifikasi &amp; Audit Kepatuhan Keamanan</span>
          </div>
          <h3 className="font-signifier text-[26px] font-normal text-ink-black">
            Jaminan Privasi &amp; Legalitas Data
          </h3>
          <p className="text-[13px] text-slate-gray">
            Transparansi arsitektur keamanan teknis DataLoka untuk melindungi data bisnis Anda.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-gray/20 mb-6 font-mono text-[13px]">
          <button
            type="button"
            onClick={() => setActiveTopic("zero_cloud")}
            className={`flex-1 pb-2.5 text-center transition-all ${
              activeTopic === "zero_cloud"
                ? "border-b-2 border-sienna-brown text-sienna-brown font-semibold"
                : "text-slate-gray hover:text-ink-black"
            }`}
          >
            Zero-Cloud Storage
          </button>
          <button
            type="button"
            onClick={() => setActiveTopic("uu_pdp")}
            className={`flex-1 pb-2.5 text-center transition-all ${
              activeTopic === "uu_pdp"
                ? "border-b-2 border-sienna-brown text-sienna-brown font-semibold"
                : "text-slate-gray hover:text-ink-black"
            }`}
          >
            Kepatuhan UU PDP No. 27/2022
          </button>
        </div>

        {/* Topic 1: Zero-Cloud Storage Architecture */}
        {activeTopic === "zero_cloud" && (
          <div className="space-y-5 text-[13.5px] text-slate-gray">
            <div className="p-4 bg-fog-white border border-slate-gray/15 space-y-2">
              <div className="flex items-center gap-2 text-ink-black font-semibold font-mono text-[12.5px]">
                <EyeOff className="w-4 h-4 text-sienna-brown" />
                <span>Bagaimana Privasi Client-First Bekerja?</span>
              </div>
              <p className="leading-relaxed">
                Saat Anda mengunggah file Excel (.xlsx), CSV, atau TSV ke DataLoka, seluruh proses parsing, pembersihan baris, dan komputasi agregasi statistik dijalankan langsung di memori peramban Anda melalui <strong>Web Workers dan WebAssembly</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-signifier text-[16.5px] text-ink-black font-normal">
                Pilar Keamanan Client-Side:
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink-black font-medium">Zero-Transmission Default:</strong> Baris data mentah tidak pernah dikirim ke server aplikasi DataLoka pada mode analisis standar.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink-black font-medium">Formula Injection Shield:</strong> Seluruh formula Excel (`=cmd`, `=SUM`, dll) disanitasi otomatis sebelum ekspor untuk mencegah serangan CSV Injection.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink-black font-medium">Penyimpanan Sementara di RAM:</strong> Menutup tab atau me-refresh peramban akan langsung menghapus dataset aktif dari memori lokal (kecuali Anda memilih fitur opt-in <em>Simpan ke Cloud</em>).
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Topic 2: UU PDP Compliance */}
        {activeTopic === "uu_pdp" && (
          <div className="space-y-5 text-[13.5px] text-slate-gray">
            <div className="p-4 bg-fog-white border border-slate-gray/15 space-y-2">
              <div className="flex items-center gap-2 text-ink-black font-semibold font-mono text-[12.5px]">
                <FileText className="w-4 h-4 text-sienna-brown" />
                <span>Pernyataan Kepatuhan UU Perlindungan Data Pribadi</span>
              </div>
              <p className="leading-relaxed">
                DataLoka dirancang selaras dengan Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP) Republik Indonesia, menjamin kedaulatan penuh pemilik data atas informasi finansial dan operasional mereka.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-signifier text-[16.5px] text-ink-black font-normal">
                Prinsip Kepatuhan yang Diterapkan:
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink-black font-medium">Hak Dihapus (Right to be Forgotten):</strong> Pengguna berhak menghapus workspace, dataset, dan seluruh riwayat snapshot di cloud secara instan tanpa retensi tersembunyi.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink-black font-medium">Enkripsi Berlapis (AES-256):</strong> Data yang disimpan melalui sinkronisasi cloud akun terenkripsi dengan standar AES-256 at-rest dan TLS 1.3 in-transit.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink-black font-medium">Tanpa Pelatihan Model AI Tanpa Izin:</strong> Data bisnis Anda tidak pernah digunakan sebagai dataset pelatihan (training dataset) untuk model LLM publik atau pihak ketiga manapun.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-slate-gray/15 flex items-center justify-between text-[11px] font-mono text-slate-gray">
          <span>Standar Keamanan: ISO/IEC 27001 &amp; UU PDP</span>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-black hover:underline font-semibold"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
