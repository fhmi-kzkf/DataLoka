"use client";

import React, { useEffect, useState } from "react";
import type { AdminPlatformStats } from "@/types/admin";
import { formatRupiah } from "@/lib/formatters";
import {
  TrendingUp,
  Users,
  Folder,
  Sparkles,
  CreditCard,
  Tag,
  ShieldCheck,
  RefreshCw,
  Server,
  Layers,
} from "lucide-react";

export const AdminStatsOverview: React.FC = () => {
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      } else {
        setError(json.error?.message || "Gagal memuat statistik database");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Koneksi ke endpoint stats terputus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-[13px] text-slate-gray">
        <div className="inline-block w-5 h-5 border-2 border-sienna-brown border-t-transparent rounded-full animate-spin mb-3" />
        <div>Mengkalkulasi agregasi data live langsung dari database...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 space-y-3">
        <p className="font-semibold text-[14px]">Terjadi kendala saat membaca kueri database:</p>
        <p className="font-mono text-[12px]">{error}</p>
        <button
          type="button"
          onClick={fetchStats}
          className="px-3 py-1.5 bg-red-600 text-white text-[12px] font-medium"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Refresh Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-gray/15">
        <div>
          <h2 className="font-signifier text-[24px] text-ink-black font-normal">
            Metrik &amp; Kinerja Platform Real-Time
          </h2>
          <p className="text-[13px] text-slate-gray">
            Kueri komputasi langsung dari tabel pengguna, transaksi, kupon, dan cloud workspaces.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-mono bg-paper-white hover:bg-mist-gray border border-slate-gray/30 text-ink-black transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-gray" />
          <span>Kueri Ulang DB</span>
        </button>
      </div>

      {/* Primary KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: MRR & ARR */}
        <div className="bg-paper-white border border-slate-gray/25 p-5 space-y-3 shadow-2xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-gray tracking-wider">
              Pendapatan Berulang (MRR)
            </span>
            <div className="w-7 h-7 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-signifier text-[26px] text-ink-black font-normal tracking-tight">
              {formatRupiah(stats.mrr)}
            </div>
            <div className="text-[11.5px] font-mono text-emerald-700 mt-1">
              ARR: {formatRupiah(stats.arr)} / tahun
            </div>
          </div>
          <div className="text-[11px] text-slate-gray border-t border-slate-gray/10 pt-2 flex justify-between">
            <span>Langganan Berbayar:</span>
            <span className="font-mono text-ink-black font-semibold">{stats.activeSubscriptions} Akun</span>
          </div>
        </div>

        {/* Card 2: Total Registered Users */}
        <div className="bg-paper-white border border-slate-gray/25 p-5 space-y-3 shadow-2xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-gray tracking-wider">
              Total Pengguna Terdaftar
            </span>
            <div className="w-7 h-7 bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-signifier text-[26px] text-ink-black font-normal tracking-tight">
              {stats.totalUsers}
            </div>
            <div className="text-[11.5px] font-mono text-slate-gray mt-1">
              {stats.tierBreakdown.pro + stats.tierBreakdown.business} Pro &amp; Business
            </div>
          </div>
          <div className="text-[11px] text-slate-gray border-t border-slate-gray/10 pt-2 flex justify-between">
            <span>Paket Starter:</span>
            <span className="font-mono text-ink-black font-semibold">{stats.tierBreakdown.starter} Akun</span>
          </div>
        </div>

        {/* Card 3: Cloud Workspaces & Data Volume */}
        <div className="bg-paper-white border border-slate-gray/25 p-5 space-y-3 shadow-2xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-gray tracking-wider">
              Cloud Workspaces
            </span>
            <div className="w-7 h-7 bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Folder className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-signifier text-[26px] text-ink-black font-normal tracking-tight">
              {stats.totalWorkspaces}
            </div>
            <div className="text-[11.5px] font-mono text-slate-gray mt-1">
              {stats.totalRowsProcessed.toLocaleString("id-ID")} Baris Data
            </div>
          </div>
          <div className="text-[11px] text-slate-gray border-t border-slate-gray/10 pt-2 flex justify-between">
            <span>Rata-rata/Workspace:</span>
            <span className="font-mono text-ink-black font-semibold">
              {stats.totalWorkspaces > 0
                ? Math.round(stats.totalRowsProcessed / stats.totalWorkspaces).toLocaleString("id-ID")
                : 0} baris
            </span>
          </div>
        </div>

        {/* Card 4: AI Queries & Discounts */}
        <div className="bg-paper-white border border-slate-gray/25 p-5 space-y-3 shadow-2xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-gray tracking-wider">
              Inferensi Tanya Data AI
            </span>
            <div className="w-7 h-7 bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-signifier text-[26px] text-ink-black font-normal tracking-tight">
              {stats.totalAiQueries.toLocaleString("id-ID")}
            </div>
            <div className="text-[11.5px] font-mono text-slate-gray mt-1">
              Kueri Analisis Selesai
            </div>
          </div>
          <div className="text-[11px] text-slate-gray border-t border-slate-gray/10 pt-2 flex justify-between">
            <span>Kupon Diskon Aktif:</span>
            <span className="font-mono text-sienna-brown font-semibold">{stats.activeDiscountsCount} Kode</span>
          </div>
        </div>
      </div>

      {/* Secondary Details: Breakdown by Tier & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <div className="bg-paper-white border border-slate-gray/25 p-6 space-y-4 shadow-2xs text-left">
          <div className="flex items-center gap-2 border-b border-slate-gray/15 pb-3">
            <Layers className="w-4 h-4 text-sienna-brown" />
            <h3 className="font-signifier text-[17px] text-ink-black font-normal">
              Distribusi Paket Pengguna
            </h3>
          </div>

          <div className="space-y-3">
            {[
              { tier: "Business", count: stats.tierBreakdown.business, color: "bg-ink-black" },
              { tier: "Pro", count: stats.tierBreakdown.pro, color: "bg-sienna-brown" },
              { tier: "Starter", count: stats.tierBreakdown.starter, color: "bg-slate-gray" },
              { tier: "Free", count: stats.tierBreakdown.free, color: "bg-slate-gray/40" },
            ].map((item) => {
              const pct = stats.totalUsers > 0 ? Math.round((item.count / stats.totalUsers) * 100) : 0;
              return (
                <div key={item.tier} className="space-y-1">
                  <div className="flex justify-between text-[12.5px] font-mono">
                    <span className="font-medium text-ink-black">{item.tier}</span>
                    <span className="text-slate-gray">{item.count} Akun ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-mist-gray overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Payment Method & System Health */}
        <div className="bg-paper-white border border-slate-gray/25 p-6 space-y-4 shadow-2xs text-left">
          <div className="flex items-center gap-2 border-b border-slate-gray/15 pb-3">
            <CreditCard className="w-4 h-4 text-sienna-brown" />
            <h3 className="font-signifier text-[17px] text-ink-black font-normal">
              Realisasi Pembayaran &amp; Status Infrastruktur
            </h3>
          </div>

          <div className="space-y-3 text-[13px] font-mono">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-gray/10">
              <span className="text-slate-gray">QRIS (Gopay/OVO/ShopeePay):</span>
              <span className="font-semibold text-ink-black">{formatRupiah(stats.revenueByMethod.qris)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-gray/10">
              <span className="text-slate-gray">Virtual Account (BCA/Mandiri/BRI):</span>
              <span className="font-semibold text-ink-black">{formatRupiah(stats.revenueByMethod.virtual_account)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-gray/10">
              <span className="text-slate-gray">Kartu Kredit / Debit Online:</span>
              <span className="font-semibold text-ink-black">{formatRupiah(stats.revenueByMethod.credit_card)}</span>
            </div>

            <div className="pt-2 flex items-center justify-between text-[12px] bg-fog-white p-3 border border-slate-gray/20">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-gray">Database State:</span>
                <span className="font-bold text-emerald-700 uppercase">{stats.systemHealth.dbStatus}</span>
              </div>
              <span className="text-slate-gray">Latensi: {stats.systemHealth.latencyMs}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
