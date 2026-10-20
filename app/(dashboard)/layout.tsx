
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Sidebar />
      <Navbar />

      <main className="ml-64 min-h-screen pt-20">
        <div className="p-5 sm:p-8 lg:p-9">
          {children}
        </div>
      </main>
    </div>
  );
}
