import { useState, useRef } from "react";
import NotepadModal from "./Notepad";

const BIBLE_BOOKS = {
  "Old Testament": [
    { name: "Genesis", chapters: 50 },{ name: "Exodus", chapters: 40 },
    { name: "Leviticus", chapters: 27 },{ name: "Numbers", chapters: 36 },
    { name: "Deuteronomy", chapters: 34 },{ name: "Joshua", chapters: 24 },
    { name: "Judges", chapters: 21 },{ name: "Ruth", chapters: 4 },
    { name: "1 Samuel", chapters: 31 },{ name: "2 Samuel", chapters: 24 },
    { name: "1 Kings", chapters: 22 },{ name: "2 Kings", chapters: 25 },
    { name: "1 Chronicles", chapters: 29 },{ name: "2 Chronicles", chapters: 36 },
    { name: "Ezra", chapters: 10 },{ name: "Nehemiah", chapters: 13 },
    { name: "Esther", chapters: 10 },{ name: "Job", chapters: 42 },
    { name: "Psalms", chapters: 150 },{ name: "Proverbs", chapters: 31 },
    { name: "Ecclesiastes", chapters: 12 },{ name: "Song of Solomon", chapters: 8 },
    { name: "Isaiah", chapters: 66 },{ name: "Jeremiah", chapters: 52 },
    { name: "Lamentations", chapters: 5 },{ name: "Ezekiel", chapters: 48 },
    { name: "Daniel", chapters: 12 },{ name: "Hosea", chapters: 14 },
    { name: "Joel", chapters: 3 },{ name: "Amos", chapters: 9 },
    { name: "Obadiah", chapters: 1 },{ name: "Jonah", chapters: 4 },
    { name: "Micah", chapters: 7 },{ name: "Nahum", chapters: 3 },
    { name: "Habakkuk", chapters: 3 },{ name: "Zephaniah", chapters: 3 },
    { name: "Haggai", chapters: 2 },{ name: "Zechariah", chapters: 14 },
    { name: "Malachi", chapters: 4 },
  ],
  "New Testament": [
    { name: "Matthew", chapters: 28 },{ name: "Mark", chapters: 16 },
    { name: "Luke", chapters: 24 },{ name: "John", chapters: 21 },
    { name: "Acts", chapters: 28 },{ name: "Romans", chapters: 16 },
    { name: "1 Corinthians", chapters: 16 },{ name: "2 Corinthians", chapters: 13 },
    { name: "Galatians", chapters: 6 },{ name: "Ephesians", chapters: 6 },
    { name: "Philippians", chapters: 4 },{ name: "Colossians", chapters: 4 },
    { name: "1 Thessalonians", chapters: 5 },{ name: "2 Thessalonians", chapters: 3 },
    { name: "1 Timothy", chapters: 6 },{ name: "2 Timothy", chapters: 4 },
    { name: "Titus", chapters: 3 },{ name: "Philemon", chapters: 1 },
    { name: "Hebrews", chapters: 13 },{ name: "James", chapters: 5 },
    { name: "1 Peter", chapters: 5 },{ name: "2 Peter", chapters: 3 },
    { name: "1 John", chapters: 5 },{ name: "2 John", chapters: 1 },
    { name: "3 John", chapters: 1 },{ name: "Jude", chapters: 1 },
    { name: "Revelation", chapters: 22 },
  ],
};

const ALL_BOOKS = [...BIBLE_BOOKS["Old Testament"], ...BIBLE_BOOKS["New Testament"]];

