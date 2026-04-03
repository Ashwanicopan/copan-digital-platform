import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import copanLogo from "../../assets/images/copan-logo.png";

const ALLOWED_DOMAIN = "copancs.com";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function validateDomain(emailStr) {
    const domain = emailStr.split("@")[1]?.toLowerCase();
    return domain === ALLOWED_DOMAIN;
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
              <span>SSO Access</span>
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
            <p>Sign in with your @{ALLOWED_DOMAIN} email to continue.</p>
          </div>

          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
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

          <div className="login-sso-notice" style={{ textAlign: "center", marginTop: 20, padding: "14px", background: "var(--gray-50)", borderRadius: "var(--radius)", fontSize: "0.78rem", color: "var(--gray-500)" }}>
            <i className="fas fa-shield-alt" style={{ marginRight: 6, color: "var(--primary)" }} />
            SSO protected — only <strong>@{ALLOWED_DOMAIN}</strong> email addresses are authorized
          </div>

        </div>
      </div>
    </div>
  );
}
