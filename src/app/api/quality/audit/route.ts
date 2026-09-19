import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { rateLimiter, RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";
import { Logger } from "@/lib/logger";
import { analyzeDataQuality } from "@/core/quality/quality-analyzer";
import { analyzeDatasetColumns } from "@/core/mapping/column-analyzer";
import type { DatasetSchema } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  const rateLimitResult = rateLimiter.checkLimit(`quality:${clientIp}`, RATE_LIMIT_POLICIES.standard);
  if (!rateLimitResult.allowed) {
    return createErrorResponse("Terlalu banyak permintaan audit kualitas data.", {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  try {
    const body = await request.json();
    const { schema, headers, rows, columns = [], mapping } = body;

    const datasetSchema: DatasetSchema = schema || {
      id: "dataset-audit",
      name: "Audit Payload",
      sourceType: "file",
      headers: headers || [],
      columns: columns || [],
      rows: rows || [],
      rowCount: rows ? rows.length : 0,
      columnCount: headers ? headers.length : 0,
      totalRows: rows ? rows.length : 0,
      totalColumns: headers ? headers.length : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!datasetSchema.headers || datasetSchema.headers.length === 0) {
      return createErrorResponse("Parameter headers atau schema wajib disertakan.", {
        status: 400,
        code: "INVALID_DATASET_PAYLOAD",
        rateLimitResult,
      });
    }

    const effectiveMapping: DatasetMapping = mapping || analyzeDatasetColumns(datasetSchema);
    const qualityReport = analyzeDataQuality(datasetSchema, effectiveMapping);

    const healthScore = qualityReport.totalScore;
    const cleanlinessStatus = healthScore >= 80 ? "clean" : healthScore >= 50 ? "moderate" : "needs_cleansing";

    Logger.info("Quality audit completed", {
      healthScore,
      status: cleanlinessStatus,
      totalIssues: qualityReport.issues.length,
      latencyMs: Date.now() - startTime,
      requestId,
    });

    return createSuccessResponse(
      {
        ...qualityReport,
        healthScore,
        cleanlinessStatus,
        summary: {
          totalRows: qualityReport.totalRows,
          cleanRowCount: qualityReport.cleanRowCount,
          totalAnomalies: qualityReport.issues.reduce((acc, issue) => {
            if (issue.type === "duplicate_rows") return acc + issue.duplicateCount;
            if (issue.type === "missing_values") return acc + issue.missingCount;
            if (issue.type === "statistical_outliers") return acc + issue.outlierCount;
            if (issue.type === "category_inconsistency") return acc + issue.clusters.length;
            return acc;
          }, 0),
        },
      },
      {
        status: 200,
        rateLimitResult,
      }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal melakukan audit kualitas data.";
    Logger.error("Error in /api/quality/audit", { error: errMessage, requestId });

    return createErrorResponse(errMessage, {
      status: 500,
      code: "QUALITY_AUDIT_ERROR",
      rateLimitResult,
    });
  }
}
