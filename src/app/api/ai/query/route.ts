import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { rateLimiter, RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";
import { llmCircuitBreaker } from "@/lib/circuit-breaker";
import { SecurityGuard } from "@/lib/security";
import { Logger } from "@/lib/logger";
import { NvidiaNimClient } from "@/core/ai/nvidia-nim-client";
import type { DatasetRow } from "@/types/dataset";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  // 1. Check AI-specific rate limit
  const rateLimitResult = rateLimiter.checkLimit(`ai_query:${clientIp}`, RATE_LIMIT_POLICIES.ai);
  if (!rateLimitResult.allowed) {
    Logger.warn("AI query rate limit hit", { clientIp, requestId });
    return createErrorResponse("Batas kuota pertanyaan AI tercapai. Harap tunggu beberapa detik.", {
      status: 429,
      code: "AI_RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  try {
    const body = await request.json();
    const { prompt, headers, rows, currency = "Rp" } = body as {
      prompt: string;
      headers: string[];
      rows: DatasetRow[];
      currency?: string;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return createErrorResponse("Parameter 'prompt' pertanyaan tidak boleh kosong.", {
        status: 400,
        code: "EMPTY_PROMPT",
        rateLimitResult,
      });
    }

    if (!Array.isArray(headers) || !Array.isArray(rows)) {
      return createErrorResponse("Parameter 'headers' dan 'rows' dataset wajib disertakan.", {
        status: 400,
        code: "INVALID_DATASET_PAYLOAD",
        rateLimitResult,
      });
    }

    // Sanitize user prompt for potential script/prompt injection
    const sanitizedPrompt = SecurityGuard.sanitizeXss(prompt.trim());

    // 2. Execute Query through NVIDIA NIM / Circuit Breaker
    const queryResult = await llmCircuitBreaker.execute(async () => {
      return NvidiaNimClient.queryWithNim(sanitizedPrompt, headers, rows, currency);
    });

    Logger.info("AI query executed successfully", {
      intent: queryResult.intent,
      confidence: queryResult.confidence,
      latencyMs: Date.now() - startTime,
      requestId,
    });

    return createSuccessResponse(queryResult, {
      status: 200,
      rateLimitResult,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal memproses pertanyaan AI.";
    Logger.error("Error in /api/ai/query", { error: errMessage, requestId });

    const isCircuitOpen = errMessage.includes("Circuit breaker is OPEN");
    return createErrorResponse(errMessage, {
      status: isCircuitOpen ? 503 : 500,
      code: isCircuitOpen ? "CIRCUIT_BREAKER_OPEN" : "AI_QUERY_ERROR",
      rateLimitResult,
    });
  }
}
