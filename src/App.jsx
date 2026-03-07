import { useState, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "";

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  });
}

function Tab({ label, active, onClick, warn }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#13131f" : "#0a0a14",
      border: `2px solid ${active ? "#ff6b6b" : "#2a2a45"}`,
      borderBottom: active ? "2px solid #13131f" : "2px solid #2a2a45",
      borderRadius: "10px 10px 0 0",
      padding: "12px 26px", marginBottom: -2,
      color: active ? "#ff6b6b" : "#666",
      fontFamily: "'Space Mono', monospace", fontSize: 12,
      cursor: "pointer", letterSpacing: 2, position: "relative",
      transition: "all 0.2s", fontWeight: active ? "700" : "400",
    }}>
      {label}
      {warn && <span style={{
        position: "absolute", top: 8, right: 10,
        width: 7, height: 7, borderRadius: "50%", background: "#ff6b6b"
      }} />}
    </button>
  );
}

function AgentCard({ agent, status, children }) {
  const border = status === "idle" ? "#2a2a45" : agent.color;
  const bg = status === "active" ? `${agent.color}18` : status === "done" ? "#0f1520" : "#0e0e1a";
  return (
    <div style={{
      background: bg, border: `2px solid ${border}`, borderRadius: 14,
      padding: "20px 22px", flex: 1, minWidth: 0, transition: "all 0.4s ease",
      boxShadow: status === "active" ? `0 0 32px ${agent.color}44` : status === "done" ? `0 0 18px ${agent.color}28` : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{
          background: status === "idle" ? "#1e1e3a" : `${agent.color}28`,
          border: `1.5px solid ${status === "idle" ? "#3a3a5a" : agent.color}`,
          borderRadius: 6, padding: "3px 10px", fontSize: 11,
          color: status === "idle" ? "#777" : agent.color, letterSpacing: 1, fontFamily: "monospace", fontWeight: "700"
        }}>{agent.label}</span>
        <span style={{ fontSize: 16 }}>{agent.icon}</span>
        <span style={{ fontSize: 12, color: status === "idle" ? "#555" : "#e0e0e0", letterSpacing: 2, fontFamily: "monospace", fontWeight: "600" }}>
          {agent.title.toUpperCase()}
        </span>
        {status === "active" && (
          <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: agent.color, animation: "pulse 1s infinite" }} />
        )}
        {status === "done" && <span style={{ marginLeft: "auto", color: agent.color, fontSize: 16, fontWeight: "bold" }}>✓</span>}
      </div>
      {children}
    </div>
  );
}

