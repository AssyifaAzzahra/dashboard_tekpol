"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import BackBar from "@/components/shared/BackBar";
import { Factory, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";

type ApiDetail = {
  id: string;
  name: string;
  slug?: string;
  shortProfile: string | null;
  photoUrl: string | null;
  structureUrl: string | null;
  certificateUrl: string | null;
};

type FallbackDetail = any;

type DeckRow = {
  id: string;
  pksId: string;
  fileUrl: string;
  fileName: string;
  fileType?: string;
  coverUrl?: string | null;
  updatedAt?: string | Date;
};

function isPdf(nameOrUrl: string) {
  const s = (nameOrUrl || "").toLowerCase();
  return s.endsWith(".pdf") || s.includes(".pdf");
}

function previewSrc(url: string, name: string, type?: string) {
  if (type === "pdf" || isPdf(name) || isPdf(url)) return url;
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function PksDetailById({
  id,
  onBack,
  fallbackDetail,
}: {
  id: string;
  onBack: () => void;
  fallbackDetail?: FallbackDetail;
}) {
  const [data, setData] = useState<ApiDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [deck, setDeck] = useState<DeckRow | null>(null);
  const [deckLoading, setDeckLoading] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [deckOpen, setDeckOpen] = useState(false);

  useEffect(() => {
    setLightboxOpen(false);
    setIdx(0);
    setDeckOpen(false);
  }, [id]);

  // Detail PKS
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/public/unit/pks/by-id/${encodeURIComponent(id)}`, {
          cache: "no-store",
          signal: ac.signal,
        });

        const json = await safeJson(res);

        if (!res.ok) {
          setData(null);
          return;
        }

        setData(json?.id ? (json as ApiDetail) : null);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setData(null);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id]);

  // Deck (PPT/PDF)
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setDeckLoading(true);

        const res = await fetch(`/api/public/pks-deck/${encodeURIComponent(id)}`, {
          cache: "no-store",
          signal: ac.signal,
        });

        const json = await safeJson(res);

        if (!res.ok) {
          setDeck(null);
          return;
        }

        const row = (json?.data ?? null) as DeckRow | null;
        setDeck(row?.fileUrl ? row : null);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setDeck(null);
      } finally {
        if (!ac.signal.aborted) setDeckLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id]);

  const pickStr = (...vals: any[]) => {
    for (const v of vals) if (typeof v === "string" && v.trim()) return v.trim();
    return "";
  };

  const nama = pickStr(data?.name, fallbackDetail?.nama, fallbackDetail?.name) || "PKS";

  const fotoPks = pickStr(
    data?.photoUrl,
    fallbackDetail?.fotoPks,
    fallbackDetail?.photoUrl,
    fallbackDetail?.images?.[0]
  );

  const struktur = pickStr(
    data?.structureUrl,
    fallbackDetail?.fotoStruktur,
    fallbackDetail?.structureUrl,
    fallbackDetail?.images?.[1]
  );

  const sertifikasiList: string[] = useMemo(() => {
    const fromDb = pickStr(data?.certificateUrl) ? [pickStr(data?.certificateUrl)] : [];
    const fromFallback = Array.isArray(fallbackDetail?.galeri)
      ? (fallbackDetail.galeri as string[])
      : Array.isArray(fallbackDetail?.images)
      ? (fallbackDetail.images as string[]).slice(2)
      : [];

    const cleanFallback = fromFallback.filter((x) => typeof x === "string" && x.trim());
    return fromDb.length ? fromDb : cleanFallback;
  }, [data?.certificateUrl, fallbackDetail]);

  const profilSingkat =
    pickStr(
      data?.shortProfile,
      fallbackDetail?.shortProfile,
      fallbackDetail?.sejarahSingkat,
      fallbackDetail?.sejarah
    ) || "—";

  const allImages = useMemo(() => {
    return [fotoPks, struktur, ...sertifikasiList].filter(
      (x) => typeof x === "string" && x.trim().length > 0
    ) as string[];
  }, [fotoPks, struktur, sertifikasiList]);

  const open = useCallback(
    (i: number) => {
      if (!allImages.length) return;
      setIdx(Math.max(0, Math.min(i, allImages.length - 1)));
      setLightboxOpen(true);
    },
    [allImages]
  );

  const close = useCallback(() => setLightboxOpen(false), []);
  const next = useCallback(() => {
    if (!allImages.length) return;
    setIdx((v) => (v + 1) % allImages.length);
  }, [allImages.length]);

  const prev = useCallback(() => {
    if (!allImages.length) return;
    setIdx((v) => (v - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5">
        <BackBar onBack={onBack} />
        <div className="mt-4 text-sm text-slate-500">Loading...</div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5 space-y-5">
      <BackBar onBack={onBack} />

      <div className="flex items-center gap-3">
        <Factory className="w-6 h-6 text-emerald-600" />
        <div>
          <h2 className="text-xl font-bold">{nama}</h2>
          <p className="text-sm text-slate-500">Detail profil pabrik.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => (fotoPks ? open(0) : undefined)}
            className="relative h-[120px] sm:h-[140px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 ring-1 ring-slate-200/70 dark:ring-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {fotoPks ? (
              <img src={fotoPks} alt="Foto PKS" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-sm text-slate-500">
                Foto belum diisi
              </div>
            )}
            <span className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-md bg-black/40 text-white">
              Foto PKS
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!struktur) return;
              open(fotoPks ? 1 : 0);
            }}
            className="relative h-[120px] sm:h-[140px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 ring-1 ring-slate-200/70 dark:ring-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {struktur ? (
              <img src={struktur} alt="Struktur PKS" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-sm text-slate-500">
                Struktur belum diisi
              </div>
            )}
            <span className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-md bg-black/40 text-white">
              Struktur PKS
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!sertifikasiList.length) return;
              const offset = (fotoPks ? 1 : 0) + (struktur ? 1 : 0);
              open(offset);
            }}
            className="relative h-[120px] sm:h-[140px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 ring-1 ring-slate-200/70 dark:ring-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {sertifikasiList.length ? (
              <img
                src={sertifikasiList[0]}
                alt="Sertifikasi"
                className="w-full h-full object-contain bg-white"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-sm text-slate-500">
                Belum ada sertifikasi
              </div>
            )}
            <span className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-md bg-black/40 text-white">
              Sertifikasi
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!deck?.fileUrl) return;
              setDeckOpen(true);
            }}
            className="relative h-[120px] sm:h-[140px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 ring-1 ring-slate-200/70 dark:ring-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {deckLoading ? (
              <div className="w-full h-full grid place-items-center text-sm text-slate-500">
                Loading profil...
              </div>
            ) : deck?.fileUrl ? (
              deck.coverUrl ? (
                <img src={deck.coverUrl} alt="Profil (Cover)" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-sm text-slate-600">
                  <div className="text-center px-3">
                    <div className="font-medium">Profil</div>
                    <div className="text-xs opacity-70 truncate mt-1">{deck.fileName}</div>
                    <div className="inline-flex items-center gap-2 mt-2 text-xs px-2 py-1 rounded-md bg-black/10">
                      <Eye className="w-3 h-3" />
                      Klik untuk lihat
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="w-full h-full grid place-items-center text-sm text-slate-500">
                Belum ada profil
              </div>
            )}

            <span className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-md bg-black/40 text-white">
              Profil (PPT/PDF)
            </span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 sm:p-5">
        <h3 className="text-base font-semibold">Profil Singkat</h3>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {profilSingkat}
        </p>
      </div>

      {lightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-6xl mx-auto px-6" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={close}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2"
              aria-label="Tutup"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-white/20 bg-black">
              <img src={allImages[idx]} alt="Preview" className="w-full h-full object-contain" />
            </div>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Sebelumnya"
                  type="button"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Berikutnya"
                  type="button"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {deckOpen && deck?.fileUrl && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setDeckOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-6xl mx-auto px-6" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setDeckOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2"
              aria-label="Tutup"
              title="Tutup"
            >
              ✕
            </button>

            <div className="mb-3 text-white">
              <div className="font-semibold">Profil: {nama}</div>
              <div className="text-sm text-white/70">{deck.fileName}</div>
            </div>

            <div className="relative w-full h-[75vh] overflow-hidden rounded-2xl ring-1 ring-white/20 bg-white">
              <iframe
                title="Profil PKS"
                src={previewSrc(deck.fileUrl, deck.fileName, deck.fileType)}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}