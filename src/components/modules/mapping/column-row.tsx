import React from "react";
import type { ColumnMetadata, DataType, SemanticRole } from "@/types/mapping";
import { ConfidenceIndicator } from "./confidence-indicator";
import { cn } from "@/lib/utils";

export interface ColumnRowProps {
  column: ColumnMetadata;
  onTypeChange: (type: DataType) => void;
  onRoleChange?: (role: SemanticRole) => void;
  className?: string;
}

export function ColumnRow({ column, onTypeChange, className }: ColumnRowProps) {
  const typeOptions: { value: DataType; label: string }[] = [
    { value: "numeric", label: "Angka (Numeric)" },
    { value: "currency", label: "Mata Uang (Rupiah/IDR)" },
    { value: "datetime", label: "Tanggal & Waktu" },
    { value: "categorical", label: "Kategori (Teks Terbatas)" },
    { value: "text", label: "Teks Bebas" },
    { value: "percentage", label: "Persentase (%)" },
    { value: "geolocation", label: "Lokasi / Kota" },
    { value: "boolean", label: "Boolean (Ya / Tidak)" },
  ];

  const roleLabels: Record<SemanticRole, string> = {
    quantity_sold: "Jumlah Terjual",
    shipping_cost: "Ongkos Kirim",
    order_date: "Waktu Transaksi",
    revenue: "Total Pendapatan / Omset",
    product_category: "Kategori Barang",
    product_name: "Nama Produk",
    unit_price: "Harga Satuan",
    customer_name: "Nama Pelanggan",
    city: "Kota / Daerah",
    province: "Provinsi",
    discount: "Potongan / Diskon",
    profit: "Laba Bersih",
    payment_method: "Metode Bayar",
    identifier: "Nomor ID / Resi",
    general: "Umum",
  };

  return (
    <div
      className={cn(
        "p-4 bg-[var(--color-paper-white)] border border-slate-gray/20 rounded-none hover:border-slate-gray/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4",
        className
      )}
    >
      {/* Left: Column Identity & Role */}
      <div className="flex-1 min-w-[240px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[15px] font-medium text-[var(--color-ink-black)]">
            {column.name}
          </span>
          <ConfidenceIndicator score={column.confidenceScore} />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--color-slate-gray)]">
          <span className="bg-[var(--color-mist-gray)] px-2 py-0.5 rounded-none border border-slate-gray/15 text-[var(--color-ink-black)] font-mono">
            Peran: {roleLabels[column.semanticRole] || column.semanticRole}
          </span>
          <span>&bull; {column.cardinality} nilai unik</span>
          <span>
            &bull;{" "}
            {column.nullableRatio > 0 ? (
              <span className="text-amber-600 font-medium">
                {Math.round(column.nullableRatio * 100)}% kosong ({column.stats.totalNulls} baris)
              </span>
            ) : (
              "100% terisi"
            )}
          </span>
        </div>
      </div>

      {/* Middle: Sample Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[320px]">
        {column.sampleValues.map((sample, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-[var(--color-fog-white)] border border-slate-gray/20 text-xs font-mono text-[var(--color-slate-gray)] rounded-none truncate max-w-[90px]"
            title={String(sample)}
          >
            {sample !== null && sample !== undefined ? String(sample) : "null"}
          </span>
        ))}
      </div>

      {/* Right: Inline Type Override Dropdown */}
      <div className="shrink-0 flex items-center gap-2">
        <label htmlFor={`type-select-${column.name}`} className="text-xs text-[var(--color-slate-gray)] whitespace-nowrap">
          Tipe Data:
        </label>
        <select
          id={`type-select-${column.name}`}
          value={column.effectiveType}
          onChange={(e) => onTypeChange(e.target.value as DataType)}
          className="bg-[var(--color-paper-white)] border border-slate-gray/20 text-[var(--color-ink-black)] text-[13px] rounded-none px-3 py-1.5 outline-none focus:border-[var(--color-ink-black)] focus:ring-1 focus:ring-[var(--color-ink-black)] cursor-pointer font-medium"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
