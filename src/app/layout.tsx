import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/ui/SiteShell";

export const metadata: Metadata = {
  title: "Dragón Rojo · Restaurante Oriental",
  description: "Sabores auténticos de oriente. Delivery y reservas de mesa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#080404] text-[#f0e6e6]">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
