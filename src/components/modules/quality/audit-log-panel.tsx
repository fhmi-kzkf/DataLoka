import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AuditLogEntry } from "@/types/quality";
import { cn } from "@/lib/utils";

export interface AuditLogPanelProps {
  logs: AuditLogEntry[];
  onUndo?: () => void;
  className?: string;
}

export function AuditLogPanel({ logs, onUndo, className }: AuditLogPanelProps) {
  if (logs.length === 0) {
    return (
      <div className={cn("p-4 rounded-none bg-[var(--color-fog-white)] text-center text-[13px] text-[var(--color-slate-gray)] border border-slate-gray/20", className)}>
        Belum ada transformasi data yang diterapkan. Data masih dalam format asli.
      </div>
    );
  }

  return (
    <Card surface="mist" padding="md" className={cn("rounded-none border border-slate-gray/20", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-gray/15 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-[#059669]" />
          <h4 className="text-[14px] font-medium text-[var(--color-ink-black)]">
            Audit Log Perubahan Non-Destruktif ({logs.length})
          </h4>
        </div>
        {onUndo && (
          <Button variant="ghost" size="sm" className="rounded-none" onClick={onUndo}>
            Undo Aksi Terakhir
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start justify-between p-2.5 bg-[var(--color-paper-white)] rounded-none text-xs border border-slate-gray/20"
          >
            <div>
              <span className="font-semibold text-[var(--color-ink-black)] mr-2">
                [{log.action}]
              </span>
              <span className="text-[var(--color-slate-gray)]">{log.details}</span>
            </div>
            <span className="font-mono text-[10px] text-[var(--color-slate-gray)] whitespace-nowrap pl-2">
              {log.timestamp}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
