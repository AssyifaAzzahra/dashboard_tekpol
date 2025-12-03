'use client';

import type { ContentBucket } from '@/lib/types';
import ContentGroup from './ContentGroup';

/**
 * Menerima "bucket" yang di dalamnya berisi daftar GROUP (tiap group = LinkItem dengan children).
 * Misal untuk path `teknik/sub`, bucket.items = [
 *   { id:'menu-halaman-muka', title:'Halaman Muka', children:[...] },
 *   { id:'menu-web-apk', title:'Web APK', children:[...] }, dst.
 */
export default function ContentGrid({
  bucket,
  search = '',
}: {
  bucket: ContentBucket;
  search?: string;
}) {
  const groups = (bucket.items || []).filter((g) => Array.isArray(g.children));

  // filter sederhana berdasarkan judul child
  const q = search.trim().toLowerCase();
  const filtered = groups.map((g) => {
    const items = (g.children || []).filter(
      (c) =>
        !q ||
        c.title.toLowerCase().includes(q)
    );
    return { ...g, children: items };
  });

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((group) => (
        <ContentGroup
          key={group.id}
          title={group.title}
          items={group.children || []}
          defaultOpen={true} // <-- buka default
        />
      ))}
    </section>
  );
}
