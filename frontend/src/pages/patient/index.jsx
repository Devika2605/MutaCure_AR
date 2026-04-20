// pages/patient/index.jsx — Patient Dashboard
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

function Icon({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, flexShrink: 0 };
  switch (n) {
    case "plus":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case "upload":  return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round"/></svg>;
    case "chevron": return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
    case "arrow":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case "file":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case "x":       return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    default: return null;
  }
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 240" style={{ width: "100%", height: 240 }}>
      <defs>
        <radialGradient id="pglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8f5e9" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#f8fff8" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="340" cy="120" rx="140" ry="120" fill="url(#pglow)"/>
      <path d="M60 220 C120 130,190 155,240 60 C290 -35,360 90,430 140" fill="none" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" opacity="0.45"/>
      <path d="M85 210 C140 130,205 148,252 60 C300 -28,368 100,440 148" fill="none" stroke="#a5d6a7" strokeWidth="2" strokeLinecap="round" opacity="0.25"/>
      {[[355,78,28],[380,100,21],[330,108,19],[360,126,17],[388,70,15],[326,82,16],[366,104,13],[344,62,13],[392,118,15],[314,100,13]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="#4caf50" opacity={0.09+i*0.022}/>
      ))}
      <circle cx="382" cy="96" r="11" fill="#e05c5c" opacity="0.9"/>
      <circle cx="382" cy="96" r="18" fill="#e05c5c" opacity="0.14"/>
    </svg>
  );
}

const RECENT = [
  { gene:"TCF7L2", disease:"Type 2 Diabetes",  time:"2 hours ago", risk:0.87, target:"PPARG",  variant:"rs7903146" },
  { gene:"BRCA1",  disease:"Breast Cancer",     time:"1 day ago",   risk:0.79, target:"BRCA1",  variant:"rs80357906" },
  { gene:"EGFR",   disease:"Lung Cancer",       time:"3 days ago",  risk:0.74, target:"EGFR",   variant:"rs121434568" },
];

const ACTIVITY = [
  { time:"14:27", text:"Protein model generated for", bold:"TCF7L2" },
  { time:"14:15", text:"ESMFold structure prediction completed", bold:"" },
  { time:"14:08", text:"New request received for", bold:"BRCA1 target" },
  { time:"13:56", text:"Sequence data retrieved: 122 amino-acids.", bold:"" },
];

