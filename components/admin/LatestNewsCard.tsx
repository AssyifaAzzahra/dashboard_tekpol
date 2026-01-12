"use client";

import React, { useEffect, useState } from "react";
import { Instagram, FileText } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  sourceType: "INTERNAL" | "INSTAGRAM";
  instagramUrl?: string | null;
  createdAt: string;
};

export default function LatestNewsCard() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/news?latest=1", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setItems(Array.isArray(json) ? json : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Latest News / Instagram
        </h3>
        <p className="text-xs text-slate-500">
          5 postingan terbaru dari admin
        </p>
      </div>

      <div className="divide-y">
        {loading && (
          <div className="px-4 py-4 text-sm text-slate-500">
            Memuat data…
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="px-4 py-4 text-sm text-slate-500">
            Belum ada berita.
          </div>
        )}

        {items.map((n) => {
          const isIG = n.sourceType === "INSTAGRAM" && n.instagramUrl;

          return (
            <a
              key={n.id}
              href={isIG ? n.instagramUrl! : `/admin/news`}
              target={isIG ? "_blank" : "_self"}
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  isIG
                    ? "bg-pink-50 text-pink-600"
                    : "bg-sky-50 text-sky-600"
                }`}
              >
                {isIG ? (
                  <Instagram className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-900">
                  {n.title}
                </div>
                <div className="text-xs text-slate-500">
                  {isIG ? "Instagram Post" : "Artikel"}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
