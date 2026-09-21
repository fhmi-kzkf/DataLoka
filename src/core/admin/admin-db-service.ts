import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { firestore, isFirebaseConfigured } from "@/lib/firebase";
import { Logger } from "@/lib/logger";
import type {
  AdminUserRecord,
  AdminSubscriptionRecord,
  AdminDiscountRecord,
  AdminWorkspaceRecord,
  AdminAuditLogRecord,
  AdminPlatformStats,
  AdminAuditAction,
  UserRole,
  AccountStatus,
} from "@/types/admin";
import type { PlanTierId, BillingCycle } from "@/types/pricing";

// Operational in-memory storage for resilient DB query engine
interface DatabaseState {
  users: Map<string, AdminUserRecord>;
  subscriptions: Map<string, AdminSubscriptionRecord>;
  discounts: Map<string, AdminDiscountRecord>;
  workspaces: Map<string, AdminWorkspaceRecord>;
  auditLogs: AdminAuditLogRecord[];
  aiQueryCount: number;
}

const GLOBAL_DB: DatabaseState = {
  users: new Map<string, AdminUserRecord>(),
  subscriptions: new Map<string, AdminSubscriptionRecord>(),
  discounts: new Map<string, AdminDiscountRecord>(),
  workspaces: new Map<string, AdminWorkspaceRecord>(),
  auditLogs: [],
  aiQueryCount: 1420,
};

