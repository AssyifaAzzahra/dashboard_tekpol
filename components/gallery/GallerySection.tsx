'use client';

import React, { useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Images, X } from 'lucide-react';
import { GALLERY_ITEMS, type GalleryItem } from '@/lib/data/gallery';

/* ====== KONFIG TANGGAL DEFAULT PER KEGIATAN ======
   Ganti nilai di bawah sesuai tanggal kegiatan aslinya.
   Format: 'YYYY-MM-DD'
*/
const CATEGORY_DATE_MAP: Record<string, string> = {
  // Hari besar nasional (contoh realistis)
  'Hari Pancasila': '2024-06-01',
  'Hari Kemerdekaan RI': '2024-08-17',
  'Hari Sumpah Pemuda': '2024-10-28',
  'Hari Pahlawan': '2024-11-10',
  'Senam Pagi': '2024-01-05',
  'Kunjungan Region': '2024-03-12',
  'Training of Trainer': '2024-04-20',
  'Sertijab': '2024-05-10',
  'Culture Booster': '2024-07-15',
  'Kunjungan SEVP': '2024-09-05',
  'Sosialisasi': '2024-02-14',
  'Pelatihan': '2024-03-25',
  'Milad': '2024-11-01',
};

/* ===== Utils ===== */

/* Ambil kategori dengan fallback */
function getCategory(g: GalleryItem) {
  const anyG = g as any;
  return (anyG.category ?? anyG.group ?? anyG.tag ?? 'Umum') as string;
}

/* Ambil tanggal "efektif" item:
   - Kalau item.date ada → pakai itu
   - Kalau kosong → pakai mapping kategori
   - Kalau tetap tidak ada → cek nama file khusus (culture / booster)
*/
function getEffectiveDate(item: GalleryItem): string | undefined {
  const raw = item.date?.trim();
  if (raw) return raw;

  // 1. Mapping berdasarkan kategori (hari besar, dll.)
  const fromCategory = CATEGORY_DATE_MAP[getCategory(item)];
  if (fromCategory) return fromCategory;

  // 2. Spesial untuk Culture Booster: dibedakan lewat nama file
  const img = (item.image ?? '').toLowerCase();

  // semua file yang namanya mengandung "culture" -> Juli 2024
  if (img.includes('culture')) {
    return '2024-07-01';
  }

  // semua file yang namanya mengandung "booster" -> November 2024
  if (img.includes('booster')) {
    return '2024-11-01';
  }

  // 3. Kalau memang tidak diketahui sama sekali
  return undefined;
}

/* Format tanggal penuh untuk caption/tile */
function formatDateID(dateStr?: string) {
  if (!dateStr) return 'Tanpa Tanggal';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/* === KUNCI BULAN BERDASARKAN ITEM ===
   - Pakai tanggal efektif (date asli / fallback)
   - Kalau benar-benar tidak ada, baru "Tanpa Tanggal"
*/
function getMonthKeyFromItem(item: GalleryItem) {
  const eff = getEffectiveDate(item);

  // 1. Kalau ada tanggal efektif → generate YYYY-MM
  if (eff) {
    const d = new Date(eff);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    }
  }

  // 2. fallback terakhir
  return 'Tanpa Tanggal';
}

