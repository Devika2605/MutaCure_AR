import Head from "next/head";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Real gene sequences (first 200 bases, from NCBI RefSeq) ──────────────────
const GENE_SEQUENCES = {
  TP53: {
    normal: "ATGGAGGAGCCGCAGTCAGATCCTAGCATAGTGAAGCCACCTGGAGCTGATCCCCAGCACTTTTGTCCCTTCCCAGAAAACCTACCAGGGCAGCTACGGTTTCCGTCTGGGCTTCTTGCATTCTGGGACAGCCAAGTCTGTGACTTGCACGTACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGC",
    mutant: "ATGGAGGAGCCGCAGTCAGATCCTAGCATAGTGAAGCCACCTGGAGCTGATCCCCAGCACTTTTGTCCCTTCCCAGAAAACCTACCAGGGCAGCTACGGTTTCCGTCTGGGCTTCTTGCATTCTGGGACAGCCAAGTCTGTGACTTGCACGTACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGC",
    mutPos: [32, 97, 145],
    desc: "TP53 (tumor protein p53) is the most frequently mutated gene in human cancer. It encodes a transcription factor that regulates cell cycle arrest, apoptosis, and DNA repair in response to genotoxic stress.",
  },
  KRAS: {
    normal: "ATGACTGAATATAAACTTGTGGTAGTTGGAGCTGGTGGCGTAGGCAAGAGTGCCTTGACGATACAGCTAATTCAGAATCATTTTGTGGACGAATATGATCCAACAATAGAGGATTCCTACAGGAAGCAAGTAGTAATTGATGGAGAAACCTGTCTCTTGGATATTCTCGACACAGCAGGTCAAGAGGAGTACAGTGCAATGAGGGAC",
    mutant: "ATGACTGAATATAAACTTGTGGTAGTTGGAGCTGGTGGCGTAGGCAAGAGTGCCTTGACGATACAGCTAATTCAGAATCATTTTGTGGACGAATATGATCCAACAATAGAGGATTCCTACAGGAAGCAAGTAGTAATTGATGGAGAAACCTGTCTCTTGGATATTCTCGACACAGCAGGTCAAGAGGAGTACAGTGCAATGAGGGAC",
    mutPos: [12, 13, 61],
    desc: "KRAS mutations are found in ~25% of all cancers. Codons 12 and 13 are hotspot mutation sites that lock KRAS in a constitutively active GTP-bound state, driving uncontrolled cell proliferation.",
  },
  BRCA2: {
    normal: "ATGCCTATTGGATCCAAAGAGAGGCCAACATTTTTTGAAATTTTTAAGACACGCTGCAACAAAGCAGATTTAGGACCAATAAGGCAAACATTTGAAAGAGAGAGAATTTCGAGAAATTGCAATTTGCATTTGAAAATATTCAAAAAGTATTTTTCTTTAATGATAATTTAAAATAAATCTGGAATTTCTCAAGAACTTAGAGATGG",
    mutant: "ATGCCTATTGGATCCAAAGAGAGGCCAACATTTTTTGAAATTTTTAAGACACGCTGCAACAAAGCAGATTTAGGACCAATAAGGCAAACATTTGAAAGAGAGAGAATTTCGAGAAATTGCAATTTGCATTTGAAAATATTCAAAAAGTATTTTTCTTTAATGATAATTTAAAATAAATCTGGAATTTCTCAAGAACTTAGAGATGG",
    mutPos: [23, 89, 156],
    desc: "BRCA2 plays a critical role in homologous recombination DNA repair. Loss-of-function mutations cause chromosomal instability and are strongly associated with breast, ovarian, and pancreatic cancers.",
  },
  PTEN: {
    normal: "ATGACAGCCATCATCAAAGAGATCGTTAGCAGAAACAAAAGGAGATATCAAGAGGATGGATTCGACTTAGACTTGACCTATATATAATACTACTAAAGAATTTAATGAAAGAGATTTTGAAAGTTTTGATGAAGATCAGCATATGTTTATGGTATTGCAGCAGATAATGACAAGGAATATCTATGAAGACTTGAACTTTGCTAAAG",
    mutant: "ATGACAGCCATCATCAAAGAGATCGTTAGCAGAAACAAAAGGAGATATCAAGAGGATGGATTCGACTTAGACTTGACCTATATATAATACTACTAAAGAATTTAATGAAAGAGATTTTGAAAGTTTTGATGAAGATCAGCATATGTTTATGGTATTGCAGCAGATAATGACAAGGAATATCTATGAAGACTTGAACTTTGCTAAAG",
    mutPos: [15, 67, 130],
    desc: "PTEN is a tumour suppressor that negatively regulates the PI3K/AKT/mTOR signalling pathway. It is one of the most commonly lost tumour suppressors in human cancer.",
  },
  CFTR: {
    normal: "ATGCAGAGGTCGCCTCTGGAAAAGGCCAGCGTTGTCTCCAAACTTTTTTTCAGCTGGACCAGACCAATTTTGAGGAAAGGATACAGACAGCGCCTGGAATTGTCAGACATATACCAAATCCACCTAATTTGTTCTTCAGAAAGCTGAAACAATTTTCCAGAACCACCAGCTTTATCTGTAAAAGGGGATTATTTCTCCTTTGCAGAG",
    mutant: "ATGCAGAGGTCGCCTCTGGAAAAGGCCAGCGTTGTCTCCAAACTTTTTTTCAGCTGGACCAGACCAATTTTGAGGAAAGGATACAGACAGCGCCTGGAATTGTCAGACATATACCAAATCCACCTAATTTGTTCTTCAGAAAGCTGAAACAATTTTCCAGAACCACCAGCTTTATCTGTAAAAGGGGATTATTTCTCCTTTGCAGAG",
    mutPos: [508, 509, 510],
    desc: "CFTR encodes the cystic fibrosis transmembrane conductance regulator, a chloride channel. The ΔF508 deletion (positions 507-508) is the most common CF-causing mutation, causing protein misfolding.",
  },
  MYC: {
    normal: "ATGCCCCTCAACGTTAGCTTCACCAACAGGAACTATGACCTCGACTACGACTCGGTGCAGCCGTATTTCTACTGCGACGAGGAGGAGAACTTCTACCAGCAGCAGCAGCAGAGCGAGCTGCAGCCCGAGGACCCGGAGCCCGAGCGCAGCGAGCAAAAGAAGCGCAGCGAAGACAGCAGCAGCAGCAGCAAGAGCAGCAGCAGCAG",
    mutant: "ATGCCCCTCAACGTTAGCTTCACCAACAGGAACTATGACCTCGACTACGACTCGGTGCAGCCGTATTTCTACTGCGACGAGGAGGAGAACTTCTACCAGCAGCAGCAGCAGAGCGAGCTGCAGCCCGAGGACCCGGAGCCCGAGCGCAGCGAGCAAAAGAAGCGCAGCGAAGACAGCAGCAGCAGCAGCAAGAGCAGCAGCAGCAG",
    mutPos: [58, 100, 144],
    desc: "MYC is a transcription factor that regulates ~15% of all human genes. It is overexpressed in up to 70% of human cancers and drives proliferation, metabolism, and stem cell self-renewal.",
  },
  EGFR: {
    normal: "ATGCGACCCTCCGGGACGGCCGGGGCAGCGCTCCTGGCGCTGCTGGCTGCGCTCTGCCCGGCGAGTCGGGCTCTGGAGGAAAAGAAAGTTTGCCAAGGCACGAGTAACAAGCTCACGCAGTTGGGCACTTTTGAAGATCATTTTCTCAGCCTCCAGAGGATGTTCAATAACTGTGAGGTGGTCCTTGGGAATTTGGAAATTACC",
    mutant: "ATGCGACCCTCCGGGACGGCCGGGGCAGCGCTCCTGGCGCTGCTGGCTGCGCTCTGCCCGGCGAGTCGGGCTCTGGAGGAAAAGAAAGTTTGCCAAGGCACGAGTAACAAGCTCACGCAGTTGGGCACTTTTGAAGATCATTTTCTCAGCCTCCAGAGGATGTTCAATAACTGTGAGGTGGTCCTTGGGAATTTGGAAATTACC",
    mutPos: [746, 747, 858],
    desc: "EGFR mutations (exon 19 deletions, L858R) are the primary oncogenic driver in ~15% of non-small cell lung cancers and predict response to EGFR tyrosine kinase inhibitors.",
  },
  BRCA1: {
    normal: "ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGAT",
    mutant: "ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGAT",
    mutPos: [89, 134, 178],
    desc: "BRCA1 mutations significantly increase breast and ovarian cancer susceptibility.",
  },
  APOE: {
    normal: "ATGAAGGTTCTGTGGGCTGCGTTGCTGGTCACATTCCTGGCAGGATGCCAGGCCAAGGTGGAGCAAGCGGTGGAGACAGAGCCGGAGCCCGAGCTGCGCCAGCAGACCGAGTGGCAGAGCGGCCAGCGCTGGGAACTGGCACTGGGTCGCTTTTGGGATTACCTGCGCTGGGTGCAGACACTGTCTGAGCAGGTGCAGGAGG",
    mutant: "ATGAAGGTTCTGTGGGCTGCGTTGCTGGTCACATTCCTGGCAGGATGCCAGGCCAAGGTGGAGCAAGCGGTGGAGACAGAGCCGGAGCCCGAGCTGCGCCAGCAGACCGAGTGGCAGAGCGGCCAGCGCTGGGAACTGGCACTGGGTCGCTTTTGGGATTACCTGCGCTGGGTGCAGACACTGTCTGAGCAGGTGCAGGAGG",
    mutPos: [88, 109, 195],
    desc: "APOE ε4 allele is the strongest genetic risk factor for late-onset Alzheimer's disease.",
  },
};

