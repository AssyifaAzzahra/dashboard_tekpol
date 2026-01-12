"use client";

import React from "react";
import Image from "next/image";

type InstagramPost = {
  id: string;
  title: string;
  instagramUrl: string;
};

function getThumbnail(url: string) {
  // fallback thumbnail via oEmbed
  return `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
}

export default function InstagramSection() {
  const [items, setItems] = React.useState<InstagramPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/instagram-news", { cache: "no-store" });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="mt-10">
      <h3 className="mb-4 text-lg font-semibold text-white text-center">
        Latest Instagram
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((post) => (
          <a
            key={post.id}
            href={post.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="block bg-white rounded-lg overflow-hidden border hover:shadow-lg transition"
          >
            <div className="relative aspect-[4/5] bg-slate-100">
              <Image
                src={getThumbnail(post.instagramUrl)}
                alt={post.title}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="p-3">
              <p className="text-sm font-medium line-clamp-2">
                {post.title}
              </p>
              <span className="mt-1 inline-block text-xs text-blue-600">
                View on Instagram →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
