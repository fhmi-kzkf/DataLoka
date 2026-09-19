import { create } from "zustand";
import type { DatasetSchema } from "@/types/dataset";
import type { DatasetMapping, DataType, SemanticRole } from "@/types/mapping";
import { analyzeDatasetColumns } from "@/core/mapping/column-analyzer";

export interface MappingState {
  mapping: DatasetMapping | null;
  activeColumn: string | null;

  generateMapping: (dataset: DatasetSchema) => DatasetMapping;
  updateColumnType: (columnName: string, type: DataType) => void;
  updateColumnRole: (columnName: string, role: SemanticRole) => void;
  setPrimaryDateColumn: (columnName: string) => void;
  setPrimaryCategoryColumn: (columnName: string) => void;
  setPrimaryNumericColumn: (columnName: string) => void;
  setActiveColumn: (columnName: string | null) => void;
  resetMapping: () => void;
}

export const useMappingStore = create<MappingState>((set, get) => ({
  mapping: null,
  activeColumn: null,

  generateMapping: (dataset: DatasetSchema) => {
    const mapping = analyzeDatasetColumns(dataset);
    set({ mapping, activeColumn: Object.keys(mapping.columns)[0] || null });
    return mapping;
  },

  updateColumnType: (columnName: string, type: DataType) => {
    const { mapping } = get();
    if (!mapping || !mapping.columns[columnName]) return;

    const column = mapping.columns[columnName];
    const updatedColumn = {
      ...column,
      userOverrideType: type,
      effectiveType: type,
    };

    set({
      mapping: {
        ...mapping,
        columns: {
          ...mapping.columns,
          [columnName]: updatedColumn,
        },
      },
    });
  },

  updateColumnRole: (columnName: string, role: SemanticRole) => {
    const { mapping } = get();
    if (!mapping || !mapping.columns[columnName]) return;

    const column = mapping.columns[columnName];
    const updatedColumn = {
      ...column,
      userOverrideRole: role,
      semanticRole: role,
    };

    set({
      mapping: {
        ...mapping,
        columns: {
          ...mapping.columns,
          [columnName]: updatedColumn,
        },
      },
    });
  },

  setPrimaryDateColumn: (primaryDateColumn: string) => {
    const { mapping } = get();
    if (!mapping) return;
    set({ mapping: { ...mapping, primaryDateColumn } });
  },

  setPrimaryCategoryColumn: (primaryCategoryColumn: string) => {
    const { mapping } = get();
    if (!mapping) return;
    set({ mapping: { ...mapping, primaryCategoryColumn } });
  },

  setPrimaryNumericColumn: (primaryNumericColumn: string) => {
    const { mapping } = get();
    if (!mapping) return;
    set({ mapping: { ...mapping, primaryNumericColumn } });
  },

  setActiveColumn: (activeColumn) => set({ activeColumn }),

  resetMapping: () => set({ mapping: null, activeColumn: null }),
}));
