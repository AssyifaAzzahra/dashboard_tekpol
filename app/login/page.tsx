'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  ShieldCheck,
  BriefcaseBusiness,
  UserRound,
  Mail,
  Lock,
  ArrowRight,
  Building2,
} from 'lucide-react';

type LoginMode = 'staff' | 'pkwt' | 'guest';

function LoginPageInner() {
  const sp = useSearchParams();
  // ✅ default ke Home
  const callbackUrl = useMemo(() => sp.get('callbackUrl') ?? '/', [sp]);

  const [mode, setMode] = useState<LoginMode>('staff');

  // staff / pkwt
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // guest
  const [guestName, setGuestName] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'guest') {
        if (!guestName.trim()) {
          setErrorMsg('Nama tamu wajib diisi.');
          setLoading(false);
          return;
        }
        await signIn('credentials', {
          redirect: true,
          callbackUrl,
          loginType: 'guest', // ✅ guest
          guestName,
        });
        return;
      }

      // staff & pkwt → jalur yang sama di authorize (loginType: 'staff')
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Email dan password wajib diisi.');
        setLoading(false);
        return;
      }

      await signIn('credentials', {
        redirect: true,
        callbackUrl,
        loginType: 'staff', // ✅ pkwt juga dianggap staff untuk proses login
        email,
        password,
      });
    } catch {
      setErrorMsg('Gagal masuk. Coba lagi.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh relative flex items-center justify-center p-4">
      {/* Overlay gelap tipis untuk kontras di atas video bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/50 pointer-events-none" />

      {/* Kartu login */}
      <div className="relative w-full max-w-4xl grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl bg-white/10">
        {/* Panel brand */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-emerald-600/90 via-emerald-700/80 to-emerald-900/80 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0">
              <img
                src="https://www.ptpn4.co.id/icons/Logo%20PTPN%20IV.png"
                alt="PTPN IV"
                className="h-10 w-10 object-contain"
                loading="eager"
              />
            </div>
            <div>
              <div className="text-lg font-bold leading-tight">PTPN IV Regional III</div>
              <div className="text-sm text-emerald-50/90">Divisi Teknik & Pengolahan</div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-extrabold tracking-tight">Dashboard TEKPOL</h1>
            <p className="text-emerald-50/90 leading-relaxed">
              Akses terpusat untuk Apps HO & Regional. Kelola permohonan akses, approval PIC/Kasubag/Kabag,
              serta lihat kredensial yang disetujui—semuanya dalam satu tempat.
            </p>
            <div className="mt-6 flex items-center gap-3 text-emerald-50/90">
              <Building2 className="w-5 h-5" />
              <span className="text-sm">
                Keamanan berlapis: role-based access + approval chain.
              </span>
            </div>
          </div>

          <div className="text-xs text-emerald-50/70">
            © {new Date().getFullYear()} PTPN IV Reg III — TEKPOL
          </div>
        </div>

        {/* Panel form */}
        <div className="p-6 md:p-8 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl">
          {/* Logo mobile */}
          <div className="md:hidden mb-6 flex items-center gap-3">
            <img
              src="https://www.ptpn4.co.id/icons/Logo%20PTPN%20IV.png"
              alt="PTPN IV"
              className="h-8 w-8 object-contain"
              loading="eager"
            />
            <div>
              <div className="text-base font-bold">PTPN IV Regional III</div>
              <div className="text-xs text-slate-500">Dashboard TEKPOL</div>
            </div>
          </div>

          {/* Selector Mode */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('pkwt')}
              className={[
                'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold border transition',
                mode === 'pkwt'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                  : 'bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800',
              ].join(' ')}
            >
              <ShieldCheck className="w-4 h-4" />
              PKWT Tekpol
            </button>

            <button
              type="button"
              onClick={() => setMode('staff')}
              className={[
                'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold border transition',
                mode === 'staff'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                  : 'bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800',
              ].join(' ')}
              title="Karyawan, Kasubag, Kabag"
            >
              <BriefcaseBusiness className="w-4 h-4" />
              Staff Tekpol
            </button>

            <button
              type="button"
              onClick={() => setMode('guest')}
              className={[
                'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold border transition',
                mode === 'guest'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                  : 'bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800',
              ].join(' ')}
            >
              <UserRound className="w-4 h-4" />
              Tamu
            </button>
          </div>

          {/* Headline Form */}
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {mode === 'staff' && 'Masuk Staff Tekpol'}
              {mode === 'pkwt' && 'Masuk PKWT Tekpol'}
              {mode === 'guest' && 'Masuk sebagai Tamu'}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === 'guest'
                ? 'Cukup isi nama saja untuk mengajukan permohonan akses (butuh persetujuan Kasubag & Kabag).'
                : 'Masuk dengan email @tekpol dan password Anda.'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode !== 'guest' ? (
              <>
                <div className="relative">
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    placeholder="nama@tekpol.local"
                    className="w-full rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </>
            ) : (
              <div className="relative">
                <label htmlFor="guestName" className="sr-only">
                  Nama
                </label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserRound className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="guestName"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGuestName(e.target.value)
                  }
                  placeholder="Nama lengkap"
                  className="w-full rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            )}

            {errorMsg && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold shadow-lg shadow-emerald-600/20 transition disabled:opacity-60"
            >
              {mode === 'guest' ? 'Ajukan sebagai Tamu' : 'Masuk'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Hint footer */}
          <div className="mt-6 text-[11px] text-slate-500 leading-relaxed">
            Dengan masuk, Anda menyetujui kebijakan keamanan internal TEKPOL. Aktivitas diaudit.
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center p-4">
          <div className="rounded-xl border border-slate-200/70 bg-white/80 dark:bg-slate-900/70 px-6 py-4 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
            Memuat halaman login...
          </div>
        </main>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
