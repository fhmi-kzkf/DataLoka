import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: {
    text: string;
    isPositive?: boolean;
  };
  sparklineData?: number[];
  accentColor?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  sparklineData = [10, 14, 12, 18, 16, 24, 28],
  accentColor,
  className,
}: StatCardProps) {
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * 100;
      const y = 30 - ((val - min) / range) * 26;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const strokeColor = accentColor || "var(--color-sienna-brown)";

  return (
    <Card
      surface="elevated"
      padding="none"
      className={cn("p-5 flex flex-col justify-between w-full min-w-0 min-h-[125px] rounded-none border border-slate-gray/20 bg-paper-white shadow-xs hover:border-slate-gray/40 transition-colors relative overflow-hidden", className)}
    >
      {accentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12.5px] font-mono text-[var(--color-slate-gray)] uppercase tracking-wider truncate">
            {label}
          </p>
          {delta && (
            <span
              className={cn(
                "text-[11.5px] font-mono inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-none border",
                delta.isPositive
                  ? "text-[#059669] bg-[#ecfdf5] border-[#a7f3d0]"
                  : "text-[var(--color-slate-gray)] bg-mist-gray border-slate-gray/20"
              )}
            >
              {delta.isPositive ? "↑" : "↓"} {delta.text}
            </span>
          )}
        </div>
        <p className="text-[22px] sm:text-[24px] font-mono font-medium text-[var(--color-ink-black)] tracking-tight leading-tight truncate">
          {value}
        </p>
      </div>

      <div className="w-full h-7 mt-3 pt-1 border-t border-slate-gray/10">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
            points={points}
          />
        </svg>
      </div>
    </Card>
  );
}
