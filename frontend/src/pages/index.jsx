// pages/index.jsx — Dashboard / Home
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const Icon = ({ n, s = 16, c = "currentColor" }) => {
  const st = { width: s, height: s, flexShrink: 0 };
  switch (n) {
    case "plus":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case "upload":  return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round"/></svg>;
    case "chevron": return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
    case "gene":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M8 3c0 4 8 4 8 8s-8 4-8 8M16 3c0 4-8 4-8 8s8 4 8 8" strokeLinecap="round"/></svg>;
    case "models":  return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
    case "clock":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "warn":    return <svg style={st} viewBox="0 0 24 24" fill="#f0a500"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>;
    case "arrow":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case "db":      return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/></svg>;
    case "cube":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
    case "edit":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case "check":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
    case "file":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case "x":       return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    default: return null;
  }
};

function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 240" style={{ width: "100%", height: 240 }}>
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8f5e9" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#f8fff8" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="340" cy="120" rx="140" ry="120" fill="url(#glow)"/>
      <path d="M60 220 C120 130,190 155,240 60 C290 -35,360 90,430 140" fill="none" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" opacity="0.45"/>
      <path d="M85 210 C140 130,205 148,252 60 C300 -28,368 100,440 148" fill="none" stroke="#a5d6a7" strokeWidth="2" strokeLinecap="round" opacity="0.25"/>
      {[[105,188],[145,158],[183,132],[218,106],[250,88],[278,88],[308,102],[338,122]].map(([x,y],i) => (
        <line key={i} x1={x-10} y1={y} x2={x+16} y2={y+10} stroke="#c8e6c9" strokeWidth="2" opacity="0.55"/>
      ))}
      {[[355,78,28],[380,100,21],[330,108,19],[360,126,17],[388,70,15],[326,82,16],[366,104,13],[344,62,13],[392,118,15],[314,100,13],[375,82,11],[342,122,12],[402,90,10],[308,92,11]].map(([cx,cy,r],i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#4caf50" opacity={0.09 + i*0.022}/>
      ))}
      <circle cx="382" cy="96" r="11" fill="#e05c5c" opacity="0.9"/>
      <circle cx="382" cy="96" r="18" fill="#e05c5c" opacity="0.14"/>
      {[[420,42,3.5],[436,108,2.5],[300,34,2.5],[282,135,2],[450,160,2]].map(([x,y,r],i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#4caf50" opacity={0.2+i*0.07}/>
      ))}
    </svg>
  );
}

const RECENT_RIGHT = [
  { gene:"TCF7L2", disease:"Type 2 Diabetes", time:"2 hours ago", risk:0.87, target:"PPARG",  variant:"rs7903146"   },
  { gene:"BRCA1",  disease:"Breast Cancer",   time:"1 day ago",   risk:0.79, target:"BRCA1",  variant:"rs80357906"  },
  { gene:"EGFR",   disease:"Lung Cancer",     time:"3 days ago",  risk:0.74, target:"EGFR",   variant:"rs121434568" },
];

const ACTIVITY = [
  { time:"14:27", text:"Protein model generated for",           bold:"TCF7L2"      },
  { time:"14:15", text:"ESMFold structure prediction completed", bold:""            },
  { time:"14:08", text:"New request received for",              bold:"BRCA1 target" },
  { time:"13:56", text:"Sequence data retrieved: 122 amino-acids.", bold:""        },
];

