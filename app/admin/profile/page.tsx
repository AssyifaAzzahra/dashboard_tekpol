"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

type Kind = "PKS" | "PPIS" | "PPKR";

type BaseRow = {
  id: string;
  name: string;
  slug: string;

  shortProfile?: string | null;
  address?: string | null;
  capacity?: string | null;
  yearOperation?: number | null;
  lineCount?: number | null;

  operationalNotes?: string | null;

  photoUrl?: string | null;
  structureUrl?: string | null;
  certificateUrl?: string | null;

  // ✅ sesuai schema.prisma
  status?: string | null;
  landArea?: string | null;
  products?: any | null;
  qualityStandard?: string | null;

  galleryUrls?: any | null;

  createdAt?: string;
  updatedAt?: string;
};

type FormState = {
  id?: string;

  name: string;
  slug: string;

  shortProfile: string;
  address: string;
  capacity: string;
  yearOperation: string;
  lineCount: string;

  notesLines: string;

  photoUrl: string;
  structureUrl: string;
  certificateUrl: string;

  galleryLines: string;

  // PPIS/PPKR
  status: string;
  landArea: string;
  productsLines: string;

  // PPKR
  qualityStandard: string;
};

function kindToApi(kind: Kind) {
  if (kind === "PKS") return "/api/admin/pks";
  if (kind === "PPIS") return "/api/admin/ppis";
  return "/api/admin/ppkr";
}

