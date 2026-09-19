"use client";

import React, { useState } from "react";
import { Check, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import { PRICING_TIERS, type BillingCycle, type PlanTierId } from "@/types/pricing";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { useAuthStore } from "@/stores/auth-store";

interface PricingSectionProps {
  onSelectTier?: (tierId: PlanTierId, cycle: BillingCycle) => void;
  className?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectTier,
  className = "",
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const { user, openAuthModal, openCheckoutModal, planTier } = useAuthStore();

  const handleTierAction = (tierId: PlanTierId) => {
    if (onSelectTier) {
      onSelectTier(tierId, billingCycle);
      return;
    }

    if (!user) {
      openAuthModal("register");
      return;
    }

    if (tierId === "free") {
      if (planTier === "free") {
        alert("Akun Anda saat ini aktif pada paket Free.");
        return;
      }
    }

    // Open End-to-End Checkout Modal
    openCheckoutModal(tierId, billingCycle);
  };

  return (
    <section className={`w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-16 sm:py-24 text-left ${className}`}>
      {/* Header & Narrative */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
        <Tag label="Struktur Harga Terjangkau & Transparan" />
        <h2 className="font-signifier text-[34px] sm:text-[46px] lg:text-[50px] font-normal text-ink-black tracking-tight leading-[1.12]">
          Investasi analitik tepat untuk setiap skala bisnis.
        </h2>
        <p className="text-[16px] sm:text-[17.5px] text-slate-gray leading-relaxed max-w-2xl mx-auto">
          Mulai dari gratis tanpa kartu kredit. Tingkatkan kapasitas kapan saja sesuai pertumbuhan volume data Anda.
        </p>

        {/* Billing Cycle Switcher Toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex items-center bg-fog-white border border-slate-gray/20 p-1 rounded-none shadow-2xs">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 text-[13px] font-mono font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-ink-black text-paper-white shadow-xs"
                  : "text-slate-gray hover:text-ink-black"
              }`}
            >
              Tagihan Bulanan
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 text-[13px] font-mono font-medium flex items-center gap-2 transition-all ${
                billingCycle === "annual"
                  ? "bg-ink-black text-paper-white shadow-xs"
                  : "text-slate-gray hover:text-ink-black"
              }`}
            >
              <span>Tagihan Tahunan</span>
              <span className="bg-[#ecfdf5] text-[#059669] text-[10.5px] font-semibold px-2 py-0.5 border border-[#a7f3d0]">
                Hemat 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Tier Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {PRICING_TIERS.map((tier) => {
          const price = billingCycle === "annual" ? tier.annualPricePerMonth : tier.monthlyPrice;
          const isPro = tier.id === "pro";

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between p-6 sm:p-7 bg-paper-white transition-all duration-200 border shadow-xs ${
                isPro
                  ? "border-sienna-brown/80 ring-2 ring-sienna-brown/30 z-10"
                  : "border-slate-gray/20 hover:border-slate-gray/40"
              }`}
            >
              {/* Popular Ribbon */}
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sienna-brown text-paper-white text-[11px] font-mono font-semibold px-3 py-0.5 tracking-wider uppercase shadow-xs">
                  Paling Populer
                </div>
              )}

              {/* Top Meta */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-signifier text-[24px] font-normal text-ink-black">
                    {tier.name}
                  </h3>
                  {tier.id === "free" && <span className="text-[12px] font-mono text-slate-gray">Uji Coba</span>}
                  {tier.id === "starter" && <Zap className="w-4 h-4 text-slate-gray" />}
                  {tier.id === "pro" && <Sparkles className="w-4 h-4 text-sienna-brown" />}
                  {tier.id === "business" && <Shield className="w-4 h-4 text-ink-black" />}
                </div>

                <p className="text-[12.5px] text-slate-gray leading-snug mt-2 min-h-[38px]">
                  {tier.tagline}
                </p>

                {/* Price Display */}
                <div className="my-6 pb-6 border-b border-slate-gray/15">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[14px] font-mono text-slate-gray">{tier.currency}</span>
                    <span className="font-signifier text-[38px] font-normal text-ink-black tracking-tight">
                      {price === 0 ? "0" : price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[12.5px] text-slate-gray font-mono">/ bln</span>
                  </div>
                  {billingCycle === "annual" && price > 0 && (
                    <p className="text-[11px] font-mono text-[#059669] mt-1">
                      Ditagih tahunan (Hemat {(tier.monthlyPrice - tier.annualPricePerMonth) * 12 / 1000}k / thn)
                    </p>
                  )}
                  {price === 0 && (
                    <p className="text-[11px] font-mono text-slate-gray mt-1">
                      Gratis selamanya tanpa syarat
                    </p>
                  )}
                </div>

                {/* Key Quota Limits */}
                <div className="space-y-1.5 text-[12px] font-mono bg-fog-white p-3 border border-slate-gray/10 mb-5">
                  <div className="flex justify-between">
                    <span className="text-slate-gray">Dashboard:</span>
                    <span className="font-medium text-ink-black">{tier.limits.maxDashboards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-gray">Maks File:</span>
                    <span className="font-medium text-ink-black">{tier.limits.maxFileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-gray">Maks Baris:</span>
                    <span className="font-medium text-ink-black">{tier.limits.maxRows}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono uppercase text-slate-gray tracking-wider block">
                    Fitur Termasuk:
                  </span>
                  {tier.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 text-[12.5px] ${
                        feat.included ? "text-ink-black" : "text-slate-gray/50 line-through"
                      }`}
                    >
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          feat.included
                            ? isPro || feat.highlight
                              ? "text-sienna-brown"
                              : "text-ink-black"
                            : "text-slate-gray/30"
                        }`}
                      />
                      <span className={feat.highlight ? "font-medium text-ink-black" : ""}>
                        {feat.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <Button
                  variant={user && planTier === tier.id ? "ghost" : tier.ctaVariant}
                  size="md"
                  onClick={() => handleTierAction(tier.id)}
                  disabled={Boolean(user && planTier === tier.id)}
                  className={`w-full text-[13.5px] py-2.5 justify-center gap-2 ${
                    user && planTier === tier.id
                      ? "bg-fog-white border border-[#a7f3d0] text-[#059669] opacity-90 cursor-default"
                      : isPro
                      ? "bg-sienna-brown hover:bg-sienna-brown/90 text-paper-white"
                      : ""
                  }`}
                >
                  {user && planTier === tier.id ? (
                    <>
                      <Check className="w-4 h-4 text-[#059669]" />
                      <span>Paket Aktif Anda</span>
                    </>
                  ) : (
                    <>
                      <span>{tier.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Badges & Local Assurance Strip */}
      <div className="mt-12 pt-8 border-t border-slate-gray/15 flex flex-wrap items-center justify-between gap-6 text-[12.5px] text-slate-gray font-mono">
        <div className="flex items-center gap-2">
          <span>&bull; Metode Pembayaran Indonesia:</span>
          <span className="bg-fog-white px-2 py-1 border border-slate-gray/20 text-ink-black font-semibold">QRIS</span>
          <span className="bg-fog-white px-2 py-1 border border-slate-gray/20 text-ink-black font-semibold">BCA / Mandiri VA</span>
          <span className="bg-fog-white px-2 py-1 border border-slate-gray/20 text-ink-black font-semibold">GoPay / OVO</span>
          <span className="bg-fog-white px-2 py-1 border border-slate-gray/20 text-ink-black font-semibold">Visa / Mastercard</span>
        </div>
        <div className="flex items-center gap-4">
          <span>&bull; Garansi 14 Hari Uang Kembali</span>
          <span>&bull; Kepatuhan UU PDP Terjamin</span>
        </div>
      </div>
    </section>
  );
};
