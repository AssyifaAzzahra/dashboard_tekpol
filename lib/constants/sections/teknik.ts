import type { ContentBucket, LinkItem } from '@/lib/types';

/** =========================================================
 *  HALAMAN MUKA
 *  ======================================================= */
const HM_PENOMORAN: LinkItem = {
  id: 'hm-penomoran',
  title: 'Penomoran',
  children: [
    { id: 'hm-pen-2021', title: 'Tahun 2021', href: 'https://docs.google.com/spreadsheets/d/1XfsWAk3NgGXR1rxR-cvAAs0uA0z2ywF6/edit?gid=1867115641#gid=1867115641', tag: 'Sheet' },
    { id: 'hm-pen-2022', title: 'Tahun 2022', href: 'https://docs.google.com/spreadsheets/d/17qayiodRcTKDPkcNkVMSO1_4HsrIU_eL/edit?gid=792174372#gid=792174372', tag: 'Sheet' },
    { id: 'hm-pen-2023', title: 'Tahun 2023', href: 'https://docs.google.com/spreadsheets/d/1M9zg0K6hzFGB09prirOCVlVct9H0PkUsGCi_CemHKhQ/edit?gid=616606399#gid=616606399', tag: 'Sheet' },
    { id: 'hm-pen-2024', title: 'Tahun 2024', href: 'https://docs.google.com/spreadsheets/d/19wzv3Bw2SZ8SHQS3VQtbBCXe79os9Uldngu3CuC_Tfc/edit?gid=1921630124#gid=1921630124', tag: 'Sheet' },
    { id: 'hm-pen-2025', title: 'Tahun 2025', href: 'https://docs.google.com/spreadsheets/d/1Ioqy5ackkeUUs0isdD2LQJygWW2tpvMa/edit?gid=197906093#gid=197906093', tag: 'Sheet' },
  ],
};

const HM_PO_PRINSIPAL: LinkItem = {
  id: 'hm-po-prinsipal',
  title: 'PO Prinsipal',
  href: 'https://sites.google.com/view/ptpn5-tep/prinsipal',
};

const HM_CTD: LinkItem = {
  id: 'hm-ctd',
  title: 'CTD',
  children: [
    { id: 'hm-ctd-pic', title: 'PIC CTD Reg III', href: 'https://docs.google.com/spreadsheets/d/1Q-Yh3jgTCw2enUbgh-IyIR-qlXHVNI1N/edit#gid=1111811936', tag: 'Sheet' },
    { id: 'hm-ctd-app', title: 'Aplikasi CTD (APK)', href: 'https://www.google.com/url?q=https%3A%2F%2Fispn.ptpn4.or.id%2Fapi%2Fv1%2Fassets%2Fapk%2F1%2Fapp-release.apk&sa=D&sntz=1&usg=AOvVaw06JqnDl9qgIvI8dbqhfIOx' },
    { id: 'hm-ctd-surat', title: 'Surat-Surat CTD', href: 'https://drive.google.com/drive/folders/1aThgxpZUBsSbqGsM37ZFi579mrCQxoUr' },
    { id: 'hm-ctd-webmaster', title: 'Web Master CTD', href: 'https://gis.ptpn4.or.id/portal/apps/webappviewer/index.html?id=45086c3e922f47ac883ad4368d875786' },
    { id: 'hm-ctd-webpc', title: 'Web Aplikasi CTD PC', href: 'https://ispn.ptpn4.or.id/admin-panel/login?callbackUrl=%2Fmanagement-surveyor' },
    { id: 'hm-ctd-webreg3', title: 'Web Reg III', href: 'https://gis.ptpn4.or.id/portal/apps/opsdashboard/index.html#/a52663ae923d406fa2aab3e0193c18db' },
    { id: 'hm-ctd-progres', title: 'Progres Survey Jalan', href: 'https://docs.google.com/spreadsheets/d/1MXPbURJt6ffj4uh14mcFSBCPNexIq6Yz/edit?gid=634234598#gid=634234598', tag: 'Sheet' },
  ],
};