const SCENES = {
  books: (
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <defs>
        <radialGradient id="sky" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1a0a2e" /><stop offset="60%" stopColor="#0d0618" /><stop offset="100%" stopColor="#070312" />
        </radialGradient>
        <radialGradient id="glow1" cx="50%" cy="40%" r="40%">
          <stop offset="0%" stopColor="#f5a623" stopOpacity="0.18" /><stop offset="100%" stopColor="#f5a623" stopOpacity="0" />
        </radialGradient>
        <filter id="blur2"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <rect width="400" height="220" fill="url(#sky)" /><rect width="400" height="220" fill="url(#glow1)" />
      {[[30,18],[70,12],[120,8],[180,20],[240,10],[300,15],[360,22],[50,40],[140,35],[220,30],[310,38],[90,55],[270,48]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={0.8} fill="#f5e6c8" opacity={0.7} />
      ))}
      <circle cx="200" cy="38" r="3" fill="#fff9e6" opacity="0.95" /><circle cx="200" cy="38" r="8" fill="#f5a623" opacity="0.25" filter="url(#blur2)" />
      <polygon points="0,220 60,120 120,180 180,95 240,155 310,100 370,145 400,220" fill="#0d0a1a" />
      <polygon points="0,220 40,145 100,195 160,118 220,170 290,125 360,160 400,220" fill="#110c20" />
      <g transform="translate(190,130)">
        <ellipse cx="10" cy="55" rx="10" ry="28" fill="#1a0a00" opacity="0.9" />
        <rect x="4" y="28" width="12" height="28" rx="3" fill="#1a0a00" opacity="0.9" />
        <circle cx="10" cy="22" r="9" fill="#1a0a00" opacity="0.9" />
        <line x1="10" y1="35" x2="-8" y2="22" stroke="#1a0a00" strokeWidth="4" strokeLinecap="round" />
        <rect x="-20" y="12" width="11" height="14" rx="2" fill="#c8a96e" opacity="0.85" />
        <rect x="-9" y="12" width="11" height="14" rx="2" fill="#c8a96e" opacity="0.85" />
        <line x1="22" y1="36" x2="28" y2="85" stroke="#5c3a1e" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  ),
  chapters: (
    <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <defs>
        <radialGradient id="sg" cx="50%" cy="60%" r="70%"><stop offset="0%" stopColor="#0a1628" /><stop offset="100%" stopColor="#060e1a" /></radialGradient>
        <filter id="gf"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <rect width="400" height="180" fill="url(#sg)" />
      <rect x="0" y="110" width="400" height="70" fill="#0a1e38" opacity="0.8" />
      <circle cx="200" cy="28" r="18" fill="#f5e6c8" opacity="0.9" /><circle cx="207" cy="24" r="14" fill="#0a1628" opacity="0.85" />
      <g transform="translate(185,78)">
        <ellipse cx="15" cy="50" rx="9" ry="22" fill="#060e1a" opacity="0.95" />
        <rect x="8" y="22" width="14" height="28" rx="4" fill="#060e1a" opacity="0.95" />
        <circle cx="15" cy="14" r="9" fill="#060e1a" opacity="0.95" />
        <line x1="8" y1="32" x2="-10" y2="28" stroke="#060e1a" strokeWidth="4" strokeLinecap="round" />
        <line x1="22" y1="32" x2="40" y2="26" stroke="#060e1a" strokeWidth="4" strokeLinecap="round" />
      </g>
      <path d="M0,115 Q50,85 120,105 Q180,88 250,108 Q320,85 400,110 L400,115 Z" fill="#080f1e" />
    </svg>
  ),
  reading: (
    <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <defs>
        <radialGradient id="rg" cx="50%" cy="0%" r="80%"><stop offset="0%" stopColor="#1a0e00" /><stop offset="100%" stopColor="#080500" /></radialGradient>
        <filter id="cf"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="cf2"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <rect width="400" height="160" fill="url(#rg)" />
      <path d="M140,160 L140,50 Q200,5 260,50 L260,160" stroke="#2a1a00" strokeWidth="3" fill="none" opacity="0.6" />
      <rect x="100" y="105" width="200" height="45" rx="6" fill="#c8a050" opacity="0.15" />
      {[116,122,128,134,140].map((y,i)=>(<line key={i} x1={115+i*3} y1={y} x2={285-i*3} y2={y} stroke="#f5a623" strokeWidth="0.5" opacity="0.25" />))}
      <rect x="68" y="88" width="8" height="30" rx="2" fill="#e8d5a0" opacity="0.7" />
      <ellipse cx="72" cy="88" rx="4" ry="3" fill="#f5a623" opacity="0.9" />
      <ellipse cx="72" cy="75" rx="25" ry="20" fill="#f5a623" opacity="0.12" filter="url(#cf)" />
      <ellipse cx="72" cy="84" rx="2" ry="4" fill="#fff9e6" opacity="0.95" />
      <rect x="324" y="88" width="8" height="30" rx="2" fill="#e8d5a0" opacity="0.7" />
      <ellipse cx="328" cy="75" rx="25" ry="20" fill="#f5a623" opacity="0.12" filter="url(#cf)" />
      <ellipse cx="328" cy="84" rx="2" ry="4" fill="#fff9e6" opacity="0.95" />
    </svg>
  ),
};

const BOOK_THEMES = {
  Genesis:{accent:"#4fc3f7",label:"Creation",icon:"🌅"},Exodus:{accent:"#f5a623",label:"Liberation",icon:"🔥"},
  Psalms:{accent:"#a78bfa",label:"Praise",icon:"🎵"},Proverbs:{accent:"#34d399",label:"Wisdom",icon:"💎"},
  Isaiah:{accent:"#fb923c",label:"Prophecy",icon:"📯"},Daniel:{accent:"#60a5fa",label:"Vision",icon:"🦁"},
  Matthew:{accent:"#f472b6",label:"Gospel",icon:"✝️"},Mark:{accent:"#f59e0b",label:"Gospel",icon:"✝️"},
  Luke:{accent:"#6ee7b7",label:"Gospel",icon:"✝️"},John:{accent:"#93c5fd",label:"Gospel",icon:"✝️"},
  Revelation:{accent:"#f87171",label:"Apocalypse",icon:"🌟"},Jonah:{accent:"#38bdf8",label:"Mercy",icon:"🐋"},
  Ruth:{accent:"#fbbf24",label:"Loyalty",icon:"🌾"},"Song of Solomon":{accent:"#f9a8d4",label:"Love",icon:"🌹"},
  Job:{accent:"#94a3b8",label:"Suffering",icon:"⚖️"},Esther:{accent:"#c084fc",label:"Courage",icon:"👑"},
  default:{accent:"#f5a623",label:"Scripture",icon:"📜"},
};

