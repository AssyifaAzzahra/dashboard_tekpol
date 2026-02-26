"use client";

import React, { useEffect, useMemo, useState } from "react";

type UnitType = "pks" | "ppis" | "ppkr";

type UnitRow = {
  id: string;
  name: string;
  slug: string;
  shortProfile: string | null;
  address: string | null;
  capacity: string | null;
  yearOperation: number | null;
  lineCount: number | null;
  operationalNotes: string | null;
  photoUrl: string | null;
  structureUrl: string | null;
  certificateUrl: string | null;
  updatedAt?: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getTitle(type: UnitType) {
  if (type === "pks") return "Admin PKS";
  if (type === "ppis") return "Admin PPIS";
  return "Admin PPKR";
}

export default function UnitManager({ type }: { type: UnitType }) {
  const [rows, setRows] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // mode: create / edit
  const [selected, setSelected] = useState<UnitRow | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortProfile, setShortProfile] = useState("");
  const [address, setAddress] = useState("");
  const [capacity, setCapacity] = useState("");
  const [yearOperation, setYearOperation] = useState("");
  const [lineCount, setLineCount] = useState("");
  const [operationalNotes, setOperationalNotes] = useState("");

  // files (image only)
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [structureFile, setStructureFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  const photoPreview = useMemo(() => {
    if (photoFile) return URL.createObjectURL(photoFile);
    return selected?.photoUrl ?? null;
  }, [photoFile, selected?.photoUrl]);

  const structurePreview = useMemo(() => {
    if (structureFile) return URL.createObjectURL(structureFile);
    return selected?.structureUrl ?? null;
  }, [structureFile, selected?.structureUrl]);

  const certificatePreview = useMemo(() => {
    if (certificateFile) return URL.createObjectURL(certificateFile);
    return selected?.certificateUrl ?? null;
  }, [certificateFile, selected?.certificateUrl]);

  useEffect(() => {
    return () => {
      // cleanup object url
      if (photoFile) URL.revokeObjectURL(photoPreview ?? "");
      if (structureFile) URL.revokeObjectURL(structurePreview ?? "");
      if (certificateFile) URL.revokeObjectURL(certificatePreview ?? "");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/unit/${type}`, { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Gagal load (${res.status})`);
      }
      const data = (await res.json()) as UnitRow[];
      setRows(data);
    } catch (e: any) {
      setError(e?.message || "Gagal load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function resetForm() {
    setSelected(null);

    setName("");
    setSlug("");
    setShortProfile("");
    setAddress("");
    setCapacity("");
    setYearOperation("");
    setLineCount("");
    setOperationalNotes("");

    setPhotoFile(null);
    setStructureFile(null);
    setCertificateFile(null);
  }

  function pickForEdit(row: UnitRow) {
    setSelected(row);

    setName(row.name ?? "");
    setSlug(row.slug ?? "");
    setShortProfile(row.shortProfile ?? "");
    setAddress(row.address ?? "");
    setCapacity(row.capacity ?? "");
    setYearOperation(row.yearOperation != null ? String(row.yearOperation) : "");
    setLineCount(row.lineCount != null ? String(row.lineCount) : "");
    setOperationalNotes(row.operationalNotes ?? "");

    setPhotoFile(null);
    setStructureFile(null);
    setCertificateFile(null);
  }

  async function onSubmit() {
    setSaving(true);
    setError(null);

    try {
      const fd = new FormData();

      // required fields for create
      if (!selected) {
        if (!name.trim()) throw new Error("Nama wajib diisi");
        if (!slug.trim()) throw new Error("Slug wajib diisi");
      }

      if (selected) fd.set("id", selected.id);
      if (name.trim() !== "") fd.set("name", name.trim());
      if (slug.trim() !== "") fd.set("slug", slug.trim());

      fd.set("shortProfile", shortProfile.trim());
      fd.set("address", address.trim());
      fd.set("capacity", capacity.trim());
      fd.set("yearOperation", yearOperation.trim());
      fd.set("lineCount", lineCount.trim());
      fd.set("operationalNotes", operationalNotes.trim());

      if (photoFile) fd.set("photo", photoFile);
      if (structureFile) fd.set("structure", structureFile);
      if (certificateFile) fd.set("certificate", certificateFile);

      const url = `/api/admin/unit/${type}`;
      const res = await fetch(url, {
        method: selected ? "PATCH" : "POST",
        body: fd,
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || `Gagal simpan (${res.status})`);

      await load();
      if (!selected) resetForm(); // kalau create, bersihin form
      else {
        // kalau edit, refresh selected dari data terbaru (biar preview url update)
        const updated = j as UnitRow;
        pickForEdit(updated);
      }
    } catch (e: any) {
      setError(e?.message || "Gagal simpan");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row: UnitRow) {
    const ok = confirm(`Hapus ${row.name}?`);
    if (!ok) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/unit/${type}?id=${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || `Gagal hapus (${res.status})`);

      if (selected?.id === row.id) resetForm();
      await load();
    } catch (e: any) {
      setError(e?.message || "Gagal hapus");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{getTitle(type)}</h1>
          <p className="text-sm opacity-70">
            CRUD konten (Profil Singkat, Foto, Struktur, Sertifikasi) — semua image.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-md border"
            onClick={load}
            disabled={loading || saving}
          >
            Refresh
          </button>
          <button
            className="px-3 py-2 rounded-md border"
            onClick={resetForm}
            disabled={saving}
          >
            Form Baru
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LIST */}
        <div className="rounded-xl border bg-white">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Daftar Unit</h2>
            <p className="text-sm opacity-70">
              Klik salah satu untuk edit. Atau “Form Baru” untuk tambah.
            </p>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-sm opacity-70">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="text-sm opacity-70">Belum ada data.</div>
            ) : (
              <div className="space-y-2">
                {rows.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                      selected?.id === r.id ? "border-black" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.name}</div>
                      <div className="text-xs opacity-70 truncate">slug: {r.slug}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        className="px-3 py-1.5 rounded-md border"
                        onClick={() => pickForEdit(r)}
                        disabled={saving}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md border"
                        onClick={() => onDelete(r)}
                        disabled={saving}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-xl border bg-white">
          <div className="p-4 border-b">
            <h2 className="font-semibold">{selected ? "Edit Unit" : "Tambah Unit"}</h2>
            <p className="text-sm opacity-70">
              {selected ? `Sedang edit: ${selected.name}` : "Buat unit baru"}
            </p>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <div className="text-sm font-medium">Nama</div>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!selected && slug.trim() === "") setSlug(slugify(e.target.value));
                  }}
                  placeholder="PKS Tanah Putih"
                />
              </label>

              <label className="space-y-1">
                <div className="text-sm font-medium">Slug</div>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="tanah-putih"
                />
                <div className="text-xs opacity-70">otomatis slugify</div>
              </label>
            </div>

            <label className="space-y-1">
              <div className="text-sm font-medium">Profil Singkat</div>
              <textarea
                className="w-full rounded-md border px-3 py-2 min-h-[120px]"
                value={shortProfile}
                onChange={(e) => setShortProfile(e.target.value)}
                placeholder="Tulis profil singkat..."
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <div className="text-sm font-medium">Alamat</div>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Desa..., Kecamatan..., Kabupaten..."
                />
              </label>

              <label className="space-y-1">
                <div className="text-sm font-medium">Kapasitas</div>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="60 ton TBS/jam"
                />
              </label>

              <label className="space-y-1">
                <div className="text-sm font-medium">Tahun Operasi</div>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  value={yearOperation}
                  onChange={(e) => setYearOperation(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="2008"
                />
              </label>

              <label className="space-y-1">
                <div className="text-sm font-medium">Jumlah Line</div>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  value={lineCount}
                  onChange={(e) => setLineCount(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="2"
                />
              </label>
            </div>

            <label className="space-y-1">
              <div className="text-sm font-medium">Catatan Operasional</div>
              <textarea
                className="w-full rounded-md border px-3 py-2 min-h-[90px]"
                value={operationalNotes}
                onChange={(e) => setOperationalNotes(e.target.value)}
                placeholder="Catatan tambahan..."
              />
            </label>

            {/* Upload images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">Foto</div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview Foto"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                )}
                {!photoPreview && <div className="text-xs opacity-70">Belum ada.</div>}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Struktur</div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setStructureFile(e.target.files?.[0] ?? null)}
                />
                {structurePreview && (
                  <img
                    src={structurePreview}
                    alt="Preview Struktur"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                )}
                {!structurePreview && <div className="text-xs opacity-70">Belum ada.</div>}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Sertifikasi</div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)}
                />
                {certificatePreview && (
                  <img
                    src={certificatePreview}
                    alt="Preview Sertifikasi"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                )}
                {!certificatePreview && <div className="text-xs opacity-70">Belum ada.</div>}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                className="px-4 py-2 rounded-md border bg-black text-white disabled:opacity-60"
                onClick={onSubmit}
                disabled={saving}
              >
                {saving ? "Menyimpan..." : selected ? "Simpan Perubahan" : "Tambah Unit"}
              </button>

              {selected && (
                <button
                  className="px-4 py-2 rounded-md border"
                  onClick={() => resetForm()}
                  disabled={saving}
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div className="text-xs opacity-70">
              * Upload hanya menerima <b>PNG/JPG/WEBP</b> (max 10MB per file).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
