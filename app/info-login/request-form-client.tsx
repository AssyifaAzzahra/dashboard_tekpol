// app/info-login/request-form-client.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Building2, Send, ShieldCheck, UserRound, LogIn } from 'lucide-react';
import TekpolTile, { StatusPill } from '@/components/ui/TekpolTile';

type Role = 'PKWT' | 'KARYAWAN' | 'KASUBAG' | 'KABAG' | 'GUEST';
type Decision = 'PENDING' | 'APPROVED' | 'REJECTED';
type Category = 'HO' | 'REGIONAL';

type App = { id: string; name: string; category: Category; username: string; password: string; description?: string | null };
type User = { id: string; name: string; email?: string | null };
type Approval = { id: string; requestId: string; approverId: string; role: Role; decision: Decision; note?: string | null; decidedAt?: Date | null; approver?: User | null };
type MyReq = { id: string; type: 'PKWT' | 'GUEST'; appId: string; requesterId: string; picId?: string | null; reason?: string | null; division?: string | null; status: Decision; rejectionNote?: string | null; approvals: Approval[]; app: App; pic: User | null };

export default function RequestFormClient({
  role, apps, pics, myReqs, userName,
}: {
  role: Role; apps: App[]; pics: User[]; myReqs: MyReq[]; userName: string;
}) {
  // COMMON
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // PKWT
  const [pkwtAppId, setPkwtAppId] = useState('');
  const [pkwtPicId, setPkwtPicId] = useState('');

  // GUEST
  const [guestName, setGuestName] = useState(userName);
  const [guestDivision, setGuestDivision] = useState('');
  const [guestReason, setGuestReason] = useState('');
  const [guestAppId, setGuestAppId] = useState('');

  // Approved popup
  const approvedReqs = useMemo(() => myReqs.filter((r) => r.status === 'APPROVED'), [myReqs]);
  const [showApproved, setShowApproved] = useState(approvedReqs.length > 0);
  useEffect(() => { if (approvedReqs.length > 0) setShowApproved(true); }, [approvedReqs.length]);

  async function submitPKWT(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErrorMsg('');
    if (!pkwtAppId || !pkwtPicId) return setErrorMsg('Pilih App & PIC.');
    try {
      setSubmitting(true);
      const res = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'PKWT', appId: pkwtAppId, picId: pkwtPicId }) });
      if (!res.ok) throw new Error(await res.text());
      window.location.reload();
    } catch (err) { setErrorMsg((err as Error).message); } finally { setSubmitting(false); }
  }

  async function submitGuest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErrorMsg('');
    if (!guestName.trim() || !guestDivision.trim() || !guestReason.trim() || !guestAppId) return setErrorMsg('Lengkapi data.');
    try {
      setSubmitting(true);
      const res = await fetch('/api/requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'GUEST', appId: guestAppId, name: guestName, division: guestDivision, reason: guestReason }),
      });
      if (!res.ok) throw new Error(await res.text());
      window.location.reload();
    } catch (err) { setErrorMsg((err as Error).message); } finally { setSubmitting(false); }
  }

  // === UI ===
  const formCard = role === 'PKWT' ? (
    <TekpolTile
      icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
      title="Permohonan Akses — PKWT"
      desc="Pilih aplikasi yang dibutuhkan dan PIC persetujuan."
      rightSlot={<div className="hidden md:block text-xs text-slate-400 pr-1">PIC wajib diisi</div>}
      asButton={false}
    >
      {/* we won’t use children; tile already renders structure */}
    </TekpolTile>
  ) : (
    <TekpolTile
      icon={<UserRound className="w-5 h-5 text-emerald-400" />}
      title="Permohonan Akses — Guest"
      desc="Isi identitas dan alasan. Permohonan akan dinilai oleh Kasubag & Kabag."
      rightSlot={<div className="hidden md:block text-xs text-slate-400 pr-1">Semua field wajib</div>}
      asButton={false}
    />
  );

  return (
    <main className="space-y-6">
      {/* === FORM di dalam kartu === */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 md:p-5 backdrop-blur">
        {role === 'PKWT' ? (
          <form onSubmit={submitPKWT} className="grid md:grid-cols-[2fr_2fr_auto] gap-3 md:gap-4">
            <select value={pkwtAppId} onChange={(e) => setPkwtAppId(e.target.value)} className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-300/50 dark:border-slate-700 px-3 py-2 text-sm" required>
              <option value="">Pilih App HO/Regional</option>
              <optgroup label="Apps HO">{apps.filter(a => a.category === 'HO').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>
              <optgroup label="Apps Regional">{apps.filter(a => a.category === 'REGIONAL').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>
            </select>
            <select value={pkwtPicId} onChange={(e) => setPkwtPicId(e.target.value)} className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-300/50 dark:border-slate-700 px-3 py-2 text-sm" required>
              <option value="">Pilih PIC</option>
              {pics.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button disabled={submitting} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold">{submitting ? 'Mengirim…' : 'Kirim ke PIC'}</button>
          </form>
        ) : (
          <form onSubmit={submitGuest} className="grid md:grid-cols-[2fr_2fr_2fr_auto] gap-3 md:gap-4">
            <select value={guestAppId} onChange={(e) => setGuestAppId(e.target.value)} className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-300/50 dark:border-slate-700 px-3 py-2 text-sm" required>
              <option value="">Pilih App HO/Regional</option>
              <optgroup label="Apps HO">{apps.filter(a => a.category === 'HO').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>
              <optgroup label="Apps Regional">{apps.filter(a => a.category === 'REGIONAL').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>
            </select>
            <div className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-300/50 dark:border-slate-700 px-3">
              <Building2 className="w-4 h-4 text-slate-400" />
              <input value={guestDivision} onChange={(e) => setGuestDivision(e.target.value)} placeholder="Divisi" className="w-full bg-transparent py-2 text-sm outline-none" required />
            </div>
            <input value={guestReason} onChange={(e) => setGuestReason(e.target.value)} placeholder="Alasan permohonan" className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-300/50 dark:border-slate-700 px-3 py-2 text-sm" required />
            <button disabled={submitting} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold">{submitting ? 'Mengirim…' : 'Kirim (Kasubag & Kabag)'}</button>
          </form>
        )}
        {errorMsg && <div className="text-sm mt-3 text-rose-400">{errorMsg}</div>}
      </div>

      {/* === STATUS PERMOHONAN – grid kartu seperti Apps === */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => {
          const r = myReqs.find((x) => x.appId === app.id);
          const status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' = r ? r.status : 'NONE';
          const canSeeCred = r?.status === 'APPROVED';

          return (
            <TekpolTile
              key={app.id}
              icon={<LogIn className="w-5 h-5 text-emerald-400" />}
              title={app.name}
              tag={app.category}
              desc={app.description ?? undefined}
              rightSlot={<StatusPill value={status} />}
              primaryText={canSeeCred ? 'Lihat' : 'Buka'}
              asButton={canSeeCred}
              onPrimary={() => {
                if (!canSeeCred) return;
                alert(`Username: ${app.username}\nPassword: ${app.password}`);
              }}
            />
          );
        })}
      </div>

      {/* Popup approved sederhana (opsional) */}
      {showApproved && approvedReqs.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-800 font-semibold">Akses Disetujui</div>
            <div className="p-5 space-y-3">
              {approvedReqs.map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200/60 dark:border-slate-800 p-3">
                  <div className="font-semibold text-sm">{r.app.name}</div>
                  <div className="grid grid-cols-2 gap-3 text-sm mt-2">
                    <div><div className="text-slate-500">Username</div><div className="font-mono">{r.app.username}</div></div>
                    <div><div className="text-slate-500">Password</div><div className="font-mono">{r.app.password}</div></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-200/70 dark:border-slate-800 text-right">
              <button onClick={() => setShowApproved(false)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold">Mengerti</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
