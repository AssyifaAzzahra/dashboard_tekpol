'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Newspaper } from 'lucide-react';
import { NEWS_LIST } from '@/lib/data/news';

function toYouTubeEmbed(u: string) {
  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (host.endsWith('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) return `https://www.youtube.com${url.pathname}`;
      const id = url.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return u;
  } catch {
    return u;
  }
}

export default function NewsSection() {
  const news = NEWS_LIST.filter((n) => n.id === 'n1' || n.id === 'n2');

  // card ke-3 manual
  const videos = [
    ...NEWS_LIST.filter((n) => n.id === 'n3' || n.id === 'n4'),
    {
      id: 'n5',
      title: 'Teknik dan Pengolahan',
      body: 'Video Kegiatan di Divisi Teknik dan Pengolahan',
      videoUrl: 'https://youtu.be/ZZd307St5gE?si=c2L0R0O-GESVFBj8',
    },
  ];

  // ==== DRAG-TO-SCROLL logic ====
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isDownRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startScrollLeftRef = React.useRef(0);
  const [dragging, setDragging] = React.useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    isDownRef.current = true;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
    setDragging(false);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !isDownRef.current) return;
    const delta = startXRef.current - e.clientX;
    if (Math.abs(delta) > 3) setDragging(true); // threshold kecil biar cepat aktif
    el.scrollLeft = startScrollLeftRef.current + delta;
  };

  const onPointerUpOrLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (el && (e.type === 'pointerup' || e.type === 'pointercancel')) {
      try { el.releasePointerCapture((e as any).pointerId); } catch {}
    }
    isDownRef.current = false;
    // beri jeda singkat supaya klik pada iframe tidak ketahan
    setTimeout(() => setDragging(false), 60);
  };

  return (
    <section className="mt-6">  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
        {/* ========== BOX 1: BERITA TERKINI ========== */}
        <div className="h-full flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 shadow-sm p-4">
          <div className="mb-3 flex items-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-lg">
              <Newspaper className="w-4 h-4 text-emerald-600" />
              <h3 className="text-[14px] font-semibold text-emerald-700">Berita Terkini</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            {news.map((n) => (
              <article
                key={n.id}
                className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 hover:shadow-md transition hover:-translate-y-0.5"
              >
                <div className="relative w-full aspect-[16/10]">
                  {n.image ? (
                    <Image src={n.image} alt={n.title} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800" />
                  )}
                  <div className="absolute bottom-1 left-1 flex items-center gap-1 text-[9px]">
                    <span className="bg-white/90 dark:bg-slate-800/70 px-1 py-[1px] rounded border border-slate-300 dark:border-slate-700">
                      {n.tag}
                    </span>
                    <span className="text-white drop-shadow">{n.date}</span>
                  </div>
                </div>
                <div className="p-2">
                  <h4 className="text-[11px] font-semibold leading-tight line-clamp-2">{n.title}</h4>
                  <p className="mt-1 text-[9px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {n.excerpt}
                  </p>
                  <span className="mt-1 inline-block text-[9px] text-emerald-700 dark:text-emerald-300 underline underline-offset-2">
                    Baca selengkapnya
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ========== BOX 2: VIDEO YOUTUBE (SWIPE + DRAG TO SCROLL) ========== */}
        <div className="h-full flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 shadow-sm p-4">
          <div className="mb-3 flex items-center">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-lg">
              <Play className="w-4 h-4 text-rose-600" />
              <h3 className="text-[14px] font-semibold text-rose-700">Video YouTube</h3>
            </div>
          </div>

          <div
            ref={scrollRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUpOrLeave}
            onPointerLeave={onPointerUpOrLeave}
            onPointerCancel={onPointerUpOrLeave}
            className={`mt-auto overflow-x-auto scroll-smooth snap-x snap-mandatory grid grid-flow-col gap-2
                        auto-cols-[85%] sm:auto-cols-[70%] lg:auto-cols-[50%]
                        touch-pan-x overscroll-x-contain select-none
                        cursor-${dragging ? 'grabbing' : 'grab'}
                        [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden`}
          >
            {videos.map((n) => (
              <article
                key={n.id}
                className="snap-start overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 hover:shadow-md transition hover:-translate-y-0.5"
              >
                <div className="relative w-full aspect-[16/10]">
                  <iframe
                    className={`absolute inset-0 h-full w-full rounded-t-lg ${dragging ? 'pointer-events-none' : ''}`}
                    src={toYouTubeEmbed(n.videoUrl!)}
                    title={n.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="p-2">
                  <h4 className="text-[11px] font-semibold leading-tight line-clamp-2">{n.title}</h4>
                  <p className="mt-1 text-[9px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {n.body}
                  </p>
                  <a
                    href={n.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-[9px] text-emerald-700 dark:text-emerald-300 underline underline-offset-2"
                  >
                    Tonton di YouTube
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
