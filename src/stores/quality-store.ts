import { create } from "zustand";
import type { DatasetSchema, DatasetRow, DatasetValue } from "@/types/dataset";
import type { DatasetMapping } from "@/types/mapping";
import type { QualityReport, AuditLogEntry, ImputationStrategy } from "@/types/quality";
import { analyzeDataQuality } from "@/core/quality/quality-analyzer";
import {
  applyRemoveDuplicates,
  applyMissingValueFix,
  applyUnifyCategories,
  applyClipOutliers,
} from "@/core/quality/quality-transformer";

export interface QualityState {
  report: QualityReport | null;
  activeRows: DatasetRow[] | null;
  auditLogs: AuditLogEntry[];

  runAnalysis: (dataset: DatasetSchema, mapping: DatasetMapping) => QualityReport;
  fixDuplicates: () => void;
  fixMissingValues: (column: string, strategy: ImputationStrategy, customValue?: DatasetValue) => void;
  unifyCategory: (column: string, canonical: string, variants: string[]) => void;
  clipOutlierColumn: (column: string, lowerBound: number, upperBound: number) => void;
  applyAllRecommendations: () => void;
  undoLastAction: () => void;
  resetQuality: () => void;
}

export const useQualityStore = create<QualityState>((set, get) => ({
  report: null,
  activeRows: null,
  auditLogs: [],

  runAnalysis: (dataset: DatasetSchema, mapping: DatasetMapping) => {
    const report = analyzeDataQuality(dataset, mapping);
    set({
      report,
      activeRows: dataset.rows,
      auditLogs: [],
    });
    return report;
  },

  fixDuplicates: () => {
    const { report, activeRows, auditLogs } = get();
    if (!report || !activeRows) return;

    const dupIssue = report.issues.find((i) => i.type === "duplicate_rows");
    if (!dupIssue || dupIssue.type !== "duplicate_rows") return;

    const { newRows, auditLog } = applyRemoveDuplicates(activeRows, dupIssue.duplicateIndices);

    // Update report to remove duplicate issue and recalculate score
    const updatedIssues = report.issues.filter((i) => i.type !== "duplicate_rows");
    const updatedReport: QualityReport = {
      ...report,
      totalRows: newRows.length,
      cleanRowCount: newRows.length,
      totalScore: Math.min(100, report.totalScore + 15),
      issues: updatedIssues,
    };

    set({
      activeRows: newRows,
      report: updatedReport,
      auditLogs: [auditLog, ...auditLogs],
    });
  },

  fixMissingValues: (column: string, strategy: ImputationStrategy, customValue?: DatasetValue) => {
    const { report, activeRows, auditLogs } = get();
    if (!report || !activeRows) return;

    const { newRows, auditLog } = applyMissingValueFix(activeRows, column, strategy, customValue);

    const updatedIssues = report.issues.filter(
      (i) => !(i.type === "missing_values" && i.column === column)
    );
    const updatedReport: QualityReport = {
      ...report,
      totalRows: newRows.length,
      totalScore: Math.min(100, report.totalScore + 10),
      issues: updatedIssues,
    };

    set({
      activeRows: newRows,
      report: updatedReport,
      auditLogs: [auditLog, ...auditLogs],
    });
  },

  unifyCategory: (column: string, canonical: string, variants: string[]) => {
    const { report, activeRows, auditLogs } = get();
    if (!report || !activeRows) return;

    const { newRows, auditLog } = applyUnifyCategories(activeRows, column, canonical, variants);

    const updatedIssues = report.issues.filter(
      (i) => !(i.type === "category_inconsistency" && i.column === column)
    );
    const updatedReport: QualityReport = {
      ...report,
      totalScore: Math.min(100, report.totalScore + 5),
      issues: updatedIssues,
    };

    set({
      activeRows: newRows,
      report: updatedReport,
      auditLogs: [auditLog, ...auditLogs],
    });
  },

  clipOutlierColumn: (column: string, lowerBound: number, upperBound: number) => {
    const { report, activeRows, auditLogs } = get();
    if (!report || !activeRows) return;

    const { newRows, auditLog } = applyClipOutliers(activeRows, column, lowerBound, upperBound);

    const updatedIssues = report.issues.filter(
      (i) => !(i.type === "statistical_outliers" && i.column === column)
    );
    const updatedReport: QualityReport = {
      ...report,
      totalScore: Math.min(100, report.totalScore + 5),
      issues: updatedIssues,
    };

    set({
      activeRows: newRows,
      report: updatedReport,
      auditLogs: [auditLog, ...auditLogs],
    });
  },

  applyAllRecommendations: () => {
    const { report } = get();
    if (!report) return;

    // Apply duplicates fix
    const dupIssue = report.issues.find((i) => i.type === "duplicate_rows");
    if (dupIssue) {
      get().fixDuplicates();
    }

    // Apply missing values fixes
    const missingIssues = report.issues.filter((i) => i.type === "missing_values");
    for (const m of missingIssues) {
      if (m.type === "missing_values") {
        get().fixMissingValues(m.column, m.suggestedAction, m.suggestedValue);
      }
    }

    // Apply category unifications
    const catIssues = report.issues.filter((i) => i.type === "category_inconsistency");
    for (const c of catIssues) {
      if (c.type === "category_inconsistency" && c.clusters[0]) {
        get().unifyCategory(c.column, c.clusters[0].canonical, c.clusters[0].variants);
      }
    }
  },

  undoLastAction: () => {
    const { auditLogs } = get();
    if (auditLogs.length === 0) return;

    const [lastLog, ...remainingLogs] = auditLogs;
    if (lastLog.previousRowsSnapshot) {
      set({
        activeRows: lastLog.previousRowsSnapshot,
        auditLogs: remainingLogs,
      });
    }
  },

  resetQuality: () =>
    set({
      report: null,
      activeRows: null,
      auditLogs: [],
    }),
}));
