import "next-auth";
import "next-auth/jwt";
import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role?: Role;
    isPic?: boolean;
    pksCode?: string | null; // ✅ tambah
  }

  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: Role;
      isPic?: boolean;
      pksCode?: string | null; // ✅ tambah
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    isPic?: boolean;
    pksCode?: string | null; // ✅ tambah
  }
}
