// src/pages/HomePage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import VerseCard from "../components/home/VerseCard";
import BottomNav from "../components/home/BottomNav";

// ─── OFFER CONFIG ─────────────────────────────────────────────────────────────
const OFFERS = [
  {
    id: "offer_apr_2026",
    label: "Exclusive Deal",
    icon: "🏷️",
    expiresAt: new Date(Date.now() + 15 * 3600 * 1000 + 23 * 60 * 1000 + 29 * 1000),
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const todayKey = () => new Date().toISOString().slice(0, 10);

const getStore = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const setStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const buildWeekData = (readDays) =>
  Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const key     = d.toISOString().slice(0, 10);
    const dayNum  = d.getDate();
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    return { key, dayNum, dayName, read: !!readDays[key], isToday: key === todayKey() };
  });

const VERSES_REQUIRED = 5;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

  :root {
    --gold:#E8A838; --gold-dim:#B8822A; --gold-deep:#7A5520;
    --bg:#151210; --bg2:#1E1A16; --bg3:#252018;
    --surface:#2A2318; --surface2:#322B1E;
    --text:#F5EDD8; --text-soft:#B8A88A; --text-muted:#7A6A52;
    --purple:#3D2B5E; --purple-light:#6B4A9E; --green:#2A7A4A; --radius:16px;
  }
  body{font-family:'Crimson Pro',serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}

  .home-page{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);position:relative;padding-bottom:90px}

  /* HEADER */
  .home-header{padding:54px 20px 16px;background:linear-gradient(180deg,#0D0B08 0%,var(--bg) 100%)}
  .header-top{display:flex;align-items:center;gap:14px}
  .avatar{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dim));
    display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:20px;font-weight:700;
    color:#fff;flex-shrink:0;box-shadow:0 0 0 2px rgba(232,168,56,.3);cursor:pointer}
  .header-info{flex:1}
  .header-title{font-family:'Cinzel',serif;font-size:18px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:8px}
  .sparkle{color:var(--gold);font-size:16px}
  .header-subtitle{font-size:14px;color:var(--text-soft);font-style:italic;margin-top:2px;display:flex;align-items:center;gap:6px}
  .info-dot{width:16px;height:16px;border-radius:50%;border:1px solid var(--text-muted);
    display:inline-flex;align-items:center;justify-content:center;font-size:10px;color:var(--text-muted);font-style:normal}
  .header-actions{display:flex;gap:10px;align-items:center}
  .btn-calendar{background:var(--surface);border:1px solid var(--surface2);border-radius:10px;width:38px;height:38px;
    display:flex;align-items:center;justify-content:center;color:var(--text-soft);font-size:16px;cursor:pointer}
  .btn-streak{background:#111;border:1px solid #333;border-radius:10px;padding:6px 12px;
    display:flex;align-items:center;gap:6px;font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:var(--text);cursor:pointer}
  .btn-streak.active{border-color:var(--gold-dim)}
  .xp-badge{display:flex;align-items:center;gap:5px;margin-top:8px;font-size:13px;color:var(--text-soft)}
  .xp-dot{width:18px;height:18px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff}

  /* WEEK STRIP */
  .week-section{padding:12px 20px 4px}
  .week-row{display:flex;justify-content:space-between;gap:6px}
  .week-day{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px}
  .week-day-label{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.5px;color:var(--text-muted)}
  .week-day-circle{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
    font-family:'Cinzel',serif;font-size:14px;font-weight:600;color:var(--text-muted);background:var(--surface);
    position:relative;transition:all .2s}
  .week-day-circle.today{border:2px solid var(--gold);color:var(--text);background:var(--surface2)}
  .week-day-circle.read{background:linear-gradient(135deg,var(--gold-deep),var(--gold-dim));color:#fff}
  .week-day-circle.read::after{content:'';position:absolute;bottom:-3px;right:-3px;width:10px;height:10px;
    background:var(--green);border-radius:50%;border:2px solid var(--bg)}

  /* PROGRESS */
  .progress-section{padding:16px 20px 0}
  .progress-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .progress-label{font-family:'Cinzel',serif;font-size:15px;font-weight:600;color:var(--text)}
  .progress-meta{display:flex;align-items:center;gap:8px}
  .progress-count{font-size:13px;color:var(--text-muted)}
  .progress-pct{font-family:'Cinzel',serif;font-size:15px;font-weight:700;color:var(--gold)}
  .progress-bar{width:100%;height:8px;background:var(--surface2);border-radius:4px;overflow:hidden}
  .progress-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--gold-deep),var(--gold));transition:width .8s ease}
  .progress-hint{margin-top:7px;font-size:12px;color:var(--text-muted);font-style:italic;text-align:right}

  /* DEAL */
  .deal-banner{margin:14px 20px 0;background:#111;border:1px solid #2A2218;border-radius:var(--radius);
    padding:14px 18px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:border-color .2s}
  .deal-banner:hover{border-color:var(--gold-deep)}
  .deal-banner.expired{opacity:.4;pointer-events:none}
  .deal-icon{font-size:20px}
  .deal-text{flex:1;font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:var(--gold);letter-spacing:.5px}
  .deal-timer{font-family:'Cinzel',serif;font-size:14px;font-weight:600;color:var(--gold);letter-spacing:1px}
  .deal-expired{font-family:'Cinzel',serif;font-size:12px;color:var(--text-muted)}

  /* FOR YOU */
  .section-title{padding:18px 20px 10px;font-family:'Cinzel',serif;font-size:13px;letter-spacing:2px;
    color:var(--text-muted);text-transform:uppercase}
  .devotional-card{margin:0 20px;background:linear-gradient(135deg,var(--purple) 0%,#2A1E45 100%);
    border-radius:var(--radius);padding:16px 18px;display:flex;align-items:center;gap:14px;
    cursor:pointer;border:1px solid rgba(107,74,158,.3)}
  .devot-icon{width:36px;height:36px;background:rgba(255,255,255,.08);border-radius:10px;
    display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .devot-info{flex:1}
  .devot-title{font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:1.5px;color:#C8A8F0}
  .devot-sub{font-size:13px;color:rgba(200,168,240,.6);font-style:italic;margin-top:2px}
  .devot-chevron{color:#C8A8F0;font-size:16px}

  /* TOAST */
  .toast{position:fixed;top:60px;left:50%;transform:translateX(-50%);background:var(--gold);color:#111;
    font-family:'Cinzel',serif;font-size:13px;font-weight:700;padding:10px 20px;border-radius:30px;
    box-shadow:0 4px 20px rgba(232,168,56,.5);z-index:999;white-space:nowrap;
    animation:toastIn .3s ease,toastOut .4s 2.2s ease forwards}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes toastOut{to{opacity:0;transform:translateX(-50%) translateY(-12px)}}

  /* ANIMS */
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  .home-header      {animation:fadeUp .5s .0s both}
  .week-section     {animation:fadeUp .5s .1s both}
  .progress-section {animation:fadeUp .5s .2s both}
  .deal-banner      {animation:fadeUp .5s .3s both}
  .verse-wrap       {animation:fadeUp .5s .4s both}
  .devotional-card  {animation:fadeUp .5s .5s both}
`;

// ─── READ FRESH STATE FROM LOCALSTORAGE ───────────────────────────────────────
function readFreshState() {
  const today           = todayKey();
  const versesReadToday = getStore(`verses_${today}`, 0);
  const readDays        = getStore("readDays", {});
  const streak          = getStore("streak", 0);
  const lastStreakDate  = getStore("lastStreakDate", null);
  return { versesReadToday, readDays, streak, lastStreakDate };
}

// ─── DB FETCH HELPER ──────────────────────────────────────────────────────────
async function fetchProgressFromDB() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const res = await fetch("/api/progress/today", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── APPLY DB DATA → localStorage + setState ──────────────────────────────────
function applyDBData(data, { setVersesReadToday, setStreak, setReadDays }) {
  if (!data) return;
  const today = todayKey();

  setStore(`verses_${today}`, data.versesReadToday || 0);
  setStore("streak",          data.streak          || 0);
  setStore("lastStreakDate",  data.lastStreakDate   || null);

  // Mark today as read if goal was already reached
  if ((data.versesReadToday || 0) >= VERSES_REQUIRED) {
    const rd  = getStore("readDays", {});
    rd[today] = true;
    setStore("readDays", rd);
  }

  // Build readDays — prefer server value, fallback to localStorage
  const rd = data.readDays || getStore("readDays", {});
  setStore("readDays", rd);

  setVersesReadToday(data.versesReadToday || 0);
  setStreak(data.streak || 0);
  setReadDays(rd);
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();

  const [user,            setUser]            = useState({ name: "Shash" });
  const [versesReadToday, setVersesReadToday] = useState(() => getStore(`verses_${todayKey()}`, 0));
  const [readDays,        setReadDays]        = useState(() => getStore("readDays", {}));
  const [streak,          setStreak]          = useState(() => getStore("streak", 0));
  const [toast,           setToast]           = useState(null);

  // ── 1. Load user profile ───────────────────────────────────────────────────
  useEffect(() => {
    const stored = getStore("userProfile", null);
    if (stored) setUser(stored);
  }, []);

  // ── 2. Load today's progress + streak from DB on mount ────────────────────
  useEffect(() => {
    fetchProgressFromDB().then(data =>
      applyDBData(data, { setVersesReadToday, setStreak, setReadDays })
    );
  }, []);

  // ── Sync state from localStorage ──────────────────────────────────────────
  const syncFromStorage = useCallback(() => {
    const fresh = readFreshState();
    setVersesReadToday(fresh.versesReadToday);
    setReadDays(fresh.readDays);
    setStreak(fresh.streak);
  }, []);

  // ── 3. Event listeners — verseRead event, visibilitychange, focus ─────────
  useEffect(() => {
    // Called when VersePage fires "verseRead" custom event
    const onVerseRead = (e) => {
      // Immediately update from localStorage (written by VersePage already)
      syncFromStorage();

      const count  = e.detail?.count  ?? getStore(`verses_${todayKey()}`, 0);
      const streak = e.detail?.streak ?? getStore("streak", 0);

      // Override streak with authoritative server value from event
      setStreak(streak);

      if (count === VERSES_REQUIRED) {
        setToast(`🔥 ${streak}-day streak! Well done!`);
        setTimeout(() => setToast(null), 2700);
      } else if (count < VERSES_REQUIRED) {
        setToast(`📖 ${count}/${VERSES_REQUIRED} verses — keep going!`);
        setTimeout(() => setToast(null), 2700);
      }
    };

    // ── 4. visibilitychange — re-fetch DB when user comes back ────────────
    const onVisible = async () => {
      if (document.visibilityState !== "visible") return;

      // Instant local update first so UI isn't stale
      syncFromStorage();

      // Then get authoritative values from DB
      const data = await fetchProgressFromDB();
      applyDBData(data, { setVersesReadToday, setStreak, setReadDays });
    };

    const onFocus = () => syncFromStorage();

    window.addEventListener("verseRead",        onVerseRead);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus",            onFocus);

    return () => {
      window.removeEventListener("verseRead",        onVerseRead);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus",            onFocus);
    };
  }, [syncFromStorage]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const progress = Math.min(100, Math.round((versesReadToday / VERSES_REQUIRED) * 100));
  const xpToday  = versesReadToday * 10;
  const weekData = buildWeekData(readDays);
  const initial  = user.name?.charAt(0).toUpperCase() || "?";

  // ── Active offer + countdown ───────────────────────────────────────────────
  const activeOffer = OFFERS.find(o => new Date(o.expiresAt) > new Date()) || null;
  const [offerSecsLeft, setOfferSecsLeft] = useState(() =>
    activeOffer ? Math.max(0, Math.floor((new Date(activeOffer.expiresAt) - Date.now()) / 1000)) : 0
  );
  useEffect(() => {
    if (!activeOffer) return;
    const id = setInterval(() => setOfferSecsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [activeOffer]);

  const fmtCountdown = (s) => {
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{style}</style>
      {toast && <div className="toast">{toast}</div>}

      <div className="home-page">

        {/* HEADER */}
        <div className="home-header">
          <div className="header-top">
            <div className="avatar" onClick={() => navigate("/profile")}>{initial}</div>
            <div className="header-info">
              <div className="header-title">Today's Journey <span className="sparkle">✦</span></div>
              <div className="header-subtitle">The Essence of Love <span className="info-dot">i</span></div>
              <div className="xp-badge">
                <span className="xp-dot">+</span>
                <span>{xpToday} XP today</span>
              </div>
            </div>
            <div className="header-actions">
              <div className="btn-calendar" onClick={() => navigate("/calendar")}>📅</div>
              <div className={`btn-streak ${streak > 0 ? "active" : ""}`}>
                <span>{streak > 0 ? "🔥" : "💤"}</span>
                <span>{streak}</span>
              </div>
            </div>
          </div>
        </div>

        {/* WEEK STRIP */}
        <div className="week-section">
          <div className="week-row">
            {weekData.map((day) => (
              <div className="week-day" key={day.key}>
                <span className="week-day-label">{day.dayName.slice(0, 1)}</span>
                <div
                  className={[
                    "week-day-circle",
                    day.isToday ? "today" : "",
                    day.read    ? "read"  : "",
                  ].filter(Boolean).join(" ")}
                >
                  {day.dayNum}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROGRESS */}
        <div className="progress-section">
          <div className="progress-row">
            <span className="progress-label">Progress today</span>
            <div className="progress-meta">
              <span className="progress-count">{versesReadToday}/{VERSES_REQUIRED} verses</span>
              <span className="progress-pct">{progress}%</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          {progress < 100
            ? <div className="progress-hint">
                {VERSES_REQUIRED - versesReadToday} more verse
                {VERSES_REQUIRED - versesReadToday !== 1 ? "s" : ""} to complete today's journey
              </div>
            : <div className="progress-hint" style={{ color: "var(--gold)" }}>
                ✦ Today's journey complete!
              </div>
          }
        </div>

        {/* DEAL BANNER */}
        {activeOffer && (
          <div
            className={`deal-banner ${offerSecsLeft === 0 ? "expired" : ""}`}
            onClick={() => navigate("/offer/" + activeOffer.id)}
          >
            <span className="deal-icon">{activeOffer.icon}</span>
            <span className="deal-text">{activeOffer.label}</span>
            {offerSecsLeft > 0
              ? <span className="deal-timer">{fmtCountdown(offerSecsLeft)}</span>
              : <span className="deal-expired">Expired</span>
            }
          </div>
        )}

        {/* VERSE CARD */}
        <div className="verse-wrap" style={{ padding: "0 20px", marginTop: 14 }}>
          <VerseCard />
        </div>

        {/* FOR YOU */}
        <div className="section-title">For You</div>
        <div className="devotional-card" onClick={() => navigate("/devotional")}>
          <div className="devot-icon">🖋️</div>
          <div className="devot-info">
            <div className="devot-title">Personalized Devotional</div>
            <div className="devot-sub">• 3 min read</div>
          </div>
          <span className="devot-chevron">›</span>
        </div>

        <BottomNav active="today" />
      </div>
    </>
  );
}