const HM_KONTRAK: LinkItem = {
  id: 'hm-kontrak',
  title: 'Kontrak',
  href: 'https://app.reg3.ptpn4.co.id/owncloud/index.php/login',
  tag: 'Login',
};

const HM_SOLAR: LinkItem = {
  id: 'hm-solar',
  title: 'Solar',
  children: [
    {
      id: 'hm-solar-pemakaian',
      title: 'Pemakaian BBM Solar',
      children: [
        { id: 'hm-solar-pem-2022', title: 'Pemakaian 2022', href: 'https://docs.google.com/spreadsheets/d/1rnegdHQw-DkOo2uHTY5nJxqJ9zZ9GbxNiWGjYwmeS-k/edit?gid=677760382#gid=677760382', tag: 'Sheet' },
        { id: 'hm-solar-pem-2023', title: 'Pemakaian 2023', href: 'https://docs.google.com/spreadsheets/d/1m41uhmN-49UsaAJUstxKQjf0Zbb83aLiErqMefDvLtw/edit?gid=571432420#gid=571432420', tag: 'Sheet' },
        { id: 'hm-solar-pem-2024', title: 'Pemakaian 2024', href: 'https://docs.google.com/spreadsheets/d/14YbKIWkZOCE7p7QO7ebkiLMpgfwFZTSx2LxWaNFeKpY/edit#gid=571432420', tag: 'Sheet' },
        { id: 'hm-solar-pem-2025', title: 'Pemakaian 2025', href: 'https://docs.google.com/spreadsheets/d/1vg8tDQ9CqiBqrVZRRyJ9C-8aJZMk6JSGkAb_uhHuLyo/edit?gid=571432420#gid=571432420', tag: 'Sheet' },
        { id: 'hm-solar-rekap-rkap-real', title: 'Rekap RKAP vs REAL BBM Solar', href: 'https://docs.google.com/spreadsheets/d/1zrkvCjdthLXbbxhEjsx1Pvo9iCD36Ov0AoXyfecmGXU/edit?gid=0#gid=0', tag: 'Sheet' },
      ],
    },
    {
      id: 'hm-solar-po',
      title: 'PO BBM Solar',
      children: [
        { id: 'hm-solar-po-2021', title: 'PO Solar 2021', href: 'https://docs.google.com/spreadsheets/d/1C8-IN1PiE7xNKm3yCLldZBgsQSH4YgK2/edit?gid=1960734229#gid=1960734229', tag: 'Sheet' },
        { id: 'hm-solar-po-2022', title: 'PO Solar 2022', href: 'https://docs.google.com/spreadsheets/d/1QOOThGMehp2JdlMC4RKu71AJAL1IP8AI/edit?gid=1581635741#gid=1581635741', tag: 'Sheet' },
        { id: 'hm-solar-po-2023', title: 'PO Solar 2023', href: 'https://docs.google.com/spreadsheets/d/1Yq5Alt7A2rAMuwwJyR3tsMrCzDfDyXFS_95dVcYNRlI/edit?gid=960004947#gid=960004947', tag: 'Sheet' },
        { id: 'hm-solar-po-2024', title: 'PO Solar 2024', href: 'https://docs.google.com/spreadsheets/d/1I87nmE7BuDpT3YDG-9FAX5h3fLsnwXEne-JTG_96Z70/edit?gid=960004947#gid=960004947', tag: 'Sheet' },
        { id: 'hm-solar-po-2025', title: 'PO Solar 2025', href: 'https://docs.google.com/spreadsheets/d/12ikr5EmN6iuNd8VJQCYHjZDHFu4bsUqx9oy2AQw4yp4/edit?gid=2131126410#gid=2131126410', tag: 'Sheet' },
        { id: 'hm-solar-po-2025-plm', title: 'PO Solar 2025 PT. Putra Laskar Merdeka', href: 'https://docs.google.com/spreadsheets/d/1C8GQjA1PFMKwXYT0c2PwGqxr2dEyWUObqt_6uF0dzd4/edit?gid=704306002#gid=704306002', tag: 'Sheet' },
      ],
    },
    { id: 'hm-solar-rekap-2225', title: 'Rekap BBM Solar 2022–2025', href: 'https://docs.google.com/spreadsheets/d/13mU3Oxy1kHi2wK7Lo_J4HzJCvgx8eo67/edit?rtpof=true&sd=true', tag: 'Sheet' },
    { id: 'hm-solar-stok-octdec25', title: 'Monitoring Stok Solar Okt–Des 2025', href: 'https://docs.google.com/spreadsheets/d/1Y-ajlkklEZuD0Bw8czpavkNJjdJ5bufG/edit?gid=1247660592#gid=1247660592', tag: 'Sheet' },
    { id: 'hm-solar-pem-akhir25', title: 'Monitoring Pemakaian BBM Solar Akhir Tahun 2025', href: 'https://docs.google.com/spreadsheets/d/1iVALOX8tSz8RQytIsChBpkhicj7IlI959j_kMB4hz3g/edit?gid=379265137#gid=379265137', tag: 'Sheet' },
  ],
};

