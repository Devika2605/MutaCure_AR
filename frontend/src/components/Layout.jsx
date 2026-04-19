// components/Layout.jsx
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../context/UserContext";
import styles from "./Layout.module.css";

const DOCTOR_NAV = [
  { path: "/",         label: "Dashboard",        icon: "grid"    },
  { path: "/mutation", label: "Mutation Analysis", icon: "dna"     },
  { path: "/protein",  label: "Protein Explorer",  icon: "atom"    },
  { path: "/ar",       label: "AR Viewer",         icon: "ar"      },
  { path: "/insights", label: "Therapy Insights",  icon: "bulb"    },
  { path: "/history",  label: "History",           icon: "history" },
  { path: "/upload",   label: "Upload DNA",        icon: "dna"     },
];

const PATIENT_NAV = [
  { path: "/",          label: "My Dashboard",  icon: "grid"    },
  { path: "/my-results",label: "My Results",    icon: "dna"     },
  { path: "/protein",   label: "3D Visualizer", icon: "atom"    },
  { path: "/ar",        label: "AR Viewer",     icon: "ar"      },
  { path: "/insights",  label: "My Insights",   icon: "bulb"    },
  { path: "/history",   label: "My History",    icon: "history" },
];

function Ico({ name }) {
  const p = { width: 17, height: 17, flexShrink: 0 };
  switch (name) {
    case "grid":    return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    case "dna":     return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M8 3c0 4 8 4 8 8s-8 4-8 8M16 3c0 4-8 4-8 8s8 4 8 8M5 6h14M5 18h14" strokeLinecap="round"/></svg>;
    case "atom":    return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>;
    case "ar":      return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
    case "bulb":    return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3 6H8c-1.5-1.5-3-3.5-3-6a7 7 0 017-7z"/></svg>;
    case "history": return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "settings":return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    case "user":    return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "logout":  return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case "doctor":  return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/><path d="M12 14v3M10.5 16.5h3"/></svg>;
    case "patient": return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/></svg>;
    default: return null;
  }
}

