"use client";

import RoleBasedPage from "@/components/RoleBasedPage";
import SavedRisksPage from "@/modules/riskAssesment/pages/SavedRisksPage";

const allowedRoles = [
  "risk_owner",
  "risk_identifier",
  "risk_manager",
  "super_admin",
  "root",
  "dpo",
  "ciso",
  "aio",
];

export default function Page() {
  return (
    <RoleBasedPage allowedRoles={allowedRoles}>
      <SavedRisksPage />
    </RoleBasedPage>
  );
}
