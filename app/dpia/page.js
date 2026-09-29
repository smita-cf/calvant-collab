"use client";
// app/dpia/page.js
import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import DpiaDashboard from "@/modules/dpia/pages/DpiaDashboard";
import ModuleUpgradeGate from "@/modules/admin/components/shared/ModuleUpgradeGate";
import useModuleEntitlements from "@/modules/admin/hooks/useModuleEntitlements";
import { useFramework } from "@/context/FrameworkContex";

export default function DpiaRoute() {
  const { loading, dpia } = useModuleEntitlements();
  const { showDpia } = useFramework();
  const allowed = dpia || showDpia;

  return (
    <ProtectedPage>
      <ModuleUpgradeGate loading={loading} entitled={allowed} moduleName="DPIA">
        <FrameworkPage moduleKey="dpia">
          <DpiaDashboard />
        </FrameworkPage>
      </ModuleUpgradeGate>
    </ProtectedPage>
  );
}
