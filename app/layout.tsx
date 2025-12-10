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
      {/* HAPUS app-has-video dulu supaya simple */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* VIDEO BACKGROUND */}
        <video
          className="fixed inset-0 w-full h-full object-cover pointer-events-none -z-10"
          src="/images/bgvideo.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* KONTEN APLIKASI */}
        <div className="relative z-10">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
