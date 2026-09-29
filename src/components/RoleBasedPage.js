"use client";
import { useSession } from "@/context/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleBasedPage({ children, allowedRoles }) {
  const { user, isAuthenticated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
      return;
    }
    
    if (isAuthenticated === true && user) {
      const userRoles = Array.isArray(user?.role)
        ? user.role
        : user?.role
        ? [user.role]
        : [];

      if (!userRoles.some((role) => allowedRoles.includes(role))) {
        router.replace("/");
      }
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (isAuthenticated === null) return null;
  if (isAuthenticated === false) return null;

  if (user) {
    const userRoles = Array.isArray(user?.role)
      ? user.role
      : user?.role
      ? [user.role]
      : [];
    if (!userRoles.some((role) => allowedRoles.includes(role))) return null;
  }

  return <>{children}</>;
}
