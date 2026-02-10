export type Role =
  | "SUPERADMIN"
  | "ADMIN"
  | "PKWT"
  | "KARYAWAN"
  | "KASUBAG"
  | "KABAG"
  | "GUEST";

export type Decision = "PENDING" | "APPROVED" | "REJECTED";
export type Category = "HO" | "REGIONAL";

export type App = {
  id: string;
  name: string;
  category: Category;
  username?: string | null;
  password?: string | null;
  description?: string | null;
  url?: string | null;
  logoUrl?: string | null;
};

export type User = { id: string; name: string; email?: string | null };

export type Request = {
  id: string;
  appId: string;
  status: Decision;
  type: "PKWT" | "GUEST";
  rejectionNote?: string | null;
  pic?: User | null;
};

export type MyReq = Request & { app: App; pic: User | null };
