"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { AvatarBubble } from "@/components/ui/avatar-bubble";
import { Tag } from "@/components/ui/tag";
import { ShieldCheck, TrendingUp, Clock, FileCheck } from "lucide-react";

interface PersonaTestimonial {
  id: string;
  industry: string;
  name: string;
  role: string;
  company: string;
  avatarInitials: string;
  avatarVariant: "sienna" | "green" | "blue" | "neutral";
  quote: string;
  metric: string;
  metricLabel: string;
}

const PERSONAS: PersonaTestimonial[] = [
  {
    id: "retail",
    industry: "Retail & E-Commerce",
    name: "Rina S.",
    role: "Pemilik Toko Fashion Retail",
    company: "Penjual Aktif di Shopee & Tokopedia",
    avatarInitials: "RS",
    avatarVariant: "sienna",
    quote:
      "Dalam waktu kurang dari 30 detik, laporan mingguan toko kami berubah dari tumpukan angka rumit menjadi insight keputusan yang siap dieksekusi bersama tim.",
    metric: "< 30 Detik",
    metricLabel: "Waktu olah laporan mingguan",
  },
  {
    id: "finance",
    industry: "Keuangan & Akuntansi",
    name: "Hendra K.",
    role: "Head of Finance",
    company: "PT Sinergi Niaga Nusantara",
    avatarInitials: "HK",
    avatarVariant: "green",
    quote:
      "Audit rekonsiliasi kas dan arus kas bulanan tidak lagi memakan waktu berhari-hari. Visualisasi anomali langsung terpetakan seketika tanpa upload data ke server luar.",
    metric: "100% Client-Side",
    metricLabel: "Audit privasi & kedaulatan data",
  },
  {
    id: "sales",
    industry: "Sales & Commercial",
    name: "Aditya Pratama",
    role: "VP of Commercial Growth",
    company: "Brand FMCG Direct-to-Consumer",
    avatarInitials: "AP",
    avatarVariant: "blue",
    quote:
      "Dengan Tanya Data AI Assistant terintegrasi, tim sales saya bisa langsung bertanya 'kategori produk apa dengan margin laba tertinggi di kuartal ini' tanpa perlu antre ke tim data analyst.",
    metric: "5.5x Efisiensi",
    metricLabel: "Kecepatan pengambilan keputusan",
  },
  {
    id: "logistics",
    industry: "Logistik & Supply Chain",
    name: "Maya Wibowo",
    role: "Operation Lead",
    company: "Jaringan Logistik Antarkota Jawa-Bali",
    avatarInitials: "MW",
    avatarVariant: "neutral",
    quote:
      "Pemantauan SLA pengiriman 24 cabang di pulau Jawa dapat kami rangkum ke satu layar dashboard dalam 20 detik pertama setelah file spreadsheet operasional diunduh.",
    metric: "24 Cabang",
    metricLabel: "Sinkronisasi performa logistik",
  },
];

export const EditorialQuoteSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>("retail");
  const activePersona = PERSONAS.find((p) => p.id === selectedId) || PERSONAS[0];

  return (
    <section className="w-full max-w-[1240px] mx-auto px-6 lg:px-8 py-16 sm:py-24 text-left">
      <div className="text-center space-y-3 mb-10">
        <Tag label="Studi Kasus &amp; Pengalaman Pengguna" />
        <h2 className="font-signifier text-[30px] sm:text-[40px] font-normal text-ink-black tracking-tight">
          Terbukti di Berbagai Lini Industri Bisnis
        </h2>
        <p className="text-[15px] text-slate-gray max-w-xl mx-auto">
          Lihat bagaimana para pemimpin bisnis mentransformasi spreadsheet rumit menjadi keputusan strategis instan.
        </p>
      </div>

      {/* Persona Industry Selector Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-8">
        {PERSONAS.map((p) => {
          const isActive = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`px-3.5 py-2 text-[12.5px] font-mono tracking-wide transition-all border ${
                isActive
                  ? "bg-sienna-brown text-paper-white border-sienna-brown shadow-xs font-medium"
                  : "bg-fog-white text-slate-gray hover:text-ink-black border-slate-gray/20 hover:border-slate-gray/40"
              }`}
            >
              {p.industry}
            </button>
          );
        })}
      </div>

      {/* Main Editorial Testimonial Card */}
      <Card
        surface="peach"
        padding="editorial"
        className="max-w-[960px] mx-auto space-y-8 rounded-none shadow-subtle border border-[#f7cdb2] text-left transition-all duration-300"
      >
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[var(--color-sienna-brown)]/15 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-sienna-brown)]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-sienna-brown)] font-semibold">
              Kisah Nyata Pengguna &mdash; {activePersona.industry}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[12px] font-mono text-[var(--color-sienna-brown)]/90">
            <span className="font-semibold">{activePersona.metric}</span>
            <span className="text-[var(--color-sienna-brown)]/70">({activePersona.metricLabel})</span>
          </div>
        </div>

        <blockquote className="font-signifier text-[22px] sm:text-[28px] lg:text-[32px] leading-[1.28] text-[var(--color-sienna-brown)] font-normal italic">
          &ldquo;{activePersona.quote}&rdquo;
        </blockquote>

        <div className="pt-4 border-t border-[var(--color-sienna-brown)]/15 flex flex-col sm:flex-row sm:items-center justify-between text-[13.5px] text-[var(--color-sienna-brown)]/85 gap-3">
          <div className="flex items-center gap-3">
            <AvatarBubble
              initials={activePersona.avatarInitials}
              variant={activePersona.avatarVariant}
              name={activePersona.name}
              withPointer={false}
              className="w-9 h-9 text-[13px] border border-[var(--color-sienna-brown)]/30 font-medium"
            />
            <div>
              <span className="font-medium text-[var(--color-sienna-brown)] block">
                {activePersona.name} &mdash; {activePersona.role}
              </span>
              <span className="text-[12.5px] text-[var(--color-sienna-brown)]/75">
                {activePersona.company}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11.5px] font-mono text-[var(--color-sienna-brown)]/70 self-end sm:self-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-sienna-brown)]" />
            <span>Pengguna Terverifikasi</span>
          </div>
        </div>
      </Card>
    </section>
  );
};
