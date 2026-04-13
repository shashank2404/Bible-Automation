import { useState } from "react";       // ← moved to top, was at bottom
import { useNavigate } from "react-router-dom";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

  .verse-card {
    background: linear-gradient(135deg, #1A2A3A 0%, #0F1E2E 100%);
    border-radius: 16px;
    padding: 20px 18px 16px;
    border: 1px solid rgba(100,160,220,0.15);
    position: relative;
    overflow: hidden;
  }
  .verse-card::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(100,160,220,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .vc-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .vc-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .vc-check {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: #E8A838;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: #fff;
  }
  .vc-title {
    font-family: 'Cinzel', serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 1.5px;
    color: rgba(200,230,255,0.8);
  }
  .vc-time {
    font-size: 12px;
    color: rgba(200,230,255,0.4);
    margin-left: 6px;
  }
  .vc-done {
    font-family: 'Cinzel', serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 1.5px;
    color: rgba(200,230,255,0.5);
  }
  .vc-ref {
    font-family: 'Cinzel', serif;
    font-size: 22px; font-weight: 700;
    color: #F5EDD8;
    margin-bottom: 10px;
  }
  .vc-tags {
    display: flex; gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .vc-tag {
    border: 1px solid rgba(200,230,255,0.2);
    border-radius: 30px;
    padding: 4px 12px;
    font-size: 12px;
    color: rgba(200,230,255,0.6);
    font-family: 'Cinzel', serif;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent;
  }
  .vc-tag:hover, .vc-tag.active {
    border-color: #E8A838;
    color: #E8A838;
    background: rgba(232,168,56,0.07);
  }
  .vc-actions {
    display: flex; gap: 10px;
  }
  .vc-btn {
    flex: 1;
    padding: 11px 0;
    border-radius: 10px;
    font-family: 'Cinzel', serif;
    font-size: 13px; font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: all 0.15s;
    border: none;
  }
  .vc-btn-listen {
    background: rgba(255,255,255,0.07);
    color: rgba(200,230,255,0.7);
  }
  .vc-btn-listen:hover { background: rgba(255,255,255,0.12); }
  .vc-btn-read {
    background: linear-gradient(135deg, #E8A838, #B8822A);
    color: #fff;
    box-shadow: 0 4px 16px rgba(232,168,56,0.25);
  }
  .vc-btn-read:hover {
    box-shadow: 0 6px 20px rgba(232,168,56,0.4);
    transform: translateY(-1px);
  }
`;

const TOPICS = [
  { slug: "heartbreak",  label: "Heart Break" },
  { slug: "temptation",  label: "Temptation"  },
  { slug: "brotherhood", label: "Brotherhood" },
  { slug: "faith",       label: "Faith"       },
  { slug: "love",        label: "Love"        },
];

const DAILY_REF = "Ezekiel 9:10";

export default function VerseCard() {
  const navigate     = useNavigate();
  const [activeTopic, setActiveTopic] = useState(TOPICS[0].slug);

  const goRead   = () => navigate(`/verse-reading?topic=${activeTopic}`);
  const goListen = () => navigate(`/verse-reading?topic=${activeTopic}&mode=listen`);

  return (
    <>
      <style>{style}</style>
      <div className="verse-card">
        <div className="vc-top">
          <div className="vc-label">
            <div className="vc-check">✓</div>
            <span className="vc-title">YOUR VERSE</span>
            <span className="vc-time">· 5 min</span>
          </div>
          <span className="vc-done">DONE</span>
        </div>

        <div className="vc-ref">{DAILY_REF}</div>

        <div className="vc-tags">
          {TOPICS.map(t => (
            <button
              key={t.slug}
              className={`vc-tag ${activeTopic === t.slug ? "active" : ""}`}
              onClick={() => setActiveTopic(t.slug)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="vc-actions">
          <button className="vc-btn vc-btn-listen" onClick={goListen}>🎧 Listen</button>
          <button className="vc-btn vc-btn-read"   onClick={goRead}>📖 Read</button>
        </div>
      </div>
    </>
  );
}