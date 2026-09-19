import type { EChartsOption } from "echarts";
import type { ChartRecommendation } from "@/types/chart";
import { ECHARTS_EDITORIAL_THEME } from "./chart-theme";
import { humanizeColumnName } from "@/lib/formatters";

export function buildEChartsOption(recommendation: ChartRecommendation): EChartsOption {
  const chartType = recommendation?.chartType || "bar";
  const data = recommendation?.data || [];
  const yAxisColumns = recommendation?.yAxisColumns || ["Nilai"];
  const xAxisColumn = recommendation?.xAxisColumn || "";
  const theme = ECHARTS_EDITORIAL_THEME;

  const categories = data.map((d) => String(d?.label ?? ""));
  const primaryValues = data.map((d) => (typeof d?.value === "number" ? d.value : 0));
  const secondaryValues = data.map((d) => d?.secondaryValue ?? 0);

  const hasSecondary = yAxisColumns.length > 1 && data.some((d) => d.secondaryValue !== undefined);

  // Base options shared across chart types
  const baseOption: EChartsOption = {
    animation: true,
    animationDuration: 800,
    animationEasing: "cubicOut",
    color: theme.palette,
    textStyle: {
      fontFamily: "var(--font-sohne), sans-serif",
    },
    tooltip: {
      trigger: chartType === "donut" || chartType === "pie" ? "item" : "axis",
      ...theme.tooltip,
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: theme.colors.slateGray,
        },
      },
    },
    grid: {
      ...theme.grid,
      right: hasSecondary ? 60 : 25,
      left: 60,
    },
  };

  // 1. Line & Area Chart (with Dual Y-Axis support)
  if (chartType === "line" || chartType === "area") {
    const isArea = chartType === "area";
    const primaryName = humanizeColumnName(yAxisColumns[0]) || "Nilai";
    const secondaryName = hasSecondary ? humanizeColumnName(yAxisColumns[1]) : "";

    const series: EChartsOption["series"] = [
      {
        name: primaryName,
        type: "line",
        smooth: true,
        showSymbol: data.length < 20,
        symbolSize: 6,
        yAxisIndex: 0,
        itemStyle: {
          color: theme.colors.siennaBrown,
        },
        lineStyle: {
          width: 2.5,
          color: theme.colors.siennaBrown,
        },
        areaStyle: isArea
          ? {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(251, 225, 209, 0.65)" },
                  { offset: 1, color: "rgba(251, 225, 209, 0.05)" },
                ],
              },
            }
          : undefined,
        data: primaryValues,
      },
    ];

    if (hasSecondary) {
      series.push({
        name: secondaryName,
        type: "line",
        smooth: true,
        showSymbol: data.length < 20,
        symbolSize: 6,
        yAxisIndex: 1, // Dual Y-Axis (Right Sumbu)
        itemStyle: {
          color: theme.colors.inkBlack,
        },
        lineStyle: {
          width: 2,
          color: theme.colors.inkBlack,
          type: "dashed",
        },
        data: secondaryValues,
      });
    }

    const yAxisConfig: EChartsOption["yAxis"] = hasSecondary
      ? [
          // Left Axis: Revenue / Primary Currency
          {
            type: "value",
            name: primaryName,
            nameTextStyle: {
              color: theme.colors.slateGray,
              fontSize: 11,
            },
            axisLine: { show: false },
            splitLine: theme.splitLine,
            axisLabel: {
              ...theme.axisLabel,
              formatter: (val: number) => {
                if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}Jt`;
                if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}k`;
                return `Rp ${val}`;
              },
            },
          },
          // Right Axis: Order Volume / Quantity
          {
            type: "value",
            name: secondaryName,
            position: "right",
            nameTextStyle: {
              color: theme.colors.slateGray,
              fontSize: 11,
            },
            axisLine: { show: false },
            splitLine: { show: false },
            axisLabel: {
              ...theme.axisLabel,
              formatter: (val: number) => `${val.toLocaleString("id-ID")}`,
            },
          },
        ]
      : {
          type: "value",
          axisLine: { show: false },
          splitLine: theme.splitLine,
          axisLabel: theme.axisLabel,
        };

    return {
      ...baseOption,
      legend: hasSecondary
        ? {
            show: true,
            top: 0,
            right: 0,
            icon: "roundRect",
            itemWidth: 12,
            itemHeight: 4,
            textStyle: {
              color: theme.colors.slateGray,
              fontSize: 11,
            },
          }
        : undefined,
      xAxis: {
        type: "category",
        data: categories,
        axisLine: theme.axisLine,
        axisTick: { show: false },
        axisLabel: theme.axisLabel,
      },
      yAxis: yAxisConfig,
      series,
    };
  }

  // 2. Vertical Bar & Grouped Bar Chart
  if (chartType === "bar" || chartType === "grouped_bar") {
    const primaryName = humanizeColumnName(yAxisColumns[0]) || "Nilai";
    const series: EChartsOption["series"] = [
      {
        name: primaryName,
        type: "bar",
        barMaxWidth: 36,
        itemStyle: {
          color: theme.colors.siennaBrown,
          borderRadius: [4, 4, 0, 0],
        },
        data: primaryValues,
      },
    ];

    if (hasSecondary) {
      series.push({
        name: humanizeColumnName(yAxisColumns[1]),
        type: "bar",
        barMaxWidth: 36,
        itemStyle: {
          color: theme.colors.inkBlack,
          borderRadius: [4, 4, 0, 0],
        },
        data: secondaryValues,
      });
    }

    return {
      ...baseOption,
      xAxis: {
        type: "category",
        data: categories,
        axisLine: theme.axisLine,
        axisTick: { show: false },
        axisLabel: {
          ...theme.axisLabel,
          interval: 0,
          rotate: categories.some((c) => c.length > 8) ? 30 : 0,
        },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        splitLine: theme.splitLine,
        axisLabel: theme.axisLabel,
      },
      series,
    };
  }

  // 3. Horizontal Bar Chart
  if (chartType === "horizontal_bar") {
    const revCategories = [...categories].reverse();
    const revValues = [...primaryValues].reverse();

    return {
      ...baseOption,
      xAxis: {
        type: "value",
        axisLine: { show: false },
        splitLine: theme.splitLine,
        axisLabel: theme.axisLabel,
      },
      yAxis: {
        type: "category",
        data: revCategories,
        axisLine: theme.axisLine,
        axisTick: { show: false },
        axisLabel: {
          ...theme.axisLabel,
          formatter: (value: string) => (value.length > 14 ? `${value.slice(0, 13)}…` : value),
        },
      },
      series: [
        {
          name: humanizeColumnName(yAxisColumns[0]) || "Nilai",
          type: "bar",
          barMaxWidth: 24,
          itemStyle: {
            color: theme.colors.inkBlack,
            borderRadius: [0, 4, 4, 0],
          },
          data: revValues,
        },
      ],
    };
  }

  // 4. Donut & Pie Chart
  if (chartType === "donut" || chartType === "pie") {
    const isDonut = chartType === "donut";
    const pieData = data.map((d) => ({
      name: d.label,
      value: d.value,
    }));

    return {
      ...baseOption,
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
        ...theme.tooltip,
      },
      legend: {
        orient: "horizontal",
        bottom: 0,
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          color: theme.colors.slateGray,
          fontSize: 11,
          fontFamily: "var(--font-sohne), sans-serif",
        },
      },
      series: [
        {
          name: humanizeColumnName(yAxisColumns[0]) || "Kategori",
          type: "pie",
          radius: isDonut ? ["50%", "75%"] : "75%",
          center: ["50%", "45%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 4,
            borderColor: theme.colors.paperWhite,
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: "bold",
              formatter: "{b}\n{d}%",
            },
          },
          data: pieData,
        },
      ],
    };
  }

  // 5. Scatter Plot
  if (chartType === "scatter") {
    const scatterData = data.map((d) => [d.value, d.secondaryValue ?? 0]);
    const xName = humanizeColumnName(xAxisColumn) || "X";
    const yName = humanizeColumnName(yAxisColumns[0]) || "Y";

    return {
      ...baseOption,
      tooltip: {
        trigger: "item",
        formatter: (params: unknown) => {
          const item = params as { value: [number, number] };
          const val = item.value;
          return `${xName}: ${val[0].toLocaleString("id-ID")}<br/>${yName}: ${val[1].toLocaleString("id-ID")}`;
        },
        ...theme.tooltip,
      },
      xAxis: {
        type: "value",
        name: xName,
        axisLine: theme.axisLine,
        splitLine: theme.splitLine,
        axisLabel: theme.axisLabel,
      },
      yAxis: {
        type: "value",
        name: yName,
        axisLine: { show: false },
        splitLine: theme.splitLine,
        axisLabel: theme.axisLabel,
      },
      series: [
        {
          name: "Sebaran Data",
          type: "scatter",
          symbolSize: 10,
          itemStyle: {
            color: theme.colors.siennaBrown,
            borderColor: theme.colors.blushPeach,
            borderWidth: 1.5,
          },
          data: scatterData,
        },
      ],
    };
  }

  // Fallback
  return baseOption;
}
