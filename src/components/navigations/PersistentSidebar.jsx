//C:\Users\ak192\Downloads\CalVant-Next-master (3)\CalVant-Next-master\src\components\navigations\PersistentSidebar.jsx

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isStrictAuditor } from "../../utils/roleUtils";
import { jwtDecode } from "jwt-decode";
import {
  Home,
  FolderKanban,
  FileText,
  ClipboardCheck,
  CheckSquare,
  CloudDownload,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  Brain,
  UserCheck2,
  Settings,
} from "lucide-react";
import UserProfile from "./UserProfile";
import Maindashboard_profile from "../maindashboard_profile";
import HelpNavPanel from "../shared/HelpNavPanel";
import { useUI } from "../../context/UIContext";
import {
  useLayout,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
} from "../../context/LayoutContext";
import DualLogo from "../DualLogo";
import { useSession } from "../../context/SessionContext";
import { useFramework } from "../../context/FrameworkContex";
import { Report } from "@material-ui/icons";
import useModuleEntitlements from "../../modules/admin/hooks/useModuleEntitlements";
import { isNoSidebarRoute } from "../../utils/layoutRoutes";

/* ─────────────────────────────────────────────
   Custom hook for media query
───────────────────────────────────────────── */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
};

/** Returns the fixed navbar height so page content can be offset correctly */
export const useNavbarHeight = () => {
  const isLg = useMediaQuery("(min-width: 1024px)");
  return isLg ? 72 : 64;
};

/* ─────────────────────────────────────────────
   Role helper — reads JWT from sessionStorage.
   Safe to call only on the client (inside useEffect).
───────────────────────────────────────────── */
function getUserRoles() {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return [];
    const decoded = jwtDecode(token);
    return Array.isArray(decoded?.role)
      ? decoded.role
      : [decoded?.role].filter(Boolean);
  } catch {
    return [];
  }
}

