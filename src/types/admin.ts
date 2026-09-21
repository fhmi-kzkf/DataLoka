import type { PlanTierId, BillingCycle } from "./pricing";
import type { TemplateId } from "./template";

export type UserRole = "user" | "admin" | "superadmin";
export type AccountStatus = "active" | "suspended" | "banned";

export type DiscountType = "percentage" | "fixed";

export interface AdminUserRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: UserRole;
  status: AccountStatus;
  planTier: PlanTierId;
  billingCycle: BillingCycle;
  subscriptionStatus: "active" | "trial" | "expired";
  subscriptionExpiresAt?: string;
  customDiscountPercent?: number; // Custom admin discount override
  customPriceOverride?: number;   // Custom fixed price override
  totalDashboards: number;
  totalRowsProcessed: number;
  lastInvoiceId?: string;
  lastPaymentMethod?: string;
  lastPaymentAmount?: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface AdminSubscriptionRecord {
  invoiceId: string;
  uid: string;
  userEmail: string;
  tier: PlanTierId;
  billingCycle: BillingCycle;
  originalAmount: number;
  discountAmount: number;
  discountCode?: string;
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string;
  expiresAt: string;
  status: "paid" | "active" | "expired" | "refunded";
  notes?: string;
}

export interface AdminDiscountRecord {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // e.g. 50 (for 50%) or 50000 (for Rp 50.000)
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  applicableTiers: PlanTierId[] | "all";
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminWorkspaceRecord {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  subtitle: string;
  templateId: TemplateId;
  datasetName: string;
  rowCount: number;
  columnCount: number;
  datasetHeaders?: string[];
  createdAt: string;
  updatedAt: string;
}

export type AdminAuditAction =
  | "USER_ROLE_UPDATE"
  | "USER_TIER_UPDATE"
  | "USER_STATUS_UPDATE"
  | "USER_CUSTOM_DISCOUNT"
  | "USER_DELETE"
  | "SUBSCRIPTION_EXTEND"
  | "SUBSCRIPTION_REFUND"
  | "DISCOUNT_CREATE"
  | "DISCOUNT_UPDATE"
  | "DISCOUNT_DELETE"
  | "WORKSPACE_DELETE"
  | "CONFIG_UPDATE";

export interface AdminAuditLogRecord {
  id: string;
  timestamp: string;
  actorUid: string;
  actorEmail: string;
  action: AdminAuditAction;
  targetResource: string;
  details: Record<string, unknown>;
  ipAddress: string;
}

export interface AdminPlatformStats {
  totalUsers: number;
  activeSubscriptions: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  totalWorkspaces: number;
  totalRowsProcessed: number;
  totalAiQueries: number;
  tierBreakdown: {
    free: number;
    starter: number;
    pro: number;
    business: number;
  };
  revenueByMethod: {
    qris: number;
    virtual_account: number;
    credit_card: number;
  };
  activeDiscountsCount: number;
  systemHealth: {
    dbStatus: "healthy" | "degraded" | "offline";
    uptimeSeconds: number;
    latencyMs: number;
  };
}
