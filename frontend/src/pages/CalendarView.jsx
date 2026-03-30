import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

const CAT_COLORS = {
  Entertainment: "#7c3aed", Music: "#ec4899", Education: "#10b981",
  Software: "#3b82f6", Productivity: "#f59e0b", Other: "#9c93b8",
};

export default function CalendarView() {
  const [subs,     setSubs]     = useState([]);
  const [selected, setSelected] = useState(new Date());
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    API.get("/subscriptions")
      .then(r => setSubs(r.data.filter(s => s.name && s.renewalDate)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renewalMap = {};
  subs.forEach(s => {
    const key = new Date(s.renewalDate).toDateString();
    if (!renewalMap[key]) renewalMap[key] = [];
    renewalMap[key].push(s);
  });

  const tileClassName = ({ date }) => {
    return renewalMap[date.toDateString()] ? "has-renewal" : null;
  };

  const tileContent = ({ date }) => {
    const list = renewalMap[date.toDateString()];
    if (!list) return null;
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2 }}>
        {list.slice(0, 3).map((s, i) => (
          <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: CAT_COLORS[s.category] || "#7c3aed", display: "inline-block" }} />
        ))}
      </div>
    );
  };

  const selectedRenewals = renewalMap[selected.toDateString()] || [];
  const upcoming = subs
    .filter(s => {
      const d = Math.ceil((new Date(s.renewalDate) - new Date()) / 86400000);
      return d >= 0 && d <= 30;
    })
    .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
    .slice(0, 8);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface2)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header className="topbar">
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>Renewal Calendar</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>View all upcoming subscription renewals</div>
          </div>
        </header>

        <div style={{ padding: "22px 28px", flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text3)" }}>Loading…</div>
          ) : (
            <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

              {/* Calendar */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Subscription Renewal Calendar</div>
                <Calendar
                  onChange={setSelected}
                  value={selected}
                  tileClassName={tileClassName}
                  tileContent={tileContent}
                />

                {/* Selected day detail */}
                <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--text2)" }}>
                    {selected.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </div>
                  {selectedRenewals.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--text3)" }}>No renewals on this date.</div>
                  ) : (
                    selectedRenewals.map(s => (
                      <div key={s._id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px", background: "var(--surface2)",
                        borderRadius: 10, marginBottom: 8,
                        border: `1px solid ${CAT_COLORS[s.category] || "#7c3aed"}22`,
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                          background: `${CAT_COLORS[s.category] || "#7c3aed"}18`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 15, fontWeight: 800, color: CAT_COLORS[s.category] || "var(--accent)",
                        }}>{s.name.charAt(0).toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>{s.category} · {s.billingCycle}</div>
                        </div>
                        <div style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14 }}>
                          ₹{Number(s.amount).toLocaleString("en-IN")}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: s.autopay ? "var(--green-bg)" : "var(--red-bg)", color: s.autopay ? "var(--green)" : "var(--red)" }}>
                          {s.autopay ? "Auto" : "Manual"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming panel */}
              <div className="card" style={{ padding: 20, alignSelf: "start" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Upcoming (30 days)</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 16 }}>Sorted by earliest first</div>
                {upcoming.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--text3)" }}>No renewals in the next 30 days.</div>
                ) : (
                  upcoming.map(s => {
                    const days = Math.ceil((new Date(s.renewalDate) - new Date()) / 86400000);
                    return (
                      <div key={s._id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 0", borderBottom: "1px solid var(--border)",
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: days <= 3 ? "var(--red)" : days <= 7 ? "var(--amber)" : "var(--green)",
                          flexShrink: 0,
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>
                            {new Date(s.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 12 }}>₹{Number(s.amount).toLocaleString("en-IN")}</div>
                          <div style={{ fontSize: 11, color: days <= 3 ? "var(--red)" : days <= 7 ? "var(--amber)" : "var(--text3)", fontWeight: 600 }}>
                            {days === 0 ? "Today!" : `${days}d`}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Legend */}
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[{ color: "var(--red)", label: "Within 3 days" }, { color: "var(--amber)", label: "Within 7 days" }, { color: "var(--green)", label: "Within 30 days" }].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
