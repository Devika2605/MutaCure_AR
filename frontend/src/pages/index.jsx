import Head from "next/head";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DISEASE_OPTIONS = [
  { label: "Type 2 Diabetes",    gene: "TCF7L2", chromosome: 10 },
  { label: "Breast Cancer",      gene: "BRCA1",  chromosome: 17 },
  { label: "Lung Cancer",        gene: "EGFR",   chromosome: 7  },
  { label: "Alzheimer's",        gene: "APOE",   chromosome: 19 },
  { label: "Hemochromatosis",    gene: "HFE",    chromosome: 6  },
];

export default function MutationDashboard() {
  const [selected,    setSelected]    = useState(DISEASE_OPTIONS[0]);
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [log,         setLog]         = useState([]);

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const runMutation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLog([]);

    addLog(`Querying ClinVar for gene: ${selected.gene}`);
    addLog(`Running risk model...`);

    try {
      const res = await fetch(`${API_BASE}/api/mutate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gene:         selected.gene,
          variant_type: "snv",
          chromosome:   selected.chromosome,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      addLog(`Variant found: ${data.variant}`);
      addLog(`Target protein: ${data.target_protein}`);
      addLog(`Risk score computed: ${data.risk}`);

      setResult(data);
    } catch (err) {
      setError(err.message);
      addLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (risk) => {
    if (risk >= 0.7) return "#e05c5c";
    if (risk >= 0.4) return "#f0a500";
    return "#6fcf7a";
  };

  const riskLabel = (risk) => {
    if (risk >= 0.7) return "HIGH";
    if (risk >= 0.4) return "MEDIUM";
    return "LOW";
  };

  return (
    <>
      <Head>
        <title>MutaCure AR — Mutation Analysis</title>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </Head>

      <div style={styles.page}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#6fcf7a" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 style={styles.title}>MutaCure AR</h1>
              <p style={styles.subtitle}>Mutation → Therapy → AR Pipeline</p>
            </div>
          </div>
          <a href="/protein" style={styles.navBtn}>
            Protein Explorer →
          </a>
        </div>

        <div style={styles.layout}>

          {/* ── Left: Controls ── */}
          <div style={styles.sidebar}>

            {/* Disease selector */}
            <div style={styles.card}>
              <p style={styles.cardTitle}>Select Disease</p>
              <div style={styles.diseaseGrid}>
                {DISEASE_OPTIONS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => { setSelected(d); setResult(null); setLog([]); }}
                    style={{
                      ...styles.diseaseBtn,
                      ...(selected.label === d.label ? styles.diseaseBtnActive : {})
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected info */}
            <div style={styles.card}>
              <p style={styles.cardTitle}>Query Parameters</p>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Gene</span>
                <span style={styles.metaValue}>{selected.gene}</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Chromosome</span>
                <span style={styles.metaValue}>{selected.chromosome}</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Variant Type</span>
                <span style={styles.metaValue}>SNV</span>
              </div>

              <button
                onClick={runMutation}
                disabled={loading}
                style={{ ...styles.runBtn, ...(loading ? styles.runBtnDisabled : {}) }}
              >
                {loading ? (
                  <span style={styles.spinner}>⟳ Analyzing...</span>
                ) : (
                  "▶ Run Mutation Analysis"
                )}
              </button>
            </div>

            {/* Terminal log */}
            <div style={styles.card}>
              <p style={styles.cardTitle}>Pipeline Log</p>
              <div style={styles.terminal}>
                {log.length === 0
                  ? <span style={styles.termIdle}>Waiting for input...</span>
                  : log.map((line, i) => (
                    <div key={i} style={styles.termLine}>
                      <span style={styles.termPrompt}>›</span> {line}
                    </div>
                  ))
                }
              </div>
            </div>

          </div>

          {/* ── Right: Results ── */}
          <div style={styles.resultsPanel}>

            {!result && !error && (
              <div style={styles.emptyState}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
                  stroke="#6fcf7a" strokeWidth="0.8" opacity="0.3">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
                </svg>
                <p style={styles.emptyText}>
                  Select a disease and run mutation analysis to see results
                </p>
              </div>
            )}

            {error && (
              <div style={styles.errorBox}>
                ⚠ {error}
              </div>
            )}

            {result && (
              <>
                {/* Main result card */}
                <div style={styles.resultCard}>
                  <div style={styles.resultHeader}>
                    <span style={styles.resultTitle}>Mutation Result</span>
                    <span style={{
                      ...styles.riskBadge,
                      background: riskColor(result.risk) + "22",
                      border: `1px solid ${riskColor(result.risk)}55`,
                      color: riskColor(result.risk),
                    }}>
                      {riskLabel(result.risk)} RISK
                    </span>
                  </div>

                  <div style={styles.resultGrid}>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Gene</span>
                      <span style={styles.resultValue}>{result.gene}</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Variant</span>
                      <span style={{ ...styles.resultValue, fontFamily: "DM Mono, monospace", fontSize: 13 }}>
                        {result.variant}
                      </span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Target Protein</span>
                      <span style={{ ...styles.resultValue, color: "#6fcf7a" }}>
                        {result.target_protein}
                      </span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>ClinVar ID</span>
                      <span style={{ ...styles.resultValue, fontFamily: "DM Mono, monospace", fontSize: 12 }}>
                        {result.clinvar_id}
                      </span>
                    </div>
                  </div>

                  {/* Risk score bar */}
                  <div style={{ marginTop: 20 }}>
                    <div style={styles.riskHeader}>
                      <span style={styles.resultLabel}>Risk Score</span>
                      <span style={{ ...styles.resultValue, color: riskColor(result.risk) }}>
                        {result.risk}
                      </span>
                    </div>
                    <div style={styles.riskBarBg}>
                      <div style={{
                        ...styles.riskBarFill,
                        width: `${result.risk * 100}%`,
                        background: riskColor(result.risk),
                      }} />
                    </div>
                  </div>
                </div>

                {/* Pathway card */}
                <div style={styles.pathwayCard}>
                  <p style={styles.cardTitle}>Pathway Explanation</p>
                  <p style={styles.pathwayText}>
                    The <strong style={{ color: "#6fcf7a" }}>{result.gene}</strong> gene variant{" "}
                    <strong style={{ color: "#8bc34a" }}>{result.variant}</strong> affects the{" "}
                    <strong style={{ color: "#6fcf7a" }}>{result.target_protein}</strong> protein,
                    which plays a key role in metabolic regulation and cellular signaling.
                    A risk score of <strong style={{ color: riskColor(result.risk) }}>{result.risk}</strong>{" "}
                    indicates a <strong style={{ color: riskColor(result.risk) }}>{riskLabel(result.risk).toLowerCase()}</strong>{" "}
                    likelihood of pathogenic impact.
                  </p>

                  <a href={`/protein?target=${result.target_protein}`}
    style={styles.ctaBtn}
  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                    </svg>
                    View {result.target_protein} in Protein Explorer →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0d1a0f",
    color: "#e8f0e8",
    fontFamily: "'DM Mono', 'Fira Code', monospace",
    padding: "24px",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 24, paddingBottom: 20,
    borderBottom: "1px solid rgba(74,163,84,0.15)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    background: "rgba(74,163,84,0.15)",
    border: "1px solid rgba(74,163,84,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  title: {
    fontFamily: "'DM Sans', sans-serif", fontSize: 22,
    fontWeight: 600, color: "#e8f0e8", margin: 0,
  },
  subtitle: {
    fontSize: 12, color: "rgba(232,240,232,0.45)",
    margin: "2px 0 0", fontFamily: "'DM Mono', monospace",
  },
  navBtn: {
    padding: "8px 16px",
    background: "rgba(74,163,84,0.1)",
    border: "1px solid rgba(74,163,84,0.25)",
    borderRadius: 8, color: "#6fcf7a",
    fontSize: 12, textDecoration: "none",
    fontFamily: "'DM Mono', monospace",
  },
  layout: {
    display: "grid", gridTemplateColumns: "300px 1fr",
    gap: 20, alignItems: "start",
  },
  sidebar: { display: "flex", flexDirection: "column", gap: 16 },
  card: {
    background: "#111d13",
    border: "1px solid rgba(74,163,84,0.15)",
    borderRadius: 14, padding: 18,
  },
  cardTitle: {
    fontFamily: "'DM Sans', sans-serif", fontSize: 11,
    fontWeight: 500, color: "rgba(232,240,232,0.45)",
    textTransform: "uppercase", letterSpacing: "0.08em",
    margin: "0 0 14px",
  },
  diseaseGrid: { display: "flex", flexDirection: "column", gap: 8 },
  diseaseBtn: {
    padding: "9px 12px", background: "rgba(232,240,232,0.04)",
    border: "1px solid rgba(74,163,84,0.12)",
    borderRadius: 8, color: "rgba(232,240,232,0.6)",
    fontSize: 12, fontFamily: "'DM Mono', monospace",
    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
  },
  diseaseBtnActive: {
    borderColor: "rgba(74,163,84,0.6)",
    background: "rgba(74,163,84,0.12)",
    color: "#6fcf7a",
  },
  metaRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  metaLabel: { fontSize: 11, color: "rgba(232,240,232,0.35)", textTransform: "uppercase" },
  metaValue: { fontSize: 13, color: "#e8f0e8", fontFamily: "'DM Mono', monospace" },
  runBtn: {
    width: "100%", padding: 13, marginTop: 16,
    background: "#2d6a31", border: "none",
    borderRadius: 10, color: "#e8f0e8",
    fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500, cursor: "pointer",
  },
  runBtnDisabled: { background: "#1d4a21", cursor: "not-allowed" },
  spinner: { display: "inline-block", animation: "spin 1s linear infinite" },
  terminal: {
    background: "#080f09", borderRadius: 8,
    border: "1px solid rgba(74,163,84,0.12)",
    padding: 12, minHeight: 90, maxHeight: 150,
    overflowY: "auto", fontSize: 11,
  },
  termIdle: { color: "rgba(232,240,232,0.25)", fontStyle: "italic" },
  termLine: { marginBottom: 4, color: "rgba(232,240,232,0.7)" },
  termPrompt: { color: "#4caf50", marginRight: 6 },
  resultsPanel: {
    background: "#111d13",
    border: "1px solid rgba(74,163,84,0.15)",
    borderRadius: 14, padding: 24, minHeight: 400,
  },
  emptyState: {
    height: 350, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 16,
  },
  emptyText: {
    fontSize: 13, color: "rgba(232,240,232,0.3)",
    textAlign: "center", maxWidth: 280, lineHeight: 1.6,
    fontFamily: "'DM Sans', sans-serif",
  },
  errorBox: {
    background: "rgba(224,92,92,0.08)",
    border: "1px solid rgba(224,92,92,0.25)",
    borderRadius: 10, padding: 16,
    color: "#e05c5c", fontSize: 13,
  },
  resultCard: {
    background: "#0d1a0f",
    border: "1px solid rgba(74,163,84,0.2)",
    borderRadius: 12, padding: 20, marginBottom: 16,
  },
  resultHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  resultTitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16, fontWeight: 600, color: "#e8f0e8",
  },
  riskBadge: {
    padding: "4px 12px", borderRadius: 20,
    fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 500,
  },
  resultGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
  },
  resultItem: { display: "flex", flexDirection: "column", gap: 4 },
  resultLabel: {
    fontSize: 10, color: "rgba(232,240,232,0.35)",
    textTransform: "uppercase", letterSpacing: "0.07em",
  },
  resultValue: {
    fontSize: 15, color: "#e8f0e8",
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
  },
  riskHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },
  riskBarBg: {
    height: 6, background: "rgba(232,240,232,0.08)",
    borderRadius: 3, overflow: "hidden",
  },
  riskBarFill: { height: "100%", borderRadius: 3, transition: "width 0.5s ease" },
  pathwayCard: {
    background: "#0d1a0f",
    border: "1px solid rgba(74,163,84,0.15)",
    borderRadius: 12, padding: 20,
  },
  pathwayText: {
    fontSize: 13, color: "rgba(232,240,232,0.65)",
    lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", margin: "0 0 16px",
  },
  ctaBtn: {
    display: "inline-flex", alignItems: "center",
    padding: "10px 16px",
    background: "rgba(74,163,84,0.1)",
    border: "1px solid rgba(74,163,84,0.25)",
    borderRadius: 8, color: "#6fcf7a",
    fontSize: 12, textDecoration: "none",
    fontFamily: "'DM Mono', monospace",
  },
};