import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { detectDuplicateRows } from "@/core/quality/duplicate-detector";
import { detectMissingValues } from "@/core/quality/missing-value-detector";
import { detectCategoryInconsistencies, levenshteinDistance } from "@/core/quality/fuzzy-unifier";
import { detectStatisticalOutliers } from "@/core/quality/outlier-detector";
import { analyzeDataQuality } from "@/core/quality/quality-analyzer";
import {
  applyRemoveDuplicates,
  applyMissingValueFix,
  applyUnifyCategories,
  applyClipOutliers,
} from "@/core/quality/quality-transformer";
import { useQualityStore } from "@/stores/quality-store";
import { QualityScoreCard } from "@/components/modules/quality/quality-score-card";
import { QualityIssueCard } from "@/components/modules/quality/quality-issue-card";
import { AuditLogPanel } from "@/components/modules/quality/audit-log-panel";
import type { DatasetSchema, DatasetRow } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";
import type { QualityReport, DuplicateIssue } from "@/types/quality";

describe("Modul 4: Data Quality Assistant", () => {
  describe("Quality Analyzer Orchestration", () => {
    it("computes overall data quality score and clean row count", () => {
      const mockDataset: DatasetSchema = {
        id: "ds_analyzer",
        name: "data.csv",
        sourceType: "file",
        headers: ["A", "B"],
        rows: [
          { A: 1, B: "X" },
          { A: 2, B: "Y" },
        ],
        rowCount: 2,
        columnCount: 2,
        fileSizeBytes: 100,
        sampleRows: [],
        createdAt: "now",
      };

      const mockMapping: DatasetMapping = {
        datasetId: "ds_analyzer",
        columns: {
          A: {
            name: "A",
            inferredType: "numeric",
            effectiveType: "numeric",
            semanticRole: "general",
            confidenceScore: 0.9,
            cardinality: 2,
            nullableRatio: 0,
            sampleValues: [1, 2],
            stats: { totalNulls: 0 },
          },
          B: {
            name: "B",
            inferredType: "categorical",
            effectiveType: "categorical",
            semanticRole: "general",
            confidenceScore: 0.9,
            cardinality: 2,
            nullableRatio: 0,
            sampleValues: ["X", "Y"],
            stats: { totalNulls: 0 },
          },
        },
        createdAt: "now",
      };

      const report = analyzeDataQuality(mockDataset, mockMapping);
      expect(report.totalScore).toBe(100);
      expect(report.cleanRowCount).toBe(2);
      expect(report.issues.length).toBe(0);
    });
  });
  describe("Duplicate Row Detector", () => {
    it("detects exact duplicate rows accurately", () => {
      const rows: DatasetRow[] = [
        { Produk: "Kaos", Qty: 10, Harga: 50000 },
        { Produk: "Celana", Qty: 5, Harga: 100000 },
        { Produk: "Kaos", Qty: 10, Harga: 50000 }, // duplicate
        { Produk: "Jaket", Qty: 2, Harga: 200000 },
      ];

      const issue = detectDuplicateRows(rows);
      expect(issue).not.toBeNull();
      expect(issue?.duplicateCount).toBe(1);
      expect(issue?.duplicateIndices).toEqual([2]);
    });

    it("returns null when no duplicates exist", () => {
      const rows: DatasetRow[] = [
        { Produk: "A", Val: 1 },
        { Produk: "B", Val: 2 },
      ];
      expect(detectDuplicateRows(rows)).toBeNull();
    });
  });

  describe("Missing Value Detector & Imputation Suggestions", () => {
    it("calculates median suggestion for numeric columns with nulls", () => {
      const rows: DatasetRow[] = [
        { Omset: 100000 },
        { Omset: 200000 },
        { Omset: null }, // missing
        { Omset: 300000 },
        { Omset: 400000 },
      ];

      const columns = {
        Omset: {
          name: "Omset",
          inferredType: "numeric" as const,
          effectiveType: "currency" as const,
          semanticRole: "revenue" as const,
          confidenceScore: 0.95,
          cardinality: 4,
          nullableRatio: 0.2,
          sampleValues: [100000, 200000],
          stats: { totalNulls: 1 },
        },
      };

      const issues = detectMissingValues(rows, columns);
      expect(issues.length).toBe(1);
      expect(issues[0].column).toBe("Omset");
      expect(issues[0].missingCount).toBe(1);
      expect(issues[0].medianValue).toBe(250000);
      expect(issues[0].suggestedAction).toBe("fill_median");
    });
  });

  describe("Fuzzy Category Unifier & Levenshtein", () => {
    it("computes Levenshtein distance correctly", () => {
      expect(levenshteinDistance("Jakarta", "Jakarta")).toBe(0);
      expect(levenshteinDistance("Jakarta", "jakarta")).toBe(1);
      expect(levenshteinDistance("Surabaya", "Surbaya")).toBe(1);
      expect(levenshteinDistance("Bandung", "Medan")).toBe(5);
    });

    it("detects casing and typo category clusters", () => {
      const rows: DatasetRow[] = [
        { Kota: "Jakarta" },
        { Kota: "Jakarta" },
        { Kota: "jakarta" }, // case variant
        { Kota: "Surabaya" },
        { Kota: "Surbaya" }, // typo
      ];

      const columns = {
        Kota: {
          name: "Kota",
          inferredType: "categorical" as const,
          effectiveType: "categorical" as const,
          semanticRole: "city" as const,
          confidenceScore: 0.9,
          cardinality: 4,
          nullableRatio: 0,
          sampleValues: ["Jakarta"],
          stats: { totalNulls: 0 },
        },
      };

      const issues = detectCategoryInconsistencies(rows, columns);
      expect(issues.length).toBe(1);
      expect(issues[0].clusters.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Statistical Outlier Detector (IQR)", () => {
    it("flags numeric values outside 1.5 * IQR", () => {
      const rows: DatasetRow[] = [
        { Nilai: 10 },
        { Nilai: 12 },
        { Nilai: 11 },
        { Nilai: 13 },
        { Nilai: 12 },
        { Nilai: 14 },
        { Nilai: 10 },
        { Nilai: 11 },
        { Nilai: 100 }, // outlier
      ];

      const columns = {
        Nilai: {
          name: "Nilai",
          inferredType: "numeric" as const,
          effectiveType: "numeric" as const,
          semanticRole: "general" as const,
          confidenceScore: 0.9,
          cardinality: 5,
          nullableRatio: 0,
          sampleValues: [10],
          stats: { totalNulls: 0 },
        },
      };

      const issues = detectStatisticalOutliers(rows, columns);
      expect(issues.length).toBe(1);
      expect(issues[0].outlierValues).toContain(100);
      expect(issues[0].outlierCount).toBe(1);
    });
  });

  describe("Quality Transformer (Non-Destructive Fixes)", () => {
    it("removes duplicate rows and creates an audit log entry", () => {
      const rows: DatasetRow[] = [{ A: 1 }, { A: 2 }, { A: 1 }];
      const { newRows, auditLog } = applyRemoveDuplicates(rows, [2]);

      expect(newRows.length).toBe(2);
      expect(auditLog.action).toBe("Hapus Duplikat");
      expect(auditLog.rowsAffected).toBe(1);
    });

    it("imputes missing values with replacement value", () => {
      const rows: DatasetRow[] = [{ A: 10 }, { A: null }, { A: 30 }];
      const { newRows, auditLog } = applyMissingValueFix(rows, "A", "fill_median", 20);

      expect(newRows[1].A).toBe(20);
      expect(auditLog.rowsAffected).toBe(1);
    });

    it("unifies category variants to canonical value", () => {
      const rows: DatasetRow[] = [{ Kota: "Jakarta" }, { Kota: "jakarta" }];
      const { newRows, auditLog } = applyUnifyCategories(rows, "Kota", "Jakarta", ["jakarta"]);

      expect(newRows[1].Kota).toBe("Jakarta");
      expect(auditLog.rowsAffected).toBe(1);
    });

    it("clips outliers to bounded range", () => {
      const rows: DatasetRow[] = [{ Val: 5 }, { Val: 50 }, { Val: 100 }];
      const { newRows, auditLog } = applyClipOutliers(rows, "Val", 10, 60);

      expect(newRows[0].Val).toBe(10);
      expect(newRows[2].Val).toBe(60);
      expect(auditLog.rowsAffected).toBe(2);
    });
  });

  describe("Quality Zustand Store", () => {
    beforeEach(() => {
      useQualityStore.getState().resetQuality();
    });

    it("runs analysis and manages undo functionality", () => {
      const mockDataset: DatasetSchema = {
        id: "ds_q_test",
        name: "test.csv",
        sourceType: "file",
        headers: ["A"],
        rows: [{ A: 1 }, { A: 1 }], // 1 duplicate
        rowCount: 2,
        columnCount: 1,
        fileSizeBytes: 100,
        sampleRows: [],
        createdAt: "now",
      };

      const mockMapping: DatasetMapping = {
        datasetId: "ds_q_test",
        columns: {
          A: {
            name: "A",
            inferredType: "numeric",
            effectiveType: "numeric",
            semanticRole: "general",
            confidenceScore: 0.9,
            cardinality: 1,
            nullableRatio: 0,
            sampleValues: [1],
            stats: { totalNulls: 0 },
          },
        },
        createdAt: "now",
      };

      const store = useQualityStore.getState();
      store.runAnalysis(mockDataset, mockMapping);

      expect(useQualityStore.getState().report?.issues.length).toBe(1);

      // Fix duplicate
      store.fixDuplicates();
      expect(useQualityStore.getState().activeRows?.length).toBe(1);
      expect(useQualityStore.getState().auditLogs.length).toBe(1);

      // Undo
      store.undoLastAction();
      expect(useQualityStore.getState().activeRows?.length).toBe(2);
      expect(useQualityStore.getState().auditLogs.length).toBe(0);
    });
  });

  describe("Quality UI Components", () => {
    it("QualityScoreCard renders score and clean row statistics", () => {
      const mockReport: QualityReport = {
        datasetId: "ds_1",
        totalScore: 92,
        totalRows: 100,
        totalColumns: 5,
        issues: [],
        cleanRowCount: 100,
        createdAt: "now",
      };

      render(<QualityScoreCard report={mockReport} />);
      expect(screen.getByText("92")).toBeInTheDocument();
      expect(screen.getByText("Data Bersih & Siap")).toBeInTheDocument();
      expect(screen.getByText(/100 dari 100 baris/i)).toBeInTheDocument();
    });

    it("QualityIssueCard renders duplicate issue and triggers onFixDuplicates", () => {
      const mockIssue: DuplicateIssue = {
        type: "duplicate_rows",
        severity: "warning",
        title: "Ditemukan 2 baris duplikat",
        duplicateCount: 2,
        duplicateIndices: [1, 2],
        affectedPercentage: 10,
      };

      const handleFix = vi.fn();
      render(<QualityIssueCard issue={mockIssue} onFixDuplicates={handleFix} />);

      expect(screen.getByText("Ditemukan 2 baris duplikat")).toBeInTheDocument();
      const fixBtn = screen.getByRole("button", { name: /hapus duplikat/i });
      fireEvent.click(fixBtn);
      expect(handleFix).toHaveBeenCalled();
    });

    it("AuditLogPanel renders empty state when no logs exist", () => {
      render(<AuditLogPanel logs={[]} />);
      expect(screen.getByText(/data masih dalam format asli/i)).toBeInTheDocument();
    });
  });
});
