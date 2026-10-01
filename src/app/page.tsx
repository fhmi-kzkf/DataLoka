"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { HeroArtifacts } from "@/components/landing/hero-artifacts";
import { QuickStatsStrip } from "@/components/landing/quick-stats-strip";
import { InteractiveDemoLauncher } from "@/components/landing/interactive-demo-launcher";
import { EditorialQuoteSection } from "@/components/landing/editorial-quote-section";
import { FeatureMatrix } from "@/components/landing/feature-matrix";
import { PrivacyHybridArchitecture } from "@/components/landing/privacy-hybrid-architecture";
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { PricingSection } from "@/components/pricing/pricing-section";
import { InteractiveFaqSection } from "@/components/landing/interactive-faq-section";
import { IngestContainer } from "@/components/modules/ingest/ingest-container";
import { AuthModal } from "@/components/auth/auth-modal";
import { SavedWorkspacesModal } from "@/components/auth/saved-workspaces-modal";
import { CheckoutModal } from "@/components/pricing/checkout-modal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { useDatasetStore } from "@/stores/dataset-store";
import { useMappingStore } from "@/stores/mapping-store";
import { useChartStore } from "@/stores/chart-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {
  const router = useRouter();
  const { dataset } = useDatasetStore();
  const { generateMapping } = useMappingStore();
  const { generateRecommendations } = useChartStore();
  const { initializeFromEngine } = useDashboardStore();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    const unsub = initializeAuth();
    return () => unsub();
  }, [initializeAuth]);

  const handleProceedToWorkspace = () => {
    if (!dataset) return;
    const mappingObj = generateMapping(dataset);
    const engineRes = generateRecommendations(dataset, mappingObj);
    initializeFromEngine(
      dataset.id,
      `Dashboard ${dataset.name.replace(/\.[^/.]+$/, "")}`,
      "Ikhtisar terpadu performa dan sintesis analitik visual otomatis",
      engineRes.kpiCards,
      engineRes.mainCharts,
      dataset.headers,
      mappingObj
    );
    router.push("/dashboard");
  };

  const handleScrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper-white)] text-ink-black selection:bg-[var(--color-blush-peach)] selection:text-[var(--color-sienna-brown)] antialiased">
      {/* 1. Header Navigation Bar */}
      <LandingNavbar />

      {/* 2. Asymmetric Hero Section */}
      <section className="max-w-[1240px] mx-auto px-6 lg:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Narrative */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-6 flex flex-col items-center lg:items-start">
            <Tag label="Platform Analitik Generasi Baru" className="mx-auto lg:mx-0" />

            <h1 className="font-signifier text-[34px] sm:text-[48px] lg:text-[54px] leading-[1.08] tracking-[-1.5px] font-normal text-ink-black text-center lg:text-left">
              Ubah spreadsheet bisnis menjadi visual yang <span className="italic font-normal">bercerita</span>.
            </h1>

            <p className="text-[15.5px] sm:text-[17px] text-slate-gray leading-relaxed max-w-lg text-center lg:text-left mx-auto lg:mx-0">
              Unggah Excel, CSV, atau Google Sheets. Dapatkan dasbor analitik lengkap dalam hitungan detik.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto lg:mx-0">
              <Button
                variant="filled"
                size="lg"
                className="text-[14.5px] px-6 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all w-full sm:w-auto text-center justify-center"
                onClick={() => handleScrollTo("ingest")}
              >
                Coba Sekarang &mdash; Gratis
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-[14.5px] px-5 py-3 hover:-translate-y-0.5 transition-all w-full sm:w-auto text-center justify-center"
                onClick={() => handleScrollTo("demo")}
              >
                Lihat Contoh Demo
              </Button>
            </div>

            {/* Micro value badges */}
            <div className="pt-4 border-t border-slate-gray/15 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-1.5 text-[12px] font-mono text-slate-gray w-full">
              <span>&bull; 100% Client-Side</span>
              <span>&bull; Zero-Cloud Privacy</span>
              <span>&bull; Tanpa Registrasi</span>
            </div>
          </div>

          {/* Right Column: 3-Card Interactive Hero Stage with Speed Test */}
          <div className="lg:col-span-7">
            <HeroArtifacts
              onSelectSampleQuery={() => {
                handleScrollTo("demo");
              }}
            />
          </div>
        </div>
      </section>

      {/* 3. Proof Metrics Strip */}
      <ScrollReveal delayMs={50}>
        <QuickStatsStrip />
      </ScrollReveal>

      {/* 4. 1-Click Interactive Demos */}
      <section id="demo" className="max-w-[1240px] mx-auto px-6 lg:px-8 py-20 sm:py-28 scroll-mt-20">
        <ScrollReveal delayMs={50}>
          <InteractiveDemoLauncher />
        </ScrollReveal>
      </section>

      {/* 5. Ingest Upload Workspace */}
      <section id="ingest" className="max-w-[1240px] mx-auto px-6 lg:px-8 py-20 sm:py-28 border-t border-slate-gray/15 scroll-mt-20">
        <ScrollReveal delayMs={50}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5 text-left space-y-4">
              <Tag label="Mulai Langsung" />
              <h2 className="font-signifier text-[30px] sm:text-[38px] text-ink-black font-normal tracking-tight">
                Bawa Dataset Anda Sendiri
              </h2>
              <p className="text-[14.5px] text-slate-gray leading-relaxed">
                Tarik file spreadsheet Anda ke dropzone. Kalkulasi dan visualisasi diproses instan di peramban.
              </p>
            </div>

            <div className="lg:col-span-7">
              <IngestContainer onProceedToMapping={handleProceedToWorkspace} />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 6. Editorial Quote Card (Multi-Persona Social Proof) */}
      <ScrollReveal delayMs={50}>
        <EditorialQuoteSection />
      </ScrollReveal>

      {/* 7. Foundation Features */}
      <div id="features">
        <ScrollReveal delayMs={50}>
          <FeatureMatrix />
        </ScrollReveal>
      </div>

      {/* 8. Privacy & Hybrid Architecture Boundary */}
      <ScrollReveal delayMs={50}>
        <PrivacyHybridArchitecture />
      </ScrollReveal>

      {/* 9. 8-Domain Template Showcase */}
      <section id="templates" className="max-w-[1240px] mx-auto px-6 lg:px-8 py-20 sm:py-28 scroll-mt-20">
        <ScrollReveal delayMs={50}>
          <TemplateShowcase />
        </ScrollReveal>
      </section>

      {/* 10. Pricing & Monetization Section */}
      <section id="pricing" className="border-t border-slate-gray/15 scroll-mt-20">
        <ScrollReveal delayMs={50}>
          <PricingSection />
        </ScrollReveal>
      </section>

      {/* 11. Interactive FAQ Section (Objection Handling) */}
      <ScrollReveal delayMs={50}>
        <InteractiveFaqSection />
      </ScrollReveal>

      {/* 12. Minimal Editorial Footer */}
      <LandingFooter />

      {/* Global Modals */}
      <AuthModal />
      <SavedWorkspacesModal />
      <CheckoutModal />
    </div>
  );
}
