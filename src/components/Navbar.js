import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import {
  Home,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Lock,
  Globe,
} from "lucide-react";

export default function Navbar() {
  const history = useHistory();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    history.push("/login");
  };

  // Decode token to get user role
  const token = localStorage.getItem("token");
  let userRole = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);

      userRole = decoded.role; // adjust based on your JWT payload
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }

  // Define nav items
  const adminNavItems = [
    { label: "Dashboard", path: "/", icon: <Home size={18} /> },
    { label: "Users", path: "/users", icon: <Users size={18} /> },
    {
      label: "Departments",
      path: "/departments",
      icon: <Building2 size={18} />,
    },
    ...(userRole === "super_admin"
    ? [{ label: "Organizations", path: "/organizations", icon: <Globe size={18} /> }]
    : []),
    { label: "Risks", path: "/risks", icon: <ShieldCheck size={18} /> },
    {
      label: "Change Password",
      path: "/change-password",
      icon: <Lock size={18} />,
    },
  ];

  const riskOwnerNavItems = [
    {
      label: "Change Password",
      path: "/change-password",
      icon: <Lock size={18} />,
    },
  ];

  // Choose nav items based on role
  const navItems =
    userRole === "risk_owner" ? riskOwnerNavItems : adminNavItems;

  return (
    <div
      style={{
        ...styles.sidebar,
        width: collapsed ? "30px" : "200px",
        transition: "width 0.3s ease",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={styles.toggleButton}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <Menu size={22} /> : <X size={22} />}
      </button>

      {/* Logo Section */}
      <div style={styles.logoSection}>
        <img src="/favicon.png" alt="Logo" style={styles.logoImage} />
        {!collapsed && <h2 style={styles.logoText}>CalVant Admin</h2>}
      </div>

      {/* Navigation Links */}
      <ul style={styles.navList}>
        {navItems.map((item) => (
          <li
            key={item.path}
            style={{
              ...styles.navItem,
              ...(location.pathname === item.path ? styles.activeItem : {}),
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onClick={() => history.push(item.path)}
          >
            <span style={styles.icon}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div style={styles.logoutSection}>
        <button
          onClick={handleLogout}
          style={{
            ...styles.logoutButton,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span style={{ marginLeft: "8px" }}>Logout</span>}
        </button>
      </div>
    </div>
  );
}

// styles remain the same
const styles = {
  sidebar: {
    height: "100vh",
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    left: 0,
    top: 0,
    padding: "1.5rem 1rem",
    fontFamily: "Inter, system-ui, sans-serif",
    boxShadow: "2px 0 6px rgba(0,0,0,0.05)",
  },
  toggleButton: {
    background: "none",
    border: "none",
    color: "#374151",
    fontSize: "1.5rem",
    cursor: "pointer",
    alignSelf: "flex-end",
    marginBottom: "1rem",
    transition: "transform 0.3s",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "2rem",
    justifyContent: "center",
  },
  logoText: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#111827",
  },
  navList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    flexGrow: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0.7rem 1rem",
    borderRadius: "8px",
    color: "#374151",
    cursor: "pointer",
    marginBottom: "0.3rem",
    transition: "background 0.2s, color 0.2s",
  },
  activeItem: {
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: "500",
  },
  icon: {
    display: "flex",
    alignItems: "center",
  },
  logoutSection: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
  },
  logoutButton: {
    width: "100%",
    background: "#f9fafb",
    border: "none",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#b91c1c",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
    marginBottom: "20px",
  },
  logoImage: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: "0 0 4px rgba(0,0,0,0.1)",
  },
};