/* Label bulan Indonesia: "Juli 2024" / atau "Tanpa Tanggal" */
function formatMonthID(monthKey: string) {
  if (monthKey === 'Tanpa Tanggal') return monthKey;
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export default function KegiatanSection() {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  /* daftar kategori + meta (pakai tanggal efektif) */
  const kegiatanList = useMemo(() => {
    const map = new Map<string, { count: number; latestDate: string | null }>();

    for (const it of GALLERY_ITEMS) {
      const cat = getCategory(it);
      const effDate = getEffectiveDate(it) ?? null;
      const meta = map.get(cat) ?? { count: 0, latestDate: null };

      meta.count += 1;

      if (!meta.latestDate || (effDate && effDate > meta.latestDate)) {
        meta.latestDate = effDate;
      }

      map.set(cat, meta);
    }

    return Array.from(map.entries()).map(([category, meta]) => ({
      category,
      ...meta,
    }));
  }, []);

  /* data per kategori aktif */
  const filtered = useMemo(
    () => (activeCat ? GALLERY_ITEMS.filter((g) => getCategory(g) === activeCat) : []),
    [activeCat]
  );

  /* Group by bulan (pakai getMonthKeyFromItem yang sudah pakai tanggal efektif) */
  const groupsByMonth = useMemo(() => {
    if (!activeCat) return [] as { dateKey: string; items: GalleryItem[] }[];

    const bucket: Record<string, GalleryItem[]> = {};
    for (const it of filtered) {
      const key = getMonthKeyFromItem(it);
      (bucket[key] ??= []).push(it);
    }

    const keys = Object.keys(bucket).sort((a, b) => {
      if (a === 'Tanpa Tanggal') return 1;
      if (b === 'Tanpa Tanggal') return -1;
      if (!a.includes('-')) return 1;
      if (!b.includes('-')) return -1;
      return (new Date(b + '-01').getTime() || 0) - (new Date(a + '-01').getTime() || 0);
    });

    return keys.map((k) => ({ dateKey: k, items: bucket[k] }));
  }, [activeCat, filtered]);

  const selected = useMemo(
    () => GALLERY_ITEMS.find((g) => g.id === openId) ?? null,
    [openId]
  );

  const handleOpen = useCallback((id: string) => setOpenId(id), []);
  const handleClose = useCallback(() => setOpenId(null), []);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4">
        {/* Header + Back */}
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
            {activeCat ? activeCat : 'Kegiatan PT. Perkebunan Nusantara IV Regional III'}
          </h1>
        </div>

        {/* LIST KEGIATAN */}
        {!activeCat && (
          <>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 mb-3">
              Klik salah satu kegiatan untuk melihat foto-fotonya.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {kegiatanList.map((k) => (
                <button
                  key={k.category}
                  onClick={() => setActiveCat(k.category)}
                  className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-3 hover:shadow-md transition relative"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 rounded-md p-1.5 bg-emerald-50">
                      <Images className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold leading-snug">{k.category}</div>
                      <div className="mt-1 text-[12px]">
                        {k.latestDate && (
                          <div>
                            <span className="font-semibold">Update:</span>{' '}
                            {formatDateID(k.latestDate)}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* DETAIL FOTO: dikelompokkan per BULAN */}
        {activeCat && (
          <>
            {groupsByMonth.length === 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-[13px] text-slate-600 dark:text-slate-300">
                Belum ada foto untuk kegiatan <span className="font-medium">{activeCat}</span>.
              </div>
            )}

            {groupsByMonth.map(({ dateKey, items }) => (
              <div key={dateKey} className="mt-5">
                {/* Judul bulan kegiatan (di atas fotonya) */}
                <div className="sticky top-0 z-10 -mx-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2">
                  <h3 className="text-base font-semibold">{formatMonthID(dateKey)}</h3>
                  <p className="text-xs text-slate-500">
                    {items.length} foto • {activeCat}
                  </p>
                </div>

                {/* Grid foto */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {items.map((item) => (
                    <PhotoTile key={item.id} item={item} onOpen={() => handleOpen(item.id)} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {/* Modal preview */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
          >
            <div className="relative aspect-16/9 w-full">
              {selected.image ? (
                <Image
                  src={selected.image}
                  alt={selected.title || getCategory(selected)}
                  fill
                  sizes="(min-width:1024px) 60vw, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700" />
              )}
            </div>

            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-4">
              <h4 className="text-base font-semibold">
                {selected.title || getCategory(selected)}
              </h4>
              <div className="text-[12px] text-slate-500 mt-1">
                {formatDateID(getEffectiveDate(selected))}
              </div>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {(selected as any).caption}
              </p>
              <div className="mt-3">
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Kembali
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

/* ===== Foto tile ===== */
function PhotoTile({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  const effDate = getEffectiveDate(item);

  return (
    <button
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 ring-emerald-300"
      aria-label={`Buka foto: ${item.title || getCategory(item)}`}
    >
      <div className="relative aspect-[16/10] w-full">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title || getCategory(item)}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800" />
        )}

        {/* overlay caption kecil */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="h-20 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 p-2">
            <div className="text-left">
              <div className="text-white text-[13px] font-semibold leading-snug line-clamp-2 drop-shadow">
                {item.title || getCategory(item)}
              </div>
              {effDate && (
                <div className="mt-0.5 text-[11px] text-white/80 drop-shadow">
                  {formatDateID(effDate)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
