// pages/mutation.jsx — Mutation Analysis with Patient + Clinical domains + file upload
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const GENE_SEQUENCES = {
  TP53:  { normal: "ATGGAGGAGCCGCAGTCAGATCCTAGCATAGTGAAGCCACCTGGAGCTGATCCCCAGCACTTTTGTCCCTTCCCAGAAAACCTACCAGGGCAGCTACGGTTTCCGTCTGGGCTTCTTGCATTCTGGGACAGCCAAGTCTGTGACTTGCACGTACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGC", mutant: "ATGGAGGAGCCGCAGTCAGATCCTAGCATAGTGAAGCCACCTGGAGCTGATCCCCAGCACTTTTGTCCCTTCCCAGAAAACCTACCAGGGCAGCTACGGTTTCCGTCTGGGCTTCTTGCATTCTGGGACAGCCAAGTCTGTGACTTGCACGTACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGC", mutPos:[32,97,145], desc:"TP53 is the most frequently mutated gene in human cancer." },
  KRAS:  { normal: "ATGACTGAATATAAACTTGTGGTAGTTGGAGCTGGTGGCGTAGGCAAGAGTGCCTTGACGATACAGCTAATTCAGAATCATTTTGTGGACGAATATGATCCAACAATAGAGGATTCCTACAGGAAGCAAGTAGTAATTGATGGAGAAACCTGTCTCTTGGATATTCTCGACACAGCAGGTCAAGAGGAGTACAGTGCAATGAGGGAC", mutant: "ATGACTGAATATAAACTTGTGGTAGTTGGAGCTGGTGGCGTAGGCAAGAGTGCCTTGACGATACAGCTAATTCAGAATCATTTTGTGGACGAATATGATCCAACAATAGAGGATTCCTACAGGAAGCAAGTAGTAATTGATGGAGAAACCTGTCTCTTGGATATTCTCGACACAGCAGGTCAAGAGGAGTACAGTGCAATGAGGGAC", mutPos:[12,13,61], desc:"KRAS mutations found in ~25% of all cancers." },
  BRCA2: { normal: "ATGCCTATTGGATCCAAAGAGAGGCCAACATTTTTTGAAATTTTTAAGACACGCTGCAACAAAGCAGATTTAGGACCAATAAGGCAAACATTTGAAAGAGAGAGAATTTCGAGAAATTGCAATTTGCATTTGAAAATATTCAAAAAGTATTTTTCTTTAATGATAATTTAAAATAAATCTGGAATTTCTCAAGAACTTAGAGATGG", mutant: "ATGCCTATTGGATCCAAAGAGAGGCCAACATTTTTTGAAATTTTTAAGACACGCTGCAACAAAGCAGATTTAGGACCAATAAGGCAAACATTTGAAAGAGAGAGAATTTCGAGAAATTGCAATTTGCATTTGAAAATATTCAAAAAGTATTTTTCTTTAATGATAATTTAAAATAAATCTGGAATTTCTCAAGAACTTAGAGATGG", mutPos:[23,89,156], desc:"BRCA2 plays a critical role in homologous recombination DNA repair." },
  BRCA1: { normal: "ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGAT", mutant: "ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGAT", mutPos:[89,134,178], desc:"BRCA1 mutations significantly increase breast and ovarian cancer risk." },
  EGFR:  { normal: "ATGCGACCCTCCGGGACGGCCGGGGCAGCGCTCCTGGCGCTGCTGGCTGCGCTCTGCCCGGCGAGTCGGGCTCTGGAGGAAAAGAAAGTTTGCCAAGGCACGAGTAACAAGCTCACGCAGTTGGGCACTTTTGAAGATCATTTTCTCAGCCTCCAGAGGATGTTCAATAACTGTGAGGTGGTCCTTGGGAATTTGGAAATTACC", mutant: "ATGCGACCCTCCGGGACGGCCGGGGCAGCGCTCCTGGCGCTGCTGGCTGCGCTCTGCCCGGCGAGTCGGGCTCTGGAGGAAAAGAAAGTTTGCCAAGGCACGAGTAACAAGCTCACGCAGTTGGGCACTTTTGAAGATCATTTTCTCAGCCTCCAGAGGATGTTCAATAACTGTGAGGTGGTCCTTGGGAATTTGGAAATTACC", mutPos:[746,747,858], desc:"EGFR mutations drive ~15% of non-small cell lung cancers." },
  APOE:  { normal: "ATGAAGGTTCTGTGGGCTGCGTTGCTGGTCACATTCCTGGCAGGATGCCAGGCCAAGGTGGAGCAAGCGGTGGAGACAGAGCCGGAGCCCGAGCTGCGCCAGCAGACCGAGTGGCAGAGCGGCCAGCGCTGGGAACTGGCACTGGGTCGCTTTTGGGATTACCTGCGCTGGGTGCAGACACTGTCTGAGCAGGTGCAGGAGG", mutant: "ATGAAGGTTCTGTGGGCTGCGTTGCTGGTCACATTCCTGGCAGGATGCCAGGCCAAGGTGGAGCAAGCGGTGGAGACAGAGCCGGAGCCCGAGCTGCGCCAGCAGACCGAGTGGCAGAGCGGCCAGCGCTGGGAACTGGCACTGGGTCGCTTTTGGGATTACCTGCGCTGGGTGCAGACACTGTCTGAGCAGGTGCAGGAGG", mutPos:[88,109,195], desc:"APOE ε4 allele is the strongest genetic risk factor for late-onset Alzheimer's." },
};

