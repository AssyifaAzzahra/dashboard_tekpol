import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email / No. SAP', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        const identifierRaw = credentials?.identifier?.trim();
        const password = credentials?.password;

        if (!identifierRaw || !password) return null;

        const identifier = identifierRaw;
        const isEmail = identifier.includes('@');

        const user = isEmail
          ? await prisma.user.findUnique({
              where: { email: identifier.toLowerCase() },
            })
          : await prisma.user.findUnique({
              where: { sapNo: identifier },
            });

        if (!user) return null;
        if (!user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // object ini yang masuk ke jwt callback (sebagai `user`)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPic: user.isPic,
          pksCode: user.pksCode,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.isPic = (user as any).isPic;
        token.pksCode = (user as any).pksCode ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isPic = token.isPic;
        (session.user as any).pksCode = token.pksCode ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
