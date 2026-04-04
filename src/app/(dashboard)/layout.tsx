import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ToastContainer } from "@/components/ui/toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <DashboardShell user={session.user}>{children}</DashboardShell>
      <ToastContainer />
    </>
  );
}
