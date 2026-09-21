"use client";

import React, { useEffect, useState } from "react";
import type { AdminUserRecord, UserRole, AccountStatus } from "@/types/admin";
import type { PlanTierId } from "@/types/pricing";
import {
  Search,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  User,
  CheckCircle,
  XCircle,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";

export const AdminUsersTable: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [selectedTier, setSelectedTier] = useState<PlanTierId>("free");
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus>("active");
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        role: roleFilter,
        tier: tierFilter,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, tierFilter, statusFilter]);

  const handleOpenEdit = (user: AdminUserRecord) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setSelectedTier(user.planTier);
    setSelectedStatus(user.status);
    setCustomDiscount(user.customDiscountPercent || 0);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.uid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
        body: JSON.stringify({
          role: selectedRole,
          planTier: selectedTier,
          status: selectedStatus,
          customDiscountPercent: Number(customDiscount) || 0,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionSuccess(`Akun ${editingUser.email} berhasil diperbarui di database.`);
        setEditingUser(null);
        fetchUsers();
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch {
      // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: AdminUserRecord) => {
    if (!confirm(`Konfirmasi hapus akun ${user.email} dari database?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.uid}`, {
        method: "DELETE",
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });
      const json = await res.json();
      if (json.success) {
        setActionSuccess(`Pengguna ${user.email} berhasil dihapus.`);
        fetchUsers();
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch {
      // Error
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header & Success Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-gray/15">
        <div>
          <h2 className="font-signifier text-[24px] text-ink-black font-normal">
            Manajemen Akun &amp; Otorisasi Pengguna
          </h2>
          <p className="text-[13px] text-slate-gray">
            Kontrol role RBAC, paket layanan, status akun, dan diskon VIP langsung pada database.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-mono bg-paper-white hover:bg-mist-gray border border-slate-gray/30 text-ink-black transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-gray" />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-medium flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess(null)} className="text-emerald-800 hover:opacity-75 p-0.5 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-gray absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari email, nama, UID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
        >
          <option value="all">Semua Role</option>
          <option value="superadmin">Superadmin</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        {/* Tier Filter */}
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
          <option value="free">Free</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
        >
          <option value="all">Semua Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Data Table */}
      <div className="bg-paper-white border border-slate-gray/25 shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-fog-white border-b border-slate-gray/20 text-[11.5px] font-mono text-slate-gray uppercase tracking-wider">
              <th className="p-3.5">Akun Pengguna</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Paket Layanan</th>
              <th className="p-3.5">Diskon Khusus</th>
              <th className="p-3.5">Workspaces</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-gray/10 text-[13px]">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center font-mono text-slate-gray">
                  Membaca tabel pengguna dari database...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center font-mono text-slate-gray">
                  Tidak ada data pengguna yang cocok dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.uid} className="hover:bg-fog-white/60 transition">
                  <td className="p-3.5">
                    <div className="font-medium text-ink-black">{u.displayName || "Tanpa Nama"}</div>
                    <div className="text-[12px] font-mono text-slate-gray">{u.email}</div>
                    <div className="text-[10px] font-mono text-slate-gray/60">{u.uid}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono uppercase font-semibold ${
                        u.role === "superadmin"
                          ? "bg-purple-100 text-purple-900 border border-purple-300"
                          : u.role === "admin"
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : "bg-mist-gray text-slate-gray border border-slate-gray/20"
                      }`}
                    >
                      {u.role === "superadmin" && <ShieldCheck className="w-3 h-3 text-purple-700" />}
                      {u.role === "admin" && <Shield className="w-3 h-3 text-blue-700" />}
                      {u.role === "user" && <User className="w-3 h-3 text-slate-gray" />}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-mono uppercase font-bold ${
                        u.planTier === "business"
                          ? "bg-ink-black text-paper-white"
                          : u.planTier === "pro"
                          ? "bg-sienna-brown text-paper-white"
                          : u.planTier === "starter"
                          ? "bg-slate-gray text-paper-white"
                          : "bg-mist-gray text-slate-gray border border-slate-gray/30"
                      }`}
                    >
                      {u.planTier}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[12px]">
                    {u.customDiscountPercent ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                        -{u.customDiscountPercent}% VIP
                      </span>
                    ) : (
                      <span className="text-slate-gray">-</span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-[12px] text-slate-gray">
                    <div>{u.totalDashboards || 0} Dasbor</div>
                    <div className="text-[11px] text-slate-gray/70">
                      {(u.totalRowsProcessed || 0).toLocaleString("id-ID")} baris
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11.5px] font-mono ${
                        u.status === "active" ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {u.status === "active" ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span className="capitalize">{u.status}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        title="Edit Role & Layanan"
                        className="p-1.5 text-slate-gray hover:text-ink-black hover:bg-mist-gray border border-slate-gray/20 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u)}
                        title="Hapus Akun"
                        className="p-1.5 text-slate-gray hover:text-red-600 hover:bg-red-50 border border-slate-gray/20 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-3 bg-fog-white border-t border-slate-gray/15 flex items-center justify-between text-[12px] font-mono text-slate-gray">
          <span>Menampilkan {users.length} dari {total} total akun</span>
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

      {/* Edit User Modal Dialog */}
      {editingUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-xs antialiased overflow-y-auto"
        >
          <div
            className="relative w-full max-w-[500px] bg-paper-white border border-slate-gray/30 p-6 sm:p-8 shadow-subtle text-left transition-all max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Standard High-Visibility Close Button */}
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-none bg-mist-gray hover:bg-ink-black text-ink-black hover:text-paper-white border border-slate-gray/30 hover:border-ink-black transition-all cursor-pointer shadow-2xs group"
              aria-label="Tutup dialog"
            >
              <X className="w-4 h-4 stroke-[2.5] transition-transform group-hover:scale-110" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 mb-6 pb-4 border-b border-slate-gray/15">
              <div className="text-[11px] font-mono uppercase text-sienna-brown tracking-wider font-semibold">
                Kontrol Hak Akses &amp; Layanan
              </div>
              <h3 className="font-signifier text-[22px] font-normal text-ink-black">
                Edit Profil Akun Pengguna
              </h3>
              <p className="text-[13px] font-mono text-slate-gray">
                {editingUser.email} &bull; UID: {editingUser.uid}
              </p>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-mono font-medium text-slate-gray">
                  Hak Akses / Role RBAC:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
                >
                  <option value="user">User Biasa</option>
                  <option value="admin">Administrator</option>
                  <option value="superadmin">Superadmin (Akses Penuh)</option>
                </select>
              </div>

              {/* Plan Tier Select */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-mono font-medium text-slate-gray">
                  Paket Langganan Layanan:
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as PlanTierId)}
                  className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
                >
                  <option value="free">Free (Gratis)</option>
                  <option value="starter">Starter (Rp 49.000 / bln)</option>
                  <option value="pro">Pro (Rp 149.000 / bln)</option>
                  <option value="business">Business (Rp 499.000 / bln)</option>
                </select>
              </div>

              {/* Custom Discount Override */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-mono font-medium text-slate-gray">
                  Diskon Khusus VIP (% Potongan Harga Tambahan):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
                  />
                  <span className="font-mono text-slate-gray text-[14px]">%</span>
                </div>
                <p className="text-[11px] text-slate-gray">
                  Diskon ini akan otomatis memotong harga saat pengguna melakukan upgrade langganan.
                </p>
              </div>

              {/* Account Status Toggle */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-mono font-medium text-slate-gray">
                  Status Operasional Akun:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as AccountStatus)}
                  className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
                >
                  <option value="active">Active (Normal)</option>
                  <option value="suspended">Suspended (Bekukan Akun)</option>
                  <option value="banned">Banned (Blokir Permanen)</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-gray/15 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-gray/30 text-slate-gray hover:text-ink-black text-[13px] font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-ink-black hover:bg-slate-gray text-paper-white text-[13px] font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan ke DB..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
