import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PREFIX = ["/apps", "/approval", "/info-login"]; // rute yang harus login

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIX.some((p) => pathname.startsWith(p));

  if (!needsAuth) return NextResponse.next();

  // Cek session JWT Next-Auth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Hanya “match” rute yang perlu login
export const config = {
  matcher: ["/apps/:path*", "/approval/:path*", "/info-login"],
};
