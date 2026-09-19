"use client";

import React, { useEffect } from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { PricingSection } from "@/components/pricing/pricing-section";
import { PricingTable } from "@/components/pricing/pricing-table";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { AuthModal } from "@/components/auth/auth-modal";
import { SavedWorkspacesModal } from "@/components/auth/saved-workspaces-modal";
import { CheckoutModal } from "@/components/pricing/checkout-modal";
import { useAuthStore } from "@/stores/auth-store";

export default function PricingPage() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    const unsub = initializeAuth();
    return () => unsub();
  }, [initializeAuth]);

  return (
    <div className="min-h-screen bg-[var(--color-paper-white)] text-ink-black antialiased selection:bg-[var(--color-blush-peach)] selection:text-[var(--color-sienna-brown)]">
      {/* 1. Header Navigation Bar */}
      <LandingNavbar />

      {/* 2. Main Pricing Hero & Cards */}
      <main className="pt-8 sm:pt-12">
        <PricingSection />

        {/* 3. Detailed Comparison Matrix */}
        <PricingTable />

        {/* 4. Pricing FAQs */}
        <PricingFaq />
      </main>

      {/* 5. Minimal Editorial Footer */}
      <LandingFooter />

      {/* Global Modals */}
      <AuthModal />
      <SavedWorkspacesModal />
      <CheckoutModal />
    </div>
  );
}
