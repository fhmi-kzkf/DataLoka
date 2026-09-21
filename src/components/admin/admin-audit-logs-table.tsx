"use client";

import React, { useEffect, useState } from "react";
import type { AdminAuditLogRecord } from "@/types/admin";
import {
  Search,
  ShieldCheck,
  FileText,
  Clock,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";

export const AdminAuditLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogRecord | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        search,
        action: actionFilter,
      });

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });
      const json = await res.json();
      if (json.success) {
        setLogs(json.data.logs);
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
    fetchLogs();
  }, [page, search, actionFilter]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-gray/15">
        <div>
          <h2 className="font-signifier text-[24px] text-ink-black font-normal">
            Log Audit Aktivitas &amp; Keamanan Administratif
          </h2>
          <p className="text-[13px] text-slate-gray">
            Rekam jejak kepatuhan, mutasi akun pengguna, kupon diskon, dan tindakan administratif dengan timestamp &amp; IP.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-mono bg-paper-white hover:bg-mist-gray border border-slate-gray/30 text-ink-black transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-gray" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[600px]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-gray absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aktor, resource, aksi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
        >
          <option value="all">Semua Jenis Aksi</option>
          <option value="USER_ROLE_UPDATE">USER_ROLE_UPDATE</option>
          <option value="USER_TIER_UPDATE">USER_TIER_UPDATE</option>
          <option value="USER_STATUS_UPDATE">USER_STATUS_UPDATE</option>
          <option value="USER_CUSTOM_DISCOUNT">USER_CUSTOM_DISCOUNT</option>
          <option value="DISCOUNT_CREATE">DISCOUNT_CREATE</option>
          <option value="DISCOUNT_UPDATE">DISCOUNT_UPDATE</option>
          <option value="DISCOUNT_DELETE">DISCOUNT_DELETE</option>
          <option value="SUBSCRIPTION_EXTEND">SUBSCRIPTION_EXTEND</option>
          <option value="SUBSCRIPTION_REFUND">SUBSCRIPTION_REFUND</option>
          <option value="WORKSPACE_DELETE">WORKSPACE_DELETE</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-paper-white border border-slate-gray/25 shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-fog-white border-b border-slate-gray/20 text-[11.5px] font-mono text-slate-gray uppercase tracking-wider">
              <th className="p-3.5">Timestamp (WIB)</th>
              <th className="p-3.5">Aktor (Admin)</th>
              <th className="p-3.5">Jenis Aksi</th>
              <th className="p-3.5">Target Resource</th>
              <th className="p-3.5">IP Address</th>
              <th className="p-3.5 text-right">Rincian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-gray/10 text-[13px]">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center font-mono text-slate-gray">
                  Membaca riwayat log audit dari database...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center font-mono text-slate-gray">
                  Tidak ada rekaman log audit yang cocok.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-fog-white/60 transition font-mono">
                  <td className="p-3.5 text-[12px] text-slate-gray whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="p-3.5 text-[12.5px] font-medium text-ink-black">
                    <div>{log.actorEmail}</div>
                    <div className="text-[10px] text-slate-gray/60">{log.actorUid}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase ${
                        log.action.includes("DELETE") || log.action.includes("REFUND")
                          ? "bg-red-100 text-red-900 border border-red-300"
                          : log.action.includes("DISCOUNT")
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-blue-100 text-blue-900 border border-blue-300"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-[12px] text-slate-gray max-w-[240px] truncate">
                    {log.targetResource}
                  </td>
                  <td className="p-3.5 text-[12px] text-slate-gray">
                    {log.ipAddress}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 text-slate-gray hover:text-ink-black hover:bg-mist-gray border border-slate-gray/20 transition cursor-pointer"
                      title="Lihat Rincian Payload Diff"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-3 bg-fog-white border-t border-slate-gray/15 flex items-center justify-between text-[12px] font-mono text-slate-gray">
          <span>Menampilkan {logs.length} dari {total} total rekam jejak</span>
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

      {/* JSON Diff Inspector Modal */}
      {selectedLog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-xs antialiased overflow-y-auto"
        >
          <div
            className="relative w-full max-w-[620px] bg-paper-white border border-slate-gray/30 p-6 sm:p-8 shadow-subtle text-left transition-all max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Standard High-Visibility Close Button */}
            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-none bg-mist-gray hover:bg-ink-black text-ink-black hover:text-paper-white border border-slate-gray/30 hover:border-ink-black transition-all cursor-pointer shadow-2xs group"
              aria-label="Tutup dialog"
            >
              <X className="w-4 h-4 stroke-[2.5] transition-transform group-hover:scale-110" />
            </button>

            {/* Header */}
            <div className="space-y-1 mb-6 pb-4 border-b border-slate-gray/15">
              <div className="text-[11px] font-mono uppercase text-sienna-brown tracking-wider font-semibold">
                Rincian Log Audit Keamanan
              </div>
              <h3 className="font-signifier text-[22px] font-normal text-ink-black">
                Payload &amp; Mutasi State Database
              </h3>
              <p className="text-[12.5px] font-mono text-slate-gray">
                ID: {selectedLog.id} &bull; Aksi: {selectedLog.action}
              </p>
            </div>

            <div className="space-y-3 font-mono text-[12px]">
              <div className="bg-fog-white p-3 border border-slate-gray/20 space-y-1">
                <div><strong>Aktor:</strong> {selectedLog.actorEmail} ({selectedLog.actorUid})</div>
                <div><strong>Target:</strong> {selectedLog.targetResource}</div>
                <div><strong>Waktu:</strong> {selectedLog.timestamp}</div>
                <div><strong>IP:</strong> {selectedLog.ipAddress}</div>
              </div>

              <div>
                <span className="text-slate-gray block mb-1">State Snapshot / Perubahan:</span>
                <pre className="p-4 bg-ink-black text-paper-white text-[11.5px] overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-gray/15 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-ink-black hover:bg-slate-gray text-paper-white text-[13px] font-medium"
              >
                Tutup Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
