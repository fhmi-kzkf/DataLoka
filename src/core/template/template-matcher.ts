import type { DatasetMapping } from "@/types/mapping";
import type { TemplateDefinition, TemplateId } from "@/types/template";
import { ALL_TEMPLATES, TEMPLATE_REGISTRY } from "./template-registry";

export interface TemplateMatchScore {
  template: TemplateDefinition;
  score: number;
  matchedKeywords: string[];
}

export function matchTemplate(
  columnNames: string[],
  mapping?: DatasetMapping | null
): TemplateMatchScore[] {
  const normalizedColumns = columnNames.map((c) => c.toLowerCase().trim());
  const roles = mapping ? Object.values(mapping.columns).map((col) => col.semanticRole) : [];

  const scores: TemplateMatchScore[] = ALL_TEMPLATES.map((tmpl) => {
    if (tmpl.id === "general") {
      return { template: tmpl, score: 0.1, matchedKeywords: [] };
    }

    let matchCount = 0;
    const matched: string[] = [];

    for (const kw of tmpl.matchingKeywords) {
      const isMatched = normalizedColumns.some((col) => col.includes(kw) || kw.includes(col));
      if (isMatched) {
        matchCount += 1;
        matched.push(kw);
      }
    }

    // Role-based boost
    if (tmpl.id === "ecommerce") {
      if (roles.includes("revenue") || roles.includes("product_category") || roles.includes("quantity_sold")) {
        matchCount += 2;
      }
    } else if (tmpl.id === "finance") {
      if (roles.includes("revenue") || roles.includes("profit")) {
        matchCount += 2;
      }
    }

    const calculatedScore = matchCount > 0 ? matchCount * 1.5 : 0;

    return {
      template: tmpl,
      score: calculatedScore,
      matchedKeywords: matched,
    };
  });

  return scores.sort((a, b) => b.score - a.score);
}

export function getBestTemplate(
  columnNames: string[],
  mapping?: DatasetMapping | null
): TemplateId {
  const matches = matchTemplate(columnNames, mapping);
  if (matches.length > 0 && matches[0].score > 0.5) {
    return matches[0].template.id;
  }
  return "general";
}

export function getTemplateOrDefault(id?: string): TemplateDefinition {
  if (id && id in TEMPLATE_REGISTRY) {
    return TEMPLATE_REGISTRY[id as TemplateId];
  }
  return TEMPLATE_REGISTRY.general;
}
