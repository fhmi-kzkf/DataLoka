export type DataType =
  | "numeric"
  | "datetime"
  | "categorical"
  | "text"
  | "currency"
  | "percentage"
  | "geolocation"
  | "boolean";

export type SemanticRole =
  | "quantity_sold"
  | "shipping_cost"
  | "order_date"
  | "revenue"
  | "product_category"
  | "product_name"
  | "unit_price"
  | "customer_name"
  | "city"
  | "province"
  | "discount"
  | "profit"
  | "payment_method"
  | "identifier"
  | "general";

export interface ColumnStats {
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
  minDate?: string;
  maxDate?: string;
  uniqueCategories?: string[];
  totalNulls: number;
}

export interface ColumnMetadata {
  name: string;
  inferredType: DataType;
  effectiveType: DataType;
  userOverrideType?: DataType;
  semanticRole: SemanticRole;
  userOverrideRole?: SemanticRole;
  confidenceScore: number;
  cardinality: number;
  nullableRatio: number;
  sampleValues: (string | number | boolean | null)[];
  stats: ColumnStats;
}

export interface DatasetMapping {
  datasetId: string;
  columns: Record<string, ColumnMetadata>;
  primaryDateColumn?: string;
  primaryCategoryColumn?: string;
  primaryNumericColumn?: string;
  createdAt: string;
}
