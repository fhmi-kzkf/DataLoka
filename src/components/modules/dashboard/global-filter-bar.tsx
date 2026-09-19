"use client";

import React, { useState } from "react";
import { Calendar, Filter, X, Search } from "lucide-react";
import type { DateFilterPreset, CustomDateRange } from "@/stores/dashboard-store";
import { humanizeColumnName } from "@/lib/formatters";

interface GlobalFilterBarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  datePreset?: DateFilterPreset;
  onSelectDatePreset?: (preset: DateFilterPreset) => void;
  customDateRange?: CustomDateRange | null;
  onCustomDateChange?: (range: CustomDateRange | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  datePreset = "all",
  onSelectDatePreset = () => {},
  customDateRange = null,
  onCustomDateChange = () => {},
  searchQuery,
  onSearchChange,
  onResetFilters,
}) => {
  const [showCustomDate, setShowCustomDate] = useState<boolean>(datePreset === "custom");
  const [startDate, setStartDate] = useState<string>(customDateRange?.startDate || "");
  const [endDate, setEndDate] = useState<string>(customDateRange?.endDate || "");

  const hasActiveFilters = Boolean(
    selectedCategory ||
    searchQuery.trim() ||
    datePreset !== "all" ||
    customDateRange !== null
  );

  const handleApplyCustomDates = (newStart: string, newEnd: string) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    if (newStart && newEnd) {
      onCustomDateChange({ startDate: newStart, endDate: newEnd });
    }
  };

  return (
    <div className="w-full bg-paper-white border border-slate-gray/20 rounded-none p-4 shadow-xs space-y-3.5 text-left">
      {/* Top Row: Category Filter and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 text-[11.5px] font-mono text-slate-gray pr-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-sienna-brown" />
            <span>KATEGORI:</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`px-2.5 py-1 rounded-none text-[12px] font-medium border transition cursor-pointer ${
              selectedCategory === null
                ? "bg-ink-black text-paper-white border-ink-black font-semibold"
                : "bg-mist-gray text-ink-black border-slate-gray/20 hover:bg-slate-gray/20"
            }`}
          >
            Semua
          </button>

          {categories.slice(0, 8).map((cat) => {
            const isSelected = selectedCategory === cat;
            const humanCat = humanizeColumnName(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(isSelected ? null : cat)}
                className={`px-2.5 py-1 rounded-none text-[12px] font-medium border transition cursor-pointer ${
                  isSelected
                    ? "bg-sienna-brown text-paper-white border-sienna-brown font-semibold shadow-xs"
                    : "bg-mist-gray text-ink-black border-slate-gray/20 hover:bg-slate-gray/20"
                }`}
              >
                {humanCat}
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-gray" />
            <input
              type="text"
              placeholder="Cari label / data..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-mist-gray border border-slate-gray/20 rounded-none pl-8 pr-3 py-1.5 text-[12.5px] text-ink-black placeholder:text-smoke-gray focus:outline-none focus:border-ink-black transition"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11.5px] font-mono text-sienna-brown hover:underline font-semibold px-2 py-1 cursor-pointer shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Date Range Filter Presets & Custom Picker */}
      <div className="pt-3 border-t border-slate-gray/15 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 text-[11.5px] font-mono text-slate-gray pr-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-sienna-brown" />
            <span>RENTANG WAKTU:</span>
          </div>

          {[
            { id: "all", label: "Semua Waktu" },
            { id: "7d", label: "7 Hari Terakhir" },
            { id: "30d", label: "30 Hari Terakhir" },
            { id: "this_month", label: "Bulan Ini" },
            { id: "custom", label: "Pilih Tanggal..." },
          ].map((preset) => {
            const isSelected = datePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelectDatePreset(preset.id as DateFilterPreset);
                  if (preset.id === "custom") {
                    setShowCustomDate(true);
                  } else {
                    setShowCustomDate(false);
                    onCustomDateChange(null);
                  }
                }}
                className={`px-2.5 py-1 text-[11.5px] font-mono border transition cursor-pointer ${
                  isSelected
                    ? "bg-ink-black text-paper-white border-ink-black font-semibold"
                    : "bg-paper-white text-slate-gray border-slate-gray/20 hover:bg-mist-gray hover:text-ink-black"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Start & End Date Inputs if active */}
        {showCustomDate && (
          <div className="flex items-center gap-2 flex-wrap bg-fog-white p-1.5 border border-slate-gray/25 animate-fadeIn">
            <span className="text-[11px] font-mono text-slate-gray">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleApplyCustomDates(e.target.value, endDate)}
              className="bg-paper-white border border-slate-gray/25 px-2 py-1 text-[11.5px] font-mono text-ink-black focus:outline-none"
            />
            <span className="text-[11px] font-mono text-slate-gray">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleApplyCustomDates(startDate, e.target.value)}
              className="bg-paper-white border border-slate-gray/25 px-2 py-1 text-[11.5px] font-mono text-ink-black focus:outline-none"
            />
          </div>
        )}

        {/* Active Cross-Filter Badge */}
        {selectedCategory && (
          <div className="flex items-center gap-1.5 bg-sienna-brown/10 border border-sienna-brown/30 px-2.5 py-1 text-[11.5px] font-mono text-sienna-brown animate-fadeIn">
            <span className="font-semibold">Cross-Filter Aktif:</span>
            <span className="font-bold">{humanizeColumnName(selectedCategory)}</span>
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              title="Hapus Filter Segmen Ini"
              className="hover:bg-sienna-brown/20 p-0.5 ml-1 transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
