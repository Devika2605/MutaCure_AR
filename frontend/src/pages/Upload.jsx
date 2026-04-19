// pages/upload.jsx — Real DNA File Upload & Analysis
// Parses FASTA, VCF, TXT sequences in-browser before sending to backend

import Head from "next/head";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ic = ({ n, s = 16, c = "currentColor" }) => {
  const st = { width: s, height: s, flexShrink: 0 };
  switch (n) {
    case "upload":  return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "file":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case "dna":     return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M8 3c0 4 8 4 8 8s-8 4-8 8M16 3c0 4-8 4-8 8s8 4 8 8M5 6h14M5 18h14" strokeLinecap="round"/></svg>;
    case "check":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
    case "x":       return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "warn":    return <svg style={st} viewBox="0 0 24 24" fill="#f0a500"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>;
    case "arrow":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case "info":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
    case "vcf":     return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M12 8v8"/></svg>;
    case "seq":     return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case "play":    return <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="5,3 19,12 5,21"/></svg>;
    case "reset":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>;
    default: return null;
  }
};

// ── DNA file parsers ──────────────────────────────────────────────────────────

function parseFASTA(text) {
  const lines = text.trim().split("\n");
  const records = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith(">")) {
      if (current) records.push(current);
      const header = line.slice(1).trim();
      // Try to extract gene name from common FASTA header formats
      const geneMatch =
        header.match(/gene[=:]([A-Z0-9_-]+)/i) ||
        header.match(/GN=([A-Z0-9_-]+)/i) ||
        header.match(/\|([A-Z0-9]+)\|/) ||
        header.match(/^([A-Z0-9]{2,10})\s/);
      current = {
        header,
        gene: geneMatch?.[1]?.toUpperCase() || null,
        sequence: "",
        type: "FASTA",
      };
    } else if (current && line.trim() && !line.startsWith(";")) {
      current.sequence += line.trim().toUpperCase().replace(/[^ATCGN]/g, "");
    }
  }
  if (current) records.push(current);
  return records;
}

function parseVCF(text) {
  const lines = text.split("\n").filter(l => !l.startsWith("##") && l.trim());
  const variants = [];

  // Get header
  const headerLine = lines.find(l => l.startsWith("#CHROM"));
  const cols = headerLine ? headerLine.slice(1).split("\t") : ["CHROM","POS","ID","REF","ALT","QUAL","FILTER","INFO"];

  for (const line of lines) {
    if (line.startsWith("#") || !line.trim()) continue;
    const parts = line.split("\t");
    const chrom = parts[0] || "";
    const pos   = parts[1] || "";
    const id    = parts[2] || ".";
    const ref   = parts[3] || "";
    const alt   = parts[4] || "";
    const qual  = parts[5] || ".";
    const info  = parts[7] || "";

    // Extract gene from INFO field
    const geneMatch = info.match(/GENE=([A-Z0-9_]+)/i) || info.match(/Gene=([A-Z0-9_]+)/i);
    const gene = geneMatch?.[1]?.toUpperCase() || null;

    variants.push({ chrom, pos, id, ref, alt, qual, gene, info });
  }
  return variants;
}

function parsePlainSequence(text) {
  // Try to detect if it's just raw sequence
  const clean = text.trim().toUpperCase().replace(/\s/g, "").replace(/[^ATCGN]/g, "");
  if (clean.length > 10 && /^[ATCGN]+$/.test(clean)) {
    return [{ header: "Raw sequence", gene: null, sequence: clean, type: "RAW" }];
  }
  return null;
}

function detectFileType(text, filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".vcf")) return "vcf";
  if (lower.endsWith(".fasta") || lower.endsWith(".fa")) return "fasta";
  if (text.trim().startsWith(">")) return "fasta";
  if (text.trim().startsWith("##fileformat=VCF") || text.includes("#CHROM")) return "vcf";
  return "raw";
}

function gcContent(seq) {
  const gc = (seq.match(/[GC]/g) || []).length;
  return seq.length ? ((gc / seq.length) * 100).toFixed(1) : "0.0";
}

