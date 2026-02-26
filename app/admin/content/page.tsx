"use client";

import React from "react";

type LinkItem = {
  id: string;
  title: string;
  desc?: string;
  tag?: string;
  href?: string;
  children?: LinkItem[];
};

type ContentBucket = {
  title: string;
  items: LinkItem[]; // kategori -> children -> link
};

type ApiGetResponse =
  | {
      from: "db" | "fallback";
      key: string;
      title: string;
      content: ContentBucket;
      updatedAt?: string;
      createdAt?: string;
    }
  | { error: string; extra?: any };

const PRESETS = [
  { key: "investasi/sub-instalasi-pks", label: "Investasi • Sub Instalasi PKS" },
  // ✅ FIX: key pengolahan disamakan dengan TEKPOL_CONTENT_MAP
  { key: "pengolahan/tukangolah", label: "Pengolahan • Sub Tukang Olah" },
  { key: "teknik/sub", label: "Teknik & Infrastruktur • Sub" },
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isValidUrl(u: string) {
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function guessTagFromUrl(u: string) {
  const s = u.toLowerCase();
  if (s.includes("docs.google.com/spreadsheets")) return "Sheet";
  if (s.includes("docs.google.com/presentation")) return "Slide";
  if (s.includes("drive.google.com/drive/folders")) return "Drive";
  if (s.includes("drive.google.com")) return "Drive";
  return "Link";
}

/** =========================
 * DEFAULT CATEGORY TEMPLATE
 * ========================= */
function defaultItemsForKey(key: string): LinkItem[] {
  // ✅ Investasi
  if (key === "investasi/sub-instalasi-pks") {
    return [
      { id: "agenda-penomoran", title: "Agenda Penomoran Surat", children: [] },
      { id: "kond-peralatan-bulanan", title: "Kondisi Peralatan Bulanan PKS", children: [] },
      { id: "grp-monitoring", title: "Monitoring", children: [] },
      { id: "grp-kontrak-dokumen", title: "Kontrak & Dokumen", children: [] },
    ];
  }

  // ✅ Pengolahan (FIX key)
  if (key === "pengolahan/tukangolah") {
    return [
      { id: "grp-produksi-pks", title: "Produksi - PKS", children: [] },
      { id: "grp-biaya-olah-lm", title: "Biaya Olah LM", children: [] },
      { id: "grp-tech-service", title: "Laporan Technical Service EON", children: [] },
      { id: "grp-rkap-2026", title: "RKAP 2026", children: [] },
      { id: "grp-rkap-2025", title: "RKAP 2025", children: [] },
      { id: "grp-izin-la", title: "IZIN LA", children: [] },
      { id: "grp-draft-monthly", title: "Draft Monthly", children: [] },
      { id: "grp-oktober", title: "Oktober", children: [] },
      { id: "grp-buku-kalibrasi", title: "Buku Kalibrasi Storage", children: [] },
      { id: "grp-digitalisasi", title: "Digitalisasi", children: [] },
      { id: "grp-ba-stokopname", title: "BA Stokopname", children: [] },
      { id: "grp-stok-gudang", title: "Stok Gudang Barang", children: [] },
      { id: "grp-kontrak", title: "Kontrak", children: [] },
    ];
  }

  // ✅ Teknik
  if (key === "teknik/sub") {
    return [
      { id: "menu-halaman-muka", title: "Halaman Muka", children: [] },
      { id: "menu-2023", title: "2023", children: [] },
      { id: "menu-2024", title: "2024", children: [] },
      { id: "menu-2025", title: "2025", children: [] },
      { id: "menu-2026", title: "2026", children: [] },
    ];
  }

  return [];
}

export default function AdminContentPage() {
  const [selectedKey, setSelectedKey] = React.useState(PRESETS[0].key);
  const [bucketTitle, setBucketTitle] = React.useState(PRESETS[0].label);

  const [bucket, setBucket] = React.useState<ContentBucket>({
    title: PRESETS[0].label,
    items: defaultItemsForKey(PRESETS[0].key),
  });

  const [categoryId, setCategoryId] = React.useState<string>("");
  const [newCategoryName, setNewCategoryName] = React.useState("");

  const [itemTitle, setItemTitle] = React.useState("");
  const [itemUrl, setItemUrl] = React.useState("");
  const [itemTag, setItemTag] = React.useState("");
  const [itemDesc, setItemDesc] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setMsg(null);

    const preset = PRESETS.find((x) => x.key === selectedKey);
    const defaultTitle = preset?.label || "";
    const fallbackItems = defaultItemsForKey(selectedKey);

    try {
      const res = await fetch(`/api/admin/content?key=${encodeURIComponent(selectedKey)}`, {
        cache: "no-store",
      });

      const data = (await res.json().catch(() => null)) as ApiGetResponse | null;

      if (!res.ok) {
        const errMsg =
          (data as any)?.error ||
          (typeof data === "string" ? data : null) ||
          `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      if (data && "error" in data) {
        throw new Error(data.error || "Unknown error");
      }

      if (data?.content && Array.isArray(data.content.items)) {
        const title = (data.title || defaultTitle).trim() || defaultTitle;
        setBucketTitle(title);
        setBucket({
          title,
          items: Array.isArray(data.content.items) ? data.content.items : fallbackItems,
        });
      } else {
        setBucketTitle(defaultTitle);
        setBucket({ title: defaultTitle, items: fallbackItems });
      }

      setCategoryId("");
      setNewCategoryName("");
      setItemTitle("");
      setItemUrl("");
      setItemTag("");
      setItemDesc("");
    } catch (e: any) {
      setMsg(`Gagal load: ${e?.message ?? e}`);
      setBucketTitle(defaultTitle);
      setBucket({ title: defaultTitle, items: fallbackItems });
    } finally {
      setLoading(false);
    }
  }, [selectedKey]);

  React.useEffect(() => {
    load();
  }, [load]);

  const categories = bucket.items;

  const addCategory = () => {
    setMsg(null);
    const name = newCategoryName.trim();
    if (!name) return setMsg("❌ Nama kategori wajib diisi");

    const id = `cat-${slugify(name)}`;
    const exists = categories.some(
      (c) => c.id === id || c.title.toLowerCase() === name.toLowerCase()
    );
    if (exists) return setMsg("❌ Kategori sudah ada");

    const next: ContentBucket = {
      title: bucketTitle,
      items: [...bucket.items, { id, title: name, children: [] }],
    };

    setBucket(next);
    setNewCategoryName("");
    setCategoryId(id);
    setMsg("✅ Kategori ditambahkan");
  };

  const deleteCategory = (id: string) => {
    const next: ContentBucket = {
      title: bucketTitle,
      items: bucket.items.filter((c) => c.id !== id),
    };
    setBucket(next);
    if (categoryId === id) setCategoryId("");
  };

  const addLinkToCategory = () => {
    setMsg(null);
    if (!categoryId) return setMsg("❌ Pilih kategori dulu");

    const t = itemTitle.trim();
    const u = itemUrl.trim();
    if (!t) return setMsg("❌ Judul link wajib diisi");
    if (!u) return setMsg("❌ URL wajib diisi");
    if (!isValidUrl(u)) return setMsg("❌ URL tidak valid");

    const tag = (itemTag.trim() || guessTagFromUrl(u)).trim();
    const id = `item-${slugify(t)}-${Date.now()}`;

    const nextItems = bucket.items.map((cat) => {
      if (cat.id !== categoryId) return cat;
      const children = Array.isArray(cat.children) ? cat.children : [];
      return {
        ...cat,
        children: [
          ...children,
          {
            id,
            title: t,
            href: u,
            tag,
            desc: itemDesc.trim() || undefined,
          },
        ],
      };
    });

    setBucket({ title: bucketTitle, items: nextItems });
    setItemTitle("");
    setItemUrl("");
    setItemTag("");
    setItemDesc("");
    setMsg("✅ Link ditambahkan");
  };

  const deleteLink = (catId: string, itemId: string) => {
    const nextItems = bucket.items.map((cat) => {
      if (cat.id !== catId) return cat;
      const children = Array.isArray(cat.children) ? cat.children : [];
      return { ...cat, children: children.filter((x) => x.id !== itemId) };
    });
    setBucket({ title: bucketTitle, items: nextItems });
  };

  const save = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const payload = {
        key: selectedKey,
        title: bucketTitle,
        content: {
          title: bucketTitle,
          items: bucket.items,
        },
      };

      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) {
        let m = text;
        try {
          const j = JSON.parse(text);
          m = j?.error ? `${j.error}` : text;
        } catch {}
        throw new Error(m);
      }

      setMsg("✅ Berhasil disimpan ke database");
    } catch (e: any) {
      setMsg(`❌ Gagal simpan: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin • Kelola Dokumen Tekpol</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kategori default sudah disamakan dengan struktur Investasi / Pengolahan / Teknik.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <div className="text-sm text-slate-700">Sub Bagian</div>
          <select
            className="border rounded-lg px-3 py-2 min-w-[360px]"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {PRESETS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label} ({p.key})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={load}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
          type="button"
        >
          Reload
        </button>

        <button
          onClick={save}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          type="button"
        >
          Simpan
        </button>

        {loading ? <div className="text-sm text-slate-500">loading...</div> : null}
      </div>

      <div className="space-y-2">
        <div className="text-sm text-slate-700">Judul Halaman</div>
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={bucketTitle}
          onChange={(e) => setBucketTitle(e.target.value)}
          placeholder="Judul halaman"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border bg-white p-4 space-y-3">
          <div className="font-semibold">Kategori (sudah sesuai)</div>

          {categories.length === 0 ? (
            <div className="text-sm text-slate-500">Tidak ada kategori.</div>
          ) : (
            <div className="space-y-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                    categoryId === c.id ? "border-emerald-400 bg-emerald-50" : "bg-white"
                  }`}
                >
                  <button
                    type="button"
                    className="text-left flex-1"
                    onClick={() => setCategoryId(c.id)}
                  >
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="text-xs text-slate-500">{(c.children?.length ?? 0)} link</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCategory(c.id)}
                    className="text-xs px-2 py-1 rounded-md border hover:bg-slate-50"
                    title="Hapus kategori"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t space-y-2">
            <div className="text-sm font-medium">Buat kategori baru (opsional)</div>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder='Contoh: "Kategori Baru"'
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button
              type="button"
              onClick={addCategory}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Tambah Kategori
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border bg-white p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold">Tambah Link (Sheet / Drive)</div>
            <div className="text-xs text-slate-500">
              Kategori dipilih:{" "}
              <b>{categoryId ? (categories.find((x) => x.id === categoryId)?.title ?? "-") : "-"}</b>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm text-slate-700">Judul Link</div>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder='Contoh: "LM 2025"'
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm text-slate-700">URL (Google Sheet / Drive)</div>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                placeholder="https://docs.google.com/... atau https://drive.google.com/..."
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm text-slate-700">Tag (opsional)</div>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={itemTag}
                onChange={(e) => setItemTag(e.target.value)}
                placeholder='Kosongkan untuk auto: "Sheet" / "Drive"'
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm text-slate-700">Deskripsi (opsional)</div>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder='Contoh: "Laporan Harian Pabrik"'
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addLinkToCategory}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Tambah Link ke Kategori
          </button>

          <div className="pt-4 border-t space-y-3">
            <div className="font-semibold">Daftar Link</div>

            {categories.length === 0 ? (
              <div className="text-sm text-slate-500">Belum ada kategori & link.</div>
            ) : (
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{cat.title}</div>
                      <div className="text-xs text-slate-500">{cat.children?.length ?? 0} link</div>
                    </div>

                    {!cat.children || cat.children.length === 0 ? (
                      <div className="text-sm text-slate-500 mt-2">Belum ada link.</div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {cat.children.map((it) => (
                          <div
                            key={it.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 border px-3 py-2"
                          >
                            <div className="min-w-[260px]">
                              <div className="text-sm font-medium">
                                {it.title}{" "}
                                {it.tag ? (
                                  <span className="ml-2 text-[11px] px-2 py-[2px] rounded-full border bg-white">
                                    {it.tag}
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-xs text-slate-500 break-all">{it.href}</div>
                              {it.desc ? (
                                <div className="text-xs text-slate-600 mt-1">{it.desc}</div>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-2">
                              {it.href ? (
                                <a
                                  href={it.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs px-2 py-1 rounded-md border bg-white hover:bg-slate-50"
                                >
                                  Buka
                                </a>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => deleteLink(cat.id, it.id)}
                                className="text-xs px-2 py-1 rounded-md border hover:bg-white"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {msg ? <div className="text-sm">{msg}</div> : null}
    </div>
  );
}