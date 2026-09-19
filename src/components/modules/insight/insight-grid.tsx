"use client";

import React from "react";
import type { EditorialInsight } from "@/types/insight";
import { InsightCard } from "./insight-card";

interface InsightGridProps {
  insights: EditorialInsight[];
}

export const InsightGrid: React.FC<InsightGridProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  return (
    <section aria-label="Editorial Insights" className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[12px] font-semibold text-sienna-brown uppercase tracking-wider pl-1">
            Sintesis Otomatis
          </span>
          <h3 className="font-signifier text-[22px] md:text-[26px] text-ink-black font-normal">
            Temuan &amp; Anomali Utama
          </h3>
        </div>
        <span className="text-[13px] text-slate-gray italic hidden sm:inline-block">
          Dihasilkan dari analisis korelasi multi-dimensi
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {insights.map((ins) => (
          <InsightCard key={ins.id} insight={ins} />
        ))}
      </div>
    </section>
  );
};
