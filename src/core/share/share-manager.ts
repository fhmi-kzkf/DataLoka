import type { DashboardState } from "@/types/template";
import type { SharePayload } from "@/types/insight";

export function createSharePayload(
  dashboard: DashboardState,
  datasetName = "Dataset"
): SharePayload {
  // Limit data points to top 20 per chart to keep payload lightweight and fast
  return {
    version: "1.0",
    title: dashboard.title,
    subtitle: dashboard.subtitle,
    templateId: dashboard.templateId,
    datasetName,
    kpiCards: dashboard.kpiCards.map((k) => ({
      title: k.title,
      formattedValue: k.kpiMetric?.formattedValue || String(k.kpiMetric?.value || "-"),
      deltaText: k.kpiMetric?.deltaText,
      isPositive: k.kpiMetric?.isPositive,
    })),
    mainCharts: dashboard.mainCharts.map((c) => ({
      title: c.title,
      chartType: c.chartType,
      data: (c.data || []).slice(0, 25).map((dp) => ({
        label: dp.label,
        value: dp.value,
        category: dp.category ? String(dp.category) : undefined,
      })),
    })),
    accentCard: dashboard.accentCard,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Encode payload into URL-safe Base64URL string (RFC 4648)
 */
export function encodeShareToken(payload: SharePayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    let base64 = "";

    if (typeof window !== "undefined") {
      base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    } else {
      base64 = Buffer.from(jsonStr, "utf-8").toString("base64");
    }

    // Convert standard base64 to base64url (replace + with -, / with _, strip =)
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return "";
  }
}

/**
 * Decode URL-safe Base64URL or legacy Base64 token into SharePayload safely without throwing
 */
export function decodeShareToken(token: string): SharePayload | null {
  if (!token || typeof token !== "string") return null;

  // 1. Try URL-safe Base64URL decoding
  try {
    let clean = token.trim();
    // Normalize base64url to standard base64
    clean = clean.replace(/-/g, "+").replace(/_/g, "/");
    // Re-pad with =
    while (clean.length % 4 !== 0) {
      clean += "=";
    }

    let jsonStr = "";
    if (typeof window !== "undefined") {
      jsonStr = decodeURIComponent(escape(atob(clean)));
    } else {
      jsonStr = Buffer.from(clean, "base64").toString("utf-8");
    }

    if (jsonStr) {
      return JSON.parse(jsonStr) as SharePayload;
    }
  } catch {
    // Fall through to legacy format
  }

  // 2. Legacy fallback for old URL-encoded base64 format
  try {
    const decodedUri = decodeURIComponent(token);
    let jsonStr = "";
    if (typeof window !== "undefined") {
      try {
        jsonStr = decodeURIComponent(atob(decodedUri));
      } catch {
        jsonStr = atob(decodedUri);
      }
    } else {
      try {
        jsonStr = decodeURIComponent(Buffer.from(decodedUri, "base64").toString("utf-8"));
      } catch {
        jsonStr = Buffer.from(decodedUri, "base64").toString("utf-8");
      }
    }

    if (jsonStr) {
      return JSON.parse(jsonStr) as SharePayload;
    }
  } catch {
    // Return null on failure
  }

  return null;
}

export function generateShareUrl(token: string, baseUrl?: string): string {
  const origin =
    baseUrl ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  return `${origin}/shared/${token}`;
}

