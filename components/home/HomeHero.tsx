// components/home/HomeHero.tsx
'use client';

import { motion } from 'framer-motion';

export default function HomeHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-linear-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white"
    >
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-black/10 blur-2xl" />
      <div className="relative px-6 py-10">
        <div className="text-2xl sm:text-3xl font-extrabold drop-shadow">
          Selamat Datang di Dashboard Bagian Teknik & Pengolahan
        </div>
        <p className="mt-2 text-emerald-50/90 max-w-3xl">
          Pusat akses dokumen lintas divisi. Gunakan menu atau kartu di bawah ini untuk membuka profil unit kerja dan berita terkini.
        </p>
      </div>
    </motion.section>
  );
}
