import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-fog-white">
      <div className="max-w-md space-y-4 bg-paper-white p-8 border border-slate-gray/20 rounded-none shadow-subtle">
        <span className="text-[12px] font-mono uppercase text-sienna-brown tracking-wider block">
          404 &bull; Halaman Tidak Ditemukan
        </span>
        <h1 className="font-signifier text-[28px] text-ink-black font-normal">
          Halaman yang Anda cari tidak tersedia
        </h1>
        <p className="text-[14px] text-slate-gray">
          Tautan mungkin telah kedaluwarsa atau token snapshot tidak valid.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="filled" size="md" className="rounded-none">
              Kembali ke Beranda &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
