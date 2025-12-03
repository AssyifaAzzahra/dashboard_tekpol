// app/apps/credentials/view-client.tsx
'use client';

import React, { useState } from 'react';
import { KeyRound, X } from 'lucide-react';
import TekpolTile from '@/components/ui/TekpolTile';

type Role = 'PKWT' | 'KARYAWAN' | 'KASUBAG' | 'KABAG' | 'GUEST';
type Category = 'HO' | 'REGIONAL';

type App = {
  id: string;
  name: string;
  category: Category;
  username: string;
  password: string;
  description?: string | null;
};

type User = { id: string; name: string; email?: string | null };

// myReqs & pics disertakan untuk kompatibilitas prop,
// tapi tidak dipakai di tampilan staff (boleh dibiarkan).
export default function AppsClient({
  role,
  apps,
}: {
  role: Role;
  apps: App[];
  myReqs: unknown[];
  pics: User[];
}) {
  const [showApp, setShowApp] = useState<App | null>(null);

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Info Username &amp; Password</h1>
      </div>

      {/* Grid kartu: sama gaya dengan halaman Tekpol Apps */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => (
          <TekpolTile
            key={app.id}
            icon={<KeyRound className="w-5 h-5 text-emerald-400" />}
            title={app.name}
            tag={app.category}
            desc={app.description ?? undefined}
            asButton
            primaryText="Lihat"
            onPrimary={() => setShowApp(app)}
          />
        ))}
      </div>

      {/* Modal kredensial */}
      {showApp && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-800 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-500" />
              <div className="font-semibold">{showApp.name}</div>
              <button
                className="ml-auto p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setShowApp(null)}
                aria-label="Tutup"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3">
                <div className="text-slate-500 mb-1">Username</div>
                <div className="font-mono">{showApp.username}</div>
              </div>
              <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3">
                <div className="text-slate-500 mb-1">Password</div>
                <div className="font-mono">{showApp.password}</div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-200/70 dark:border-slate-800 text-right">
              <button
                onClick={() => setShowApp(null)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
