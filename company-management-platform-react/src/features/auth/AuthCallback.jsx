import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Try getting session (Supabase auto-detects tokens from URL)
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError("Auth error: " + sessionError.message);
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        if (data?.session) {
          // Session exists, redirect to dashboard
          navigate("/dashboard", { replace: true });
          return;
        }

        // No session yet — wait a moment and retry
        await new Promise((r) => setTimeout(r, 2000));
        const { data: retry } = await supabase.auth.getSession();
        if (retry?.session) {
          navigate("/dashboard", { replace: true });
        } else {
          setError("Could not establish session. Please try again.");
          setTimeout(() => navigate("/login"), 3000);
        }
      } catch (e) {
        setError("Error: " + e.message);
        setTimeout(() => navigate("/login"), 3000);
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16 }}>
      {error ? (
        <>
          <i className="fas fa-exclamation-circle" style={{ fontSize: "2rem", color: "var(--danger)" }} />
          <p style={{ color: "var(--danger)" }}>{error}</p>
          <p style={{ color: "var(--gray-400)", fontSize: "0.85rem" }}>Redirecting to login...</p>
        </>
      ) : (
        <>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: "1.5rem", color: "var(--gray-400)" }} />
          <p style={{ color: "var(--gray-500)" }}>Signing you in...</p>
        </>
      )}
    </div>
  );
}
