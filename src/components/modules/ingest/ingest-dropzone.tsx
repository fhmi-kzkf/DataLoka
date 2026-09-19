import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUPPORTED_EXTENSIONS } from "@/core/parser/file-parser";

export interface IngestDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export function IngestDropzone({
  onFileSelected,
  disabled = false,
  className,
}: IngestDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelected(file);
      e.target.value = "";
    }
  };

  return (
    <Card
      surface="mist"
      padding="none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center cursor-pointer select-none",
        isDragOver
          ? "border-[var(--color-ink-black)] bg-[#e9e9ea]"
          : "border-[#d8d8db] hover:border-[var(--color-slate-gray)]",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_EXTENSIONS.join(",")}
        onChange={handleFileChange}
        className="hidden"
        data-testid="file-input-hidden"
      />

      <div className="w-14 h-14 rounded-none bg-[var(--color-paper-white)] border border-slate-gray/20 flex items-center justify-center mb-4 text-[var(--color-ink-black)] shadow-xs">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      <h3 className="text-[20px] font-medium text-[var(--color-ink-black)] mb-2">
        Tarik & lepas file spreadsheet di sini
      </h3>
      <p className="text-[15px] text-[var(--color-slate-gray)] max-w-[420px] mb-6 leading-relaxed">
        Dukung format Excel (.xlsx, .xls), CSV (.csv, .tsv), dan ODS hingga 25 MB. Seluruh data diproses lokal di peramban Anda.
      </p>

      <div className="flex items-center gap-2 mb-6 flex-wrap justify-center">
        {SUPPORTED_EXTENSIONS.map((ext) => (
          <span
            key={ext}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded-none bg-[var(--color-paper-white)] text-[var(--color-ink-black)] border border-slate-gray/20"
          >
            {ext.toUpperCase().replace(".", "")}
          </span>
        ))}
      </div>

      <Button
        type="button"
        variant="filled"
        size="md"
        className="rounded-none"
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
      >
        Pilih File dari Komputer
      </Button>
    </Card>
  );
}
