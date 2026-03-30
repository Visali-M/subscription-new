import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

/* ── App URLs for direct redirect ─────────────────────────── */
const APP_URLS = {
  "Netflix":               "https://www.netflix.com",
  "Amazon Prime Video":    "https://www.primevideo.com",
  "Disney+ Hotstar":       "https://www.hotstar.com",
  "Sony LIV":              "https://www.sonyliv.com",
  "Zee5":                  "https://www.zee5.com",
  "Apple TV+":             "https://tv.apple.com",
  "MX Player Pro":         "https://www.mxplayer.in",
  "Voot Select":           "https://www.voot.com",
  "ALTBalaji":             "https://www.altbalaji.com",
  "JioCinema Premium":     "https://www.jiocinema.com",
  "Mubi":                  "https://mubi.com",
  "Eros Now":              "https://erosnow.com",
  "YouTube Premium":       "https://www.youtube.com/premium",
  "Spotify":               "https://www.spotify.com",
  "Apple Music":           "https://music.apple.com",
  "YouTube Music":         "https://music.youtube.com",
  "Amazon Music Unlimited":"https://music.amazon.com",
  "JioSaavn Pro":          "https://www.jiosaavn.com",
  "Gaana Plus":            "https://gaana.com",
  "Wynk Music":            "https://wynk.in",
  "Hungama Music":         "https://www.hungama.com",
  "Tidal":                 "https://tidal.com",
  "Deezer":                "https://www.deezer.com",
  "Coursera Plus":         "https://www.coursera.org",
  "Udemy Personal Plan":   "https://www.udemy.com",
  "Duolingo Super":        "https://www.duolingo.com",
  "Unacademy":             "https://unacademy.com",
  "LinkedIn Learning":     "https://www.linkedin.com/learning",
  "Skillshare":            "https://www.skillshare.com",
  "Byju's":                "https://byjus.com",
  "Khan Academy":          "https://www.khanacademy.org",
  "Brilliant":             "https://brilliant.org",
  "MasterClass":           "https://www.masterclass.com",
  "edX":                   "https://www.edx.org",
  "Vedantu":               "https://www.vedantu.com",
  "Adobe Creative Cloud":  "https://www.adobe.com/creativecloud.html",
  "Microsoft 365":         "https://www.microsoft.com/microsoft-365",
  "Figma":                 "https://www.figma.com",
  "GitHub":                "https://github.com",
  "Notion":                "https://www.notion.so",
  "Slack":                 "https://slack.com",
  "Zoom":                  "https://zoom.us",
  "JetBrains All Products":"https://www.jetbrains.com",
  "Webflow":               "https://webflow.com",
  "Framer":                "https://www.framer.com",
  "Sketch":                "https://www.sketch.com",
  "Canva Pro":             "https://www.canva.com",
  "Loom":                  "https://www.loom.com",
  "Linear":                "https://linear.app",
  "Jira":                  "https://www.atlassian.com/software/jira",
  "Google One":            "https://one.google.com",
  "Dropbox":               "https://www.dropbox.com",
  "Grammarly":             "https://www.grammarly.com",
  "Todoist":               "https://todoist.com",
  "Notion AI":             "https://www.notion.so",
  "Evernote":              "https://evernote.com",
  "1Password":             "https://1password.com",
  "LastPass":              "https://www.lastpass.com",
  "Dashlane":              "https://www.dashlane.com",
  "Trello":                "https://trello.com",
  "Asana":                 "https://asana.com",
  "Monday.com":            "https://monday.com",
  "ClickUp":               "https://clickup.com",
  "Zapier":                "https://zapier.com",
  "Airtable":              "https://airtable.com",
  "Xbox Game Pass Ultimate":"https://www.xbox.com/xbox-game-pass",
  "PlayStation Plus":      "https://www.playstation.com/playstation-plus",
  "Nintendo Switch Online": "https://www.nintendo.com/switch/online",
  "EA Play":               "https://www.ea.com/ea-play",
  "Ubisoft+":              "https://store.ubisoft.com/uplus",
  "GeForce NOW":           "https://www.nvidia.com/geforce-now",
  "Cult.fit":              "https://www.cult.fit",
  "Fitbit Premium":        "https://www.fitbit.com/premium",
  "Headspace":             "https://www.headspace.com",
  "Calm":                  "https://www.calm.com",
  "Nike Training Club":    "https://www.nike.com/ntc-app",
  "HealthifyMe":           "https://www.healthifyme.com",
  "Practo Plus":           "https://www.practo.com",
  "The Hindu":             "https://www.thehindu.com",
  "Times of India":        "https://timesofindia.indiatimes.com",
  "Economic Times":        "https://economictimes.indiatimes.com",
  "Indian Express":        "https://indianexpress.com",
  "The New York Times":    "https://www.nytimes.com",
  "The Economist":         "https://www.economist.com",
  "Bloomberg":             "https://www.bloomberg.com",
};

