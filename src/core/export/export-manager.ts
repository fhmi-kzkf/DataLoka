import type { DashboardState } from "@/types/template";
import type { EditorialInsight } from "@/types/insight";

export function exportDashboardToJson(
  dashboard: DashboardState,
  insights: EditorialInsight[] = []
): void {
  const payload = {
    exportDate: new Date().toISOString(),
    generator: "DataLoka Editorial Analytics Platform",
    dashboard: {
      id: dashboard.id,
      title: dashboard.title,
      subtitle: dashboard.subtitle,
      templateId: dashboard.templateId,
      kpis: dashboard.kpiCards.map((k) => ({
        title: k.title,
        value: k.kpiMetric?.value,
        formattedValue: k.kpiMetric?.formattedValue,
        delta: k.kpiMetric?.deltaText,
      })),
      charts: dashboard.mainCharts.map((c) => ({
        title: c.title,
        type: c.chartType,
        data: c.data,
      })),
      accentQuote: dashboard.accentCard,
    },
    insights,
  };

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url =
      typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(blob)
        : "blob:mock";
    const link = document.createElement("a");
    const filename = `${dashboard.title.toLowerCase().replace(/\s+/g, "_")}_export.json`;
    link.href = url;
    link.download = filename;
    link.onclick = (e) => {
      if (process.env.NODE_ENV === "test") {
        e.preventDefault();
      }
    };
    document.body.appendChild(link);
    if (typeof link.click === "function") {
      link.click();
    }
    document.body.removeChild(link);
    if (typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(url);
    }
  }
}

export function exportDataToCsv(
  data: Array<Record<string, unknown>>,
  filename = "dataloka_export.csv"
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",")
  );

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url =
      typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(blob)
        : "blob:mock";
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    link.onclick = (e) => {
      if (process.env.NODE_ENV === "test") {
        e.preventDefault();
      }
    };
    document.body.appendChild(link);
    if (typeof link.click === "function") {
      link.click();
    }
    document.body.removeChild(link);
    if (typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(url);
    }
  }
}

export function triggerPrintToPdf(): void {
  if (typeof window !== "undefined" && typeof window.print === "function") {
    window.print();
  }
}
