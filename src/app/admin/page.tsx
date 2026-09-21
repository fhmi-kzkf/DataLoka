"use client";

import React, { useState } from "react";
import { AdminAccessGuard } from "@/components/admin/admin-access-guard";
import { AdminHeader, type AdminTab } from "@/components/admin/admin-header";
import { AdminStatsOverview } from "@/components/admin/admin-stats-overview";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { AdminSubscriptionsTable } from "@/components/admin/admin-subscriptions-table";
import { AdminDiscountsManager } from "@/components/admin/admin-discounts-manager";
import { AdminWorkspacesTable } from "@/components/admin/admin-workspaces-table";
import { AdminAuditLogsTable } from "@/components/admin/admin-audit-logs-table";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <AdminAccessGuard>
      <div className="min-h-screen bg-fog-white flex flex-col">
        {/* Top Header with Navigation */}
        <AdminHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === "overview" && <AdminStatsOverview />}
          {activeTab === "users" && <AdminUsersTable />}
          {activeTab === "subscriptions" && <AdminSubscriptionsTable />}
          {activeTab === "discounts" && <AdminDiscountsManager />}
          {activeTab === "workspaces" && <AdminWorkspacesTable />}
          {activeTab === "audit" && <AdminAuditLogsTable />}
        </main>
      </div>
    </AdminAccessGuard>
  );
}
