import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const ALLOWED_DOMAIN = "copancs.com";

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount (for Google SSO redirect)
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const matched = await matchEmployee(session.user.email);
        if (matched) {
          setIsLoggedIn(true);
          setUser(matched);
        }
      }
      setLoading(false);
    }
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const matched = await matchEmployee(session.user.email);
        if (matched) {
          setIsLoggedIn(true);
          setUser(matched);
        }
      }
      if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function matchEmployee(email) {
    const { data, error } = await supabase
      .from("employees")
      .select("*, department:departments(name), role:roles(name)")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) return null;

    const initials = data.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.is_admin ? "HR Admin" : data.is_manager ? "Manager" : "Employee",
      avatar: data.avatar || initials,
      isAdmin: data.is_admin || false,
      isManager: data.is_manager || false,
      department: data.department?.name || "",
      designation: data.designation || "",
    };
  }

  // Google SSO login
  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { hd: ALLOWED_DOMAIN },
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) return { success: false, message: error.message };
    return { success: true };
  }

  // Fallback email/password login (checks against employees table)
  async function login(email, password) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain !== ALLOWED_DOMAIN) {
      return { success: false, message: `Access restricted to @${ALLOWED_DOMAIN} employees only` };
    }

    const matched = await matchEmployee(email);
    if (!matched) {
      return { success: false, message: "You are not registered as an employee. Contact your admin." };
    }

    // Check password from employees table
    const { data } = await supabase
      .from("employees")
      .select("password")
      .eq("email", email.toLowerCase())
      .single();

    if (data?.password && data.password === password) {
      setIsLoggedIn(true);
      setUser(matched);
      return { success: true };
    }

    return { success: false, message: "Invalid password" };
  }

  async function logout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
  }

  function canApproveLeave(employeeId) {
    if (!user) return false;
    if (user.isAdmin) return true;
    if (user.isManager) return true;
    return false;
  }

  function getTeamMemberIds() {
    return [];
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, loginWithGoogle, logout, canApproveLeave, getTeamMemberIds, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
