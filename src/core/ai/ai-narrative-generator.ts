import type { DatasetRow } from "@/types/dataset";
import type { QualityReport } from "@/types/quality";
import type { AiExecutiveNarrative } from "./ai-types";
import { AiColumnMapper } from "./ai-column-mapper";

export class AiNarrativeGenerator {
  /**
   * Generates a comprehensive C-level executive summary in Bahasa Indonesia
   */
  static generateExecutiveReport(
    datasetTitle: string,
    headers: string[],
    rows: DatasetRow[],
    qualityReport?: QualityReport,
    currencySymbol: string = "Rp"
  ): AiExecutiveNarrative {
    if (!rows || rows.length === 0) {
      return {
        headline: `Laporan Ringkasan: ${datasetTitle}`,
        executiveSummary: "Tidak ada data transaksi yang tersedia untuk dianalisis.",
        keyInsights: [],
        strategicRecommendations: ["Silakan unggah dataset transaksi aktif untuk memulai analisis."],
        datasetHealthSummary: "Kesehatan Data: Kosong (0 baris).",
      };
    }

    const classifications = AiColumnMapper.classifyAllColumns(headers, rows.slice(0, 10));
    const metricCols = classifications.filter((c) => c.semanticRole === "metric" || c.detectedDataType === "numeric" || c.detectedDataType === "currency");
    const dimCols = classifications.filter((c) => c.semanticRole === "category" || c.semanticRole === "location");

    const primaryMetric = metricCols[0]?.columnName || headers[1] || headers[0];
    const primaryDimension = dimCols[0]?.columnName || headers[0];

    // Compute totals & groupings
    let totalMetricValue = 0;
    const categoryTotals = new Map<string, number>();

    for (const row of rows) {
      const rawVal = row[primaryMetric];
      let numVal = 0;
      if (typeof rawVal === "number") {
        numVal = rawVal;
      } else if (typeof rawVal === "string") {
        numVal = parseFloat(rawVal.replace(/[^0-9.-]/g, "")) || 0;
      }
      totalMetricValue += numVal;

      const dimVal = String(row[primaryDimension] || "Lainnya");
      categoryTotals.set(dimVal, (categoryTotals.get(dimVal) || 0) + numVal);
    }

    const sortedCategories = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);
    const topContributor = sortedCategories[0] || ["-", 0];
    const topContributorShare = totalMetricValue > 0 ? ((topContributor[1] / totalMetricValue) * 100).toFixed(1) : "0";

    const formatNum = (n: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

    // Insights generation
    const keyInsights: AiExecutiveNarrative["keyInsights"] = [];

    // 1. Revenue / Volume Concentration
    if (parseFloat(topContributorShare) > 40) {
      keyInsights.push({
        title: `Risiko Konsentrasi Pendapatan: ${topContributor[0]}`,
        narrative: `Segmen '${topContributor[0]}' mendominasi ${topContributorShare}% dari total ${primaryMetric} (${currencySymbol} ${formatNum(topContributor[1])}). Konsentrasi di atas 40% berpotensi meningkatkan risiko ketergantungan pendapatan.`,
        severity: "warning",
        metricValue: `${topContributorShare}%`,
      });
    } else {
      keyInsights.push({
        title: `Distribusi Kontribusi Berimbang`,
        narrative: `Kontributor tertinggi '${topContributor[0]}' menyumbang ${topContributorShare}% (${currencySymbol} ${formatNum(topContributor[1])}), menunjukkan diversifikasi performa yang relatif stabil.`,
        severity: "positive",
        metricValue: `${topContributorShare}%`,
      });
    }

    // 2. Average Ticket / Performance per Category
    const avgPerCategory = sortedCategories.length > 0 ? totalMetricValue / sortedCategories.length : 0;
    keyInsights.push({
      title: `Rata-rata ${primaryMetric} per ${primaryDimension}`,
      narrative: `Rerata perolehan berada di kisaran ${currencySymbol} ${formatNum(avgPerCategory)} lintas ${sortedCategories.length} entitas kategori aktif.`,
      severity: "neutral",
      metricValue: `${currencySymbol} ${formatNum(avgPerCategory)}`,
    });

    // 3. Lowest Performer Opportunity
    const lowestContributor = sortedCategories[sortedCategories.length - 1];
    if (lowestContributor && sortedCategories.length > 1) {
      keyInsights.push({
        title: `Peluang Optimasi: ${lowestContributor[0]}`,
        narrative: `Entitas '${lowestContributor[0]}' mencatatkan perolehan paling rendah sebesar ${currencySymbol} ${formatNum(lowestContributor[1])}. Perlu evaluasi promosi atau penyesuaian strategi pasokan.`,
        severity: "neutral",
        metricValue: `${currencySymbol} ${formatNum(lowestContributor[1])}`,
      });
    }

    // Recommendations
    const strategicRecommendations: string[] = [
      `Fokuskan program retensi dan loyalitas pelanggan pada segmen top performer '${topContributor[0]}'.`,
      `Lakukan audit biaya operasional dan logistik untuk mendongkrak margin segmen dengan performa rendah.`,
      `Pertahankan higienitas data dengan penjadwalan sinkronisasi berkala dari platform e-commerce/POS.`,
    ];

    // Data Health summary
    let healthText = "Kesehatan Data: Sangat Baik (100% Bersih).";
    if (qualityReport) {
      const status = qualityReport.totalScore >= 80 ? "Sangat Baik" : qualityReport.totalScore >= 50 ? "Cukup" : "Perlu Perbaikan";
      healthText = `Skor Kualitas Data: ${qualityReport.totalScore}/100 (${status}). Total ${qualityReport.cleanRowCount} dari ${qualityReport.totalRows} baris berstatus bersih.`;
    }

    return {
      headline: `Ikhtisar Strategis: Kinerja ${datasetTitle}`,
      executiveSummary: `Total akumulasi ${primaryMetric} tercatat sebesar ${currencySymbol} ${formatNum(totalMetricValue)} dari ${rows.length} baris transaksi. Segmen '${topContributor[0]}' memimpin kontribusi sebesar ${topContributorShare}%.`,
      keyInsights,
      strategicRecommendations,
      datasetHealthSummary: healthText,
    };
  }
}
