import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [form,     setForm]     = useState({ email: "", password: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("token",    data.token);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user", JSON.stringify({
        name: data.name, email: data.email, _id: data._id,
        monthlyBudget: data.monthlyBudget, currency: data.currency,
      }));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .login-root { min-height:100vh; display:flex; font-family:'Outfit','Segoe UI',sans-serif; background:#07050f; }

        /* LEFT HERO */
        .login-hero { flex:1; position:relative; overflow:hidden; display:flex; flex-direction:column; }
        .login-hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; filter:brightness(0.32) saturate(1.3); }
        .login-hero-overlay { position:absolute; inset:0; background:linear-gradient(135deg,rgba(28,8,58,0.88) 0%,rgba(100,40,200,0.28) 55%,rgba(8,4,24,0.92) 100%); }
        .login-orb1 { position:absolute; top:12%; left:8%; width:380px; height:380px; border-radius:50%; background:radial-gradient(circle,rgba(139,92,246,0.28) 0%,transparent 70%); pointer-events:none; }
        .login-orb2 { position:absolute; bottom:18%; right:8%; width:260px; height:260px; border-radius:50%; background:radial-gradient(circle,rgba(168,85,247,0.22) 0%,transparent 70%); pointer-events:none; }
        .login-hero-content { position:relative; z-index:2; display:flex; flex-direction:column; height:100%; padding:48px 60px; }
        .login-logo { display:flex; align-items:center; gap:14px; margin-bottom:auto; }
        .login-logo-icon { width:46px; height:46px; border-radius:13px; background:linear-gradient(135deg,#7c3aed,#a855f7); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 28px rgba(124,58,237,0.55); flex-shrink:0; }
        .login-logo-name { font-size:20px; font-weight:800; color:#fff; letter-spacing:-0.5px; }
        .login-hero-body { margin-bottom:44px; }
        .login-pill { display:inline-flex; align-items:center; gap:8px; background:rgba(139,92,246,0.16); border:1px solid rgba(139,92,246,0.32); border-radius:100px; padding:6px 16px; margin-bottom:22px; }
        .login-pill-dot { width:7px; height:7px; border-radius:50%; background:#a78bfa; box-shadow:0 0 8px #a78bfa; }
        .login-pill-text { font-size:11px; font-weight:600; color:#c4b5fd; letter-spacing:0.6px; text-transform:uppercase; }
        .login-h1 { font-size:50px; font-weight:900; line-height:1.08; letter-spacing:-2px; margin:0 0 18px; color:#fff; }
        .login-h1 span { background:linear-gradient(135deg,#c084fc 0%,#818cf8 50%,#7c3aed 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .login-sub { font-size:15px; color:rgba(255,255,255,0.48); line-height:1.8; max-width:400px; margin:0; }
        .login-badges { display:flex; gap:10px; flex-wrap:wrap; }
        .login-badge { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.06); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.1); border-radius:100px; padding:9px 16px; }
        .login-badge span { font-size:12px; color:rgba(255,255,255,0.58); font-weight:500; }

        /* RIGHT FORM */
        .login-form-panel { width:480px; background:#ffffff; display:flex; flex-direction:column; justify-content:center; padding:56px 52px; box-shadow:-32px 0 80px rgba(0,0,0,0.45); }
        .login-fade { animation:fadeUp 0.5s ease forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .login-title { font-size:30px; font-weight:900; color:#1e1b2e; letter-spacing:-1px; margin:0 0 10px; }
        .login-subtitle { font-size:14px; color:#9c93b8; line-height:1.7; margin:0 0 32px; }
        .login-error { background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:13px 16px; font-size:13px; color:#dc2626; margin-bottom:22px; display:flex; align-items:center; gap:8px; font-weight:500; }
        .login-label { font-size:13px; font-weight:700; color:#4c4566; display:block; margin-bottom:8px; }
        .login-field { margin-bottom:18px; }
        .login-field-last { margin-bottom:28px; }
        .login-input-wrap { position:relative; }
        .login-input-icon { position:absolute; left:15px; top:50%; transform:translateY(-50%); pointer-events:none; }
        .login-input { width:100%; height:50px; padding-left:46px; padding-right:16px; border:1.5px solid #ede9fe; border-radius:12px; font-size:14px; font-family:inherit; color:#1e1b2e; background:#faf9ff; outline:none; transition:border-color 0.15s,box-shadow 0.15s; }
        .login-input:focus { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,0.12); }
        .login-input-pass { padding-right:56px; }
        .login-show-btn { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9c93b8; font-size:13px; font-family:inherit; font-weight:600; }
        .login-btn { width:100%; height:52px; border-radius:13px; border:none; background:linear-gradient(135deg,#7c3aed,#a855f7); color:#fff; font-family:inherit; font-size:16px; font-weight:800; cursor:pointer; box-shadow:0 8px 24px rgba(124,58,237,0.38); transition:all 0.2s; letter-spacing:0.2px; }
        .login-btn:hover { transform:translateY(-2px); box-shadow:0 14px 32px rgba(124,58,237,0.5); }
        .login-btn:disabled { background:#a78bfa; cursor:not-allowed; transform:none; }
        .login-divider { display:flex; align-items:center; gap:12px; margin:24px 0; }
        .login-divider-line { flex:1; height:1px; background:#f0ebff; }
        .login-divider-text { font-size:12px; color:#c4b8e8; font-weight:600; }
        .login-signup-btn { width:100%; height:50px; border-radius:13px; border:1.5px solid #ede9fe; background:#faf9ff; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#7c3aed; cursor:pointer; transition:all 0.15s; text-decoration:none; }
        .login-signup-btn:hover { border-color:#7c3aed; background:#f3eeff; }
        .login-secure { margin-top:20px; padding:12px 16px; border-radius:12px; background:#f0fdf4; border:1px solid #bbf7d0; font-size:12px; color:#15803d; text-align:center; font-weight:500; }

        @media (max-width: 768px) {
          .login-hero { display:none; }
          .login-form-panel { width:100%; }
        }
      `}</style>

      <div className="login-root">
        {/* ══ LEFT — Image Hero ══ */}
        <div className="login-hero">
          <img
            className="login-hero-img"
            src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80"
            alt="Subscriptions hero"
          />
          <div className="login-hero-overlay"/>
          <div className="login-orb1"/>
          <div className="login-orb2"/>

          <div className="login-hero-content">
            {/* Logo */}
            <div className="login-logo">
              <div className="login-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <span className="login-logo-name">SubTracker</span>
            </div>

            {/* Hero text */}
            <div className="login-hero-body">
              <div className="login-pill">
                <div className="login-pill-dot"/>
                <span className="login-pill-text">Smart Subscription Management</span>
              </div>

              <h1 className="login-h1">
                Never miss a<br/>
                <span>subscription again</span>
              </h1>

              <p className="login-sub">
                Track renewals, manage autopay, get smart email alerts — all your subscriptions beautifully organized in one place.
              </p>
            </div>

            {/* Badges */}
            <div className="login-badges">
              {[
                { icon:"🔒", text:"Secure & private" },
                { icon:"🔔", text:"Smart reminders" },
                { icon:"💳", text:"Razorpay payments" },
              ].map(({ icon, text }) => (
                <div className="login-badge" key={text}>
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT — Form ══ */}
        <div className="login-form-panel">
          <div className="login-fade">
            <p className="login-title">Welcome back 👋</p>
            <p className="login-subtitle">Sign in to manage your subscriptions and track renewals.</p>

            {error && (
              <div className="login-error"><span>⚠️</span> {error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="login-field">
                <label className="login-label">Email address</label>
                <div className="login-input-wrap">
                  <div className="login-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8aed8" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input
                    className="login-input"
                    type="email" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field-last">
                <label className="login-label">Password</label>
                <div className="login-input-wrap">
                  <div className="login-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8aed8" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    className="login-input login-input-pass"
                    type={showPass ? "text" : "password"} placeholder="Enter your password"
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
                  />
                  <button type="button" className="login-show-btn" onClick={() => setShowPass(p => !p)}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <div className="login-divider">
              <div className="login-divider-line"/>
              <span className="login-divider-text">OR</span>
              <div className="login-divider-line"/>
            </div>

            <Link to="/signup" className="login-signup-btn">✨ Create a free account</Link>

            <div className="login-secure">🔐 Secure login · Your data is always private</div>
          </div>
        </div>
      </div>
    </>
  );
}
