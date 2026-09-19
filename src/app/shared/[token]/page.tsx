"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { decodeShareToken } from "@/core/share/share-manager";
import { getTemplateById } from "@/core/template/template-registry";
import { StatCard } from "@/components/composite/stat-card";
import { EditorialAccentCard } from "@/components/modules/dashboard/editorial-accent-card";
import { DomainSpecializedWidget } from "@/components/modules/dashboard/domain-specialized-widget";
import { UniversalChartRenderer } from "@/components/charts/universal-chart-renderer";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import type { ChartRecommendation } from "@/types/chart";
import type { SharePayload } from "@/types/insight";

export default function SharedDashboardPage() {
  const params = useParams();
  const [clientToken, setClientToken] = useState<string>("");

  useEffect(() => {
    // Extract token from params or pathname
    const paramToken = Array.isArray(params?.token) ? params.token[0] : (params?.token as string);
    if (paramToken) {
      setClientToken(paramToken);
    } else if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/shared/");
      if (parts[1]) {
        setClientToken(parts[1]);
      }
    }
  }, [params]);

  const payload: SharePayload | null = useMemo(() => {
    if (!clientToken) return null;
    return decodeShareToken(clientToken);
  }, [clientToken]);

  const templateDef = useMemo(() => {
    if (!payload?.templateId) return getTemplateById("general");
    return getTemplateById(payload.templateId);
  }, [payload?.templateId]);

  if (!payload) {
    return (
      <div className="min-h-screen bg-[var(--color-paper-white)] flex items-center justify-center p-6 text-left">
        <div className="text-left max-w-md bg-fog-white border border-slate-gray/20 rounded-none p-8 space-y-4 shadow-xs">
          <span className="text-[11px] font-mono uppercase text-sienna-brown tracking-wider block">
            Snapshot Link
          </span>
          <h2 className="font-signifier text-[26px] text-ink-black font-normal">
            Memuat atau Tautan Tidak Lengkap
          </h2>
          <p className="text-[14px] text-slate-gray leading-relaxed">
            Snapshot dasbor ini sedang didekodekan. Jika tampilan ini tidak berubah, periksa kembali kelengkapan tautan URL Anda.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button variant="filled" size="md" className="rounded-none">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper-white)] text-left">
      {/* Top Banner (Hidden in Print) */}
      <div className="no-print bg-fog-white border-b border-slate-gray/15 px-6 py-2.5 text-center text-[12.5px] text-slate-gray font-mono flex items-center justify-between max-w-[1360px] mx-auto">
        <span>
          PRATINJAU PUBLIK (READ-ONLY) &bull; DATA TERSANITASI
        </span>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-[12px] rounded-none py-1">
            Buat Dasbor Anda Sendiri &rarr;
          </Button>
        </Link>
      </div>

      <header className="no-print max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 py-6 flex items-center justify-between border-b border-slate-gray/15">
        <div className="flex items-center gap-3.5">
          <Link href="/" className="font-signifier text-[22px] sm:text-[24px] tracking-tight text-ink-black hover:opacity-80">
            DataLoka
          </Link>
          <span className="text-[14px] text-slate-gray/50">/</span>
          <span className="text-[12px] font-mono text-slate-gray uppercase tracking-wider bg-mist-gray px-2 py-0.5 border border-slate-gray/15">
            Public Snapshot
          </span>
        </div>
      </header>

      <main className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 py-10 space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="space-y-2 pb-5 border-b border-slate-gray/15">
          <div className="flex items-center gap-2">
            <Tag label={templateDef.name.toUpperCase()} />
            <span className="text-[12px] font-mono text-slate-gray bg-mist-gray px-2 py-0.5 border border-slate-gray/15">
              Sumber: {payload.datasetName || "Dataset Terverifikasi"}
            </span>
          </div>
          <h1 className="font-signifier text-[32px] sm:text-[40px] leading-tight text-ink-black font-normal tracking-tight">
            {payload.title}
          </h1>
          <p className="text-[15px] text-slate-gray italic">{payload.subtitle}</p>
        </div>

        {/* Domain-Specialized Interactive Widget */}
        <DomainSpecializedWidget templateId={payload.templateId} />

        {/* KPI Cards */}
        {payload.kpiCards && payload.kpiCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {payload.kpiCards.map((kpi, idx) => (
              <StatCard
                key={idx}
                label={kpi.title}
                value={kpi.formattedValue}
                delta={kpi.deltaText ? { text: kpi.deltaText, isPositive: kpi.isPositive } : undefined}
                accentColor={templateDef.accentColor}
              />
            ))}
          </div>
        )}

        {/* Accent Quote Card */}
        {payload.accentCard && (
          <EditorialAccentCard
            accent={payload.accentCard}
            accentColor={templateDef.accentColor}
          />
        )}

        {/* Main Charts */}
        {payload.mainCharts && payload.mainCharts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {payload.mainCharts.map((chart, idx) => {
              const rec: ChartRecommendation = {
                id: `shared_chart_${idx}`,
                // @ts-expect-error chartType fallback
                chartType: chart.chartType || "bar",
                title: chart.title,
                subtitle: "Visualisasi Data Publik",
                confidenceScore: 0.95,
                reasoning: "Shared snapshot",
                yAxisColumns: ["Nilai"],
                aggregationType: "sum",
                data: chart.data || [],
                orderIndex: idx,
                availableAlternativeTypes: [],
              };
              return (
                <UniversalChartRenderer
                  key={idx}
                  recommendation={rec}
                  height={320}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
