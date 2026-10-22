
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolve request-specific authentication before rendering.
  await connection();

  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