/* ── Subscription catalog ─────────────────────────────────── */
const CATALOG = {
  Entertainment: { icon:"🎬", color:"#7c3aed", services: {
    "Netflix":              { icon:"🎥", plans:[{name:"Mobile",amount:149},{name:"Basic",amount:199},{name:"Standard",amount:499},{name:"Premium",amount:649}] },
    "Amazon Prime Video":   { icon:"📦", plans:[{name:"Monthly",amount:299},{name:"Annual",amount:1499}] },
    "Disney+ Hotstar":      { icon:"⭐", plans:[{name:"Mobile",amount:149},{name:"Super",amount:299},{name:"Premium",amount:499}] },
    "Sony LIV":             { icon:"📺", plans:[{name:"Basic",amount:99},{name:"Premium",amount:299},{name:"Premium Annual",amount:999}] },
    "Zee5":                 { icon:"🎞️", plans:[{name:"Monthly",amount:99},{name:"Annual",amount:999}] },
    "Apple TV+":            { icon:"🍎", plans:[{name:"Monthly",amount:99}] },
    "MX Player Pro":        { icon:"▶️", plans:[{name:"Monthly",amount:99},{name:"Annual",amount:699}] },
    "Voot Select":          { icon:"📱", plans:[{name:"Monthly",amount:99},{name:"Annual",amount:699}] },
    "ALTBalaji":            { icon:"🎭", plans:[{name:"Quarterly",amount:100},{name:"Annual",amount:300}] },
    "JioCinema Premium":    { icon:"🎪", plans:[{name:"Monthly",amount:29},{name:"Annual",amount:299}] },
    "Mubi":                 { icon:"🎬", plans:[{name:"Monthly",amount:199},{name:"Annual",amount:999}] },
    "Eros Now":             { icon:"🌟", plans:[{name:"Monthly",amount:49},{name:"Annual",amount:399}] },
    "YouTube Premium":      { icon:"▶️", plans:[{name:"Individual",amount:129},{name:"Family",amount:189}] },
    "Other":                { icon:"📡", plans:[{name:"Custom",amount:0}] },
  }},
  Music: { icon:"🎵", color:"#ec4899", services: {
    "Spotify":              { icon:"💚", plans:[{name:"Mini",amount:7},{name:"Individual",amount:119},{name:"Duo",amount:149},{name:"Family",amount:179}] },
    "Apple Music":          { icon:"🍎", plans:[{name:"Individual",amount:99},{name:"Student",amount:49},{name:"Family",amount:149}] },
    "YouTube Music":        { icon:"▶️", plans:[{name:"Individual",amount:99},{name:"Family",amount:149}] },
    "Amazon Music Unlimited":{ icon:"📦", plans:[{name:"Individual",amount:99},{name:"Family",amount:149}] },
    "JioSaavn Pro":         { icon:"🎸", plans:[{name:"Monthly",amount:99},{name:"Annual",amount:699}] },
    "Gaana Plus":           { icon:"🎶", plans:[{name:"Monthly",amount:49},{name:"Annual",amount:299}] },
    "Wynk Music":           { icon:"🎵", plans:[{name:"Monthly",amount:49},{name:"Annual",amount:399}] },
    "Hungama Music":        { icon:"🎤", plans:[{name:"Monthly",amount:49},{name:"Annual",amount:299}] },
    "Tidal":                { icon:"🌊", plans:[{name:"Individual",amount:199},{name:"Family",amount:299}] },
    "Deezer":               { icon:"🎧", plans:[{name:"Premium",amount:149},{name:"Family",amount:199}] },
    "Other":                { icon:"🎧", plans:[{name:"Custom",amount:0}] },
  }},
  Education: { icon:"📚", color:"#10b981", services: {
    "Coursera Plus":        { icon:"🎓", plans:[{name:"Monthly",amount:3150},{name:"Annual",amount:25000}] },
    "Udemy Personal Plan":  { icon:"🧑‍💻", plans:[{name:"Monthly",amount:850},{name:"Annual",amount:5000}] },
    "Duolingo Super":       { icon:"🦜", plans:[{name:"Monthly",amount:350},{name:"Annual",amount:1750}] },
    "Unacademy":            { icon:"📖", plans:[{name:"Pro Monthly",amount:1999},{name:"Pro Annual",amount:9999}] },
    "LinkedIn Learning":    { icon:"💼", plans:[{name:"Monthly",amount:1699},{name:"Annual",amount:9999}] },
    "Skillshare":           { icon:"✏️", plans:[{name:"Monthly",amount:1650},{name:"Annual",amount:9000}] },
    "Byju's":               { icon:"🏫", plans:[{name:"Annual",amount:12000}] },
    "Khan Academy":         { icon:"📐", plans:[{name:"Free",amount:0}] },
    "Brilliant":            { icon:"💡", plans:[{name:"Monthly",amount:1200},{name:"Annual",amount:9999}] },
    "MasterClass":          { icon:"🎬", plans:[{name:"Individual",amount:1500},{name:"Duo",amount:2000},{name:"Family",amount:2500}] },
    "edX":                  { icon:"🎯", plans:[{name:"Monthly",amount:1499},{name:"Annual",amount:14999}] },
    "Vedantu":              { icon:"📝", plans:[{name:"Monthly",amount:999},{name:"Annual",amount:7999}] },
    "Other":                { icon:"🏫", plans:[{name:"Custom",amount:0}] },
  }},
  Software: { icon:"💻", color:"#3b82f6", services: {
    "Adobe Creative Cloud": { icon:"🎨", plans:[{name:"Photography",amount:676},{name:"Single App",amount:1675},{name:"All Apps",amount:4230}] },
    "Microsoft 365":        { icon:"🪟", plans:[{name:"Personal",amount:520},{name:"Family",amount:720}] },
    "Figma":                { icon:"🖌️", plans:[{name:"Starter",amount:0},{name:"Professional",amount:1200},{name:"Organization",amount:4500}] },
    "GitHub":               { icon:"🐙", plans:[{name:"Free",amount:0},{name:"Pro",amount:375},{name:"Team",amount:750}] },
    "Notion":               { icon:"◻️", plans:[{name:"Free",amount:0},{name:"Plus",amount:660},{name:"Business",amount:1500}] },
    "Slack":                { icon:"💬", plans:[{name:"Free",amount:0},{name:"Pro",amount:750},{name:"Business+",amount:1440}] },
    "Zoom":                 { icon:"📹", plans:[{name:"Basic",amount:0},{name:"Pro",amount:1150},{name:"Business",amount:1650}] },
    "JetBrains All Products":{ icon:"⚙️", plans:[{name:"Monthly",amount:2000},{name:"Annual",amount:15000}] },
    "Webflow":              { icon:"🌐", plans:[{name:"Basic",amount:1200},{name:"CMS",amount:2400},{name:"Business",amount:7000}] },
    "Framer":               { icon:"🎯", plans:[{name:"Mini",amount:400},{name:"Basic",amount:800},{name:"Pro",amount:1600}] },
    "Canva Pro":            { icon:"🎨", plans:[{name:"Monthly",amount:499},{name:"Annual",amount:3999}] },
    "Loom":                 { icon:"🎥", plans:[{name:"Starter",amount:0},{name:"Business",amount:750}] },
    "Linear":               { icon:"📋", plans:[{name:"Free",amount:0},{name:"Standard",amount:670},{name:"Plus",amount:1100}] },
    "Jira":                 { icon:"📊", plans:[{name:"Free",amount:0},{name:"Standard",amount:580},{name:"Premium",amount:1150}] },
    "Other":                { icon:"⚙️", plans:[{name:"Custom",amount:0}] },
  }},
  Productivity: { icon:"⚡", color:"#f59e0b", services: {
    "Google One":           { icon:"☁️", plans:[{name:"100 GB",amount:130},{name:"200 GB",amount:210},{name:"2 TB",amount:650}] },
    "Dropbox":              { icon:"📁", plans:[{name:"Plus",amount:999},{name:"Professional",amount:1650}] },
    "Grammarly":            { icon:"✍️", plans:[{name:"Free",amount:0},{name:"Premium",amount:1400}] },
    "Todoist":              { icon:"✅", plans:[{name:"Free",amount:0},{name:"Pro",amount:400},{name:"Business",amount:600}] },
    "Notion AI":            { icon:"🤖", plans:[{name:"Add-on",amount:830}] },
    "Evernote":             { icon:"🗒️", plans:[{name:"Free",amount:0},{name:"Personal",amount:499},{name:"Professional",amount:749}] },
    "1Password":            { icon:"🔐", plans:[{name:"Individual",amount:250},{name:"Families",amount:420}] },
    "LastPass":             { icon:"🔑", plans:[{name:"Free",amount:0},{name:"Premium",amount:290}] },
    "Trello":               { icon:"📌", plans:[{name:"Free",amount:0},{name:"Standard",amount:420},{name:"Premium",amount:840}] },
    "Asana":                { icon:"📋", plans:[{name:"Personal",amount:0},{name:"Starter",amount:830},{name:"Advanced",amount:1670}] },
    "Monday.com":           { icon:"📅", plans:[{name:"Basic",amount:670},{name:"Standard",amount:1000},{name:"Pro",amount:1500}] },
    "ClickUp":              { icon:"🎯", plans:[{name:"Free",amount:0},{name:"Unlimited",amount:420},{name:"Business",amount:840}] },
    "Zapier":               { icon:"⚡", plans:[{name:"Free",amount:0},{name:"Starter",amount:1400}] },
    "Airtable":             { icon:"🗃️", plans:[{name:"Free",amount:0},{name:"Plus",amount:800},{name:"Pro",amount:1400}] },
    "Other":                { icon:"🗂️", plans:[{name:"Custom",amount:0}] },
  }},
  Gaming: { icon:"🎮", color:"#f97316", services: {
    "Xbox Game Pass Ultimate":{ icon:"🎮", plans:[{name:"Monthly",amount:699}] },
    "PlayStation Plus":     { icon:"🎯", plans:[{name:"Essential",amount:499},{name:"Extra",amount:749},{name:"Premium",amount:999}] },
    "Nintendo Switch Online":{ icon:"🕹️", plans:[{name:"Individual",amount:150},{name:"Family",amount:270}] },
    "EA Play":              { icon:"🏆", plans:[{name:"Monthly",amount:299},{name:"Annual",amount:1799}] },
    "Ubisoft+":             { icon:"🎲", plans:[{name:"Monthly",amount:999}] },
    "GeForce NOW":          { icon:"⚡", plans:[{name:"Priority",amount:999},{name:"Ultimate",amount:1999}] },
    "Other":                { icon:"🎮", plans:[{name:"Custom",amount:0}] },
  }},
  Health: { icon:"💪", color:"#22c55e", services: {
    "Cult.fit":             { icon:"💪", plans:[{name:"Lite Monthly",amount:999},{name:"Pro Monthly",amount:1799},{name:"Pro Annual",amount:9999}] },
    "Fitbit Premium":       { icon:"⌚", plans:[{name:"Monthly",amount:599},{name:"Annual",amount:3999}] },
    "Headspace":            { icon:"🧘", plans:[{name:"Monthly",amount:649},{name:"Annual",amount:4299}] },
    "Calm":                 { icon:"🌊", plans:[{name:"Monthly",amount:499},{name:"Annual",amount:2999}] },
    "HealthifyMe":          { icon:"🥗", plans:[{name:"Pro Monthly",amount:999},{name:"Pro Annual",amount:5999}] },
    "Practo Plus":          { icon:"🏥", plans:[{name:"Monthly",amount:99},{name:"Annual",amount:999}] },
    "Nike Training Club":   { icon:"👟", plans:[{name:"Free",amount:0}] },
    "Other":                { icon:"💊", plans:[{name:"Custom",amount:0}] },
  }},
  News: { icon:"📰", color:"#64748b", services: {
    "The Hindu":            { icon:"📰", plans:[{name:"Digital Monthly",amount:299},{name:"Digital Annual",amount:2499}] },
    "Times of India":       { icon:"📋", plans:[{name:"Digital",amount:99},{name:"Premium",amount:199}] },
    "Economic Times":       { icon:"💹", plans:[{name:"Monthly",amount:299},{name:"Annual",amount:1999}] },
    "Indian Express":       { icon:"📄", plans:[{name:"Monthly",amount:99},{name:"Annual",amount:999}] },
    "The New York Times":   { icon:"🗞️", plans:[{name:"Basic",amount:499},{name:"All Access",amount:999}] },
    "The Economist":        { icon:"📊", plans:[{name:"Digital",amount:1500}] },
    "Bloomberg":            { icon:"💰", plans:[{name:"Digital",amount:2000}] },
    "Other":                { icon:"📰", plans:[{name:"Custom",amount:0}] },
  }},
  Other: { icon:"📦", color:"#9c93b8", services: {
    "Other":                { icon:"📦", plans:[{name:"Custom",amount:0}] },
  }},
};

