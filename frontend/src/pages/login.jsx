// pages/login.jsx — Login / Register page
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode,     setMode]     = useState("login");   // "login" | "register"
  const [role,     setRole]     = useState("clinician"); // "clinician" | "patient"
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await login(email, password);
        router.push(data.role === "patient" ? "/patient" : "/");
      } else {
        if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
        const data = await register(name, email, password, role);
        router.push(data.role === "patient" ? "/patient" : "/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Sign In — MutaCure AR</title></Head>
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f2212 0%,#1b3a20 50%,#142d18 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:20 }}>

        {/* Background glow */}
        <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse 600px 400px at 50% 40%, rgba(74,163,84,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ width:"100%", maxWidth:440, position:"relative", zIndex:1 }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center", marginBottom:36 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#2d7a31,#4caf50)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(74,163,84,0.35)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>MutaCure <span style={{ color:"#6fcf7a" }}>AR</span></div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", letterSpacing:"0.06em", textTransform:"uppercase" }}>From Mutation to Therapy</div>
            </div>
          </div>

          {/* Card */}
          <div style={{ background:"rgba(255,255,255,0.97)", borderRadius:20, padding:"36px 40px", boxShadow:"0 24px 80px rgba(0,0,0,0.35)" }}>

            {/* Mode toggle */}
            <div style={{ display:"flex", background:"#f0f5f0", borderRadius:10, padding:3, marginBottom:28 }}>
              {["login","register"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(null); }}
                  style={{ flex:1, padding:"9px 0", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, transition:"all 0.15s", background:mode===m?"#2d6a31":"transparent", color:mode===m?"#fff":"#6a8a6a" }}>
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Role selector (always visible) */}
              <div>
                <label style={labelStyle}>I am a</label>
                <div style={{ display:"flex", gap:10 }}>
                  {[
                    { key:"clinician", emoji:"🔬", label:"Clinician / Doctor" },
                    { key:"patient",   emoji:"👤", label:"Patient" },
                  ].map(r => (
                    <button key={r.key} type="button" onClick={() => setRole(r.key)}
                      style={{ flex:1, padding:"12px 10px", borderRadius:10, border:`2px solid ${role===r.key?"#4caf50":"#e0e8e0"}`, background:role===r.key?"#f0faf0":"#fafafa", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, transition:"all 0.15s" }}>
                      <span style={{ fontSize:22 }}>{r.emoji}</span>
                      <span style={{ fontSize:11, fontWeight:600, color:role===r.key?"#2d7a31":"#6a8a6a", fontFamily:"'DM Sans',sans-serif" }}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name (register only) */}
              {mode === "register" && (
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder={role==="clinician"?"Dr. Santos":"Alex Johnson"}
                    style={inputStyle} required />
                </div>
              )}

              {/* Email */}
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder={role==="clinician"?"doctor@hospital.com":"patient@email.com"}
                  style={inputStyle} required />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••" style={inputStyle} required />
              </div>

              {/* Demo hint */}
              {mode === "login" && (
                <div style={{ background:"#f8faf8", border:"1px solid #e0ede0", borderRadius:8, padding:"10px 12px", fontSize:11, color:"#5a7a5a", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
                  <strong style={{ color:"#2d7a31" }}>Demo accounts:</strong><br/>
                  🔬 doctor@mutacure.ai / doctor123<br/>
                  👤 patient@mutacure.ai / patient123
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ background:"#fff5f5", border:"1px solid #f0c0c0", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#c0392b" }}>
                  ⚠ {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ padding:"13px", borderRadius:10, border:"none", background:loading?"#9aba9a":"#2d6a31", color:"#fff", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", marginTop:4, transition:"background 0.15s" }}>
                {loading ? "Please wait..." : mode === "login" ? `Sign In as ${role === "clinician" ? "Clinician" : "Patient"}` : "Create Account"}
              </button>

            </form>
          </div>

          <p style={{ textAlign:"center", marginTop:20, fontSize:12, color:"rgba(255,255,255,0.35)" }}>
            MutaCure AR · Secure genomic analysis platform
          </p>
        </div>
      </div>
    </>
  );
}

const labelStyle = { fontSize:11, fontWeight:600, color:"#6a8a6a", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };
const inputStyle  = { width:"100%", padding:"11px 14px", background:"#f8faf8", border:"1px solid #e0e8e0", borderRadius:9, color:"#1a2e1a", fontSize:13, fontFamily:"'DM Mono',monospace", boxSizing:"border-box", outline:"none" };