import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Must run before reading cookies or verifying JWT.
  await connection();

  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/login");
  }

  return (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />

    <div className="min-h-screen lg:pl-64">
      <Navbar />

      <main className="min-h-screen px-6 pb-6 pt-28">
        {children}
      </main>
    </div>
  </div>
);
}