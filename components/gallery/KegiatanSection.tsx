"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Images, X } from "lucide-react";

type GalleryItem = {
  id: string;
  title: string | null;
  caption: string | null;
  image: string;        // dari API publik
  category: string;     // dari API publik
  order?: number;
  createdAt?: string;
};

function getCategory(g: GalleryItem) {
  return (g.category ?? "").trim();
}

export default function KegiatanSection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/gallery", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as GalleryItem[];
        setItems(data);
      } catch (e: any) {
        setErr(e?.message || "Gagal memuat galeri.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* daftar kategori unik */
const kegiatanList = useMemo(() => {
  const set = new Set<string>();
  for (const it of items) {
    const cat = getCategory(it);
    if (cat) set.add(cat); 
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}, [items]);

  /* foto dalam kategori */
  const filtered = useMemo(
    () => (activeCat ? items.filter((g) => getCategory(g) === activeCat) : []),
    [activeCat, items]
  );

  const selected = useMemo(() => items.find((g) => g.id === openId) ?? null, [openId, items]);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          {activeCat ? (
            <button
              onClick={() => setActiveCat(null)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 hover:bg-white text-[13px]"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-transparent">
              <Images className="w-4 h-4 text-emerald-600" />
            </span>
          )}

          <h1 className="text-xl font-bold">
            {activeCat ? activeCat : "Kegiatan PT. Perkebunan Nusantara IV Regional III"}
          </h1>
        </div>

        {loading && (
          <div className="text-[13px] text-slate-600 dark:text-slate-300">
            Memuat galeri...
          </div>
        )}

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
            {err}
          </div>
        )}

        {/* List kegiatan */}
        {!loading && !err && !activeCat && (
          <>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 mb-3">
              Klik salah satu kegiatan untuk melihat foto-fotonya.
            </p>

            {kegiatanList.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-[13px] text-slate-600 dark:text-slate-300">
                Belum ada data galeri (pastikan item di admin “Tampilkan di publik”).
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {kegiatanList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-3 hover:shadow-md transition relative"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 rounded-md p-1.5 bg-emerald-50">
                        <Images className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-semibold leading-snug">{cat}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Grid foto */}
        {!loading && !err && activeCat && (
          <>
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-[13px] text-slate-600 dark:text-slate-300">
                Belum ada foto untuk kegiatan <span className="font-medium">{activeCat}</span>.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map((item) => (
                  <PhotoTile key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setOpenId(null)} />
          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
          >
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={selected.image}
                alt={selected.title || getCategory(selected)}
                fill
                className="object-cover"
              />
            </div>

            <button
              onClick={() => setOpenId(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-4">
              <h4 className="text-base font-semibold">{selected.title || getCategory(selected)}</h4>

              {selected.caption && (
                <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {selected.caption}
                </p>
              )}

              <button
                onClick={() => setOpenId(null)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Kembali
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

function PhotoTile({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="group relative block w-full overflow-hidden rounded-xl">
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={item.image}
          alt={item.title || item.category || "Gallery"}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 via-black/10 to-transparent">
          <div className="text-white text-[13px] font-semibold leading-snug line-clamp-2 drop-shadow">
            {item.title || item.category || "Umum"}
          </div>
        </div>
      </div>
    </button>
  );
}
