// "use client";
// import { useSession } from "@/context/SessionContext";
// import { usePathname } from "next/navigation";
// import PersistentSidebar from "@/components/navigations/PersistentSidebar";

// export default function SidebarWrapper() {
//   const { isAuthenticated } = useSession();
//   const pathname = usePathname();

//   const authRoutes = ["/login", "/register", "/forgot-password", "/auth-bridge"];
//   const isAuthPage = authRoutes.includes(pathname);

//   if (!isAuthenticated || isAuthPage) return null;

//   return <PersistentSidebar />;
// }



"use client";
import { useSession } from "@/context/SessionContext";
import { usePathname } from "next/navigation";
import PersistentSidebar from "@/components/navigations/PersistentSidebar";

export default function SidebarWrapper() {
  const { isAuthenticated } = useSession();
  const pathname = usePathname();

  const authRoutes = ["/login", "/register", "/forgot-password", "/auth-bridge"];
  const isAuthPage = authRoutes.includes(pathname);
  const isAdminPage = pathname?.startsWith("/admin");

  if (!isAuthenticated || isAuthPage || isAdminPage) return null;

  return <PersistentSidebar />;
}