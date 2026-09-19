"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, Folder, Crown, ChevronDown, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

export const UserProfileMenu: React.FC = () => {
  const {
    user,
    isAuthenticated,
    openAuthModal,
    logout,
    setSavedWorkspacesModalOpen,
    openCheckoutModal,
  } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="text-[13px] font-mono font-medium px-3 py-1.5 text-ink-black hover:bg-fog-white border border-transparent hover:border-slate-gray/20 transition-all"
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => openAuthModal("register")}
          className="text-[13px] font-mono font-medium px-3.5 py-1.5 bg-ink-black text-paper-white hover:bg-ink-black/90 transition-all shadow-2xs"
        >
          Daftar Gratis
        </button>
      </div>
    );
  }

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 pl-2 border border-slate-gray/25 hover:border-slate-gray/40 bg-paper-white shadow-2xs transition-all text-left"
        aria-expanded={dropdownOpen}
      >
        <div className="flex flex-col items-start leading-none pr-1">
          <span className="text-[12px] font-medium text-ink-black truncate max-w-[110px]">
            {user.displayName || user.email?.split("@")[0]}
          </span>
          <span className="text-[9.5px] font-mono uppercase text-sienna-brown font-semibold mt-0.5">
            {user.planTier.toUpperCase()}
          </span>
        </div>

        <div className="w-7 h-7 bg-ink-black text-paper-white font-mono text-[11px] font-semibold flex items-center justify-center">
          {initials}
        </div>
        <ChevronDown className="w-3 h-3 text-slate-gray" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-1.5 w-60 bg-paper-white border border-slate-gray/25 shadow-subtle p-2 z-50 text-left divide-y divide-slate-gray/10">
          {/* User Info Header */}
          <div className="p-2 space-y-1">
            <p className="text-[13px] font-medium text-ink-black truncate">
              {user.displayName}
            </p>
            <p className="text-[11px] font-mono text-slate-gray truncate">
              {user.email}
            </p>
            <div className="pt-1 flex items-center gap-1.5">
              <span className="bg-blush-peach/40 text-sienna-brown text-[10px] font-mono font-semibold px-2 py-0.5 border border-sienna-brown/20">
                Paket: {user.planTier.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                setSavedWorkspacesModalOpen(true);
              }}
              className="w-full px-2.5 py-2 text-[12.5px] text-ink-black hover:bg-fog-white flex items-center gap-2.5 transition-colors text-left"
            >
              <Folder className="w-4 h-4 text-slate-gray" />
              <span>Workspace Tersimpan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                openCheckoutModal("pro", "annual");
              }}
              className="w-full px-2.5 py-2 text-[12.5px] text-sienna-brown font-medium hover:bg-blush-peach/20 flex items-center gap-2.5 transition-colors text-left"
            >
              <Crown className="w-4 h-4 text-sienna-brown" />
              <span>Upgrade Paket Langganan</span>
            </button>
          </div>

          {/* Logout Action */}
          <div className="pt-1">
            <button
              type="button"
              onClick={async () => {
                setDropdownOpen(false);
                await logout();
              }}
              className="w-full px-2.5 py-2 text-[12.5px] text-[#dc2626] hover:bg-[#fef2f2] flex items-center gap-2.5 transition-colors text-left font-medium"
            >
              <LogOut className="w-4 h-4 text-[#dc2626]" />
              <span>Keluar (Sign Out)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
