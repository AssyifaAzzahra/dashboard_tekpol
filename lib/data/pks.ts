// lib/data/pks.ts
import type { Pks, PksDetail } from "@/lib/types";

export const PKS_LIST: Pks[] = [
  {
    id: "pks-tanah-putih",
    nama: "PKS Tanah Putih",
    jenis: "PKS",
    alamat:
      "Desa Pasir Putih Utara, Kecamatan Balai Jaya, Kabupaten Rokan Hilir, Provinsi Riau",
    kapasitasTbsPerJam: 60,
  },
  {
    id: "pks-tanjung-medan",
    nama: "PKS Tanjung Medan",
    jenis: "PKS",
    alamat: "Desa Pujud, Kecamatan Pujkud, Kabupaten Rokan Hilir Riau",
    kapasitasTbsPerJam: 45,
  },
  {
    id: "pks-sei-galuh",
    nama: "PKS Sei Galuh",
    jenis: "PKS",
    alamat:
      "Desa Pantai Cermin, Kecamatan Tapung, Kabupaten Kampar, Provinsi Riau",
    kapasitasTbsPerJam: 45,
  },
  {
    id: "pks-sei-pagar",
    nama: "PKS Sei Pagar",
    jenis: "PKS",
    alamat:
      "Desa Hangtuah, Kecamatan Perhentian Raja, Kabupaten Kampar, Provinsi Riau",
    kapasitasTbsPerJam: 30,
  },
  {
    id: "pks-sei-garo",
    nama: "PKS Sei Garo",
    jenis: "PKS",
    alamat:
      "Desa Pantai Cermin, Kecamatan Tapung, Kabupaten Kampar, Provinsi Riau",
    kapasitasTbsPerJam: 30,
  },
  {
    id: "pks-sei-buatan",
    nama: "PKS Sei Buatan",
    jenis: "PKS",
    alamat: "Kec. Lubuk Dalam, Kab. Siak, Riau",
    kapasitasTbsPerJam: 45,
  },
  {
    id: "pks-lubuk-dalam",
    nama: "PKS Lubuk Dalam",
    jenis: "PKS",
    alamat:
      "Desa Lubuk Dalam, Kecamatan Lubuk Dalam, Kabupaten Siak, Provinsi Riau",
    kapasitasTbsPerJam: 45,
  },
  {
    id: "pks-tandun",
    nama: "PKS Tandun",
    jenis: "PKS",
    alamat:
      "Desa Talang Danto, Kecamatan Tapung Hulu, Kabupaten Kampar, Provinsi Riau",
    kapasitasTbsPerJam: 40,
  },
  {
    id: "pks-terantam",
    nama: "PKS Terantam",
    jenis: "PKS",
    alamat: "Kec. Pinggir, Kab. Bengkalis, Riau",
    kapasitasTbsPerJam: 60,
  },
  {
    id: "pks-sei-tapung",
    nama: "PKS Sei Tapung",
    jenis: "PKS",
    alamat: "Desa Tandun, Kecamatan Tandun, Kabupaten Rokan Hulu",
    kapasitasTbsPerJam: 30,
  },
  {
    id: "pks-sei-rokan",
    nama: "PKS Sei Rokan",
    jenis: "PKS",
    alamat: "Desa Pagaran Tapah, Kecamatan Pagaran Tapah Darussalam",
    kapasitasTbsPerJam: 60,
  },
  {
    id: "pks-sei-intan",
    nama: "PKS Sei Intan",
    jenis: "PKS",
    alamat: "Desa Kembang Damai, Rokan Hulu, Riau",
    kapasitasTbsPerJam: 30,
  },
];

/** Tambahan properti gambar */
type ExtraGambar = {
  fotoPks?: string;
  fotoStruktur?: string;
  sejarahSingkat?: string;
  galeri?: string[];
  hideSertifikasi?: boolean;
};

