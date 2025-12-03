// lib/constants/sections/apps.ts
import type { ContentBucket, LinkItem } from '@/lib/types';
import { PENGOLAHAN_TUKANG_OLAH } from './pengolahan';

/** Coba ambil group "Aplikasi" dari pengolahan (kalau masih ada) */
const appsGroup =
  PENGOLAHAN_TUKANG_OLAH.items.find(
    (i) => i.id === 'aplikasi' || i.title?.toLowerCase() === 'aplikasi'
  ) ?? null;

/** Daftar fallback (dari user) */
const FALLBACK_APPS: LinkItem[] = [
  { id: 'app-mypalmco', title: 'MYPALMCO', href: 'https://palmco.my.id/' },
  { id: 'app-int', title: 'Intank Dashboard', href: 'https://palmco.intank.id/login', tag: 'Login' },
  { id: 'app-pica', title: 'PICA', href: 'https://picatekpol.ptpn4.co.id/login', tag: 'Login' },
  { id: 'app-e-tekpol', title: 'E-Tekpol', href: 'http://118.97.163.52:8182/etekpol/', tag: 'Login' },
  { id: 'app-elemen', title: 'Elemen', href: 'https://elemen.ptpn.id/auth/welcome', tag: 'Login' },
  { id: 'app-iqx', title: 'IQX', href: 'https://app.iqx.net', tag: 'Login' },
  { id: 'app-mims', title: 'MIMS - Angka Kerja', href: 'https://ptpn4.handal.in/account/login', tag: 'Login' },
  { id: 'app-ehs', title: 'Eco Holding Perkebunan', href: 'https://eco.holding-perkebunan.com/', tag: 'Login' },
  { id: 'app-sinus', title: 'SINUSA', href: 'https://sinusa.holding-perkebunan.com:8443/login', tag: 'Login' },
  { id: 'app-ebud', title: 'E-BUDGET', href: 'https://sites.google.com/view/tekpoln5/halaman-muka/e-budget', tag: 'Login' },
  { id: 'app-infra', title: 'Monitoring Infra', href: 'https://monev.palmviews.my.id/login', tag: 'Login' },
  { id: 'app-eoff', title: 'E-OFFICE', href: 'http://118.97.163.52:8300/login', tag: 'Login' },
  { id: 'app-ih', title: 'IPS HOLDING', href: 'https://ips.holding-perkebunan.com/login', tag: 'Login' },
  { id: 'app-oli', title: 'OLIDOS', href: 'http://olidoss.reg3.ptpn4.co.id', tag: 'Login' },
  { id: 'app-au31', title: 'AU31 ONLINE', href: 'https://app.reg3.ptpn4.co.id/au31/login', tag: 'Login' },
  { id: 'app-reg3', title: 'HPS ONLINE', href: 'http://118.97.163.52:8182/', tag: 'Login' },
  { id: 'app-hd', title: 'HELPDESK', href: 'http://ptpn5.co.id/helpdesk/', tag: 'Login' },
  { id: 'app-ed', title: 'E-Disposisi', href: 'http://118.97.163.52:88/disposisi/index.php/auth/login', tag: 'Login' },
  { id: 'app-sipc', title: 'IMS (SOP IK PALM CO)', href: 'https://ims.ptpn4.co.id/', tag: 'Login' },
  { id: 'app-oj', title: 'OSLOG JYOTI', href: 'https://oslog.id/app/', tag: 'Login' },
  { id: 'app-hitmi', title: 'HITMI', href: 'http://118.97.163.52:8223/index.php/login', tag: 'Login' },
  { id: 'app-erin', title: 'ERIN', href: 'https://erin.holding-perkebunan.com/', tag: 'Login' },
  { id: 'app-aghris', title: 'AGHRIS', href: 'https://aghris.holding-perkebunan.com/', tag: 'Login' },
  { id: 'app-dashboard', title: 'Dashboard MIMS LOSSES', href: 'https://mims-foss.holding-perkebunan.com/', tag: 'Login' },
  { id: 'app-asana', title: 'ASANA', href: 'https://app.asana.com/', tag: 'Login' },  
  { id: 'app-sevp', title: 'SEVP OPS REG 3', href: 'https://sites.google.com/view/sevpopsreg3/halaman-muka', tag: 'Login' },  
  { id: 'app-han', title: 'Hana', href: 'http://hana.reg3.ptpn4.co.id', tag: 'Login' },  
  { id: 'app-slip', title: 'Eslip', href: 'http://app.reg3.ptpn4.co.id/eslip', tag: 'Login' },  
  { id: 'app-ris', title: 'Hris', href: 'http://app.reg3.ptpn4.co.id/cbhrm', tag: 'Login' },  
];

/** ===== Helper: hilangkan duplikat berdasar href ===== */
function dedupByHref(items: LinkItem[]): LinkItem[] {
  const seen = new Set<string>();
  const out: LinkItem[] = [];
  for (const it of items) {
    const key = (it.href ?? '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

/** ===== Normalisasi judul untuk item prioritas ===== */
function relabelPriorityTitle(item: LinkItem): LinkItem {
  const href = item.href?.toLowerCase() ?? '';
  const cur = (item.title ?? '').toLowerCase();

  if (href.startsWith('https://palmco.my.id') || cur === 'mypalmco') {
    return { ...item, title: 'MY PALMCO' };
  }
  if (href.startsWith('https://palmco.intank.id') || cur.includes('intank')) {
    return { ...item, title: 'PALMCO' };
  }
  if (href.startsWith('https://picatekpol.ptpn4.co.id')) {
    return { ...item, title: 'PICA' };
  }
  if (href.startsWith('http://118.97.163.52:8182/etekpol')) {
    return { ...item, title: 'E-TEKPOL' };
  }
  if (href.startsWith('https://elemen.ptpn.id') || cur === 'elemen') {
    return { ...item, title: 'Elemen' };
  }
  return item;
}


const PRIORITY = ['MY PALMCO', 'PALMCO', 'PICA', 'E-TEKPOL', 'ELEMEN'] as const;

function priorityIndex(title: string): number {
  const idx = PRIORITY.indexOf(title.toUpperCase() as (typeof PRIORITY)[number]);
  return idx === -1 ? Number.POSITIVE_INFINITY : idx;
}

const FALLBACK_SORTED: LinkItem[] = dedupByHref(
  FALLBACK_APPS.map(relabelPriorityTitle)
).sort((a, b) => {
  const pa = priorityIndex(a.title);
  const pb = priorityIndex(b.title);
  if (pa !== pb) return pa - pb;                 // urutkan menurut prioritas
  return a.title.localeCompare(b.title, 'id');    // sisanya alfabet
});

export const TEKPOL_APPS_BUCKET: ContentBucket = {
  title: 'Tekpol Apps',
  items: appsGroup?.children && appsGroup.children.length > 0 ? appsGroup.children : FALLBACK_SORTED,
};
