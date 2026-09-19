"use client";

import React, { useState } from "react";
import { Shield, Cpu, Cloud, Check, ArrowRight, Lock, Eye, Database } from "lucide-react";
import { Tag } from "@/components/ui/tag";
import { TrustComplianceModal } from "./trust-compliance-modal";

export const PrivacyHybridArchitecture: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState<"zero_cloud" | "uu_pdp">("zero_cloud");

  const openCompliance = (topic: "zero_cloud" | "uu_pdp") => {
    setModalTopic(topic);
    setModalOpen(true);
  };

  return (
    <section id="privacy-boundary" className="w-full bg-paper-white py-20 sm:py-28 border-t border-slate-gray/15 text-left">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Tag label="Transparansi Batas Privasi Data" />
          <h2 className="font-signifier text-[34px] sm:text-[44px] lg:text-[48px] text-ink-black font-normal tracking-tight leading-[1.12]">
            Bagaimana DataLoka melindungi privasi spreadsheet Anda.
          </h2>
          <p className="text-[16px] sm:text-[17px] text-slate-gray leading-relaxed max-w-2xl mx-auto">
            Kami memisahkan secara ketat komputasi analitik lokal di peramban, inferensi AI anonim, dan sinkronisasi cloud yang bersifat opt-in.
          </p>
        </div>

        {/* 3-Tier Boundary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Layer 1: Client-Side Default */}
          <div className="p-6 sm:p-7 bg-fog-white border border-slate-gray/20 flex flex-col justify-between space-y-6 shadow-xs relative">
            <div className="space-y-3">
              <div className="w-9 h-9 bg-ink-black text-paper-white flex items-center justify-center font-mono text-[13px] font-semibold">
                01
              </div>
              <span className="font-mono text-[11.5px] uppercase text-[#059669] font-semibold tracking-wider block">
                Default: 100% Client-Side
              </span>
              <h3 className="font-signifier text-[22px] font-normal text-ink-black leading-snug">
                Parsing &amp; Kalkulasi di Peramban
              </h3>
              <p className="text-[13.5px] text-slate-gray leading-relaxed">
                File Excel dan CSV diproses langsung di memori RAM browser via Web Worker. <strong>Nol byte data mentah</strong> dikirim ke server saat Anda membuka atau menganalisis dashboard.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-gray/15 space-y-2 text-[12px] font-mono text-slate-gray">
              <div className="flex items-center gap-2 text-ink-black font-medium">
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span>Zero Raw Data Upload</span>
              </div>
              <div className="flex items-center gap-2 text-ink-black font-medium">
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span>Memori RAM Terisolasi</span>
              </div>
            </div>
          </div>

          {/* Layer 2: AI / NVIDIA NIM Inference */}
          <div className="p-6 sm:p-7 bg-fog-white border border-slate-gray/20 flex flex-col justify-between space-y-6 shadow-xs relative">
            <div className="space-y-3">
              <div className="w-9 h-9 bg-sienna-brown text-paper-white flex items-center justify-center font-mono text-[13px] font-semibold">
                02
              </div>
              <span className="font-mono text-[11.5px] uppercase text-sienna-brown font-semibold tracking-wider block">
                Tanya Data AI Assistant
              </span>
              <h3 className="font-signifier text-[22px] font-normal text-ink-black leading-snug">
                Hanya Ringkasan Skema &amp; Agregat
              </h3>
              <p className="text-[13.5px] text-slate-gray leading-relaxed">
                Saat bertanya di Command Bar, sistem hanya mengirimkan nama kolom dan <strong>5 baris sampel anonim</strong> ke inference engine untuk menerjemahkan pertanyaan. Seluruh tabel tidak pernah diekspos.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-gray/15 space-y-2 text-[12px] font-mono text-slate-gray">
              <div className="flex items-center gap-2 text-ink-black font-medium">
                <Check className="w-3.5 h-3.5 text-sienna-brown" />
                <span>Schema Metadata Only</span>
              </div>
              <div className="flex items-center gap-2 text-ink-black font-medium">
                <Check className="w-3.5 h-3.5 text-sienna-brown" />
                <span>Tanpa Pelatihan Model AI</span>
              </div>
            </div>
          </div>

          {/* Layer 3: Cloud Workspace Opt-in */}
          <div className="p-6 sm:p-7 bg-fog-white border border-slate-gray/20 flex flex-col justify-between space-y-6 shadow-xs relative">
            <div className="space-y-3">
              <div className="w-9 h-9 bg-ink-black text-paper-white flex items-center justify-center font-mono text-[13px] font-semibold">
                03
              </div>
              <span className="font-mono text-[11.5px] uppercase text-slate-gray font-semibold tracking-wider block">
                Opt-in Cloud Storage
              </span>
              <h3 className="font-signifier text-[22px] font-normal text-ink-black leading-snug">
                Tersimpan Hanya Atas Izin Anda
              </h3>
              <p className="text-[13.5px] text-slate-gray leading-relaxed">
                Dashboard hanya tersimpan ke Firestore ketika Anda secara eksplisit menekan tombol <strong>&quot;Simpan ke Cloud&quot;</strong>. Terenkripsi dengan AES-256 dan tunduk pada hak hapus UU PDP.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-gray/15 space-y-2 text-[12px] font-mono text-slate-gray">
              <div className="flex items-center gap-2 text-ink-black font-medium">
                <Check className="w-3.5 h-3.5 text-ink-black" />
                <span>Enkripsi AES-256 At-Rest</span>
              </div>
              <div className="flex items-center gap-2 text-ink-black font-medium">
                <Check className="w-3.5 h-3.5 text-ink-black" />
                <span>Hak Hapus Kapan Saja (UU PDP)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Trust Badges Action Strip */}
        <div className="p-5 sm:p-6 bg-fog-white border border-slate-gray/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-gray">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openCompliance("zero_cloud")}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-paper-white border border-slate-gray/25 hover:border-sienna-brown text-ink-black font-medium text-[12px] font-mono shadow-2xs hover:-translate-y-0.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              <span>Zero-Cloud Storage Verified &rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => openCompliance("uu_pdp")}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-paper-white border border-slate-gray/25 hover:border-sienna-brown text-ink-black font-medium text-[12px] font-mono shadow-2xs hover:-translate-y-0.5 transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-sienna-brown" />
              <span>Kepatuhan UU PDP Terjamin &rarr;</span>
            </button>
          </div>

          <span className="text-[12px] font-mono text-slate-gray text-center sm:text-right">
            Klik lencana di atas untuk melihat spesifikasi audit kepatuhan &amp; kriptografi.
          </span>
        </div>
      </div>

      <TrustComplianceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTopic={modalTopic}
      />
    </section>
  );
};
