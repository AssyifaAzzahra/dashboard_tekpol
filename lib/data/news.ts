// lib/data/news.ts
import type { NewsItem } from '@/lib/types';

export const NEWS_LIST: NewsItem[] = [
  {
    id: 'n1',
    title: 'Perawatan Berkala Meningkatkan Reliability',
    tag: 'Teknik',
    date: '2025-10-12',
    excerpt: 'Program preventive maintenance terbukti menurunkan downtime pada lini perebusan…',
    body:
      'Program preventive maintenance yang dilakukan secara konsisten pada stasiun perebusan, klarifikasi, dan kernel berhasil menurunkan downtime sebesar 18% MoM. Ke depan, tim akan memperluas cakupan ke utility dan power house untuk memperkuat reliability pabrik secara menyeluruh.',
    image: '/images/home1.jpg',
  },
  {
    id: 'n2',
    title: 'Optimasi Takaran Kapasitas TBS/Jam',
    tag: 'Produksi',
    date: '2025-10-20',
    excerpt: 'Kalibrasi ulang takaran kapasitas TBS/jam memberikan margin efisiensi 3–5%…',
    body:
      'Setelah dilakukan kalibrasi ulang dan penyesuaian SOP loading, margin efisiensi meningkat pada jam-jam sibuk. Inisiatif ini akan dipadukan dengan dashboard monitoring realtime untuk memastikan konsistensi antar shift.',
    image: '/images/home2.jpg',
  },
 {
    id: 'n3',
    title: 'Youtube PTPN',
    tag: 'Social Media',
    date: '2025-10-28',
    excerpt: '',
    body: 'Video resmi YouTube PTPN: highlight digitalisasi checklist harian dan integrasi ke Tekpol.',
    image: '/images/home1.jpg',
    videoUrl: 'https://youtu.be/PLuotmYa-3A?si=QL2jw7aColatkclC', // YouTube PTPN
    labelAbove: 'YouTube PTPN',                               // judul di atas kartu
  },
  {
    id: 'n4',
    title: 'Mars PTPN',
    tag: 'Social Media',
    date: '2025-11-01',
    excerpt: ' ',
    body: 'Video Mars PTPN: materi K3 (LOTO, confined space, bahan kimia) dan hasil evaluasi.',
    image: '/images/home2.jpg',
    videoUrl: 'https://youtu.be/z_q4nYFotDI?si=_ysFCNA9Bh_ojGQI', // Mars PTPN
    labelAbove: 'Mars PTPN',                                      // judul di atas kartu
  },
];