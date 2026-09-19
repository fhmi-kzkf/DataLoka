import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { rateLimiter, RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";
import { Logger } from "@/lib/logger";
import {
  applyRemoveDuplicates,
  applyMissingValueFix,
  applyUnifyCategories,
  applyClipOutliers,
} from "@/core/quality/quality-transformer";
import type { DatasetRow } from "@/types/dataset";
import type { AuditLogEntry, ImputationStrategy } from "@/types/quality";

export const dynamic = "force-dynamic";

export interface CleansePayloadAction {
  type: "remove_duplicates" | "fill_missing" | "drop_missing_rows" | "unify_categories" | "clip_outliers" | "trim_whitespace";
  column?: string;
  duplicateIndices?: number[];
  strategy?: ImputationStrategy;
  customValue?: unknown;
  canonical?: string;
  variants?: string[];
  lowerBound?: number;
  upperBound?: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  const rateLimitResult = rateLimiter.checkLimit(`quality_cleanse:${clientIp}`, RATE_LIMIT_POLICIES.standard);
  if (!rateLimitResult.allowed) {
    return createErrorResponse("Terlalu banyak permintaan pembersihan data.", {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  try {
    const body = await request.json();
    const { rows, actions } = body as { rows: DatasetRow[]; actions: CleansePayloadAction[] };

    if (!Array.isArray(rows)) {
      return createErrorResponse("Parameter 'rows' wajib berupa array objek baris data.", {
        status: 400,
        code: "INVALID_ROWS_PARAM",
        rateLimitResult,
      });
    }

    if (!Array.isArray(actions) || actions.length === 0) {
      return createErrorResponse("Parameter 'actions' wajib berisi minimal 1 aksi pembersihan data.", {
        status: 400,
        code: "MISSING_CLEANSE_ACTIONS",
        rateLimitResult,
      });
    }

    let currentRows = [...rows];
    const auditLogs: AuditLogEntry[] = [];

    for (const action of actions) {
      switch (action.type) {
        case "remove_duplicates": {
          const indices = action.duplicateIndices || [];
          const res = applyRemoveDuplicates(currentRows, indices);
          currentRows = res.newRows;
          auditLogs.push(res.auditLog);
          break;
        }

        case "fill_missing":
        case "drop_missing_rows": {
          if (action.column) {
            const strat = action.strategy || (action.type === "drop_missing_rows" ? "drop_rows" : "fill_constant");
            const res = applyMissingValueFix(currentRows, action.column, strat, action.customValue as string | number | boolean | null);
            currentRows = res.newRows;
            auditLogs.push(res.auditLog);
          }
          break;
        }

        case "unify_categories": {
          if (action.column && action.canonical && action.variants) {
            const res = applyUnifyCategories(currentRows, action.column, action.canonical, action.variants);
            currentRows = res.newRows;
            auditLogs.push(res.auditLog);
          }
          break;
        }

        case "clip_outliers": {
          if (action.column && action.lowerBound !== undefined && action.upperBound !== undefined) {
            const res = applyClipOutliers(currentRows, action.column, action.lowerBound, action.upperBound);
            currentRows = res.newRows;
            auditLogs.push(res.auditLog);
          }
          break;
        }

        case "trim_whitespace": {
          let trimmedCount = 0;
          currentRows = currentRows.map((r) => {
            const clean = { ...r };
            if (action.column) {
              if (typeof clean[action.column] === "string") {
                const orig = clean[action.column] as string;
                const trimmed = orig.trim();
                if (orig !== trimmed) trimmedCount++;
                clean[action.column] = trimmed;
              }
            } else {
              for (const [k, v] of Object.entries(clean)) {
                if (typeof v === "string") {
                  const trimmed = v.trim();
                  if (v !== trimmed) trimmedCount++;
                  clean[k] = trimmed;
                }
              }
            }
            return clean;
          });

          auditLogs.push({
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toLocaleTimeString("id-ID"),
            action: "Pembersihan Spasi (Trim Whitespace)",
            details: `Membersihkan spasi berlebih pada ${trimmedCount} sel data.`,
            columnAffected: action.column,
            rowsAffected: trimmedCount,
          });
          break;
        }
      }
    }

    Logger.info("Data cleansing pipeline executed", {
      initialRowCount: rows.length,
      finalRowCount: currentRows.length,
      actionsApplied: actions.length,
      latencyMs: Date.now() - startTime,
      requestId,
    });

    return createSuccessResponse(
      {
        cleanedRows: currentRows,
        initialRowCount: rows.length,
        finalRowCount: currentRows.length,
        auditLog: auditLogs,
        appliedActions: actions,
      },
      {
        status: 200,
        rateLimitResult,
      }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal mengeksekusi pipeline pembersihan data.";
    Logger.error("Error in /api/quality/cleanse", { error: errMessage, requestId });

    return createErrorResponse(errMessage, {
      status: 500,
      code: "CLEANSE_EXECUTION_ERROR",
      rateLimitResult,
    });
  }
}
