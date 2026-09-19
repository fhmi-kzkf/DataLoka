"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Pin,
  Trash2,
  Sparkles,
  Send,
  Database,
  BarChart3,
  LineChart,
  PieChart,
  Table as TableIcon,
} from "lucide-react";
import { useCommandStore } from "@/stores/command-store";
import { useDatasetStore } from "@/stores/dataset-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { CommandSuggestionPill } from "./command-suggestion-pill";
import { UniversalChartRenderer } from "@/components/charts/universal-chart-renderer";
import type { AiQueryResult } from "@/core/ai/ai-types";
import type { ChartType, ChartRecommendation } from "@/types/chart";

export const CommandBarModal: React.FC = () => {
  const {
    isOpen,
    inputQuery,
    history,
    suggestedCommands,
    chatMessages,
    panelWidthMode,
    closeCommandBar,
    setInputQuery,
    togglePanelWidthMode,
    addChatMessage,
    clearChatMessages,
    executeCommand,
  } = useCommandStore();

  const { dataset } = useDatasetStore();
  const { addChart } = useDashboardStore();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copiedSqlId, setCopiedSqlId] = useState<string | null>(null);
  const [pinnedChartId, setPinnedChartId] = useState<string | null>(null);
  const [activeChartTypes, setActiveChartTypes] = useState<Record<string, ChartType>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on query
  const filteredSuggestions = useMemo(() => {
    if (!inputQuery.trim()) return suggestedCommands;
    const q = inputQuery.toLowerCase().trim();
    return suggestedCommands.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.commandText.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [inputQuery, suggestedCommands]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatScrollRef.current && typeof chatScrollRef.current.scrollTo === "function") {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages, isAiLoading]);

  if (!isOpen) return null;

  const handleAskAi = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isAiLoading) return;

    // Check if it's a direct UI command
    const isUiCommand = [
      "ubah ke",
      "ganti template",
      "sesuaikan layout",
      "reset filter",
      "urutkan",
    ].some((prefix) => trimmed.toLowerCase().includes(prefix));

    // Append user query message to thread
    addChatMessage({
      role: "user",
      content: trimmed,
    });
    setInputQuery("");

    if (isUiCommand) {
      const execRes = executeCommand(trimmed);
      addChatMessage({
        role: "assistant",
        content: execRes.message,
        executionResult: execRes,
      });
      return;
    }

    // Otherwise, treat as Tanya Data (AI Data Query via NVIDIA NIM / Local fallback)
    setIsAiLoading(true);

    try {
      const headers = dataset?.headers || ["Tanggal", "Kategori", "Produk", "Omset", "Qty"];
      const rows = dataset?.rows || [
        { Tanggal: "2026-01-01", Kategori: "Fashion", Produk: "Kemeja", Omset: 4500000, Qty: 30 },
        { Tanggal: "2026-01-02", Kategori: "Elektronik", Produk: "TWS Earbuds", Omset: 8900000, Qty: 45 },
        { Tanggal: "2026-01-03", Kategori: "Kecantikan", Produk: "Serum", Omset: 6100000, Qty: 52 },
      ];

      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          headers,
          rows,
          currency: "Rp",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const aiData = json.data as AiQueryResult;
        addChatMessage({
          role: "assistant",
          content: aiData.answerText,
          aiResult: aiData,
        });
      } else {
        throw new Error(json.error?.message || "Gagal memproses kueri AI.");
      }
    } catch {
      // Local heuristic fallback
      const execRes = executeCommand(trimmed);
      addChatMessage({
        role: "assistant",
        content: `Menganalisis: "${trimmed}". ${execRes.message}`,
        executionResult: execRes,
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && chatMessages.length === 0) {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp" && chatMessages.length === 0) {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (chatMessages.length === 0 && filteredSuggestions.length > 0 && inputQuery.trim() === "") {
        const chosen = filteredSuggestions[selectedIndex];
        if (chosen) {
          handleAskAi(chosen.commandText);
        }
      } else if (inputQuery.trim()) {
        handleAskAi(inputQuery.trim());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeCommandBar();
    }
  };

  const handleCopySql = (sqlText: string, messageId: string) => {
    navigator.clipboard.writeText(sqlText);
    setCopiedSqlId(messageId);
    setTimeout(() => setCopiedSqlId(null), 2000);
  };

  const handlePinChart = (
    recommendation: ChartRecommendation,
    messageId: string
  ) => {
    addChart(recommendation);
    setPinnedChartId(messageId);
    setTimeout(() => setPinnedChartId(null), 3000);
  };

  const handleChartTypeChange = (messageId: string, newType: ChartType) => {
    setActiveChartTypes((prev) => ({ ...prev, [messageId]: newType }));
  };

  // Determine width class
  const widthClasses =
    panelWidthMode === "fullscreen"
      ? "w-full"
      : panelWidthMode === "wide"
      ? "w-full sm:w-[840px] md:w-[940px] lg:w-[1040px]"
      : "w-full sm:w-[580px] md:w-[640px] lg:w-[680px]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tanya Data AI Assistant"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-ink-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={closeCommandBar}
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 ${widthClasses} bg-paper-white border-l border-slate-gray/25 shadow-2xl flex flex-col transition-all duration-300 ease-in-out text-left animate-slideLeft`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-gray/20 bg-fog-white/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-sienna-brown/10 border border-sienna-brown/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-sienna-brown" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-signifier text-[17px] text-ink-black leading-none truncate">
                  Tanya Data AI
                </h2>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-sienna-brown text-paper-white font-bold tracking-wider">
                  Live
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11.5px] font-mono text-slate-gray truncate mt-0.5">
                <Database className="w-3 h-3 text-slate-gray/70 shrink-0" />
                <span className="truncate">
                  {dataset?.name || "Laporan Omnichannel.xlsx"}
                </span>
                {dataset?.rowCount !== undefined && (
                  <span className="text-slate-gray/60">
                    &bull; {dataset.rowCount.toLocaleString("id-ID")} baris
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Panel Width Toggle Button */}
            <button
              type="button"
              onClick={togglePanelWidthMode}
              title={
                panelWidthMode === "standard"
                  ? "Perlebar Panel (Wide Mode)"
                  : panelWidthMode === "wide"
                  ? "Layar Penuh (Fullscreen)"
                  : "Kembali ke Ukuran Standar"
              }
              className="p-1.5 text-slate-gray hover:text-ink-black hover:bg-mist-gray border border-slate-gray/20 transition cursor-pointer"
            >
              {panelWidthMode === "fullscreen" ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Clear Chat Button */}
            {chatMessages.length > 0 && (
              <button
                type="button"
                onClick={clearChatMessages}
                title="Bersihkan Percakapan"
                className="p-1.5 text-slate-gray hover:text-sienna-brown hover:bg-mist-gray border border-slate-gray/20 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={closeCommandBar}
              title="Tutup (ESC)"
              className="flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-mono text-slate-gray hover:text-ink-black hover:bg-mist-gray border border-slate-gray/20 transition cursor-pointer"
            >
              <span>ESC</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Chat & Analytics Body */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-6 bg-paper-white"
        >
          {chatMessages.length === 0 ? (
            /* Minimal Starter State */
            <div className="space-y-5 animate-fadeIn py-1">
              {/* Minimal Intro */}
              <div className="text-left">
                <p className="text-[13.5px] text-slate-gray font-normal leading-relaxed">
                  Tanyakan analisis bisnis apa saja untuk membedah data, mengekstrak kueri SQL, atau merender grafik secara instan.
                </p>
              </div>

              {/* Minimal Quick 1-Click Questions (Clean compact pills) */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase font-semibold text-slate-gray tracking-wider block">
                  Contoh Pertanyaan Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Berapa total omset dan nilai rata-rata transaksi?",
                    "Siapa kategori produk paling mendominasi?",
                    "Tampilkan peringkat top 5 kontributor terbesar",
                    "Jelaskan ringkasan pola sebaran data ini",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleAskAi(q)}
                      className="text-left px-3 py-1.5 bg-fog-white hover:bg-mist-gray border border-slate-gray/20 hover:border-slate-gray/40 text-[12.5px] text-ink-black transition cursor-pointer"
                    >
                      <span>{q}</span>
                      <span className="text-slate-gray/50 ml-1.5 font-mono text-[11px]">&rarr;</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* History if available */}
              {history.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-gray/15">
                  <span className="text-[11px] font-mono uppercase font-semibold text-slate-gray tracking-wider block">
                    Riwayat Pencarian:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {history.slice(0, 4).map((cmd) => (
                      <button
                        key={cmd}
                        type="button"
                        onClick={() => handleAskAi(cmd)}
                        className="px-2.5 py-1 text-[11.5px] font-mono bg-paper-white text-slate-gray hover:text-ink-black border border-slate-gray/20 transition cursor-pointer"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Workspace Commands */}
              <div className="space-y-1.5 pt-1 border-t border-slate-gray/15">
                <span className="text-[11px] font-mono uppercase font-semibold text-slate-gray tracking-wider block">
                  Perintah Cepat Dasbor:
                </span>
                <div className="space-y-1">
                  {filteredSuggestions.slice(0, 5).map((sug, idx) => (
                    <CommandSuggestionPill
                      key={sug.id}
                      suggestion={sug}
                      isSelected={idx === selectedIndex}
                      onClick={(text) => handleAskAi(text)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Multi-turn Chat Thread */
            <div className="space-y-6">
              {chatMessages.map((msg) => {
                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="flex justify-end animate-fadeIn">
                      <div className="max-w-[85%] bg-ink-black text-paper-white px-4 py-3 rounded-none border border-ink-black shadow-xs space-y-1">
                        <div className="flex items-center justify-between gap-4 text-[10.5px] font-mono text-paper-white/60">
                          <span>Pertanyaan Pengguna</span>
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[14.5px] leading-relaxed font-medium">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                }

                // Assistant Response Bubble
                const aiResult = msg.aiResult;
                const effectiveChartType =
                  (activeChartTypes[msg.id] ||
                    aiResult?.chartRecommendation?.chartType ||
                    "bar") as ChartType;

                return (
                  <div
                    key={msg.id}
                    className="flex flex-col space-y-3 p-5 bg-fog-white border border-slate-gray/25 shadow-xs animate-fadeIn text-left"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-gray/15 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-sienna-brown inline-block" />
                        <span className="text-[12px] font-mono uppercase font-bold text-sienna-brown tracking-wider">
                          DataLoka AI Assistant
                        </span>
                      </div>
                      {aiResult?.confidence !== undefined && (
                        <span className="text-[11px] font-mono bg-[#ecfdf5] text-[#059669] px-2 py-0.5 border border-[#a7f3d0]">
                          Keyakinan {Math.round(aiResult.confidence * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Answer Narrative */}
                    <div className="text-[14.5px] text-ink-black leading-relaxed font-normal">
                      {msg.content}
                    </div>

                    {/* SQL Equivalent Block */}
                    {aiResult?.sqlEquivalent && (
                      <div className="bg-mist-gray border border-slate-gray/25 p-3 font-mono text-[12px] text-ink-black relative group">
                        <div className="flex items-center justify-between mb-1.5 text-slate-gray text-[10.5px] uppercase tracking-wider">
                          <span>Query SQL Terkompilasi</span>
                          <button
                            type="button"
                            onClick={() => handleCopySql(aiResult.sqlEquivalent!, msg.id)}
                            className="flex items-center gap-1 text-slate-gray hover:text-ink-black bg-paper-white px-2 py-0.5 border border-slate-gray/20 transition cursor-pointer"
                          >
                            {copiedSqlId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-[#059669]" />
                                <span className="text-[#059669]">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin SQL</span>
                              </>
                            )}
                          </button>
                        </div>
                        <code className="block overflow-x-auto text-[11.5px] text-ink-black/90 whitespace-pre-wrap">
                          {aiResult.sqlEquivalent}
                        </code>
                      </div>
                    )}

                    {/* Full-Height ECharts Visualization Container */}
                    {aiResult?.chartRecommendation &&
                      aiResult.chartRecommendation.data.length > 0 && (
                        <div className="pt-3 border-t border-slate-gray/15 space-y-3">
                          {/* Chart Toolbar */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-mono uppercase font-bold text-slate-gray">
                              Visualisasi Data Terstruktur
                            </span>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Chart Type Switchers */}
                              <div className="flex items-center border border-slate-gray/20 bg-paper-white p-0.5">
                                {[
                                  { type: "bar", icon: BarChart3, label: "Bar" },
                                  { type: "line", icon: LineChart, label: "Line" },
                                  { type: "donut", icon: PieChart, label: "Donut" },
                                  { type: "table", icon: TableIcon, label: "Tabel" },
                                ].map((item) => {
                                  const IconComp = item.icon;
                                  const isActive = effectiveChartType === item.type;
                                  return (
                                    <button
                                      key={item.type}
                                      type="button"
                                      onClick={() =>
                                        handleChartTypeChange(msg.id, item.type as ChartType)
                                      }
                                      className={`p-1 text-[11px] font-mono flex items-center gap-1 transition cursor-pointer ${
                                        isActive
                                          ? "bg-sienna-brown text-paper-white"
                                          : "text-slate-gray hover:text-ink-black hover:bg-mist-gray"
                                      }`}
                                      title={`Ubah ke ${item.label}`}
                                    >
                                      <IconComp className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">{item.label}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Pin to Dashboard Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const rec: ChartRecommendation = {
                                    id: `ai_chart_${Date.now()}`,
                                    chartType: effectiveChartType,
                                    title: aiResult.chartRecommendation!.title,
                                    subtitle: aiResult.chartRecommendation!.subtitle,
                                    confidenceScore: aiResult.confidence,
                                    reasoning: "Dihasilkan oleh Tanya Data AI",
                                    yAxisColumns: ["Nilai"],
                                    aggregationType: "sum",
                                    data: aiResult.chartRecommendation!.data,
                                    orderIndex: 0,
                                    availableAlternativeTypes: ["bar", "line", "donut", "table"],
                                  };
                                  handlePinChart(rec, msg.id);
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-mono border transition cursor-pointer ${
                                  pinnedChartId === msg.id
                                    ? "bg-[#ecfdf5] border-[#a7f3d0] text-[#059669]"
                                    : "bg-paper-white border-slate-gray/25 text-ink-black hover:border-sienna-brown"
                                }`}
                              >
                                {pinnedChartId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Tersimpan di Dasbor</span>
                                  </>
                                ) : (
                                  <>
                                    <Pin className="w-3.5 h-3.5 text-sienna-brown" />
                                    <span>Pin ke Dasbor</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Render UniversalChartRenderer with full height (340px) */}
                          <div className="bg-paper-white p-3 border border-slate-gray/20 shadow-xs">
                            <UniversalChartRenderer
                              recommendation={{
                                id: `chart_${msg.id}`,
                                chartType: effectiveChartType,
                                title: aiResult.chartRecommendation.title,
                                subtitle: aiResult.chartRecommendation.subtitle,
                                confidenceScore: aiResult.confidence,
                                reasoning: "AI Generated",
                                yAxisColumns: ["Nilai"],
                                aggregationType: "sum",
                                data: aiResult.chartRecommendation.data,
                                orderIndex: 0,
                                availableAlternativeTypes: ["bar", "line", "donut", "table"],
                              }}
                              height={340}
                            />
                          </div>
                        </div>
                      )}

                    {/* Follow-up Question Chips */}
                    {aiResult?.suggestedFollowUps &&
                      aiResult.suggestedFollowUps.length > 0 && (
                        <div className="pt-3 border-t border-slate-gray/15 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-mono text-slate-gray">
                            Lanjutan:
                          </span>
                          {aiResult.suggestedFollowUps.map((fu, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAskAi(fu)}
                              className="px-2.5 py-1 text-[11.5px] bg-paper-white border border-slate-gray/25 hover:border-ink-black text-ink-black cursor-pointer transition font-mono"
                            >
                              {fu} &rarr;
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}

              {/* AI Loading State Indicator */}
              {isAiLoading && (
                <div className="p-4 bg-fog-white border border-sienna-brown/25 flex items-center gap-3 animate-pulse">
                  <div className="w-4 h-4 border-2 border-sienna-brown border-t-transparent animate-spin rounded-none" />
                  <span className="text-[13px] font-mono text-sienna-brown font-medium">
                    Menganalisis dataset dan mengompilasi visualisasi...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Sticky Composer Bar */}
        <div className="p-4 border-t border-slate-gray/20 bg-fog-white shrink-0 space-y-2">
          <div className="flex items-center gap-2 bg-paper-white border border-slate-gray/30 px-3 py-2 shadow-xs focus-within:border-sienna-brown transition">
            <span className="text-sienna-brown shrink-0 select-none">
              <Sparkles className="w-4 h-4" />
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask anything… (misal: 'Berapa total omset?', 'Top 3 wilayah')"
              value={inputQuery}
              onChange={(e) => {
                setInputQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              disabled={isAiLoading}
              className="flex-1 bg-transparent text-[14.5px] text-ink-black placeholder:text-smoke-gray focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => {
                if (inputQuery.trim()) {
                  handleAskAi(inputQuery.trim());
                }
              }}
              disabled={!inputQuery.trim() || isAiLoading}
              className="p-1.5 bg-sienna-brown hover:bg-sienna-brown/90 disabled:opacity-40 text-paper-white transition cursor-pointer shrink-0"
              title="Kirim Pertanyaan (Enter)"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray px-1">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1 py-0.5 bg-paper-white border border-slate-gray/20 text-[10px] mr-1">
                  ↵
                </kbd>
                Tanya AI
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-paper-white border border-slate-gray/20 text-[10px] mr-1">
                  ESC
                </kbd>
                Tutup
              </span>
            </div>
            <span className="text-sienna-brown font-semibold">
              DataLoka AI Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
