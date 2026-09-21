"use client";

import React, { useEffect, useState } from "react";
import type { AdminWorkspaceRecord } from "@/types/admin";
import {
  Search,
  Folder,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  X,
} from "lucide-react";

export const AdminWorkspacesTable: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<AdminWorkspaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
      });

      const res = await fetch(`/api/admin/workspaces?${params.toString()}`, {
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });
      const json = await res.json();
      if (json.success) {
        setWorkspaces(json.data.workspaces);
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
    fetchWorkspaces();
  }, [page, search]);

  const handleDelete = async (ws: AdminWorkspaceRecord) => {
    if (!confirm(`Konfirmasi hapus workspace "${ws.title}" milik ${ws.userEmail}?`)) return;

    try {
      const res = await fetch(`/api/admin/workspaces/${ws.id}`, {
        method: "DELETE",
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });

      const json = await res.json();
      if (json.success) {
        setActionAlert(`Workspace "${ws.title}" berhasil dihapus.`);
        fetchWorkspaces();
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
            Monitoring &amp; Tata Kelola Cloud Workspaces
          </h2>
          <p className="text-[13px] text-slate-gray">
            Daftar seluruh snapshot dasbor, dataset, dan analitik yang disimpan pengguna di cloud.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchWorkspaces}
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

      {/* Search */}
      <div className="max-w-[400px]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-gray absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul dasbor, dataset, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
          />
        </div>
      </div>

      {/* Workspaces Table */}
      <div className="bg-paper-white border border-slate-gray/25 shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-fog-white border-b border-slate-gray/20 text-[11.5px] font-mono text-slate-gray uppercase tracking-wider">
              <th className="p-3.5">Judul Dasbor &amp; Subtitle</th>
              <th className="p-3.5">Pemilik Akun</th>
              <th className="p-3.5">Nama Dataset</th>
              <th className="p-3.5">Ukuran Baris / Kolom</th>
              <th className="p-3.5">Template</th>
              <th className="p-3.5">Terakhir Disimpan</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-gray/10 text-[13px]">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center font-mono text-slate-gray">
                  Membaca daftar workspaces dari database...
                </td>
              </tr>
            ) : workspaces.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center font-mono text-slate-gray">
                  Tidak ada cloud workspace yang ditemukan.
                </td>
              </tr>
            ) : (
              workspaces.map((ws) => (
                <tr key={ws.id} className="hover:bg-fog-white/60 transition">
                  <td className="p-3.5">
                    <div className="font-medium text-ink-black flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-sienna-brown shrink-0" />
                      <span>{ws.title}</span>
                    </div>
                    <div className="text-[11.5px] text-slate-gray line-clamp-1 mt-0.5">
                      {ws.subtitle || "Tanpa deskripsi"}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-[12px] font-mono text-ink-black">{ws.userEmail}</div>
                    <div className="text-[10px] font-mono text-slate-gray/60">{ws.userId}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 text-[12px] font-mono text-slate-gray">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[160px]">{ws.datasetName}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[12px] text-ink-black">
                    <div>{ws.rowCount.toLocaleString("id-ID")} baris</div>
                    <div className="text-[11px] text-slate-gray">{ws.columnCount} kolom</div>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[11px] font-mono bg-mist-gray px-2 py-0.5 border border-slate-gray/20 text-slate-gray uppercase">
                      {ws.templateId}
                    </span>
                  </td>
                  <td className="p-3.5 text-[12px] font-mono text-slate-gray">
                    {new Date(ws.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(ws)}
                      title="Hapus Workspace"
                      className="p-1.5 text-slate-gray hover:text-red-600 hover:bg-red-50 border border-slate-gray/20 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-3 bg-fog-white border-t border-slate-gray/15 flex items-center justify-between text-[12px] font-mono text-slate-gray">
          <span>Menampilkan {workspaces.length} dari {total} total workspaces</span>
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