const HM_MOU_PLN: LinkItem = {
  id: 'hm-mou-pln',
  title: 'MoU PLN',
  children: [
    { id: 'hm-pln-galeri', title: 'Galeri PLN', href: 'https://docs.google.com/spreadsheets/d/1iVALOX8tSz8RQytIsChBpkhicj7IlI959j_kMB4hz3g/edit?gid=379265137#gid=379265137', tag: 'Sheet' },
    { id: 'hm-pln-daftar-kwh', title: 'Daftar KWH Meter Listrik Regional III', href: 'https://docs.google.com/spreadsheets/d/1TsAPRwL2d_EkkaXuHp9dQHevKT7Qhe844WtA5Yv-v_I/edit?gid=0#gid=0', tag: 'Sheet' },
    { id: 'hm-pln-bpujl', title: 'BPUJL PLN', href: 'https://docs.google.com/spreadsheets/d/1BCBqnHfkHHufBg5xdH0YDlaz-7IDf6Y2/edit?gid=58305163#gid=58305163', tag: 'Sheet' },
    { id: 'hm-pln-mou', title: 'Surat MoU dengan PLN', href: 'https://drive.google.com/file/d/1JNAhUJEBSTnjpkJAN0XrpvXCPzqlGZGS/view?usp=share_link' },
    { id: 'hm-pln-nidi-slo', title: 'NIDI/SLO', href: 'https://drive.google.com/drive/folders/1mu-Z5JJKXLhv2x4_GCYQiwbqWMwcDu32' },
    { id: 'hm-pln-ptpn5', title: 'PTPN5/PLN', href: 'https://sites.google.com/view/ptpn5pln/halaman-muka' },
    { id: 'hm-pln-ba-penumbangan', title: 'BA Penumbangan Pokok', href: 'https://drive.google.com/drive/folders/1rCXI11LhOlQ8pCtntVSr1KGYODKnbNyr' },
    { id: 'hm-pln-mon-jaringan-20240301', title: 'Monitoring Jaringan Listrik PLN 01 Maret 2024', href: 'https://docs.google.com/spreadsheets/d/1q8qI8WHy4_Dp5BpNPUK3egqvaalLhEJHp_LzaPJLOZM/edit?gid=685760469#gid=685760469', tag: 'Sheet' },
    { id: 'hm-pln-ppt-konektivitas', title: 'PPT Update Program Konektivitas Listrik PLN', href: 'https://docs.google.com/presentation/d/1-ZIKpLlUi2SW4O7xKAmq8CKlnl6Uagas/present?slide=id.p1', tag: 'Slide' },
    { id: 'hm-pln-ppt-jaringan-20240128', title: 'PPT Pemasangan Jaringan Listrik PLN 28 Jan 2024', href: 'https://docs.google.com/presentation/d/1x_FMwKR5Zw_czeFKqoCF2KK-HfoOd1M0/present?slide=id.p1', tag: 'Slide' },
    { id: 'hm-pln-ppt-jaringan-20231203', title: 'PPT Pemasangan Jaringan Listrik PLN 03 Des 2023', href: 'https://docs.google.com/presentation/d/1lFiwa3Ry-ILyvFF_-f0HAkr3Wa64_Dnp/present?slide=id.p1', tag: 'Slide' },
  ],
};

