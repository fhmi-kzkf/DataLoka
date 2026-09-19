import React from "react";
import type { DataType } from "@/types/mapping";
import { cn } from "@/lib/utils";

export interface DataTypeBadgeProps {
  type: DataType;
  className?: string;
}

export function DataTypeBadge({ type, className }: DataTypeBadgeProps) {
  const typeConfigs: Record<DataType, { label: string; bg: string; text: string }> = {
    numeric: { label: "Numeric (123)", bg: "bg-[#f2f2f3]", text: "text-[var(--color-ink-black)]" },
    datetime: { label: "Datetime (Tgl)", bg: "bg-[#e0f2fe]", text: "text-[#0369a1]" },
    currency: { label: "Mata Uang (Rp)", bg: "bg-[#d1fae5]", text: "text-[#065f46]" },
    percentage: { label: "Persentase (%)", bg: "bg-[#fef3c7]", text: "text-[#92400e]" },
    categorical: { label: "Kategori (Tag)", bg: "bg-[#ede9fe]", text: "text-[#5b21b6]" },
    text: { label: "Teks (Abc)", bg: "bg-[#f2f2f3]", text: "text-[var(--color-slate-gray)]" },
    geolocation: { label: "Lokasi (Peta)", bg: "bg-[#ffe4e6]", text: "text-[#9f1239]" },
    boolean: { label: "Boolean (Ya/Tdk)", bg: "bg-[#f3e8ff]", text: "text-[#6b21a8]" },
  };

  const config = typeConfigs[type] || typeConfigs.text;

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 text-[12px] font-mono font-medium rounded-full inline-flex items-center",
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}
