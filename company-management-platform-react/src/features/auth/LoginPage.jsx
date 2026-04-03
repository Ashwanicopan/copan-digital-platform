import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import copanLogo from "../../assets/images/copan-logo.png";

const ALLOWED_DOMAIN = "copancs.com";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function validateDomain(emailStr) {
    const domain = emailStr.split("@")[1]?.toLowerCase();
    return domain === ALLOWED_DOMAIN;
  }

  async function handleGoogleLogin() {
    setError("");
    setIsLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) {
      setError(result.message);
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateDomain(email)) {
      setError(`Access restricted to @${ALLOWED_DOMAIN} employees only`);
      return;
    }
    setIsLoading(true);
    const result = await login(email, password);
    if (!result.success) { setError(result.message); setIsLoading(false); }
  }

  return (
    <div className={`login-page ${mounted ? "login-mounted" : ""}`}>

      {/* Left branding panel */}
      <div className="login-brand-panel">
        <div className="lp-bg">
          <div className="lp-blob lp-blob-1" />
          <div className="lp-blob lp-blob-2" />
        </div>

        <div className="login-brand-content">
          <div className="login-brand-logo">
            <img src={copanLogo} alt="Copan" className="login-brand-logo-img" />
          </div>

          <h2 className="lp-headline">Everything HR,<br />Simplified.</h2>
          <p className="login-brand-tagline">Streamline your workforce management with one powerful platform.</p>

          <div className="lp-feature-grid">
            <div className="lp-feat">
              <div className="lp-feat-icon"><i className="fas fa-calendar-check" /></div>
              <span>Leave & Attendance</span>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon"><i className="fas fa-user-plus" /></div>
              <span>Self-Onboarding</span>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon"><i className="fas fa-wallet" /></div>
              <span>Payroll</span>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon"><i className="fas fa-umbrella-beach" /></div>
              <span>Holiday List</span>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon"><i className="fas fa-chart-pie" /></div>
              <span>Analytics</span>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon"><i className="fas fa-lock" /></div>
              <span>Google SSO</span>
            </div>
          </div>

          <div className="login-brand-stats">
            <div className="login-brand-stat">
              <span className="login-brand-stat-num">500+</span>
              <span className="login-brand-stat-label">Employees</span>
            </div>
            <div className="login-brand-stat-divider" />
            <div className="login-brand-stat">
              <span className="login-brand-stat-num">12</span>
              <span className="login-brand-stat-label">Departments</span>
            </div>
            <div className="login-brand-stat-divider" />
            <div className="login-brand-stat">
              <span className="login-brand-stat-num">98%</span>
              <span className="login-brand-stat-label">Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in with your @{ALLOWED_DOMAIN} Google account to continue.</p>
          </div>

          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle" />
              {error}
            </div>
          )}

          {/* Google SSO - Primary */}
          <button
            type="button"
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            style={{ width: "100%", marginBottom: 16, padding: "14px", fontSize: "0.95rem", fontWeight: 600 }}
          >
            {isLoading && !showManualLogin ? (
              <span className="login-spinner" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Sign in with Google (@{ALLOWED_DOMAIN})
              </>
            )}
          </button>

          <div className="login-sso-notice" style={{ textAlign: "center", padding: "12px", background: "var(--gray-50)", borderRadius: "var(--radius)", fontSize: "0.78rem", color: "var(--gray-500)", marginBottom: 20 }}>
            <i className="fas fa-shield-alt" style={{ marginRight: 6, color: "var(--primary)" }} />
            Uses your existing <strong>@{ALLOWED_DOMAIN}</strong> Google Workspace password
          </div>

          {/* Manual login toggle */}
          <div className="login-or-divider"><span>or sign in with password</span></div>

          {!showManualLogin ? (
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: "100%", marginTop: 16 }}
              onClick={() => setShowManualLogin(true)}
            >
              <i className="fas fa-key" /> Use email & password instead
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="login-form" style={{ marginTop: 16 }}>
              <div className="login-input-group">
                <label>Email Address</label>
                <div className="login-input-wrapper">
                  <i className="fas fa-envelope" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder={`name@${ALLOWED_DOMAIN}`} required autoFocus />
                </div>
              </div>
              <div className="login-input-group">
                <label>Password</label>
                <div className="login-input-wrapper">
                  <i className="fas fa-lock" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                  <button type="button" className="login-toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>
              <div className="login-options">
                <label className="login-remember"><input type="checkbox" defaultChecked /><span>Remember me</span></label>
                <a href="#" className="login-forgot">Forgot password?</a>
              </div>
              <button type="submit" className={`login-submit-btn ${isLoading ? "loading" : ""}`} disabled={isLoading}>
                {isLoading ? <span className="login-spinner" /> : (<>Sign In<i className="fas fa-arrow-right" /></>)}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