function Spinner({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#aaa", fontSize: 13, fontFamily: "monospace" }}>
      <div style={{ width: 14, height: 14, border: `2px solid ${color}40`, borderTop: `2px solid ${color}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Analysing transcript…
    </div>
  );
}

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button onClick={handle} style={{
      background: copied ? "#0a200a" : "#16162a",
      border: `1.5px solid ${copied ? "#6bff6b" : "#3a3a5a"}`,
      borderRadius: 6, padding: "5px 12px",
      color: copied ? "#6bff6b" : "#aaa",
      fontSize: 11, fontFamily: "monospace", cursor: "pointer",
      letterSpacing: 1, transition: "all 0.2s", whiteSpace: "nowrap", fontWeight: "600",
    }}>
      {copied ? "✓ Copied!" : `⎘ ${label}`}
    </button>
  );
}

function TimestampCard({ ts, rank }) {
  const s = ts.score;
  const sc = s >= 8 ? "#ffd93d" : s >= 6 ? "#ff6b6b" : "#00e5ff";
  const copyContent = `[${ts.timestamp}] ${ts.title}\n${ts.description || ""}${ts.why ? `\nScore ${ts.score}/10 — ${ts.why}` : ""}`;
  return (
    <div style={{
      background: "#0e0e1c", border: `1.5px solid ${sc}55`,
      borderRadius: 12, padding: "16px 18px", marginBottom: 12,
      display: "flex", gap: 14, alignItems: "flex-start",
      animation: "fadeIn 0.3s ease",
      boxShadow: `0 2px 12px ${sc}10`,
    }}>
      {rank !== undefined && (
        <div style={{
          minWidth: 30, height: 30, borderRadius: "50%",
          background: `${sc}22`, border: `2px solid ${sc}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "monospace", fontSize: 13, color: sc, fontWeight: "bold", flexShrink: 0,
        }}>{rank + 1}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{
            background: "#1a1a30", border: "1.5px solid #3a3a5a",
            borderRadius: 5, padding: "3px 8px", fontFamily: "monospace", fontSize: 12, color: "#bbb", fontWeight: "600"
          }}>{ts.timestamp}</span>
          {ts.score !== undefined && (
            <span style={{
              background: `${sc}22`, border: `1.5px solid ${sc}`,
              borderRadius: 5, padding: "3px 8px", fontSize: 12, fontFamily: "monospace", color: sc, fontWeight: "bold"
            }}>Score {ts.score}/10</span>
          )}
          {ts.hook_type && (
            <span style={{
              background: "#1a0f28", border: "1.5px solid #9b6bbb66",
              borderRadius: 5, padding: "3px 8px", fontSize: 11, color: "#c49bdd", fontWeight: "600"
            }}>{ts.hook_type}</span>
          )}
          {ts.intent_match && (
            <span style={{
              background: "#0a1f0a", border: "1.5px solid #6bff6b55",
              borderRadius: 5, padding: "3px 8px", fontSize: 11, color: "#6bff6b", fontWeight: "600"
            }}>✓ intent match</span>
          )}
          <span style={{ marginLeft: "auto" }}>
            <CopyButton text={copyContent} />
          </span>
        </div>
        <div style={{ color: "#f0f0f0", fontSize: 15, lineHeight: 1.6, marginBottom: 6, fontWeight: "600" }}>
          {ts.title}
        </div>
        {ts.description && (
          <div style={{ color: "#8888aa", fontSize: 13, lineHeight: 1.6, marginBottom: ts.why ? 6 : 0 }}>{ts.description}</div>
        )}
        {ts.why && <div style={{ color: "#6666aa", fontSize: 12, fontStyle: "italic", lineHeight: 1.5 }}>↳ {ts.why}</div>}
      </div>
    </div>
  );
}

const AGENTS = [
  { id: "shortlist", label: "Agent 1", title: "Shortlist", icon: "✂️", color: "#ff6b6b" },
  { id: "prioritize", label: "Agent 2", title: "Prioritize", icon: "🏆", color: "#ffd93d" },
];

const INTENT_PLACEHOLDER = `Who you are:
We are Byonyks, a medical technology company.

About this video:
Dr. Ahmed is a nephrologist and guest speaker discussing PD catheter insertion. He is NOT from Byonyks.

What we want:
- Educational clinical moments about PD catheters
- Moments that build patient trust in the procedure
- Key insights that patients or referring doctors would find valuable

What to avoid:
- Anything about pricing, business, or commercial topics
- Anything that implies Dr. Ahmed works for us`;

const HOW_TO = [
  "1. Open the YouTube video",
  "2. Click ••• below the video → \"Show transcript\"",
  "3. Select all the text & copy",
  "4. Paste into the Transcript tab",
];

