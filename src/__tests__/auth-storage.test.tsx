import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FirebaseAuthService } from "@/core/auth/firebase-auth-service";
import { CloudWorkspaceService } from "@/core/storage/cloud-workspace-service";
import { useAuthStore } from "@/stores/auth-store";
import { AuthModal } from "@/components/auth/auth-modal";
import { SavedWorkspacesModal } from "@/components/auth/saved-workspaces-modal";
import type { DashboardState } from "@/types/template";

describe("Modul Firebase Auth & Cloud Workspace Storage", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      planTier: "free",
      authModalOpen: false,
      savedWorkspacesModalOpen: false,
    });
  });

  describe("1. FirebaseAuthService", () => {
    it("should register new user via simulated local fallback when Firebase is not configured", async () => {
      const user = await FirebaseAuthService.signUpWithEmail("test@example.com", "password123", "Budi Santoso");

      expect(user.email).toBe("test@example.com");
      expect(user.displayName).toBe("Budi Santoso");
      expect(user.planTier).toBe("free");

      const saved = FirebaseAuthService.getLocalUser();
      expect(saved?.email).toBe("test@example.com");
    });

    it("should sign in existing user via simulated local fallback", async () => {
      await FirebaseAuthService.signUpWithEmail("sarah@example.com", "password123", "Sarah Utami");
      const loggedIn = await FirebaseAuthService.signInWithEmail("sarah@example.com", "password123");

      expect(loggedIn.email).toBe("sarah@example.com");
      expect(loggedIn.displayName).toBe("Sarah Utami");
    });

    it("should support simulated Google OAuth login", async () => {
      const googleUser = await FirebaseAuthService.signInWithGoogle();

      expect(googleUser.email).toBe("user.demo@dataloka.id");
      expect(googleUser.planTier).toBe("pro");
    });

    it("should clear session on signOut", async () => {
      await FirebaseAuthService.signUpWithEmail("user@demo.com", "password123");
      expect(FirebaseAuthService.getLocalUser()).not.toBeNull();

      await FirebaseAuthService.signOutUser();
      expect(FirebaseAuthService.getLocalUser()).toBeNull();
    });
  });

  describe("2. CloudWorkspaceService", () => {
    const dummyDashboard: DashboardState = {
      title: "Dashboard Penjualan Q1",
      subtitle: "Laporan Omset Toko",
      templateId: "ecommerce",
      kpiCards: [],
      mainCharts: [],
    };

    it("should save dashboard to local cloud storage and retrieve it", async () => {
      const saved = await CloudWorkspaceService.saveDashboard(
        "user-123",
        dummyDashboard,
        "transaksi.xlsx",
        500,
        6
      );

      expect(saved.id).toBeDefined();
      expect(saved.title).toBe("Dashboard Penjualan Q1");
      expect(saved.rowCount).toBe(500);

      const list = await CloudWorkspaceService.listUserDashboards("user-123");
      expect(list.length).toBe(1);
      expect(list[0].title).toBe("Dashboard Penjualan Q1");

      const single = await CloudWorkspaceService.getDashboard(saved.id);
      expect(single?.datasetName).toBe("transaksi.xlsx");
    });

    it("should delete dashboard from cloud storage", async () => {
      const saved = await CloudWorkspaceService.saveDashboard("user-123", dummyDashboard);
      await CloudWorkspaceService.deleteDashboard(saved.id, "user-123");

      const list = await CloudWorkspaceService.listUserDashboards("user-123");
      expect(list.length).toBe(0);
    });
  });

  describe("3. useAuthStore & UI Components", () => {
    it("should open AuthModal and toggle tabs", () => {
      useAuthStore.getState().openAuthModal("login");

      render(<AuthModal />);

      expect(screen.getByText("Masuk ke DataLoka")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Daftar" })).toBeInTheDocument();

      // Switch to register tab
      fireEvent.click(screen.getByRole("button", { name: "Daftar" }));
      expect(screen.getByText("Buat Akun Baru")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Nama Anda atau Perusahaan")).toBeInTheDocument();
    });

    it("SavedWorkspacesModal should render saved dashboards list", async () => {
      const dummyDashboard: DashboardState = {
        title: "Executive Ledger 2026",
        subtitle: "Laporan Keuangan",
        templateId: "finance",
        kpiCards: [],
        mainCharts: [],
      };

      await CloudWorkspaceService.saveDashboard("user-abc", dummyDashboard, "keuangan.csv", 100, 4);

      useAuthStore.setState({
        user: {
          uid: "user-abc",
          email: "owner@company.com",
          displayName: "Owner",
          photoURL: null,
          planTier: "pro",
          createdAt: new Date().toISOString(),
        },
        savedWorkspacesModalOpen: true,
      });

      render(<SavedWorkspacesModal />);

      await waitFor(() => {
        expect(screen.getByText("Executive Ledger 2026")).toBeInTheDocument();
      });
      expect(screen.getByText(/keuangan\.csv/)).toBeInTheDocument();
    });

    it("should send password reset email without throwing", async () => {
      await expect(
        FirebaseAuthService.sendPasswordReset("user@example.com")
      ).resolves.not.toThrow();
    });


    it("should open Forgot Password tab and send reset email", async () => {
      useAuthStore.getState().openAuthModal("forgot");

      render(<AuthModal />);

      expect(screen.getByText("Lupa Kata Sandi")).toBeInTheDocument();
      expect(screen.getByText(/Masukkan email terdaftar Anda/)).toBeInTheDocument();

      const emailInput = screen.getByPlaceholderText("nama@perusahaan.com");
      fireEvent.change(emailInput, { target: { value: "forgot.user@dataloka.id" } });

      const submitBtn = screen.getByRole("button", { name: /Kirim Tautan Reset ke Email/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("Email Terkirim!")).toBeInTheDocument();
      });
      expect(screen.getByText(/forgot\.user@dataloka\.id/)).toBeInTheDocument();
    });
  });
});

