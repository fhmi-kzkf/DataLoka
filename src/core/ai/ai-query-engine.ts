import type { ChartType, DataPoint } from "@/types/chart";
import type { DatasetRow } from "@/types/dataset";
import type { AiIntentType, ParsedAiIntent, AiQueryResult } from "./ai-types";
import { AiColumnMapper } from "./ai-column-mapper";

export class AiQueryEngine {
  /**
   * Parse user query and execute query over dataset rows
   */
  static processQuery(
    userPrompt: string,
    headers: string[],
    rows: DatasetRow[],
    currencySymbol: string = "Rp"
  ): AiQueryResult {
    const parsedIntent = this.parseIntent(userPrompt, headers, rows);
    return this.executeQuery(parsedIntent, userPrompt, headers, rows, currencySymbol);
  }

  /**
   * Rule-based Indonesian NLP intent parser
   */
  static parseIntent(prompt: string, headers: string[], rows: DatasetRow[]): ParsedAiIntent {
    const lower = prompt.toLowerCase();
    const classifications = AiColumnMapper.classifyAllColumns(headers, rows.slice(0, 10));

    const metricCols = classifications.filter((c) => c.semanticRole === "metric" || c.detectedDataType === "numeric" || c.detectedDataType === "currency");
    const dimCols = classifications.filter((c) => c.semanticRole === "category" || c.semanticRole === "location" || c.semanticRole === "time");

    // Extract limit (e.g. top 5, 10 teratas, 3 produk)
    let limit = 5;
    const limitMatch = lower.match(/(?:top|teratas|peringkat|tertinggi|terendah|terbawah|\b)(\d+)/);
    if (limitMatch && limitMatch[1]) {
      const parsedNum = parseInt(limitMatch[1], 10);
      if (parsedNum > 0 && parsedNum <= 100) {
        limit = parsedNum;
      }
    }


    // Smart matching for dimension
    let targetDimensionColumn = dimCols[0]?.columnName || headers.find((h) => h !== targetMetricColumn) || headers[0];
    if (/produk|barang|item|sku/i.test(lower)) {
      const prodCol = dimCols.find((c) => /produk|nama_barang|item|sku|kategori/i.test(c.columnName));
      if (prodCol) targetDimensionColumn = prodCol.columnName;
    } else if (/wilayah|kota|daerah|lokasi/i.test(lower)) {
      const locCol = dimCols.find((c) => /wilayah|kota|provinsi|lokasi|area|cabang/i.test(c.columnName));
      if (locCol) targetDimensionColumn = locCol.columnName;
    } else if (/kategori|category/i.test(lower)) {
      const catCol = dimCols.find((c) => /kategori|category/i.test(c.columnName));
      if (catCol) targetDimensionColumn = catCol.columnName;
    } else {
      for (const col of dimCols) {
        if (lower.includes(col.columnName.toLowerCase()) || lower.includes(col.standardizedAlias.replace("dim_", ""))) {
          targetDimensionColumn = col.columnName;
          break;
        }
      }
    }

    // Smart matching for metric
    let targetMetricColumn = metricCols[0]?.columnName || headers[1] || headers[0];
    if (/omset|pendapatan|sales|penjualan|rupiah|duit|uang|harga/i.test(lower)) {
      const salesCol = metricCols.find((c) => /penjualan|omset|omzet|revenue|harga|subtotal/i.test(c.columnName));
      if (salesCol) targetMetricColumn = salesCol.columnName;
    } else if (/jumlah|qty|kuantitas|unit|pesanan|volume|banyak/i.test(lower)) {
      const qtyCol = metricCols.find((c) => /jumlah|qty|volume|pesanan|unit/i.test(c.columnName));
      if (qtyCol) targetMetricColumn = qtyCol.columnName;
    } else {
      for (const col of metricCols) {
        if (lower.includes(col.columnName.toLowerCase()) || lower.includes(col.standardizedAlias.replace("metrik_", ""))) {
          targetMetricColumn = col.columnName;
          break;
        }
      }
    }

    // Determine Intent
    let intent: AiIntentType = "aggregate_sum";
    let recommendedChartType: ChartType = "bar";
    let confidence = 0.85;

    if (/faktor|penyebab|kenapa|mengapa|karena|driver|analisis|evaluasi/i.test(lower) && /laku|laris|jual|beli|performa/i.test(lower)) {
      intent = "top_ranking";
      recommendedChartType = "bar";
      confidence = 0.94;
    } else if (/terbawah|terendah|bottom|paling sedikit|terkecil|tidak laku|kurang laku/i.test(lower)) {
      intent = "bottom_ranking";
      recommendedChartType = "bar";
      confidence = 0.92;
    } else if (/teratas|tertinggi|top|terbesar|paling laris|paling banyak|juara|laku/i.test(lower)) {
      intent = "top_ranking";
      recommendedChartType = "bar";
      confidence = 0.95;
    } else if (/rata-rata|rerata|average|avg|mean/i.test(lower)) {
      intent = "aggregate_avg";
      recommendedChartType = "line";
      confidence = 0.9;
    } else if (/tren|trend|pertumbuhan|fluktuasi|seiring waktu|per bulan|per hari/i.test(lower)) {
      intent = "trend_analysis";
      recommendedChartType = "line";
      confidence = 0.93;
    } else if (/proporsi|distribusi|pembagian|kontribusi|persentase|share/i.test(lower)) {
      intent = "chart_transform";
      recommendedChartType = "pie";
      confidence = 0.89;
    } else if (/jelaskan|analisis|ringkasan|summary|overview|apa isi/i.test(lower)) {
      intent = "explain_dataset";
      recommendedChartType = "bar";
      confidence = 0.88;
    } else if (/jumlah baris|total transaksi|berapa kali|count|total data/i.test(lower)) {
      intent = "aggregate_count";
      recommendedChartType = "bar";
      confidence = 0.91;
    }

    return {
      intent,
      targetMetricColumn,
      targetDimensionColumn,
      limit,
      recommendedChartType,
      confidence,
    };
  }

