// components/home/HomeRouter.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import type { HomeView } from '@/lib/types';
import HomeHero from './HomeHero';
import ProfileCards from './ProfileCards';
import PksList from './PksList';
import PksDetailView from './PksDetail';
import PpisDetail from './PpisDetail';
import PpkrDetail from './PpkrDetail';
import { PKS_LIST, getPksDetail } from '@/lib/data/pks';
import NewsSection from './NewsSection';
import { useSession } from 'next-auth/react';

// Client komponen yang sudah ada
import AppsClient from '@/app/apps/credentials/view-client';
import RequestFormClient from '@/app/info-login/request-form-client';
import ApprovalClient from '@/app/approval/view-client';

// ---- tipe ringan buat data ----
type Role = 'PKWT' | 'KARYAWAN' | 'KASUBAG' | 'KABAG' | 'GUEST';
type Decision = 'PENDING' | 'APPROVED' | 'REJECTED';
type Category = 'HO' | 'REGIONAL';

type App = { id: string; name: string; category: Category; username: string; password: string; description?: string | null };
type User = { id: string; name: string; email?: string | null };
type Approval = { id: string; requestId: string; approverId: string; role: Role; decision: Decision; note?: string | null; decidedAt?: string | Date | null; approver?: User | null };
type Request = { id: string; type: 'PKWT' | 'GUEST'; appId: string; requesterId: string; picId?: string | null; reason?: string | null; division?: string | null; status: Decision; rejectionNote?: string | null };
type MyReq = Request & { app: App; approvals: Approval[]; pic: User | null };
type Row = Request & { app: App; requester: User; approvals: (Approval & { approver: User })[]; pic: User | null };

// ----- Loader kecil untuk info-login -----
function InfoLoginPane() {
  const { data } = useSession();
  const role = (data?.user?.role ?? 'GUEST') as Role;
  const userName = data?.user?.name ?? '';

  const [apps, setApps] = useState<App[]>([]);
  const [myReqs, setMyReqs] = useState<MyReq[]>([]);
  const [pics, setPics] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [appsRes, reqsRes, picsRes] = await Promise.all([
          fetch('/api/apps', { cache: 'no-store' }),
          fetch('/api/requests', { cache: 'no-store' }),
          fetch('/api/pics', { cache: 'no-store' }),
        ]);
        const [appsJson, reqsJson, picsJson] = await Promise.all([
          appsRes.json(), reqsRes.json(), picsRes.json(),
        ]);
        if (!alive) return;
        setApps(appsJson);
        setMyReqs(reqsJson);
        setPics(picsJson);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-5">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="grid md:grid-cols-2 gap-3">
          <div className="h-36 bg-slate-200/70 dark:bg-slate-800/50 rounded" />
          <div className="h-36 bg-slate-200/70 dark:bg-slate-800/50 rounded" />
        </div>
      </div>
    );
  }

  if (role === 'KARYAWAN' || role === 'KASUBAG' || role === 'KABAG') {
    return <AppsClient role={role} apps={apps} myReqs={myReqs} pics={pics} />;
  }
  return <RequestFormClient role={role} apps={apps} pics={pics} myReqs={myReqs} userName={userName} />;
}

// ----- Loader kecil untuk approval -----
function ApprovalPane() {
  const { data } = useSession();
  const role = (data?.user?.role ?? 'GUEST') as Role;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/approval', { cache: 'no-store' });
        const json = await res.json();
        if (!alive) return;
        setRows(json);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-5">Memuat daftar permohonan…</div>;
  }
  return <ApprovalClient role={role} rows={rows} />;
}

export default function HomeRouter({
  forcedView,
  onViewChange,
}: {
  forcedView?: HomeView;
  onViewChange?: (v: HomeView) => void;
}) {
  // gunakan state internal hanya jika tidak dipaksa dari parent
  const [internalView, setInternalView] = useState<HomeView>('root');
  const [selectedPksId, setSelectedPksId] = useState<string | null>(null);

  const view = forcedView ?? internalView;

  const setView = (v: HomeView) => {
    if (forcedView) {
      onViewChange?.(v);    // parent yang mengontrol state
    } else {
      setInternalView(v);
      onViewChange?.(v);
    }
  };

  if (view === 'pks-list') {
    return (
      <PksList
        list={PKS_LIST}
        onBack={() => setView('root')}
        onSelect={(id) => {
          setSelectedPksId(id);
          setView('pks-detail');
        }}
      />
    );
  }

  if (view === 'pks-detail' && selectedPksId) {
    const detail = getPksDetail(selectedPksId);
    if (!detail) return null;
    return <PksDetailView detail={detail} onBack={() => setView('pks-list')} />;
  }

  if (view === 'ppis') return <PpisDetail onBack={() => setView('root')} />;
  if (view === 'ppkr') return <PpkrDetail onBack={() => setView('root')} />;

  // === Integrasi halaman lain sebagai sub-view ===
  if (view === 'info-login') return <InfoLoginPane />;
  if (view === 'approval') return <ApprovalPane />;

  // root
  return (
    <>
      <HomeHero />
      <ProfileCards
        onPks={() => setView('pks-list')}
        onPpis={() => setView('ppis')}
        onPpkr={() => setView('ppkr')}
      />
      <NewsSection />
    </>
  );
}
