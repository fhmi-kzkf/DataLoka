import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { AdminDbService } from "@/core/admin/admin-db-service";
import { AdminGuard } from "@/core/admin/admin-guard";
import { Logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = AdminGuard.verifySuperadmin(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const { id } = await context.params;
  if (!id) {
    return createErrorResponse("Parameter user ID tidak valid.", { status: 400 });
  }

  try {
    const body = await request.json();
    const updated = await AdminDbService.updateUser(id, body, {
      uid: auth.actor!.uid,
      email: auth.actor!.email,
      ip: auth.actor!.ip,
    });

    return createSuccessResponse(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memperbarui data pengguna";
    Logger.error("Failed to update user in database", { error: msg, id });
    return createErrorResponse(msg, { status: 500, code: "DATABASE_MUTATION_ERROR" });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = AdminGuard.verifySuperadmin(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const { id } = await context.params;
  if (!id) {
    return createErrorResponse("Parameter user ID tidak valid.", { status: 400 });
  }

  try {
    const success = await AdminDbService.deleteUser(id, {
      uid: auth.actor!.uid,
      email: auth.actor!.email,
      ip: auth.actor!.ip,
    });

    if (!success) {
      return createErrorResponse("Pengguna tidak ditemukan.", { status: 404 });
    }

    return createSuccessResponse({ success: true, message: `Pengguna ${id} berhasil dihapus.` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menghapus pengguna";
    Logger.error("Failed to delete user in database", { error: msg, id });
    return createErrorResponse(msg, { status: 500, code: "DATABASE_MUTATION_ERROR" });
  }
}
