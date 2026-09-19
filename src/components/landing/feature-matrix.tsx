"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { TextLink } from "@/components/ui/link";
import { Tag } from "@/components/ui/tag";

export const FeatureMatrix: React.FC = () => {
  return (
    <section id="features" className="w-full bg-[var(--color-fog-white)] py-20 sm:py-28 border-t border-slate-gray/15 text-left">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 space-y-12">
        {/* Section Header with Clean Spacing & Zero Text Overlap */}
        <div className="space-y-3">
          <div className="inline-block mb-1">
            <Tag label="Prinsip Fondasi" />
          </div>
          <h2 className="font-signifier text-[32px] sm:text-[40px] lg:text-[44px] text-ink-black font-normal tracking-tight leading-[1.15]">
            Kecepatan, Privasi, dan Kejelasan
          </h2>
          <p className="text-[15.5px] sm:text-[16.5px] text-slate-gray max-w-xl leading-relaxed">
            Platform analitik tanpa setup server yang rumit dan tanpa risiko kebocoran data bisnis Anda ke pihak ketiga.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card
            surface="mist"
            padding="md"
            className="flex flex-col justify-between space-y-6 hover:-translate-y-0.5 transition-all duration-200 rounded-none border border-slate-gray/20 shadow-xs p-6 sm:p-7"
          >
            <div className="space-y-3">
              <span className="font-mono text-[12px] text-sienna-brown font-semibold block uppercase tracking-wider">
                01 / PRIVASI
              </span>
              <h3 className="font-signifier text-[20px] sm:text-[22px] text-ink-black font-normal leading-snug">
                Client-Side Processing &amp; Zero-Cloud Privacy
              </h3>
              <p className="text-[13.5px] text-slate-gray leading-relaxed">
                Spreadsheet Anda diproses langsung di peramban pengguna. Data sensitif tidak pernah diunggah ke cloud eksternal secara default.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-gray/10">
              <TextLink href="#privacy-boundary" withArrow>
                Pelajari batas privasi hybrid
              </TextLink>
            </div>
          </Card>

          {/* Feature 2 */}
          <Card
            surface="mist"
            padding="md"
            className="flex flex-col justify-between space-y-6 hover:-translate-y-0.5 transition-all duration-200 rounded-none border border-slate-gray/20 shadow-xs p-6 sm:p-7"
          >
            <div className="space-y-3">
              <span className="font-mono text-[12px] text-sienna-brown font-semibold block uppercase tracking-wider">
                02 / ENGINE
              </span>
              <h3 className="font-signifier text-[20px] sm:text-[22px] text-ink-black font-normal leading-snug">
                Auto-Chart Decision Engine Teruji
              </h3>
              <p className="text-[13.5px] text-slate-gray leading-relaxed">
                Algoritma heuristik otomatis memilih jenis grafik yang paling representatif untuk kombinasi kolom dan kardinalitas data Anda.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-gray/10">
              <TextLink href="#demo" withArrow>
                Lihat simulasi engine 3 detik
              </TextLink>
            </div>
          </Card>

          {/* Feature 3 */}
          <Card
            surface="mist"
            padding="md"
            className="flex flex-col justify-between space-y-6 hover:-translate-y-0.5 transition-all duration-200 rounded-none border border-slate-gray/20 shadow-xs p-6 sm:p-7"
          >
            <div className="space-y-3">
              <span className="font-mono text-[12px] text-sienna-brown font-semibold block uppercase tracking-wider">
                03 / KONTEKS
              </span>
              <h3 className="font-signifier text-[20px] sm:text-[22px] text-ink-black font-normal leading-snug">
                Kamus Lokal Pasar Indonesia
              </h3>
              <p className="text-[13.5px] text-slate-gray leading-relaxed">
                Mengenali otomatis header laporan Shopee, Tokopedia, TikTok Shop, serta format rupiah dan format tanggal lokal Indonesia.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-gray/10">
              <TextLink href="#templates" withArrow>
                Eksplorasi 8 domain template
              </TextLink>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
