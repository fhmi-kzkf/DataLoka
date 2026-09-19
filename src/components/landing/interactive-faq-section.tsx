"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Tag } from "@/components/ui/tag";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const LANDING_FAQS: FaqItem[] = [
  {
    question: "Bagaimana cara kerja Live-Sync Google Sheets jika sistem berjalan di sisi klien?",
    answer: "Live-Sync Google Sheets berjalan dengan mekanisme polling berkala langsung dari peramban Anda melalui koneksi HTTPS terenkripsi ke endpoint ekspor Google. Peramban Anda meminta pembaruan data secara periodik (misalnya setiap 5 atau 15 menit), lalu memperbarui grafik dan kartu metrik secara instan tanpa perlu memutar data melalui server penengah kami.",
    category: "Integrasi & Sinkronisasi",
  },
  {
    question: "Apakah data sensitif terkirim ke server pihak ketiga saat memakai fitur Tanya Data AI Assistant?",
    answer: "Tidak. DataLoka menggunakan prinsip Least-Privilege Prompting. Saat Anda mengajukan pertanyaan di Command Bar, sistem hanya mengirimkan nama kolom (schema headers) dan ringkasan statistik sampel 5 baris data anonim ke inference engine AI untuk memahami maksud pertanyaan. Seluruh tabel atau ratusan ribu baris data bisnis Anda tidak pernah dikirim atau disimpan di server AI eksternal.",
    category: "Privasi & AI",
  },
  {
    question: "Berapa batas kapasitas RAM dan volume data peramban sebelum visualisasi terasa lambat?",
    answer: "Berkat arsitektur berbasis Web Workers dan visualisasi Apache ECharts teroptimasi, DataLoka mampu mengolah file spreadsheet hingga 100 MB dan 500.000 baris data secara lancar pada perangkat dengan RAM 4GB ke atas. Untuk dataset yang sangat masif (>500.000 baris), sistem otomatis mengaktifkan sampling agregasi cerdas sehingga navigasi grafik tetap responsif di bawah 60 FPS.",
    category: "Performa Teknis",
  },
  {
    question: "Bagaimana syarat dan prosedur klaim garansi 14 hari uang kembali?",
    answer: "Jika paket langganan berbayar (Starter atau Pro) tidak memenuhi ekspektasi Anda, Anda dapat mengajukan refund penuh dalam kurun waktu 14 hari kalender sejak tanggal transaksi pertama tanpa pertanyaan berbelit-belit. Cukup kirimkan konfirmasi melalui email support atau dasbor akun Anda, dan dana akan dikembalikan melalui rekening asal / metode pembayaran awal.",
    category: "Garansi & Tagihan",
  },
  {
    question: "Apakah DataLoka sepenuhnya mematuhi Undang-Undang Perlindungan Data Pribadi (UU PDP)?",
    answer: "Ya. Kami menerapkan perlindungan data ketat sesuai UU PDP No. 27 Tahun 2022. Karena model operasional default kami adalah client-side, Anda memegang hak kedaulatan data penuh. Jika Anda menggunakan fitur penyimpanan cloud, data terenkripsi AES-256 dan Anda memiliki hak untuk menghapus seluruh workspace (Right to be Forgotten) secara instan kapan saja.",
    category: "Legal & Kepatuhan",
  },
  {
    question: "Apakah hasil ekspor laporan PDF atau gambar memiliki watermark?",
    answer: "Tidak. Seluruh hasil ekspor laporan—baik format PDF editorial beresolusi tinggi, grafik PNG vektor, maupun dataset CSV bersih—bebas dari watermark di seluruh tier, termasuk pengguna paket Free.",
    category: "Ekspor & Output",
  },
];

export const InteractiveFaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="w-full bg-[var(--color-fog-white)] py-20 sm:py-28 border-t border-slate-gray/15 text-left">
      <div className="max-w-[960px] mx-auto px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <Tag label="Jawaban atas Keraguan Anda" />
          <h2 className="font-signifier text-[32px] sm:text-[42px] font-normal text-ink-black tracking-tight leading-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-[15.5px] text-slate-gray max-w-xl mx-auto leading-relaxed">
            Transparansi teknis seputar privasi data, kapabilitas inferensi AI, performa peramban, dan kebijakan langganan.
          </p>
        </div>

        {/* Accordion List */}
        <div className="divide-y divide-slate-gray/15 border border-slate-gray/20 bg-paper-white shadow-xs">
          {LANDING_FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-fog-white/60 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase text-sienna-brown font-semibold tracking-wider block">
                      {faq.category}
                    </span>
                    <span className="font-medium text-[15.5px] sm:text-[16.5px] text-ink-black leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-gray shrink-0 mt-1 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-sienna-brown" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-[14px] text-slate-gray leading-relaxed border-t border-slate-gray/10 bg-fog-white/30">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