const HM_KONDISI_KEND_ALBERT: LinkItem = {
  id: 'hm-kondisi-kend-albert',
  title: 'Kondisi Kend, Albert dan Pemakaian BBM Solar',
  children: [
    { id: 'hm-kond-albert-2024', title: 'Kondisi Alat Berat Tahun 2024', href: 'https://sites.google.com/view/tekpoln5/kondisi-kend-dan-albert' },
    { id: 'hm-kond-albert-2025', title: 'Kondisi Alat Berat Tahun 2025', href: 'https://www.google.com/url?q=http%3A%2F%2Fa&sa=D&sntz=1&usg=AOvVaw2wFF4e0C8n3CqdG-vqyBHh' },
    { id: 'hm-kond-albert-2026', title: 'Kondisi Alat Berat Tahun 2026', href: 'https://www.google.com/url?q=http%3A%2F%2Fa&sa=D&sntz=1&usg=AOvVaw2wFF4e0C8n3CqdG-vqyBHh' },
  ],
};

const HALAMAN_MUKA_ITEMS: LinkItem[] = [
  HM_PENOMORAN,
  HM_PO_PRINSIPAL,
  HM_CTD,
  HM_KONTRAK,
  HM_SOLAR,
  HM_MOU_PLN,
  HM_KONDISI_KEND_ALBERT,
  { id: 'hm-persen-palmco', title: 'Persentase PALMCO Regional III', href: 'https://docs.google.com/presentation/d/1JKY1fbEM_dkEhsjHSTTa3Ifkmh0XvRn7wR-15vPCB4A/edit#slide=id.g27369289b9d_2_0', tag: 'Slide' },
  { id: 'hm-pkb-2425', title: 'PKB Tahun 2024 - 2025', href: 'https://drive.google.com/drive/folders/1vtcezLfwd4XZ-erblrUIZPVD0cpIkYtK' },
  { id: 'hm-infra-jalan', title: 'Pengelolaan Infrastruktur Jalan', href: 'https://drive.google.com/drive/folders/1BzRdsML8Un35mN8KBFJjzUrAa3f3NR2t' },
  { id: 'hm-spi', title: 'Data Permintaan SPI', href: 'https://sites.google.com/view/monitoring-spi--bid-tek-2025/halaman-muka' },
];


/** =========================================================
 *  2023
 *  ======================================================= */
const T23_MON_TEKPOL: LinkItem = {
  id: 't23-mon-tekpol',
  title: 'Monitoring Tekpol 2023',
  children: [
    { id: 't23-bbm-solar', title: 'BBM Solar', href: 'https://sites.google.com/view/tekpoln5/halaman-muka/solar' },
    {
      id: 't23-mon-unit',
      title: 'Monitoring Unit',
      children: [
        { id: 't23-inv-nontanaman', title: 'Investasi nontanaman', href: 'https://docs.google.com/spreadsheets/d/1vGI6NDHl0baKB6BWx8epfRBC_USGWrkXEX7cEmn6R0Y/edit?gid=2057950833#gid=2057950833', tag: 'Sheet' },
        { id: 't23-progres-berat', title: 'Progres A.Berat, Rorak, dan Embung', href: 'https://docs.google.com/spreadsheets/d/1zuiZ_6QP4VCU5ApzvgByrHDf8khykHKyk1At7Nt2p90/edit?usp=sharing' },
        { id: 't23-senbro', title: 'Laporan Senbro', href: 'https://docs.google.com/spreadsheets/d/1mns7gH_p0a0yN1sdGuQAfKjBvtMWTiR85KSCNpfSsLY/edit?gid=954319900#gid=954319900', tag: 'Sheet' },
        { id: 't23-sewa-alat', title: 'Sewa alat berat', href: 'https://docs.google.com/spreadsheets/d/1qbneLVkRx3LqzSFLZT-6ZkJND7PKF9aBUAyr25dlCZI/edit?gid=1094052560#gid=1094052560', tag: 'Sheet' },
        { id: 't23-nama-krani', title: 'Nama krani/mdr tek', href: 'https://docs.google.com/spreadsheets/d/1TKAyZekH60ujRq9uXmcfQBXVsc0lrN9dWzaAbsAnUOM/edit?gid=0#gid=0', tag: 'Sheet' },
        { id: 't23-web-kebun', title: 'Web kebun', href: 'https://sites.google.com/view/ptpn5-tep/home' },
      ],
    },
  ],
};

