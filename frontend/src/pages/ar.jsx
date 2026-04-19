// pages/ar.jsx — AR Viewer page
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/Layout";

const PROTEINS = [
  { gene: "TCF7L2", disease: "Type 2 Diabetes",   target: "PPARG",  risk: 0.87, variant: "rs7903146 (C>T)" },
  { gene: "BRCA1",  disease: "Breast Cancer",      target: "BRCA1",  risk: 0.79, variant: "rs80357906" },
  { gene: "EGFR",   disease: "Lung Cancer",        target: "EGFR",   risk: 0.74, variant: "rs121434568" },
  { gene: "APOE",   disease: "Alzheimer's",        target: "APOE",   risk: 0.62, variant: "rs429358" },
];

function Icon({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, flexShrink: 0 };
  switch (n) {
    case "ar":      return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
    case "qr":      return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3" rx="0.5"/><rect x="18" y="18" width="3" height="3" rx="0.5"/><rect x="14" y="18" width="3" height="3" rx="0.5"/><rect x="18" y="14" width="3" height="3" rx="0.5"/></svg>;
    case "phone":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" strokeWidth="2"/></svg>;
    case "check":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>;
    case "eye":     return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "link":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
    default: return null;
  }
}

export default function ARViewer() {
  const router = useRouter();
  const [selected, setSelected] = useState(PROTEINS[0]);
  const [copied, setCopied]     = useState(false);

  const getBaseUrl = () => typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const arUrl = (() => {
    const params = new URLSearchParams({
      protein: selected.target,
      disease: selected.disease,
      mut: selected.variant,
      risk: selected.risk,
    });
    return `${getBaseUrl()}/ar/index.html?${params.toString()}`;
  })();

  const copyLink = () => {
    navigator.clipboard?.writeText(arUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskColor = r => r >= 0.7 ? "#e05c5c" : r >= 0.4 ? "#f0a500" : "#6fcf7a";
  const riskLabel = r => r >= 0.7 ? "HIGH" : r >= 0.4 ? "MED" : "LOW";

  return (
    <>
      <Head><title>AR Viewer — MutaCure AR</title></Head>
      <Layout pageTitle="AR Viewer">
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* Left column */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Header card */}
            <div style={{ background: "linear-gradient(135deg,#1b3a20,#0f2212)", borderRadius: 16, padding: 28, display: "flex", alignItems: "center", justifyContent: "space-between", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 300px 200px at 80% 50%, rgba(74,163,84,0.12) 0%, transparent 70%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(74,163,84,0.25)", border: "1px solid rgba(74,163,84,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon n="ar" s={18} c="#6fcf7a" />
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>Augmented Reality Viewer</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans',sans-serif", margin: 0, maxWidth: 480 }}>
                  Visualize protein structures in your physical environment. Select a protein, scan the QR code on your phone, then point it at the Hiro marker.
                </p>
              </div>
              {/* Decorative protein blob */}
              <svg viewBox="0 0 160 120" width={160} height={120} style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
                {[[80,60,30],[100,75,22],[60,78,20],[82,96,18],[108,55,15],[58,60,17],[88,78,13]].map(([cx,cy,r],i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} fill="#4caf50" opacity={0.08 + i * 0.025} />
                ))}
                <circle cx="100" cy="68" r="10" fill="#e05c5c" opacity="0.85" />
                <circle cx="100" cy="68" r="16" fill="#e05c5c" opacity="0.15" />
              </svg>
            </div>

            {/* Protein selector */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e6ebe6", padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>Select Protein to Visualize</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {PROTEINS.map((p, i) => (
                  <button key={i}
                    onClick={() => setSelected(p)}
                    style={{
                      padding: "14px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                      background: selected.gene === p.gene ? "#f0faf0" : "#f8faf8",
                      border: selected.gene === p.gene ? "1.5px solid #4caf50" : "1.5px solid #e6ebe6",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif" }}>{p.gene}</span>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: `${riskColor(p.risk)}18`, color: riskColor(p.risk), fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{riskLabel(p.risk)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>{p.disease}</div>
                    <div style={{ fontSize: 10, color: "#aabcaa", fontFamily: "'DM Mono',monospace" }}>Target: {p.target}</div>
                    {selected.gene === p.gene && (
                      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5, color: "#4caf50", fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
                        <Icon n="check" s={12} c="#4caf50" /> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e6ebe6", padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 18, fontFamily: "'DM Sans',sans-serif" }}>How to Use AR</div>
              {[
                { num: "1", icon: "qr",    title: "Scan QR Code",         desc: "Open your phone camera and scan the QR code on the right panel. The AR viewer will open in your phone browser." },
                { num: "2", icon: "eye",   title: "Point at Hiro Marker", desc: "Show your phone camera the Hiro marker displayed on your laptop screen. Keep it well-lit and in full view." },
                { num: "3", icon: "ar",    title: "See Protein in AR",    desc: "The 3D protein structure floats above the marker. Rotate your phone to explore it from any angle." },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 16, marginBottom: i < 2 ? 20 : 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0faf0", border: "1px solid #c8e6c9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon n={step.icon} s={16} c="#4caf50" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a2e1a", marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>{step.num}. {step.title}</div>
                    <div style={{ fontSize: 12, color: "#6a8a6a", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right panel */}
          <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* QR + Marker card */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e6ebe6", padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>Launch AR on Phone</div>
              <div style={{ fontSize: 11, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif", marginBottom: 18 }}>Scan with phone camera to open AR viewer</div>

              {/* QR placeholder — real QR generated via qrcode.js in browser */}
              <div style={{ background: "#f8faf8", border: "1px solid #e6ebe6", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div id="ar-qr-container" style={{ width: 160, height: 160, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e6ebe6" }}>
                  {/* QR code rendered client-side */}
                  <QRCode url={arUrl} />
                </div>
                <div style={{ fontSize: 11, color: "#6a8a6a", fontFamily: "'DM Sans',sans-serif", textAlign: "center" }}>
                  <strong style={{ color: "#1a2e1a" }}>{selected.gene}</strong> → {selected.target}
                </div>
              </div>

              {/* Copy link */}
              <button
                onClick={copyLink}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1px solid #c8e6c9", background: copied ? "#f0faf0" : "#f8faf8", color: copied ? "#2d7a31" : "#4a6a4a", fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s", marginBottom: 12 }}
              >
                {copied ? <><Icon n="check" s={13} c="#2d7a31" /> Copied!</> : <><Icon n="link" s={13} c="#4a6a4a" /> Copy AR Link</>}
              </button>

              <a
                href={arUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "11px 14px", borderRadius: 9, background: "#2d6a31", color: "#fff", fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, textDecoration: "none", boxSizing: "border-box" }}
              >
                <Icon n="phone" s={14} c="#fff" /> Open AR on this Device
              </a>
            </div>

            {/* Hiro marker */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e6ebe6", padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>Hiro AR Marker</div>
              <div style={{ fontSize: 11, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif", marginBottom: 14 }}>Point your phone at this marker</div>
              <div style={{ background: "#fff", border: "2px solid #e6ebe6", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src="https://raw.githubusercontent.com/nicktindall/cyclon.p2p-rtc-client/master/examples/img/hiro.png"
                  alt="Hiro AR Marker"
                  style={{ width: 200, height: 200, display: "block", borderRadius: 4 }}
                />
              </div>
              <div style={{ fontSize: 10, color: "#9aaa9a", fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 10 }}>Keep well-lit · Fill camera frame</div>
            </div>

            {/* Selected protein info */}
            <div style={{ background: "#f0faf0", borderRadius: 14, border: "1px solid #c8e6c9", padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#2d7a31", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>Selected Protein</div>
              {[["Gene", selected.gene], ["Target", selected.target], ["Disease", selected.disease], ["Variant", selected.variant], ["Risk Score", selected.risk]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#6a8a6a", fontFamily: "'DM Sans',sans-serif" }}>{l}</span>
                  <span style={{ fontSize: 11, color: "#1a2e1a", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </Layout>
    </>
  );
}

// QR code rendered client-side using qrcode.js
function QRCode({ url }) {
  const ref = useState(null);
  const divRef = require("react").useRef(null);

  require("react").useEffect(() => {
    if (!divRef.current || !url) return;
    divRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = () => {
      new window.QRCode(divRef.current, {
        text: url, width: 148, height: 148,
        colorDark: "#1a2e1a", colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch(_) {} };
  }, [url]);

  return <div ref={divRef} style={{ width: 148, height: 148 }} />;
}