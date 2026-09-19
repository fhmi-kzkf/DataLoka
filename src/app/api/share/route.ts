import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { rateLimiter, RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";
import { Logger } from "@/lib/logger";
import { createSharePayload, encodeShareToken, decodeShareToken, generateShareUrl } from "@/core/share/share-manager";
import type { DashboardState } from "@/types/template";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  const rateLimitResult = rateLimiter.checkLimit(`share:${clientIp}`, RATE_LIMIT_POLICIES.standard);
  if (!rateLimitResult.allowed) {
    return createErrorResponse("Terlalu banyak pembuatan snapshot link.", {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  try {
    const body = await request.json();
    const { dashboard, datasetName } = body as { dashboard: DashboardState; datasetName?: string };

    if (!dashboard || !dashboard.title) {
      return createErrorResponse("Parameter 'dashboard' state tidak valid.", {
        status: 400,
        code: "INVALID_DASHBOARD_PAYLOAD",
        rateLimitResult,
      });
    }

    const payload = createSharePayload(dashboard, datasetName);
    const token = encodeShareToken(payload);

    if (!token) {
      return createErrorResponse("Gagal mengenkripsi token snapshot.", {
        status: 500,
        code: "ENCODING_ERROR",
        rateLimitResult,
      });
    }

    const url = new URL(request.url);
    const shareUrl = generateShareUrl(token, url.origin);

    Logger.info("Public snapshot link generated", {
      title: dashboard.title,
      tokenLength: token.length,
      latencyMs: Date.now() - startTime,
      requestId,
    });

    return createSuccessResponse(
      {
        token,
        shareUrl,
        payload,
      },
      {
        status: 201,
        rateLimitResult,
      }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal membuat link snapshot.";
    Logger.error("Error in POST /api/share", { error: errMessage, requestId });

    return createErrorResponse(errMessage, {
      status: 500,
      code: "SHARE_CREATION_ERROR",
      rateLimitResult,
    });
  }
}

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  const rateLimitResult = rateLimiter.checkLimit(`share_view:${clientIp}`, RATE_LIMIT_POLICIES.publicShare);
  if (!rateLimitResult.allowed) {
    return createErrorResponse("Batas akses snapshot tercapai. Harap tunggu sesaat.", {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return createErrorResponse("Parameter 'token' wajib disertakan.", {
      status: 400,
      code: "MISSING_TOKEN",
      rateLimitResult,
    });
  }

  const payload = decodeShareToken(token);
  if (!payload) {
    return createErrorResponse("Token snapshot tidak valid atau telah rusak.", {
      status: 404,
      code: "INVALID_OR_CORRUPT_TOKEN",
      rateLimitResult,
    });
  }

  Logger.info("Public snapshot accessed", {
    tokenPrefix: token.slice(0, 10),
    title: payload.title,
    requestId,
  });

  return createSuccessResponse(payload, {
    status: 200,
    rateLimitResult,
  });
}
