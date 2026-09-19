"use client";

import React, { useState, useMemo } from "react";
import { Table, ChevronDown, ChevronUp, Download, Search, ArrowUpDown, Filter } from "lucide-react";
import type { DatasetRow } from "@/types/dataset";
import { humanizeColumnName } from "@/lib/formatters";

interface UnderlyingDataSheetProps {
  rows: DatasetRow[];
  headers: string[];
  totalRowCount?: number;
  activeCategoryFilter?: string | null;
}

export const UnderlyingDataSheet: React.FC<UnderlyingDataSheetProps> = ({
  rows,
  headers,
  totalRowCount,
  activeCategoryFilter,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter((row) =>
      headers.some((header) => {
        const val = row[header];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
      })
    );
  }, [rows, headers, searchQuery]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (header: string) => {
    if (sortColumn === header) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(header);
      setSortDirection("asc");
    }
  };

  const handleExportSegmentCsv = () => {
    if (sortedRows.length === 0) return;

    const escapeCsvValue = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      let str = String(val);
      // Formula injection protection
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvHeader = headers.map(escapeCsvValue).join(",");
    const csvRows = sortedRows.map((row) =>
      headers.map((h) => escapeCsvValue(row[h])).join(",")
    );
    const csvContent = [csvHeader, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dataloka_segmen_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-paper-white border border-slate-gray/20 rounded-none shadow-xs text-left overflow-hidden">
      {/* Header Banner & Collapse Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-4 bg-fog-white/80 border-b border-slate-gray/15 flex items-center justify-between cursor-pointer hover:bg-mist-gray/40 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-ink-black text-paper-white flex items-center justify-center">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-signifier text-[17px] text-ink-black font-semibold">
                Rincian Data Mentah (Underlying Data)
              </h3>
              <span className="text-[11px] font-mono bg-mist-gray text-slate-gray px-2 py-0.5 border border-slate-gray/15">
                {rows.length.toLocaleString("id-ID")} Baris Aktif
              </span>
            </div>
            <p className="text-[12px] text-slate-gray mt-0.5">
              Inspeksi transaksi baris demi baris, sortir kolom, dan verifikasi angka granular.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeCategoryFilter && (
            <span className="text-[11px] font-mono bg-sienna-brown/10 text-sienna-brown px-2.5 py-1 border border-sienna-brown/25 font-medium hidden sm:inline">
              Filter: {humanizeColumnName(activeCategoryFilter)}
            </span>
          )}
          <button
            type="button"
            className="flex items-center gap-1 text-[12px] font-mono text-ink-black hover:text-sienna-brown"
          >
            <span>{isExpanded ? "Sembunyikan" : "Buka Tabel"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Table Area */}
      {isExpanded && (
        <div className="p-5 space-y-4 animate-fadeIn">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
              <input
                type="text"
                placeholder="Cari dalam tabel data mentah..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-mist-gray border border-slate-gray/20 pl-8 pr-3 py-1.5 text-[12.5px] text-ink-black placeholder:text-smoke-gray focus:outline-none focus:border-ink-black"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-[12px] font-mono text-slate-gray">
                <span>Tampilkan:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-mist-gray border border-slate-gray/20 px-2 py-1 text-[12px] text-ink-black focus:outline-none cursor-pointer"
                >
                  <option value={10}>10 Baris</option>
                  <option value={25}>25 Baris</option>
                  <option value={50}>50 Baris</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExportSegmentCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-white hover:bg-mist-gray border border-slate-gray/25 text-[12px] font-mono text-ink-black transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-sienna-brown" />
                <span>Ekspor CSV Segmen</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-slate-gray/20 overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-mist-gray/80 border-b border-slate-gray/20">
                  <th className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-gray uppercase w-12 text-center">
                    #
                  </th>
                  {headers.map((header) => {
                    const isSorted = sortColumn === header;
                    return (
                      <th
                        key={header}
                        onClick={() => handleSort(header)}
                        className="py-2.5 px-3 font-mono text-[11.5px] font-semibold text-ink-black hover:bg-slate-gray/15 transition cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{humanizeColumnName(header)}</span>
                          <ArrowUpDown
                            className={`w-3 h-3 ${
                              isSorted ? "text-sienna-brown" : "text-slate-gray/50"
                            }`}
                          />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-gray/10">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={headers.length + 1}
                      className="py-8 text-center text-slate-gray text-[13px]"
                    >
                      Tidak ada baris data yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, rowIdx) => {
                    const rowNumber = (currentPage - 1) * pageSize + rowIdx + 1;
                    return (
                      <tr
                        key={rowIdx}
                        className="hover:bg-fog-white transition-colors odd:bg-paper-white even:bg-fog-white/30"
                      >
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-gray text-center">
                          {rowNumber}
                        </td>
                        {headers.map((header) => {
                          const val = row[header];
                          const isNumber = typeof val === "number";
                          return (
                            <td
                              key={header}
                              className={`py-2 px-3 text-ink-black ${
                                isNumber ? "font-mono" : ""
                              }`}
                            >
                              {val !== null && val !== undefined && val !== ""
                                ? isNumber
                                  ? val.toLocaleString("id-ID")
                                  : String(val)
                                : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between text-[12px] font-mono text-slate-gray pt-2">
            <span>
              Menampilkan {sortedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} &ndash;{" "}
              {Math.min(currentPage * pageSize, sortedRows.length)} dari {sortedRows.length} baris
              {totalRowCount && totalRowCount !== sortedRows.length && (
                <span className="text-slate-gray/60"> (total dataset: {totalRowCount})</span>
              )}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 bg-paper-white border border-slate-gray/20 disabled:opacity-30 hover:bg-mist-gray cursor-pointer disabled:cursor-not-allowed"
              >
                &larr; Sebelumnya
              </button>
              <span className="px-2">
                Halaman {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 bg-paper-white border border-slate-gray/20 disabled:opacity-30 hover:bg-mist-gray cursor-pointer disabled:cursor-not-allowed"
              >
                Berikutnya &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
