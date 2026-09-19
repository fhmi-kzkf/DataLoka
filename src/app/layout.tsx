import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sohne = Inter({
  subsets: ["latin"],
  variable: "--font-sohne",
  display: "swap",
});

const signifier = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-signifier",
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "DataLoka — Platform Analitik Data Cepat & Interaktif",
  description:
    "Ubah spreadsheet Excel, CSV, dan Google Sheets menjadi dashboard analitik interaktif dalam hitungan detik dengan privasi client-first.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${sohne.variable} ${signifier.variable}`}>
      <body className="min-h-screen bg-[var(--color-paper-white)] text-[var(--color-ink-black)] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
