import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseGoogleSheetUrl } from "@/core/parser/gsheet-parser";

export interface GSheetInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export const SAMPLE_GSHEET_LINKS = [
  {
    title: "E-Commerce Penjualan Q1 (Publik)",
    url: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0",
    desc: "15 kolom: Transaksi, Kategori, Omset, Wilayah",
  },
  {
    title: "Financial & P&L Bulanan UMKM",
    url: "https://docs.google.com/spreadsheets/d/1vG_oE3qLZb3bH8d_Qx4rR5bK6tY8p9Z1e0w2a3c4e5/edit#gid=0",
    desc: "9 kolom: Pendapatan, HPP, Operasional, Laba Bersih",
  },
];

export function GSheetInput({ onSubmit, isLoading = false }: GSheetInputProps) {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError("Silakan masukkan tautan Google Sheets");
      return;
    }

    const parsed = parseGoogleSheetUrl(trimmed);
    if (!parsed) {
      setValidationError(
        "Format URL tidak valid. Pastikan format: https://docs.google.com/spreadsheets/d/.../edit#gid=0"
      );
      return;
    }

    onSubmit(trimmed);
  };

  const handleApplySample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setValidationError(null);
    onSubmit(sampleUrl);
  };

  return (
    <Card surface="mist" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[15px] font-medium text-[var(--color-ink-black)] mb-2">
            Tautan Google Sheets Publik
          </label>
          <Input
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (validationError) setValidationError(null);
            }}
            error={validationError || undefined}
            disabled={isLoading}
          />
        </div>

        {/* Quick Sample Links Section */}
        <div className="space-y-2 pt-1">
          <span className="text-[11.5px] font-mono uppercase text-slate-gray block tracking-wider">
            Tautan Uji Coba Cepat (1-Klik):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_GSHEET_LINKS.map((sample) => (
              <button
                key={sample.title}
                type="button"
                onClick={() => handleApplySample(sample.url)}
                disabled={isLoading}
                className="text-left p-2.5 bg-paper-white border border-slate-gray/20 hover:border-ink-black hover:bg-mist-gray/80 transition-all rounded-none cursor-pointer shadow-2xs group"
              >
                <span className="text-[12.5px] font-medium text-ink-black block group-hover:text-sienna-brown transition-colors">
                  {sample.title} &rarr;
                </span>
                <span className="text-[11px] text-slate-gray block truncate font-mono">
                  {sample.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-paper-white)] p-4 rounded-none text-[14px] text-[var(--color-slate-gray)] border border-slate-gray/20">
          <p className="font-medium text-[var(--color-ink-black)] mb-1 font-mono text-xs uppercase">Panduan Penggunaan:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pastikan akses dokumen diatur ke &ldquo;Siapa saja yang memiliki link&rdquo; (*Anyone with link*).</li>
            <li>Data diunduh via stream CSV aman dan diproses langsung di peramban.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="filled" size="md" className="rounded-none" isLoading={isLoading}>
            Muat Google Sheets
          </Button>
        </div>
      </form>
    </Card>
  );
}
