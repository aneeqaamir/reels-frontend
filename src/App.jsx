import { useState, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "";

// ─── tiny helpers ────────────────────────────────────────────────────────────

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

// ─── sub-components ──────────────────────────────────────────────────────────

function Tab({ label, active, onClick, warn }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#0d0d1a" : "none",
      border: `1.5px solid ${active ? "#ff6b6b55" : "#1a1a2e"}`,
      borderBottom: active ? "1.5px solid #0d0d1a" : "1.5px solid #1a1a2e",
      borderRadius: "10px 10px 0 0",
      padding: "10px 22px", marginBottom: -1,
      color: active ? "#ff6b6b" : "#333",
      fontFamily: "'Space Mono', monospace", fontSize: 11,
      cursor: "pointer", letterSpacing: 2, position: "relative",
      transition: "all 0.2s",
    }}>
      {label}
      {warn && <span style={{
        position: "absolute", top: 7, right: 8,
        width: 6, height: 6, borderRadius: "50%", background: "#ff6b6b"
      }} />}
    </button>
  );
}

function AgentCard({ agent, status, children }) {
  const border = status === "idle" ? "#2a2a4a" : agent.color;
  const bg = status === "active" ? `${agent.color}12` : status === "done" ? "#0d1117" : "#0d0d1a";
  return (
    <div style={{
      background: bg, border: `1.5px solid ${border}`, borderRadius: 14,
      padding: "18px 20px", flex: 1, minWidth: 0, transition: "all 0.4s ease",
      boxShadow: status === "active" ? `0 0 28px ${agent.color}30` : status === "done" ? `0 0 14px ${agent.color}18` : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
        <span style={{
          background: status === "idle" ? "#1e1e3a" : `${agent.color}22`,
          border: `1px solid ${status === "idle" ? "#333" : agent.color}`,
          borderRadius: 5, padding: "2px 8px", fontSize: 10,
          color: status === "idle" ? "#555" : agent.color, letterSpacing: 1, fontFamily: "monospace"
        }}>{agent.label}</span>
        <span style={{ fontSize: 15 }}>{agent.icon}</span>
        <span style={{ fontSize: 11, color: status === "idle" ? "#3a3a5a" : "#ccc", letterSpacing: 2, fontFamily: "monospace" }}>
          {agent.title.toUpperCase()}
        </span>
        {status === "active" && (
          <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: agent.color, animation: "pulse 1s infinite" }} />
        )}
        {status === "done" && <span style={{ marginLeft: "auto", color: agent.color, fontSize: 13 }}>✓</span>}
      </div>
      {children}
    </div>
  );
}

function Spinner({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#555", fontSize: 11, fontFamily: "monospace" }}>
      <div style={{ width: 12, height: 12, border: `2px solid ${color}30`, borderTop: `2px solid ${color}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Analysing…
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
      background: copied ? "#0a200a" : "#0d0d1a",
      border: `1px solid ${copied ? "#6bff6b44" : "#2a2a4a"}`,
      borderRadius: 6, padding: "4px 10px",
      color: copied ? "#6bff6b" : "#444",
      fontSize: 10, fontFamily: "monospace", cursor: "pointer",
      letterSpacing: 1, transition: "all 0.2s", whiteSpace: "nowrap",
    }}>
      {copied ? "✓ Copied" : `⎘ ${label}`}
    </button>
  );
}

function TimestampCard({ ts, rank }) {
  const s = ts.score;
  const sc = s >= 8 ? "#ffd93d" : s >= 6 ? "#ff6b6b" : "#00e5ff";
  const copyContent = `[${ts.timestamp}] ${ts.title}\n${ts.description || ""}${ts.why ? `\nScore ${ts.score}/10 — ${ts.why}` : ""}`;
  return (
    <div style={{
      background: "#0a0a14", border: `1px solid ${sc}28`,
      borderRadius: 10, padding: "13px 14px", marginBottom: 9,
      display: "flex", gap: 11, alignItems: "flex-start",
      animation: "fadeIn 0.3s ease",
    }}>
      {rank !== undefined && (
        <div style={{
          minWidth: 24, height: 24, borderRadius: "50%",
          background: `${sc}15`, border: `1.5px solid ${sc}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "monospace", fontSize: 10, color: sc, fontWeight: "bold", flexShrink: 0,
        }}>{rank + 1}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5, marginBottom: 5 }}>
          <span style={{
            background: "#151525", border: "1px solid #2a2a4a",
            borderRadius: 4, padding: "2px 6px", fontFamily: "monospace", fontSize: 10, color: "#777"
          }}>{ts.timestamp}</span>
          {ts.score !== undefined && (
            <span style={{
              background: `${sc}15`, border: `1px solid ${sc}44`,
              borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: "monospace", color: sc, fontWeight: "bold"
            }}>Score {ts.score}/10</span>
          )}
          {ts.hook_type && (
            <span style={{
              background: "#100a18", border: "1px solid #9b6b9b30",
              borderRadius: 4, padding: "2px 6px", fontSize: 9, color: "#9b6b9b"
            }}>{ts.hook_type}</span>
          )}
          {ts.intent_match && (
            <span style={{
              background: "#0a150a", border: "1px solid #6bff6b25",
              borderRadius: 4, padding: "2px 6px", fontSize: 9, color: "#6bff6b77"
            }}>✓ intent</span>
          )}
          <span style={{ marginLeft: "auto" }}>
            <CopyButton text={copyContent} />
          </span>
        </div>
        <div style={{ color: "#ddd", fontSize: 13, lineHeight: 1.5, marginBottom: 3, fontWeight: "500" }}>
          {ts.title}
        </div>
        {ts.description && (
          <div style={{ color: "#5a5a7a", fontSize: 11, lineHeight: 1.5, marginBottom: ts.why ? 3 : 0 }}>{ts.description}</div>
        )}
        {ts.why && <div style={{ color: "#3a3a5a", fontSize: 11, fontStyle: "italic" }}>↳ {ts.why}</div>}
      </div>
    </div>
  );
}

