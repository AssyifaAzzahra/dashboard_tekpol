"use client";

import React, { useEffect, useMemo, useState } from "react";

type DocStatus = "PENDING" | "ACCEPTED" | "REJECTED";

type Item = {
  id: string;
  pksCode: string;
  pksName: string | null;
  fileUrl: string;
  originalName: string;
  sizeBytes: number;
  status: DocStatus;
  adminNote: string | null;
  createdAt: string;
  uploader?: { name: string | null; email: string | null } | null;
};

export default function AdminPksDocumentsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/pks-documents");
    const json = await res.json();
    if (res.ok) setItems(json.data || []);
    else setMsg(json?.error || "Gagal memuat data");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((it) => {
      const hay = [
        it.pksCode,
        it.pksName || "",
        it.originalName || "",
        it.status,
        it.uploader?.name || "",
        it.uploader?.email || "",
        it.adminNote || "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [items, q]);

  function setField(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function save(item: Item) {
    try {
      setSavingId(item.id);
      setMsg(null);
      const res = await fetch(`/api/admin/pks-documents/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: item.status, adminNote: item.adminNote }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal simpan");
      setMsg("✅ Berhasil disimpan.");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Error"}`);
    } finally {
      setSavingId(null);
    }
  }

  const statusBadge = (s: DocStatus) => {
    const base = "inline-flex px-2 py-0.5 rounded-md text-xs font-semibold";
    if (s === "ACCEPTED") return `${base} bg-emerald-100 text-emerald-800`;
    if (s === "REJECTED") return `${base} bg-rose-100 text-rose-800`;
    return `${base} bg-slate-100 text-slate-700`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dokumen PKS</h1>
          <p className="text-sm text-slate-500">Kelola dokumen masuk .</p>
        </div>
        <button className="rounded-md border px-3 py-2" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <input
        className="w-full max-w-md rounded-md border bg-white/70 dark:bg-slate-900/50 p-2"
        placeholder="Cari (PKS / file / uploader / status )"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {msg && <div className="text-sm">{msg}</div>}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/40">
            <tr>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">PKS</th>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">Uploader</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={7}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={7}>
                  Belum ada data.
                </td>
              </tr>
            ) : (
              filtered.map((it) => (
                <tr key={it.id} className="border-t align-top">
                  <td className="p-3 whitespace-nowrap">{new Date(it.createdAt).toLocaleString()}</td>

                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium">{it.pksCode}</div>
                    <div className="text-xs text-slate-500">{it.pksName}</div>
                  </td>

                  <td className="p-3">
                    <a className="underline" href={it.fileUrl} target="_blank" rel="noreferrer">
                      {it.originalName}
                    </a>
                    <div className="text-xs text-slate-500">{(it.sizeBytes / (1024 * 1024)).toFixed(2)} MB</div>
                  </td>

                  <td className="p-3">
                    <div>{it.uploader?.name || "-"}</div>
                    <div className="text-xs text-slate-500">{it.uploader?.email || "-"}</div>
                  </td>

                  <td className="p-3">
                    <div className="mb-2">
                      <span className={statusBadge(it.status)}>{it.status}</span>
                    </div>
                    <select
                      className="rounded-md border bg-white/70 dark:bg-slate-900/50 p-2"
                      value={it.status}
                      onChange={(e) => setField(it.id, { status: e.target.value as DocStatus })}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>

                  <td className="p-3">
                    <button
                      className="rounded-md bg-emerald-600 px-3 py-2 text-white disabled:opacity-50"
                      disabled={savingId === it.id}
                      onClick={() => save(it)}
                    >
                      {savingId === it.id ? "Menyimpan..." : "Simpan"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
