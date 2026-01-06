"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";

type GalleryCategory = {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function AdminGalleryCategoriesPage() {
  const [items, setItems] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // create
  const [name, setName] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // edit
  const [edit, setEdit] = useState<GalleryCategory | null>(null);
  const [eName, setEName] = useState("");
  const [eOrder, setEOrder] = useState<number>(0);
  const [eActive, setEActive] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/gallery-categories?all=1", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as GalleryCategory[];
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Gagal load kategori");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));
  }, [items]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Nama kategori wajib diisi.");

    setBusy("create");
    try {
      const res = await fetch("/api/admin/gallery-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, order, isActive }),
      });
      if (!res.ok) throw new Error(await res.text());

      setName("");
      setOrder(0);
      setIsActive(true);
      await load();
    } catch (e: any) {
      setError(e?.message || "Gagal membuat kategori.");
    } finally {
      setBusy(null);
    }
  }

  function openEdit(it: GalleryCategory) {
    setEdit(it);
    setEName(it.name);
    setEOrder(it.order);
    setEActive(it.isActive);
  }

  async function saveEdit() {
    if (!edit) return;
    setError(null);
    setBusy(edit.id);
    try {
      const res = await fetch(`/api/admin/gallery-categories?id=${encodeURIComponent(edit.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: eName, order: eOrder, isActive: eActive }),
      });
      if (!res.ok) throw new Error(await res.text());

      setEdit(null);
      await load();
    } catch (e: any) {
      setError(e?.message || "Gagal update kategori.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    const ok = confirm("Hapus kategori ini? Jika masih dipakai galeri, hapus akan ditolak.");
    if (!ok) return;

    setError(null);
    setBusy(`del:${id}`);
    try {
      const res = await fetch(`/api/admin/gallery-categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e: any) {
      setError(e?.message || "Gagal hapus kategori.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminShell title="Kategori Galeri">
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white/70 backdrop-blur p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Kategori Galeri</h1>
              <p className="text-sm text-muted-foreground">
                Kelola kategori untuk dropdown di Admin Galeri dan grouping di dashboard.
              </p>
            </div>
            <button
              onClick={load}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              disabled={loading || !!busy}
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Create */}
        <form onSubmit={createItem} className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">Tambah Kategori</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Nama</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mis: Senam Pagi" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Urutan</label>
              <Input value={String(order)} onChange={(e) => setOrder(Number(e.target.value || 0))} />
              <div className="flex items-center gap-2">
                <input
                  id="act"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="act" className="text-sm">
                  Aktif
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={busy === "create"}
              className={cx(
                "rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm",
                busy === "create" ? "bg-gray-400" : "bg-black hover:bg-gray-900"
              )}
            >
              {busy === "create" ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>

        {/* List */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Daftar Kategori</h2>
            <span className="text-xs text-muted-foreground">{loading ? "Loading..." : `${items.length} kategori`}</span>
          </div>

          {loading ? (
            <div className="mt-4 text-sm text-muted-foreground">Memuat data...</div>
          ) : sorted.length === 0 ? (
            <div className="mt-4 text-sm text-muted-foreground">Belum ada kategori.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {sorted.map((it) => (
                <div key={it.id} className="rounded-2xl border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold">{it.name}</div>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">slug: {it.slug}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">order: {it.order}</span>
                        <span
                          className={cx(
                            "rounded-full px-2 py-1 text-xs font-medium",
                            it.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"
                          )}
                        >
                          {it.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Update: {new Date(it.updatedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(it)}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                        disabled={!!busy}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(it.id)}
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                        disabled={busy === `del:${it.id}` || !!busy}
                      >
                        {busy === `del:${it.id}` ? "..." : "Hapus"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {edit && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <div className="text-base font-semibold">Edit Kategori</div>
                  <div className="text-xs text-muted-foreground">ID: {edit.id}</div>
                </div>
                <button
                  onClick={() => setEdit(null)}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                  disabled={!!busy}
                >
                  Tutup
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama</label>
                    <Input value={eName} onChange={(e) => setEName(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Urutan</label>
                    <Input value={String(eOrder)} onChange={(e) => setEOrder(Number(e.target.value || 0))} />
                    <div className="flex items-center gap-2">
                      <input
                        id="eact"
                        type="checkbox"
                        checked={eActive}
                        onChange={(e) => setEActive(e.target.checked)}
                      />
                      <label htmlFor="eact" className="text-sm">
                        Aktif
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEdit(null)}
                    className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
                    disabled={!!busy}
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveEdit}
                    className={cx(
                      "rounded-xl px-4 py-2 text-sm font-medium text-white",
                      busy === edit.id ? "bg-gray-400" : "bg-black hover:bg-gray-900"
                    )}
                    disabled={busy === edit.id}
                  >
                    {busy === edit.id ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
