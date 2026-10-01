"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { TrustComplianceModal } from "@/components/landing/trust-compliance-modal";

export const LandingFooter: React.FC = () => {
  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const [trustModalOpen, setTrustModalOpen] = useState(false);
  const [trustTopic, setTrustTopic] = useState<"zero_cloud" | "uu_pdp">("zero_cloud");

  const openComplianceModal = (topic: "zero_cloud" | "uu_pdp") => {
    setTrustTopic(topic);
    setTrustModalOpen(true);
  };

  return (
    <>
      <footer className="w-full bg-[#fbfbfb] border-t border-slate-gray/15 pt-16 lg:pt-20 pb-12 lg:pb-16 text-left antialiased">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          {/* Main 5-Column Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Col 0: Brand Logo & Title */}
            <div className="col-span-2 md:col-span-1">
              <Link
                href="/"
                className="inline-flex items-center gap-3 group cursor-pointer"
                aria-label="DataLoka Beranda"
              >
                <BrandLogo
                  size="md"
                  className="group-hover:bg-sienna-brown transition-colors"
                />
                <span className="font-signifier text-[22px] font-normal tracking-tight text-ink-black leading-none">
                  DataLoka
                </span>
              </Link>
              <p className="mt-3.5 text-[13px] text-slate-gray leading-relaxed max-w-[200px]">
                Platform visual analitik spreadsheet bisnis &amp; e-commerce Indonesia.
              </p>
            </div>

            {/* Col 1: Explore / Fitur Produk */}
            <div className="space-y-4">
              <h4 className="text-[14.5px] font-semibold text-ink-black tracking-normal">
                Eksplorasi
              </h4>
              <ul className="space-y-3 text-[14px]">
                <li>
                  <Link
                    href="/dashboard"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    Ikhtisar Workspace
                  </Link>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    Auto-Chart Engine
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    Kamus Pasar Lokal
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    Pembersih Data &amp; EDA
                  </a>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    Harga &amp; Paket
                  </Link>
                </li>
                <li>
                  <a
                    href="#ingest"
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1"
                  >
                    <span>Multi-Sheet Ingest</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#templates"
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1"
                  >
                    <span>Template Retail &amp; POS</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#demo"
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1"
                  >
                    <span>Demo Interaktif</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 2: Resources & Compliance */}
            <div className="space-y-4">
              <h4 className="text-[14.5px] font-semibold text-ink-black tracking-normal">
                Sumber Daya
              </h4>
              <ul className="space-y-3 text-[14px]">
                <li>
                  <a
                    href="#features"
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1"
                  >
                    <span>Panduan Analisis</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1"
                  >
                    <span>Status API &amp; Layanan</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openComplianceModal("zero_cloud")}
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1 cursor-pointer text-left w-full"
                  >
                    <span>Arsitektur Zero-Cloud</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openComplianceModal("uu_pdp")}
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1 cursor-pointer text-left w-full"
                  >
                    <span>Kepatuhan UU PDP</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </button>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    Pembaruan Produk
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openComplianceModal("zero_cloud")}
                    className="text-slate-gray hover:text-ink-black transition-colors block cursor-pointer text-left"
                  >
                    Keamanan &amp; Enkripsi
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openComplianceModal("uu_pdp")}
                    className="text-slate-gray hover:text-ink-black transition-colors block cursor-pointer text-left"
                  >
                    DPA &amp; Hak Hapus Data
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Company */}
            <div className="space-y-4">
              <h4 className="text-[14.5px] font-semibold text-ink-black tracking-normal">
                Perusahaan
              </h4>
              <ul className="space-y-3 text-[14px]">
                <li>
                  <a
                    href="#features"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    Tentang DataLoka
                  </a>
                </li>
                <li>
                  <a
                    href="#templates"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    Kisah Mitra &amp; Kasus
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:karir@dataloka.id"
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1"
                  >
                    <span>Karir &amp; Magang</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </a>
                </li>
                <li>
                  <Link
                    href="/admin"
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1"
                  >
                    <span>Portal Superadmin</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div className="space-y-4">
              <h4 className="text-[14.5px] font-semibold text-ink-black tracking-normal">
                Kontak
              </h4>
              <ul className="space-y-3 text-[14px]">
                <li>
                  <a
                    href="mailto:halo@dataloka.id"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    halo@dataloka.id
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:bantuan@dataloka.id"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    bantuan@dataloka.id
                  </a>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-slate-gray hover:text-ink-black transition-colors block"
                  >
                    Jadwalkan Demo Bisnis
                  </Link>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1"
                  >
                    <span>LinkedIn</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1"
                  >
                    <span>YouTube</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-gray hover:text-ink-black transition-colors flex items-center gap-1"
                  >
                    <span>X (Twitter)</span>
                    <span className="text-[12px] opacity-75">↗</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Thin Horizontal Divider */}
          <div className="border-t border-slate-gray/15 my-10 lg:my-14" />

          {/* Bottom Aligned Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 items-center text-[13.5px] text-slate-gray">
            {/* Under Col 0 (Logo): Social Icons */}
            <div className="flex items-center gap-3.5 col-span-2 md:col-span-1">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-slate-gray hover:text-ink-black transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-slate-gray hover:text-ink-black transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-slate-gray hover:text-ink-black transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            {/* Under Col 1 (Explore): Copyright */}
            <div>
              <span>&copy; {new Date().getFullYear()} DataLoka Analytics</span>
            </div>

            {/* Under Col 2 (Resources): Location */}
            <div>
              <span>Jakarta, Indonesia</span>
            </div>

            {/* Under Col 3 (Company): Cookie Settings */}
            <div>
              <button
                type="button"
                onClick={() => setCookieModalOpen(true)}
                className="text-slate-gray hover:text-ink-black transition-colors cursor-pointer text-left"
              >
                Pengaturan Cookie
              </button>
            </div>

            {/* Under Col 4 (Contact): Empty Spacer */}
            <div className="hidden md:block" />
          </div>
        </div>
      </footer>

      {/* Cookie Settings Dialog */}
      {cookieModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-xs antialiased"
        >
          <div
            className="relative w-full max-w-[500px] bg-paper-white border border-slate-gray/30 p-6 sm:p-8 shadow-subtle text-left transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* High-Visibility Close Button */}
            <button
              type="button"
              onClick={() => setCookieModalOpen(false)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-none bg-mist-gray hover:bg-ink-black text-ink-black hover:text-paper-white border border-slate-gray/30 hover:border-ink-black transition-all cursor-pointer shadow-2xs group"
              aria-label="Tutup dialog"
            >
              <X className="w-4 h-4 stroke-[2.5] transition-transform group-hover:scale-110" />
            </button>

            <div className="space-y-1 mb-5 pb-4 border-b border-slate-gray/15">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-sienna-brown tracking-wider font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-sienna-brown" />
                <span>Privasi &amp; Kepatuhan Data</span>
              </div>
              <h3 className="font-signifier text-[22px] font-normal text-ink-black">
                Preferensi Cookie &amp; Local Storage
              </h3>
            </div>

            <div className="space-y-4 text-[13px] text-slate-gray leading-relaxed">
              <div className="p-3 bg-fog-white border border-slate-gray/20 space-y-1">
                <div className="font-semibold text-ink-black flex items-center justify-between">
                  <span>Essential Storage (Sesi &amp; Tema)</span>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    Selalu Aktif
                  </span>
                </div>
                <p className="text-[12px]">
                  Digunakan untuk mempertahankan preferensi tema dan token autentikasi sesi Anda secara aman di browser.
                </p>
              </div>

              <div className="p-3 bg-fog-white border border-slate-gray/20 space-y-1">
                <div className="font-semibold text-ink-black flex items-center justify-between">
                  <span>Zero-Cloud Analytics Cookies</span>
                  <span className="text-[11px] font-mono text-slate-gray bg-mist-gray px-2 py-0.5 border border-slate-gray/20">
                    Nonaktif
                  </span>
                </div>
                <p className="text-[12px]">
                  DataLoka tidak menggunakan pelacak pihak ketiga atau menjual data Anda. Seluruh pemrosesan spreadsheet dijalankan 100% di memori lokal peramban Anda.
                </p>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-gray/15 flex justify-end">
              <button
                type="button"
                onClick={() => setCookieModalOpen(false)}
                className="px-5 py-2 bg-ink-black hover:bg-slate-gray text-paper-white text-[13px] font-medium transition cursor-pointer"
              >
                Simpan &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Compliance Modal */}
      <TrustComplianceModal
        isOpen={trustModalOpen}
        onClose={() => setTrustModalOpen(false)}
        defaultTopic={trustTopic}
      />
    </>
  );
};
