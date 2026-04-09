import { useState, useRef, useEffect, useCallback } from "react";

const HIGHLIGHT_COLORS = [
  { id: "gold",   label: "Gold",   bg: "rgba(245,166,35,0.35)",  border: "#f5a623" },
  { id: "rose",   label: "Rose",   bg: "rgba(251,113,133,0.3)",  border: "#fb7185" },
  { id: "teal",   label: "Teal",   bg: "rgba(52,211,153,0.28)",  border: "#34d399" },
  { id: "violet", label: "Violet", bg: "rgba(192,132,252,0.3)",  border: "#c084fc" },
  { id: "sky",    label: "Sky",    bg: "rgba(96,165,250,0.28)",  border: "#60a5fa" },
];

const TEXT_STYLES = [
  { id: "normal",  label: "Normal", style: {} },
  { id: "bold",    label: "Bold",   style: { fontWeight: 700 } },
  { id: "italic",  label: "Italic", style: { fontStyle: "italic" } },
  { id: "serif",   label: "Serif",  style: { fontFamily: "'EB Garamond', serif", fontSize: 18 } },
];

const TOOLS = ["pen", "eraser"];
const BRUSH_SIZES = [2, 4, 7, 12];
const DOODLE_COLORS = ["#f5a623","#fb7185","#34d399","#c084fc","#60a5fa","#f0ead6","#ff6b6b","#fbbf24"];

function formatDate(d) {
  return d.toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" }) +
    " · " + d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
}

