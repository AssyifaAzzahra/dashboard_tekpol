import type { ContentBucket } from "@/lib/types";

import { HOME_BUCKET } from "@/lib/constants/sections/common";
import { PENGOLAHAN_TUKANG_OLAH } from "@/lib/constants/sections/pengolahan";
import { INVESTASI_CONTENT } from "@/lib/constants/sections/investasi";
import { TEKNIK_CONTENT } from "@/lib/constants/sections/teknik";
import { TEKPOL_APPS_BUCKET } from "@/lib/constants/sections/apps";

/**
 * FILTER: hapus group "Aplikasi" dari Tukang Olah agar tidak dobel
 */
const PENGOLAHAN_TUKANG_OLAH_NO_APPS: ContentBucket = {
  ...PENGOLAHAN_TUKANG_OLAH,
  items: PENGOLAHAN_TUKANG_OLAH.items.filter(
    (i) => !(i.id === "aplikasi" || i.title?.toLowerCase() === "aplikasi")
  ),
};

/**
 * CONTENT_MAP dipakai sebagai fallback
 * Jika database belum ada data, sistem akan pakai ini.
 *
 * ⚠️ Pastikan key SAMA dengan path yang dipakai dashboard.
 */
export const CONTENT_MAP: Record<string, ContentBucket> = {
  // Home
  home: HOME_BUCKET,

  // Pengolahan (tanpa "Aplikasi")
  "pengolahan/tukangolah": PENGOLAHAN_TUKANG_OLAH_NO_APPS,

  // Investasi & Eksploitasi Pabrik
  ...INVESTASI_CONTENT,

  // Teknik & Infrastruktur
  ...TEKNIK_CONTENT,

  // Tekpol Apps
  "tekpol-apps": TEKPOL_APPS_BUCKET,
};
