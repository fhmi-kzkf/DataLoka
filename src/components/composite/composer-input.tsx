import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface ComposerInputProps {
  placeholder?: string;
  onSend?: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ComposerInput({
  placeholder = "Tanya apa saja tentang data...",
  onSend,
  isLoading = false,
  disabled = false,
  className,
}: ComposerInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled || isLoading) return;
    onSend?.(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center bg-[var(--color-paper-white)] border border-[#ececec] rounded-[16px] p-2.5 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] transition-all focus-within:border-[var(--color-ink-black)] w-full max-w-[540px]",
        className
      )}
    >
      <div className="flex items-center gap-1 pl-1 text-[var(--color-slate-gray)]">
        <button
          type="button"
          tabIndex={-1}
          aria-label="Sebut kolom atau entitas"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-mist-gray)] transition-colors text-[14px] font-medium"
        >
          @
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Bantuan perintah"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-mist-gray)] transition-colors text-[14px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
            <path strokeWidth="1.5" d="M12 16v-4m0-4h.01" />
          </svg>
        </button>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className="flex-1 bg-transparent px-3 py-2 text-[16px] text-[var(--color-ink-black)] placeholder-[var(--color-smoke-gray)] outline-none disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={!value.trim() || disabled || isLoading}
        aria-label="Kirim pertanyaan"
        className="w-10 h-10 rounded-full bg-[var(--color-ink-black)] text-[var(--color-paper-white)] flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shrink-0 cursor-pointer"
      >
        {isLoading ? (
          <span
            data-testid="composer-loading"
            aria-hidden="true"
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </form>
  );
}
