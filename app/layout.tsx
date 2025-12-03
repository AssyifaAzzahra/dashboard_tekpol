import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // ⬅️ tambahkan

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
      {/* Gunakan class app-has-video untuk mengaktifkan video background */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased app-has-video`}>
        {/* Background Video (loop, mute, autoplay, mobile-friendly) */}
        {/* Pastikan file ada di: public/images/bg.mp4 */}
        <video
          className="app-bg-video motion-reduce:hidden select-none"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          {/* Jika punya versi webm, taruh source webm di atas mp4 */}
          {/* <source src="/images/bg.webm" type="video/webm" /> */}
          <source src="/images/videoni.mp4" type="video/mp4" />
        </video>

        {/* Konten aplikasi berada di atas overlay/video */}
        <div className="relative z-10">
          {/* ⬇️ Bungkus seluruh aplikasi dengan SessionProvider */}
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
