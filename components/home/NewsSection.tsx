"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";

type PublicNews = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  date?: string;
  tag?: string;
};

type VideoItem = {
  id: string;
  title: string;
  body: string;
  videoUrl: string;
};

function toYouTubeEmbed(u: string) {
  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) {
      if (url.pathname.startsWith("/embed/")) return `https://www.youtube.com${url.pathname}`;
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return u;
  } catch {
    return u;
  }
}

export default function NewsSection() {
  const [news, setNews] = React.useState<PublicNews[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/news", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as PublicNews[];
        if (!alive) return;
        setNews((Array.isArray(data) ? data : []).slice(0, 12));
      } catch {
        if (!alive) return;
        setNews([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ VIDEO: sesuai link yang kamu kasih (buka di YouTube harus jalan)
  const videos: VideoItem[] = [
    {
      id: "tekpol",
      title: "TEKPOL",
      body: "Video kegiatan TEKPOL",
      videoUrl: "https://youtu.be/iGWSCdX8PGQ?si=xB7Fgs4yi7CwFS31",
    },
    {
      id: "ptpn4",
      title: "PTPN 4",
      body: "Video kegiatan PTPN 4",
      videoUrl: "https://youtu.be/q4UoyL02e1s?si=xx-xmiQOC1Z-uZxH",
    },
    {
      id: "culture",
      title: "One PTPN One Culture",
      body: "Budaya kerja One PTPN One Culture",
      videoUrl: "https://youtu.be/h1agKoNOsnQ?si=PCCjnqGhkmOBOWbf",
    },
  ];

  // =========================
  // NEWS: DRAG + ARROW (FIX CLICK LINK)  ✅ BIARKAN, TIDAK DIUBAH
  // =========================
  const newsScrollRef = React.useRef<HTMLDivElement>(null);
  const isNewsDownRef = React.useRef(false);
  const newsStartXRef = React.useRef(0);
  const newsStartScrollLeftRef = React.useRef(0);
  const movedRef = React.useRef(false);

  const [newsDragging, setNewsDragging] = React.useState(false);

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest("a,button,input,textarea,select,label");
  };

  const onNewsPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(e.target)) return;

    const el = newsScrollRef.current;
    if (!el) return;

    isNewsDownRef.current = true;
    movedRef.current = false;
    newsStartXRef.current = e.clientX;
    newsStartScrollLeftRef.current = el.scrollLeft;

    el.setPointerCapture(e.pointerId);
    setNewsDragging(false);
  };

  const onNewsPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = newsScrollRef.current;
    if (!el || !isNewsDownRef.current) return;

    const delta = newsStartXRef.current - e.clientX;

    if (Math.abs(delta) > 6) {
      movedRef.current = true;
      setNewsDragging(true);
    }

    el.scrollLeft = newsStartScrollLeftRef.current + delta;
  };

  const onNewsPointerUpOrLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = newsScrollRef.current;
    if (el) {
      try {
        el.releasePointerCapture((e as any).pointerId);
      } catch {}
    }

    isNewsDownRef.current = false;

    setTimeout(() => {
      setNewsDragging(false);
      movedRef.current = false;
    }, 0);
  };

  const scrollNewsBy = (dir: "left" | "right") => {
    const el = newsScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -420 : 420, behavior: "smooth" });
  };

  // =========================
  // VIDEO: DRAG + ARROW + LINK FIX ✅ (HANYA BAGIAN INI YANG DIPERBAIKI)
  // =========================
  const videoScrollRef = React.useRef<HTMLDivElement>(null);
  const isVideoDownRef = React.useRef(false);
  const videoStartXRef = React.useRef(0);
  const videoStartScrollLeftRef = React.useRef(0);
  const videoMovedRef = React.useRef(false);
  const [videoDragging, setVideoDragging] = React.useState(false);

  const onVideoPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // ✅ kalau klik di link -> jangan mulai drag
    if ((e.target as HTMLElement).closest("a")) return;

    const el = videoScrollRef.current;
    if (!el) return;

    isVideoDownRef.current = true;
    videoMovedRef.current = false;
    videoStartXRef.current = e.clientX;
    videoStartScrollLeftRef.current = el.scrollLeft;

    el.setPointerCapture(e.pointerId);
    setVideoDragging(false);
  };

  const onVideoPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = videoScrollRef.current;
    if (!el || !isVideoDownRef.current) return;

    const delta = videoStartXRef.current - e.clientX;
    if (Math.abs(delta) > 6) {
      videoMovedRef.current = true;
      setVideoDragging(true);
    }
    el.scrollLeft = videoStartScrollLeftRef.current + delta;
  };

  const onVideoPointerUpOrLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = videoScrollRef.current;
    if (el) {
      try {
        el.releasePointerCapture((e as any).pointerId);
      } catch {}
    }
    isVideoDownRef.current = false;

    setTimeout(() => {
      setVideoDragging(false);
      videoMovedRef.current = false;
    }, 0);
  };

  const scrollVideoBy = (dir: "left" | "right") => {
    const el = videoScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -420 : 420, behavior: "smooth" });
  };

  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
        {/* ========== BOX 1: BERITA TERKINI (TIDAK DIUBAH) ========== */}
        <div className="h-full flex flex-col rounded-2xl border border-slate-200 bg-white/80 shadow-sm p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-lg">
              <Newspaper className="w-4 h-4 text-emerald-600" />
              <h3 className="text-[14px] font-semibold text-emerald-700">Berita Terkini</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollNewsBy("left")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 hover:bg-white shadow-sm"
                aria-label="Geser kiri"
              >
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => scrollNewsBy("right")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 hover:bg-white shadow-sm"
                aria-label="Geser kanan"
              >
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-auto text-sm text-slate-500">Memuat berita...</div>
          ) : news.length === 0 ? (
            <div className="mt-auto text-sm text-slate-500">
              Belum ada berita. Pastikan berita sudah <b>Publish</b>.
            </div>
          ) : (
            <div
              ref={newsScrollRef}
              onPointerDown={onNewsPointerDown}
              onPointerMove={onNewsPointerMove}
              onPointerUp={onNewsPointerUpOrLeave}
              onPointerLeave={onNewsPointerUpOrLeave}
              onPointerCancel={onNewsPointerUpOrLeave}
              className={`
                mt-auto overflow-x-auto scroll-smooth snap-x snap-mandatory grid grid-flow-col gap-2
                auto-cols-[85%] sm:auto-cols-[70%] lg:auto-cols-[45%]
                touch-pan-x overscroll-x-contain select-none
                cursor-${newsDragging ? "grabbing" : "grab"}
                [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden
              `}
            >
              {news.map((n) => {
                const slug = (n.slug || "").trim();
                const href = slug ? `/news/${encodeURIComponent(slug)}` : "";

                return (
                  <article
                    key={n.id}
                    className="snap-start overflow-hidden rounded-lg border border-slate-200 bg-white/90 hover:shadow-md transition hover:-translate-y-0.5"
                  >
                    <div className="relative w-full aspect-[16/10]">
                      {n.image ? (
                        <Image src={n.image} alt={n.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-slate-200" />
                      )}

                      <div className="absolute bottom-1 left-1 flex items-center gap-1 text-[9px]">
                        <span className="bg-white/90 px-1 py-[1px] rounded border border-slate-300">
                          {n.tag ?? "Berita"}
                        </span>
                        <span className="text-white drop-shadow">
                          {n.date ? new Date(n.date).toLocaleDateString("id-ID") : ""}
                        </span>
                      </div>
                    </div>

                    <div className="p-2">
                      <h4 className="text-[11px] font-semibold leading-tight line-clamp-2">{n.title}</h4>
                      <p className="mt-1 text-[9px] text-slate-600 line-clamp-2">{n.excerpt ?? ""}</p>

                      {slug ? (
                        <Link
                          href={href}
                          onClick={(e) => {
                            if (movedRef.current) e.preventDefault();
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="mt-1 inline-block text-[9px] text-emerald-700 underline underline-offset-2"
                        >
                          Baca selengkapnya
                        </Link>
                      ) : (
                        <span className="mt-1 inline-block text-[9px] text-slate-400">
                          Slug kosong (cek data lama)
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* ========== BOX 2: VIDEO YOUTUBE (DIPERBAIKI) ========== */}
        <div className="h-full flex flex-col rounded-2xl border border-slate-200 bg-white/80 shadow-sm p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-lg">
              <Play className="w-4 h-4 text-rose-600" />
              <h3 className="text-[14px] font-semibold text-rose-700">Video YouTube</h3>
            </div>

            {/* ✅ tombol panah kiri kanan khusus video */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollVideoBy("left")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 hover:bg-white shadow-sm"
                aria-label="Geser kiri video"
              >
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => scrollVideoBy("right")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 hover:bg-white shadow-sm"
                aria-label="Geser kanan video"
              >
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </button>
            </div>
          </div>

          <div
            ref={videoScrollRef}
            onPointerDown={onVideoPointerDown}
            onPointerMove={onVideoPointerMove}
            onPointerUp={onVideoPointerUpOrLeave}
            onPointerLeave={onVideoPointerUpOrLeave}
            onPointerCancel={onVideoPointerUpOrLeave}
            className={`mt-auto overflow-x-auto scroll-smooth snap-x snap-mandatory grid grid-flow-col gap-2
                        auto-cols-[85%] sm:auto-cols-[70%] lg:auto-cols-[50%]
                        touch-pan-x overscroll-x-contain select-none
                        cursor-${videoDragging ? "grabbing" : "grab"}
                        [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden`}
          >
            {videos.map((n) => (
              <article
                key={n.id}
                className="snap-start overflow-hidden rounded-lg border border-slate-200 bg-white/90 hover:shadow-md transition hover:-translate-y-0.5"
              >
                <div className="relative w-full aspect-[16/10]">
                  <iframe
                    className={`absolute inset-0 h-full w-full rounded-t-lg ${
                      videoDragging ? "pointer-events-none" : ""
                    }`}
                    src={toYouTubeEmbed(n.videoUrl)}
                    title={n.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="p-2">
                  <h4 className="text-[11px] font-semibold leading-tight line-clamp-2">{n.title}</h4>
                  <p className="mt-1 text-[9px] text-slate-600 line-clamp-2">{n.body}</p>

                  {/* ✅ link fix: pasti kebuka */}
                  <a
                    href={n.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      if (videoMovedRef.current) e.preventDefault();
                    }}
                    className="mt-1 inline-block text-[9px] text-emerald-700 underline underline-offset-2"
                  >
                    Buka di YouTube
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
