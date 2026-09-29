'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isRootUser, isAdminAuthenticated } from "./utils/adminAuth";

export default function AdminProtectedRoute({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // This runs only in the browser, never on the server
    if (!isAdminAuthenticated()) {
      router.replace("/login");
    } else if (!isRootUser()) {
      router.replace("/");
    } else {
      setChecked(true);
    }
  }, [router]);

  // Don't render children until auth check passes in browser
  if (!checked) return null;

  return children;
}
