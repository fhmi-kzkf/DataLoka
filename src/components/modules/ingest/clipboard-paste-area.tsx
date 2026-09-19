import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ClipboardPasteAreaProps {
  onPasteSubmit: (text: string) => void;
  isLoading?: boolean;
}

export function ClipboardPasteArea({ onPasteSubmit, isLoading = false }: ClipboardPasteAreaProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Silakan tempel teks tabel dari clipboard Anda");
      return;
    }

    const lines = trimmed.split(/\r?\n/);
    if (lines.length < 2) {
      setError("Data harus memiliki minimal 2 baris (1 baris header dan 1 baris data)");
      return;
    }

    onPasteSubmit(trimmed);
  };

  const handleReadClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          setText(clipText);
          setError(null);
        }
      }
    } catch {
      // Fallback if browser permission is blocked
    }
  };

  return (
    <Card surface="mist" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-[15px] font-medium text-[var(--color-ink-black)]">
            Tempel Data (CSV / TSV / Tabel Salinan Excel)
          </label>
          <button
            type="button"
            onClick={handleReadClipboard}
            className="text-xs text-[var(--color-ink-black)] underline hover:text-[var(--color-slate-gray)] cursor-pointer"
          >
            Baca Otomatis dari Clipboard
          </button>
        </div>

        <textarea
          rows={6}
          placeholder="Nama Produk&#9;Jumlah&#9;Pendapatan&#10;Kemeja Polos&#9;24&#9;2400000&#10;Celana Chino&#9;15&#9;3750000"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          disabled={isLoading}
          className="w-full bg-[var(--color-paper-white)] text-[var(--color-ink-black)] placeholder-[var(--color-smoke-gray)] text-[14px] font-mono rounded-none border border-slate-gray/20 p-4 outline-none transition-all focus:border-[var(--color-ink-black)] focus:ring-1 focus:ring-[var(--color-ink-black)] disabled:bg-[var(--color-mist-gray)]"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="filled" size="md" className="rounded-none" isLoading={isLoading} disabled={!text.trim()}>
            Proses Data Clipboard
          </Button>
        </div>
      </form>
    </Card>
  );
}
