import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  // ✅ kalau belum login → paksa ke login
  if (!session?.user?.id) {
    redirect("/login");
  }

  // ✅ kalau sudah login → masuk dashboard
  redirect("/dashboard");
}
