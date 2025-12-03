import type { ContentBucket, LinkItem } from '@/lib/types';

// Dummy/generic links jika dibutuhkan untuk placeholder
export const GENERIC_LINKS: LinkItem[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `generic-${i + 1}`,
  title: `Dokumen Sample ${i + 1}`,
  desc: 'Contoh tautan ke Google Drive',
  href: 'https://drive.google.com',
  tag: i % 2 ? 'PDF' : 'Sheet',
}));

export const HOME_BUCKET: ContentBucket = {
  title: 'Selamat Datang di Dashboard Teknik & Pengolahan',
  subtitle: 'Gunakan menu di sisi kiri untuk membuka koleksi dokumen kerja.',
  items: [],
};
