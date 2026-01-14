"use client";

import Image from "next/image";
import {
  Factory,
  X,
  ChevronLeft,
  ChevronRight,
  Presentation,
  Maximize2,
} from "lucide-react";
import BackBar from "@/components/shared/BackBar";
import type { PksDetail } from "@/lib/types";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";

type Deck = {
  fileUrl: string;
  fileName: string;
  fileType?: string | null; // "pdf" | "ppt" | "pptx"
  coverUrl?: string | null;
};

export default function PksDetailView({
  detail,
  onBack,
}: {
  detail: PksDetail & {
    galeri?: string[];
    sejarahSingkat?: string;
    hideSertifikasi?: boolean;
  };
  onBack: () => void;
}) {
  const isPdf = (s: string) => s.toLowerCase().endsWith(".pdf");
  const isPpt = (s: string) =>
    s.toLowerCase().endsWith(".ppt") || s.toLowerCase().endsWith(".pptx");

  // ===== Fallback gambar utama =====
  const fotoPksSrc =
    (detail as any).fotoPks ??
    (detail as any).images?.[0] ??
    "/images/pkslda.jpg";
  const fotoStrukturSrc =
    (detail as any).fotoStruktur ??
    (detail as any).images?.[1] ??
    "/images/strukturlda.png";

  const hideSertifikasi = Boolean((detail as any).hideSertifikasi);

  // ✅ grid otomatis 3 / 4 kartu
  const gridCols = hideSertifikasi
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  // ===== Galeri sertifikasi =====
  const galeri: string[] = Array.isArray((detail as any).galeri)
    ? ((detail as any).galeri as string[])
    : Array.isArray((detail as any).images)
    ? (detail as any).images.slice(2)
    : [];

  const hasCert = galeri.length > 0;

  // ===== Lightbox images list =====
  const allImages = useMemo(
    () => [fotoPksSrc, fotoStrukturSrc, ...galeri],
    [fotoPksSrc, fotoStrukturSrc, galeri]
  );

  // ===== Sejarah singkat =====
  const sejarahSingkat =
    (detail as any).sejarahSingkat ?? (detail as any).sejarah ?? "—";

  // ===== Profil deck dari DB =====
  const [deck, setDeck] = useState<Deck | null>(null);
  const [deckOpen, setDeckOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/pks-deck?pksId=${detail.id}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!alive) return;
        setDeck(json?.fileUrl ? json : null);
      } catch {
        if (alive) setDeck(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [detail.id]);

  const deckKind = useMemo(() => {
    if (!deck?.fileUrl) return "none";
    const name = deck.fileName || deck.fileUrl;
    const t = (deck.fileType ?? "").toLowerCase();
    if (t === "pdf" || isPdf(name) || isPdf(deck.fileUrl)) return "pdf";
    if (t === "ppt" || t === "pptx" || isPpt(name) || isPpt(deck.fileUrl))
      return "ppt";
    return "unknown";
  }, [deck]);

  const deckViewerSrc = useMemo(() => {
    if (!deck?.fileUrl) return "";
    if (deckKind === "pdf") return deck.fileUrl;
    if (deckKind === "ppt") {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        deck.fileUrl
      )}`;
    }
    return deck.fileUrl;
  }, [deck, deckKind]);

  // ✅ fullscreen
  const deckWrapRef = useRef<HTMLDivElement | null>(null);
  const requestFs = useCallback(async () => {
    const el = deckWrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      // ignore
    }
  }, []);

  // ===== Lightbox gambar =====
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deckOpen) setDeckOpen(false);
        if (lightboxOpen) closeLightbox();
      }
      if (lightboxOpen) {
        if (e.key === "ArrowRight") nextLB();
        if (e.key === "ArrowLeft") prevLB();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deckOpen, lightboxOpen, closeLightbox, nextLB, prevLB]);

  // ===== Sertifikasi slider =====
  const certScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollCert = useCallback((dir: "left" | "right") => {
    const el = certScrollRef.current;
    if (!el) return;
    const amount = 220; // ✅ lebih kecil
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  /**
   * ✅ Ukuran kartu diperkecil & responsif:
   * - HP: lebih pendek
   * - Desktop: tetap nyaman
   */
  const IMAGE_WRAPPER =
    "group relative w-full h-[92px] sm:h-[110px] lg:h-[120px] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900";

  const CAPTION =
    "absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-md bg-black/40 text-white backdrop-blur-sm border border-white/20";

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5">
      <BackBar onBack={onBack} />

      <div className="flex items-center gap-3">
        <Factory className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-bold">{detail.nama}</h2>
      </div>
      <p className="text-sm text-slate-500 mt-1">Detail profil pabrik.</p>

      {/* ====== KARTU ATAS (3 / 4 otomatis) ====== */}
      <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-2 sm:p-3">
        <div className={`grid ${gridCols} gap-2 sm:gap-3 items-stretch`}>
          {/* Foto */}
          <button
            type="button"
            className={`${IMAGE_WRAPPER} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            onClick={() => openLightbox(0)}
          >
            <Image
              src={fotoPksSrc}
              alt={`${detail.nama} - Foto PKS`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <span className={CAPTION}>Foto PKS</span>
          </button>

          {/* Struktur */}
          <button
            type="button"
            className={`${IMAGE_WRAPPER} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            onClick={() => openLightbox(1)}
          >
            <Image
              src={fotoStrukturSrc}
              alt={`${detail.nama} - Struktur PKS`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <span className={CAPTION}>Struktur PKS</span>
          </button>

          {/* Sertifikasi */}
          {!hideSertifikasi && (
            <div className={`${IMAGE_WRAPPER} ring-1 ring-slate-200/70 dark:ring-slate-800`}>
              {hasCert ? (
                <>
                  <div
                    ref={certScrollRef}
                    className="absolute inset-0 flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory p-2"
                  >
                    {galeri.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openLightbox(2 + i)}
                        className="relative h-full min-w-[150px] sm:min-w-[160px] snap-center overflow-hidden rounded-lg bg-white/70"
                      >
                        <Image
                          src={src}
                          alt={`Sertifikasi ${detail.nama} ${i + 1}`}
                          fill
                          className="object-contain p-1"
                          sizes="160px"
                        />
                      </button>
                    ))}
                  </div>

                  {galeri.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => scrollCert("left")}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/45"
                        aria-label="Sertifikasi sebelumnya"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCert("right")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/45"
                        aria-label="Sertifikasi berikutnya"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">
                  Belum ada sertifikasi.
                </div>
              )}

              <span className={CAPTION}>Sertifikasi</span>
            </div>
          )}

          {/* Profil */}
          <button
            type="button"
            className={`${IMAGE_WRAPPER} ring-1 ring-slate-200/70 dark:ring-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            onClick={() => {
              if (deck?.fileUrl) setDeckOpen(true);
            }}
          >
            {deck?.coverUrl ? (
              <>
                <Image
                  src={deck.coverUrl}
                  alt={`Cover Profil ${detail.nama}`}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded-md bg-white/15 text-white backdrop-blur-sm border border-white/20">
                  Klik untuk lihat
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Profil (PPT/PDF)
                </div>
                {deck?.fileUrl ? (
                  <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {deck.fileName}
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-slate-500">Belum ada file</div>
                )}
              </div>
            )}

            <span className={CAPTION}>Profil</span>
          </button>
        </div>
      </div>

      {/* Profil Singkat */}
      <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 sm:p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Profil Singkat
        </h3>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {sejarahSingkat}
        </p>
      </div>

      {/* ===== MODAL PROFIL ===== */}
      {deckOpen && deck?.fileUrl && (
        <div
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setDeckOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-6xl mx-auto px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDeckOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2"
              aria-label="Tutup"
              title="Tutup"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-between mb-3 text-white">
              <div>
                <div className="font-semibold">Profil {detail.nama}</div>
                <div className="text-sm text-white/70">{deck.fileName}</div>
              </div>

              {deckKind === "ppt" ? (
                <button
                  type="button"
                  onClick={requestFs}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm"
                  title="Present (Fullscreen)"
                >
                  <Presentation className="w-4 h-4" />
                  Present
                </button>
              ) : (
                <button
                  type="button"
                  onClick={requestFs}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                  Full Screen
                </button>
              )}
            </div>

            <div
              ref={deckWrapRef}
              className="relative w-full h-[80vh] overflow-hidden rounded-2xl ring-1 ring-white/20 bg-white"
            >
              <iframe
                title={`Profil ${detail.nama}`}
                src={deckViewerSrc}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== LIGHTBOX GAMBAR ===== */}
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
          </div>
        </div>
      )}
    </section>
  );
}
