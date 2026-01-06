"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type News = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function toDatetimeLocalValue(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function AdminNewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // create form
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState(""); // datetime-local

  // edit modal
  const [edit, setEdit] = useState<News | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eExcerpt, setEExcerpt] = useState("");
  const [eContent, setEContent] = useState("");
  const [eIsPublished, setEIsPublished] = useState(false);
  const [ePublishedAt, setEPublishedAt] = useState("");
  const [eCoverFile, setECoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/news", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as News[];
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Gagal load berita.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Judul wajib diisi.");
    if (!content.trim()) return setError("Konten wajib diisi.");

    setBusy("create");
    try {
      const fd = new FormData();
      fd.set("title", title.trim());
      if (excerpt.trim()) fd.set("excerpt", excerpt.trim());
      fd.set("content", content);
      fd.set("isPublished", String(isPublished));
      if (publishedAt) fd.set("publishedAt", new Date(publishedAt).toISOString());
      if (cover) fd.set("cover", cover);

      const res = await fetch("/api/admin/news", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());

      // reset form
      setTitle("");
      setExcerpt("");
      setContent("");
      setCover(null);
      setIsPublished(false);
      setPublishedAt("");

      await load();
    } catch (e: any) {
      setError(e?.message || "Gagal membuat berita.");
    } finally {
      setBusy(null);
    }
  }

  function openEdit(it: News) {
    setEdit(it);
    setETitle(it.title);
    setEExcerpt(it.excerpt ?? "");
    setEContent(it.content);
    setEIsPublished(!!it.isPublished);
    setEPublishedAt(toDatetimeLocalValue(it.publishedAt));
    setECoverFile(null);
    setRemoveCover(false);
  }

  async function saveEdit() {
    if (!edit) return;
    setError(null);

    if (!eTitle.trim()) return setError("Judul wajib diisi.");
    if (!eContent.trim()) return setError("Konten wajib diisi.");

    setBusy(edit.id);
    try {
      const fd = new FormData();
      fd.set("title", eTitle.trim());
      fd.set("excerpt", eExcerpt.trim()); // boleh kosong -> backend boleh normalkan jadi null
      fd.set("content", eContent);
      fd.set("isPublished", String(eIsPublished));
      fd.set("publishedAt", ePublishedAt ? new Date(ePublishedAt).toISOString() : "");
      fd.set("removeCover", String(removeCover));
      if (eCoverFile) fd.set("cover", eCoverFile);

      const res = await fetch(`/api/admin/news?id=${encodeURIComponent(edit.id)}`, {
        method: "PATCH",
        body: fd,
      });

      if (!res.ok) throw new Error(await res.text());

      setEdit(null);
      await load();
    } catch (e: any) {
      setError(e?.message || "Gagal update berita.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    const ok = confirm("Hapus berita ini?");
    if (!ok) return;

    setError(null);
    setBusy(`del:${id}`);
    try {
      const res = await fetch(`/api/admin/news?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e: any) {
      setError(e?.message || "Gagal hapus berita.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminShell title="Berita">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border bg-white/70 backdrop-blur p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Berita</h1>
              <p className="text-sm text-muted-foreground">
                Buat, publish, dan kelola berita. Cover image optional.
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
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Tambah Berita</h2>
            <span className="text-xs text-muted-foreground">Konten wajib</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Judul</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul berita..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ringkasan (opsional)</label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan singkat..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Konten</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Isi berita..."
                className="min-h-[180px]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cover (opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                  className="block w-full rounded-xl border bg-white px-3 py-2 text-sm"
                />
                {cover && (
                  <p className="text-xs text-muted-foreground">
                    {cover.name} • {(cover.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="pub"
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  <label htmlFor="pub" className="text-sm">
                    Publish
                  </label>
                </div>

                <label className="text-xs text-muted-foreground">Tanggal publish (opsional)</label>
                <Input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
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
          </div>
        </form>

        {/* List */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Daftar Berita</h2>
            <span className="text-xs text-muted-foreground">
              {loading ? "Loading..." : `${items.length} berita`}
            </span>
          </div>

          {loading ? (
            <div className="mt-4 text-sm text-muted-foreground">Memuat data...</div>
          ) : sorted.length === 0 ? (
            <div className="mt-4 text-sm text-muted-foreground">Belum ada berita.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {sorted.map((it) => (
                <div key={it.id} className="rounded-2xl border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold">{it.title}</div>

                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          /{it.slug}
                        </span>

                        <span
                          className={cx(
                            "rounded-full px-2 py-1 text-xs font-medium",
                            it.isPublished
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-200 text-gray-700"
                          )}
                        >
                          {it.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      {it.excerpt && (
                        <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {it.excerpt}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-muted-foreground">
                        Publish:{" "}
                        {it.publishedAt ? new Date(it.publishedAt).toLocaleString() : "-"}{" "}
                        • Dibuat: {new Date(it.createdAt).toLocaleString()}
                      </div>

                      {it.coverImageUrl ? (
                        <div className="mt-3 flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={it.coverImageUrl}
                            alt="cover"
                            className="h-14 w-20 rounded-xl object-cover border"
                          />
                          <div className="text-xs text-muted-foreground">
                            Cover terpasang
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-muted-foreground">Tanpa cover</div>
                      )}
                    </div>

                    <div className="flex gap-2 md:shrink-0">
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
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <div className="text-base font-semibold">Edit Berita</div>
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
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Judul</label>
                    <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ringkasan</label>
                    <Textarea
                      value={eExcerpt}
                      onChange={(e) => setEExcerpt(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Konten</label>
                    <Textarea
                      value={eContent}
                      onChange={(e) => setEContent(e.target.value)}
                      className="min-h-[180px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          id="epub"
                          type="checkbox"
                          checked={eIsPublished}
                          onChange={(e) => setEIsPublished(e.target.checked)}
                        />
                        <label htmlFor="epub" className="text-sm">
                          Publish
                        </label>
                      </div>

                      <label className="text-xs text-muted-foreground">Tanggal publish (opsional)</label>
                      <Input
                        type="datetime-local"
                        value={ePublishedAt}
                        onChange={(e) => setEPublishedAt(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cover</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setECoverFile(e.target.files?.[0] ?? null)}
                        className="block w-full rounded-xl border bg-white px-3 py-2 text-sm"
                      />

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {eCoverFile ? `File baru: ${eCoverFile.name}` : "Tidak ada file baru."}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            id="rmcover"
                            type="checkbox"
                            checked={removeCover}
                            onChange={(e) => setRemoveCover(e.target.checked)}
                          />
                          <label htmlFor="rmcover" className="text-xs">
                            Hapus cover
                          </label>
                        </div>
                      </div>

                      {edit.coverImageUrl && !removeCover && (
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={edit.coverImageUrl}
                            alt="cover"
                            className="h-14 w-20 rounded-xl object-cover border"
                          />
                          <div className="text-xs text-muted-foreground">
                            Cover saat ini
                          </div>
                        </div>
                      )}
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

                <div className="text-xs text-muted-foreground">
                  Catatan: tombol Edit memakai method <b>PATCH</b>. Pastikan API <code>/api/admin/news</code> punya handler PATCH.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
