// lib/constants/tekpol-content.ts
import type { ContentBucket } from "@/lib/types";

// sesuaikan path sesuai struktur project kamu
import { INVESTASI_CONTENT } from "@/lib/constants/sections/investasi";
import { TEKNIK_CONTENT } from "@/lib/constants/sections/teknik";
import { PENGOLAHAN_TUKANG_OLAH } from "@/lib/constants/sections/pengolahan";

// ✅ Pengolahan kamu export-nya ContentBucket tunggal → bungkus jadi Record
// ✅ KEY DISAMAKAN DENGAN ADMIN PAGE: "pengolahan/tukangolah"
const PENGOLAHAN_CONTENT: Record<string, ContentBucket> = {
  "pengolahan/tukangolah": PENGOLAHAN_TUKANG_OLAH,
};

export const TEKPOL_CONTENT_MAP: Record<string, ContentBucket> = {
  ...INVESTASI_CONTENT,
  ...PENGOLAHAN_CONTENT,
  ...TEKNIK_CONTENT,
};

export const TEKPOL_SECTION_OPTIONS = Object.entries(TEKPOL_CONTENT_MAP).map(([key, bucket]) => ({
  key,
  title: bucket.title,
}));