// app/guest/track/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, KeyRound, Eye, EyeOff, Copy, Check } from 'lucide-react';

type Decision = 'PENDING' | 'APPROVED' | 'REJECTED';
type Category = 'HO' | 'REGIONAL';
type Role = 'PKWT' | 'KARYAWAN' | 'KASUBAG' | 'KABAG' | 'GUEST';

type GuestStatusResponse = {
  id: string;
  guestName: string | null;
  trackingCode: string;
  division: string | null;
  reason: string | null;
  status: Decision;
  createdAt: string;
  updatedAt: string;
  app: {
    id: string;
    name: string;
    category: Category;
    url: string | null; // ✅ dari DB
  };
  approvals: {
    id: string;
    role: Role;
    decision: Decision;
    decidedAt: string | null;
    note: string | null;
    approver: {
      id: string;
      name: string;
      email: string | null;
    };
  }[];
  credentials: {
    username: string;
    password: string;
  } | null;
};

const DASHBOARD_PATH = '/HomeHero';

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function ensureHttp(url: string): string {
  const u = url.trim();
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return `https://${u}`;
}

/** ✅ Type guard: jika true, credentials pasti ada (non-null) */
function hasCredentials(
  result: GuestStatusResponse | null,
): result is GuestStatusResponse & { credentials: { username: string; password: string } } {
  return !!result && result.status === 'APPROVED' && result.credentials !== null;
}