export default function NotepadModal({ isOpen, onClose, verseRef = "", verseText = "" }) {
  const [tab, setTab] = useState("write"); // write | doodle
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [draft, setDraft] = useState("");
  const [hlColor, setHlColor] = useState(HIGHLIGHT_COLORS[0]);
  const [textStyle, setTextStyle] = useState(TEXT_STYLES[0]);
  const [showHlPicker, setShowHlPicker] = useState(false);

  // Doodle state
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("pen");
  const [brushSize, setBrushSize] = useState(3);
  const [doodleColor, setDoodleColor] = useState("#f5a623");
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef(null);
  const ctxRef = useRef(null);

  const createdAt = useRef(new Date());

  useEffect(() => {
    if (isOpen && !activeNote) {
      createdAt.current = new Date();
      setDraft(verseText ? `"${verseText}"\n\n` : "");
    }
  }, [isOpen]);

  useEffect(() => {
    if (tab === "doodle" && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
    }
  }, [tab]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current || !ctxRef.current) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const pos = getPos(e, canvas);
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : doodleColor;
    ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }, [isDrawing, tool, doodleColor, brushSize]);

  const endDraw = useCallback(() => setIsDrawing(false), []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && ctxRef.current) ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveNote = () => {
    if (!draft.trim() && tab === "write") return;
    const note = {
      id: Date.now(),
      verseRef,
      text: draft,
      hlColor,
      textStyle,
      createdAt: createdAt.current,
      tab,
    };
    setNotes(prev => [note, ...prev]);
    setActiveNote(note);
    setDraft("");
    createdAt.current = new Date();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;1,400&family=Lato:wght@300;400;700&display=swap');

        .np-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(0,0,0,0.75);
          display: flex; align-items: flex-end; justify-content: center;
          animation: npOverlayIn 0.2s ease;
        }
        @keyframes npOverlayIn { from{opacity:0} to{opacity:1} }

        .np-sheet {
          width: 100%; max-width: 640px;
          background: #0d0a02;
          border: 1px solid rgba(245,166,35,0.25);
          border-bottom: none;
          border-radius: 20px 20px 0 0;
          display: flex; flex-direction: column;
          max-height: 90dvh;
          animation: npSheetUp 0.3s cubic-bezier(0.32,0.72,0,1);
          overflow: hidden;
        }
        @keyframes npSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }

        .np-handle {
          width: 36px; height: 4px;
          background: rgba(245,166,35,0.3);
          border-radius: 99px; margin: 10px auto 0;
          flex-shrink: 0;
        }

        .np-header {
          padding: 10px 16px 12px;
          border-bottom: 1px solid rgba(245,166,35,0.1);
          flex-shrink: 0;
        }
        .np-title-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 4px;
        }
        .np-title {
          font-family: 'Cinzel', serif; font-size: 13px;
          color: #f5a623; letter-spacing: 0.15em;
        }
        .np-close-btn {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid rgba(245,166,35,0.25);
          background: rgba(245,166,35,0.08);
          color: #f5a623; font-size: 14px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .np-verse-ref {
          font-family: 'Cinzel', serif; font-size: 10px;
          color: rgba(245,166,35,0.5); letter-spacing: 0.1em;
        }
        .np-date {
          font-size: 10px; color: rgba(240,234,214,0.3);
          font-family: 'Lato', sans-serif; margin-top: 2px;
        }

        .np-tabs {
          display: flex; gap: 0;
          border-bottom: 1px solid rgba(245,166,35,0.1);
          flex-shrink: 0;
        }
        .np-tab {
          flex: 1; padding: 10px; border: none; background: none;
          font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.12em; cursor: pointer;
          color: rgba(240,234,214,0.35);
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .np-tab.active {
          color: #f5a623;
          border-bottom-color: #f5a623;
          background: rgba(245,166,35,0.05);
        }

        /* ── Write tab toolbar ── */
        .np-toolbar {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px;
          border-bottom: 1px solid rgba(245,166,35,0.08);
          flex-shrink: 0; flex-wrap: wrap;
        }
        .np-tool-label {
          font-size: 10px; color: rgba(245,166,35,0.45);
          font-family: 'Cinzel', serif; letter-spacing: 0.1em; margin-right: 2px;
        }
        .hl-swatch {
          width: 20px; height: 20px; border-radius: 5px;
          cursor: pointer; border: 1.5px solid transparent;
          transition: transform 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .hl-swatch:hover { transform: scale(1.15); }
        .hl-swatch.active-swatch { border-color: #f0ead6; transform: scale(1.1); }

        .style-btn {
          padding: 3px 8px; border-radius: 5px;
          border: 1px solid rgba(245,166,35,0.18);
          background: none; cursor: pointer;
          font-size: 11px; color: rgba(240,234,214,0.55);
          transition: all 0.15s; font-family: 'Lato', sans-serif;
        }
        .style-btn.active-style {
          background: rgba(245,166,35,0.18);
          border-color: rgba(245,166,35,0.45);
          color: #f5a623;
        }

        /* ── Text area ── */
        .np-write-area {
          flex: 1; overflow-y: auto; padding: 14px 16px;
        }
        .np-write-area::-webkit-scrollbar { width: 2px; }
        .np-write-area::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.15); }

        .np-verse-quote {
          font-family: 'EB Garamond', serif; font-size: 14px;
          font-style: italic; color: rgba(245,166,35,0.55);
          border-left: 2px solid rgba(245,166,35,0.3);
          padding: 6px 12px; margin-bottom: 12px;
          border-radius: 0 6px 6px 0;
          background: rgba(245,166,35,0.04);
          line-height: 1.6;
        }

        .np-textarea {
          width: 100%; min-height: 160px;
          background: transparent;
          border: none; outline: none; resize: none;
          color: #f0ead6; font-size: 16px;
          line-height: 1.85; caret-color: #f5a623;
          font-family: 'EB Garamond', serif;
          padding: 0;
        }

        /* ── Doodle tab ── */
        .np-doodle-toolbar {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px;
          border-bottom: 1px solid rgba(245,166,35,0.08);
          flex-shrink: 0; flex-wrap: wrap;
        }
        .doodle-tool-btn {
          padding: 5px 12px; border-radius: 7px;
          border: 1px solid rgba(245,166,35,0.2);
          background: none; cursor: pointer;
          font-size: 11px; color: rgba(240,234,214,0.5);
          font-family: 'Cinzel', serif; transition: all 0.15s;
        }
        .doodle-tool-btn.active-tool {
          background: rgba(245,166,35,0.18);
          border-color: rgba(245,166,35,0.5);
          color: #f5a623;
        }
        .brush-dot {
          border-radius: 50%;
          background: rgba(245,166,35,0.6);
          cursor: pointer;
          border: 1.5px solid transparent;
          flex-shrink: 0;
          transition: border-color 0.15s, transform 0.15s;
        }
        .brush-dot.active-brush { border-color: #f5a623; transform: scale(1.15); }
        .doodle-color-dot {
          width: 18px; height: 18px; border-radius: 50%;
          cursor: pointer; border: 1.5px solid transparent;
          transition: transform 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .doodle-color-dot.active-dc { border-color: #fff; transform: scale(1.2); }

        .np-canvas-wrap {
          flex: 1; position: relative; overflow: hidden;
          background: repeating-linear-gradient(
            transparent, transparent 27px,
            rgba(245,166,35,0.07) 28px
          );
        }
        .np-canvas {
          width: 100%; height: 100%;
          cursor: crosshair; touch-action: none;
          display: block;
        }

        /* ── Saved notes list ── */
        .saved-notes {
          padding: 8px 14px; flex-shrink: 0;
          border-top: 1px solid rgba(245,166,35,0.08);
          max-height: 110px; overflow-y: auto;
        }
        .saved-notes::-webkit-scrollbar { width: 2px; }
        .saved-notes-label {
          font-family: 'Cinzel', serif; font-size: 9px;
          color: rgba(245,166,35,0.35); letter-spacing: 0.15em;
          margin-bottom: 6px;
        }
        .saved-note-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 10px; border-radius: 8px;
          border: 1px solid rgba(245,166,35,0.1);
          margin-bottom: 5px; cursor: pointer;
          background: rgba(245,166,35,0.03);
          transition: background 0.15s;
        }
        .saved-note-chip:hover { background: rgba(245,166,35,0.08); }
        .snc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .snc-text { font-size: 12px; color: rgba(240,234,214,0.65); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .snc-date { font-size: 9px; color: rgba(240,234,214,0.28); flex-shrink: 0; }

        /* ── Footer ── */
        .np-footer {
          display: flex; gap: 8px; padding: 12px 14px;
          border-top: 1px solid rgba(245,166,35,0.1);
          flex-shrink: 0;
        }
        .np-save-btn {
          flex: 1; padding: 12px;
          border-radius: 10px;
          border: 1px solid rgba(245,166,35,0.4);
          background: rgba(245,166,35,0.14);
          color: #f5a623; font-family: 'Cinzel', serif;
          font-size: 12px; letter-spacing: 0.1em;
          cursor: pointer; transition: background 0.15s;
        }
        .np-save-btn:hover { background: rgba(245,166,35,0.22); }
        .np-clear-btn {
          padding: 12px 18px; border-radius: 10px;
          border: 1px solid rgba(245,166,35,0.15);
          background: none; color: rgba(240,234,214,0.35);
          font-size: 12px; cursor: pointer;
          transition: background 0.15s;
        }
        .np-clear-btn:hover { background: rgba(255,255,255,0.04); }
      `}</style>

      <div className="np-overlay" onClick={e => { if(e.target.classList.contains("np-overlay")) onClose(); }}>
        <div className="np-sheet">
          <div className="np-handle" />

          {/* Header */}
          <div className="np-header">
            <div className="np-title-row">
              <span className="np-title">✦ Notes</span>
              <button className="np-close-btn" onClick={onClose}>✕</button>
            </div>
            {verseRef && <div className="np-verse-ref">{verseRef}</div>}
            <div className="np-date">{formatDate(createdAt.current)}</div>
          </div>

          {/* Tabs */}
          <div className="np-tabs">
            {["write","doodle","saved"].map(t => (
              <button key={t} className={`np-tab${tab===t?" active":""}`} onClick={() => setTab(t)}>
                {t === "write" ? "✏ Write" : t === "doodle" ? "🎨 Doodle" : `📋 Saved (${notes.length})`}
              </button>
            ))}
          </div>

          {/* ── WRITE TAB ── */}
          {tab === "write" && (
            <>
              <div className="np-toolbar">
                <span className="np-tool-label">HIGHLIGHT</span>
                {HIGHLIGHT_COLORS.map(hc => (
                  <div key={hc.id} className={`hl-swatch${hlColor.id===hc.id?" active-swatch":""}`}
                    style={{ background: hc.bg, borderColor: hlColor.id===hc.id ? hc.border : "transparent" }}
                    onClick={() => setHlColor(hc)} title={hc.label} />
                ))}
                <div style={{ width:1, height:18, background:"rgba(245,166,35,0.15)", margin:"0 4px" }} />
                <span className="np-tool-label">STYLE</span>
                {TEXT_STYLES.map(ts => (
                  <button key={ts.id} className={`style-btn${textStyle.id===ts.id?" active-style":""}`}
                    onClick={() => setTextStyle(ts)}
                    style={ts.style}>{ts.label}</button>
                ))}
              </div>

              <div className="np-write-area">
                {verseText && (
                  <div className="np-verse-quote"
                    style={{ background: hlColor.bg, borderLeftColor: hlColor.border }}>
                    "{verseText}"
                  </div>
                )}
                <textarea
                  className="np-textarea"
                  style={{ ...textStyle.style }}
                  placeholder="Write your reflection, prayer, or study note here…"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  autoFocus
                />
              </div>
            </>
          )}

          {/* ── DOODLE TAB ── */}
          {tab === "doodle" && (
            <>
              <div className="np-doodle-toolbar">
                {TOOLS.map(t => (
                  <button key={t} className={`doodle-tool-btn${tool===t?" active-tool":""}`}
                    onClick={() => setTool(t)}>
                    {t === "pen" ? "✒ Pen" : "◻ Eraser"}
                  </button>
                ))}
                <div style={{ width:1, height:18, background:"rgba(245,166,35,0.15)", margin:"0 2px" }} />
                {BRUSH_SIZES.map((s,i) => (
                  <div key={s}
                    className={`brush-dot${brushSize===s?" active-brush":""}`}
                    style={{ width: 8+i*4, height: 8+i*4 }}
                    onClick={() => setBrushSize(s)} />
                ))}
                <div style={{ width:1, height:18, background:"rgba(245,166,35,0.15)", margin:"0 2px" }} />
                {DOODLE_COLORS.map(c => (
                  <div key={c} className={`doodle-color-dot${doodleColor===c?" active-dc":""}`}
                    style={{ background: c }}
                    onClick={() => { setDoodleColor(c); setTool("pen"); }} />
                ))}
              </div>
              <div className="np-canvas-wrap" style={{ minHeight: 240 }}>
                <canvas ref={canvasRef} className="np-canvas"
                  onMouseDown={startDraw} onMouseMove={draw}
                  onMouseUp={endDraw} onMouseLeave={endDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                />
              </div>
            </>
          )}

          {/* ── SAVED NOTES ── */}
          {tab === "saved" && (
            <div style={{ flex:1, overflowY:"auto", padding:"14px 16px" }}>
              {notes.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(240,234,214,0.25)", fontSize:13, fontFamily:"'Cinzel',serif", letterSpacing:"0.1em" }}>
                  No notes yet
                </div>
              ) : notes.map(n => (
                <div key={n.id} style={{
                  padding:"12px 14px", borderRadius:10, marginBottom:8,
                  border:`1px solid ${n.hlColor.border}33`,
                  background: n.hlColor.bg,
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, color: n.hlColor.border, letterSpacing:"0.1em" }}>
                      {n.verseRef || "General note"}
                    </span>
                    <span style={{ fontSize:10, color:"rgba(240,234,214,0.35)", fontFamily:"'Lato',sans-serif" }}>
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: n.textStyle?.style?.fontFamily || "'EB Garamond', serif",
                    fontSize:15, lineHeight:1.7, color:"#f0ead6",
                    fontWeight: n.textStyle?.style?.fontWeight || 400,
                    fontStyle: n.textStyle?.style?.fontStyle || "normal",
                    whiteSpace:"pre-wrap",
                  }}>{n.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {tab !== "saved" && (
            <div className="np-footer">
              {tab === "doodle"
                ? <button className="np-clear-btn" onClick={clearCanvas}>Clear</button>
                : <button className="np-clear-btn" onClick={() => setDraft("")}>Clear</button>
              }
              <button className="np-save-btn" onClick={saveNote}>✦ Save Note</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
