"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  LayoutDashboard,
  ClipboardList,
  AppWindow,
  Users,
  ScrollText,
  RefreshCcw,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Timer,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

type KPI = {
  totalAll: number;
  totalToday: number;
  totalMonth: number;
  pendingAll: number;
  approvedAll: number;
  rejectedAll: number;
};

type AuditItem = {
  id: string;
  createdAt: string;
  action: string;
  entity: string;
  entityId: string | null;
  actorEmail: string | null;
};

type KpiResponse = {
  kpi: KPI;
  pendingList: unknown[];
};

type AuditResponse = AuditItem[];

// ---------------- UI helpers (modern + clean) ----------------

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "indigo",
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  hint?: string;
  tone?: "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet";
}) {
  const toneMap: Record<
    NonNullable<typeof tone>,
    {
      ring: string;
      bg: string;
      chip: string;
      iconWrap: string;
      iconText: string;
      glow: string;
    }
  > = {
    indigo: {
      ring: "ring-indigo-200/60",
      bg: "from-indigo-50/70 via-white to-white",
      chip: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      iconWrap:
        "bg-indigo-600/10 border-indigo-200/60 group-hover:bg-indigo-600/15",
      iconText: "text-indigo-700",
      glow: "bg-indigo-400/10",
    },
    emerald: {
      ring: "ring-emerald-200/60",
      bg: "from-emerald-50/70 via-white to-white",
      chip: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      iconWrap:
        "bg-emerald-600/10 border-emerald-200/60 group-hover:bg-emerald-600/15",
      iconText: "text-emerald-700",
      glow: "bg-emerald-400/10",
    },
    amber: {
      ring: "ring-amber-200/60",
      bg: "from-amber-50/70 via-white to-white",
      chip: "bg-amber-50 text-amber-800 border-amber-200/70",
      iconWrap:
        "bg-amber-600/10 border-amber-200/60 group-hover:bg-amber-600/15",
      iconText: "text-amber-800",
      glow: "bg-amber-400/10",
    },
    rose: {
      ring: "ring-rose-200/60",
      bg: "from-rose-50/70 via-white to-white",
      chip: "bg-rose-50 text-rose-700 border-rose-200/70",
      iconWrap:
        "bg-rose-600/10 border-rose-200/60 group-hover:bg-rose-600/15",
      iconText: "text-rose-700",
      glow: "bg-rose-400/10",
    },
    sky: {
      ring: "ring-sky-200/60",
      bg: "from-sky-50/70 via-white to-white",
      chip: "bg-sky-50 text-sky-700 border-sky-200/70",
      iconWrap:
        "bg-sky-600/10 border-sky-200/60 group-hover:bg-sky-600/15",
      iconText: "text-sky-700",
      glow: "bg-sky-400/10",
    },
    violet: {
      ring: "ring-violet-200/60",
      bg: "from-violet-50/70 via-white to-white",
      chip: "bg-violet-50 text-violet-700 border-violet-200/70",
      iconWrap:
        "bg-violet-600/10 border-violet-200/60 group-hover:bg-violet-600/15",
      iconText: "text-violet-700",
      glow: "bg-violet-400/10",
    },
  };

  const t = toneMap[tone];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        "transition hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      {/* soft gradient backdrop */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100",
          t.bg
        )}
      />
      {/* subtle glow blob */}
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl",
          t.glow
        )}
      />

      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-600">{label}</div>

            <div className="mt-2 flex items-end gap-2">
              <div className="text-3xl font-semibold tracking-tight text-slate-950">
                {value}
              </div>

              {hint ? (
                <span
                  className={cn(
                    "mb-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    t.chip
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {hint}
                </span>
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "shrink-0 rounded-2xl border p-2.5 transition",
              t.iconWrap,
              t.ring,
              "ring-1"
            )}
          >
            <div className={cn("h-5 w-5", t.iconText)}>{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500" />
          <div className="text-base font-semibold text-slate-950">{title}</div>
        </div>
        {subtitle ? (
          <div className="mt-0.5 text-sm text-slate-600">{subtitle}</div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  desc,
  icon,
  tone = "indigo",
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tone?: "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet";
}) {
  const toneMap: Record<
    NonNullable<typeof tone>,
    { chip: string; iconWrap: string; glow: string; bar: string }
  > = {
    indigo: {
      chip: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      iconWrap: "bg-indigo-600/10 border-indigo-200/60 text-indigo-700",
      glow: "bg-indigo-400/10",
      bar: "from-indigo-500/0 via-indigo-500/30 to-indigo-500/0",
    },
    emerald: {
      chip: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      iconWrap: "bg-emerald-600/10 border-emerald-200/60 text-emerald-700",
      glow: "bg-emerald-400/10",
      bar: "from-emerald-500/0 via-emerald-500/30 to-emerald-500/0",
    },
    amber: {
      chip: "bg-amber-50 text-amber-800 border-amber-200/70",
      iconWrap: "bg-amber-600/10 border-amber-200/60 text-amber-800",
      glow: "bg-amber-400/10",
      bar: "from-amber-500/0 via-amber-500/30 to-amber-500/0",
    },
    rose: {
      chip: "bg-rose-50 text-rose-700 border-rose-200/70",
      iconWrap: "bg-rose-600/10 border-rose-200/60 text-rose-700",
      glow: "bg-rose-400/10",
      bar: "from-rose-500/0 via-rose-500/30 to-rose-500/0",
    },
    sky: {
      chip: "bg-sky-50 text-sky-700 border-sky-200/70",
      iconWrap: "bg-sky-600/10 border-sky-200/60 text-sky-700",
      glow: "bg-sky-400/10",
      bar: "from-sky-500/0 via-sky-500/30 to-sky-500/0",
    },
    violet: {
      chip: "bg-violet-50 text-violet-700 border-violet-200/70",
      iconWrap: "bg-violet-600/10 border-violet-200/60 text-violet-700",
      glow: "bg-violet-400/10",
      bar: "from-violet-500/0 via-violet-500/30 to-violet-500/0",
    },
  };

  const t = toneMap[tone];

  return (
    <a
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        "transition hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      {/* top subtle bar */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r",
          t.bar
        )}
      />
      {/* glow blob */}
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl transition group-hover:scale-110",
          t.glow
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold text-slate-950">
              {title}
            </div>
            <span
              className={cn(
                "hidden md:inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                t.chip
              )}
            >
              Admin
            </span>
          </div>
          <div className="mt-1 text-sm text-slate-600">{desc}</div>
        </div>

        <div className={cn("shrink-0 rounded-2xl border p-2.5", t.iconWrap)}>
          <div className="h-5 w-5">{icon}</div>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          Buka menu
          <span className="hidden sm:inline">admin</span>
        </span>
        <span className="inline-flex items-center gap-1 text-slate-950">
          <span className="opacity-70 transition group-hover:opacity-100">
            Open
          </span>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  );
}

function monoCompactId(v: string) {
  if (v.length <= 10) return v;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function ActionBadge({ action }: { action: string }) {
  const a = (action || "").toLowerCase();

  const tone =
    a.includes("approve") || a === "approved"
      ? "emerald"
      : a.includes("reject") || a === "rejected"
        ? "rose"
        : a.includes("create")
          ? "sky"
          : a.includes("update") || a.includes("edit")
            ? "amber"
            : "indigo";

  const map: Record<
    string,
    { cls: string; icon: React.ReactNode; label: string }
  > = {
    emerald: {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: action,
    },
    rose: {
      cls: "bg-rose-50 text-rose-700 border-rose-200/70",
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: action,
    },
    sky: {
      cls: "bg-sky-50 text-sky-700 border-sky-200/70",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      label: action,
    },
    amber: {
      cls: "bg-amber-50 text-amber-800 border-amber-200/70",
      icon: <Timer className="h-3.5 w-3.5" />,
      label: action,
    },
    indigo: {
      cls: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      icon: <Sparkles className="h-3.5 w-3.5" />,
      label: action,
    },
  };

  const t = map[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-medium",
        t.cls
      )}
      title={action}
    >
      {t.icon}
      <span className="max-w-[220px] truncate">{t.label}</span>
    </span>
  );
}

