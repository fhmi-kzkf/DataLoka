import { NextRequest } from "next/server";
import { createSuccessResponse } from "@/lib/api-response";
import { gsheetCircuitBreaker, llmCircuitBreaker } from "@/lib/circuit-breaker";
import { Logger } from "@/lib/logger";
import { RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();

  Logger.info("Health check endpoint pinged", { requestId, path: "/api/health" });

  const memUsage = process.memoryUsage ? process.memoryUsage() : null;

  const healthPayload = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || "development",
    memory: memUsage
      ? {
          heapUsedMb: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
          heapTotalMb: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
          rssMb: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
        }
      : null,
    circuitBreakers: {
      gsheet: gsheetCircuitBreaker.getMetrics(),
      llm: llmCircuitBreaker.getMetrics(),
    },
    rateLimitingPolicies: RATE_LIMIT_POLICIES,
    latencyMs: Date.now() - startTime,
  };

  return createSuccessResponse(healthPayload, { status: 200 });
}
