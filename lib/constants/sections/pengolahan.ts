// lib/constants/pengolahan.ts
import type { ContentBucket, LinkItem } from '@/lib/types';

const TO_PRODUKSI_PKS: LinkItem[] = [
  {
    id: 'to-pks-lhp', title: 'LHP', desc: 'Laporan Harian Pabrik', tag: 'PKS',
    href: 'https://drive.google.com/drive/u/0/folders/1OtDkLb8SmsNROyjSIV2YQfoPMr_GRtYv'
  },
  {
    id: 'to-pks-jamolah', title: 'JAM OLAH', desc: 'Waktu operasi pabrik', tag: 'PKS',
    href: 'https://drive.google.com/drive/u/0/folders/1NOnfHcp_b5SXAOYK1Wqmgna-7kgfwlth'
  },
];

const TO_BIAYA_OLAH_LM: LinkItem[] = [
  { id: 'lm-2021', title: 'LM 2021', href: 'https://drive.google.com/drive/folders/1ECdRiPB1wVCIGVN1ikPSPPUBhBuOpUXC' },
  { id: 'lm-2022', title: 'LM 2022', href: 'https://drive.google.com/drive/folders/1zfdTaMZoW4nUTk-d-AYVkBdt3W9oGFDe' },
  { id: 'lm-2023', title: 'LM 2023', href: 'https://drive.google.com/drive/folders/1rRiom_GXiptuT91L0U0CXzx8bYkKSSQL' },
  { id: 'lm-2024', title: 'LM 2024', href: 'https://drive.google.com/drive/folders/1ZUgLs1lihzqbTBq3VBB0dkVTw3XvcrgJ' },
  { id: 'lm-2025', title: 'LM 2025', href: 'https://drive.google.com/drive/folders/1tQZrx94aOE5247LfiqSFi0j5SYke7jcg' },
];

const TO_TECH_SERVICE: LinkItem[] = [
  { id: 'ts-eon', title: 'Technical Service', href: 'https://drive.google.com/drive/folders/1czTfn35AleT0FztXc0bGvTVczkI6ijjy' },
];

const TO_RKAP_2026: LinkItem[] = [
  { id: 'rkap26-prod', title: 'RKAP Produksi 2026 Protas 24,012', href: 'https://drive.google.com/drive/folders/1o0HjAKhBTLyEHOcpExXOMXl-ita_s1KJ' },
  { id: 'rkap26-biaya', title: 'Biaya Olah PKS, PPIS, PPKR RKAP 2026', href: 'https://docs.google.com/spreadsheets/d/1LyMYDZmV2YAQKCcZ81yjhkLbO6r5_7F7e8eRbNdTRhc/edit?gid=1831754238#gid=1831754238' },
  { id: 'rkap26-tarif', title: 'Tarif HK PKS, PPIS dan PPKR RKAP 2026', href: 'https://docs.google.com/spreadsheets/d/1lkSgo-mrIR1p-letP-KU-98172IkagEWRx-1gbCMWZs/edit?gid=235236483#gid=235236483' },
];

const TO_RKAP_2025: LinkItem[] = [
  { id: 'rkap25-all', title: 'RKAP Produksi dan Biaya 2025', href: 'https://drive.google.com/drive/folders/1XBAfK_C5Tk3wxnuSzuQkNJREym2fTfKk' },
];

const TO_IZIN_LA: LinkItem[] = [
  { id: 'izin-la', title: 'IZIN LA', href: 'https://drive.google.com/drive/u/0/folders/1v6SHTgauUQqiPEaZDbwiI_vwsD5SuWMU' },
];

const TO_DRAFT_MONTHLY: LinkItem[] = [
  { id: 'draft-2025-07', title: 'Juli 2025', href: 'https://drive.google.com/drive/folders/1d2IDbfPTKKxNdMwNaXrRKB01aSLrWNF2' },
  { id: 'draft-2025-08', title: 'Agustus 2025', href: 'https://drive.google.com/drive/folders/1NkxzlvkG8ws5U1y3njrAoNs1L49blkdZ' },
  { id: 'draft-2025-09', title: 'September 2025', href: 'https://drive.google.com/drive/folders/15UwsyA0Quf-gCiEGpXVWExsPCip8_t2R' },
  { id: 'draft-2025-10-18', title: '18 Oktober 2025', href: 'https://drive.google.com/drive/folders/1R-k_cp4O4KnBQUkaR3MHm5MOw3GEQX0q' },
  { id: 'draft-2025-10-19', title: '19 Oktober 2025', href: 'https://drive.google.com/drive/folders/1R-k_cp4O4KnBQUkaR3MHm5MOw3GEQX0q' },
  { id: 'draft-2025-10-25', title: '25 Oktober 2025', href: 'https://drive.google.com/drive/folders/1R-k_cp4O4KnBQUkaR3MHm5MOw3GEQX0q' },
];

