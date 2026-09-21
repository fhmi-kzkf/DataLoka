"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, AlertCircle, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
  } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (authModalTab === "login") {
        if (!email || !password) {
          throw new Error("Harap isi email dan kata sandi.");
        }
        await loginWithEmail(email, password);
      } else if (authModalTab === "register") {
        if (!email || !password) {
          throw new Error("Harap isi email dan kata sandi.");
        }
        if (password.length < 6) {
          throw new Error("Kata sandi minimal 6 karakter.");
        }
        await registerWithEmail(email, password, name);
      } else if (authModalTab === "forgot") {
        if (!email) {
          throw new Error("Harap masukkan alamat email Anda.");
        }
        await resetPassword(email);
        setResetEmailSent(true);
        setSuccessMessage(`Tautan pemulihan kata sandi telah dikirim ke alamat email ${email}. Silakan periksa kotak masuk (inbox) atau folder spam email Anda.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal masuk via Google";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: "login" | "register" | "forgot") => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setResetEmailSent(false);
    openAuthModal(tab);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-xs antialiased"
    >
      <div
        className="relative w-full max-w-[440px] bg-paper-white border border-slate-gray/30 p-6 sm:p-8 shadow-subtle text-left transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-none bg-mist-gray hover:bg-ink-black text-ink-black hover:text-paper-white border border-slate-gray/30 hover:border-ink-black transition-all cursor-pointer shadow-2xs group"
          aria-label="Tutup dialog"
        >
          <X className="w-4 h-4 stroke-[2.5] transition-transform group-hover:scale-110" />
        </button>

        {/* Brand Header */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-slate-gray tracking-wider">
            {authModalTab === "forgot" ? (
              <>
                <KeyRound className="w-3.5 h-3.5 text-sienna-brown" />
                <span>Pemulihan Keamanan Akun</span>
              </>
            ) : (
              <span>Akun &amp; Workspace Cloud</span>
            )}
          </div>
          <h3 className="font-signifier text-[26px] font-normal text-ink-black">
            {authModalTab === "login" && "Masuk ke DataLoka"}
            {authModalTab === "register" && "Buat Akun Baru"}
            {authModalTab === "forgot" && "Lupa Kata Sandi"}
          </h3>
          <p className="text-[13px] text-slate-gray leading-relaxed">
            {authModalTab === "login" && "Akses dashboard tersimpan dan sinkronisasi workspace Anda ke cloud."}
            {authModalTab === "register" && "Dapatkan penyimpanan cloud gratis dan kolaborasi tim instan."}
            {authModalTab === "forgot" && "Masukkan email terdaftar Anda. Kami akan mengirimkan tautan reset kata sandi langsung ke email."}
          </p>
        </div>

        {/* Tab Switcher for Login / Register */}
        {authModalTab !== "forgot" && (
          <div className="flex border-b border-slate-gray/20 mb-5">
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className={`flex-1 pb-2.5 text-[13.5px] font-mono text-center transition-all ${
                authModalTab === "login"
                  ? "border-b-2 border-ink-black text-ink-black font-semibold"
                  : "text-slate-gray hover:text-ink-black"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("register")}
              className={`flex-1 pb-2.5 text-[13.5px] font-mono text-center transition-all ${
                authModalTab === "register"
                  ? "border-b-2 border-ink-black text-ink-black font-semibold"
                  : "text-slate-gray hover:text-ink-black"
              }`}
            >
              Daftar
            </button>
          </div>
        )}

        {/* Alert Notifications */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[12.5px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-[12.5px] leading-relaxed flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#059669] mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Email Terkirim!</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Form */}
        {authModalTab === "forgot" && resetEmailSent ? (
          <div className="space-y-4 pt-2">
            <Button
              variant="filled"
              size="md"
              type="button"
              onClick={() => handleTabChange("login")}
              className="w-full justify-center text-[13.5px] py-2.5"
            >
              Kembali ke Halaman Masuk
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setResetEmailSent(false)}
                className="text-[12px] font-mono text-slate-gray hover:text-ink-black underline"
              >
                Kirim ulang tautan jika belum menerima
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalTab === "register" && (
              <div>
                <label className="block text-[11.5px] font-mono uppercase text-slate-gray mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda atau Perusahaan"
                    className="w-full bg-fog-white border border-slate-gray/25 px-3 py-2 text-[13.5px] text-ink-black focus:outline-none focus:border-ink-black transition-colors pl-9"
                  />
                  <User className="w-4 h-4 text-slate-gray absolute left-3 top-2.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11.5px] font-mono uppercase text-slate-gray mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full bg-fog-white border border-slate-gray/25 px-3 py-2 text-[13.5px] text-ink-black focus:outline-none focus:border-ink-black transition-colors pl-9"
                />
                <Mail className="w-4 h-4 text-slate-gray absolute left-3 top-2.5" />
              </div>
            </div>

            {authModalTab !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11.5px] font-mono uppercase text-slate-gray">
                    Kata Sandi
                  </label>
                  {authModalTab === "login" && (
                    <button
                      type="button"
                      onClick={() => handleTabChange("forgot")}
                      className="text-[11.5px] text-sienna-brown hover:underline font-mono"
                    >
                      Lupa kata sandi?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-fog-white border border-slate-gray/25 px-3 py-2 text-[13.5px] text-ink-black focus:outline-none focus:border-ink-black transition-colors pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-gray absolute left-3 top-2.5" />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                variant="filled"
                size="md"
                type="submit"
                disabled={isLoading}
                className="w-full justify-center text-[13.5px] py-2.5 gap-2"
              >
                <span>
                  {isLoading
                    ? "Memproses..."
                    : authModalTab === "login"
                    ? "Masuk Sekarang"
                    : authModalTab === "register"
                    ? "Buat Akun Gratis"
                    : "Kirim Tautan Reset ke Email"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        )}

        {/* Back to Login link when on Forgot tab */}
        {authModalTab === "forgot" && !resetEmailSent && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className="text-[12px] font-mono text-slate-gray hover:text-ink-black underline"
            >
              &larr; Kembali ke halaman Masuk
            </button>
          </div>
        )}

        {/* Social Google Sign-in */}
        {authModalTab !== "forgot" && (
          <>
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-gray/20" />
              </div>
              <span className="relative bg-paper-white px-3 text-[11px] font-mono text-slate-gray uppercase">
                Atau
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-fog-white hover:bg-paper-white border border-slate-gray/25 hover:border-slate-gray/40 text-ink-black text-[13px] font-medium py-2.5 px-4 flex items-center justify-center gap-3 transition-all shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>
          </>
        )}

        {/* Footer privacy guarantee */}
        <p className="mt-5 pt-4 border-t border-slate-gray/15 text-[11px] font-mono text-center text-slate-gray">
          Dengan melanjutkan, Anda menyetujui Ketentuan Layanan &amp; Kebijakan Privasi Client-First DataLoka.
        </p>
      </div>
    </div>
  );
};
