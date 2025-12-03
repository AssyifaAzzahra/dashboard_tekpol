import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { z } from "zod";

// Skema kredensial supaya aman & tanpa 'any'
const CredsSchema = z.object({
  loginType: z.string().optional(),    // "staff" | "guest"
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
  guestName: z.string().min(1).optional(),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        loginType: { label: "Login Type", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        guestName: { label: "Guest Name", type: "text" },
      },
      async authorize(raw) {
        const parsed = CredsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { loginType = "staff", email, password, guestName } = parsed.data;

        // Mode guest (tanpa password, user sementara)
        if (loginType === "guest" && guestName) {
          return {
            id: "guest-" + Date.now().toString(),
            name: guestName,
          };
        }

        // Mode staff (email + password)
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
        };
      },
    }),
  ],

  callbacks: {
    // Simpan role & isPic ke token
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        // 'Role' diambil dari @prisma/client (enum). Boleh undefined untuk guest.
        token.role = dbUser?.role as Role | undefined;
        token.isPic = Boolean(dbUser?.isPic);
      }
      return token as JWT;
    },

    // Dorong ke session.user.*
    async session({ session, token }) {
      if (!session.user) session.user = {};
      session.user.id = token.sub;
      session.user.role = token.role as Role | undefined;
      session.user.isPic = Boolean((token as JWT & { isPic?: boolean }).isPic);
      return session;
    },

    // Setelah login, arahkan ke Home ("/") secara default
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return baseUrl + url;
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
      } catch {
        // abaikan error parsing
      }
      return baseUrl + "/";
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