  /**
   * Execute calculations and build structured responses
   */
  private static executeQuery(
    parsed: ParsedAiIntent,
    prompt: string,
    headers: string[],
    rows: DatasetRow[],
    currencySymbol: string
  ): AiQueryResult {
    const { intent, targetMetricColumn, targetDimensionColumn, limit = 5, recommendedChartType = "bar", confidence } = parsed;

    if (!rows || rows.length === 0) {
      return {
        answerText: "Dataset tidak memiliki baris data untuk dieksekusi.",
        intent,
        confidence: 0.1,
        suggestedFollowUps: ["Upload dataset baru", "Periksa sumber data Google Sheets"],
      };
    }

    // Aggregations Map: dimensionValue -> aggregatedMetric
    const groupMap = new Map<string, { sum: number; count: number }>();

    for (const row of rows) {
      const rawDim = row[targetDimensionColumn || ""];
      const dimKey = rawDim !== undefined && rawDim !== null && String(rawDim).trim() !== "" ? String(rawDim) : "Lainnya";

      const rawVal = row[targetMetricColumn || ""];
      let numericVal = 0;
      if (typeof rawVal === "number") {
        numericVal = rawVal;
      } else if (typeof rawVal === "string") {
        const cleaned = rawVal.replace(/[^0-9.-]/g, "");
        numericVal = parseFloat(cleaned) || 0;
      }

      const existing = groupMap.get(dimKey) || { sum: 0, count: 0 };
      groupMap.set(dimKey, {
        sum: existing.sum + numericVal,
        count: existing.count + 1,
      });
    }

    const aggregatedArray = Array.from(groupMap.entries()).map(([label, stats]) => ({
      label,
      value: intent === "aggregate_avg" ? (stats.count > 0 ? stats.sum / stats.count : 0) : stats.sum,
      count: stats.count,
    }));

    if (intent === "bottom_ranking") {
      aggregatedArray.sort((a, b) => a.value - b.value);
    } else {
      aggregatedArray.sort((a, b) => b.value - a.value);
    }

    const limitedResults = aggregatedArray.slice(0, limit);
    const chartData: DataPoint[] = limitedResults.map((item) => ({
      label: item.label,
      value: Math.round(item.value * 100) / 100,
    }));

    const totalSum = aggregatedArray.reduce((acc, curr) => acc + curr.value, 0);
    const avgVal = aggregatedArray.length > 0 ? totalSum / aggregatedArray.length : 0;

    const formatNum = (num: number) => {
      return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(num);
    };

    const isFactorQuestion = /faktor|penyebab|kenapa|mengapa|driver|laku/i.test(prompt);

    let answerText = "";
    let calculatedValue: string | number = totalSum;
    let sqlEquivalent = "";

    if (isFactorQuestion && limitedResults.length > 0) {
      const top1 = limitedResults[0];
      const top3Share = totalSum > 0 ? Math.round((limitedResults.slice(0, 3).reduce((acc, c) => acc + c.value, 0) / totalSum) * 100) : 0;
      const top1Share = totalSum > 0 ? Math.round((top1.value / totalSum) * 100) : 0;

      answerText = `Berdasarkan analisis performa penjualan pada dataset Anda:\n\n` +
        `1. **Produk & Segmen Paling Mendominasi**:\n` +
        `   - **${top1.label}** memimpin sebagai kontributor utama dengan total ${currencySymbol} ${formatNum(top1.value)} (${top1Share}% dari total pendapatan).\n` +
        (limitedResults[1] ? `   - Diikuti oleh **${limitedResults[1].label}** (${currencySymbol} ${formatNum(limitedResults[1].value)}) dan **${limitedResults[2]?.label || "Lainnya"}**.\n\n` : `\n`) +
        `2. **Faktor Kunci Pendorong Penjualan**:\n` +
        `   - **Konsentrasi Penjualan**: Top 3 segmen menguasai sekitar **${top3Share}%** omset bisnis Anda, menunjukkan preferensi pasar yang sangat kuat pada kategori ini.\n` +
        `   - **Frekuensi Permintaan**: Volume pesanan yang konsisten pada segmen unggulan menjadi penggerak utama pertumbuhan.\n\n` +
        `3. **Rekomendasi Aksi**:\n` +
        `   - Prioritaskan ketersediaan stok (*safety stock*) untuk **${top1.label}** guna menghindari kehilangan peluang omset.\n` +
        `   - Terapkan strategi *cross-selling* / bundling antara produk terlaris dengan produk di kelompok bawah untuk mendongkrak Average Order Value (AOV).`;

      calculatedValue = top1.value;
      sqlEquivalent = `SELECT ${targetDimensionColumn}, SUM(${targetMetricColumn}) AS total FROM dataset GROUP BY ${targetDimensionColumn} ORDER BY total DESC LIMIT ${limit};`;
    } else {
      switch (intent) {
        case "top_ranking":
          answerText = `Berikut adalah ${limit} ${targetDimensionColumn} teratas berdasarkan ${targetMetricColumn}. Peringkat tertinggi diraih oleh **${limitedResults[0]?.label || "N/A"}** dengan nilai ${currencySymbol} ${formatNum(limitedResults[0]?.value || 0)}.`;
          calculatedValue = limitedResults[0]?.value || 0;
          sqlEquivalent = `SELECT ${targetDimensionColumn}, SUM(${targetMetricColumn}) AS total FROM dataset GROUP BY ${targetDimensionColumn} ORDER BY total DESC LIMIT ${limit};`;
          break;

        case "bottom_ranking":
          answerText = `Berikut adalah ${limit} ${targetDimensionColumn} dengan performa terendah berdasarkan ${targetMetricColumn}. Terendah adalah **${limitedResults[0]?.label || "N/A"}** senilai ${currencySymbol} ${formatNum(limitedResults[0]?.value || 0)}.`;
          calculatedValue = limitedResults[0]?.value || 0;
          sqlEquivalent = `SELECT ${targetDimensionColumn}, SUM(${targetMetricColumn}) AS total FROM dataset GROUP BY ${targetDimensionColumn} ORDER BY total ASC LIMIT ${limit};`;
          break;

        case "aggregate_avg":
          answerText = `Rata-rata ${targetMetricColumn} per ${targetDimensionColumn} adalah ${currencySymbol} ${formatNum(avgVal)} dihitung dari total ${aggregatedArray.length} kelompok.`;
          calculatedValue = Math.round(avgVal * 100) / 100;
          sqlEquivalent = `SELECT ${targetDimensionColumn}, AVG(${targetMetricColumn}) AS rata_rata FROM dataset GROUP BY ${targetDimensionColumn};`;
          break;

        case "aggregate_count":
          answerText = `Total rekaman data yang dianalisis adalah ${rows.length} baris dengan ${aggregatedArray.length} kategori unik pada kolom ${targetDimensionColumn}.`;
          calculatedValue = rows.length;
          sqlEquivalent = `SELECT COUNT(*) AS total_records, COUNT(DISTINCT ${targetDimensionColumn}) AS unique_categories FROM dataset;`;
          break;

        case "trend_analysis":
          answerText = `Analisis tren ${targetMetricColumn} menunjukkan agregasi lintas dimensi waktu/urutan ${targetDimensionColumn} dengan total akumulasi ${currencySymbol} ${formatNum(totalSum)}.`;
          calculatedValue = totalSum;
          sqlEquivalent = `SELECT ${targetDimensionColumn}, SUM(${targetMetricColumn}) FROM dataset GROUP BY ${targetDimensionColumn} ORDER BY ${targetDimensionColumn} ASC;`;
          break;

        case "explain_dataset":
          answerText = `Dataset ini memuat ${rows.length} baris dengan ${headers.length} kolom: [${headers.join(", ")}]. Nilai agregat tertinggi berada pada segmen ${limitedResults[0]?.label || "-"}.`;
          calculatedValue = rows.length;
          sqlEquivalent = `DESCRIBE dataset; -- Total Rows: ${rows.length}`;
          break;

        case "aggregate_sum":
        default:
          answerText = `Total keseluruhan ${targetMetricColumn} adalah ${currencySymbol} ${formatNum(totalSum)} yang tersebar di ${aggregatedArray.length} kelompok ${targetDimensionColumn}.`;
          calculatedValue = totalSum;
          sqlEquivalent = `SELECT ${targetDimensionColumn}, SUM(${targetMetricColumn}) AS total FROM dataset GROUP BY ${targetDimensionColumn};`;
          break;
      }
    }

    return {
      answerText,
      calculatedValue,
      intent,
      confidence,
      chartRecommendation: {
        chartType: recommendedChartType,
        title: `${intent === "top_ranking" ? "Top " + limit : "Distribusi"} ${targetMetricColumn} vs ${targetDimensionColumn}`,
        subtitle: `Dihasilkan otomatis oleh DataLoka AI Query Engine`,
        data: chartData,
      },
      sqlEquivalent,
      suggestedFollowUps: [
        `Tampilkan tren ${targetMetricColumn} per bulan`,
        `Siapa kontributor terendah untuk ${targetMetricColumn}?`,
        `Bandingkan persentase proporsi antar ${targetDimensionColumn}`,
      ],
    };
  }
}
