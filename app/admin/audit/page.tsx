"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { cls } from "@/lib/utils";
import {
  Search,
  RefreshCcw,
  RotateCcw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  User,
  Database,
  Hash,
} from "lucide-react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

type LogItem = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  actorEmail: string | null;
  createdAt: string;
  meta: JsonValue | null;
};

function badgeAction(action: string) {
  const a = action.toUpperCase();
  if (a.includes("DELETE")) return "bg-rose-50 text-rose-900 border-rose-200";
  if (a.includes("UPDATE") || a.includes("ASSIGN")) return "bg-sky-50 text-sky-900 border-sky-200";
  if (a.includes("APPROVE")) return "bg-emerald-50 text-emerald-900 border-emerald-200";
  if (a.includes("REJECT")) return "bg-amber-50 text-amber-900 border-amber-200";
  return "bg-slate-50 text-slate-900 border-slate-200";
}

function monoId(id: string) {
  return id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

function Panel({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-black">{title}</div>
            {subtitle ? <div className="mt-0.5 text-xs text-slate-600">{subtitle}</div> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function AdminAuditPage() {
  const [q, setQ] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());

      const res = await fetch(`/api/admin/audit?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        setErr("Gagal load audit log.");
        return;
      }
      const data = (await res.json()) as LogItem[];
      setLogs(Array.isArray(data) ? data : []);
      setPage(1);
      setExpandedId(null);
    } catch {
      setErr("Terjadi error jaringan saat load audit log.");
    } finally {
      setLoading(false);
    }
  }, [q]);

  // initial load tanpa useEffect
  const didInit = useRef(false);
  if (!didInit.current) {
    didInit.current = true;
    void load();
  }

  const quick = useMemo(
    () => [
      { label: "APPROVE", value: "APPROVE" },
      { label: "REJECT", value: "REJECT" },
      { label: "UPDATE", value: "UPDATE" },
      { label: "DELETE", value: "DELETE" },
      { label: "REQUEST", value: "Request" },
      { label: "USER", value: "User" },
      { label: "APP", value: "App" },
    ],
    []
  );

  // client-side pagination
  const total = logs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageLogs = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return logs.slice(start, start + PAGE_SIZE);
  }, [logs, safePage]);

  const appliedQuery = q.trim();

  return (
    <AdminShell title="Audit Log" subtitle="Cari & review histori perubahan data (clean UI + pagination)">
      {err && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 px-3 py-2 text-sm">
          {err}
        </div>
      )}

      {/* Top bar */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="text-sm text-slate-600">
          Menampilkan: <span className="font-semibold text-black">{total}</span> log
          {appliedQuery ? (
            <>
              {" "}
              • filter: <span className="font-mono text-xs text-slate-700">{appliedQuery}</span>
            </>
          ) : null}
          {loading ? <span className="ml-2 text-slate-500">• loading…</span> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 active:scale-[0.99] transition"
            onClick={load}
            type="button"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Search"}
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 active:scale-[0.99] transition"
            onClick={() => {
              setQ("");
              setExpandedId(null);
              void load(); // reload tanpa filter
            }}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Search */}
      <Panel
        title="Search"
        subtitle="Cari berdasarkan action / entity / entityId / actorEmail"
        right={
          <span className="inline-flex items-center gap-2 text-xs text-slate-600">
            <Filter className="h-4 w-4" />
            Filters
          </span>
        }
      >
        <div className="grid gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder="Contoh: UPDATE User, DELETE App, actor@email.com, Request"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2">
            {quick.map((c) => (
              <button
                key={c.label}
                className={cls(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition",
                  "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                )}
                type="button"
                onClick={() => {
                  setQ((prev) => (prev ? `${prev} ${c.value}` : c.value));
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* Table */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 flex items-center justify-between">
          <div className="text-sm font-semibold text-black">Logs</div>
          <div className="text-xs text-slate-600">
            Page <span className="font-semibold text-black">{safePage}</span> / {totalPages}
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left bg-slate-50 sticky top-0 z-10">
              <tr className="text-slate-600">
                <th className="p-3">Time</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">EntityId</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Meta</th>
              </tr>
            </thead>

            <tbody>
              {pageLogs.map((l) => {
                const expanded = expandedId === l.id;
                return (
                  <tr key={l.id} className="border-t border-slate-200 align-top hover:bg-slate-50/50">
                    <td className="p-3 whitespace-nowrap text-slate-700">
                      <div className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{new Date(l.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-slate-500" title={l.id}>
                        {monoId(l.id)}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={cls(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                          badgeAction(l.action)
                        )}
                      >
                        {l.action}
                      </span>
                    </td>

                    <td className="p-3 text-slate-900">
                      <div className="inline-flex items-center gap-2">
                        <Database className="h-4 w-4 text-slate-400" />
                        {l.entity}
                      </div>
                    </td>

                    <td className="p-3 text-slate-700">
                      <div className="inline-flex items-center gap-2">
                        <Hash className="h-4 w-4 text-slate-400" />
                        <span className="font-mono text-xs">{l.entityId ?? "-"}</span>
                      </div>
                    </td>

                    <td className="p-3 text-slate-700">
                      <div className="inline-flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        {l.actorEmail ?? "-"}
                      </div>
                    </td>

                    <td className="p-3">
                      <button
                        className="inline-flex items-center gap-2 text-xs rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-slate-900 hover:bg-slate-50 transition"
                        type="button"
                        onClick={() => setExpandedId((prev) => (prev === l.id ? null : l.id))}
                      >
                        {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {expanded ? "Hide" : "View"}
                      </button>

                      {expanded && (
                        <pre className="mt-2 text-xs text-slate-800 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3">
                          {JSON.stringify(l.meta ?? {}, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!loading && total === 0 && (
                <tr>
                  <td className="p-5 text-slate-600" colSpan={6}>
                    No logs.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td className="p-5 text-slate-600" colSpan={6}>
                    Memuat data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Menampilkan{" "}
            <span className="font-semibold text-black">
              {total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, total)}
            </span>{" "}
            dari <span className="font-semibold text-black">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-600">
        Tips: klik <span className="font-medium text-slate-900">View</span> untuk melihat detail meta perubahan.
        Pagination menampilkan <span className="font-medium text-slate-900">{PAGE_SIZE}</span> item per halaman.
      </div>
    </AdminShell>
  );
}