const T23_KONDISI_KEND_UNIT: LinkItem = {
  id: 't23-kondisi-kend-unit',
  title: 'Kondisi Kend/A.Berat Unit',
  children: [
    { id: 't23-juni-2024', title: 'Bulan Juni 2024', href: 'https://docs.google.com/spreadsheets/d/1lGA0k5PcnI_sNfUCXEJGliA1LU0G8O8h-HZ4mMKKYXs/edit?gid=81804302#gid=81804302', tag: 'Sheet' },
    { id: 't23-juli-2024', title: 'Bulan Juli 2024', href: 'https://docs.google.com/spreadsheets/d/19JNNmWFbT84agoYYeR5HFzZY-yt3jPIi2LkrKsqZyDI/edit?gid=266163104#gid=266163104', tag: 'Sheet' },
    { id: 't23-agustus-2024', title: 'Bulan Agustus 2024', href: 'https://sites.google.com/view/ptpn5-tep/tahun-2024/laporan-harian/lap-agustus-2024' },
    { id: 't23-rekap-bbm-2024', title: 'Rekapitulasi BBM A.Berat & Truck 2024', href: 'https://docs.google.com/spreadsheets/d/1MZdd7CgXvqzkMcHL4_I1krELuJEYKS_QJSc9hvz7orw/edit#gid=881337672', tag: 'Sheet' },
  ],
};

const TAHUN_2023_ITEMS: LinkItem[] = [
  T23_MON_TEKPOL,
  { id: 't23-mon-mesin-pks', title: 'Monitoring Mesin PKS', href: 'https://sites.google.com/view/ptpn5-tep/pkspko' },
  T23_KONDISI_KEND_UNIT,
  { id: 't23-mon-pekerjaan', title: 'Monitoring Pekerjaan', href: 'https://docs.google.com/spreadsheets/d/19KiGI8W5XZCWyue_3XFXSN2rmAxBeqbm1k8czcjPOSk/edit?gid=1342980638#gid=1342980638', tag: 'Sheet' },
];

/** =========================================================
 *  2024
 *  ======================================================= */
const T24_PALMCO: LinkItem = {
  id: 't24-palmco',
  title: 'PALMCO',
  children: [
    { id: 't24-lap-harian-palmco', title: 'Laporan harian kendaraan PALMCO', href: 'https://docs.google.com/spreadsheets/d/1FuDDRlDGLS3DHYFW8r3ReNL_2z-wc2-3/edit#gid=276742254', tag: 'Sheet' },
    { id: 't24-daftar-kendaraan', title: 'Daftar kendaraan inv & sewa', href: 'https://docs.google.com/spreadsheets/d/160dz4XeeNbitfK61oqSEmvZH0OF8BIGO/edit#gid=931502099', tag: 'Sheet' },
  ],
};

