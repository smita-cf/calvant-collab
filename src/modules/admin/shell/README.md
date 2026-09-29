# Partner Admin Shell

This folder contains the **standalone partner/root admin shell** — the full app frame
that runs when a `root` user whose organisation is a **partner org** (`isPartnerOrg === "true"`)
logs in via the admin panel.

## Structure

```
shell/
├── README.md                   ← this file
├── routes.js                   ← top-level nav route config (role-filtered)
├── styleVariables.js           ← MUI drawer widths, breakpoints
├── mountEffect.js              ← custom useMountEffect hook
├── app.css                     ← shell-level styles
│
├── routes/
│   ├── rootuser.js             ← nav items visible to 'root' role
│   └── superadmin.js           ← nav items visible to 'super_admin' role
│
├── containers/
│   └── Dashboard.jsx           ← main shell layout: Header + Sidebar + Workspace
│                                 contains getFilteredRoutes() with partner_root injection
│
├── pages/
│   ├── Authentication/
│   │   ├── Signin.jsx          ← LOGIN PAGE — contains isPartnerOrg detection logic
│   │   │                         After login, checks org.partner flag via API and sets
│   │   │                         sessionStorage.setItem("isPartnerOrg", "true")
│   │   └── ProtectedRoute.jsx  ← React Router v6 route guard
│   └── Home/
│       └── Home.jsx            ← Admin analytics dashboard (root/super_admin view)
│
├── services/
│   ├── api.js                  ← Axios instance with region/org/token interceptors
│   └── activities.js           ← captureActivity(), beaconActivity(), log helpers
│
├── utils/
│   ├── authUtils.js            ← isTokenExpired(), clearAuthAndRedirect()
│   └── helpers.js              ← capitalize() and other utilities
│
└── components/
    ├── AppProvider/            ← MUI ThemeProvider + RTL context
    ├── Header/                 ← Top AppBar with logout + menu toggle
    ├── Sidebar/                ← Collapsible sidebar (reads isPartnerOrg from sessionStorage)
    │   └── SidebarItem.jsx     ← Injects 'partner_root' effective role when applicable
    ├── Workspace/              ← Main content area wrapper
    ├── Cards/                  ← StatCard and other card components
    ├── NotificationCenter/     ← Notification drawer
    └── Table/                  ← DataTable component
```

## The `isPartnerOrg` Flow

1. **Signin.jsx** — on successful login, if user role is `root` (not `super_admin`):
   - Calls `GET /organizations/{orgId}` 
   - If `org.partner === true` → `sessionStorage.setItem("isPartnerOrg", "true")`

2. **containers/Dashboard.jsx** — `getFilteredRoutes()`:
   - If `role === "root"` and `isPartnerOrg === "true"` → pushes `"partner_root"` into effectiveRoles
   - Routes with `roles: ["partner_root"]` become visible

3. **Sidebar/SidebarItem.jsx** — per-item role check:
   - Reads `isPartnerOrg` from sessionStorage
   - If true and role is `root`, treats user as `partner_root` for menu visibility

## How to Wire into CalVant

The shell is a **separate entry point**. In CalVant's `App.js`, the `/admin` routes already 
mount `AdminRoutes`. For the partner shell, you can either:

- **Option A** (recommended): Mount the shell's `Dashboard` container at `/admin` 
  and guard it via `AdminProtectedRoute`, replacing the current `AdminLayout`-based routing 
  when the user is a partner root.

- **Option B**: Keep as a separate app (own `index.html` / `main.jsx`), deployed alongside CalVant.

The shell's `routes.js` references components by their cf-tool-admin paths — update 
import paths to point to `../components/...` (the CalVant admin components) when integrating.
