import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag } from "@/components/ui/tag";
import { useMappingStore } from "@/stores/mapping-store";
import { ColumnRow } from "./column-row";
import type { DataType } from "@/types/mapping";

export interface MappingPanelProps {
  onProceed?: () => void;
  onBack?: () => void;
  className?: string;
}

export function MappingPanel({ onProceed, onBack, className }: MappingPanelProps) {
  const {
    mapping,
    updateColumnType,
    setPrimaryDateColumn,
    setPrimaryCategoryColumn,
    setPrimaryNumericColumn,
  } = useMappingStore();

  const [search, setSearch] = useState("");

  if (!mapping) {
    return (
      <Card surface="mist" padding="lg" className="text-center">
        <p className="text-[15px] text-[var(--color-slate-gray)]">
          Belum ada dataset yang dipetakan. Silakan unggah file terlebih dahulu.
        </p>
      </Card>
    );
  }

  const columnsList = Object.values(mapping.columns);
  const filteredColumns = columnsList.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group counts
  const dateCols = columnsList.filter((c) => c.effectiveType === "datetime");
  const numCols = columnsList.filter((c) => c.effectiveType === "numeric" || c.effectiveType === "currency");
  const catCols = columnsList.filter((c) => c.effectiveType === "categorical");

  return (
    <Card surface="elevated" padding="lg" className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ececec]">
        <div>
          <Tag label="Pemetaan Kolom & Tipe Data" className="mb-1" />
          <h2 className="text-[24px] font-serif font-normal text-[var(--color-ink-black)]">
            Konfigurasi Struktur Data
          </h2>
          <p className="text-[14px] text-[var(--color-slate-gray)] mt-1">
            Sistem mendeteksi {dateCols.length} tanggal, {numCols.length} metrik angka, dan{" "}
            {catCols.length} kategori secara otomatis. Anda dapat mengubah tipe data jika diperlukan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              Kembali ke File
            </Button>
          )}
          <Button variant="filled" size="sm" onClick={onProceed}>
            Lanjutkan ke Analisis Data →
          </Button>
        </div>
      </div>

      {/* Primary Dimensions Selector Bar */}
      <div className="my-6 p-4 bg-[var(--color-fog-white)] rounded-none border border-slate-gray/20 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Primary */}
        <div>
          <label htmlFor="primary-date-select" className="block text-xs font-medium text-[var(--color-ink-black)] mb-1">
            Dimensi Waktu Utama:
          </label>
          <select
            id="primary-date-select"
            value={mapping.primaryDateColumn || ""}
            onChange={(e) => setPrimaryDateColumn(e.target.value)}
            className="w-full bg-[var(--color-paper-white)] border border-slate-gray/20 text-xs rounded-none px-2.5 py-1.5 outline-none focus:border-[var(--color-ink-black)]"
          >
            <option value="">Tidak ada dimensi tanggal</option>
            {columnsList.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.effectiveType})
              </option>
            ))}
          </select>
        </div>

        {/* Category Primary */}
        <div>
          <label htmlFor="primary-cat-select" className="block text-xs font-medium text-[var(--color-ink-black)] mb-1">
            Kategori Utama (Sumbu Bar/Pie):
          </label>
          <select
            id="primary-cat-select"
            value={mapping.primaryCategoryColumn || ""}
            onChange={(e) => setPrimaryCategoryColumn(e.target.value)}
            className="w-full bg-[var(--color-paper-white)] border border-slate-gray/20 text-xs rounded-none px-2.5 py-1.5 outline-none focus:border-[var(--color-ink-black)]"
          >
            <option value="">Pilih kategori utama...</option>
            {columnsList.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.effectiveType})
              </option>
            ))}
          </select>
        </div>

        {/* Numeric Primary */}
        <div>
          <label htmlFor="primary-num-select" className="block text-xs font-medium text-[var(--color-ink-black)] mb-1">
            Metrik Angka Utama (Nilai KPI):
          </label>
          <select
            id="primary-num-select"
            value={mapping.primaryNumericColumn || ""}
            onChange={(e) => setPrimaryNumericColumn(e.target.value)}
            className="w-full bg-[var(--color-paper-white)] border border-slate-gray/20 text-xs rounded-none px-2.5 py-1.5 outline-none focus:border-[var(--color-ink-black)]"
          >
            <option value="">Pilih metrik utama...</option>
            {columnsList.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.effectiveType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Column List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[16px] font-medium text-[var(--color-ink-black)]">
            Daftar Kolom ({columnsList.length})
          </h3>
          <div className="w-64">
            <Input
              type="text"
              placeholder="Cari nama kolom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-2 text-xs"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredColumns.map((col) => (
            <ColumnRow
              key={col.name}
              column={col}
              onTypeChange={(newType: DataType) => updateColumnType(col.name, newType)}
            />
          ))}

          {filteredColumns.length === 0 && (
            <p className="text-center py-8 text-sm text-[var(--color-slate-gray)]">
              Tidak ada kolom yang cocok dengan pencarian &ldquo;{search}&rdquo;.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
