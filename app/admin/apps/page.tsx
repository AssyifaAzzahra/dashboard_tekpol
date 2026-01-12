// app/admin/apps/page.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cls } from "@/lib/utils";
import {
  Search,
  RefreshCcw,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";

type Category = "HO" | "REGIONAL";

type AppItem = {
  id: string;
  name: string;
  category: Category;
  username: string | null; // ✅ optional
  password: string | null; // ✅ optional
  url: string | null;      // ✅ kalau DB ngirim null
  description?: string | null;
};

type AppForm = {
  name: string;
  category: Category;
  username: string;  // input selalu string
  password: string;  // input selalu string
  url: string;       // ✅ wajib string untuk input
  description: string;
};

const emptyForm: AppForm = {
  name: "",
  category: "HO",
  username: "",
  password: "",
  url: "",
  description: "",
};

function parseCategory(v: string): Category {
  return v === "REGIONAL" ? "REGIONAL" : "HO";
}

function toOptional(v: string): string | undefined {
  const t = (v ?? "").trim();
  return t ? t : undefined;
}

async function readErrorText(res: Response) {
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json();
      // kalau API kamu punya {message: "..."} biar lebih enak
      if (j && typeof j.message === "string") return j.message;
      return JSON.stringify(j);
    }
    return await res.text();
  } catch {
    return "";
  }
}

const PAGE_SIZE = 10;