const DISEASE_OPTIONS = [
  { label:"Type 2 Diabetes",  gene:"TCF7L2", chromosome:10, normalRisk:0.05, description:"TCF7L2 variants are the strongest known genetic risk factor for Type 2 Diabetes.", normalSequence:"ATGCAGTCCAGCGGCAGTAACAGCGGCAGCAACAGCAGCGGCAGCGGCAGCGGCAGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAGCGGCAGCAGCAG", mutantSequence:"ATGCAGTCCAGCGGCAGTAACAGCGGCAGCAACAGCAGCGGCAGCGGCAGCGGCAGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAGCGGCAGCAGCAG", mutationPos:[97,112,145] },
  { label:"Breast Cancer",    gene:"BRCA1",  chromosome:17, normalRisk:0.04, description:"BRCA1 mutations significantly increase breast and ovarian cancer susceptibility.", normalSequence:GENE_SEQUENCES.BRCA1.normal, mutantSequence:GENE_SEQUENCES.BRCA1.mutant, mutationPos:[89,134,178] },
  { label:"Lung Cancer",      gene:"EGFR",   chromosome:7,  normalRisk:0.03, description:"EGFR mutations drive uncontrolled cell growth in non-small cell lung cancer.", normalSequence:GENE_SEQUENCES.EGFR.normal, mutantSequence:GENE_SEQUENCES.EGFR.mutant, mutationPos:[76,121,163] },
  { label:"Alzheimer's",      gene:"APOE",   chromosome:19, normalRisk:0.06, description:"APOE ε4 allele is the strongest genetic risk factor for late-onset Alzheimer's.", normalSequence:GENE_SEQUENCES.APOE.normal, mutantSequence:GENE_SEQUENCES.APOE.mutant, mutationPos:[88,109,195] },
  { label:"Hemochromatosis",  gene:"HFE",    chromosome:6,  normalRisk:0.04, description:"HFE C282Y mutation causes hereditary hemochromatosis via iron overload.", normalSequence:"ATGGAGACTGAGACCCTGGTGGAGAGCGAGCTGGTCCAGGTGTTCCAGCTGCAGGGCTTCGTGCTCAGCCTGATGGGCCTGGCGGCCTGGGGCCTGGGGCTG", mutantSequence:"ATGGAGACTGAGACCCTGGTGGAGAGCGAGCTGGTCCAGGTGTTCCAGCTGCAGGGCTTCGTGCTCAGCCTGATGGGCCTGGCGGCCTGGGGCCTGGGGCTG", mutationPos:[65,130,172] },
];

// ── Patient domain presets ────────────────────────────────────────────────────
const PATIENT_CONDITIONS = [
  { label:"Hereditary Breast Cancer",  gene:"BRCA1",  chromosome:17, normalRisk:0.04, description:"BRCA1/2 hereditary mutations — patient counselling & prophylactic options.", normalSequence:GENE_SEQUENCES.BRCA1.normal, mutantSequence:GENE_SEQUENCES.BRCA1.mutant, mutationPos:[89,134,178] },
  { label:"Familial Diabetes",         gene:"TCF7L2", chromosome:10, normalRisk:0.05, description:"TCF7L2 variants — lifestyle intervention + pharmacotherapy guidance.", normalSequence:"ATGCAGTCCAGCGGCAGTAACAGCGGCAGCAACAGCAGCGGCAGCGGCAGCGGCAGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAGCGGCAGCAGCAG", mutantSequence:"ATGCAGTCCAGCGGCAGTAACAGCGGCAGCAACAGCAGCGGCAGCGGCAGCGGCAGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAGCGGCAGCAGCAG", mutationPos:[97,112,145] },
  { label:"Early-onset Alzheimer's",   gene:"APOE",   chromosome:19, normalRisk:0.06, description:"APOE ε4 carrier status — cognitive monitoring and preventive strategies.", normalSequence:GENE_SEQUENCES.APOE.normal, mutantSequence:GENE_SEQUENCES.APOE.mutant, mutationPos:[88,109,195] },
];

