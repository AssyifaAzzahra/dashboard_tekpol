// lib/data/pks.ts
import type { Pks, PksDetail } from '@/lib/types';

export const PKS_LIST: Pks[] = [
  { id: 'pks-tanah-putih', nama: 'PKS Tanah Putih', jenis: 'PKS', alamat: 'Desa Pasir Putih Utara, Kecamatan Balai Jaya, Kabupaten Rokan Hilir, Provinsi Riau', kapasitasTbsPerJam: 60 },
  { id: 'pks-tanjung-medan', nama: 'PKS Tanjung Medan', jenis: 'PKS', alamat: ' Desa Pujud, Kecamatan Pujkud, Kabupaten Rokan Hilir Riau', kapasitasTbsPerJam: 45 },
  { id: 'pks-sei-galuh', nama: 'PKS Sei Galuh', jenis: 'PKS', alamat: 'Desa Pantai Cermin, Kecamatan Tapung, Kabupaten Kampar, Provinsi Riau', kapasitasTbsPerJam: 45 },
  { id: 'pks-sei-pagar', nama: 'PKS Sei Pagar', jenis: 'PKS', alamat: 'Desa Hangtuah, Kecamatan Perhentian Raja, Kabupaten Kampar, Provinsi Riau', kapasitasTbsPerJam: 30 },
  { id: 'pks-sei-garo', nama: 'PKS Sei Garo', jenis: 'PKS', alamat: ' Desa Pantai Cermin, Kecamatan Tapung, Kabupaten Kampar, Provinsi Riau', kapasitasTbsPerJam: 30 },
  { id: 'pks-sei-buatan', nama: 'PKS Sei Buatan', jenis: 'PKS', alamat: 'Kec. Lubuk Dalam, Kab. Siak, Riau', kapasitasTbsPerJam: 45 },
  { id: 'pks-lubuk-dalam', nama: 'PKS Lubuk Dalam', jenis: 'PKS', alamat: 'Desa Lubuk Dalam, Kecamatan Lubuk Dalam, Kabupaten Siak, Provinsi Riau', kapasitasTbsPerJam: 45 },
  { id: 'pks-tandun', nama: 'PKS Tandun', jenis: 'PKS', alamat: 'Desa Talang Danto, Kecamatan Tapung Hulu, Kabupaten Kampar, Provinsi Riau', kapasitasTbsPerJam: 40 },
  { id: 'pks-terantam', nama: 'PKS Terantam', jenis: 'PKS', alamat: 'Kec. Pinggir, Kab. Bengkalis, Riau', kapasitasTbsPerJam: 60 },
  { id: 'pks-sei-tapung', nama: 'PKS Sei Tapung', jenis: 'PKS', alamat: 'Desa Tandun, Kecamatan Tandun, Kabupaten Rokan Hulu', kapasitasTbsPerJam: 30 },
  { id: 'pks-sei-rokan', nama: 'PKS Sei Rokan', jenis: 'PKS', alamat: ' Desa Pagaran Tapah, Kecamatan Pagaran Tapah Darussalam', kapasitasTbsPerJam: 60 },
  { id: 'pks-sei-intan', nama: 'PKS Sei Intan', jenis: 'PKS', alamat: 'Desa Kembang Damai, Rokan Hulu, Riau', kapasitasTbsPerJam: 30 },
];

/** Tambahan properti gambar */
type ExtraGambar = {
  fotoPks: string;
  fotoStruktur: string;
  sejarahSingkat: string;
  /** gambar sertifikasi (>=0). akan ditampilkan 2 per-slide */
  galeri?: string[];
};

