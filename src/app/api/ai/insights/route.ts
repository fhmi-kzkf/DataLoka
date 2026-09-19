import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { rateLimiter, RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";
import { llmCircuitBreaker } from "@/lib/circuit-breaker";
import { Logger } from "@/lib/logger";
import { AiNarrativeGenerator } from "@/core/ai/ai-narrative-generator";
import type { DatasetRow } from "@/types/dataset";
import type { QualityReport } from "@/types/quality";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  const rateLimitResult = rateLimiter.checkLimit(`ai_insights:${clientIp}`, RATE_LIMIT_POLICIES.ai);
  if (!rateLimitResult.allowed) {
    return createErrorResponse("Batas kuota insight AI tercapai. Harap coba lagi beberapa saat.", {
      status: 429,
      code: "AI_RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  try {
    const body = await request.json();
    const { datasetTitle = "Transaksi Bisnis", headers, rows, qualityReport, currency = "Rp" } = body as {
      datasetTitle?: string;
      headers: string[];
      rows: DatasetRow[];
      qualityReport?: QualityReport;
      currency?: string;
    };

    if (!Array.isArray(headers) || !Array.isArray(rows)) {
      return createErrorResponse("Parameter 'headers' dan 'rows' dataset wajib disertakan.", {
        status: 400,
        code: "INVALID_DATASET_PAYLOAD",
        rateLimitResult,
      });
    }

    const narrative = await llmCircuitBreaker.execute(async () => {
      return AiNarrativeGenerator.generateExecutiveReport(
        datasetTitle,
        headers,
        rows,
        qualityReport,
        currency
      );
    });

    Logger.info("AI executive narrative generated", {
      insightsCount: narrative.keyInsights.length,
      recommendationsCount: narrative.strategicRecommendations.length,
      latencyMs: Date.now() - startTime,
      requestId,
    });

    return createSuccessResponse(narrative, {
      status: 200,
      rateLimitResult,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal menghasilkan narasi insight eksekutif.";
    Logger.error("Error in /api/ai/insights", { error: errMessage, requestId });

    const isCircuitOpen = errMessage.includes("Circuit breaker is OPEN");
    return createErrorResponse(errMessage, {
      status: isCircuitOpen ? 503 : 500,
      code: isCircuitOpen ? "CIRCUIT_BREAKER_OPEN" : "AI_NARRATIVE_ERROR",
      rateLimitResult,
    });
  }
}