// ── Avatar dropdown ────────────────────────────────────────────────────────────
function AvatarMenu({ user, switchRole, router }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isDoctor = user.role === "doctor";

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const go = (path) => { router.push(path); setOpen(false); };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button onClick={() => setOpen(o => !o)} className={styles.avatarTrigger}>
        <div className={styles.avatarCircle} style={{ background: isDoctor ? "linear-gradient(135deg,#2d7a31,#4caf50)" : "linear-gradient(135deg,#1565c0,#42a5f5)" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{user.initials}</span>
        </div>
        <div className={styles.avatarInfo}>
          <span className={styles.avatarName}>{user.name}</span>
          <span className={styles.avatarRole} style={{ color: isDoctor ? "#2d7a31" : "#1565c0" }}>
            {isDoctor ? "Clinician" : "Patient"}
          </span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9aaa9a" strokeWidth="2.5"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.15s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className={styles.dropdown}>
          {/* Header */}
          <div className={styles.dropHeader}>
            <div className={styles.dropAvatar} style={{ background: isDoctor ? "linear-gradient(135deg,#2d7a31,#4caf50)" : "linear-gradient(135deg,#1565c0,#42a5f5)" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{user.initials}</span>
            </div>
            <div>
              <div className={styles.dropName}>{user.name}</div>
              <div className={styles.dropEmail}>{user.email}</div>
              <div className={styles.dropBadge} style={{ background: isDoctor ? "#e8f5e9" : "#e3f2fd", color: isDoctor ? "#2d7a31" : "#1565c0" }}>
                {isDoctor ? "🩺 Clinician / Researcher" : "👤 Patient"}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className={styles.dropSection}>
            <DropBtn ico="user" label="Profile & Settings" onClick={() => go("/settings")} />
          </div>

          {/* Role switch */}
          <div className={styles.dropSection} style={{ borderTop: "1px solid #f0f5f0", paddingTop: 10 }}>
            <div className={styles.dropSectionLabel}>Switch Role</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "4px 0" }}>
              <RoleChip ico="doctor"  label="Clinician" active={isDoctor}
                color="#2d7a31" bg="#f0faf0" border="#c8e6c9"
                onClick={() => { switchRole("doctor"); go("/"); }} />
              <RoleChip ico="patient" label="Patient"   active={!isDoctor}
                color="#1565c0" bg="#e3f2fd" border="#90caf9"
                onClick={() => { switchRole("patient"); go("/"); }} />
            </div>
          </div>

          <div style={{ height: 1, background: "#f0f5f0", margin: "4px 0" }}/>
          <div className={styles.dropSection}>
            <DropBtn ico="logout" label="Sign Out" color="#e05c5c" onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function DropBtn({ ico, label, onClick, color }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 16px", background:hov?"#f8faf8":"transparent", border:"none", cursor:"pointer", color:color||"#2a3a2a", fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:500, borderRadius:8, transition:"background 0.1s" }}>
      <Ico name={ico} />
      {label}
    </button>
  );
}

function RoleChip({ ico, label, active, color, bg, border, onClick }) {
  return (
    <button onClick={onClick}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"10px 6px", borderRadius:10, border:`1.5px solid ${active ? border : "#e6ebe6"}`, background:active ? bg : "#f8faf8", cursor:"pointer", transition:"all 0.15s" }}>
      <div style={{ width:30, height:30, borderRadius:8, background:active ? bg : "#f0f5f0", border:`1px solid ${active ? border : "#e6ebe6"}`, display:"flex", alignItems:"center", justifyContent:"center", color:active ? color : "#8aaa8a" }}>
        <Ico name={ico} />
      </div>
      <span style={{ fontSize:11, fontWeight:600, color:active ? color : "#6a8a6a", fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
    </button>
  );
}

// ── Main Layout ────────────────────────────────────────────────────────────────
export default function Layout({ children, pageTitle = "Home" }) {
  const router = useRouter();
  const path = router.pathname;
  const { user, switchRole } = useUser();
  const isDoctor = user.role === "doctor";
  const NAV = isDoctor ? DOCTOR_NAV : PATIENT_NAV;

  return (
    <div className={styles.shell}>
      <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBg}
          style={!isDoctor ? { background:"linear-gradient(180deg,#1a2a3a 0%,#0f1e2e 60%,#0a1520 100%)" } : {}} />

        <div className={styles.sidebarInner}>
          <div className={styles.logo} onClick={() => router.push("/")}>
            <div className={styles.logoMark}
              style={!isDoctor ? { background:"linear-gradient(135deg,#1565c0,#42a5f5)" } : {}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
              </svg>
            </div>
            <div>
              <div className={styles.logoText}>MutaCure <strong>AR</strong></div>
              <div style={{ fontSize:9, fontWeight:700, color:isDoctor?"rgba(74,163,84,0.7)":"rgba(66,165,245,0.7)", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:1 }}>
                {isDoctor ? "Clinician Portal" : "Patient Portal"}
              </div>
            </div>
          </div>

          <nav className={styles.nav}>
            {NAV.map(item => (
              <button key={item.path}
                className={`${styles.navItem} ${path === item.path ? styles.navActive : ""}`}
                style={path === item.path && !isDoctor ? { background:"rgba(21,101,192,0.25)", color:"#fff" } : {}}
                onClick={() => router.push(item.path)}
              >
                <Ico name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className={styles.navBottom}>
            <button className={`${styles.navItem} ${path === "/settings" ? styles.navActive : ""}`}
              onClick={() => router.push("/settings")}>
              <Ico name="settings" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <div className={styles.topbarRight}>
            <button className={styles.bellBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5a7a5a" strokeWidth="1.8">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className={styles.bellBadge}/>
            </button>
            <AvatarMenu user={user} switchRole={switchRole} router={router} />
          </div>
        </header>

        {/* Patient banner */}
        {!isDoctor && (
          <div style={{ padding:"8px 28px", background:"#e3f2fd", borderBottom:"1px solid #bbdefb", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:12, color:"#1565c0", fontFamily:"'DM Sans',sans-serif" }}>
              👤 Patient Portal · Viewing simplified results for <strong>{user.name}</strong>
            </span>
            <button onClick={() => switchRole("doctor")}
              style={{ fontSize:11, color:"#1565c0", background:"#fff", border:"1px solid #90caf9", borderRadius:6, padding:"3px 10px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
              Switch to Clinician View →
            </button>
          </div>
        )}

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}