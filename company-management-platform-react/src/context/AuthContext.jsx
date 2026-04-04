import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const ALLOWED_DOMAIN = "copancs.com";

function loadSavedUser() {
  try {
    const saved = localStorage.getItem("copan_user");
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const savedUser = loadSavedUser();
  const [isLoggedIn, setIsLoggedIn] = useState(!!savedUser);
  const [user, setUser] = useState(savedUser);
  const [loading, setLoading] = useState(!savedUser);

  const matchEmployee = useCallback(async (email) => {
    if (!email) return null;
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .ilike("email", email)
        .single();
      if (error || !data) return null;
      const initials = data.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
      return {
        id: data.id, name: data.name, email: data.email,
        role: data.is_admin ? "HR Admin" : data.is_manager ? "Manager" : "Employee",
        avatar: data.avatar || initials,
        isAdmin: data.is_admin || false, isManager: data.is_manager || false,
        department: data.department?.name || "", designation: data.designation || "",
      };
    } catch { return null; }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // If user is already loaded from localStorage, verify session is still valid
      if (savedUser) {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          // No Supabase session — still allow if user is in localStorage (password login)
        }
        if (mounted) setLoading(false);
        return;
      }

      // Check for existing Supabase session
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.email && mounted) {
        const matched = await matchEmployee(data.session.user.email);
        if (matched && mounted) {
          setIsLoggedIn(true);
          setUser(matched);
          localStorage.setItem("copan_user", JSON.stringify(matched));
        }
      }
      if (mounted) setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && mounted) {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem("copan_user");
      }
    });

    const timeout = setTimeout(() => { if (mounted) setLoading(false); }, 5000);

    return () => { mounted = false; clearTimeout(timeout); subscription.unsubscribe(); };
  }, [matchEmployee]);

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { hd: ALLOWED_DOMAIN },
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
    if (error) return { success: false, message: error.message };
    return { success: true };
  }

  async function login(email, password) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain !== ALLOWED_DOMAIN) {
      return { success: false, message: `Access restricted to @${ALLOWED_DOMAIN} employees only` };
    }
    const matched = await matchEmployee(email);
    if (!matched) return { success: false, message: "You are not registered as an employee. Contact your admin." };
    const { data } = await supabase.from("employees").select("password").ilike("email", email).single();
    if (data?.password && data.password === password) {
      setIsLoggedIn(true);
      setUser(matched);
      localStorage.setItem("copan_user", JSON.stringify(matched));
      return { success: true };
    }
    return { success: false, message: "Invalid password" };
  }

  async function logout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("copan_user");
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn, user, login, loginWithGoogle, logout, loading,
      canApproveLeave: () => user?.isAdmin || user?.isManager || false,
      getTeamMemberIds: () => [],
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
