// components/home/HomeRouter.tsx
"use client";

import { useState, useEffect } from "react";
import type { HomeView } from "@/lib/types";

import HomeHero from "./HomeHero";
import ProfileCards from "./ProfileCards";
import PksList from "./PksList";
import PksDetailView from "./PksDetail";
import PpisDetail from "./PpisDetail";
import PpkrDetail from "./PpkrDetail";
import { PKS_LIST, getPksDetail } from "@/lib/data/pks";
import NewsSection from "./NewsSection";
import { useSession } from "next-auth/react";

import AppsClient from "@/app/apps/credentials/view-client";
import RequestFormClient from "@/app/(public)/info-login/request-form-client";
import ApprovalClient from "@/app/(public)/approval/view-client";

// ✅ Role sesuai requirement kamu
type Role =
  | "SUPERADMIN"
  | "ADMIN"
  | "PKWT"
  | "KARYAWAN"
  | "KASUBAG"
  | "KABAG"
  | "GUEST";

type Decision = "PENDING" | "APPROVED" | "REJECTED";
type Category = "HO" | "REGIONAL";

type App = {
  id: string;
  name: string;
  category: Category;
  username?: string | null;
  password?: string | null;
  description?: string | null;
  url?: string | null;
  logoUrl?: string | null;
};

type User = {
  id: string;
  name: string;
  email?: string | null;
};

type BaseRequest = {
  id: string;
  type: "PKWT" | "GUEST";
  appId: string;
  requesterId: string | null;
  guestName?: string | null;
  picId?: string | null;
  reason?: string | null;
  division?: string | null;
  status: Decision;
  rejectionNote?: string | null;
};

type Row = BaseRequest & {
  app: App;
  requester?: User | null;
  approvals: any[];
  pic: User | null;
};

// ----- Loader kecil untuk info-login -----
function InfoLoginPane() {
  const { data } = useSession();
  const role = (data?.user?.role ?? "GUEST") as Role;
  const userName = data?.user?.name ?? "";

  const [apps, setApps] = useState<App[]>([]);
  const [myReqs, setMyReqs] = useState<any[]>([]);
  const [pics, setPics] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ yang boleh lihat kredensial
  const canSeeCreds = role === "KARYAWAN" || role === "SUPERADMIN";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // ✅ karyawan/superadmin ambil apps yg berisi username/password
        const appsUrl = canSeeCreds ? "/api/apps/credentials" : "/api/apps";

        const [appsRes, reqsRes, picsRes] = await Promise.all([
          fetch(appsUrl, { cache: "no-store" }),
          fetch("/api/requests", { cache: "no-store" }),
          fetch("/api/pics", { cache: "no-store" }),
        ]);

        const [appsJson, reqsJson, picsJson] = await Promise.all([
          appsRes.json(),
          reqsRes.json(),
          picsRes.json(),
        ]);

        if (!alive) return;

        setApps(Array.isArray(appsJson) ? (appsJson as App[]) : []);
        setMyReqs(Array.isArray(reqsJson) ? (reqsJson as any[]) : []);
        setPics(Array.isArray(picsJson) ? (picsJson as User[]) : []);
      } catch {
        if (!alive) return;
        setApps([]);
        setMyReqs([]);
        setPics([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [canSeeCreds]);

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

  if (canSeeCreds) {
    return (
      <AppsClient
        role={role as any}
        apps={apps as any}
        myReqs={myReqs as any}
        pics={pics as any}
        currentUserName={userName}
      />
    );
  }

  return (
    <RequestFormClient
      role={role as any}
      apps={apps as any}
      pics={pics as any}
      myReqs={myReqs as any}
      userName={userName}
    />
  );
}

// ----- Loader kecil untuk approval -----
function ApprovalPane() {
  const { data } = useSession();
  const role = (data?.user?.role ?? "GUEST") as Role;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/approval", { cache: "no-store" });
      const json = await res.json();
      setRows(Array.isArray(json) ? (json as Row[]) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-5">
        Memuat daftar permohonan…
      </div>
    );
  }

  return <ApprovalClient role={role as any} rows={rows as any} onDone={load} />;
}

export default function HomeRouter({
  forcedView,
  onViewChange,
}: {
  forcedView?: HomeView;
  onViewChange?: (v: HomeView) => void;
}) {
  const [internalView, setInternalView] = useState<HomeView>("root");
  const [selectedPksId, setSelectedPksId] = useState<string | null>(null);

  const view = forcedView ?? internalView;

  const setView = (v: HomeView) => {
    if (forcedView) onViewChange?.(v);
    else setInternalView(v);
    onViewChange?.(v);
  };

  if (view === "pks-list") {
    return (
      <PksList
        list={PKS_LIST}
        onBack={() => setView("root")}
        onSelect={(id) => {
          setSelectedPksId(id);
          setView("pks-detail");
        }}
      />
    );
  }

  if (view === "pks-detail" && selectedPksId) {
    const detail = getPksDetail(selectedPksId);
    if (!detail) return null;
    return <PksDetailView detail={detail} onBack={() => setView("pks-list")} />;
  }

  if (view === "ppis") return <PpisDetail onBack={() => setView("root")} />;
  if (view === "ppkr") return <PpkrDetail onBack={() => setView("root")} />;

  // ✅ tetap di dashboard (sub-view)
  if (view === "info-login") return <InfoLoginPane />;

  if (view === "approval") return <ApprovalPane />;

  return (
    <>
      <HomeHero />
      <ProfileCards
        onPks={() => setView("pks-list")}
        onPpis={() => setView("ppis")}
        onPpkr={() => setView("ppkr")}
      />
      <NewsSection />
    </>
  );
}
