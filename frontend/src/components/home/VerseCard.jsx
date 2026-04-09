// src/components/home/VerseCard.jsx
import { useState, useEffect } from "react";

const style = `
  .verse-card {
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    cursor: pointer;
  }

  .verse-card-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      #1A2A3A 0%,
      #2A4A5A 40%,
      #1A3A4A 100%
    );
    z-index: 0;
  }

  .verse-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(10,10,8,0.92) 0%,
      rgba(10,10,8,0.4) 55%,
      transparent 100%
    );
    z-index: 1;
  }

  .verse-card-top {
    position: absolute;
    top: 14px;
    left: 14px;
    right: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 2;
  }

  .verse-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(8px);
    border-radius: 20px;
    padding: 6px 12px;
  }

  .check-icon {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #E8A838;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    color: #fff;
    flex-shrink: 0;
  }

  .verse-badge-text {
    font-family: 'Cinzel', serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #fff;
  }

  .verse-badge-dot { color: rgba(255,255,255,0.5); }

  .verse-done-btn {
    font-family: 'Cinzel', serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #fff;
    background: none;
    border: none;
    cursor: pointer;
  }

  .verse-card-content {
    position: relative;
    z-index: 2;
    padding: 14px 18px;
  }

  .verse-ref {
    font-family: 'Cinzel', serif;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 10px;
  }

  .verse-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .verse-tag {
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: 20px;
    padding: 4px 12px;
    font-family: 'Cinzel', serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.85);
  }

  .verse-actions {
    display: flex;
    gap: 10px;
  }

  .verse-btn {
    flex: 1;
    padding: 12px;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    color: #fff;
    font-family: 'Cinzel', serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.2s;
  }

  .verse-btn:hover { background: rgba(255,255,255,0.18); }
`;

const FALLBACK = { reference: "1 John 4:8", text: "God is love." };

export default function VerseCard() {
  const [verse, setVerse] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/random-verse")
      .then(r => r.json())
      .then(d => setVerse(d))
      .catch(() => setVerse(FALLBACK));
  }, []);

  const ref = verse?.reference || "1 John 4:8";

  return (
    <>
      <style>{style}</style>
      <div className="verse-card">
        <div className="verse-card-bg" />
        <div className="verse-card-overlay" />

        <div className="verse-card-top">
          <div className="verse-badge">
            <div className="check-icon">✓</div>
            <span className="verse-badge-text">YOUR VERSE</span>
            <span className="verse-badge-dot">•</span>
            <span className="verse-badge-text" style={{ fontWeight: 400 }}>1 MIN</span>
          </div>
          <button className="verse-done-btn" onClick={() => setDone(d => !d)}>
            {done ? "✓ DONE" : "DONE"}
          </button>
        </div>

        <div className="verse-card-content">
          <div className="verse-ref">{ref}</div>
          <div className="verse-tags">
            <span className="verse-tag">GOD'S NATURE</span>
            <span className="verse-tag">LOVE</span>
            <span className="verse-tag">FAITH</span>
          </div>
          <div className="verse-actions">
            <button className="verse-btn">🎧 Listen</button>
            <button className="verse-btn">📖 Read</button>
          </div>
        </div>
      </div>
    </>
  );
}
