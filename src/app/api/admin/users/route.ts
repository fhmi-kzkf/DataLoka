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
  const role = searchParams.get("role") || "";
  const tier = searchParams.get("tier") || "";
  const status = searchParams.get("status") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "desc";

  try {
    const result = await AdminDbService.getUsers({
      page,
      limit,
      search,
      role,
      tier,
      status,
      sortBy,
      sortDir,
    });

    return createSuccessResponse(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal melakukan kueri pengguna";
    Logger.error("Failed to query users from database", { error: msg });
    return createErrorResponse(msg, { status: 500, code: "DATABASE_QUERY_ERROR" });
  }
}
