export type SourceType = "file" | "gsheet" | "clipboard";

export type ParseStage = "reading" | "parsing" | "structuring" | "completed";

export type DatasetValue = string | number | boolean | Date | null | undefined;
export type DatasetRow = Record<string, DatasetValue>;

export interface ParseProgressEvent {
  percentage: number;
  stage: ParseStage;
  message: string;
}

export interface DatasetSchema {
  id: string;
  name: string;
  sourceType: SourceType;
  headers: string[];
  rows: DatasetRow[];
  rowCount: number;
  columnCount: number;
  fileSizeBytes: number;
  sheetNames?: string[];
  activeSheet?: string;
  sampleRows: DatasetRow[];
  createdAt: string;
}

export interface ParseResult {
  success: boolean;
  dataset?: DatasetSchema;
  error?: string;
}
