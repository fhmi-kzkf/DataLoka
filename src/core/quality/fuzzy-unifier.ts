import type { DatasetRow } from "@/types/dataset";
import type { ColumnMetadata } from "@/types/mapping";
import type { CategoryInconsistencyIssue, CategoryCluster } from "@/types/quality";

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const matrix: number[][] = [];

  for (let i = 0; i <= m; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[m][n];
}

export function detectCategoryInconsistencies(
  rows: DatasetRow[],
  columns: Record<string, ColumnMetadata>
): CategoryInconsistencyIssue[] {
  const issues: CategoryInconsistencyIssue[] = [];

  for (const [colName, colMeta] of Object.entries(columns)) {
    if (colMeta.effectiveType !== "categorical" && colMeta.effectiveType !== "text" && colMeta.effectiveType !== "geolocation") {
      continue;
    }

    // Collect all raw string occurrences
    const freqMap = new Map<string, number>();
    for (const row of rows) {
      const val = row[colName];
      if (val !== null && val !== undefined && val !== "") {
        const str = String(val);
        freqMap.set(str, (freqMap.get(str) || 0) + 1);
      }
    }

    const uniqueValues = Array.from(freqMap.keys());
    if (uniqueValues.length <= 1) continue;

    const clusters: CategoryCluster[] = [];
    const visited = new Set<string>();

    for (let i = 0; i < uniqueValues.length; i++) {
      const valA = uniqueValues[i];
      if (visited.has(valA)) continue;

      const normA = valA.trim().toLowerCase();
      const clusterVariants: string[] = [];
      let totalClusterCount = freqMap.get(valA) || 0;

      for (let j = 0; j < uniqueValues.length; j++) {
        if (i === j) continue;
        const valB = uniqueValues[j];
        if (visited.has(valB)) continue;

        const normB = valB.trim().toLowerCase();

        // 1. Same normalized string but different raw case/spaces ("jakarta" vs "Jakarta", "Bandung " vs "Bandung")
        // 2. Or Levenshtein distance <= 2 for strings with length > 4
        const isCaseVariant = normA === normB && valA !== valB;
        const isFuzzyTypo =
          normA !== normB &&
          normA.length >= 4 &&
          normB.length >= 4 &&
          levenshteinDistance(normA, normB) <= (normA.length > 7 ? 2 : 1);

        if (isCaseVariant || isFuzzyTypo) {
          clusterVariants.push(valB);
          totalClusterCount += freqMap.get(valB) || 0;
          visited.add(valB);
        }
      }

      if (clusterVariants.length > 0) {
        // Choose canonical: the variant with highest frequency or Proper Case
        const allCandidates = [valA, ...clusterVariants];
        allCandidates.sort((a, b) => (freqMap.get(b) || 0) - (freqMap.get(a) || 0));
        const canonical = allCandidates[0];

        clusters.push({
          canonical,
          variants: allCandidates.filter((c) => c !== canonical),
          totalOccurrences: totalClusterCount,
        });
        visited.add(valA);
      }
    }

    if (clusters.length > 0) {
      issues.push({
        type: "category_inconsistency",
        severity: "warning",
        title: `Ditemukan ${clusters.length} kelompok inkonsistensi penulisan kategori pada "${colName}"`,
        column: colName,
        clusters,
      });
    }
  }

  return issues;
}
