// lib/types.ts
export type LinkItem = {
  id: string;
  title: string;
  href?: string;
  desc?: string;
  tag?: string;
  children?: LinkItem[];
  logoUrl?: string; // ✅ WAJIB
};

export type ContentBucket = {
  title: string;
  subtitle?: string;
  items: LinkItem[];
};

export type PathKey =
  | "home"
  | "pengolahan/tukangolah"
  | "investasi/sub-instalasi-pks"
  | "teknik/sub"
  | "tekpol-apps"
  | "pks-upload"
  | "pks-dokumen"
  | "galeri";

export type HomeView =
  | "root"
  | "pks-list"
  | "pks-detail"
  | "ppis"
  | "ppkr"
  | "creds"
  | "request"
  | "approval"
  | "info-login";

export type Pks = {
  id: string;
  nama: string;
  jenis: "PKS";
  alamat: string;
  kapasitasTbsPerJam: number;
};

export type PksDetail = {
  id: string;
  nama: string;
  infoUmum: {
    jenis: string;
    alamat: string;
    kapasitasTbsPerJam: number;
    tahunOperasional: number;
    jumlahLine: number;
  };
  catatan: string[];
};

export type NewsSource = "INTERNAL" | "INSTAGRAM";

export type NewsItem = {
  id: string;
  title: string;
  tag: string;
  date: string;
  excerpt: string;
  body: string;
  image?: string;
  youtubeId?: string;
  videoUrl?: string;
  labelAbove?: string;

  // optional kalau nanti kamu butuh di tempat lain
  sourceType?: NewsSource;
  instagramUrl?: string | null;
};

// ===== tipe ringan untuk auth & data kredensial/approval =====
export type Role = "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";
export type Decision = "PENDING" | "APPROVED" | "REJECTED";
export type Category = "HO" | "REGIONAL";

export type App = {
  id: string;
  name: string;
  category: Category;
  username: string;
  password: string;
  description?: string | null;

  // ✅ TAMBAH: biar selaras dengan DB & UI Tekpol Apps
  url?: string | null;

  // ✅ TAMBAH: url logo (contoh: /uploads/apps/xxx.png atau URL cloud)
  logoUrl?: string | null;
};

export type User = {
  id: string;
  name: string;
  email?: string | null;
  isPic?: boolean;
  role?: Role;
};

export type Approval = {
  id: string;
  requestId: string;
  approverId: string;
  role: Role;
  decision: Decision;
  note?: string | null;
  decidedAt?: Date | null;
  approver?: User | null;
};

export type Request = {
  id: string;
  type: "PKWT" | "GUEST";
  appId: string;
  requesterId: string;
  picId?: string | null;
  reason?: string | null;
  division?: string | null;
  status: Decision;
  rejectionNote?: string | null;
};

export type MyReq = Request & { app: App; approvals: Approval[]; pic: User | null };
