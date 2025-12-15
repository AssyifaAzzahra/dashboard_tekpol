import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard TEKPOL",
  description: "PTPN IV Regional III",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* VIDEO BACKGROUND */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <video
            className="h-full w-full object-cover"
            src="/images/videoni.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* KONTEN APLIKASI (cukup sekali) */}
        <div className="relative z-10 pointer-events-auto min-h-screen">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
