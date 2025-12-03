// lib/constants/sections/investasi.ts
import type { ContentBucket, LinkItem } from '@/lib/types';

/** 1) Agenda Penomoran Surat → children per tahun */
const AGENDA_PENOMORAN_SURAT: LinkItem = {
  id: 'agenda-penomoran',
  title: 'Agenda Penomoran Surat',
  children: [
    { id: 'aps-2021', title: 'Tahun 2021', href: 'https://docs.google.com/spreadsheets/d/1XfsWAk3NgGXR1rxR-cvAAs0uA0z2ywF6/edit?gid=1867115641#gid=1867115641', tag: 'Sheet' },
    { id: 'aps-2022', title: 'Tahun 2022', href: 'https://docs.google.com/spreadsheets/d/17qayiodRcTKDPkcNkVMSO1_4HsrIU_eL/edit?gid=792174372#gid=792174372', tag: 'Sheet' },
    { id: 'aps-2023', title: 'Tahun 2023', href: 'https://docs.google.com/spreadsheets/d/1M9zg0K6hzFGB09prirOCVlVct9H0PkUsGCi_CemHKhQ/edit', tag: 'Sheet' },
    { id: 'aps-2024', title: 'Tahun 2024', href: 'https://docs.google.com/spreadsheets/d/19wzv3Bw2SZ8SHQS3VQtbBCXe79os9Uldngu3CuC_Tfc/edit#gid=1921630124', tag: 'Sheet' },
    { id: 'aps-2025', title: 'Tahun 2025', href: 'https://docs.google.com/spreadsheets/d/1Ioqy5ackkeUUs0isdD2LQJygWW2tpvMa/edit?gid=197906093#gid=197906093', tag: 'Sheet' },
    { id: 'aps-2026', title: 'Tahun 2026', href: 'https://www.google.com/url?q=http%3A%2F%2Fdasda&sa=D&sntz=1&usg=AOvVaw3QkubFwrQy0lk6eC39qIIo' },
  ],
};

/** 2) Kondisi Peralatan Bulanan PKS → children per tahun */
const KOND_PERALATAN_BULANAN: LinkItem = {
  id: 'kond-peralatan-bulanan',
  title: 'Kondisi Peralatan Bulanan PKS',
  children: [
    { id: 'kpb-2020', title: 'Tahun 2020', href: 'https://drive.google.com/drive/folders/1tF5IAdch5XjkokWcsEUp9WLDxp684Wwz' },
    { id: 'kpb-2021', title: 'Tahun 2021', href: 'https://drive.google.com/drive/folders/1ZzhqseXYunHZ3uPXPC8-oh5nYski223f' },
    { id: 'kpb-2022', title: 'Tahun 2022', href: 'https://drive.google.com/drive/folders/1OiWI5bVW5EVbCBPSXBhYH3VIz9o1BczR' },
    { id: 'kpb-2023', title: 'Tahun 2023', href: 'https://drive.google.com/drive/folders/10oLLq18VYg0rpREMHbNgmgfMF3NdgE0H' },
  ],
};

/** 3) Monitoring (kumpulan sheet monitoring & rekap) */
const MONITORING: LinkItem = {
  id: 'grp-monitoring',
  title: 'Monitoring',
  children: [
    { id: 'eksploitasi-mon25-drive', title: 'Eksploitasi Monitoring 2025 (Drive)', href: 'https://docs.google.com/spreadsheets/d/1V8lqDZ6RhWUbusYt8W8RYarv_WG_lhhiJuNnW2yrHfw/edit?gid=1549802863#gid=1549802863', tag: 'Sheet' },
    { id: 'monitoring-2025', title: 'Monitoring 2025', href: 'https://docs.google.com/spreadsheets/d/1JlucMCru2YkgBlXfldNA8YITUWZEhlMInJgxBqAFmUY/edit?gid=803062927#gid=803062927', tag: 'Sheet' },
    { id: 'mon-inv-eks-2020', title: 'Monitoring Investasi & Eksploitasi 2020', href: 'https://docs.google.com/spreadsheets/d/1SDrKWmZb4K8T-c3dLvSokdYpqALSgQlojh43XaHflek/edit?gid=1376628399#gid=1376628399', tag: 'Sheet' },
    { id: 'mon-inv-eks-2021', title: 'Monitoring Investasi & Eksploitasi 2021', href: 'https://docs.google.com/spreadsheets/d/1Q4wOuF67eMsthwCn9iNNNArNgerJ3zAiL0mzx0iCwYA/edit?gid=2143760807#gid=2143760807', tag: 'Sheet' },
    { id: 'mon-inv-eks-2022', title: 'Monitoring Investasi & Eksploitasi 2022', href: 'https://docs.google.com/spreadsheets/d/1LBD6Csn0jVF7kmLzqUAhVhjyVzGPFjyZCaD2RrbKQ_U/edit#gid=81639293', tag: 'Sheet' },
    { id: 'mon-inv-2023', title: 'Monitoring Investasi 2023', href: 'https://docs.google.com/spreadsheets/d/19KiGI8W5XZCWyue_3XFXSN2rmAxBeqbm1k8czcjPOSk/edit?gid=1026780400#gid=1026780400', tag: 'Sheet' },
    { id: 'mon-eks-2023', title: 'Monitoring Eksploitasi 2023', href: 'https://docs.google.com/spreadsheets/d/1GL5f0e2-8k9msFv3t9R5WVgYK77uVlg5/edit#gid=1243882236', tag: 'Sheet' },
    { id: 'mon-inv-2024', title: 'Monitoring Investasi 2024', href: 'https://docs.google.com/spreadsheets/d/150gJvUK9kZBHW1lhaEOOkD3gGyJjrnWjj-MUjvkQLII/edit#gid=1176535650', tag: 'Sheet' },
    { id: 'progres-inv-palmco', title: 'Progres Investasi PalmCo', href: 'https://docs.google.com/spreadsheets/d/1-LnjyAgeJ4jBvpucLp_iAnrGtn7WmCLrYnmWhzFub2A/edit#gid=0', tag: 'Sheet' },
    { id: 'rekap-inv-2123', title: 'Rekap Investasi 2021–2023', href: 'https://docs.google.com/spreadsheets/d/1iP140f27zkEx3mCncXlfXN_VRS4MY4GO/edit#gid=665753425', tag: 'Sheet' },
    { id: 'program-excavator-mini', title: 'Program kerja Excavator Mini Regional III', href: 'https://docs.google.com/spreadsheets/d/164fTQii_6hoxC4B-aE3usigY8cDMNRo-/edit?gid=680435153#gid=680435153', tag: 'Sheet' },
  ],
};

