import React, { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { exportToCSV } from "../utils/export";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";

const CAT_COLORS = {
  Entertainment: "#7c3aed", Music: "#ec4899", Education: "#10b981",
  Software: "#3b82f6", Productivity: "#f59e0b", Gaming: "#f97316",
  Health: "#22c55e", News: "#64748b", Other: "#9c93b8",
};

export default function Analytics() {
  const [subs,    setSubs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/subscriptions")
      .then(r => setSubs(r.data.filter(s => s.name && s.amount)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active   = subs.filter(s => s.status === "active");
  const total    = active.reduce((a, s) => a + Number(s.amount), 0);
  const annual   = active.reduce((a, s) => {
    const m = s.billingCycle === "Annual" ? 1/12 : s.billingCycle === "Weekly" ? 4.33 : 1;
    return a + Number(s.amount) * m * 12;
  }, 0);
  const avgPerSub  = active.length ? Math.round(total / active.length) : 0;
  const mostExp    = active.length ? active.reduce((a, b) => Number(a.amount) > Number(b.amount) ? a : b) : null;

  const catTotals = {};
  active.forEach(s => { const c = s.category || "Other"; catTotals[c] = (catTotals[c] || 0) + Number(s.amount); });

  const barData  = Object.entries(catTotals).map(([name, value]) => ({ name, value }));
  const pieData  = barData;

  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 5 + i);
    return d.toLocaleString("default", { month: "short" });
  });
  const lineData = monthLabels.map((month, i) => ({
    month,
    amount: Math.round(total * (0.78 + i * 0.04)),
    count:  Math.max(1, active.length - (5 - i)),
  }));

  const TOOLTIP_STYLE = {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, fontSize: 12, fontFamily: "var(--font)",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface2)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header className="topbar">
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Analytics</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Detailed breakdown of your spending</div>
          </div>
          <button className="btn-ghost" onClick={() => exportToCSV(subs)} style={{ height: 36, fontSize: 12 }}>
            ↓ Export CSV
          </button>
        </header>

        <div style={{ padding: "22px 28px", flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text3)" }}>Loading analytics…</div>
          ) : (
            <div className="fade-up">
              {/* KPI row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                {[
                  { label: "Monthly Spend",     value: `₹${total.toLocaleString("en-IN")}`,                   color: "var(--accent)" },
                  { label: "Annual Projection",  value: `₹${Math.round(annual).toLocaleString("en-IN")}`,      color: "var(--green)" },
                  { label: "Avg per Plan",       value: `₹${avgPerSub.toLocaleString("en-IN")}`,               color: "var(--amber)" },
                  { label: "Most Expensive",     value: mostExp ? mostExp.name : "—",                           color: "var(--red)" },
                ].map(k => (
                  <div key={k.label} className="card" style={{ padding: "18px 20px" }}>
                    <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginTop: 4 }}>{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="card" style={{ padding: 20 }}>
                  <ChartTitle title="Spend by Category" sub="Monthly totals" />
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} barSize={28}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text3)", fontFamily: "var(--font)" }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Amount"]} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="value" radius={[6,6,0,0]}>
                        {barData.map((entry, i) => <Cell key={i} fill={CAT_COLORS[entry.name] || "#9c93b8"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <ChartTitle title="Category Distribution" sub="Share of total spend" />
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={CAT_COLORS[entry.name] || "#9c93b8"} />)}
                      </Pie>
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: "var(--font)" }} />
                      <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, ""]} contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts row 2 */}
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <ChartTitle title="Spending Trend" sub="Estimated over last 6 months" />
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text3)", fontFamily: "var(--font)" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Spend"]} contentStyle={TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: "#7c3aed" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category table */}
              {Object.keys(catTotals).length > 0 && (
                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 700 }}>
                    Category Breakdown
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Category","Plans","Monthly Total","% of Spend"].map(h => (
                          <th key={h} style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase",
                            color: "var(--text3)", padding: "10px 20px", textAlign: "left",
                            borderBottom: "1px solid var(--border)",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(catTotals).sort((a,b) => b[1]-a[1]).map(([cat, amt]) => (
                        <tr key={cat} className="trow">
                          <td style={{ padding: "12px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 3, background: CAT_COLORS[cat] || "#9c93b8", flexShrink: 0 }} />
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{cat}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text3)" }}>
                            {active.filter(s => (s.category || "Other") === cat).length}
                          </td>
                          <td style={{ padding: "12px 20px", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700 }}>
                            ₹{amt.toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--surface3)", overflow: "hidden" }}>
                                <div style={{ width: `${Math.round((amt/total)*100)}%`, height: "100%", borderRadius: 3, background: CAT_COLORS[cat] || "var(--accent)" }} />
                              </div>
                              <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text2)", minWidth: 32, fontWeight: 600 }}>
                                {Math.round((amt/total)*100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ChartTitle = ({ title, sub }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{sub}</div>
  </div>
);
