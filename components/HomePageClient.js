"use client";

import { useSession } from "@/context/SessionContext";
import Dashboard from "@/modules/dashboard/Dashboard";
import DashboardLoggedIn from "@/modules/dashboard/DashboardLoggedIn";

export default function HomePageClient() {
  const { isAuthenticated } = useSession();

  if (isAuthenticated === null) return null;
  if (!isAuthenticated) return <Dashboard />;
  return <DashboardLoggedIn />;
}