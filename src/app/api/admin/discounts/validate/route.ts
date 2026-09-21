import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { AdminDbService } from "@/core/admin/admin-db-service";
import { Logger } from "@/lib/logger";
import type { PlanTierId, BillingCycle } from "@/types/pricing";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, tier, billingCycle, originalPrice } = body as {
      code: string;
      tier: PlanTierId;
      billingCycle: BillingCycle;
      originalPrice: number;
    };

    if (!code || !tier || !billingCycle || originalPrice === undefined) {
      return createErrorResponse("Parameter code, tier, billingCycle, dan originalPrice wajib disertakan.", {
        status: 400,
        code: "INVALID_DISCOUNT_PARAMS",
      });
    }

    const validation = await AdminDbService.validateDiscountCode(
      code,
      tier,
      billingCycle,
      originalPrice
    );

    Logger.info("Discount coupon validated against database", {
      code,
      valid: validation.valid,
      discountAmount: validation.discountAmount,
      finalPrice: validation.finalPrice,
    });

    return createSuccessResponse(validation);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memvalidasi kode kupon diskon";
    Logger.error("Failed to validate discount coupon in database", { error: msg });
    return createErrorResponse(msg, { status: 500, code: "DATABASE_QUERY_ERROR" });
  }
}
