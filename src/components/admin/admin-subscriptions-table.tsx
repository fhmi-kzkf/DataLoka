"use client";

import React, { useEffect, useState } from "react";
import type { AdminSubscriptionRecord } from "@/types/admin";
import { formatRupiah } from "@/lib/formatters";
import {
  Search,
  CreditCard,
  CheckCircle,
  Clock,
  RotateCcw,
  RefreshCw,
  QrCode,
  Building,
  X,
} from "lucide-react";

export const AdminSubscriptionsTable: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        status: statusFilter,
        tier: tierFilter,
      });

      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`, {
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });
      const json = await res.json();
      if (json.success) {
        setSubscriptions(json.data.subscriptions);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, search, statusFilter, tierFilter]);

  const handleExtend = async (sub: AdminSubscriptionRecord) => {
    const currentExp = new Date(sub.expiresAt);
    currentExp.setDate(currentExp.getDate() + 30);
    const newExpires = currentExp.toISOString();

    try {
      const res = await fetch(`/api/admin/subscriptions/${sub.invoiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
        body: JSON.stringify({
          expiresAt: newExpires,
          status: "active",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionAlert(`Masa aktif langganan ${sub.invoiceId} berhasil diperpanjang 30 hari.`);
        fetchSubscriptions();
        setTimeout(() => setActionAlert(null), 3500);
      }
    } catch {
      // Error
    }
  };

  const handleRefund = async (sub: AdminSubscriptionRecord) => {
    if (!confirm(`Konfirmasi refund transaksi ${sub.invoiceId} senilai ${formatRupiah(sub.amountPaid)}?`)) return;

    try {
      const res = await fetch(`/api/admin/subscriptions/${sub.invoiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
        body: JSON.stringify({
          status: "refunded",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionAlert(`Transaksi ${sub.invoiceId} telah ditandai sebagai Refund.`);
        fetchSubscriptions();
        setTimeout(() => setActionAlert(null), 3500);
      }
    } catch {
      // Error
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-gray/15">
        <div>
          <h2 className="font-signifier text-[24px] text-ink-black font-normal">
            Layanan &amp; Riwayat Transaksi Langganan
          </h2>
          <p className="text-[13px] text-slate-gray">
            Rekam jejak invoice resmi, kode kupon yang digunakan, metode pembayaran, dan masa aktif lisensi.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSubscriptions}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-mono bg-paper-white hover:bg-mist-gray border border-slate-gray/30 text-ink-black transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-gray" />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-medium flex items-center justify-between">
          <span>{actionAlert}</span>
          <button type="button" onClick={() => setActionAlert(null)} className="text-emerald-800 hover:opacity-75 p-0.5 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-gray absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Invoice ID, email pelanggan, kupon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => {
            setTierFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
        >
          <option value="all">Semua Paket</option>
          <option value="business">Business</option>
          <option value="pro">Pro</option>
          <option value="starter">Starter</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
        >
          <option value="all">Semua Status</option>
          <option value="paid">Paid / Lunas</option>
          <option value="active">Active</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-paper-white border border-slate-gray/25 shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-fog-white border-b border-slate-gray/20 text-[11.5px] font-mono text-slate-gray uppercase tracking-wider">
              <th className="p-3.5">Invoice ID &amp; Tanggal</th>
              <th className="p-3.5">Pelanggan</th>
              <th className="p-3.5">Paket &amp; Siklus</th>
              <th className="p-3.5">Kupon / Diskon</th>
              <th className="p-3.5">Nominal Bayar</th>
              <th className="p-3.5">Metode Bayar</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-gray/10 text-[13px]">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center font-mono text-slate-gray">
                  Membaca riwayat transaksi dari database...
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center font-mono text-slate-gray">
                  Tidak ada transaksi yang sesuai.
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.invoiceId} className="hover:bg-fog-white/60 transition">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-ink-black">{sub.invoiceId}</div>
                    <div className="text-[11px] font-mono text-slate-gray">
                      {new Date(sub.paymentDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-[12.5px] font-mono text-ink-black">{sub.userEmail}</div>
                    <div className="text-[10px] font-mono text-slate-gray/60">{sub.uid}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono font-semibold uppercase text-ink-black">{sub.tier}</span>
                    <span className="text-[11px] font-mono text-slate-gray block capitalize">
                      {sub.billingCycle === "annual" ? "Tahunan" : "Bulanan"}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[12px]">
                    {sub.discountCode ? (
                      <div>
                        <span className="bg-sienna-brown/10 text-sienna-brown px-1.5 py-0.5 border border-sienna-brown/20 font-bold">
                          {sub.discountCode}
                        </span>
                        <div className="text-[11px] text-emerald-700 mt-0.5">
                          -{formatRupiah(sub.discountAmount)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-gray">-</span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-ink-black">
                    {formatRupiah(sub.amountPaid)}
                  </td>
                  <td className="p-3.5 text-[12px] font-mono text-slate-gray">
                    <div className="flex items-center gap-1.5 text-ink-black">
                      {sub.paymentMethod.toLowerCase().includes("qris") ? (
                        <QrCode className="w-3.5 h-3.5 text-sienna-brown" />
                      ) : sub.paymentMethod.toLowerCase().includes("bca") || sub.paymentMethod.toLowerCase().includes("virtual") ? (
                        <Building className="w-3.5 h-3.5 text-blue-700" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-slate-gray" />
                      )}
                      <span>{sub.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono uppercase font-semibold ${
                        sub.status === "paid" || sub.status === "active"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {sub.status === "paid" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{sub.status}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleExtend(sub)}
                        title="Perpanjang +30 Hari"
                        className="px-2 py-1 text-[11px] font-mono border border-slate-gray/20 hover:border-ink-black bg-paper-white hover:bg-mist-gray transition cursor-pointer"
                      >
                        +30 Hari
                      </button>
                      {sub.status !== "refunded" && (
                        <button
                          type="button"
                          onClick={() => handleRefund(sub)}
                          title="Refund Transaksi"
                          className="p-1 text-slate-gray hover:text-red-600 hover:bg-red-50 border border-slate-gray/20 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-3 bg-fog-white border-t border-slate-gray/15 flex items-center justify-between text-[12px] font-mono text-slate-gray">
          <span>Menampilkan {subscriptions.length} dari {total} total transaksi</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 bg-paper-white border border-slate-gray/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-mist-gray"
            >
              Sebelumnya
            </button>
            <span className="px-2">Halaman {page} / {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 bg-paper-white border border-slate-gray/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-mist-gray"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
