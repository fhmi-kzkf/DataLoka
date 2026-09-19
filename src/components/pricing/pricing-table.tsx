"use client";

import React from "react";
import { Check, Minus } from "lucide-react";
import { FEATURE_COMPARISON_GROUPS } from "@/types/pricing";

export const PricingTable: React.FC = () => {
  return (
    <section className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-12 sm:py-20 text-left">
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
        <h3 className="font-signifier text-[28px] sm:text-[36px] font-normal text-ink-black">
          Matriks Perbandingan Fitur Mendalam
        </h3>
        <p className="text-[14.5px] text-slate-gray">
          Evaluasi detail spesifikasi teknis, limitasi data, dan keunggulan tiap paket secara transparan.
        </p>
      </div>

      <div className="overflow-x-auto border border-slate-gray/20 shadow-xs bg-paper-white">
        <table className="w-full text-left border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-fog-white border-b border-slate-gray/20 font-mono text-[12px] uppercase text-slate-gray">
              <th className="p-4 sm:p-5 w-2/5 font-semibold text-ink-black">Fitur &amp; Kemampuan</th>
              <th className="p-4 sm:p-5 text-center w-[15%]">Free</th>
              <th className="p-4 sm:p-5 text-center w-[15%]">Starter</th>
              <th className="p-4 sm:p-5 text-center w-[15%] bg-blush-peach/20 text-sienna-brown font-semibold">Pro</th>
              <th className="p-4 sm:p-5 text-center w-[15%]">Business</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-gray/15">
            {FEATURE_COMPARISON_GROUPS.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                <tr className="bg-fog-white/60 font-mono text-[11.5px] uppercase tracking-wider text-ink-black font-semibold">
                  <td colSpan={5} className="py-2.5 px-4 sm:px-5 bg-fog-white border-y border-slate-gray/15">
                    {group.groupName}
                  </td>
                </tr>
                {group.items.map((item, itemIdx) => (
                  <tr
                    key={itemIdx}
                    className="hover:bg-fog-white/40 transition-colors"
                  >
                    <td className="p-4 sm:p-5 font-medium text-ink-black">
                      <span>{item.name}</span>
                      {item.description && (
                        <span className="block text-[11.5px] text-slate-gray font-normal mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </td>

                    {/* Free Column */}
                    <td className="p-4 sm:p-5 text-center">
                      {typeof item.free === "boolean" ? (
                        item.free ? (
                          <Check className="w-4 h-4 mx-auto text-ink-black" />
                        ) : (
                          <Minus className="w-4 h-4 mx-auto text-slate-gray/30" />
                        )
                      ) : (
                        <span className="font-mono text-[12.5px] text-slate-gray">{item.free}</span>
                      )}
                    </td>

                    {/* Starter Column */}
                    <td className="p-4 sm:p-5 text-center">
                      {typeof item.starter === "boolean" ? (
                        item.starter ? (
                          <Check className="w-4 h-4 mx-auto text-ink-black" />
                        ) : (
                          <Minus className="w-4 h-4 mx-auto text-slate-gray/30" />
                        )
                      ) : (
                        <span className="font-mono text-[12.5px] text-slate-gray">{item.starter}</span>
                      )}
                    </td>

                    {/* Pro Column */}
                    <td className="p-4 sm:p-5 text-center bg-blush-peach/10">
                      {typeof item.pro === "boolean" ? (
                        item.pro ? (
                          <Check className="w-4 h-4 mx-auto text-sienna-brown font-semibold" />
                        ) : (
                          <Minus className="w-4 h-4 mx-auto text-slate-gray/30" />
                        )
                      ) : (
                        <span className="font-mono text-[12.5px] font-medium text-sienna-brown">{item.pro}</span>
                      )}
                    </td>

                    {/* Business Column */}
                    <td className="p-4 sm:p-5 text-center">
                      {typeof item.business === "boolean" ? (
                        item.business ? (
                          <Check className="w-4 h-4 mx-auto text-ink-black font-semibold" />
                        ) : (
                          <Minus className="w-4 h-4 mx-auto text-slate-gray/30" />
                        )
                      ) : (
                        <span className="font-mono text-[12.5px] font-medium text-ink-black">{item.business}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
