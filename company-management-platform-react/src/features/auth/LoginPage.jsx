import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import copanLogo from "../../assets/images/copan-logo.png";

const ALLOWED_DOMAIN = "copancs.com";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleGoogleLogin() {
    setError("");
    setIsLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) {
      setError(result.message);
      setIsLoading(false);
    }
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

          <button
            type="button"
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            style={{ width: "100%", marginBottom: 20, padding: "14px", fontSize: "0.95rem", fontWeight: 600 }}
          >
            {isLoading ? (
              <span className="login-spinner" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Sign in with Google
              </>
            )}
          </button>

          <div style={{ textAlign: "center", padding: "14px", background: "var(--gray-50)", borderRadius: "var(--radius)", fontSize: "0.78rem", color: "var(--gray-500)" }}>
            <i className="fas fa-shield-alt" style={{ marginRight: 6, color: "var(--primary)" }} />
            SSO protected — only <strong>@{ALLOWED_DOMAIN}</strong> employees can access this portal
          </div>

        </div>
      </div>
    </div>
  );
}
