import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { AdminDbService } from "@/core/admin/admin-db-service";
import { AdminGuard } from "@/core/admin/admin-guard";
import { Logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();

  const auth = AdminGuard.verifyAdmin(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const stats = await AdminDbService.getPlatformStats();

    Logger.info("Admin platform stats retrieved successfully from database", {
      totalUsers: stats.totalUsers,
      mrr: stats.mrr,
      latencyMs: Date.now() - startTime,
      requestId,
    });

    return createSuccessResponse(stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal mengambil statistik platform dari database";
    Logger.error("Failed to fetch admin platform stats", { error: msg, requestId });
    return createErrorResponse(msg, { status: 500, code: "DATABASE_QUERY_ERROR" });
  }
}
