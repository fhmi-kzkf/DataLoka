import { NextResponse } from "next/server";
import { SecurityGuard } from "./security";
import type { RateLimitResult } from "./rate-limiter";

export interface ApiResponseMeta {
  timestamp: string;
  requestId?: string;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetTimeMs: number;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  meta: ApiResponseMeta;
}

export interface ResponseOptions {
  status?: number;
  rateLimitResult?: RateLimitResult;
  customHeaders?: Record<string, string>;
  code?: string;
  details?: ApiErrorDetail[];
}

export function createSuccessResponse<T>(
  data: T,
  optionsOrStatus: ResponseOptions | number = 200,
  rateLimit?: RateLimitResult,
  customHeaders?: Record<string, string>
): NextResponse<ApiSuccessResponse<T>> {
  let status = 200;
  let activeRateLimit = rateLimit;
  let headersMap: Record<string, string> | undefined = customHeaders;

  if (typeof optionsOrStatus === "number") {
    status = optionsOrStatus;
  } else if (typeof optionsOrStatus === "object" && optionsOrStatus !== null) {
    status = optionsOrStatus.status ?? 200;
    activeRateLimit = optionsOrStatus.rateLimitResult ?? activeRateLimit;
    headersMap = optionsOrStatus.customHeaders ?? headersMap;
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    ...SecurityGuard.getSecurityHeaders(),
    ...headersMap,
  });

  if (activeRateLimit) {
    headers.set("X-RateLimit-Limit", activeRateLimit.limit.toString());
    headers.set("X-RateLimit-Remaining", activeRateLimit.remaining.toString());
    headers.set("X-RateLimit-Reset", activeRateLimit.resetTimeMs.toString());
  }

  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      rateLimit: activeRateLimit
        ? {
            limit: activeRateLimit.limit,
            remaining: activeRateLimit.remaining,
            resetTimeMs: activeRateLimit.resetTimeMs,
          }
        : undefined,
    },
  };

  return NextResponse.json(body, { status, headers });
}

export function createErrorResponse(
  messageOrCode: string,
  optionsOrMessage?: ResponseOptions | string,
  details?: ApiErrorDetail[],
  statusParam: number = 400,
  rateLimitParam?: RateLimitResult
): NextResponse<ApiErrorResponse> {
  let code = "BAD_REQUEST";
  let message = messageOrCode;
  let status = statusParam;
  let activeRateLimit = rateLimitParam;
  let activeDetails = details;

  if (typeof optionsOrMessage === "object" && optionsOrMessage !== null) {
    message = messageOrCode;
    code = optionsOrMessage.code || "BAD_REQUEST";
    status = optionsOrMessage.status ?? 400;
    activeRateLimit = optionsOrMessage.rateLimitResult ?? activeRateLimit;
    activeDetails = optionsOrMessage.details ?? activeDetails;
  } else if (typeof optionsOrMessage === "string") {
    code = messageOrCode;
    message = optionsOrMessage;
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    ...SecurityGuard.getSecurityHeaders(),
  });

  if (activeRateLimit) {
    headers.set("X-RateLimit-Limit", activeRateLimit.limit.toString());
    headers.set("X-RateLimit-Remaining", activeRateLimit.remaining.toString());
    headers.set("X-RateLimit-Reset", activeRateLimit.resetTimeMs.toString());
  }

  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details: activeDetails,
    },
    meta: {
      timestamp: new Date().toISOString(),
      rateLimit: activeRateLimit
        ? {
            limit: activeRateLimit.limit,
            remaining: activeRateLimit.remaining,
            resetTimeMs: activeRateLimit.resetTimeMs,
          }
        : undefined,
    },
  };

  return NextResponse.json(body, { status, headers });
}
