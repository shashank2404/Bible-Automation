import { useState, useRef, useEffect, useCallback } from "react";

const HIGHLIGHT_COLORS = [
  { id: "gold",   label: "Gold",   bg: "rgba(245,166,35,0.35)",  border: "#f5a623" },
  { id: "rose",   label: "Rose",   bg: "rgba(251,113,133,0.3)",  border: "#fb7185" },
  { id: "teal",   label: "Teal",   bg: "rgba(52,211,153,0.28)",  border: "#34d399" },
  { id: "violet", label: "Violet", bg: "rgba(192,132,252,0.3)",  border: "#c084fc" },
  { id: "sky",    label: "Sky",    bg: "rgba(96,165,250,0.28)",  border: "#60a5fa" },
];

const TEXT_STYLES = [
  { id: "normal", label: "Normal", style: {} },
  { id: "bold",   label: "Bold",   style: { fontWeight: 700 } },
  { id: "italic", label: "Italic", style: { fontStyle: "italic" } },
  { id: "serif",  label: "Serif",  style: { fontFamily: "'EB Garamond', serif", fontSize: 18 } },
];

const TOOLS        = ["pen", "eraser"];
const BRUSH_SIZES  = [2, 4, 7, 12];
const DOODLE_COLORS = ["#f5a623","#fb7185","#34d399","#c084fc","#60a5fa","#f0ead6","#ff6b6b","#fbbf24"];

function formatDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" }) +
    " · " + date.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
}

