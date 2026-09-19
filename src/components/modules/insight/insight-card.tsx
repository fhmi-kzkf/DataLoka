"use client";

import React from "react";
import type { EditorialInsight } from "@/types/insight";

interface InsightCardProps {
  insight: EditorialInsight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const sentimentBadge = {
    positive: "bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]",
    negative: "bg-[#fff1f2] text-[#e11d48] border-[#fecdd3]",
    neutral: "bg-mist-gray text-slate-gray border-slate-gray/20",
  }[insight.sentiment];

  return (
    <div className="bg-paper-white border border-slate-gray/20 rounded-none p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-gray/40 transition-all">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded-none border uppercase tracking-wider ${sentimentBadge}`}
          >
            {insight.type.replace("_", " ")}
          </span>
          {insight.metricValue && (
            <span className="font-mono text-[14px] font-semibold text-ink-black">
              {insight.metricValue}
            </span>
          )}
        </div>

        <h4 className="text-[17px] font-medium text-ink-black leading-snug">
          {insight.title}
        </h4>

        <p className="text-[14px] text-slate-gray leading-relaxed">
          {insight.description}
        </p>
      </div>

      {insight.recommendedAction && (
        <div className="pt-3 border-t border-slate-gray/10 text-[12px] text-sienna-brown">
          <span className="font-semibold">Rekomendasi: </span>
          <span>{insight.recommendedAction}</span>
        </div>
      )}
    </div>
  );
};
