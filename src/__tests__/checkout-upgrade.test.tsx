import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CheckoutModal } from "@/components/pricing/checkout-modal";
import { PricingSection } from "@/components/pricing/pricing-section";
import { useAuthStore } from "@/stores/auth-store";
import { FirebaseAuthService } from "@/core/auth/firebase-auth-service";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Modul End-to-End Upgrade & Checkout Flow", () => {
  beforeEach(() => {
    mockPush.mockClear();
    localStorage.clear();
    useAuthStore.setState({
      user: {
        uid: "usr_test_upgrade_123",
        email: "founder@dataloka.id",
        displayName: "Founder DataLoka",
        photoURL: null,
        planTier: "free",
        createdAt: new Date().toISOString(),
      },
      isAuthenticated: true,
      planTier: "free",
      checkoutModalOpen: false,
      selectedUpgradeTier: "pro",
      selectedBillingCycle: "annual",
      lastReceipt: null,
    });
  });

  it("should open CheckoutModal from PricingSection when authenticated user clicks upgrade", () => {
    render(
      <>
        <PricingSection />
        <CheckoutModal />
      </>
    );

    // Click Upgrade ke Pro button
    const upgradeProBtn = screen.getByRole("button", { name: /Upgrade ke Pro/i });
    fireEvent.click(upgradeProBtn);

    expect(useAuthStore.getState().checkoutModalOpen).toBe(true);
    expect(screen.getByText("Konfirmasi & Pembayaran Layanan")).toBeInTheDocument();
    expect(screen.getByText("Rincian Tagihan:")).toBeInTheDocument();
  });

  it("should toggle between payment methods (QRIS, Virtual Account, Credit Card)", () => {
    useAuthStore.setState({
      checkoutModalOpen: true,
      selectedUpgradeTier: "pro",
      selectedBillingCycle: "annual",
    });

    render(<CheckoutModal />);

    // Default QRIS view
    expect(screen.getByText("QRIS Standar Bank Indonesia")).toBeInTheDocument();

    // Switch to BCA VA
    const bcaVaBtn = screen.getByText("BCA Virtual Account");
    fireEvent.click(bcaVaBtn);
    expect(screen.getByText("Nomor Virtual Account (Otomatis Terverifikasi):")).toBeInTheDocument();
    expect(screen.getByText("8270 8921 3400 9182")).toBeInTheDocument();

    // Switch to Credit Card
    const cardBtn = screen.getByText("Kartu Kredit / Debit");
    fireEvent.click(cardBtn);
    expect(screen.getByText("Nomor Kartu:")).toBeInTheDocument();
  });

  it("should switch between billing cycles and update order summary totals", () => {
    useAuthStore.setState({
      checkoutModalOpen: true,
      selectedUpgradeTier: "pro",
      selectedBillingCycle: "annual",
    });

    render(<CheckoutModal />);

    // In annual mode (149k - 20% = 119k * 12 = 1.428.000)
    expect(screen.getByText("Rp 1.428.000")).toBeInTheDocument();
    expect(screen.getByText(/Diskon Tahunan \(20%\):/)).toBeInTheDocument();

    // Switch to monthly
    const monthlyBtn = screen.getByRole("button", { name: "Bulanan" });
    fireEvent.click(monthlyBtn);

    // In monthly mode
    expect(screen.getAllByText("Rp 149.000").length).toBeGreaterThanOrEqual(1);
  });

  it("should execute upgrade end-to-end and display verified receipt with invoice", async () => {
    useAuthStore.setState({
      checkoutModalOpen: true,
      selectedUpgradeTier: "starter",
      selectedBillingCycle: "monthly",
    });

    render(<CheckoutModal />);

    const confirmBtn = screen.getByRole("button", { name: /Konfirmasi & Bayar Sekarang/i });
    fireEvent.click(confirmBtn);

    // Wait for payment completion
    await waitFor(
      () => {
        expect(screen.getByText("Pembayaran Berhasil Diverifikasi")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("Selamat! Paket STARTER Anda Sudah Aktif")).toBeInTheDocument();
    expect(screen.getByText("LUNAS (PAID)")).toBeInTheDocument();
    expect(screen.getByText("founder@dataloka.id")).toBeInTheDocument();

    // Store state must now reflect 'starter' tier
    expect(useAuthStore.getState().planTier).toBe("starter");
    expect(useAuthStore.getState().user?.planTier).toBe("starter");

    // Click proceed to dashboard
    const openWsBtn = screen.getByRole("button", { name: /Buka Workspace Dasbor Sekarang/i });
    fireEvent.click(openWsBtn);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(useAuthStore.getState().checkoutModalOpen).toBe(false);
  });

  it("FirebaseAuthService.updateUserPlan should persist plan upgrade to local cache", async () => {
    const res = await FirebaseAuthService.updateUserPlan(
      "usr_test_direct_888",
      "business",
      "annual",
      "BCA VA"
    );

    expect(res.tier).toBe("business");
    expect(res.billingCycle).toBe("annual");
    expect(res.amountPaid).toBe(4788000);
    expect(res.invoiceId).toMatch(/^INV-\d{4}-DL-\d{5}$/);
    expect(res.status).toBe("paid");

    const cached = FirebaseAuthService.getLocalUser();
    expect(cached?.planTier).toBe("business");
    expect(cached?.subscriptionStatus).toBe("active");
  });
});
