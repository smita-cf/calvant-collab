"use client";

import ProtectedPage from "@/components/ProtectedPage";
import FrameworkPage from "@/components/FrameworkPage";
import AiiaDashboard from "@/modules/aiia/pages/AiiaDashboard";
import ModuleUpgradeGate from "@/modules/admin/components/shared/ModuleUpgradeGate";
import useModuleEntitlements from "@/modules/admin/hooks/useModuleEntitlements";
import { useFramework } from "@/context/FrameworkContex";

export default function Page() {
  const { loading, aiia } = useModuleEntitlements();
  const { showAiia } = useFramework();
  const allowed = aiia || showAiia;

  return (
    <ProtectedPage>
      <ModuleUpgradeGate loading={loading} entitled={allowed} moduleName="AI Impact Assessment">
        <FrameworkPage moduleKey="aiia">
          <AiiaDashboard />
        </FrameworkPage>
      </ModuleUpgradeGate>
    </ProtectedPage>
  );
}
