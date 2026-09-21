"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import {
  ShieldCheck,
  Activity,
  Users,
  CreditCard,
  Tag,
  Folder,
  FileText,
  ArrowUpRight,
  Database,
} from "lucide-react";

export type AdminTab = "overview" | "users" | "subscriptions" | "discounts" | "workspaces" | "audit";

interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  statsRefreshTrigger?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onTabChange,
  statsRefreshTrigger,
}) => {
  const { user } = useAuthStore();

  const navItems: Array<{ id: AdminTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: "overview", label: "Ikhtisar Platform", icon: Activity },
    { id: "users", label: "Pengguna & Akun", icon: Users },
    { id: "subscriptions", label: "Layanan & Tagihan", icon: CreditCard },
    { id: "discounts", label: "Kupon Diskon", icon: Tag },
    { id: "workspaces", label: "Cloud Workspaces", icon: Folder },
    { id: "audit", label: "Log Audit Keamanan", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper-white/95 backdrop-blur-md border-b border-slate-gray/20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Control Bar */}
        <div className="h-16 flex items-center justify-between gap-4 border-b border-slate-gray/10">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-ink-black font-signifier text-[20px] tracking-tight hover:opacity-80 transition"
            >
              <span className="font-bold">DataLoka</span>
              <span className="text-[12px] font-mono uppercase bg-ink-black text-paper-white px-2 py-0.5 font-normal tracking-wider">
                Superadmin
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-gray/20 text-[11.5px] font-mono text-slate-gray">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Database Engine: Active</span>
            </div>
          </div>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[12px] font-mono px-3 py-1.5 bg-mist-gray border border-slate-gray/20 text-ink-black">
              <ShieldCheck className="w-3.5 h-3.5 text-sienna-brown" />
              <span>{user?.email || "founder@dataloka.id"}</span>
              <span className="text-sienna-brown font-bold uppercase text-[10px]">
                [{user?.role || "superadmin"}]
              </span>
            </div>

            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-[12px] font-mono border border-slate-gray/30 hover:border-ink-black text-ink-black transition flex items-center gap-1.5"
            >
              <span>Dasbor User</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-gray" />
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium transition cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? "bg-ink-black text-paper-white border-ink-black shadow-2xs"
                    : "bg-transparent text-slate-gray hover:text-ink-black hover:bg-mist-gray/60 border-transparent hover:border-slate-gray/20"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-sienna-brown" : "text-slate-gray"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
