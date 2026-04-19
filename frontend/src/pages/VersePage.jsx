// src/pages/VersePage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const VERSES_REQUIRED = 5;
const TOTAL_VERSES    = 10;

const todayKey = () => new Date().toISOString().slice(0, 10);

const getStore = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const setStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ─── MANUAL VERSE BANK (fallback when AI fails) ───────────────────────────────
// 10 verses per "theme day" — cycles weekly by day-of-week
const MANUAL_VERSE_SETS = [
  // 0 = Sunday — Love
  [
    { ref: "John 3:16",        text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", theme: "Love" },
    { ref: "Romans 8:38-39",   text: "For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God.", theme: "Love" },
    { ref: "1 John 4:8",       text: "Whoever does not love does not know God, because God is love.", theme: "Love" },
    { ref: "1 Corinthians 13:4", text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", theme: "Love" },
    { ref: "Jeremiah 31:3",    text: "The LORD appeared to us in the past, saying: I have loved you with an everlasting love; I have drawn you with unfailing kindness.", theme: "Love" },
    { ref: "Zephaniah 3:17",   text: "The LORD your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.", theme: "Love" },
    { ref: "Psalm 136:26",     text: "Give thanks to the God of heaven. His love endures forever.", theme: "Love" },
    { ref: "Romans 5:8",       text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.", theme: "Love" },
    { ref: "Ephesians 3:18",   text: "May have power, together with all the Lord's holy people, to grasp how wide and long and high and deep is the love of Christ.", theme: "Love" },
    { ref: "Psalm 86:15",      text: "But you, Lord, are a compassionate and gracious God, slow to anger, abounding in love and faithfulness.", theme: "Love" },
  ],
  // 1 = Monday — Strength
  [
    { ref: "Philippians 4:13", text: "I can do all this through him who gives me strength.", theme: "Strength" },
    { ref: "Isaiah 40:31",     text: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", theme: "Strength" },
    { ref: "Psalm 46:1",       text: "God is our refuge and strength, an ever-present help in trouble.", theme: "Strength" },
    { ref: "Ephesians 6:10",   text: "Finally, be strong in the Lord and in his mighty power.", theme: "Strength" },
    { ref: "2 Timothy 1:7",    text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.", theme: "Strength" },
    { ref: "Psalm 28:7",       text: "The LORD is my strength and my shield; my heart trusts in him, and he helps me.", theme: "Strength" },
    { ref: "Isaiah 41:10",     text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.", theme: "Strength" },
    { ref: "Nehemiah 8:10",    text: "Do not grieve, for the joy of the LORD is your strength.", theme: "Strength" },
    { ref: "Deuteronomy 31:6", text: "Be strong and courageous. Do not be afraid or terrified, for the LORD your God goes with you.", theme: "Strength" },
    { ref: "Psalm 18:32",      text: "It is God who arms me with strength and keeps my way secure.", theme: "Strength" },
  ],
  // 2 = Tuesday — Peace
  [
    { ref: "John 14:27",       text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.", theme: "Peace" },
    { ref: "Philippians 4:7",  text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.", theme: "Peace" },
    { ref: "Isaiah 26:3",      text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you.", theme: "Peace" },
    { ref: "Romans 15:13",     text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.", theme: "Peace" },
    { ref: "Psalm 29:11",      text: "The LORD gives strength to his people; the LORD blesses his people with peace.", theme: "Peace" },
    { ref: "Numbers 6:26",     text: "The LORD turn his face toward you and give you peace.", theme: "Peace" },
    { ref: "Colossians 3:15",  text: "Let the peace of Christ rule in your hearts, since as members of one body you were called to peace.", theme: "Peace" },
    { ref: "2 Thessalonians 3:16", text: "Now may the Lord of peace himself give you peace at all times and in every way.", theme: "Peace" },
    { ref: "Psalm 4:8",        text: "In peace I will lie down and sleep, for you alone, LORD, make me dwell in safety.", theme: "Peace" },
    { ref: "Romans 8:6",       text: "The mind governed by the flesh is death, but the mind governed by the Spirit is life and peace.", theme: "Peace" },
  ],
  // 3 = Wednesday — Hope
  [
    { ref: "Jeremiah 29:11",   text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.", theme: "Hope" },
    { ref: "Romans 15:4",      text: "For everything that was written in the past was written to teach us, so that through the endurance taught in the Scriptures and the encouragement they provide we might have hope.", theme: "Hope" },
    { ref: "Hebrews 11:1",     text: "Now faith is confidence in what we hope for and assurance about what we do not see.", theme: "Hope" },
    { ref: "Psalm 31:24",      text: "Be strong and take heart, all you who hope in the LORD.", theme: "Hope" },
    { ref: "Lamentations 3:24", text: "I say to myself: The LORD is my portion; therefore I will wait for him.", theme: "Hope" },
    { ref: "Romans 5:5",       text: "And hope does not put us to shame, because God's love has been poured out into our hearts through the Holy Spirit.", theme: "Hope" },
    { ref: "Psalm 130:7",      text: "Israel, put your hope in the LORD, for with the LORD is unfailing love and with him is full redemption.", theme: "Hope" },
    { ref: "1 Peter 1:3",      text: "Praise be to the God and Father of our Lord Jesus Christ! In his great mercy he has given us new birth into a living hope through the resurrection of Jesus Christ from the dead.", theme: "Hope" },
    { ref: "Titus 2:13",       text: "While we wait for the blessed hope — the appearing of the glory of our great God and Savior, Jesus Christ.", theme: "Hope" },
    { ref: "Romans 12:12",     text: "Be joyful in hope, patient in affliction, faithful in prayer.", theme: "Hope" },
  ],
  // 4 = Thursday — Faith
  [
    { ref: "Mark 11:24",       text: "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.", theme: "Faith" },
    { ref: "Matthew 17:20",    text: "Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, Move from here to there, and it will move. Nothing will be impossible for you.", theme: "Faith" },
    { ref: "Proverbs 3:5-6",   text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", theme: "Faith" },
    { ref: "2 Corinthians 5:7", text: "For we live by faith, not by sight.", theme: "Faith" },
    { ref: "Galatians 2:20",   text: "I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God.", theme: "Faith" },
    { ref: "Ephesians 2:8",    text: "For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God.", theme: "Faith" },
    { ref: "James 2:26",       text: "As the body without the spirit is dead, so faith without deeds is dead.", theme: "Faith" },
    { ref: "Matthew 21:21",    text: "Jesus replied: Truly I tell you, if you have faith and do not doubt, you can say to this mountain, Go, throw yourself into the sea, and it will be done.", theme: "Faith" },
    { ref: "Romans 10:17",     text: "Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.", theme: "Faith" },
    { ref: "Hebrews 10:23",    text: "Let us hold unswervingly to the hope we profess, for he who promised is faithful.", theme: "Faith" },
  ],
  // 5 = Friday — Grace
  [
    { ref: "Ephesians 2:8-9",  text: "For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast.", theme: "Grace" },
    { ref: "2 Corinthians 12:9", text: "But he said to me: My grace is sufficient for you, for my power is made perfect in weakness.", theme: "Grace" },
    { ref: "Romans 6:14",      text: "For sin shall no longer be your master, because you are not under the law, but under grace.", theme: "Grace" },
    { ref: "Hebrews 4:16",     text: "Let us then approach God's throne of grace with confidence, so that we may receive mercy and find grace to help us in our time of need.", theme: "Grace" },
    { ref: "John 1:14",        text: "The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.", theme: "Grace" },
    { ref: "Romans 5:20",      text: "The law was brought in so that the trespass might increase. But where sin increased, grace increased all the more.", theme: "Grace" },
    { ref: "Titus 3:7",        text: "So that, having been justified by his grace, we might become heirs having the hope of eternal life.", theme: "Grace" },
    { ref: "1 Peter 4:10",     text: "Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace in its various forms.", theme: "Grace" },
    { ref: "Psalm 84:11",      text: "For the LORD God is a sun and shield; the LORD bestows favor and honor; no good thing does he withhold from those whose walk is blameless.", theme: "Grace" },
    { ref: "Acts 15:11",       text: "No! We believe it is through the grace of our Lord Jesus that we are saved.", theme: "Grace" },
  ],
  // 6 = Saturday — Wisdom
  [
    { ref: "James 1:5",        text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.", theme: "Wisdom" },
    { ref: "Proverbs 9:10",    text: "The fear of the LORD is the beginning of wisdom, and knowledge of the Holy One is understanding.", theme: "Wisdom" },
    { ref: "Colossians 2:3",   text: "In whom are hidden all the treasures of wisdom and knowledge.", theme: "Wisdom" },
    { ref: "Proverbs 2:6",     text: "For the LORD gives wisdom; from his mouth come knowledge and understanding.", theme: "Wisdom" },
    { ref: "Ecclesiastes 2:26", text: "To the person who pleases him, God gives wisdom, knowledge and happiness.", theme: "Wisdom" },
    { ref: "Psalm 119:105",    text: "Your word is a lamp for my feet, a light on my path.", theme: "Wisdom" },
    { ref: "1 Corinthians 1:30", text: "It is because of him that you are in Christ Jesus, who has become for us wisdom from God.", theme: "Wisdom" },
    { ref: "Proverbs 1:7",     text: "The fear of the LORD is the beginning of knowledge, but fools despise wisdom and instruction.", theme: "Wisdom" },
    { ref: "Romans 11:33",     text: "Oh, the depth of the riches of the wisdom and knowledge of God! How unsearchable his judgments, and his paths beyond tracing out!", theme: "Wisdom" },
    { ref: "Proverbs 3:13",    text: "Blessed are those who find wisdom, those who gain understanding.", theme: "Wisdom" },
  ],
];

// ─── AI FETCH — calls Claude API to generate 10 contextual verses ─────────────
async function fetchAIVerses(theme) {
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are a Bible verse curator. Return ONLY a valid JSON array of exactly 10 objects.
Each object: {"ref":"Book Chapter:Verse","text":"Full verse text (NIV).","theme":"${theme}","reflection":"One sentence reflection (max 15 words)."}
No markdown, no backticks, no explanation. Just the JSON array.`,
        messages: [{ role: "user", content: `Give me 10 Bible verses about "${theme}" for today's devotional journey. Vary them across Old and New Testament.` }],
      }),
    });
    if (!resp.ok) throw new Error("API error");
    const data = await resp.json();
    const raw  = data.content?.find(b => b.type === "text")?.text || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed  = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length >= 5) return parsed.slice(0, 10);
    return null;
  } catch {
    return null;
  }
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

  :root {
    --gold:#E8A838;--gold-dim:#B8822A;--gold-deep:#7A5520;--gold-pale:rgba(232,168,56,.12);
    --bg:#151210;--bg2:#1E1A16;--bg3:#252018;
    --surface:#2A2318;--surface2:#322B1E;--surface3:#3A3020;
    --text:#F5EDD8;--text-soft:#B8A88A;--text-muted:#7A6A52;
    --green:#2A7A4A;--green-dim:#1E5C38;--red:#7A2A2A;
    --radius:18px;--radius-sm:10px;
  }

  body{font-family:'Crimson Pro',serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}

  .vp{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);position:relative;padding-bottom:100px}

  /* HEADER */
  .vp-header{
    padding:54px 20px 18px;
    background:linear-gradient(180deg,#0D0B08 0%,rgba(21,18,16,0) 100%);
    display:flex;align-items:center;gap:14px;
  }
  .vp-back{width:40px;height:40px;border-radius:var(--radius-sm);background:var(--surface);
    border:1px solid var(--surface2);display:flex;align-items:center;justify-content:center;
    color:var(--text-soft);font-size:18px;cursor:pointer;flex-shrink:0;transition:border-color .2s}
  .vp-back:hover{border-color:var(--gold-dim)}
  .vp-header-info{flex:1}
  .vp-title{font-family:'Cinzel',serif;font-size:20px;font-weight:700;color:var(--text);
    display:flex;align-items:center;gap:8px}
  .vp-sparkle{color:var(--gold)}
  .vp-subtitle{font-size:13px;color:var(--text-muted);font-style:italic;margin-top:2px}
  .vp-source-badge{
    font-size:11px;padding:3px 9px;border-radius:20px;font-style:normal;
    font-family:'Cinzel',serif;letter-spacing:.5px;
  }
  .vp-source-badge.ai{background:rgba(107,74,158,.25);color:#C8A8F0;border:1px solid rgba(107,74,158,.4)}
  .vp-source-badge.manual{background:rgba(42,122,74,.2);color:#7AC89A;border:1px solid rgba(42,122,74,.35)}

  /* PROGRESS RING SECTION */
  .vp-goal{
    margin:0 20px 20px;background:var(--surface);border:1px solid var(--surface2);
    border-radius:var(--radius);padding:16px 18px;display:flex;align-items:center;gap:16px;
  }
  .vp-ring-wrap{position:relative;width:64px;height:64px;flex-shrink:0}
  .vp-ring{transform:rotate(-90deg)}
  .vp-ring-track{fill:none;stroke:var(--surface2);stroke-width:5}
  .vp-ring-fill{fill:none;stroke-width:5;stroke-linecap:round;
    stroke:var(--gold);transition:stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)}
  .vp-ring-fill.done{stroke:var(--green)}
  .vp-ring-label{position:absolute;inset:0;display:flex;flex-direction:column;
    align-items:center;justify-content:center;pointer-events:none}
  .vp-ring-num{font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:var(--text);line-height:1}
  .vp-ring-of{font-size:10px;color:var(--text-muted)}
  .vp-goal-text{flex:1}
  .vp-goal-title{font-family:'Cinzel',serif;font-size:14px;font-weight:700;
    color:var(--text);margin-bottom:4px}
  .vp-goal-sub{font-size:13px;color:var(--text-muted);font-style:italic;line-height:1.4}
  .vp-goal-sub.done{color:var(--gold);font-style:normal;font-weight:600}

  /* THEME PILL */
  .vp-theme-row{padding:0 20px 14px;display:flex;align-items:center;gap:10px}
  .vp-theme-label{font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;
    color:var(--text-muted);text-transform:uppercase}
  .vp-theme-pill{font-family:'Cinzel',serif;font-size:12px;font-weight:700;
    color:var(--gold);background:var(--gold-pale);border:1px solid rgba(232,168,56,.25);
    border-radius:20px;padding:4px 14px;letter-spacing:.5px}

  /* VERSE LIST */
  .vp-list{padding:0 20px;display:flex;flex-direction:column;gap:14px}

  /* VERSE CARD */
  .vc{
    background:var(--surface);border:1px solid var(--surface2);border-radius:var(--radius);
    overflow:hidden;cursor:pointer;transition:border-color .2s,transform .15s;
    position:relative;
  }
  .vc:active{transform:scale(.985)}
  .vc.read{border-color:rgba(42,122,74,.5)}
  .vc.current{border-color:var(--gold-dim);box-shadow:0 0 0 1px rgba(232,168,56,.15),0 8px 32px rgba(0,0,0,.4)}
  .vc-num{
    position:absolute;top:14px;right:14px;
    font-family:'Cinzel',serif;font-size:11px;font-weight:700;
    color:var(--text-muted);letter-spacing:.5px;
  }
  .vc.read .vc-num{color:var(--green)}
  .vc-body{padding:18px 18px 14px}
  .vc-ref{font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:1px;
    color:var(--gold);margin-bottom:10px;display:flex;align-items:center;gap:8px}
  .vc-check{width:18px;height:18px;border-radius:50%;background:var(--green);
    display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;flex-shrink:0}
  .vc-text{font-size:16px;line-height:1.65;color:var(--text);font-style:italic;
    display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
    transition:all .3s}
  .vc.expanded .vc-text{-webkit-line-clamp:unset}
  .vc-reflection{
    font-size:13px;color:var(--text-soft);margin-top:8px;padding-top:8px;
    border-top:1px solid var(--surface2);font-style:normal;
    animation:fadeUp .35s ease both;
  }
  .vc-footer{
    padding:10px 18px 14px;display:flex;align-items:center;gap:10px;
    border-top:1px solid var(--surface2);
  }
  .vc-btn-read{
    flex:1;background:var(--gold-deep);border:1px solid var(--gold-dim);
    border-radius:var(--radius-sm);padding:9px;font-family:'Cinzel',serif;
    font-size:12px;font-weight:700;letter-spacing:.5px;color:var(--gold);
    cursor:pointer;transition:background .2s,border-color .2s;text-align:center;
  }
  .vc-btn-read:hover{background:var(--gold-dim);color:#fff}
  .vc-btn-read.done{background:rgba(42,122,74,.2);border-color:rgba(42,122,74,.5);color:#7AC89A;cursor:default}
  .vc-btn-expand{
    width:36px;height:36px;border-radius:var(--radius-sm);background:var(--surface2);
    border:1px solid var(--surface3);display:flex;align-items:center;justify-content:center;
    color:var(--text-muted);font-size:14px;cursor:pointer;transition:border-color .2s;flex-shrink:0;
  }
  .vc-btn-expand:hover{border-color:var(--gold-dim)}

  /* LOADING STATE */
  .vp-loading{
    margin:20px;background:var(--surface);border:1px solid var(--surface2);
    border-radius:var(--radius);padding:40px 20px;text-align:center;
  }
  .vp-loading-icon{font-size:32px;margin-bottom:12px;animation:pulse 1.5s ease infinite}
  .vp-loading-text{font-family:'Cinzel',serif;font-size:14px;color:var(--text-muted);margin-bottom:4px}
  .vp-loading-sub{font-size:13px;color:var(--text-muted);font-style:italic}
  @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}

  /* CELEBRATION */
  .vp-celebrate{
    margin:0 20px 20px;background:linear-gradient(135deg,var(--green-dim),#1A4A2A);
    border:1px solid rgba(42,122,74,.6);border-radius:var(--radius);padding:18px;
    text-align:center;animation:fadeUp .5s ease both;
  }
  .vp-celebrate-icon{font-size:32px;margin-bottom:8px}
  .vp-celebrate-title{font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:#7AC89A;margin-bottom:4px}
  .vp-celebrate-sub{font-size:13px;color:rgba(122,200,154,.7);font-style:italic}

  /* TOAST */
  .vp-toast{position:fixed;top:60px;left:50%;transform:translateX(-50%);
    background:var(--gold);color:#111;font-family:'Cinzel',serif;font-size:13px;font-weight:700;
    padding:10px 20px;border-radius:30px;box-shadow:0 4px 20px rgba(232,168,56,.5);
    z-index:999;white-space:nowrap;animation:toastIn .3s ease,toastOut .4s 2.2s ease forwards}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes toastOut{to{opacity:0;transform:translateX(-50%) translateY(-12px)}}

  /* GENERAL ANIMS */
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .vc{animation:fadeUp .4s ease both}
  .vc:nth-child(1){animation-delay:.05s}.vc:nth-child(2){animation-delay:.1s}
  .vc:nth-child(3){animation-delay:.15s}.vc:nth-child(4){animation-delay:.2s}
  .vc:nth-child(5){animation-delay:.25s}.vc:nth-child(6){animation-delay:.3s}
  .vc:nth-child(7){animation-delay:.35s}.vc:nth-child(8){animation-delay:.4s}
  .vc:nth-child(9){animation-delay:.45s}.vc:nth-child(10){animation-delay:.5s}

  /* DIVIDER */
  .vp-divider{
    margin:6px 20px 14px;display:flex;align-items:center;gap:10px;
  }
  .vp-divider-line{flex:1;height:1px;background:var(--surface2)}
  .vp-divider-text{font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;
    color:var(--text-muted);text-transform:uppercase;white-space:nowrap}
`;

// ─── RING COMPONENT ───────────────────────────────────────────────────────────
function ProgressRing({ read, total, required }) {
  const r = 27, circ = 2 * Math.PI * r;
  const pct    = Math.min(1, read / required);
  const offset = circ * (1 - pct);
  const done   = read >= required;
  return (
    <div className="vp-ring-wrap">
      <svg className="vp-ring" width="64" height="64" viewBox="0 0 64 64">
        <circle className="vp-ring-track" cx="32" cy="32" r={r} />
        <circle
          className={`vp-ring-fill ${done ? "done" : ""}`}
          cx="32" cy="32" r={r}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="vp-ring-label">
        <span className="vp-ring-num">{read}</span>
        <span className="vp-ring-of">/{required}</span>
      </div>
    </div>
  );
}

// ─── SINGLE VERSE CARD ────────────────────────────────────────────────────────
function VerseCard({ verse, index, isRead, isCurrent, onMarkRead }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={[
      "vc",
      isRead    ? "read"    : "",
      isCurrent ? "current" : "",
      expanded  ? "expanded": "",
    ].filter(Boolean).join(" ")}>
      <span className="vc-num">
        {isRead ? "✓" : `${index + 1}/${TOTAL_VERSES}`}
      </span>

      <div className="vc-body">
        <div className="vc-ref">
          {isRead && <span className="vc-check">✓</span>}
          {verse.ref}
        </div>
        <div className="vc-text">"{verse.text}"</div>
        {expanded && verse.reflection && (
          <div className="vc-reflection">💡 {verse.reflection}</div>
        )}
      </div>

      <div className="vc-footer">
        <div
          className={`vc-btn-read ${isRead ? "done" : ""}`}
          onClick={() => !isRead && onMarkRead()}
        >
          {isRead ? "✦ Completed" : "Mark as Read"}
        </div>
        <div className="vc-btn-expand" onClick={() => setExpanded(e => !e)}>
          {expanded ? "↑" : "↓"}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function VersePage() {
  const navigate    = useNavigate();
  const today       = todayKey();
  const dayOfWeek   = new Date().getDay(); // 0–6

  const manualVerses = MANUAL_VERSE_SETS[dayOfWeek];
  const theme        = manualVerses[0].theme;

  // ── State ──────────────────────────────────────────────────────────────────
  const [verses,       setVerses]       = useState(null);      // null = loading
  const [source,       setSource]       = useState("manual");  // "ai" | "manual"
  const [readSet,      setReadSet]      = useState(() => new Set(getStore(`readSet_${today}`, [])));
  const [toast,        setToast]        = useState(null);
  const [loading,      setLoading]      = useState(true);

  const versesReadToday = readSet.size;
  const goalDone        = versesReadToday >= VERSES_REQUIRED;

  // ── Load verses: try AI first, fallback to manual ─────────────────────────
  useEffect(() => {
    let cancelled = false;

    // Check if we already cached verses for today (avoids re-generating)
    const cached = getStore(`verses_content_${today}`, null);
    if (cached) {
      setVerses(cached.verses);
      setSource(cached.source);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetchAIVerses(theme).then(aiVerses => {
      if (cancelled) return;
      if (aiVerses && aiVerses.length >= 5) {
        // Pad to 10 if needed using manual
        const final = aiVerses.length < TOTAL_VERSES
          ? [...aiVerses, ...manualVerses.slice(aiVerses.length)]
          : aiVerses.slice(0, TOTAL_VERSES);
        setVerses(final);
        setSource("ai");
        setStore(`verses_content_${today}`, { verses: final, source: "ai" });
      } else {
        setVerses(manualVerses);
        setSource("manual");
        setStore(`verses_content_${today}`, { verses: manualVerses, source: "manual" });
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [today, theme]);

  // ── Post progress to backend ───────────────────────────────────────────────
  const postProgress = useCallback(async (count, newStreak) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ versesReadToday: count, streak: newStreak, date: today }),
      });
    } catch { /* silent */ }
  }, [today]);

  // ── Mark a verse as read ───────────────────────────────────────────────────
  const markRead = useCallback((idx) => {
    if (readSet.has(idx)) return;

    const newSet = new Set(readSet);
    newSet.add(idx);
    setReadSet(newSet);

    const readArr  = [...newSet];
    const newCount = readArr.length;

    // Persist read indices
    setStore(`readSet_${today}`, readArr);
    // Persist count (for HomePage)
    setStore(`verses_${today}`, newCount);

    // Update streak if goal just completed
    let streak = getStore("streak", 0);
    if (newCount === VERSES_REQUIRED) {
      const rd  = getStore("readDays", {});
      const last = getStore("lastStreakDate", null);
      if (!rd[today]) {
        rd[today]   = true;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);
        streak = (last === yKey || last === today) ? streak + 1 : 1;
        setStore("streak",         streak);
        setStore("lastStreakDate", today);
        setStore("readDays",       rd);
      }
    }

    // Fire event so HomePage updates immediately
    window.dispatchEvent(new CustomEvent("verseRead", {
      detail: { count: newCount, streak }
    }));

    // Post to server
    postProgress(newCount, streak);

    // Toast
    if (newCount === VERSES_REQUIRED) {
      setToast(`🔥 ${streak}-day streak! Daily goal complete!`);
    } else if (newCount < VERSES_REQUIRED) {
      setToast(`📖 ${newCount}/${VERSES_REQUIRED} — ${VERSES_REQUIRED - newCount} more to go!`);
    } else {
      setToast(`✦ Bonus verse ${newCount}!`);
    }
    setTimeout(() => setToast(null), 2700);
  }, [readSet, today, postProgress]);

  // ── Current verse: first unread ────────────────────────────────────────────
  const currentIdx = verses
    ? verses.findIndex((_, i) => !readSet.has(i))
    : -1;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  const streak = getStore("streak", 0);

  return (
    <>
      <style>{style}</style>
      {toast && <div className="vp-toast">{toast}</div>}

      <div className="vp">

        {/* HEADER */}
        <div className="vp-header">
          <div className="vp-back" onClick={() => navigate(-1)}>‹</div>
          <div className="vp-header-info">
            <div className="vp-title">
              Scripture Journey <span className="vp-sparkle">✦</span>
            </div>
            <div className="vp-subtitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {loading ? "Loading verses…" : `${TOTAL_VERSES} verses · Complete ${VERSES_REQUIRED} for today`}
              {!loading && (
                <span className={`vp-source-badge ${source}`}>
                  {source === "ai" ? "✦ AI Curated" : "📖 Curated"}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6,
            fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700,
            color: streak > 0 ? "var(--gold)" : "var(--text-muted)",
            background: "var(--surface)", border: "1px solid var(--surface2)",
            borderRadius: "var(--radius-sm)", padding: "6px 12px",
          }}>
            {streak > 0 ? "🔥" : "💤"} {streak}
          </div>
        </div>

        {/* GOAL PROGRESS */}
        <div className="vp-goal">
          <ProgressRing read={versesReadToday} total={TOTAL_VERSES} required={VERSES_REQUIRED} />
          <div className="vp-goal-text">
            <div className="vp-goal-title">
              {goalDone ? "Daily Goal Complete!" : "Today's Reading Goal"}
            </div>
            <div className={`vp-goal-sub ${goalDone ? "done" : ""}`}>
              {goalDone
                ? `✦ You've read ${versesReadToday} verse${versesReadToday !== 1 ? "s" : ""} — keep going for bonus XP!`
                : `Read ${VERSES_REQUIRED - versesReadToday} more verse${VERSES_REQUIRED - versesReadToday !== 1 ? "s" : ""} to complete your journey`
              }
            </div>
          </div>
        </div>

        {/* CELEBRATION BANNER */}
        {goalDone && (
          <div className="vp-celebrate">
            <div className="vp-celebrate-icon">🎉</div>
            <div className="vp-celebrate-title">Journey Complete — {streak}-Day Streak!</div>
            <div className="vp-celebrate-sub">
              {versesReadToday < TOTAL_VERSES
                ? `${TOTAL_VERSES - versesReadToday} bonus verse${TOTAL_VERSES - versesReadToday !== 1 ? "s" : ""} still waiting below`
                : "You've read all 10 verses. Remarkable!"}
            </div>
          </div>
        )}

        {/* THEME ROW */}
        {!loading && (
          <div className="vp-theme-row">
            <span className="vp-theme-label">Theme</span>
            <span className="vp-theme-pill">{theme}</span>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="vp-loading">
            <div className="vp-loading-icon">📖</div>
            <div className="vp-loading-text">Preparing your scriptures…</div>
            <div className="vp-loading-sub">Asking the AI to curate today's verses</div>
          </div>
        )}

        {/* VERSE LIST */}
        {!loading && verses && (
          <>
            {/* First 5 — required */}
            <div className="vp-list">
              {verses.slice(0, VERSES_REQUIRED).map((v, i) => (
                <VerseCard
                  key={i}
                  verse={v}
                  index={i}
                  isRead={readSet.has(i)}
                  isCurrent={i === currentIdx}
                  onMarkRead={() => markRead(i)}
                />
              ))}
            </div>

            {/* Divider */}
            <div className="vp-divider">
              <div className="vp-divider-line" />
              <span className="vp-divider-text">Bonus Verses</span>
              <div className="vp-divider-line" />
            </div>

            {/* Last 5 — bonus */}
            <div className="vp-list">
              {verses.slice(VERSES_REQUIRED, TOTAL_VERSES).map((v, i) => {
                const realIdx = i + VERSES_REQUIRED;
                return (
                  <VerseCard
                    key={realIdx}
                    verse={v}
                    index={realIdx}
                    isRead={readSet.has(realIdx)}
                    isCurrent={realIdx === currentIdx}
                    onMarkRead={() => markRead(realIdx)}
                  />
                );
              })}
            </div>
          </>
        )}

      </div>
    </>
  );
}