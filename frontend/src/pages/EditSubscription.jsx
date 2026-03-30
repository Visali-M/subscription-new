import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

const CATEGORIES = ["Entertainment","Music","Education","Software","Productivity","Other"];
const BILLING    = ["Monthly","Annual","Weekly"];
const STATUSES   = ["active","paused","cancelled"];

export default function EditSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form,    setForm]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    API.get(`/subscriptions/${id}`)
      .then(r => {
        const s = r.data;
        setForm({
          name:            s.name            || "",
          category:        s.category        || "Other",
          planDescription: s.planDescription || "",
          billingCycle:    s.billingCycle     || "Monthly",
          amount:          String(s.amount   || ""),
          currency:        s.currency        || "INR",
          renewalDate:     s.renewalDate ? new Date(s.renewalDate).toISOString().slice(0,10) : "",
          status:          s.status          || "active",
          notes:           s.notes           || "",
          tags:            (s.tags || []).join(", "),
          autopay:         s.autopay !== undefined ? s.autopay : true,
          isTrial:         s.isTrial         || false,
          trialEndsOn:     s.trialEndsOn ? new Date(s.trialEndsOn).toISOString().slice(0,10) : "",
        });
      })
      .catch(() => setError("Failed to load subscription."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      await API.put(`/subscriptions/${id}`, {
        ...form,
        amount:    Number(form.amount),
        tags:      form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        trialEndsOn: form.isTrial ? form.trialEndsOn : undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface2)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)" }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface2)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header className="topbar">
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Edit Subscription</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Update details for {form?.name}</div>
          </div>
        </header>

        <div style={{ padding: "22px 28px", flex: 1, overflowY: "auto" }}>
          <div className="fade-up" style={{ maxWidth: 600 }}>
            {error && <div style={{ background: "var(--red-bg)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)", marginBottom: 16 }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

              <div className="card" style={{ padding: "22px 24px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 16, color: "var(--text2)" }}>Basic Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <FieldWrap label="Service Name" colSpan={2}>
                    <input className="inp" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
                  </FieldWrap>
                  <FieldWrap label="Category">
                    <select className="inp" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </FieldWrap>
                  <FieldWrap label="Plan Description">
                    <input className="inp" placeholder="e.g. Premium" value={form.planDescription} onChange={e => setForm(p => ({...p, planDescription: e.target.value}))} />
                  </FieldWrap>
                  <FieldWrap label="Amount (₹)">
                    <input className="inp" type="number" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} required />
                  </FieldWrap>
                  <FieldWrap label="Billing Cycle">
                    <select className="inp" value={form.billingCycle} onChange={e => setForm(p => ({...p, billingCycle: e.target.value}))}>
                      {BILLING.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </FieldWrap>
                  <FieldWrap label="Renewal Date">
                    <input className="inp" type="date" value={form.renewalDate} onChange={e => setForm(p => ({...p, renewalDate: e.target.value}))} />
                  </FieldWrap>
                  <FieldWrap label="Status">
                    <select className="inp" value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </FieldWrap>
                  <FieldWrap label="Tags (comma-separated)" colSpan={2}>
                    <input className="inp" placeholder="work, personal, streaming" value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} />
                  </FieldWrap>
                  <FieldWrap label="Notes" colSpan={2}>
                    <textarea className="inp" rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} style={{ height: "auto", padding: "10px 14px", resize: "vertical" }} />
                  </FieldWrap>
                </div>
              </div>

              <div className="card" style={{ padding: "22px 24px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 16, color: "var(--text2)" }}>Payment Options</div>
                <ToggleRow label="Auto-pay" desc="Charge automatically on renewal date" checked={form.autopay} onChange={() => setForm(p => ({...p, autopay: !p.autopay}))} />
                <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />
                <ToggleRow label="Free Trial" desc="Mark as a free trial subscription" checked={form.isTrial} onChange={() => setForm(p => ({...p, isTrial: !p.isTrial}))} />
                {form.isTrial && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>Trial Ends On</div>
                    <input className="inp" type="date" value={form.trialEndsOn} onChange={e => setForm(p => ({...p, trialEndsOn: e.target.value}))} style={{ maxWidth: 200 }} />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn-ghost" onClick={() => navigate("/dashboard")}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const FieldWrap = ({ label, children, colSpan }) => (
  <div style={{ gridColumn: colSpan === 2 ? "1 / -1" : undefined }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>{label}</div>
    {children}
  </div>
);

const ToggleRow = ({ label, desc, checked, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{desc}</div>
    </div>
    <div className={`toggle-track${checked ? " on" : ""}`} onClick={onChange}>
      <div className="toggle-knob" />
    </div>
  </div>
);
