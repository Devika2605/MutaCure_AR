// pages/index.jsx — Dashboard / Home
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

// ── Tiny inline SVG icons ────────────────────────────────────────────────────
const Icon = ({ n, s = 16, c = "currentColor" }) => {
  const st = { width: s, height: s, flexShrink: 0 };
  switch (n) {
    case "plus":     return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case "upload":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round"/></svg>;
    case "chevron":  return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
    case "gene":     return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M8 3c0 4 8 4 8 8s-8 4-8 8M16 3c0 4-8 4-8 8s8 4 8 8" strokeLinecap="round"/></svg>;
    case "models":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
    case "clock":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "warn":     return <svg style={st} viewBox="0 0 24 24" fill="#f0a500"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>;
    case "arrow":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case "db":       return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/></svg>;
    case "cube":     return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
    case "edit":     return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    default: return null;
  }
};

// ── Hero DNA + protein blob illustration ─────────────────────────────────────
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
      {/* Helix strand 1 */}
      <path d="M60 220 C120 130,190 155,240 60 C290 -35,360 90,430 140" fill="none" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" opacity="0.45"/>
      {/* Helix strand 2 */}
      <path d="M85 210 C140 130,205 148,252 60 C300 -28,368 100,440 148" fill="none" stroke="#a5d6a7" strokeWidth="2" strokeLinecap="round" opacity="0.25"/>
      {/* Rungs */}
      {[[105,188],[145,158],[183,132],[218,106],[250,88],[278,88],[308,102],[338,122]].map(([x,y],i) => (
        <line key={i} x1={x-10} y1={y} x2={x+16} y2={y+10} stroke="#c8e6c9" strokeWidth="2" opacity="0.55"/>
      ))}
      {/* Protein cluster */}
      {[
        [355,78,28],[380,100,21],[330,108,19],[360,126,17],[388,70,15],
        [326,82,16],[366,104,13],[344,62,13],[392,118,15],[314,100,13],
        [375,82,11],[342,122,12],[402,90,10],[308,92,11],
      ].map(([cx,cy,r],i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#4caf50" opacity={0.09 + i*0.022}/>
      ))}
      {/* Mutation dot */}
      <circle cx="382" cy="96" r="11" fill="#e05c5c" opacity="0.9"/>
      <circle cx="382" cy="96" r="18" fill="#e05c5c" opacity="0.14"/>
      {/* Particles */}
      {[[420,42,3.5],[436,108,2.5],[300,34,2.5],[282,135,2],[450,160,2]].map(([x,y,r],i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#4caf50" opacity={0.2+i*0.07}/>
      ))}
    </svg>
  );
}

// ── Static data ───────────────────────────────────────────────────────────────
const RECENT_RIGHT = [
  { gene:"TCF7L2", disease:"Type 2 Diabetes", time:"2 hours ago" },
  { gene:"BRCA1",  disease:"Breast Cancer",   time:"1 day ago"   },
  { gene:"EGFR",   disease:"Lung Cancer",     time:"3 days ago"  },
];

const ACTIVITY = [
  { time:"14:27", text:"Protein model generated for", bold:"TCF7L2" },
  { time:"14:15", text:"ESMFold structure prediction completed", bold:"" },
  { time:"14:08", text:"New request received for", bold:"BRCA1 target" },
  { time:"13:56", text:"Sequence data retrieved: 122 amino-acids.", bold:"" },
];

const BOTTOM_CARDS = [
  {
    title: "Recent Analyses",
    gene: "TCF7L2", disease: "Type 2 Diabetes", time: "2 hours ago",
    status: { label: "4 r Complete", icon: "clock", color: "#5a7a5a" },
    fields: [
      ["Gene:", "TCF7L2"], ["rs7903146 (C-T)", ""], ["Target: PPARG", ""],
    ],
    score: "0.87", scoreBg: "#e8f5e9", scoreColor: "#2d7a31",
    tag: "PPARG", tagBg: "#f0f4f0",
  },
  {
    title: "Research Insights",
    gene: "BRCA1", disease: "Breast Cancer", time: "1 day ago",
    status: { label: "High Risk Mutation", icon: "warn", color: "#f0a500" },
    fields: [
      ["Gene:", "BRCA1"], ["rs121434568", ""], ["Target: BRCA1", ""],
    ],
    score: "0.87", scoreBg: "#2d6a31", scoreColor: "#fff",
    tag: "Riscol", tagBg: "#f0f4f0",
  },
  {
    title: "Active Projects",
    gene: "EGFR", disease: "Lung Cancer", time: "3 days ago",
    status: { label: "Warning", icon: "warn", color: "#f0a500" },
    fields: [
      ["Gene:", "EGFR"], ["rs121434568", ""], ["Target: EGFR", ""],
    ],
    score: "—", scoreBg: "#f8f8f8", scoreColor: "#8aaa8a",
    tag: "Warning", tagBg: "#fff5f0", tagColor: "#e05c5c",
  },
];

