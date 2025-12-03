// next-auth.d.ts
import "next-auth";
import "next-auth/jwt";
import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  /** Field ekstra yang ikut keluar dari authorize() */
  interface User {
    id: string;
    role?: Role;
    isPic?: boolean;
  }

  /** Session yang dipakai di useSession() */
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: Role;
      isPic?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    isPic?: boolean;
  }
}
