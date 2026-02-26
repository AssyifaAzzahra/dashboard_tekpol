"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ExternalLink, FileText } from "lucide-react";

import KegiatanSection from "@/components/gallery/KegiatanSection";
import Sidebar from "@/components/layout/Sidebar";
import ContentGrid from "@/components/content/ContentGrid";
import AppHeader from "@/components/layout/AppHeader";

import type { PathKey, LinkItem, HomeView } from "@/lib/types";
import HomeRouter from "@/components/home/HomeRouter";

import TekpolAppsSection from "@/components/apps/TekpolAppsSection";
import PksDocumentUploadSection from "@/components/pks/PksDocumentUploadSection";

type GroupItem = { id: string; title: string; children: LinkItem[] };

type ContentBucket = {
  title: string;
  items: GroupItem[];
};

type ApiResponse = {
  from: "db" | "fallback";
  key: string;
  title: string;
  content: ContentBucket;
};

function isGroupItem(it: unknown): it is GroupItem {
  return (
    typeof it === "object" &&
    it !== null &&
    "children" in it &&
    Array.isArray((it as { children: unknown }).children)
  );
}

export default function Page() {
  const [activeKey, setActiveKey] = useState<PathKey>("home");
  const [search, setSearch] = useState("");
  const [homeView, setHomeView] = useState<HomeView>("root");
  const [content, setContent] = useState<ContentBucket>({
    title: "",
    items: [],
  });

  // 🔥 FETCH DARI API BUKAN CONSTANT
  useEffect(() => {
    if (activeKey === "home") return;

    async function load() {
      const res = await fetch(
        `/api/public/content?key=${encodeURIComponent(activeKey)}`,
        { cache: "no-store" }
      );

      const data: ApiResponse = await res.json();
      if (data?.content) {
        setContent(data.content);
      }
    }

    load();
  }, [activeKey]);

  const hasGroupedItems = useMemo(
    () => Array.isArray(content.items) && content.items.some((it) => isGroupItem(it)),
    [content.items]
  );

  const filteredFlatItems: LinkItem[] = useMemo(() => {
    if (hasGroupedItems) return [];
    const list = (content.items as unknown as LinkItem[]) || [];
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
            setSearch("");
          }}
          onGoHomeView={(v) => {
            setActiveKey("home");
            setHomeView(v);
          }}
        />

        <main className="space-y-4">
          {activeKey === "home" ? (
            <HomeRouter forcedView={homeView} onViewChange={(v) => setHomeView(v)} />
          ) : activeKey === "galeri" ? (
            <KegiatanSection />
          ) : activeKey === "tekpol-apps" ? (
            <TekpolAppsSection />
          ) : activeKey === ("pks-dokumen" as PathKey) ? (
            <section className="rounded-2xl border bg-white p-5">
              <PksDocumentUploadSection />
            </section>
          ) : (
            <section className="rounded-2xl border bg-white p-5">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">{content.title}</h1>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari dokumen…"
                    className="pl-9 pr-3 py-2 rounded-lg bg-slate-100 border text-sm"
                  />
                </div>
              </div>

              <div className="mt-5">
                {hasGroupedItems ? (
                  <ContentGrid bucket={content} search={search} />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredFlatItems.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border p-4"
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold">{item.title}</h3>
                            {item.desc && (
                              <p className="text-sm text-slate-500 mt-1">
                                {item.desc}
                              </p>
                            )}
                          </div>

                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Buka
                          </a>
                        </div>
                      </article>
                    ))}
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