'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
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

  // ✅ ganti dari openId → openIndex (biar bisa slide kiri kanan)
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

  const selected = useMemo(() => {
    if (openIndex == null) return null;
    return filtered[openIndex] ?? null;
  }, [openIndex, filtered]);

  const hasModal = openIndex != null && filtered.length > 0;

  const closeModal = useCallback(() => setOpenIndex(null), []);

  const prev = useCallback(() => {
    if (filtered.length === 0) return;
    setOpenIndex((i) => {
      if (i == null) return 0;
      return (i - 1 + filtered.length) % filtered.length;
    });
  }, [filtered.length]);

  const next = useCallback(() => {
    if (filtered.length === 0) return;
    setOpenIndex((i) => {
      if (i == null) return 0;
      return (i + 1) % filtered.length;
    });
  }, [filtered.length]);

  // ✅ keyboard control + ESC
  useEffect(() => {
    if (!hasModal) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasModal, closeModal, prev, next]);

  // ✅ lock scroll body saat modal buka
  useEffect(() => {
    if (!hasModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [hasModal]);

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
                  <PhotoTile
                    key={item.id}
                    item={item}
                    onOpen={() => setOpenIndex(idx)} // ✅ buka berdasarkan index
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* ✅ Modal Slider */}
      {selected && openIndex != null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={closeModal}
          />

          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* IMAGE AREA */}
            <div className="relative w-full aspect-[16/9] bg-black">
              {selected.image ? (
                <Image
                  src={selected.image}
                  alt={selected.title || getCategory(selected)}
                  fill
                  className="object-contain" // ✅ biar kayak viewer (lebih enak buat slide)
                  priority
                  sizes="100vw"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-300 dark:bg-slate-700" />
              )}

              {/* ✅ Close */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700"
                aria-label="Tutup"
                title="Tutup"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              {/* ✅ Panah kiri/kanan model bulat */}
              {filtered.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    type="button"
                    aria-label="Sebelumnya"
                    title="Sebelumnya"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10
                               h-12 w-12 rounded-full bg-white/90 text-slate-900 shadow-lg
                               hover:bg-white"
                  >
                    <ChevronLeft className="w-6 h-6 mx-auto" />
                  </button>

                  <button
                    onClick={next}
                    type="button"
                    aria-label="Berikutnya"
                    title="Berikutnya"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10
                               h-12 w-12 rounded-full bg-white/90 text-slate-900 shadow-lg
                               hover:bg-white"
                  >
                    <ChevronRight className="w-6 h-6 mx-auto" />
                  </button>
                </>
              )}

              {/* ✅ counter */}
              <div className="absolute left-4 bottom-4 z-10 rounded-full bg-black/55 text-white text-xs px-3 py-1">
                {openIndex + 1} / {filtered.length}
              </div>
            </div>

            {/* INFO */}
            <div className="p-4">
              <h4 className="text-base font-semibold">
                {selected.title || getCategory(selected)}
              </h4>

              {selected.caption && (
                <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {selected.caption}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px]
                             bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Kembali
                </button>

                {filtered.length > 1 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Tips: pakai keyboard <b>←</b> <b>→</b>
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
    <button
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-xl"
      type="button"
    >
      <div className="relative aspect-[16/10] w-full">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title || getCategory(item)}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.04]"
            sizes="(max-width: 1024px) 50vw, 25vw"
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
