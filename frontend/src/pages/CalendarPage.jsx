import { useState, useEffect, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL; // your existing server port

// Get JWT token from localStorage (set during login)
function getToken() { 
  return localStorage.getItem("token") || ""; 
}

// ─── API helpers ──────────────────────────────────────────────────────────────
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

async function fetchMonthEntries(year, month) {
  const res = await fetch(`${API_BASE}/api/calendar?year=${year}&month=${month + 1}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}
async function fetchAllEntries() {
  const res = await fetch(`${API_BASE}/api/calendar/all`, { headers: authHeaders() });
  if (!res.ok) throw new Error("fetch all failed");
  return res.json();
}
async function saveEntry(dateKey, payload) {
  const res = await fetch(`${API_BASE}/api/calendar/${dateKey}`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("save failed");
  return res.json();
}

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#0f0e0c",surface:"#1a1915",card:"#221f1a",border:"#2e2b24",
  gold:"#c8922a",goldLight:"#e8b04a",goldDim:"#c8922a33",
  teal:"#3fad87",tealDim:"#3fad8722",purple:"#8b7fd4",purpleDim:"#8b7fd422",
  text:"#f0ead8",textMuted:"#8a826e",textFaint:"#4a4438",flame:"#e05c2a",
};
const ACTIVITIES = ["Reading","Prayer","Journaling","Worship","Fasting"];
const WEEKDAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function dayKey(y,m,d){ return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
function todayObj(){ const t=new Date(); return {y:t.getFullYear(),m:t.getMonth(),d:t.getDate()}; }
function isToday(y,m,d){ const t=todayObj(); return y===t.y&&m===t.m&&d===t.d; }
function isFuture(y,m,d){ const t=todayObj(); return new Date(y,m,d)>new Date(t.y,t.m,t.d); }
function entryScore(e){ if(!e)return 0; return (e.time>0?1:0)+(e.verses>0?1:0)+((e.acts?.length||0)>0?1:0); }
function entryPct(e){ if(!e)return 0; return Math.min(Math.round((Math.min(e.time||0,60)/60)*50+(Math.min(e.verses||0,30)/30)*50),100); }

function Ring({pct,color,size=44,sw=2.5}){
  const r=(size-sw*2)/2,c=2*Math.PI*r,off=c-(pct/100)*c;
  return(
    <svg width={size} height={size} style={{position:"absolute",top:0,left:0}}>
      <circle cx={size/2} cy={size/2} r={r} stroke={T.border} strokeWidth={sw} fill="none"/>
      {pct>0&&<circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={sw} fill="none"
        strokeDasharray={c.toFixed(2)} strokeDashoffset={off.toFixed(2)} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dashoffset 0.4s ease"}}/>}
    </svg>
  );
}

function StatCard({label,value,sub,accent,loading}){
  return(
    <div style={{background:T.card,borderRadius:14,border:`1px solid ${T.border}`,padding:"14px 16px",flex:1,minWidth:0}}>
      <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{label}</div>
      <div style={{fontSize:26,fontWeight:700,color:loading?T.textFaint:(accent||T.text),fontFamily:"'Georgia',serif",lineHeight:1}}>{loading?"…":value}</div>
      {sub&&<div style={{fontSize:10,color:T.textFaint,marginTop:4}}>{sub}</div>}
    </div>
  );
}

function Modal({dateLabel,isFutureDay,entry,onSave,onClose,saving}){
  const [time,setTime]=useState(entry?.time||0);
  const [verses,setVerses]=useState(entry?.verses||0);
  const [acts,setActs]=useState(entry?.acts||[]);
  const [notes,setNotes]=useState(entry?.notes||"");
  const toggle=a=>setActs(p=>p.includes(a)?p.filter(x=>x!==a):[...p,a]);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:20,padding:"24px",width:320,maxWidth:"92vw",boxShadow:"0 24px 48px rgba(0,0,0,0.6)",animation:"slideUp 0.2s ease"}}>
        <style>{`@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:11,color:T.gold,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{isFutureDay?"Plan ahead":"Log session"}</div>
            <div style={{fontSize:16,fontWeight:600,color:T.text}}>{dateLabel}</div>
          </div>
          <button onClick={onClose} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,width:30,height:30,color:T.textMuted,cursor:"pointer",fontSize:14}}>✕</button>
        </div>
        {[{label:"Minutes spent",val:time,set:setTime,max:120,step:5,unit:"m"},{label:"Verses read",val:verses,set:setVerses,max:50,step:1,unit:""}].map(({label,val,set,max,step,unit})=>(
          <div key={label} style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:11,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</span>
              <span style={{fontSize:13,fontWeight:600,color:T.gold}}>{val}{unit}</span>
            </div>
            <input type="range" min={0} max={max} step={step} value={val} onChange={e=>set(+e.target.value)} style={{width:"100%",accentColor:T.gold}}/>
          </div>
        ))}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Activities</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {ACTIVITIES.map(a=>(
              <button key={a} onClick={()=>toggle(a)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,cursor:"pointer",fontWeight:500,border:`1px solid ${acts.includes(a)?T.gold:T.border}`,background:acts.includes(a)?T.goldDim:"transparent",color:acts.includes(a)?T.goldLight:T.textMuted,transition:"all 0.15s"}}>{a}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Notes / tasks</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={isFutureDay?"Plan your session...":"Reflection or notes..."} rows={2}
            style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",fontSize:13,color:T.text,resize:"none",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{padding:"9px 16px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:10,color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>onSave({time,verses,acts,notes})} disabled={saving}
            style={{flex:1,padding:"9px",background:saving?T.border:T.gold,border:"none",borderRadius:10,color:saving?T.textMuted:"#1a1200",fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer"}}>
            {saving?"Saving…":"Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DayCell({day,entry,isTodayDay,isFutureDay,onClick}){
  const score=entryScore(entry),pct=entryPct(entry);
  const planned=isFutureDay&&entry&&(entry.notes||entry.acts?.length);
  const has=!isFutureDay&&score>0;
  const SIZE=44;
  let ring="transparent",bg="transparent";
  if(has&&score>=2){ring=T.teal;bg=T.tealDim;}
  else if(has){ring=T.gold;bg=T.goldDim;}
  else if(planned){ring=T.purple;bg=T.purpleDim;}
  return(
    <div onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}>
      <div style={{position:"relative",width:SIZE,height:SIZE}}>
        {isTodayDay&&<div style={{position:"absolute",inset:3,borderRadius:"50%",background:T.goldDim,border:`1.5px solid ${T.gold}`}}/>}
        {(has||planned)&&<div style={{position:"absolute",inset:4,borderRadius:"50%",background:bg}}/>}
        <Ring pct={pct>0?pct:(planned?30:0)} color={ring} size={SIZE}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:isTodayDay?700:500,color:isFutureDay&&!planned?T.textFaint:(isTodayDay?T.gold:T.text)}}>{day}</div>
      </div>
      {entry?.notes&&<div style={{width:3,height:3,borderRadius:"50%",background:T.gold,opacity:0.7}}/>}
    </div>
  );
}

export default function BibleCalendar(){
  const [data,setData]=useState({});
  const [allData,setAllData]=useState({});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState(null);
  const [viewYear,setViewYear]=useState(()=>new Date().getFullYear());
  const [viewMonth,setViewMonth]=useState(()=>new Date().getMonth());
  const [modal,setModal]=useState(null);

useEffect(() => {
  const token = getToken();
  if (!token) { 
    setError("Please log in first."); 
    setLoading(false); 
    return; 
  }
  setLoading(true); 
  setError(null);
  fetchMonthEntries(viewYear, viewMonth)
    .then(d => { setData(d); setLoading(false); })
    .catch(() => { setError("Server se connect nahi ho paya."); setLoading(false); });
}, [viewYear, viewMonth]);

  useEffect(()=>{ if(getToken()) fetchAllEntries().then(setAllData).catch(()=>{}); },[]);

  const handleSave=async payload=>{
    setSaving(true);
    try{
      await saveEntry(modal.key,payload);
      setData(p=>({...p,[modal.key]:payload}));
      setAllData(p=>({...p,[modal.key]:payload}));
      setModal(null);
    }catch{ alert("Save failed. Server check karo."); }
    finally{ setSaving(false); }
  };

  const calcStreak=useCallback(()=>{
    let s=0; const t=todayObj(); const d=new Date(t.y,t.m,t.d);
    while(true){const k=dayKey(d.getFullYear(),d.getMonth(),d.getDate());const e=allData[k];if(e&&entryScore(e)>0){s++;d.setDate(d.getDate()-1);}else break;}
    return s;
  },[allData]);

  const monthStats=useCallback(()=>{
    const dim=new Date(viewYear,viewMonth+1,0).getDate(); let done=0,totalTime=0,timeDays=0;
    for(let d=1;d<=dim;d++){const e=data[dayKey(viewYear,viewMonth,d)];if(e&&entryScore(e)>0){done++;if(e.time>0){totalTime+=e.time;timeDays++;}}}
    return{done,avg:timeDays>0?Math.round(totalTime/timeDays):0};
  },[data,viewYear,viewMonth]);

  const prevMonth=()=>setViewMonth(m=>{if(m===0){setViewYear(y=>y-1);return 11;}return m-1;});
  const nextMonth=()=>setViewMonth(m=>{if(m===11){setViewYear(y=>y+1);return 0;}return m+1;});

  const firstDay=new Date(viewYear,viewMonth,1).getDay();
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const streak=calcStreak();const{done,avg}=monthStats();
  const t=todayObj();const isCurrent=viewYear===t.y&&viewMonth===t.m;

  return(
    <div style={{background:T.bg,minHeight:"100vh",padding:"24px 16px",fontFamily:"'Trebuchet MS',sans-serif",color:T.text}}>
      <style>{`*{box-sizing:border-box}input[type=range]{-webkit-appearance:none;height:4px;border-radius:4px;background:#2e2b24}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#c8922a;cursor:pointer}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{maxWidth:420,margin:"0 auto"}}>
        <div style={{marginBottom:24,animation:"fadeIn 0.3s ease"}}>
          <div style={{fontSize:11,color:T.gold,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Daily Devotion · Bible AI</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <h1 style={{fontSize:28,fontWeight:700,fontFamily:"'Georgia',serif",color:T.text,margin:0}}>{MONTHS[viewMonth]} {viewYear}</h1>
            {streak>0&&<div style={{display:"flex",alignItems:"center",gap:6,background:`${T.flame}22`,border:`1px solid ${T.flame}44`,borderRadius:20,padding:"5px 12px"}}><span style={{fontSize:14}}>🔥</span><span style={{fontSize:13,fontWeight:700,color:T.flame}}>{streak} day{streak!==1?"s":""}</span></div>}
          </div>
        </div>
        {error&&<div style={{background:"#e05c2a22",border:"1px solid #e05c2a44",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:T.flame}}>⚠ {error}</div>}
        <div style={{display:"flex",gap:10,marginBottom:24}}>
          <StatCard label="Streak" value={streak} sub="days in a row" accent={streak>0?T.flame:undefined} loading={loading}/>
          <StatCard label="This month" value={done} sub="days logged" accent={done>0?T.teal:undefined} loading={loading}/>
          <StatCard label="Avg time" value={avg>0?`${avg}m`:"—"} sub="per session" accent={avg>0?T.gold:undefined} loading={loading}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <button onClick={prevMonth} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,color:T.textMuted,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <button onClick={()=>{setViewYear(t.y);setViewMonth(t.m);}} style={{background:isCurrent?T.goldDim:"transparent",border:`1px solid ${isCurrent?T.gold:T.border}`,borderRadius:8,padding:"4px 12px",fontSize:11,color:isCurrent?T.gold:T.textMuted,cursor:"pointer"}}>Today</button>
          <button onClick={nextMonth} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,color:T.textMuted,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",textAlign:"center",marginBottom:10}}>
          {WEEKDAYS.map(w=><div key={w} style={{fontSize:10,color:T.textFaint,fontWeight:600,letterSpacing:"0.06em"}}>{w}</div>)}
        </div>
        {loading?(
          <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}>
            <div style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${T.border}`,borderTopColor:T.gold,animation:"spin 0.7s linear infinite"}}/>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"8px 4px"}}>
            {Array.from({length:firstDay}).map((_,i)=><div key={`b-${i}`}/>)}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const d=i+1,k=dayKey(viewYear,viewMonth,d);
              return <DayCell key={d} day={d} entry={data[k]} isTodayDay={isToday(viewYear,viewMonth,d)} isFutureDay={isFuture(viewYear,viewMonth,d)} onClick={()=>setModal({day:d,key:k,isFuture:isFuture(viewYear,viewMonth,d)})}/>;
            })}
          </div>
        )}
        <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:20,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
          {[{color:T.gold,label:"Completed"},{color:T.teal,label:"Bonus (2+ acts)"},{color:T.purple,label:"Planned"},{color:T.flame,label:"Streak"}].map(({color,label})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:color}}/>
              <span style={{fontSize:10,color:T.textMuted}}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:10,fontSize:10,color:T.textFaint,textAlign:"center"}}>Data aapke MongoDB account mein save ho raha hai</div>
      </div>
      {modal&&<Modal dateLabel={new Date(viewYear,viewMonth,modal.day).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric"})} isFutureDay={modal.isFuture} entry={data[modal.key]} onSave={handleSave} onClose={()=>setModal(null)} saving={saving}/>}
    </div>
  );
}