const T24_MON_TEKPOL: LinkItem = {
  id: 't24-mon-tekpol',
  title: 'Monitoring Tekpol Tahun 2024',
  children: [
    { id: 't24-mon-investasi', title: 'Monitoring investasi pekerjaan 2024', href: 'https://docs.google.com/spreadsheets/d/150gJvUK9kZBHW1lhaEOOkD3gGyJjrnWjj-MUjvkQLII/edit#gid=1549802863', tag: 'Sheet' },
    { id: 't24-mon-eksploitasi', title: 'Monitoring Eksploitasi pekerjaan 2024', href: 'https://docs.google.com/spreadsheets/d/1hwV3DGOlO2H9VdIKRjppU-elu9V2o22HEICkyn6PTUE/edit?gid=1635724175#gid=1635724175', tag: 'Sheet' },
    { id: 't24-sppj', title: 'Data isian SPPJ PALMCO', href: 'https://docs.google.com/spreadsheets/d/1RXCEWDAERITKMHKuN0xGTjVFYJUvV6ZJ/edit?usp=sharing&ouid=106348844212052972390&rtpof=true&sd=true' },
    { id: 't24-program-truck', title: 'Program kerja truck tahun 2024', href: 'https://docs.google.com/spreadsheets/d/1CRrSkJ_UH4H0NJ4DFJ-D4uXta_sV2cdFTm5EAu5jxX8/edit#gid=704753066', tag: 'Sheet' },
    { id: 't24-laporan-kebun-pks', title: 'Laporan kebun/pks', href: 'https://sites.google.com/view/ptpn5-tep/home' },
    { id: 't24-rkap-unit', title: 'RKAP 2024 Unit', href: 'https://sites.google.com/view/rkaptahun2024/rkap-2024' },
    { id: 't24-kebutuhan-infra', title: 'Kebutuhan infra tahun 2024', href: 'https://drive.google.com/drive/folders/1NbDYI8JyIvyixL_yA4GHMziBhFBG_J0a' },
    T24_PALMCO,
  ],
};

const TAHUN_2024_ITEMS: LinkItem[] = [T24_MON_TEKPOL];

/** =========================================================
 *  2025
 *  ======================================================= */
const TAHUN_2025_ITEMS: LinkItem[] = [
  { id: 't25-mon-investasi', title: 'Monitoring investasi tahun 2025', href: 'https://docs.google.com/spreadsheets/d/1JlucMCru2YkgBlXfldNA8YITUWZEhlMInJgxBqAFmUY/edit?gid=803062927#gid=803062927', tag: 'Sheet' },
  { id: 't25-mon-eksploitasi', title: 'Monitoring eksploitasi tahun 2025', href: 'https://docs.google.com/spreadsheets/d/1V8lqDZ6RhWUbusYt8W8RYarv_WG_lhhiJuNnW2yrHfw/edit?gid=1549802863#gid=1549802863', tag: 'Sheet' },
  { id: 't25-daftar-ho', title: 'Daftar isian ke HO Jakarta (bitly/Tekpol)', href: 'https://docs.google.com/spreadsheets/d/11SN3MiBsa9-g3p5hhPH4M0dCMVCq7zqEoZhBVryLlDA/edit?gid=0#gid=0', tag: 'Sheet' },
  { id: 't25-laporan-kebun-pks', title: 'Laporan kebun/pks tahun 2025', href: 'https://sites.google.com/view/ptpn5-tep/tahun-2025' },
  { id: 't25-rkap', title: 'RKAP tahun 2025', href: 'https://sites.google.com/view/ptpn5-tep/tahun-2025?authuser=0' },
];

/** =========================================================
 *  2026
 *  ======================================================= */
const TAHUN_2026_ITEMS: LinkItem[] = [
  { id: 't26-tender-dini', title: 'Tender dini tahun 2026', href: 'https://docs.google.com/spreadsheets/d/1i7bYFMPPCM5IwhG4p6AWMaN_d4UWhtuvRtUHdkIJs0k/edit?gid=0#gid=0', tag: 'Sheet' },
  { id: 't26-rkap-rko-ebudget', title: 'RKAP-RKO-E-BUDGET 2026', href: 'https://sites.google.com/view/ptpn5-tep/tahun-2026' },
];

/** =========================================================
 *  EXPORT CONTENT
 *  ======================================================= */
export const TEKNIK_CONTENT: Record<string, ContentBucket> = {
  'teknik/sub': {
    title: 'Teknik & Infrastruktur • Sub Teknik dan Infrastruktur',
    items: [
      { id: 'menu-halaman-muka', title: 'Halaman Muka', children: HALAMAN_MUKA_ITEMS },
      { id: 'menu-2023', title: '2023', children: TAHUN_2023_ITEMS },
      { id: 'menu-2024', title: '2024', children: TAHUN_2024_ITEMS },
      { id: 'menu-2025', title: '2025', children: TAHUN_2025_ITEMS },
      { id: 'menu-2026', title: '2026', children: TAHUN_2026_ITEMS },
    ],
  },
};
