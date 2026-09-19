"use client";

import React from "react";
import type { TemplateId } from "@/types/template";
import { ALL_TEMPLATES } from "@/core/template/template-registry";

interface TemplateSelectorPillProps {
  activeTemplateId: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
}

export const TemplateSelectorPill: React.FC<TemplateSelectorPillProps> = ({
  activeTemplateId,
  onSelectTemplate,
}) => {
  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <span className="text-[12px] font-mono text-slate-gray shrink-0 uppercase tracking-wider pl-1">
        Domain:
      </span>
      <div className="flex items-center gap-2 shrink-0">
        {ALL_TEMPLATES.map((tmpl) => {
          const isActive = tmpl.id === activeTemplateId;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.id)}
              aria-pressed={isActive}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap border ${
                isActive
                  ? "bg-ink-black text-paper-white border-ink-black shadow-xs -translate-y-0.5"
                  : "bg-paper-white text-ink-black hover:bg-mist-gray border-slate-gray/20"
              }`}
            >
              <span
                className="w-2 h-2 rounded-none shrink-0"
                style={{ backgroundColor: tmpl.accentColor || "#111827" }}
              />
              <span>{tmpl.name}</span>
              {tmpl.badge && (
                <span
                  className={`text-[10px] font-mono px-1 py-0.2 rounded-none border ${
                    isActive
                      ? "bg-white/15 text-paper-white border-white/20"
                      : "bg-mist-gray text-slate-gray border-slate-gray/20"
                  }`}
                >
                  {tmpl.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