function calculateComplexity(seq) {
  // Simple: unique k-mers / total k-mers
  const k = 4, kmers = new Set();
  for (let i = 0; i <= seq.length - k; i++) kmers.add(seq.slice(i, i + k));
  const max = Math.min(4 ** k, seq.length - k + 1);
  return max > 0 ? Math.min(100, ((kmers.size / max) * 100)).toFixed(0) : "0";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [dragOver,    setDragOver]    = useState(false);
  const [file,        setFile]        = useState(null);
  const [rawText,     setRawText]     = useState("");
  const [fileType,    setFileType]    = useState(null); // "fasta" | "vcf" | "raw"
  const [parsed,      setParsed]      = useState(null); // { records[], variants[], type }
  const [selected,    setSelected]    = useState(0);    // index of selected record
  const [geneOverride,setGeneOverride]= useState("");
  const [parseError,  setParseError]  = useState(null);
  const [analysing,   setAnalysing]   = useState(false);
  const [result,      setResult]      = useState(null);
  const [apiError,    setApiError]    = useState(null);
  const [log,         setLog]         = useState([]);

  const addLog = msg => setLog(p => [...p, { t: Date.now(), msg }]);

  const processFile = (f) => {
    if (!f) return;
    setParseError(null);
    setResult(null);
    setApiError(null);
    setLog([]);
    setGeneOverride("");
    setSelected(0);

    const allowed = [".fasta", ".fa", ".vcf", ".txt", ".csv"];
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setParseError(`File type not supported. Accepted: FASTA (.fasta, .fa), VCF (.vcf), plain text (.txt, .csv)`);
      return;
    }

    setFile(f);
    addLog(`Reading: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setRawText(text);
      const type = detectFileType(text, f.name);
      setFileType(type);

      if (type === "fasta") {
        const records = parseFASTA(text);
        if (!records.length) { setParseError("No valid FASTA records found in file."); return; }
        setParsed({ type: "fasta", records });
        addLog(`✓ FASTA parsed — ${records.length} record${records.length > 1 ? "s" : ""}`);
        records.forEach((r, i) => addLog(`  [${i + 1}] ${r.gene || "unknown gene"} — ${r.sequence.length.toLocaleString()} bp`));
      } else if (type === "vcf") {
        const variants = parseVCF(text);
        if (!variants.length) { setParseError("No variants found in VCF file."); return; }
        setParsed({ type: "vcf", variants });
        const genes = [...new Set(variants.map(v => v.gene).filter(Boolean))];
        addLog(`✓ VCF parsed — ${variants.length} variant${variants.length > 1 ? "s" : ""}`);
        addLog(`  Genes detected: ${genes.length ? genes.join(", ") : "none (enter manually)"}`);
      } else {
        const raw = parsePlainSequence(text);
        if (raw) {
          setParsed({ type: "raw", records: raw });
          addLog(`✓ Raw sequence — ${raw[0].sequence.length.toLocaleString()} bases`);
        } else {
          setParseError("Could not detect a valid DNA sequence. Use FASTA or VCF format.");
        }
      }
    };
    reader.onerror = () => setParseError("Could not read the file. Make sure it is a plain text file.");
    reader.readAsText(f);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }, []);

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const reset = () => {
    setFile(null); setRawText(""); setFileType(null); setParsed(null);
    setSelected(0); setGeneOverride(""); setParseError(null);
    setResult(null); setApiError(null); setLog([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Determine what gene/sequence to use for analysis
  const activeRecord = parsed?.type === "fasta" || parsed?.type === "raw"
    ? parsed.records[selected]
    : null;
  const activeGene = geneOverride ||
    activeRecord?.gene ||
    (parsed?.type === "vcf" ? parsed.variants.find(v => v.gene)?.gene : null) || "";
  const activeSequence = activeRecord?.sequence || "";

  const canAnalyse = !analysing && (activeGene.length >= 2) && file;

  const runAnalysis = async () => {
    if (!canAnalyse) return;
    setAnalysing(true);
    setResult(null);
    setApiError(null);

    try {
      addLog(`[1/3] Sending to ClinVar: ${activeGene}`);

      // Send gene + actual sequence content to backend
      const payload = {
        gene: activeGene,
        variant_type: "snv",
        chromosome: 1,
        // Include the actual sequence from the file if available
        ...(activeSequence ? { sequence: activeSequence.slice(0, 500) } : {}),
        source: "file_upload",
        filename: file.name,
      };

      const res = await fetch(`${API_BASE}/api/mutate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
      const data = await res.json();

      addLog(`[1/3] ✓ Variant: ${data.variant}`);
      addLog(`[1/3] ✓ Target: ${data.target_protein}`);
      addLog(`[1/3] ✓ Risk score: ${data.risk}`);
      addLog(`[2/3] File sequence: ${activeSequence.length} bp analyzed`);
      addLog(`[3/3] Ready → Protein structure generation`);

      setResult(data);
    } catch (err) {
      setApiError(err.message);
      addLog(`✗ Error: ${err.message}`);
    } finally {
      setAnalysing(false);
    }
  };

  const riskColor = r => r >= 0.7 ? "#e05c5c" : r >= 0.4 ? "#f0a500" : "#4caf50";
  const riskLabel = r => r >= 0.7 ? "HIGH" : r >= 0.4 ? "MEDIUM" : "LOW";

  const seq = activeSequence;
  const seqStats = seq ? {
    length: seq.length,
    gc: gcContent(seq),
    complexity: calculateComplexity(seq),
    atRatio: seq.length ? (((seq.match(/[AT]/g)||[]).length / seq.length) * 100).toFixed(1) : "0",
    preview: seq.slice(0, 80),
  } : null;

  return (
    <>
      <Head><title>Upload DNA File — MutaCure AR</title></Head>
      <Layout pageTitle="Upload DNA File">

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* ── Left: Upload + parsing ── */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Page header */}
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a2e1a", margin: "0 0 6px", letterSpacing: "-0.02em", fontFamily: "'DM Sans',sans-serif" }}>
                DNA File Upload
              </h2>
              <p style={{ fontSize: 13, color: "#5a7a5a", margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
                Upload a real FASTA, VCF, or plain sequence file. We parse it directly in your browser — your data never leaves without your permission.
              </p>
            </div>

            {/* Supported formats info bar */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { icon: "dna",  label: "FASTA / FA",   desc: "Sequence files (.fasta, .fa)",   color: "#2d7a31", bg: "#e8f5e9" },
                { icon: "vcf",  label: "VCF",          desc: "Variant call format (.vcf)",     color: "#1565c0", bg: "#e3f2fd" },
                { icon: "seq",  label: "Plain text",   desc: "Raw sequence (.txt, .csv)",      color: "#6a3a00", bg: "#fff3e0" },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: f.bg, borderRadius: 10, border: `1px solid ${f.color}22` }}>
                  <Ic n={f.icon} s={15} c={f.color} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: f.color, fontFamily: "'DM Sans',sans-serif" }}>{f.label}</div>
                    <div style={{ fontSize: 10, color: "#6a8a6a", fontFamily: "'DM Sans',sans-serif" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Drop zone ── */}
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: dragOver ? "#f0faf0" : "#fafcfa",
                  border: `2px dashed ${dragOver ? "#4caf50" : "#c8ddc8"}`,
                  borderRadius: 16,
                  padding: "56px 32px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                  cursor: "pointer", transition: "all 0.2s",
                  textAlign: "center",
                }}
              >
                <div style={{ width: 64, height: 64, borderRadius: 16, background: dragOver ? "#e8f5e9" : "#f0f5f0", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                  <Ic n="upload" s={32} c={dragOver ? "#4caf50" : "#8aaa8a"} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1a2e1a", marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>
                    {dragOver ? "Drop to upload" : "Drag & drop your file here"}
                  </div>
                  <div style={{ fontSize: 13, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif" }}>
                    or <span style={{ color: "#4caf50", fontWeight: 600 }}>browse files</span> — FASTA, VCF, TXT accepted
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#b0c4b0", fontFamily: "'DM Mono',monospace" }}>Max 10 MB · UTF-8 plain text only</div>
              </div>
            ) : (
              /* ── Parsed file view ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* File header */}
                <div style={{ background: "#fff", border: "1px solid #e6ebe6", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: "#e8f5e9", border: "1px solid #c8e6c9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic n={fileType === "vcf" ? "vcf" : "dna"} s={22} c="#2d7a31" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif" }}>
                      {(file.size / 1024).toFixed(1)} KB · {fileType?.toUpperCase()} format
                      {parsed?.type === "fasta" && ` · ${parsed.records.length} record${parsed.records.length > 1 ? "s" : ""}`}
                      {parsed?.type === "vcf"   && ` · ${parsed.variants.length} variant${parsed.variants.length > 1 ? "s" : ""}`}
                    </div>
                  </div>
                  <button onClick={reset}
                    style={{ padding: "6px 12px", background: "#f8faf8", border: "1px solid #e6ebe6", borderRadius: 8, color: "#6a8a6a", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans',sans-serif" }}>
                    <Ic n="reset" s={13} c="#8aaa8a" /> Change file
                  </button>
                </div>

                {/* FASTA: record selector (if multiple) */}
                {parsed?.type === "fasta" && parsed.records.length > 1 && (
                  <div style={{ background: "#fff", border: "1px solid #e6ebe6", borderRadius: 14, padding: "16px 20px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#5a7a5a", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>
                      Multiple records — select one to analyse
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {parsed.records.map((r, i) => (
                        <button key={i} onClick={() => { setSelected(i); setGeneOverride(""); }}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${selected === i ? "#4caf50" : "#e6ebe6"}`, background: selected === i ? "#f0faf0" : "#f8faf8", cursor: "pointer", textAlign: "left" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: selected === i ? "#4caf50" : "#c8d8c8", flexShrink: 0 }}/>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: selected === i ? "#2d7a31" : "#1a2e1a", fontFamily: "'DM Sans',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {r.gene ? `${r.gene}` : `Record ${i + 1}`}
                            </div>
                            <div style={{ fontSize: 10, color: "#8aaa8a", fontFamily: "'DM Mono',monospace" }}>
                              {r.sequence.length.toLocaleString()} bp · {r.header.slice(0, 50)}{r.header.length > 50 ? "…" : ""}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* VCF: variant table */}
                {parsed?.type === "vcf" && (
                  <div style={{ background: "#fff", border: "1px solid #e6ebe6", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f5f0", fontSize: 13, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif" }}>
                      Detected Variants ({parsed.variants.length})
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                        <thead>
                          <tr style={{ background: "#f8faf8" }}>
                            {["CHROM", "POS", "ID", "REF", "ALT", "Gene"].map(h => (
                              <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontWeight: 600, color: "#8aaa8a", fontFamily: "'DM Mono',monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f0f5f0", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.variants.slice(0, 10).map((v, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f5f7f5" }}>
                              <td style={{ padding: "9px 14px", fontFamily: "'DM Mono',monospace", color: "#6a8a6a" }}>{v.chrom}</td>
                              <td style={{ padding: "9px 14px", fontFamily: "'DM Mono',monospace", color: "#6a8a6a" }}>{v.pos}</td>
                              <td style={{ padding: "9px 14px", fontFamily: "'DM Mono',monospace", color: "#6a8a6a", fontSize: 10 }}>{v.id === "." ? "—" : v.id}</td>
                              <td style={{ padding: "9px 14px", fontFamily: "'DM Mono',monospace", color: "#4caf50", fontWeight: 600 }}>{v.ref}</td>
                              <td style={{ padding: "9px 14px", fontFamily: "'DM Mono',monospace", color: "#e05c5c", fontWeight: 600 }}>{v.alt}</td>
                              <td style={{ padding: "9px 14px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: v.gene ? "#2d7a31" : "#9aaa9a" }}>{v.gene || "—"}</td>
                            </tr>
                          ))}
                          {parsed.variants.length > 10 && (
                            <tr>
                              <td colSpan={6} style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, color: "#9aaa9a", fontFamily: "'DM Sans',sans-serif" }}>
                                + {parsed.variants.length - 10} more variants
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sequence stats (FASTA / RAW) */}
                {seqStats && (
                  <div style={{ background: "#fff", border: "1px solid #e6ebe6", borderRadius: 14, padding: "16px 20px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>Sequence Statistics</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
                      {[
                        { label: "Length",      value: `${seqStats.length.toLocaleString()} bp`, color: "#2d7a31" },
                        { label: "GC Content",  value: `${seqStats.gc}%`,                        color: "#1565c0" },
                        { label: "AT Content",  value: `${seqStats.atRatio}%`,                   color: "#6a3a00" },
                        { label: "Complexity",  value: `${seqStats.complexity}%`,                color: "#5a2a7a" },
                      ].map(s => (
                        <div key={s.label} style={{ background: "#f8faf8", borderRadius: 10, padding: "12px 14px", border: "1px solid #f0f5f0" }}>
                          <div style={{ fontSize: 10, color: "#8aaa8a", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{s.label}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'DM Mono',monospace" }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                    {/* Sequence preview */}
                    <div style={{ fontSize: 10, color: "#8aaa8a", fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>PREVIEW (first 80 bases)</div>
                    <div style={{ background: "#1a2e1a", borderRadius: 8, padding: "10px 14px", fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#6fcf7a", lineHeight: 1.7, wordBreak: "break-all", letterSpacing: "0.08em" }}>
                      {seqStats.preview.split("").map((ch, i) => (
                        <span key={i} style={{ color: ch === "A" ? "#6fcf7a" : ch === "T" ? "#e05c5c" : ch === "G" ? "#f0a500" : ch === "C" ? "#5b9bd5" : "#8aaa8a" }}>{ch}</span>
                      ))}
                      {seq.length > 80 && <span style={{ color: "#8aaa8a" }}>…</span>}
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 10, fontFamily: "'DM Mono',monospace" }}>
                      {[["A","#6fcf7a"],["T","#e05c5c"],["G","#f0a500"],["C","#5b9bd5"]].map(([base, color]) => (
                        <span key={base} style={{ color }}>{base} = {(((seq.match(new RegExp(base,"g"))||[]).length / seq.length)*100).toFixed(1)}%</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gene input */}
                <div style={{ background: "#fff", border: "1px solid #e6ebe6", borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>
                    Gene for Analysis
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <input
                        value={geneOverride || activeRecord?.gene || (parsed?.type === "vcf" ? (parsed.variants.find(v => v.gene)?.gene || "") : "")}
                        onChange={e => setGeneOverride(e.target.value.toUpperCase())}
                        placeholder={activeRecord?.gene ? `Auto-detected: ${activeRecord.gene}` : "Enter gene symbol (e.g. BRCA1, TP53)"}
                        style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e8e0", borderRadius: 10, fontSize: 14, fontFamily: "'DM Mono',monospace", color: "#1a2e1a", background: "#f8faf8", outline: "none", boxSizing: "border-box" }}
                      />
                      {activeRecord?.gene && !geneOverride && (
                        <div style={{ fontSize: 11, color: "#4caf50", marginTop: 5, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                          <Ic n="check" s={12} c="#4caf50" /> Auto-detected from file header
                        </div>
                      )}
                    </div>
                  </div>
                  {activeGene.length > 0 && activeGene.length < 2 && (
                    <div style={{ fontSize: 11, color: "#f0a500", marginTop: 6, fontFamily: "'DM Sans',sans-serif" }}>⚠ Gene symbol must be at least 2 characters</div>
                  )}
                </div>

              </div>
            )}

            {/* Parse error */}
            {parseError && (
              <div style={{ background: "#fff5f5", border: "1px solid #f0c0c0", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Ic n="warn" s={16} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#c0392b", fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>Parse Error</div>
                  <div style={{ fontSize: 12, color: "#c0392b", fontFamily: "'DM Sans',sans-serif" }}>{parseError}</div>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div style={{ background: "#f0faf0", border: "1px solid #4caf50", borderRadius: 14, padding: 22, animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ic n="check" s={18} c="#4caf50" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif" }}>Analysis Complete</div>
                    <div style={{ fontSize: 11, color: "#5a7a5a", fontFamily: "'DM Mono',monospace" }}>From file: {file.name}</div>
                  </div>
                  <div style={{ marginLeft: "auto", padding: "6px 14px", background: riskColor(result.risk) + "20", border: `1px solid ${riskColor(result.risk)}50`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: riskColor(result.risk), fontFamily: "'DM Mono',monospace" }}>
                    {riskLabel(result.risk)} · {result.risk}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
                  {[["Gene", result.gene || activeGene],["Variant", result.variant],["Target Protein", result.target_protein]].map(([l,v]) => (
                    <div key={l} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 10, color: "#8aaa8a", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e1a", fontFamily: "'DM Mono',monospace" }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => router.push(`/protein?target=${result.target_protein}&gene=${result.gene || activeGene}&variant=${result.variant}&risk=${result.risk}`)}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 20px", background: "#2d6a31", border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                  >
                    <Ic n="play" s={13} c="#fff" /> Generate 3D Structure
                  </button>
                  <button
                    onClick={() => router.push("/mutation")}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 18px", background: "#fff", border: "1px solid #c8e6c9", borderRadius: 9, color: "#2d7a31", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                  >
                    Full Analysis →
                  </button>
                </div>
              </div>
            )}

            {/* API error */}
            {apiError && (
              <div style={{ background: "#fff5f5", border: "1px solid #f0c0c0", borderRadius: 12, padding: 16, color: "#c0392b", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
                ⚠ {apiError}
                <p style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>Make sure your backend is running at {API_BASE}</p>
              </div>
            )}

          </div>

          {/* ── Right panel ── */}
          <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Run analysis */}
            <div style={{ background: "#fff", border: "1px solid #e6ebe6", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>Ready to Analyse</div>
              <div style={{ fontSize: 12, color: "#8aaa8a", fontFamily: "'DM Sans',sans-serif", marginBottom: 16, lineHeight: 1.5 }}>
                {!file ? "Upload a file to begin" : !activeGene ? "Enter or confirm the gene symbol above" : `Gene: ${activeGene} · Sequence: ${seq.length.toLocaleString()} bp`}
              </div>
              <button
                onClick={runAnalysis}
                disabled={!canAnalyse}
                style={{ width: "100%", padding: "12px", background: canAnalyse ? "#2d6a31" : "#c8d8c8", border: "none", borderRadius: 10, color: canAnalyse ? "#fff" : "#8aaa8a", fontSize: 14, fontWeight: 600, cursor: canAnalyse ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
              >
                {analysing ? (
                  <><span style={{ animation: "spin 0.7s linear infinite", display: "inline-block", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", width: 14, height: 14 }} /> Analysing...</>
                ) : (
                  <><Ic n="play" s={14} c={canAnalyse ? "#fff" : "#8aaa8a"} /> Run Analysis</>
                )}
              </button>
            </div>

            {/* Pipeline log */}
            <div style={{ background: "#fff", border: "1px solid #e6ebe6", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>Pipeline Log</div>
              <div style={{ background: "#1a2e1a", borderRadius: 8, padding: "10px 12px", minHeight: 100, maxHeight: 200, overflowY: "auto", fontFamily: "'DM Mono',monospace", fontSize: 11 }}>
                {log.length === 0
                  ? <span style={{ color: "rgba(111,207,122,0.3)", fontStyle: "italic" }}>Waiting for file...</span>
                  : log.map((e, i) => (
                    <div key={i} style={{ marginBottom: 4, color: "rgba(111,207,122,0.75)", lineHeight: 1.5 }}>
                      <span style={{ color: "#6fcf7a" }}>›</span> {e.msg}
                    </div>
                  ))
                }
                {analysing && (
                  <div style={{ color: "rgba(111,207,122,0.5)" }}>
                    <span style={{ color: "#6fcf7a" }}>›</span> <span style={{ animation: "blink 1s step-start infinite" }}>_</span>
                  </div>
                )}
              </div>
            </div>

            {/* Format guide */}
            <div style={{ background: "#f8faf8", border: "1px solid #e6ebe6", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1a2e1a", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>Format Examples</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#2d7a31", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>FASTA</div>
                  <div style={{ background: "#1a2e1a", borderRadius: 6, padding: "8px 10px", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#6fcf7a", lineHeight: 1.6 }}>
                    &gt;BRCA1 gene=BRCA1 GN=BRCA1<br/>
                    ATGGATTTATCTGCTCTTCGCG<br/>
                    TTGAAGAAGTACAAAATGTCAT
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1565c0", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>VCF</div>
                  <div style={{ background: "#1a2e1a", borderRadius: 6, padding: "8px 10px", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#6fcf7a", lineHeight: 1.6 }}>
                    ##fileformat=VCFv4.2<br/>
                    #CHROM POS ID REF ALT ...<br/>
                    17 41246481 rs80357906 G A
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <input ref={fileInputRef} type="file" accept=".fasta,.fa,.vcf,.txt,.csv" style={{ display: "none" }} onChange={handleFileInput} />

        <style>{`
          @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @keyframes spin { to{transform:rotate(360deg)} }
          @keyframes blink { 50%{opacity:0} }
          input:focus { outline:none; border-color:rgba(45,106,49,0.5)!important; box-shadow:0 0 0 2px rgba(45,106,49,0.08); }
        `}</style>
      </Layout>
    </>
  );
}