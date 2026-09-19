import { create } from "zustand";
import type { CommandExecutionResult, SuggestedCommand } from "@/types/command";
import type { AiQueryResult } from "@/core/ai/ai-types";
import { parseNaturalLanguageCommand } from "@/core/command/nlp-parser";
import { executeParsedCommand } from "@/core/command/command-executor";

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  aiResult?: AiQueryResult;
  executionResult?: CommandExecutionResult;
}

export type PanelWidthMode = "standard" | "wide" | "fullscreen";

export const DEFAULT_SUGGESTED_COMMANDS: SuggestedCommand[] = [
  {
    id: "sug_bar",
    title: "Ganti visualisasi ke Bar Chart",
    category: "Visualisasi",
    commandText: "ubah ke bar chart",
    shortcutBadge: "1",
  },
  {
    id: "sug_line",
    title: "Tampilkan tren Garis (Line Chart)",
    category: "Visualisasi",
    commandText: "ubah ke line chart",
    shortcutBadge: "2",
  },
  {
    id: "sug_donut",
    title: "Tampilkan proporsi Donut Chart",
    category: "Visualisasi",
    commandText: "ubah ke donut chart",
    shortcutBadge: "3",
  },
  {
    id: "sug_sort_desc",
    title: "Urutkan nilai dari tertinggi (Descending)",
    category: "Filter & Sort",
    commandText: "urutkan dari yang terbesar",
    shortcutBadge: "4",
  },
  {
    id: "sug_template_sales",
    title: "Ganti tema ke B2B Sales",
    category: "Template",
    commandText: "ganti template ke sales",
    shortcutBadge: "5",
  },
  {
    id: "sug_template_ecom",
    title: "Ganti tema ke E-Commerce",
    category: "Template",
    commandText: "ganti template ke ecommerce",
    shortcutBadge: "6",
  },
  {
    id: "sug_edit_layout",
    title: "Sesuaikan tata letak dasbor",
    category: "Tindakan",
    commandText: "sesuaikan layout",
    shortcutBadge: "7",
  },
  {
    id: "sug_reset_filter",
    title: "Reset semua filter data aktif",
    category: "Filter & Sort",
    commandText: "reset filter",
    shortcutBadge: "8",
  },
];

export interface CommandStoreState {
  isOpen: boolean;
  inputQuery: string;
  history: string[];
  lastExecutionResult: CommandExecutionResult | null;
  suggestedCommands: SuggestedCommand[];
  chatMessages: AiChatMessage[];
  panelWidthMode: PanelWidthMode;

  openCommandBar: () => void;
  closeCommandBar: () => void;
  toggleCommandBar: () => void;
  setInputQuery: (query: string) => void;
  setPanelWidthMode: (mode: PanelWidthMode) => void;
  togglePanelWidthMode: () => void;
  addChatMessage: (message: Omit<AiChatMessage, "id" | "timestamp"> & { id?: string; timestamp?: number }) => void;
  clearChatMessages: () => void;
  executeCommand: (query: string) => CommandExecutionResult;
  clearHistory: () => void;
  reset: () => void;
}

export const useCommandStore = create<CommandStoreState>((set, get) => ({
  isOpen: false,
  inputQuery: "",
  history: [],
  lastExecutionResult: null,
  suggestedCommands: DEFAULT_SUGGESTED_COMMANDS,
  chatMessages: [],
  panelWidthMode: "standard",

  openCommandBar: () => set({ isOpen: true, lastExecutionResult: null }),
  closeCommandBar: () => set({ isOpen: false }),
  toggleCommandBar: () => set((state) => ({ isOpen: !state.isOpen, lastExecutionResult: null })),

  setInputQuery: (inputQuery: string) => set({ inputQuery }),

  setPanelWidthMode: (panelWidthMode: PanelWidthMode) => set({ panelWidthMode }),

  togglePanelWidthMode: () =>
    set((state) => {
      const nextMode: PanelWidthMode =
        state.panelWidthMode === "standard"
          ? "wide"
          : state.panelWidthMode === "wide"
          ? "fullscreen"
          : "standard";
      return { panelWidthMode: nextMode };
    }),

  addChatMessage: (message) => {
    const newMessage: AiChatMessage = {
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp || Date.now(),
      aiResult: message.aiResult,
      executionResult: message.executionResult,
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, newMessage],
    }));
  },

  clearChatMessages: () => set({ chatMessages: [] }),

  executeCommand: (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      const emptyRes: CommandExecutionResult = {
        success: false,
        message: "Perintah kosong.",
        executedCommand: {
          rawInput: "",
          intent: "unknown",
          confidenceScore: 0,
          humanReadableExplanation: "Perintah kosong",
        },
      };
      set({ lastExecutionResult: emptyRes });
      return emptyRes;
    }

    const parsed = parseNaturalLanguageCommand(trimmed);
    const result = executeParsedCommand(parsed);

    const history = [trimmed, ...get().history.filter((h) => h !== trimmed)].slice(0, 10);

    set({
      lastExecutionResult: result,
      history,
      inputQuery: "",
    });

    return result;
  },

  clearHistory: () => set({ history: [] }),

  reset: () =>
    set({
      isOpen: false,
      inputQuery: "",
      history: [],
      lastExecutionResult: null,
      suggestedCommands: DEFAULT_SUGGESTED_COMMANDS,
      chatMessages: [],
      panelWidthMode: "standard",
    }),
}));
