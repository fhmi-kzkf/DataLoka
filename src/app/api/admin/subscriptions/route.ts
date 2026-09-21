import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { AdminDbService } from "@/core/admin/admin-db-service";
import { AdminGuard } from "@/core/admin/admin-guard";
import { Logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = AdminGuard.verifyAdmin(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const tier = searchParams.get("tier") || "";

  try {
    const result = await AdminDbService.getSubscriptions({
      page,
      limit,
      search,
      status,
      tier,
    });

    return createSuccessResponse(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal melakukan kueri riwayat transaksi";
    Logger.error("Failed to query subscriptions from database", { error: msg });
    return createErrorResponse(msg, { status: 500, code: "DATABASE_QUERY_ERROR" });
  }
}
