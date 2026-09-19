"use client";

import React, { useState, useEffect } from "react";
import { AvatarBubble } from "@/components/ui/avatar-bubble";
import { ComposerInput } from "@/components/composite/composer-input";
import { Play, RotateCcw, Zap, Clock, CheckCircle2 } from "lucide-react";

interface HeroArtifactsProps {
  onSelectSampleQuery?: (query: string) => void;
}

export const HeroArtifacts: React.FC<HeroArtifactsProps> = ({
  onSelectSampleQuery,
}) => {
  const [activeCard, setActiveCard] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(2340);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Speed test simulation
  const runSpeedSimulation = () => {
    setIsSimulating(true);
    setElapsedMs(0);
    const start = Date.now();
    const timer = setInterval(() => {
      const current = Date.now() - start;
      if (current >= 2340) {
        setElapsedMs(2340);
        setIsSimulating(false);
        clearInterval(timer);
      } else {
        setElapsedMs(current);
      }
    }, 30);
  };

  const getPhaseName = () => {
    if (elapsedMs < 600) return "1. Parsing XLSX di RAM Browser";
    if (elapsedMs < 1400) return "2. Auto-Detect Schema & Tipe Kolom";
    return "3. Dasbor Analitik Siap Digunakan";
  };

  return (
    <div
      className="relative w-full text-left space-y-3.5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="absolute -top-6 -right-6 w-[420px] h-[420px] bg-radial from-blush-peach/45 via-fog-white/20 to-transparent blur-3xl pointer-events-none -z-10"
      />

      {/* Speed Benchmark Simulation Strip (< 30s Proof) */}
      <div className="bg-paper-white border border-slate-gray/25 p-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <div className="flex items-baseline gap-2">
            <span className="text-[11.5px] font-mono uppercase font-semibold text-ink-black tracking-wider">
              Speed Test:
            </span>
            <span className="font-mono text-[14px] font-semibold text-sienna-brown">
              {(elapsedMs / 1000).toFixed(2)}s
            </span>
            <span className="text-[11px] font-mono text-slate-gray hidden sm:inline">
              (Tolok ukur target: &lt; 30.0s)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-[11.5px] font-mono text-slate-gray truncate">
            {getPhaseName()}
          </span>

          <button
            type="button"
            onClick={runSpeedSimulation}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono border border-slate-gray/30 hover:border-sienna-brown text-ink-black bg-fog-white hover:bg-paper-white transition-all disabled:opacity-50 shrink-0"
            title="Uji simulasi kecepatan olah data"
          >
            {isSimulating ? (
              <>
                <Zap className="w-3 h-3 text-sienna-brown animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3 text-slate-gray" />
                <span>Uji Ulang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3-Card Stage Container */}
      <div className="space-y-3">
        {/* Top 2 Side-by-Side Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Card 1: Regional Sales Table */}
          <div
            onClick={() => setActiveCard(0)}
            className={`sm:col-span-7 bg-paper-white rounded-none p-4 sm:p-5 border transition-all duration-200 cursor-pointer shadow-xs ${
              activeCard === 0
                ? "border-sienna-brown/70 ring-1 ring-sienna-brown/20 bg-paper-white"
                : "border-slate-gray/20 hover:border-slate-gray/40"
            }`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-gray/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-gray tracking-wider">
                  Distribusi Wilayah
                </span>
                <h4 className="text-[14px] font-medium text-ink-black">
                  Performa Regional Q1
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded-none border border-[#a7f3d0]">
                +18.4% YoY
              </span>
            </div>

            <div className="divide-y divide-slate-gray/10 text-[12.5px] my-2">
              <div className="py-1.5 flex items-center justify-between">
                <span className="text-ink-black font-medium">Jabodetabek</span>
                <span className="font-mono text-slate-gray">Rp 184,2 jt</span>
              </div>
              <div className="py-1.5 flex items-center justify-between">
                <span className="text-ink-black font-medium">Jawa Barat</span>
                <span className="font-mono text-slate-gray">Rp 98,4 jt</span>
              </div>
              <div className="py-1.5 flex items-center justify-between">
                <span className="text-ink-black font-medium">Jawa Timur</span>
                <span className="font-mono text-slate-gray">Rp 82,1 jt</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-gray/10">
              <AvatarBubble initials="BR" variant="green" name="Bu Rina" withPointer={false} className="w-5 h-5 text-[10px]" />
              <span className="text-[11.5px] text-slate-gray truncate">
                Bu Rina memantau performa toko harian
              </span>
            </div>
          </div>

          {/* Card 2: Omset Agregat & Animated Bars */}
          <div
            onClick={() => setActiveCard(1)}
            className={`sm:col-span-5 bg-paper-white rounded-none p-4 sm:p-5 border transition-all duration-200 cursor-pointer shadow-xs flex flex-col justify-between ${
              activeCard === 1
                ? "border-sienna-brown/70 ring-1 ring-sienna-brown/20 bg-paper-white"
                : "border-slate-gray/20 hover:border-slate-gray/40"
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-gray tracking-wider">
                Omset Agregat
              </span>
              <p className="text-[22px] font-mono font-medium text-ink-black tracking-tight leading-tight mt-0.5">
                Rp 438,6 jt
              </p>
              <p className="text-[11px] text-[#059669] font-medium">
                ↑ 5.5x efisiensi laporan
              </p>
            </div>

            {/* Dynamic Mini Bar Visualization */}
            <div className="h-14 flex items-end gap-1.5 my-2">
              {[40, 60, 75, 90, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-mist-gray rounded-none h-full flex items-end">
                  <div
                    style={{ height: `${h}%` }}
                    className={`w-full rounded-none transition-all duration-500 ${
                      i === 4 ? "bg-sienna-brown" : "bg-ink-black/70"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-gray/10">
              <AvatarBubble initials="KV" variant="blue" name="Kevin" withPointer={false} className="w-5 h-5 text-[10px]" />
              <span className="text-[11.5px] text-slate-gray truncate">
                Kevin menyesuaikan tema dasbor
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Activation Spline Curve & AI Query Bar */}
        <div
          onClick={() => setActiveCard(2)}
          className={`bg-paper-white rounded-none p-4 sm:p-5 border transition-all duration-200 shadow-xs ${
            activeCard === 2
              ? "border-sienna-brown/70 ring-1 ring-sienna-brown/20"
              : "border-slate-gray/20 hover:border-slate-gray/40"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-gray tracking-wider">
                Aktivitas Transaksi
              </span>
              <h4 className="text-[14px] font-medium text-ink-black">
                Pertumbuhan Pesanan Selesai
              </h4>
            </div>
            <div className="text-right">
              <span className="text-[18px] font-mono font-medium text-ink-black">
                4.820
              </span>
              <p className="text-[11px] text-[#059669] font-medium">
                ↑ 24.6% vs rata-rata
              </p>
            </div>
          </div>

          {/* SVG Activation Spline Curve */}
          <div className="w-full h-20 relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 300 80"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="heroGradientClean" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbe1d1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,65 Q 40,55 75,45 T 150,30 T 225,18 T 300,6 L 300,80 L 0,80 Z"
                fill="url(#heroGradientClean)"
              />
              <path
                d="M 0,65 Q 40,55 75,45 T 150,30 T 225,18 T 300,6"
                fill="none"
                stroke="#5d2a1a"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* AI Query Composer */}
          <div className="pt-2">
            <ComposerInput
              placeholder="Ask anything… misal: 'kategori apa dengan omset tertinggi?'"
              onSend={(query) => onSelectSampleQuery?.(query)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