const BILLING_CYCLES = ["Monthly","Annual","Weekly","Quarterly","Biannual"];

/* ── Searchable Dropdown ─────────────────────────────────── */
function Dropdown({ options, value, onChange, placeholder, disabled }) {
  const [open, setOpen]   = useState(false);
  const [q,    setQ]      = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
  const sel = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position:"relative", width:"100%" }}>
      <div onClick={() => { if (!disabled) { setOpen(o=>!o); setQ(""); } }}
        style={{
          height:46, padding:"0 14px", borderRadius:10,
          border:`1.5px solid ${open ? "#7c3aed" : "var(--border)"}`,
          background: disabled ? "var(--surface3)" : "var(--surface2)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: open ? "0 0 0 3px rgba(124,58,237,0.12)" : "none",
          transition:"0.15s", userSelect:"none", opacity: disabled ? 0.5 : 1,
          boxSizing:"border-box",
        }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, minWidth:0, flex:1, overflow:"hidden" }}>
          {sel?.icon && <span style={{ fontSize:18, flexShrink:0 }}>{sel.icon}</span>}
          <span style={{ fontSize:13, fontWeight: sel ? 600 : 400, color: sel ? "var(--text1)" : "var(--text3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {sel ? sel.label : placeholder}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition:"0.2s", flexShrink:0, marginLeft:6 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:9999,
          background:"var(--surface)", border:"1px solid var(--border2)",
          borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,0.18)", overflow:"hidden",
        }}>
          <div style={{ padding:"10px 12px", borderBottom:"1px solid var(--border)" }}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              onClick={e => e.stopPropagation()}
              placeholder="Search…"
              style={{ width:"100%", height:36, background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, padding:"0 12px", fontSize:13, fontFamily:"var(--font)", color:"var(--text1)", outline:"none", boxSizing:"border-box" }}
            />
          </div>
          <div style={{ maxHeight:260, overflowY:"auto" }}>
            {filtered.length === 0
              ? <div style={{ padding:"14px 16px", fontSize:13, color:"var(--text3)" }}>No results</div>
              : filtered.map(o => (
                <div key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); setQ(""); }}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", cursor:"pointer", background: o.value===value ? "var(--accent-bg)" : "transparent", transition:"0.1s" }}
                  onMouseEnter={e => { if (o.value!==value) e.currentTarget.style.background="var(--surface2)"; }}
                  onMouseLeave={e => { if (o.value!==value) e.currentTarget.style.background="transparent"; }}
                >
                  {o.icon && <span style={{ fontSize:20, flexShrink:0 }}>{o.icon}</span>}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color: o.value===value ? "var(--accent)" : "var(--text1)" }}>{o.label}</div>
                    {o.sub && <div style={{ fontSize:11, color:"var(--text3)", marginTop:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{o.sub}</div>}
                  </div>
                  {o.value===value && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function AddSubscription() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category:"", service:"", planDescription:"", customName:"",
    billingCycle:"Monthly", amount:"", renewalDate:"",
    notes:"", tags:"", autopay:true, isTrial:false, trialEndsOn:"",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const catOptions = Object.entries(CATALOG).map(([k,v]) => ({
    value:k, label:k, icon:v.icon,
    sub: Object.keys(v.services).filter(s=>s!=="Other").slice(0,3).join(", "),
  }));
  const svcOptions = form.category
    ? Object.entries(CATALOG[form.category]?.services||{}).map(([k,v]) => ({
        value:k, label:k, icon:v.icon,
        sub: v.plans.map(p=>p.name).join(", "),
      }))
    : [];
  const planOptions = (form.category && form.service)
    ? (CATALOG[form.category]?.services[form.service]?.plans||[]).map(p => ({
        value:p.name, label:p.name, sub: p.amount>0 ? `₹${p.amount.toLocaleString("en-IN")}` : "Free", amount:p.amount,
      }))
    : [];

  const onCat = val => setForm(p=>({...p, category:val, service:"", planDescription:"", customName:"", amount:""}));
  const onSvc = val => setForm(p=>({...p, service:val, planDescription:"", amount:""}));
  const onPlan= val => {
    const p = planOptions.find(x=>x.value===val);
    setForm(f=>({...f, planDescription:val, amount: p ? String(p.amount) : ""}));
  };

  const finalName = form.service==="Other" ? form.customName : form.service;
  const appUrl = APP_URLS[form.service] || "";
  const catColor = form.category ? CATALOG[form.category]?.color : "var(--accent)";
  const svcIcon  = form.service ? CATALOG[form.category]?.services[form.service]?.icon : form.category ? CATALOG[form.category]?.icon : "📦";

  const calcMonthly = () => {
    const a = Number(form.amount)||0;
    if (!a) return 0;
    if (form.billingCycle==="Annual")     return Math.round(a/12);
    if (form.billingCycle==="Weekly")     return Math.round(a*4.33);
    if (form.billingCycle==="Quarterly")  return Math.round(a/3);
    if (form.billingCycle==="Biannual")   return Math.round(a/6);
    return a;
  };
  const calcAnnual = () => {
    const a = Number(form.amount)||0;
    if (!a) return 0;
    if (form.billingCycle==="Annual")     return a;
    if (form.billingCycle==="Weekly")     return Math.round(a*52);
    if (form.billingCycle==="Quarterly")  return Math.round(a*4);
    if (form.billingCycle==="Biannual")   return Math.round(a*2);
    return a*12;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!finalName) { setError("Please select a service or enter a name."); return; }
    if (!form.amount || Number(form.amount) < 0) { setError("Please enter a valid amount."); return; }
    setLoading(true); setError("");
    try {
      await API.post("/subscriptions", {
        name:            finalName.trim(),
        category:        form.category || "Other",
        planDescription: form.planDescription,
        billingCycle:    form.billingCycle,
        amount:          Number(form.amount),
        currency:        "INR",
        renewalDate:     form.renewalDate || undefined,
        notes:           form.notes,
        tags:            form.tags ? form.tags.split(",").map(t=>t.trim()).filter(Boolean) : [],
        autopay:         form.autopay,
        isTrial:         form.isTrial,
        trialEndsOn:     form.isTrial ? form.trialEndsOn : undefined,
        websiteUrl:      appUrl,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add subscription. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--surface2)" }}>
      <Sidebar />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Topbar */}
        <header className="topbar">
          <div>
            <div style={{ fontSize:17, fontWeight:800 }}>Add Subscription</div>
            <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Fill in the details — <span style={{ color:"var(--red)" }}>*</span> fields are required</div>
          </div>
          <button className="btn-ghost" onClick={()=>navigate("/dashboard")} style={{ height:36, fontSize:12 }}>✕ Cancel</button>
        </header>

        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, maxWidth:960, margin:"0 auto" }}>

              {/* ── LEFT: Main fields ── */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {error && (
                  <div style={{ background:"var(--red-bg)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"var(--red)", fontWeight:500 }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Section 1 */}
                <div className="card" style={{ padding:"22px 24px" }}>
                  <SectionHead n="1" title="What are you subscribing to?" />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom: (form.service && planOptions.length>0) || form.service==="Other" ? 14 : 0 }}>
                    <div>
                      <FLabel required>Category</FLabel>
                      <Dropdown options={catOptions} value={form.category} onChange={onCat} placeholder="Select category…" />
                    </div>
                    <div>
                      <FLabel required>Service / App</FLabel>
                      <Dropdown options={svcOptions} value={form.service} onChange={onSvc} placeholder="Select service…" disabled={!form.category} />
                    </div>
                  </div>

                  {/* Plan picker */}
                  {form.service && form.service !== "Other" && planOptions.length > 0 && (
                    <div style={{ marginBottom:0 }}>
                      <FLabel>Plan</FLabel>
                      <Dropdown options={planOptions} value={form.planDescription} onChange={onPlan} placeholder="Choose a plan…" />
                    </div>
                  )}

                  {/* Custom name for "Other" */}
                  {form.service === "Other" && (
                    <div>
                      <FLabel required>Service Name</FLabel>
                      <input className="inp" placeholder="e.g. My Gym, Local ISP…"
                        value={form.customName} onChange={e=>setForm(p=>({...p,customName:e.target.value}))} />
                    </div>
                  )}

                  {/* App redirect link */}
                  {appUrl && (
                    <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"var(--accent-bg)", borderRadius:10, border:"1px solid var(--border2)" }}>
                      <span style={{ fontSize:18 }}>{svcIcon}</span>
                      <div style={{ flex:1, fontSize:12, color:"var(--text2)", fontWeight:500 }}>
                        Open {form.service} directly in your browser
                      </div>
                      <a href={appUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:12, fontWeight:700, color:"var(--accent)", textDecoration:"none", padding:"5px 12px", background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:8, whiteSpace:"nowrap" }}>
                        Visit site →
                      </a>
                    </div>
                  )}
                </div>

                {/* Section 2 */}
                <div className="card" style={{ padding:"22px 24px" }}>
                  <SectionHead n="2" title="Billing details" />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                    <div>
                      <FLabel required>Amount (₹)</FLabel>
                      <input className="inp" type="number" min="0" placeholder="0"
                        value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} required />
                    </div>
                    <div>
                      <FLabel required>Billing Cycle</FLabel>
                      <Dropdown
                        options={BILLING_CYCLES.map(c=>({value:c,label:c}))}
                        value={form.billingCycle}
                        onChange={val=>setForm(p=>({...p,billingCycle:val}))}
                        placeholder="Select…"
                      />
                    </div>
                    <div>
                      <FLabel>Renewal Date</FLabel>
                      <input className="inp" type="date" value={form.renewalDate}
                        onChange={e=>setForm(p=>({...p,renewalDate:e.target.value}))} />
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="card" style={{ padding:"22px 24px" }}>
                  <SectionHead n="3" title="Optional details" />
                  <div style={{ marginBottom:14 }}>
                    <FLabel>Tags <span style={{ color:"var(--text3)", fontWeight:400 }}>(comma-separated)</span></FLabel>
                    <input className="inp" placeholder="e.g. work, personal, streaming"
                      value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} />
                  </div>
                  <div>
                    <FLabel>Notes</FLabel>
                    <textarea className="inp" rows={3} placeholder="Any notes about this subscription…"
                      value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                      style={{ height:"auto", padding:"10px 14px", resize:"vertical" }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:12 }}>
                  <button type="button" className="btn-ghost" onClick={()=>navigate("/dashboard")} style={{ height:46 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    style={{ flex:1, height:46, borderRadius:11, border:"none", background: loading?"var(--accent-dim)":"linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", fontFamily:"var(--font)", fontSize:15, fontWeight:800, cursor:loading?"not-allowed":"pointer", boxShadow:"0 6px 20px rgba(124,58,237,0.3)", transition:"0.15s" }}>
                    {loading ? "Adding…" : "➕ Add Subscription"}
                  </button>
                </div>
              </div>

              {/* ── RIGHT: Preview + Options ── */}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* Live preview */}
                <div className="card" style={{ padding:"20px 20px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14 }}>Live Preview</div>
                  <div style={{ borderRadius:12, background:`linear-gradient(135deg,${catColor}20,${catColor}08)`, border:`1px solid ${catColor}28`, padding:"18px 16px", marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                      <div style={{ width:42, height:42, borderRadius:11, flexShrink:0, background:`${catColor}20`, border:`1px solid ${catColor}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                        {svcIcon}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:800, fontSize:14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {finalName || <span style={{ color:"var(--text3)" }}>Service name</span>}
                        </div>
                        <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>
                          {[form.category, form.planDescription, form.billingCycle].filter(Boolean).join(" · ") || "Category · Plan · Cycle"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                      <div>
                        <div style={{ fontSize:10, color:"var(--text3)", marginBottom:2 }}>AMOUNT</div>
                        <div style={{ fontSize:26, fontWeight:900, fontFamily:"var(--mono)", color:catColor }}>
                          {form.amount ? `₹${Number(form.amount).toLocaleString("en-IN")}` : "₹—"}
                        </div>
                      </div>
                      {form.renewalDate && (
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:10, color:"var(--text3)", marginBottom:2 }}>RENEWS</div>
                          <div style={{ fontSize:12, fontWeight:700 }}>
                            {new Date(form.renewalDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20, background: form.autopay?"var(--green-bg)":"var(--red-bg)", color: form.autopay?"var(--green)":"var(--red)" }}>
                      {form.autopay ? "● Auto-pay ON" : "● Auto-pay OFF"}
                    </span>
                    {form.isTrial && <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20, background:"var(--blue-bg)", color:"var(--blue)" }}>● Trial</span>}
                  </div>
                </div>

                {/* Options card */}
                <div className="card" style={{ padding:"20px 20px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:16 }}>Options</div>
                  <Toggle label="Auto-pay" desc="Charge automatically on renewal date" checked={form.autopay} onChange={()=>setForm(p=>({...p,autopay:!p.autopay}))} />
                  <div style={{ height:1, background:"var(--border)", margin:"14px 0" }}/>
                  <Toggle label="Free Trial" desc="I'm on a free trial for this" checked={form.isTrial} onChange={()=>setForm(p=>({...p,isTrial:!p.isTrial}))} />
                  {form.isTrial && (
                    <div style={{ marginTop:12 }}>
                      <FLabel>Trial ends on</FLabel>
                      <input className="inp" type="date" value={form.trialEndsOn}
                        min={new Date().toISOString().slice(0,10)}
                        onChange={e=>setForm(p=>({...p,trialEndsOn:e.target.value}))} />
                    </div>
                  )}
                </div>

                {/* Cost breakdown */}
                {form.amount && Number(form.amount) > 0 && (
                  <div className="card" style={{ padding:"18px 20px" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14 }}>Cost Breakdown</div>
                    {[
                      { label:"Per month",  value:`₹${calcMonthly().toLocaleString("en-IN")}` },
                      { label:"Per year",   value:`₹${calcAnnual().toLocaleString("en-IN")}` },
                      { label:"Per day",    value:`₹${(calcAnnual()/365).toFixed(1)}` },
                    ].map(r => (
                      <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                        <span style={{ fontSize:12, color:"var(--text3)" }}>{r.label}</span>
                        <span style={{ fontSize:13, fontWeight:700, fontFamily:"var(--mono)" }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const FLabel = ({children,required}) => (
  <div style={{ fontSize:12, fontWeight:600, color:"var(--text2)", marginBottom:7 }}>
    {children}{required && <span style={{ color:"var(--red)", marginLeft:3 }}>*</span>}
  </div>
);
const SectionHead = ({n,title}) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
    <div style={{ width:24, height:24, borderRadius:"50%", background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", flexShrink:0 }}>{n}</div>
    <div style={{ fontSize:14, fontWeight:800 }}>{title}</div>
  </div>
);
const Toggle = ({label,desc,checked,onChange}) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
    <div>
      <div style={{ fontSize:13, fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{desc}</div>
    </div>
    <div className={`toggle-track${checked?" on":""}`} onClick={onChange} style={{ flexShrink:0 }}>
      <div className="toggle-knob"/>
    </div>
  </div>
);
