import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Wait for Supabase to process the auth tokens
        let session = null;
        for (let i = 0; i < 5; i++) {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            session = data.session;
            break;
          }
          await new Promise((r) => setTimeout(r, 1000));
          setStatus(`Establishing session... (attempt ${i + 2})`);
        }

        if (!session) {
          setStatus("Could not establish session. Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const email = session.user.email;
        setStatus(`Authenticated as ${email}. Checking employee record...`);

        // Get Google avatar URL from auth user metadata
        const googleAvatarUrl = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null;

        // Look up employee
        const { data: emp, error } = await supabase
          .from("employees")
          .select("id, name, email, is_admin, is_manager, designation, avatar, avatar_url")
          .ilike("email", email)
          .single();

        if (error || !emp) {
          setStatus(`Employee not found for ${email}. Error: ${error?.message || "No record"}. Redirecting...`);
          await supabase.auth.signOut();
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Update avatar_url in database if we got one from Google
        if (googleAvatarUrl && googleAvatarUrl !== emp.avatar_url) {
          await supabase.from("employees").update({ avatar_url: googleAvatarUrl }).eq("id", emp.id);
        }

        const initials = emp.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
        const userData = {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          role: emp.is_admin ? "HR Admin" : emp.is_manager ? "Manager" : "Employee",
          avatar: emp.avatar || initials,
          avatarUrl: googleAvatarUrl || emp.avatar_url || null,
          isAdmin: emp.is_admin || false,
          isManager: emp.is_manager || false,
          designation: emp.designation || "",
        };
        localStorage.setItem("copan_user", JSON.stringify(userData));

        setStatus(`Welcome, ${emp.name}! Redirecting to dashboard...`);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } catch (e) {
        setStatus(`Error: ${e.message}. Redirecting to login...`);
        setTimeout(() => navigate("/login"), 3000);
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16 }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: "1.5rem", color: "var(--primary)" }} />
      <p style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>{status}</p>
    </div>
  );
}
