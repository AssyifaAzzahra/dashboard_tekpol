'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserRound,
  Building2,
  FileText,
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  Search,
} from 'lucide-react';

type Step = 'form' | 'result';

/** 🔽 Daftar nama aplikasi (hanya nama, tanpa URL) */
const APP_LIST = [
  'MYPALMCO',
  'PICA',
  'E-Tekpol',
  'Elemen',
  'IQX',
  'MIMS - Angka Kerja',
  'Eco Holding Perkebunan',
  'SINUSA',
  'E-BUDGET',
  'Monitoring Infra',
  'E-OFFICE',
  'IPS HOLDING',
  'OLIDOS',
  'AU31 ONLINE',
  'HPS ONLINE',
  'HELPDESK',
  'E-Disposisi',
  'IMS (SOP IK PALM CO)',
  'OSLOG JYOTI',
  'HITMI',
  'ERIN',
  'AGHRIS',
  'Dashboard MIMS LOSSES',
  'ASANA',
  'SEVP OPS REG 3',
  'Hana',
  'Eslip',
  'Hris',
  'INTANK',
];

export default function GuestRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');

  const [guestName, setGuestName] = useState('');
  const [division, setDivision] = useState('');
  const [reason, setReason] = useState('');
  const [appName, setAppName] = useState(''); // nama aplikasi terpilih

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [trackingCode, setTrackingCode] = useState('');
  const [trackingPin, setTrackingPin] = useState('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [copied, setCopied] = useState<'code' | 'pin' | null>(null);

  // state untuk dropdown aplikasi
  const [appDropdownOpen, setAppDropdownOpen] = useState(false);
  const [appSearch, setAppSearch] = useState('');

  const filteredApps = APP_LIST.filter((name) =>
    name.toLowerCase().includes(appSearch.trim().toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/guest-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guestName.trim(),
          appName: appName.trim(), // kirim nama aplikasi
          division: division.trim() || undefined,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.message || 'Gagal mengirim permohonan.');
        setSubmitting(false);
        return;
      }

      setTrackingCode(data.trackingCode);
      setTrackingPin(data.trackingPin);
      setCreatedAt(data.createdAt);
      setStep('result');
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan. Coba lagi.');
      setSubmitting(false);
    }
  }

  function handleCopy(text: string, type: 'code' | 'pin') {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(type);
        setTimeout(() => setCopied(null), 1500);
      })
      .catch(() => {});
  }

  return (
    <main className="min-h-dvh relative flex items-center justify-center p-4">
      {/* overlay kalau kamu pakai background video di layout */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-900/50 pointer-events-none" />

      <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-white/85 dark:bg-slate-900/80 shadow-2xl backdrop-blur-xl p-6 md:p-8">
        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <img
              src="https://www.ptpn4.co.id/icons/Logo%20PTPN%20IV.png"
              alt="PTPN IV"
              className="h-9 w-9 object-contain"
              loading="eager"
            />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                PTPN IV Regional III
              </div>
              <div className="text-xs text-slate-500">
                Divisi Teknik &amp; Pengolahan — Layanan Tamu
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300/70 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3 h-3" />
            Kembali ke login
          </button>
        </div>

        {step === 'form' ? (
          <>
            <div className="mb-4">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Permohonan Akses Sebagai Tamu
              </h1>
              <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                Isi data berikut untuk mengajukan permohonan akses aplikasi. Anda akan menerima{' '}
                <span className="font-semibold">Kode</span> dan{' '}
                <span className="font-semibold">PIN</span> untuk mengecek status permohonan.
              </p>
            </div>

            <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="relative">
                  <label
                    htmlFor="guestName"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1"
                  >
                    Nama Lengkap Tamu
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-5 md:mt-[1.85rem]">
                    <UserRound className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    id="guestName"
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="mt-1 w-full rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="division"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1"
                  >
                    Asal Divisi / Instansi
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-5 md:mt-[1.85rem]">
                    <Building2 className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    id="division"
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="Contoh: Divisi X / Mitra Y"
                    className="mt-1 w-full rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* 🔽 APLIKASI YANG DIAJUKAN — CUSTOM DROPDOWN CANTIK */}
              <div
                className="relative"
                tabIndex={-1}
                onBlur={(e) => {
                  // tutup dropdown kalau fokus pindah ke luar container
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setAppDropdownOpen(false);
                    setAppSearch('');
                  }
                }}
              >
                <label
                  htmlFor="appName"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1"
                >
                  Aplikasi yang Diajukan
                </label>

                {/* "input" palsu berupa button */}
                <button
                  type="button"
                  id="appName"
                  onClick={() => setAppDropdownOpen((o) => !o)}
                  className="mt-1 w-full rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 pl-9 pr-10 py-2 text-sm text-left outline-none focus:ring-2 focus:ring-emerald-500/50 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-100">
                    <AppWindow className="w-4 h-4 text-slate-400 absolute left-3" />
                    <span className={appName ? '' : 'text-slate-400'}>
                      {appName || 'Pilih aplikasi…'}
                    </span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* dropdown panel */}
                {appDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-xl overflow-hidden">
                    {/* search bar di dalam dropdown */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/80">
                      <Search className="w-3 h-3 text-slate-400" />
                      <input
                        autoFocus
                        placeholder="Cari aplikasi…"
                        className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-100 outline-none"
                        value={appSearch}
                        onChange={(e) => setAppSearch(e.target.value)}
                      />
                    </div>

                    <ul className="max-h-56 overflow-y-auto py-1 text-sm">
                      {filteredApps.length === 0 && (
                        <li className="px-3 py-2 text-xs text-slate-400">
                          Tidak ada aplikasi yang cocok.
                        </li>
                      )}
                      {filteredApps.map((name) => (
                        <li key={name}>
                          <button
                            type="button"
                            className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-900/40 ${
                              appName === name
                                ? 'bg-emerald-50/80 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-100'
                                : 'text-slate-700 dark:text-slate-100'
                            }`}
                            onClick={() => {
                              setAppName(name);
                              setAppDropdownOpen(false);
                              setAppSearch('');
                            }}
                          >
                            <span>{name}</span>
                            {appName === name && (
                              <Check className="w-3 h-3 text-emerald-500" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-1 text-[11px] text-slate-500">
                  Pilih aplikasi sesuai daftar di TEKPOL (contoh: Hana, INTANK, SINUSA, dll).
                </p>
              </div>

              <div className="relative">
                <label
                  htmlFor="reason"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1"
                >
                  Alasan Permohonan
                </label>
                <div className="absolute left-0 top-[1.85rem] pl-3 pt-2 pointer-events-none">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan singkat mengapa Anda membutuhkan akses."
                  className="mt-1 w-full rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                />
              </div>

              {errorMsg && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Permohonan Anda akan diproses oleh PIC/Kasubag/Kabag terkait. Status dapat
                  dicek menggunakan Kode dan PIN yang akan diberikan.
                </p>
                <button
                  type="submit"
                  disabled={submitting || !appName}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold shadow-lg shadow-emerald-600/20 transition disabled:opacity-60"
                >
                  Kirim Permohonan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Permohonan Diterima
              </h1>
              <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                Simpan <span className="font-semibold">Kode</span> dan{' '}
                <span className="font-semibold">PIN</span> berikut. Data ini diperlukan untuk
                mengecek status permohonan Anda.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div className="rounded-xl border border-emerald-500/70 bg-emerald-50/80 dark:bg-emerald-900/40 p-4">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-200 mb-1">
                  Kode Permohonan
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-mono tracking-[0.2em] text-emerald-900 dark:text-emerald-50">
                    {trackingCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(trackingCode, 'code')}
                    className="inline-flex items-center justify-center rounded-full border border-emerald-500/70 bg-white/80 dark:bg-emerald-900/70 px-2 py-1 text-xs text-emerald-800 dark:text-emerald-50 hover:bg-emerald-50 dark:hover:bg-emerald-800 transition"
                  >
                    {copied === 'code' ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Salin
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-300/70 dark:border-slate-700 bg-white/90 dark:bg-slate-900/60 p-4">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  PIN Permohonan
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-mono tracking-[0.3em] text-slate-900 dark:text-slate-50">
                    {trackingPin}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(trackingPin, 'pin')}
                    className="inline-flex items-center justify-center rounded-full border border-slate-400/70 dark:border-slate-600 bg-white/80 dark:bg-slate-900/70 px-2 py-1 text-xs text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    {copied === 'pin' ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Salin
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
              <p>
                • Kode dan PIN ini <span className="font-semibold">tidak dikirim otomatis</span>.
                Mohon discreenshot / dicatat.
              </p>
              <p>
                • Untuk cek status, buka halaman{' '}
                <Link
                  href="/guest/track"
                  className="font-semibold text-emerald-700 dark:text-emerald-300 underline-offset-2 hover:underline"
                >
                  Cek Status Permohonan Tamu
                </Link>{' '}
                dan masukkan Kode + PIN di atas.
              </p>
              {createdAt && (
                <p>
                  • Tanggal permohonan:{' '}
                  <span className="font-mono">
                    {new Date(createdAt).toLocaleString('id-ID')}
                  </span>
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300/70 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <ArrowLeft className="w-3 h-3" />
                Buat permohonan lain
              </button>
              <Link
                href="/guest/track"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-lg shadow-emerald-600/20 transition"
              >
                Pergi ke halaman cek status
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