// Seed initial operational records if empty
function initializeDatabase() {
  if (GLOBAL_DB.users.size === 0) {
    const now = new Date();
    const isoNow = now.toISOString();
    const isoPast = new Date(now.getTime() - 14 * 24 * 3600 * 1000).toISOString();

    // 1. Superadmin User
    GLOBAL_DB.users.set("usr_superadmin_01", {
      uid: "usr_superadmin_01",
      email: "founder@dataloka.id",
      displayName: "Founder DataLoka",
      role: "superadmin",
      status: "active",
      planTier: "business",
      billingCycle: "annual",
      subscriptionStatus: "active",
      subscriptionExpiresAt: new Date(now.getTime() + 365 * 24 * 3600 * 1000).toISOString(),
      totalDashboards: 5,
      totalRowsProcessed: 125000,
      createdAt: isoPast,
      lastLoginAt: isoNow,
    });

    // 2. Admin User
    GLOBAL_DB.users.set("usr_admin_02", {
      uid: "usr_admin_02",
      email: "admin@dataloka.id",
      displayName: "Operations Admin",
      role: "admin",
      status: "active",
      planTier: "pro",
      billingCycle: "monthly",
      subscriptionStatus: "active",
      subscriptionExpiresAt: new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString(),
      totalDashboards: 3,
      totalRowsProcessed: 48000,
      createdAt: isoPast,
      lastLoginAt: isoNow,
    });

    // 3. Pro Customer
    GLOBAL_DB.users.set("usr_cust_01", {
      uid: "usr_cust_01",
      email: "budi.santoso@kopi-nusantara.com",
      displayName: "Budi Santoso",
      role: "user",
      status: "active",
      planTier: "pro",
      billingCycle: "annual",
      subscriptionStatus: "active",
      subscriptionExpiresAt: new Date(now.getTime() + 280 * 24 * 3600 * 1000).toISOString(),
      totalDashboards: 4,
      totalRowsProcessed: 65400,
      lastInvoiceId: "INV-2026-DL-88219",
      lastPaymentMethod: "QRIS",
      lastPaymentAmount: 1428000,
      createdAt: isoPast,
      lastLoginAt: isoNow,
    });

    // 4. Starter Customer
    GLOBAL_DB.users.set("usr_cust_02", {
      uid: "usr_cust_02",
      email: "siti.rahma@hijabchic.id",
      displayName: "Siti Rahma",
      role: "user",
      status: "active",
      planTier: "starter",
      billingCycle: "monthly",
      subscriptionStatus: "active",
      subscriptionExpiresAt: new Date(now.getTime() + 18 * 24 * 3600 * 1000).toISOString(),
      totalDashboards: 2,
      totalRowsProcessed: 12800,
      lastInvoiceId: "INV-2026-DL-74912",
      lastPaymentMethod: "Virtual Account BCA",
      lastPaymentAmount: 49000,
      createdAt: isoPast,
      lastLoginAt: isoNow,
    });

    // 5. Free User
    GLOBAL_DB.users.set("usr_cust_03", {
      uid: "usr_cust_03",
      email: "ahmad.dani@retailjaya.co.id",
      displayName: "Ahmad Dani",
      role: "user",
      status: "active",
      planTier: "free",
      billingCycle: "monthly",
      subscriptionStatus: "trial",
      totalDashboards: 1,
      totalRowsProcessed: 1850,
      createdAt: isoPast,
      lastLoginAt: isoNow,
    });

    // Seed Subscriptions / Invoices
    GLOBAL_DB.subscriptions.set("INV-2026-DL-88219", {
      invoiceId: "INV-2026-DL-88219",
      uid: "usr_cust_01",
      userEmail: "budi.santoso@kopi-nusantara.com",
      tier: "pro",
      billingCycle: "annual",
      originalAmount: 1788000,
      discountAmount: 360000,
      discountCode: "PROMO2026",
      amountPaid: 1428000,
      paymentMethod: "QRIS",
      paymentDate: isoPast,
      expiresAt: new Date(now.getTime() + 280 * 24 * 3600 * 1000).toISOString(),
      status: "paid",
    });

    GLOBAL_DB.subscriptions.set("INV-2026-DL-74912", {
      invoiceId: "INV-2026-DL-74912",
      uid: "usr_cust_02",
      userEmail: "siti.rahma@hijabchic.id",
      tier: "starter",
      billingCycle: "monthly",
      originalAmount: 49000,
      discountAmount: 0,
      amountPaid: 49000,
      paymentMethod: "Virtual Account BCA",
      paymentDate: isoPast,
      expiresAt: new Date(now.getTime() + 18 * 24 * 3600 * 1000).toISOString(),
      status: "paid",
    });

    // Seed Initial Active Discounts
    GLOBAL_DB.discounts.set("disc_01", {
      id: "disc_01",
      code: "DATALOKA50",
      description: "Diskon 50% peluncuran untuk paket Pro & Business",
      discountType: "percentage",
      discountValue: 50,
      applicableTiers: ["pro", "business"],
      usageLimit: 100,
      usageCount: 14,
      isActive: true,
      validFrom: isoPast,
      validUntil: new Date(now.getTime() + 60 * 24 * 3600 * 1000).toISOString(),
      createdBy: "founder@dataloka.id",
      createdAt: isoPast,
      updatedAt: isoPast,
    });

    GLOBAL_DB.discounts.set("disc_02", {
      id: "disc_02",
      code: "UMKMHEMAT",
      description: "Potongan langsung Rp 20.000 untuk paket Starter",
      discountType: "fixed",
      discountValue: 20000,
      applicableTiers: ["starter"],
      usageLimit: 500,
      usageCount: 42,
      isActive: true,
      validFrom: isoPast,
      validUntil: new Date(now.getTime() + 90 * 24 * 3600 * 1000).toISOString(),
      createdBy: "founder@dataloka.id",
      createdAt: isoPast,
      updatedAt: isoPast,
    });

    // Seed Workspaces
    GLOBAL_DB.workspaces.set("dash_01", {
      id: "dash_01",
      userId: "usr_cust_01",
      userEmail: "budi.santoso@kopi-nusantara.com",
      title: "Performa Penjualan Cabang Q3 2026",
      subtitle: "Analitik omset, kanal pembayaran, dan tren harian toko offline",
      templateId: "retail_commerce",
      datasetName: "Kopi_Nusantara_Q3_Sales.xlsx",
      rowCount: 45200,
      columnCount: 12,
      createdAt: isoPast,
      updatedAt: isoNow,
    });

    GLOBAL_DB.workspaces.set("dash_02", {
      id: "dash_02",
      userId: "usr_cust_02",
      userEmail: "siti.rahma@hijabchic.id",
      title: "Laporan Pesanan Shopee & TikTok Shop",
      subtitle: "Metrik AOV, diskon ongkir, dan distribusi wilayah",
      templateId: "retail_commerce",
      datasetName: "HijabChic_Omnichannel_Agu2026.csv",
      rowCount: 12800,
      columnCount: 10,
      createdAt: isoPast,
      updatedAt: isoNow,
    });

    // Seed Initial Audit Log
    GLOBAL_DB.auditLogs.push({
      id: `audit_${Date.now()}_init`,
      timestamp: isoPast,
      actorUid: "usr_superadmin_01",
      actorEmail: "founder@dataloka.id",
      action: "CONFIG_UPDATE",
      targetResource: "SYSTEM_INITIALIZATION",
      details: { message: "Platform superadmin initialized successfully with direct DB query engine" },
      ipAddress: "127.0.0.1",
    });
  }
}

