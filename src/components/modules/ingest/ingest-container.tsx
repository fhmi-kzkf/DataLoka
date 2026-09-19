import React from "react";
import { useDatasetStore, IngestTab } from "@/stores/dataset-store";
import { IngestDropzone } from "./ingest-dropzone";
import { GSheetInput } from "./gsheet-input";
import { ClipboardPasteArea } from "./clipboard-paste-area";
import { IngestProgress } from "./ingest-progress";
import { TablePreview } from "./table-preview";

export interface IngestContainerProps {
  onProceedToMapping?: () => void;
  className?: string;
}

export function IngestContainer({ onProceedToMapping, className }: IngestContainerProps) {
  const {
    dataset,
    isIngesting,
    progress,
    progressStage,
    progressMessage,
    error,
    activeTab,
    setActiveTab,
    ingestFile,
    ingestGoogleSheet,
    ingestClipboard,
    switchSheet,
    reset,
  } = useDatasetStore();

  const tabs: { id: IngestTab; label: string }[] = [
    { id: "upload", label: "Unggah File" },
    { id: "gsheet", label: "Google Sheets" },
    { id: "clipboard", label: "Tempel Data" },
  ];

  if (isIngesting) {
    return (
      <div className="py-12">
        <IngestProgress percentage={progress} stage={progressStage} message={progressMessage} />
      </div>
    );
  }

  if (dataset) {
    return (
      <TablePreview
        dataset={dataset}
        onProceed={onProceedToMapping}
        onReset={reset}
        onSwitchSheet={switchSheet}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      {/* Tabs Selector */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 text-[14px] font-medium rounded-none border transition-all cursor-pointer select-none ${
              activeTab === tab.id
                ? "bg-[var(--color-ink-black)] text-[var(--color-paper-white)] border-ink-black shadow-xs"
                : "bg-[var(--color-mist-gray)] text-[var(--color-slate-gray)] border-slate-gray/20 hover:text-[var(--color-ink-black)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 max-w-xl mx-auto p-4 rounded-none bg-red-50 border border-red-200 text-red-700 text-[14px]">
          <p className="font-medium mb-1 font-mono">Terjadi Kesalahan</p>
          <p>{error}</p>
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === "upload" && <IngestDropzone onFileSelected={ingestFile} />}
      {activeTab === "gsheet" && <GSheetInput onSubmit={ingestGoogleSheet} />}
      {activeTab === "clipboard" && <ClipboardPasteArea onPasteSubmit={ingestClipboard} />}
    </div>
  );
}