const CUSTOM_FALLBACK = { normalRisk:0.05, description:"Custom gene queried live from NCBI ClinVar.", normalSequence:"ATGCAGTCCAGCGGCAGTAACAGCGGCAGCAACAGCAGCGGCAGCGGCAGCGGCAGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAGCGGCAGCAGCAG", mutantSequence:"ATGCAGTCCAGCGGCAGTAACAGCGGCAGCAACAGCAGCGGCAGCGGCAGCGGCAGCAGCAGCAGCAGCAGCGGCAGCAGCAGCAGCAGCGGCAGCAGCAG", mutationPos:[12,34,67] };

function parseMutationPos(variantStr, basePositions) {
  if (!variantStr) return basePositions;
  const match = variantStr.match(/c\.(\d+)/);
  if (!match) return basePositions;
  const p = parseInt(match[1]) % 60;
  return [p, Math.min(p+3,59), Math.min(p+7,59)];
}

const riskColor = r => r >= 0.7 ? "#e05c5c" : r >= 0.4 ? "#f0a500" : "#6fcf7a";
const riskLabel = r => r >= 0.7 ? "HIGH" : r >= 0.4 ? "MEDIUM" : "LOW";

const card      = { background:"#fff", border:"1px solid #e8ede8", borderRadius:14, padding:18 };
const cardTitle = { fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:500, color:"#8aaa8a", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 14px" };
const fieldLabel= { fontSize:10, color:"#8aaa8a", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:6, fontFamily:"'DM Mono',monospace" };
const inputStyle= { width:"100%", padding:"9px 12px", background:"#f8faf8", border:"1px solid #e0e8e0", borderRadius:8, color:"#1a2e1a", fontSize:13, fontFamily:"'DM Mono',monospace", boxSizing:"border-box" };

export default function MutationAnalysis() {
  const router   = useRouter();
  const fileRef  = useRef(null);

  // Domain: "clinical" or "patient"
  const [domain,       setDomain]       = useState("clinical");
  const [inputMode,    setInputMode]    = useState("preset");
  const [selected,     setSelected]     = useState(DISEASE_OPTIONS[0]);
  const [patientPreset,setPatientPreset]= useState(PATIENT_CONDITIONS[0]);
  const [customGene,   setCustomGene]   = useState("");
  const [customChrom,  setCustomChrom]  = useState(1);
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [log,          setLog]          = useState([]);
  const [showDiff,     setShowDiff]     = useState(false);
  const [pipelineStep, setPipelineStep] = useState("idle");

  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileContent,  setFileContent]  = useState(null);
  const [fileError,    setFileError]    = useState(null);
  const [parsedGene,   setParsedGene]   = useState(null);

  const addLog = msg => setLog(p => [...p, msg]);

  // Handle file from URL params (coming from homepage upload)
  useEffect(() => {
    if (router.query.mode === "file" && router.query.filename) {
      setInputMode("file");
      addLog(`File received: ${router.query.filename}`);
    }
  }, [router.query]);

  const resetAll = () => {
    setResult(null); setLog([]); setShowDiff(false); setPipelineStep("idle");
    setUploadedFile(null); setFileContent(null); setFileError(null); setParsedGene(null);
  };

  const handleDomainChange = (d) => { setDomain(d); resetAll(); setInputMode("preset"); };

  const currentOptions   = domain === "clinical" ? DISEASE_OPTIONS : PATIENT_CONDITIONS;
  const currentSelected  = domain === "clinical" ? selected : patientPreset;
  const setCurrentSelected = (d) => domain === "clinical" ? setSelected(d) : setPatientPreset(d);

  const activeGene  = inputMode === "custom" ? customGene.trim() : inputMode === "file" ? (parsedGene || "—") : currentSelected.gene;
  const activeChrom = inputMode === "custom" ? customChrom : currentSelected.chromosome || 1;

  const getSeqData = (gene, resultData) => {
    if (inputMode === "preset") return { normalRisk:currentSelected.normalRisk, description:currentSelected.description, normalSeq:currentSelected.normalSequence, mutantSeq:currentSelected.mutantSequence, mutPos:currentSelected.mutationPos };
    const known = GENE_SEQUENCES[gene?.toUpperCase()];
    const basePos = known ? known.mutPos : CUSTOM_FALLBACK.mutationPos;
    const realPos = resultData ? parseMutationPos(resultData.variant, basePos) : basePos;
    return { normalRisk:CUSTOM_FALLBACK.normalRisk, description:known ? known.desc : `${gene} variant queried live from NCBI ClinVar.`, normalSeq:known?known.normal:CUSTOM_FALLBACK.normalSequence, mutantSeq:known?known.mutant:CUSTOM_FALLBACK.mutantSequence, mutPos:realPos };
  };

  const seqData         = getSeqData(activeGene, result);
  const activeNormal    = seqData.normalRisk;
  const activeDesc      = seqData.description;
  const activeNormalSeq = seqData.normalSeq;
  const activeMutSeq    = seqData.mutantSeq;
  const activeMutPos    = seqData.mutPos;
  const riskDelta       = result ? (result.risk - activeNormal).toFixed(4) : null;
  const canRun          = !loading && (inputMode === "preset" || (inputMode === "custom" && activeGene.length >= 2) || (inputMode === "file" && parsedGene));

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = [".fasta",".fa",".txt",".vcf",".csv"];
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setFileError(`Unsupported file type. Accepted: ${allowed.join(", ")}`);
      return;
    }
    setFileError(null);
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setFileContent(text);
      // Try to extract gene name from FASTA header or VCF GENE field
      const fastaMatch = text.match(/^>.*?gene[=:]([A-Z0-9]+)/im) || text.match(/^>([A-Z0-9]+)/im);
      const vcfMatch   = text.match(/GENE=([A-Z0-9]+)/i);
      const gene = fastaMatch?.[1] || vcfMatch?.[1] || null;
      if (gene) {
        setParsedGene(gene.toUpperCase());
        addLog(`✓ Parsed gene from file: ${gene.toUpperCase()}`);
      } else {
        addLog(`⚠ Could not auto-detect gene — enter manually below`);
      }
      addLog(`File loaded: ${file.name} (${(file.size/1024).toFixed(1)} KB)`);
    };
    reader.readAsText(file);
  };

  // ── Run analysis ───────────────────────────────────────────────────────────
  const runMutation = async () => {
    const gene = activeGene;
    if (!gene || gene === "—") return;
    setLoading(true); setError(null); setResult(null); setLog([]); setShowDiff(false); setPipelineStep("mutating");
    addLog(`[1/3] Domain: ${domain === "clinical" ? "Clinical Research" : "Patient Care"}`);
    addLog(`[1/3] Querying ClinVar for gene: ${gene}`);
    addLog(`[1/3] Running risk model...`);
    try {
      const res = await fetch(`${API_BASE}/api/mutate`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ gene, variant_type:"snv", chromosome:activeChrom }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      addLog(`[1/3] ✓ Variant: ${data.variant}`);
      addLog(`[1/3] ✓ Target: ${data.target_protein}`);
      addLog(`[1/3] ✓ Risk: ${data.risk} (Δ +${(data.risk - activeNormal).toFixed(4)})`);
      const known = GENE_SEQUENCES[gene?.toUpperCase()];
      addLog(known ? `[2/3] ✓ Real ${gene} sequence loaded (${known.normal.length} bp)` : `[2/3] Generic sequence used for ${gene}`);
      addLog(`[3/3] Ready → AR visualization`);
      setResult(data); setShowDiff(true); setPipelineStep("done");
    } catch (err) {
      setError(err.message); addLog(`Error: ${err.message}`); setPipelineStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const buildProteinUrl = data => {
    if (!data) return "/protein";
    return `/protein?${new URLSearchParams({ target:data.target_protein, gene:data.gene||activeGene, variant:data.variant, risk:data.risk, clinvar:data.clinvar_id }).toString()}`;
  };

  const renderSeq = (seq, mutPos, isMutant) =>
    seq.slice(0,60).split("").map((ch,i) => {
      const isMut = isMutant && mutPos.includes(i);
      return <span key={i} style={{ color:isMut?"#e05c5c":"#6fcf7a", background:isMut?"rgba(224,92,92,0.15)":"transparent", fontWeight:isMut?700:400, borderRadius:2, padding:isMut?"0 1px":0 }}>{ch}</span>;
    });

  return (
    <>
      <Head>
        <title>Mutation Analysis — MutaCure AR</title>
        <style>{`
          @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          input:focus,textarea:focus { outline:none; border-color:rgba(45,106,49,0.5)!important; box-shadow:0 0 0 2px rgba(45,106,49,0.08); }
        `}</style>
      </Head>
      <Layout pageTitle="Mutation Analysis">

        {/* ── Domain selector ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4, flexWrap:"wrap", gap:12 }}>
          <div>
            <p style={{ fontSize:13, color:"#7a8c7a", margin:0 }}>Detect disease-causing variants and map gene-disease pathways</p>
          </div>
          <div style={{ display:"flex", gap:0, background:"#f0f5f0", borderRadius:10, padding:3, border:"1px solid #e0e8e0" }}>
            {[
              { key:"clinical", label:"🔬 Clinical Research", desc:"Research-grade mutation analysis" },
              { key:"patient",  label:"👤 Patient Care",      desc:"Patient-oriented interpretation" },
            ].map(d => (
              <button key={d.key} onClick={() => handleDomainChange(d.key)}
                title={d.desc}
                style={{
                  padding:"9px 20px", borderRadius:8, border:"none", cursor:"pointer",
                  background: domain === d.key ? "#2d6a31" : "transparent",
                  color:      domain === d.key ? "#fff" : "#5a7a5a",
                  fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif",
                  transition:"all 0.15s",
                }}
              >{d.label}</button>
            ))}
          </div>
        </div>

        {/* Domain context banner */}
        <div style={{ background: domain === "clinical" ? "#f0faf0" : "#f0f4ff", border:`1px solid ${domain === "clinical" ? "#c8e6c9" : "#c8d0f0"}`, borderRadius:10, padding:"10px 16px", fontSize:12, color: domain === "clinical" ? "#2d7a31" : "#3a3a8a", fontFamily:"'DM Sans',sans-serif" }}>
          {domain === "clinical"
            ? "🔬 Clinical Research mode — full mutation risk scoring, DNA sequence comparison, and pathway analysis for research use."
            : "👤 Patient Care mode — patient-friendly mutation interpretation with condition-specific guidance and therapeutic options."}
        </div>

        {/* Pipeline indicator */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", background:"#fff", border:"1px solid #e8ede8", borderRadius:10 }}>
          {[{n:1,label:"Mutation",active:pipelineStep==="mutating",done:pipelineStep==="done"},{n:2,label:"Protein"},{n:3,label:"AR"}].map(({n,label,active,done},i) => (
            <div key={n} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:24, height:24, borderRadius:6, border:"1px solid", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontFamily:"'DM Mono',monospace", fontWeight:600, background:done?"#e8f5e8":active?"#f0faf0":"#f8faf8", borderColor:done?"#4caf50":active?"#4caf50":"#e0e8e0", color:done?"#2d7a31":active?"#2d7a31":"#9aaa9a" }}>
                {done ? "✓" : n}
              </div>
              <span style={{ fontSize:11, color:done?"#2d7a31":active?"#2d7a31":"#9aaa9a", fontFamily:"'DM Mono',monospace" }}>{label}</span>
              {i < 2 && <span style={{ color:"#c8d8c8", margin:"0 4px" }}>→</span>}
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20, alignItems:"start" }}>

          {/* ── Sidebar ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Input mode tabs */}
            <div style={card}>
              <p style={cardTitle}>Input Mode</p>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {["preset","custom","file"].map(m => (
                  <button key={m} onClick={() => { setInputMode(m); resetAll(); }}
                    style={{ flex:1, minWidth:60, padding:"7px 4px", background:inputMode===m?"#f0faf0":"#f8faf8", border:`1px solid ${inputMode===m?"#4caf50":"#e0e8e0"}`, borderRadius:8, color:inputMode===m?"#2d7a31":"#7a8c7a", fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer" }}>
                    {m === "preset" ? (domain === "clinical" ? "Disease" : "Condition") : m === "custom" ? "Custom" : "File"}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset mode */}
            {inputMode === "preset" && (
              <div style={card}>
                <p style={cardTitle}>{domain === "clinical" ? "Select Disease" : "Select Condition"}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {currentOptions.map(d => (
                    <button key={d.label} onClick={() => { setCurrentSelected(d); resetAll(); }}
                      style={{ padding:"9px 12px", background:currentSelected.label===d.label?"#f0faf0":"#f8faf8", border:`1px solid ${currentSelected.label===d.label?"#4caf50":"#e0e8e0"}`, borderRadius:8, color:currentSelected.label===d.label?"#2d7a31":"#5a7a5a", fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", textAlign:"left", fontWeight:500 }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom gene mode */}
            {inputMode === "custom" && (
              <div style={card}>
                <p style={cardTitle}>Custom Gene Input</p>
                <div style={{ marginBottom:12 }}>
                  <label style={fieldLabel}>Gene Symbol</label>
                  <input style={inputStyle} placeholder="e.g. TP53, KRAS..." value={customGene}
                    onChange={e => setCustomGene(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && canRun && runMutation()} />
                </div>
                <div style={{ marginBottom:12 }}>
                  <label style={fieldLabel}>Chromosome (1–25)</label>
                  <input style={inputStyle} placeholder="e.g. 17" type="number" min="1" max="25" value={customChrom}
                    onChange={e => setCustomChrom(Number(e.target.value))} />
                </div>
                <p style={{ ...fieldLabel, marginBottom:6 }}>Quick picks</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {[{g:"TP53",c:17},{g:"KRAS",c:12},{g:"PTEN",c:10},{g:"CFTR",c:7},{g:"MYC",c:8}].map(({g,c}) => (
                    <button key={g} onClick={() => { setCustomGene(g); setCustomChrom(c); }}
                      style={{ padding:"4px 10px", background:"#f0faf0", border:"1px solid #c8e6c9", borderRadius:6, color:"#2d7a31", fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer" }}>{g}</button>
                  ))}
                </div>
                {customGene && (
                  <p style={{ fontSize:10, marginTop:10, fontFamily:"'DM Mono',monospace", color:GENE_SEQUENCES[customGene]?"#2d7a31":"#f0a500" }}>
                    {GENE_SEQUENCES[customGene] ? `✓ Real sequence available` : `⚠ Generic sequence will be used`}
                  </p>
                )}
              </div>
            )}

            {/* File upload mode */}
            {inputMode === "file" && (
              <div style={card}>
                <p style={cardTitle}>Upload DNA / VCF File</p>
                <input ref={fileRef} type="file" accept=".fasta,.fa,.txt,.vcf,.csv" style={{ display:"none" }} onChange={handleFileChange} />

                {!uploadedFile ? (
                  <button onClick={() => fileRef.current?.click()}
                    style={{ width:"100%", padding:"20px 16px", background:"#f8faf8", border:"2px dashed #c8e6c9", borderRadius:10, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round"/></svg>
                    <span style={{ fontSize:12, color:"#4caf50", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>Click to upload</span>
                    <span style={{ fontSize:10, color:"#9aaa9a", fontFamily:"'DM Sans',sans-serif" }}>.fasta · .fa · .vcf · .txt · .csv</span>
                  </button>
                ) : (
                  <div style={{ background:"#f0faf0", border:"1px solid #c8e6c9", borderRadius:9, padding:"12px 14px" }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#2d7a31", fontFamily:"'DM Mono',monospace", marginBottom:4, wordBreak:"break-all" }}>{uploadedFile.name}</div>
                    <div style={{ fontSize:10, color:"#8aaa8a", fontFamily:"'DM Sans',sans-serif", marginBottom:8 }}>{(uploadedFile.size/1024).toFixed(1)} KB</div>
                    <button onClick={() => { setUploadedFile(null); setFileContent(null); setParsedGene(null); if(fileRef.current) fileRef.current.value=""; }}
                      style={{ fontSize:10, color:"#e05c5c", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", padding:0 }}>✕ Remove file</button>
                  </div>
                )}

                {fileError && <p style={{ fontSize:11, color:"#e05c5c", marginTop:8, fontFamily:"'DM Sans',sans-serif" }}>⚠ {fileError}</p>}

                {uploadedFile && (
                  <div style={{ marginTop:12 }}>
                    <label style={fieldLabel}>Gene Symbol {parsedGene ? "(auto-detected)" : "(enter manually)"}</label>
                    <input style={inputStyle} placeholder="e.g. BRCA1" value={parsedGene || ""}
                      onChange={e => setParsedGene(e.target.value.toUpperCase())} />
                  </div>
                )}

                {fileContent && (
                  <div style={{ marginTop:10 }}>
                    <label style={fieldLabel}>File Preview</label>
                    <div style={{ background:"#1a2e1a", borderRadius:8, padding:"8px 10px", fontFamily:"'DM Mono',monospace", fontSize:9, color:"#6fcf7a", maxHeight:80, overflowY:"auto", wordBreak:"break-all", lineHeight:1.6 }}>
                      {fileContent.slice(0, 200)}{fileContent.length > 200 ? "..." : ""}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Query params + run */}
            <div style={card}>
              <p style={cardTitle}>Query Parameters</p>
              {[["Gene", activeGene||"—"],["Chromosome", activeChrom],["Variant Type","SNV"],["Domain", domain === "clinical" ? "Clinical" : "Patient"],["Baseline Risk", currentSelected.normalRisk||CUSTOM_FALLBACK.normalRisk]].map(([l,v]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={fieldLabel}>{l}</span>
                  <span style={{ fontSize:12, color:"#1a2e1a", fontFamily:"'DM Mono',monospace" }}>{v}</span>
                </div>
              ))}
              <button onClick={runMutation} disabled={!canRun}
                style={{ width:"100%", padding:12, background:canRun?"#2d6a31":"#9aba9a", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600, cursor:canRun?"pointer":"not-allowed", marginTop:4 }}>
                {loading ? "⟳ Analyzing..." : "▶ Run Mutation Analysis"}
              </button>
            </div>

            {/* Log */}
            <div style={card}>
              <p style={cardTitle}>Pipeline Log</p>
              <div style={{ background:"#1a2e1a", borderRadius:8, padding:10, minHeight:80, maxHeight:140, overflowY:"auto", fontFamily:"'DM Mono',monospace", fontSize:11 }}>
                {log.length === 0
                  ? <span style={{ color:"rgba(111,207,122,0.3)", fontStyle:"italic" }}>Waiting for input...</span>
                  : log.map((line,i) => <div key={i} style={{ marginBottom:3, color:"rgba(111,207,122,0.7)" }}><span style={{ color:"#6fcf7a" }}>›</span> {line}</div>)
                }
              </div>
            </div>
          </div>

          {/* ── Results panel ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {!result && !error && (
              <div style={{ background:"#fff", border:"1px solid #e8ede8", borderRadius:16, padding:48, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, minHeight:360 }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="0.8" opacity="0.3">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
                </svg>
                <p style={{ fontSize:13, color:"#8aaa8a", textAlign:"center", maxWidth:320, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif", margin:0 }}>
                  {domain === "clinical"
                    ? "Select a disease preset, enter a custom gene, or upload a DNA/VCF file — then run analysis."
                    : "Select a patient condition or upload a file — then run to get personalised mutation interpretation."}
                </p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
                  {["① Mutation Analysis","② Protein Structure","③ AR Visualization"].map((s,i) => (
                    <div key={i} style={{ padding:"4px 12px", background:"#f5faf5", border:"1px solid #e0ede0", borderRadius:20, fontSize:10, color:"#8aaa8a", fontFamily:"'DM Mono',monospace" }}>{s}</div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ background:"#fff5f5", border:"1px solid #f0c0c0", borderRadius:12, padding:16, color:"#c0392b", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
                ⚠ {error}
                <p style={{ fontSize:11, marginTop:6, opacity:0.7 }}>Check gene symbol is valid (e.g. TP53, BRCA1) and backend is running at {API_BASE}</p>
              </div>
            )}

            {result && showDiff && (
              <div style={{ animation:"fadeIn 0.4s ease", display:"flex", flexDirection:"column", gap:16 }}>

                {/* Pipeline complete banner */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#f0faf0", border:"1px solid #4caf50", borderRadius:12, padding:"14px 18px", flexWrap:"wrap", gap:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ color:"#4caf50", fontSize:18 }}>✓</span>
                    <div>
                      <p style={{ fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600, color:"#1a2e1a", margin:0 }}>Step 1 Complete — Mutation Analysed</p>
                      <p style={{ fontSize:11, color:"#5a7a5a", margin:"2px 0 0", fontFamily:"'DM Mono',monospace" }}>
                        {result.gene||activeGene} → {result.target_protein} → Risk {result.risk}
                        {domain === "patient" && " · Patient interpretation ready"}
                      </p>
                    </div>
                  </div>
                  <a href={buildProteinUrl(result)} style={{ padding:"10px 18px", background:"#2d6a31", borderRadius:8, color:"#fff", fontSize:12, textDecoration:"none", fontFamily:"'DM Sans',sans-serif", fontWeight:600, whiteSpace:"nowrap" }}>
                    Step 2: Generate Protein →
                  </a>
                </div>

                {/* Patient interpretation card (patient domain only) */}
                {domain === "patient" && (
                  <div style={{ background:"#f0f4ff", border:"1px solid #c8d0f0", borderRadius:14, padding:18 }}>
                    <p style={{ ...cardTitle, color:"#3a3a8a" }}>Patient Interpretation</p>
                    <p style={{ fontSize:13, color:"#3a3a6a", lineHeight:1.7, fontFamily:"'DM Sans',sans-serif", margin:"0 0 12px" }}>
                      {activeDesc}
                    </p>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      <span style={{ padding:"4px 10px", background:"#fff", border:"1px solid #c8d0f0", borderRadius:6, fontSize:11, color:"#3a3a8a", fontFamily:"'DM Sans',sans-serif" }}>Risk Level: {riskLabel(result.risk)}</span>
                      <span style={{ padding:"4px 10px", background:"#fff", border:"1px solid #c8d0f0", borderRadius:6, fontSize:11, color:"#3a3a8a", fontFamily:"'DM Sans',sans-serif" }}>Recommend: Genetic counselling</span>
                      <span style={{ padding:"4px 10px", background:"#fff", border:"1px solid #c8d0f0", borderRadius:6, fontSize:11, color:"#3a3a8a", fontFamily:"'DM Sans',sans-serif" }}>Target: {result.target_protein}</span>
                    </div>
                  </div>
                )}

                {/* Risk comparison */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:12 }}>
                  <div style={{ ...card, border:"1px solid #e0ede0" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em", color:"#7a8c7a" }}>NORMAL</span>
                      <span style={{ padding:"3px 10px", background:"#f0faf0", border:"1px solid #4caf5055", borderRadius:20, fontSize:10, color:"#4caf50" }}>LOW RISK</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:12 }}>
                      <span style={{ fontSize:34, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#4caf50" }}>{activeNormal}</span>
                      <span style={{ fontSize:11, color:"#8aaa8a" }}>risk score</span>
                    </div>
                    {[["Gene",activeGene],["State","Wild Type"],["Variant","None"]].map(([l,v]) => (
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontSize:11, color:"#8aaa8a" }}>{l}</span>
                        <span style={{ fontSize:12, color:"#1a2e1a", fontFamily:"'DM Mono',monospace" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ height:5, background:"#e8ede8", borderRadius:3, overflow:"hidden" }}><div style={{ height:"100%", background:"#4caf50", borderRadius:3, width:`${activeNormal*100}%` }}/></div>
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <span style={{ fontSize:22, color:"#c8d8c8" }}>→</span>
                    <span style={{ fontSize:18, fontWeight:700, fontFamily:"'DM Mono',monospace", color:riskColor(result.risk) }}>+{riskDelta}</span>
                    <span style={{ fontSize:10, color:"#8aaa8a", textTransform:"uppercase", letterSpacing:"0.06em" }}>risk increase</span>
                  </div>

                  <div style={{ ...card, border:`1px solid ${riskColor(result.risk)}44` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em", color:riskColor(result.risk) }}>MUTATED</span>
                      <span style={{ padding:"3px 10px", background:`${riskColor(result.risk)}18`, border:`1px solid ${riskColor(result.risk)}55`, borderRadius:20, fontSize:10, color:riskColor(result.risk) }}>{riskLabel(result.risk)} RISK</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:12 }}>
                      <span style={{ fontSize:34, fontWeight:700, fontFamily:"'DM Mono',monospace", color:riskColor(result.risk) }}>{result.risk}</span>
                      <span style={{ fontSize:11, color:"#8aaa8a" }}>risk score</span>
                    </div>
                    {[["Gene",result.gene||activeGene],["Variant",result.variant],["Protein",result.target_protein]].map(([l,v]) => (
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontSize:11, color:"#8aaa8a" }}>{l}</span>
                        <span style={{ fontSize:12, color:"#1a2e1a", fontFamily:"'DM Mono',monospace" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ height:5, background:"#e8ede8", borderRadius:3, overflow:"hidden" }}><div style={{ height:"100%", background:riskColor(result.risk), borderRadius:3, width:`${result.risk*100}%` }}/></div>
                  </div>
                </div>

                {/* DNA sequence diff */}
                <div style={card}>
                  <p style={cardTitle}>DNA Sequence Comparison — {activeGene} (first 60 bases){GENE_SEQUENCES[activeGene] && <span style={{ color:"#4caf50", fontSize:10, marginLeft:8 }}>● Real sequence</span>}</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:11, color:"#7a8c7a", marginBottom:8 }}><span style={{ color:"#4caf50" }}>●</span> Normal (Wild Type)</div>
                      <div style={{ background:"#1a2e1a", borderRadius:8, padding:12, fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:"0.05em", lineHeight:1.8, wordBreak:"break-all" }}>{renderSeq(activeNormalSeq,activeMutPos,false)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:"#7a8c7a", marginBottom:8 }}><span style={{ color:"#e05c5c" }}>●</span> Mutated — {result.variant?.split(":").pop()||"SNV"}</div>
                      <div style={{ background:"#1a2e1a", borderRadius:8, padding:12, fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:"0.05em", lineHeight:1.8, wordBreak:"break-all" }}>{renderSeq(activeMutSeq,activeMutPos,true)}</div>
                    </div>
                  </div>
                  <p style={{ fontSize:11, color:"#8aaa8a" }}><span style={{ color:"#4caf50" }}>■</span> Normal &nbsp;<span style={{ color:"#e05c5c" }}>■</span> Mutation site ({activeMutPos.join(", ")})</p>
                </div>

                {/* Pathway */}
                <div style={card}>
                  <p style={cardTitle}>Pathway Explanation</p>
                  <p style={{ fontSize:13, color:"#4a6a4a", lineHeight:1.7, fontFamily:"'DM Sans',sans-serif", margin:"0 0 10px" }}>{activeDesc}</p>
                  <p style={{ fontSize:13, color:"#4a6a4a", lineHeight:1.7, fontFamily:"'DM Sans',sans-serif", margin:"0 0 16px" }}>
                    Variant <strong style={{ color:"#2d7a31" }}>{result.variant}</strong> in <strong style={{ color:"#2d7a31" }}>{result.gene||activeGene}</strong> affects <strong style={{ color:"#2d7a31" }}>{result.target_protein}</strong>.
                    Risk: <strong>{activeNormal}</strong> → <strong style={{ color:riskColor(result.risk) }}>{result.risk}</strong> (Δ +{riskDelta}).
                  </p>
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                    <a href={buildProteinUrl(result)} style={{ display:"inline-flex", alignItems:"center", padding:"11px 18px", background:"#2d6a31", borderRadius:8, color:"#fff", fontSize:12, textDecoration:"none", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                      Generate {result.target_protein} Structure →
                    </a>
                    <a href="/ar/index.html" style={{ display:"inline-flex", alignItems:"center", padding:"11px 16px", background:"#f0faf0", border:"1px solid #c8e6c9", borderRadius:8, color:"#2d7a31", fontSize:12, textDecoration:"none", fontFamily:"'DM Mono',monospace" }}>
                      Launch AR →
                    </a>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}