function SkeletonLine({ w }: { w: string }) {
  return (
    <div
      className={cn(
        "h-4 rounded-md bg-slate-100 animate-pulse",
        w || "w-full"
      )}
    />
  );
}

export default function AdminDashboardPage() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      // KPI
      const res = await fetch("/api/admin/kpi", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setErr(
          `Gagal load KPI. Pastikan login sebagai SUPERADMIN. (${res.status}) ${text}`
        );
        return;
      }
      const json = (await res.json()) as KpiResponse;
      setKpi(json.kpi);

      // Audit Log
      const resLog = await fetch("/api/admin/audit", { cache: "no-store" });
      if (!resLog.ok) {
        const text = await resLog.text().catch(() => "");
        setErr(`Gagal load Audit Log. (${resLog.status}) ${text}`);
        return;
      }
      const audit = (await resLog.json()) as AuditResponse;
      setLogs(Array.isArray(audit) ? audit.slice(0, 12) : []);
    } catch {
      setErr("Terjadi error jaringan saat load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalAll = kpi?.totalAll ?? 0;
  const pendingAll = kpi?.pendingAll ?? 0;
  const approvedAll = kpi?.approvedAll ?? 0;
  const rejectedAll = kpi?.rejectedAll ?? 0;

  const right = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 shadow-sm backdrop-blur">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <div className="text-xs text-slate-600">
            Status:{" "}
            <span className="font-medium text-slate-900">
              {loading ? "Refreshing" : "Ready"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={load}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm",
            "hover:bg-slate-50 active:scale-[0.99] transition"
          )}
        >
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    ),
    [load, loading]
  );

  return (
    <AdminShell
      title="Admin Dashboard"
      subtitle="Ringkasan KPI & audit log terbaru"
      right={right}
    >
      {/* page backdrop (subtle) */}
      <div className="relative">
        <div className="pointer-events-none absolute -inset-x-6 -top-6 h-40 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-emerald-500/10 blur-2xl" />
      </div>

      {err && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 shadow-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <div className="min-w-0">{err}</div>
          </div>
        </div>
      )}

      {/* KPI */}
      <SectionHeader
        title="KPI"
        subtitle="Ringkasan request (all / hari ini / bulan ini)"
      />

      <div className="mt-3 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total"
          value={kpi ? totalAll : loading ? "…" : "-"}
          hint="All time"
          tone="indigo"
          icon={<LayoutDashboard className="h-5 w-5" />}
        />
        <StatCard
          label="Hari Ini"
          value={kpi?.totalToday ?? (loading ? "…" : "-")}
          hint="Today"
          tone="sky"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Bulan Ini"
          value={kpi?.totalMonth ?? (loading ? "…" : "-")}
          hint="This month"
          tone="violet"
          icon={<ScrollText className="h-5 w-5" />}
        />

        <StatCard
          label="Pending"
          value={kpi ? pendingAll : loading ? "…" : "-"}
          hint="Need review"
          tone="amber"
          icon={<Timer className="h-5 w-5" />}
        />
        <StatCard
          label="Approved"
          value={kpi ? approvedAll : loading ? "…" : "-"}
          hint="Success"
          tone="emerald"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="Rejected"
          value={kpi ? rejectedAll : loading ? "…" : "-"}
          hint="Declined"
          tone="rose"
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <SectionHeader
          title="Quick Actions"
          subtitle="Akses cepat menu admin"
        />

        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <QuickActionCard
            href="/admin"
            title="Dashboard"
            desc="Ringkasan KPI"
            tone="indigo"
            icon={<LayoutDashboard className="h-5 w-5" />}
          />
          <QuickActionCard
            href="/admin/requests"
            title="Requests"
            desc={`Kelola request (${pendingAll} pending)`}
            tone="amber"
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <QuickActionCard
            href="/admin/apps"
            title="Apps"
            desc="CRUD aplikasi"
            tone="sky"
            icon={<AppWindow className="h-5 w-5" />}
          />
          <QuickActionCard
            href="/admin/users"
            title="Users"
            desc="CRUD users & roles"
            tone="violet"
            icon={<Users className="h-5 w-5" />}
          />
          <QuickActionCard
            href="/admin/audit"
            title="Audit"
            desc="Riwayat perubahan"
            tone="emerald"
            icon={<ScrollText className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Audit Log */}
      <div className="mt-8">
        <SectionHeader
          title="Audit Log Terbaru"
          subtitle="Aktivitas perubahan data terakhir"
          right={
            <a
              href="/admin/audit"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Lihat semua
              <ArrowRight className="h-4 w-4" />
            </a>
          }
        />

        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-left">
                <tr className="text-slate-600">
                  <th className="p-3 whitespace-nowrap">Waktu</th>
                  <th className="p-3 whitespace-nowrap">Action</th>
                  <th className="p-3 whitespace-nowrap">Entity</th>
                  <th className="p-3 whitespace-nowrap">Entity ID</th>
                  <th className="p-3 whitespace-nowrap">Actor</th>
                </tr>
              </thead>

              <tbody>
                {/* Loading skeleton */}
                {loading && logs.length === 0 && (
                  <>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`sk-${i}`} className="border-t border-slate-200">
                        <td className="p-3">
                          <SkeletonLine w="w-40" />
                        </td>
                        <td className="p-3">
                          <SkeletonLine w="w-32" />
                        </td>
                        <td className="p-3">
                          <SkeletonLine w="w-36" />
                        </td>
                        <td className="p-3">
                          <SkeletonLine w="w-32" />
                        </td>
                        <td className="p-3">
                          <SkeletonLine w="w-44" />
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {!loading &&
                  logs.map((a) => (
                    <tr
                      key={a.id}
                      className="border-t border-slate-200 hover:bg-slate-50/70"
                    >
                      <td className="p-3 whitespace-nowrap text-slate-900">
                        {fmtDateTime(a.createdAt)}
                      </td>
                      <td className="p-3">
                        <ActionBadge action={a.action} />
                      </td>
                      <td className="p-3 text-slate-950">{a.entity}</td>
                      <td
                        className="p-3 font-mono text-slate-900"
                        title={a.entityId ?? ""}
                      >
                        {a.entityId ? monoCompactId(a.entityId) : "-"}
                      </td>
                      <td className="p-3 text-slate-900">
                        {a.actorEmail ?? "-"}
                      </td>
                    </tr>
                  ))}

                {!loading && logs.length === 0 && (
                  <tr>
                    <td className="p-6 text-slate-600" colSpan={5}>
                      Tidak ada log.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
            <div className="text-xs text-slate-500">
              Menampilkan 12 log terbaru.
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              Tips: klik “Lihat semua” untuk filter & pencarian
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