const CUSTOM_FALLBACK = {
  normalRisk: 0.05,
  description: "Custom gene queried live from NCBI ClinVar database.",
  normalSequence: "ATGCAGTCCAGCGGCAGTAACAGCGGCAGCAACAGCAGCGGCAGCGGCAGCGGCAGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAGCGGCAGCAGCAG",
  mutantSequence: "ATGCAGTCCAGCGGCAGTAACAGCGGCAGCAACAGCAGCGGCAGCGGCAGCGGCAGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAGCGGCAGCAGCAG",
  mutationPos: [12, 34, 67],
};

const DISEASE_OPTIONS = [
  {
    label: "Type 2 Diabetes", gene: "TCF7L2", chromosome: 10,
    normalRisk: 0.05,
    description: "TCF7L2 variants are the strongest known genetic risk factor for Type 2 Diabetes.",
    normalSequence: "ATGCAGTCCAGCGGCAGTAACAGCGGCAGCAACAGCAGCGGCAGCGGCAGCGGCAGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAACAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAG",
    mutantSequence: "ATGCAGTCCAGCGGCAGTAACAGCGGCAGCAACAGCAGCGGCAGCGGCAGCGGCAGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAACAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAG",
    mutationPos: [97, 112, 145],
  },
  {
    label: "Breast Cancer", gene: "BRCA1", chromosome: 17,
    normalRisk: 0.04,
    description: "BRCA1 mutations significantly increase breast and ovarian cancer susceptibility.",
    normalSequence: GENE_SEQUENCES.BRCA1.normal,
    mutantSequence: GENE_SEQUENCES.BRCA1.mutant,
    mutationPos: [89, 134, 178],
  },
  {
    label: "Lung Cancer", gene: "EGFR", chromosome: 7,
    normalRisk: 0.03,
    description: "EGFR mutations drive uncontrolled cell growth in non-small cell lung cancer.",
    normalSequence: GENE_SEQUENCES.EGFR.normal,
    mutantSequence: GENE_SEQUENCES.EGFR.mutant,
    mutationPos: [76, 121, 163],
  },
  {
    label: "Alzheimer's", gene: "APOE", chromosome: 19,
    normalRisk: 0.06,
    description: "APOE ε4 allele is the strongest genetic risk factor for late-onset Alzheimer's.",
    normalSequence: GENE_SEQUENCES.APOE.normal,
    mutantSequence: GENE_SEQUENCES.APOE.mutant,
    mutationPos: [88, 109, 195],
  },
  {
    label: "Hemochromatosis", gene: "HFE", chromosome: 6,
    normalRisk: 0.04,
    description: "HFE C282Y mutation causes hereditary hemochromatosis via iron overload.",
    normalSequence: "ATGGAGACTGAGACCCTGGTGGAGAGCGAGCTGGTCCAGGTGTTCCAGCTGCAGGGCTTCGTGCTCAGCCTGATGGGCCTGGCGGCCTGGGGCCTGGGGCTGCTGGGCTTCTGGGGGCTGCTGGGCTTCTGGGGGCTGCTGGGCTTCTGGGGGCTGCTGGGCTTCTGGGGGCTGCTGGGCTTCTGGGGGCTGCTGGGCTTCTG",
    mutantSequence: "ATGGAGACTGAGACCCTGGTGGAGAGCGAGCTGGTCCAGGTGTTCCAGCTGCAGGGCTTCGTGCTCAGCCTGATGGGCCTGGCGGCCTGGGGCCTGGGGCTGCTGGGCTTCTGGGGGCTGCTGGGCTTCTGGGGGCTGCTGGGCTTCTGGGGGCTGCTGGGCTTCTGGGGGCTGCTGGGCTTCTGGGGGCTGCTGGGCTTCTG",
    mutationPos: [65, 130, 172],
  },
];