const IMAGE_MAP: Record<string, ExtraGambar> = {
  'pks-tanah-putih': {
    fotoPks: '/images/pks/pksTanahPutih.png',
    fotoStruktur: '/images/pks/strukturTanahPutih.png',
    sejarahSingkat: 'Pabrik Kelapa Sawit (PKS) Tanah Putih merupakan salah satu unit kebun yang dimiliki oleh PT Perkebunan Nusantara IV Regional III di bawah Distrik Timur. Pabrik ini berdiri di atas lahan seluas 19 hektare dengan kapasitas terpasang 60 ton tandan buah segar (TBS) per jam. Secara geografis, PKS Tanah Putih terletak di Desa Pasir Putih Utara, Kecamatan Balai Jaya, Kabupaten Rokan Hilir, Provinsi Riau, berjarak sekitar 219 kilometer dari Kota Pekanbaru dan berada pada koordinat 100°30’–44°43’ Bujur Timur serta 1°42’–1°45’ Lintang Utara. Sumber bahan baku TBS berasal dari kebun inti, kebun plasma, serta pihak ketiga (P3). Hasil olahan utama pabrik ini adalah Crude Palm Oil (CPO) dan Palm Kernel.',
    galeri: ['/images/pks/tanah-putih-3.jpg'],
  },
  'pks-tanjung-medan': {
    fotoPks: '/images/pks.jpg',
    fotoStruktur: '/images/pks/strukturTanjungMedan.png',
    sejarahSingkat:
      'Pabrik kelapa sawit (PKS) Tanjung Medan adalah salah satu pabrik kelapa sawit Badan Usaha Milik Negara (BUMN) PT. Perkebunan Nusantara -V yang terletak di Desa Pujud, Kecamatan Pujkud, Kabupaten Rokan Hilir Riau. Pada bulan desember 2023 berganti nama mnejadi PT. Perkebunan Nusantara IV Regional III kebun/PKS Tanjung Medan. Pabrik Kelapa Sawit ini dibangun pada tahun 1995 oleh PT. Kesco Teguh Perkasa dengan total luas areal 126.90 Ha.',
    galeri: ['/images/pks/tanjung-medan-3.jpg'],
  },
'pks-sei-galuh': {
  fotoPks: '/images/pks.jpg',
  fotoStruktur: '/images/pks/strukturSeiGaluh.png',
  sejarahSingkat: `Pabrik Kelapa Sawit (PKS) Sei Galuh merupakan salah satu unit usaha dari PT Perkebunan Nusantara IV Regional III yang berada di bawah Distrik Timur. PKS ini berdiri pada tahun 1990 dan berlokasi di Jalan Garuda Sakti KM 21, Desa Pantai Cermin, Kecamatan Tapung, Kabupaten Kampar, Provinsi Riau. Pabrik ini memiliki luas area sekitar 19 hektare. Awalnya, kapasitas terpasang mencapai 60 ton tandan buah segar (TBS) per jam, namun sejak tahun 2007 kapasitas tersebut disesuaikan menjadi 45 ton TBS per jam. Sumber bahan baku utama berasal dari Kebun Inti SGH dan SBL, serta dari kebun plasma dan pembelian pihak ketiga. Proses pengolahan di PKS Sei Galuh dilakukan dalam sistem kerja dua shift untuk menjaga kelancaran produksi.`,
  galeri: [
    '/images/pks/sertifikasi1SeiGaluh.png',
    '/images/pks/sertifikasi2SeiGaluh.png',
  ],
},
  'pks-sei-pagar': {
    fotoPks: '/images/pks.jpg',
    fotoStruktur: '/images/pks/strukturSeiPagar.png',
    sejarahSingkat: `Profil Kebun & PKS Sei Pagar merupakan salah satu unit usaha dari PT Perkebunan Nusantara IV Regional II, yang berada di bawah Distrik Timur.Unit ini berlokasi di Desa Hangtuah, Kecamatan Perhentian Raja, Kabupaten Kampar, Provinsi Riau, sekitar 35 kilometer dari Kota Pekanbaru.Kebun Sei Pagar memiliki luas area 2.691,57 hektare, sebagaimana tergambar dalam peta blok kebun yang menampilkan pembagian area tanam dan batas-batas administratifnya. 
  Sementara itu, Pabrik Kelapa Sawit (PKS) Sei Pagar berdiri sejak 10 Oktober 1995 dengan kapasitas olah 30 ton TBS per jam. 
  Pabrik ini menerima bahan baku dari Kebun Inti Sei Pagar, KKPA, serta plasma pihak ketiga. Luas total areal pasokan TBS mencapai 10.411 hektare. 
  Hasil utama produksi dari PKS Sei Pagar adalah CPO (Crude Palm Oil) dan Kernel, dengan produk sampingan berupa cangkang, fiber, tandan kosong (tankos), abu janjang, serta Limbah Cair Pabrik Kelapa Sawit (LCPKS) yang dapat dimanfaatkan untuk berbagai keperluan.`,
    galeri: ['/images/pks/sertifikasiSeiPagar.png'],
  },

  'pks-sei-garo': {
    fotoPks: '/images/pks.jpg',
    fotoStruktur: '/images/pks/strukturSEIGARO.png',
    sejarahSingkat: `Kebun dan Pabrik Kelapa Sawit (PKS) Sei Garo berlokasi di Desa Pantai Cermin, Kecamatan Tapung, Kabupaten Kampar, Provinsi Riau, sekitar 68 kilometer dari Kota Pekanbaru. Pembangunan proyek Kebun Sei Garo didasarkan pada Surat Keputusan Menteri Pertanian RI No. KB.320/734/Melin/TX/1983 tanggal 26 September 1983, sebagai bagian dari proyek pembangunan PTP-V Sei Karang dengan nama proyek “PTPV Kebun NES II ADB Sei Garo”. Berdasarkan Surat Keputusan Direksi No. 5.11/SK/06/III/2016 tanggal 2 Maret 2016, Kebun Inti KKPA Sei Garo kemudian digabungkan dalam satu manajemen. Pada Oktober 2019, Kebun Inti/KKPA Sei Garo resmi menjadi Kebun Sei Garo yang mencakup PKS Sei Garo hingga sekarang. Secara geografis, kebun ini berbatasan dengan Desa Plambayalan dan Desa Mukti Sari di utara, Desa Pantai Cermin dan Desa Indra Sakti di timur, Desa Gading Sari dan Desa Indrapuri di selatan, serta Desa Kijang Rejo dan Desa Sumber Makmur di barat. PKS Sei Garo merupakan pabrik kelapa sawit yang berlokasi di Afdeling IV Sei Garo, Desa Gading Sari, Kecamatan Tapung, Kabupaten Kampar, dengan kapasitas terpasang 30 ton TBS per jam. Pembangunan pabrik dimulai pada tahun 1994 dan mulai beroperasi pada tahun 1996.`,
    galeri: ['/images/pks/seigaro-3.jpg'],
  },

  'pks-sei-buatan': {
    fotoPks: '/images/pks.jpg'.replace(' ', ''),
    fotoStruktur: '/images/pks/strukturSeiBuatan.png',
    sejarahSingkat: 'Melayani kebun Lubuk Dalam & sekitar; fokus kualitas kernel.',
    galeri: ['/images/pks/sertifikasiSeiBuatan.png'],
  },
  'pks-lubuk-dalam': {
    fotoPks: '/images/pks/pksLubukDalam.png',
    fotoStruktur: '/images/pks/strukturLDA.jpg',
    sejarahSingkat:
      'PKS Lubuk Dalam adalah sebuah pabrik kelapa sawit yang mulai beroperasi sejak tahun 1992 dengan luas areal 11,5 ha, berlokasi di Desa Lubuk Dalam, Kecamatan Lubuk Dalam, Kabupaten Siak, Provinsi Riau, pada koordinat 101° 46’ 47,624” BT dan 0° 37’ 48,145” LU, memiliki kapasitas terpasang 45 ton TBS per jam dengan sumber pasokan TBS berasal dari Kebun Inti LDA, kebun plasma, dan pihak ketiga, menghasilkan produk utama berupa CPO dan PK serta produk sampingan berupa cangkang, abu janjang, solid, dan abu boiler..',
    galeri: ['/images/pks/sertifikasiLDA.png'],
  },
  'pks-tandun': {
    fotoPks: '/images/pks/pksTandun.png',
    fotoStruktur: '/images/pks/strukturTandun.png',
    sejarahSingkat: 'PKS Tandun merupakan pabrik kelapa sawit yang mulai beroperasi sejak 1985 dan memiliki luas areal 9,45 hektare, berlokasi di Desa Talang Danto, Kecamatan Tapung Hulu, Kabupaten Kampar, Provinsi Riau, dengan koordinat 0°35’55.575” N dan 100°41’36.737” E. Pabrik ini memiliki kapasitas terpasang 40 ton TBS per jam dan menerima pasokan TBS dari Kebun Tandun, Sei Lindai, dan Sei Berlian, serta menghasilkan produk utama berupa CPO dan PK, dengan produk sampingan seperti cangkang, fiber, tankos, abu janjang, solid, dan abu boiler. Wilayah kerja pabrik mencakup area pabrik seluas 3,23 ha dan area kolam limbah 6,22 ha, dengan total keseluruhan 9,45 ha, mendukung operasional pabrik yang telah berjalan selama lebih dari 40 tahun.',
    galeri: ['/images/pks/sertifikasiTandun.png'],
  },
  'pks-terantam': {
    fotoPks: '/images/pks.jpg',
    fotoStruktur: '/images/struktur.png',
    sejarahSingkat: 'Penyangga pasokan Bengkalis; fokus otomasi pemantauan proses.',
    galeri: ['/images/pks/terantam-3.jpg'],
  },
  'pks-sei-tapung': {
    fotoPks: '/images/pks.jpg',
    fotoStruktur: '/images/pks/strukturSeiTapung.png',
    sejarahSingkat: 'Pabrik Kelapa Sawit (PKS) Sei Tapung yang berlokasi di Desa Tandun, Kecamatan Tandun, Kabupaten Rokan Hulu, telah beroperasi selama 32 tahun sejak berdiri pada tahun 1987 dengan kapasitas awal 30 ton TBS per jam. Pabrik ini merupakan PKS eks PTP V sebelum akhirnya digabung dengan unit pengembangan eks PTP II dan PTP IV menjadi PTPN V pada 11 Maret 1996. Seiring meningkatnya kebutuhan pengolahan akibat luasnya areal Kebun Inti dan Plasma Sei Tapung serta tambahan pasokan TBS dari kebun seinduk yang saat itu belum memiliki pabrik, kapasitas olah PKS Sei Tapung ditingkatkan menjadi 60 ton TBS per jam pada tahun 1988.',
    galeri: ['/images/pks/sei-tapung-3.jpg'],
  },
  'pks-sei-rokan': {
    fotoPks: '/images/pks/pksSeiRokan.png',
    fotoStruktur: '/images/pks/strukturSeiRokan.png',
    sejarahSingkat: 'PKS Sei Rokan merupakan pabrik kelapa sawit yang mulai beroperasi pada 24 Mei 1984 dengan luas areal 11 hektare, berlokasi di Desa Pagaran Tapah, Kecamatan Pagaran Tapah Darussalam, pada koordinat 0.735156, 100.575035. Pabrik ini memiliki kapasitas terpasang 60 ton TBS per jam dan menerima pasokan TBS dari kebun seinduk yaitu Kebun Sei Rokan. Produk utama yang dihasilkan adalah CPO dan Palm Kernel, sedangkan produk sampingannya meliputi cangkang, fiber, POME, dan abu boiler.',
    galeri: ['/images/pks/sertifikasiSeiRokan.png'],
  },
  'pks-sei-intan': {
    fotoPks: '/images/pks/pksSeiIntan.png',
    fotoStruktur: '/images/pks/strukturSeiIntan.png',
    sejarahSingkat: 'Unit Kebun Sei Intan merupakan kebun kelapa sawit yang mulai beroperasi sejak tahun 1991 dengan luas areal konsesi 3.312,108 ha dan kapasitas produksi 27,31 ton/ha, berlokasi di Desa Kembang Damai, Rokan Hulu, Riau pada koordinat 0°47’12.49” LU dan 100°42’55.54” BT. Sementara itu, Unit PKS Sei Intan adalah pabrik kelapa sawit yang berdiri pada tahun 1993 dengan luas area 9,171 ha, berlokasi di desa yang sama, memiliki kapasitas olah 30 ton TBS per jam, menerima pasokan TBS dari Kebun Sei Intan serta plasma, dan menghasilkan produk utama CPO dan PK dengan produk sampingan berupa cangkang, fiber, abu janjang, jankos, dan solid.',
  galeri: [
    '/images/pks/sertifikasi1SeiIntan.png',
    '/images/pks/sertifikasi2SeiIntan.png',
  ],
  },
};

