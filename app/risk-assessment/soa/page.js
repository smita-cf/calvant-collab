"use client";

import RoleBasedPage from "@/components/RoleBasedPage";
import SoaPage from "@/modules/documentation/pages/SoaPage";

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
      <SoaPage />
    </RoleBasedPage>
  );
}
