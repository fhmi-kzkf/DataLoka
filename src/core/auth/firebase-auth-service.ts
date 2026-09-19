import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, firestore, isFirebaseConfigured } from "@/lib/firebase";
import { Logger } from "@/lib/logger";
import type { PlanTierId, BillingCycle } from "@/types/pricing";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  planTier: PlanTierId;
  subscriptionStatus?: "active" | "trial" | "expired";
  billingCycle?: BillingCycle;
  subscriptionExpiresAt?: string;
  isAnonymous?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UpgradeReceipt {
  invoiceId: string;
  uid: string;
  userEmail: string;
  tier: PlanTierId;
  billingCycle: BillingCycle;
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string;
  expiresAt: string;
  status: "paid" | "active";
}

const LOCAL_USER_STORAGE_KEY = "dataloka_auth_user";

export class FirebaseAuthService {
  /**
   * Register with Email and Password
   */
  static async signUpWithEmail(
    email: string,
    pass: string,
    displayName?: string
  ): Promise<AppUser> {
    if (!isFirebaseConfigured || !auth) {
      Logger.info("Executing simulated local email registration", { email });
      const localUser: AppUser = {
        uid: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email,
        displayName: displayName || email.split("@")[0],
        photoURL: null,
        planTier: "free",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      this.saveLocalUser(localUser);
      return localUser;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && cred.user) {
        await updateProfile(cred.user, { displayName });
      }
      const appUser = this.mapFirebaseUser(cred.user);
      await this.syncUserToFirestore(appUser);
      return appUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mendaftar akun baru";
      Logger.warn("Firebase sign up failed", { error: msg, email });
      throw new Error(this.formatAuthErrorMessage(msg));
    }
  }

  /**
   * Sign In with Email and Password
   */
  static async signInWithEmail(email: string, pass: string): Promise<AppUser> {
    if (!isFirebaseConfigured || !auth) {
      Logger.info("Executing simulated local email sign-in", { email });
      const saved = this.getLocalUser();
      if (saved && saved.email === email) {
        saved.lastLoginAt = new Date().toISOString();
        this.saveLocalUser(saved);
        return saved;
      }
      const localUser: AppUser = {
        uid: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email,
        displayName: email.split("@")[0],
        photoURL: null,
        planTier: "free",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      this.saveLocalUser(localUser);
      return localUser;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const appUser = this.mapFirebaseUser(cred.user);
      await this.syncUserToFirestore(appUser);
      return appUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal masuk";
      Logger.warn("Firebase sign in failed", { error: msg, email });
      throw new Error(this.formatAuthErrorMessage(msg));
    }
  }

  /**
   * Sign In with Google OAuth Popup
   */
  static async signInWithGoogle(): Promise<AppUser> {
    if (!isFirebaseConfigured || !auth) {
      Logger.info("Executing simulated Google sign-in");
      const localUser: AppUser = {
        uid: `usr_google_${Math.random().toString(36).substring(2, 9)}`,
        email: "user.demo@dataloka.id",
        displayName: "Pengguna DataLoka",
        photoURL: null,
        planTier: "pro",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      this.saveLocalUser(localUser);
      return localUser;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      const cred = await signInWithPopup(auth, provider);
      const appUser = this.mapFirebaseUser(cred.user);
      await this.syncUserToFirestore(appUser);
      return appUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal masuk via Google";
      Logger.warn("Firebase Google popup sign in failed", { error: msg });
      throw new Error(this.formatAuthErrorMessage(msg));
    }
  }

  /**
   * Sign Out
   */
  static async signOutUser(): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      this.clearLocalUser();
      return;
    }

    try {
      await signOut(auth);
      this.clearLocalUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal keluar sesi";
      Logger.warn("Firebase signOut failed", { error: msg });
      throw new Error(msg);
    }
  }