const IMAGE_MAP: Record<string, ExtraGambar> = {
  "pks-tanah-putih": {
    fotoPks: "/images/pks/pksTanahPutih.png",
    fotoStruktur: "/images/pks/strukturTanahPutih.png",
    sejarahSingkat:
      "Pabrik Kelapa Sawit (PKS) Tanah Putih merupakan salah satu unit kebun yang dimiliki oleh PT Perkebunan Nusantara IV Regional III di bawah Distrik Timur. Pabrik ini berdiri di atas lahan seluas 19 hektare dengan kapasitas terpasang 60 ton tandan buah segar (TBS) per jam. Secara geografis, PKS Tanah Putih terletak di Desa Pasir Putih Utara, Kecamatan Balai Jaya, Kabupaten Rokan Hilir, Provinsi Riau, berjarak sekitar 219 kilometer dari Kota Pekanbaru dan berada pada koordinat 100°30’–44°43’ Bujur Timur serta 1°42’–1°45’ Lintang Utara. Sumber bahan baku TBS berasal dari kebun inti, kebun plasma, serta pihak ketiga (P3). Hasil olahan utama pabrik ini adalah Crude Palm Oil (CPO) dan Palm Kernel.",
    hideSertifikasi: true,
  },

  "pks-tanjung-medan": {
    fotoPks: "/images/pks/pkstanjungmedan.png",
    fotoStruktur: "/images/pks/strukturTanjungMedan.png",
    sejarahSingkat:
      "Pabrik kelapa sawit (PKS) Tanjung Medan adalah salah satu pabrik kelapa sawit Badan Usaha Milik Negara (BUMN) PT. Perkebunan Nusantara -V yang terletak di Desa Pujud, Kecamatan Pujkud, Kabupaten Rokan Hilir Riau. Pada bulan desember 2023 berganti nama menjadi PT. Perkebunan Nusantara IV Regional III kebun/PKS Tanjung Medan. Pabrik Kelapa Sawit ini dibangun pada tahun 1995 oleh PT. Kesco Teguh Perkasa dengan total luas areal 126.90 Ha.",
    hideSertifikasi: true,
  },

  "pks-sei-galuh": {
    fotoPks: "/images/pks/pksseigaluh.png",
    fotoStruktur: "/images/pks/strukturSeiGaluh.png",
    sejarahSingkat: `Pabrik Kelapa Sawit (PKS) Sei Galuh merupakan salah satu unit usaha dari PT Perkebunan Nusantara IV Regional III yang berada di bawah Distrik Timur. PKS ini berdiri pada tahun 1990 dan berlokasi di Jalan Garuda Sakti KM 21, Desa Pantai Cermin, Kecamatan Tapung, Kabupaten Kampar, Provinsi Riau. Pabrik ini memiliki luas area sekitar 19 hektare. Awalnya, kapasitas terpasang mencapai 60 ton tandan buah segar (TBS) per jam, namun sejak tahun 2007 kapasitas tersebut disesuaikan menjadi 45 ton TBS per jam. Sumber bahan baku utama berasal dari Kebun Inti SGH dan SBL, serta dari kebun plasma dan pembelian pihak ketiga. Proses pengolahan di PKS Sei Galuh dilakukan dalam sistem kerja dua shift untuk menjaga kelancaran produksi.`,
    galeri: [
      "/images/pks/sertifikasi1SeiGaluh.png",
      "/images/pks/sertifikasi2SeiGaluh.png",
    ],
  },

  "pks-sei-pagar": {
    fotoPks: "/images/pks/spa.jpg",
    fotoStruktur: "/images/pks/strukturSeiPagar.png",
    sejarahSingkat: `Profil Kebun & PKS Sei Pagar merupakan salah satu unit usaha dari PT Perkebunan Nusantara IV Regional II, yang berada di bawah Distrik Timur. Unit ini berlokasi di Desa Hangtuah, Kecamatan Perhentian Raja, Kabupaten Kampar, Provinsi Riau, sekitar 35 kilometer dari Kota Pekanbaru.
Sementara itu, Pabrik Kelapa Sawit (PKS) Sei Pagar berdiri sejak 10 Oktober 1995 dengan kapasitas olah 30 ton TBS per jam. Pabrik ini menerima bahan baku dari Kebun Inti Sei Pagar, KKPA, serta plasma pihak ketiga. Luas total areal pasokan TBS mencapai 10.411 hektare.
Hasil utama produksi dari PKS Sei Pagar adalah CPO (Crude Palm Oil) dan Kernel, dengan produk sampingan berupa cangkang, fiber, tandan kosong (tankos), abu janjang, serta Limbah Cair Pabrik Kelapa Sawit (LCPKS).`,
    galeri: ["/images/pks/sertifikasiSeiPagar.png"],
  },

  "pks-sei-garo": {
    fotoPks: "/images/pks.jpg",
    fotoStruktur: "/images/pks/strukturSEIGARO.png",
    sejarahSingkat: `Kebun dan Pabrik Kelapa Sawit (PKS) Sei Garo berlokasi di Desa Pantai Cermin, Kecamatan Tapung, Kabupaten Kampar, Provinsi Riau, sekitar 68 kilometer dari Kota Pekanbaru...`,
    hideSertifikasi: true,
  },

  "pks-sei-buatan": {
    fotoPks: "/images/pks.jpg",
    fotoStruktur: "/images/pks/strukturSeiBuatan.png",
    sejarahSingkat:
      "PKS Sei Buatan adalah unit pengolahan kelapa sawit milik PT Perkebunan Nusantara V (PTPN V) yang berlokasi strategis di wilayah Siak, Riau...",
    galeri: ["/images/pks/sertifikasiSeiBuatan.png"],
  },

  "pks-lubuk-dalam": {
    fotoPks: "/images/pks/pksLubukDalam.png",
    fotoStruktur: "/images/pks/strukturLDA.jpg",
    sejarahSingkat:
      "PKS Lubuk Dalam adalah sebuah pabrik kelapa sawit yang mulai beroperasi sejak tahun 1992 dengan luas areal 11,5 ha...",
    galeri: ["/images/pks/sertifikasiLDA.png"],
  },

  "pks-tandun": {
    fotoPks: "/images/pks/pksTandun.png",
    fotoStruktur: "/images/pks/strukturTandun.png",
    sejarahSingkat:
      "PKS Tandun merupakan pabrik kelapa sawit yang mulai beroperasi sejak 1985...",
    galeri: ["/images/pks/sertifikasiTandun.png"],
  },

  "pks-terantam": {
    fotoPks: "/images/pks/pksterantam.png",
    fotoStruktur: "/images/pks/strukturterantam.png",
    sejarahSingkat: "Unit kerja PKS Terantam mulai beroperasi sejak tahun 1989 dan memiliki luas areal sekitar 5,26 hektare. Lokasinya berada di Desa Kasikan, Kecamatan Tapung Hulu, Kabupaten Kampar, Provinsi Riau, dengan koordinat 100° 45' 02,8 – 0° 34' 45,1. Pabrik ini memiliki kapasitas terpasang sebesar 60 ton TBS per jam dengan sumber pasokan TBS berasal dari kebun inti, yaitu Kebun Terantam, Kebun Tamora, Kebun Sei Kencana, dan Sei Berlian. Produk utama yang dihasilkan adalah CPO dan PK, sedangkan produk sampingannya meliputi tankos, abu janjiang, fibre, cangkang, solid, serta abu boiler.",
    galeri: [
      "/images/pks/sertifikasiter1.png",
      "/images/pks/sertifikasiter2.png"],
  },

  "pks-sei-tapung": {
    fotoPks: "/images/pks/pksseitapung.png",
    fotoStruktur: "/images/pks/strukturSeiTapung.png",
    sejarahSingkat:
      "Pabrik Kelapa Sawit (PKS) Sei Tapung yang berlokasi di Desa Tandun, Kecamatan Tandun, Kabupaten Rokan Hulu...",
    hideSertifikasi: true,
  },

  "pks-sei-rokan": {
    fotoPks: "/images/pks/pksSeiRokan.png",
    fotoStruktur: "/images/pks/strukturSeiRokan.png",
    sejarahSingkat:
      "PKS Sei Rokan merupakan pabrik kelapa sawit yang mulai beroperasi pada 24 Mei 1984...",
    galeri: ["/images/pks/sertifikasiSeiRokan.png"],
  },

  "pks-sei-intan": {
    fotoPks: "/images/pks/pksSeiIntan.png",
    fotoStruktur: "/images/pks/strukturSeiIntan.png",
    sejarahSingkat:
      "Unit Kebun Sei Intan merupakan kebun kelapa sawit yang mulai beroperasi sejak tahun 1991...",
    galeri: [
      "/images/pks/sertifikasi1SeiIntan.png",
      "/images/pks/sertifikasi2SeiIntan.png",
    ],
  },
};

