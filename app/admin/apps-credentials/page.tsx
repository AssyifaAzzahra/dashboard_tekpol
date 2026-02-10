import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminAppsCredentialsClient from "./view-client";

export default async function AdminAppsCredentialsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  return <AdminAppsCredentialsClient />;
}
