"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { UserProfileMenu } from "@/components/auth/user-profile-menu";
import { useAuthStore } from "@/stores/auth-store";

export const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, openAuthModal, user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Fitur", href: "/#features" },
    { label: "Template", href: "/#templates" },
    { label: "Demo Instan", href: "/#demo" },
    { label: "Harga", href: "/pricing" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-[var(--color-paper-white)]/95 backdrop-blur-md border-b border-slate-gray/15 shadow-xs py-3.5"
          : "bg-[var(--color-paper-white)] border-b border-slate-gray/10 py-4 sm:py-5"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Geometric Mark (Matches Footer Exactly) */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
          <BrandLogo size="md" className="group-hover:bg-sienna-brown transition-colors" />
          <span className="font-signifier text-[22px] sm:text-[25px] font-normal tracking-tight text-ink-black leading-none">
            DataLoka
          </span>
        </Link>

        {/* Desktop Nav Links with Generous Horizontal Spacing */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12 text-[14px] font-mono">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-gray hover:text-ink-black transition-colors duration-150 px-2 py-1.5 relative after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[1.5px] after:bg-sienna-brown after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action CTAs & User Profile */}
        <div className="hidden md:flex items-center gap-3 sm:gap-4 shrink-0">
          <UserProfileMenu />

          {/* Buka Workspace is ONLY available on desktop when user is logged in */}
          {isAuthenticated && (
            <Link href="/dashboard">
              <Button
                variant="filled"
                size="sm"
                className="text-[13px] px-4 py-2 hover:shadow-md hover:-translate-y-0.5 transition-all whitespace-nowrap"
              >
                Buka Workspace &rarr;
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button (Clean & Isolated on Mobile) */}
        <button
          type="button"
          aria-label="Menu navigasi"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-ink-black hover:bg-mist-gray transition cursor-pointer border border-slate-gray/20"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-paper-white border-b border-slate-gray/15 px-6 py-5 shadow-subtle space-y-4 animate-in fade-in duration-150">
          {/* User Profile Card (When logged in) */}
          {isAuthenticated && user && (
            <div className="p-3.5 bg-fog-white border border-slate-gray/20 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-ink-black text-paper-white font-mono text-[12px] font-semibold flex items-center justify-center shrink-0">
                  {user.displayName
                    ? user.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "US"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-ink-black truncate">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9.5px] font-mono uppercase text-sienna-brown font-semibold bg-blush-peach/40 px-1.5 py-0.5 border border-sienna-brown/20">
                      Pengguna {user.planTier.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-gray truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-[11.5px] font-mono text-slate-gray hover:text-ink-black underline cursor-pointer shrink-0 ml-2"
              >
                Keluar
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[15px] text-ink-black hover:text-sienna-brown py-2 transition-colors font-mono"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action CTAs in Mobile Drawer */}
          <div className="pt-3 border-t border-slate-gray/10 space-y-2">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                <Button variant="filled" size="sm" className="w-full text-[13.5px] py-2.5">
                  Buka Workspace Analitik &rarr;
                </Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-[13px] py-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                >
                  Masuk
                </Button>
                <Button
                  variant="filled"
                  size="sm"
                  className="w-full text-[13px] py-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("register");
                  }}
                >
                  Daftar Gratis
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
