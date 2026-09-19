"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Shield,
  CreditCard,
  QrCode,
  Building2,
  Smartphone,
  Copy,
  Check,
  Download,
  ArrowRight,
  Lock,
} from "lucide-react";
import { PRICING_TIERS, type PlanTierId, type BillingCycle } from "@/types/pricing";
import { useAuthStore } from "@/stores/auth-store";
import { type UpgradeReceipt } from "@/core/auth/firebase-auth-service";

type PaymentMethodType = "qris" | "va_bca" | "va_mandiri" | "ewallet" | "card";

export const CheckoutModal: React.FC = () => {
  const router = useRouter();
  const {
    user,
    checkoutModalOpen,
    selectedUpgradeTier,
    selectedBillingCycle,
    closeCheckoutModal,
    executeUpgrade,
    openAuthModal,
  } = useAuthStore();

  const [activeTier, setActiveTier] = useState<PlanTierId>(selectedUpgradeTier || "pro");
  const [activeCycle, setActiveCycle] = useState<BillingCycle>(selectedBillingCycle || "annual");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("qris");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<UpgradeReceipt | null>(null);
  const [copiedVa, setCopiedVa] = useState<boolean>(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(899); // 14:59

  // Card form state
  const [cardNumber, setCardNumber] = useState<string>("4532 •••• •••• 8892");
  const [cardExpiry, setCardExpiry] = useState<string>("12/28");
  const [cardCvv, setCardCvv] = useState<string>("892");
  const [ewalletPhone, setEwalletPhone] = useState<string>("0812-8920-1182");

  useEffect(() => {
    if (checkoutModalOpen) {
      setActiveTier(selectedUpgradeTier || "pro");
      setActiveCycle(selectedBillingCycle || "annual");
      setReceipt(null);
      setIsProcessing(false);
      setTimeLeftSeconds(899);
    }
  }, [checkoutModalOpen, selectedUpgradeTier, selectedBillingCycle]);

  // QRIS Countdown Timer
  useEffect(() => {
    if (!checkoutModalOpen || receipt) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [checkoutModalOpen, receipt]);

  if (!checkoutModalOpen) return null;

  const currentTierObj = PRICING_TIERS.find((t) => t.id === activeTier) || PRICING_TIERS[2];
  const monthlyPrice = currentTierObj.monthlyPrice;
  const annualPricePerMonth = currentTierObj.annualPricePerMonth;
  const rawTotal = activeCycle === "annual" ? annualPricePerMonth * 12 : monthlyPrice;
  const originalAnnualTotal = monthlyPrice * 12;
  const discountAmount = activeCycle === "annual" ? originalAnnualTotal - rawTotal : 0;

  const vaNumber =
    paymentMethod === "va_bca"
      ? "8270 8921 3400 9182"
      : paymentMethod === "va_mandiri"
      ? "8901 0812 7729 3301"
      : "1029 4481 0029 8812";

  const handleCopyVa = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(vaNumber.replace(/\s/g, ""));
      setCopiedVa(true);
      setTimeout(() => setCopiedVa(false), 2000);
    }
  };

  const handleConfirmPayment = async () => {
    if (!user) {
      closeCheckoutModal();
      openAuthModal("register");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate real-time payment gateway network handshake
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const res = await executeUpgrade(
        activeTier,
        activeCycle,
        paymentMethod.toUpperCase().replace("_", " ")
      );
      setReceipt(res);
      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      alert("Gagal memproses upgrade langganan. Silakan coba kembali.");
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-black/60 backdrop-blur-xs antialiased overflow-y-auto"
    >
      <div
        className="relative w-full max-w-[760px] bg-paper-white border border-slate-gray/30 p-5 sm:p-8 shadow-subtle text-left transition-all max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeCheckoutModal}
          className="absolute top-4 right-4 p-1.5 text-slate-gray hover:text-ink-black hover:bg-fog-white border border-transparent hover:border-slate-gray/20 transition-all"
          aria-label="Tutup dialog checkout"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ----------------- STATE 1 & 2: CHECKOUT & PAYMENT SELECTION ----------------- */}
        {!receipt && (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1 pb-4 border-b border-slate-gray/15">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-sienna-brown tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-sienna-brown" />
                <span>Upgrade Paket Langganan DataLoka</span>
              </div>
              <h3 className="font-signifier text-[26px] sm:text-[30px] font-normal text-ink-black">
                Konfirmasi &amp; Pembayaran Layanan
              </h3>
              <p className="text-[13.5px] text-slate-gray">
                Pilih metode pembayaran resmi Indonesia untuk mengaktifkan kapasitas tanpa batas.
              </p>
            </div>

            {/* Plan Tier Selector Bar */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-fog-white border border-slate-gray/20">
              {(["starter", "pro", "business"] as PlanTierId[]).map((tierId) => {
                const isSelected = activeTier === tierId;
                const tierInfo = PRICING_TIERS.find((t) => t.id === tierId);

                return (
                  <button
                    key={tierId}
                    type="button"
                    onClick={() => setActiveTier(tierId)}
                    className={`py-2 px-2 sm:px-3 text-center transition-all ${
                      isSelected
                        ? "bg-paper-white text-ink-black font-semibold shadow-xs border border-slate-gray/30"
                        : "text-slate-gray hover:text-ink-black"
                    }`}
                  >
                    <div className="text-[12.5px] sm:text-[13px] font-medium capitalize flex items-center justify-center gap-1">
                      {tierId === "starter" && <Zap className="w-3 h-3 text-slate-gray" />}
                      {tierId === "pro" && <Sparkles className="w-3 h-3 text-sienna-brown" />}
                      {tierId === "business" && <Shield className="w-3 h-3 text-ink-black" />}
                      <span>{tierInfo?.name.split(" ")[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Billing Cycle Switch */}
            <div className="flex items-center justify-between p-3 bg-fog-white border border-slate-gray/15 text-[13px]">
              <span className="font-mono text-slate-gray">Periode Penagihan:</span>
              <div className="flex items-center gap-1 bg-paper-white border border-slate-gray/20 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveCycle("monthly")}
                  className={`px-3 py-1 text-[12px] font-mono transition-all ${
                    activeCycle === "monthly"
                      ? "bg-ink-black text-paper-white font-medium"
                      : "text-slate-gray hover:text-ink-black"
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCycle("annual")}
                  className={`px-3 py-1 text-[12px] font-mono flex items-center gap-1.5 transition-all ${
                    activeCycle === "annual"
                      ? "bg-sienna-brown text-paper-white font-medium"
                      : "text-slate-gray hover:text-ink-black"
                  }`}
                >
                  <span>Tahunan</span>
                  <span className="text-[10px] bg-paper-white/20 text-paper-white px-1 font-semibold">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            {/* 2-Column Checkout Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Payment Method Picker (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <span className="text-[11.5px] font-mono uppercase text-slate-gray tracking-wider block font-semibold">
                  Metode Pembayaran:
                </span>

                {/* Method Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qris")}
                    className={`p-2.5 border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === "qris"
                        ? "border-sienna-brown bg-blush-peach/20 text-ink-black font-semibold ring-1 ring-sienna-brown/40"
                        : "border-slate-gray/20 hover:border-slate-gray/40 text-slate-gray bg-paper-white"
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-sienna-brown shrink-0" />
                    <div className="text-[12px] leading-tight">
                      <span className="block text-ink-black font-medium">QRIS Instan</span>
                      <span className="text-[10.5px] text-slate-gray">BCA, GoPay, OVO, Dana</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("va_bca")}
                    className={`p-2.5 border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === "va_bca"
                        ? "border-sienna-brown bg-blush-peach/20 text-ink-black font-semibold ring-1 ring-sienna-brown/40"
                        : "border-slate-gray/20 hover:border-slate-gray/40 text-slate-gray bg-paper-white"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-sienna-brown shrink-0" />
                    <div className="text-[12px] leading-tight">
                      <span className="block text-ink-black font-medium">BCA Virtual Account</span>
                      <span className="text-[10.5px] text-slate-gray">Verifikasi Otomatis</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("va_mandiri")}
                    className={`p-2.5 border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === "va_mandiri"
                        ? "border-sienna-brown bg-blush-peach/20 text-ink-black font-semibold ring-1 ring-sienna-brown/40"
                        : "border-slate-gray/20 hover:border-slate-gray/40 text-slate-gray bg-paper-white"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-sienna-brown shrink-0" />
                    <div className="text-[12px] leading-tight">
                      <span className="block text-ink-black font-medium">Mandiri / BRI VA</span>
                      <span className="text-[10.5px] text-slate-gray">ATM / Livin&apos; by Mandiri</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-2.5 border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === "card"
                        ? "border-sienna-brown bg-blush-peach/20 text-ink-black font-semibold ring-1 ring-sienna-brown/40"
                        : "border-slate-gray/20 hover:border-slate-gray/40 text-slate-gray bg-paper-white"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-sienna-brown shrink-0" />
                    <div className="text-[12px] leading-tight">
                      <span className="block text-ink-black font-medium">Kartu Kredit / Debit</span>
                      <span className="text-[10.5px] text-slate-gray">Visa, Mastercard, JCB</span>
                    </div>
                  </button>
                </div>

                {/* Selected Method Details Panel */}
                <div className="p-4 bg-fog-white border border-slate-gray/20 space-y-3">
                  {/* QRIS View */}
                  {paymentMethod === "qris" && (
                    <div className="space-y-3 text-center">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray border-b border-slate-gray/15 pb-2">
                        <span>QRIS Standar Bank Indonesia</span>
                        <span className="text-sienna-brown font-semibold">
                          Sisa Waktu: {formatTimer(timeLeftSeconds)}
                        </span>
                      </div>

                      {/* Simulated QR Code Box */}
                      <div className="mx-auto w-36 h-36 bg-paper-white border border-slate-gray/30 p-2 flex flex-col items-center justify-center shadow-xs">
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center p-2 relative">
                          {/* SVG QR Pattern Simulation */}
                          <svg viewBox="0 0 100 100" className="w-full h-full fill-paper-white">
                            <rect x="10" y="10" width="25" height="25" fill="#ffffff" />
                            <rect x="15" y="15" width="15" height="15" fill="#000000" />
                            <rect x="65" y="10" width="25" height="25" fill="#ffffff" />
                            <rect x="70" y="15" width="15" height="15" fill="#000000" />
                            <rect x="10" y="65" width="25" height="25" fill="#ffffff" />
                            <rect x="15" y="70" width="15" height="15" fill="#000000" />
                            <rect x="42" y="12" width="16" height="8" fill="#ffffff" />
                            <rect x="42" y="30" width="16" height="40" fill="#ffffff" />
                            <rect x="65" y="65" width="25" height="25" fill="#ffffff" />
                            <rect x="70" y="70" width="15" height="15" fill="#000000" />
                          </svg>
                          <span className="absolute text-[8px] font-mono bg-paper-white text-ink-black px-1 font-bold">
                            DATALOKA
                          </span>
                        </div>
                      </div>

                      <p className="text-[11.5px] text-slate-gray leading-tight">
                        Pindai QRIS di atas dengan aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau dompet digital (GoPay, OVO, Dana).
                      </p>
                    </div>
                  )}

                  {/* Virtual Account View */}
                  {(paymentMethod === "va_bca" || paymentMethod === "va_mandiri") && (
                    <div className="space-y-3">
                      <span className="text-[11px] font-mono text-slate-gray block">
                        Nomor Virtual Account (Otomatis Terverifikasi):
                      </span>
                      <div className="flex items-center justify-between p-2.5 bg-paper-white border border-slate-gray/30">
                        <span className="font-mono text-[16px] font-bold text-ink-black tracking-wider">
                          {vaNumber}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyVa}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono border border-slate-gray/25 hover:border-sienna-brown text-ink-black transition-all bg-fog-white"
                        >
                          {copiedVa ? (
                            <>
                              <Check className="w-3 h-3 text-[#059669]" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-gray" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-gray font-mono">
                        Petunjuk: Masukkan nomor VA di menu Transfer VA m-Banking Anda.
                      </p>
                    </div>
                  )}

                  {/* Credit Card View */}
                  {paymentMethod === "card" && (
                    <div className="space-y-2 text-[12px]">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-gray mb-1">
                          Nomor Kartu:
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full p-2 bg-paper-white border border-slate-gray/30 text-[13px] font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-gray mb-1">
                            Masa Berlaku:
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full p-2 bg-paper-white border border-slate-gray/30 text-[13px] font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-gray mb-1">
                            CVV / CVC:
                          </label>
                          <input
                            type="text"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full p-2 bg-paper-white border border-slate-gray/30 text-[13px] font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Summary & Action (5 cols) */}
              <div className="md:col-span-5 flex flex-col justify-between p-4 sm:p-5 bg-fog-white border border-slate-gray/25 space-y-4">
                <div className="space-y-3">
                  <span className="text-[11.5px] font-mono uppercase text-slate-gray tracking-wider block font-semibold border-b border-slate-gray/15 pb-2">
                    Rincian Tagihan:
                  </span>

                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-slate-gray">Paket Pilihan:</span>
                      <span className="font-medium text-ink-black capitalize">
                        {currentTierObj.name}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-gray">Durasi:</span>
                      <span className="font-mono text-ink-black">
                        {activeCycle === "annual" ? "12 Bulan (Tahunan)" : "1 Bulan"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-gray">Harga Normal:</span>
                      <span className="font-mono text-slate-gray">
                        Rp{" "}
                        {(activeCycle === "annual"
                          ? originalAnnualTotal
                          : monthlyPrice
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[#059669]">
                        <span>Diskon Tahunan (20%):</span>
                        <span className="font-mono">-Rp {discountAmount.toLocaleString("id-ID")}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[11.5px] text-slate-gray pt-1 border-t border-slate-gray/15">
                      <span>PPN 11%:</span>
                      <span className="font-mono">Termasuk (All-in)</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-gray/20">
                    <span className="text-[11px] font-mono uppercase text-slate-gray block">
                      Total Pembayaran:
                    </span>
                    <p className="font-signifier text-[26px] font-normal text-sienna-brown tracking-tight leading-tight mt-0.5">
                      Rp {rawTotal.toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Included benefits list */}
                  <div className="space-y-1 pt-2 border-t border-slate-gray/15 text-[11.5px] text-slate-gray">
                    <div className="flex items-center gap-1.5 text-ink-black font-medium">
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span>{currentTierObj.limits.maxRows}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-black font-medium">
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span>{currentTierObj.limits.maxDashboards}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-black font-medium">
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span>{currentTierObj.limits.storage}</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-sienna-brown hover:bg-sienna-brown/90 text-paper-white font-medium text-[13.5px] flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Lock className="w-4 h-4 animate-spin text-paper-white" />
                        <span>Memproses Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <span>Konfirmasi &amp; Bayar Sekarang</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-gray mt-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Garansi 14 Hari Uang Kembali</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STATE 3: PAYMENT SUCCESS RECEIPT ----------------- */}
        {receipt && (
          <div className="space-y-6 py-2 text-left">
            {/* Header Success */}
            <div className="p-4 bg-[#ecfdf5] border border-[#a7f3d0] flex items-center gap-3.5">
              <div className="w-10 h-10 bg-[#059669] text-paper-white flex items-center justify-center rounded-full shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-[#059669] font-bold tracking-wider block">
                  Pembayaran Berhasil Diverifikasi
                </span>
                <h4 className="font-signifier text-[22px] text-ink-black font-normal leading-snug">
                  Selamat! Paket {receipt.tier.toUpperCase()} Anda Sudah Aktif
                </h4>
              </div>
            </div>

            {/* Official Invoice Slip */}
            <div className="p-5 bg-fog-white border border-slate-gray/25 space-y-4 font-mono text-[12.5px]">
              <div className="flex items-center justify-between border-b border-slate-gray/15 pb-3">
                <div>
                  <span className="text-[11px] text-slate-gray uppercase">No. Faktur:</span>
                  <p className="font-bold text-ink-black text-[14px]">{receipt.invoiceId}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-gray uppercase">Status:</span>
                  <span className="bg-[#ecfdf5] text-[#059669] px-2 py-0.5 border border-[#a7f3d0] font-bold block mt-0.5">
                    LUNAS (PAID)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-gray">
                <div>
                  <span className="text-[11px] uppercase block">Akun Pengguna:</span>
                  <span className="text-ink-black font-medium">{receipt.userEmail}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase block">Metode Pembayaran:</span>
                  <span className="text-ink-black font-medium">{receipt.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase block">Total Pembayaran:</span>
                  <span className="text-sienna-brown font-bold text-[14px]">
                    Rp {receipt.amountPaid.toLocaleString("id-ID")}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] uppercase block">Masa Berlaku Hingga:</span>
                  <span className="text-ink-black font-medium">
                    {new Date(receipt.expiresAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  closeCheckoutModal();
                  router.push("/dashboard");
                }}
                className="w-full sm:w-auto px-6 py-3 bg-sienna-brown hover:bg-sienna-brown/90 text-paper-white font-medium text-[13.5px] inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Buka Workspace Dasbor Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Kuitansi ${receipt.invoiceId} berhasil diunduh (Simulasi PDF).`);
                }}
                className="w-full sm:w-auto px-4 py-3 bg-paper-white border border-slate-gray/30 hover:border-ink-black text-ink-black text-[13px] inline-flex items-center justify-center gap-2 font-mono transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-gray" />
                <span>Unduh Kuitansi PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