function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function toIntOrNull(s: string): number | null {
  const t = (s ?? "").trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

function linesToArray(s: string): string[] {
  return (s ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function arrayToLines(arr: unknown): string {
  if (Array.isArray(arr)) return arr.map(String).join("\n");
  return "";
}

function notesRawToLines(raw: string | null | undefined): string {
  const t = (raw ?? "").trim();
  if (!t) return "";

  // JSON array => tampilkan jadi per-baris
  if (t.startsWith("[") && t.endsWith("]")) {
    try {
      const arr = JSON.parse(t);
      if (Array.isArray(arr)) return arr.map(String).filter(Boolean).join("\n");
    } catch {}
  }

  // fallback: as-is (newline)
  return raw ?? "";
}

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function blankForm(): FormState {
  return {
    name: "",
    slug: "",
    shortProfile: "",
    address: "",
    capacity: "",
    yearOperation: "",
    lineCount: "",
    notesLines: "",

    photoUrl: "",
    structureUrl: "",
    certificateUrl: "",

    galleryLines: "",

    status: "Beroperasi",
    landArea: "",
    productsLines: "",

    qualityStandard: "",
  };
}

function inputCls() {
  return "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/40";
}
function textareaCls() {
  return "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/40";
}

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-slate-800">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>
      {help ? <div className="text-xs text-slate-500 mt-0.5">{help}</div> : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function AdminProfilesPage() {
  const [kind, setKind] = useState<Kind>("PKS");
  const api = useMemo(() => kindToApi(kind), [kind]);

  const [rows, setRows] = useState<BaseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>(() => blankForm());

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(api, { cache: "no-store" });
      if (!res.ok) {
        const j = await safeJson<any>(res);
        setErr(j?.message ?? `Gagal load (${res.status})`);
        return;
      }
      const data = (await safeJson<BaseRow[]>(res)) ?? [];
      setRows(data);
    } catch {
      setErr("Terjadi error jaringan saat load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  function openCreate() {
    setForm(blankForm());
    setOpen(true);
  }

  function openEdit(r: BaseRow) {
    setForm({
      id: r.id,

      name: r.name ?? "",
      slug: r.slug ?? "",

      shortProfile: r.shortProfile ?? "",
      address: r.address ?? "",
      capacity: r.capacity ?? "",
      yearOperation: r.yearOperation != null ? String(r.yearOperation) : "",
      lineCount: r.lineCount != null ? String(r.lineCount) : "",

      notesLines: notesRawToLines(r.operationalNotes),

      photoUrl: r.photoUrl ?? "",
      structureUrl: r.structureUrl ?? "",
      certificateUrl: r.certificateUrl ?? "",

      galleryLines: arrayToLines(r.galleryUrls),

      status: r.status ?? "Beroperasi",
      landArea: r.landArea ?? "",
      productsLines: arrayToLines(r.products),

      qualityStandard: r.qualityStandard ?? "",
    });

    setOpen(true);
  }

  async function submit() {
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        slug: form.slug.trim(),

        shortProfile: form.shortProfile.trim() || null,
        address: form.address.trim() || null,
        capacity: form.capacity.trim() || null,
        yearOperation: toIntOrNull(form.yearOperation),
        lineCount: toIntOrNull(form.lineCount),

        // ✅ catatan saja
        operationalNotes: JSON.stringify(linesToArray(form.notesLines)),

        photoUrl: form.photoUrl.trim() || null,
        structureUrl: form.structureUrl.trim() || null,
        certificateUrl: form.certificateUrl.trim() || null,

        // ✅ REAL column
        galleryUrls: linesToArray(form.galleryLines),
      };

      // ✅ PPIS/PPKR
      if (kind === "PPIS" || kind === "PPKR") {
        payload.status = form.status.trim() || null;
        payload.landArea = form.landArea.trim() || null;
        payload.products = linesToArray(form.productsLines);
      }

      // ✅ PPKR
      if (kind === "PPKR") {
        payload.qualityStandard = form.qualityStandard.trim() || null;
      }

      const res = await fetch(form.id ? `${api}?id=${encodeURIComponent(form.id)}` : api, {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await safeJson<any>(res);
        alert(j?.message ?? `Gagal simpan (${res.status})`);
        return;
      }

      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function del(r: BaseRow) {
    const ok = confirm(`Hapus ${kind}: ${r.name}?`);
    if (!ok) return;

    const res = await fetch(`${api}?id=${encodeURIComponent(r.id)}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await safeJson<any>(res);
      alert(j?.message ?? `Gagal delete (${res.status})`);
      return;
    }
    await load();
  }

  async function onPickFile(
    field: "photoUrl" | "structureUrl" | "certificateUrl",
    file: File | null
  ) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({ ...f, [field]: dataUrl }));
  }

  const right = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {(["PKS", "PPIS", "PPKR"] as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cls(
              "px-3 py-1.5 text-sm rounded-lg transition",
              kind === k ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <button
        onClick={openCreate}
        className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
      >
        + Tambah {kind}
      </button>
    </div>
  );

  return (
    <>
      <AdminShell
        title="Profil PKS / PPIS / PPKR"
        subtitle="CRUD profil + gambar + catatan operasional. (SuperAdmin)"
        right={right}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-800">Daftar {kind}</div>
          <button
            onClick={load}
            className="text-sm rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-4 text-sm text-slate-500">Memuat…</div>
          ) : err ? (
            <div className="p-4 text-sm text-red-600">{err}</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">Belum ada data.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{r.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      slug: <span className="font-mono">{r.slug}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {r.address || "—"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(r)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => del(r)}
                      className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-sm hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminShell>

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="font-semibold text-slate-900">
                {form.id ? `Edit ${kind}` : `Tambah ${kind}`}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>

            <div className="p-4 grid gap-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Nama" required>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputCls()}
                    placeholder="Contoh: PKS Tandun"
                  />
                </Field>

                <Field label="Slug" required help="Dipakai sebagai ID di URL/public API (unik)">
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className={inputCls()}
                    placeholder="contoh: pks-tandun"
                  />
                </Field>
              </div>

              <Field label="Profil Singkat">
                <textarea
                  value={form.shortProfile}
                  onChange={(e) => setForm((f) => ({ ...f, shortProfile: e.target.value }))}
                  className={textareaCls()}
                  rows={4}
                  placeholder="Isi ringkasan / sejarah singkat…"
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Alamat">
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className={inputCls()}
                    placeholder="Alamat/lokasi…"
                  />
                </Field>

                <Field
                  label="Kapasitas"
                  help={
                    kind === "PKS"
                      ? "PKS: angka (misal 60) supaya tampil 'TBS/jam' di user"
                      : "misal: 400 ton/hari / 120 ton/bulan"
                  }
                >
                  <input
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                    className={inputCls()}
                    placeholder={kind === "PKS" ? "60" : "400 ton/hari"}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Tahun Mulai Operasi">
                  <input
                    value={form.yearOperation}
                    onChange={(e) => setForm((f) => ({ ...f, yearOperation: e.target.value }))}
                    className={inputCls()}
                    placeholder="contoh: 2007"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Jumlah Line">
                  <input
                    value={form.lineCount}
                    onChange={(e) => setForm((f) => ({ ...f, lineCount: e.target.value }))}
                    className={inputCls()}
                    placeholder="contoh: 2"
                    inputMode="numeric"
                  />
                </Field>
              </div>

              {(kind === "PPIS" || kind === "PPKR") && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Status">
                    <input
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      className={inputCls()}
                      placeholder="Beroperasi"
                    />
                  </Field>

                  <Field label="Luas Areal">
                    <input
                      value={form.landArea}
                      onChange={(e) => setForm((f) => ({ ...f, landArea: e.target.value }))}
                      className={inputCls()}
                      placeholder="contoh: 4 hektare"
                    />
                  </Field>
                </div>
              )}

              {kind === "PPKR" && (
                <Field label="Standar Mutu (PPKR)">
                  <input
                    value={form.qualityStandard}
                    onChange={(e) => setForm((f) => ({ ...f, qualityStandard: e.target.value }))}
                    className={inputCls()}
                    placeholder="contoh: SNI & Buyer Specification"
                  />
                </Field>
              )}

              {(kind === "PPIS" || kind === "PPKR") && (
                <Field label="Produk Utama (1 baris = 1 produk)">
                  <textarea
                    value={form.productsLines}
                    onChange={(e) => setForm((f) => ({ ...f, productsLines: e.target.value }))}
                    className={textareaCls()}
                    rows={3}
                    placeholder={
                      kind === "PPIS"
                        ? "PKO (Palm Kernel Oil)\nPKM (Palm Kernel Meal)"
                        : "RSS\nSIR 20"
                    }
                  />
                </Field>
              )}

              <Field
                label="Catatan Operasional (1 baris = 1 catatan)"
                help="Disimpan sebagai JSON array agar rapi."
              >
                <textarea
                  value={form.notesLines}
                  onChange={(e) => setForm((f) => ({ ...f, notesLines: e.target.value }))}
                  className={textareaCls()}
                  rows={4}
                  placeholder={"Contoh:\nPerawatan rutin setiap bulan\nMonitoring kualitas produk"}
                />
              </Field>

              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Foto Utama (URL / base64)">
                  <input
                    value={form.photoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
                    className={inputCls()}
                    placeholder="https://… atau data:image/…"
                  />
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void onPickFile("photoUrl", e.target.files?.[0] ?? null)}
                      className="text-xs"
                    />
                  </div>
                </Field>

                <Field label="Struktur (URL / base64)">
                  <input
                    value={form.structureUrl}
                    onChange={(e) => setForm((f) => ({ ...f, structureUrl: e.target.value }))}
                    className={inputCls()}
                    placeholder="https://… atau data:image/…"
                  />
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void onPickFile("structureUrl", e.target.files?.[0] ?? null)}
                      className="text-xs"
                    />
                  </div>
                </Field>

                <Field label="Sertifikasi Utama (URL / base64)">
                  <input
                    value={form.certificateUrl}
                    onChange={(e) => setForm((f) => ({ ...f, certificateUrl: e.target.value }))}
                    className={inputCls()}
                    placeholder="https://… atau data:image/…"
                  />
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void onPickFile("certificateUrl", e.target.files?.[0] ?? null)}
                      className="text-xs"
                    />
                  </div>
                </Field>
              </div>

              <Field label="Galeri Sertifikasi Tambahan (1 baris = 1 URL/base64)">
                <textarea
                  value={form.galleryLines}
                  onChange={(e) => setForm((f) => ({ ...f, galleryLines: e.target.value }))}
                  className={textareaCls()}
                  rows={3}
                  placeholder={"https://...\nhttps://..."}
                />
              </Field>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
                disabled={saving}
              >
                Batal
              </button>
              <button
                onClick={() => void submit()}
                className={cls(
                  "rounded-xl px-4 py-2 text-sm font-medium text-white",
                  saving ? "bg-emerald-600/60" : "bg-emerald-600 hover:bg-emerald-700"
                )}
                disabled={saving}
              >
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
