"use client";

import React from "react";
import type { SuggestedCommand } from "@/types/command";

interface CommandSuggestionPillProps {
  suggestion: SuggestedCommand;
  onClick: (commandText: string) => void;
  isSelected?: boolean;
}

export const CommandSuggestionPill: React.FC<CommandSuggestionPillProps> = ({
  suggestion,
  onClick,
  isSelected = false,
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(suggestion.commandText)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-none text-left transition cursor-pointer border ${
        isSelected
          ? "bg-mist-gray text-ink-black font-medium border-slate-gray/25"
          : "hover:bg-fog-white text-ink-black border-transparent"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10.5px] font-mono text-slate-gray bg-mist-gray px-1.5 py-0.5 border border-slate-gray/15 shrink-0">
          {suggestion.category}
        </span>
        <span className="text-[13px] truncate text-ink-black">{suggestion.title}</span>
      </div>
      <span className="text-[11px] font-mono text-slate-gray/60 pl-2 shrink-0">
        &rarr;
      </span>
    </button>
  );
};
