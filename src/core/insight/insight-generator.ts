import type { ChartRecommendation } from "@/types/chart";
import type { EditorialInsight } from "@/types/insight";

export function generateEditorialInsights(
  kpiCards: ChartRecommendation[],
  mainCharts: ChartRecommendation[]
): EditorialInsight[] {
  const insights: EditorialInsight[] = [];

  // 1. Top Performer Analysis from Category/Bar/Donut charts
  const categoryChart = mainCharts.find(
    (c) =>
      c.chartType === "donut" ||
      c.chartType === "bar" ||
      c.chartType === "horizontal_bar" ||
      c.chartType === "pie"
  );

  if (categoryChart && categoryChart.data.length > 0) {
    const sorted = [...categoryChart.data].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((acc, curr) => acc + curr.value, 0);
    const topItem = sorted[0];

    if (total > 0 && topItem) {
      const percentage = ((topItem.value / total) * 100).toFixed(1);
      insights.push({
        id: "insight_top_performer",
        type: "top_performer",
        title: `Kontributor Utama: ${topItem.label}`,
        description: `Segmen "${topItem.label}" mendominasi dengan kontribusi ${percentage}% dari total volume terakumulasi (${formatValue(topItem.value)}).`,
        metricValue: `${percentage}%`,
        sentiment: "positive",
        confidenceScore: 0.92,
        recommendedAction: "Pertahankan ketersediaan stok dan alokasikan promosi khusus untuk segmen unggulan ini.",
      });

      // 2. Pareto / Concentration Indicator
      if (sorted.length >= 3) {
        const top2Total = sorted.slice(0, 2).reduce((acc, c) => acc + c.value, 0);
        const top2Ratio = ((top2Total / total) * 100).toFixed(1);
        if (Number(top2Ratio) > 60) {
          insights.push({
            id: "insight_concentration",
            type: "concentration",
            title: "Konsentrasi Pendapatan Terpusat",
            description: `Dua segmen teratas menyumbang ${top2Ratio}% dari seluruh pendapatan. Diversifikasi produk pendukung disarankan untuk menyeimbangkan portofolio.`,
            metricValue: `${top2Ratio}%`,
            sentiment: "neutral",
            confidenceScore: 0.88,
            recommendedAction: "Rencanakan strategi penetrasi untuk kategori dengan kontribusi menengah.",
          });
        }
      }
    }
  }

  // 3. Time Series & Growth Velocity from Line / Area charts
  const timeChart = mainCharts.find(
    (c) => c.chartType === "line" || c.chartType === "area"
  );

  if (timeChart && timeChart.data.length >= 2) {
    const data = timeChart.data;
    const mid = Math.floor(data.length / 2);
    const firstHalfSum = data.slice(0, mid).reduce((acc, c) => acc + c.value, 0);
    const secondHalfSum = data.slice(mid).reduce((acc, c) => acc + c.value, 0);

    if (firstHalfSum > 0) {
      const growthRate = ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
      const isPositive = growthRate >= 0;
      const sign = isPositive ? "+" : "";

      insights.push({
        id: "insight_trend_growth",
        type: "trend_growth",
        title: isPositive ? "Lintasan Pertumbuhan Positif" : "Perlambatan Laju Transaksi",
        description: `Aktivitas transaksi pada paruh kedua periode mencatat perubahan ${sign}${growthRate.toFixed(1)}% dibandingkan paruh pertama.`,
        metricValue: `${sign}${growthRate.toFixed(1)}%`,
        metricDelta: isPositive ? "Tren Naik" : "Tren Turun",
        sentiment: isPositive ? "positive" : "negative",
        confidenceScore: 0.9,
        recommendedAction: isPositive
          ? "Manfaatkan momentum positif untuk ekspansi kampanye ke segmen serupa."
          : "Lakukan audit berkala pada hambatan konversi di saluran utama.",
      });
    }
  }

  // 4. KPI Summary Snapshot
  if (kpiCards.length > 0) {
    const primaryKpi = kpiCards[0];
    const metric = primaryKpi.kpiMetric;
    if (metric) {
      insights.push({
        id: "insight_general_kpi",
        type: "general",
        title: `Ringkasan Metrik: ${primaryKpi.title}`,
        description: `Nilai agregat tercatat sebesar ${metric.formattedValue || metric.value} ${
          metric.deltaText ? `(${metric.deltaText})` : ""
        }.`,
        metricValue: metric.formattedValue || String(metric.value),
        sentiment: metric.isPositive !== false ? "positive" : "neutral",
        confidenceScore: 0.95,
      });
    }
  }

  return insights;
}

function formatValue(num: number): string {
  if (num >= 1000000000) {
    return `Rp ${(num / 1000000000).toFixed(1)}M`;
  }
  if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1)}jt`;
  }
  if (num >= 1000) {
    return `Rp ${(num / 1000).toFixed(0)}rb`;
  }
  return num.toLocaleString("id-ID");
}
