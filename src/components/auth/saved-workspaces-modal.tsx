"use client";

import React, { useEffect, useState } from "react";
import { X, Folder, Calendar, Table2, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { CloudWorkspaceService, type SavedCloudDashboard } from "@/core/storage/cloud-workspace-service";
import { Button } from "@/components/ui/button";

export const SavedWorkspacesModal: React.FC = () => {
  const { user, savedWorkspacesModalOpen, setSavedWorkspacesModalOpen } = useAuthStore();
  const router = useRouter();

  const [dashboards, setDashboards] = useState<SavedCloudDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!savedWorkspacesModalOpen) return;

    const loadDashboards = async () => {
      setIsLoading(true);
      const userId = user?.uid || "guest";
      const list = await CloudWorkspaceService.listUserDashboards(userId);
      setDashboards(list);
      setIsLoading(false);
    };

    loadDashboards();
  }, [savedWorkspacesModalOpen, user?.uid]);

  if (!savedWorkspacesModalOpen) return null;

  const handleOpenDashboard = (item: SavedCloudDashboard) => {
    const state = item.dashboardState;
    useDashboardStore.setState({
      dashboard: {
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        datasetId: state?.datasetId || "dataset_cloud",
        templateId: item.templateId,
        kpiCards: state?.kpiCards || [],
        mainCharts: state?.mainCharts || [],
        accentCard: state?.accentCard,
        createdAt: item.updatedAt,
      },
      activeTemplateId: item.templateId,
      globalCategoryFilter: null,
      searchFilter: "",
    });
    setSavedWorkspacesModalOpen(false);
    router.push("/dashboard");
  };

  const handleDeleteDashboard = async (e: React.MouseEvent, item: SavedCloudDashboard) => {
    e.stopPropagation();
    if (!confirm(`Hapus workspace "${item.title}"?`)) return;

    await CloudWorkspaceService.deleteDashboard(item.id, user?.uid || "guest");
    setDashboards((prev) => prev.filter((d) => d.id !== item.id));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-xs antialiased"
    >
      <div
        className="relative w-full max-w-[640px] max-h-[85vh] flex flex-col bg-paper-white border border-slate-gray/30 shadow-subtle p-6 sm:p-8 text-left transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setSavedWorkspacesModalOpen(false)}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-none bg-mist-gray hover:bg-ink-black text-ink-black hover:text-paper-white border border-slate-gray/30 hover:border-ink-black transition-all cursor-pointer shadow-2xs group"
          aria-label="Tutup dialog"
        >
          <X className="w-4 h-4 stroke-[2.5] transition-transform group-hover:scale-110" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6 pb-4 border-b border-slate-gray/15">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-slate-gray tracking-wider">
            <Folder className="w-3.5 h-3.5 text-sienna-brown" />
            <span>Penyimpanan Cloud Workspace</span>
          </div>
          <h3 className="font-signifier text-[26px] font-normal text-ink-black">
            Dashboard Tersimpan
          </h3>
          <p className="text-[13px] text-slate-gray">
            Daftar snapshot analitik dan dataset yang telah disimpan ke cloud akun Anda.
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-gray space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-sienna-brown" />
              <span className="text-[13px] font-mono">Mengambil data dari cloud...</span>
            </div>
          ) : dashboards.length === 0 ? (
            <div className="text-center py-12 bg-fog-white border border-dashed border-slate-gray/25 p-6 space-y-3">
              <Folder className="w-8 h-8 text-slate-gray/40 mx-auto" />
              <p className="text-[14px] font-medium text-ink-black">
                Belum ada dashboard yang tersimpan di cloud.
              </p>
              <p className="text-[12.5px] text-slate-gray max-w-sm mx-auto">
                Buka dashboard Anda lalu klik tombol &quot;Simpan ke Cloud&quot; di bagian atas untuk menyimpan snapshot ke akun Anda.
              </p>
            </div>
          ) : (
            dashboards.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenDashboard(item)}
                className="group p-4 bg-fog-white hover:bg-paper-white border border-slate-gray/20 hover:border-sienna-brown/60 transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-blush-peach/40 text-sienna-brown px-1.5 py-0.5 border border-sienna-brown/20 font-semibold">
                      {item.templateId}
                    </span>
                    <h4 className="text-[14.5px] font-medium text-ink-black truncate group-hover:text-sienna-brown transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  <p className="text-[12px] text-slate-gray truncate max-w-md">
                    {item.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-gray pt-1">
                    <span className="flex items-center gap-1">
                      <Table2 className="w-3 h-3" />
                      {item.datasetName} {item.rowCount > 0 && `(${item.rowCount} baris)`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.updatedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteDashboard(e, item)}
                    className="p-2 text-slate-gray hover:text-[#dc2626] hover:bg-[#fef2f2] transition-all"
                    title="Hapus Workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Button
                    variant="filled"
                    size="sm"
                    className="text-[12px] py-1.5 px-3 group-hover:bg-sienna-brown transition-all"
                  >
                    <span>Buka</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-gray/15 flex items-center justify-between text-[11px] font-mono text-slate-gray">
          <span>Total: {dashboards.length} Workspace Tersimpan</span>
          <button
            type="button"
            onClick={() => setSavedWorkspacesModalOpen(false)}
            className="text-ink-black hover:underline"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
