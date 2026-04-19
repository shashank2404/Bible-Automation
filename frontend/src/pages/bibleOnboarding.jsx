import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// ─── Styles injected once ───────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #8B5E1A;
    --gold-mid: #A8722A;
    --gold-light: #C9943A;
    --gold-accent: #D4A843;
    --parchment: #FBF5E6;
    --parchment-deep: #F2E8D0;
    --parchment-border: #DDD0B3;
    --ink: #1A0E06;
    --ink-soft: #3D2010;
    --ink-muted: #5C3A18;
    --warm-white: #FFFDF7;
    --shadow-warm: rgba(139,94,26,0.12);
    --shadow-deep: rgba(44,26,14,0.15);
  }

  html, body, #root {
    height: 100%;
    font-family: 'Crimson Pro', serif;
    background: var(--parchment);
  }

  /* Background */
  .ob-scene {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 70% 50% at 50% 0%, #F0E2C0 0%, transparent 70%),
      radial-gradient(ellipse 60% 40% at 20% 100%, #EDD9A8 0%, transparent 60%),
      radial-gradient(ellipse 50% 50% at 80% 80%, #F5ECD5 0%, transparent 60%),
      linear-gradient(160deg, #FBF5E6 0%, #F0E4C8 50%, #F8F0DC 100%);
    overflow: hidden;
  }
  .ob-texture {
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B5E1A' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.6;
  }
  .ob-rays {
    position: absolute; top: -20%; left: 50%;
    transform: translateX(-50%);
    width: 800px; height: 500px;
    background: conic-gradient(from 260deg at 50% 0%,
      transparent 0deg, rgba(201,148,58,0.06) 5deg, transparent 10deg,
      rgba(201,148,58,0.04) 18deg, transparent 24deg,
      rgba(201,148,58,0.07) 32deg, transparent 38deg,
      rgba(201,148,58,0.05) 46deg, transparent 52deg,
      rgba(201,148,58,0.06) 58deg, transparent 80deg);
    filter: blur(8px);
    animation: ob-ray 6s ease-in-out infinite alternate;
  }
  @keyframes ob-ray {
    0%   { opacity: 0.7; transform: translateX(-50%) scaleX(0.95); }
    100% { opacity: 1;   transform: translateX(-50%) scaleX(1.05); }
  }
  .ob-cross { position: absolute; top: 3%; left: 50%; transform: translateX(-50%); opacity: 0.18; }
  .ob-cross-v { width: 2px; height: 52px; background: linear-gradient(to bottom, var(--gold), transparent); margin: 0 auto; }
  .ob-cross-h { width: 26px; height: 2px; background: var(--gold); margin: -36px auto 0; opacity: 0.8; }
  .ob-corner { position: absolute; width: 70px; height: 70px; border-color: rgba(139,94,26,0.2); border-style: solid; }
  .ob-tl { top: 18px; left: 18px; border-width: 1px 0 0 1px; }
  .ob-tr { top: 18px; right: 18px; border-width: 1px 1px 0 0; }
  .ob-bl { bottom: 18px; left: 18px; border-width: 0 0 1px 1px; }
  .ob-br { bottom: 18px; right: 18px; border-width: 0 1px 1px 0; }

  /* Wrapper */
  .ob-wrapper {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 24px;
  }

  /* Card */
  .ob-card {
    width: 480px; max-width: 100%;
    background: var(--warm-white);
    border: 1px solid var(--parchment-border);
    border-radius: 3px;
    padding: 44px 46px 40px;
    box-shadow:
      0 2px 6px var(--shadow-warm),
      0 12px 40px var(--shadow-deep),
      0 0 0 4px rgba(139,94,26,0.04),
      inset 0 1px 0 rgba(255,255,255,0.9);
    position: relative;
    animation: ob-rise 0.8s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes ob-rise {
    from { opacity: 0; transform: translateY(20px) scale(0.99); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .ob-card::before {
    content: ''; position: absolute; inset: 5px;
    border: 1px solid rgba(139,94,26,0.08); border-radius: 2px; pointer-events: none;
  }
  .ob-card::after {
    content: ''; position: absolute;
    top: 0; left: 10%; right: 10%; height: 2px;
    background: linear-gradient(to right, transparent, var(--gold-accent), transparent);
    border-radius: 0 0 2px 2px;
  }

  /* Header */
  .ob-ornament { text-align: center; margin-bottom: 8px; color: var(--gold-mid); font-size: 10px; letter-spacing: 8px; }
  .ob-title    { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 700; letter-spacing: 5px; color: var(--ink); text-align: center; }
  .ob-subtitle { font-style: italic; font-size: 14px; color: var(--ink-muted); letter-spacing: 2px; text-align: center; margin-top: 5px; }
  .ob-divider  { display: flex; align-items: center; gap: 12px; margin: 16px 0 14px; }
  .ob-divider-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, var(--parchment-border), transparent); }
  .ob-diamond  { width: 5px; height: 5px; background: var(--gold-accent); transform: rotate(45deg); opacity: 0.6; }

  /* Progress dots */
  .ob-dots { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 20px; }
  .ob-dot  { width: 6px; height: 6px; border-radius: 50%; background: var(--parchment-border); transition: all 0.3s; }
  .ob-dot.active { background: var(--gold-accent); transform: scale(1.4); }
  .ob-dot.done   { background: var(--gold-mid); }

  /* Step content */
  .ob-step-title { font-family: 'Cinzel', serif; font-size: 13px; font-weight: 700; letter-spacing: 3px; color: var(--ink); text-align: center; margin-bottom: 6px; text-transform: uppercase; }
  .ob-step-sub   { font-style: italic; font-size: 14px; color: var(--ink-muted); text-align: center; margin-bottom: 22px; line-height: 1.6; }
  .ob-verse      { background: var(--parchment-deep); border-left: 2px solid var(--gold-accent); padding: 10px 14px; margin-bottom: 20px; font-style: italic; font-size: 14px; color: var(--ink-soft); font-weight: 600; line-height: 1.7; }
  .ob-cross-icon { text-align: center; font-size: 28px; margin-bottom: 10px; color: var(--gold-mid); }

  /* Step fade animation */
  .ob-step { animation: ob-fade 0.4s ease both; }
  @keyframes ob-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* Option grid */
  .ob-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px; }
  .ob-grid-1  { grid-template-columns: 1fr; }
  .ob-opt     { padding: 11px 8px; background: var(--parchment); border: 1px solid var(--parchment-border); border-radius: 2px; color: var(--ink-soft); font-family: 'Crimson Pro', serif; font-size: 15px; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.2s; line-height: 1.3; }
  .ob-opt:hover    { border-color: var(--gold-mid); background: var(--parchment-deep); color: var(--ink); }
  .ob-opt.selected { border-color: var(--gold-mid); background: linear-gradient(135deg, rgba(168,114,42,0.14), rgba(212,168,67,0.09)); color: var(--ink); font-weight: 700; box-shadow: 0 0 0 1px var(--gold-mid) inset; }

  /* Toggles */
  .ob-toggle-row  { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--parchment); border: 1px solid var(--parchment-border); border-radius: 2px; margin-bottom: 10px; }
  .ob-toggle-info { display: flex; flex-direction: column; gap: 2px; }
  .ob-toggle-name { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; color: var(--ink); font-weight: 700; }
  .ob-toggle-desc { font-style: italic; font-size: 12px; color: var(--ink-muted); }
  .ob-switch      { position: relative; width: 40px; height: 22px; flex-shrink: 0; }
  .ob-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .ob-track       { position: absolute; inset: 0; background: var(--parchment-border); border-radius: 11px; cursor: pointer; transition: background 0.3s; }
  .ob-track::after { content: ''; position: absolute; left: 3px; top: 3px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: transform 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
  .ob-switch input:checked + .ob-track { background: var(--gold-mid); }
  .ob-switch input:checked + .ob-track::after { transform: translateX(18px); }

  /* Buttons */
  .ob-btn-primary {
    width: 100%; padding: 14px; margin-top: 20px;
    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
    background-size: 200% 100%; background-position: 100% 0;
    border: none; border-radius: 2px; color: var(--warm-white);
    font-family: 'Cinzel', serif; font-size: 11px; font-weight: 700;
    letter-spacing: 4px; text-transform: uppercase; cursor: pointer;
    transition: background-position 0.4s, transform 0.15s, box-shadow 0.3s;
    box-shadow: 0 3px 14px rgba(139,94,26,0.3);
    position: relative; overflow: hidden;
  }
  .ob-btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%); transform: translateX(-100%); transition: transform 0.5s; }
  .ob-btn-primary:hover  { background-position: 0% 0; box-shadow: 0 5px 20px rgba(139,94,26,0.35); transform: translateY(-1px); }
  .ob-btn-primary:hover::after { transform: translateX(100%); }
  .ob-btn-primary:active { transform: translateY(0); }
  .ob-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .ob-btn-skip { width: 100%; padding: 9px; background: none; border: none; color: var(--ink-muted); font-family: 'Crimson Pro', serif; font-style: italic; font-size: 14px; cursor: pointer; margin-top: 8px; transition: color 0.2s; }
  .ob-btn-skip:hover { color: var(--gold-mid); }

  /* Summary */
  .ob-summary-row   { display: flex; align-items: center; padding: 9px 0; border-bottom: 1px solid rgba(221,208,179,0.5); }
  .ob-summary-row:last-child { border-bottom: none; }
  .ob-checkmark     { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: var(--gold-mid); color: white; font-size: 10px; margin-right: 10px; flex-shrink: 0; }
  .ob-summary-label { font-family: 'Cinzel', serif; font-size: 12px; font-weight: 600; color: var(--ink-muted); letter-spacing: 1px; min-width: 100px; }
  .ob-summary-val   { font-size: 14px; font-weight: 700; color: var(--ink); }

  .ob-footer { text-align: center; margin-top: 18px; color: var(--parchment-border); font-size: 10px; letter-spacing: 6px; }
`;

// ─── Data ───────────────────────────────────────────────────────────────────
const DENOMINATIONS = ["Catholic","Protestant","Baptist","Methodist","Pentecostal","Lutheran","Anglican","Orthodox","Presbyterian","Non-denominational"];
const BIBLE_VERSIONS = ["KJV","NIV","ESV","NLT","NKJV","NASB","CSB","The Message"];
const AGE_GROUPS     = ["13 – 14","15 – 18","19 – 25","26 – 40","41 – 60","60 +"];
const GENDERS        = ["Brother","Sister","Non-binary","Other"];

const NOTIFICATIONS = [
  { id: "notif1", label: "Daily Verse",         desc: "Morning scripture to start the day",   default: true  },
  { id: "notif2", label: "Prayer Reminders",    desc: "Gentle nudges throughout the day",      default: false },
  { id: "notif3", label: "Community Updates",   desc: "News from your congregation",           default: false },
];

const TOTAL_STEPS = 6; // 0=welcome, 1=denom, 2=bible, 3=age, 4=gender, 5=notifs, 6=summary

// ─── Sub-components ─────────────────────────────────────────────────────────

function ProgressDots({ current }) {
  return (
    <div className="ob-dots">
      {Array.from({ length: TOTAL_STEPS + 1 }, (_, i) => (
        <div key={i} className={`ob-dot${i === current ? " active" : i < current ? " done" : ""}`} />
      ))}
    </div>
  );
}

function OptionGrid({ options, selected, onSelect, cols1 = false }) {
  return (
    <div className={`ob-grid${cols1 ? " ob-grid-1" : ""}`}>
      {options.map(opt => (
        <button
          key={opt}
          className={`ob-opt${selected === opt ? " selected" : ""}`}
          onClick={() => onSelect(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="ob-toggle-row">
      <div className="ob-toggle-info">
        <span className="ob-toggle-name">{label}</span>
        <span className="ob-toggle-desc">{desc}</span>
      </div>
      <label className="ob-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="ob-track" />
      </label>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BibleOnboarding({ onComplete }) {
    const navigate = useNavigate();
  const [step, setStep]   = useState(0);
  const [stepKey, setStepKey] = useState(0); // forces re-mount for animation
  const [selections, setSelections] = useState({
    denom: "", bible: "", age: "", gender: "",
  });
  const [notifs, setNotifs] = useState(
    Object.fromEntries(NOTIFICATIONS.map(n => [n.id, n.default]))
  );

  // Inject CSS once
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  const go = (n) => {
    setStep(n);
    setStepKey(k => k + 1);
  };
  const next = () => go(step + 1);
  const skip = () => next();

  const select = (key, val) => setSelections(s => ({ ...s, [key]: val }));
  const toggleNotif = (id) => setNotifs(n => ({ ...n, [id]: !n[id] }));

  const activeNotifs = NOTIFICATIONS.filter(n => notifs[n.id]).map(n => n.label);

  // BibleOnboarding.jsx — handleFinish
const handleFinish = async () => {
  const token = localStorage.getItem("token");

  console.log("TOKEN FROM STORAGE:", token);

  if (!token) {
    console.error("No token found — redirecting to login");
    navigate("/login");
    return;
  }

  const result = {
    denomination:  selections.denom  || "",
    bibleVersion:  selections.bible  || "",
    ageGroup:      selections.age    || "",
    gender:        selections.gender || "",
    notifications: activeNotifs.length ? activeNotifs : [],
  };

  console.log("SENDING TO BACKEND:", result);

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(result),
    });

    console.log("RESPONSE STATUS:", res.status);
    const data = await res.json();
    console.log("RESPONSE DATA:", data);

    if (res.ok) {
      localStorage.setItem("onboardingComplete", "true");
      navigate("/home");
    } else {
      console.error("Failed:", data.error);
    }
  } catch (err) {
    console.error("Server error:", err);
  }
};

  return (
    <>
      {/* Background */}
      <div className="ob-scene">
        <div className="ob-texture" />
        <div className="ob-rays" />
        <div className="ob-cross"><div className="ob-cross-v" /><div className="ob-cross-h" /></div>
        <div className="ob-corner ob-tl" /><div className="ob-corner ob-tr" />
        <div className="ob-corner ob-bl" /><div className="ob-corner ob-br" />
      </div>

      {/* Centered wrapper */}
      <div className="ob-wrapper">
        <div className="ob-card">

          {/* Header */}
          <div className="ob-ornament">✦ &nbsp; ✦ &nbsp; ✦</div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <h1 className="ob-title">SACRED WORD</h1>
            <p className="ob-subtitle">Setting up your journey</p>
          </div>
          <div className="ob-divider">
            <div className="ob-divider-line" /><div className="ob-diamond" /><div className="ob-divider-line" />
          </div>

          <ProgressDots current={step} />

          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <div key={stepKey} className="ob-step">
              <div className="ob-cross-icon">✝</div>
              <p className="ob-step-title">Welcome, Believer</p>
              <p className="ob-step-sub">Let us tailor your experience.<br />This will only take a moment.</p>
              <div className="ob-verse">"Your word is a lamp to my feet and a light to my path." — Psalm 119:105</div>
              <button className="ob-btn-primary" onClick={next}>Begin Setup &nbsp;→</button>
            </div>
          )}

          {/* ── Step 1: Denomination ── */}
          {step === 1 && (
            <div key={stepKey} className="ob-step">
              <p className="ob-step-title">Your Denomination</p>
              <p className="ob-step-sub">Which branch of Christianity do you follow?</p>
              <OptionGrid options={DENOMINATIONS} selected={selections.denom} onSelect={v => select("denom", v)} />
              <button className="ob-btn-primary" onClick={next} disabled={!selections.denom}>Continue &nbsp;→</button>
              <button className="ob-btn-skip" onClick={skip}>I prefer not to say</button>
            </div>
          )}

          {/* ── Step 2: Bible Version ── */}
          {step === 2 && (
            <div key={stepKey} className="ob-step">
              <p className="ob-step-title">Bible Version</p>
              <p className="ob-step-sub">Which translation do you read?</p>
              <OptionGrid options={BIBLE_VERSIONS} selected={selections.bible} onSelect={v => select("bible", v)} />
              <button className="ob-btn-primary" onClick={next} disabled={!selections.bible}>Continue &nbsp;→</button>
              <button className="ob-btn-skip" onClick={skip}>I prefer not to say</button>
            </div>
          )}

          {/* ── Step 3: Age Group ── */}
          {step === 3 && (
            <div key={stepKey} className="ob-step">
              <p className="ob-step-title">Your Age Group</p>
              <p className="ob-step-sub">We'll personalise content for your stage of life.</p>
              <OptionGrid options={AGE_GROUPS} selected={selections.age} onSelect={v => select("age", v)} cols1 />
              <button className="ob-btn-primary" onClick={next} disabled={!selections.age}>Continue &nbsp;→</button>
              <button className="ob-btn-skip" onClick={skip}>I prefer not to say</button>
            </div>
          )}

          {/* ── Step 4: Gender ── */}
          {step === 4 && (
            <div key={stepKey} className="ob-step">
              <p className="ob-step-title">Your Gender</p>
              <p className="ob-step-sub">Help us speak to you more personally.</p>
              <OptionGrid options={GENDERS} selected={selections.gender} onSelect={v => select("gender", v)} />
              <button className="ob-btn-primary" onClick={next} disabled={!selections.gender}>Continue &nbsp;→</button>
              <button className="ob-btn-skip" onClick={skip}>I prefer not to say</button>
            </div>
          )}

          {/* ── Step 5: Notifications ── */}
          {step === 5 && (
            <div key={stepKey} className="ob-step">
              <p className="ob-step-title">Notifications</p>
              <p className="ob-step-sub">Stay connected with daily verses and reminders.</p>
              {NOTIFICATIONS.map(n => (
                <ToggleRow key={n.id} label={n.label} desc={n.desc} checked={notifs[n.id]} onChange={() => toggleNotif(n.id)} />
              ))}
              <button className="ob-btn-primary" onClick={next}>Continue &nbsp;→</button>
              <button className="ob-btn-skip" onClick={skip}>Maybe later</button>
            </div>
          )}

          {/* ── Step 6: Summary ── */}
          {step === 6 && (
            <div key={stepKey} className="ob-step">
              <p className="ob-step-title">All Set!</p>
              <p className="ob-step-sub">Here's a glimpse of your sacred profile.</p>
              {[
                ["Denomination",  selections.denom   || "—"],
                ["Bible Version", selections.bible   || "—"],
                ["Age Group",     selections.age     || "—"],
                ["Gender",        selections.gender  || "—"],
                ["Notifications", activeNotifs.length ? activeNotifs.join(", ") : "None"],
              ].map(([label, val]) => (
                <div key={label} className="ob-summary-row">
                  <span className="ob-checkmark">✓</span>
                  <span className="ob-summary-label">{label}</span>
                  <span className="ob-summary-val">{val}</span>
                </div>
              ))}
              <button className="ob-btn-primary" onClick={handleFinish} style={{ marginTop: 16 }}>Enter the Word &nbsp;✝</button>
            </div>
          )}

          <div className="ob-footer">✦ &nbsp; SACRED WORD &nbsp; ✦</div>
        </div>
      </div>
    </>
  );
}

