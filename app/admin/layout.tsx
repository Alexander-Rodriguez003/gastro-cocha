import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Redirect if not admin
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
      <AdminSidebar userName={session.name} />
      <div style={{ flex: 1, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
