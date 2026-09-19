import type { DatasetRow } from "@/types/dataset";
import type { AiQueryResult, AiIntentType } from "./ai-types";
import { AiQueryEngine } from "./ai-query-engine";
import { Logger } from "@/lib/logger";

export interface NvidiaNimConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  fallbackModels?: string[];
  timeoutMs?: number;
}

export class NvidiaNimClient {
  private static readonly DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
  private static readonly DEFAULT_PRIMARY_MODEL = "meta/llama-3.1-70b-instruct";
  private static readonly BUILT_IN_FALLBACK_MODELS = [
    "meta/llama-3.1-70b-instruct",
    "meta/llama-3.3-70b-instruct",
    "mistralai/mixtral-8x22b-instruct",
    "meta/llama3-8b-instruct",
  ];
  private static readonly TIMEOUT_MS = 10000;

  /**
   * Execute AI Query using NVIDIA NIM API with multi-tier model fallback
   * and final deterministic heuristic fallback.
   */
  static async queryWithNim(
    userPrompt: string,
    headers: string[],
    rows: DatasetRow[],
    currencySymbol: string = "Rp",
    config: NvidiaNimConfig = {}
  ): Promise<AiQueryResult> {
    const apiKey =
      config.apiKey ||
      process.env.NVIDIA_NIM_API_KEY ||
      process.env.NVIDIA_API_KEY;

    // Fallback directly to deterministic Indonesian NLP engine if no NVIDIA API key configured
    if (!apiKey) {
      Logger.info("NVIDIA NIM API key not configured, using deterministic Indonesian NLP heuristic engine", {
        prompt: userPrompt,
      });
      return AiQueryEngine.processQuery(userPrompt, headers, rows, currencySymbol);
    }

    const baseUrl = config.baseUrl || process.env.NVIDIA_NIM_BASE_URL || this.DEFAULT_BASE_URL;
    const primaryModel = config.model || process.env.NVIDIA_NIM_MODEL || this.DEFAULT_PRIMARY_MODEL;
    const configuredFallbacks = config.fallbackModels || this.getEnvFallbackModels();

    // Construct deduplicated model candidate chain: [primaryModel, ...fallbacks]
    const modelCandidates = Array.from(
      new Set([primaryModel, ...configuredFallbacks, ...this.BUILT_IN_FALLBACK_MODELS])
    ).filter(Boolean);

    const timeoutMs = config.timeoutMs || this.TIMEOUT_MS;
    const sampleSummary = this.summarizeDatasetForContext(headers, rows);

    const systemPrompt = `Anda adalah Senior Data Intelligence AI di platform DataLoka. 
Tugas Anda adalah menganalisis dataset spreadsheet pengguna dan menjawab pertanyaan analitik dalam Bahasa Indonesia yang profesional, presisi, dan langsung pada fakta angka.

FORMAT OUTPUT WAJIB:
Kembalikan respons murni dalam format JSON valid tanpa teks pengantar dan tanpa karakter formatting di luar JSON:
{
  "answerText": "Penjelasan analitik ringkas, padat, dan berbasis angka dalam Bahasa Indonesia.",
  "calculatedValue": "Nilai numerik atau persentase utama hasil kalkulasi",
  "intent": "top_ranking" | "bottom_ranking" | "aggregate_sum" | "aggregate_avg" | "aggregate_count" | "trend_analysis" | "chart_transform" | "explain_dataset",
  "confidence": 0.95,
  "chartType": "bar" | "line" | "pie" | "donut" | "area",
  "chartTitle": "Judul visualisasi yang sesuai",
  "sqlEquivalent": "Sintaks SQL kalkulasi terkait",
  "suggestedFollowUps": ["Pertanyaan lanjutan 1", "Pertanyaan lanjutan 2", "Pertanyaan lanjutan 3"]
}`;

    const userMessage = `Konteks Dataset:
- Kolom Tersedia: ${headers.join(", ")}
- Total Baris: ${rows.length}
- Ringkasan Statistik Data Sampel:
${sampleSummary}

Pertanyaan Pengguna:
"${userPrompt}"

Simpulkan jawaban analitik Anda dan kembalikan JSON sesuai spesifikasi.`;

    // Multi-tier model execution loop
    for (let i = 0; i < modelCandidates.length; i++) {
      const currentModel = modelCandidates[i];
      const isPrimary = i === 0;

      try {
        Logger.info(`Executing NVIDIA NIM inference (model ${i + 1}/${modelCandidates.length})`, {
          model: currentModel,
          isPrimary,
          prompt: userPrompt,
        });

        const parsedJson = await this.executeInference(
          baseUrl,
          apiKey,
          currentModel,
          systemPrompt,
          userMessage,
          timeoutMs
        );

        if (parsedJson) {
          const heuristicResult = AiQueryEngine.processQuery(userPrompt, headers, rows, currencySymbol);

          return {
            answerText: parsedJson.answerText || heuristicResult.answerText,
            calculatedValue:
              parsedJson.calculatedValue !== undefined
                ? parsedJson.calculatedValue
                : heuristicResult.calculatedValue,
            intent: (parsedJson.intent as AiIntentType) || heuristicResult.intent,
            confidence: typeof parsedJson.confidence === "number" ? parsedJson.confidence : 0.95,
            chartRecommendation: {
              chartType: parsedJson.chartType || heuristicResult.chartRecommendation?.chartType || "bar",
              title: parsedJson.chartTitle || heuristicResult.chartRecommendation?.title || "Visualisasi Data Terpilih",
              subtitle: `Dianalisis melalui AI Assistant & DataLoka Engine`,
              data: heuristicResult.chartRecommendation?.data || [],
            },
            sqlEquivalent: parsedJson.sqlEquivalent || heuristicResult.sqlEquivalent,
            suggestedFollowUps:
              Array.isArray(parsedJson.suggestedFollowUps) && parsedJson.suggestedFollowUps.length > 0
                ? parsedJson.suggestedFollowUps
                : heuristicResult.suggestedFollowUps,
          };
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        Logger.warn(`Model ${currentModel} failed, switching to next candidate in fallback chain`, {
          model: currentModel,
          error: errorMsg,
          nextModel: modelCandidates[i + 1] || "Local-Heuristic-Engine",
        });
      }
    }

    // Ultimate Tier Fallback: Local deterministic Indonesian heuristic engine
    Logger.warn("All NVIDIA NIM model candidates exhausted, executing local deterministic Indonesian NLP engine", {
      prompt: userPrompt,
      attemptedModels: modelCandidates,
    });
    return AiQueryEngine.processQuery(userPrompt, headers, rows, currencySymbol);
  }

  /**
   * Execute single HTTP inference request with JSON response format fallback
   */
  private static async executeInference(
    baseUrl: string,
    apiKey: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    timeoutMs: number
  ): Promise<Record<string, unknown> | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // First attempt with response_format: { type: "json_object" }
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.2,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      if (response.ok) {
        const responseData = await response.json();
        const content = responseData.choices?.[0]?.message?.content;
        return this.parseJsonContent(content);
      }

      // If 400 Bad Request due to unsupported response_format, retry without response_format
      if (response.status === 400) {
        const retryResponse = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: 0.2,
            max_tokens: 1024,
          }),
          signal: controller.signal,
        });

        if (retryResponse.ok) {
          const responseData = await retryResponse.json();
          const content = responseData.choices?.[0]?.message?.content;
          return this.parseJsonContent(content);
        }
      }

      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Robust JSON parser extracting JSON from markdown or raw text
   */
  private static parseJsonContent(content: string | undefined): Record<string, unknown> | null {
    if (!content || typeof content !== "string") return null;

    const trimmed = content.trim();

    // 1. Direct JSON parse
    try {
      return JSON.parse(trimmed);
    } catch {
      // Continue to pattern extraction
    }

    // 2. Markdown fenced block extraction (```json ... ``` or ``` ... ```)
    const markdownMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
      try {
        return JSON.parse(markdownMatch[1].trim());
      } catch {
        // Continue
      }
    }

    // 3. Regex object boundaries extraction
    const jsonObjectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        return JSON.parse(jsonObjectMatch[0]);
      } catch {
        // Fall through
      }
    }

    return null;
  }

  /**
   * Helper to parse fallback models from environment variable
   */
  private static getEnvFallbackModels(): string[] {
    const envVal = process.env.NVIDIA_NIM_FALLBACK_MODELS;
    if (!envVal || typeof envVal !== "string") return [];
    return envVal
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
  }

  /**
   * Helper to summarize dataset schema and top 5 rows for prompt context
   */
  private static summarizeDatasetForContext(headers: string[], rows: DatasetRow[]): string {
    const sample = rows.slice(0, 5);
    const summaryLines = sample.map((r, i) => {
      const values = headers.map((h) => `${h}: ${r[h] ?? "null"}`).join(" | ");
      return `Baris ${i + 1}: ${values}`;
    });
    return summaryLines.join("\n");
  }
}
