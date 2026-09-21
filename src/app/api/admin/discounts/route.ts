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

  try {
    const discounts = await AdminDbService.getDiscounts();
    return createSuccessResponse(discounts);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal mengambil daftar kupon diskon";
    Logger.error("Failed to query discounts from database", { error: msg });
    return createErrorResponse(msg, { status: 500, code: "DATABASE_QUERY_ERROR" });
  }
}

export async function POST(request: NextRequest) {
  const auth = AdminGuard.verifySuperadmin(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();

    if (!body.code || !body.discountType || body.discountValue === undefined) {
      return createErrorResponse("Parameter code, discountType, dan discountValue wajib diisi.", { status: 400 });
    }

    const created = await AdminDbService.createDiscount(body, {
      uid: auth.actor!.uid,
      email: auth.actor!.email,
      ip: auth.actor!.ip,
    });

    return createSuccessResponse(created, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal membuat kode kupon diskon baru";
    Logger.error("Failed to create discount in database", { error: msg });
    return createErrorResponse(msg, { status: 500, code: "DATABASE_MUTATION_ERROR" });
  }
}
