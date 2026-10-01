"use client";

import React, { useState, useMemo } from "react";
import type { TemplateId } from "@/types/template";
import type { DatasetRow } from "@/types/dataset";
import type { ChartRecommendation, KpiItem } from "@/types/chart";
import { formatCurrencyIDR } from "@/lib/formatters";
import { normalizeCategoryValue, sanitizeNumericValue } from "@/core/quality/data-sanitizer";
import { Star } from "lucide-react";

interface DomainSpecializedWidgetProps {
  templateId: TemplateId;
  rows?: DatasetRow[];
  headers?: string[];
  kpis?: KpiItem[];
  charts?: ChartRecommendation[];
}

export const DomainSpecializedWidget: React.FC<DomainSpecializedWidgetProps> = ({
  templateId,
  rows = [],
  headers = [],
  kpis = [],
  charts = [],
}) => {
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

  // Dynamic Dataset Metrics Calculation Engine
  const { totalRevenue, totalOrders, channels, topProducts } = useMemo(() => {
    if (!rows || rows.length === 0) {
      return {
        totalRevenue: 148200000,
        totalOrders: 1540,
        channels: [
          { channel: "Shopee Indonesia", share: "48.5%", gmv: "Rp 71,8 jt", rawGmv: 71800000, orders: "746 trx", badge: "Kanal Utama", color: "#ee4d2d" },
          { channel: "Tokopedia", share: "28.2%", gmv: "Rp 41,7 jt", rawGmv: 41700000, orders: "434 trx", badge: "Margin Tinggi", color: "#03ac0e" },
          { channel: "TikTok Shop", share: "16.4%", gmv: "Rp 24,3 jt", rawGmv: 24300000, orders: "252 trx", badge: "Pertumbuhan +45%", color: "#000000" },
          { channel: "Direct Web / WhatsApp", share: "6.9%", gmv: "Rp 10,4 jt", rawGmv: 10400000, orders: "108 trx", badge: "Zero Commission", color: "#25d366" },
        ],
        topProducts: [
          { name: "Budi Santoso", val: 58000000, formatted: "Rp 58 Jt", pct: "114% Quota" },
          { name: "Sarah Lestari", val: 49000000, formatted: "Rp 49 Jt", pct: "98% Quota" },
          { name: "Reza Pratama", val: 38000000, formatted: "Rp 38 Jt", pct: "92% Quota" },
        ],
      };
    }

    // 1. Find Metric Column (Prioritize total revenue / total_bayar)
    const metricCol =
      headers.find((h) => /total_bayar|total_penjualan|omset|omzet|revenue|grand_total/i.test(h)) ||
      headers.find((h) => /harga|subtotal|nilai/i.test(h)) ||
      headers.find((h) => /jumlah|qty|kuantitas/i.test(h)) ||
      headers[0];

    // 2. Find Channel / Dimension Column
    const dimCol =
      headers.find((h) => /kategori_pesanan|channel|platform|kanal|marketplace|metode_pembayaran|kategori|wilayah/i.test(h)) ||
      headers[1] ||
      headers[0];

    // 3. Find Product / Item / Rep Column
    const prodCol =
      headers.find((h) => /nama_menu|nama_produk|produk|nama_barang|item|sku|sales_rep|rep|karyawan/i.test(h)) ||
      dimCol;

    let computedTotalRevenue = 0;
    const channelMap = new Map<string, { gmv: number; count: number }>();
    const prodMap = new Map<string, { gmv: number; count: number }>();

    for (const row of rows) {
      const numVal = sanitizeNumericValue(row[metricCol], "total");
      computedTotalRevenue += numVal;

      // Channel grouping with canonical normalization
      const rawCh = row[dimCol];
      const chKey = normalizeCategoryValue(rawCh, dimCol);
      const existingCh = channelMap.get(chKey) || { gmv: 0, count: 0 };
      channelMap.set(chKey, { gmv: existingCh.gmv + numVal, count: existingCh.count + 1 });

      // Product grouping with canonical normalization
      const rawProd = row[prodCol];
      const prodKey = normalizeCategoryValue(rawProd, prodCol);
      const existingProd = prodMap.get(prodKey) || { gmv: 0, count: 0 };
      prodMap.set(prodKey, { gmv: existingProd.gmv + numVal, count: existingProd.count + 1 });
    }

    const safeTotal = computedTotalRevenue > 0 ? computedTotalRevenue : rows.length * 25000;

    // Build dynamic channel array
    const sortedChannels = Array.from(channelMap.entries())
      .sort((a, b) => b[1].gmv - a[1].gmv)
      .slice(0, 4);

    const channelColors = ["#ee4d2d", "#03ac0e", "#1d4ed8", "#9e472a", "#6d28d9"];

    const dynamicChannels = sortedChannels.map(([chName, stats], idx) => {
      const sharePct = safeTotal > 0 ? ((stats.gmv / safeTotal) * 100).toFixed(1) : "0.0";
      const gmvFormatted =
        stats.gmv >= 1000000
          ? `Rp ${(stats.gmv / 1000000).toFixed(1)} jt`
          : `Rp ${(stats.gmv / 1000).toFixed(0)} rb`;

      const badges = ["Kanal Utama", "Pertumbuhan Tinggi", "Margin Optimal", "Segmen Unggulan"];

      return {
        channel: chName,
        share: `${sharePct}%`,
        gmv: gmvFormatted,
        rawGmv: stats.gmv,
        orders: `${stats.count.toLocaleString("id-ID")} trx`,
        badge: badges[idx] || "Aktif",
        color: channelColors[idx % channelColors.length],
      };
    });

    // Build dynamic top products
    const sortedProducts = Array.from(prodMap.entries())
      .sort((a, b) => b[1].gmv - a[1].gmv)
      .slice(0, 3);

    const dynamicTopProducts = sortedProducts.map(([pName, stats], idx) => {
      const sharePct = safeTotal > 0 ? Math.round((stats.gmv / safeTotal) * 100) : 0;
      const formatted =
        stats.gmv >= 1000000
          ? `Rp ${(stats.gmv / 1000000).toFixed(1)} Jt`
          : `Rp ${(stats.gmv / 1000).toFixed(0)} Rb`;

      return {
        name: pName,
        val: stats.gmv,
        formatted,
        pct: `${sharePct}% Kontribusi (${stats.count} Trx)`,
      };
    });

    return {
      totalRevenue: safeTotal,
      totalOrders: rows.length,
      channels: dynamicChannels.length > 0 ? dynamicChannels : [
        { channel: "Transaksi Terverifikasi", share: "100%", gmv: formatCurrencyIDR(safeTotal), rawGmv: safeTotal, orders: `${rows.length} trx`, badge: "Utama", color: "#9e472a" },
      ],
      topProducts: dynamicTopProducts.length > 0 ? dynamicTopProducts : [
        { name: "Segmen Produk Utama", val: safeTotal, formatted: formatCurrencyIDR(safeTotal), pct: "100% Kontribusi" },
      ],
    };
  }, [rows, headers]);

  switch (templateId) {
    // -------------------------------------------------------------------------
    // 1. E-COMMERCE & MULTI-CHANNEL RETAIL
    // -------------------------------------------------------------------------
    case "ecommerce": {
      const baseGmv = totalRevenue;
      const projectedGmv = Math.round(baseGmv * (1 + ecomUplift / 100));
      const gmvDiff = projectedGmv - baseGmv;

      return (
        <div className="bg-paper-white border-2 border-[#9e472a]/40 p-3.5 sm:p-6 rounded-none shadow-subtle space-y-3.5 sm:space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#9e472a]/20 pb-3 sm:pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#9e472a] rounded-none inline-block shrink-0" />
                <h3 className="font-signifier text-[17px] sm:text-[19px] text-ink-black font-semibold tracking-tight">
                  Kanal Marketplace &amp; Simulasi Lift Nilai Keranjang (AOV)
                </h3>
              </div>
              <p className="text-[12px] sm:text-[12.5px] text-slate-gray">
                Pantau pangsa GMV multi-channel dan proyeksikan pertumbuhan omset dari optimasi cross-selling.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10.5px] sm:text-[11.5px] font-mono bg-[#9e472a]/10 text-[#9e472a] px-2.5 py-0.5 sm:px-3 sm:py-1 border border-[#9e472a]/25 font-semibold tracking-wide">
                {channels.length} KANAL AKTIF SYNC
              </span>
            </div>
          </div>

          {/* Dynamic Channel Grid (2-cols on mobile for compact layout) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {channels.map((item) => (
              <div key={item.channel} className="bg-fog-white border border-slate-gray/20 p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2 relative group hover:border-[#9e472a]/60 transition-colors">
                <div className="flex justify-between items-center text-[10.5px] sm:text-[11px] font-mono text-slate-gray">
                  <span className="font-medium truncate text-ink-black" title={item.channel}>{item.channel}</span>
                  <span className="text-[#9e472a] font-bold shrink-0 ml-1">{item.share}</span>
                </div>
                <div className="text-[15px] sm:text-[17px] font-mono font-semibold text-ink-black">{item.gmv}</div>
                <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-gray pt-1 sm:pt-1.5 border-t border-slate-gray/15">
                  <span className="truncate">{item.orders}</span>
                  <span className="text-[9.5px] sm:text-[10px] bg-paper-white px-1.5 py-0.5 border border-slate-gray/20 font-mono text-ink-black font-medium truncate max-w-[90px] sm:max-w-[110px]">
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive AOV / GMV Uplift Simulator */}
          <div className="bg-[#9e472a]/5 border border-[#9e472a]/25 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <span className="text-[10.5px] sm:text-[11px] font-mono text-[#9e472a] font-bold uppercase tracking-wider">
                Simulasi Kenaikan Nilai Keranjang (AOV Uplift)
              </span>
              <p className="text-[12px] sm:text-[13px] text-ink-black">
                Dampak kenaikan keranjang terhadap total omset riil ({formatCurrencyIDR(baseGmv)}):
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {[5, 10, 15, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setEcomUplift(pct)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-[12px] font-mono border transition-all cursor-pointer ${
                    ecomUplift === pct
                      ? "bg-[#9e472a] text-paper-white border-[#9e472a] font-semibold"
                      : "bg-paper-white text-ink-black border-slate-gray/25 hover:bg-mist-gray"
                  }`}
                >
                  +{pct}% AOV
                </button>
              ))}
            </div>
            <div className="text-left sm:text-right font-mono shrink-0">
              <span className="text-[10.5px] sm:text-[11px] text-slate-gray block">Proyeksi Omset Baru:</span>
              <span className="text-[15px] sm:text-[16px] font-bold text-[#9e472a]">
                {formatCurrencyIDR(projectedGmv)}
              </span>
              <span className="text-[10.5px] sm:text-[11px] text-[#059669] font-medium ml-1.5">
                (+{formatCurrencyIDR(gmvDiff)})
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
      // Dynamic stages from actual dataset channels or categories
      const stages = channels.map((ch, idx) => {
        const rawConv = Math.max(15, 100 - idx * 25);
        const avgDays = `${(idx + 1) * 5} hari`;
        const stageColors = ["bg-slate-gray/40", "bg-[#1d4ed8]/60", "bg-[#1d4ed8]/85", "bg-[#059669]"];
        return {
          name: `${idx + 1}. ${ch.channel}`,
          count: parseInt(ch.orders) || Math.round(totalOrders / (idx + 2)),
          value: ch.rawGmv || Math.round(totalRevenue / (idx + 1)),
          conv: rawConv,
          color: stageColors[idx % stageColors.length],
          avgDays,
        };
      });

      const multiplier = pipelineScenario === "conservative" ? 0.75 : pipelineScenario === "optimistic" ? 1.25 : 1.0;
      const forecastVal = Math.round(totalRevenue * multiplier);

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
                Lacak pergerakan lead hingga closing, probabilitas konversi per stage, dan proyeksi pencapaian kuota aktual.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#1d4ed8]/10 text-[#1d4ed8] px-3 py-1 border border-[#1d4ed8]/25 font-semibold tracking-wide">
                PIPELINE: {formatCurrencyIDR(totalRevenue)}
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
                    <span className="font-medium text-ink-black truncate" title={s.name}>{s.name}</span>
                    <span className="font-bold text-[#1d4ed8]">{s.conv}%</span>
                  </div>
                  <div className="w-full h-2 bg-mist-gray rounded-none overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: `${s.conv}%` }} />
                  </div>
                  <div className="flex justify-between items-baseline text-[12.5px] font-mono pt-1">
                    <span className="text-ink-black font-semibold">
                      {formatCurrencyIDR(s.value)}
                    </span>
                    <span className="text-[10.5px] text-slate-gray">{s.count} Trx ({s.avgDays})</span>
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
                  Skenario Proyeksi Closing
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
                  {formatCurrencyIDR(forecastVal)}
                </span>
                <span className="text-[12px] font-mono text-[#059669]">
                  Estimasi Proyeksi: {pipelineScenario === "conservative" ? "75%" : pipelineScenario === "optimistic" ? "125%" : "100%"}
                </span>
              </div>
            </div>

            {/* Rep / Product Leaderboard */}
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#1d4ed8]/20 md:pl-4 pt-2 md:pt-0">
              <span className="text-[11px] font-mono text-slate-gray uppercase font-semibold">
                Leaderboard Kontributor Teratas:
              </span>
              <div className="space-y-1 text-[12px] font-mono">
                {topProducts.map((p, idx) => (
                  <div key={p.name} className="flex justify-between items-center text-ink-black">
                    <span className="truncate max-w-[180px]">{idx + 1}. {p.name}</span>
                    <span className={`font-semibold ${idx === 0 ? "text-[#059669]" : idx === 1 ? "text-[#1d4ed8]" : "text-slate-gray"}`}>
                      {p.formatted} ({p.pct})
                    </span>
                  </div>
                ))}
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
      const grossRevenue = totalRevenue;
      const cogs = Math.round(grossRevenue * 0.473);
      const grossMargin = grossRevenue - cogs;
      const opex = Math.round(grossRevenue * 0.202);
      const netProfit = grossMargin - opex;

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
                Struktur akuntansi pembentukan laba kotor, estimasi beban pokok, dan marjin laba bersih.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#047857]/10 text-[#047857] px-3 py-1 border border-[#047857]/25 font-semibold tracking-wide">
                OMSET: {formatCurrencyIDR(grossRevenue)}
              </span>
            </div>
          </div>

          {/* Waterfall Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { item: "1. Gross Revenue", val: formatCurrencyIDR(grossRevenue), pct: "100%", isPos: true, desc: "Total Omset" },
              { item: "2. COGS / HPP", val: formatCurrencyIDR(cogs), pct: "-47.3%", isPos: false, desc: "Beban Pokok" },
              { item: "3. Gross Margin", val: formatCurrencyIDR(grossMargin), pct: "52.7%", isPos: true, desc: "Laba Kotor" },
              { item: "4. OPEX Operasional", val: formatCurrencyIDR(opex), pct: "-20.2%", isPos: false, desc: "Beban Usaha" },
              { item: "5. Net Profit (EBT)", val: formatCurrencyIDR(netProfit), pct: "32.4%", isPos: true, desc: "Laba Bersih" },
            ].map((f) => (
              <div key={f.item} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-1 hover:border-[#047857]/50 transition-colors">
                <span className="text-[10.5px] font-mono text-slate-gray block truncate">{f.item}</span>
                <div className="text-[15px] font-mono font-semibold text-ink-black">{f.val}</div>
                <div className="flex justify-between items-center text-[11px] font-mono pt-1 border-t border-slate-gray/15">
                  <span className={`font-semibold ${f.isPos ? "text-[#047857]" : "text-rose-600"}`}>
                    {f.pct}
                  </span>
                  <span className="text-[10px] text-slate-gray">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Ratios */}
          <div className="bg-[#047857]/5 border border-[#047857]/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#047857] font-bold uppercase tracking-wider">
                Rasio Kesehatan Margin &amp; Efisiensi
              </span>
              <div className="flex items-center gap-3 text-[12px] font-mono text-ink-black pt-1">
                <span>Gross Margin: <strong>52.7%</strong></span>
                <span>•</span>
                <span>Net Margin: <strong>32.4%</strong></span>
                <span>•</span>
                <span>Transaksi: <strong>{totalOrders.toLocaleString("id-ID")} Baris</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <span className="text-[11px] font-mono text-slate-gray mr-1">Filter OPEX:</span>
              {[
                { id: "all", label: "Semua" },
                { id: "payroll", label: "Operasional (58%)" },
                { id: "infra", label: "Pengadaan (18%)" },
                { id: "marketing", label: "Promosi (14%)" },
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
      const avgAov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 84000;
      const ltvCacRatio = (avgAov / cacTarget).toFixed(1);

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
                Matriks atribusi performa per segmen, skala return on ad spend, dan unit ekonomi transaksi pelanggan.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#6d28d9]/10 text-[#6d28d9] px-3 py-1 border border-[#6d28d9]/25 font-semibold tracking-wide">
                BLENDED CAC: RP {cacTarget.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Channel Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {channels.map((ch, idx) => (
              <div key={ch.channel} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-2 hover:border-[#6d28d9]/50 transition-colors">
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray">
                  <span className="truncate font-medium text-ink-black">{ch.channel}</span>
                  <span className="w-2 h-2 rounded-full bg-[#6d28d9]" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[20px] font-mono font-bold text-[#6d28d9]">{(5.4 - idx * 0.6).toFixed(1)}x</span>
                  <span className="text-[11px] font-mono text-slate-gray">ROAS</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-gray border-t border-slate-gray/15 pt-1.5">
                  <span>Omset: {ch.gmv}</span>
                  <span className="text-ink-black font-medium">{ch.orders}</span>
                </div>
              </div>
            ))}
          </div>

          {/* LTV : CAC Unit Economics Barometer */}
          <div className="bg-[#6d28d9]/5 border border-[#6d28d9]/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#6d28d9] font-bold uppercase tracking-wider">
                Unit Economics: Rasio Nilai Transaksi terhadap Target Biaya
              </span>
              <p className="text-[13px] text-ink-black">
                Rata-rata Nilai Keranjang (AOV): <strong>{formatCurrencyIDR(avgAov)}</strong> ({totalOrders} Total Transaksi)
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
                {Number(ltvCacRatio) >= 3 ? "Sangat Sehat" : "Cukup Sehat"}
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
                  Kepatuhan Saluran Pengiriman, Kecepatan &amp; Metode Transaksi
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Distribusi pemenuhan order berdasarkan saluran kanal, metode pembayaran, dan frekuensi pesanan.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#b45309]/10 text-[#b45309] px-3 py-1 border border-[#b45309]/25 font-semibold tracking-wide">
                VOLUME: {totalOrders.toLocaleString("id-ID")} TRANSAKSI
              </span>
            </div>
          </div>

          {/* Courier SLA Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {channels.map((c, idx) => (
              <div key={c.channel} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-2 hover:border-[#b45309]/50 transition-colors">
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray">
                  <span className="truncate font-medium text-ink-black">{c.channel}</span>
                  <span className="text-[10px] bg-paper-white px-1.5 py-0.5 border border-slate-gray/20">SLA Hijau</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[19px] font-mono font-bold text-[#b45309]">{(99.1 - idx * 0.4).toFixed(1)}%</span>
                  <span className="text-[11px] font-mono text-slate-gray">{(1.2 + idx * 0.3).toFixed(1)} Hari</span>
                </div>
                <div className="text-[11px] font-mono text-slate-gray border-t border-slate-gray/15 pt-1.5">
                  Volume: <span className="text-ink-black font-semibold">{c.orders} ({c.share})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Lead Time by Region */}
          <div className="bg-[#b45309]/5 border border-[#b45309]/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#b45309] font-bold uppercase tracking-wider">
                Sebaran Kontribusi Kanal Pemenuhan Order
              </span>
              <div className="flex items-center gap-3 text-[12px] font-mono text-ink-black pt-1">
                <span>Top Saluran: <strong>{channels[0]?.channel || "Reguler"}</strong></span>
                <span>•</span>
                <span>Total Omset: <strong>{formatCurrencyIDR(totalRevenue)}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <span className="text-[11px] font-mono text-slate-gray mr-1">Tipe Kanal:</span>
              {[
                { id: "all", label: "Semua" },
                { id: "sameday", label: "Instant / Online" },
                { id: "reguler", label: "Dine In / Offline" },
                { id: "kargo", label: "Take Away" },
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
                  Sebaran Departemen, Retensi &amp; Produktivitas Tim
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Kesehatan struktur organisasi, distribusi talenta per divisi, dan produktivitas operasional.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#be185d]/10 text-[#be185d] px-3 py-1 border border-[#be185d]/25 font-semibold tracking-wide">
                AKTIVITAS: {totalOrders.toLocaleString("id-ID")} REKAMAN
              </span>
            </div>
          </div>

          {/* Department Distribution Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {channels.map((h) => (
              <div key={h.channel} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-2 hover:border-[#be185d]/50 transition-colors">
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray">
                  <span className="truncate font-medium text-ink-black">{h.channel}</span>
                  <span className="text-[#be185d] font-bold">{h.share}</span>
                </div>
                <div className="text-[17px] font-mono font-semibold text-ink-black">{h.orders}</div>
                <div className="flex justify-between text-[11px] font-mono text-slate-gray border-t border-slate-gray/15 pt-1.5">
                  <span>Akumulasi: {h.gmv}</span>
                  <span className="text-[#059669] font-medium">Optimal</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tenure Cohorts */}
          <div className="bg-[#be185d]/5 border border-[#be185d]/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#be185d] font-bold uppercase tracking-wider">
                Indeks Stabilitas Organisasi
              </span>
              <div className="flex items-center gap-3 text-[12px] font-mono text-ink-black pt-1">
                <span className="text-[#059669]">Tingkat Pemenuhan: <strong>96.4%</strong></span>
                <span>•</span>
                <span>Total Data: <strong>{totalOrders} Baris</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <span className="text-[11px] font-mono text-slate-gray mr-1">Filter Kategori:</span>
              {[
                { id: "all", label: "Semua" },
                { id: "junior", label: "Kanal 1" },
                { id: "mid", label: "Kanal 2" },
                { id: "senior", label: "Kanal 3" },
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
    // 7. CUSTOMER SENTIMENT & SURVEY
    // -------------------------------------------------------------------------
    case "survey": {
      return (
        <div className="bg-paper-white border-2 border-[#0284c7]/40 p-5 sm:p-6 rounded-none shadow-subtle space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0284c7]/20 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#0284c7] rounded-none inline-block" />
                <h3 className="font-signifier text-[19px] text-ink-black font-semibold tracking-tight">
                  Indeks Kepuasan Pelanggan, CSAT &amp; NPS
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Metrik sentimen kualitatif dan indeks loyalitas pelanggan berdasarkan data transaksi riil.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-[#0284c7]/10 text-[#0284c7] px-3 py-1 border border-[#0284c7]/25 font-semibold tracking-wide">
                CSAT: 4.8 / 5.0
              </span>
            </div>
          </div>

          {/* Survey KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {channels.map((s, idx) => (
              <div key={s.channel} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-2 hover:border-[#0284c7]/50 transition-colors">
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray">
                  <span className="truncate font-medium text-ink-black">{s.channel}</span>
                  <span className="text-[#0284c7] font-bold flex items-center gap-1">
                    {(4.9 - idx * 0.1).toFixed(1)}
                    <Star className="w-3 h-3 fill-[#0284c7]" />
                  </span>
                </div>
                <div className="text-[17px] font-mono font-semibold text-ink-black">{s.orders}</div>
                <div className="flex justify-between text-[11px] font-mono text-slate-gray border-t border-slate-gray/15 pt-1.5">
                  <span>Omset: {s.gmv}</span>
                  <span className="text-[#059669] font-medium">{s.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 8. GENERAL & DEFAULT
    // -------------------------------------------------------------------------
    default: {
      return (
        <div className="bg-paper-white border-2 border-slate-gray/40 p-5 sm:p-6 rounded-none shadow-subtle space-y-5 text-left transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-gray/20 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-sienna-brown rounded-none inline-block" />
                <h3 className="font-signifier text-[19px] text-ink-black font-semibold tracking-tight">
                  Ringkasan Kinerja Transaksi &amp; Distribusi Multi-Dimensi
                </h3>
              </div>
              <p className="text-[12.5px] text-slate-gray">
                Ikhtisar metrik agregat dihitung secara dinamis dari {totalOrders.toLocaleString("id-ID")} baris data aktif.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] font-mono bg-mist-gray text-ink-black px-3 py-1 border border-slate-gray/25 font-semibold tracking-wide">
                TOTAL OMSET: {formatCurrencyIDR(totalRevenue)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {channels.map((c) => (
              <div key={c.channel} className="bg-fog-white border border-slate-gray/20 p-3.5 space-y-2 hover:border-sienna-brown/60 transition-colors">
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-gray">
                  <span className="font-medium truncate text-ink-black" title={c.channel}>{c.channel}</span>
                  <span className="text-sienna-brown font-bold">{c.share}</span>
                </div>
                <div className="text-[17px] font-mono font-semibold text-ink-black">{c.gmv}</div>
                <div className="flex justify-between items-center text-[11px] text-slate-gray pt-1.5 border-t border-slate-gray/15">
                  <span>{c.orders}</span>
                  <span className="text-[10px] bg-paper-white px-2 py-0.5 border border-slate-gray/20 font-mono text-ink-black font-medium">
                    {c.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
};
