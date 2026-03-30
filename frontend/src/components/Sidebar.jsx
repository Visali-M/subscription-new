import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

const NAV = [
  { label: "Dashboard",       icon: "▦",  path: "/dashboard"       },
  { label: "Add Subscription",icon: "+",  path: "/add"             },
  { label: "Analytics",       icon: "◈",  path: "/analytics"       },
  { label: "Calendar",        icon: "▦",  path: "/calendar"        },
  { label: "Payment History", icon: "⊙",  path: "/payment-history" },
];

const ICONS = {
  "/dashboard":        DashIcon,
  "/add":              AddIcon,
  "/analytics":        AnalyticsIcon,
  "/calendar":         CalIcon,
  "/payment-history":  PayIcon,
};

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, toggle } = useTheme();
  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const initials  = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)
    : "U";

  const handleLogout = () => {
    ["token","loggedIn","user"].forEach(k => localStorage.removeItem(k));
    navigate("/");
  };

  return (
    <aside style={{
      width: "var(--sidebar-w)", minWidth: "var(--sidebar-w)",
      background: "var(--sidebar-bg)", display: "flex", flexDirection: "column",
      padding: "0 0 20px", position: "sticky", top: 0, height: "100vh",
      borderRight: "1px solid var(--sidebar-bdr)", flexShrink: 0, zIndex: 20,
    }}>
      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "22px 20px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        marginBottom: 8,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: -0.3 }}>SubTracker</div>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: "0.8px", textTransform: "uppercase" }}>v2.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 0" }}>
        {NAV.map(({ label, path }) => {
          const active = location.pathname === path;
          const Icon = ICONS[path];
          return (
            <div
              key={path}
              className={`nav-item${active ? " active" : ""}`}
              onClick={() => navigate(path)}
            >
              <span style={{
                width: 20, height: 20, display: "flex", alignItems: "center",
                justifyContent: "center", opacity: active ? 1 : 0.6,
              }}>
                {Icon && <Icon size={15} active={active} />}
              </span>
              {label}
            </div>
          );
        })}
      </nav>

      {/* Theme toggle + User */}
      <div style={{ padding: "16px 16px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          style={{
            width: "100%", height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)",
            fontFamily: "var(--font)", fontSize: 12, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 7, marginBottom: 14,
          }}
        >
          {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
        </button>

        {/* User row */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name || "User"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email || ""}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              width: 28, height: 28, borderRadius: 7, border: "none",
              background: "rgba(239,68,68,0.12)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* SVG Icons */
function DashIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function AddIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}
function AnalyticsIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function CalIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function PayIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}

