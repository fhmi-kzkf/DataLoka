"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  TreemapChart,
  SunburstChart,
  HeatmapChart,
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  VisualMapComponent,
} from "echarts/components";
import type { EChartsOption, EChartsType } from "echarts";
import { cn } from "@/lib/utils";

// Explicitly register renderers and components for Turbopack/Vite tree-shaking compatibility
const echartsModule = echarts as unknown as { use?: (plugins: unknown[]) => void };
if (typeof echartsModule?.use === "function") {
  echartsModule.use([
    CanvasRenderer,
    SVGRenderer,
    BarChart,
    LineChart,
    PieChart,
    ScatterChart,
    TreemapChart,
    SunburstChart,
    HeatmapChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DataZoomComponent,
    ToolboxComponent,
    VisualMapComponent,
  ]);
}

export interface ChartContainerProps {
  option: EChartsOption;
  height?: number | string;
  width?: number | string;
  isLoading?: boolean;
  className?: string;
  onChartReady?: (instance: EChartsType) => void;
  onChartClick?: (params: { name?: string; seriesName?: string; dataIndex?: number }) => void;
}

export function ChartContainer({
  option,
  height = 320,
  width = "100%",
  isLoading = false,
  className,
  onChartReady,
  onChartClick,
}: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<EChartsType | null>(null);

  // Initialize ECharts instance
  useEffect(() => {
    if (!containerRef.current) return;

    // Dispose existing if any
    if (chartInstanceRef.current && !chartInstanceRef.current.isDisposed()) {
      chartInstanceRef.current.dispose();
    }

    let instance: EChartsType;
    try {
      instance = echarts.init(containerRef.current, null, {
        renderer: "canvas",
      });
    } catch {
      instance = echarts.init(containerRef.current);
    }

    chartInstanceRef.current = instance;
    onChartReady?.(instance);

    if (onChartClick && typeof instance.on === "function") {
      instance.on("click", (params: { name?: string; seriesName?: string; dataIndex?: number }) => {
        if (params?.name) {
          onChartClick({
            name: params.name,
            seriesName: params.seriesName,
            dataIndex: params.dataIndex,
          });
        }
      });
    }

    // Setup ResizeObserver for zero-layout-shift auto-resizing
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        if (chartInstanceRef.current && !chartInstanceRef.current.isDisposed()) {
          chartInstanceRef.current.resize();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
      if (chartInstanceRef.current && !chartInstanceRef.current.isDisposed()) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [onChartReady]);

  // Update options reactively
  useEffect(() => {
    if (chartInstanceRef.current && !chartInstanceRef.current.isDisposed()) {
      chartInstanceRef.current.setOption(option, true);
    }
  }, [option]);

  // Update loading state
  useEffect(() => {
    if (!chartInstanceRef.current || chartInstanceRef.current.isDisposed()) return;

    if (isLoading) {
      chartInstanceRef.current.showLoading({
        text: "Memuat grafik...",
        color: "#17191c",
        textColor: "#777b86",
        maskColor: "rgba(255, 255, 255, 0.8)",
      });
    } else {
      chartInstanceRef.current.hideLoading();
    }
  }, [isLoading]);

  return (
    <div
      ref={containerRef}
      data-testid="echarts-container"
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: typeof width === "number" ? `${width}px` : width,
      }}
      className={cn("relative overflow-hidden select-none", className)}
    />
  );
}
