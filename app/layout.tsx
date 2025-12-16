// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard TEKPOL",
  description: "PTPN IV Regional III",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* BACKGROUND: benar-benar paling belakang */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <video className="h-full w-full object-cover" autoPlay muted loop playsInline preload="auto">
            <source src="/images/videoni.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        </div>

        {/* KONTEN: isolate bikin stacking context bersih */}
        <div className="relative z-10 min-h-screen isolate">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