const BOTTOM_CARDS = [
  { title:"Recent Analyses",   gene:"TCF7L2", disease:"Type 2 Diabetes", time:"2 hours ago", status:{ label:"Complete",  icon:"clock", color:"#5a7a5a" }, fields:[["Gene:","TCF7L2"],["rs7903146 (C-T)",""],["Target: PPARG",""]], score:"0.87", scoreBg:"#e8f5e9", scoreColor:"#2d7a31", tag:"PPARG",   tagBg:"#f0f4f0",                  risk:0.87, target:"PPARG",  variant:"rs7903146"   },
  { title:"Research Insights", gene:"BRCA1",  disease:"Breast Cancer",   time:"1 day ago",   status:{ label:"High Risk", icon:"warn",  color:"#f0a500" }, fields:[["Gene:","BRCA1"],["rs121434568",""],["Target: BRCA1",""]],   score:"0.87", scoreBg:"#2d6a31", scoreColor:"#fff",    tag:"Riscol",  tagBg:"#f0f4f0",                  risk:0.79, target:"BRCA1",  variant:"rs80357906"  },
  { title:"Active Projects",   gene:"EGFR",   disease:"Lung Cancer",     time:"3 days ago",  status:{ label:"Warning",   icon:"warn",  color:"#f0a500" }, fields:[["Gene:","EGFR"],["rs121434568",""],["Target: EGFR",""]],     score:"—",    scoreBg:"#f8f8f8", scoreColor:"#8aaa8a", tag:"Warning", tagBg:"#fff5f0", tagColor:"#e05c5c", risk:0.74, target:"EGFR",   variant:"rs121434568" },
];

const RESOURCES = [
  { label:"Protein Database", icon:"db",   path:"/protein"  },
  { label:"AR Viewer Guide",  icon:"cube", path:"/ar"       },
  { label:"Mutation Report",  icon:"edit", path:"/mutation" },
];