/* ─────────────────────────────────────────────
   Nav link definitions
───────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    icon: Home,
    label: "Home",
    path: "/",
    expandable: false,
  },
  {
    icon: FolderKanban,
    label: "Risks",
    path: "/risk-assessment/",
    quickActions: [
      { label: "   Create Risk", path: "/risk-assessment/add" },
      { label: "   My Risks", path: "/risk-assessment/saved" },
      { label: "   Templates", path: "/risk-assessment/templates" },
    ],
    expandable: true,
  },
  {
    icon: FileText,
    label: "Policies",
    path: "/documentation",
    quickActions: [
      { label: "   MLD", path: "/documentation/mld" },
      { label: "   View Policy", path: "/documentation/view" },
      { label: "   Upload Policy", path: "/documentation/upload" },
    ],
    expandable: true,
  },
  {
    icon: ClipboardCheck,
    label: "Audits",
    path: "/gap-assessment",
    quickActions: [
      { label: "   New Audit", path: "/gap-assessment/new" },
      { label: "   Results", path: "/gap-assessment/history" },
    ],
    expandable: true,
  },
  {
    icon: CheckSquare,
    label: "Tasks",
    path: "/task-management",
    quickActions: [
      { label: "   Manage Task", path: "/task-management/tasks" },
      { label: "   My Tasks", path: "/task-management/departmenttasks" },
    ],
    expandable: true,
  },
  {
    icon: CloudDownload,
    label: "Compliances",
    path: "/compliances",
    quickActions: [
      { label: "   Detailed View", path: "/compliances/detailed" },
      { label: "   Reports", path: "/compliances/reports" },
    ],
    expandable: true,
  },
  {
    icon: UserCheck2,
    label: "Vendors",
    path: "/tprm",
    expandable: true,
    moduleKey: "vendor",
  },
  {
    icon: Shield,
    label: "DPIA",
    path: "/dpia",
    expandable: true,
    moduleKey: "dpia",
  },
  {
    icon: Brain,
    label: "AI IA",
    path: "/aiia",
    expandable: true,
    moduleKey: "aiia",
  },
  {
    icon: Report,
    label: "Reports",
    path: "/reports",
    expandable: false,
    moduleKey: "",
  },
  {
    // ── Admin Panel entry point — root & super_admin only ──
    icon: Settings,
    label: "Admin Panel",
    path: "/admin",
    expandable: false,
    // 🔒 Only users with these roles will see this item
    roles: ["root", "super_admin"],
    isAdminEntry: true,
  },
];

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const PersistentSidebar = () => {
  const {
    sidebarExpanded,
    toggleSidebar,
    expandSidebar,
    collapseSidebar,
    setMobileView,
  } = useLayout();
  const { loading: entLoading, dpia, aiia, vendor } = useModuleEntitlements();
  const { showDpia, showAiia, frameworksLoading } = useFramework();
  const { helpNavOpen, closeHelpNav } = useUI();
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🔒 User roles — populated client-side only to avoid SSR/hydration issues
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    setMounted(true);
    // Read roles from JWT once on mount (client-side only)
    setUserRoles(getUserRoles());
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const [expandedModules, setExpandedModules] = useState([]);

  const isMobileScreen = useMediaQuery("(max-width: 1023px)");

  const { isAuthenticated } = useSession();
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (isAuthenticated) {
      const rawUser = sessionStorage.getItem("user");
      if (rawUser) setUser(JSON.parse(rawUser));
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setMobileView(isMobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMobileView]);

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/login");
  };

  const handleBackdropClick = () => {
    if (isMobileScreen && sidebarExpanded) {
      toggleSidebar();
    }
  };

  const toggleModule = (path) => {
    setExpandedModules((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const isExpanded = sidebarExpanded || (!isMobileScreen && isHovered);
  const hideSidebar = isNoSidebarRoute(pathname);

  /* ─────────────────────────────────────────────
     🔒 Role-based nav filter
     Hides any item that has a `roles` array unless
     the current user has at least one matching role.
  ───────────────────────────────────────────── */
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    // If strict auditor, only allow specific modules
    if (mounted && isStrictAuditor({ role: userRoles })) {
      const allowedForAuditors = ["Home", "Audits", "Tasks", "Compliances"];
      if (!allowedForAuditors.includes(item.label)) {
        return false;
      }
    }

    // Vendors has no framework-mandated fallback — purely a paid add-on.
    if (item.moduleKey === "vendor") {
      if (entLoading) return false;
      if (!vendor) return false;
    }

    // DPIA/AI IA show either because the module was bought directly, or
    // because a currently-selected framework mandates it (see the
    // Risk/DPIA/AI IA applicability table — e.g. ISO 27701 mandates DPIA).
    // Both sources must finish loading before we can safely hide the item,
    // otherwise a framework-only org would see it flash and disappear.
    if (item.moduleKey === "dpia" || item.moduleKey === "aiia") {
      if (entLoading || frameworksLoading) return false;

      if (item.moduleKey === "dpia" && !(dpia || showDpia)) return false;
      if (item.moduleKey === "aiia" && !(aiia || showAiia)) return false;
    }

    if (item.roles?.length) {
      if (!mounted) return false;
      return item.roles.some((r) => userRoles.includes(r));
    }

    return true;
  });

  return (
    <>
      {/* ── Mobile Backdrop Overlay ── */}
      {!hideSidebar && isMobileScreen && sidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-[998] lg:hidden"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* ── Fixed Top Navbar ── */}
      <header
        className="
          fixed top-0 left-0 right-0 z-[1001]
          h-14 sm:h-16 md:h-16 lg:h-[72px]
          bg-white/95 backdrop-blur-xl
          shadow-[0_4px_16px_rgba(0,0,0,0.06)]
          flex items-center justify-between
          px-3 sm:px-5 md:px-8 lg:px-10
          transition-all duration-300
        "
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {!hideSidebar && (
            <button
              onClick={toggleSidebar}
              aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
              className="relative z-[9999] flex items-center justify-center
              w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
              rounded-xl sm:rounded-[11px] md:rounded-[13px]
              bg-gradient-to-br from-[#667eea] to-[#764ba2]
              shadow-[0_6px_20px_rgba(102,126,234,0.35)]
              text-white transition-all duration-300
              hover:scale-105 active:scale-95"
            >
              {isExpanded ? (
                <ChevronLeft
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5"
                />
              ) : (
                <Menu
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5"
                />
              )}
            </button>
          )}

          <div onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
            <DualLogo calvantSrc="/image.png" height="36px" />
          </div>
        </div>

        {user && (
          <div className="flex-shrink-0">
            {isHomePage ? (
              <Maindashboard_profile user={user} />
            ) : (
              <UserProfile user={user} handleLogout={handleLogout} />
            )}
          </div>
        )}
      </header>

      {/* ── Persistent Sidebar ── */}
      {!hideSidebar && (
        <nav
          aria-label="Main navigation"
          onMouseEnter={() =>
            mounted && !sidebarExpanded && !isMobileScreen && setIsHovered(true)
          }
          onMouseLeave={() => setIsHovered(false)}
          className={`
          fixed top-0 left-0 z-[999]
          h-full
          bg-white
          shadow-[4px_0_24px_rgba(0,0,0,0.08)]
          flex flex-col
          overflow-hidden
          ${mounted ? "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" : ""}
          border-r border-gray-100
        `}
          style={{
            width: isExpanded
              ? isMobileScreen
                ? Math.min(280, window.innerWidth * 0.75)
                : SIDEBAR_EXPANDED_WIDTH
              : isMobileScreen
                ? 0
                : SIDEBAR_COLLAPSED_WIDTH,
            transform: isMobileScreen ? "translate-x-0" : undefined,
          }}
        >
          {/* Sidebar header */}
          <div className="flex items-center px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
            <div onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
              <DualLogo calvantSrc="/image.png" height="34px" dark={true} />
            </div>
          </div>

          {/* Nav items — uses visibleNavItems (role-filtered) */}
          <div className="flex flex-col flex-1 pt-3 sm:pt-3 pb-3 overflow-y-auto overflow-x-hidden">
            {visibleNavItems.map(
              ({
                icon: Icon,
                label,
                path,
                expandable,
                quickActions,
                isAdminEntry,
              }) => {
                const isActive =
                  pathname === path ||
                  (path !== "/*" && pathname.startsWith(path));

                const isModuleExpanded = expandedModules.includes(path);

                const handleMainClick = () => {
                  if (expandable) {
                    toggleModule(path);
                    handleNavigation(path);
                  } else {
                    handleNavigation(path);
                  }
                };

                // ── Admin Panel entry — rendered with accent divider ──
                if (isAdminEntry) {
                  return (
                    <div key={path}>
                      <div className="mx-3 my-2 border-t border-gray-100" />
                      <SidebarNavItem
                        icon={
                          <Icon
                            size={18}
                            className="sm:w-[20px] sm:h-[20px] md:w-5 md:h-5 flex-shrink-0 text-indigo-500"
                          />
                        }
                        label={label}
                        active={isActive}
                        onClick={handleMainClick}
                        isExpanded={isExpanded}
                        hasDropdown={false}
                        isModuleExpanded={false}
                      />
                    </div>
                  );
                }

                return (
                  <div key={path} className="mb-0.5">
                    <SidebarNavItem
                      icon={
                        <Icon
                          size={18}
                          className="sm:w-[20px] sm:h-[20px] md:w-5 md:h-5 flex-shrink-0"
                        />
                      }
                      label={label}
                      active={isActive}
                      onClick={handleMainClick}
                      isExpanded={isExpanded}
                      hasDropdown={
                        expandable && quickActions && quickActions.length > 0
                      }
                      isModuleExpanded={isModuleExpanded}
                    />

                    {expandable && quickActions && (
                      <div
                        className={`
                        grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${
                          isModuleExpanded && isExpanded
                            ? "grid-rows-[1fr] opacity-100 mt-1 mb-2"
                            : "grid-rows-[0fr] opacity-0 mt-0 mb-0 pointer-events-none"
                        }
                      `}
                      >
                        <div className="overflow-hidden flex flex-col px-3">
                          <div className="pl-6 border-l-2 border-slate-100 ml-5 flex flex-col gap-1 py-1">
                            {quickActions.map((action) => {
                              const isSubActive = pathname === action.path;
                              return (
                                <button
                                  key={action.path}
                                  onClick={() => handleNavigation(action.path)}
                                  className={`
                                  w-full text-left
                                  px-3 py-2
                                  text-[13px] sm:text-sm
                                  rounded-lg
                                  transition-all duration-200 ease-out
                                  flex items-center group/sub
                                  ${
                                    isSubActive
                                      ? "text-[#007bff] font-semibold bg-blue-50/80 shadow-sm shadow-blue-500/5 border border-blue-100/50"
                                      : "text-slate-500 hover:text-[#007bff] hover:bg-slate-50 border border-transparent"
                                  }
                                `}
                                >
                                  <span
                                    className={`
                                    transition-transform duration-200
                                    ${isSubActive ? "translate-x-1" : "group-hover/sub:translate-x-1"}
                                  `}
                                  >
                                    {action.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>

          {/* User info + logout */}
          {user && (
            <div className="flex-shrink-0 px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/60">
              <div
                className={`flex items-center gap-3 ${isExpanded ? "" : "justify-center"}`}
              >
                <div
                  className="
                  w-9 h-9 sm:w-10 sm:h-10
                  rounded-[12px]
                  bg-gradient-to-br from-[#667eea] to-[#764ba2]
                  shadow-[0_4px_12px_rgba(102,126,234,0.3)]
                  flex items-center justify-center
                  text-white font-bold
                  text-sm sm:text-base
                  flex-shrink-0
                  transition-transform duration-300 hover:scale-105
                "
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div
                  className={`
                  overflow-hidden transition-all duration-300
                  ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
                `}
                >
                  <p className="text-[#007bff] font-semibold text-xs sm:text-sm md:text-[15px] leading-snug truncate">
                    {user.name}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {user.department?.name ?? user.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className={`
                flex items-center gap-2 w-full mt-3
                px-3 sm:px-4 md:px-5 py-2
                text-xs sm:text-sm font-semibold
                text-white bg-[#e74c3c]
                rounded-lg sm:rounded-xl
                shadow-[0_3px_10px_rgba(231,76,60,0.35)]
                transition-all duration-200
                hover:bg-[#c0392b] hover:shadow-[0_4px_14px_rgba(192,57,43,0.45)]
                active:scale-95 justify-center
                ${isExpanded ? "opacity-100" : "opacity-0 mt-0 h-0 p-0 overflow-hidden"}
              `}
                style={{
                  opacity: isExpanded ? 1 : 0,
                  pointerEvents: isExpanded ? "auto" : "none",
                  marginTop: isExpanded ? "12px" : "0",
                  padding: isExpanded ? "8px 16px" : "0",
                  height: isExpanded ? "auto" : "0",
                }}
              >
                <LogOut size={14} className="sm:w-4 sm:h-4" />
                Logout
              </button>
            </div>
          )}
        </nav>
      )}

      <HelpNavPanel open={helpNavOpen} onClose={closeHelpNav} />
    </>
  );
};

/* ─────────────────────────────────────────────
   Sidebar nav item //this is done by Arghya
───────────────────────────────────────────── */
const SidebarNavItem = ({
  icon,
  label,
  active,
  onClick,
  isExpanded,
  hasDropdown,
  isModuleExpanded,
}) => (
  <button
    onClick={onClick}
    className={`
      w-full text-left flex items-center
      px-3 sm:px-3 md:px-4 py-2.5 sm:py-3
      mx-2 mb-1 w-[calc(100%-16px)]
      rounded-xl
      text-sm sm:text-[14px] md:text-[15px] font-medium
      transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
      group relative overflow-hidden
      ${
        active
          ? "bg-blue-50/80 text-[#007bff] shadow-[0_2px_10px_rgba(0,123,255,0.08)] border border-blue-100/30"
          : "text-slate-600 hover:bg-slate-50 border border-transparent hover:text-[#007bff]"
      }
    `}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#007bff] rounded-r-full shadow-[0_0_8px_rgba(0,123,255,0.5)]" />
    )}
    <span
      className={`
        transition-all duration-300 ease-out flex-shrink-0 ml-1 relative z-10
        ${active ? "text-[#007bff]" : "text-slate-400 group-hover:text-[#667eea] group-hover:scale-110 group-active:scale-95"}
      `}
    >
      {icon}
    </span>
    <span
      className={`
        ml-3 whitespace-nowrap overflow-hidden relative z-10
        transition-all duration-300 ease-in-out
        ${isExpanded ? "opacity-100 w-auto translate-x-0" : "opacity-0 w-0 -translate-x-2"}
        flex-1
      `}
    >
      {label}
    </span>
    {hasDropdown && isExpanded && (
      <ChevronRight
        size={14}
        className={`
          flex-shrink-0 text-slate-400 transition-transform duration-300
          ease-[cubic-bezier(0.4,0,0.2,1)] ml-2
          ${isModuleExpanded ? "rotate-90 text-[#007bff]" : "group-hover:text-slate-600"}
        `}
      />
    )}
  </button>
);

/* ─────────────────────────────────────────────
   Mobile MenuItem (kept for backward compat)
───────────────────────────────────────────── */
export const MenuItem = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="
      w-full text-left flex items-center
      px-4 sm:px-5 py-3.5 sm:py-4
      mb-1.5 sm:mb-2
      bg-white/70 rounded-xl sm:rounded-2xl
      border border-transparent
      text-[#1e293b] font-medium
      text-sm sm:text-[15px]
      transition-all duration-300
      hover:bg-[rgba(102,126,234,0.1)]
      hover:translate-x-2
      hover:border-[rgba(102,126,234,0.3)]
      hover:shadow-[0_4px_20px_rgba(102,126,234,0.15)]
      group
    "
  >
    <span className="mr-3 sm:mr-4 text-[#667eea] min-w-[18px] sm:min-w-[20px] flex items-center">
      {icon}
    </span>
    {label}
  </button>
);

export default PersistentSidebar;
