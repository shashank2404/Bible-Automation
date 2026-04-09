import { useState, useRef, useEffect, useCallback } from "react";

// ── Biblical background scenes ───────────────────────────────────────────────
const BIBLICAL_BACKGROUNDS = [
  {
    id: "dawn",
    label: "Genesis Dawn",
    verse: "Genesis 1:3",
    quote: "Let there be light",
    gradient: "radial-gradient(ellipse at 20% 50%, #1a0a00 0%, #3d1a00 30%, #7a3300 55%, #c46200 75%, #f5a623 100%)",
    overlay: "linear-gradient(180deg, rgba(10,5,0,0.7) 0%, rgba(50,20,0,0.3) 50%, rgba(10,5,0,0.8) 100%)",
    accent: "#f5a623",
    particles: "stars",
  },
  {
    id: "sea",
    label: "Red Sea",
    verse: "Exodus 14:21",
    quote: "The waters were divided",
    gradient: "radial-gradient(ellipse at 50% 80%, #001a2e 0%, #003358 30%, #005b8e 55%, #0077b6 75%, #00b4d8 100%)",
    overlay: "linear-gradient(180deg, rgba(0,10,30,0.8) 0%, rgba(0,30,60,0.2) 50%, rgba(0,10,30,0.9) 100%)",
    accent: "#00b4d8",
    particles: "waves",
  },
  {
    id: "mount",
    label: "Mount Sinai",
    verse: "Exodus 19:18",
    quote: "The whole mountain trembled",
    gradient: "radial-gradient(ellipse at 50% 30%, #0d0d0d 0%, #1a1a1a 30%, #2d1b00 55%, #4a2c00 75%, #7a4800 100%)",
    overlay: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(20,10,0,0.2) 50%, rgba(0,0,0,0.85) 100%)",
    accent: "#e8a000",
    particles: "lightning",
  },
  {
    id: "psalms",
    label: "Shepherd's Valley",
    verse: "Psalm 23:2",
    quote: "He leads me beside still waters",
    gradient: "radial-gradient(ellipse at 30% 60%, #0a1a0a 0%, #0f2b0f 30%, #1a4a1a 55%, #2d7a2d 75%, #3a9a3a 100%)",
    overlay: "linear-gradient(180deg, rgba(0,10,0,0.75) 0%, rgba(5,20,5,0.2) 50%, rgba(0,10,0,0.85) 100%)",
    accent: "#4caf50",
    particles: "fireflies",
  },
  {
    id: "bethlehem",
    label: "Star of Bethlehem",
    verse: "Matthew 2:2",
    quote: "We saw His star in the East",
    gradient: "radial-gradient(ellipse at 70% 20%, #0a0a1a 0%, #0f0f2e 25%, #0d0d3d 50%, #111155 75%, #0a0a22 100%)",
    overlay: "linear-gradient(180deg, rgba(5,5,20,0.5) 0%, rgba(10,10,30,0.1) 50%, rgba(5,5,20,0.85) 100%)",
    accent: "#d4af37",
    particles: "stars",
  },
  {
    id: "resurrection",
    label: "Easter Morning",
    verse: "John 20:1",
    quote: "Early on the first day of the week",
    gradient: "radial-gradient(ellipse at 50% 40%, #1a0a00 0%, #4a2000 25%, #8b4500 50%, #c97c00 72%, #f0b800 88%, #fff8e1 100%)",
    overlay: "linear-gradient(180deg, rgba(10,5,0,0.65) 0%, rgba(60,25,0,0.1) 60%, rgba(10,5,0,0.75) 100%)",
    accent: "#f0b800",
    particles: "petals",
  },
];

