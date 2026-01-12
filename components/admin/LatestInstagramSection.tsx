"use client";

import React from "react";

type IgItem = {
  id: string;
  title: string;
  instagramUrl: string | null;
  date: string;
};

function toInstagramEmbedCaptioned(urlStr: string | null | undefined) {
  if (!urlStr) return null;
  try {
    const u = new URL(urlStr);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "instagram.com" && host !== "instagr.am") return null;

    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const kind = parts[0]; // p | reel
    const code = parts[1];
    if (!code || (kind !== "p" && kind !== "reel")) return null;

    // mirip contoh kamu: /embed/captioned/
    return `https://www.instagram.com/${kind}/${code}/embed/captioned/`;
  } catch {
    return null;
  }
}

export default function LatestInstagramSection() {
  const [items, setItems] = React.useState<IgItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/instagram?take=6", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as IgItem[];
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="mt-6">
      {/* header */}
      <div className="text-center">
        <div className="text-xl font-semibold text-white">Latest News</div>
        <div className="mt-1 text-xs text-white/70">
          Update terbaru dari Instagram (klik “View more on Instagram” untuk buka post)
        </div>
      </div>

      {/* content */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center text-sm text-white/70">Memuat Instagram…</div>
        ) : items.length === 0 ? (
          <div className="text-center text-sm text-white/70">
            Belum ada posting Instagram. Pastikan news bertipe <b>INSTAGRAM</b> sudah <b>Publish</b>.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => {
              const embed = toInstagramEmbedCaptioned(it.instagramUrl);

              return (
                <div
                  key={it.id}
                  className="overflow-hidden rounded-lg border border-white/10 bg-white shadow-sm"
                >
                  {/* embed */}
                  <div className="w-full">
                    {embed ? (
                      <iframe
                        title={it.title}
                        src={embed}
                        className="w-full"
                        // tinggi ini yang bikin feel-nya mirip contoh (boleh kamu sesuaikan)
                        height={560}
                        scrolling="no"
                        frameBorder={0}
                        allow="encrypted-media; clipboard-write"
                      />
                    ) : (
                      <div className="flex h-[560px] items-center justify-center bg-slate-100 text-sm text-slate-500">
                        Embed tidak valid
                      </div>
                    )}
                  </div>

                  {/* footer link (yang penting: ini yang kamu klik untuk buka IG) */}
                  <div className="px-4 py-3">
                    <a
                      href={it.instagramUrl ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View more on Instagram
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
