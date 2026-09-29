// Routes that keep the fixed top navbar but hide the persistent left sidebar
// (and the content margin it normally reserves). Used by both
// PersistentSidebar and MainContentWrapper so the two stay in sync.
export const NO_SIDEBAR_ROUTES = ["/support-centre", "/help-center"];

export const isNoSidebarRoute = (pathname) =>
  NO_SIDEBAR_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
