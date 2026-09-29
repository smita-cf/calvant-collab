"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useModuleEntitlements from "@/modules/admin/hooks/useModuleEntitlements";
import { useFramework } from "@/context/FrameworkContex";

/**
 * Route guard for DPIA / AI IA pages.
 * Gates access if EITHER subscription entitlement OR framework selection allows it.
 */
export default function FrameworkPage({ children, moduleKey }) {
  const { loading, dpia, aiia } = useModuleEntitlements();
  const { showDpia, showAiia } = useFramework();
  const router = useRouter();

  const allowed = moduleKey === "dpia" ? (dpia || showDpia) : (aiia || showAiia);

  useEffect(() => {
    // Only redirect once entitlements have finished loading AND the
    // module is explicitly not entitled.
    if (!loading && allowed === false) {
      router.replace("/");
    }
  }, [allowed, loading, router]);

  // While loading entitlements, don't render children OR redirect.
  if (loading) return null;

  // If not allowed, don't render children (the useEffect will handle the redirect).
  if (!allowed) return null;

  return children;
}
