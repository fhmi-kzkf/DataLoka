import type { DatasetSchema } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";
import type { ChartRecommendation, ChartType } from "@/types/chart";
import {
  aggregateByCategory,
  aggregateByDate,
  computeKpiMetric,
  computeAovKpiMetric,
} from "./aggregator";
import { humanizeColumnName, humanizeChartTitle } from "@/lib/formatters";
import { sanitizeNumericValue } from "@/core/quality/data-sanitizer";

export function evaluateHeuristicRules(
  dataset: DatasetSchema,
  mapping: DatasetMapping
): ChartRecommendation[] {
  const { rows } = dataset;
  const columnsList = Object.values(mapping.columns);
  const recommendations: ChartRecommendation[] = [];

  // Categorize columns by effective types
  const dateCols = columnsList.filter((c) => c.effectiveType === "datetime");
  const numCols = columnsList.filter(
    (c) => (c.effectiveType === "numeric" || c.effectiveType === "currency") && c.nullableRatio < 0.5
  );
  const catCols = columnsList.filter(
    (c) => c.effectiveType === "categorical" || (c.effectiveType === "text" && c.cardinality <= 30)
  );
  const geoCols = columnsList.filter((c) => c.effectiveType === "geolocation");

  const primaryDate = mapping.primaryDateColumn || dateCols[0]?.name;
  const primaryNumeric = mapping.primaryNumericColumn || numCols[0]?.name;
  const primaryCat = mapping.primaryCategoryColumn || catCols[0]?.name;

  let orderIndex = 0;

  // RULE 10: Top KPI Big Number Cards (Confidence: 0.95)
  for (const numCol of numCols.slice(0, 2)) {
    const isCurrency = numCol.effectiveType === "currency" || /penjualan|omset|pendapatan|harga|revenue|sales|biaya|margin/i.test(numCol.name);
    const humanTitle = humanizeColumnName(numCol.name);
    const kpiMetric = computeKpiMetric(rows, numCol.name, humanTitle, isCurrency, primaryDate);

    recommendations.push({
      id: `chart_kpi_${numCol.name}_${orderIndex}`,
      chartType: "kpi_card",
      title: humanTitle,
      subtitle: `Total agregat ${humanTitle.toLowerCase()}`,
      confidenceScore: 0.95,
      reasoning: "Metrik agregat tunggal paling representatif untuk ringkasan cepat performa bisnis.",
      yAxisColumns: [numCol.name],
      aggregationType: "sum",
      data: [],
      kpiMetric,
      orderIndex: orderIndex++,
      availableAlternativeTypes: ["kpi_card", "bar", "line"],
    });
  }

  // RULE 10b: Automatic AOV KPI Card when Revenue & Orders exist
  const revCol = numCols.find(
    (c) => c.effectiveType === "currency" || /penjualan|omset|pendapatan|sales|revenue/i.test(c.name)
  );
  const orderCol = numCols.find(
    (c) => /pesanan|transaksi|orders|order|qty|kuantitas|jumlah_pesanan/i.test(c.name)
  );

  if (revCol && orderCol) {
    const aovMetric = computeAovKpiMetric(rows, revCol.name, orderCol.name, primaryDate);
    recommendations.push({
      id: `chart_kpi_aov_actual_${orderIndex}`,
      chartType: "kpi_card",
      title: "AOV Aktual",
      subtitle: "Rata-rata nilai belanja per transaksi pesanan",
      confidenceScore: 0.96,
      reasoning: "Rasio pendapatan terhadap total pesanan untuk mengukur nilai rata-rata keranjang (AOV).",
      yAxisColumns: ["aov_aktual"],
      aggregationType: "avg",
      data: [],
      kpiMetric: aovMetric,
      orderIndex: orderIndex++,
      availableAlternativeTypes: ["kpi_card", "bar", "line"],
    });
  } else if (numCols.length > 2) {
    // Fallback 3rd KPI card from 3rd numeric column
    const numCol = numCols[2];
    const isCurrency = numCol.effectiveType === "currency";
    const humanTitle = humanizeColumnName(numCol.name);
    const kpiMetric = computeKpiMetric(rows, numCol.name, humanTitle, isCurrency, primaryDate);

    recommendations.push({
      id: `chart_kpi_${numCol.name}_${orderIndex}`,
      chartType: "kpi_card",
      title: humanTitle,
      subtitle: `Total agregat ${humanTitle.toLowerCase()}`,
      confidenceScore: 0.92,
      reasoning: "Metrik agregat penunjang untuk evaluasi performa menyeluruh.",
      yAxisColumns: [numCol.name],
      aggregationType: "sum",
      data: [],
      kpiMetric,
      orderIndex: orderIndex++,
      availableAlternativeTypes: ["kpi_card", "bar", "line"],
    });
  }

  // RULE 1 & 2: Time-series Trend (Line / Area Chart) with Dual Y-Axis support (Confidence: 0.90 / 0.85)
  if (primaryDate && numCols.length >= 1) {
    const isMultiNumeric = numCols.length > 1;
    const chartType: ChartType = isMultiNumeric ? "area" : "line";
    const valueCols = isMultiNumeric ? [numCols[0].name, numCols[1].name] : [numCols[0].name];
    const data = aggregateByDate(rows, primaryDate, valueCols, "sum");

    const formattedMetricNames = valueCols.map((col) => humanizeColumnName(col)).join(" & ");
    const humanDateName = humanizeColumnName(primaryDate);

    recommendations.push({
      id: `chart_timeseries_${primaryDate}_${orderIndex}`,
      chartType,
      title: `Tren ${formattedMetricNames} Berdasarkan Waktu`,
      subtitle: `Dikelompokkan menurut linimasa ${humanDateName.toLowerCase()}`,
      confidenceScore: isMultiNumeric ? 0.88 : 0.9,
      reasoning: "Kombinasi deret tanggal dan metrik bisnis dengan skala ganda (Dual Y-Axis) untuk membaca fluktuasi secara presisi.",
      xAxisColumn: primaryDate,
      yAxisColumns: valueCols,
      aggregationType: "sum",
      data,
      orderIndex: orderIndex++,
      availableAlternativeTypes: ["line", "area", "bar"],
    });
  }

  // RULE 3 & 4: Category Distribution (Donut vs Horizontal Bar)
  if (primaryCat && primaryNumeric) {
    const catMeta = mapping.columns[primaryCat];
    const cardinality = catMeta ? catMeta.cardinality : 10;
    const humanCat = humanizeColumnName(primaryCat);
    const humanNum = humanizeColumnName(primaryNumeric);

    // Rule 3: Cardinality <= 7 -> Donut Chart
    if (cardinality <= 7) {
      const data = aggregateByCategory(rows, primaryCat, primaryNumeric, "sum", 7);
      recommendations.push({
        id: `chart_donut_${primaryCat}_${orderIndex}`,
        chartType: "donut",
        title: `Distribusi ${humanNum} per ${humanCat}`,
        subtitle: `Proporsi kategori (${cardinality} varian)`,
        confidenceScore: 0.75,
        reasoning: "Kardinalitas rendah (<= 7) sangat cocok ditampilkan dalam bentuk proporsi Donut Chart.",
        xAxisColumn: primaryCat,
        yAxisColumns: [primaryNumeric],
        categoryColumn: primaryCat,
        aggregationType: "sum",
        data,
        orderIndex: orderIndex++,
        availableAlternativeTypes: ["donut", "pie", "bar", "horizontal_bar"],
      });
    } else {
      // Rule 4: Cardinality > 7 -> Horizontal Bar Chart + Top 10
      const data = aggregateByCategory(rows, primaryCat, primaryNumeric, "sum", 10);
      recommendations.push({
        id: `chart_hbar_${primaryCat}_${orderIndex}`,
        chartType: "horizontal_bar",
        title: `Peringkat ${humanCat} Tertinggi (${humanNum})`,
        subtitle: `Top 10 kategori teratas`,
        confidenceScore: 0.85,
        reasoning: "Kardinalitas tinggi (> 7) dioptimalkan dengan Bar Horizontal agar label teks terbaca jelas tanpa terpotong.",
        xAxisColumn: primaryCat,
        yAxisColumns: [primaryNumeric],
        categoryColumn: primaryCat,
        aggregationType: "sum",
        data,
        orderIndex: orderIndex++,
        availableAlternativeTypes: ["horizontal_bar", "bar", "donut"],
      });
    }
  }

  // RULE 8: Geolocation Breakdown
  if (geoCols.length > 0 && primaryNumeric) {
    const geoCol = geoCols[0].name;
    const humanGeo = humanizeColumnName(geoCol);
    const humanNum = humanizeColumnName(primaryNumeric);
    const data = aggregateByCategory(rows, geoCol, primaryNumeric, "sum", 8);

    recommendations.push({
      id: `chart_geo_${geoCol}_${orderIndex}`,
      chartType: "bar",
      title: `Sebaran ${humanNum} Berdasarkan ${humanGeo}`,
      subtitle: `Perbandingan kontribusi antar ${humanGeo.toLowerCase()}`,
      confidenceScore: 0.9,
      reasoning: "Dimensi lokasi geografis memberikan pemahaman distribusi pasar wilayah lokal.",
      xAxisColumn: geoCol,
      yAxisColumns: [primaryNumeric],
      categoryColumn: geoCol,
      aggregationType: "sum",
      data,
      orderIndex: orderIndex++,
      availableAlternativeTypes: ["bar", "horizontal_bar", "donut"],
    });
  }

  // RULE 6: Scatter Plot if 2 continuous numeric columns and > 20 rows
  if (numCols.length >= 2 && rows.length >= 20) {
    const colX = numCols[0].name;
    const colY = numCols[1].name;
    const humanX = humanizeColumnName(colX);
    const humanY = humanizeColumnName(colY);
    const data = rows.slice(0, 50).map((r, idx) => {
      const itemLabel = String(r["nama_menu"] || r["Nama_Menu"] || r["produk"] || r["Produk"] || r["sku"] || r["SKU"] || `Item ${idx + 1}`);
      return {
        label: itemLabel,
        value: sanitizeNumericValue(r[colX]),
        secondaryValue: sanitizeNumericValue(r[colY]),
      };
    });

    recommendations.push({
      id: `chart_scatter_${colX}_${colY}_${orderIndex}`,
      chartType: "scatter",
      title: `Korelasi Antara ${humanX} dan ${humanY}`,
      subtitle: `Sebaran data kontinu`,
      confidenceScore: 0.7,
      reasoning: "Dua variabel angka kontinu dianalisis untuk melihat pola sebaran atau korelasi.",
      xAxisColumn: colX,
      yAxisColumns: [colY],
      aggregationType: "none",
      data,
      orderIndex: orderIndex++,
      availableAlternativeTypes: ["scatter", "bar", "line"],
    });
  }

  return recommendations;
}