const RESOURCES = [
  { label:"Protein Database", icon:"db" },
  { label:"AR Viewer Guide", icon:"cube" },
  { label:"Mutation Report", icon:"edit" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();

  return (
    <>
      <Head><title>Home — MutaCure AR</title></Head>
      <Layout pageTitle="Home">
        <div style={{ display:"flex", gap:24, alignItems:"flex-start" }}>

          {/* ── Left+Center main column ── */}
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:20 }}>

            {/* Hero card */}
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e6ebe6", overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 480px", minHeight:220 }}>
              <div style={{ padding:"32px 36px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                <p style={{ fontSize:14, color:"#5a7a5a", margin:"0 0 4px", fontFamily:"'DM Sans',sans-serif" }}>
                  Welcome Back, <strong style={{ color:"#1a2e1a" }}>Dr. Santos</strong>
                </p>
                <h2 style={{ fontSize:36, fontWeight:800, color:"#1a2e1a", margin:"0 0 10px", letterSpacing:"-0.025em", lineHeight:1.05, fontFamily:"'DM Sans',sans-serif" }}>
                  MutaCure AR
                </h2>
                <p style={{ fontSize:13.5, color:"#5a7a5a", lineHeight:1.6, margin:"0 0 24px", fontFamily:"'DM Sans',sans-serif" }}>
                  Accelerate Your Research with<br/>Mutation to Therapy Tools
                </p>
                <div style={{ display:"flex", gap:10 }}>
                  <button
                    onClick={() => router.push("/mutation")}
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 20px", background:"#2d6a31", border:"none", borderRadius:9, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                  >
                    <Icon n="plus" s={15} c="#fff" /> New Analysis
                  </button>
                  <button style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 18px", background:"transparent", border:"1px solid #c8d8c8", borderRadius:9, color:"#3a6a3a", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    <Icon n="upload" s={14} c="#3a6a3a" /> Upload DNA File
                  </button>
                </div>
              </div>
              {/* Hero illustration */}
              <div style={{ background:"linear-gradient(135deg,#f0faf0,#e8f5e9)", position:"relative", overflow:"hidden" }}>
                <HeroIllustration />
              </div>
            </div>

            {/* Recent Analyses header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#1a2e1a", margin:0, fontFamily:"'DM Sans',sans-serif" }}>Recent Analyses</h3>
              <button
                onClick={() => router.push("/history")}
                style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", color:"#4caf50", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
              >
                View All <Icon n="chevron" s={14} c="#4caf50" />
              </button>
            </div>

            {/* Two big summary cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {/* Card 1 — Gene analysis */}
              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1fr" }}>
                <div style={{ padding:"20px 20px" }}>
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
                <div style={{ background:"linear-gradient(135deg,#f0faf0,#e8f5e9)", position:"relative", overflow:"hidden", minHeight:140 }}>
                  <svg viewBox="0 0 200 140" style={{ width:"100%", height:"100%" }}>
                    {[90,105,78,115,85,100,70,110,95].map((cy,i) => (
                      <circle key={i} cx={60+i*10} cy={cy} r={14-i*0.5} fill="#4caf50" opacity={0.08+i*0.02}/>
                    ))}
                    <circle cx="130" cy="90" r="8" fill="#e05c5c" opacity="0.85"/>
                  </svg>
                </div>
              </div>

              {/* Card 2 — Generated Models */}
              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1fr" }}>
                <div style={{ padding:"20px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"#f0faf0", border:"1px solid #c8e6c9", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon n="models" s={14} c="#4caf50" />
                    </div>
                    <span style={{ fontSize:11, color:"#8aaa8a", fontFamily:"'DM Mono',monospace" }}>Generated Models</span>
                  </div>
                  <div style={{ fontSize:32, fontWeight:800, color:"#1a2e1a", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>12</div>
                  <div style={{ fontSize:12, color:"#8aaa8a", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>2 New This Week</div>
                  <div style={{ fontSize:12, color:"#8aaa8a", fontFamily:"'DM Sans',sans-serif" }}>2 New This Week</div>
                </div>
                <div style={{ background:"linear-gradient(135deg,#f0faf0,#e8f5e9)", position:"relative", overflow:"hidden", minHeight:140 }}>
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
                <div key={ci} style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", padding:18 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1a2e1a", marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>{card.title}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:"#1a2e1a", fontFamily:"'DM Sans',sans-serif" }}>{card.gene}</div>
                      <div style={{ fontSize:12, color:"#8aaa8a", fontFamily:"'DM Sans',sans-serif" }}>{card.disease}</div>
                    </div>
                    <span style={{ fontSize:11, color:"#aabcaa", fontFamily:"'DM Mono',monospace" }}>{card.time}</span>
                  </div>
                  {/* Status */}
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 10px", background:"#f8faf8", borderRadius:8, marginBottom:12 }}>
                    {card.status.icon === "warn"
                      ? <Icon n="warn" s={13} />
                      : <Icon n="clock" s={13} c={card.status.color} />
                    }
                    <span style={{ fontSize:11, color:card.status.color, fontFamily:"'DM Mono',monospace" }}>{card.status.label}</span>
                  </div>
                  {/* Fields */}
                  <div style={{ fontSize:11, color:"#5a7a5a", fontFamily:"'DM Mono',monospace", lineHeight:1.8, marginBottom:10 }}>
                    {card.fields.map(([k,v],i) => k && <div key={i}>{k} {v && <span style={{ fontWeight:600 }}>{v}</span>}</div>)}
                  </div>
                  {/* Score row */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                    {card.tag && (
                      <span style={{ padding:"3px 9px", background:card.tagBg||"#f0f4f0", borderRadius:6, fontSize:11, color:card.tagColor||"#5a7a5a", fontFamily:"'DM Mono',monospace", fontWeight:500 }}>
                        {card.tag}
                      </span>
                    )}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
                      <span style={{ fontSize:9, color:"#9aaa9a", fontFamily:"'DM Mono',monospace" }}>Score:</span>
                      {card.score !== "—" ? (
                        <span style={{ padding:"4px 12px", background:card.scoreBg, color:card.scoreColor, borderRadius:8, fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>
                          {card.score}
                        </span>
                      ) : (
                        <span style={{ fontSize:13, color:"#9aaa9a", fontFamily:"'DM Mono',monospace" }}>—</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ── Right panel ── */}
          <div style={{ width:270, flexShrink:0, display:"flex", flexDirection:"column", gap:16 }}>

            {/* Recent Analyses list */}
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", padding:18 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#1a2e1a", marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>Recent Analyses</div>
              {RECENT_RIGHT.map((r,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom:12, marginBottom:12, borderBottom: i < RECENT_RIGHT.length-1 ? "1px solid #f0f5f0" : "none" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1a2e1a", marginBottom:2, fontFamily:"'DM Sans',sans-serif" }}>{r.gene}</div>
                    <div style={{ fontSize:11, color:"#8aaa8a", fontFamily:"'DM Sans',sans-serif" }}>{r.disease}</div>
                  </div>
                  <span style={{ fontSize:11, color:"#b0c4b0", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{r.time}</span>
                </div>
              ))}
            </div>

            {/* Activity Log */}
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
              <button
                onClick={() => router.push("/history")}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"9px 14px", background:"#f5faf5", border:"1px solid #e0ede0", borderRadius:9, color:"#2d6a31", fontSize:12.5, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:4 }}
              >
                View Details <Icon n="arrow" s={13} c="#2d6a31" />
              </button>
            </div>

            {/* Resources & Tools */}
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e6ebe6", padding:18 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#1a2e1a", fontFamily:"'DM Sans',sans-serif" }}>Resources & Tools</div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:18, letterSpacing:1, color:"#9aaa9a" }}>···</span>
                  <Icon n="chevron" s={13} c="#9aaa9a" />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {RESOURCES.map((r,i) => (
                  <button key={i} style={{ padding:"12px 10px", background:"#f8faf8", border:"1px solid #e6ebe6", borderRadius:10, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:6, textAlign:"left" }}>
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