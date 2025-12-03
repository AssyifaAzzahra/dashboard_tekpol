import type { ContentBucket } from '@/lib/types';

import { HOME_BUCKET } from './sections/common';
import { PENGOLAHAN_TUKANG_OLAH } from './sections/pengolahan';
import { INVESTASI_CONTENT } from './sections/investasi';
import { TEKNIK_CONTENT } from './sections/teknik';
import { TEKPOL_APPS_BUCKET } from './sections/apps';

// FILTER: hapus group "Aplikasi" dari Tukang Olah agar tidak dobel
const PENGOLAHAN_TUKANG_OLAH_NO_APPS: ContentBucket = {
  ...PENGOLAHAN_TUKANG_OLAH,
  items: PENGOLAHAN_TUKANG_OLAH.items.filter(
    (i) => !(i.id === 'aplikasi' || i.title?.toLowerCase() === 'aplikasi')
  ),
};

// Gabungkan semua bucket jadi satu CONTENT_MAP
export const CONTENT_MAP: Record<string, ContentBucket> = {
  home: HOME_BUCKET,

  // Pengolahan (tanpa "Aplikasi")
  'pengolahan/tukangolah': PENGOLAHAN_TUKANG_OLAH_NO_APPS,

  // Investasi & Eksploitasi Pabrik
  ...INVESTASI_CONTENT,

  // Teknik & Infrastruktur
  ...TEKNIK_CONTENT,

  // Tekpol Apps (menu baru)
  'tekpol-apps': TEKPOL_APPS_BUCKET,
};
