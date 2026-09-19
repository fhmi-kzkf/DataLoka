"use client";

import React from "react";

export const QuickStatsStrip: React.FC = () => {
  return (
    <section className="w-full max-w-[1240px] mx-auto px-6 lg:px-8 my-10 sm:my-16">
      <div className="bg-fog-white border border-slate-gray/20 rounded-none p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-gray/15">
          <div className="space-y-1 sm:pl-2">
            <p className="font-signifier text-[30px] sm:text-[36px] text-ink-black font-normal tracking-tight">
              &lt; 30s
            </p>
            <p className="text-[12.5px] text-slate-gray leading-snug">
              Dari file mentah ke dasbor interaktif
            </p>
          </div>

          <div className="space-y-1 pt-4 sm:pt-0 sm:pl-8">
            <p className="font-signifier text-[30px] sm:text-[36px] text-ink-black font-normal tracking-tight">
              100%
            </p>
            <p className="text-[12.5px] text-slate-gray leading-snug">
              Privasi lokal tanpa upload ke server
            </p>
          </div>

          <div className="space-y-1 pt-4 sm:pt-0 sm:pl-8">
            <p className="font-signifier text-[30px] sm:text-[36px] text-ink-black font-normal tracking-tight">
              8 Template
            </p>
            <p className="text-[12.5px] text-slate-gray leading-snug">
              Domain bisnis terkurasi siap pakai
            </p>
          </div>

          <div className="space-y-1 pt-4 sm:pt-0 sm:pl-8">
            <p className="font-signifier text-[30px] sm:text-[36px] text-ink-black font-normal tracking-tight">
              1-Klik
            </p>
            <p className="text-[12.5px] text-slate-gray leading-snug">
              Deteksi otomatis format rupiah &amp; tanggal
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
