import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { rateLimiter, RATE_LIMIT_POLICIES } from "@/lib/rate-limiter";
import { SecurityGuard } from "@/lib/security";
import { Logger } from "@/lib/logger";
import { parseCsvContent } from "@/core/parser/csv-parser";
import { parseExcelArrayBuffer } from "@/core/parser/excel-parser";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

  // 1. Rate Limiting Check
  const rateLimitResult = rateLimiter.checkLimit(`upload:${clientIp}`, RATE_LIMIT_POLICIES.upload);
  if (!rateLimitResult.allowed) {
    Logger.warn("Upload rate limit exceeded", { clientIp, requestId });
    return createErrorResponse("Terlalu banyak permintaan unggah file. Harap tunggu beberapa saat.", {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      rateLimitResult,
    });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle Multipart Form Data
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return createErrorResponse("File tidak ditemukan dalam form data.", {
          status: 400,
          code: "MISSING_FILE",
          rateLimitResult,
        });
      }

      if (file.size > SecurityGuard.MAX_FILE_SIZE_BYTES) {
        return createErrorResponse(`Ukuran file melebihi batas maksimum ${SecurityGuard.MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`, {
          status: 413,
          code: "PAYLOAD_TOO_LARGE",
          rateLimitResult,
        });
      }

      const fileName = file.name;
      const isCsv = fileName.toLowerCase().endsWith(".csv");
      const isExcel = fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".xls");

      if (!isCsv && !isExcel) {
        return createErrorResponse("Format file tidak didukung. Harap unggah file CSV atau Excel (.xlsx, .xls).", {
          status: 415,
          code: "UNSUPPORTED_MEDIA_TYPE",
          rateLimitResult,
        });
      }

      let parsedDataset;
      if (isCsv) {
        const text = await file.text();
        parsedDataset = await parseCsvContent(text, { name: fileName, sourceType: "file" });
      } else {
        const buffer = await file.arrayBuffer();
        parsedDataset = await parseExcelArrayBuffer(buffer, { name: fileName });
      }

      Logger.info("File upload parsed successfully", {
        fileName,
        rowCount: parsedDataset.rows.length,
        columnCount: parsedDataset.headers.length,
        latencyMs: Date.now() - startTime,
        requestId,
      });

      return createSuccessResponse(parsedDataset, {
        status: 200,
        rateLimitResult,
      });
    }

    // Handle Raw JSON with CSV Text
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { csvContent, fileName = "dataset.csv" } = body;

      if (!csvContent || typeof csvContent !== "string") {
        return createErrorResponse("Parameter csvContent wajib disertakan dalam format string.", {
          status: 400,
          code: "INVALID_BODY",
          rateLimitResult,
        });
      }

      const parsedDataset = await parseCsvContent(csvContent, { name: fileName, sourceType: "file" });

      Logger.info("Raw CSV parsed successfully", {
        rowCount: parsedDataset.rows.length,
        latencyMs: Date.now() - startTime,
        requestId,
      });

      return createSuccessResponse(parsedDataset, {
        status: 200,
        rateLimitResult,
      });
    }

    return createErrorResponse("Content-Type tidak didukung. Gunakan multipart/form-data atau application/json.", {
      status: 415,
      code: "UNSUPPORTED_MEDIA_TYPE",
      rateLimitResult,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal memproses file yang diunggah.";
    Logger.error("Error in /api/ingest/upload", { error: errMessage, requestId, stack: error instanceof Error ? error.stack : undefined });

    return createErrorResponse(errMessage, {
      status: 500,
      code: "INTERNAL_PARSER_ERROR",
      rateLimitResult,
    });
  }
}
