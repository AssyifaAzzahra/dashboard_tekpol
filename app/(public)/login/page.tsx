'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  ShieldCheck,
  UserRound,
  Mail,
  Lock,
  ArrowRight,
  Building2,
} from 'lucide-react';

type LoginMode = 'USER' | 'guest';

function LoginPageInner() {
  const sp = useSearchParams();
  const callbackUrl = useMemo(() => sp.get('callbackUrl') ?? '/', [sp]);

  const [mode, setMode] = useState<LoginMode>('USER');

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Email dan password wajib diisi.');
        setLoading(false);
        return;
      }

      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setErrorMsg('Email atau password tidak sesuai.');
        setLoading(false);
        return;
      }

      window.location.href = '/';
    } catch {
      setErrorMsg('Gagal masuk. Coba lagi.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh relative flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/50 pointer-events-none" />

      <div className="relative w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/10">
        {/* Panel kiri */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <img
              src="https://www.ptpn4.co.id/icons/Logo%20PTPN%20IV.png"
              alt="PTPN IV"
              className="h-10 w-10"
            />
            <div>
              <div className="text-lg font-bold">PTPN IV Regional III</div>
              <div className="text-sm text-emerald-50/90">
                Divisi Teknik & Pengolahan
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-extrabold">Dashboard TEKPOL</h1>
            <p className="text-emerald-50/90">
              Akses terpusat informasi, aplikasi HO & Regional, serta pengelolaan
              permohonan akses aplikasi.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-5 h-5" />
              Role-based access & approval Kabag
            </div>
          </div>

          <div className="text-xs text-emerald-50/70">
            © {new Date().getFullYear()} PTPN IV Reg III — TEKPOL
          </div>
        </div>

        {/* Panel kanan */}
        <div className="p-6 md:p-8 bg-white/85 dark:bg-slate-900/70">
          {/* Selector mode */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => setMode('USER')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold border transition ${
                mode === 'USER'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white border-slate-300'
              }`}
            >
              <ShieldCheck className="inline w-4 h-4 mr-1" />
              User
            </button>

            <button
              onClick={() => setMode('guest')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold border transition ${
                mode === 'guest'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white border-slate-300'
              }`}
            >
              <UserRound className="inline w-4 h-4 mr-1" />
              Tamu
            </button>
          </div>

          {/* Judul */}
          <div className="mb-4">
            <h2 className="text-lg font-bold">
              {mode === 'USER' ? 'Login Pengguna' : 'Layanan Tamu'}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === 'USER'
                ? 'Masuk menggunakan akun internal TEKPOL.'
                : 'Ajukan permohonan atau cek status akses aplikasi.'}
            </p>
          </div>

          {/* MODE TAMU */}
          {mode === 'guest' ? (
            <div className="space-y-3">
              <Link
                href="/guest/request"
                className="block rounded-lg border border-emerald-500 bg-emerald-50 px-4 py-2 font-semibold text-emerald-800"
              >
                Ajukan permohonan sebagai Tamu →
              </Link>

              <Link
                href="/guest/track"
                className="block rounded-lg border border-slate-300 px-4 py-2 font-semibold"
              >
                Cek status permohonan (Kode & PIN) →
              </Link>

              <Link
                href="/"
                className="block text-center rounded-lg border border-slate-300 px-4 py-2"
              >
                ← Kembali ke Dashboard
              </Link>
            </div>
          ) : (
            /* MODE USER */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@tekpol"
                  className="w-full pl-9 py-2 border rounded-lg"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 py-2 border rounded-lg"
                />
              </div>

              {errorMsg && (
                <div className="text-sm text-red-600">{errorMsg}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white rounded-lg py-2 font-semibold"
              >
                Masuk →
              </button>

              <Link
                href="/"
                className="block text-center rounded-lg border border-slate-300 py-2"
              >
                ← Kembali ke Dashboard
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Memuat halaman login...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
