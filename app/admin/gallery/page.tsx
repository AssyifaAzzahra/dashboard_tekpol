"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Gallery = {
  id: string;
  title: string | null;
  caption: string | null;
  category: string | null;
  imageUrl: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

type GalleryCategory = {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
};

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<Gallery[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ file input ref (biar file pasti kebaca)
  const fileRef = useRef<HTMLInputElement | null>(null);
  const editFileRef = useRef<HTMLInputElement | null>(null);

  // create form
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<string>(""); // "" = Umum
  const [order, setOrder] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);

  // edit panel
  const [edit, setEdit] = useState<Gallery | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editOrder, setEditOrder] = useState<number>(0);
  const [editVisible, setEditVisible] = useState(true);

  // quick add category modal
  const [catModal, setCatModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catOrder, setCatOrder] = useState<number>(0);
  const [catActive, setCatActive] = useState(true);

  async function loadGallery() {
    const res = await fetch("/api/admin/gallery", { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json()) as Gallery[];
    setItems(data);
  }

  async function loadCategories() {
    // kalau ingin hanya aktif: "/api/admin/gallery-categories"
    // kalau ingin semua: "/api/admin/gallery-categories?all=1"
    const res = await fetch("/api/admin/gallery-categories?all=1", { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json()) as GalleryCategory[];
    setCategories(data);
  }

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadGallery(), loadCategories()]);
    } catch (e: any) {
      setError(e?.message || "Gagal load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt));
  }, [items]);

  const sortedCategories = useMemo(() => {
    // tampilkan yang aktif dulu + urut order
    return [...categories].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.order - b.order || a.name.localeCompare(b.name);
    });
  }, [categories]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // ✅ ambil file dari input DOM agar tidak miss
    const f = fileRef.current?.files?.[0] ?? file;
    if (!f) {
      setError("File gambar wajib diupload.");
      return;
    }

    setBusy("create");
    try {
      const fd = new FormData();
      fd.set("image", f);
      fd.set("title", title);
      fd.set("caption", caption);
      fd.set("category", category);
      fd.set("order", String(order));
      fd.set("isVisible", String(isVisible));

      const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());

      // reset
      if (fileRef.current) fileRef.current.value = "";
      setFile(null);
      setTitle("");
      setCaption("");
      setCategory("");
      setOrder(0);
      setIsVisible(true);

      await loadGallery();
    } catch (e: any) {
      setError(e?.message || "Gagal membuat item galeri.");
    } finally {
      setBusy(null);
    }
  }

  function openEdit(it: Gallery) {
    setEdit(it);
    setEditFile(null);
    if (editFileRef.current) editFileRef.current.value = "";
    setEditTitle(it.title ?? "");
    setEditCaption(it.caption ?? "");
    setEditCategory(it.category ?? "");
    setEditOrder(it.order ?? 0);
    setEditVisible(it.isVisible ?? true);
  }

  async function saveEdit() {
    if (!edit) return;
    setError(null);

    setBusy(edit.id);
    try {
      const fd = new FormData();
      fd.set("title", editTitle);
      fd.set("caption", editCaption);
      fd.set("category", editCategory);
      fd.set("order", String(editOrder));
      fd.set("isVisible", String(editVisible));

      // ✅ ambil file edit dari input ref juga
      const f = editFileRef.current?.files?.[0] ?? editFile;
      if (f) fd.set("image", f);

      const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(edit.id)}`, {
        method: "PATCH",
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());

      setEdit(null);
      await loadGallery();
    } catch (e: any) {
      setError(e?.message || "Gagal update galeri.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    const ok = confirm("Hapus item galeri ini?");
    if (!ok) return;

    setError(null);
    setBusy(`del:${id}`);
    try {
      const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await loadGallery();
    } catch (e: any) {
      setError(e?.message || "Gagal delete galeri.");
    } finally {
      setBusy(null);
    }
  }

  async function quickAddCategory() {
    setError(null);
    const name = catName.trim();
    if (!name) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    setBusy("create-cat");
    try {
      // ✅ jangan kirim slug, karena API kamu bikin slug sendiri
      const payload = {
        name,
        order: Number.isFinite(catOrder) ? catOrder : 0,
        isActive: !!catActive,
      };

      const res = await fetch("/api/admin/gallery-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      await loadCategories();
      setCategory(name);

      setCatName("");
      setCatOrder(0);
      setCatActive(true);
      setCatModal(false);
    } catch (e: any) {
      setError(e?.message || "Gagal membuat kategori.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminShell title="Galeri">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border bg-white/70 backdrop-blur p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Galeri</h1>
              <p className="text-sm text-muted-foreground">
                Upload gambar untuk halaman publik. Kategori diambil dari master <b>Kategori Galeri</b>.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCatModal(true)}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                disabled={loading || !!busy}
              >
                + Tambah Kategori
              </button>

              <button
                onClick={loadAll}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                disabled={loading || !!busy}
              >
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Create */}
        <form onSubmit={createItem} className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Tambah Item Galeri</h2>
            <span className="text-xs text-muted-foreground">*Wajib gambar</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gambar</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.currentTarget.files?.[0] ?? null;
                  setFile(f);
                  if (f) setError(null);
                }}
                className="block w-full rounded-xl border bg-white px-3 py-2 text-sm"
              />
              {(fileRef.current?.files?.[0] || file) && (
                <p className="text-xs text-muted-foreground">
                  {(fileRef.current?.files?.[0] ?? file)?.name} •{" "}
                  {(((fileRef.current?.files?.[0] ?? file) as File).size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Urutan</label>
              <Input value={String(order)} onChange={(e) => setOrder(Number(e.target.value || 0))} placeholder="0" />
              <div className="flex items-center gap-2">
                <input id="vis" type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
                <label htmlFor="vis" className="text-sm">
                  Tampilkan di publik
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Judul (opsional)</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mis: Upacara Hari Besar" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full rounded-xl border bg-white px-3 py-2 text-sm"
              >
                <option value="">Umum</option>
                {sortedCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.isActive ? c.name : `${c.name} (inactive)`}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Kelola daftar di menu <b>Kategori Galeri</b>.
                </p>
                <button
                  type="button"
                  onClick={() => setCatModal(true)}
                  className="text-xs underline text-slate-600 hover:text-slate-900"
                >
                  tambah cepat
                </button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Caption (opsional)</label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Deskripsi singkat..."
                className="min-h-[90px]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
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
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Daftar Galeri</h2>
            <span className="text-xs text-muted-foreground">{loading ? "Loading..." : `${items.length} item`}</span>
          </div>

          {loading ? (
            <div className="mt-4 text-sm text-muted-foreground">Memuat data...</div>
          ) : sorted.length === 0 ? (
            <div className="mt-4 text-sm text-muted-foreground">Belum ada item galeri.</div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((it) => (
                <div key={it.id} className="group overflow-hidden rounded-2xl border bg-white">
                  <div className="relative aspect-[4/3] bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.imageUrl} alt={it.title ?? "gallery"} className="h-full w-full object-cover" />
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span
                        className={cx(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          it.isVisible ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"
                        )}
                      >
                        {it.isVisible ? "Visible" : "Hidden"}
                      </span>
                      <span className="rounded-full bg-white/80 px-2 py-1 text-xs">Order: {it.order}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{it.title || "Tanpa Judul"}</div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        Kategori: <span className="font-medium">{it.category || "Umum"}</span>
                      </div>

                      {it.caption && <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{it.caption}</div>}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openEdit(it)}
                        className="flex-1 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
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

        {/* Edit Panel */}
        {edit && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <div className="text-base font-semibold">Edit Galeri</div>
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
                    <label className="text-sm font-medium">Judul</label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="block w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Umum</option>
                      {sortedCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.isActive ? c.name : `${c.name} (inactive)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Urutan</label>
                    <Input value={String(editOrder)} onChange={(e) => setEditOrder(Number(e.target.value || 0))} />
                    <div className="flex items-center gap-2">
                      <input
                        id="editvis"
                        type="checkbox"
                        checked={editVisible}
                        onChange={(e) => setEditVisible(e.target.checked)}
                      />
                      <label htmlFor="editvis" className="text-sm">
                        Tampilkan di publik
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Caption</label>
                    <Textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} className="min-h-[90px]" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Ganti Gambar (opsional)</label>
                    <input
                      ref={editFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                      className="block w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    />
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={edit.imageUrl} alt="preview" className="h-16 w-24 rounded-xl object-cover border" />
                      <div className="text-xs text-muted-foreground">
                        {(editFileRef.current?.files?.[0] || editFile) ? `File baru: ${(editFileRef.current?.files?.[0] ?? editFile)?.name}` : "Tidak ada file baru."}
                      </div>
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

        {/* Quick Add Category Modal */}
        {catModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <div className="text-base font-semibold">Tambah Kategori Galeri</div>
                  <div className="text-xs text-muted-foreground">Untuk membuat kegiatan baru</div>
                </div>
                <button
                  onClick={() => setCatModal(false)}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                  disabled={!!busy}
                >
                  Tutup
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Kategori</label>
                  <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Mis: Kegiatan CSR" />
                  <p className="text-xs text-muted-foreground">Slug akan otomatis dibuat oleh server.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Urutan</label>
                    <Input value={String(catOrder)} onChange={(e) => setCatOrder(Number(e.target.value || 0))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        id="catActive"
                        type="checkbox"
                        checked={catActive}
                        onChange={(e) => setCatActive(e.target.checked)}
                      />
                      <label htmlFor="catActive" className="text-sm">
                        Aktif
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setCatModal(false)}
                    className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
                    disabled={!!busy}
                  >
                    Batal
                  </button>
                  <button
                    onClick={quickAddCategory}
                    className={cx(
                      "rounded-xl px-4 py-2 text-sm font-medium text-white",
                      busy === "create-cat" ? "bg-gray-400" : "bg-black hover:bg-gray-900"
                    )}
                    disabled={busy === "create-cat"}
                  >
                    {busy === "create-cat" ? "Menyimpan..." : "Simpan Kategori"}
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
