// pages/history.jsx — Analysis History page
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const HISTORY = [
  { id: "MTC-001", gene: "TCF7L2", variant: "rs7903146 (C>T)", disease: "Type 2 Diabetes", target: "PPARG", risk: 0.87, affinity: "-8.4 kcal/mol", status: "Complete", date: "2025-04-18 14:27", length: 187 },
  { id: "MTC-002", gene: "BRCA1",  variant: "rs80357906",       disease: "Breast Cancer",   target: "BRCA1", risk: 0.79, affinity: "-7.9 kcal/mol", status: "Complete", date: "2025-04-17 11:15", length: 210 },
  { id: "MTC-003", gene: "EGFR",   variant: "rs121434568",       disease: "Lung Cancer",     target: "EGFR",  risk: 0.74, affinity: "-9.1 kcal/mol", status: "Complete", date: "2025-04-15 09:43", length: 195 },
  { id: "MTC-004", gene: "APOE",   variant: "rs429358",          disease: "Alzheimer's",     target: "APOE",  risk: 0.62, affinity: "-6.8 kcal/mol", status: "Complete", date: "2025-04-13 16:02", length: 162 },
  { id: "MTC-005", gene: "KRAS",   variant: "G12D",              disease: "Pancreatic Cancer",target: "KRAS", risk: 0.91, affinity: "—",             status: "Failed",   date: "2025-04-12 13:20", length: 0 },
  { id: "MTC-006", gene: "TP53",   variant: "R175H",             disease: "Colorectal Cancer",target: "TP53", risk: 0.83, affinity: "-7.3 kcal/mol", status: "Complete", date: "2025-04-10 10:55", length: 174 },
];

const riskColor = r => r >= 0.7 ? "#e05c5c" : r >= 0.4 ? "#f0a500" : "#6fcf7a";
const riskLabel = r => r >= 0.7 ? "HIGH" : r >= 0.4 ? "MED" : "LOW";

function Icon({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, flexShrink: 0 };
  switch (n) {
    case "search":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>;
    case "download": return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round"/></svg>;
    case "eye":      return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "trash":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
    case "filter":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
    default: return null;
  }
}

export default function History() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = HISTORY.filter(h => {
    const matchSearch = !search || h.gene.toLowerCase().includes(search.toLowerCase()) || h.disease.toLowerCase().includes(search.toLowerCase()) || h.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || h.status === filter || (filter === "High Risk" && h.risk >= 0.7);
    return matchSearch && matchFilter;
  });

  return (
    <>
      <Head><title>History — MutaCure AR</title></Head>
      <Layout pageTitle="History">

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { label: "Total Analyses", value: HISTORY.length, color: "#4caf50" },
            { label: "Completed",      value: HISTORY.filter(h => h.status === "Complete").length, color: "#4caf50" },
            { label: "High Risk",      value: HISTORY.filter(h => h.risk >= 0.7).length, color: "#e05c5c" },
            { label: "Failed",         value: HISTORY.filter(h => h.status === "Failed").length, color: "#f0a500" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e6ebe6", padding: "18px 20px" }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#6a8a6a", fontFamily: "'DM Sans',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e6ebe6", overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f5f0", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8faf8", border: "1px solid #e6ebe6", borderRadius: 9, padding: "8px 12px", flex: 1, maxWidth: 280 }}>
                <Icon n="search" s={14} c="#8aaa8a" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by gene, disease, ID..."
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: 12, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif", width: "100%" }}
                />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["All", "Complete", "Failed", "High Risk"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ padding: "7px 13px", borderRadius: 8, border: "1px solid", fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, cursor: "pointer", borderColor: filter === f ? "#4caf50" : "#e6ebe6", background: filter === f ? "#f0faf0" : "#fff", color: filter === f ? "#2d7a31" : "#6a8a6a" }}
                  >{f}</button>
                ))}
              </div>
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "1px solid #e6ebe6", background: "#f8faf8", color: "#4a6a4a", fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, cursor: "pointer" }}>
              <Icon n="download" s={13} c="#4a6a4a" /> Export CSV
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8faf8" }}>
                  {["ID", "Gene", "Disease", "Variant", "Target", "Risk", "Affinity", "Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 600, color: "#8aaa8a", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'DM Mono',monospace", textAlign: "left", whiteSpace: "nowrap", borderBottom: "1px solid #f0f5f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f0f5f0" : "none" }}>
                    <td style={{ padding: "13px 16px", fontSize: 11, color: "#6a8a6a", fontFamily: "'DM Mono',monospace" }}>{row.id}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif" }}>{row.gene}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#4a6a4a", fontFamily: "'DM Sans',sans-serif" }}>{row.disease}</td>
                    <td style={{ padding: "13px 16px", fontSize: 11, color: "#6a8a6a", fontFamily: "'DM Mono',monospace" }}>{row.variant}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#2d7a31", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{row.target}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, background: `${riskColor(row.risk)}15`, color: riskColor(row.risk), fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{riskLabel(row.risk)} · {row.risk}</span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: row.affinity === "—" ? "#9aaa9a" : "#1a2e1a", fontFamily: "'DM Mono',monospace" }}>{row.affinity}</td>
                    <td style={{ padding: "13px 16px", fontSize: 11, color: "#9aaa9a", fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>{row.date}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 5, fontFamily: "'DM Mono',monospace", fontWeight: 600, background: row.status === "Complete" ? "#e8f5e9" : "#fff5f0", color: row.status === "Complete" ? "#2d7a31" : "#e05c5c" }}>{row.status}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => router.push(`/protein?target=${row.target}&gene=${row.gene}&variant=${row.variant}&risk=${row.risk}`)}
                          style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #c8e6c9", background: "#f0faf0", color: "#2d7a31", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans',sans-serif" }}
                        >
                          <Icon n="eye" s={12} c="#2d7a31" /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "#9aaa9a", fontFamily: "'DM Sans',sans-serif" }}>
                      No analyses match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </Layout>
    </>
  );
}