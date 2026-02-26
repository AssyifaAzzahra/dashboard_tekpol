// lib/types.ts

export type LinkItem = {
  id: string;
  title: string;
  href?: string;
  desc?: string;
  tag?: string;
  children?: LinkItem[];
  logoUrl?: string;
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

/**
 * ✅ FIX: Ditambahkan karena dipakai di components/home/PksDetailView.tsx
 * Sesuai field yang kamu return dari route:
 * id, name, slug, shortProfile, address, capacity, yearOperation, lineCount,
 * operationalNotes, photoUrl, structureUrl, certificateUrl, createdAt, updatedAt
 */
export type PksDetail = {
  id: string;
  name: string;
  slug: string;
  shortProfile: string | null;
  address: string | null;
  capacity: string | null;
  yearOperation: number | null;
  lineCount: number | null;
  operationalNotes: string | null;
  photoUrl: string | null;
  structureUrl: string | null;
  certificateUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewsSource = "INTERNAL" | "INSTAGRAM";

// ===============================
// AUTH & CREDENTIAL TYPES
// ===============================

export type Role =
  | "PKWT"
  | "KARYAWAN"
  | "KASUBAG"
  | "KABAG"
  | "GUEST"
  | "SUPERADMIN"
  | "ADMIN";

export type Decision = "PENDING" | "APPROVED" | "REJECTED";
export type Category = "HO" | "REGIONAL";

export type App = {
  id: string;
  name: string;
  category: Category;

  // nullable sesuai Prisma
  username?: string | null;
  password?: string | null;

  description?: string | null;
  url?: string | null;
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
  requesterId?: string | null;
  picId?: string | null;
  reason?: string | null;
  division?: string | null;
  status: Decision;
  rejectionNote?: string | null;
};

export type MyReq = Request & {
  app?: App;
  approvals?: Approval[];
  pic?: User | null;
};