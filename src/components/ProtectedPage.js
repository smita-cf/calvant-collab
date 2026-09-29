// "use client";
// import { useSession } from "@/context/SessionContext";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function ProtectedPage({ children }) {
//   const { isAuthenticated } = useSession();
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (isAuthenticated === false) {
//       router.replace("/login");
//     }
//   }, [isAuthenticated]);

//   // Before client mount — render same empty shell as server
//   if (!mounted) {
//     return (
//       <div className="min-h-screen bg-slate-50" />
//     );
//   }

//   // After mount, session still checking
//   if (isAuthenticated === null) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm text-slate-400 font-medium">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isAuthenticated === false) return null;

//   return children;
// }

"use client";
import { useSession } from "@/context/SessionContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ProtectedPageInner({ children }) {
  const { isAuthenticated } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      // Capture where the user was trying to go (path + any query string)
      // so loginPage can send them back here after a successful login.
      const query = searchParams.toString();
      const fullPath = query ? `${pathname}?${query}` : pathname;
      router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
    }
  }, [isAuthenticated]);

  // Before client mount — render same empty shell as server
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50" />
    );
  }

  // After mount, session still checking
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) return null;

  return children;
}

export default function ProtectedPage({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ProtectedPageInner>{children}</ProtectedPageInner>
    </Suspense>
  );
}