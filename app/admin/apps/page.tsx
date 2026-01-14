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
  ExternalLink,
} from "lucide-react";

type Category = "HO" | "REGIONAL";

type AppItem = {
  id: string;
  name: string;
  category: Category;
  username: string | null;
  password: string | null;
  url: string | null;
  description?: string | null;
  logoUrl?: string | null;
};

type AppForm = {
  name: string;
  category: Category;
  username: string;
  password: string;
  url: string;
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

async function readErrorText(res: Response) {
  try {
    const t = await res.text();
    return t?.slice(0, 500) || "";
  } catch {
    return "";
  }
}

export default function AdminAppsPage() {
  const [items, setItems] = useState<AppItem[]>([]);
  const [selected, setSelected] = useState<AppItem | null>(null);
  const [form, setForm] = useState<AppForm>(emptyForm);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const searchRef = useRef<HTMLInputElement | null>(null);

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
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message ?? "Gagal memuat data apps.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((it) => {
      return (
        (it.name ?? "").toLowerCase().includes(qq) ||
        (it.category ?? "").toLowerCase().includes(qq) ||
        (it.url ?? "").toLowerCase().includes(qq)
      );
    });
  }, [items, q]);

  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paged = useMemo(() => {
    const p = Math.min(Math.max(1, page), maxPage);
    const start = (p - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, maxPage]);

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

    setLogoFile(null);
    setLogoPreview(a.logoUrl ?? null);
  };

  const clearForm = () => {
    setSelected(null);
    setForm(emptyForm);
    setLogoFile(null);
    setLogoPreview(null);
    setErr(null);
  };

  // username/password opsional. URL tetap wajib.
  const create = async () => {
    setErr(null);

    if (!form.name.trim() || !form.url.trim()) {
      setErr("Nama dan URL wajib diisi.");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("category", form.category);
    fd.append("username", form.username ?? "");
    fd.append("password", form.password ?? "");
    fd.append("url", form.url);
    fd.append("description", form.description);

    if (logoFile) fd.append("logo", logoFile);

    const res = await fetch("/api/admin/apps", { method: "POST", body: fd });
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

    if (!form.name.trim() || !form.url.trim()) {
      setErr("Nama dan URL wajib diisi.");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("category", form.category);
    fd.append("username", form.username ?? "");
    fd.append("password", form.password ?? "");
    fd.append("url", form.url);
    fd.append("description", form.description);

    if (logoFile) fd.append("logo", logoFile);

    const id = encodeURIComponent(selected.id);
    const res = await fetch(`/api/admin/apps?id=${id}`, { method: "PATCH", body: fd });

    if (!res.ok) {
      const t = await readErrorText(res);
      setErr(`Gagal update app. (${res.status}) ${t}`);
      return;
    }

    await load();
  };

  const del = async () => {
    if (!selected) return;
    setErr(null);

    const ok = window.confirm(`Hapus app "${selected.name}"?`);
    if (!ok) return;

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: LIST */}
        <div className="rounded-2xl bg-white/80 border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full">
              <Search className="h-4 w-4 text-slate-500" />
              <Input
                ref={searchRef}
                placeholder="Cari apps..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <button
              onClick={load}
              className={cls(
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200",
                "hover:bg-slate-50 text-slate-700"
              )}
              title="Refresh"
            >
              <RefreshCcw className={cls("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>

          <div className="p-4">
            {err ? (
              <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {err}
              </div>
            ) : null}

            <div className="space-y-2">
              {paged.map((it) => {
                const active = selected?.id === it.id;

                // ✅ PAKSA string agar TS tidak error (href/src wajib string)
                const safeHref: string = it.url ?? "";
                const safeLogo: string = it.logoUrl ?? "";

                return (
                  <button
                    key={it.id}
                    onClick={() => pick(it)}
                    className={cls(
                      "w-full text-left p-3 rounded-2xl border transition",
                      active ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                            {safeLogo ? (
                              <img src={safeLogo} alt={it.name} className="h-full w-full object-contain" />
                            ) : (
                              <span className="text-[10px] text-slate-400">LOGO</span>
                            )}
                          </div>

                          <div className="font-semibold truncate">{it.name}</div>
                        </div>

                        <div className="text-xs text-slate-500 mt-1 truncate">
                          {it.category} • {it.url ?? "-"}
                        </div>
                      </div>

                      {safeHref ? (
                        <a
                          href={safeHref}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <span>Buka</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {filtered.length} item • halaman {Math.min(page, maxPage)} / {maxPage}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                  disabled={page >= maxPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="rounded-2xl bg-white/80 border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-semibold">{selected ? "Edit App" : "Tambah App"}</div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearForm}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                <span>Baru</span>
              </button>

              {selected ? (
                <button
                  onClick={del}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">Nama App</div>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: CMMS"
                />
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">Kategori</div>
                <select
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Category }))}
                >
                  <option value="HO">HO</option>
                  <option value="REGIONAL">REGIONAL</option>
                </select>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">Username (opsional)</div>
                <Input
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="username (boleh kosong)"
                />
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">Password (opsional)</div>
                <Input
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="password (boleh kosong)"
                />
              </div>

              <div className="md:col-span-2">
                <div className="text-sm font-medium text-slate-700 mb-1">URL</div>
                <Input
                  className="h-9"
                  placeholder="https://app.domain.com"
                  value={form.url}
                  onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                />
              </div>

              {/* LOGO UPLOAD */}
              <div className="md:col-span-2 space-y-2">
                <div className="text-sm font-medium text-slate-700">Logo App (opsional)</div>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                    {(() => {
                      // ✅ paksa string agar TS tidak error
                      const safePreview: string = logoPreview ?? "";
                      return safePreview ? (
                        <img
                          src={safePreview}
                          alt="logo preview"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="text-xs text-slate-400">No Logo</div>
                      );
                    })()}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setLogoFile(f);
                      if (f) setLogoPreview(URL.createObjectURL(f));
                    }}
                  />
                </div>

                <div className="text-xs text-slate-500">
                  Upload PNG/JPG/WebP. Logo akan tampil di card Tekpol Apps.
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-sm font-medium text-slate-700 mb-1">Deskripsi (opsional)</div>
                <Textarea
                  placeholder="Deskripsi"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!selected ? (
                <button
                  onClick={create}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah</span>
                </button>
              ) : (
                <button
                  onClick={update}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Simpan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
