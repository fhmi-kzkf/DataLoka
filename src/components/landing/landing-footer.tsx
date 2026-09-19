"use client";

import React from "react";
import Link from "next/link";
import { TextLink } from "@/components/ui/link";
import { BrandLogo } from "@/components/ui/brand-logo";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[var(--color-fog-white)] border-t border-slate-gray/15 pt-16 pb-12 mt-20 text-left">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Column 1: Brand & Privacy Commitment */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <BrandLogo size="md" />
              <span className="font-signifier text-[22px] font-normal text-ink-black">
                DataLoka
              </span>
            </div>


            <p className="text-[13.5px] text-slate-gray leading-relaxed max-w-sm">
              Platform analitik editorial mandiri. Seluruh proses parsing dan visualisasi spreadsheet berjalan 100% di browser Anda tanpa server eksternal.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-paper-white border border-slate-gray/15 text-[11.5px] font-mono text-sienna-brown">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              Zero-Cloud Storage Verified
            </div>
          </div>

          {/* Column 2: Platform & Fitur */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-black font-semibold block">
              Fitur &amp; Engine
            </span>
            <ul className="space-y-2 text-[13.5px] text-slate-gray">
              <li>
                <a href="#engine" className="hover:text-ink-black transition-colors">
                  Auto-Chart Decision Engine
                </a>
              </li>
              <li>
                <a href="#dictionary" className="hover:text-ink-black transition-colors">
                  Kamus Lokal Shopee &amp; Tokopedia
                </a>
              </li>
              <li>
                <a href="#ingest" className="hover:text-ink-black transition-colors">
                  Multi-Sheet Ingest XLSX / CSV
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ink-black transition-colors">
                  Universal Command Bar (⌘K)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ink-black transition-colors">
                  Ekspor Vektor SVG &amp; PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Template Domain */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-black font-semibold block">
              Template Domain
            </span>
            <ul className="space-y-2 text-[13.5px] text-slate-gray">
              <li>
                <a href="#templates" className="hover:text-ink-black transition-colors">
                  E-Commerce &amp; Retail Omnichannel
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-ink-black transition-colors">
                  B2B Sales &amp; Deal Pipeline
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-ink-black transition-colors">
                  Laporan Laba Rugi &amp; Arus Kas
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-ink-black transition-colors">
                  Growth Marketing &amp; ROAS
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-ink-black transition-colors">
                  Operations &amp; Logistik SLA
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Keamanan & Navigasi */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-black font-semibold block">
              Tautan &amp; Bantuan
            </span>
            <ul className="space-y-2 text-[13.5px] text-slate-gray">
              <li>
                <a href="#features" className="hover:text-ink-black transition-colors">
                  Fondasi Arsitektur
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-ink-black transition-colors">
                  Jaminan Privasi Data
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-ink-black transition-colors">
                  Preset Uji Coba Instan
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ink-black transition-colors">
                  Workspace Dasbor
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-gray/15 flex flex-col sm:flex-row items-center justify-between text-[12.5px] text-slate-gray gap-3">
          <div className="flex items-center gap-2">
            <span>&copy; 2026 DataLoka. Hak Cipta Dilindungi.</span>
            <span className="text-slate-gray/40">&bull;</span>
            <span className="text-[11.5px] font-mono text-slate-gray/80">Steep Editorial Aesthetic</span>
          </div>

          <div className="flex items-center gap-5 text-[12.5px]">
            <TextLink href="#features" variant="nav">
              Fitur
            </TextLink>
            <TextLink href="#templates" variant="nav">
              Template
            </TextLink>
            <TextLink href="#privacy" variant="nav">
              Privasi
            </TextLink>
            <TextLink href="#docs" variant="nav">
              Dokumentasi
            </TextLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