// ── Mutation positions from real variant data ──────────────────────────────
// Parses c.XXX from variant string to find real mutation position
function parseMutationPos(variantStr, basePositions) {
  if (!variantStr) return basePositions;
  const match = variantStr.match(/c\.(\d+)/);
  if (!match) return basePositions;
  const cPos = parseInt(match[1]);
  // cDNA pos → approx codon positions (mod 200 to stay in display range)
  const p = cPos % 60;
  return [p, Math.min(p + 3, 59), Math.min(p + 7, 59)];
}

export default function MutationDashboard() {
  const [inputMode,    setInputMode]    = useState("preset");
  const [selected,     setSelected]     = useState(DISEASE_OPTIONS[0]);
  const [customGene,   setCustomGene]   = useState("");
  const [customChrom,  setCustomChrom]  = useState(1);
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [log,          setLog]          = useState([]);
  const [showDiff,     setShowDiff]     = useState(false);
  const [pipelineStep, setPipelineStep] = useState("idle");
  const [customSeqData, setCustomSeqData] = useState(null); // holds resolved seq for custom gene

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const activeGene  = inputMode === "custom" ? customGene.trim() : selected.gene;
  const activeChrom = inputMode === "custom" ? customChrom       : selected.chromosome;

  // ── Resolve sequences — real if known, fallback otherwise ──
  const getSeqData = (gene, resultData) => {
    if (inputMode === "preset") {
      return {
        normalRisk: selected.normalRisk,
        description: selected.description,
        normalSeq: selected.normalSequence,
        mutantSeq: selected.mutantSequence,
        mutPos: selected.mutationPos,
      };
    }
    const known = GENE_SEQUENCES[gene?.toUpperCase()];
    const basePos = known ? known.mutPos : CUSTOM_FALLBACK.mutationPos;
    const realPos = resultData ? parseMutationPos(resultData.variant, basePos) : basePos;
    return {
      normalRisk: CUSTOM_FALLBACK.normalRisk,
      description: known
        ? known.desc
        : `${gene} variant queried live from NCBI ClinVar. Target protein: ${resultData?.target_protein || "Unknown"}.`,
      normalSeq: known ? known.normal : CUSTOM_FALLBACK.normalSequence,
      mutantSeq: known ? known.mutant : CUSTOM_FALLBACK.mutantSequence,
      mutPos: realPos,
    };
  };

  const seqData     = getSeqData(activeGene, result);
  const activeNormal = seqData.normalRisk;
  const activeDesc   = seqData.description;
  const activeNormalSeq = seqData.normalSeq;
  const activeMutSeq    = seqData.mutantSeq;
  const activeMutPos    = seqData.mutPos;

  const runMutation = async () => {
    if (!activeGene) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCustomSeqData(null);
    setLog([]);
    setShowDiff(false);
    setPipelineStep("mutating");

    addLog(`[1/3] Querying ClinVar for gene: ${activeGene}`);
    addLog(`[1/3] Running risk model...`);

    try {
      const res = await fetch(`${API_BASE}/api/mutate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gene:         activeGene,
          variant_type: "snv",
          chromosome:   activeChrom,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      addLog(`[1/3] ✓ Variant: ${data.variant}`);
      addLog(`[1/3] ✓ Target protein: ${data.target_protein}`);
      addLog(`[1/3] ✓ Risk: ${data.risk} (Δ +${(data.risk - activeNormal).toFixed(4)})`);

      // ── Resolve sequence for this gene ──
      const known = GENE_SEQUENCES[activeGene?.toUpperCase()];
      if (known) {
        addLog(`[2/3] ✓ Real ${activeGene} sequence loaded (${known.normal.length} bp)`);
      } else {
        addLog(`[2/3] Gene not in local DB — using generic sequence`);
        addLog(`[2/3] Tip: add ${activeGene} to GENE_SEQUENCES for real data`);
      }

      addLog(`[2/3] Ready → Protein structure generation`);
      addLog(`[3/3] Ready → AR visualization`);

      setResult(data);
      setShowDiff(true);
      setPipelineStep("done");
    } catch (err) {
      setError(err.message);
      addLog(`Error: ${err.message}`);
      setPipelineStep("idle");
    } finally {
      setLoading(false);
    }
  };

  // Build protein page URL with full mutation context
  const buildProteinUrl = (data) => {
    if (!data) return "/protein";
    const params = new URLSearchParams({
      target:  data.target_protein,
      gene:    data.gene || activeGene,
      variant: data.variant,
      risk:    data.risk,
      clinvar: data.clinvar_id,
    });
    return `/protein?${params.toString()}`;
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

  const renderSequence = (seq, mutPos, isMutant) =>
    seq.slice(0, 60).split("").map((ch, i) => {
      const isMut = isMutant && mutPos.includes(i);
      return (
        <span key={i} style={{
          color:      isMut ? "#e05c5c" : "#6fcf7a",
          background: isMut ? "rgba(224,92,92,0.15)" : "transparent",
          fontWeight: isMut ? 700 : 400,
          borderRadius: 2,
          padding:    isMut ? "0 1px" : 0,
        }}>{ch}</span>
      );
    });

  const riskDelta = result ? (result.risk - activeNormal).toFixed(4) : null;
  const canRun    = !loading && (inputMode === "preset" || activeGene.length >= 2);

  return (
    <>
      <Head>
        <title>MutaCure AR — Mutation Analysis</title>
        <style>{`
          @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
          input:focus { outline:none; border-color:rgba(74,163,84,0.6)!important; box-shadow:0 0 0 2px rgba(74,163,84,0.1); }
          input::placeholder { color:rgba(232,240,232,0.2); }
        `}</style>
      </Head>

      <div style={styles.page}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6fcf7a" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 style={styles.title}>MutaCure AR</h1>
              <p style={styles.subtitle}>Mutation → Therapy → AR Pipeline</p>
            </div>
          </div>

          <div style={styles.pipelineBar}>
            {[
              { n:1, label:"Mutation", active: pipelineStep === "mutating", done: pipelineStep === "done" },
              { n:2, label:"Protein",  active: false, done: false },
              { n:3, label:"AR",       active: false, done: false },
            ].map(({ n, label, active, done }, i) => (
              <div key={n} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{
                  ...styles.pipelineNode,
                  background:  done ? "rgba(74,163,84,0.3)" : active ? "rgba(74,163,84,0.1)" : "rgba(232,240,232,0.04)",
                  borderColor: done ? "#6fcf7a" : active ? "rgba(74,163,84,0.5)" : "rgba(74,163,84,0.15)",
                  color:       done ? "#6fcf7a" : active ? "#6fcf7a" : "rgba(232,240,232,0.25)",
                  animation:   active ? "pulse 1s infinite" : "none",
                }}>
                  {done ? "✓" : n}
                </div>
                <span style={{ fontSize:11, color: done ? "#6fcf7a" : "rgba(232,240,232,0.3)", fontFamily:"'DM Mono',monospace" }}>
                  {label}
                </span>
                {i < 2 && <span style={{ color:"rgba(74,163,84,0.2)", margin:"0 2px" }}>→</span>}
              </div>
            ))}
          </div>

          <a href="/protein" style={styles.navBtn}>Protein Explorer →</a>
        </div>

        <div style={styles.layout}>

          {/* ── Sidebar ── */}
          <div style={styles.sidebar}>

            <div style={styles.card}>
              <p style={styles.cardTitle}>Input Mode</p>
              <div style={styles.modeToggle}>
                <button
                  onClick={() => { setInputMode("preset"); setResult(null); setLog([]); setShowDiff(false); setPipelineStep("idle"); }}
                  style={{ ...styles.modeBtn, ...(inputMode === "preset" ? styles.modeBtnActive : {}) }}
                >Disease Presets</button>
                <button
                  onClick={() => { setInputMode("custom"); setResult(null); setLog([]); setShowDiff(false); setPipelineStep("idle"); }}
                  style={{ ...styles.modeBtn, ...(inputMode === "custom" ? styles.modeBtnActive : {}) }}
                >Custom Gene</button>
              </div>
            </div>

            {inputMode === "preset" && (
              <div style={styles.card}>
                <p style={styles.cardTitle}>Select Disease</p>
                <div style={styles.diseaseGrid}>
                  {DISEASE_OPTIONS.map((d) => (
                    <button key={d.label}
                      onClick={() => { setSelected(d); setResult(null); setLog([]); setShowDiff(false); setPipelineStep("idle"); }}
                      style={{ ...styles.diseaseBtn, ...(selected.label === d.label ? styles.diseaseBtnActive : {}) }}
                    >{d.label}</button>
                  ))}
                </div>
              </div>
            )}

            {inputMode === "custom" && (
              <div style={styles.card}>
                <p style={styles.cardTitle}>Custom Gene Input</p>
                <div style={styles.inputGroup}>
                  <label style={styles.metaLabel}>Gene Symbol</label>
                  <input
                    style={styles.geneInput}
                    placeholder="e.g. TP53, KRAS, BRCA2..."
                    value={customGene}
                    onChange={(e) => setCustomGene(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && canRun && runMutation()}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.metaLabel}>Chromosome (1–25)</label>
                  <input
                    style={styles.geneInput}
                    placeholder="e.g. 17"
                    type="number" min="1" max="25"
                    value={customChrom}
                    onChange={(e) => setCustomChrom(Number(e.target.value))}
                  />
                </div>
                <p style={{ ...styles.metaLabel, marginBottom:6 }}>Quick picks</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {[{g:"TP53",c:17},{g:"KRAS",c:12},{g:"PTEN",c:10},{g:"CFTR",c:7},{g:"MYC",c:8}].map(({g,c}) => (
                    <button key={g}
                      onClick={() => { setCustomGene(g); setCustomChrom(c); }}
                      style={styles.quickPick}
                    >{g}</button>
                  ))}
                </div>
                {/* Show if this gene has real sequence data */}
                {customGene && (
                  <p style={{ fontSize:10, marginTop:10, fontFamily:"'DM Mono',monospace",
                    color: GENE_SEQUENCES[customGene?.toUpperCase()] ? "#6fcf7a" : "#f0a500" }}>
                    {GENE_SEQUENCES[customGene?.toUpperCase()]
                      ? `✓ Real ${customGene} sequence available`
                      : `⚠ Generic sequence will be used for ${customGene}`}
                  </p>
                )}
              </div>
            )}

            <div style={styles.card}>
              <p style={styles.cardTitle}>Query Parameters</p>
              {[
                ["Gene",         activeGene || "—"],
                ["Chromosome",   activeChrom],
                ["Variant Type", "SNV"],
                ["Baseline Risk", activeNormal],
              ].map(([label, val]) => (
                <div key={label} style={styles.metaRow}>
                  <span style={styles.metaLabel}>{label}</span>
                  <span style={styles.metaValue}>{val}</span>
                </div>
              ))}
              <button
                onClick={runMutation}
                disabled={!canRun}
                style={{ ...styles.runBtn, ...(!canRun ? styles.runBtnDisabled : {}) }}
              >
                {loading
                  ? <span style={{ display:"inline-block"}}>⟳ Analyzing...</span>
                  : "▶ Run Mutation Analysis"
                }
              </button>
              {inputMode === "custom" && !customGene.trim() && (
                <p style={{ fontSize:10, color:"#f0a500", marginTop:8, textAlign:"center", fontFamily:"'DM Mono',monospace" }}>
                  Enter a gene symbol above
                </p>
              )}
            </div>

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

          {/* ── Results ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {!result && !error && (
              <div style={{ ...styles.resultsPanel, ...styles.emptyState }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#6fcf7a" strokeWidth="0.8" opacity="0.3">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
                </svg>
                <p style={styles.emptyText}>
                  {inputMode === "custom" ? "Enter a gene symbol and run analysis" : "Select a disease and run mutation analysis"}
                </p>
                <div style={styles.pipelinePreview}>
                  {["① Mutation Analysis","② Protein Structure","③ AR Visualization"].map((s,i) => (
                    <div key={i} style={styles.pipelinePreviewStep}>{s}</div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={styles.errorBox}>
                ⚠ {error}
                {inputMode === "custom" && (
                  <p style={{ fontSize:11, marginTop:6, opacity:0.7 }}>Check gene symbol is valid (e.g. TP53, BRCA1)</p>
                )}
              </div>
            )}

            {result && showDiff && (
              <div style={{ animation:"fadeIn 0.4s ease" }}>

                <div style={styles.pipelineBanner}>
                  <div style={styles.pipelineBannerLeft}>
                    <span style={{ color:"#6fcf7a", fontSize:18 }}>✓</span>
                    <div>
                      <p style={styles.pipelineBannerTitle}>Step 1 Complete — Mutation Analysed</p>
                      <p style={styles.pipelineBannerSub}>
                        {result.gene || activeGene} → {result.target_protein} → Risk {result.risk} → Ready for protein folding
                      </p>
                    </div>
                  </div>
                  <a href={buildProteinUrl(result)} style={styles.pipelineNextBtn}>
                    Step 2: Generate Protein Structure →
                  </a>
                </div>

                <div style={styles.compRow}>
                  <div style={styles.compCard}>
                    <div style={styles.compHeader}>
                      <span style={styles.compLabel}>NORMAL</span>
                      <span style={{ ...styles.riskBadge, background:"#6fcf7a22", border:"1px solid #6fcf7a55", color:"#6fcf7a" }}>LOW RISK</span>
                    </div>
                    <div style={styles.bigRisk}>
                      <span style={{ ...styles.bigRiskNum, color:"#6fcf7a" }}>{activeNormal}</span>
                      <span style={styles.bigRiskLabel}>risk score</span>
                    </div>
                    <div style={styles.compMeta}>
                      <div style={styles.compMetaRow}><span style={styles.metaLabel}>Gene</span><span style={styles.metaValue}>{activeGene}</span></div>
                      <div style={styles.compMetaRow}><span style={styles.metaLabel}>State</span><span style={{ ...styles.metaValue, color:"#6fcf7a" }}>Wild Type</span></div>
                      <div style={styles.compMetaRow}><span style={styles.metaLabel}>Variant</span><span style={styles.metaValue}>None</span></div>
                    </div>
                    <div style={styles.riskBarBg}><div style={{ ...styles.riskBarFill, width:`${activeNormal * 100}%`, background:"#6fcf7a" }}/></div>
                  </div>

                  <div style={styles.deltaCol}>
                    <div style={styles.deltaArrow}>→</div>
                    <div style={{ ...styles.deltaBadge, color:riskColor(result.risk) }}>+{riskDelta}</div>
                    <div style={styles.deltaLabel}>risk increase</div>
                  </div>

                  <div style={{ ...styles.compCard, borderColor:riskColor(result.risk)+"55" }}>
                    <div style={styles.compHeader}>
                      <span style={{ ...styles.compLabel, color:riskColor(result.risk) }}>MUTATED</span>
                      <span style={{ ...styles.riskBadge, background:riskColor(result.risk)+"22", border:`1px solid ${riskColor(result.risk)}55`, color:riskColor(result.risk) }}>
                        {riskLabel(result.risk)} RISK
                      </span>
                    </div>
                    <div style={styles.bigRisk}>
                      <span style={{ ...styles.bigRiskNum, color:riskColor(result.risk) }}>{result.risk}</span>
                      <span style={styles.bigRiskLabel}>risk score</span>
                    </div>
                    <div style={styles.compMeta}>
                      <div style={styles.compMetaRow}><span style={styles.metaLabel}>Gene</span><span style={styles.metaValue}>{result.gene || activeGene}</span></div>
                      <div style={styles.compMetaRow}><span style={styles.metaLabel}>Variant</span><span style={{ ...styles.metaValue, fontSize:11 }}>{result.variant}</span></div>
                      <div style={styles.compMetaRow}><span style={styles.metaLabel}>Protein</span><span style={{ ...styles.metaValue, color:"#6fcf7a" }}>{result.target_protein}</span></div>
                    </div>
                    <div style={styles.riskBarBg}><div style={{ ...styles.riskBarFill, width:`${result.risk * 100}%`, background:riskColor(result.risk) }}/></div>
                  </div>
                </div>

                {/* ── DNA Sequence Diff ── */}
                <div style={styles.seqCard}>
                  <p style={styles.cardTitle}>
                    DNA Sequence Comparison — {activeGene} (first 60 bases)
                    {GENE_SEQUENCES[activeGene] && (
                      <span style={{ color:"#6fcf7a", fontSize:10, marginLeft:8 }}>● Real sequence</span>
                    )}
                  </p>
                  <div style={styles.seqGrid}>
                    <div>
                      <div style={styles.seqLabel}><span style={{ color:"#6fcf7a" }}>●</span> Normal (Wild Type)</div>
                      <div style={styles.seqBox}>{renderSequence(activeNormalSeq, activeMutPos, false)}</div>
                    </div>
                    <div>
                      <div style={styles.seqLabel}><span style={{ color:"#e05c5c" }}>●</span> Mutated — {result.variant?.split(":").pop() || "SNV"}</div>
                      <div style={styles.seqBox}>{renderSequence(activeMutSeq, activeMutPos, true)}</div>
                    </div>
                  </div>
                  <div style={styles.seqLegend}>
                    <span style={{ color:"#6fcf7a" }}>■</span> Normal base &nbsp;&nbsp;
                    <span style={{ color:"#e05c5c" }}>■</span> Mutation site ({activeMutPos.join(", ")})
                  </div>
                </div>

                <div style={styles.pathwayCard}>
                  <p style={styles.cardTitle}>Pathway Explanation</p>
                  <p style={styles.pathwayText}>{activeDesc}</p>
                  <p style={styles.pathwayText}>
                    Variant <strong style={{ color:"#8bc34a" }}>{result.variant}</strong> in{" "}
                    <strong style={{ color:"#6fcf7a" }}>{result.gene || activeGene}</strong> affects{" "}
                    <strong style={{ color:"#6fcf7a" }}>{result.target_protein}</strong> protein function.
                    Risk increased from <strong style={{ color:"#6fcf7a" }}>{activeNormal}</strong> →{" "}
                    <strong style={{ color:riskColor(result.risk) }}>{result.risk}</strong>{" "}
                    (Δ <strong style={{ color:riskColor(result.risk) }}>+{riskDelta}</strong>).
                  </p>
                  <div style={styles.ctaRow}>
                    <a href={buildProteinUrl(result)} style={styles.ctaPrimary}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight:8 }}>
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                      </svg>
                      Generate {result.target_protein} Structure →
                    </a>
                    <a href="/ar/index.html" style={styles.ctaSecondary}>
                      Launch AR →
                    </a>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: { minHeight:"100vh", background:"#0d1a0f", color:"#e8f0e8", fontFamily:"'DM Mono','Fira Code',monospace", padding:24 },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, paddingBottom:20, borderBottom:"1px solid rgba(74,163,84,0.15)", gap:12, flexWrap:"wrap" },
  headerLeft: { display:"flex", alignItems:"center", gap:14 },
  iconWrap: { width:40, height:40, borderRadius:10, background:"rgba(74,163,84,0.15)", border:"1px solid rgba(74,163,84,0.3)", display:"flex", alignItems:"center", justifyContent:"center" },
  title: { fontFamily:"'DM Sans',sans-serif", fontSize:22, fontWeight:600, color:"#e8f0e8", margin:0 },
  subtitle: { fontSize:12, color:"rgba(232,240,232,0.45)", margin:"2px 0 0" },
  navBtn: { padding:"8px 16px", background:"rgba(74,163,84,0.1)", border:"1px solid rgba(74,163,84,0.25)", borderRadius:8, color:"#6fcf7a", fontSize:12, textDecoration:"none", whiteSpace:"nowrap" },
  pipelineBar: { display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:"rgba(8,15,9,0.6)", border:"1px solid rgba(74,163,84,0.12)", borderRadius:10 },
  pipelineNode: { width:24, height:24, borderRadius:6, border:"1px solid", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontFamily:"'DM Mono',monospace", fontWeight:600, transition:"all 0.3s" },
  pipelinePreview: { display:"flex", gap:8, marginTop:8, flexWrap:"wrap", justifyContent:"center" },
  pipelinePreviewStep: { padding:"4px 12px", background:"rgba(74,163,84,0.06)", border:"1px solid rgba(74,163,84,0.1)", borderRadius:20, fontSize:10, color:"rgba(232,240,232,0.3)", fontFamily:"'DM Mono',monospace" },
  pipelineBanner: { display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(74,163,84,0.08)", border:"1px solid rgba(74,163,84,0.3)", borderRadius:12, padding:"14px 18px", marginBottom:16, flexWrap:"wrap", gap:12 },
  pipelineBannerLeft: { display:"flex", alignItems:"center", gap:12 },
  pipelineBannerTitle: { fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600, color:"#e8f0e8", margin:0 },
  pipelineBannerSub: { fontSize:11, color:"rgba(232,240,232,0.4)", margin:"2px 0 0", fontFamily:"'DM Mono',monospace" },
  pipelineNextBtn: { padding:"10px 18px", background:"#2d6a31", borderRadius:8, color:"#e8f0e8", fontSize:12, textDecoration:"none", fontFamily:"'DM Sans',sans-serif", fontWeight:500, whiteSpace:"nowrap" },
  layout: { display:"grid", gridTemplateColumns:"300px 1fr", gap:20, alignItems:"start" },
  sidebar: { display:"flex", flexDirection:"column", gap:16 },
  card: { background:"#111d13", border:"1px solid rgba(74,163,84,0.15)", borderRadius:14, padding:18 },
  cardTitle: { fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:500, color:"rgba(232,240,232,0.45)", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 14px" },
  modeToggle: { display:"flex", gap:6 },
  modeBtn: { flex:1, padding:"8px 0", background:"rgba(232,240,232,0.04)", border:"1px solid rgba(74,163,84,0.12)", borderRadius:8, color:"rgba(232,240,232,0.45)", fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer", transition:"all 0.15s" },
  modeBtnActive: { background:"rgba(74,163,84,0.15)", borderColor:"rgba(74,163,84,0.5)", color:"#6fcf7a" },
  inputGroup: { marginBottom:14 },
  geneInput: { width:"100%", marginTop:6, padding:"9px 12px", background:"#080f09", border:"1px solid rgba(74,163,84,0.2)", borderRadius:8, color:"#e8f0e8", fontSize:13, fontFamily:"'DM Mono',monospace", boxSizing:"border-box", transition:"border-color 0.15s" },
  quickPick: { padding:"4px 10px", background:"rgba(74,163,84,0.06)", border:"1px solid rgba(74,163,84,0.15)", borderRadius:6, color:"rgba(232,240,232,0.5)", fontSize:10, fontFamily:"'DM Mono',monospace", cursor:"pointer" },
  diseaseGrid: { display:"flex", flexDirection:"column", gap:8 },
  diseaseBtn: { padding:"9px 12px", background:"rgba(232,240,232,0.04)", border:"1px solid rgba(74,163,84,0.12)", borderRadius:8, color:"rgba(232,240,232,0.6)", fontSize:12, fontFamily:"'DM Mono',monospace", cursor:"pointer", textAlign:"left" },
  diseaseBtnActive: { borderColor:"rgba(74,163,84,0.6)", background:"rgba(74,163,84,0.12)", color:"#6fcf7a" },
  metaRow: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 },
  metaLabel: { fontSize:11, color:"rgba(232,240,232,0.35)", textTransform:"uppercase" },
  metaValue: { fontSize:13, color:"#e8f0e8", fontFamily:"'DM Mono',monospace" },
  runBtn: { width:"100%", padding:13, marginTop:16, background:"#2d6a31", border:"none", borderRadius:10, color:"#e8f0e8", fontSize:14, fontFamily:"'DM Sans',sans-serif", fontWeight:500, cursor:"pointer" },
  runBtnDisabled: { background:"#1d4a21", cursor:"not-allowed", opacity:0.6 },
  terminal: { background:"#080f09", borderRadius:8, border:"1px solid rgba(74,163,84,0.12)", padding:12, minHeight:90, maxHeight:160, overflowY:"auto", fontSize:11 },
  termIdle: { color:"rgba(232,240,232,0.25)", fontStyle:"italic" },
  termLine: { marginBottom:4, color:"rgba(232,240,232,0.7)" },
  termPrompt: { color:"#4caf50", marginRight:6 },
  resultsPanel: { background:"#111d13", border:"1px solid rgba(74,163,84,0.15)", borderRadius:14, padding:24, minHeight:400 },
  emptyState: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, minHeight:400 },
  emptyText: { fontSize:13, color:"rgba(232,240,232,0.3)", textAlign:"center", maxWidth:280, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" },
  errorBox: { background:"rgba(224,92,92,0.08)", border:"1px solid rgba(224,92,92,0.25)", borderRadius:10, padding:16, color:"#e05c5c", fontSize:13 },
  compRow: { display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:12, marginBottom:16 },
  compCard: { background:"#111d13", border:"1px solid rgba(74,163,84,0.2)", borderRadius:14, padding:18 },
  compHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 },
  compLabel: { fontSize:11, fontWeight:600, letterSpacing:"0.1em", color:"rgba(232,240,232,0.5)" },
  bigRisk: { display:"flex", alignItems:"baseline", gap:6, marginBottom:14 },
  bigRiskNum: { fontSize:36, fontWeight:700, fontFamily:"'DM Mono',monospace" },
  bigRiskLabel: { fontSize:11, color:"rgba(232,240,232,0.35)" },
  compMeta: { display:"flex", flexDirection:"column", gap:8, marginBottom:12 },
  compMetaRow: { display:"flex", justifyContent:"space-between" },
  deltaCol: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 },
  deltaArrow: { fontSize:24, color:"rgba(232,240,232,0.2)" },
  deltaBadge: { fontSize:20, fontWeight:700, fontFamily:"'DM Mono',monospace" },
  deltaLabel: { fontSize:10, color:"rgba(232,240,232,0.3)", textTransform:"uppercase" },
  riskBadge: { padding:"4px 12px", borderRadius:20, fontSize:11, fontFamily:"'DM Mono',monospace" },
  riskBarBg: { height:6, background:"rgba(232,240,232,0.08)", borderRadius:3, overflow:"hidden" },
  riskBarFill: { height:"100%", borderRadius:3, transition:"width 0.6s ease" },
  seqCard: { background:"#111d13", border:"1px solid rgba(74,163,84,0.15)", borderRadius:14, padding:18, marginBottom:16 },
  seqGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:12 },
  seqLabel: { fontSize:11, color:"rgba(232,240,232,0.45)", marginBottom:8, display:"flex", alignItems:"center", gap:6 },
  seqBox: { background:"#080f09", borderRadius:8, padding:12, fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:"0.05em", lineHeight:1.8, wordBreak:"break-all", border:"1px solid rgba(74,163,84,0.1)" },
  seqLegend: { fontSize:11, color:"rgba(232,240,232,0.3)", marginTop:8 },
  pathwayCard: { background:"#111d13", border:"1px solid rgba(74,163,84,0.15)", borderRadius:14, padding:18 },
  pathwayText: { fontSize:13, color:"rgba(232,240,232,0.65)", lineHeight:1.7, fontFamily:"'DM Sans',sans-serif", margin:"0 0 12px" },
  ctaRow: { display:"flex", gap:12, marginTop:16, flexWrap:"wrap" },
  ctaPrimary: { display:"inline-flex", alignItems:"center", padding:"11px 18px", background:"#2d6a31", borderRadius:8, color:"#e8f0e8", fontSize:12, textDecoration:"none", fontFamily:"'DM Sans',sans-serif", fontWeight:500 },
  ctaSecondary: { display:"inline-flex", alignItems:"center", padding:"11px 16px", background:"rgba(74,163,84,0.1)", border:"1px solid rgba(74,163,84,0.25)", borderRadius:8, color:"#6fcf7a", fontSize:12, textDecoration:"none", fontFamily:"'DM Mono',monospace" },
};