const PIPELINE_STEPS = [
  { label:"Input",     key:"input"     },
  { label:"Mutation",  key:"mutation"  },
  { label:"Pathway",   key:"pathway"   },
  { label:"Protein",   key:"protein"   },
  { label:"Structure", key:"structure" },
  { label:"3D + AR",   key:"ar"        },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const fileInputRef = useRef(null);

  const [uploadedFile,   setUploadedFile]   = useState(null);
  const [uploadError,    setUploadError]    = useState(null);
  const [pipelineActive, setPipelineActive] = useState(false);
  const [pipelineStep,   setPipelineStep]   = useState(-1);

  // Wait for auth before rendering
  if (loading || !user) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = [".fasta", ".fa", ".txt", ".vcf", ".csv"];
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setUploadError(`Unsupported file type. Please upload: ${allowed.join(", ")}`);
      setUploadedFile(null);
      return;
    }
    setUploadError(null);
    setUploadedFile(file);
  };

  const handleUploadAndAnalyse = () => {
    if (!uploadedFile) return;
    setPipelineActive(true);
    let step = 0;
    const interval = setInterval(() => {
      setPipelineStep(step);
      step++;
      if (step >= PIPELINE_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          router.push(`/mutation?mode=file&filename=${encodeURIComponent(uploadedFile.name)}`);
        }, 400);
      }
    }, 350);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setUploadError(null);
    setPipelineActive(false);
    setPipelineStep(-1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const navToAnalysis = (card) => {
    router.push(`/protein?target=${card.target}&gene=${card.gene}&variant=${card.variant}&risk=${card.risk}`);
  };

  return (
    <>
      <Head><title>Home — MutaCure AR</title></Head>
      <Layout pageTitle="Home">
        <div style={{ display:"flex", gap:24, alignItems:"flex-start" }}>

          {/* ── Left+Center ── */}
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:20 }}>

            {/* Hero */}
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e6ebe6", overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 480px", minHeight:220 }}>
              <div style={{ padding:"32px 36px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                <p style={{ fontSize:14, color:"#5a7a5a", margin:"0 0 4px", fontFamily:"'DM Sans',sans-serif" }}>
                  Welcome Back, <strong style={{ color:"#1a2e1a" }}>{user?.name || "Doctor"}</strong>
                </p>
                <h2 style={{ fontSize:36, fontWeight:800, color:"#1a2e1a", margin:"0 0 10px", letterSpacing:"-0.025em", lineHeight:1.05, fontFamily:"'DM Sans',sans-serif" }}>
                  MutaCure AR
                </h2>
                <p style={{ fontSize:13.5, color:"#5a7a5a", lineHeight:1.6, margin:"0 0 24px", fontFamily:"'DM Sans',sans-serif" }}>
                  Accelerate Your Research with<br/>Mutation to Therapy Tools
                </p>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <button onClick={() => router.push("/mutation")}
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 20px", background:"#2d6a31", border:"none", borderRadius:9, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    <Icon n="plus" s={15} c="#fff" /> New Analysis
                  </button>
                  <input ref={fileInputRef} type="file" accept=".fasta,.fa,.txt,.vcf,.csv" style={{ display:"none" }} onChange={handleFileChange} />
                  <button onClick={() => fileInputRef.current?.click()}
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 18px", background:"transparent", border:"1px solid #c8d8c8", borderRadius:9, color:"#3a6a3a", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    <Icon n="upload" s={14} c="#3a6a3a" /> Upload DNA File
                  </button>
                </div>

                {uploadedFile && (
                  <div style={{ marginTop:14, padding:"10px 14px", background:"#f0faf0", border:"1px solid #c8e6c9", borderRadius:9, display:"flex", alignItems:"center", gap:10 }}>
                    <Icon n="file" s={14} c="#4caf50" />
                    <span style={{ fontSize:12, color:"#2d7a31", fontFamily:"'DM Mono',monospace", flex:1 }}>{uploadedFile.name}</span>
                    <button onClick={handleUploadAndAnalyse} style={{ padding:"5px 12px", background:"#2d6a31", border:"none", borderRadius:7, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      Analyse →
                    </button>
                    <button onClick={clearFile} style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}>
                      <Icon n="x" s={14} c="#9aaa9a" />
                    </button>
                  </div>
                )}
                {uploadError && (
                  <div style={{ marginTop:10, fontSize:11, color:"#e05c5c", fontFamily:"'DM Sans',sans-serif" }}>⚠ {uploadError}</div>
                )}
              </div>
              <div style={{ background:"linear-gradient(135deg,#f0faf0,#e8f5e9)", position:"relative", overflow:"hidden" }}>
                <HeroIllustration />
              </div>
            </div>

            {/* Pipeline progress */}
            {pipelineActive && (
              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", padding:"18px 22px" }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#1a2e1a", marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>Processing Pipeline</div>
                <div style={{ display:"flex", alignItems:"center" }}>
                  {PIPELINE_STEPS.map((step, i) => {
                    const done   = i < pipelineStep;
                    const active = i === pipelineStep;
                    return (
                      <div key={step.key} style={{ display:"flex", alignItems:"center", flex: i < PIPELINE_STEPS.length - 1 ? 1 : 0 }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:done?"#4caf50":active?"#f0faf0":"#f8faf8", border:`2px solid ${done?"#4caf50":active?"#4caf50":"#e0e8e0"}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.3s" }}>
                            {done ? <Icon n="check" s={14} c="#fff" /> : <span style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:active?"#2d7a31":"#9aaa9a", fontWeight:600 }}>{i+1}</span>}
                          </div>
                          <span style={{ fontSize:10, fontFamily:"'DM Sans',sans-serif", color:done?"#2d7a31":active?"#1a2e1a":"#9aaa9a", fontWeight:active?600:400, whiteSpace:"nowrap" }}>{step.label}</span>
                        </div>
                        {i < PIPELINE_STEPS.length - 1 && (
                          <div style={{ flex:1, height:2, background:done?"#4caf50":"#e0e8e0", margin:"0 4px", marginBottom:18, transition:"background 0.3s" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Analyses header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#1a2e1a", margin:0, fontFamily:"'DM Sans',sans-serif" }}>Recent Analyses</h3>
              <button onClick={() => router.push("/history")}
                style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", color:"#4caf50", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                View All <Icon n="chevron" s={14} c="#4caf50" />
              </button>
            </div>

            {/* Two big cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div onClick={() => router.push("/protein?target=PPARG&gene=TCF7L2&variant=rs7903146&risk=0.87")}
                style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1fr", cursor:"pointer", transition:"border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="#4caf50"}
                onMouseLeave={e => e.currentTarget.style.borderColor="#e6ebe6"}>
                <div style={{ padding:"20px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"#f0faf0", border:"1px solid #c8e6c9", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon n="gene" s={14} c="#4caf50" />
                    </div>
                    <span style={{ fontSize:11, color:"#8aaa8a", fontFamily:"'DM Mono',monospace" }}>Gene</span>
                  </div>
                  <div style={{ fontSize:20, fontWeight:700, color:"#1a2e1a", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>TCF7L2</div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#1a2e1a", marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Type 2 Diabetes</div>
                  <div style={{ fontSize:12, color:"#8aaa8a", fontFamily:"'DM Sans',sans-serif" }}>4 New This Week</div>
                </div>
                <div style={{ background:"linear-gradient(135deg,#f0faf0,#e8f5e9)", overflow:"hidden", minHeight:140 }}>
                  <svg viewBox="0 0 200 140" style={{ width:"100%", height:"100%" }}>
                    {[90,105,78,115,85,100,70,110,95].map((cy,i) => (
                      <circle key={i} cx={60+i*10} cy={cy} r={14-i*0.5} fill="#4caf50" opacity={0.08+i*0.02}/>
                    ))}
                    <circle cx="130" cy="90" r="8" fill="#e05c5c" opacity="0.85"/>
                  </svg>
                </div>
              </div>

              <div onClick={() => router.push("/protein")}
                style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1fr", cursor:"pointer", transition:"border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="#4caf50"}
                onMouseLeave={e => e.currentTarget.style.borderColor="#e6ebe6"}>
                <div style={{ padding:"20px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"#f0faf0", border:"1px solid #c8e6c9", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon n="models" s={14} c="#4caf50" />
                    </div>
                    <span style={{ fontSize:11, color:"#8aaa8a", fontFamily:"'DM Mono',monospace" }}>Generated Models</span>
                  </div>
                  <div style={{ fontSize:32, fontWeight:800, color:"#1a2e1a", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>12</div>
                  <div style={{ fontSize:12, color:"#8aaa8a", fontFamily:"'DM Sans',sans-serif" }}>2 New This Week</div>
                </div>
                <div style={{ background:"linear-gradient(135deg,#f0faf0,#e8f5e9)", overflow:"hidden", minHeight:140 }}>
                  <svg viewBox="0 0 200 140" style={{ width:"100%", height:"100%" }}>
                    {[80,95,70,108,78,100,65,112,88,95].map((cy,i) => (
                      <circle key={i} cx={40+i*14} cy={cy} r={16-i*0.3} fill="#4caf50" opacity={0.07+i*0.025}/>
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom 3-col cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
              {BOTTOM_CARDS.map((card, ci) => (
                <div key={ci} onClick={() => navToAnalysis(card)}
                  style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", padding:18, cursor:"pointer", transition:"border-color 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#4caf50"; e.currentTarget.style.boxShadow="0 2px 12px rgba(74,163,84,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#e6ebe6"; e.currentTarget.style.boxShadow="none"; }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1a2e1a", marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>{card.title}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:"#1a2e1a", fontFamily:"'DM Sans',sans-serif" }}>{card.gene}</div>
                      <div style={{ fontSize:12, color:"#8aaa8a", fontFamily:"'DM Sans',sans-serif" }}>{card.disease}</div>
                    </div>
                    <span style={{ fontSize:11, color:"#aabcaa", fontFamily:"'DM Mono',monospace" }}>{card.time}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 10px", background:"#f8faf8", borderRadius:8, marginBottom:12 }}>
                    {card.status.icon === "warn" ? <Icon n="warn" s={13} /> : <Icon n="clock" s={13} c={card.status.color} />}
                    <span style={{ fontSize:11, color:card.status.color, fontFamily:"'DM Mono',monospace" }}>{card.status.label}</span>
                  </div>
                  <div style={{ fontSize:11, color:"#5a7a5a", fontFamily:"'DM Mono',monospace", lineHeight:1.8, marginBottom:10 }}>
                    {card.fields.map(([k,v],i) => k && <div key={i}>{k} {v && <span style={{ fontWeight:600 }}>{v}</span>}</div>)}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                    {card.tag && (
                      <span style={{ padding:"3px 9px", background:card.tagBg||"#f0f4f0", borderRadius:6, fontSize:11, color:card.tagColor||"#5a7a5a", fontFamily:"'DM Mono',monospace", fontWeight:500 }}>{card.tag}</span>
                    )}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
                      <span style={{ fontSize:9, color:"#9aaa9a", fontFamily:"'DM Mono',monospace" }}>Score:</span>
                      {card.score !== "—"
                        ? <span style={{ padding:"4px 12px", background:card.scoreBg, color:card.scoreColor, borderRadius:8, fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{card.score}</span>
                        : <span style={{ fontSize:13, color:"#9aaa9a", fontFamily:"'DM Mono',monospace" }}>—</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ── Right panel ── */}
          <div style={{ width:270, flexShrink:0, display:"flex", flexDirection:"column", gap:16 }}>

            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", padding:18 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#1a2e1a", marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>Recent Analyses</div>
              {RECENT_RIGHT.map((r,i) => (
                <div key={i}
                  onClick={() => router.push(`/protein?target=${r.target}&gene=${r.gene}&variant=${r.variant}&risk=${r.risk}`)}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, paddingBottom:12, borderBottom:i<RECENT_RIGHT.length-1?"1px solid #f0f5f0":"none", cursor:"pointer", borderRadius:6, padding:"8px 6px" }}
                  onMouseEnter={e => e.currentTarget.style.background="#f8faf8"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1a2e1a", marginBottom:2, fontFamily:"'DM Sans',sans-serif" }}>{r.gene}</div>
                    <div style={{ fontSize:11, color:"#8aaa8a", fontFamily:"'DM Sans',sans-serif" }}>{r.disease}</div>
                  </div>
                  <span style={{ fontSize:11, color:"#b0c4b0", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{r.time}</span>
                </div>
              ))}
            </div>

            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", padding:18 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#1a2e1a", fontFamily:"'DM Sans',sans-serif" }}>Activity Log</div>
                <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#4caf50" }}/>
                  <span style={{ fontSize:18, letterSpacing:1, color:"#9aaa9a" }}>···</span>
                </div>
              </div>
              {ACTIVITY.map((a,i) => (
                <div key={i} style={{ fontSize:11.5, color:"#4a6a4a", marginBottom:10, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ color:"#8aaa8a", fontFamily:"'DM Mono',monospace" }}>[{a.time}]</span>{" "}
                  {a.text}{" "}
                  {a.bold && <strong style={{ color:"#1a2e1a" }}>{a.bold}</strong>}
                </div>
              ))}
              <button onClick={() => router.push("/history")}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"9px 14px", background:"#f5faf5", border:"1px solid #e0ede0", borderRadius:9, color:"#2d6a31", fontSize:12.5, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:4 }}>
                View Details <Icon n="arrow" s={13} c="#2d6a31" />
              </button>
            </div>

            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", padding:18 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#1a2e1a", marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>Resources & Tools</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {RESOURCES.map((r,i) => (
                  <button key={i} onClick={() => router.push(r.path)}
                    style={{ padding:"12px 10px", background:"#f8faf8", border:"1px solid #e6ebe6", borderRadius:10, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:6, textAlign:"left", transition:"border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor="#4caf50"}
                    onMouseLeave={e => e.currentTarget.style.borderColor="#e6ebe6"}>
                    <div style={{ width:28, height:28, borderRadius:7, background:"#e8f5e8", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon n={r.icon} s={14} c="#4caf50" />
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color:"#2a3a2a", fontFamily:"'DM Sans',sans-serif" }}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </Layout>
    </>
  );
}