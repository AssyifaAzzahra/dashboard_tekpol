// app/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Search, ExternalLink, FileText } from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';
import ContentGrid from '@/components/content/ContentGrid';
import AppHeader from '@/components/layout/AppHeader';

import { CONTENT_MAP } from '@/lib/constants';
import type { PathKey, LinkItem, HomeView } from '@/lib/types';
import HomeRouter from '@/components/home/HomeRouter';
import GallerySection from '@/components/gallery/GallerySection';

type GroupItem = { id: string; title: string; children: LinkItem[] };
function isGroupItem(it: unknown): it is GroupItem {
  return typeof it === 'object' && it !== null && 'children' in it && Array.isArray((it as { children: unknown }).children);
}

export default function Page() {
  const [activeKey, setActiveKey] = useState<PathKey>('home');
  const [search, setSearch] = useState('');
  const [homeView, setHomeView] = useState<HomeView>('root'); // ⬅️ view internal Home

  const content = CONTENT_MAP[activeKey] ?? { title: 'Tidak ditemukan', items: [] };

  const hasGroupedItems = useMemo(
    () => Array.isArray(content.items) && content.items.some((it) => isGroupItem(it)),
    [content.items]
  );

  const filteredFlatItems: LinkItem[] = useMemo(() => {
    if (hasGroupedItems) return [];
    const list = (content.items as LinkItem[]) || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.desc?.toLowerCase().includes(q) ||
        i.tag?.toLowerCase().includes(q)
    );
  }, [content.items, hasGroupedItems, search]);

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100">
      <AppHeader />

      <div className="mx-auto max-w-[1400px] px-2 sm:px-4 py-4 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        <Sidebar
          activeKey={activeKey}
          onSelect={(k) => {
            setActiveKey(k);
            setSearch('');
          }}
          onGoHomeView={(v) => {
            // pindahkan ke Home + set sub-view
            setActiveKey('home');
            setHomeView(v);
          }}
        />

        <main className="space-y-4">
          {activeKey === 'home' ? (
            <HomeRouter
              forcedView={homeView}
              onViewChange={(v) => setHomeView(v)}
            />
          ) : activeKey === 'galeri' ? (
            <GallerySection />
          ) : (
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold">{content.title}</h1>
                  {'subtitle' in content && (content as { subtitle?: string }).subtitle && (
                    <p className="text-sm text-slate-500 mt-1">
                      {(content as { subtitle?: string }).subtitle}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari dokumen…"
                    className="pl-9 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 ring-emerald-500/40"
                  />
                </div>
              </div>

              <div className="mt-5">
                {hasGroupedItems ? (
                  <ContentGrid bucket={content as unknown as { title: string; items: GroupItem[] }} search={search} />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredFlatItems.map((item) => (
                      <article
                        key={item.id}
                        className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-emerald-600" />
                              <h3 className="font-semibold leading-tight truncate">{item.title}</h3>
                            </div>
                            {item.desc && <p className="text-sm text-slate-500 mt-1 truncate">{item.desc}</p>}
                            {item.tag && (
                              <span className="mt-2 inline-flex px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Buka"
                          >
                            Buka
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </article>
                    ))}
                    {filteredFlatItems.length === 0 && (
                      <div className="col-span-full text-center text-slate-500 py-10">
                        Tidak ada dokumen yang cocok.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
