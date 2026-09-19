"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { PRICING_FAQS } from "@/types/pricing";

export const PricingFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="w-full max-w-[960px] mx-auto px-6 lg:px-8 py-16 sm:py-20 text-left">
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase text-slate-gray tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-sienna-brown" />
          <span>Frequently Asked Questions</span>
        </div>
        <h3 className="font-signifier text-[28px] sm:text-[36px] font-normal text-ink-black">
          Pertanyaan yang Sering Diajukan
        </h3>
      </div>

      <div className="divide-y divide-slate-gray/15 border border-slate-gray/20 bg-paper-white shadow-xs">
        {PRICING_FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={idx} className="transition-colors">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-fog-white/60 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-[15px] sm:text-[16px] text-ink-black leading-snug">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-gray shrink-0 transition-transform duration-200 ${
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
    </section>
  );
};
