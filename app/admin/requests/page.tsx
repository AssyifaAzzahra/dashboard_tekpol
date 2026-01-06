"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cls } from "@/lib/utils";
import {
  Search,
  Filter,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  UserCircle2,
  Building2,
  BadgeCheck,
  BadgeX,
  Hourglass,
} from "lucide-react";

type UserItem = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  isPic: boolean;
};

type RequestRow = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  type: "PKWT" | "GUEST";
  createdAt: string;
  app?: { id: string; name: string; category: "HO" | "REGIONAL" } | null;
  requester?: { id: string; name: string } | null;
  guestName?: string | null;
  pic?: { id: string; name: string } | null;
};

type ApprovalItem = {
  id: string;
  role: string;
  decision: "PENDING" | "APPROVED" | "REJECTED";
  note?: string | null;
  decidedAt?: string | null;
  approver?: { id: string; name: string } | null;
};

type RequestDetail = RequestRow & {
  picId?: string | null;
  reason?: string | null;
  rejectionNote?: string | null;
  approvals?: ApprovalItem[];
};

// ---- filter types + parsers ----
const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const TYPE_OPTIONS = ["ALL", "PKWT", "GUEST"] as const;
type TypeFilter = (typeof TYPE_OPTIONS)[number];

const CATEGORY_OPTIONS = ["ALL", "HO", "REGIONAL"] as const;
type CategoryFilter = (typeof CATEGORY_OPTIONS)[number];

function parseStatus(v: string): StatusFilter {
  return (STATUS_OPTIONS as readonly string[]).includes(v) ? (v as StatusFilter) : "ALL";
}
function parseType(v: string): TypeFilter {
  return (TYPE_OPTIONS as readonly string[]).includes(v) ? (v as TypeFilter) : "ALL";
}
function parseCategory(v: string): CategoryFilter {
  return (CATEGORY_OPTIONS as readonly string[]).includes(v) ? (v as CategoryFilter) : "ALL";
}

// ---- style helpers (match dashboard style) ----
function statusTone(s: RequestRow["status"]) {
  if (s === "APPROVED") return "bg-emerald-50 text-emerald-900 border-emerald-200";
  if (s === "REJECTED") return "bg-rose-50 text-rose-900 border-rose-200";
  return "bg-amber-50 text-amber-900 border-amber-200";
}
function typeTone(t: RequestRow["type"]) {
  return t === "PKWT"
    ? "bg-sky-50 text-sky-900 border-sky-200"
    : "bg-slate-50 text-slate-900 border-slate-200";
}

function StatusIcon({ s }: { s: RequestRow["status"] }) {
  if (s === "APPROVED") return <BadgeCheck className="h-4 w-4" />;
  if (s === "REJECTED") return <BadgeX className="h-4 w-4" />;
  return <Hourglass className="h-4 w-4" />;
}

