import { create } from "zustand";
import {
  FirebaseAuthService,
  type AppUser,
  type UpgradeReceipt,
} from "@/core/auth/firebase-auth-service";
import type { PlanTierId, BillingCycle } from "@/types/pricing";

export type AuthModalTab = "login" | "register" | "forgot";

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  planTier: PlanTierId;
  authModalOpen: boolean;
  authModalTab: AuthModalTab;
  savedWorkspacesModalOpen: boolean;

  // Checkout & Upgrade State
  checkoutModalOpen: boolean;
  selectedUpgradeTier: PlanTierId;
  selectedBillingCycle: BillingCycle;
  lastReceipt: UpgradeReceipt | null;

  // Actions
  setAuthModalOpen: (open: boolean) => void;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  setSavedWorkspacesModalOpen: (open: boolean) => void;
  setUser: (user: AppUser | null) => void;
  setPlanTier: (tier: PlanTierId) => void;
  initializeAuth: () => () => void;

  // Checkout Actions
  openCheckoutModal: (tier?: PlanTierId, cycle?: BillingCycle) => void;
  closeCheckoutModal: () => void;
  executeUpgrade: (
    tier: PlanTierId,
    cycle: BillingCycle,
    paymentMethod?: string
  ) => Promise<UpgradeReceipt>;

  // Async Operations
  loginWithEmail: (email: string, pass: string) => Promise<AppUser>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<AppUser>;
  loginWithGoogle: () => Promise<AppUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  planTier: "free",
  authModalOpen: false,
  authModalTab: "login",
  savedWorkspacesModalOpen: false,

  // Checkout defaults
  checkoutModalOpen: false,
  selectedUpgradeTier: "pro",
  selectedBillingCycle: "annual",
  lastReceipt: null,

  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  openAuthModal: (tab = "login") => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),
  setSavedWorkspacesModalOpen: (open) => set({ savedWorkspacesModalOpen: open }),

  openCheckoutModal: (tier = "pro", cycle = "annual") =>
    set({
      checkoutModalOpen: true,
      selectedUpgradeTier: tier,
      selectedBillingCycle: cycle,
    }),

  closeCheckoutModal: () => set({ checkoutModalOpen: false }),

  executeUpgrade: async (tier, cycle, paymentMethod = "QRIS") => {
    const currentUser = get().user;
    const uid = currentUser?.uid || `usr_${Math.random().toString(36).substring(2, 9)}`;
    const userEmail = currentUser?.email || "user@dataloka.id";

    set({ isLoading: true });
    try {
      const receipt = await FirebaseAuthService.updateUserPlan(
        uid,
        tier,
        cycle,
        paymentMethod,
        userEmail
      );
      const updatedUser: AppUser = {
        ...(currentUser || {
          uid,
          email: receipt.userEmail,
          displayName: receipt.userEmail.split("@")[0],
          photoURL: null,
          createdAt: new Date().toISOString(),
        }),
        planTier: tier,
        billingCycle: cycle,
        subscriptionStatus: "active",
        subscriptionExpiresAt: receipt.expiresAt,
      };

      set({
        user: updatedUser,
        planTier: tier,
        lastReceipt: receipt,
        isLoading: false,
        isAuthenticated: true,
      });

      return receipt;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      planTier: user?.planTier || "free",
      isLoading: false,
    }),

  setPlanTier: (planTier) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, planTier };
      set({ user: updated, planTier });
    } else {
      set({ planTier });
    }
  },

  initializeAuth: () => {
    // Check initial local user cache first for instant hydration
    const cachedUser = FirebaseAuthService.getLocalUser();
    if (cachedUser) {
      set({
        user: cachedUser,
        isAuthenticated: true,
        planTier: cachedUser.planTier || "free",
        isLoading: false,
      });
    }

    // Subscribe to Firebase auth listener
    const unsubscribe = FirebaseAuthService.onAuthChange((user) => {
      set({
        user,
        isAuthenticated: Boolean(user),
        planTier: user?.planTier || "free",
        isLoading: false,
      });
    });

    return unsubscribe;
  },

  loginWithEmail: async (email, pass) => {
    set({ isLoading: true });
    try {
      const user = await FirebaseAuthService.signInWithEmail(email, pass);
      set({
        user,
        isAuthenticated: true,
        planTier: user.planTier || "free",
        isLoading: false,
        authModalOpen: false,
      });
      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  registerWithEmail: async (email, pass, name) => {
    set({ isLoading: true });
    try {
      const user = await FirebaseAuthService.signUpWithEmail(email, pass, name);
      set({
        user,
        isAuthenticated: true,
        planTier: user.planTier || "free",
        isLoading: false,
        authModalOpen: false,
      });
      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const user = await FirebaseAuthService.signInWithGoogle();
      set({
        user,
        isAuthenticated: true,
        planTier: user.planTier || "pro",
        isLoading: false,
        authModalOpen: false,
      });
      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await FirebaseAuthService.signOutUser();
      set({
        user: null,
        isAuthenticated: false,
        planTier: "free",
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  resetPassword: async (email) => {
    await FirebaseAuthService.sendPasswordReset(email);
  },
}));
