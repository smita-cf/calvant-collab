"use client";

import ProtectedPage from "@/components/ProtectedPage";
import MyTasks from "@/modules/riskAssesment/pages/MyTasks";
export default function Page() {
  return (
    <ProtectedPage>
      <MyTasks />
    </ProtectedPage>
  );
}
