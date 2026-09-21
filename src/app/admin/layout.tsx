import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Superadmin Control Center & Telemetri Platform | DataLoka",
  description:
    "Pusat kendali administratif DataLoka untuk manajemen pengguna, lisensi langganan, kupon diskon, cloud workspaces, dan log audit keamanan berbasis kueri database langsung.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-fog-white text-ink-black antialiased selection:bg-sienna-brown selection:text-paper-white">
      {children}
    </div>
  );
}
