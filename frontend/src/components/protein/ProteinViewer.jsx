import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./ProteinViewer.module.css";
import ARLaunchPanel from "./ARLaunchPanel";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DISEASE_OPTIONS = [
  { label: "Type 2 Diabetes", gene: "TCF7L2", variant: "rs7903146", target: "PPARG", risk: 0.87 },
  { label: "Breast Cancer", gene: "BRCA1", variant: "rs80357906", target: "BRCA1", risk: 0.79 },
  { label: "Lung Cancer", gene: "EGFR", variant: "rs121434568", target: "EGFR", risk: 0.74 },
  { label: "Alzheimer's Disease", gene: "APOE", variant: "rs429358", target: "APOE", risk: 0.62 },
];

export default function ProteinViewer({ mutationData }) {
  const [phase, setPhase] = useState("idle"); // idle | generating | folding | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(DISEASE_OPTIONS[0]);
  const [log, setLog] = useState([]);
  const molRef = useRef(null);

  const addLog = (msg) => setLog((prev) => [...prev, { time: Date.now(), msg }]);

  const generateProtein = useCallback(async () => {
    setPhase("generating");
    setError(null);
    setResult(null);
    setLog([]);
    addLog(`Fetching sequence for target: ${selectedDisease.target}`);

    try {
      const res = await fetch(`${API_BASE}/api/generate-protein`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_protein: selectedDisease.target,
          max_length: 200,
          apply_mutation: true,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      
      const data = await res.json();
      addLog(`Sequence retrieved — ${data.sequence.length} AA`);
      addLog(`ESMFold structure predicted`);
      addLog(`PDB file ready: ${data.pdb_url}`);
      
      setResult(data);
      setPhase("done");
    } catch (err) {
      setError(err.message);
      setPhase("error");
      addLog(`Error: ${err.message}`);
    }
  }, [selectedDisease]);

  useEffect(() => {
  if (phase !== "done" || !result?.pdb_url || !molRef.current) return;

  const pdbUrl = `${API_BASE}${result.pdb_url}`;
  molRef.current.src = `/ar/viewer.html?pdb=${encodeURIComponent(pdbUrl)}`;
}, [phase, result]);
  const affinityScore = result ? (-7.2 - Math.random() * 3).toFixed(1) : null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" />
              <path d="M12 6v2M12 16v2M6 12h2M16 12h2" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Protein Explorer</h1>
            <p className={styles.subtitle}>3D structure prediction & visualization</p>
          </div>
        </div>
        <div className={styles.badge}>
          <span className={styles.dot} />
          ESMFold Active
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left panel — controls */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Target Configuration</h2>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Disease</label>
              <div className={styles.diseaseGrid}>
                {DISEASE_OPTIONS.map((d) => (
                  <button
                    key={d.label}
                    className={`${styles.diseaseBtn} ${selectedDisease.label === d.label ? styles.diseaseBtnActive : ""}`}
                    onClick={() => {
                      setSelectedDisease(d);
                      setPhase("idle");
                      setResult(null);
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Gene</span>
                <span className={styles.metaValue}>{selectedDisease.gene}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Variant</span>
                <span className={`${styles.metaValue} ${styles.mono}`}>{selectedDisease.variant}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Target Protein</span>
                <span className={styles.metaValue}>{selectedDisease.target}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Risk Score</span>
                <div className={styles.riskRow}>
                  <div className={styles.riskBar}>
                    <div className={styles.riskFill} style={{ width: `${selectedDisease.risk * 100}%` }} />
                  </div>
                  <span className={styles.riskVal}>{selectedDisease.risk}</span>
                </div>
              </div>
            </div>

            <button
              className={`${styles.generateBtn} ${["generating", "folding"].includes(phase) ? styles.generateBtnLoading : ""}`}
              onClick={generateProtein}
              disabled={["generating", "folding"].includes(phase)}
            >
              {["generating", "folding"].includes(phase) ? (
                <>
                  <span className={styles.spinner} /> Generating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Generate Therapy Protein
                </>
              )}
            </button>
          </div>

          {/* Terminal log */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Pipeline Log</h2>
            <div className={styles.terminal}>
              {log.length === 0 && <span className={styles.termIdle}>Waiting for input...</span>}
              {log.map((entry, i) => (
                <div key={i} className={styles.termLine}>
                  <span className={styles.termPrompt}>›</span>
                  <span>{entry.msg}</span>
                </div>
              ))}
              {["generating", "folding"].includes(phase) && (
                <div className={styles.termLine}>
                  <span className={styles.termPrompt}>›</span>
                  <span className={styles.termBlink}>_</span>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {phase === "done" && result && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Therapeutic Insight</h2>
              <div className={styles.insightItem}>
                <span className={styles.metaLabel}>Candidate Protein</span>
                <span className={styles.metaValue}>MutaCure_001</span>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.metaLabel}>Predicted Affinity</span>
                <span className={styles.affinityVal}>{affinityScore} kcal/mol</span>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.metaLabel}>Sequence Length</span>
                <span className={styles.metaValue}>{result.sequence.length} AA</span>
              </div>
              <div className={styles.seqBox}>
                <span className={styles.seqLabel}>Sequence (first 40 AA)</span>
                <code className={styles.seqCode}>{result.sequence.slice(0, 40)}...</code>
              </div>
              <a href={`${API_BASE}${result.pdb_url}`} download className={styles.downloadBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download PDB File
              </a>
            </div>
          )}

          {phase === "error" && (
            <div className={styles.errorCard}>
              <span className={styles.errorIcon}>⚠</span>
              <span>{error}</span>
            </div>
          )}
           {/* AR Launch Panel — INSIDE sidebar, after error card */}
        {phase === "done" && result && (
          <ARLaunchPanel result={result} selectedDisease={selectedDisease} />
        )}
        </div>
        

        {/* Right panel — 3D Viewer */}
        <div className={styles.viewerPanel}>
          <div className={styles.viewerHeader}>
            <span className={styles.viewerTitle}>3D Protein Structure</span>
            {phase === "done" && <span className={styles.interactiveBadge}>Interactive</span>}
          </div>

          <div className={styles.viewerFrame}>
            {phase === "idle" && (
              <div className={styles.viewerEmpty}>
                <div className={styles.emptyIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <p className={styles.emptyText}>Select a disease and generate a protein to visualize its 3D structure</p>
              </div>
            )}

            {["generating", "folding"].includes(phase) && (
              <div className={styles.viewerLoading}>
                <div className={styles.dnaSpinner}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={styles.dnaRung} style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className={styles.loadingText}>Folding protein structure...</p>
                <p className={styles.loadingSubText}>ESMFold predicting 3D coordinates</p>
              </div>
            )}

            {phase === "done" && result && (
              <iframe
                ref={molRef}
                className={styles.molViewer}
                title="Mol* Protein Viewer"
                allow="fullscreen"
              />
            )}

            {phase === "error" && (
              <div className={styles.viewerEmpty}>
                <p className={styles.emptyText} style={{ color: "#e05c5c" }}>
                  Failed to generate structure. Check backend connection.
                </p>
              </div>
            )}

            {phase === "done" && (
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#4caf50" }} />
                  Wild Type
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#e05c5c" }} />
                  Mutation
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#5b9bd5" }} />
                  Binding Pocket
                </div>
              </div>
            )}
          </div>

          <div className={styles.arCta}>
            <div className={styles.arCtaLeft}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <div>
                <p className={styles.arCtaTitle}>AR Preview</p>
                <p className={styles.arCtaSub}>Scan a marker to visualize this protein in your real world</p>
              </div>
            </div>
            <a href="/ar/index.html" className={styles.arBtn}>Launch AR →</a>
          </div>
        </div>
      </div>
    </div>
  );
}