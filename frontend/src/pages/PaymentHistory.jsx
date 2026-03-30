import React, { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    API.get("/payment/history")
      .then(r => setPayments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = payments.filter(p => p.status === "success").reduce((t, p) => t + p.amount / 100, 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface2)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header className="topbar">
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>Payment History</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>All your past subscription payments</div>
          </div>
        </header>

        <div style={{ padding: "22px 28px", flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text3)" }}>Loading…</div>
          ) : (
            <div className="fade-up">
              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
                {[
                  { label: "Total Paid",      value: `₹${(total).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, color: "var(--green)",   bg: "var(--green-bg)" },
                  { label: "Total Payments",  value: payments.filter(p => p.status === "success").length,                  color: "var(--accent)",  bg: "var(--accent-bg)" },
                  { label: "Pending / Failed",value: payments.filter(p => p.status !== "success").length,                  color: "var(--amber)",   bg: "var(--amber-bg)" },
                ].map(c => (
                  <div key={c.label} className="card stat-card" style={{ padding: "18px 20px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, marginBottom: 12 }} />
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: c.color }}>{c.value}</div>
                    <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 3, fontWeight: 600 }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 700 }}>
                  All Transactions
                </div>
                {payments.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                    No payment records yet. Payments will appear here after your first transaction.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Date","Subscription","Amount","Status","Payment ID"].map(h => (
                          <th key={h} style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase",
                            color: "var(--text3)", padding: "10px 20px", textAlign: "left",
                            borderBottom: "1px solid var(--border)",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p._id} className="trow">
                          <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text2)" }}>
                            {new Date(p.paidAt || p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td style={{ padding: "12px 20px", fontWeight: 600, fontSize: 13 }}>
                            {p.subscriptionName || "—"}
                          </td>
                          <td style={{ padding: "12px 20px", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13 }}>
                            ₹{(p.amount / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <span className={`chip chip-${p.status === "success" ? "active" : p.status === "pending" ? "paused" : "cancelled"}`}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)" }}>
                            {p.razorpayPaymentId || p.razorpayOrderId || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
