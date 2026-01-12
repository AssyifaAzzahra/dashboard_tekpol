// app/admin/pks-deck/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { PKS_LIST } from "@/lib/data/pks";

type Row = {
  id: string;
  pksId: string;
  fileUrl: string;
  fileName: string;
  fileType?: string;
  coverUrl?: string | null;
  updatedAt: string | Date;
};

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function isPdf(nameOrUrl: string) {
  const s = nameOrUrl.toLowerCase();
  return s.endsWith(".pdf");
}

export default function AdminPksDeckPage() {
  const options = useMemo(() => PKS_LIST, []);
  const [rows, setRows] = useState<Row[]>([]);
  const [pksId, setPksId] = useState(options[0]?.id ?? "pks-tandun");

  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [preview, setPreview] = useState<{ url: string; name: string; pksId: string; type?: string } | null>(
    null
  );

  const load = async () => {
    const res = await fetch("/api/admin/pks-deck", { cache: "no-store" });
    const { json, text } = await safeJson(res);

    if (!res.ok) {
      console.error("LOAD ERROR:", res.status, text);
      setMsg((json as any)?.error ?? `Gagal load data (${res.status})`);
      setRows([]);
      return;
    }

    setRows(Array.isArray(json) ? json : []);
  };

  useEffect(() => {
    void load();
  }, []);

  const previewSrc = (url: string, name: string, type?: string) => {
    if (type === "pdf" || isPdf(name) || isPdf(url)) return url;
    // lebih enak untuk iframe (slide)
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  };

  const onUpload = async () => {
    if (!file) {
      setMsg("Pilih file PPT/PPTX atau PDF dulu.");
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const fd = new FormData();
      fd.append("pksId", pksId);
      fd.append("file", file);
      if (cover) fd.append("cover", cover);

      const res = await fetch("/api/admin/pks-deck", { method: "POST", body: fd });
      const { json, text } = await safeJson(res);

      if (!res.ok) {
        console.error("UPLOAD ERROR:", res.status, text);
        setMsg((json as any)?.error ?? `Upload gagal (${res.status})`);
        return;
      }

      setMsg("Upload / Update sukses ✅");
      setFile(null);
      setCover(null);

      const inputFile = document.getElementById("pks-deck-file") as HTMLInputElement | null;
      if (inputFile) inputFile.value = "";
      const inputCover = document.getElementById("pks-deck-cover") as HTMLInputElement | null;
      if (inputCover) inputCover.value = "";

      await load();
    } catch (e) {
      console.error(e);
      setMsg("Upload gagal (lihat console).");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Yakin mau hapus file Profil (PPT/PDF) untuk PKS ini?")) return;

    try {
      const res = await fetch(`/api/admin/pks-deck?pksId=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const { json, text } = await safeJson(res);

      if (!res.ok) {
        console.error("DELETE ERROR:", res.status, text);
        alert((json as any)?.error ?? "Gagal hapus.");
        return;
      }

      if (preview?.pksId === id) setPreview(null);
      await load();
    } catch (e) {
      console.error(e);
      alert("Gagal hapus (lihat console).");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Upload Profil PKS (PPT/PDF)</h1>
        <p className="text-sm text-slate-500">
          Untuk PPT/PPTX: upload juga <b>Cover</b> (PNG/JPG) supaya kartu “Profil” ada thumbnail.
          PDF bisa dipakai langsung.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium">Pilih PKS</label>
            <select
              value={pksId}
              onChange={(e) => setPksId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              {options.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="text-sm font-medium">File (PPT/PPTX/PDF)</label>
              <input
                id="pks-deck-file"
                type="file"
                accept=".ppt,.pptx,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
              <div className="text-xs text-slate-500 mt-1">Max 30MB.</div>
            </div>

            <div>
              <label className="text-sm font-medium">Cover (opsional, untuk PPT/PPTX)</label>
              <input
                id="pks-deck-cover"
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
              <div className="text-xs text-slate-500 mt-1">
                Upload cover supaya kartu Profil ada thumbnail (PNG/JPG/WEBP).
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onUpload}
          disabled={loading || !file}
          className="
            relative z-10
            rounded-xl px-4 py-2
            bg-emerald-600 text-white
            hover:bg-emerald-700
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "Uploading..." : "Upload / Update"}
        </button>

        {msg && <div className="text-sm">{msg}</div>}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold mb-3">Daftar file tersimpan</h2>

        <div className="space-y-3">
          {rows.length === 0 && <div className="text-sm text-slate-500">Belum ada data.</div>}

          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="font-medium">{r.pksId}</div>
                <div className="text-sm text-slate-600 truncate">{r.fileName}</div>

                {r.coverUrl ? (
                  <div className="text-xs text-emerald-700 mt-1">Cover: ada ✅</div>
                ) : (
                  <div className="text-xs text-slate-500 mt-1">Cover: belum ada</div>
                )}

                <div className="text-xs text-slate-500">
                  Updated: {new Date(r.updatedAt).toLocaleString()}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreview({ url: r.fileUrl, name: r.fileName, pksId: r.pksId, type: r.fileType })}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(r.pksId)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-rose-600 text-white hover:bg-rose-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setPreview(null)}
          aria-modal="true"
          role="dialog"
        >
          <div className="relative w-full max-w-6xl mx-auto px-6" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2"
              aria-label="Tutup"
              title="Tutup"
            >
              ✕
            </button>

            <div className="mb-3 text-white">
              <div className="font-semibold">Preview: {preview.pksId}</div>
              <div className="text-sm text-white/70">{preview.name}</div>
            </div>

            <div className="relative w-full h-[75vh] overflow-hidden rounded-2xl ring-1 ring-white/20 bg-white">
              <iframe
                title="Preview"
                src={previewSrc(preview.url, preview.name, preview.type)}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
