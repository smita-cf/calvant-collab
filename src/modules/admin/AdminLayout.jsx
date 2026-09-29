//cf-tool-frontend-main\src\modules\admin\AdminLayout.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Rocket } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Upload,
  Building2,
  ShieldCheck,
  PlusCircle,
  List,
  Lock,
  UserCheck,
  Truck,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Search,
  FileText,
  Landmark,
  Network,
  CheckCircle2,
} from "lucide-react";
import { Plug } from "lucide-react";
import { CreditCard } from "lucide-react";
import useModuleEntitlements from "./hooks/useModuleEntitlements";

// ── Nav Config ────────────────────────────────────────────────────────────────

const SUPER_ADMIN_ONLY_GROUPS = new Set([
  "frameworks",
  "gap",
  "seo",
  "sampledocs",
]);

const NAV_BASE = [
  { label: "Onboarding", icon: Rocket, path: "/admin/onboarding" },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    exact: true,
  },
  { label: "Subscription", icon: CreditCard, path: "/admin/subscription" },
  {
    label: "Users",
    icon: Users,
    group: "users",
    children: [
      { label: "User List", icon: List, path: "/admin/users" },
      { label: "Create User", icon: UserPlus, path: "/admin/users/create" },
      // { label: "Bulk Upload", icon: Upload, path: "/admin/users/bulk" },
      // { label: "Assign Orgs", icon: Network, path: "/admin/users/assign-orgs" },
    ],
  },
  {
    label: "Departments",
    icon: Building2,
    group: "departments",
    children: [
      { label: "Dept List", icon: List, path: "/admin/departments" },
      {
        label: "Create Dept",
        icon: PlusCircle,
        path: "/admin/departments/create",
      },
    ],
  },
  {
    label: "Risks",
    icon: ShieldCheck,
    group: "risks",
    children: [
      // { label: "Risk List",   icon: List,       path: "/admin/risks" },

      // { label: "Add Risk",    icon: PlusCircle, path: "/admin/risks/add" },
      { label: "Bulk Upload", icon: Upload, path: "/admin/risks/bulk" },
    ],
  },
  { label: "Trust Centre", icon: Lock, path: "/admin/trust-centre" },
  {
    label: "Control Ownership",
    icon: UserCheck,
    path: "/admin/control-ownership",
  },

  {
    label: "Vendors",
    icon: Truck,
    group: "vendors",
    children: [
      { label: "Vendor List", icon: List, path: "/admin/vendors" },
      { label: "Add Vendor", icon: PlusCircle, path: "/admin/vendors/create" },
    ],
  },
  {
    label: "Frameworks",
    icon: BookOpen,
    group: "frameworks",
    children: [
      {
        label: "Create Framework",
        icon: PlusCircle,
        path: "/admin/frameworks/create",
      },
      {
        label: "Upload Controls",
        icon: Upload,
        path: "/admin/frameworks/upload",
      },
      {
        label: "Controls Library",
        icon: List,
        path: "/admin/frameworks/control-library",
      },
      {
        label: "Control Mappings",
        icon: List,
        path: "/admin/frameworks/control-mappings",
      },
      { label: "Framework Pages", icon: FileText, path: "/admin/frameworks" },
    ],
  },
  {
    label: "Gap Questions",
    icon: HelpCircle,
    group: "gap",
    children: [
      { label: "Gap List", icon: List, path: "/admin/gap-questions" },
      { label: "Add Gap", icon: PlusCircle, path: "/admin/gap-questions/add" },
      { label: "Bulk Upload", icon: Upload, path: "/admin/gap-questions/bulk" },
    ],
  },
  {
    label: "SEO Forms",
    icon: Search,
    group: "seo",
    children: [
      { label: "SEO List", icon: List, path: "/admin/seo" },
      { label: "Add SEO", icon: PlusCircle, path: "/admin/seo/add" },
    ],
  },
  {
    label: "Sample Docs",
    icon: FileText,
    group: "sampledocs",
    children: [
      { label: "Doc List", icon: List, path: "/admin/sample-docs" },
      { label: "Add Doc", icon: PlusCircle, path: "/admin/sample-docs/add" },
      {
        label: "Bulk Upload",
        icon: Upload,
        path: "/admin/sample-docs/bulk-policy",
      },
    ],
  },
  { label: "Activity Logs", icon: Activity, path: "/admin/logs" },
  { label: "Integrations", icon: Plug, path: "/admin/integrations" },
];

const ORG_ITEM = {
  label: "Organizations",
  icon: Landmark,
  group: "organizations",
  children: [
    { label: "Org List", icon: List, path: "/admin/organization" },
    {
      label: "Create Org",
      icon: PlusCircle,
      path: "/admin/organization/create",
    },
    {
      label: "Approvals",
      icon: CheckCircle2,
      path: "/admin/organization/approvals",
    },
  ],
};

const SIDEBAR_W = 230;
const COLLAPSED_W = 100;

