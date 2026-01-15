// lib/pks-list.ts
export const PKS_LIST = [
  { code: "TPU", name: "Tanah Putih" },
  { code: "TME", name: "Tanjung Medan" },
  { code: "SGH", name: "Sei Galuh" },
  { code: "SPA", name: "Sei Pagar" },
  { code: "SGO", name: "Sei Garo" },
  { code: "SBT", name: "Sei Buatan" },
  { code: "LDA", name: "Lubuk Dalam" },
  { code: "TAN", name: "Tandun" },
  { code: "TER", name: "Terantam" },
  { code: "STA", name: "Sei Tapung" },
  { code: "SRO", name: "Sei Rokan" },
  { code: "SIN", name: "Sei Intan" },
] as const;

export function getPksNameByCode(code?: string | null) {
  if (!code) return null;
  return PKS_LIST.find((x) => x.code === code)?.name ?? null;
}
