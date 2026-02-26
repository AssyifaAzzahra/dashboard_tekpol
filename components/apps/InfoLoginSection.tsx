"use client";

import React from "react";
import AppsClient from "@/app/apps/credentials/view-client";
import type { App, MyReq, Role, User } from "@/app/apps/credentials/types";
type ApiPayload = {
  role: Role;
  currentUserName?: string;
  apps: App[];
  myReqs: MyReq[];
  pics: User[];
  error?: string;
};

export default function InfoLoginSection() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<ApiPayload>({
    role: "GUEST",
    currentUserName: "",
    apps: [],
    myReqs: [],
    pics: [],
  });

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/apps/credentials", { cache: "no-store" });
        const json = (await res.json()) as ApiPayload;

        if (!alive) return;

        if (!res.ok) {
          setData({
            role: "GUEST",
            currentUserName: "",
            apps: [],
            myReqs: [],
            pics: [],
            error: (json as any)?.error ?? "Gagal memuat data.",
          });
          return;
        }

        setData({
          role: json.role,
          currentUserName: json.currentUserName ?? "",
          apps: Array.isArray(json.apps) ? json.apps : [],
          myReqs: Array.isArray(json.myReqs) ? json.myReqs : [],
          pics: Array.isArray(json.pics) ? json.pics : [],
        });
      } catch {
        if (!alive) return;
        setData({
          role: "GUEST",
          currentUserName: "",
          apps: [],
          myReqs: [],
          pics: [],
          error: "Terjadi kesalahan jaringan.",
        });
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
      <section className="rounded-3xl overflow-hidden bg-white/60 border border-white/30 shadow-sm">
        <div className="p-5 text-sm text-slate-600">
          Memuat Info Username &amp; Password...
        </div>
      </section>
    );
  }

  if (data.error) {
    return (
      <section className="rounded-3xl overflow-hidden bg-white/60 border border-white/30 shadow-sm">
        <div className="p-5 text-sm text-red-600">{data.error}</div>
      </section>
    );
  }

  return (
    <AppsClient
      role={data.role}
      apps={data.apps}
      myReqs={data.myReqs}
      pics={data.pics}
      currentUserName={data.currentUserName}
    />
  );
}