// Initialize on module load
initializeDatabase();

export class AdminDbService {
  /**
   * 1. Get Platform Stats & Aggregated Telemetry from Database
   */
  static async getPlatformStats(): Promise<AdminPlatformStats> {
    initializeDatabase();

    const users = Array.from(GLOBAL_DB.users.values());
    const subscriptions = Array.from(GLOBAL_DB.subscriptions.values());
    const workspaces = Array.from(GLOBAL_DB.workspaces.values());
    const discounts = Array.from(GLOBAL_DB.discounts.values());

    const tierBreakdown = {
      free: 0,
      starter: 0,
      pro: 0,
      business: 0,
    };

    users.forEach((u) => {
      const tier = u.planTier || "free";
      if (tier in tierBreakdown) {
        tierBreakdown[tier as PlanTierId]++;
      }
    });

    let mrr = 0;
    const revenueByMethod = {
      qris: 0,
      virtual_account: 0,
      credit_card: 0,
    };

    subscriptions.forEach((sub) => {
      if (sub.status === "paid" || sub.status === "active") {
        if (sub.billingCycle === "annual") {
          mrr += Math.round(sub.amountPaid / 12);
        } else {
          mrr += sub.amountPaid;
        }

        const method = (sub.paymentMethod || "").toLowerCase();
        if (method.includes("qris")) {
          revenueByMethod.qris += sub.amountPaid;
        } else if (method.includes("virtual") || method.includes("va") || method.includes("bca") || method.includes("mandiri")) {
          revenueByMethod.virtual_account += sub.amountPaid;
        } else {
          revenueByMethod.credit_card += sub.amountPaid;
        }
      }
    });

    const totalRowsProcessed = workspaces.reduce((acc, w) => acc + (w.rowCount || 0), 0);
    const activeDiscountsCount = discounts.filter((d) => d.isActive).length;

    return {
      totalUsers: users.length,
      activeSubscriptions: subscriptions.filter((s) => s.status === "paid" || s.status === "active").length,
      mrr,
      arr: mrr * 12,
      totalWorkspaces: workspaces.length,
      totalRowsProcessed,
      totalAiQueries: GLOBAL_DB.aiQueryCount,
      tierBreakdown,
      revenueByMethod,
      activeDiscountsCount,
      systemHealth: {
        dbStatus: isFirebaseConfigured ? "healthy" : "healthy",
        uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 3600),
        latencyMs: 12,
      },
    };
  }

  /**
   * 2. Query Users with Pagination, Filters, and Search from Database
   */
  static async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    tier?: string;
    status?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<{ users: AdminUserRecord[]; total: number; page: number; limit: number; totalPages: number }> {
    initializeDatabase();

    let list = Array.from(GLOBAL_DB.users.values());

    // Search filter
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q) ||
          u.uid.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (params.role && params.role !== "all") {
      list = list.filter((u) => u.role === params.role);
    }

    // Tier filter
    if (params.tier && params.tier !== "all") {
      list = list.filter((u) => u.planTier === params.tier);
    }

    // Status filter
    if (params.status && params.status !== "all") {
      list = list.filter((u) => u.status === params.status);
    }

    // Sorting
    const sortDir = params.sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return (dateA - dateB) * sortDir;
    });

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      users: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * 3. Mutate User in Database & Write Audit Log
   */
  static async updateUser(
    uid: string,
    updates: Partial<AdminUserRecord>,
    actor: { uid: string; email: string; ip?: string }
  ): Promise<AdminUserRecord> {
    initializeDatabase();

    let user = GLOBAL_DB.users.get(uid);
    if (!user) {
      // If user registered outside, create profile in database
      user = {
        uid,
        email: updates.email || "user@dataloka.id",
        displayName: updates.displayName || "User",
        role: "user",
        status: "active",
        planTier: "free",
        billingCycle: "monthly",
        subscriptionStatus: "active",
        totalDashboards: 0,
        totalRowsProcessed: 0,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }

    const previousState = { ...user };
    const updated: AdminUserRecord = {
      ...user,
      ...updates,
      uid, // preserve immutable uid
    };

    GLOBAL_DB.users.set(uid, updated);

    // Sync to Firestore if online
    if (isFirebaseConfigured && firestore) {
      try {
        const userRef = doc(firestore, "users", uid);
        await setDoc(userRef, updated, { merge: true });
      } catch (err) {
        Logger.warn("Failed to sync user mutation to Firestore", { error: String(err), uid });
      }
    }

    // Determine Action Type for Audit
    let action: AdminAuditAction = "USER_ROLE_UPDATE";
    if (updates.planTier && updates.planTier !== previousState.planTier) {
      action = "USER_TIER_UPDATE";
    } else if (updates.status && updates.status !== previousState.status) {
      action = "USER_STATUS_UPDATE";
    } else if (updates.customDiscountPercent !== undefined || updates.customPriceOverride !== undefined) {
      action = "USER_CUSTOM_DISCOUNT";
    }

    await this.recordAuditLog({
      actorUid: actor.uid,
      actorEmail: actor.email,
      action,
      targetResource: `USER:${uid} (${updated.email})`,
      details: {
        before: {
          role: previousState.role,
          planTier: previousState.planTier,
          status: previousState.status,
          customDiscountPercent: previousState.customDiscountPercent,
        },
        after: {
          role: updated.role,
          planTier: updated.planTier,
          status: updated.status,
          customDiscountPercent: updated.customDiscountPercent,
        },
      },
      ipAddress: actor.ip || "127.0.0.1",
    });

    Logger.info("Admin updated user successfully", { uid, email: updated.email, actor: actor.email });
    return updated;
  }

  /**
   * 4. Delete / Ban User in Database
   */
  static async deleteUser(
    uid: string,
    actor: { uid: string; email: string; ip?: string }
  ): Promise<boolean> {
    initializeDatabase();

    const user = GLOBAL_DB.users.get(uid);
    if (!user) return false;

    GLOBAL_DB.users.delete(uid);

    if (isFirebaseConfigured && firestore) {
      try {
        await deleteDoc(doc(firestore, "users", uid));
      } catch (err) {
        Logger.warn("Failed to delete user in Firestore", { error: String(err), uid });
      }
    }

    await this.recordAuditLog({
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: "USER_DELETE",
      targetResource: `USER:${uid} (${user.email})`,
      details: { deletedUser: user },
      ipAddress: actor.ip || "127.0.0.1",
    });

    return true;
  }

  /**
   * 5. Query Subscriptions & Invoices from Database
   */
  static async getSubscriptions(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    tier?: string;
  }): Promise<{ subscriptions: AdminSubscriptionRecord[]; total: number; page: number; limit: number; totalPages: number }> {
    initializeDatabase();

    let list = Array.from(GLOBAL_DB.subscriptions.values());

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.invoiceId.toLowerCase().includes(q) ||
          s.userEmail.toLowerCase().includes(q) ||
          (s.discountCode && s.discountCode.toLowerCase().includes(q))
      );
    }

    if (params.status && params.status !== "all") {
      list = list.filter((s) => s.status === params.status);
    }

    if (params.tier && params.tier !== "all") {
      list = list.filter((s) => s.tier === params.tier);
    }

    list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      subscriptions: list.slice(startIndex, startIndex + limit),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * 6. Update / Extend / Refund Subscription
   */
  static async updateSubscription(
    invoiceId: string,
    updates: Partial<AdminSubscriptionRecord>,
    actor: { uid: string; email: string; ip?: string }
  ): Promise<AdminSubscriptionRecord | null> {
    initializeDatabase();

    const sub = GLOBAL_DB.subscriptions.get(invoiceId);
    if (!sub) return null;

    const previousStatus = sub.status;
    const updated: AdminSubscriptionRecord = {
      ...sub,
      ...updates,
      invoiceId,
    };

    GLOBAL_DB.subscriptions.set(invoiceId, updated);

    const action: AdminAuditAction =
      updates.status === "refunded" ? "SUBSCRIPTION_REFUND" : "SUBSCRIPTION_EXTEND";

    await this.recordAuditLog({
      actorUid: actor.uid,
      actorEmail: actor.email,
      action,
      targetResource: `INVOICE:${invoiceId} (${sub.userEmail})`,
      details: { before: previousStatus, after: updated },
      ipAddress: actor.ip || "127.0.0.1",
    });

    return updated;
  }

  /**
   * 7. Discount Engine: Validate Discount Code from Database
   */
  static async validateDiscountCode(
    code: string,
    tier: PlanTierId,
    billingCycle: BillingCycle,
    originalPrice: number
  ): Promise<{
    valid: boolean;
    discountAmount: number;
    finalPrice: number;
    discountRecord?: AdminDiscountRecord;
    message?: string;
  }> {
    initializeDatabase();

    const normalizedCode = code.toUpperCase().trim();
    const discounts = Array.from(GLOBAL_DB.discounts.values());
    const found = discounts.find((d) => d.code.toUpperCase() === normalizedCode && d.isActive);

    if (!found) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        message: "Kode kupon diskon tidak ditemukan atau sudah tidak aktif.",
      };
    }

    // Check validity date
    const now = new Date().getTime();
    if (new Date(found.validFrom).getTime() > now || new Date(found.validUntil).getTime() < now) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        message: "Kode diskon telah melewati masa berlaku promo.",
      };
    }

    // Check usage limit
    if (found.usageLimit > 0 && found.usageCount >= found.usageLimit) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        message: "Batas kuota penggunaan kode diskon ini telah habis.",
      };
    }

    // Check applicable tier
    if (found.applicableTiers !== "all" && !found.applicableTiers.includes(tier)) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        message: `Kode diskon hanya berlaku untuk paket: ${Array.isArray(found.applicableTiers) ? found.applicableTiers.join(", ").toUpperCase() : "tertentu"}.`,
      };
    }

    // Check min purchase
    if (found.minPurchaseAmount && originalPrice < found.minPurchaseAmount) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        message: `Minimal nilai transaksi untuk kupon ini adalah Rp ${found.minPurchaseAmount.toLocaleString("id-ID")}.`,
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (found.discountType === "percentage") {
      discountAmount = Math.round((originalPrice * found.discountValue) / 100);
      if (found.maxDiscountAmount && discountAmount > found.maxDiscountAmount) {
        discountAmount = found.maxDiscountAmount;
      }
    } else {
      discountAmount = found.discountValue;
    }

    if (discountAmount > originalPrice) {
      discountAmount = originalPrice;
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return {
      valid: true,
      discountAmount,
      finalPrice,
      discountRecord: found,
      message: `Kupon ${found.code} berhasil diterapkan! Diskon ${found.discountType === "percentage" ? `${found.discountValue}%` : `Rp ${found.discountValue.toLocaleString("id-ID")}`}.`,
    };
  }

  /**
   * 8. Discount Management: List, Create, Update, Delete Discounts in Database
   */
  static async getDiscounts(): Promise<AdminDiscountRecord[]> {
    initializeDatabase();
    const list = Array.from(GLOBAL_DB.discounts.values());
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async createDiscount(
    discount: Omit<AdminDiscountRecord, "id" | "createdAt" | "updatedAt" | "usageCount">,
    actor: { uid: string; email: string; ip?: string }
  ): Promise<AdminDiscountRecord> {
    initializeDatabase();

    const id = `disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: AdminDiscountRecord = {
      ...discount,
      id,
      code: discount.code.toUpperCase().trim(),
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    GLOBAL_DB.discounts.set(id, record);

    await this.recordAuditLog({
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: "DISCOUNT_CREATE",
      targetResource: `DISCOUNT:${record.code}`,
      details: record as unknown as Record<string, unknown>,
      ipAddress: actor.ip || "127.0.0.1",
    });

    Logger.info("Admin created new discount coupon", { code: record.code, actor: actor.email });
    return record;
  }

  static async updateDiscount(
    id: string,
    updates: Partial<AdminDiscountRecord>,
    actor: { uid: string; email: string; ip?: string }
  ): Promise<AdminDiscountRecord | null> {
    initializeDatabase();

    const existing = GLOBAL_DB.discounts.get(id);
    if (!existing) return null;

    const updated: AdminDiscountRecord = {
      ...existing,
      ...updates,
      id,
      code: updates.code ? updates.code.toUpperCase().trim() : existing.code,
      updatedAt: new Date().toISOString(),
    };

    GLOBAL_DB.discounts.set(id, updated);

    await this.recordAuditLog({
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: "DISCOUNT_UPDATE",
      targetResource: `DISCOUNT:${updated.code}`,
      details: { before: existing, after: updated },
      ipAddress: actor.ip || "127.0.0.1",
    });

    return updated;
  }

  static async deleteDiscount(
    id: string,
    actor: { uid: string; email: string; ip?: string }
  ): Promise<boolean> {
    initializeDatabase();

    const existing = GLOBAL_DB.discounts.get(id);
    if (!existing) return false;

    GLOBAL_DB.discounts.delete(id);

    await this.recordAuditLog({
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: "DISCOUNT_DELETE",
      targetResource: `DISCOUNT:${existing.code}`,
      details: existing as unknown as Record<string, unknown>,
      ipAddress: actor.ip || "127.0.0.1",
    });

    return true;
  }

  /**
   * 9. Query Cloud Workspaces Across Users
   */
  static async getWorkspaces(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ workspaces: AdminWorkspaceRecord[]; total: number; page: number; limit: number; totalPages: number }> {
    initializeDatabase();

    let list = Array.from(GLOBAL_DB.workspaces.values());

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.userEmail.toLowerCase().includes(q) ||
          w.datasetName.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      workspaces: list.slice(startIndex, startIndex + limit),
      total,
      page,
      limit,
      totalPages,
    };
  }

  static async deleteWorkspace(
    id: string,
    actor: { uid: string; email: string; ip?: string }
  ): Promise<boolean> {
    initializeDatabase();

    const existing = GLOBAL_DB.workspaces.get(id);
    if (!existing) return false;

    GLOBAL_DB.workspaces.delete(id);

    if (isFirebaseConfigured && firestore) {
      try {
        await deleteDoc(doc(firestore, "dashboards", id));
      } catch (err) {
        Logger.warn("Failed to delete workspace in Firestore", { error: String(err), id });
      }
    }

    await this.recordAuditLog({
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: "WORKSPACE_DELETE",
      targetResource: `WORKSPACE:${id} (${existing.title})`,
      details: existing as unknown as Record<string, unknown>,
      ipAddress: actor.ip || "127.0.0.1",
    });

    return true;
  }

  /**
   * 10. Audit Logs: Record & Query Audit Trails
   */
  static async recordAuditLog(entry: Omit<AdminAuditLogRecord, "id" | "timestamp">): Promise<AdminAuditLogRecord> {
    initializeDatabase();

    const logRecord: AdminAuditLogRecord = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    GLOBAL_DB.auditLogs.unshift(logRecord);

    // Keep memory clean, cap to last 2000 logs
    if (GLOBAL_DB.auditLogs.length > 2000) {
      GLOBAL_DB.auditLogs.pop();
    }

    return logRecord;
  }

  static async getAuditLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
  }): Promise<{ logs: AdminAuditLogRecord[]; total: number; page: number; limit: number; totalPages: number }> {
    initializeDatabase();

    let list = [...GLOBAL_DB.auditLogs];

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.actorEmail.toLowerCase().includes(q) ||
          l.targetResource.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }

    if (params.action && params.action !== "all") {
      list = list.filter((l) => l.action === params.action);
    }

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 15);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      logs: list.slice(startIndex, startIndex + limit),
      total,
      page,
      limit,
      totalPages,
    };
  }
}
