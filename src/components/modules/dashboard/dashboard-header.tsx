"use client";

import React, { useState } from "react";
import { Cloud, UploadCloud } from "lucide-react";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { useCommandStore } from "@/stores/command-store";
import { CloudSaveModal } from "@/components/auth/cloud-save-modal";
import { DashboardUploadModal } from "@/components/modules/dashboard/dashboard-upload-modal";
import { AuthModal } from "@/components/auth/auth-modal";
import { SavedWorkspacesModal } from "@/components/auth/saved-workspaces-modal";
import type { TemplateDefinition } from "@/types/template";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  template: TemplateDefinition;
  rowCount?: number;
  isEditingLayout: boolean;
  onToggleEditLayout: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onSaveCloud?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  template,
  rowCount,
  isEditingLayout,
  onToggleEditLayout,
  onExport,
  onShare,
  onSaveCloud,
}) => {
  const { openCommandBar } = useCommandStore();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const cleanTitle = title.replace(/_/g, " ");

  const handleSaveClick = () => {
    if (onSaveCloud) {
      onSaveCloud();
    } else {
      setSaveModalOpen(true);
    }
  };

  return (
    <header className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-gray/15 text-left">
      <div className="space-y-2 max-w-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag label={template.category} />
          {rowCount !== undefined && (
            <span className="text-[11.5px] font-mono text-slate-gray bg-mist-gray px-2 py-0.5 border border-slate-gray/15">
              {rowCount.toLocaleString("id-ID")} baris data teranalisis
            </span>
          )}
        </div>
        <h1 className="font-signifier text-[28px] sm:text-[36px] md:text-[42px] leading-tight text-ink-black font-normal tracking-tight">
          {cleanTitle}
        </h1>
        <p className="text-[14px] sm:text-[15.5px] text-slate-gray italic font-normal">
          {subtitle}
        </p>
      </div>

      <div className="no-print flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1 md:pt-0">
        <button
          type="button"
          onClick={openCommandBar}
          className="flex items-center gap-2 px-3.5 py-2 rounded-none bg-mist-gray hover:bg-slate-gray/15 border border-slate-gray/20 text-[12.5px] sm:text-[13px] text-ink-black transition cursor-pointer"
        >
          <span>Ask anything…</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-paper-white rounded-none border border-slate-gray/20 text-slate-gray">
            ⌘K
          </kbd>
        </button>

        <Button
          variant="filled"
          size="sm"
          className="text-[12.5px] sm:text-[13px] px-3.5 py-2 rounded-none gap-1.5 bg-sienna-brown hover:bg-sienna-brown/90 text-paper-white shadow-2xs"
          onClick={() => setUploadModalOpen(true)}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Unggah Dataset</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-[12.5px] sm:text-[13px] px-3.5 py-2 rounded-none gap-1.5 text-sienna-brown hover:bg-blush-peach/20"
          onClick={handleSaveClick}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Simpan ke Cloud</span>
        </Button>

        <Button
          variant={isEditingLayout ? "filled" : "ghost"}
          size="sm"
          className="text-[12.5px] sm:text-[13px] px-3.5 py-2 rounded-none"
          onClick={onToggleEditLayout}
        >
          {isEditingLayout ? "Selesai Mengedit" : "Sesuaikan Layout"}
        </Button>

        {onExport && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[12.5px] sm:text-[13px] px-3.5 py-2 rounded-none"
            onClick={onExport}
          >
            Ekspor
          </Button>
        )}

        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[12.5px] sm:text-[13px] px-3.5 py-2 rounded-none"
            onClick={onShare}
          >
            Bagikan
          </Button>
        )}
      </div>

      {/* Upload Dataset Modal */}
      <DashboardUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

      {/* Cloud Save Modal */}
      <CloudSaveModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
      />
      <AuthModal />
      <SavedWorkspacesModal />
    </header>
  );
};
