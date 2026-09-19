"use client";

import React, { useState } from "react";
import type { TemplateId } from "@/types/template";

interface DomainSpecializedWidgetProps {
  templateId: TemplateId;
}

export const DomainSpecializedWidget: React.FC<DomainSpecializedWidgetProps> = ({ templateId }) => {
  // 1. E-Commerce State
  const [ecomUplift, setEcomUplift] = useState<number>(15);

  // 2. Sales State
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [pipelineScenario, setPipelineScenario] = useState<"conservative" | "target" | "optimistic">("target");

  // 3. Finance State
  const [opexCategory, setOpexCategory] = useState<"all" | "payroll" | "infra" | "marketing">("all");

  // 4. Marketing State
  const [cacTarget, setCacTarget] = useState<number>(18500);

  // 5. Operations State
  const [courierFilter, setCourierFilter] = useState<"all" | "sameday" | "reguler" | "kargo">("all");

  // 6. HR State
  const [selectedCohort, setSelectedCohort] = useState<"all" | "junior" | "mid" | "senior">("all");

  // 7. Survey State
  const [quoteCategory, setQuoteCategory] = useState<"positive" | "feature" | "delivery">("positive");

  switch (templateId) {
    // -------------------------------------------------------------------------
    // 1. E-COMMERCE & MULTI-CHANNEL RETAIL
    // -------------------------------------------------------------------------
    case "ecommerce": {
      const baseGmv = 148200000;
      const projectedGmv = Math.round(baseGmv * (1 + ecomUplift / 100));
      const gmvDiff = projectedGmv - baseGmv;

      return (
        <div className="bg-paper-white border-2 border-[#9e472a]/40 p-5 sm:p-6 rounded-none shadow-subtle space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#9e472a]/20 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#9e472a] rounded-none inline-block" />
                <h3 className="font-signifier text-[19px] text-ink-black font-semibold tracking-tight">
                  Kanal Marketplace &amp; Simulasi Lift Nilai Keranjang (AOV)
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Pantau pangsa GMV multi-channel dan proyeksikan pertumbuhan omset dari optimasi cross-selling.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#9e472a]/10 text-[#9e472a] px-3 py-1 border border-[#9e472a]/25 font-semibold tracking-wide">
                4 KANAL AKTIF SYNC
              </span>
            </div>
          </div>

          {/* Channel Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { channel: "Shopee Indonesia", share: "48.5%", gmv: "Rp 71,8 jt", orders: "746 trx", badge: "Kanal Utama", color: "#ee4d2d" },
              { channel: "Tokopedia", share: "28.2%", gmv: "Rp 41,7 jt", orders: "434 trx", badge: "Margin Tinggi", color: "#03ac0e" },
              { channel: "TikTok Shop", share: "16.4%", gmv: "Rp 24,3 jt", orders: "252 trx", badge: "Pertumbuhan +45%", color: "#000000" },
              { channel: "Direct Web / WhatsApp", share: "6.9%", gmv: "Rp 10,4 jt", orders: "108 trx", badge: "Zero Commission", color: "#25d366" },
            ].map((item) => (
              <div key={item.channel} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-2 relative group hover:border-[#9e472a]/60 transition-colors">
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray">
                  <span className="font-medium truncate text-ink-black">{item.channel}</span>
                  <span className="text-[#9e472a] font-bold">{item.share}</span>
                </div>
                <div className="text-[17px] font-mono font-semibold text-ink-black">{item.gmv}</div>
                <div className="flex justify-between items-center text-[11px] text-slate-gray pt-1.5 border-t border-slate-gray/15">
                  <span>{item.orders}</span>
                  <span className="text-[10px] bg-paper-white px-2 py-0.5 border border-slate-gray/20 font-mono text-ink-black font-medium">
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive AOV / GMV Uplift Simulator */}
          <div className="bg-[#9e472a]/5 border border-[#9e472a]/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#9e472a] font-bold uppercase tracking-wider">
                Simulasi Kenaikan Nilai Keranjang (AOV Uplift)
              </span>
              <p className="text-[13px] text-ink-black">
                Dampak kenaikan keranjang terhadap GMV total:
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[5, 10, 15, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setEcomUplift(pct)}
                  className={`px-3 py-1.5 text-[12px] font-mono border transition-all cursor-pointer ${
                    ecomUplift === pct
                      ? "bg-[#9e472a] text-paper-white border-[#9e472a] font-semibold"
                      : "bg-paper-white text-ink-black border-slate-gray/25 hover:bg-mist-gray"
                  }`}
                >
                  +{pct}% AOV
                </button>
              ))}
            </div>
            <div className="text-right font-mono shrink-0">
              <span className="text-[11px] text-slate-gray block">Proyeksi GMV Bulanan:</span>
              <span className="text-[16px] font-bold text-[#9e472a]">
                Rp {(projectedGmv / 1000000).toFixed(1)} Jt
              </span>
              <span className="text-[11px] text-[#059669] font-medium ml-1.5">
                (+Rp {(gmvDiff / 1000000).toFixed(1)} Jt)
              </span>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 2. B2B SALES & PIPELINE
    // -------------------------------------------------------------------------
    case "sales": {
      const stages = [
        { name: "1. Prospecting & Discovery", count: 34, value: 420000000, conv: 100, color: "bg-slate-gray/40", avgDays: "4 hari" },
        { name: "2. Proposal & Demo Sent", count: 18, value: 290000000, conv: 53, color: "bg-[#1d4ed8]/60", avgDays: "9 hari" },
        { name: "3. Contract Negotiation", count: 11, value: 185000000, conv: 32, color: "bg-[#1d4ed8]/85", avgDays: "14 hari" },
        { name: "4. Closed Won (Closing)", count: 8, value: 145000000, conv: 24, color: "bg-[#059669]", avgDays: "21 hari" },
      ];

      const multiplier = pipelineScenario === "conservative" ? 0.75 : pipelineScenario === "optimistic" ? 1.25 : 1.0;
      const forecastVal = Math.round(145000000 * multiplier);

      return (
        <div className="bg-paper-white border-2 border-[#1d4ed8]/40 p-5 sm:p-6 rounded-none shadow-subtle space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1d4ed8]/20 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#1d4ed8] rounded-none inline-block" />
                <h3 className="font-signifier text-[19px] text-ink-black font-semibold tracking-tight">
                  Funnel Konversi Tahapan Deal &amp; Quota Velocity
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Lacak pergerakan lead hingga closing, probabilitas konversi per stage, dan proyeksi pencapaian kuota.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#1d4ed8]/10 text-[#1d4ed8] px-3 py-1 border border-[#1d4ed8]/25 font-semibold tracking-wide">
                PIPELINE: RP 1,18 M
              </span>
            </div>
          </div>

          {/* Interactive Pipeline Funnel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stages.map((s, idx) => {
              const isSelected = selectedStage === idx;
              return (
                <div
                  key={s.name}
                  onClick={() => setSelectedStage(idx)}
                  className={`p-3.5 space-y-2 border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#1d4ed8]/5 border-[#1d4ed8] shadow-sm ring-1 ring-[#1d4ed8]"
                      : "bg-fog-white border-slate-gray/20 hover:border-[#1d4ed8]/50"
                  }`}
                >
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray">
                    <span className="font-medium text-ink-black truncate">{s.name}</span>
                    <span className="font-bold text-[#1d4ed8]">{s.conv}%</span>
                  </div>
                  <div className="w-full h-2 bg-mist-gray rounded-none overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: `${s.conv}%` }} />
                  </div>
                  <div className="flex justify-between items-baseline text-[12.5px] font-mono pt-1">
                    <span className="text-ink-black font-semibold">
                      Rp {(s.value / 1000000).toFixed(0)} Jt
                    </span>
                    <span className="text-[10.5px] text-slate-gray">{s.count} Deals ({s.avgDays})</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Forecast & Quota Attainment Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#1d4ed8]/5 border border-[#1d4ed8]/25 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#1d4ed8] font-bold uppercase tracking-wider">
                  Skenario Proyeksi Closing Q1
                </span>
                <div className="flex items-center gap-1.5">
                  {(["conservative", "target", "optimistic"] as const).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setPipelineScenario(sc)}
                      className={`px-2.5 py-1 text-[11px] font-mono border capitalize transition-all cursor-pointer ${
                        pipelineScenario === sc
                          ? "bg-[#1d4ed8] text-paper-white border-[#1d4ed8] font-medium"
                          : "bg-paper-white text-ink-black border-slate-gray/25 hover:bg-mist-gray"
                      }`}
                    >
                      {sc === "conservative" ? "Konservatif" : sc === "target" ? "Target" : "Optimis"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-[20px] font-mono font-bold text-ink-black">
                  Rp {(forecastVal / 1000000).toFixed(1)} Jt
                </span>
                <span className="text-[12px] font-mono text-[#059669]">
                  Win Rate Rata-rata: 24.2%
                </span>
              </div>
            </div>

            {/* Rep Leaderboard */}
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#1d4ed8]/20 md:pl-4 pt-2 md:pt-0">
              <span className="text-[11px] font-mono text-slate-gray uppercase font-semibold">
                Leaderboard Rep Teratas:
              </span>
              <div className="space-y-1 text-[12px] font-mono">
                <div className="flex justify-between items-center text-ink-black">
                  <span>1. Budi Santoso</span>
                  <span className="font-semibold text-[#059669]">114% Quota (Rp 58 Jt)</span>
                </div>
                <div className="flex justify-between items-center text-ink-black">
                  <span>2. Sarah Lestari</span>
                  <span className="font-semibold text-[#1d4ed8]">98% Quota (Rp 49 Jt)</span>
                </div>
                <div className="flex justify-between items-center text-ink-black">
                  <span>3. Reza Pratama</span>
                  <span className="font-semibold text-slate-gray">92% Quota (Rp 38 Jt)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 3. FINANCIAL & P&L
    // -------------------------------------------------------------------------
    case "finance": {
      return (
        <div className="bg-paper-white border-2 border-[#047857]/40 p-5 sm:p-6 rounded-none shadow-subtle space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#047857]/20 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#047857] rounded-none inline-block" />
                <h3 className="font-signifier text-[19px] text-ink-black font-semibold tracking-tight">
                  P&amp;L Margin Waterfall &amp; Ketahanan Arus Kas
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Struktur akuntansi formal pembentukan laba bersih, beban operasional, dan rasio likuiditas.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#047857]/10 text-[#047857] px-3 py-1 border border-[#047857]/25 font-semibold tracking-wide">
                RUNWAY: 14,2 BULAN
              </span>
            </div>
          </div>

          {/* Waterfall Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { item: "1. Gross Revenue", val: "Rp 524 jt", pct: "100%", isPos: true, desc: "Total Omset" },
              { item: "2. COGS / HPP", val: "Rp 248 jt", pct: "-47.3%", isPos: false, desc: "Beban Pokok" },
              { item: "3. Gross Margin", val: "Rp 276 jt", pct: "52.7%", isPos: true, desc: "Laba Kotor" },
              { item: "4. OPEX Operasional", val: "Rp 106 jt", pct: "-20.2%", isPos: false, desc: "Beban Usaha" },
              { item: "5. Net Profit (EBT)", val: "Rp 170 jt", pct: "32.4%", isPos: true, desc: "Laba Bersih" },
            ].map((f) => (
              <div key={f.item} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-1 hover:border-[#047857]/50 transition-colors">
                <span className="text-[10.5px] font-mono text-slate-gray block truncate">{f.item}</span>
                <div className="text-[16px] font-mono font-semibold text-ink-black">{f.val}</div>
                <div className="flex justify-between items-center text-[11px] font-mono pt-1 border-t border-slate-gray/15">
                  <span className={`font-semibold ${f.isPos ? "text-[#047857]" : "text-rose-600"}`}>
                    {f.pct}
                  </span>
                  <span className="text-[10px] text-slate-gray">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Ratios & OPEX Breakdown Filter */}
          <div className="bg-[#047857]/5 border border-[#047857]/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#047857] font-bold uppercase tracking-wider">
                Rasio Kesehatan Likuiditas &amp; Solvabilitas
              </span>
              <div className="flex items-center gap-3 text-[12px] font-mono text-ink-black pt-1">
                <span>Quick Ratio: <strong>2.1x</strong> (Aman)</span>
                <span>•</span>
                <span>EBITDA Margin: <strong>38.1%</strong></span>
                <span>•</span>
                <span>ROE: <strong>28.6%</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <span className="text-[11px] font-mono text-slate-gray mr-1">Filter OPEX:</span>
              {[
                { id: "all", label: "Semua" },
                { id: "payroll", label: "Payroll (58%)" },
                { id: "infra", label: "Tech / Cloud (18%)" },
                { id: "marketing", label: "Marketing (14%)" },
              ].map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setOpexCategory(op.id as typeof opexCategory)}
                  className={`px-2.5 py-1 text-[11px] font-mono border transition-all cursor-pointer ${
                    opexCategory === op.id
                      ? "bg-[#047857] text-paper-white border-[#047857] font-medium"
                      : "bg-paper-white text-ink-black border-slate-gray/25 hover:bg-mist-gray"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 4. GROWTH & MARKETING
    // -------------------------------------------------------------------------
    case "marketing": {
      const ltvVal = 84000;
      const ltvCacRatio = (ltvVal / cacTarget).toFixed(1);

      return (
        <div className="bg-paper-white border-2 border-[#6d28d9]/40 p-5 sm:p-6 rounded-none shadow-subtle space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#6d28d9]/20 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#6d28d9] rounded-none inline-block" />
                <h3 className="font-signifier text-[19px] text-ink-black font-semibold tracking-tight">
                  Efisiensi Akuisisi Berbayar, ROAS &amp; Rasio LTV:CAC
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Matriks atribusi performa iklan per channel, skala return on ad spend, dan unit ekonomi pelanggan.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#6d28d9]/10 text-[#6d28d9] px-3 py-1 border border-[#6d28d9]/25 font-semibold tracking-wide">
                BLENDED CAC: RP {cacTarget.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Ad Channel Attribution Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { channel: "Meta Ads (IG & FB)", roas: "5.4x", spend: "Rp 18 jt", leads: "980 Leads", status: "Scaling Prima", color: "bg-[#059669]" },
              { channel: "TikTok Shop Ads", roas: "4.8x", spend: "Rp 14 jt", leads: "740 Leads", status: "Optimal", color: "bg-[#6d28d9]" },
              { channel: "Google Search & PMax", roas: "3.6x", spend: "Rp 8 jt", leads: "390 Leads", status: "High Intent", color: "bg-blue-600" },
              { channel: "KOL & Endorsement", roas: "4.1x", spend: "Rp 5 jt", leads: "260 Leads", status: "Viral Push", color: "bg-amber-600" },
            ].map((ad) => (
              <div key={ad.channel} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-2 hover:border-[#6d28d9]/50 transition-colors">
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray">
                  <span className="truncate font-medium text-ink-black">{ad.channel}</span>
                  <span className={`w-2 h-2 rounded-full ${ad.color}`} />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[20px] font-mono font-bold text-[#6d28d9]">{ad.roas}</span>
                  <span className="text-[11px] font-mono text-slate-gray">ROAS</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-gray border-t border-slate-gray/15 pt-1.5">
                  <span>Spend: {ad.spend}</span>
                  <span className="text-ink-black font-medium">{ad.leads}</span>
                </div>
              </div>
            ))}
          </div>

          {/* LTV : CAC Unit Economics Barometer */}
          <div className="bg-[#6d28d9]/5 border border-[#6d28d9]/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#6d28d9] font-bold uppercase tracking-wider">
                Unit Economics Unit: Rasio LTV terhadap CAC
              </span>
              <p className="text-[13px] text-ink-black">
                Estimasi Nilai Seumur Hidup Pelanggan (LTV): <strong>Rp 84.000</strong> (Payback Period: 1.8 Bulan)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-gray">Target CAC:</span>
              {[15000, 18500, 22000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCacTarget(val)}
                  className={`px-2.5 py-1 text-[11px] font-mono border transition-all cursor-pointer ${
                    cacTarget === val
                      ? "bg-[#6d28d9] text-paper-white border-[#6d28d9] font-semibold"
                      : "bg-paper-white text-ink-black border-slate-gray/25 hover:bg-mist-gray"
                  }`}
                >
                  Rp {(val / 1000).toFixed(1)}k
                </button>
              ))}
            </div>
            <div className="text-right font-mono shrink-0">
              <span className="text-[11px] text-slate-gray block">Skor LTV / CAC:</span>
              <span className="text-[17px] font-bold text-[#6d28d9]">{ltvCacRatio}x</span>
              <span className="text-[11px] text-[#059669] font-medium ml-1.5">
                {Number(ltvCacRatio) >= 4 ? "Sangat Sehat" : "Cukup Sehat"}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 5. OPERATIONS & SUPPLY CHAIN
    // -------------------------------------------------------------------------
    case "operational": {
      return (
        <div className="bg-paper-white border-2 border-[#b45309]/40 p-5 sm:p-6 rounded-none shadow-subtle space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#b45309]/20 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#b45309] rounded-none inline-block" />
                <h3 className="font-signifier text-[19px] text-ink-black font-semibold tracking-tight">
                  Kepatuhan SLA Ekspedisi, Lead Time &amp; Defect Rate
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Pusat kendali logistik, kecepatan transit antar wilayah, dan pemantauan tingkat retur / klaim cacat.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#b45309]/10 text-[#b45309] px-3 py-1 border border-[#b45309]/25 font-semibold tracking-wide">
                SLA RATE: 98.4% ON-TIME
              </span>
            </div>
          </div>

          {/* Courier SLA Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { courier: "J&T Express", onTime: "99.1%", avgDays: "1.4 Hari", volume: "3.420 Resi", status: "SLA Hijau" },
              { courier: "SiCepat Ekspres", onTime: "98.7%", avgDays: "1.2 Hari", volume: "2.810 Resi", status: "SLA Hijau" },
              { courier: "JNE Reguler", onTime: "97.5%", avgDays: "1.8 Hari", volume: "1.450 Resi", status: "Optimal" },
              { courier: "AnterAja", onTime: "96.8%", avgDays: "2.1 Hari", volume: "740 Resi", status: "Perlu Monitoring" },
            ].map((c) => (
              <div key={c.courier} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-2 hover:border-[#b45309]/50 transition-colors">
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray">
                  <span className="truncate font-medium text-ink-black">{c.courier}</span>
                  <span className="text-[10px] bg-paper-white px-1.5 py-0.5 border border-slate-gray/20">{c.status}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[19px] font-mono font-bold text-[#b45309]">{c.onTime}</span>
                  <span className="text-[11px] font-mono text-slate-gray">{c.avgDays}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-gray border-t border-slate-gray/15 pt-1.5">
                  Volume: <span className="text-ink-black font-semibold">{c.volume}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Lead Time by Region & Dispatch Type Filter */}
          <div className="bg-[#b45309]/5 border border-[#b45309]/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#b45309] font-bold uppercase tracking-wider">
                Kecepatan Lead Time Rata-rata per Wilayah
              </span>
              <div className="flex items-center gap-3 text-[12px] font-mono text-ink-black pt-1">
                <span>Jawa &amp; Bali: <strong>1.2 Hari</strong></span>
                <span>•</span>
                <span>Sumatera: <strong>2.1 Hari</strong></span>
                <span>•</span>
                <span>Kalimantan / Sulawesi: <strong>2.8 Hari</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <span className="text-[11px] font-mono text-slate-gray mr-1">Tipe Pengiriman:</span>
              {[
                { id: "all", label: "Semua" },
                { id: "sameday", label: "Instant / Sameday" },
                { id: "reguler", label: "Reguler" },
                { id: "kargo", label: "Kargo" },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setCourierFilter(type.id as typeof courierFilter)}
                  className={`px-2.5 py-1 text-[11px] font-mono border transition-all cursor-pointer ${
                    courierFilter === type.id
                      ? "bg-[#b45309] text-paper-white border-[#b45309] font-medium"
                      : "bg-paper-white text-ink-black border-slate-gray/25 hover:bg-mist-gray"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 6. PEOPLE & HUMAN RESOURCES
    // -------------------------------------------------------------------------
    case "hr": {
      return (
        <div className="bg-paper-white border-2 border-[#be185d]/40 p-5 sm:p-6 rounded-none shadow-subtle space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#be185d]/20 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#be185d] rounded-none inline-block" />
                <h3 className="font-signifier text-[19px] text-ink-black font-semibold tracking-tight">
                  Sebaran Departemen, Retensi Karyawan &amp; Pulse eNPS
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Kesehatan struktur organisasi, distribusi talenta per divisi, dan indeks kepuasan tim internal.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#be185d]/10 text-[#be185d] px-3 py-1 border border-[#be185d]/25 font-semibold tracking-wide">
                RETENSI: 94.2% (eNPS +58)
              </span>
            </div>
          </div>

          {/* Department Distribution Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { dept: "Engineering & Tech", headcount: "62 Orang", pct: "41.8%", tenure: "2.4 Thn", eNPS: "+62" },
              { dept: "Sales & Marketing", headcount: "48 Orang", pct: "32.4%", tenure: "1.9 Thn", eNPS: "+54" },
              { dept: "Operations & CS", headcount: "26 Orang", pct: "17.6%", tenure: "2.1 Thn", eNPS: "+59" },
              { dept: "Finance & People", headcount: "12 Orang", pct: "8.2%", tenure: "3.2 Thn", eNPS: "+65" },
            ].map((h) => (
              <div key={h.dept} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-2 hover:border-[#be185d]/50 transition-colors">
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray">
                  <span className="truncate font-medium text-ink-black">{h.dept}</span>
                  <span className="text-[#be185d] font-bold">{h.pct}</span>
                </div>
                <div className="text-[17px] font-mono font-semibold text-ink-black">{h.headcount}</div>
                <div className="flex justify-between text-[11px] font-mono text-slate-gray border-t border-slate-gray/15 pt-1.5">
                  <span>Masa: {h.tenure}</span>
                  <span className="text-[#059669] font-medium">eNPS {h.eNPS}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tenure Cohorts & Sentiment Meter */}
          <div className="bg-[#be185d]/5 border border-[#be185d]/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#be185d] font-bold uppercase tracking-wider">
                Indeks eNPS &amp; Breakdown Sentimen Karyawan
              </span>
              <div className="flex items-center gap-3 text-[12px] font-mono text-ink-black pt-1">
                <span className="text-[#059669]">Promoter: <strong>82%</strong></span>
                <span>•</span>
                <span className="text-amber-600">Passive: <strong>14%</strong></span>
                <span>•</span>
                <span className="text-rose-600">Detractor: <strong>4%</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <span className="text-[11px] font-mono text-slate-gray mr-1">Cohort Masa Kerja:</span>
              {[
                { id: "all", label: "Semua" },
                { id: "junior", label: "< 1 Tahun" },
                { id: "mid", label: "1 - 3 Tahun" },
                { id: "senior", label: "> 3 Tahun" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCohort(c.id as typeof selectedCohort)}
                  className={`px-2.5 py-1 text-[11px] font-mono border transition-all cursor-pointer ${
                    selectedCohort === c.id
                      ? "bg-[#be185d] text-paper-white border-[#be185d] font-medium"
                      : "bg-paper-white text-ink-black border-slate-gray/25 hover:bg-mist-gray"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 7. VOICE OF CUSTOMER & SURVEY
    // -------------------------------------------------------------------------
    case "survey": {
      const quotesMap = {
        positive: [
          { text: "Pelayanan sangat responsif dan pengiriman sampai sebelum estimasi!", user: "Pelanggan Terverifikasi", score: "5.0 ★" },
          { text: "Kualitas barang sesuai deskripsi, packaging rapi dan aman.", user: "Buyer Shopee", score: "5.0 ★" },
        ],
        feature: [
          { text: "Bisa ditambahkan fitur tracking pengiriman real-time via WhatsApp?", user: "User Direct Web", score: "4.0 ★" },
        ],
        delivery: [
          { text: "Ekspedisi kargo agak lambat 1 hari saat promo tanggal kembar.", user: "Reseller Surabaya", score: "3.0 ★" },
        ],
      };

      return (
        <div className="bg-paper-white border-2 border-[#0284c7]/40 p-5 sm:p-6 rounded-none shadow-subtle space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0284c7]/20 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#0284c7] rounded-none inline-block" />
                <h3 className="font-signifier text-[19px] text-ink-black font-semibold tracking-tight">
                  Distribusi Skor CSAT &amp; Sentimen Ulasan Responden
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Sebaran rating kepuasan 1-5 bintang, skor loyalitas Net Promoter Score (NPS), dan verbatim masukan pelanggan.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#0284c7]/10 text-[#0284c7] px-3 py-1 border border-[#0284c7]/25 font-semibold tracking-wide">
                SCORE: 4.82 / 5.00 (NPS +68)
              </span>
            </div>
          </div>

          {/* Star Distribution Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "5 Bintang (Sangat Puas)", count: "2.484 Ulasan", share: "72%", color: "bg-[#059669]" },
              { label: "4 Bintang (Puas)", count: "621 Ulasan", share: "18%", color: "bg-[#0284c7]" },
              { label: "3 Bintang (Netral)", count: "241 Ulasan", share: "7%", color: "bg-amber-400" },
              { label: "1-2 Bintang (Kritikal)", count: "104 Ulasan", share: "3%", color: "bg-rose-500" },
            ].map((star) => (
              <div key={star.label} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-2 hover:border-[#0284c7]/50 transition-colors">
                <span className="text-[11px] font-mono text-slate-gray block truncate">{star.label}</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-[17px] font-mono font-semibold text-ink-black">{star.count}</span>
                  <span className="text-[13px] font-mono font-bold text-ink-black">{star.share}</span>
                </div>
                <div className="w-full h-2 bg-mist-gray rounded-none overflow-hidden">
                  <div className={`h-full ${star.color}`} style={{ width: star.share }} />
                </div>
              </div>
            ))}
          </div>

          {/* Verbatim Feedback Feed with Interactive Tabs */}
          <div className="bg-[#0284c7]/5 border border-[#0284c7]/25 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-mono text-[#0284c7] font-bold uppercase tracking-wider">
                Verbatim Suara Pelanggan:
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "positive", label: "Pujian Layanan" },
                  { id: "feature", label: "Permintaan Fitur" },
                  { id: "delivery", label: "Catatan Ekspedisi" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setQuoteCategory(tab.id as typeof quoteCategory)}
                    className={`px-2.5 py-1 text-[11px] font-mono border transition-all cursor-pointer ${
                      quoteCategory === tab.id
                        ? "bg-[#0284c7] text-paper-white border-[#0284c7] font-medium"
                        : "bg-paper-white text-ink-black border-slate-gray/25 hover:bg-mist-gray"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {quotesMap[quoteCategory].map((q, idx) => (
                <div key={idx} className="bg-paper-white border border-slate-gray/20 p-3 space-y-1">
                  <p className="text-[12.5px] italic text-ink-black">&ldquo;{q.text}&rdquo;</p>
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray pt-1 border-t border-slate-gray/10">
                    <span>{q.user}</span>
                    <span className="text-[#059669] font-semibold">{q.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 8. GENERAL & SWISS EDITORIAL
    // -------------------------------------------------------------------------
    case "general":
    default:
      return (
        <div className="bg-paper-white border-2 border-ink-black/40 p-5 sm:p-6 rounded-none shadow-subtle space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-black/20 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-ink-black rounded-none inline-block" />
                <h3 className="font-signifier text-[19px] text-ink-black font-semibold tracking-tight">
                  Sintesis Editorial Universal &amp; Analisis Konsentrasi Pareto (80/20)
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Presisi tipografi Swiss, evaluasi sebaran interkuartil (IQR), dan verifikasi integritas dataset.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-ink-black/10 text-ink-black px-3 py-1 border border-ink-black/25 font-semibold tracking-wide">
                SWISS PRECISION DENSITY
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-1.5 hover:border-ink-black/50 transition-colors">
              <span className="text-[10.5px] font-mono text-slate-gray block uppercase">Konsentrasi Top 20% Segmen</span>
              <div className="text-[18px] font-mono font-bold text-ink-black">78.4% Kontribusi</div>
              <span className="text-[11.5px] text-[#059669] font-mono font-medium block">
                Sesuai Prinsip Distribusi Pareto 80/20
              </span>
            </div>
            <div className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-1.5 hover:border-ink-black/50 transition-colors">
              <span className="text-[10.5px] font-mono text-slate-gray block uppercase">Distribusi Simetri &amp; Nilai Ekstrem</span>
              <div className="text-[18px] font-mono font-bold text-ink-black">IQR Normal (94% Simetri)</div>
              <span className="text-[11.5px] text-slate-gray font-mono block">
                Skewness Rendah: 0.12 (Homogen)
              </span>
            </div>
            <div className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-1.5 hover:border-ink-black/50 transition-colors">
              <span className="text-[10.5px] font-mono text-slate-gray block uppercase">Integritas Baris Transaksi</span>
              <div className="text-[18px] font-mono font-bold text-[#059669]">100% Terverifikasi</div>
              <span className="text-[11.5px] text-slate-gray font-mono block">
                Zero Null Collision &amp; Sanitized CSV
              </span>
            </div>
          </div>
        </div>
      );
  }
};
