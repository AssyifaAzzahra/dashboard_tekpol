// components/home/PksDetail.tsx
'use client';

import Image from 'next/image';
import { Factory, X, ChevronLeft, ChevronRight } from 'lucide-react';
import BackBar from '@/components/shared/BackBar';
import type { PksDetail } from '@/lib/types';
import { useMemo, useState, useCallback, useEffect } from 'react';

export default function PksDetailView({
  detail,
  onBack,
}: {
  detail: PksDetail & { galeri?: string[]; sejarahSingkat?: string };
  onBack: () => void;
}) {
  // ===== Fallback gambar utama =====
  const fotoPksSrc =
    (detail as any).fotoPks ?? (detail as any).images?.[0] ?? '/images/pkslda.jpg';
  const fotoStrukturSrc =
    (detail as any).fotoStruktur ?? (detail as any).images?.[1] ?? '/images/strukturlda.png';

  // ===== Galeri sertifikasi (mulai dari index 2 kalau pakai images[]) =====
  const galeri: string[] = Array.isArray((detail as any).galeri)
    ? ((detail as any).galeri as string[])
    : Array.isArray((detail as any).images)
    ? (detail as any).images.slice(2)
    : [];

  // ===== Gabungan untuk lightbox (2 pertama = foto + struktur) =====
  const allImages = useMemo(
    () => [fotoPksSrc, fotoStrukturSrc, ...galeri],
    [fotoPksSrc, fotoStrukturSrc, galeri]
  );

  // ===== Sejarah singkat =====
  const sejarahSingkat =
    (detail as any).sejarahSingkat ?? (detail as any).sejarah ?? '—';

  // ===== Lightbox =====
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const openLightbox = useCallback((idx: number) => {
    setActiveIdx(idx);
    setLightboxOpen(true);
  }, []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const nextLB = useCallback(
    () => setActiveIdx((i) => (i + 1) % allImages.length),
    [allImages.length]
  );
  const prevLB = useCallback(
    () => setActiveIdx((i) => (i - 1 + allImages.length) % allImages.length),
    [allImages.length]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLB();
      if (e.key === 'ArrowLeft') prevLB();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, closeLightbox, nextLB, prevLB]);

  // ===== Slider Sertifikasi =====
  const [slideIdx, setSlideIdx] = useState(0);
  const hasCert = galeri.length > 0;
  const certActiveSrc = hasCert ? galeri[slideIdx % galeri.length] : undefined;

  const nextSlide = () =>
    setSlideIdx((i) => (galeri.length ? (i + 1) % galeri.length : 0));
  const prevSlide = () =>
    setSlideIdx((i) => (galeri.length ? (i - 1 + galeri.length) % galeri.length : 0));

  // ===== Wrapper biar semua kartu gambar SEUKURAN =====
  const IMAGE_WRAPPER =
    'group relative w-full aspect-[16/9] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900';

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5">
      {/* Tombol kembali */}
      <BackBar onBack={onBack} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Factory className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-bold">{detail.nama}</h2>
      </div>
      <p className="text-sm text-slate-500 mt-1">Detail profil pabrik.</p>

      {/* ====== AREA GAMBAR ====== */}
      <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-3 sm:p-4">
        {/* 3 kartu, ukurannya sama semua */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Foto PKS */}
          <button
            type="button"
            className={`${IMAGE_WRAPPER} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            onClick={() => openLightbox(0)}
            aria-label="Perbesar foto PKS"
          >
            <Image
              src={fotoPksSrc}
              alt={`${detail.nama} - Foto PKS`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 33vw"
            />
            <figcaption className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-md bg-black/40 text-white backdrop-blur-sm border border-white/20">
              Foto PKS
            </figcaption>
          </button>

          {/* Struktur PKS */}
          <button
            type="button"
            className={`${IMAGE_WRAPPER} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            onClick={() => openLightbox(1)}
            aria-label="Perbesar struktur PKS"
          >
            <Image
              src={fotoStrukturSrc}
              alt={`${detail.nama} - Struktur PKS`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 33vw"
            />
            <figcaption className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-md bg-black/40 text-white backdrop-blur-sm border border-white/20">
              Struktur PKS
            </figcaption>
          </button>

          {/* Sertifikasi PKS */}
          <div className={`${IMAGE_WRAPPER} ring-1 ring-slate-200/70 dark:ring-slate-800`}>
            {hasCert ? (
              <Image
                src={certActiveSrc as string}
                alt={`Sertifikasi ${detail.nama}`}
                fill
                // kartu sama besar, isinya dibuat agak kecil dengan contain + padding
                className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 33vw"
                onClick={() => openLightbox(2 + (slideIdx % galeri.length))}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">
                Belum ada sertifikasi.
              </div>
            )}

            <figcaption className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-md bg-black/40 text-white backdrop-blur-sm border border-white/20">
              Sertifikasi
            </figcaption>

            {galeri.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  type="button"
                  aria-label="Sebelumnya"
                  title="Sebelumnya"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/40"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  type="button"
                  aria-label="Berikutnya"
                  title="Berikutnya"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/40"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ====== Profil Singkat ====== */}
      <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 sm:p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Profil Singkat
        </h3>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {sejarahSingkat}
        </p>
      </div>

      {/* ====== Profil Bawah ====== */}
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white/80 dark:bg-slate-900/60">
          <h3 className="font-semibold mb-2">Informasi Umum</h3>
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <li>
              <span className="font-medium">Alamat:</span>{' '}
              {detail.infoUmum.alamat}
            </li>
            <li>
              <span className="font-medium">Kapasitas:</span>{' '}
              {detail.infoUmum.kapasitasTbsPerJam} TBS/jam
            </li>
            <li>
              <span className="font-medium">Tahun Operasional:</span>{' '}
              {detail.infoUmum.tahunOperasional}
            </li>
            <li>
              <span className="font-medium">Jumlah Line:</span>{' '}
              {detail.infoUmum.jumlahLine}
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white/80 dark:bg-slate-900/60">
          <h3 className="font-semibold mb-2">Catatan Operasional</h3>
          <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
            {detail.catatan?.length > 0 ? (
              detail.catatan.map((c, i) => <li key={i}>{c}</li>)
            ) : (
              <li>Tidak ada catatan.</li>
            )}
          </ul>
        </div>
      </div>

      {/* ====== LIGHTBOX ====== */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-6xl mx-auto px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2"
              aria-label="Tutup"
              title="Tutup"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-white/20 bg-black">
              <Image
                key={activeIdx}
                src={allImages[activeIdx]}
                alt={`Preview ${activeIdx + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevLB}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Sebelumnya"
                  title="Sebelumnya"
                  type="button"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={nextLB}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Berikutnya"
                  title="Berikutnya"
                  type="button"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}

            {allImages.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    aria-label={`Pilih gambar ${i + 1}`}
                    className={`h-2.5 w-2.5 rounded-full ${
                      i === activeIdx ? 'bg-white' : 'bg-white/40'
                    }`}
                    type="button"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
