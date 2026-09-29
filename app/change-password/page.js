// "use client";

// import dynamic from 'next/dynamic';
// import { useRouter, useSearchParams } from 'next/navigation';

// const ChangePasswordModal = dynamic(() => import('@/modules/dashboard/ChangePasswordModal'), { ssr: false });

// export default function ChangePassword() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   // loginPage.js sends users here (after a forced password change) with
//   // ?redirect=<original destination>; falls back to "/" for anyone landing
//   // on this route directly from the dashboard.
//   const redirectTo = searchParams.get("redirect") || "/";

//   // ChangePasswordModal calls onClose() on success, Escape, and backdrop
//   // click — it must always receive one or it throws.
//   const handleClose = () => {
//     router.replace(redirectTo);
//   };

//   return <ChangePasswordModal onClose={handleClose} />;
// }


"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';

const ChangePasswordModal = dynamic(() => import('@/modules/dashboard/ChangePasswordModal'), { ssr: false });

// 1. Separate component containing useSearchParams
function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // loginPage.js sends users here (after a forced password change) with
  // ?redirect=<original destination>; falls back to "/" for anyone landing
  // on this route directly from the dashboard.
  const redirectTo = searchParams.get("redirect") || "/";

  // ChangePasswordModal calls onClose() on success, Escape, and backdrop
  // click — it must always receive one or it throws.
  const handleClose = () => {
    router.replace(redirectTo);
  };

  return <ChangePasswordModal onClose={handleClose} />;
}

// 2. Main page export wrapped in a Suspense boundary
export default function ChangePassword() {
  return (
    <Suspense fallback={null}>
      <ChangePasswordContent />
    </Suspense>
  );
}