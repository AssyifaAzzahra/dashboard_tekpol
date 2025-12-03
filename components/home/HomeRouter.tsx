// components/home/HomeRouter.tsx
'use client';

import { useState, useEffect } from 'react';
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

// Client components lain
import AppsClient from '@/app/apps/credentials/view-client';
import RequestFormClient from '@/app/info-login/request-form-client';
import ApprovalClient from '@/app/approval/view-client';

// ---- tipe dasar ----
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

type User = {
  id: string;
  name: string;
  email?: string | null;
};

// ====== APPROVAL UNTUK INFO-LOGIN (MyReq) ======
type ApprovalInfo = {
  id: string;
  requestId: string;
  approverId: string;
  role: Role;
  decision: Decision;
  note?: string | null;
  // Di sisi info-login (AppsClient) sebelumnya error karena
  // sisi lain mengharapkan Date | null → kita pakai Date di sini
  decidedAt?: Date | null;
  approver?: User | null;
};

// ====== APPROVAL UNTUK HALAMAN APPROVAL (rows) ======
type ApprovalRow = {
  id: string;
  requestId: string;
  approverId: string;
  role: Role;
  decision: Decision;
  note?: string | null;
  // Di sisi ApprovalClient (view-client.tsx) dari error kelihatan
  // dia mengharapkan string | null
  decidedAt?: string | null;
  approver: User;
};

// ====== REQUEST DASAR (tanpa relasi) ======
type BaseRequest = {
  id: string;
  type: 'PKWT' | 'GUEST';
  appId: string;
  requesterId: string;
  picId?: string | null;
  reason?: string | null;
  division?: string | null;
  status: Decision;
  rejectionNote?: string | null;
};

// ====== REQUEST UNTUK INFO-LOGIN (MyReq) ======
type MyReq = BaseRequest & {
  app: App;
  approvals: ApprovalInfo[];
  pic: User | null;
};

// ====== REQUEST UNTUK HALAMAN APPROVAL (rows) ======
type Row = BaseRequest & {
  app: App;
  requester: User;
  approvals: ApprovalRow[];
  pic: User | null;
};

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
          appsRes.json(),
          reqsRes.json(),
          picsRes.json(),
        ]);

        if (!alive) return;

        // Di sini kita "anggap" bentuknya sudah cocok dengan MyReq
        // (kalau mau lebih strict bisa map & convert decidedAt ke Date)
        setApps(appsJson as App[]);
        setMyReqs(reqsJson as MyReq[]);
        setPics(picsJson as User[]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
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

  return (
    <RequestFormClient
      role={role}
      apps={apps}
      pics={pics}
      myReqs={myReqs}
      userName={userName}
    />
  );
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

        // Di sini juga kita anggap sudah cocok dengan Row
        // (kalau API kirim decidedAt string, ini nyambung dengan ApprovalRow)
        setRows(json as Row[]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-5">
        Memuat daftar permohonan…
      </div>
    );
  }

  // ApprovalClient di view-client.tsx mengharapkan:
  // props: { role: Role; rows: Request[] }
  // Di sini Row sudah disusun supaya struktur-nya sama dengan yang dia harapkan
  return <ApprovalClient role={role} rows={rows} />;
}

export default function HomeRouter({
  forcedView,
  onViewChange,
}: {
  forcedView?: HomeView;
  onViewChange?: (v: HomeView) => void;
}) {
  // state internal dipakai kalau tidak ada forcedView dari parent
  const [internalView, setInternalView] = useState<HomeView>('root');
  const [selectedPksId, setSelectedPksId] = useState<string | null>(null);

  const view = forcedView ?? internalView;

  const setView = (v: HomeView) => {
    if (forcedView) {
      // kalau parent yang kontrol state view
      onViewChange?.(v);
    } else {
      setInternalView(v);
      onViewChange?.(v);
    }
  };

  // === PKS list ===
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

  // === PKS detail ===
  if (view === 'pks-detail' && selectedPksId) {
    const detail = getPksDetail(selectedPksId);
    if (!detail) return null;
    return (
      <PksDetailView
        detail={detail}
        onBack={() => setView('pks-list')}
      />
    );
  }

  // === PPIS & PPKR ===
  if (view === 'ppis') {
    return <PpisDetail onBack={() => setView('root')} />;
  }

  if (view === 'ppkr') {
    return <PpkrDetail onBack={() => setView('root')} />;
  }

  // === Integrasi halaman lain sebagai sub-view ===
  if (view === 'info-login') {
    return <InfoLoginPane />;
  }

  if (view === 'approval') {
    return <ApprovalPane />;
  }

  // === ROOT ===
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