  /**
   * Send Password Reset Email directly to User Email
   */
  static async sendPasswordReset(email: string): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      Logger.info("Simulated password reset email sent directly to email address", { email });
      return;
    }

    try {
      const actionCodeSettings = {
        url:
          typeof window !== "undefined"
            ? `${window.location.origin}/?auth=login`
            : "http://localhost:3000/?auth=login",
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      Logger.info("Password reset email dispatched via Firebase Auth", { email });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim email reset";
      Logger.warn("Password reset failed", { error: msg, email });
      throw new Error(this.formatAuthErrorMessage(msg));
    }
  }

  /**
   * Listen to Auth State Changes & Sync User
   */
  static onAuthChange(callback: (user: AppUser | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      const localUser = this.getLocalUser();
      callback(localUser);
      return () => {};
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = this.mapFirebaseUser(firebaseUser);
        this.saveLocalUser(appUser);
        callback(appUser);
        // Background firestore sync
        this.syncUserToFirestore(appUser).catch(() => {});
      } else {
        this.clearLocalUser();
        callback(null);
      }
    });
  }

  /**
   * Upsert user account document into Firestore 'users' collection
   */
  static async syncUserToFirestore(user: AppUser): Promise<void> {
    if (!isFirebaseConfigured || !firestore) return;

    try {
      const userRef = doc(firestore, "users", user.uid);
      const snap = await getDoc(userRef);
      const existing = snap.exists() ? snap.data() : null;

      const payload = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        planTier: existing?.planTier || user.planTier || "free",
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: existing?.createdAt || user.createdAt || new Date().toISOString(),
        provider: user.isAnonymous ? "anonymous" : "firebase_auth",
      };

      await setDoc(userRef, payload, { merge: true });
      Logger.info("User account profile synced to Firestore", { uid: user.uid, email: user.email });
    } catch (err: unknown) {
      Logger.warn("Failed to sync user to Firestore", { error: String(err), uid: user.uid });
    }
  }

  /**
   * Update User Subscription Plan (Upgrade End-to-End)
   */
  static async updateUserPlan(
    uid: string,
    tier: PlanTierId,
    billingCycle: BillingCycle,
    paymentMethod: string = "QRIS",
    userEmailParam?: string
  ): Promise<UpgradeReceipt> {
    const expiresDate = new Date();
    if (billingCycle === "annual") {
      expiresDate.setFullYear(expiresDate.getFullYear() + 1);
    } else {
      expiresDate.setDate(expiresDate.getDate() + 30);
    }

    const priceMap: Record<PlanTierId, { monthly: number; annual: number }> = {
      free: { monthly: 0, annual: 0 },
      starter: { monthly: 49000, annual: 468000 },
      pro: { monthly: 149000, annual: 1428000 },
      business: { monthly: 499000, annual: 4788000 },
    };

    const amountPaid = priceMap[tier][billingCycle];
    const invoiceId = `INV-${new Date().getFullYear()}-DL-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowIso = new Date().toISOString();
    const expiresIso = expiresDate.toISOString();

    // 1. Update local user cache
    const currentLocal = this.getLocalUser();
    const userEmail = userEmailParam || currentLocal?.email || "user@dataloka.id";
    const updatedUser: AppUser = {
      ...(currentLocal || {
        uid,
        email: userEmail,
        displayName: userEmail.split("@")[0],
        photoURL: null,
        createdAt: nowIso,
      }),
      uid,
      planTier: tier,
      billingCycle,
      subscriptionStatus: "active",
      subscriptionExpiresAt: expiresIso,
      lastLoginAt: nowIso,
    };
    this.saveLocalUser(updatedUser);

    // 2. Persist to Firestore if configured
    if (isFirebaseConfigured && firestore) {
      try {
        const userRef = doc(firestore, "users", uid);
        await setDoc(
          userRef,
          {
            planTier: tier,
            billingCycle,
            subscriptionStatus: "active",
            subscriptionExpiresAt: expiresIso,
            lastInvoiceId: invoiceId,
            lastPaymentMethod: paymentMethod,
            lastPaymentAmount: amountPaid,
            updatedAt: nowIso,
          },
          { merge: true }
        );
        Logger.info("User plan tier successfully upgraded in Firestore", { uid, tier, billingCycle, invoiceId });
      } catch (err) {
        Logger.warn("Failed to update plan in Firestore, relying on local state", { error: String(err), uid });
      }
    } else {
      Logger.info("Plan tier upgraded in resilient local storage mode", { uid, tier, billingCycle, invoiceId });
    }

    return {
      invoiceId,
      uid,
      userEmail,
      tier,
      billingCycle,
      amountPaid,
      paymentMethod,
      paymentDate: nowIso,
      expiresAt: expiresIso,
      status: "paid",
    };
  }

  /**
   * Helper to map Firebase user object to internal AppUser schema
   */
  private static mapFirebaseUser(user: FirebaseUser): AppUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split("@")[0] || "User",
      photoURL: user.photoURL,
      planTier: "free",
      isAnonymous: user.isAnonymous,
      createdAt: user.metadata?.creationTime || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  }

  /**
   * Local storage fallback helpers
   */
  private static saveLocalUser(user: AppUser): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore quota error
    }
  }

  static getLocalUser(): AppUser | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  }

  private static clearLocalUser(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  private static formatAuthErrorMessage(rawError: string): string {
    if (rawError.includes("auth/invalid-email")) return "Format alamat email tidak valid.";
    if (rawError.includes("auth/user-not-found")) return "Akun dengan email ini tidak terdaftar di sistem.";
    if (rawError.includes("auth/wrong-password") || rawError.includes("auth/invalid-credential")) {
      return "Kata sandi atau email yang dimasukkan salah.";
    }
    if (rawError.includes("auth/email-already-in-use")) {
      return "Alamat email ini sudah terdaftar. Silakan langsung masuk.";
    }
    if (rawError.includes("auth/weak-password")) {
      return "Kata sandi terlalu lemah (minimal 6 karakter).";
    }
    if (rawError.includes("auth/popup-closed-by-user")) {
      return "Jendela login Google ditutup sebelum proses selesai.";
    }
    if (rawError.includes("auth/too-many-requests")) {
      return "Terlalu banyak percobaan masuk gagal. Harap tunggu beberapa saat.";
    }
    return rawError;
  }
}
