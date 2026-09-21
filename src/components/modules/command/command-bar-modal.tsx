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
  Code2,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  CornerDownLeft,
} from "lucide-react";
import { useCommandStore } from "@/stores/command-store";
import { useDatasetStore } from "@/stores/dataset-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { CommandSuggestionPill } from "./command-suggestion-pill";
import { UniversalChartRenderer } from "@/components/charts/universal-chart-renderer";
import { AiQueryEngine } from "@/core/ai/ai-query-engine";
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
  const [expandedSqlIds, setExpandedSqlIds] = useState<Record<string, boolean>>({});

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

    const headers = dataset?.headers || ["Tanggal", "Kategori", "Produk", "Omset", "Qty"];
    const rows = dataset?.rows || [
      { Tanggal: "2026-01-01", Kategori: "Fashion", Produk: "Kemeja", Omset: 4500000, Qty: 30 },
      { Tanggal: "2026-01-02", Kategori: "Elektronik", Produk: "TWS Earbuds", Omset: 8900000, Qty: 45 },
      { Tanggal: "2026-01-03", Kategori: "Kecantikan", Produk: "Serum", Omset: 6100000, Qty: 52 },
    ];

    try {
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
      // Robust deterministic AI fallback
      const fallbackResult = AiQueryEngine.processQuery(trimmed, headers, rows, "Rp");
      addChatMessage({
        role: "assistant",
        content: fallbackResult.answerText,
        aiResult: fallbackResult,
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

  const toggleSqlExpand = (messageId: string) => {
    setExpandedSqlIds((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
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

  // Helper to format markdown text with bolding and bullet lists
  const renderFormattedNarrative = (content: string) => {
    const lines = content.split("\n");
    return (
      <div className="space-y-2 text-[14px] text-ink-black/90 leading-relaxed font-normal">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;

          // Parse **bold** parts
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const parsedLine = parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-semibold text-ink-black">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          // Check if bullet point or numbered item
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-sienna-brown font-bold mt-1 text-[11px]">&bull;</span>
                <span className="flex-1">{parsedLine}</span>
              </div>
            );
          }

          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 font-medium text-ink-black mt-2 mb-1">
                <span>{parsedLine}</span>
              </div>
            );
          }

          return <p key={idx}>{parsedLine}</p>;
        })}
      </div>
    );
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
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-gray/20 bg-fog-white/95 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-sienna-brown/10 border border-sienna-brown/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-sienna-brown" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-signifier text-[16.5px] text-ink-black leading-none truncate">
                  Tanya Data AI
                </h2>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-sienna-brown text-paper-white font-bold tracking-wider">
                  Live
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11.5px] font-mono text-slate-gray truncate mt-0.5">
                <Database className="w-3 h-3 text-slate-gray/70 shrink-0" />
                <span className="truncate">
                  {dataset?.name || "Laporan Penjualan Omnichannel.xlsx"}
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
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-fog-white/30"
        >
          {chatMessages.length === 0 ? (
            /* Minimal Starter State */
            <div className="space-y-5 animate-fadeIn py-2 max-w-2xl">
              {/* Minimal Intro */}
              <div className="text-left space-y-1">
                <h3 className="font-signifier text-[17px] text-ink-black">
                  Halo! Saya Asisten Analitik DataLoka.
                </h3>
                <p className="text-[13.5px] text-slate-gray leading-relaxed">
                  Tanyakan performa bisnis, faktor pendorong penjualan, peringkat produk, atau minta saya membuat grafik secara instan.
                </p>
              </div>

              {/* Minimal Quick 1-Click Questions (Clean compact pills) */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase font-semibold text-slate-gray tracking-wider block">
                  Contoh Pertanyaan Cepat:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Kira kira apa faktor yang membuat produk saya laku dan produk yang mana saja?",
                    "Berapa total omset dan nilai rata-rata transaksi?",
                    "Siapa kategori produk paling mendominasi?",
                    "Tampilkan peringkat top 5 kontributor terbesar",
                    "Jelaskan ringkasan pola sebaran data ini",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleAskAi(q)}
                      className="text-left px-3.5 py-2 bg-paper-white hover:bg-mist-gray border border-slate-gray/25 hover:border-slate-gray/50 text-[13px] text-ink-black transition cursor-pointer shadow-2xs group"
                    >
                      <span>{q}</span>
                      <span className="text-sienna-brown ml-2 font-mono text-[11px] group-hover:translate-x-0.5 inline-block transition">&rarr;</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* History if available */}
              {history.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-gray/15">
                  <span className="text-[11px] font-mono uppercase font-semibold text-slate-gray tracking-wider block">
                    Riwayat Kueri:
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
              <div className="space-y-1.5 pt-2 border-t border-slate-gray/15">
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
            /* Conversational Chatbot Feed */
            <div className="space-y-6">
              {chatMessages.map((msg) => {
                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="flex justify-end gap-2.5 animate-fadeIn">
                      <div className="max-w-[85%] sm:max-w-[78%] bg-ink-black text-paper-white px-4 py-3 border border-ink-black shadow-xs space-y-1">
                        <div className="flex items-center justify-between gap-4 text-[10.5px] font-mono text-paper-white/60">
                          <span className="font-semibold text-paper-white/80">Anda</span>
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[14px] leading-relaxed font-normal whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                      <div className="w-7 h-7 bg-ink-black text-paper-white flex items-center justify-center shrink-0 text-[11px] font-mono border border-ink-black mt-1">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                }

                // Assistant Response Bubble (Conversational Card)
                const aiResult = msg.aiResult;
                const effectiveChartType =
                  (activeChartTypes[msg.id] ||
                    aiResult?.chartRecommendation?.chartType ||
                    "bar") as ChartType;
                const isSqlExpanded = expandedSqlIds[msg.id] !== false;

                return (
                  <div key={msg.id} className="flex items-start gap-2.5 animate-fadeIn">
                    {/* Assistant Avatar */}
                    <div className="w-7 h-7 bg-sienna-brown/10 border border-sienna-brown/30 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-sienna-brown" />
                    </div>

                    {/* Chat Bubble Container */}
                    <div className="flex-1 min-w-0 bg-paper-white border border-slate-gray/25 shadow-2xs p-4 sm:p-5 space-y-4 text-left">
                      {/* Bubble Header */}
                      <div className="flex items-center justify-between border-b border-slate-gray/15 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-signifier font-bold text-ink-black">
                            DataLoka AI
                          </span>
                          {aiResult?.confidence !== undefined && (
                            <span className="text-[10px] font-mono bg-[#ecfdf5] text-[#059669] px-1.5 py-0.5 border border-[#a7f3d0] font-semibold">
                              Keyakinan {Math.round(aiResult.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-gray/70">
                          {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Conversational Text / Markdown Response */}
                      <div className="prose prose-sm max-w-none text-ink-black">
                        {renderFormattedNarrative(msg.content)}
                      </div>

                      {/* Collapsible SQL Accordion */}
                      {aiResult?.sqlEquivalent && (
                        <div className="border border-slate-gray/20 bg-fog-white/60">
                          <button
                            type="button"
                            onClick={() => toggleSqlExpand(msg.id)}
                            className="w-full flex items-center justify-between px-3 py-2 text-left text-[11.5px] font-mono text-slate-gray hover:text-ink-black transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Code2 className="w-3.5 h-3.5 text-sienna-brown" />
                              <span className="font-semibold uppercase tracking-wider">
                                {isSqlExpanded ? "Sembunyikan SQL & Logika Kueri" : "Lihat SQL & Logika Kueri"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSqlExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </button>

                          {/* Expanded SQL View */}
                          {isSqlExpanded && (
                            <div className="p-3 border-t border-slate-gray/20 bg-mist-gray/40 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-mono text-slate-gray uppercase">
                                  Kueri SQL Terkompilasi:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopySql(aiResult.sqlEquivalent!, msg.id)}
                                  className="flex items-center gap-1 text-[11px] font-mono text-slate-gray hover:text-ink-black bg-paper-white px-2 py-0.5 border border-slate-gray/20 transition cursor-pointer"
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
                              <code className="block overflow-x-auto text-[11.5px] font-mono text-ink-black bg-paper-white p-2.5 border border-slate-gray/20 whitespace-pre-wrap">
                                {aiResult.sqlEquivalent}
                              </code>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Visual Chart Card */}
                      {aiResult?.chartRecommendation &&
                        aiResult.chartRecommendation.data.length > 0 && (
                          <div className="pt-2 space-y-3">
                            {/* Chart Controls Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-gray/15 pt-3">
                              <span className="text-[11.5px] font-mono uppercase font-bold text-slate-gray">
                                Visualisasi Rekomendasi
                              </span>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Type Switcher */}
                                <div className="flex items-center border border-slate-gray/20 bg-fog-white p-0.5">
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
                                        className={`px-2 py-1 text-[11px] font-mono flex items-center gap-1 transition cursor-pointer ${
                                          isActive
                                            ? "bg-sienna-brown text-paper-white font-medium"
                                            : "text-slate-gray hover:text-ink-black hover:bg-mist-gray"
                                        }`}
                                        title={`Ubah ke ${item.label}`}
                                      >
                                        <IconComp className="w-3 h-3" />
                                        <span>{item.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Pin to Dashboard */}
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

                            {/* Chart Canvas */}
                            <div className="bg-paper-white p-3 border border-slate-gray/20 shadow-2xs">
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
                                height={320}
                              />
                            </div>
                          </div>
                        )}

                      {/* Suggested Follow-up Prompt Chips */}
                      {aiResult?.suggestedFollowUps &&
                        aiResult.suggestedFollowUps.length > 0 && (
                          <div className="pt-2 border-t border-slate-gray/15 space-y-1.5">
                            <span className="text-[10.5px] font-mono text-slate-gray uppercase font-semibold">
                              Pertanyaan Lanjutan Terkait:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {aiResult.suggestedFollowUps.map((fu, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleAskAi(fu)}
                                  className="px-2.5 py-1 text-[12px] bg-fog-white border border-slate-gray/20 hover:border-sienna-brown text-ink-black cursor-pointer transition font-mono hover:bg-mist-gray flex items-center gap-1.5"
                                >
                                  {fu} &rarr;
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}

              {/* Seamless AI Thinking / Loading Bubble */}
              {isAiLoading && (
                <div className="flex items-start gap-2.5 animate-fadeIn">
                  <div className="w-7 h-7 bg-sienna-brown/10 border border-sienna-brown/30 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-sienna-brown animate-spin" />
                  </div>
                  <div className="bg-paper-white border border-sienna-brown/30 p-3.5 shadow-2xs flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-sienna-brown rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-sienna-brown rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-sienna-brown rounded-full animate-bounce" />
                    </div>
                    <span className="text-[13px] font-mono text-sienna-brown font-medium">
                      DataLoka AI sedang menganalisis dataset...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Chatbot Composer Bar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-gray/20 bg-paper-white shrink-0 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 bg-fog-white border border-slate-gray/30 px-3 py-2.5 shadow-2xs focus-within:border-sienna-brown focus-within:bg-paper-white transition">
            <span className="text-sienna-brown shrink-0 select-none">
              <Sparkles className="w-4 h-4" />
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask anything… (misal: 'Produk apa yang paling laku?', 'Berapa total omset?')"
              value={inputQuery}
              onChange={(e) => {
                setInputQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              disabled={isAiLoading}
              className="flex-1 bg-transparent text-[14px] text-ink-black placeholder:text-smoke-gray focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => {
                if (inputQuery.trim()) {
                  handleAskAi(inputQuery.trim());
                }
              }}
              disabled={!inputQuery.trim() || isAiLoading}
              className="px-2.5 py-1.5 bg-sienna-brown hover:bg-sienna-brown/90 disabled:opacity-40 text-paper-white transition cursor-pointer shrink-0 flex items-center gap-1.5 text-[12px] font-mono font-medium shadow-xs"
              title="Kirim Pertanyaan (Enter)"
            >
              <span>Kirim</span>
              <Send className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-fog-white border border-slate-gray/25 text-[10px]">
                  <CornerDownLeft className="w-2.5 h-2.5 inline" /> Enter
                </kbd>
                Kirim
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-fog-white border border-slate-gray/25 text-[10px]">
                  ESC
                </kbd>
                Tutup
              </span>
            </div>
            <span className="text-sienna-brown font-medium">
              DataLoka AI Analyst
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