// ── API helper ───────────────────────────────────────────
const apiFetch = (path, opts = {}) =>
  fetch(`/api/bible${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    ...opts,
  }).then(r => r.json());

// ── Color ID ↔ object helpers ────────────────────────────
const hlById  = (id) => HIGHLIGHT_COLORS.find(h => h.id === id) || HIGHLIGHT_COLORS[0];
const tsById  = (id) => TEXT_STYLES.find(t => t.id === id)      || TEXT_STYLES[0];

export default function NotepadModal({
  isOpen,
  onClose,
  verseRef  = "",
  verseText = "",
  book      = "",   // ← new
  chapter   = null, // ← new
  verse     = null, // ← new
}) {
  const [tab,         setTab]         = useState("write");
  const [allNotes,    setAllNotes]    = useState([]);  // from DB
  const [draft,       setDraft]       = useState("");
  const [hlColor,     setHlColor]     = useState(HIGHLIGHT_COLORS[0]);
  const [textStyle,   setTextStyle]   = useState(TEXT_STYLES[0]);
  const [saving,      setSaving]      = useState(false);
  const [loadingNotes,setLoadingNotes]= useState(false);
  const [saveMsg,     setSaveMsg]     = useState(""); // "" | "saved" | "error"

  // Doodle
  const canvasRef   = useRef(null);
  const [tool,       setTool]       = useState("pen");
  const [brushSize,  setBrushSize]  = useState(3);
  const [doodleColor,setDoodleColor]= useState("#f5a623");
  const [isDrawing,  setIsDrawing]  = useState(false);
  const lastPos  = useRef(null);
  const ctxRef   = useRef(null);
  const createdAt = useRef(new Date());

  // ── Load all notes for user on open ─────────────────────
  useEffect(() => {
    if (!isOpen) return;
    createdAt.current = new Date();
    setDraft(verseText ? `"${verseText}"\n\n` : "");
    setSaveMsg("");
    fetchAllNotes();
  }, [isOpen]);

  const fetchAllNotes = async () => {
    setLoadingNotes(true);
    try {
      const data = await apiFetch("/notes");
      if (Array.isArray(data)) setAllNotes(data);
    } catch (_) {}
    finally { setLoadingNotes(false); }
  };

  // ── Canvas setup ─────────────────────────────────────────
  useEffect(() => {
    if (tab === "doodle" && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      ctx.lineCap  = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
    }
  }, [tab]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
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
    const ctx    = ctxRef.current;
    const pos    = getPos(e, canvas);
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : doodleColor;
    ctx.lineWidth   = tool === "eraser" ? brushSize * 3 : brushSize;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }, [isDrawing, tool, doodleColor, brushSize]);

  const endDraw   = useCallback(() => setIsDrawing(false), []);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && ctxRef.current) ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  // ── Save note to DB ──────────────────────────────────────
  const saveNote = async () => {
    if (!draft.trim()) return;
    if (!book || chapter == null || verse == null) {
      // Fallback: save as a general note tagged with verseRef string only
      // You could extend the schema with an optional freeform ref if needed
      alert("Verse context missing — please open notes from a verse.");
      return;
    }

    setSaving(true);
    setSaveMsg("");
    try {
      const result = await apiFetch("/notes", {
        method: "POST",
        body: JSON.stringify({
          book,
          chapter,
          verse,
          verseText,
          noteText:  draft,
          hlColorId: hlColor.id,   // store IDs, not objects
          textStyleId: textStyle.id,
        }),
      });

      if (result.success) {
        setSaveMsg("saved");
        setDraft("");
        createdAt.current = new Date();
        await fetchAllNotes(); // refresh list
        setTimeout(() => setSaveMsg(""), 2500);
      } else {
        setSaveMsg("error");
      }
    } catch (_) {
      setSaveMsg("error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete note from DB ──────────────────────────────────
  const deleteNote = async (note) => {
    try {
      await apiFetch(`/notes/${encodeURIComponent(note.book)}/${note.chapter}/${note.verse}`, {
        method: "DELETE",
      });
      setAllNotes(prev => prev.filter(n => n._id !== note._id));
    } catch (_) {}
  };

  if (!isOpen) return null;

  // Notes for this specific verse (shown in saved tab with verse context)
  const verseNotes = allNotes.filter(
    n => n.book === book && n.chapter === chapter && n.verse === verse
  );
  const otherNotes = allNotes.filter(
    n => !(n.book === book && n.chapter === chapter && n.verse === verse)
  );

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
          border-radius: 99px; margin: 10px auto 0; flex-shrink: 0;
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
        .np-title { font-family: 'Cinzel', serif; font-size: 13px; color: #f5a623; letter-spacing: 0.15em; }
        .np-close-btn {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid rgba(245,166,35,0.25);
          background: rgba(245,166,35,0.08);
          color: #f5a623; font-size: 14px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .np-verse-ref { font-family: 'Cinzel', serif; font-size: 10px; color: rgba(245,166,35,0.5); letter-spacing: 0.1em; }
        .np-date { font-size: 10px; color: rgba(240,234,214,0.3); font-family: 'Lato', sans-serif; margin-top: 2px; }

        .np-tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(245,166,35,0.1); flex-shrink: 0; }
        .np-tab {
          flex: 1; padding: 10px; border: none; background: none;
          font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.12em; cursor: pointer;
          color: rgba(240,234,214,0.35); border-bottom: 2px solid transparent; transition: all 0.2s;
        }
        .np-tab.active { color: #f5a623; border-bottom-color: #f5a623; background: rgba(245,166,35,0.05); }

        .np-toolbar {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-bottom: 1px solid rgba(245,166,35,0.08);
          flex-shrink: 0; flex-wrap: wrap;
        }
        .np-tool-label { font-size: 10px; color: rgba(245,166,35,0.45); font-family: 'Cinzel', serif; letter-spacing: 0.1em; margin-right: 2px; }
        .hl-swatch {
          width: 20px; height: 20px; border-radius: 5px; cursor: pointer;
          border: 1.5px solid transparent; transition: transform 0.15s, border-color 0.15s; flex-shrink: 0;
        }
        .hl-swatch:hover { transform: scale(1.15); }
        .hl-swatch.active-swatch { border-color: #f0ead6; transform: scale(1.1); }
        .style-btn {
          padding: 3px 8px; border-radius: 5px; border: 1px solid rgba(245,166,35,0.18);
          background: none; cursor: pointer; font-size: 11px; color: rgba(240,234,214,0.55);
          transition: all 0.15s; font-family: 'Lato', sans-serif;
        }
        .style-btn.active-style { background: rgba(245,166,35,0.18); border-color: rgba(245,166,35,0.45); color: #f5a623; }

        .np-write-area { flex: 1; overflow-y: auto; padding: 14px 16px; }
        .np-write-area::-webkit-scrollbar { width: 2px; }
        .np-write-area::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.15); }

        .np-verse-quote {
          font-family: 'EB Garamond', serif; font-size: 14px; font-style: italic;
          color: rgba(245,166,35,0.55); border-left: 2px solid rgba(245,166,35,0.3);
          padding: 6px 12px; margin-bottom: 12px; border-radius: 0 6px 6px 0;
          background: rgba(245,166,35,0.04); line-height: 1.6;
        }
        .np-textarea {
          width: 100%; min-height: 160px; background: transparent;
          border: none; outline: none; resize: none; color: #f0ead6;
          font-size: 16px; line-height: 1.85; caret-color: #f5a623;
          font-family: 'EB Garamond', serif; padding: 0;
        }

        .np-doodle-toolbar {
          display: flex; align-items: center; gap: 8px; padding: 8px 14px;
          border-bottom: 1px solid rgba(245,166,35,0.08); flex-shrink: 0; flex-wrap: wrap;
        }
        .doodle-tool-btn {
          padding: 5px 12px; border-radius: 7px; border: 1px solid rgba(245,166,35,0.2);
          background: none; cursor: pointer; font-size: 11px; color: rgba(240,234,214,0.5);
          font-family: 'Cinzel', serif; transition: all 0.15s;
        }
        .doodle-tool-btn.active-tool { background: rgba(245,166,35,0.18); border-color: rgba(245,166,35,0.5); color: #f5a623; }
        .brush-dot {
          border-radius: 50%; background: rgba(245,166,35,0.6); cursor: pointer;
          border: 1.5px solid transparent; flex-shrink: 0; transition: border-color 0.15s, transform 0.15s;
        }
        .brush-dot.active-brush { border-color: #f5a623; transform: scale(1.15); }
        .doodle-color-dot {
          width: 18px; height: 18px; border-radius: 50%; cursor: pointer;
          border: 1.5px solid transparent; transition: transform 0.15s, border-color 0.15s; flex-shrink: 0;
        }
        .doodle-color-dot.active-dc { border-color: #fff; transform: scale(1.2); }
        .np-canvas-wrap {
          flex: 1; position: relative; overflow: hidden;
          background: repeating-linear-gradient(transparent, transparent 27px, rgba(245,166,35,0.07) 28px);
        }
        .np-canvas { width: 100%; height: 100%; cursor: crosshair; touch-action: none; display: block; }

        /* ── Saved notes list ── */
        .saved-section-label {
          font-family: 'Cinzel', serif; font-size: 9px;
          color: rgba(245,166,35,0.4); letter-spacing: 0.18em;
          margin: 14px 0 7px; padding-bottom: 4px;
          border-bottom: 1px solid rgba(245,166,35,0.08);
        }
        .saved-note-card {
          padding: 12px 14px; border-radius: 10px; margin-bottom: 8px;
          position: relative;
        }
        .snc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
        .snc-ref { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.1em; }
        .snc-date { font-size: 9px; color: rgba(240,234,214,0.3); font-family: 'Lato', sans-serif; }
        .snc-body { font-size: 14px; line-height: 1.7; color: #f0ead6; white-space: pre-wrap; }
        .snc-delete {
          position: absolute; top: 8px; right: 8px;
          width: 22px; height: 22px; border-radius: 50%;
          border: 1px solid rgba(255,100,100,0.2);
          background: rgba(255,80,80,0.08);
          color: rgba(255,120,120,0.5); font-size: 11px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; opacity: 0;
        }
        .saved-note-card:hover .snc-delete { opacity: 1; }
        .snc-delete:hover { background: rgba(255,80,80,0.2); color: #ff6b6b; }

        .np-footer {
          display: flex; gap: 8px; padding: 12px 14px;
          border-top: 1px solid rgba(245,166,35,0.1); flex-shrink: 0;
          align-items: center;
        }
        .np-save-btn {
          flex: 1; padding: 12px; border-radius: 10px;
          border: 1px solid rgba(245,166,35,0.4);
          background: rgba(245,166,35,0.14); color: #f5a623;
          font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.1em;
          cursor: pointer; transition: background 0.15s; position: relative;
        }
        .np-save-btn:hover { background: rgba(245,166,35,0.22); }
        .np-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .np-clear-btn {
          padding: 12px 18px; border-radius: 10px;
          border: 1px solid rgba(245,166,35,0.15);
          background: none; color: rgba(240,234,214,0.35);
          font-size: 12px; cursor: pointer; transition: background 0.15s;
        }
        .np-clear-btn:hover { background: rgba(255,255,255,0.04); }
        .save-feedback {
          font-size: 11px; font-family: 'Cinzel', serif; letter-spacing: 0.08em;
          transition: opacity 0.3s;
        }
      `}</style>

      <div className="np-overlay" onClick={e => { if (e.target.classList.contains("np-overlay")) onClose(); }}>
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
            {["write", "doodle", "saved"].map(t => (
              <button key={t} className={`np-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                {t === "write"  ? "✏ Write"
                 : t === "doodle" ? "🎨 Doodle"
                 : `📋 Saved (${allNotes.length})`}
              </button>
            ))}
          </div>

          {/* ── WRITE TAB ── */}
          {tab === "write" && (
            <>
              <div className="np-toolbar">
                <span className="np-tool-label">HIGHLIGHT</span>
                {HIGHLIGHT_COLORS.map(hc => (
                  <div key={hc.id}
                    className={`hl-swatch${hlColor.id === hc.id ? " active-swatch" : ""}`}
                    style={{ background: hc.bg, borderColor: hlColor.id === hc.id ? hc.border : "transparent" }}
                    onClick={() => setHlColor(hc)} title={hc.label} />
                ))}
                <div style={{ width:1, height:18, background:"rgba(245,166,35,0.15)", margin:"0 4px" }} />
                <span className="np-tool-label">STYLE</span>
                {TEXT_STYLES.map(ts => (
                  <button key={ts.id}
                    className={`style-btn${textStyle.id === ts.id ? " active-style" : ""}`}
                    style={ts.style} onClick={() => setTextStyle(ts)}>
                    {ts.label}
                  </button>
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
                  <button key={t} className={`doodle-tool-btn${tool === t ? " active-tool" : ""}`}
                    onClick={() => setTool(t)}>
                    {t === "pen" ? "✒ Pen" : "◻ Eraser"}
                  </button>
                ))}
                <div style={{ width:1, height:18, background:"rgba(245,166,35,0.15)", margin:"0 2px" }} />
                {BRUSH_SIZES.map((s, i) => (
                  <div key={s}
                    className={`brush-dot${brushSize === s ? " active-brush" : ""}`}
                    style={{ width: 8 + i * 4, height: 8 + i * 4 }}
                    onClick={() => setBrushSize(s)} />
                ))}
                <div style={{ width:1, height:18, background:"rgba(245,166,35,0.15)", margin:"0 2px" }} />
                {DOODLE_COLORS.map(c => (
                  <div key={c}
                    className={`doodle-color-dot${doodleColor === c ? " active-dc" : ""}`}
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

          {/* ── SAVED TAB ── */}
          {tab === "saved" && (
            <div style={{ flex:1, overflowY:"auto", padding:"4px 16px 14px" }}>
              {loadingNotes ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(240,234,214,0.25)", fontSize:12, fontFamily:"'Cinzel',serif", letterSpacing:"0.1em" }}>
                  Loading…
                </div>
              ) : allNotes.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(240,234,214,0.2)", fontSize:13, fontFamily:"'Cinzel',serif", letterSpacing:"0.1em" }}>
                  No notes yet
                </div>
              ) : (
                <>
                  {/* Notes for this verse first */}
                  {verseNotes.length > 0 && (
                    <>
                      <div className="saved-section-label">THIS VERSE</div>
                      {verseNotes.map(n => <NoteCard key={n._id} note={n} onDelete={deleteNote} />)}
                    </>
                  )}
                  {/* All other notes */}
                  {otherNotes.length > 0 && (
                    <>
                      <div className="saved-section-label">ALL NOTES</div>
                      {otherNotes.map(n => <NoteCard key={n._id} note={n} onDelete={deleteNote} />)}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Footer */}
          {tab !== "saved" && (
            <div className="np-footer">
              {tab === "doodle"
                ? <button className="np-clear-btn" onClick={clearCanvas}>Clear</button>
                : <button className="np-clear-btn" onClick={() => setDraft("")}>Clear</button>
              }
              {/* Save feedback message */}
              {saveMsg === "saved" && (
                <span className="save-feedback" style={{ color:"#34d399" }}>✦ Saved!</span>
              )}
              {saveMsg === "error" && (
                <span className="save-feedback" style={{ color:"#ff6b6b" }}>Failed — try again</span>
              )}
              {tab === "write" && (
                <button className="np-save-btn" onClick={saveNote} disabled={saving || !draft.trim()}>
                  {saving ? "Saving…" : "✦ Save Note"}
                </button>
              )}
              {tab === "doodle" && (
                <button className="np-save-btn" style={{ opacity:0.4, cursor:"not-allowed" }} disabled>
                  Doodle save coming soon
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Note card sub-component ──────────────────────────────
function NoteCard({ note, onDelete }) {
  const hl = hlById(note.hlColorId);
  const ts = tsById(note.textStyleId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="saved-note-card"
      style={{ border:`1px solid ${hl.border}33`, background: hl.bg }}>
      <div className="snc-header">
        <div>
          <div className="snc-ref" style={{ color: hl.border }}>
            {note.book} {note.chapter}:{note.verse}
          </div>
          {note.verseText && (
            <div style={{ fontFamily:"'EB Garamond',serif", fontSize:11, fontStyle:"italic", color:"rgba(240,234,214,0.4)", marginTop:2, lineHeight:1.4 }}>
              "{note.verseText.slice(0, 60)}{note.verseText.length > 60 ? "…" : ""}"
            </div>
          )}
        </div>
        <div className="snc-date">{formatDate(note.updatedAt || note.createdAt)}</div>
      </div>

      <div className="snc-body"
        style={{
          fontFamily: ts.style.fontFamily || "'EB Garamond', serif",
          fontWeight: ts.style.fontWeight || 400,
          fontStyle:  ts.style.fontStyle  || "normal",
        }}>
        {note.noteText}
      </div>

      {/* Delete button with confirm */}
      {!confirmDelete ? (
        <button className="snc-delete" onClick={() => setConfirmDelete(true)} title="Delete note">✕</button>
      ) : (
        <div style={{ display:"flex", gap:5, justifyContent:"flex-end", marginTop:8 }}>
          <button onClick={() => setConfirmDelete(false)}
            style={{ padding:"3px 10px", borderRadius:6, border:"1px solid rgba(245,166,35,0.2)", background:"none", color:"rgba(240,234,214,0.4)", fontSize:11, cursor:"pointer" }}>
            Cancel
          </button>
          <button onClick={() => onDelete(note)}
            style={{ padding:"3px 10px", borderRadius:6, border:"1px solid rgba(255,80,80,0.3)", background:"rgba(255,80,80,0.12)", color:"#ff6b6b", fontSize:11, cursor:"pointer" }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}