export default function PatientDashboard() {
  const router     = useRouter();
  const { user }   = useAuth();
  const fileRef    = useRef(null);
  const [file, setFile] = useState(null);
  const [fileErr, setFileErr] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (![".fasta",".fa",".txt",".vcf",".csv"].includes(ext)) {
      setFileErr("Unsupported file type. Please upload .fasta, .vcf, .txt or .csv");
      return;
    }
    setFileErr(null);
    setFile(f);
  };

  const riskColor = r => r >= 0.7 ? "#e05c5c" : r >= 0.4 ? "#f0a500" : "#6fcf7a";
  const riskLabel = r => r >= 0.7 ? "HIGH" : r >= 0.4 ? "MED" : "LOW";

  return (
    <>
      <Head><title>My Dashboard — MutaCure AR</title></Head>
      <Layout pageTitle="Home">
        <div style={{ display:"flex", gap:24, alignItems:"flex-start" }}>

          {/* Main column */}
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:20 }}>

            {/* Hero */}
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e6ebe6", overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 480px", minHeight:220 }}>
              <div style={{ padding:"32px 36px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                <p style={{ fontSize:14, color:"#5a7a5a", margin:"0 0 4px", fontFamily:"'DM Sans',sans-serif" }}>
                  Welcome Back, <strong style={{ color:"#1a2e1a" }}>{user?.name || "Patient"}</strong>
                </p>
                <h2 style={{ fontSize:36, fontWeight:800, color:"#1a2e1a", margin:"0 0 10px", letterSpacing:"-0.025em", lineHeight:1.05, fontFamily:"'DM Sans',sans-serif" }}>MutaCure AR</h2>
                <p style={{ fontSize:13.5, color:"#5a7a5a", lineHeight:1.6, margin:"0 0 24px", fontFamily:"'DM Sans',sans-serif" }}>
                  Accelerate Your Research with<br/>Mutation to Therapy Tools
                </p>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <button onClick={() => router.push("/mutation")}
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 20px", background:"#2d6a31", border:"none", borderRadius:9, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    <Icon n="plus" s={15} c="#fff" /> New Analysis
                  </button>
                  <input ref={fileRef} type="file" accept=".fasta,.fa,.txt,.vcf,.csv" style={{ display:"none" }} onChange={handleFile} />
                  <button onClick={() => fileRef.current?.click()}
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 18px", background:"transparent", border:"1px solid #c8d8c8", borderRadius:9, color:"#3a6a3a", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    <Icon n="upload" s={14} c="#3a6a3a" /> Upload DNA File
                  </button>
                </div>
                {file && (
                  <div style={{ marginTop:12, padding:"9px 14px", background:"#f0faf0", border:"1px solid #c8e6c9", borderRadius:9, display:"flex", alignItems:"center", gap:10 }}>
                    <Icon n="file" s={13} c="#4caf50" />
                    <span style={{ fontSize:12, color:"#2d7a31", fontFamily:"'DM Mono',monospace", flex:1 }}>{file.name}</span>
                    <button onClick={() => router.push(`/mutation?mode=file&filename=${encodeURIComponent(file.name)}`)}
                      style={{ padding:"4px 12px", background:"#2d6a31", border:"none", borderRadius:6, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>Analyse →</button>
                    <button onClick={() => setFile(null)} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon n="x" s={13} c="#9aaa9a" /></button>
                  </div>
                )}
                {fileErr && <p style={{ fontSize:11, color:"#e05c5c", marginTop:8, fontFamily:"'DM Sans',sans-serif" }}>⚠ {fileErr}</p>}
              </div>
              <div style={{ background:"linear-gradient(135deg,#f0faf0,#e8f5e9)", overflow:"hidden" }}>
                <HeroIllustration />
              </div>
            </div>

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
              {[
                { label:"Gene", value:"TCF7L2", sub:"Type 2 Diabetes", extra:"4 New This Week", path:"/protein?target=PPARG&gene=TCF7L2&variant=rs7903146&risk=0.87" },
                { label:"Generated Models", value:"12", sub:"2 New This Week", extra:"", path:"/protein" },
              ].map((card, i) => (
                <div key={i} onClick={() => router.push(card.path)}
                  style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1fr", cursor:"pointer", transition:"border-color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#4caf50"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#e6ebe6"}>
                  <div style={{ padding:"20px" }}>
                    <div style={{ fontSize:11, color:"#8aaa8a", fontFamily:"'DM Mono',monospace", marginBottom:8 }}>{card.label}</div>
                    <div style={{ fontSize:i===0?20:32, fontWeight:700, color:"#1a2e1a", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>{card.value}</div>
                    <div style={{ fontSize:13, color:"#5a7a5a", fontFamily:"'DM Sans',sans-serif" }}>{card.sub}</div>
                    {card.extra && <div style={{ fontSize:12, color:"#8aaa8a", marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>{card.extra}</div>}
                  </div>
                  <div style={{ background:"linear-gradient(135deg,#f0faf0,#e8f5e9)", overflow:"hidden", minHeight:140 }}>
                    <svg viewBox="0 0 200 140" style={{ width:"100%", height:"100%" }}>
                      {[90,105,78,115,85,100,70,110,95].map((cy,j)=>(
                        <circle key={j} cx={60+j*10} cy={cy} r={14-j*0.5} fill="#4caf50" opacity={0.08+j*0.02}/>
                      ))}
                      <circle cx="130" cy="90" r="8" fill="#e05c5c" opacity="0.85"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom 3-col — simplified for patient */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
              {[
                { title:"Recent Analyses", gene:"TCF7L2", disease:"Type 2 Diabetes", time:"2 hours ago", status:"Complete", statusColor:"#5a7a5a", risk:0.87, target:"PPARG", variant:"rs7903146" },
                { title:"Research Insights", gene:"BRCA1", disease:"Breast Cancer", time:"1 day ago", status:"High Risk", statusColor:"#f0a500", risk:0.79, target:"BRCA1", variant:"rs80357906" },
                { title:"Active Projects", gene:"EGFR", disease:"Lung Cancer", time:"3 days ago", status:"Warning", statusColor:"#f0a500", risk:0.74, target:"EGFR", variant:"rs121434568" },
              ].map((card, i) => (
                <div key={i}
                  onClick={() => router.push(`/protein?target=${card.target}&gene=${card.gene}&variant=${card.variant}&risk=${card.risk}`)}
                  style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", padding:18, cursor:"pointer", transition:"border-color 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#4caf50";e.currentTarget.style.boxShadow="0 2px 12px rgba(74,163,84,0.1)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#e6ebe6";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1a2e1a", marginBottom:12, fontFamily:"'DM Sans',sans-serif" }}>{card.title}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#1a2e1a", fontFamily:"'DM Sans',sans-serif" }}>{card.gene}</div>
                  <div style={{ fontSize:12, color:"#8aaa8a", marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>{card.disease}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", background:"#f8faf8", borderRadius:8, marginBottom:10 }}>
                    <span style={{ fontSize:11, color:card.statusColor, fontFamily:"'DM Mono',monospace" }}>{card.status}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:5, background:`${riskColor(card.risk)}15`, color:riskColor(card.risk), fontFamily:"'DM Mono',monospace", fontWeight:600 }}>{riskLabel(card.risk)}</span>
                    <span style={{ fontSize:11, color:"#aabcaa", fontFamily:"'DM Mono',monospace" }}>{card.time}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right panel */}
          <div style={{ width:270, flexShrink:0, display:"flex", flexDirection:"column", gap:16 }}>

            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", padding:18 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#1a2e1a", marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>Recent Analyses</div>
              {RECENT.map((r,i)=>(
                <div key={i}
                  onClick={()=>router.push(`/protein?target=${r.target}&gene=${r.gene}&variant=${r.variant}&risk=${r.risk}`)}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom:12, marginBottom:12, borderBottom:i<RECENT.length-1?"1px solid #f0f5f0":"none", cursor:"pointer", borderRadius:6, padding:"8px 6px" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f8faf8"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
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
                <div style={{ width:7, height:7, borderRadius:"50%", background:"#4caf50" }}/>
              </div>
              {ACTIVITY.map((a,i)=>(
                <div key={i} style={{ fontSize:11.5, color:"#4a6a4a", marginBottom:10, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ color:"#8aaa8a", fontFamily:"'DM Mono',monospace" }}>[{a.time}]</span>{" "}{a.text}{" "}
                  {a.bold && <strong style={{ color:"#1a2e1a" }}>{a.bold}</strong>}
                </div>
              ))}
              <button onClick={()=>router.push("/history")}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"9px 14px", background:"#f5faf5", border:"1px solid #e0ede0", borderRadius:9, color:"#2d6a31", fontSize:12.5, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:4 }}>
                View Details <Icon n="arrow" s={13} c="#2d6a31" />
              </button>
            </div>

          </div>
        </div>
      </Layout>
    </>
  );
}