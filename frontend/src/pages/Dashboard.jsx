import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import PaymentButton from "../components/PaymentButton";
import { exportToCSV } from "../utils/export";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const CATS = ["", "Entertainment", "Music", "Education", "Software", "Productivity", "Gaming", "Health", "News", "Other"];
const CAT_COLORS = {
    Entertainment: "#7c3aed", Music: "#ec4899", Education: "#10b981",
  Software: "#3b82f6", Productivity: "#f59e0b", Other: "#9c93b8",
};

export default function Dashboard() {
  const [subs,       setSubs]       = useState([]);
  const [search,     setSearch]     = useState("");
  const [cat,        setCat]        = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [deleteId,   setDeleteId]   = useState(null);
  const [pauseId,    setPauseId]    = useState(null);
  const [pauseDate,  setPauseDate]  = useState("");
  const [loading,    setLoading]    = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const budget = Number(user.monthlyBudget) || 0;

  useEffect(() => { fetchSubs(); }, []);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/subscriptions");
      setSubs(res.data.filter(s => s.name && s.amount));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  /* ── Stats ── */
  const activeSubs       = subs.filter(s => s.status === "active");
  const monthlySpending  = activeSubs.reduce((t, s) => t + Number(s.amount), 0);
  const annualProjection = activeSubs.reduce((t, s) => {
    const m = s.billingCycle === "Annual" ? 1/12 : s.billingCycle === "Weekly" ? 4.33 : 1;
    return t + Number(s.amount) * m * 12;
  }, 0);
  const budgetPct = budget > 0 ? Math.min(Math.round((monthlySpending / budget) * 100), 100) : 0;
  const overBudget = budget > 0 && monthlySpending > budget;

  const nextSub = activeSubs.length > 0
    ? activeSubs
        .filter(s => s.renewalDate)
        .reduce((a, b) => !a || new Date(a.renewalDate) > new Date(b.renewalDate) ? b : a, null)
    : null;
  const daysAway = nextSub ? Math.ceil((new Date(nextSub.renewalDate) - new Date()) / 86400000) : null;

  /* ── Trial subscriptions expiring soon ── */
  const trialsSoon = subs.filter(s => {
    if (!s.isTrial || !s.trialEndsOn) return false;
    const d = Math.ceil((new Date(s.trialEndsOn) - new Date()) / 86400000);
    return d >= 0 && d <= 3;
  });

  /* ── Filtered list ── */
  const filtered = useMemo(() =>
    subs.filter(s => {
      const q = search.toLowerCase();
      const matchQ = s.name?.toLowerCase().includes(q) || s.planDescription?.toLowerCase().includes(q);
      const matchCat = !cat || s.category === cat;
      const matchSt = !statusFilter || s.status === statusFilter;
      return matchQ && matchCat && matchSt;
    }),
  [subs, search, cat, statusFilter]);

  /* ── Handlers ── */
  const confirmDelete = async () => {
    await API.delete(`/subscriptions/${deleteId}`);
    setSubs(p => p.filter(s => s._id !== deleteId));
    setDeleteId(null);
  };

  const toggleAutopay = async (s) => {
    const updated = await API.put(`/subscriptions/${s._id}`, { autopay: !s.autopay });
    setSubs(p => p.map(x => x._id === s._id ? updated.data : x));
  };

  const confirmPause = async () => {
    if (!pauseDate) return;
    const updated = await API.put(`/subscriptions/${pauseId}`, { pausedUntil: pauseDate });
    setSubs(p => p.map(x => x._id === pauseId ? updated.data : x));
    setPauseId(null); setPauseDate("");
  };

  const cancelSubscription = async (id) => {
    const updated = await API.put(`/subscriptions/${id}`, { status: "cancelled", autopay: false });
    setSubs(p => p.map(x => x._id === id ? updated.data : x));
  };

  const resumeSubscription = async (id) => {
    const updated = await API.put(`/subscriptions/${id}`, { status: "active", pausedUntil: null });
    setSubs(p => p.map(x => x._id === id ? updated.data : x));
  };

  /* ── Chart data ── */
  const pieData = Object.entries(
    activeSubs.reduce((acc, s) => {
      const c = s.category || "Other";
      acc[c] = (acc[c] || 0) + Number(s.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 5 + i);
    return d.toLocaleString("default", { month: "short" });
  });
  const areaData = monthLabels.map((month, i) => ({
    month, amount: Math.round(monthlySpending * (0.82 + i * 0.035)),
  }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface2)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header className="topbar">
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>Dashboard</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Manage & track all your subscriptions</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={() => exportToCSV(subs)} style={{ height: 36, fontSize: 12 }}>
              ↓ Export CSV
            </button>
            <button className="btn-primary" onClick={() => navigate("/add")} style={{ height: 36, fontSize: 13 }}>
              + Add New
            </button>
          </div>
        </header>

        <div style={{ padding: "22px 28px", flex: 1, overflowY: "auto" }}>

          {/* ── Budget Alert ── */}
          {overBudget && (
            <div className="fade-up" style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--red-bg)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 16,
              fontSize: 13, color: "var(--red)", fontWeight: 500,
            }}>
              <span style={{ fontSize: 16 }}>⚠</span>
              <span>You've exceeded your monthly budget of ₹{budget.toLocaleString("en-IN")}! You're spending ₹{(monthlySpending - budget).toLocaleString("en-IN")} over.</span>
            </div>
          )}

          {/* ── Trial expiry alerts ── */}
          {trialsSoon.map(s => {
            const d = Math.ceil((new Date(s.trialEndsOn) - new Date()) / 86400000);
            return (
              <div key={s._id} className="fade-up" style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "var(--r)", padding: "12px 16px", marginBottom: 10,
                fontSize: 13, color: "var(--blue)", fontWeight: 500,
              }}>
                <span>🔔</span>
                <span><strong>{s.name}</strong> free trial ends in <strong>{d} day{d !== 1 ? "s" : ""}</strong>. Cancel before being charged.</span>
                <button className="btn-danger" onClick={() => cancelSubscription(s._id)} style={{ marginLeft: "auto", height: 28, padding: "0 12px", fontSize: 11 }}>
                  Cancel Trial
                </button>
              </div>
            );
          })}

          {/* ── Renewal alert ── */}
          {nextSub && daysAway !== null && daysAway <= 5 && (
            <div className="fade-up" style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--amber-bg)", border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "var(--r)", padding: "12px 16px", marginBottom: 16,
              fontSize: 13, color: "#92400e", fontWeight: 500,
            }}>
              <span>⏰</span>
              <span><strong>{nextSub.name}</strong> renews in <strong>{daysAway} day{daysAway !== 1 ? "s" : ""}</strong> on {new Date(nextSub.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <span style={{ marginLeft: "auto", background: "rgba(245,158,11,0.15)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#b45309" }}>
                {nextSub.autopay ? "Auto-pay ON" : "Manual payment needed"}
              </span>
            </div>
          )}

          {/* ── Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
            <StatCard colorClass="sc-purple" label="Active Plans"    value={activeSubs.length} sub={`${subs.filter(s=>s.status==="paused").length} paused, ${subs.filter(s=>s.status==="cancelled").length} cancelled`} icon={<BoxIcon />} />
            <StatCard colorClass="sc-green"  label="Monthly Spend"   value={`₹${monthlySpending.toLocaleString("en-IN")}`} sub="Active plans only" icon={<RupeeIcon />} />
            <StatCard colorClass="sc-amber"  label="Annual Projection" value={`₹${Math.round(annualProjection).toLocaleString("en-IN")}`} sub="Active plans only" icon={<CalIcon />} />
            <StatCard colorClass="sc-blue"   label="Next Renewal"    value={nextSub ? new Date(nextSub.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"} sub={daysAway !== null ? `${daysAway}d away` : "No upcoming"} icon={<ClockIcon />} />
          </div>

          {/* ── Budget bar ── */}
          {budget > 0 && (
            <div className="card fade-up" style={{ padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", whiteSpace: "nowrap" }}>Monthly Budget</div>
              <div className="budget-bar-track">
                <div className="budget-bar-fill" style={{
                  width: `${budgetPct}%`,
                  background: budgetPct >= 100 ? "var(--red)" : budgetPct >= 80 ? "var(--amber)" : "var(--accent)",
                }} />
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: overBudget ? "var(--red)" : "var(--text2)", fontWeight: 600, whiteSpace: "nowrap" }}>
                ₹{monthlySpending.toLocaleString("en-IN")} / ₹{budget.toLocaleString("en-IN")}
              </div>
            </div>
          )}

          {/* ── Filters ── */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
              <span className="search-icon">🔍</span>
              <input className="search-inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subscriptions…" />
            </div>
            {["active","paused","cancelled"].map(st => (
              <button key={st} className={`filter-chip${statusFilter === st ? " active" : ""}`} onClick={() => setStatusFilter(s => s === st ? "" : st)}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
            <div style={{ width: 1, height: 24, background: "var(--border)" }} />
            {CATS.map(c => (
              <button key={c || "all"} className={`filter-chip${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>
                {c || "All"}
              </button>
            ))}
          </div>

          {/* ── Table ── */}
          <div className="card fade-up" style={{ overflow: "hidden", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 12px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>All Subscriptions</div>
              <div style={{ fontSize: 11, fontWeight: 600, background: "var(--accent-bg)", color: "var(--accent)", padding: "3px 10px", borderRadius: 20 }}>
                {filtered.length} plans
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text3)", fontSize: 13 }}>Loading…</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Service","Category","Amount","Cycle","Renewal","Status","Auto-pay","Actions"].map(h => (
                        <th key={h} style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase",
                          color: "var(--text3)", padding: "10px 16px", textAlign: "left",
                          borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => {
                      const days = s.renewalDate ? Math.ceil((new Date(s.renewalDate) - new Date()) / 86400000) : null;
                      return (
                        <tr key={s._id} className="trow">
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                background: `${CAT_COLORS[s.category] || "#7c3aed"}18`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 800, color: CAT_COLORS[s.category] || "var(--accent)",
                              }}>{s.name.charAt(0).toUpperCase()}</div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
                                  {s.websiteUrl && (
                                    <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer"
                                      title={`Open ${s.name}`}
                                      style={{ display: "flex", alignItems: "center", color: "var(--text3)", textDecoration: "none", flexShrink: 0 }}
                                      onClick={e => e.stopPropagation()}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                      </svg>
                                    </a>
                                  )}
                                </div>
                                <div style={{ display: "flex", gap: 5, marginTop: 2, alignItems: "center" }}>
                                  {s.planDescription && <span style={{ fontSize: 11, color: "var(--text3)" }}>{s.planDescription}</span>}
                                  {s.isTrial && <span className="chip chip-trial">Trial</span>}
                                  {(s.tags || []).slice(0,2).map(t => (
                                    <span key={t} style={{ fontSize: 10, background: "var(--surface3)", color: "var(--text2)", padding: "1px 6px", borderRadius: 10, fontWeight: 600 }}>{t}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span className={`pill pill-${s.category || "Other"}`}>{s.category || "Other"}</span>
                          </td>
                          <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600 }}>
                            ₹{Number(s.amount).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text3)" }}>
                            {s.billingCycle || "Monthly"}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 12 }}>
                            {s.renewalDate
                              ? days !== null && days <= 5
                                ? <span style={{ color: "var(--amber)", fontWeight: 700 }}>in {days}d</span>
                                : <span style={{ color: "var(--text3)" }}>{new Date(s.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</span>
                              : <span style={{ color: "var(--text3)" }}>—</span>}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span className={`chip chip-${s.status || "active"}`}>
                              {s.status === "paused" && s.pausedUntil
                                ? `Paused till ${new Date(s.pausedUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                                : s.status || "active"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div
                              className={`toggle-track${s.autopay ? " on" : ""}`}
                              onClick={() => toggleAutopay(s)}
                              title={s.autopay ? "Auto-pay on — click to disable" : "Auto-pay off — click to enable"}
                            >
                              <div className="toggle-knob" />
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                              <button className="btn-edit" onClick={() => navigate(`/edit/${s._id}`)}>Edit</button>
                              {s.status === "active" && <button className="btn-pay" onClick={() => setPauseId(s._id)}>Pause</button>}
                              {s.status === "paused" && <button className="btn-edit" onClick={() => resumeSubscription(s._id)}>Resume</button>}
                              {s.status !== "cancelled" && <button className="btn-danger" style={{ height: 30, fontSize: 11 }} onClick={() => cancelSubscription(s._id)}>Cancel</button>}
                              <button className="btn-danger" style={{ height: 30, fontSize: 11, background: "transparent", color: "var(--text3)" }} onClick={() => setDeleteId(s._id)}>Delete</button>
                              <PaymentButton subscription={s} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && !loading && (
                      <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                        {subs.length === 0
                          ? <div><div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>No subscriptions yet. <span onClick={() => navigate("/add")} style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}>Add your first →</span></div>
                          : "No results match your filters."}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Charts ── */}
          {subs.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Monthly Spend Trend</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 16 }}>Last 6 months estimate</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.18}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text3)", fontFamily: "var(--font)" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Amount"]}
                      contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, fontFamily: "var(--font)" }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={2} fill="url(#gr)" dot={{ r: 3, fill: "#7c3aed" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Category Breakdown</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12 }}>Share of monthly spend</div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={CAT_COLORS[entry.name] || "#9c93b8"} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: "var(--font)" }} />
                    <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, ""]} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, fontFamily: "var(--font)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Dialog ── */}
      {deleteId && (
        <Overlay>
          <div className="card dialog-in" style={{ padding: 28, width: 360 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Delete Subscription</div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24, lineHeight: 1.6 }}>This action cannot be undone. The subscription and all its data will be permanently removed.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-primary" style={{ background: "var(--red)" }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Pause Dialog ── */}
      {pauseId && (
        <Overlay>
          <div className="card dialog-in" style={{ padding: 28, width: 360 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Pause Subscription</div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 18, lineHeight: 1.6 }}>Billing will be paused until the date you choose. It will auto-resume on that date.</div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>Resume on</div>
              <input type="date" className="inp" value={pauseDate} onChange={e => setPauseDate(e.target.value)} min={new Date().toISOString().slice(0,10)} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => { setPauseId(null); setPauseDate(""); }}>Cancel</button>
              <button className="btn-primary" onClick={confirmPause} disabled={!pauseDate}>Pause</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

const Overlay = ({ children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
    {children}
  </div>
);

const StatCard = ({ label, value, sub, icon, colorClass }) => (
  <div className={`card stat-card ${colorClass}`} style={{ padding: "18px 20px" }}>
    <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: "var(--accent)" }}>
      {icon}
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6 }}>{value}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginTop: 3 }}>{label}</div>
    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{sub}</div>
  </div>
);

const BoxIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const RupeeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="4" x2="18" y2="4"/><line x1="6" y1="9" x2="18" y2="9"/><path d="M6 4v16l6-4 6 4V4"/></svg>;
const CalIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ClockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
