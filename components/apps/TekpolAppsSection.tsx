"use client";

import React from "react";
import { ExternalLink, Search, X } from "lucide-react";
import type { Category } from "@/lib/types";

type DbApp = {
  id: string;
  name: string;
  category: Category;
  description?: string | null;
  url?: string | null;
  logoUrl?: string | null;
};

function normalizeUrl(v?: string | null) {
  if (!v) return "#";
  const t = v.trim();
  if (!t) return "#";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function defaultDesc(cat: Category) {
  return cat === "HO" ? "Aplikasi HO" : "Aplikasi Regional";
}

export default function TekpolAppsSection() {
  const [apps, setApps] = React.useState<DbApp[]>([]);
  const [loading, setLoading] = React.useState(false);

  // ✅ search state
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/apps", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as DbApp[];
        if (!alive) return;
        setApps(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ filter apps by query (name/desc/category)
  const filteredApps = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;

    return apps.filter((app) => {
      const name = (app.name ?? "").toLowerCase();
      const desc = (app.description ?? defaultDesc(app.category)).toLowerCase();
      const cat = (app.category ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }, [apps, query]);

  return (
    <section className="rounded-3xl overflow-hidden bg-white/60 border border-white/30 shadow-sm">
      <div className="p-5">
        {/* HEADER + SEARCH */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-1 text-2xl font-bold">Tekpol Apps</div>
            <div className="text-slate-600">
              {filteredApps.length} item{filteredApps.length !== 1 ? "" : ""}{" "}
              {query.trim() ? (
                <span className="text-slate-500">(dari {apps.length})</span>
              ) : null}
            </div>
          </div>

          {/* ✅ Search Bar */}
          <div className="w-full md:w-[360px]">
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 border border-slate-200 px-3 py-2 shadow-sm">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari aplikasi..."
                className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
              />
              {query.trim() ? (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-lg hover:bg-slate-100"
                  title="Clear"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-3 text-sm text-slate-500">Memuat...</div>
        )}

        {/* LIST */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const href: string = normalizeUrl(app.url);
            const logo: string = app.logoUrl ?? "";
            const desc = app.description ?? defaultDesc(app.category);

            return (
              <div
                key={app.id}
                className="
                  group rounded-2xl
                  bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/60
                  border border-slate-200
                  shadow-sm
                  hover:shadow-md
                  transition
                "
              >
                <div className="p-4 flex items-center gap-4">
                  {/* LOGO */}
                  <div className="relative shrink-0">
                    <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                      {logo ? (
                        <img
                          src={logo}
                          alt={app.name}
                          className="max-h-[85%] max-w-[85%] object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-xs font-medium text-slate-400">
                          LOGO
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-slate-900 font-semibold truncate text-[17px]">
                          {app.name}
                        </div>
                        <div className="text-slate-600 text-sm mt-1 truncate">
                          {desc}
                        </div>
                      </div>

                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <span>Buka</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {/* TAG */}
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-white/80 text-slate-700 border border-slate-200">
                        {app.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {!loading && filteredApps.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
            Tidak ada aplikasi yang cocok dengan pencarian:{" "}
            <span className="font-semibold text-slate-800">{query}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
