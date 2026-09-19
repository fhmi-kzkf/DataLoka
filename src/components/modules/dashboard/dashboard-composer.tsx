"use client";

import React, { useMemo, useCallback } from "react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useDatasetStore } from "@/stores/dataset-store";
import { getTemplateById } from "@/core/template/template-registry";
import { DashboardHeader } from "./dashboard-header";
import { TemplateSelectorPill } from "./template-selector-pill";
import { GlobalFilterBar } from "./global-filter-bar";
import { EditorialAccentCard } from "./editorial-accent-card";
import { DomainSpecializedWidget } from "./domain-specialized-widget";
import { UnderlyingDataSheet } from "./underlying-data-sheet";
import { StatCard } from "@/components/composite/stat-card";
import { UniversalChartRenderer } from "@/components/charts/universal-chart-renderer";
import { generateEditorialInsights } from "@/core/insight/insight-generator";
import { InsightGrid } from "@/components/modules/insight/insight-grid";
import { humanizeColumnName, formatCurrencyIDR } from "@/lib/formatters";
import type { ChartRecommendation, ChartType, DataPoint } from "@/types/chart";
import type { DatasetRow } from "@/types/dataset";
import { parseFlexibleDate } from "@/core/mapping/date-normalizer";

interface DashboardComposerProps {
  onExport?: () => void;
  onShare?: () => void;
  rowCount?: number;
}

