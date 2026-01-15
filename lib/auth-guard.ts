import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requirePksUser() {
  const session = await requireSession();
  const pksCode = (session.user as any).pksCode as string | null | undefined;
  if (!pksCode) throw new Error("FORBIDDEN_PKS_ONLY");
  return { session, pksCode };
}

export async function requireSuperadmin() {
  const session = await requireSession();
  const role = (session.user as any).role as string | undefined;
  if (role !== "SUPERADMIN") throw new Error("FORBIDDEN_ADMIN_ONLY");
  return session;
}
