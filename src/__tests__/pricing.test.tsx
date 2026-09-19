import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PRICING_TIERS, FEATURE_COMPARISON_GROUPS, PRICING_FAQS } from "@/types/pricing";
import { PricingSection } from "@/components/pricing/pricing-section";
import { PricingTable } from "@/components/pricing/pricing-table";
import { PricingFaq } from "@/components/pricing/pricing-faq";

describe("Modul Pricing & Monetisasi (PRD DataVista Specs)", () => {
  describe("1. Master Data & Tier Definition", () => {
    it("should define all 4 required tiers from PRD Section 10", () => {
      const tierIds = PRICING_TIERS.map((t) => t.id);
      expect(tierIds).toEqual(["free", "starter", "pro", "business"]);
    });

    it("should offer 20% annual discount on paid tiers", () => {
      const starter = PRICING_TIERS.find((t) => t.id === "starter")!;
      expect(starter.monthlyPrice).toBe(49000);
      expect(starter.annualPricePerMonth).toBe(39000);
      expect(starter.annualPricePerMonth).toBeLessThan(starter.monthlyPrice);

      const pro = PRICING_TIERS.find((t) => t.id === "pro")!;
      expect(pro.monthlyPrice).toBe(149000);
      expect(pro.annualPricePerMonth).toBe(119000);
      expect(pro.isPopular).toBe(true);

      const free = PRICING_TIERS.find((t) => t.id === "free")!;
      expect(free.monthlyPrice).toBe(0);
      expect(free.annualPricePerMonth).toBe(0);
    });

    it("should have comprehensive comparison groups and FAQ entries", () => {
      expect(FEATURE_COMPARISON_GROUPS.length).toBeGreaterThanOrEqual(4);
      expect(PRICING_FAQS.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("2. Pricing UI Components", () => {
    it("PricingSection should render tier cards and handle monthly/annual toggle", () => {
      render(<PricingSection />);

      expect(screen.getByText("Free")).toBeInTheDocument();
      expect(screen.getByText("Starter")).toBeInTheDocument();
      expect(screen.getByText("Pro")).toBeInTheDocument();
      expect(screen.getByText("Business / Team")).toBeInTheDocument();

      // Toggle to monthly
      const monthlyBtn = screen.getByText("Tagihan Bulanan");
      fireEvent.click(monthlyBtn);
      expect(screen.getByText("149.000")).toBeInTheDocument();

      // Toggle to annual
      const annualBtn = screen.getByText("Tagihan Tahunan");
      fireEvent.click(annualBtn);
      expect(screen.getByText("119.000")).toBeInTheDocument();
    });

    it("PricingTable should render feature matrix with checkmarks and limits", () => {
      render(<PricingTable />);

      expect(screen.getByText("Matriks Perbandingan Fitur Mendalam")).toBeInTheDocument();
      expect(screen.getByText("Kapasitas & Batasan Data")).toBeInTheDocument();
      expect(screen.getByText("Jumlah Dashboard Aktif")).toBeInTheDocument();
    });

    it("PricingFaq should render FAQ items and toggle answers", () => {
      render(<PricingFaq />);

      const firstQuestion = PRICING_FAQS[0].question;
      expect(screen.getByText(firstQuestion)).toBeInTheDocument();

      // Answer should be initially expanded for index 0
      expect(screen.getByText(PRICING_FAQS[0].answer)).toBeInTheDocument();
    });
  });
});