/** 4) Kontrak & Dokumen */
const KONTRAK_DOKUMEN: LinkItem = {
  id: 'grp-kontrak-dokumen',
  title: 'Kontrak & Dokumen',
  children: [
    { id: 'kontrak-pks', title: 'Kontrak PKS', href: 'https://drive.google.com/drive/folders/19g7B4zgy9wrBHmRc7GvrTyAhUeuh_Al2' },
    { id: 'kontrak-pko-pkr-ebt-2023', title: 'Kontrak PKO, PKR, EBT 2023', href: 'https://drive.google.com/drive/folders/1QZ8OXwylZmX88lmt6NJ6cKjKacv4-u21' },
    { id: 'kontrak-2024', title: 'Kontrak 2024', href: 'https://drive.google.com/drive/folders/1GMr2BFV1YSxhrJMxdrQmYL_lC3hiw7Np' },
    { id: 'kontrak-2025', title: 'Kontrak 2025', href: 'https://app.ptpn5.co.id/owncloud/index.php/s/dCZuHRm1cZZRXN1' },
    { id: 'sppbj-2024', title: 'SPPBJ 2024', href: 'https://drive.google.com/drive/folders/1TkhgpUQZsc6snVYg6Y7JeqM65CK30TS6?hl=id' },
    { id: 'sppbj-2025', title: 'SPPBJ 2025', href: 'https://drive.google.com/drive/folders/1StxJpEaRp3SiVIc5TiFpFiBro4DKxnio' },
    { id: 'bastek-2024', title: 'Bestek 2024', href: 'https://drive.google.com/drive/folders/1UySvdds1kopX3iR83UaZO7rEcLIEVbi8?hl=id' },
    { id: 'bastek-2025', title: 'Bestek 2025', href: 'https://drive.google.com/drive/folders/17tkxvy_-WLRHuUe6GX2fgAB42skoAdhc' },
    { id: 'katalog', title: 'KATALOG', href: 'https://drive.google.com/drive/folders/1zfENohyiSmAdatdOhRknxal8V8DE1NIT' },
    { id: 'data-holding', title: 'Data Holding', href: 'https://drive.google.com/drive/folders/1RgQN0uY3GRW-utzunRti0mGKOej0VMec' },
    { id: 'material-new', title: 'Material – New', href: 'https://docs.google.com/spreadsheets/d/14iOhVb3X3H-BSLPKXApb9s60nqByMIcr/edit?gid=533844244#gid=533844244', tag: 'Sheet' },
    { id: 'sop-ik', title: 'SOP & IK', href: 'https://drive.google.com/drive/folders/1AbuXwtpZKb6R7Nuxw6afrK6PqK-Rm2Ul' },
    { id: 'workshop-sgh', title: 'Workshop Central SGH', href: 'https://drive.google.com/drive/folders/1EDzNxmfOYi1nmnLEhhTGg_Bq9erlgbj4?pli=1' },
  ],
};


/** Export sebagai satu halaman grid */
export const INVESTASI_CONTENT: Record<string, ContentBucket> = {
  'investasi/sub-instalasi-pks': {
    title: 'Investasi & Eksploitasi Pabrik • Sub Instalasi PKS',
    items: [
      AGENDA_PENOMORAN_SURAT,
      KOND_PERALATAN_BULANAN,
      MONITORING,
      KONTRAK_DOKUMEN,
    ],
  },
};
