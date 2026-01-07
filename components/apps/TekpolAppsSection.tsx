"use client";

import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import { TEKPOL_APPS_BUCKET } from "@/lib/constants/sections/apps";
import type { LinkItem } from "@/lib/types";

type Category = "HO" | "REGIONAL";

type DbApp = {
  id: string;
  name: string;
  category: Category;
  description?: string | null;
  url?: string | null;
};

function normalizeUrl(u?: string | null) {
  if (!u) return "";
  const t = String(u).trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export default function TekpolAppsSection({ search }: { search: string }) {
  const [dbApps, setDbApps] = React.useState<DbApp[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/apps", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as any[];

        if (!alive) return;

        const mapped: DbApp[] = (Array.isArray(data) ? data : []).map((a) => ({
          id: String(a.id),
          name: String(a.name),
          category: (a.category === "REGIONAL" ? "REGIONAL" : "HO") as Category,
          description: a.description ?? null,
          url: a.url ?? null,
        }));

        setDbApps(mapped);
      } catch {
        if (!alive) return;
        setDbApps([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ---- apps lama (static) tetap dipakai
  const legacyItems = (TEKPOL_APPS_BUCKET.items as LinkItem[]) ?? [];

  // ---- apps baru dari DB -> LinkItem
  const dbItems: LinkItem[] = dbApps.map((a) => ({
    id: `db-${a.id}`,
    title: a.name,
    desc: a.description ?? (a.category === "HO" ? "Aplikasi HO" : "Aplikasi Regional"),
    tag: a.category === "HO" ? "HO" : "REGIONAL",
    href: normalizeUrl(a.url) || "#",
  }));

  // gabungkan tanpa “menghapus” yang lama (kalau judul sama, utamakan yang lama biar aman)
  const merged: LinkItem[] = (() => {
    const seen = new Set<string>();
    const out: LinkItem[] = [];

    for (const it of legacyItems) {
      const key = it.title.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(it);
      }
    }

    for (const it of dbItems) {
      const key = it.title.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(it);
      }
    }

    return out;
  })();

  const q = search.trim().toLowerCase();
  const filtered = !q
    ? merged
    : merged.filter((i) => {
        return (
          i.title.toLowerCase().includes(q) ||
          (i.desc ?? "").toLowerCase().includes(q) ||
          (i.tag ?? "").toLowerCase().includes(q)
        );
      });

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Tekpol Apps</h1>
          <p className="text-sm text-slate-500 mt-1">
           {loading ? "Memuat..." : `${filtered.length} item`}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const disabled = !item.href || item.href === "#";

            return (
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

                    {item.desc ? <p className="text-sm text-slate-500 mt-1 truncate">{item.desc}</p> : null}

                    {item.tag ? (
                      <span className="mt-2 inline-flex px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {item.tag}
                      </span>
                    ) : null}
                  </div>

                  <a
                    href={disabled ? undefined : item.href}
                    target={disabled ? undefined : "_blank"}
                    rel={disabled ? undefined : "noreferrer"}
                    aria-disabled={disabled}
                    className={
                      "shrink-0 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium " +
                      (disabled
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-emerald-600 text-white hover:bg-emerald-700")
                    }
                    title={disabled ? "URL belum diisi di Admin" : "Buka"}
                    onClick={(e) => {
                      if (disabled) e.preventDefault();
                    }}
                  >
                    Buka
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </article>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-10">Tidak ada apps yang cocok.</div>
          )}
        </div>
      </div>
    </section>
  );
}