const DEFAULT_FOTO_PKS = '/images/pks.jpg';
const DEFAULT_FOTO_STRUKTUR = '/images/strukturlda.png';
const DEFAULT_SEJARAH = 'Sejarah singkat belum tersedia.';

export function getPksDetail(id: string): PksDetail | null {
  const base = PKS_LIST.find((p) => p.id === id);
  if (!base) return null;

  const extra: ExtraGambar =
    IMAGE_MAP[id] ?? {
      fotoPks: DEFAULT_FOTO_PKS,
      fotoStruktur: DEFAULT_FOTO_STRUKTUR,
      sejarahSingkat: DEFAULT_SEJARAH,
      galeri: [],
    };

  const detail: PksDetail = {
    id: base.id,
    nama: base.nama,
    infoUmum: {
      jenis: base.jenis,
      alamat: base.alamat,
      kapasitasTbsPerJam: base.kapasitasTbsPerJam,
      tahunOperasional: 2014,
      jumlahLine: base.kapasitasTbsPerJam >= 60 ? 2 : 1,
    },
    catatan: [
    ],
  };

  const imagesUtama = [extra.fotoPks, extra.fotoStruktur];
  const galeri = extra.galeri ?? [];

  return {
    ...(detail as any),
    images: [...imagesUtama, ...galeri], // kompatibel lama
    fotoPks: extra.fotoPks,
    fotoStruktur: extra.fotoStruktur,
    sejarahSingkat: extra.sejarahSingkat,
    galeri, // untuk slider Sertifikasi
  } as any;
}
