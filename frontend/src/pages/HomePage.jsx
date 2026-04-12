// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WeekStrip from "../components/home/WeekStrip";
import VerseCard from "../components/home/VerseCard";
import BottomNav from "../components/home/BottomNav";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #E8A838;
    --gold-dim: #B8822A;
    --gold-deep: #7A5520;
    --bg: #151210;
    --bg2: #1E1A16;
    --bg3: #252018;
    --surface: #2A2318;
    --surface2: #322B1E;
    --text: #F5EDD8;
    --text-soft: #B8A88A;
    --text-muted: #7A6A52;
    --purple: #3D2B5E;
    --purple-light: #6B4A9E;
    --green: #2A7A4A;
    --radius: 16px;
  }

  body {
    font-family: 'Crimson Pro', serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .home-page {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    background: var(--bg);
    position: relative;
    padding-bottom: 90px;
  }

  /* ── HEADER ─────────────────────────────── */
  .home-header {
    padding: 54px 20px 16px;
    background: linear-gradient(180deg, #0D0B08 0%, var(--bg) 100%);
    position: relative;
  }

  .header-top {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--gold-dim));
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', serif;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 0 0 2px rgba(232,168,56,0.3);
  }

  .header-info { flex: 1; }

  .header-title {
    font-family: 'Cinzel', serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sparkle { color: var(--gold); font-size: 16px; }

  .header-subtitle {
    font-size: 14px;
    color: var(--text-soft);
    font-style: italic;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .info-dot {
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 1px solid var(--text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: var(--text-muted);
    font-style: normal;
  }

  .header-actions { display: flex; gap: 10px; align-items: center; }

  .btn-calendar {
    background: var(--surface);
    border: 1px solid var(--surface2);
    border-radius: 10px;
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-soft);
    font-size: 16px;
    cursor: pointer;
  }

  .btn-streak {
    background: #111;
    border: 1px solid #333;
    border-radius: 10px;
    padding: 6px 12px;
    display: flex; align-items: center; gap: 6px;
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    cursor: pointer;
  }

  .flame { color: var(--gold); font-size: 16px; }

  .xp-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 8px;
    font-size: 13px;
    color: var(--text-soft);
  }

  .xp-dot {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--green);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    color: #fff;
  }

  /* ── PROGRESS ───────────────────────────── */
  .progress-section { padding: 16px 20px 0; }

  .progress-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .progress-label {
    font-family: 'Cinzel', serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
  }

  .progress-pct {
    font-family: 'Cinzel', serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--gold);
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: var(--surface2);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--gold-deep), var(--gold));
    transition: width 1s ease;
  }

  /* ── DEAL BANNER ─────────────────────────── */
  .deal-banner {
    margin: 14px 20px 0;
    background: #111;
    border: 1px solid #2A2218;
    border-radius: var(--radius);
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  .deal-icon { font-size: 20px; }

  .deal-text {
    flex: 1;
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--gold);
    letter-spacing: 0.5px;
  }

  .deal-timer {
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: 1px;
  }

  /* ── SECTION TITLE ───────────────────────── */
  .section-title {
    padding: 18px 20px 10px;
    font-family: 'Cinzel', serif;
    font-size: 13px;
    letter-spacing: 2px;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  /* ── DEVOTIONAL ──────────────────────────── */
  .devotional-card {
    margin: 0 20px;
    background: linear-gradient(135deg, var(--purple) 0%, #2A1E45 100%);
    border-radius: var(--radius);
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    border: 1px solid rgba(107,74,158,0.3);
  }

  .devot-icon {
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.08);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .devot-info { flex: 1; }

  .devot-title {
    font-family: 'Cinzel', serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #C8A8F0;
  }

  .devot-sub {
    font-size: 13px;
    color: rgba(200,168,240,0.6);
    font-style: italic;
    margin-top: 2px;
  }

  .devot-chevron { color: #C8A8F0; font-size: 16px; }

  /* ── ANIMATIONS ──────────────────────────── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .home-header  { animation: fadeUp 0.5s 0.0s both; }
  .week-section { animation: fadeUp 0.5s 0.1s both; }
  .progress-section { animation: fadeUp 0.5s 0.2s both; }
  .deal-banner  { animation: fadeUp 0.5s 0.3s both; }
  .verse-wrap   { animation: fadeUp 0.5s 0.4s both; }
  .devotional-card { animation: fadeUp 0.5s 0.5s both; }
`;

export default function HomePage() {
  const navigate = useNavigate();
  const [progress] = useState(50);
  const [timer, setTimer] = useState(3700 * 15); // seconds for 1:01:40:15
  const [user, setUser] = useState({
    name: "Shash" // abhi demo, later backend se aayega
  });
  // countdown timer for deal banner
  useEffect(() => {
    const id = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const fmtTimer = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Get user initial from localStorage or default
  const token = localStorage.getItem("token");
  const initial = user.name?.charAt(0).toUpperCase(); // parse from token/profile if needed

  return (
    <>
      <style>{style}</style>
      <div className="home-page">

        {/* HEADER */}
        <div className="home-header">
          <div className="header-top">
            <div className="avatar"
              onClick={()=> navigate("/profile")}
            >{initial}</div>
            <div className="header-info">
              <div className="header-title">
                Today's Journey <span className="sparkle">✦</span>
              </div>
              <div className="header-subtitle">
                The Essence of Love
                <span className="info-dot">i</span>
              </div>
              <div className="xp-badge">
                <span className="xp-dot">+</span>
                <span>0 XP today</span>
              </div>
            </div>
            <div className="header-actions">
              <div className="btn-calendar"
              onClick={()=> navigate("/calendar")}
              >📅</div>
              <div className="btn-streak">
                <span className="flame">🔥</span>
                <span>0</span>
              </div>
            </div>
          </div>
        </div>

        {/* WEEK STRIP */}
        <div className="week-section">
          <WeekStrip />
        </div>

        {/* PROGRESS */}
        <div className="progress-section">
          <div className="progress-row">
            <span className="progress-label">Progress today</span>
            <span className="progress-pct">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* DEAL BANNER */}
        <div className="deal-banner">
          <span className="deal-icon">🏷️</span>
          <span className="deal-text">Exclusive Deal</span>
          <span className="deal-timer">{fmtTimer(timer)}</span>
        </div>

        {/* VERSE CARD */}
        <div className="verse-wrap" style={{ padding: "0 20px", marginTop: 14 }}>
          <VerseCard />
        </div>

        {/* DEVOTIONAL */}
        <div className="section-title">For You</div>
        <div className="devotional-card">
          <div className="devot-icon">🖋️</div>
          <div className="devot-info">
            <div className="devot-title">Personalized Devotional</div>
            <div className="devot-sub">• 3 min read</div>
          </div>
          <span className="devot-chevron">›</span>
        </div>

        {/* BOTTOM NAV */}
        <BottomNav active="today" />
      </div>
    </>
  );
}
