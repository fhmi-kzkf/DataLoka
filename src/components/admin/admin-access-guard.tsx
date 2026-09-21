"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { ShieldAlert, ShieldCheck, UserCheck, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

interface AdminAccessGuardProps {
  children: React.ReactNode;
}

export const AdminAccessGuard: React.FC<AdminAccessGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-fog-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-gray font-mono text-[13px]">
          <div className="w-4 h-4 border-2 border-sienna-brown border-t-transparent rounded-full animate-spin" />
          <span>Memverifikasi otorisasi Superadmin DataLoka...</span>
        </div>
      </div>
    );
  }

  const isSuperadmin =
    user?.role === "superadmin" ||
    user?.email === "founder@dataloka.id" ||
    user?.email === "admin@dataloka.id" ||
    process.env.NODE_ENV === "development"; // Allow seamless access in dev mode with one-click switcher

  if (!isAuthenticated || !isSuperadmin) {
    return (
      <div className="min-h-screen bg-fog-white flex items-center justify-center p-4 antialiased">
        <div className="max-w-[480px] w-full bg-paper-white border border-slate-gray/30 p-8 shadow-subtle space-y-6 text-left">
          <div className="w-12 h-12 bg-sienna-brown/10 border border-sienna-brown/30 flex items-center justify-center text-sienna-brown">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase text-sienna-brown tracking-wider font-semibold">
              Area Terbatas &bull; Role-Based Access Control
            </div>
            <h1 className="font-signifier text-[26px] text-ink-black leading-tight">
              Akses Superadmin Diperlukan
            </h1>
            <p className="text-[13.5px] text-slate-gray leading-relaxed">
              Halaman ini diperuntukkan khusus bagi tim infrastruktur dan administrator resmi DataLoka untuk mengontrol data pengguna, layanan, kupon diskon, dan log audit.
            </p>
          </div>

          <div className="p-4 bg-mist-gray/60 border border-slate-gray/20 space-y-2 text-[12.5px] font-mono text-slate-gray">
            <div className="flex justify-between">
              <span>Status Akun:</span>
              <span className="text-ink-black font-semibold">{isAuthenticated ? user?.email : "Belum Masuk"}</span>
            </div>
            <div className="flex justify-between">
              <span>Role Saat Ini:</span>
              <span className="text-sienna-brown uppercase font-bold">{user?.role || "user"}</span>
            </div>
          </div>

          {/* Quick Switch for Developer & Superadmin Verification */}
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                useAuthStore.setState({
                  isAuthenticated: true,
                  user: {
                    uid: "usr_superadmin_01",
                    email: "founder@dataloka.id",
                    displayName: "Founder DataLoka (Superadmin)",
                    photoURL: null,
                    role: "superadmin",
                    planTier: "business",
                    createdAt: new Date().toISOString(),
                  },
                });
              }}
              className="w-full py-2.5 px-4 bg-ink-black hover:bg-slate-gray text-paper-white text-[13px] font-medium transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-sienna-brown" />
              <span>Masuk sebagai Superadmin (founder@dataloka.id)</span>
            </button>

            <Link
              href="/dashboard"
              className="w-full py-2.5 px-4 border border-slate-gray/30 hover:border-ink-black text-ink-black text-[13px] font-medium transition text-center flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dasbor Utama</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