const getTheme = (n) => BOOK_THEMES[n] || BOOK_THEMES.default;

// ── Share Apps ──────────────────────────────────────────
const SHARE_APPS = [
  {
    id:"whatsapp", label:"WhatsApp",
    color:"#25D366", bg:"rgba(37,211,102,0.15)",
    icon:(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.85L.057 23.57l5.847-1.533A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 01-5.031-1.374l-.361-.214-3.741.981.999-3.647-.235-.375A9.86 9.86 0 012.1 12C2.1 6.532 6.532 2.1 12 2.1c5.467 0 9.9 4.432 9.9 9.9 0 5.467-4.433 9.9-9.9 9.9z"/>
      </svg>
    ),
    action:(text) => { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank"); }
  },
  {
    id:"gmail", label:"Gmail",
    color:"#EA4335", bg:"rgba(234,67,53,0.15)",
    icon:(
      <svg width="22" height="22" viewBox="0 0 24 24">
        <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.909 1.528-1.147C21.69 2.28 24 3.434 24 5.457z"/>
      </svg>
    ),
    action:(text,ref) => {
      const sub = encodeURIComponent(`Bible verse – ${ref}`);
      window.open(`mailto:?subject=${sub}&body=${encodeURIComponent(text)}`);
    }
  },
  {
    id:"mail", label:"Mail",
    color:"#4fc3f7", bg:"rgba(79,195,247,0.15)",
    icon:(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    action:(text,ref) => {
      const sub = encodeURIComponent(`Bible verse – ${ref}`);
      window.open(`mailto:?subject=${sub}&body=${encodeURIComponent(text)}`);
    }
  },
  {
    id:"instagram", label:"Instagram",
    color:"#E1306C", bg:"rgba(225,48,108,0.15)",
    icon:(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433"/><stop offset="25%" stopColor="#e6683c"/>
            <stop offset="50%" stopColor="#dc2743"/><stop offset="75%" stopColor="#cc2366"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig)" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" stroke="url(#ig)" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1" fill="#E1306C"/>
      </svg>
    ),
    action:(text) => {
      navigator.clipboard && navigator.clipboard.writeText(text);
      alert("Copied! Paste it in your Instagram Story or DM.");
    }
  },
  {
    id:"telegram", label:"Telegram",
    color:"#229ED9", bg:"rgba(34,158,217,0.15)",
    icon:(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#229ED9">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/>
      </svg>
    ),
    action:(text) => { window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`,"_blank"); }
  },
  {
    id:"twitter", label:"X / Twitter",
    color:"#f0ead6", bg:"rgba(240,234,214,0.1)",
    icon:(
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#f0ead6">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    action:(text) => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,"_blank"); }
  },
  {
    id:"copy", label:"Copy link",
    color:"#f5a623", bg:"rgba(245,166,35,0.15)",
    icon:(
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
      </svg>
    ),
    action:(text) => { navigator.clipboard && navigator.clipboard.writeText(text); }
  },
  {
    id:"more", label:"More",
    color:"#94a3b8", bg:"rgba(148,163,184,0.12)",
    icon:(
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
      </svg>
    ),
    action:(text) => {
      if(navigator.share) navigator.share({ text }).catch(()=>{});
      else { navigator.clipboard && navigator.clipboard.writeText(text); }
    }
  },
];

// ── Share Sheet Modal ────────────────────────────────────
function ShareSheet({ isOpen, onClose, verseRef, verseText, accent }) {
  const shareText = verseText ? `${verseRef}\n"${verseText}"\n\n— Holy Bible` : verseRef;
  if (!isOpen) return null;
  return (
    <>
      <style>{`
        .ss-overlay {
          position:fixed;inset:0;z-index:600;
          background:rgba(0,0,0,0.7);
          display:flex;align-items:flex-end;justify-content:center;
          animation:ssOvIn 0.18s ease;
        }
        @keyframes ssOvIn{from{opacity:0}to{opacity:1}}
        .ss-sheet {
          width:100%;max-width:500px;
          background:#0d0a02;
          border:1px solid rgba(245,166,35,0.22);
          border-bottom:none;
          border-radius:20px 20px 0 0;
          padding:0 0 env(safe-area-inset-bottom,0);
          animation:ssUp 0.28s cubic-bezier(0.32,0.72,0,1);
          overflow:hidden;
        }
        @keyframes ssUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .ss-handle{width:36px;height:4px;background:rgba(245,166,35,0.28);border-radius:99px;margin:10px auto 0;}
        .ss-header{padding:12px 18px 14px;border-bottom:1px solid rgba(245,166,35,0.1);}
        .ss-title{font-family:'Cinzel',serif;font-size:12px;color:#f5a623;letter-spacing:0.15em;}
        .ss-preview{
          margin-top:6px;padding:8px 12px;
          border-left:2px solid rgba(245,166,35,0.35);
          font-family:'EB Garamond',serif;font-size:13px;
          color:rgba(240,234,214,0.55);font-style:italic;line-height:1.5;
          background:rgba(245,166,35,0.04);border-radius:0 6px 6px 0;
        }
        .ss-apps{
          display:grid;grid-template-columns:repeat(4,1fr);
          gap:12px;padding:18px 16px;
        }
        .ss-app-btn{
          display:flex;flex-direction:column;align-items:center;gap:7px;
          cursor:pointer;background:none;border:none;
        }
        .ss-app-icon{
          width:52px;height:52px;border-radius:14px;
          display:flex;align-items:center;justify-content:center;
          border:1px solid rgba(255,255,255,0.07);
          transition:transform 0.15s,filter 0.15s;
        }
        .ss-app-btn:hover .ss-app-icon{transform:scale(1.08);filter:brightness(1.15);}
        .ss-app-label{font-size:10px;color:rgba(240,234,214,0.5);font-family:'Lato',sans-serif;letter-spacing:0.03em;}
        .ss-cancel{
          width:100%;padding:14px;border:none;
          background:rgba(245,166,35,0.07);
          border-top:1px solid rgba(245,166,35,0.1);
          color:rgba(240,234,214,0.45);
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.1em;
          cursor:pointer;transition:background 0.15s;
        }
        .ss-cancel:hover{background:rgba(245,166,35,0.12);}
      `}</style>
      <div className="ss-overlay" onClick={e => { if(e.target.classList.contains("ss-overlay")) onClose(); }}>
        <div className="ss-sheet">
          <div className="ss-handle" />
          <div className="ss-header">
            <div className="ss-title">✦ Share Verse</div>
            <div className="ss-preview">
              {verseRef} — {verseText?.slice(0,80)}{verseText?.length > 80 ? "…" : ""}
            </div>
          </div>
          <div className="ss-apps">
            {SHARE_APPS.map(app => (
              <button key={app.id} className="ss-app-btn"
                onClick={() => { app.action(shareText, verseRef); onClose(); }}>
                <div className="ss-app-icon" style={{ background: app.bg }}>
                  {app.icon}
                </div>
                <span className="ss-app-label">{app.label}</span>
              </button>
            ))}
          </div>
          <button className="ss-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </>
  );
}

// ── Context Menu ─────────────────────────────────────────
function ContextMenu({ visible, x, y, verseNum, verseRef, theme, onAction, onClose }) {
  if (!visible) return null;
  const items = [
    { id:"share",     label:"Share",           sub:"Send to apps",      iconColor:"#60a5fa", bg:"rgba(79,140,247,0.18)" },
    { id:"copy",      label:"Copy",            sub:"Copy verse text",   iconColor:"#f5a623", bg:"rgba(245,166,35,0.15)" },
    { id:"bookmark",  label:"Bookmark",        sub:"Save this verse",   iconColor:"#c084fc", bg:"rgba(168,85,247,0.18)" },
    { id:"notes",     label:"Notes",           sub:"Add your note",     iconColor:"#34d399", bg:"rgba(52,211,153,0.18)" },
    { id:"highlight", label:"Highlight",       sub:"Mark in colour",    iconColor:"#fbbf24", bg:"rgba(251,191,36,0.18)" },
    { id:"chapterbk", label:"Chapter bookmark",sub:"Save this chapter", iconColor:"#fb7185", bg:"rgba(251,113,133,0.18)" },
    { id:"audio",     label:"Go to Audio",     sub:"Listen to chapter", iconColor:"#5eead4", bg:"rgba(94,234,212,0.18)" },
  ];
  const ICONS = {
    share: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
    copy: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
    bookmark: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
    notes: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    highlight: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    chapterbk: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    audio: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>,
  };
  return (
    <>
      <style>{`
        .ctx-wrap{position:absolute;z-index:400;animation:ctxIn 0.17s ease;min-width:195px;
          background:rgba(10,6,0,0.97);border:1px solid rgba(245,166,35,0.28);
          border-radius:14px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.7);}
        @keyframes ctxIn{from{opacity:0;transform:scale(0.93) translateY(-4px)}to{opacity:1;transform:scale(1)}}
        .ctx-ref{padding:9px 14px 7px;font-family:'Cinzel',serif;font-size:10px;
          color:rgba(245,166,35,0.55);letter-spacing:0.15em;border-bottom:1px solid rgba(245,166,35,0.1);}
        .ctx-row{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;
          border:none;background:none;width:100%;text-align:left;
          border-bottom:1px solid rgba(245,166,35,0.06);transition:background 0.12s;}
        .ctx-row:last-child{border-bottom:none;}
        .ctx-row:hover{background:rgba(245,166,35,0.1);}
        .ctx-ic{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .ctx-lbl{font-family:'Lato',sans-serif;font-size:13px;color:#f0ead6;}
        .ctx-sub{font-size:10px;color:rgba(240,234,214,0.35);margin-top:1px;}
      `}</style>
      <div className="ctx-wrap" style={{ top: y, left: x }}>
        <div className="ctx-ref">{verseRef}</div>
        {items.map(it => (
          <button key={it.id} className="ctx-row" onClick={() => onAction(it.id)}>
            <div className="ctx-ic" style={{ background: it.bg, color: it.iconColor }}>{ICONS[it.id]}</div>
            <div><div className="ctx-lbl">{it.label}</div><div className="ctx-sub">{it.sub}</div></div>
          </button>
        ))}
      </div>
      <div style={{ position:"absolute",inset:0,zIndex:399 }} onClick={onClose} />
    </>
  );
}

// ── Toast ─────────────────────────────────────────────────
function Toast({ msg }) {
  return msg ? (
    <div style={{
      position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
      background:"rgba(245,166,35,0.18)",border:"1px solid rgba(245,166,35,0.35)",
      color:"#f5a623",padding:"8px 18px",borderRadius:30,
      fontSize:12,fontFamily:"'Cinzel',serif",letterSpacing:"0.1em",
      pointerEvents:"none",whiteSpace:"nowrap",zIndex:1000,
      animation:"toastIn 0.2s ease",
    }}>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {msg}
    </div>
  ) : null;
}

// ── Main BiblePage ─────────────────────────────────────────
export default function BiblePage() {
  const [view, setView] = useState("books");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState("All");
  const [highlightedVerses, setHighlightedVerses] = useState(new Set());
  const [fontSize, setFontSize] = useState(17);

  // Context menu
  const [ctx, setCtx] = useState({ visible:false, x:0, y:0, verseNum:null, verseText:"" });

  // Modals
  const [shareOpen, setShareOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteVerse, setNoteVerse] = useState({ ref:"", text:"" });

  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  const contentRef = useRef(null);

  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2200);
  };

  const fetchChapter = async (book, chapter) => {
    setLoading(true); setError(null); setVerses([]);
    try {
      const res = await fetch(`/bible?book=${encodeURIComponent(book)}&chapter=${chapter}`);
      if (!res.ok) throw new Error("Failed to load chapter");
      setVerses(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const openBook = (book) => { setSelectedBook(book); setView("chapters"); setHighlightedVerses(new Set()); };
  const openChapter = (ch) => {
    setSelectedChapter(ch); setView("reading");
    fetchChapter(selectedBook.name, ch);
    contentRef.current?.scrollTo(0,0);
  };
  const goBack = () => {
    if (view === "reading") { setView("chapters"); setVerses([]); }
    else if (view === "chapters") { setView("books"); setSelectedBook(null); }
    setCtx(c => ({ ...c, visible:false }));
  };

  const verseRef = (v) => `${selectedBook?.name} ${selectedChapter}:${v}`;

  const openCtx = (e, verseNum, verseText) => {
    e.preventDefault();
    const rect = contentRef.current?.getBoundingClientRect() || { left:0, top:0 };
    const x = Math.min(e.clientX - rect.left, (contentRef.current?.offsetWidth||320) - 210);
    const y = e.clientY - rect.top + 6;
    setCtx({ visible:true, x, y, verseNum, verseText });
  };

  const handleCtxAction = (action) => {
    const vNum = ctx.verseNum;
    const vText = ctx.verseText;
    const ref = verseRef(vNum);
    setCtx(c => ({ ...c, visible:false }));

    if (action === "share") { setNoteVerse({ ref, text: vText }); setShareOpen(true); }
    else if (action === "notes") { setNoteVerse({ ref, text: vText }); setNoteOpen(true); }
    else if (action === "highlight") {
      setHighlightedVerses(prev => { const n=new Set(prev); n.has(vNum)?n.delete(vNum):n.add(vNum); return n; });
      toast("Highlight toggled ✦");
    }
    else if (action === "copy") {
      navigator.clipboard && navigator.clipboard.writeText(`${ref} – "${vText}"`);
      toast("Copied ✦");
    }
    else if (action === "bookmark") { toast("Verse bookmarked ✦"); }
    else if (action === "chapterbk") { toast("Chapter bookmarked ✦"); }
    else if (action === "audio") { toast("Opening audio…"); }
  };

  const filteredBooks = ALL_BOOKS.filter(b => {
    const ms = b.name.toLowerCase().includes(search.toLowerCase());
    const mt = testament === "All" ||
      (testament === "OT" && BIBLE_BOOKS["Old Testament"].find(x=>x.name===b.name)) ||
      (testament === "NT" && BIBLE_BOOKS["New Testament"].find(x=>x.name===b.name));
    return ms && mt;
  });

  const theme = selectedBook ? getTheme(selectedBook.name) : getTheme("default");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#060400;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes shimmer{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(245,166,35,0.2);border-radius:4px;}
        .book-card{transition:all 0.25s ease;}
        .book-card:hover{transform:translateY(-2px) scale(1.02)!important;}
        .chapter-btn{transition:all 0.2s ease;}
        .chapter-btn:hover{transform:scale(1.06)!important;}
        .verse-row{transition:all 0.15s ease;}
        .verse-row:hover{padding-left:18px!important;}
        .verse-row.hl{border-left-color:var(--accent)!important;background:color-mix(in srgb,var(--accent) 12%,transparent)!important;}
        input:focus{outline:none!important;box-shadow:0 0 0 1.5px var(--accent);}
        .tab-btn{transition:all 0.2s;}
        .back-btn:hover{background:rgba(245,166,35,0.2)!important;}
        .ctrl-btn:hover{background:rgba(245,166,35,0.18)!important;}
      `}</style>

      <div style={{
        "--accent": theme.accent,
        width:"100%", height:"100dvh",
        display:"flex", flexDirection:"column",
        background:"#060400",
        fontFamily:"'Lato', sans-serif",
        color:"#f0ead6",
        overflow:"hidden",
        position:"relative",
      }}>
        {/* Hero Scene */}
        <div style={{ position:"relative", flexShrink:0, height: view==="reading"?100:160, overflow:"hidden", transition:"height 0.5s ease" }}>
          <div style={{ position:"absolute", inset:0, opacity:0.9, animation:"fadeIn 0.8s ease" }}>{SCENES[view]}</div>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(6,4,0,0.1) 0%, rgba(6,4,0,0.0) 40%, rgba(6,4,0,0.85) 100%)" }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:`linear-gradient(to right, transparent, ${theme.accent}55, transparent)` }} />

          <div style={{ position:"absolute", top:0, left:0, right:0, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
            {view !== "books" && (
              <button className="back-btn" onClick={goBack} style={{
                background:"rgba(0,0,0,0.55)", backdropFilter:"blur(12px)",
                border:`1px solid ${theme.accent}55`, color:theme.accent,
                borderRadius:10, padding:"6px 14px", cursor:"pointer", fontSize:13, fontFamily:"'Lato',sans-serif", transition:"all 0.2s",
              }}>← Back</button>
            )}
            <div style={{ flex:1 }} />
            {view === "reading" && (
              <div style={{ display:"flex", gap:5 }}>
                {[["A−",()=>setFontSize(s=>Math.max(12,s-2))],["A+",()=>setFontSize(s=>Math.min(24,s+2))]].map(([lbl,fn])=>(
                  <button key={lbl} className="ctrl-btn" onClick={fn} style={{
                    width:32, height:32, borderRadius:8, border:`1px solid ${theme.accent}44`,
                    background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)",
                    color:theme.accent, cursor:"pointer", fontSize:12, fontFamily:"'Cinzel',serif",
                  }}>{lbl}</button>
                ))}
              </div>
            )}
            {view === "reading" && (
              <div style={{ display:"flex", gap:5 }}>
                {selectedChapter > 1 && (
                  <button className="ctrl-btn" onClick={() => openChapter(selectedChapter-1)} style={{
                    padding:"5px 12px", borderRadius:8, border:`1px solid ${theme.accent}44`,
                    background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)",
                    color:theme.accent, cursor:"pointer", fontSize:12,
                  }}>‹</button>
                )}
                {selectedChapter < selectedBook?.chapters && (
                  <button className="ctrl-btn" onClick={() => openChapter(selectedChapter+1)} style={{
                    padding:"5px 12px", borderRadius:8, border:`1px solid ${theme.accent}44`,
                    background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)",
                    color:theme.accent, cursor:"pointer", fontSize:12,
                  }}>›</button>
                )}
              </div>
            )}
          </div>

          <div style={{ position:"absolute", bottom:14, left:0, right:0, textAlign:"center", animation:"fadeUp 0.5s ease" }}>
            {view === "books" && <>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:18, color:"#f5a623", letterSpacing:"0.08em", textShadow:"0 0 30px rgba(245,166,35,0.5)" }}>✦ Holy Bible ✦</div>
              <div style={{ fontSize:11, color:"rgba(240,234,214,0.45)", marginTop:2, letterSpacing:"0.2em" }}>OLD &amp; NEW TESTAMENT</div>
            </>}
            {view === "chapters" && <>
              <div style={{ fontSize:11, color:theme.accent, letterSpacing:"0.2em", marginBottom:2, opacity:0.7 }}>{theme.icon} {theme.label.toUpperCase()}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:20, color:"#f0ead6", fontWeight:600, textShadow:`0 0 20px ${theme.accent}44` }}>{selectedBook?.name}</div>
            </>}
            {view === "reading" && (
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, color:theme.accent, letterSpacing:"0.1em", textShadow:`0 0 20px ${theme.accent}55` }}>
                {selectedBook?.name} · Chapter {selectedChapter}
                <span style={{ opacity:0.5, marginLeft:10, fontSize:11 }}>{verses.length} verses</span>
              </div>
            )}
          </div>
        </div>

        {selectedBook && view !== "books" && (
          <div style={{ height:2, flexShrink:0, background:`linear-gradient(to right, transparent, ${theme.accent}, transparent)`, opacity:0.6 }} />
        )}

        {/* Content */}
        <div ref={contentRef} style={{ flex:1, overflowY:"auto", padding:"16px", position:"relative",
          background:"linear-gradient(180deg, rgba(10,8,2,0) 0%, #080600 60px)" }}>

          {/* Context Menu */}
          <ContextMenu
            {...ctx}
            verseRef={verseRef(ctx.verseNum)}
            theme={theme}
            onAction={handleCtxAction}
            onClose={() => setCtx(c => ({ ...c, visible:false }))}
          />

          {/* BOOKS */}
          {view === "books" && (
            <div style={{ maxWidth:620, margin:"0 auto", animation:"fadeUp 0.35s ease" }}>
              <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                <div style={{ flex:1, position:"relative" }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"rgba(245,166,35,0.4)", fontSize:14, pointerEvents:"none" }}>🔍</span>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search books…"
                    style={{ width:"100%", padding:"10px 14px 10px 34px", borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(245,166,35,0.2)", color:"#f0ead6", fontSize:14, caretColor:"#f5a623", fontFamily:"'Lato',sans-serif" }} />
                </div>
                {["All","OT","NT"].map(t=>(
                  <button key={t} className="tab-btn" onClick={()=>setTestament(t)} style={{
                    padding:"10px 15px", borderRadius:12, cursor:"pointer",
                    border:`1px solid ${testament===t?"#f5a623":"rgba(245,166,35,0.15)"}`,
                    background:testament===t?"rgba(245,166,35,0.18)":"rgba(255,255,255,0.03)",
                    color:testament===t?"#f5a623":"rgba(240,234,214,0.4)",
                    fontSize:12, fontFamily:"'Cinzel',serif",
                  }}>{t}</button>
                ))}
              </div>
              {["Old Testament","New Testament"].map(section=>{
                const books = filteredBooks.filter(b=>section==="Old Testament"?BIBLE_BOOKS["Old Testament"].find(x=>x.name===b.name):BIBLE_BOOKS["New Testament"].find(x=>x.name===b.name));
                if(!books.length) return null;
                return (
                  <div key={section} style={{ marginBottom:28 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <div style={{ flex:1, height:1, background:"rgba(245,166,35,0.12)" }} />
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, color:"#f5a623", letterSpacing:"0.22em", opacity:0.65 }}>{section}</div>
                      <div style={{ flex:1, height:1, background:"rgba(245,166,35,0.12)" }} />
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
                      {books.map((book,idx)=>{
                        const bTheme=getTheme(book.name);
                        return (
                          <button key={book.name} className="book-card" onClick={()=>openBook(book)}
                            style={{ padding:"13px 14px", borderRadius:13, cursor:"pointer", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(245,166,35,0.13)", color:"#f0ead6", textAlign:"left", fontFamily:"'Lato',sans-serif", animation:`fadeUp 0.3s ease ${idx*0.02}s both`, position:"relative", overflow:"hidden" }}>
                            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:bTheme.accent, opacity:0.4, borderRadius:"13px 13px 0 0" }} />
                            <div style={{ fontSize:16, marginBottom:3 }}>{bTheme.icon}</div>
                            <div style={{ fontSize:13, fontWeight:400, marginBottom:3 }}>{book.name}</div>
                            <div style={{ fontSize:10, color:`${bTheme.accent}88` }}>{book.chapters} chapters</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CHAPTERS */}
          {view === "chapters" && selectedBook && (
            <div style={{ maxWidth:520, margin:"0 auto", animation:"fadeUp 0.35s ease" }}>
              <div style={{ background:`linear-gradient(135deg,${theme.accent}10,transparent)`, border:`1px solid ${theme.accent}22`, borderRadius:16, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ fontSize:32 }}>{theme.icon}</div>
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:16, color:"#f0ead6" }}>{selectedBook.name}</div>
                  <div style={{ fontSize:11, color:theme.accent, opacity:0.7, marginTop:2 }}>{theme.label} · {selectedBook.chapters} Chapters</div>
                </div>
              </div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:`${theme.accent}88`, letterSpacing:"0.18em", marginBottom:14, textAlign:"center" }}>Select a Chapter</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(54px,1fr))", gap:8 }}>
                {Array.from({ length:selectedBook.chapters },(_,i)=>i+1).map(ch=>(
                  <button key={ch} className="chapter-btn" onClick={()=>openChapter(ch)} style={{
                    padding:"13px 8px", borderRadius:10, cursor:"pointer",
                    background:"rgba(255,255,255,0.04)", border:`1px solid ${theme.accent}22`,
                    color:"#f0ead6", fontSize:15, fontFamily:"'Cinzel',serif",
                  }}>{ch}</button>
                ))}
              </div>
            </div>
          )}

          {/* READING */}
          {view === "reading" && (
            <div style={{ maxWidth:680, margin:"0 auto", animation:"fadeUp 0.35s ease" }}>
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:10, color:`${theme.accent}66`, fontSize:11, fontFamily:"'Cinzel',serif", letterSpacing:"0.2em" }}>
                  <div style={{ width:40, height:1, background:`${theme.accent}33` }} />
                  CHAPTER {selectedChapter}
                  <div style={{ width:40, height:1, background:`${theme.accent}33` }} />
                </div>
              </div>
              <div style={{ fontSize:11, color:"rgba(245,166,35,0.3)", textAlign:"center", marginBottom:16, fontFamily:"'Cinzel',serif", letterSpacing:"0.1em" }}>
                Double-tap a verse for options
              </div>

              {loading && (
                <div style={{ textAlign:"center", padding:"60px 0" }}>
                  <div style={{ fontSize:24, color:theme.accent, animation:"shimmer 1.5s ease infinite", marginBottom:12 }}>{theme.icon}</div>
                  <div style={{ fontSize:13, color:"rgba(240,234,214,0.35)", letterSpacing:"0.1em" }}>Loading scripture…</div>
                </div>
              )}
              {error && (
                <div style={{ textAlign:"center", padding:"36px 20px", borderRadius:14, background:"rgba(220,50,50,0.08)", border:"1px solid rgba(220,50,50,0.2)" }}>
                  <div style={{ color:"#ff6b6b", fontSize:14, marginBottom:12 }}>{error}</div>
                  <button onClick={()=>fetchChapter(selectedBook.name,selectedChapter)} style={{ padding:"8px 20px", borderRadius:10, border:`1px solid ${theme.accent}55`, background:`${theme.accent}18`, color:theme.accent, cursor:"pointer", fontSize:13 }}>Try Again</button>
                </div>
              )}

              {!loading && !error && verses.map((v,idx)=>{
                let lastTap = 0;
                return (
                  <div key={v.verse}
                    className={`verse-row${highlightedVerses.has(v.verse)?" hl":""}`}
                    onDoubleClick={e => openCtx(e, v.verse, v.text)}
                    onClick={e => {
                      const now = Date.now();
                      if (now - lastTap < 350) openCtx(e, v.verse, v.text);
                      lastTap = now;
                    }}
                    style={{
                      "--accent": theme.accent,
                      display:"flex", gap:14,
                      padding:"10px 14px 10px 14px",
                      borderRadius:8, cursor:"pointer", marginBottom:1,
                      borderLeft:"3px solid transparent",
                      animation:`slideIn 0.2s ease ${Math.min(idx,20)*0.015}s both`,
                    }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, color:theme.accent, minWidth:22, paddingTop:4, opacity:0.6, flexShrink:0 }}>{v.verse}</span>
                    <span style={{ fontFamily:"'EB Garamond',serif", fontSize:fontSize, lineHeight:1.85, color:"#f0ead6", letterSpacing:"0.01em" }}>{v.text}</span>
                  </div>
                );
              })}

              {!loading && verses.length > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:36, paddingTop:20, borderTop:`1px solid ${theme.accent}18`, paddingBottom:20 }}>
                  {selectedChapter > 1 ? (
                    <button onClick={()=>openChapter(selectedChapter-1)} style={{ padding:"10px 20px", borderRadius:10, cursor:"pointer", border:`1px solid ${theme.accent}33`, background:`${theme.accent}0e`, color:theme.accent, fontSize:13, fontFamily:"'Cinzel',serif" }}>← {selectedChapter-1}</button>
                  ) : <div />}
                  {selectedChapter < selectedBook?.chapters ? (
                    <button onClick={()=>openChapter(selectedChapter+1)} style={{ padding:"10px 20px", borderRadius:10, cursor:"pointer", border:`1px solid ${theme.accent}33`, background:`${theme.accent}0e`, color:theme.accent, fontSize:13, fontFamily:"'Cinzel',serif" }}>{selectedChapter+1} →</button>
                  ) : <div />}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShareSheet
        isOpen={shareOpen}
        onClose={()=>setShareOpen(false)}
        verseRef={noteVerse.ref}
        verseText={noteVerse.text}
        accent={theme.accent}
      />
      <NotepadModal
        isOpen={noteOpen}
        onClose={()=>setNoteOpen(false)}
        verseRef={noteVerse.ref}
        verseText={noteVerse.text}
      />
      <Toast msg={toastMsg} />
    </>
  );
}
