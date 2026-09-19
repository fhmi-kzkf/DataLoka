import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { rateLimiter, RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";
import { gsheetCircuitBreaker } from "@/lib/circuit-breaker";
import { Logger } from "@/lib/logger";
import { parseGoogleSheetUrl, fetchAndParseGoogleSheet } from "@/core/parser/gsheet-parser";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  // 1. Rate Limiting Check
  const rateLimitResult = rateLimiter.checkLimit(`gsheet:${clientIp}`, RATE_LIMIT_POLICIES.upload);
  if (!rateLimitResult.allowed) {
    Logger.warn("Google Sheet rate limit exceeded", { clientIp, requestId });
    return createErrorResponse("Terlalu banyak permintaan impor Google Sheets. Harap tunggu beberapa saat.", {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return createErrorResponse("Parameter 'url' wajib disertakan.", {
        status: 400,
        code: "MISSING_URL_PARAM",
        rateLimitResult,
      });
    }

    const gsheetInfo = parseGoogleSheetUrl(url);
    if (!gsheetInfo) {
      return createErrorResponse(
        "Format URL Google Sheets tidak valid. Pastikan format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit",
        {
          status: 422,
          code: "INVALID_GSHEET_URL",
          rateLimitResult,
        }
      );
    }

    // 2. Execute fetch with Circuit Breaker protection
    const parsedDataset = await gsheetCircuitBreaker.execute(async () => {
      return await fetchAndParseGoogleSheet(url);
    });

    Logger.info("Google Sheet imported successfully", {
      sheetId: gsheetInfo.sheetId,
      rowCount: parsedDataset.rows.length,
      columnCount: parsedDataset.headers.length,
      latencyMs: Date.now() - startTime,
      requestId,
    });

    return createSuccessResponse(parsedDataset, {
      status: 200,
      rateLimitResult,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal mengimpor Google Sheet.";
    Logger.error("Error in /api/ingest/gsheet", { error: errMessage, requestId });

    const isCircuitOpen = errMessage.includes("Circuit breaker is OPEN");
    return createErrorResponse(errMessage, {
      status: isCircuitOpen ? 503 : 500,
      code: isCircuitOpen ? "CIRCUIT_BREAKER_OPEN" : "GSHEET_FETCH_ERROR",
      rateLimitResult,
    });
  }
}
