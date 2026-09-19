import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { rateLimiter, RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";
import { Logger } from "@/lib/logger";
import { generateAutoCharts, transformChartForNewType } from "@/core/engine/engine";
import { analyzeDatasetColumns } from "@/core/mapping/column-analyzer";
import type { DatasetSchema } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";
import type { ChartRecommendation, ChartType } from "@/types/chart";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  const rateLimitResult = rateLimiter.checkLimit(`charts:${clientIp}`, RATE_LIMIT_POLICIES.standard);
  if (!rateLimitResult.allowed) {
    return createErrorResponse("Terlalu banyak permintaan rekomendasi visualisasi.", {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  try {
    const body = await request.json();
    const { dataset, mapping, transformTarget } = body as {
      dataset: DatasetSchema;
      mapping?: DatasetMapping;
      transformTarget?: {
        recommendation: ChartRecommendation;
        newType: ChartType;
      };
    };

    if (!dataset || !Array.isArray(dataset.headers) || !Array.isArray(dataset.rows)) {
      return createErrorResponse("Parameter 'dataset' (headers dan rows) wajib disertakan.", {
        status: 400,
        code: "INVALID_DATASET_PAYLOAD",
        rateLimitResult,
      });
    }

    // Auto generate mapping if not provided
    const effectiveMapping = mapping || analyzeDatasetColumns(dataset);

    // Handle single chart transformation if requested
    if (transformTarget) {
      const transformed = transformChartForNewType(
        transformTarget.recommendation,
        transformTarget.newType,
        dataset,
        effectiveMapping
      );

      return createSuccessResponse(transformed, { status: 200, rateLimitResult });
    }

    // Generate full suite of charts
    const chartResult = generateAutoCharts(dataset, effectiveMapping);

    Logger.info("Auto-chart recommendations generated", {
      kpiCount: chartResult.kpiCards.length,
      mainChartCount: chartResult.mainCharts.length,
      latencyMs: Date.now() - startTime,
      requestId,
    });

    return createSuccessResponse(chartResult, {
      status: 200,
      rateLimitResult,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal menghasilkan rekomendasi visualisasi chart.";
    Logger.error("Error in /api/charts/recommend", { error: errMessage, requestId });

    return createErrorResponse(errMessage, {
      status: 500,
      code: "CHART_GENERATION_ERROR",
      rateLimitResult,
    });
  }
}
