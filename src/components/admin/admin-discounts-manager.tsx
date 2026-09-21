"use client";

import React, { useEffect, useState } from "react";
import type { AdminDiscountRecord, DiscountType } from "@/types/admin";
import type { PlanTierId } from "@/types/pricing";
import { formatRupiah } from "@/lib/formatters";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  X,
  RefreshCw,
  Percent,
  Coins,
  Sparkles,
} from "lucide-react";

export const AdminDiscountsManager: React.FC = () => {
  const [discounts, setDiscounts] = useState<AdminDiscountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [applicableTiers, setApplicableTiers] = useState<string>("all");
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [validDays, setValidDays] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Instant Tester State
  const [testCode, setTestCode] = useState("");
  const [testTier, setTestTier] = useState<PlanTierId>("pro");
  const [testPrice, setTestPrice] = useState<number>(149000);
  const [testResult, setTestResult] = useState<{
    valid?: boolean;
    discountAmount?: number;
    finalPrice?: number;
    message?: string;
  } | null>(null);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/discounts", {
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });
      const json = await res.json();
      if (json.success) {
        setDiscounts(json.data);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsSubmitting(true);

    const now = new Date();
    const until = new Date(now.getTime() + validDays * 24 * 3600 * 1000);

    const payload = {
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue: Number(discountValue),
      applicableTiers: applicableTiers === "all" ? ("all" as const) : [applicableTiers as PlanTierId],
      usageLimit: Number(usageLimit),
      isActive: true,
      validFrom: now.toISOString(),
      validUntil: until.toISOString(),
      createdBy: "founder@dataloka.id",
    };

    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setActionAlert(`Kupon diskon ${payload.code} berhasil disimpan ke database.`);
        setModalOpen(false);
        setCode("");
        setDescription("");
        fetchDiscounts();
        setTimeout(() => setActionAlert(null), 3500);
      }
    } catch {
      // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (disc: AdminDiscountRecord) => {
    try {
      const res = await fetch(`/api/admin/discounts/${disc.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
        body: JSON.stringify({
          isActive: !disc.isActive,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionAlert(`Status kupon ${disc.code} diubah menjadi: ${!disc.isActive ? "Aktif" : "Nonaktif"}.`);
        fetchDiscounts();
        setTimeout(() => setActionAlert(null), 3000);
      }
    } catch {
      // Error
    }
  };

  const handleDeleteDiscount = async (disc: AdminDiscountRecord) => {
    if (!confirm(`Hapus kupon diskon ${disc.code} dari database?`)) return;

    try {
      const res = await fetch(`/api/admin/discounts/${disc.id}`, {
        method: "DELETE",
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });

      const json = await res.json();
      if (json.success) {
        setActionAlert(`Kupon ${disc.code} berhasil dihapus.`);
        fetchDiscounts();
        setTimeout(() => setActionAlert(null), 3000);
      }
    } catch {
      // Error
    }
  };

  const handleTestDiscount = async () => {
    if (!testCode.trim()) return;
    try {
      const res = await fetch("/api/admin/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: testCode,
          tier: testTier,
          billingCycle: "monthly",
          originalPrice: testPrice,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTestResult(json.data);
      }
    } catch {
      // Error
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-gray/15">
        <div>
          <h2 className="font-signifier text-[24px] text-ink-black font-normal">
            Kelola Kupon Diskon &amp; Skema Promosi
          </h2>
          <p className="text-[13px] text-slate-gray">
            Buat kode promo baru, tentukan persentase/potongan harga langsung, batas kuota, dan masa berlaku.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDiscounts}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-mono bg-paper-white hover:bg-mist-gray border border-slate-gray/30 text-ink-black transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-gray" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-mono bg-ink-black hover:bg-slate-gray text-paper-white transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-sienna-brown" />
            <span>Buat Kupon Baru</span>
          </button>
        </div>
      </div>

      {actionAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-medium flex items-center justify-between">
          <span>{actionAlert}</span>
          <button type="button" onClick={() => setActionAlert(null)} className="text-emerald-800 hover:opacity-75 p-0.5 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Discounts Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center font-mono text-slate-gray">
            Membaca data kupon dari database...
          </div>
        ) : discounts.length === 0 ? (
          <div className="col-span-full p-8 text-center font-mono text-slate-gray bg-fog-white border border-slate-gray/20">
            Belum ada kode kupon diskon aktif di database. Klik tombol &ldquo;Buat Kupon Baru&rdquo; di atas.
          </div>
        ) : (
          discounts.map((disc) => (
            <div
              key={disc.id}
              className={`p-5 bg-paper-white border ${
                disc.isActive ? "border-slate-gray/30 shadow-2xs" : "border-slate-gray/15 opacity-60 bg-fog-white/60"
              } space-y-3 relative`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[16px] font-bold text-sienna-brown tracking-wider bg-sienna-brown/10 px-2 py-0.5 border border-sienna-brown/20">
                    {disc.code}
                  </span>
                  <div className="text-[12px] text-slate-gray mt-1.5 line-clamp-2">
                    {disc.description || "Diskon layanan"}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10.5px] font-mono uppercase font-bold ${
                    disc.isActive
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-mist-gray text-slate-gray border border-slate-gray/20"
                  }`}
                >
                  {disc.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              {/* Discount Value Display */}
              <div className="p-3 bg-fog-white border border-slate-gray/15 flex items-center justify-between font-mono">
                <span className="text-[12px] text-slate-gray">Nilai Diskon:</span>
                <span className="text-[15px] font-bold text-ink-black">
                  {disc.discountType === "percentage" ? (
                    <span className="flex items-center gap-1 text-sienna-brown">
                      <Percent className="w-3.5 h-3.5" />
                      {disc.discountValue}% OFF
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Coins className="w-3.5 h-3.5" />
                      Potongan {formatRupiah(disc.discountValue)}
                    </span>
                  )}
                </span>
              </div>

              {/* Details & Limits */}
              <div className="space-y-1 text-[11.5px] font-mono text-slate-gray">
                <div className="flex justify-between">
                  <span>Paket Berlaku:</span>
                  <span className="font-semibold text-ink-black uppercase">
                    {Array.isArray(disc.applicableTiers) ? disc.applicableTiers.join(", ") : "Semua Paket"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Penggunaan:</span>
                  <span className="font-semibold text-ink-black">
                    {disc.usageCount} / {disc.usageLimit > 0 ? disc.usageLimit : "∞"} kuota
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Berlaku Hingga:</span>
                  <span>{new Date(disc.validUntil).toLocaleDateString("id-ID")}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-gray/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(disc)}
                  className="text-[11.5px] font-mono text-slate-gray hover:text-ink-black underline cursor-pointer"
                >
                  {disc.isActive ? "Nonaktifkan" : "Aktifkan"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDiscount(disc)}
                  className="p-1.5 text-slate-gray hover:text-red-600 hover:bg-red-50 border border-slate-gray/20 transition cursor-pointer"
                  title="Hapus Kupon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Instant Coupon Simulator & Validator */}
      <div className="p-6 bg-paper-white border border-slate-gray/25 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-gray/15 pb-3">
          <Sparkles className="w-4 h-4 text-sienna-brown" />
          <h3 className="font-signifier text-[17px] text-ink-black font-normal">
            Simulator Validasi Kupon Diskon Real-Time
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11.5px] font-mono text-slate-gray block mb-1">Kode Kupon:</label>
            <input
              type="text"
              placeholder="Contoh: DATALOKA50"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[11.5px] font-mono text-slate-gray block mb-1">Target Paket:</label>
            <select
              value={testTier}
              onChange={(e) => setTestTier(e.target.value as PlanTierId)}
              className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
            >
              <option value="starter">Starter (Rp 49.000)</option>
              <option value="pro">Pro (Rp 149.000)</option>
              <option value="business">Business (Rp 499.000)</option>
            </select>
          </div>

          <div>
            <label className="text-[11.5px] font-mono text-slate-gray block mb-1">Harga Awal:</label>
            <input
              type="number"
              value={testPrice}
              onChange={(e) => setTestPrice(Number(e.target.value))}
              className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleTestDiscount}
              className="w-full py-2 bg-ink-black hover:bg-slate-gray text-paper-white text-[13px] font-medium font-mono cursor-pointer transition"
            >
              Uji Kueri Kupon
            </button>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-4 border font-mono text-[13px] space-y-1.5 ${
              testResult.valid ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-red-50 border-red-300 text-red-900"
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {testResult.valid ? <CheckCircle className="w-4 h-4 text-emerald-700" /> : <XCircle className="w-4 h-4 text-red-700" />}
              <span>{testResult.message}</span>
            </div>
            {testResult.valid && (
              <div className="text-[12px] pt-1 flex gap-4 text-emerald-800">
                <span>Harga Asli: {formatRupiah(testPrice)}</span>
                <span>Potongan: -{formatRupiah(testResult.discountAmount || 0)}</span>
                <span className="font-bold">Total Akhir: {formatRupiah(testResult.finalPrice || 0)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal Dialog */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-xs antialiased overflow-y-auto"
        >
          <div
            className="relative w-full max-w-[520px] bg-paper-white border border-slate-gray/30 p-6 sm:p-8 shadow-subtle text-left transition-all max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Standard High-Visibility Close Button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-none bg-mist-gray hover:bg-ink-black text-ink-black hover:text-paper-white border border-slate-gray/30 hover:border-ink-black transition-all cursor-pointer shadow-2xs group"
              aria-label="Tutup dialog"
            >
              <X className="w-4 h-4 stroke-[2.5] transition-transform group-hover:scale-110" />
            </button>

            {/* Header */}
            <div className="space-y-1 mb-6 pb-4 border-b border-slate-gray/15">
              <div className="text-[11px] font-mono uppercase text-sienna-brown tracking-wider font-semibold">
                Konfigurasi Harga &amp; Promosi
              </div>
              <h3 className="font-signifier text-[22px] font-normal text-ink-black">
                Buat Kode Kupon Diskon Baru
              </h3>
              <p className="text-[13px] text-slate-gray">
                Kode diskon ini akan langsung disimpan dan diverifikasi oleh database query engine.
              </p>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[12px] font-mono font-medium text-slate-gray">
                  Kode Promo (Uppercase):
                </label>
                <input
                  type="text"
                  required
                  placeholder="MISAL: DISKON50, PROMO2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono font-bold uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12px] font-mono font-medium text-slate-gray">
                  Deskripsi Singkat:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Promo Diskon 50% Peluncuran"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-mono font-medium text-slate-gray">
                    Tipe Diskon:
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal Tetap (Rp)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-mono font-medium text-slate-gray">
                    Nilai Diskon:
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-mono font-medium text-slate-gray">
                    Berlaku Untuk:
                  </label>
                  <select
                    value={applicableTiers}
                    onChange={(e) => setApplicableTiers(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
                  >
                    <option value="all">Semua Paket</option>
                    <option value="starter">Paket Starter</option>
                    <option value="pro">Paket Pro</option>
                    <option value="business">Paket Business</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-mono font-medium text-slate-gray">
                    Batas Penggunaan (Kuota):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12px] font-mono font-medium text-slate-gray">
                  Masa Berlaku (Hari dari sekarang):
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={validDays}
                  onChange={(e) => setValidDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-[13px] bg-paper-white border border-slate-gray/30 focus:border-ink-black outline-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-gray/15 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-gray/30 text-slate-gray hover:text-ink-black text-[13px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-ink-black hover:bg-slate-gray text-paper-white text-[13px] font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan ke DB..." : "Simpan Kupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
