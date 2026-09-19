import { NextRequest } from "next/server";
import { createErrorResponse } from "@/lib/api-response";
import { rateLimiter, RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";
import { SecurityGuard } from "@/lib/security";
import { Logger } from "@/lib/logger";
import type { DatasetRow, DatasetValue } from "@/types/dataset";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  const rateLimitResult = rateLimiter.checkLimit(`export:${clientIp}`, RATE_LIMIT_POLICIES.standard);
  if (!rateLimitResult.allowed) {
    return createErrorResponse("Terlalu banyak permintaan ekspor data.", {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  try {
    const body = await request.json();
    const { headers, rows, format = "csv", filename = "dataloka_export" } = body as {
      headers: string[];
      rows: DatasetRow[];
      format?: "csv" | "json";
      filename?: string;
    };

    if (!Array.isArray(headers) || !Array.isArray(rows)) {
      return createErrorResponse("Parameter 'headers' dan 'rows' wajib disertakan.", {
        status: 400,
        code: "INVALID_EXPORT_PAYLOAD",
        rateLimitResult,
      });
    }

    // 1. Sanitize rows against CSV Formula Injection (=, +, -, @, |)
    const sanitizedRows = rows.map((row) => {
      const cleanRow: DatasetRow = {};
      for (const header of headers) {
        cleanRow[header] = SecurityGuard.sanitizeFormulaInjection(row[header]) as DatasetValue;
      }
      return cleanRow;
    });

    if (format === "json") {
      const jsonContent = JSON.stringify(sanitizedRows, null, 2);
      Logger.info("JSON export generated", { rowCount: rows.length, latencyMs: Date.now() - startTime, requestId });

      return new Response(jsonContent, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // Generate CSV string
    const csvHeaderLine = headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(",");
    const csvBodyLines = sanitizedRows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const fullCsvContent = [csvHeaderLine, ...csvBodyLines].join("\r\n");

    Logger.info("CSV export generated with formula injection protection", {
      rowCount: rows.length,
      latencyMs: Date.now() - startTime,
      requestId,
    });

    return new Response(fullCsvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal mengekspor data.";
    Logger.error("Error in /api/export/data", { error: errMessage, requestId });

    return createErrorResponse(errMessage, {
      status: 500,
      code: "EXPORT_ERROR",
      rateLimitResult,
    });
  }
}
