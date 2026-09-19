import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { RateLimiter } from "@/lib/rate-limiter";
import { CircuitBreaker } from "@/lib/circuit-breaker";
import { SecurityGuard } from "@/lib/security";
import { AiColumnMapper } from "@/core/ai/ai-column-mapper";
import { AiQueryEngine } from "@/core/ai/ai-query-engine";
import { AiNarrativeGenerator } from "@/core/ai/ai-narrative-generator";
import { NvidiaNimClient } from "@/core/ai/nvidia-nim-client";

// Route Handlers
import { GET as healthHandler } from "@/app/api/health/route";
import { POST as mappingHandler } from "@/app/api/mapping/classify/route";
import { POST as auditHandler } from "@/app/api/quality/audit/route";
import { POST as cleanseHandler } from "@/app/api/quality/cleanse/route";
import { POST as aiQueryHandler } from "@/app/api/ai/query/route";
import { POST as exportHandler } from "@/app/api/export/data/route";
import { POST as sharePostHandler, GET as shareGetHandler } from "@/app/api/share/route";

describe("Backend Infrastructure & AI Engines", () => {
  describe("1. RateLimiter Sliding Window Engine", () => {
    let limiter: RateLimiter;

    beforeEach(() => {
      limiter = new RateLimiter();
    });

    it("should allow requests under the limit threshold", () => {
      const policy = { maxRequests: 3, windowMs: 1000 };
      const res1 = limiter.checkLimit("user-1", policy);
      const res2 = limiter.checkLimit("user-1", policy);

      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(2);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(1);
    });

    it("should reject requests exceeding max threshold", () => {
      const policy = { maxRequests: 2, windowMs: 1000 };
      limiter.checkLimit("user-2", policy);
      limiter.checkLimit("user-2", policy);
      const res3 = limiter.checkLimit("user-2", policy);

      expect(res3.allowed).toBe(false);
      expect(res3.remaining).toBe(0);
      expect(res3.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    });
  });

  describe("2. CircuitBreaker Fault Tolerance Engine", () => {
    it("should trip from CLOSED to OPEN after failure threshold", async () => {
      const cb = new CircuitBreaker({
        name: "TestBreaker",
        failureThreshold: 2,
        cooldownPeriodMs: 500,
      });

      const failingTask = async () => {
        throw new Error("Upstream Network Timeout");
      };

      // First failure
      await expect(cb.execute(failingTask)).rejects.toThrow("Upstream Network Timeout");
      expect(cb.getState()).toBe("CLOSED");

      // Second failure -> Trips to OPEN
      await expect(cb.execute(failingTask)).rejects.toThrow("Upstream Network Timeout");
      expect(cb.getState()).toBe("OPEN");

      // Third attempt blocked immediately by Circuit Breaker
      await expect(cb.execute(failingTask)).rejects.toThrow("is OPEN");
    });

    it("should execute fallback when circuit is OPEN", async () => {
      const cb = new CircuitBreaker({
        name: "TestFallbackBreaker",
        failureThreshold: 1,
        cooldownPeriodMs: 1000,
      });

      await expect(cb.execute(async () => { throw new Error("API Down"); })).rejects.toThrow();

      const fallbackRes = await cb.execute(
        async () => { throw new Error("API Down"); },
        async () => "FALLBACK_DATA"
      );

      expect(fallbackRes).toBe("FALLBACK_DATA");
    });
  });

  describe("3. SecurityGuard & CSV Formula Injection Neutralizer", () => {
    it("should neutralize formula prefixes (=, +, -, @, |)", () => {
      expect(SecurityGuard.sanitizeFormulaInjection("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
      expect(SecurityGuard.sanitizeFormulaInjection("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
      expect(SecurityGuard.sanitizeFormulaInjection("-100")).toBe("'-100");
      expect(SecurityGuard.sanitizeFormulaInjection("@IMPORTXML()")).toBe("'@IMPORTXML()");
      expect(SecurityGuard.sanitizeFormulaInjection("|powershell")).toBe("'|powershell");
    });

    it("should leave normal non-formula text unaltered", () => {
      expect(SecurityGuard.sanitizeFormulaInjection("Kemeja Pria Batik")).toBe("Kemeja Pria Batik");
      expect(SecurityGuard.sanitizeFormulaInjection(150000)).toBe(150000);
      expect(SecurityGuard.sanitizeFormulaInjection(null)).toBe(null);
    });

    it("should sanitize malicious script tags (XSS)", () => {
      const dirty = "<script>alert('xss')</script>Kategori";
      expect(SecurityGuard.sanitizeXss(dirty)).not.toContain("<script>");
    });
  });

  describe("4. AI Column Mapper Indonesian Semantic Engine", () => {
    it("should accurately classify marketplace and financial headers", () => {
      const omsetRes = AiColumnMapper.classifyColumn("total_penjualan");
      expect(omsetRes.semanticRole).toBe("metric");
      expect(omsetRes.detectedDataType).toBe("currency");
      expect(omsetRes.confidence).toBeGreaterThanOrEqual(0.9);

      const categoryRes = AiColumnMapper.classifyColumn("kategori_produk");
      expect(categoryRes.semanticRole).toBe("category");
      expect(categoryRes.detectedDataType).toBe("categorical");

      const dateRes = AiColumnMapper.classifyColumn("tanggal_transaksi");
      expect(dateRes.semanticRole).toBe("time");
      expect(dateRes.detectedDataType).toBe("datetime");

      const cityRes = AiColumnMapper.classifyColumn("kota_pengiriman");
      expect(cityRes.semanticRole).toBe("location");
    });
  });

  describe("5. AI Query Engine (Natural Language to Data)", () => {
    const sampleHeaders = ["Kategori", "Total_Penjualan", "Qty"];
    const sampleRows = [
      { Kategori: "Elektronik", Total_Penjualan: 5000000, Qty: 10 },
      { Kategori: "Fashion", Total_Penjualan: 3000000, Qty: 25 },
      { Kategori: "F&B", Total_Penjualan: 1500000, Qty: 50 },
      { Kategori: "Otomotif", Total_Penjualan: 8000000, Qty: 4 },
    ];

    it("should process top ranking queries in Indonesian", () => {
      const result = AiQueryEngine.processQuery("Top 3 kategori omset tertinggi", sampleHeaders, sampleRows);

      expect(result.intent).toBe("top_ranking");
      expect(result.chartRecommendation).toBeDefined();
      expect(result.chartRecommendation?.data[0].label).toBe("Otomotif");
      expect(result.chartRecommendation?.data[0].value).toBe(8000000);
      expect(result.answerText).toContain("Otomotif");
      expect(result.sqlEquivalent).toContain("ORDER BY total DESC LIMIT 3");
    });

    it("should process aggregate average queries", () => {
      const result = AiQueryEngine.processQuery("Berapa rata-rata penjualan per kategori?", sampleHeaders, sampleRows);

      expect(result.intent).toBe("aggregate_avg");
      expect(result.calculatedValue).toBe(4375000);
      expect(result.sqlEquivalent).toContain("AVG");
    });
  });

  describe("6. AI Executive Narrative Generator", () => {
    it("should generate structured executive summary with concentration detection", () => {
      const headers = ["Produk", "Revenue"];
      const rows = [
        { Produk: "Laptop Pro", Revenue: 90000000 },
        { Produk: "Mouse Wireless", Revenue: 5000000 },
        { Produk: "Keyboard RGB", Revenue: 5000000 },
      ];

      const report = AiNarrativeGenerator.generateExecutiveReport("Penjualan Q1", headers, rows);

      expect(report.headline).toContain("Penjualan Q1");
      expect(report.keyInsights.length).toBeGreaterThan(0);
      const concentrationInsight = report.keyInsights.find((i) => i.title.includes("Risiko Konsentrasi"));
      expect(concentrationInsight).toBeDefined();
      expect(concentrationInsight?.severity).toBe("warning");
      expect(report.strategicRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe("6.1. NVIDIA NIM Client Multi-Tier Model Fallback", () => {
    const sampleHeaders = ["Kategori", "Total_Penjualan"];
    const sampleRows = [
      { Kategori: "Elektronik", Total_Penjualan: 5000000 },
      { Kategori: "Fashion", Total_Penjualan: 3000000 },
    ];

    it("should seamlessly fall back to local heuristic engine if API key is not configured", async () => {
      const result = await NvidiaNimClient.queryWithNim(
        "Top 1 Kategori",
        sampleHeaders,
        sampleRows,
        "Rp",
        { apiKey: "" }
      );

      expect(result).toBeDefined();
      expect(result.intent).toBe("top_ranking");
      expect(result.answerText).toContain("Elektronik");
    });

    it("should try fallback model chain and succeed if primary model fails with 404/400", async () => {
      let callCount = 0;
      const originalFetch = globalThis.fetch;

      // Mock fetch: first call fails (primary model 404), second call succeeds (fallback model)
      globalThis.fetch = ((() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(
            new Response(JSON.stringify({ error: { message: "Model not found" } }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            })
          );
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      answerText: "Elektronik adalah kategori tertinggi sebesar Rp 5.000.000.",
                      calculatedValue: 5000000,
                      intent: "top_ranking",
                      confidence: 0.98,
                      chartType: "bar",
                      chartTitle: "Kategori Penjualan Terbesar",
                      sqlEquivalent: "SELECT Kategori, Total_Penjualan FROM data ORDER BY Total_Penjualan DESC LIMIT 1",
                      suggestedFollowUps: ["Berapa margin keuntungan?"],
                    }),
                  },
                },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        );
      }) as unknown) as typeof fetch;

      try {
        const result = await NvidiaNimClient.queryWithNim(
          "Kategori omset tertinggi",
          sampleHeaders,
          sampleRows,
          "Rp",
          {
            apiKey: "nvapi-test-dummy",
            model: "nonexistent-primary-model",
            fallbackModels: ["meta/llama-3.1-70b-instruct"],
          }
        );

        expect(result.answerText).toContain("Elektronik");
        expect(result.calculatedValue).toBe(5000000);
        expect(callCount).toBeGreaterThanOrEqual(2);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("should gracefully fall back to local heuristic engine if all remote models throw network errors", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = ((() => {
        return Promise.reject(new Error("Network connection refused"));
      }) as unknown) as typeof fetch;



      try {
        const result = await NvidiaNimClient.queryWithNim(
          "Top 1 Kategori",
          sampleHeaders,
          sampleRows,
          "Rp",
          {
            apiKey: "nvapi-test-dummy",
            model: "invalid-model",
            fallbackModels: ["invalid-fallback-1"],
          }
        );

        expect(result).toBeDefined();
        expect(result.intent).toBe("top_ranking");
        expect(result.answerText).toContain("Elektronik");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });


  describe("7. Backend API Route Handlers Integration", () => {
    it("GET /api/health should return telemetry metrics", async () => {
      const req = new NextRequest("http://localhost:3000/api/health");
      const res = await healthHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.status).toBe("healthy");
      expect(json.data.circuitBreakers.gsheet.state).toBe("CLOSED");
    });

    it("POST /api/mapping/classify should classify headers", async () => {
      const req = new NextRequest("http://localhost:3000/api/mapping/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: ["Tanggal", "Nama_Barang", "Omset"],
          sampleRows: [{ Tanggal: "2026-03-01", Nama_Barang: "Sepatu", Omset: 250000 }],
        }),
      });

      const res = await mappingHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.classifications.length).toBe(3);
    });

    it("POST /api/quality/audit should compute dataset health score", async () => {
      const req = new NextRequest("http://localhost:3000/api/quality/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: ["ID", "Produk", "Harga"],
          rows: [
            { ID: "1", Produk: "A", Harga: 1000 },
            { ID: "2", Produk: "B", Harga: null },
          ],
        }),
      });

      const res = await auditHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.healthScore).toBeDefined();
    });

    it("POST /api/quality/cleanse should apply transformation actions", async () => {
      const req = new NextRequest("http://localhost:3000/api/quality/cleanse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: [
            { ID: "1", Produk: "  Baju Kemeja  ", Harga: 1000 },
            { ID: "2", Produk: "Celana", Harga: 2000 },
          ],
          actions: [{ type: "trim_whitespace", column: "Produk" }],
        }),
      });

      const res = await cleanseHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.cleanedRows[0].Produk).toBe("Baju Kemeja");
    });

    it("POST /api/ai/query should execute NLP question", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Top 2 Kategori omset terbesar",
          headers: ["Kategori", "Omset"],
          rows: [
            { Kategori: "Elektronik", Omset: 500000 },
            { Kategori: "Buku", Omset: 100000 },
          ],
        }),
      });

      const res = await aiQueryHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.intent).toBe("top_ranking");
    });

    it("POST /api/export/data should export CSV with sanitized formulas", async () => {
      const req = new NextRequest("http://localhost:3000/api/export/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: ["Produk", "Rumus_Injeksi"],
          rows: [{ Produk: "Kamera", Rumus_Injeksi: "=2+5" }],
          format: "csv",
        }),
      });

      const res = await exportHandler(req);
      const csvText = await res.text();

      expect(res.status).toBe(200);
      expect(csvText).toContain("'=2+5");
    });

    it("POST & GET /api/share should generate and resolve snapshot tokens", async () => {
      const dashboardState = {
        title: "Executive Summary 2026",
        subtitle: "Monthly report",
        templateId: "e-commerce",
        kpiCards: [],
        mainCharts: [],
      };

      // POST create share token
      const createReq = new NextRequest("http://localhost:3000/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboard: dashboardState }),
      });

      const createRes = await sharePostHandler(createReq);
      const createJson = await createRes.json();

      expect(createRes.status).toBe(201);
      expect(createJson.data.token).toBeDefined();

      // GET decode share token
      const token = createJson.data.token;
      const getReq = new NextRequest(`http://localhost:3000/api/share?token=${token}`);
      const getRes = await shareGetHandler(getReq);
      const getJson = await getRes.json();

      expect(getRes.status).toBe(200);
      expect(getJson.data.title).toBe("Executive Summary 2026");
    });
  });
});
