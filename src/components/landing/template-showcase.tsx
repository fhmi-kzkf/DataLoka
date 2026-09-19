"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ALL_TEMPLATES } from "@/core/template/template-registry";
import { Button } from "@/components/ui/button";
import type { TemplateId } from "@/types/template";

// Distinct visual preview mockup component per template
const TemplateDynamicVisual: React.FC<{ templateId: TemplateId }> = ({ templateId }) => {
  switch (templateId) {
    case "ecommerce":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray">
            <span>PREVIEW: E-COMMERCE</span>
            <span className="text-sienna-brown font-semibold">Rp 148,2 jt GMV</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Pesanan</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">1.540</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Avg Basket</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">Rp 96k</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Konversi</span>
              <span className="text-[13px] font-mono font-medium text-[#059669]">3.8%</span>
            </div>
          </div>
          <div className="bg-paper-white rounded-none border border-slate-gray/15 p-3 shadow-2xs">
            <span className="text-[10.5px] font-mono text-slate-gray block mb-1.5">Penjualan per Kategori (Top 5)</span>
            <div className="h-20 flex items-end gap-2 pt-1">
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full h-[85%] bg-sienna-brown rounded-none" />
                <span className="text-[9px] font-mono text-slate-gray">Fashion</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full h-[65%] bg-ink-black/80 rounded-none" />
                <span className="text-[9px] font-mono text-slate-gray">Gadget</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full h-[50%] bg-ink-black/80 rounded-none" />
                <span className="text-[9px] font-mono text-slate-gray">Beauty</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full h-[35%] bg-slate-gray/40 rounded-none" />
                <span className="text-[9px] font-mono text-slate-gray">F&amp;B</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "sales":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray">
            <span>PREVIEW: B2B SALES PIPELINE</span>
            <span className="text-sienna-brown font-semibold">Rp 850 jt Pipeline</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Active Deals</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">28 Deals</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Win Rate</span>
              <span className="text-[13px] font-mono font-medium text-[#059669]">42.5%</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Avg Cycle</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">18 Hari</span>
            </div>
          </div>
          {/* Horizontal Funnel */}
          <div className="bg-paper-white rounded-none border border-slate-gray/15 p-3 shadow-2xs space-y-2">
            <span className="text-[10.5px] font-mono text-slate-gray block">Tahapan Negosiasi Pipeline</span>
            <div className="space-y-1.5">
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>Closed Won</span>
                  <span className="font-semibold text-[#059669]">Rp 380 jt (12 deal)</span>
                </div>
                <div className="w-full h-3 bg-mist-gray rounded-none overflow-hidden">
                  <div className="h-full bg-[#059669] w-[85%]" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>Negotiation</span>
                  <span>Rp 290 jt (9 deal)</span>
                </div>
                <div className="w-full h-3 bg-mist-gray rounded-none overflow-hidden">
                  <div className="h-full bg-sienna-brown w-[65%]" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>Proposal Sent</span>
                  <span>Rp 180 jt (7 deal)</span>
                </div>
                <div className="w-full h-3 bg-mist-gray rounded-none overflow-hidden">
                  <div className="h-full bg-slate-gray/50 w-[45%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "finance":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray">
            <span>PREVIEW: FINANCIAL &amp; P&amp;L</span>
            <span className="text-sienna-brown font-semibold">32.4% Net Margin</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Total Revenue</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">Rp 524 jt</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Total COGS</span>
              <span className="text-[13px] font-mono font-medium text-slate-gray">Rp 248 jt</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Net Profit</span>
              <span className="text-[13px] font-mono font-medium text-[#059669]">Rp 170 jt</span>
            </div>
          </div>
          <div className="bg-paper-white rounded-none border border-slate-gray/15 p-3 shadow-2xs">
            <span className="text-[10.5px] font-mono text-slate-gray block mb-1">Struktur Margin Bulanan</span>
            <div className="h-20 flex items-end gap-2 pt-1">
              {[
                { m: "Jan", rev: 60, profit: 30 },
                { m: "Feb", rev: 75, profit: 38 },
                { m: "Mar", rev: 90, profit: 48 },
                { m: "Apr", rev: 100, profit: 55 },
              ].map((item) => (
                <div key={item.m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex flex-col items-center gap-0.5 h-full justify-end">
                    <div style={{ height: `${item.profit}%` }} className="w-full bg-[#059669] rounded-none" />
                    <div style={{ height: `${item.rev - item.profit}%` }} className="w-full bg-slate-gray/30 rounded-none" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-gray">{item.m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "marketing":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray">
            <span>PREVIEW: GROWTH &amp; CAMPAIGN</span>
            <span className="text-[#059669] font-semibold">4.6x ROAS</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Ad Spend</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">Rp 42 jt</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">CAC</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">Rp 18.500</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">New Leads</span>
              <span className="text-[13px] font-mono font-medium text-[#059669]">2.270</span>
            </div>
          </div>
          <div className="bg-paper-white rounded-none border border-slate-gray/15 p-3 shadow-2xs">
            <span className="text-[10.5px] font-mono text-slate-gray block mb-1">Tren ROAS per Channel Iklan</span>
            <div className="h-20 flex items-center justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[10px] font-mono"><span>Meta Ads</span><span className="text-sienna-brown">5.2x</span></div>
                <div className="w-full h-2 bg-mist-gray rounded-none"><div className="h-full bg-sienna-brown w-[85%]" /></div>
                <div className="flex justify-between text-[10px] font-mono"><span>TikTok Shop</span><span className="text-ink-black">4.8x</span></div>
                <div className="w-full h-2 bg-mist-gray rounded-none"><div className="h-full bg-ink-black w-[75%]" /></div>
                <div className="flex justify-between text-[10px] font-mono"><span>Google Search</span><span className="text-slate-gray">3.4x</span></div>
                <div className="w-full h-2 bg-mist-gray rounded-none"><div className="h-full bg-slate-gray/60 w-[55%]" /></div>
              </div>
            </div>
          </div>
        </div>
      );

    case "operational":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray">
            <span>PREVIEW: SUPPLY CHAIN</span>
            <span className="text-[#059669] font-semibold">98.4% SLA On-Time</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Fulfillment</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">8.420 SKU</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Lead Time</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">1.2 Hari</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Stockout</span>
              <span className="text-[13px] font-mono font-medium text-[#059669]">0.6%</span>
            </div>
          </div>
          <div className="bg-paper-white rounded-none border border-slate-gray/15 p-3 shadow-2xs">
            <span className="text-[10.5px] font-mono text-slate-gray block mb-1">Performa Kecepatan Kirim Ekspedisi</span>
            <div className="h-20 flex items-end gap-2 pt-1">
              {["J&T", "SiCepat", "JNE", "AnterAja"].map((exp, i) => (
                <div key={exp} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div style={{ height: `${80 + i * 5}%` }} className="w-full bg-sienna-brown/80 rounded-none" />
                  <span className="text-[9px] font-mono text-slate-gray">{exp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "hr":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray">
            <span>PREVIEW: PEOPLE &amp; ORG</span>
            <span className="text-sienna-brown font-semibold">94.2% Retensi</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Total Tim</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">148 Orang</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Turnover</span>
              <span className="text-[13px] font-mono font-medium text-[#059669]">5.8%</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">ENPS</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">+58</span>
            </div>
          </div>
          <div className="bg-paper-white rounded-none border border-slate-gray/15 p-3 shadow-2xs">
            <span className="text-[10.5px] font-mono text-slate-gray block mb-1">Sebaran Departemen</span>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-mono"><span>Engineering &amp; Product</span><span>42%</span></div>
              <div className="w-full h-2 bg-mist-gray rounded-none"><div className="h-full bg-ink-black w-[42%]" /></div>
              <div className="flex justify-between text-[10px] font-mono"><span>Sales &amp; Marketing</span><span>35%</span></div>
              <div className="w-full h-2 bg-mist-gray rounded-none"><div className="h-full bg-sienna-brown w-[35%]" /></div>
            </div>
          </div>
        </div>
      );

    case "survey":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray">
            <span>PREVIEW: VOICE OF CUSTOMER</span>
            <span className="text-[#059669] font-semibold">4.82 / 5.00 CSAT</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Responden</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">3.450</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">NPS Score</span>
              <span className="text-[13px] font-mono font-medium text-[#059669]">+68</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Sentimen</span>
              <span className="text-[13px] font-mono font-medium text-[#059669]">89% Positif</span>
            </div>
          </div>
          <div className="bg-paper-white rounded-none border border-slate-gray/15 p-3 shadow-2xs">
            <span className="text-[10.5px] font-mono text-slate-gray block mb-1">Distribusi Kepuasan Rating</span>
            <div className="space-y-1 pt-0.5">
              {[
                { star: "5 Bintang", pct: 72, color: "bg-[#059669]" },
                { star: "4 Bintang", pct: 18, color: "bg-sienna-brown" },
                { star: "3 Bintang", pct: 7, color: "bg-slate-gray/50" },
                { star: "1-2 Bintang", pct: 3, color: "bg-rose-400" },
              ].map((r) => (
                <div key={r.star} className="space-y-0.5">
                  <div className="flex justify-between text-[9.5px] font-mono"><span>{r.star}</span><span>{r.pct}%</span></div>
                  <div className="w-full h-1.5 bg-mist-gray rounded-none"><div className={`h-full ${r.color}`} style={{ width: `${r.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "general":
    default:
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray">
            <span>PREVIEW: EDITORIAL ANALYTICS</span>
            <span className="text-sienna-brown font-semibold">Universal Synthesis</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Dataset Rows</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">10.000+</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Confidence</span>
              <span className="text-[13px] font-mono font-medium text-[#059669]">96%</span>
            </div>
            <div className="bg-paper-white rounded-none border border-slate-gray/15 p-2 shadow-2xs">
              <span className="text-[10px] text-slate-gray block">Charts Ready</span>
              <span className="text-[13px] font-mono font-medium text-ink-black">6 Visual</span>
            </div>
          </div>
          <div className="bg-blush-peach/80 rounded-none border border-sienna-brown/20 p-3 shadow-2xs space-y-1.5">
            <span className="text-[10.5px] font-mono text-sienna-brown font-semibold uppercase">Executive Narrative</span>
            <p className="font-serif italic text-[12px] text-sienna-brown leading-snug">
              &ldquo;Visualisasi otomatis memilih rasio bar chart, area trend, dan ranking metrik sesuai karakter kolom data Anda.&rdquo;
            </p>
          </div>
        </div>
      );
  }
};

export const TemplateShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TemplateId>("ecommerce");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-cycle through templates every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = ALL_TEMPLATES.findIndex((t) => t.id === current);
        const nextIndex = (currentIndex + 1) % ALL_TEMPLATES.length;
        return ALL_TEMPLATES[nextIndex].id;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentIndex = ALL_TEMPLATES.findIndex((t) => t.id === activeTab);
  const selectedTemplate = ALL_TEMPLATES[currentIndex] || ALL_TEMPLATES[0];

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + ALL_TEMPLATES.length) % ALL_TEMPLATES.length;
    setActiveTab(ALL_TEMPLATES[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % ALL_TEMPLATES.length;
    setActiveTab(ALL_TEMPLATES[nextIndex].id);
  };

  return (
    <section
      id="templates"
      className="w-full space-y-8 text-left"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header & Carousel Arrow Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-sienna-brown uppercase tracking-wider block">
            Standar Editorial Siap Pakai
          </span>
          <h2 className="font-signifier text-[28px] sm:text-[36px] text-ink-black font-normal tracking-tight">
            8 Template Domain Terkurasi
          </h2>
          <p className="text-[14px] text-slate-gray max-w-xl">
            Pilih domain bisnis di bawah untuk melihat otomatisasi grafik dan hierarki metrik yang disesuaikan.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Template sebelumnya"
            className="w-8 h-8 rounded-none border border-slate-gray/20 bg-paper-white flex items-center justify-center text-ink-black hover:bg-mist-gray hover:border-ink-black transition-colors cursor-pointer shadow-2xs text-[13px]"
          >
            &larr;
          </button>
          <span className="text-[11.5px] font-mono text-slate-gray px-1">
            {currentIndex + 1} / {ALL_TEMPLATES.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Template berikutnya"
            className="w-8 h-8 rounded-none border border-slate-gray/20 bg-paper-white flex items-center justify-center text-ink-black hover:bg-mist-gray hover:border-ink-black transition-colors cursor-pointer shadow-2xs text-[13px]"
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* Template Tab Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {ALL_TEMPLATES.map((tmpl) => {
          const isActive = tmpl.id === activeTab;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => setActiveTab(tmpl.id)}
              className={`px-3 py-1.5 rounded-none text-[12px] font-medium transition-all duration-200 cursor-pointer border ${
                isActive
                  ? "bg-ink-black text-paper-white border-ink-black shadow-xs -translate-y-0.5"
                  : "bg-paper-white text-slate-gray border-slate-gray/20 hover:text-ink-black hover:bg-mist-gray"
              }`}
            >
              {tmpl.name}
            </button>
          );
        })}
      </div>

      {/* Active Template Showcase Card with Distinct Dynamic Visualizations */}
      <div className="bg-paper-white border border-slate-gray/20 rounded-none p-5 sm:p-7 lg:p-9 shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center transition-all duration-300">
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="text-[10.5px] font-mono uppercase px-2.5 py-0.5 rounded-none font-medium text-paper-white"
              style={{ backgroundColor: selectedTemplate.accentColor || "#111827" }}
            >
              {selectedTemplate.category}
            </span>
            {selectedTemplate.badge && (
              <span className="text-[10.5px] font-mono uppercase bg-mist-gray text-ink-black px-2.5 py-0.5 rounded-none font-medium border border-slate-gray/20">
                {selectedTemplate.badge}
              </span>
            )}
            {selectedTemplate.personaTag && (
              <span className="text-[11px] font-mono text-slate-gray">
                Persona: {selectedTemplate.personaTag}
              </span>
            )}
          </div>

          <h3 className="font-signifier text-[24px] sm:text-[30px] text-ink-black font-normal leading-tight">
            {selectedTemplate.name}
          </h3>

          <p className="text-[14px] text-slate-gray leading-relaxed max-w-lg">
            {selectedTemplate.description}
          </p>

          <div className="pt-2 border-t border-slate-gray/10 space-y-1.5">
            <span className="text-[10.5px] font-mono uppercase text-slate-gray tracking-wider block">
              Visualisasi Heuristik Terpasang:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedTemplate.suggestedChartTypes.map((type) => (
                <span
                  key={type}
                  className="px-2 py-0.5 rounded-none bg-mist-gray text-[11px] font-mono text-ink-black border border-slate-gray/20"
                >
                  {type.toUpperCase()}
                </span>
              ))}
              <span className="text-[11.5px] text-slate-gray pl-1">
                &bull; {selectedTemplate.suggestedKpiCount} Kartu KPI Utama
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/dashboard">
              <Button
                variant="filled"
                size="md"
                className="text-[13px] px-5 py-2.5 rounded-none hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                Gunakan Template Ini &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Visual Mockup Container (Morphs per Template) */}
        <div className="lg:col-span-6 bg-fog-white border border-slate-gray/15 rounded-none p-4 sm:p-5 shadow-2xs">
          <TemplateDynamicVisual templateId={selectedTemplate.id} />
        </div>
      </div>
    </section>
  );
};