// ── Particle canvas renderer ─────────────────────────────────────────────────
function ParticleCanvas({ type, accent }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const W = canvas.width;
    const H = canvas.height;
    const hex2rgb = (h) => {
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b = parseInt(h.slice(5, 7), 16);
      return { r, g, b };
    };
    const rgb = hex2rgb(accent);

    let particles = [];

    if (type === "stars") {
      particles = Array.from({ length: 120 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.005 + 0.002,
        phase: Math.random() * Math.PI * 2,
      }));
      const draw = (t) => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p) => {
          const a = 0.3 + 0.7 * ((Math.sin(t * p.speed + p.phase) + 1) / 2);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
          ctx.fill();
        });
        rafRef.current = requestAnimationFrame(draw);
      };
      rafRef.current = requestAnimationFrame(draw);
    } else if (type === "waves") {
      particles = Array.from({ length: 5 }, (_, i) => ({
        offset: (i / 5) * Math.PI * 2,
        amp: 8 + i * 4,
        freq: 0.008 + i * 0.002,
        speed: 0.0008 + i * 0.0003,
        y: H * (0.55 + i * 0.07),
      }));
      const draw = (t) => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p, i) => {
          ctx.beginPath();
          for (let x = 0; x <= W; x += 2) {
            const y = p.y + Math.sin(x * p.freq + t * p.speed + p.offset) * p.amp;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.15 - i * 0.02})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
        rafRef.current = requestAnimationFrame(draw);
      };
      rafRef.current = requestAnimationFrame(draw);
    } else if (type === "lightning") {
      let nextFlash = 0;
      const draw = (t) => {
        ctx.clearRect(0, 0, W, H);
        if (t > nextFlash) {
          nextFlash = t + 2000 + Math.random() * 4000;
          const x = W * 0.3 + Math.random() * W * 0.4;
          const drawBolt = (x1, y1, x2, y2, depth) => {
            if (depth === 0 || Math.abs(x2 - x1) < 2) {
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.8)`;
              ctx.lineWidth = Math.max(1, depth * 0.5);
              ctx.stroke();
              return;
            }
            const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 40;
            const my = (y1 + y2) / 2;
            drawBolt(x1, y1, mx, my, depth - 1);
            drawBolt(mx, my, x2, y2, depth - 1);
            if (Math.random() < 0.3)
              drawBolt(mx, my, mx + (Math.random() - 0.5) * 80, my + 60, depth - 2);
          };
          drawBolt(x, 0, x + (Math.random() - 0.5) * 60, H * 0.6, 5);
          setTimeout(() => ctx.clearRect(0, 0, W, H), 150);
        }
        rafRef.current = requestAnimationFrame(draw);
      };
      rafRef.current = requestAnimationFrame(draw);
    } else if (type === "fireflies") {
      particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.008 + 0.004,
        r: Math.random() * 2 + 1,
      }));
      const draw = (t) => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p) => {
          p.x = (p.x + p.vx + W) % W;
          p.y = (p.y + p.vy + H) % H;
          const a = 0.2 + 0.8 * ((Math.sin(t * p.speed + p.phase) + 1) / 2);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`);
          grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
        rafRef.current = requestAnimationFrame(draw);
      };
      rafRef.current = requestAnimationFrame(draw);
    } else if (type === "petals") {
      particles = Array.from({ length: 30 }, () => ({
        x: Math.random() * W,
        y: -20 - Math.random() * H,
        vx: (Math.random() - 0.5) * 0.6,
        vy: Math.random() * 0.5 + 0.2,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.02,
        size: Math.random() * 6 + 3,
        alpha: Math.random() * 0.5 + 0.2,
      }));
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.rotV;
          if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${p.alpha})`;
          ctx.fill();
          ctx.restore();
        });
        rafRef.current = requestAnimationFrame(draw);
      };
      rafRef.current = requestAnimationFrame(draw);
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [type, accent]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, accent }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
        animation: "fadeSlideIn 0.3s ease forwards",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent}44, ${accent}22)`,
            border: `1.5px solid ${accent}88`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            marginRight: 8,
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          ✦
        </div>
      )}
      <div
        style={{
          maxWidth: "72%",
          padding: "10px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? `linear-gradient(135deg, ${accent}33, ${accent}1a)`
            : "rgba(255,255,255,0.07)",
          border: isUser ? `1px solid ${accent}55` : "1px solid rgba(255,255,255,0.12)",
          color: "#f0ead6",
          fontSize: 14.5,
          lineHeight: 1.6,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {msg.content}
        {(msg.allRefs?.length > 0 || msg.verse) && (
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: `1px solid ${accent}33`,
              fontSize: 11.5,
              color: accent,
              fontStyle: "italic",
            }}
          >
            {msg.allRefs && msg.allRefs.length > 1 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 2 }}>
                {msg.allRefs.map((ref, i) => (
                  <span
                    key={i}
                    style={{
                      background: `${accent}18`,
                      border: `1px solid ${accent}40`,
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: 10.5,
                    }}
                  >
                    {ref}
                  </span>
                ))}
              </div>
            ) : (
              <span>— {msg.verse}</span>
            )}
            {msg.confidence && (
              <div style={{ fontSize: 10, opacity: 0.5, marginTop: 3 }}>
                Confidence: {msg.confidence}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Background Picker ─────────────────────────────────────────────────────────
function BackgroundPicker({ current, onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "8px 16px",
        overflowX: "auto",
        scrollbarWidth: "none",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {BIBLICAL_BACKGROUNDS.map((bg) => (
        <button
          key={bg.id}
          onClick={() => onSelect(bg)}
          style={{
            flexShrink: 0,
            padding: "5px 14px",
            borderRadius: 20,
            border: current.id === bg.id ? `1.5px solid ${bg.accent}` : "1px solid rgba(255,255,255,0.15)",
            background: current.id === bg.id ? `${bg.accent}22` : "rgba(255,255,255,0.04)",
            color: current.id === bg.id ? bg.accent : "rgba(240,234,214,0.6)",
            fontSize: 12,
            cursor: "pointer",
            transition: "all 0.25s ease",
            whiteSpace: "nowrap",
          }}
        >
          {bg.label}
        </button>
      ))}
    </div>
  );
}

// ── Main ChatPage ─────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [bg, setBg] = useState(BIBLICAL_BACKGROUNDS[0]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Peace be with you ✦ I'm your Biblical companion. Ask me anything about scripture, faith, or life's journey.",
      verse: "John 14:27",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bgTransitioning, setBgTransitioning] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const handleBgChange = (newBg) => {
    setBgTransitioning(true);
    setTimeout(() => {
      setBg(newBg);
      setBgTransitioning(false);
    }, 400);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // ── Calls your Express backend GET /ask?question=... ──────────────────
      const res = await fetch(
        `/ask?question=${encodeURIComponent(text)}`
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Server error");
      }

      const data = await res.json();
      // data shape: { question, answer, references: [...], confidence }

      const rawAnswer = data.answer || "I am reflecting on your words…";
      const refs = data.references || [];

      // Use the first reference as the verse footnote if available
      const verse = refs.length > 0 ? refs[0] : null;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: rawAnswer,
          verse,
          confidence: data.confidence,
          allRefs: refs,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: `Something went wrong: ${err.message}. Please try again.`,
          verse: "Romans 8:28",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Lato:ital,wght@0,300;0,400;1,300&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0800; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; } 50% { opacity: 1; }
        }
        @keyframes bgFade {
          from { opacity: 0; } to { opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        textarea:focus { outline: none; }
      `}</style>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100dvh",
          overflow: "hidden",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        {/* ── Dynamic Background ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: bg.gradient,
            opacity: bgTransitioning ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: bg.overlay,
            opacity: bgTransitioning ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        />
        <ParticleCanvas key={bg.id} type={bg.particles} accent={bg.accent} />

        {/* ── Glass panel ── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${bg.accent}55, ${bg.accent}22)`,
                  border: `1.5px solid ${bg.accent}88`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ✦
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 15,
                    color: bg.accent,
                    letterSpacing: "0.08em",
                    fontWeight: 500,
                  }}
                >
                  Biblical Companion
                </div>
                <div style={{ fontSize: 11, color: "rgba(240,234,214,0.45)", marginTop: 1, fontStyle: "italic" }}>
                  {bg.verse} · {bg.quote}
                </div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#4caf50",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
            </div>

            {/* Background Picker */}
            <BackgroundPicker current={bg} onSelect={handleBgChange} />
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 16px 8px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} accent={bg.accent} />
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: `${bg.accent}22`,
                    border: `1.5px solid ${bg.accent}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  ✦
                </div>
                <div style={{ display: "flex", gap: 5, padding: "10px 14px", background: "rgba(255,255,255,0.06)", borderRadius: "18px 18px 18px 4px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: bg.accent,
                        animation: `pulse 1.2s ease-in-out ${d}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 16px 20px",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              background: "rgba(0,0,0,0.3)",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${bg.accent}33`,
                borderRadius: 24,
                padding: "8px 8px 8px 18px",
                transition: "border-color 0.25s ease",
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about scripture, faith, or life…"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#f0ead6",
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  resize: "none",
                  maxHeight: 120,
                  overflowY: "auto",
                  fontFamily: "'Lato', sans-serif",
                  caretColor: bg.accent,
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "none",
                  background: input.trim() && !loading
                    ? `linear-gradient(135deg, ${bg.accent}, ${bg.accent}bb)`
                    : "rgba(255,255,255,0.08)",
                  color: input.trim() && !loading ? "#1a0a00" : "rgba(255,255,255,0.25)",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                  fontSize: 16,
                }}
              >
                ➤
              </button>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 8,
                fontSize: 11,
                color: "rgba(240,234,214,0.25)",
                fontStyle: "italic",
              }}
            >
              {bg.label} · Press Enter to send
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