export default function App() {
  const [tab, setTab] = useState("builder");
  const [rawContext, setRawContext] = useState("");
  const [buildingIntent, setBuildingIntent] = useState(false);
  const [intent, setIntent] = useState("");
  const [transcript, setTranscript] = useState("");
  const [reelsCount, setReelsCount] = useState(10);
  const [running, setRunning] = useState(false);
  const [agentStatus, setAgentStatus] = useState({ shortlist: "idle", prioritize: "idle" });
  const [shortlisted, setShortlisted] = useState(null);
  const [prioritized, setPrioritized] = useState(null);
  const [error, setError] = useState(null);
  const [showHow, setShowHow] = useState(false);
  const [showAgent1, setShowAgent1] = useState(false);

  const intentReady = intent.trim().length > 10;
  const transcriptReady = transcript.trim().length > 20;
  const canRun = transcriptReady && !running;

  async function buildIntent() {
    if (!rawContext.trim()) return;
    setBuildingIntent(true);
    try {
      const res = await fetch(`${API}/api/build-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: rawContext }),
      });
      const data = await res.json();
      if (data.intent) {
        setIntent(data.intent);
        setTab("intent");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBuildingIntent(false);
    }
  }

  const runPipeline = useCallback(async () => {
    if (!canRun) { if (!transcriptReady) setTab("transcript"); return; }
    setRunning(true);
    setError(null);
    setShortlisted(null);
    setPrioritized(null);
    setShowAgent1(false);
    setAgentStatus({ shortlist: "active", prioritize: "idle" });

    try {
      const res = await fetch(`${API}/api/pipeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, intent, reels_count: reelsCount }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setShortlisted(data.shortlisted);
      setAgentStatus({ shortlist: "done", prioritize: "active" });
      await new Promise(r => setTimeout(r, 600));
      setPrioritized(data.prioritized);
      setAgentStatus({ shortlist: "done", prioritize: "done" });
    } catch (e) {
      setError(e.message);
      setAgentStatus({ shortlist: "idle", prioritize: "idle" });
    } finally {
      setRunning(false);
    }
  }, [canRun, transcript, intent, reelsCount, transcriptReady]);

  function buildCopyAll() {
    if (!prioritized) return "";
    return prioritized.map((ts, i) =>
      `#${i + 1} [${ts.timestamp}] Score ${ts.score}/10\n${ts.title}\n${ts.description || ""}\n${ts.why ? `Reason: ${ts.why}` : ""}`
    ).join("\n\n─────────────────\n\n");
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#090915",
      fontFamily: "'Space Mono', 'Courier New', monospace",
      padding: "36px 24px",
      backgroundImage: "radial-gradient(ellipse at 15% 5%, #2a0d3a18 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, #0d1a3a18 0%, transparent 50%)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(1.5);} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        textarea { font-family: 'Space Mono', monospace !important; }
        textarea::placeholder { color: #3a3a5a !important; font-style: italic; }
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:#0e0e1a;} ::-webkit-scrollbar-thumb{background:#3a3a5a;border-radius:3px;}
        button:focus { outline: none; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#ff6b6b88", marginBottom: 10 }}>MULTI · AGENT · PIPELINE</div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, margin: 0,
            background: "linear-gradient(135deg, #ff6b6b, #ffd93d)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -1,
          }}>YouTube → Reels Engine</h1>
          <p style={{ color: "#666688", fontSize: 13, marginTop: 10, letterSpacing: 1 }}>
            Set intent · paste transcript · AI shortlists & ranks your best clips
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #2a2a45" }}>
          <Tab label="✨  BUILDER" active={tab === "builder"} onClick={() => setTab("builder")} warn={false} />
          <Tab label="🎯  INTENT" active={tab === "intent"} onClick={() => setTab("intent")} warn={!intentReady} />
          <Tab label="📄  TRANSCRIPT" active={tab === "transcript"} onClick={() => setTab("transcript")} warn={!transcriptReady} />
        </div>

        <div style={{
          background: "#13131f", border: "2px solid #2a2a45", borderTop: "none",
          borderRadius: "0 12px 12px 12px", padding: "26px", marginBottom: 22,
        }}>

          {/* Builder Tab */}
          {tab === "builder" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ color: "#ff6b6b", fontSize: 11, letterSpacing: 3, marginBottom: 8, fontWeight: "700" }}>✨ INTENT BUILDER</div>
              <div style={{ color: "#8888aa", fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>
                Paste anything — a video caption, title, a few rough notes, or a description of the session.
                AI will build a full structured intent for you and auto-fill the Intent tab.
              </div>
              <textarea
                value={rawContext}
                onChange={e => setRawContext(e.target.value)}
                placeholder={`Example:\n"Dr. Ahmed, a nephrologist from Aga Khan, talks about PD catheter insertion in a webinar hosted by us (Byonyks). We want medical clips for Facebook Reels. No business talk."`}
                rows={8}
                style={{
                  width: "100%", background: "#0a0a16",
                  border: `2px solid ${rawContext.trim().length > 10 ? "#ff6b6b88" : "#2a2a45"}`,
                  borderRadius: 10, padding: "16px 18px",
                  color: "#e0e0e0", fontSize: 13, resize: "vertical", outline: "none",
                  boxSizing: "border-box", lineHeight: 1.9, transition: "border-color 0.3s",
                }}
                onFocus={e => e.target.style.borderColor = "#ff6b6b"}
                onBlur={e => e.target.style.borderColor = rawContext.trim().length > 10 ? "#ff6b6b88" : "#2a2a45"}
              />
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={buildIntent}
                  disabled={buildingIntent || rawContext.trim().length < 10}
                  style={{
                    background: rawContext.trim().length > 10 ? "linear-gradient(135deg, #ff6b6b22, #ffd93d22)" : "#0e0e1a",
                    border: `2px solid ${rawContext.trim().length > 10 ? "#ff6b6b" : "#2a2a45"}`,
                    borderRadius: 10, padding: "12px 28px",
                    color: rawContext.trim().length > 10 ? "#ff6b6b" : "#333355",
                    fontFamily: "monospace", fontSize: 13, cursor: rawContext.trim().length > 10 ? "pointer" : "not-allowed",
                    letterSpacing: 2, fontWeight: "bold", transition: "all 0.2s",
                    boxShadow: rawContext.trim().length > 10 ? "0 0 20px #ff6b6b25" : "none",
                  }}
                >
                  {buildingIntent ? "✨ BUILDING INTENT…" : "✨ BUILD INTENT"}
                </button>
                {intentReady && (
                  <span style={{ color: "#6bff6b", fontSize: 12, fontWeight: "700" }}>
                    ✓ Intent ready — check the Intent tab
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Intent Tab */}
          {tab === "intent" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ color: "#ff6b6b", fontSize: 11, letterSpacing: 3, marginBottom: 8, fontWeight: "700" }}>CAMPAIGN INTENT</div>
              <div style={{ color: "#8888aa", fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>
                Tell the agents who you are, what this video is about, and what clips you want.
                This filters what gets picked and weights how it's scored.
              </div>
              <textarea
                value={intent}
                onChange={e => setIntent(e.target.value)}
                placeholder={INTENT_PLACEHOLDER}
                rows={13}
                style={{
                  width: "100%", background: "#0a0a16",
                  border: `2px solid ${intentReady ? "#ff6b6b88" : "#2a2a45"}`,
                  borderRadius: 10, padding: "16px 18px",
                  color: "#e0e0e0", fontSize: 13, resize: "vertical", outline: "none",
                  boxSizing: "border-box", lineHeight: 1.9, transition: "border-color 0.3s",
                }}
                onFocus={e => e.target.style.borderColor = "#ff6b6b"}
                onBlur={e => e.target.style.borderColor = intentReady ? "#ff6b6b88" : "#2a2a45"}
              />
              {intentReady && (
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#6bff6b", fontSize: 12, fontWeight: "700" }}>✓ Intent set</span>
                  <button onClick={() => setTab("transcript")} style={{
                    marginLeft: "auto", background: "#0a1f0a", border: "1.5px solid #6bff6b66",
                    borderRadius: 8, padding: "7px 16px", color: "#6bff6b",
                    fontSize: 11, fontFamily: "monospace", cursor: "pointer", letterSpacing: 1, fontWeight: "700",
                  }}>NEXT: TRANSCRIPT →</button>
                </div>
              )}
            </div>
          )}

          {/* Transcript Tab */}
          {tab === "transcript" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ color: "#ff6b6b", fontSize: 11, letterSpacing: 3, fontWeight: "700" }}>YOUTUBE TRANSCRIPT</div>
                <button onClick={() => setShowHow(v => !v)} style={{
                  background: "#0a0a16", border: "1.5px solid #3a3a5a", borderRadius: 7,
                  padding: "6px 13px", color: "#aaa", fontSize: 11,
                  fontFamily: "monospace", cursor: "pointer", letterSpacing: 1, fontWeight: "600",
                }}>{showHow ? "▼ HIDE" : "▶ HOW TO GET IT"}</button>
              </div>
              {showHow && (
                <div style={{
                  background: "#0a0a16", border: "1.5px solid #00e5ff33", borderRadius: 10,
                  padding: "14px 18px", marginBottom: 14,
                }}>
                  {HOW_TO.map((l, i) => <div key={i} style={{ color: "#00e5ffaa", fontSize: 13, lineHeight: 2.1, fontWeight: "600" }}>{l}</div>)}
                </div>
              )}
              <div style={{ position: "relative" }}>
                <textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder={"0:00\nHey everyone, welcome back...\n0:14\nToday we're covering PD catheters..."}
                  rows={13}
                  style={{
                    width: "100%", background: "#0a0a16",
                    border: `2px solid ${transcriptReady ? "#ff6b6b88" : "#2a2a45"}`,
                    borderRadius: 10, padding: "16px 18px",
                    color: "#e0e0e0", fontSize: 13, resize: "vertical", outline: "none",
                    boxSizing: "border-box", lineHeight: 1.8, transition: "border-color 0.3s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#ff6b6b"}
                  onBlur={e => e.target.style.borderColor = transcriptReady ? "#ff6b6b88" : "#2a2a45"}
                />
                {transcript.length > 0 && (
                  <div style={{ position: "absolute", bottom: 12, right: 14, color: "#4a4a6a", fontSize: 11, fontWeight: "600" }}>
                    {transcript.split("\n").filter(Boolean).length} lines
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Intent pill */}
        {intentReady && (
          <div style={{
            background: "#0c160c", border: "1.5px solid #6bff6b33", borderRadius: 10,
            padding: "10px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12,
            animation: "fadeIn 0.3s ease",
          }}>
            <span style={{ fontSize: 14 }}>🎯</span>
            <div style={{ flex: 1, color: "#6baa6b", fontSize: 12, fontStyle: "italic", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {intent.trim().slice(0, 120)}{intent.trim().length > 120 ? "…" : ""}
            </div>
            <button onClick={() => setTab("intent")} style={{
              background: "none", border: "1px solid #3a5a3a", borderRadius: 5,
              padding: "3px 10px", color: "#6baa6b", fontSize: 11, cursor: "pointer", fontFamily: "monospace"
            }}>edit</button>
          </div>
        )}

        {/* Reels Count + Run */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{
            background: "#13131f", border: "2px solid #2a2a45", borderRadius: 14,
            padding: "18px 26px", width: "100%", maxWidth: 500, boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "#aaaacc", fontSize: 12, letterSpacing: 2, fontWeight: "700" }}>REELS TO GENERATE</span>
              <span style={{
                background: "#ff6b6b22", border: "2px solid #ff6b6b",
                borderRadius: 8, padding: "4px 14px",
                color: "#ff6b6b", fontSize: 16, fontFamily: "monospace", fontWeight: "bold"
              }}>{reelsCount}</span>
            </div>
            <input
              type="range" min={5} max={20} step={1}
              value={reelsCount}
              onChange={e => setReelsCount(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#ff6b6b", cursor: "pointer", height: 6 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ color: "#555577", fontSize: 11, fontWeight: "600" }}>5 min</span>
              <span style={{ color: "#555577", fontSize: 11, fontWeight: "600" }}>20 max</span>
            </div>
          </div>

          {!intentReady && (
            <div style={{ color: "#665566", fontSize: 12, letterSpacing: 1 }}>
              💡 Adding intent gives context-aware results (optional but recommended)
            </div>
          )}
          <button
            onClick={runPipeline}
            disabled={!canRun}
            style={{
              background: canRun ? "linear-gradient(135deg, #ff6b6b22, #ffd93d22)" : "#0e0e1a",
              border: `2px solid ${canRun ? "#ff6b6b" : "#2a2a45"}`,
              borderRadius: 14, padding: "15px 56px",
              color: canRun ? "#ff6b6b" : "#333355",
              fontFamily: "monospace", fontSize: 14, cursor: canRun ? "pointer" : "not-allowed",
              letterSpacing: 3, fontWeight: "bold", transition: "all 0.2s",
              boxShadow: canRun ? "0 0 28px #ff6b6b30" : "none",
            }}
          >
            {running ? "RUNNING AGENTS…" : `▶  FIND ${reelsCount} REELS`}
          </button>
        </div>

        {/* Agent Status */}
        <div style={{ display: "flex", gap: 14, marginBottom: 32, alignItems: "stretch" }}>
          {AGENTS.map((agent, i) => (
            <div key={agent.id} style={{ display: "flex", alignItems: "center", flex: 1, gap: 14, minWidth: 0 }}>
              <AgentCard agent={agent} status={agentStatus[agent.id]}>
                {agentStatus[agent.id] === "active" && <Spinner color={agent.color} />}
                {agentStatus[agent.id] === "idle" && (
                  <div style={{ color: "#444466", fontSize: 12 }}>
                    {agent.id === "shortlist"
                      ? intentReady ? "Intent-aware moment selection" : "Finds best reel moments"
                      : intentReady ? "Intent-weighted virality scoring" : "Scores & ranks by virality"
                    }
                  </div>
                )}
                {agent.id === "shortlist" && agentStatus.shortlist === "done" && (
                  <div style={{ color: "#ff6b6b", fontSize: 12, fontWeight: "700" }}>✓ {shortlisted?.length || 0} moments selected</div>
                )}
                {agent.id === "prioritize" && agentStatus.prioritize === "done" && (
                  <div style={{ color: "#ffd93d", fontSize: 12, fontWeight: "700" }}>✓ Ranked · top @ {prioritized?.[0]?.timestamp}</div>
                )}
              </AgentCard>
              {i < AGENTS.length - 1 && (
                <div style={{ color: agentStatus.shortlist === "done" ? "#ff6b6b" : "#2a2a45", fontSize: 20, flexShrink: 0, fontWeight: "bold" }}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#1a0808", border: "2px solid #ff6b6b66", borderRadius: 12,
            padding: "14px 18px", color: "#ff9999", fontSize: 13, marginBottom: 22, animation: "fadeIn 0.3s ease", fontWeight: "600",
          }}>⚠ {error}</div>
        )}

        {/* Agent 1 Output */}
        {shortlisted && (
          <div style={{ marginBottom: 30, animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ color: "#ff6b6b", fontSize: 12, letterSpacing: 2, fontWeight: "700" }}>✂️  AGENT 1 — SHORTLIST</span>
              <div style={{ flex: 1, height: 2, background: "#ff6b6b33" }} />
              <span style={{ color: "#ff9999", fontSize: 12, fontWeight: "700" }}>{shortlisted.length} moments</span>
              <button
                onClick={() => setShowAgent1(v => !v)}
                style={{
                  background: "#1a0a0a", border: "1.5px solid #ff6b6b55", borderRadius: 6,
                  padding: "5px 12px", color: "#ff9999", fontSize: 11,
                  fontFamily: "monospace", cursor: "pointer", letterSpacing: 1, fontWeight: "700",
                }}
              >{showAgent1 ? "▼ HIDE" : "▶ SHOW ALL"}</button>
            </div>
            {showAgent1 && shortlisted.map((ts, i) => <TimestampCard key={i} ts={ts} />)}
            {!showAgent1 && (
              <div style={{
                background: "#110a0a", border: "1.5px solid #ff6b6b33", borderRadius: 10,
                padding: "12px 18px", display: "flex", flexWrap: "wrap", gap: 10,
              }}>
                {shortlisted.map((ts, i) => (
                  <span key={i} style={{
                    background: "#1f0f0f", border: "1.5px solid #ff6b6b55",
                    borderRadius: 6, padding: "5px 11px", fontSize: 12,
                    fontFamily: "monospace", color: "#ff9999", fontWeight: "600",
                  }}>{ts.timestamp}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agent 2 Output */}
        {prioritized && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ color: "#ffd93d", fontSize: 12, letterSpacing: 2, fontWeight: "700" }}>🏆  AGENT 2 — RANKED OUTPUT</span>
              <div style={{ flex: 1, height: 2, background: "#ffd93d33" }} />
              <CopyButton text={buildCopyAll()} label="Copy All" />
            </div>

            {/* Podium */}
            <div style={{
              display: "flex", gap: 12, marginBottom: 20,
              background: "#0f0f1a", border: "2px solid #ffd93d33", borderRadius: 14, padding: "18px 20px",
            }}>
              {prioritized.slice(0, 3).map((ts, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                const sc = ts.score >= 8 ? "#ffd93d" : ts.score >= 6 ? "#ff6b6b" : "#00e5ff";
                return (
                  <div key={i} style={{ flex: 1, borderRight: i < 2 ? "1px solid #2a2a45" : "none", paddingRight: i < 2 ? 14 : 0 }}>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>{medals[i]}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 14, color: sc, fontWeight: "bold", marginBottom: 4 }}>{ts.timestamp}</div>
                    <div style={{ color: "#aaaacc", fontSize: 12, lineHeight: 1.5, marginBottom: 4 }}>{ts.title}</div>
                    <div style={{ color: sc, fontSize: 12, fontWeight: "700" }}>Score: {ts.score}/10</div>
                  </div>
                );
              })}
            </div>

            {prioritized.map((ts, i) => <TimestampCard key={i} ts={ts} rank={i} />)}

            <div style={{ textAlign: "center", marginTop: 20, color: "#444466", fontSize: 12, letterSpacing: 1, fontWeight: "600" }}>
              {prioritized.length} clips · {intentReady ? "intent-weighted scoring" : "general virality scoring"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