// ── Layout ────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // ── ALL hooks must be declared unconditionally at the top ─────────────────
  const [mounted, setMounted] = useState(false);
  const [canAccess, setCanAccess] = useState(false);
  const [isPartnerRoot, setIsPartnerRoot] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    users: true,
    departments: false,
    organizations: false,
    risks: false,
    vendors: false,
    frameworks: false,
    gap: false,
    seo: false,
    sampledocs: false,
  });
  const { loading: entLoading, vendor: vendorEntitled } =
    useModuleEntitlements();

  // ── Auth check runs once after mount (client-side only) ───────────────────
  useEffect(() => {
    try {
      const token = sessionStorage.getItem("token");
      const decoded = token ? jwtDecode(token) : null;
      const roles = Array.isArray(decoded?.role)
        ? decoded.role
        : [decoded?.role].filter(Boolean);
      const role0 = roles[0];

      const can = roles.some((r) => r === "root" || r === "super_admin");
      const partnerRoot =
        role0 === "root" && sessionStorage.getItem("isPartnerOrg") === "true";
      const superAdmin = role0 === "super_admin";

      setCanAccess(can);
      setIsPartnerRoot(partnerRoot);
      setIsSuperAdmin(superAdmin);

      if (!can) router.replace("/");
    } catch {
      router.replace("/");
    } finally {
      setMounted(true);
    }
  }, [router]);

  // ── Vendor entitlement guard (redirects if accessing vendors without purchase)
  useEffect(() => {
    if (!mounted || !canAccess || entLoading) return;
    if (pathname?.startsWith("/admin/vendors") && !vendorEntitled) {
      router.replace("/404");
    }
  }, [mounted, canAccess, entLoading, vendorEntitled, pathname, router]);

  // ── Derived nav (computed from state, not hooks) ──────────────────────────
  const NAV = (
    isPartnerRoot
      ? [
          ...NAV_BASE.slice(
            0,
            NAV_BASE.findIndex((i) => i.group === "departments") + 1,
          ),
          ORG_ITEM,
          ...NAV_BASE.slice(
            NAV_BASE.findIndex((i) => i.group === "departments") + 1,
          ),
        ]
      : NAV_BASE
  ).filter((item) => {
    if (item.group === "vendors" && !entLoading && !vendorEntitled)
      return false;
    return (
      !item.group || !SUPER_ADMIN_ONLY_GROUPS.has(item.group) || isSuperAdmin
    );
  });

  const isActive = (path, exact = false) =>
    exact
      ? pathname === path
      : pathname === path || pathname.startsWith(path + "/");

  const isGroupActive = (children) => children.some((c) => isActive(c.path));

  const toggleGroup = (group) =>
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));

  const sidebarWidth = collapsed ? COLLAPSED_W : SIDEBAR_W;

  // ── Guard: render nothing until mounted and access confirmed ──────────────
  if (!mounted || !canAccess) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        style={{ width: sidebarWidth, transition: "width 0.25s ease" }}
        className="fixed top-0 left-0 h-full bg-white border-r border-gray-100 shadow-sm flex flex-col z-[1002] overflow-hidden"
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <ShieldCheck size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">
                Admin Panel
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors ml-auto"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {NAV.map((item) => {
            if (item.children) {
              const active = isGroupActive(item.children);
              const open = openGroups[item.group];
              const isOrgItem = item.group === "organizations";

              return (
                <div key={item.group}>
                  {isOrgItem && !collapsed && (
                    <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                      <div className="flex-1 h-px bg-indigo-100" />
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider whitespace-nowrap">
                        Partner
                      </span>
                      <div className="flex-1 h-px bg-indigo-100" />
                    </div>
                  )}
                  <button
                    onClick={() => (collapsed ? null : toggleGroup(item.group))}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all duration-150 ${
                      active
                        ? isOrgItem
                          ? "bg-purple-50 text-purple-700"
                          : "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    style={{
                      justifyContent: collapsed ? "center" : "flex-start",
                    }}
                  >
                    <item.icon size={17} className="flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {open ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </>
                    )}
                  </button>

                  {!collapsed && open && (
                    <div
                      className={`ml-4 pl-3 border-l-2 mb-1 ${isOrgItem ? "border-purple-100" : "border-indigo-100"}`}
                    >
                      {item.children.map((child) => (
                        <button
                          key={child.path}
                          onClick={() => router.push(child.path)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all duration-150 ${
                            isActive(child.path)
                              ? isOrgItem
                                ? "bg-purple-100 text-purple-700 font-semibold"
                                : "bg-indigo-100 text-indigo-700 font-semibold"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium"
                          }`}
                        >
                          <child.icon size={15} className="flex-shrink-0" />
                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(item.path, item.exact);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                style={{ justifyContent: collapsed ? "center" : "flex-start" }}
              >
                <item.icon size={17} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 py-3 px-2 space-y-1">
          <button
            onClick={() => router.push("/")}
            title={collapsed ? "Back to CalVant" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <ArrowLeft size={17} className="flex-shrink-0" />
            {!collapsed && <span>Back to CalVant</span>}
          </button>
          <button
            onClick={() => {
              sessionStorage.clear();
              router.push("/login");
            }}
            title={collapsed ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <LogOut size={17} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.25s ease",
          minHeight: "100vh",
          width: `calc(100% - ${sidebarWidth}px)`,
        }}
        className="flex flex-col"
      >
        <div className="flex-1 p-6 overflow-auto admin-content-container">
          {children}
        </div>
      </main>
    </div>
  );
}
