import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Signup() {
  const [form,     setForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", { name: form.name, email: form.email, password: form.password });
      localStorage.setItem("token",    data.token);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email, _id: data._id }));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        .su-root { min-height:100vh; display:flex; font-family:'Outfit','Segoe UI',sans-serif; background:#07050f; }

        /* LEFT HERO */
        .su-hero { flex:1; position:relative; overflow:hidden; display:flex; flex-direction:column; }
        .su-hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; filter:brightness(0.28) saturate(1.4); }
        .su-overlay { position:absolute; inset:0; background:linear-gradient(140deg,rgba(22,5,55,0.92) 0%,rgba(90,35,180,0.3) 50%,rgba(6,3,20,0.94) 100%); }
        .su-orb1 { position:absolute; top:10%; right:5%; width:350px; height:350px; border-radius:50%; background:radial-gradient(circle,rgba(168,85,247,0.25) 0%,transparent 70%); pointer-events:none; }
        .su-orb2 { position:absolute; bottom:12%; left:5%; width:240px; height:240px; border-radius:50%; background:radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%); pointer-events:none; }
        .su-content { position:relative; z-index:2; display:flex; flex-direction:column; height:100%; padding:48px 60px; }
        .su-logo { display:flex; align-items:center; gap:14px; margin-bottom:auto; }
        .su-logo-icon { width:46px; height:46px; border-radius:13px; background:linear-gradient(135deg,#7c3aed,#a855f7); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 28px rgba(124,58,237,0.55); flex-shrink:0; }
        .su-logo-name { font-size:20px; font-weight:800; color:#fff; letter-spacing:-0.5px; }
        .su-body { margin-bottom:44px; }
        .su-pill { display:inline-flex; align-items:center; gap:8px; background:rgba(168,85,247,0.14); border:1px solid rgba(168,85,247,0.3); border-radius:100px; padding:6px 16px; margin-bottom:22px; }
        .su-pill-dot { width:7px; height:7px; border-radius:50%; background:#c084fc; box-shadow:0 0 8px #c084fc; }
        .su-pill-text { font-size:11px; font-weight:600; color:#e9d5ff; letter-spacing:0.6px; text-transform:uppercase; }
        .su-h1 { font-size:50px; font-weight:900; line-height:1.08; letter-spacing:-2px; margin:0 0 18px; color:#fff; }
        .su-h1 span { background:linear-gradient(135deg,#f0abfc 0%,#c084fc 40%,#818cf8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .su-sub { font-size:15px; color:rgba(255,255,255,0.46); line-height:1.8; max-width:400px; margin:0; }
        .su-stats { display:flex; gap:32px; flex-wrap:wrap; }
        .su-stat-val { font-size:24px; font-weight:900; color:#fff; letter-spacing:-0.5px; font-variant-numeric:tabular-nums; }
        .su-stat-label { font-size:11px; color:rgba(255,255,255,0.35); margin-top:3px; }

        /* RIGHT FORM */
        .su-panel { width:500px; background:#ffffff; display:flex; flex-direction:column; justify-content:center; padding:48px 52px; box-shadow:-32px 0 80px rgba(0,0,0,0.45); overflow-y:auto; }
        .su-fade { animation:suFade 0.5s ease forwards; }
        @keyframes suFade { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .su-form-title { font-size:28px; font-weight:900; color:#1e1b2e; letter-spacing:-0.8px; margin:0 0 10px; }
        .su-form-sub { font-size:14px; color:#9c93b8; line-height:1.7; margin:0 0 28px; }
        .su-error { background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:13px 16px; font-size:13px; color:#dc2626; margin-bottom:20px; display:flex; align-items:center; gap:8px; font-weight:500; }
        .su-label { font-size:13px; font-weight:700; color:#4c4566; display:block; margin-bottom:7px; }
        .su-field { margin-bottom:14px; }
        .su-wrap { position:relative; }
        .su-icon { position:absolute; left:15px; top:50%; transform:translateY(-50%); pointer-events:none; }
        .su-input { width:100%; height:50px; padding-left:46px; padding-right:16px; border:1.5px solid #ede9fe; border-radius:12px; font-size:14px; font-family:inherit; color:#1e1b2e; background:#faf9ff; outline:none; transition:border-color 0.15s,box-shadow 0.15s; }
        .su-input:focus { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,0.12); }
        .su-input-pr { padding-right:56px; }
        .su-show { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9c93b8; font-size:12px; font-family:inherit; font-weight:600; }
        .su-submit { width:100%; height:52px; margin-top:10px; border-radius:13px; border:none; background:linear-gradient(135deg,#7c3aed,#a855f7); color:#fff; font-family:inherit; font-size:16px; font-weight:800; cursor:pointer; box-shadow:0 8px 24px rgba(124,58,237,0.38); transition:all 0.2s; }
        .su-submit:hover { transform:translateY(-2px); box-shadow:0 14px 32px rgba(124,58,237,0.5); }
        .su-submit:disabled { background:#a78bfa; cursor:not-allowed; transform:none; }
        .su-divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
        .su-divider-line { flex:1; height:1px; background:#f0ebff; }
        .su-divider-txt { font-size:12px; color:#c4b8e8; font-weight:600; }
        .su-signin-btn { width:100%; height:50px; border-radius:13px; border:1.5px solid #ede9fe; background:#faf9ff; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#7c3aed; cursor:pointer; transition:all 0.15s; text-decoration:none; }
        .su-signin-btn:hover { border-color:#7c3aed; background:#f3eeff; }
        .su-trust { margin-top:16px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
        .su-trust-item { font-size:11px; color:#9c93b8; background:#faf9ff; border:1px solid #ede9fe; border-radius:8px; padding:8px 6px; font-weight:500; text-align:center; }

        @media (max-width:768px) {
          .su-hero { display:none; }
          .su-panel { width:100%; }
        }
      `}</style>

      <div className="su-root">
        {/* ══ LEFT — Image Hero ══ */}
        <div className="su-hero">
          <img
            className="su-hero-img"
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80"
            alt="Manage subscriptions"
          />
          <div className="su-overlay"/>
          <div className="su-orb1"/>
          <div className="su-orb2"/>

          <div className="su-content">
            {/* Logo */}
            <div className="su-logo">
              <div className="su-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <span className="su-logo-name">SubTracker</span>
            </div>

            {/* Hero text */}
            <div className="su-body">
              <div className="su-pill">
                <div className="su-pill-dot"/>
                <span className="su-pill-text">Join thousands of smart savers</span>
              </div>

              <h1 className="su-h1">
                Start saving<br/>
                <span>money today</span>
              </h1>

              <p className="su-sub">
                Know exactly what you pay, when you pay, and cancel what you don't need — all for free.
              </p>
            </div>

            {/* Stats */}
            <div className="su-stats">
              {[
                { val: "80+",  label: "Services supported" },
                { val: "₹0",   label: "Cost to sign up" },
                { val: "3min", label: "Setup time" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="su-stat-val">{val}</div>
                  <div className="su-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT — Form ══ */}
        <div className="su-panel">
          <div className="su-fade">
            <p className="su-form-title">Create your account</p>
            <p className="su-form-sub">
              Join thousands who track their subscriptions smarter — it's completely free.
            </p>

            {error && (
              <div className="su-error"><span>⚠️</span> {error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="su-field">
                <label className="su-label">Full name</label>
                <div className="su-wrap">
                  <div className="su-icon"><PersonIcon/></div>
                  <input className="su-input" type="text" placeholder="Your full name"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required/>
                </div>
              </div>

              {/* Email */}
              <div className="su-field">
                <label className="su-label">Email address</label>
                <div className="su-wrap">
                  <div className="su-icon"><EmailIcon/></div>
                  <input className="su-input" type="email" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required/>
                </div>
              </div>

              {/* Password */}
              <div className="su-field">
                <label className="su-label">Create password</label>
                <div className="su-wrap">
                  <div className="su-icon"><LockIcon/></div>
                  <input className="su-input su-input-pr" type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required/>
                  <button type="button" className="su-show" onClick={() => setShowPass(p => !p)}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="su-field">
                <label className="su-label">Confirm password</label>
                <div className="su-wrap">
                  <div className="su-icon"><LockIcon/></div>
                  <input className="su-input" type="password" placeholder="Repeat your password"
                    value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required/>
                </div>
              </div>

              <button type="submit" className="su-submit" disabled={loading}>
                {loading ? "Creating account…" : "Create account →"}
              </button>
            </form>

            <div className="su-divider">
              <div className="su-divider-line"/>
              <span className="su-divider-txt">Already a member?</span>
              <div className="su-divider-line"/>
            </div>

            <Link to="/" className="su-signin-btn">Sign in to existing account</Link>

            <div className="su-trust">
              {["🔐 Secure", "🚀 Free forever", "🔔 Smart alerts"].map(t => (
                <div className="su-trust-item" key={t}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PersonIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8aed8" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function EmailIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8aed8" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function LockIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8aed8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
