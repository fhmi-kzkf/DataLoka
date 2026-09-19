import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "@/app/page";
import { HeroArtifacts } from "@/components/landing/hero-artifacts";
import { InteractiveDemoLauncher } from "@/components/landing/interactive-demo-launcher";
import { QuickStatsStrip } from "@/components/landing/quick-stats-strip";
import { EditorialQuoteSection } from "@/components/landing/editorial-quote-section";
import { FeatureMatrix } from "@/components/landing/feature-matrix";
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { PrivacyHybridArchitecture } from "@/components/landing/privacy-hybrid-architecture";
import { InteractiveFaqSection } from "@/components/landing/interactive-faq-section";
import { TrustComplianceModal } from "@/components/landing/trust-compliance-modal";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useDatasetStore } from "@/stores/dataset-store";

// Mock next/navigation useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Landing Page & Editorial Showcase", () => {
  beforeEach(() => {
    mockPush.mockClear();
    useDashboardStore.getState().reset();
    useDatasetStore.getState().reset();
  });

  it("renders HeroArtifacts with region table, activation curve, and speed benchmark", () => {
    render(<HeroArtifacts />);

    expect(screen.getByText("Performa Regional Q1")).toBeInTheDocument();
    expect(screen.getByText("Jabodetabek")).toBeInTheDocument();
    expect(screen.getByText("Pertumbuhan Pesanan Selesai")).toBeInTheDocument();
    expect(screen.getByText("BR")).toBeInTheDocument();
    expect(screen.getByText("KV")).toBeInTheDocument();
    expect(screen.getByText(/Bu Rina memantau performa toko harian/)).toBeInTheDocument();
    expect(screen.getByText(/Speed Test:/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Uji Ulang/i })).toBeInTheDocument();
  });

  it("renders InteractiveDemoLauncher with 3 domain presets and handles click", () => {
    render(<InteractiveDemoLauncher />);

    expect(screen.getByText("Toko Retail & E-Commerce Omnichannel")).toBeInTheDocument();
    expect(screen.getByText("B2B Sales Pipeline & Quota")).toBeInTheDocument();
    expect(screen.getByText("Laporan Laba Rugi & Arus Kas UMKM")).toBeInTheDocument();

    const ecomBtn = screen.getAllByRole("button", { name: /Buka Demo/i })[0];
    fireEvent.click(ecomBtn);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(useDatasetStore.getState().dataset).toBeDefined();
    expect(useDashboardStore.getState().dashboard?.templateId).toBe("ecommerce");
  });

  it("renders QuickStatsStrip with proof metrics", () => {
    render(<QuickStatsStrip />);

    expect(screen.getByText("< 30s")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("8 Template")).toBeInTheDocument();
  });

  it("renders EditorialQuoteSection with 4 industry personas and switches persona", () => {
    render(<EditorialQuoteSection />);

    expect(screen.getByText(/Dalam waktu kurang dari 30 detik/)).toBeInTheDocument();
    expect(screen.getByText(/Rina S./)).toBeInTheDocument();

    // Switch to Finance persona
    const financeTab = screen.getByRole("button", { name: /Keuangan & Akuntansi/i });
    fireEvent.click(financeTab);

    expect(screen.getByText(/Hendra K./)).toBeInTheDocument();
    expect(screen.getByText(/Audit rekonsiliasi kas/)).toBeInTheDocument();

    // Switch to Sales persona
    const salesTab = screen.getByRole("button", { name: /Sales & Commercial/i });
    fireEvent.click(salesTab);

    expect(screen.getByText(/Aditya Pratama/)).toBeInTheDocument();
    expect(screen.getByText(/Tanya Data AI Assistant/)).toBeInTheDocument();
  });

  it("renders FeatureMatrix with 3 foundation cards", () => {
    render(<FeatureMatrix />);

    expect(screen.getByText("Client-Side Processing & Zero-Cloud Privacy")).toBeInTheDocument();
    expect(screen.getByText("Auto-Chart Decision Engine Teruji")).toBeInTheDocument();
    expect(screen.getByText("Kamus Lokal Pasar Indonesia")).toBeInTheDocument();
  });

  it("renders PrivacyHybridArchitecture with 3 boundary layers and modal triggers", () => {
    render(<PrivacyHybridArchitecture />);

    expect(screen.getByText("Bagaimana DataLoka melindungi privasi spreadsheet Anda.")).toBeInTheDocument();
    expect(screen.getByText("Parsing & Kalkulasi di Peramban")).toBeInTheDocument();
    expect(screen.getByText("Hanya Ringkasan Skema & Agregat")).toBeInTheDocument();
    expect(screen.getByText("Tersimpan Hanya Atas Izin Anda")).toBeInTheDocument();

    // Trigger trust modal
    const trustBtn = screen.getByRole("button", { name: /Zero-Cloud Storage Verified/i });
    fireEvent.click(trustBtn);

    expect(screen.getByText(/Spesifikasi & Audit Kepatuhan Keamanan/i)).toBeInTheDocument();
  });

  it("renders InteractiveFaqSection and toggles accordion items", () => {
    render(<InteractiveFaqSection />);

    expect(screen.getByText("Pertanyaan yang Sering Diajukan")).toBeInTheDocument();
    expect(screen.getByText(/Bagaimana cara kerja Live-Sync Google Sheets/i)).toBeInTheDocument();

    // Toggle 2nd FAQ item
    const aiFaqBtn = screen.getByRole("button", { name: /Apakah data sensitif terkirim ke server pihak ketiga/i });
    fireEvent.click(aiFaqBtn);

    expect(screen.getByText(/DataLoka menggunakan prinsip Least-Privilege Prompting/i)).toBeInTheDocument();
  });

  it("renders TrustComplianceModal with Zero-Cloud and UU PDP topics", () => {
    const handleClose = vi.fn();
    render(<TrustComplianceModal isOpen={true} onClose={handleClose} defaultTopic="zero_cloud" />);

    expect(screen.getByText("Jaminan Privasi & Legalitas Data")).toBeInTheDocument();
    expect(screen.getByText(/Web Workers dan WebAssembly/i)).toBeInTheDocument();

    // Switch topic to UU PDP
    const pdpTab = screen.getByRole("button", { name: /Kepatuhan UU PDP No. 27\/2022/i });
    fireEvent.click(pdpTab);

    expect(screen.getByText(/Undang-Undang No. 27 Tahun 2022/i)).toBeInTheDocument();
    expect(screen.getByText(/Hak Dihapus \(Right to be Forgotten\):/i)).toBeInTheDocument();
  });

  it("renders TemplateShowcase and switches active template tabs", () => {
    render(<TemplateShowcase />);

    expect(screen.getByText("8 Template Domain Terkurasi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "E-Commerce & Retail" })).toBeInTheDocument();

    // Click Sales tab
    const salesTab = screen.getByRole("button", { name: "B2B Sales & Pipeline" });
    fireEvent.click(salesTab);

    expect(screen.getByRole("button", { name: "B2B Sales & Pipeline" })).toBeInTheDocument();
    expect(screen.getByText(/Pelacakan pipeline deal/)).toBeInTheDocument();
  });

  it("renders full HomePage layout with hero headline, features, and sections", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Coba Sekarang/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lihat Contoh Demo/i })).toBeInTheDocument();
  });
});