export default function AdminAppsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [selected, setSelected] = useState<AppItem | null>(null);
  const [form, setForm] = useState<AppForm>(emptyForm);
  const [q, setQ] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/apps", { cache: "no-store" });
      if (!res.ok) {
        const t = await readErrorText(res);
        setErr(`Gagal memuat data apps. (${res.status}) ${t}`);
        return;
      }
      const data = (await res.json()) as AppItem[];
      setApps(Array.isArray(data) ? data : []);
      setPage(1);
    } catch {
      setErr("Gagal memuat data apps (network error).");
    } finally {
      setLoading(false);
    }
  }, []);

  const didInit = useRef(false);
  if (!didInit.current) {
    didInit.current = true;
    void load();
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return apps;
    return apps.filter((a) => {
      const url = (a.url ?? "").toLowerCase();
      return (
        (a.name ?? "").toLowerCase().includes(s) ||
        (a.username ?? "").toLowerCase().includes(s) ||
        url.includes(s) ||
        (a.description ?? "").toLowerCase().includes(s) ||
        (a.category ?? "").toLowerCase().includes(s)
      );
    });
  }, [apps, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageApps = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const pick = (a: AppItem) => {
    setSelected(a);
    setErr(null);
    setForm({
      name: a.name ?? "",
      category: a.category ?? "HO",
      username: a.username ?? "",
      password: a.password ?? "",
      url: a.url ?? "",
      description: a.description ?? "",
    });
  };

  const clearForm = () => {
    setSelected(null);
    setForm(emptyForm);
    setErr(null);
  };

  const validateRequired = () => {
    if (!form.name.trim() || !form.url.trim()) {
      setErr("Nama dan URL wajib diisi.");
      return false;
    }
    return true;
  };

  const create = async () => {
    setErr(null);
    if (!validateRequired()) return;

    // ✅ kirim username/password optional
    const payload = {
      name: form.name.trim(),
      category: form.category,
      url: form.url.trim(),
      username: toOptional(form.username),
      password: toOptional(form.password),
      description: toOptional(form.description),
    };

    const res = await fetch("/api/admin/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await readErrorText(res);
      setErr(`Gagal create app. (${res.status}) ${t}`);
      return;
    }

    clearForm();
    await load();
  };

  const update = async () => {
    if (!selected) return;
    setErr(null);
    if (!validateRequired()) return;

    const payload = {
      name: form.name.trim(),
      category: form.category,
      url: form.url.trim(),
      username: toOptional(form.username),
      password: toOptional(form.password),
      description: toOptional(form.description),
    };

    const id = encodeURIComponent(selected.id);
    const res = await fetch(`/api/admin/apps?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await readErrorText(res);
      setErr(`Gagal update app. (${res.status}) ${t}`);
      return;
    }

    await load();
  };

  const remove = async () => {
    if (!selected) return;
    const ok = confirm(`Hapus app "${selected.name}"?`);
    if (!ok) return;

    setErr(null);

    const id = encodeURIComponent(selected.id);
    const res = await fetch(`/api/admin/apps?id=${id}`, { method: "DELETE" });

    if (!res.ok) {
      const t = await readErrorText(res);
      setErr(`Gagal delete app. (${res.status}) ${t}`);
      return;
    }

    clearForm();
    await load();
  };

  return (
    <AdminShell title="Apps">
      {err ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 px-3 py-2 text-sm">
          {err}
        </div>
      ) : null}

      {/* Top bar */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">
          Total: <span className="font-semibold text-slate-900">{total}</span> apps
          {loading ? <span className="ml-2 text-slate-500">• loading…</span> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-9 rounded-xl"
              placeholder="Cari (name / url / deskripsi)…"
              value={q ?? ""}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50"
          >
            <RefreshCcw className={cls("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>

          <button
            type="button"
            onClick={clearForm}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* LIST */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-3 border-b border-slate-200 font-semibold flex items-center justify-between">
            <span>Daftar Apps</span>
            <span className="text-xs text-slate-600">
              Page <span className="font-semibold text-slate-900">{safePage}</span> / {totalPages}
            </span>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <tbody>
                {pageApps.map((a) => {
                  const active = selected?.id === a.id;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => pick(a)}
                      className={cls(
                        "border-t border-slate-200 hover:bg-slate-50 cursor-pointer",
                        active && "bg-slate-50"
                      )}
                    >
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{a.name}</div>
                        <div className="text-xs text-slate-500 truncate">{a.url ?? ""}</div>
                        {a.description ? (
                          <div className="mt-1 text-xs text-slate-500 line-clamp-1">{a.description}</div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}

                {!loading && total === 0 ? (
                  <tr>
                    <td className="p-5 text-slate-600">Tidak ada apps.</td>
                  </tr>
                ) : null}

                {loading ? (
                  <tr>
                    <td className="p-5 text-slate-600">Memuat data...</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Menampilkan{" "}
              <span className="font-semibold text-slate-900">
                {total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, total)}
              </span>{" "}
              dari <span className="font-semibold text-slate-900">{total}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-900">{selected ? "Edit App" : "Create App"}</div>
            {selected ? (
              <span className="text-xs text-slate-700 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                Selected
              </span>
            ) : null}
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <Input
              placeholder="Nama App *"
              value={form.name ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />

            <select
              className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={form.category ?? "HO"}
              onChange={(e) => setForm((p) => ({ ...p, category: parseCategory(e.target.value) }))}
            >
              <option value="HO">HO</option>
              <option value="REGIONAL">REGIONAL</option>
            </select>
          </div>

          <Input
            placeholder="Username (opsional)"
            value={form.username ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          />

          <Input
            placeholder="Password (opsional)"
            value={form.password ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />

          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="https://app.domain.com *"
              value={form.url ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            />
          </div>

          <Textarea
            placeholder="Deskripsi (opsional)"
            value={form.description ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />

          <div className="flex flex-wrap gap-2 pt-1">
            {!selected ? (
              <button onClick={create} className="btn-primary" type="button">
                <span className="inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create
                </span>
              </button>
            ) : (
              <>
                <button onClick={update} className="btn-secondary" type="button">
                  <span className="inline-flex items-center gap-2">
                    <Pencil className="w-4 h-4" /> Update
                  </span>
                </button>

                <button onClick={remove} className="btn-secondary" type="button">
                  <span className="inline-flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </span>
                </button>
              </>
            )}

            <button onClick={clearForm} className="btn-secondary" type="button">
              Reset
            </button>
          </div>

          <div className="text-xs text-slate-600 pt-3 border-t border-slate-200">
            Endpoint: <span className="font-mono">/api/admin/apps</span> (POST) &nbsp;|&nbsp;{" "}
            <span className="font-mono">/api/admin/apps?id=...</span> (PATCH/DELETE)
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
