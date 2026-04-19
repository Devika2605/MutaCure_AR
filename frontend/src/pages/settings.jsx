// pages/settings.jsx — Settings page
import Head from "next/head";
import { useState } from "react";
import Layout from "../components/Layout";

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{ width: 42, height: 24, borderRadius: 12, background: value ? "#4caf50" : "#d0dbd0", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
    >
      <span style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e6ebe6", overflow: "hidden" }}>
      <div style={{ padding: "14px 22px", borderBottom: "1px solid #f0f5f0", fontSize: 13, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif" }}>{title}</div>
      <div style={{ padding: "4px 0" }}>{children}</div>
    </div>
  );
}

function Row({ label, desc, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: "1px solid #f8faf8", gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif", marginBottom: desc ? 3 : 0 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif" }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications:   true,
    emailAlerts:     false,
    autoGenerate:    false,
    darkMode:        false,
    arCamera:        true,
    saveHistory:     true,
    highQualityAR:   true,
    apiUrl:          "http://localhost:8000",
    maxSeqLength:    200,
    userName:        "Dr. Santos",
    userEmail:       "santos@mutacure.ai",
  });

  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Head><title>Settings — MutaCure AR</title></Head>
      <Layout pageTitle="Settings">
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* Main settings */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>

            <Section title="Profile">
              <Row label="Name" desc="Displayed in the topbar and reports">
                <input value={settings.userName} onChange={e => set("userName", e.target.value)}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e6ebe6", fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#1a2e1a", background: "#f8faf8", outline: "none", width: 200 }} />
              </Row>
              <Row label="Email" desc="Used for alert notifications">
                <input value={settings.userEmail} onChange={e => set("userEmail", e.target.value)}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e6ebe6", fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#1a2e1a", background: "#f8faf8", outline: "none", width: 200 }} />
              </Row>
            </Section>

            <Section title="Notifications">
              <Row label="Push Notifications" desc="Browser alerts for completed analyses">
                <Toggle value={settings.notifications} onChange={v => set("notifications", v)} />
              </Row>
              <Row label="Email Alerts" desc="Send results to your email">
                <Toggle value={settings.emailAlerts} onChange={v => set("emailAlerts", v)} />
              </Row>
              <Row label="High Risk Alerts" desc="Immediate alert for risk score ≥ 0.85">
                <Toggle value={settings.autoGenerate} onChange={v => set("autoGenerate", v)} />
              </Row>
            </Section>

            <Section title="Protein Generation">
              <Row label="Auto-Generate on Selection" desc="Immediately generate when disease is selected">
                <Toggle value={settings.autoGenerate} onChange={v => set("autoGenerate", v)} />
              </Row>
              <Row label="Max Sequence Length" desc="Maximum amino acid length for ESMFold">
                <select value={settings.maxSeqLength} onChange={e => set("maxSeqLength", +e.target.value)}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e6ebe6", fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#1a2e1a", background: "#f8faf8", outline: "none" }}>
                  {[100, 150, 200, 300, 400].map(v => <option key={v} value={v}>{v} AA</option>)}
                </select>
              </Row>
              <Row label="Save to History" desc="Store all analyses in history log">
                <Toggle value={settings.saveHistory} onChange={v => set("saveHistory", v)} />
              </Row>
            </Section>

            <Section title="AR Settings">
              <Row label="Enable AR Camera" desc="Allow browser to access camera for AR">
                <Toggle value={settings.arCamera} onChange={v => set("arCamera", v)} />
              </Row>
              <Row label="High Quality AR Rendering" desc="Higher fidelity protein models (slower on mobile)">
                <Toggle value={settings.highQualityAR} onChange={v => set("highQualityAR", v)} />
              </Row>
            </Section>

            <Section title="API Configuration">
              <Row label="Backend URL" desc="MutaCure API server address">
                <input value={settings.apiUrl} onChange={e => set("apiUrl", e.target.value)}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e6ebe6", fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#1a2e1a", background: "#f8faf8", outline: "none", width: 220 }} />
              </Row>
            </Section>

            {/* Save */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={save}
                style={{ padding: "11px 28px", borderRadius: 10, background: saved ? "#4caf50" : "#2d6a31", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "background 0.2s" }}>
                {saved ? "✓ Saved!" : "Save Settings"}
              </button>
            </div>

          </div>

          {/* Right panel */}
          <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e6ebe6", padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>Account</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#2d7a31,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif" }}>{settings.userName}</div>
                  <div style={{ fontSize: 11, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif" }}>{settings.userEmail}</div>
                </div>
              </div>
              <button style={{ width: "100%", padding: "9px", borderRadius: 9, border: "1px solid #e6ebe6", background: "#f8faf8", color: "#6a8a6a", fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                Sign Out
              </button>
            </div>

            <div style={{ background: "#f0faf0", borderRadius: 14, border: "1px solid #c8e6c9", padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#2d7a31", marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>System Status</div>
              {[["Backend API", true], ["ESMFold", true], ["AR Module", true], ["ClinVar DB", true]].map(([label, ok]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#4a6a4a", fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: ok ? "#e8f5e9" : "#fff0f0", color: ok ? "#2d7a31" : "#e05c5c", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{ok ? "Online" : "Offline"}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </Layout>
    </>
  );
}