function MonoId({ id }: { id: string }) {
  const short = id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
  return (
    <span className="font-mono text-[12px] text-slate-900" title={id}>
      {short}
    </span>
  );
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
    <div
      className={cls(
        "relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      )}
    >
      {/* subtle accent (same feel as dashboard) */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-400/10 blur-2xl" />
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500" />
              <div className="text-sm font-semibold text-slate-950">{title}</div>
            </div>
            {subtitle ? <div className="mt-0.5 text-xs text-slate-600">{subtitle}</div> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/**
 * Pagination client-side (10 items/page).
 * Catatan: API kamu sekarang `take: 200`. Pagination ini hanya mengatur tampilan di UI.
 * Kalau mau pagination beneran server-side: tambahkan query `page` & `take` di API.
 */
const PAGE_SIZE = 10;

export default function AdminRequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const pics = useMemo(() => users.filter((u) => u.isPic), [users]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [type, setType] = useState<TypeFilter>("ALL");
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [picId, setPicId] = useState<string>("ALL");

  const [selected, setSelected] = useState<RequestDetail | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    if (!res.ok) throw new Error("Gagal load users");
    const u = (await res.json()) as UserItem[];
    setUsers(u);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({ q, status, type, category, picId });

      const res = await fetch(`/api/admin/requests?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setErr(`Gagal load requests (pastikan SUPERADMIN). (${res.status}) ${text}`);
        return;
      }
      const list = (await res.json()) as RequestRow[];
      setRows(list);
      setPage(1); // reset page saat filter berubah / reload
    } catch {
      setErr("Terjadi error jaringan saat load requests.");
    } finally {
      setLoading(false);
    }
  }, [q, status, type, category, picId]);

  const openDetail = useCallback(async (id: string) => {
    setErr(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/requests?id=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setErr(`Gagal membuka detail request. (${res.status}) ${text}`);
        return;
      }

      const data = (await res.json()) as RequestDetail;
      setSelected(data);
      setNote(data.rejectionNote ?? "");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const assignPic = useCallback(
    async (requestId: string, newPicId: string) => {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ASSIGN_PIC", requestId, picId: newPicId }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        alert(`Gagal assign PIC. (${res.status}) ${text}`);
        return;
      }
      const updated = (await res.json()) as RequestDetail;
      setSelected(updated);
      await load();
    },
    [load]
  );

  const decide = useCallback(
    async (requestId: string, decision: "APPROVED" | "REJECTED") => {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "DECIDE", requestId, decision, note }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        alert(`Gagal update keputusan. (${res.status}) ${text}`);
        return;
      }
      const updated = (await res.json()) as RequestDetail;
      setSelected(updated);
      await load();
    },
    [load, note]
  );

  useEffect(() => {
    (async () => {
      try {
        await loadUsers();
        await load();
      } catch {
        setErr("Gagal load master data.");
      }
    })();
  }, [loadUsers, load]);

  // ---------- pagination ----------
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  return (
    <AdminShell title="Request Management" subtitle="Filter, lihat detail, assign PIC, dan override keputusan">
      {/* page backdrop (same as dashboard) */}
      <div className="relative">
        <div className="pointer-events-none absolute -inset-x-6 -top-6 h-40 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-emerald-500/10 blur-2xl" />
      </div>

      {/* Error Banner */}
      {err && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 px-3 py-2 text-sm shadow-sm">
          {err}
        </div>
      )}

      {/* Top bar mini */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="text-sm text-slate-600">
          Total: <span className="font-semibold text-slate-950">{total}</span> request
          {loading ? <span className="ml-2 text-slate-500">• loading…</span> : null}
        </div>

        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <Panel
        title="Filters"
        subtitle="Gunakan filter untuk mempersempit data, lalu klik baris untuk membuka detail"
        right={
          <div className="inline-flex items-center gap-2 text-xs text-slate-600">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </div>
        }
      >
        <div className="grid md:grid-cols-5 gap-2">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-9 rounded-xl border-slate-200 focus-visible:ring-slate-200"
              placeholder="Search (id/app/name/reason...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={status}
            onChange={(e) => setStatus(parseStatus(e.target.value))}
          >
            <option value="ALL">Status: ALL</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <select
            className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={type}
            onChange={(e) => setType(parseType(e.target.value))}
          >
            <option value="ALL">Type: ALL</option>
            <option value="PKWT">PKWT</option>
            <option value="GUEST">GUEST</option>
          </select>

          <select
            className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={category}
            onChange={(e) => setCategory(parseCategory(e.target.value))}
          >
            <option value="ALL">Category: ALL</option>
            <option value="HO">HO</option>
            <option value="REGIONAL">REGIONAL</option>
          </select>

          <select
            className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={picId}
            onChange={(e) => setPicId(e.target.value)}
          >
            <option value="ALL">PIC: ALL</option>
            {pics.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
            onClick={load}
            type="button"
          >
            Apply Filter
          </button>

          <button
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
            type="button"
            onClick={() => {
              setQ("");
              setStatus("ALL");
              setType("ALL");
              setCategory("ALL");
              setPicId("ALL");
            }}
          >
            Reset
          </button>

          {selected && (
            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
              type="button"
              onClick={() => setSelected(null)}
            >
              Close Detail
            </button>
          )}
        </div>
      </Panel>

      {/* Main content */}
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        {/* TABLE */}
        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl" />

          <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-slate-700" />
              <div className="text-sm font-semibold text-slate-950">Requests</div>
            </div>
            <div className="text-xs text-slate-600">
              Page <span className="font-semibold text-slate-950">{safePage}</span> / {totalPages}
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left bg-slate-50 sticky top-0 z-10">
                <tr className="text-slate-600">
                  <th className="p-3">ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">App</th>
                  <th className="p-3">PIC</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const active = selected?.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      className={cls(
                        "border-t border-slate-200 cursor-pointer transition",
                        "hover:bg-slate-50/70",
                        active && "bg-slate-50"
                      )}
                      onClick={() => openDetail(r.id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <MonoId id={r.id} />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={cls(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
                            statusTone(r.status)
                          )}
                        >
                          <StatusIcon s={r.status} />
                          {r.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={cls(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                            typeTone(r.type)
                          )}
                        >
                          {r.type}
                        </span>
                      </td>

                      <td className="p-3 text-slate-800">
                        <div className="inline-flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          <span>{r.app?.name ?? "-"}</span>
                        </div>
                      </td>

                      <td className="p-3 text-slate-800">
                        <div className="inline-flex items-center gap-2">
                          <UserCircle2 className="h-4 w-4 text-slate-500" />
                          <span>{r.pic?.name ?? "-"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td className="p-5 text-slate-500" colSpan={5}>
                      No data.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td className="p-5 text-slate-500" colSpan={5}>
                      Memuat data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Menampilkan{" "}
              <span className="font-semibold text-slate-950">
                {total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, total)}
              </span>{" "}
              dari <span className="font-semibold text-slate-950">{total}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* DETAIL */}
        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />

          <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-950">Detail</div>
            {detailLoading ? <div className="text-xs text-slate-600">Loading…</div> : null}
          </div>

          <div className="p-4 md:p-5">
            {!selected ? (
              <div className="text-sm text-slate-600">
                Klik row di tabel untuk melihat detail.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">Request ID</div>
                    <div className="mt-1">
                      <MonoId id={selected.id} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={cls(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
                        statusTone(selected.status)
                      )}
                    >
                      <StatusIcon s={selected.status} />
                      {selected.status}
                    </span>
                    <span
                      className={cls(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                        typeTone(selected.type)
                      )}
                    >
                      {selected.type}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">App</div>
                    <div className="mt-1 text-slate-950 font-medium">
                      {selected.app?.name ?? "-"}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Category</div>
                    <div className="text-slate-700">{selected.app?.category ?? "-"}</div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Requester / Guest</div>
                    <div className="mt-1 text-slate-950 font-medium">
                      {selected.requester?.name ?? selected.guestName ?? "-"}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">PIC</div>
                    <div className="text-slate-700">{selected.pic?.name ?? "-"}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="text-xs text-slate-500">Reason</div>
                  <div className="text-slate-800 whitespace-pre-wrap mt-1">
                    {selected.reason ?? "-"}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="text-sm">
                    <div className="text-xs text-slate-500 mb-1">Assign PIC</div>
                    <select
                      className="w-full border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
                      value={selected.picId ?? ""}
                      onChange={(e) => assignPic(selected.id, e.target.value)}
                    >
                      <option value="" disabled>
                        Pilih PIC
                      </option>
                      {pics.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-sm">
                    <div className="text-xs text-slate-500 mb-1">Note (untuk reject)</div>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Catatan..."
                      className="min-h-[44px] rounded-xl border-slate-200 focus-visible:ring-slate-200"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 shadow-sm hover:bg-emerald-100 active:scale-[0.99] transition"
                    type="button"
                    onClick={() => decide(selected.id, "APPROVED")}
                  >
                    Approve (Override)
                  </button>
                  <button
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 shadow-sm hover:bg-rose-100 active:scale-[0.99] transition"
                    type="button"
                    onClick={() => decide(selected.id, "REJECTED")}
                  >
                    Reject (Override)
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <div className="text-sm font-semibold text-slate-950">Approval History</div>

                  <div className="mt-2 space-y-2 text-sm">
                    {(selected.approvals ?? []).map((a) => (
                      <div
                        key={a.id}
                        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-slate-950">{a.role}</div>
                            <div className="text-xs text-slate-600 mt-1">
                              Approver: {a.approver?.name ?? "-"} •{" "}
                              {a.decidedAt ? new Date(a.decidedAt).toLocaleString() : "—"}
                            </div>
                          </div>

                          <span
                            className={cls(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                              statusTone(a.decision)
                            )}
                          >
                            {a.decision}
                          </span>
                        </div>

                        {a.note ? (
                          <div className="text-slate-700 mt-2">
                            <span className="text-xs text-slate-500">Note</span>
                            <div className="mt-1">{a.note}</div>
                          </div>
                        ) : null}
                      </div>
                    ))}

                    {(selected.approvals ?? []).length === 0 && (
                      <div className="text-slate-600">Tidak ada approval record.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