const TO_OKTOBER: LinkItem[] = [
  { id: 'okt-03', title: '3 Oktober 2025', href: 'https://drive.google.com/drive/folders/1ieUvAXIBxo79djmReL87H9A2Hgwfpqcb' },
  { id: 'okt-10', title: '10 Oktober 2025', href: 'https://drive.google.com/drive/folders/1dctEfxl8AcqmDpydaOAZZRpOfFjhQLXq' },
  { id: 'okt-17', title: '17 Oktober 2025', href: 'https://drive.google.com/drive/folders/1RS9uG876YlDeWqtB5odnN1Dg-85TFrzZ' },
];

const TO_BK_STORAGE: LinkItem[] = [
  { id: 'bks', title: 'Buku Kalibrasi Storage', href: 'https://drive.google.com/drive/folders/1gVmDGXcyxNlyifQJrwx0BA8qWz528M1i' },
];

const TO_DIGITALISASI: LinkItem[] = [];

const TO_BA_SO: LinkItem[] = [
  { id: 'so-2224', title: 'BA SO 2022-2024', href: 'https://drive.google.com/drive/folders/18jggzm7f8nZQSJGsAJUZFP0ZnOK-tX44' },
  { id: 'so-2025-09', title: 'September 2025', href: 'https://drive.google.com/drive/folders/1QIql8BRd47aP1I6xXaHB5hfIj6pbWdDa' },
];

const TO_STOK_GUDANG: LinkItem[] = [
  { id: 'stok-2025-08', title: 'Agustus 2025', href: 'https://drive.google.com/drive/folders/1to277l5ijk9JF6bRJt9uLryXz3Co2Y92' },
  { id: 'stok-2025-09', title: 'September 2025', href: 'https://drive.google.com/drive/folders/12F4-XohxoY82IjC7x7yCwt2S-_UD1eFi' },
];

const TO_KONTRAK: LinkItem[] = [
  { id: 'kontrak-login', title: 'Kontrak (User: 3 TEP, Pass: 3TEP)', href: 'https://app.ptpn5.co.id/owncloud/index.php/login' },
];


export const PENGOLAHAN_TUKANG_OLAH: ContentBucket = {
  title: 'Pengolahan • Sub Tukang olah',
  items: [
    { id: 'grp-produksi-pks', title: 'Produksi - PKS', children: TO_PRODUKSI_PKS },
    { id: 'grp-biaya-olah-lm', title: 'Biaya Olah LM', children: TO_BIAYA_OLAH_LM },
    { id: 'grp-tech-service', title: 'Laporan Technical Service EON', children: TO_TECH_SERVICE },
    { id: 'grp-rkap-2026', title: 'RKAP 2026', children: TO_RKAP_2026 },
    { id: 'grp-rkap-2025', title: 'RKAP 2025', children: TO_RKAP_2025 },
    { id: 'grp-izin-la', title: 'IZIN LA', children: TO_IZIN_LA },
    { id: 'grp-draft-monthly', title: 'Draft Monthly', children: TO_DRAFT_MONTHLY },
    { id: 'grp-oktober', title: 'Oktober', children: TO_OKTOBER },
    { id: 'grp-buku-kalibrasi', title: 'Buku Kalibrasi Storage', children: TO_BK_STORAGE },
    { id: 'grp-digitalisasi', title: 'Digitalisasi', children: TO_DIGITALISASI },
    { id: 'grp-ba-stokopname', title: 'BA Stokopname', children: TO_BA_SO },
    { id: 'grp-stok-gudang', title: 'Stok Gudang Barang', children: TO_STOK_GUDANG },
    { id: 'grp-kontrak', title: 'Kontrak', children: TO_KONTRAK },
  ],
};
