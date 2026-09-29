"use client";

import { useSession } from "@/context/SessionContext";
import Dashboard from "@/modules/dashboard/Dashboard";
import DashboardLoggedIn from "@/modules/dashboard/DashboardLoggedIn";

export default function HomePageClient() {
  const { isAuthenticated } = useSession();

  // ✅ Show guest Dashboard during SSR and while auth resolves
  // Dashboard.jsx guards all sessionStorage inside useEffect — safe to SSR
  if (isAuthenticated === null) return <Dashboard />;
  if (!isAuthenticated) return <Dashboard />;
  return <DashboardLoggedIn />;
}