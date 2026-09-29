//cf-tool-frontend-main\src\components\MainContentWrapper.jsx

"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { usePathname } from "next/navigation";
import { useLayout } from "@/context/LayoutContext";
import { isNoSidebarRoute } from "@/utils/layoutRoutes";
import { isStrictAuditor, isAuditorAllowedPath } from "@/utils/roleUtils";
import AuditorAccessRestricted from "@/components/AuditorAccessRestricted";

export default function MainContentWrapper({ children }) {
  const { isAuthenticated, user } = useSession();
  const pathname = usePathname();
  const { isMobile, sidebarWidth } = useLayout();
  const [mounted, setMounted] = useState(false);
  const hideSidebar = isNoSidebarRoute(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/auth-bridge",
  ];
  const isAuthPage = authRoutes.includes(pathname);

  const isAdminPage = pathname?.startsWith("/admin");

  if (!isAuthenticated || isAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  // Next.js App Router Auditor Restriction Guard (Checked immediately on frame 1)
  const isAuditorRestricted = isStrictAuditor(user) && !isAuditorAllowedPath(pathname);

  if (isAuditorRestricted) {
    return (
      <div
        style={{
          marginLeft: isMobile || hideSidebar ? 0 : sidebarWidth,
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className="pt-14 sm:pt-16 lg:pt-[72px] min-h-screen bg-[#050816]"
      >
        <AuditorAccessRestricted />
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="pt-14 sm:pt-16 lg:pt-[72px] min-h-screen bg-[#050816]" />
    );
  }

  return (
    <div
      style={{
        marginLeft: isMobile || hideSidebar ? 0 : sidebarWidth,
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className="pt-14 sm:pt-16 lg:pt-[72px] min-h-screen"
    >
      {children}
    </div>
  );
}
