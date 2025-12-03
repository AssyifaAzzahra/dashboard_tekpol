// app/approval/view-client.tsx
'use client';

import React, { useState } from 'react';
import { ShieldCheck, XCircle } from 'lucide-react';
import TekpolTile, { StatusPill } from '@/components/ui/TekpolTile';

type Role = 'PKWT' | 'KARYAWAN' | 'KASUBAG' | 'KABAG' | 'GUEST';
type Decision = 'PENDING' | 'APPROVED' | 'REJECTED';
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

type Approval = {
  id: string;
  requestId: string;
  approverId: string;
  role: Role;
  decision: Decision;
  note?: string | null;
  decidedAt?: string | null;
  approver: User;
};

type Request = {
  id: string;
  type: 'PKWT' | 'GUEST';
  appId: string;
  requesterId: string;
  picId?: string | null;
  reason?: string | null;
  division?: string | null;
  status: Decision;
  rejectionNote?: string | null;
  app: App;
  requester: User;
  approvals: Approval[];
  pic: User | null;
};

export default function ApprovalClient({
  role,
  rows,
}: {
  role: Role;
  rows: Request[];
}) {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  async function decide(
    id: string,
    decision: 'APPROVED' | 'REJECTED'
  ): Promise<void> {
    const note =
      decision === 'REJECTED'
        ? (window.prompt('Alasan penolakan? (opsional)') || '')
        : undefined;

    setLoadingIds((s) => [...s, id]);
    try {
      const res = await fetch('/api/approval', {
        method: 'PATCH', // <-- sesuai API baru
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, decision, note }),
      });
      const json = await res.json().catch(() => ({} as unknown));
      if (!res.ok) {
        throw new Error((json as { error?: string })?.error || 'Gagal memproses');
      }
      // sederhana: reload untuk menyegarkan daftar
      window.location.reload();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoadingIds((s) => s.filter((x) => x !== id));
    }
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
        <h1 className="text-lg md:text-xl font-bold">
          Approval <span className="text-emerald-400">({role})</span>
        </h1>
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => {
          const you =
            r.approvals.find((a) => a.role === role) ?? r.approvals[0];
          const pending =
            r.status === 'PENDING' &&
            you?.decision !== 'APPROVED' &&
            you?.decision !== 'REJECTED';

          const busy = loadingIds.includes(r.id);

          return (
            <TekpolTile
              key={r.id}
              icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
              title={`${r.app.name} — ${r.type}`}
              tag={r.app.category}
              desc={
                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    Requester:{' '}
                    <span className="text-slate-200">{r.requester.name}</span>
                  </div>
                  {r.division && (
                    <div>
                      Divisi:{' '}
                      <span className="text-slate-200">{r.division}</span>
                    </div>
                  )}
                  {r.reason && (
                    <div>
                      Alasan:{' '}
                      <span className="text-slate-200">{r.reason}</span>
                    </div>
                  )}
                  {r.pic && (
                    <div>
                      PIC: <span className="text-slate-200">{r.pic.name}</span>
                    </div>
                  )}
                </div>
              }
              rightSlot={<StatusPill value={r.status} />}
              asButton={false}
              footer={
                pending ? (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={busy}
                      onClick={() => decide(r.id, 'APPROVED')}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 disabled:opacity-60"
                    >
                      {busy ? '...' : 'Approve'}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => decide(r.id, 'REJECTED')}
                      className="rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white text-xs px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    Selesai oleh {you?.approver?.name ?? '—'}
                  </div>
                )
              }
            />
          );
        })}
      </div>
    </main>
  );
}
