import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ q?: string }>;
};

function toText(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function absUrl(pathOrUrl: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function formatDateTimeID(d: Date) {
  const date = new Date(d).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = new Date(d).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} | ${time} WIB`;
}

function estimateReadTime(content: string) {
  const words = (content || "").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit membaca`;
}

async function getNewsBySlug(slug: string) {
  return prisma.news.findFirst({
    where: { slug, isPublished: true },
  });
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const safeSlug = (slug || "").toString().trim();
  if (!safeSlug) return { title: "Berita" };

  const news = await prisma.news.findFirst({
    where: { slug: safeSlug, isPublished: true },
    select: {
      title: true,
      excerpt: true,
      coverImageUrl: true,
      slug: true,
    },
  });

  if (!news) return { title: "Berita tidak ditemukan" };

  const title = news.title;
  const description = news.excerpt ?? "Berita terbaru";
  const ogImage = news.coverImageUrl ? absUrl(news.coverImageUrl) : undefined;
  const canonical = absUrl(`/news/${news.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/** ====== CONTENT CLEANING & PARAGRAPH BUILDER ====== */
function cleanNoise(input: string) {
  return (input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    // noise yang sering kebawa dari web
    .replace(/Temukan lebih banyak[^\n.]*(\.|\n)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function looksLikeHtml(s: string) {
  return /<\/?[a-z][\s\S]*>/i.test(s);
}

function hasParagraphTags(html: string) {
  return /<p[\s>]/i.test(html) || /<\/p>/i.test(html);
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Kalau content:
 * - HTML + sudah ada <p> -> render langsung
 * - HTML tapi TANPA <p> -> ubah jadi paragraf rapi (split newline / kalimat panjang)
 * - Plain text -> jadi paragraf rapi
 */
function toPrettyHtml(raw: string) {
  const cleaned = cleanNoise(raw);
  if (!cleaned) return "";

  const isHtml = looksLikeHtml(cleaned);

  // HTML dan sudah ada paragraf -> biarkan
  if (isHtml && hasParagraphTags(cleaned)) {
    return cleaned;
  }

  // Kalau HTML tapi belum ada <p>, kita ambil versi teksnya minimal
  // (biar tidak nempel 1 baris)
  // NOTE: kita sengaja tidak parsing HTML kompleks, fokus rapihin hasil copy
  const asText = isHtml
    ? cleaned
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(div|section|article|header|footer|li|ul|ol|h1|h2|h3|h4|h5|h6)>/gi, "\n\n")
        .replace(/<[^>]+>/g, "")
        .trim()
    : cleaned;

  // Pecah paragraf: pakai double newline dulu
  let parts = asText
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean);

  // Kalau masih 1 paragraf super panjang, bantu pecah dengan titik + spasi (heuristic)
  if (parts.length === 1 && parts[0].length > 900) {
    const big = parts[0];
    const chunks = big
      .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Ý0-9])/g) // pecah kalimat
      .map((s) => s.trim())
      .filter(Boolean);

    // Gabungkan 2-3 kalimat per paragraf biar nyaman
    const grouped: string[] = [];
    let buf: string[] = [];
    for (const c of chunks) {
      buf.push(c);
      if (buf.length >= 3) {
        grouped.push(buf.join(" "));
        buf = [];
      }
    }
    if (buf.length) grouped.push(buf.join(" "));
    parts = grouped;
  }

  // Convert ke HTML paragraf
  const html = parts
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("\n");

  return html;
}

export default async function NewsDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : undefined;

  const safeSlug = (slug || "").toString().trim();
  if (!safeSlug) return notFound();

  const highlight = toText(sp?.q).trim();

  const news = await getNewsBySlug(safeSlug);
  if (!news) return notFound();

  const publishedDate = news.publishedAt ?? news.createdAt;
  const dateLabel = formatDateTimeID(publishedDate);
  const readTime = estimateReadTime(news.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    datePublished: publishedDate.toISOString(),
    dateModified: (news.updatedAt ? new Date(news.updatedAt) : publishedDate).toISOString(),
    image: news.coverImageUrl ? [absUrl(news.coverImageUrl)] : undefined,
    mainEntityOfPage: absUrl(`/news/${news.slug}`),
    publisher: { "@type": "Organization", name: "Dashboard TEKPOL" },
    description: news.excerpt ?? undefined,
  };

  const prettyHtml = toPrettyHtml(news.content);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* TOP BAR */}
      <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/#berita"
            className="text-sm font-semibold text-emerald-700 hover:underline underline-offset-4"
          >
            ← Kembali ke Berita
          </Link>

          <div className="text-xs text-slate-500">
            <span className="font-semibold text-emerald-700">Admin</span>
            <span className="mx-2">•</span>
            <span>{readTime}</span>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="mx-auto max-w-6xl px-4 pt-10 text-center">
        <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-6xl">
          {news.title}
        </h1>

        <div className="mt-4 text-sm text-slate-500">
          <span className="font-semibold text-emerald-700">Admin</span>
          <span className="mx-2">•</span>
          <span>{dateLabel}</span>
          <span className="mx-2">•</span>
          <span>{readTime}</span>
        </div>

        {news.excerpt ? (
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
            {news.excerpt}
          </p>
        ) : null}
      </header>

      {/* HERO IMAGE */}
      <section className="mt-10">
        <div className="mx-auto max-w-[1400px] px-0 md:px-4">
          <div className="overflow-hidden md:rounded-2xl shadow-sm ring-1 ring-black/5">
            {news.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={news.coverImageUrl}
                alt={news.title}
                loading="lazy"
                className="h-[320px] w-full object-cover sm:h-[460px] md:h-[560px]"
              />
            ) : (
              <div className="h-[320px] w-full bg-gradient-to-br from-emerald-600 via-emerald-500 to-yellow-300 sm:h-[460px] md:h-[560px]" />
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5 md:p-14">
          {highlight ? (
            <div className="mb-6">
              <span className="rounded-full bg-yellow-100 px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-yellow-200">
                Highlight: “{highlight}”
              </span>
            </div>
          ) : null}

          {/* Tipografi level media */}
          <div
            className="
              prose prose-lg max-w-none
              prose-headings:font-extrabold
              prose-h2:mt-10 prose-h2:text-2xl
              prose-h3:mt-8
              prose-p:leading-[1.95] prose-p:tracking-[0.002em]
              prose-p:text-slate-800
              prose-strong:text-slate-900
              prose-a:text-emerald-700 prose-a:font-semibold
              prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-2xl prose-img:shadow-sm
              prose-blockquote:border-l-4 prose-blockquote:border-emerald-600
              prose-blockquote:bg-emerald-50/50 prose-blockquote:rounded-xl prose-blockquote:p-4
              prose-li:leading-8
              [text-align:justify] [hyphens:auto]
              [&_p]:mb-5
              [&_p]:indent-6
              [&_p:first-of-type]:indent-0
              [&_p:first-of-type::first-letter]:float-left
              [&_p:first-of-type::first-letter]:mr-3
              [&_p:first-of-type::first-letter]:mt-2
              [&_p:first-of-type::first-letter]:text-5xl
              [&_p:first-of-type::first-letter]:font-extrabold
              [&_p:first-of-type::first-letter]:text-slate-900
            "
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: prettyHtml }}
          />
        </article>

        {/* FOOTER NAV */}
        <div className="mx-auto mt-10 max-w-6xl px-2">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <span>
              Selesai membaca?{" "}
              <Link href="/#berita" className="font-semibold text-emerald-700 hover:underline">
                Lihat berita lainnya
              </Link>
            </span>

            <Link
              href="/"
              className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
            >
              Kembali ke Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
