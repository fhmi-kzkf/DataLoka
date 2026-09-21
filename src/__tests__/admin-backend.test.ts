import { describe, it, expect, beforeEach } from "vitest";
import { AdminDbService } from "@/core/admin/admin-db-service";
import { AdminGuard } from "@/core/admin/admin-guard";
import { NextRequest } from "next/server";
import { GET as getStats } from "@/app/api/admin/stats/route";
import { GET as getUsers } from "@/app/api/admin/users/route";
import { PATCH as patchUser, DELETE as deleteUser } from "@/app/api/admin/users/[id]/route";
import { GET as getSubscriptions } from "@/app/api/admin/subscriptions/route";
import { POST as validateDiscount } from "@/app/api/admin/discounts/validate/route";
import { GET as getDiscounts, POST as createDiscount } from "@/app/api/admin/discounts/route";
import { GET as getWorkspaces } from "@/app/api/admin/workspaces/route";
import { GET as getAuditLogs } from "@/app/api/admin/audit-logs/route";

describe("Superadmin Database Query Engine & Backend Architecture", () => {
  beforeEach(() => {
    // Reset/ready state
  });

  describe("1. Direct Database Query Service (AdminDbService)", () => {
    it("should compute platform stats directly from DB records with zero dummy data", async () => {
      const stats = await AdminDbService.getPlatformStats();
      expect(stats.totalUsers).toBeGreaterThanOrEqual(4);
      expect(stats.mrr).toBeGreaterThan(0);
      expect(stats.arr).toBe(stats.mrr * 12);
      expect(stats.totalWorkspaces).toBeGreaterThanOrEqual(2);
      expect(stats.tierBreakdown.pro).toBeGreaterThanOrEqual(1);
      expect(stats.systemHealth.dbStatus).toBe("healthy");
    });

    it("should query users with search, role, tier and pagination", async () => {
      const allUsers = await AdminDbService.getUsers({ page: 1, limit: 10 });
      expect(allUsers.users.length).toBeGreaterThanOrEqual(4);
      expect(allUsers.total).toBeGreaterThanOrEqual(4);

      // Search
      const searchRes = await AdminDbService.getUsers({ search: "budi.santoso" });
      expect(searchRes.users.length).toBe(1);
      expect(searchRes.users[0].email).toBe("budi.santoso@kopi-nusantara.com");

      // Filter by tier
      const proUsers = await AdminDbService.getUsers({ tier: "pro" });
      expect(proUsers.users.every((u) => u.planTier === "pro")).toBe(true);
    });

    it("should atomically mutate user role, tier, status and record audit trail", async () => {
      const updated = await AdminDbService.updateUser(
        "usr_cust_03",
        {
          planTier: "pro",
          role: "admin",
          status: "active",
          customDiscountPercent: 25,
        },
        { uid: "usr_superadmin_01", email: "founder@dataloka.id", ip: "192.168.1.1" }
      );

      expect(updated.planTier).toBe("pro");
      expect(updated.role).toBe("admin");
      expect(updated.customDiscountPercent).toBe(25);

      // Verify mutation is reflected in DB queries
      const verify = await AdminDbService.getUsers({ search: "usr_cust_03" });
      expect(verify.users[0].planTier).toBe("pro");
      expect(verify.users[0].role).toBe("admin");

      // Verify audit log record
      const logs = await AdminDbService.getAuditLogs({ limit: 5 });
      expect(logs.logs.some((l) => l.targetResource.includes("usr_cust_03"))).toBe(true);
    });

    it("should query and filter subscriptions and invoices", async () => {
      const res = await AdminDbService.getSubscriptions({ page: 1, limit: 10 });
      expect(res.subscriptions.length).toBeGreaterThanOrEqual(2);
      expect(res.subscriptions[0].amountPaid).toBeGreaterThan(0);
    });
  });

  describe("2. Discount & Promo Code Engine", () => {
    it("should validate percentage discount code correctly", async () => {
      const result = await AdminDbService.validateDiscountCode(
        "DATALOKA50",
        "pro",
        "annual",
        1428000
      );

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(714000); // 50% of 1428000
      expect(result.finalPrice).toBe(714000);
      expect(result.message).toContain("berhasil diterapkan");
    });

    it("should validate fixed amount discount code correctly", async () => {
      const result = await AdminDbService.validateDiscountCode(
        "UMKMHEMAT",
        "starter",
        "monthly",
        49000
      );

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(20000);
      expect(result.finalPrice).toBe(29000);
    });

    it("should reject discount coupon if plan tier does not match", async () => {
      const result = await AdminDbService.validateDiscountCode(
        "UMKMHEMAT",
        "business", // UMKMHEMAT only valid for starter
        "monthly",
        499000
      );

      expect(result.valid).toBe(false);
      expect(result.finalPrice).toBe(499000);
      expect(result.message).toContain("hanya berlaku untuk paket");
    });

    it("should create, list, and delete custom discounts dynamically in DB", async () => {
      const created = await AdminDbService.createDiscount(
        {
          code: "TESTFLASH80",
          description: "Flash sale test 80%",
          discountType: "percentage",
          discountValue: 80,
          applicableTiers: "all",
          usageLimit: 10,
          isActive: true,
          validFrom: new Date(Date.now() - 3600000).toISOString(),
          validUntil: new Date(Date.now() + 86400000).toISOString(),
          createdBy: "founder@dataloka.id",
        },
        { uid: "usr_superadmin_01", email: "founder@dataloka.id" }
      );

      expect(created.code).toBe("TESTFLASH80");

      const discounts = await AdminDbService.getDiscounts();
      expect(discounts.some((d) => d.code === "TESTFLASH80")).toBe(true);

      const deleted = await AdminDbService.deleteDiscount(created.id, {
        uid: "usr_superadmin_01",
        email: "founder@dataloka.id",
      });
      expect(deleted).toBe(true);
    });
  });

  describe("3. Admin API Route Handlers Integration", () => {
    it("should reject unauthenticated request to /api/admin/stats with 403", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/stats", {
        headers: {
          "x-user-email": "random_stranger@gmail.com",
          "x-user-role": "user",
        },
      });

      const res = await getStats(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN_ADMIN_REQUIRED");
    });

    it("should return live platform stats for authorized superadmin", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/stats", {
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });

      const res = await getStats(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.totalUsers).toBeGreaterThanOrEqual(4);
    });

    it("should execute GET /api/admin/users and query database records", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/users?page=1&limit=5", {
        headers: {
          "x-user-email": "admin@dataloka.id",
          "x-user-role": "admin",
        },
      });

      const res = await getUsers(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.users.length).toBeGreaterThan(0);
    });

    it("should execute POST /api/admin/discounts/validate at checkout", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/discounts/validate", {
        method: "POST",
        body: JSON.stringify({
          code: "DATALOKA50",
          tier: "pro",
          billingCycle: "annual",
          originalPrice: 1428000,
        }),
      });

      const res = await validateDiscount(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.valid).toBe(true);
      expect(json.data.discountAmount).toBe(714000);
    });

    it("should execute GET /api/admin/audit-logs and return security history", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/audit-logs", {
        headers: {
          "x-user-email": "founder@dataloka.id",
          "x-user-role": "superadmin",
        },
      });

      const res = await getAuditLogs(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.logs.length).toBeGreaterThan(0);
    });
  });
});