// ─── constants ────────────────────────────────────────────────────────────────

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

// ─── main app ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("intent");
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
      minHeight: "100vh", background: "#07070f",
      fontFamily: "'Space Mono', 'Courier New', monospace",
      padding: "32px 20px",
      backgroundImage: "radial-gradient(ellipse at 15% 5%, #1a0d2015 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, #0d1a2015 0%, transparent 50%)",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(1.5);} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes slideDown { from{opacity:0;max-height:0;}to{opacity:1;max-height:400px;} }
        textarea { font-family: 'Space Mono', monospace !important; }
        textarea::placeholder { color: #1a1a2a !important; font-style: italic; }
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#0d0d1a;} ::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:2px;}
        button:focus { outline: none; }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff6b6b44", marginBottom: 8 }}>MULTI · AGENT · PIPELINE</div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, margin: 0,
            background: "linear-gradient(135deg, #ff6b6b, #ffd93d)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -1,
          }}>YouTube → Reels Engine</h1>
          <p style={{ color: "#1e1e3a", fontSize: 11, marginTop: 8, letterSpacing: 1 }}>
            set intent · paste transcript · shortlist · prioritize
          </p>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1.5px solid #1a1a2e" }}>
          <Tab label="🎯  INTENT" active={tab === "intent"} onClick={() => setTab("intent")} warn={!intentReady} />
          <Tab label="📄  TRANSCRIPT" active={tab === "transcript"} onClick={() => setTab("transcript")} warn={!transcriptReady} />
        </div>

        <div style={{
          background: "#0d0d1a", border: "1.5px solid #1a1a2e", borderTop: "none",
          borderRadius: "0 10px 10px 10px", padding: "22px", marginBottom: 20,
        }}>

          {/* ── Intent Tab ── */}
          {tab === "intent" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ color: "#ff6b6b66", fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>CAMPAIGN INTENT</div>
              <div style={{ color: "#2a2a4a", fontSize: 11, lineHeight: 1.8, marginBottom: 14 }}>
                Tell the agents who you are, what this video is about, and what clips you want.
                This filters what gets picked and weights how it's scored.
              </div>
              <textarea
                value={intent}
                onChange={e => setIntent(e.target.value)}
                placeholder={INTENT_PLACEHOLDER}
                rows={13}
                style={{
                  width: "100%", background: "#080810",
                  border: `1.5px solid ${intentReady ? "#ff6b6b33" : "#111120"}`,
                  borderRadius: 10, padding: "14px 16px",
                  color: "#bbb", fontSize: 12, resize: "vertical", outline: "none",
                  boxSizing: "border-box", lineHeight: 1.9, transition: "border-color 0.3s",
                }}
                onFocus={e => e.target.style.borderColor = "#ff6b6b55"}
                onBlur={e => e.target.style.borderColor = intentReady ? "#ff6b6b33" : "#111120"}
              />
              {intentReady && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#6bff6b66", fontSize: 10 }}>✓ Intent set</span>
                  <button onClick={() => setTab("transcript")} style={{
                    marginLeft: "auto", background: "#0a140a", border: "1px solid #6bff6b30",
                    borderRadius: 6, padding: "5px 12px", color: "#6bff6b77",
                    fontSize: 10, fontFamily: "monospace", cursor: "pointer", letterSpacing: 1,
                  }}>NEXT: TRANSCRIPT →</button>
                </div>
              )}
            </div>
          )}

          {/* ── Transcript Tab ── */}
          {tab === "transcript" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ color: "#ff6b6b66", fontSize: 10, letterSpacing: 3 }}>YOUTUBE TRANSCRIPT</div>
                <button onClick={() => setShowHow(v => !v)} style={{
                  background: "none", border: "1px solid #1e1e2e", borderRadius: 6,
                  padding: "4px 10px", color: "#333", fontSize: 10,
                  fontFamily: "monospace", cursor: "pointer", letterSpacing: 1,
                }}>{showHow ? "▼ HOW TO" : "▶ HOW TO GET IT"}</button>
              </div>
              {showHow && (
                <div style={{
                  background: "#080810", border: "1px solid #00e5ff18", borderRadius: 8,
                  padding: "11px 15px", marginBottom: 12, animation: "slideDown 0.2s ease",
                }}>
                  {HOW_TO.map((l, i) => <div key={i} style={{ color: "#00e5ff44", fontSize: 11, lineHeight: 2 }}>{l}</div>)}
                </div>
              )}
              <div style={{ position: "relative" }}>
                <textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder={"0:00\nHey everyone, welcome back...\n0:14\nToday we're covering PD catheters..."}
                  rows={13}
                  style={{
                    width: "100%", background: "#080810",
                    border: `1.5px solid ${transcriptReady ? "#ff6b6b33" : "#111120"}`,
                    borderRadius: 10, padding: "14px 16px",
                    color: "#bbb", fontSize: 12, resize: "vertical", outline: "none",
                    boxSizing: "border-box", lineHeight: 1.8, transition: "border-color 0.3s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#ff6b6b55"}
                  onBlur={e => e.target.style.borderColor = transcriptReady ? "#ff6b6b33" : "#111120"}
                />
                {transcript.length > 0 && (
                  <div style={{ position: "absolute", bottom: 10, right: 12, color: "#1e1e2e", fontSize: 10 }}>
                    {transcript.split("\n").filter(Boolean).length} lines
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Intent pill ── */}
        {intentReady && (
          <div style={{
            background: "#0a0f0a", border: "1px solid #6bff6b18", borderRadius: 8,
            padding: "8px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10,
            animation: "fadeIn 0.3s ease",
          }}>
            <span style={{ color: "#6bff6b44", fontSize: 10 }}>🎯</span>
            <div style={{ flex: 1, color: "#2a4a2a", fontSize: 11, fontStyle: "italic", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {intent.trim().slice(0, 120)}{intent.trim().length > 120 ? "…" : ""}
            </div>
            <button onClick={() => setTab("intent")} style={{
              background: "none", border: "none", color: "#2a3a2a", fontSize: 10, cursor: "pointer", fontFamily: "monospace"
            }}>edit</button>
          </div>
        )}

        {/* ── Reels Count + Run ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 26 }}>

          {/* Slider */}
          <div style={{
            background: "#0d0d1a", border: "1.5px solid #1a1a2e", borderRadius: 12,
            padding: "14px 22px", width: "100%", maxWidth: 480, boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: "#666", fontSize: 10, letterSpacing: 2 }}>REELS TO GENERATE</span>
              <span style={{
                background: "#ff6b6b18", border: "1px solid #ff6b6b44",
                borderRadius: 6, padding: "3px 10px",
                color: "#ff6b6b", fontSize: 13, fontFamily: "monospace", fontWeight: "bold"
              }}>{reelsCount}</span>
            </div>
            <input
              type="range" min={5} max={20} step={1}
              value={reelsCount}
              onChange={e => setReelsCount(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#ff6b6b", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ color: "#2a2a3a", fontSize: 9 }}>5 min</span>
              <span style={{ color: "#2a2a3a", fontSize: 9 }}>20 max</span>
            </div>
          </div>

          {!intentReady && (
            <div style={{ color: "#2a1a2a", fontSize: 10, letterSpacing: 1 }}>
              💡 Adding intent gives context-aware results (optional but recommended)
            </div>
          )}
          <button
            onClick={runPipeline}
            disabled={!canRun}
            style={{
              background: canRun ? "linear-gradient(135deg, #ff6b6b15, #ffd93d15)" : "#080810",
              border: `1.5px solid ${canRun ? "#ff6b6b66" : "#151525"}`,
              borderRadius: 12, padding: "13px 52px",
              color: canRun ? "#ff6b6b" : "#1a1a2a",
              fontFamily: "monospace", fontSize: 12, cursor: canRun ? "pointer" : "not-allowed",
              letterSpacing: 3, fontWeight: "bold", transition: "all 0.2s",
              boxShadow: canRun ? "0 0 24px #ff6b6b15" : "none",
            }}
          >
            {running ? "RUNNING AGENTS…" : `▶  FIND ${reelsCount} REELS`}
          </button>
        </div>

        {/* ── Agent Status ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 30, alignItems: "stretch" }}>
          {AGENTS.map((agent, i) => (
            <div key={agent.id} style={{ display: "flex", alignItems: "center", flex: 1, gap: 12, minWidth: 0 }}>
              <AgentCard agent={agent} status={agentStatus[agent.id]}>
                {agentStatus[agent.id] === "active" && <Spinner color={agent.color} />}
                {agentStatus[agent.id] === "idle" && (
                  <div style={{ color: "#1e1e2e", fontSize: 10 }}>
                    {agent.id === "shortlist"
                      ? intentReady ? "Intent-aware moment selection" : "Finds best reel moments"
                      : intentReady ? "Intent-weighted virality scoring" : "Scores & ranks by virality"
                    }
                  </div>
                )}
                {agent.id === "shortlist" && agentStatus.shortlist === "done" && (
                  <div style={{ color: "#ff6b6b", fontSize: 10 }}>✓ {shortlisted?.length || 0} moments selected</div>
                )}
                {agent.id === "prioritize" && agentStatus.prioritize === "done" && (
                  <div style={{ color: "#ffd93d", fontSize: 10 }}>✓ Ranked · top @ {prioritized?.[0]?.timestamp}</div>
                )}
              </AgentCard>
              {i < AGENTS.length - 1 && (
                <div style={{ color: agentStatus.shortlist === "done" ? AGENTS[0].color : "#111120", fontSize: 16, flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: "#130808", border: "1px solid #ff6b6b22", borderRadius: 10,
            padding: "12px 16px", color: "#ff6b6b", fontSize: 12, marginBottom: 20, animation: "fadeIn 0.3s ease",
          }}>⚠ {error}</div>
        )}

        {/* ── Agent 1 Output — always visible once done ── */}
        {shortlisted && (
          <div style={{ marginBottom: 28, animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ color: "#ff6b6b", fontSize: 10, letterSpacing: 3 }}>✂️  AGENT 1 — SHORTLIST</span>
              <div style={{ flex: 1, height: 1, background: "#ff6b6b18" }} />
              <span style={{ color: "#ff6b6b44", fontSize: 10 }}>{shortlisted.length} moments</span>
              <button
                onClick={() => setShowAgent1(v => !v)}
                style={{
                  background: "none", border: "1px solid #2a2a3a", borderRadius: 5,
                  padding: "3px 9px", color: "#444", fontSize: 10,
                  fontFamily: "monospace", cursor: "pointer", letterSpacing: 1,
                }}
              >{showAgent1 ? "▼ HIDE" : "▶ SHOW"}</button>
            </div>
            {showAgent1 && shortlisted.map((ts, i) => <TimestampCard key={i} ts={ts} />)}
            {!showAgent1 && (
              <div style={{
                background: "#0a0a12", border: "1px solid #ff6b6b18", borderRadius: 8,
                padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: 8,
              }}>
                {shortlisted.map((ts, i) => (
                  <span key={i} style={{
                    background: "#1a0a0a", border: "1px solid #ff6b6b25",
                    borderRadius: 5, padding: "3px 8px", fontSize: 10,
                    fontFamily: "monospace", color: "#ff6b6b77",
                  }}>{ts.timestamp}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Agent 2 Output — final ranked results ── */}
        {prioritized && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ color: "#ffd93d", fontSize: 10, letterSpacing: 3 }}>🏆  AGENT 2 — RANKED OUTPUT</span>
              <div style={{ flex: 1, height: 1, background: "#ffd93d18" }} />
              <CopyButton text={buildCopyAll()} label="Copy All" />
            </div>

            {/* Podium */}
            <div style={{
              display: "flex", gap: 10, marginBottom: 18,
              background: "#09090f", border: "1px solid #ffd93d15", borderRadius: 12, padding: "14px 16px",
            }}>
              {prioritized.slice(0, 3).map((ts, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                const sc = ts.score >= 8 ? "#ffd93d" : ts.score >= 6 ? "#ff6b6b" : "#00e5ff";
                return (
                  <div key={i} style={{ flex: 1, borderRight: i < 2 ? "1px solid #111120" : "none", paddingRight: i < 2 ? 10 : 0 }}>
                    <div style={{ fontSize: 14, marginBottom: 3 }}>{medals[i]}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: sc, fontWeight: "bold", marginBottom: 2 }}>{ts.timestamp}</div>
                    <div style={{ color: "#555", fontSize: 10, lineHeight: 1.4, marginBottom: 2 }}>{ts.title}</div>
                    <div style={{ color: sc, fontSize: 10 }}>Score {ts.score}/10</div>
                  </div>
                );
              })}
            </div>

            {prioritized.map((ts, i) => <TimestampCard key={i} ts={ts} rank={i} />)}

            <div style={{ textAlign: "center", marginTop: 18, color: "#151525", fontSize: 10, letterSpacing: 1 }}>
              {prioritized.length} clips · {intentReady ? "intent-weighted scoring" : "general virality scoring"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}