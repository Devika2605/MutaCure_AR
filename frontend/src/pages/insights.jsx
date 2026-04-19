// pages/insights.jsx — Therapy Insights page
import Head from "next/head";
import Layout from "../components/Layout";

const INSIGHTS = [
  {
    gene: "TCF7L2", target: "PPARG", disease: "Type 2 Diabetes",
    affinity: "-8.4 kcal/mol", status: "Promising", statusColor: "#4caf50",
    candidate: "MutaCure_001", length: 187,
    mechanism: "The TCF7L2 variant rs7903146 disrupts Wnt signaling, reducing GLP-1 secretion. The candidate protein stabilizes PPARG binding and restores downstream insulin sensitivity pathways.",
    confidence: 87, tags: ["Wnt Pathway", "GLP-1", "Insulin"],
  },
  {
    gene: "BRCA1", target: "BRCA1", disease: "Breast Cancer",
    affinity: "-7.9 kcal/mol", status: "Under Review", statusColor: "#f0a500",
    candidate: "MutaCure_002", length: 210,
    mechanism: "Loss-of-function BRCA1 mutations impair homologous recombination. This candidate restores RAD51-mediated repair by stabilizing the BRCA1 BRCT domain interaction surface.",
    confidence: 74, tags: ["DNA Repair", "RAD51", "BRCT Domain"],
  },
  {
    gene: "EGFR", target: "EGFR", disease: "Lung Cancer",
    affinity: "-9.1 kcal/mol", status: "Promising", statusColor: "#4caf50",
    candidate: "MutaCure_003", length: 195,
    mechanism: "The L858R substitution in EGFR exon 21 constitutively activates RTK signaling. The candidate acts as an allosteric inhibitor targeting the ATP-binding cleft in the mutated kinase domain.",
    confidence: 91, tags: ["RTK", "Kinase Inhibition", "Allosteric"],
  },
  {
    gene: "APOE", target: "APOE", disease: "Alzheimer's Disease",
    affinity: "-6.8 kcal/mol", status: "Early Stage", statusColor: "#9aaa9a",
    candidate: "MutaCure_004", length: 162,
    mechanism: "APOE ε4 promotes amyloid-β aggregation and impairs lipid transport. This candidate modulates receptor binding domain geometry to reduce plaque deposition affinity.",
    confidence: 61, tags: ["Amyloid", "Lipid Transport", "LDL-R"],
  },
];

const STATS = [
  { label: "Total Candidates", value: "4", sub: "Generated this session", color: "#4caf50" },
  { label: "Avg. Affinity",    value: "−8.1", sub: "kcal/mol binding energy", color: "#5b9bd5" },
  { label: "High Confidence",  value: "2",   sub: "Score ≥ 85%", color: "#4caf50" },
  { label: "Under Review",     value: "1",   sub: "Pending validation", color: "#f0a500" },
];

function Icon({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, flexShrink: 0 };
  switch (n) {
    case "bulb":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3 6H8c-1.5-1.5-3-3.5-3-6a7 7 0 017-7z"/></svg>;
    case "flask":  return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M9 3h6M9 3v6l-4 9a1 1 0 00.9 1.4h12.2a1 1 0 00.9-1.4L15 9V3"/><line x1="6" y1="14" x2="18" y2="14"/></svg>;
    case "target": return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case "arrow":  return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    default: return null;
  }
}

export default function TherapyInsights() {
  return (
    <>
      <Head><title>Therapy Insights — MutaCure AR</title></Head>
      <Layout pageTitle="Therapy Insights">

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e6ebe6", padding: "18px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif" }}>{s.sub}</div>
              <div style={{ height: 3, background: "#f0f5f0", borderRadius: 2, marginTop: 14 }}>
                <div style={{ height: "100%", width: i === 0 ? "100%" : i === 1 ? "80%" : i === 2 ? "50%" : "25%", background: s.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Insight cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif" }}>AI-Generated Therapeutic Candidates</div>

          {INSIGHTS.map((ins, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e6ebe6", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 16 }}>

                {/* Left info */}
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: "#f0faf0", border: "1px solid #c8e6c9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon n="flask" s={20} c="#4caf50" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif" }}>{ins.candidate}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: `${ins.statusColor}18`, color: ins.statusColor, fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{ins.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6a8a6a", fontFamily: "'DM Sans',sans-serif" }}>{ins.disease} · Gene: <strong style={{ color: "#2d7a31" }}>{ins.gene}</strong> · Target: <strong style={{ color: "#2d7a31" }}>{ins.target}</strong></div>
                  </div>
                </div>

                {/* Affinity badge */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: "#8aaa8a", fontFamily: "'DM Mono',monospace", marginBottom: 3 }}>Binding Affinity</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#2d7a31", fontFamily: "'DM Mono',monospace" }}>{ins.affinity}</div>
                </div>
              </div>

              {/* Mechanism */}
              <div style={{ background: "#f8faf8", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#8aaa8a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>Mechanism</div>
                <p style={{ fontSize: 12.5, color: "#4a6a4a", lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>{ins.mechanism}</p>
              </div>

              {/* Footer row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ins.tags.map(t => (
                    <span key={t} style={{ padding: "3px 9px", background: "#e8f5e9", borderRadius: 6, fontSize: 10, color: "#2d7a31", fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>{t}</span>
                  ))}
                  <span style={{ padding: "3px 9px", background: "#f0f5f0", borderRadius: 6, fontSize: 10, color: "#6a8a6a", fontFamily: "'DM Mono',monospace" }}>{ins.length} AA</span>
                </div>

                {/* Confidence bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif" }}>Confidence</span>
                  <div style={{ width: 80, height: 6, background: "#e8ede8", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${ins.confidence}%`, background: ins.confidence >= 80 ? "#4caf50" : ins.confidence >= 60 ? "#f0a500" : "#9aaa9a", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Mono',monospace", width: 32 }}>{ins.confidence}%</span>
                  <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", background: "#f0faf0", border: "1px solid #c8e6c9", borderRadius: 8, color: "#2d7a31", fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer" }}>
                    Details <Icon n="arrow" s={12} c="#2d7a31" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </Layout>
    </>
  );
}