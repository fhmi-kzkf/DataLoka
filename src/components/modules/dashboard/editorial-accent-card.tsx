"use client";

import React from "react";
import type { DashboardAccentCard } from "@/types/template";

interface EditorialAccentCardProps {
  accent: DashboardAccentCard;
  accentColor?: string;
  className?: string;
}

export const EditorialAccentCard: React.FC<EditorialAccentCardProps> = ({
  accent,
  accentColor = "#9e472a",
  className = "",
}) => {
  return (
    <div
      className={`bg-fog-white border rounded-none p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-200 text-left ${className}`}
      style={{
        borderColor: `${accentColor}40`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="absolute top-0 left-0 bottom-0 w-1.5"
        style={{ backgroundColor: accentColor }}
      />
      <div className="space-y-3 relative z-10 pl-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-none inline-block"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="text-[11.5px] font-mono uppercase font-bold tracking-wider"
            style={{ color: accentColor }}
          >
            {accent.title}
          </span>
        </div>
        <p className="font-signifier text-[19px] md:text-[22px] leading-relaxed text-ink-black italic font-normal">
          &ldquo;{accent.quote}&rdquo;
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-gray/15 flex items-center justify-between text-[13px] text-slate-gray relative z-10 pl-2">
        <span className="font-medium text-ink-black">{accent.author}</span>
        <span className="font-mono text-[11.5px] text-slate-gray">{accent.role}</span>
      </div>
    </div>
  );
};
