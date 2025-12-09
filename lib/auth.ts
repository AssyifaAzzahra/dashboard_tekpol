// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { z } from "zod";

// Skema kredensial: hanya untuk user internal
const CredsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = CredsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Hanya user internal yang boleh login
        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          role: user.role,
          isPic: user.isPic,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Saat pertama kali login, isi token dari user
      if (user) {
        const u = user as typeof user & { role?: Role; isPic?: boolean };
        token.role = u.role;
        token.isPic = Boolean(u.isPic);
      }
      return token as JWT & { role?: Role; isPic?: boolean };
    },

    async session({ session, token }) {
      if (!session.user) session.user = {};

      session.user.id = token.sub;
      session.user.role = token.role as Role | undefined;
      session.user.isPic = Boolean(
        (token as JWT & { isPic?: boolean }).isPic,
      );

      return session;
    },

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