export const DashboardComposer: React.FC<DashboardComposerProps> = ({
  onExport,
  onShare,
  rowCount,
}) => {
  const {
    dashboard,
    activeTemplateId,
    globalCategoryFilter,
    searchFilter,
    datePreset,
    customDateRange,
    isEditingLayout,
    setTemplate,
    setGlobalCategoryFilter,
    setSearchFilter,
    setDatePreset,
    setCustomDateRange,
    reorderKpis,
    reorderMainCharts,
    changeChartType,
    toggleEditLayout,
  } = useDashboardStore();

  const { dataset } = useDatasetStore();

  const templateDef = useMemo(() => {
    return getTemplateById(activeTemplateId);
  }, [activeTemplateId]);

  // Extract all categories available in main charts data
  const availableCategories = useMemo(() => {
    if (!dashboard) return [];
    const set = new Set<string>();
    dashboard.mainCharts.forEach((chart) => {
      chart.data.forEach((dp) => {
        if (dp.category && isNaN(Number(dp.category))) set.add(String(dp.category));
        if (dp.label && isNaN(Number(dp.label))) set.add(String(dp.label));
      });
    });

    if (dataset?.rows) {
      dataset.rows.forEach((row) => {
        const cat = row["kategori"] || row["Kategori"] || row["wilayah"] || row["Wilayah"];
        if (cat) set.add(String(cat));
      });
    }

    return Array.from(set).slice(0, 12);
  }, [dashboard, dataset]);

  // Filter raw dataset rows dynamically based on category, search, and date range
  const filteredDatasetRows = useMemo(() => {
    const rawRows = dataset?.rows || [];
    if (rawRows.length === 0) return [];

    return rawRows.filter((row) => {
      // 1. Category Filter
      if (globalCategoryFilter) {
        const matchesCategory = Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().trim() === globalCategoryFilter.toLowerCase().trim();
        });
        if (!matchesCategory) return false;
      }

      // 2. Search Filter
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const matchesSearch = Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
        if (!matchesSearch) return false;
      }

      // 3. Date Range Filter
      if (datePreset !== "all" || customDateRange) {
        const dateVal = row["tanggal"] || row["Tanggal"] || row["date"] || row["Date"];
        const parsed = parseFlexibleDate(dateVal);
        if (parsed) {
          if (customDateRange?.startDate && customDateRange?.endDate) {
            const start = new Date(customDateRange.startDate).getTime();
            const end = new Date(customDateRange.endDate).getTime();
            const time = parsed.getTime();
            if (time < start || time > end) return false;
          }
        }
      }

      return true;
    });
  }, [dataset?.rows, globalCategoryFilter, searchFilter, datePreset, customDateRange]);

  // Apply filters to chart data points
  const filterData = useCallback(
    (data: DataPoint[]): DataPoint[] => {
      let result = data;
      if (globalCategoryFilter) {
        result = result.filter(
          (dp) =>
            dp.category === globalCategoryFilter ||
            dp.label === globalCategoryFilter ||
            String(dp.category).toLowerCase() === globalCategoryFilter.toLowerCase() ||
            String(dp.label).toLowerCase() === globalCategoryFilter.toLowerCase()
        );
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        result = result.filter(
          (dp) =>
            dp.label.toLowerCase().includes(q) ||
            (dp.category && String(dp.category).toLowerCase().includes(q))
        );
      }
      return result;
    },
    [globalCategoryFilter, searchFilter]
  );

  // Dynamic KPI Calculation based on filtered dataset rows
  const computedKpis = useMemo(() => {
    if (!dashboard) return [];
    if (!dataset?.rows || dataset.rows.length === 0 || filteredDatasetRows.length === dataset.rows.length) {
      return dashboard.kpiCards;
    }

    // Recalculate KPI cards with filtered values
    return dashboard.kpiCards.map((kpi) => {
      const colName = kpi.yAxisColumns[0];
      if (!colName) return kpi;

      if (colName === "aov_aktual" || colName === "aov") {
        let rev = 0;
        let ord = 0;
        filteredDatasetRows.forEach((r) => {
          const revVal = Number(r["total_penjualan"] || r["omset"] || r["Total_Penjualan"] || 0);
          const ordVal = Number(r["jumlah_pesanan"] || r["qty"] || r["Jumlah_Pesanan"] || 0);
          rev += isNaN(revVal) ? 0 : revVal;
          ord += isNaN(ordVal) ? 0 : ordVal;
        });
        const aov = ord > 0 ? Math.round(rev / ord) : 0;
        return {
          ...kpi,
          kpiMetric: {
            title: "AOV Aktual",
            value: aov,
            formattedValue: formatCurrencyIDR(aov),
            deltaText: "(Segmen Terfilter)",
            isPositive: true,
            sparklineData: kpi.kpiMetric?.sparklineData || [10, 20, 30],
          },
        };
      }

      let sum = 0;
      filteredDatasetRows.forEach((r) => {
        const val = Number(r[colName]);
        if (!isNaN(val)) sum += val;
      });

      const isCurr = /penjualan|omset|pendapatan|revenue|harga/i.test(colName);
      return {
        ...kpi,
        kpiMetric: {
          title: kpi.title,
          value: sum,
          formattedValue: isCurr
            ? formatCurrencyIDR(sum)
            : sum.toLocaleString("id-ID"),
          deltaText: "(Segmen Terfilter)",
          isPositive: true,
          sparklineData: kpi.kpiMetric?.sparklineData || [10, 20, 30],
        },
      };
    });
  }, [dashboard, dataset?.rows, filteredDatasetRows]);

  const filteredMainCharts = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.mainCharts.map((chart) => {
      // If cross-filter is active and chart is category breakdown, highlight or preserve full series for contrast
      const isCategoryChart = chart.chartType === "donut" || chart.chartType === "horizontal_bar";
      return {
        ...chart,
        data: isCategoryChart ? chart.data : filterData(chart.data),
      };
    });
  }, [dashboard, filterData]);

  const insights = useMemo(() => {
    if (!dashboard) return [];
    return generateEditorialInsights(computedKpis, dashboard.mainCharts);
  }, [dashboard, computedKpis]);

  // Cross-filter click handler from ECharts
  const handleChartClick = useCallback(
    (params: { name?: string; seriesName?: string }) => {
      if (!params.name) return;
      const clickedName = params.name.trim();

      // Toggle filter
      if (globalCategoryFilter && globalCategoryFilter.toLowerCase() === clickedName.toLowerCase()) {
        setGlobalCategoryFilter(null);
      } else {
        setGlobalCategoryFilter(clickedName);
      }
    },
    [globalCategoryFilter, setGlobalCategoryFilter]
  );

  if (!dashboard) {
    return (
      <div className="w-full py-16 px-4 text-center bg-mist-gray/40 rounded-none border border-slate-gray/15">
        <h3 className="font-signifier text-[24px] text-ink-black mb-2 font-normal">
          Belum ada dashboard aktif
        </h3>
        <p className="text-[14px] text-slate-gray max-w-md mx-auto">
          Unggah dataset atau jalankan decision engine untuk mengompilasi dashboard editorial otomatis.
        </p>
      </div>
    );
  }

  const layout = templateDef.recommendedLayout;
  const rawHeaders = dataset?.headers || (dataset?.rows && dataset.rows[0] ? Object.keys(dataset.rows[0]) : []);

  return (
    <div className="w-full space-y-8 animate-fadeIn text-left">
      {/* 1. Dashboard Header */}
      <DashboardHeader
        title={dashboard.title}
        subtitle={dashboard.subtitle}
        template={templateDef}
        rowCount={rowCount}
        isEditingLayout={isEditingLayout}
        onToggleEditLayout={toggleEditLayout}
        onExport={onExport}
        onShare={onShare}
      />

      {/* 2. Template Selector Pills */}
      <div className="no-print">
        <TemplateSelectorPill
          activeTemplateId={activeTemplateId}
          onSelectTemplate={setTemplate}
        />
      </div>

      {/* 2b. Domain-Specialized Interactive Widget (Custom Personality per Template) */}
      <DomainSpecializedWidget templateId={activeTemplateId} />

      {/* 3. Global Filter Bar with Scalable Date Range Picker */}
      <div className="no-print">
        <GlobalFilterBar
          categories={availableCategories}
          selectedCategory={globalCategoryFilter}
          onSelectCategory={setGlobalCategoryFilter}
          datePreset={datePreset}
          onSelectDatePreset={setDatePreset}
          customDateRange={customDateRange}
          onCustomDateChange={setCustomDateRange}
          searchQuery={searchFilter}
          onSearchChange={setSearchFilter}
          onResetFilters={() => {
            setGlobalCategoryFilter(null);
            setSearchFilter("");
            setDatePreset("all");
            setCustomDateRange(null);
          }}
        />
      </div>

      {/* 4. KPI Cards Row (Total Penjualan, Jumlah Pesanan, AOV Aktual) */}
      {computedKpis.length > 0 && (
        <section aria-label="Key Performance Indicators" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-none inline-block"
                style={{ backgroundColor: templateDef.accentColor || "#9e472a" }}
              />
              <h2 className="text-[13px] font-mono font-bold text-slate-gray uppercase tracking-wider">
                {templateDef.specializedMetricsHeader || "Metrik Kunci Utama"}
              </h2>
            </div>
            {isEditingLayout && (
              <span className="text-[12px] text-slate-gray italic font-mono">
                Gunakan panah untuk mengubah posisi KPI
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {computedKpis.map((kpi, idx) => {
              const metric = kpi.kpiMetric;
              return (
                <div key={kpi.id} className="relative group">
                  <StatCard
                    label={humanizeColumnName(kpi.title)}
                    value={metric?.formattedValue || metric?.value?.toString() || "-"}
                    delta={metric?.deltaText ? { text: metric.deltaText, isPositive: metric.isPositive } : undefined}
                    sparklineData={metric?.sparklineData}
                    accentColor={templateDef.accentColor}
                  />
                  {isEditingLayout && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-paper-white/95 p-1 shadow-subtle border border-slate-gray/20">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => reorderKpis(idx, idx - 1)}
                        className="px-2 py-0.5 text-xs text-ink-black disabled:opacity-30 hover:bg-mist-gray cursor-pointer"
                        title="Geser Kiri"
                      >
                        &larr;
                      </button>
                      <button
                        type="button"
                        disabled={idx === computedKpis.length - 1}
                        onClick={() => reorderKpis(idx, idx + 1)}
                        className="px-2 py-0.5 text-xs text-ink-black disabled:opacity-30 hover:bg-mist-gray cursor-pointer"
                        title="Geser Kanan"
                      >
                        &rarr;
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Main Charts & Editorial Layout */}
      <section aria-label="Visual Analytics & Charts" className="space-y-6">
        {/* Layout Mode: Grid 2-Column / Retail Grid / Swiss Dense */}
        {(layout === "grid_2col" || layout === "retail_grid" || layout === "swiss_dense") && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMainCharts.slice(0, 2).map((chart, idx) => (
                <ChartSlot
                  key={chart.id}
                  chart={chart}
                  index={idx}
                  isEditing={isEditingLayout}
                  totalCharts={filteredMainCharts.length}
                  onMove={(from, to) => reorderMainCharts(from, to)}
                  onSwapType={(type) => changeChartType(chart.id, type)}
                  onChartClick={handleChartClick}
                />
              ))}
            </div>

            {/* Editorial Accent Card Banner */}
            {dashboard.accentCard && (
              <EditorialAccentCard
                accent={dashboard.accentCard}
                accentColor={templateDef.accentColor}
              />
            )}

            {/* Remaining Charts */}
            {filteredMainCharts.length > 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredMainCharts.slice(2).map((chart, idx) => (
                  <ChartSlot
                    key={chart.id}
                    chart={chart}
                    index={idx + 2}
                    isEditing={isEditingLayout}
                    totalCharts={filteredMainCharts.length}
                    onMove={(from, to) => reorderMainCharts(from, to)}
                    onSwapType={(type) => changeChartType(chart.id, type)}
                    onChartClick={handleChartClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Layout Mode: Collage / Growth Matrix / Sentiment Polar / Logistics Dispatch */}
        {(layout === "collage" || layout === "growth_matrix" || layout === "sentiment_polar" || layout === "logistics_dispatch") && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hero Chart (Span 2) */}
              {filteredMainCharts[0] && (
                <div className="lg:col-span-2">
                  <ChartSlot
                    chart={filteredMainCharts[0]}
                    index={0}
                    isEditing={isEditingLayout}
                    totalCharts={filteredMainCharts.length}
                    onMove={(from, to) => reorderMainCharts(from, to)}
                    onSwapType={(type) => changeChartType(filteredMainCharts[0].id, type)}
                    onChartClick={handleChartClick}
                    height={380}
                  />
                </div>
              )}

              {/* Accent Card in side column */}
              {dashboard.accentCard && (
                <div className="lg:col-span-1 flex flex-col">
                  <EditorialAccentCard
                    accent={dashboard.accentCard}
                    accentColor={templateDef.accentColor}
                    className="h-full"
                  />
                </div>
              )}
            </div>

            {/* Secondary Charts */}
            {filteredMainCharts.length > 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredMainCharts.slice(1).map((chart, idx) => (
                  <ChartSlot
                    key={chart.id}
                    chart={chart}
                    index={idx + 1}
                    isEditing={isEditingLayout}
                    totalCharts={filteredMainCharts.length}
                    onMove={(from, to) => reorderMainCharts(from, to)}
                    onSwapType={(type) => changeChartType(chart.id, type)}
                    onChartClick={handleChartClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Layout Mode: KPI-Heavy / Fiscal Ledger / Funnel Flow / People Pulse */}
        {(layout === "kpi_heavy" || layout === "fiscal_ledger" || layout === "funnel_flow" || layout === "people_pulse") && (
          <div className="space-y-6">
            {dashboard.accentCard && (
              <EditorialAccentCard
                accent={dashboard.accentCard}
                accentColor={templateDef.accentColor}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMainCharts.map((chart, idx) => (
                <ChartSlot
                  key={chart.id}
                  chart={chart}
                  index={idx}
                  isEditing={isEditingLayout}
                  totalCharts={filteredMainCharts.length}
                  onMove={(from, to) => reorderMainCharts(from, to)}
                  onSwapType={(type) => changeChartType(chart.id, type)}
                  onChartClick={handleChartClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Layout Mode: Full Width */}
        {layout === "full_width" && (
          <div className="space-y-6">
            {filteredMainCharts.map((chart, idx) => (
              <React.Fragment key={chart.id}>
                <ChartSlot
                  chart={chart}
                  index={idx}
                  isEditing={isEditingLayout}
                  totalCharts={filteredMainCharts.length}
                  onMove={(from, to) => reorderMainCharts(from, to)}
                  onSwapType={(type) => changeChartType(chart.id, type)}
                  onChartClick={handleChartClick}
                  height={380}
                />
                {idx === 0 && dashboard.accentCard && (
                  <EditorialAccentCard
                    accent={dashboard.accentCard}
                    accentColor={templateDef.accentColor}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </section>

      {/* 6. Automated Editorial Insights & Synthesis */}
      {insights.length > 0 && (
        <InsightGrid insights={insights} />
      )}

      {/* 7. Underlying Data Table Viewer (Collapsible Raw Data Sheet) */}
      {rawHeaders.length > 0 && (
        <section aria-label="Underlying Data Table" className="pt-4">
          <UnderlyingDataSheet
            rows={filteredDatasetRows.length > 0 ? filteredDatasetRows : (dataset?.rows || [])}
            headers={rawHeaders}
            totalRowCount={dataset?.rowCount || dataset?.rows?.length}
            activeCategoryFilter={globalCategoryFilter}
          />
        </section>
      )}
    </div>
  );
};

interface ChartSlotProps {
  chart: ChartRecommendation;
  index: number;
  isEditing: boolean;
  totalCharts: number;
  onMove: (from: number, to: number) => void;
  onSwapType: (type: ChartType) => void;
  onChartClick?: (params: { name?: string; seriesName?: string }) => void;
  height?: number;
}

const ChartSlot: React.FC<ChartSlotProps> = ({
  chart,
  index,
  isEditing,
  totalCharts,
  onMove,
  onSwapType,
  onChartClick,
  height = 320,
}) => {
  return (
    <div className="relative group">
      {isEditing && (
        <div className="absolute top-3 right-16 z-20 flex items-center gap-1 bg-paper-white/95 px-2 py-1 shadow-subtle border border-slate-gray/20 text-xs">
          <span className="text-slate-gray mr-1 font-mono">Urutan:</span>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            className="px-1.5 py-0.5 text-ink-black disabled:opacity-30 hover:bg-mist-gray cursor-pointer"
            title="Pindah Ke Atas / Kiri"
          >
            &uarr;
          </button>
          <button
            type="button"
            disabled={index === totalCharts - 1}
            onClick={() => onMove(index, index + 1)}
            className="px-1.5 py-0.5 text-ink-black disabled:opacity-30 hover:bg-mist-gray cursor-pointer"
            title="Pindah Ke Bawah / Kanan"
          >
            &darr;
          </button>
        </div>
      )}
      <UniversalChartRenderer
        recommendation={chart}
        height={height}
        onSwapType={onSwapType}
        onChartClick={onChartClick}
      />
    </div>
  );
};
