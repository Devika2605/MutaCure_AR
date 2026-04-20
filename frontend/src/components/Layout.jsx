// components/Layout.jsx — role-aware layout with auth guard
import { useRouter } from "next/router";
import { useEffect } from "react";
import styles from "./Layout.module.css";
import { useAuth } from "../context/AuthContext";

const CLINICIAN_NAV = [
  { path: "/",         label: "Dashboard",        icon: "grid"    },
  { path: "/mutation", label: "Mutation Analysis", icon: "dna"     },
  { path: "/protein",  label: "Protein Explorer",  icon: "atom"    },
  { path: "/ar",       label: "AR Viewer",         icon: "ar"      },
  { path: "/insights", label: "Therapy Insights",  icon: "bulb"    },
  { path: "/history",  label: "History",           icon: "history" },
  { path: "/upload",   label: "Upload DNA",        icon: "upload"  },
];

const PATIENT_NAV = [
  { path: "/patient",         label: "My Dashboard",  icon: "grid"    },
  { path: "/patient/results", label: "My Results",    icon: "results" },
  { path: "/protein",         label: "3D Visualizer", icon: "atom"    },
  { path: "/ar",              label: "AR Viewer",     icon: "ar"      },
  { path: "/insights",        label: "My Insights",   icon: "bulb"    },
  { path: "/history",         label: "My History",    icon: "history" },
];

function NavIcon({ name }) {
  const p = { width: 18, height: 18, style: { flexShrink: 0 } };
  switch (name) {
    case "grid":    return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    case "dna":     return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 3c0 4 8 4 8 8s-8 4-8 8M16 3c0 4-8 4-8 8s8 4 8 8M5 6h14M5 18h14" strokeLinecap="round"/></svg>;
    case "atom":    return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>;
    case "ar":      return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
    case "bulb":    return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3 6H8c-1.5-1.5-3-3.5-3-6a7 7 0 017-7z"/></svg>;
    case "history": return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "upload":  return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round"/></svg>;
    case "results": return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
    case "settings":return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    default: return null;
  }
}

function Initials({ name, role }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", background: role === "patient" ? "#3a5a9a" : "linear-gradient(135deg,#2d7a31,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>{initials}</span>
    </div>
  );
}

const PUBLIC = ["/login"];

export default function Layout({ children, pageTitle = "Home" }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const path = router.pathname;

  useEffect(() => {
    if (!loading && !user && !PUBLIC.includes(path)) {
      router.push("/login");
    }
  }, [loading, user, path]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f4" }}>
        <div style={{ fontSize: 13, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif" }}>Loading...</div>
      </div>
    );
  }

  if (!user && !PUBLIC.includes(path)) return null;

  const isPatient = user?.role === "patient";
  const NAV = isPatient ? PATIENT_NAV : CLINICIAN_NAV;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBg} />
        <div className={styles.sidebarInner}>

          <div className={styles.logo} onClick={() => router.push(isPatient ? "/patient" : "/")}>
            <div className={styles.logoMark}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
              </svg>
            </div>
            <div>
              <span className={styles.logoText}>MutaCure <strong>AR</strong></span>
              <div style={{ fontSize: 9, color: isPatient ? "#7ab0f0" : "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 1 }}>
                {isPatient ? "PATIENT PORTAL" : "CLINICIAN PORTAL"}
              </div>
            </div>
          </div>

          <nav className={styles.nav}>
            {NAV.map(item => (
              <button key={item.path}
                className={`${styles.navItem} ${path === item.path || path.startsWith(item.path + "/") ? styles.navActive : ""}`}
                onClick={() => router.push(item.path)}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className={styles.navBottom}>
            <button className={`${styles.navItem} ${path === "/settings" ? styles.navActive : ""}`} onClick={() => router.push("/settings")}>
              <NavIcon name="settings" />
              <span>Settings</span>
            </button>
            <button className={styles.navItem} onClick={logout} style={{ color: "rgba(255,100,100,0.7)" }}>
              <svg width="18" height="18" style={{ flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </aside>

      <div className={styles.main}>

        {/* Patient blue banner */}
        {isPatient && (
          <div style={{ background: "#eff6ff", borderBottom: "1px solid #c7d9f5", padding: "9px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: "#3a5a9a", fontFamily: "'DM Sans',sans-serif" }}>
              👤 <strong>Patient Portal</strong> · Viewing simplified results for <strong>{user?.name}</strong>
            </span>
            <button onClick={() => router.push("/")}
              style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #3a5a9a", background: "transparent", color: "#3a5a9a", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Switch to Clinician View →
            </button>
          </div>
        )}

        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <div className={styles.topbarRight}>
            <button className={styles.bellBtn} title="Notifications" onClick={() => alert("No new notifications")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5a7a5a" strokeWidth="1.8">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className={styles.bellBadge} />
            </button>
            <div className={styles.avatarRow} title={`Signed in as ${user?.role}`}>
              <Initials name={user?.name} role={user?.role} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className={styles.avatarName}>{user?.name || "Guest"}</span>
                <span style={{ fontSize: 10, color: isPatient ? "#3a5a9a" : "#8aaa8a", fontFamily: "'DM Sans',sans-serif", textTransform: "capitalize", fontWeight: 600 }}>
                  {isPatient ? "Patient" : "Clinician"}
                </span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9aaa9a" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}