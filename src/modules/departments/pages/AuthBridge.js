"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";

const AuthBridge = () => {
  const router = useRouter();
  const { login } = useSession();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (token && userParam) {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", userParam);
      
      // Tell the security guard (SessionProvider) instantly that we are logged in!
      if (login) login();

      const emailParam = params.get("email");
      if (emailParam) sessionStorage.setItem("email", emailParam);

      // Where to land once the session is set up. Falls back to the
      // dashboard when no redirect was passed (e.g. the original
      // cross-subdomain login flow before this param existed).
      const redirectTo = params.get("redirect") || "/";

      try {
        const userObj = JSON.parse(userParam);
        const email = emailParam || userObj.email || "unknown@example.com";
        const name = userObj.name || email;
        if (userObj.name) sessionStorage.setItem("uname", userObj.name);

        import('../../../services/activities').then(({ captureActivity }) =>
          captureActivity({
            action: 'LOGIN',
            name: name,
            email: email,
            url: "/auth-bridge",
            item: [{ role: userObj.role || "USER" }]
          })
        );
      } catch (err) {
        console.warn('Login log failed in bridge:', err);
      }

      // Give React a tiny amount of time to update the SessionContext
      // state before we navigate away, preventing the ProtectedPage
      // from catching a 'false' authentication state.
      setTimeout(() => {
        window.history.replaceState({}, document.title, redirectTo);
        router.replace(redirectTo);
      }, 100);
    } else {
      router.replace("/login");
    }
  }, []); // ✅ Fixed: removed `history` from deps, should be empty array

  return <div>Redirecting...</div>;
};

export default AuthBridge;