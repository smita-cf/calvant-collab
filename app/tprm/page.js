"use client";

import ProtectedPage from "@/components/ProtectedPage";
import TPRMSection from "@/modules/tprm/pages/TPRMSection";
import ModuleUpgradeGate from "@/modules/admin/components/shared/ModuleUpgradeGate";
import useModuleEntitlements from "@/modules/admin/hooks/useModuleEntitlements";

export default function Page() {
  const { loading, vendor } = useModuleEntitlements();
  return (
    <ProtectedPage>
      <ModuleUpgradeGate loading={loading} entitled={vendor} moduleName="Vendor Management">
        <TPRMSection />
      </ModuleUpgradeGate>
    </ProtectedPage>
  );
}
