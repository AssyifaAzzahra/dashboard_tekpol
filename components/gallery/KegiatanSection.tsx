'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Images, X } from 'lucide-react';
import { GALLERY_ITEMS, type GalleryItem } from '@/lib/data/gallery';

/* Ambil kategori dengan fallback */
function getCategory(g: GalleryItem) {
  const anyG = g as any;
  return (anyG.category ?? anyG.group ?? anyG.tag ?? 'Umum') as string;
}

export default function KegiatanSection() {
  const [activeCat, setActiveCat] = useState<string | null>(null);

  // ✅ ganti openId -> openIndex (biar bisa next/prev)
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* daftar kategori unik */
  const kegiatanList = useMemo(() => {
    const set = new Set<string>();
    for (const it of GALLERY_ITEMS) set.add(getCategory(it));
    return Array.from(set);
  }, []);

  /* foto dalam kategori */
  const filtered = useMemo(
    () => (activeCat ? GALLERY_ITEMS.filter((g) => getCategory(g) === activeCat) : []),
    [activeCat]
  );

  // ✅ foto yang sedang dibuka = filtered[openIndex]
  const selected = useMemo(() => {
    if (openIndex === null) return null;
    return filtered[openIndex] ?? null;
  }, [openIndex, filtered]);

  const closeModal = useCallback(() => setOpenIndex(null), []);

  const hasNav = filtered.length > 1;

  const goPrev = useCallback(() => {
    if (!hasNav || openIndex === null) return;
    setOpenIndex((i) => {
      if (i === null) return 0;
      return (i - 1 + filtered.length) % filtered.length;
    });
  }, [hasNav, openIndex, filtered.length]);

  const goNext = useCallback(() => {
    if (!hasNav || openIndex === null) return;
    setOpenIndex((i) => {
      if (i === null) return 0;
      return (i + 1) % filtered.length;
    });
  }, [hasNav, openIndex, filtered.length]);

  // ✅ Keyboard support saat modal terbuka
  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, closeModal, goPrev, goNext]);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          {activeCat ? (
            <button
              onClick={() => {
                setActiveCat(null);
                setOpenIndex(null);
              }}
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
            {activeCat ? activeCat : 'Kegiatan PT. Perkebunan Nusantara IV Regional III'}
          </h1>
        </div>

        {/* List kegiatan */}
        {!activeCat && (
          <>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 mb-3">
              Klik salah satu kegiatan untuk melihat foto-fotonya.
            </p>

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
          </>
        )}

        {/* Grid foto */}
        {activeCat && (
          <>
            {filtered.length === 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-[13px] text-slate-600 dark:text-slate-300">
                Belum ada foto untuk kegiatan <span className="font-medium">{activeCat}</span>.
              </div>
            )}

            {filtered.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map((item, idx) => (
                  <PhotoTile key={item.id} item={item} onOpen={() => setOpenIndex(idx)} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* ✅ Modal + slider kiri/kanan */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={closeModal} />

          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gambar */}
            <div className="relative w-full aspect-[16/9] bg-black">
              {selected.image ? (
                <Image
                  src={selected.image}
                  alt={selected.title || getCategory(selected)}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-slate-300 dark:bg-slate-700" />
              )}

              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* ✅ Prev/Next buttons */}
              {hasNav && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow grid place-items-center"
                    aria-label="Sebelumnya"
                    title="Sebelumnya"
                    type="button"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow grid place-items-center"
                    aria-label="Berikutnya"
                    title="Berikutnya"
                    type="button"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* indikator */}
                  <div className="absolute bottom-3 right-3 z-20 text-[12px] px-2 py-1 rounded-md bg-black/60 text-white">
                    {openIndex! + 1} / {filtered.length}
                  </div>
                </>
              )}
            </div>

            {/* Detail */}
            <div className="p-4">
              <h4 className="text-base font-semibold">
                {selected.title || getCategory(selected)}
              </h4>

              {selected.caption && (
                <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {selected.caption}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Kembali
                </button>

                {hasNav && (
                  <div className="text-[12px] text-slate-500 dark:text-slate-400">
                    Tips: pakai tombol keyboard ← / → untuk geser foto
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

/* FOTO TILE */
function PhotoTile({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="group relative block w-full overflow-hidden rounded-xl">
      <div className="relative aspect-[16/10] w-full">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title || getCategory(item)}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800" />
        )}

        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 via-black/10 to-transparent">
          <div className="text-white text-[13px] font-semibold leading-snug line-clamp-2 drop-shadow">
            {item.title || getCategory(item)}
          </div>
        </div>
      </div>
    </button>
  );
}
