import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { rateLimiter, RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";
import { Logger } from "@/lib/logger";
import { AiColumnMapper } from "@/core/ai/ai-column-mapper";
import { inferColumnType } from "@/core/mapping/type-detector";
import { matchLocalDictionary } from "@/core/mapping/local-dictionary";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  const rateLimitResult = rateLimiter.checkLimit(`mapping:${clientIp}`, RATE_LIMIT_POLICIES.standard);
  if (!rateLimitResult.allowed) {
    return createErrorResponse("Terlalu banyak permintaan klasifikasi kolom.", {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  try {
    const body = await request.json();
    const { headers, sampleRows = [] } = body;

    if (!Array.isArray(headers) || headers.length === 0) {
      return createErrorResponse("Parameter 'headers' wajib berupa array string tidak kosong.", {
        status: 400,
        code: "INVALID_HEADERS",
        rateLimitResult,
      });
    }

    // Run semantic mapping & heuristic deep analysis
    const aiClassifications = AiColumnMapper.classifyAllColumns(headers, sampleRows);

    // Merge both analysis outputs for high precision
    const results = headers.map((header, idx) => {
      const ai = aiClassifications[idx];
      const columnValues = sampleRows.map((r: Record<string, unknown>) => r[header]);
      const nonNull = columnValues.filter((v: unknown) => v !== null && v !== undefined && v !== "");
      const typeInfo = inferColumnType(columnValues, header);
      const dictMatch = matchLocalDictionary(header);

      return {
        columnName: header,
        semanticRole: ai?.semanticRole || dictMatch.role || "general",
        detectedDataType: typeInfo.inferredType || ai?.detectedDataType || "text",
        confidence: Math.max(ai?.confidence || 0.7, typeInfo.confidence, dictMatch.confidence),
        standardizedAlias: ai?.standardizedAlias || header,
        sampleValues: nonNull.slice(0, 5),
        uniqueCount: new Set(nonNull.map(String)).size,
        nullCount: columnValues.length - nonNull.length,
        rationale: ai?.rationale || `Dianalisis melalui kamus lokal: ${dictMatch.role}`,
      };
    });

    Logger.info("Column classification complete", {
      columnCount: headers.length,
      latencyMs: Date.now() - startTime,
      requestId,
    });

    return createSuccessResponse(
      {
        classifications: results,
        totalColumns: headers.length,
      },
      {
        status: 200,
        rateLimitResult,
      }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal memetakan kolom.";
    Logger.error("Error in /api/mapping/classify", { error: errMessage, requestId });

    return createErrorResponse(errMessage, {
      status: 500,
      code: "MAPPING_ERROR",
      rateLimitResult,
    });
  }
}