export default function GuestTrackPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingPin, setTrackingPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<GuestStatusResponse | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/guest-requests/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingCode: trackingCode.trim(),
          trackingPin: trackingPin.trim(),
        }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const msg =
          isObject(data) && typeof data.message === 'string'
            ? data.message
            : 'Gagal mengecek status permohonan.';
        setErrorMsg(msg);
        return;
      }

      setResult(data as GuestStatusResponse);
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
      setShowPassword(false);
      setCopiedField(null);
    }
  }

  function formatDate(value: string | Date | null | undefined) {
    if (!value) return '-';
    const d = typeof value === 'string' ? new Date(value) : value;
    return d.toLocaleString('id-ID');
  }

  function handleCopy(text: string, field: 'username' | 'password') {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
      })
      .catch(() => {});
  }

  const statusColor: Record<Decision, string> = {
    PENDING: 'text-amber-600',
    APPROVED: 'text-emerald-600',
    REJECTED: 'text-rose-600',
  };

  function handleBackToDashboard() {
    window.location.assign(DASHBOARD_PATH);
  }

  function handleGoToApp() {
    const raw = result?.app?.url ?? null;
    if (!raw || !raw.trim()) {
      alert(`Link untuk aplikasi "${result?.app?.name ?? '-'}" belum diisi admin.`);
      return;
    }
    const url = ensureHttp(raw);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <main className="min-h-dvh relative flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-900/50 pointer-events-none" />

      <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-white/85 dark:bg-slate-900/80 shadow-2xl backdrop-blur-xl p-6 md:p-8 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Cek Status Permohonan Tamu
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
              Masukkan <span className="font-semibold">Kode</span> dan{' '}
              <span className="font-semibold">PIN</span> yang Anda dapat saat mengajukan permohonan.
              Jika permohonan telah disetujui, informasi akun aplikasi akan ditampilkan di bawah.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1 rounded-full border border-slate-300/70 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3 h-3" />
            Kembali
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="trackingCode" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
              Kode Permohonan
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-slate-400 text-sm">#</span>
              </div>
              <input
                id="trackingCode"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                placeholder="Mis: D7VCGGMQ"
                className="mt-1 w-full rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 pl-7 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 tracking-[0.18em] font-mono"
                maxLength={12}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="trackingPin" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
              PIN Permohonan
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="trackingPin"
                value={trackingPin}
                onChange={(e) => setTrackingPin(e.target.value)}
                placeholder="4 digit PIN"
                className="mt-1 w-full rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 tracking-[0.4em] font-mono"
                maxLength={6}
                required
              />
            </div>
          </div>

          {errorMsg && <div className="text-sm text-rose-600 dark:text-rose-400">{errorMsg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold shadow-lg shadow-emerald-600/20 transition disabled:opacity-60"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Mengecek...' : 'Cek Status'}
          </button>
        </form>

        <hr className="border-slate-200/70 dark:border-slate-700/70" />

        {/* Hasil */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Hasil Pencarian</h2>

          {!result && !errorMsg && (
            <p className="text-xs text-slate-500">
              Isi Kode dan PIN di atas, lalu klik <span className="font-semibold">Cek Status</span>.
            </p>
          )}

          {result && (
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/70 p-4 space-y-1">
                <div>
                  <span className="font-semibold">Nama Tamu:</span>{' '}
                  <span className="text-slate-800 dark:text-slate-100">{result.guestName || '-'}</span>
                </div>

                <div>
                  <span className="font-semibold">Aplikasi:</span>{' '}
                  <span className="text-slate-800 dark:text-slate-100">
                    {result.app.name}{' '}
                    <span className="inline-flex items-center rounded-full border border-slate-300/70 dark:border-slate-600 px-2 py-[1px] text-[10px] font-medium ml-1">
                      {result.app.category}
                    </span>
                  </span>
                </div>

                {result.division && (
                  <div>
                    <span className="font-semibold">Asal Divisi / Instansi:</span> {result.division}
                  </div>
                )}

                {result.reason && (
                  <div>
                    <span className="font-semibold">Alasan:</span> {result.reason}
                  </div>
                )}

                <div>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className={statusColor[result.status]}>{result.status}</span>
                </div>

                <div>
                  <span className="font-semibold">Diajukan pada:</span> {formatDate(result.createdAt)}
                </div>
              </div>

              {/* ✅ APPROVED + credentials non-null */}
              {hasCredentials(result) && (
                <>
                  <div className="rounded-xl bg-emerald-50/90 dark:bg-emerald-900/40 border border-emerald-500/70 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-100">
                          Informasi Akun Aplikasi
                        </div>
                        <div className="text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
                          Simpan baik-baik username &amp; password ini. Jangan dibagikan ke pihak yang tidak berkepentingan.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-500/70 bg-white/90 dark:bg-emerald-900/80 px-2 py-1 text-[11px] text-emerald-800 dark:text-emerald-50 hover:bg-emerald-50 dark:hover:bg-emerald-800 transition"
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Sembunyikan
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            Tampilkan
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-white/90 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-700/80 p-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-200">Username</div>
                          <div className="font-mono text-sm text-emerald-900 dark:text-emerald-50 break-all">
                            {result.credentials.username}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(result.credentials.username, 'username')}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-400/80 dark:border-emerald-600 bg-white/90 dark:bg-emerald-900/80 px-2 py-1 text-[11px] text-emerald-800 dark:text-emerald-50 hover:bg-emerald-50 dark:hover:bg-emerald-800 transition"
                        >
                          {copiedField === 'username' ? (
                            <>
                              <Check className="w-3 h-3" />
                              Disalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Salin
                            </>
                          )}
                        </button>
                      </div>

                      <div className="rounded-lg bg-white/90 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-700/80 p-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-200">Password</div>
                          <div className="font-mono text-sm text-emerald-900 dark:text-emerald-50 break-all">
                            {showPassword ? result.credentials.password : '••••••••'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(result.credentials.password, 'password')}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-400/80 dark:border-emerald-600 bg-white/90 dark:bg-emerald-900/80 px-2 py-1 text-[11px] text-emerald-800 dark:text-emerald-50 hover:bg-emerald-50 dark:hover:bg-emerald-800 transition"
                        >
                          {copiedField === 'password' ? (
                            <>
                              <Check className="w-3 h-3" />
                              Disalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Salin
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ✅ BUTTON Masuk ke App */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleGoToApp}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 text-sm font-semibold shadow-lg shadow-emerald-600/20 transition"
                    >
                      Masuk ke {result.app.name}
                    </button>
                  </div>
                </>
              )}

              {result.status === 'PENDING' && (
                <p className="text-xs text-slate-500">
                  Permohonan Anda masih dalam proses. Silakan cek kembali setelah disetujui oleh Kasubag &amp; Kabag Tekpol.
                </p>
              )}

              {result.status === 'REJECTED' && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  Permohonan Anda ditolak. Silakan hubungi PIC/Kasubag/Kabag Tekpol untuk informasi lebih lanjut.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Optional footer button */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white underline underline-offset-4"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