// ✅ fallback biar UI aman untuk semua device (Next/Image tidak error)
const FALLBACK_FOTO = "/images/pkslda.jpg";
const FALLBACK_STRUKTUR = "/images/strukturlda.png";

export function getPksDetail(id: string): PksDetail | null {
  const base = PKS_LIST.find((p) => p.id === id);
  if (!base) return null;

  const extra = IMAGE_MAP[id] ?? {};

  return {
    id: base.id,
    nama: base.nama,
    infoUmum: {
      jenis: base.jenis,
      alamat: base.alamat,
      kapasitasTbsPerJam: base.kapasitasTbsPerJam,
      tahunOperasional: 2014,
      jumlahLine: base.kapasitasTbsPerJam >= 60 ? 2 : 1,
    },
    catatan: [],

    // ✅ ini yang bikin “responsive” aman: tidak ada undefined
    fotoPks: (extra.fotoPks && extra.fotoPks.trim()) ? extra.fotoPks : FALLBACK_FOTO,
    fotoStruktur:
      (extra.fotoStruktur && extra.fotoStruktur.trim()) ? extra.fotoStruktur : FALLBACK_STRUKTUR,
    sejarahSingkat: extra.sejarahSingkat ?? "—",
    galeri: Array.isArray(extra.galeri) ? extra.galeri : [],
    hideSertifikasi: Boolean(extra.hideSertifikasi),
  } as any;
}
