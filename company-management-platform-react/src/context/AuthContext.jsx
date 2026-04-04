import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const ALLOWED_DOMAIN = "copancs.com";

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const matchEmployee = useCallback(async (email) => {
    if (!email) return null;
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*, department:departments(name), role:roles(name)")
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

  const loginUser = useCallback(async (email) => {
    const matched = await matchEmployee(email);
    if (matched) {
      setIsLoggedIn(true);
      setUser(matched);
      return true;
    }
    return false;
  }, [matchEmployee]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // 1. Check URL hash for tokens (implicit flow redirect from Google)
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          if (accessToken) {
            const { data } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            // Clean URL immediately so router stops showing spinner
            window.history.replaceState({}, "", window.location.pathname);
            if (data?.session?.user?.email && mounted) {
              await loginUser(data.session.user.email);
            }
            if (mounted) setLoading(false);
            return;
          }
        }

        // 2. Check URL query for code (PKCE flow)
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { data } = await supabase.auth.exchangeCodeForSession(code);
          window.history.replaceState({}, "", window.location.pathname);
          if (data?.session?.user?.email && mounted) {
            await loginUser(data.session.user.email);
          }
          if (mounted) setLoading(false);
          return;
        }

        // 3. Check existing session
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.email && mounted) {
          await loginUser(data.session.user.email);
        }
      } catch (e) {
        console.warn("Auth error:", e);
      }
      if (mounted) setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && mounted) {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [loginUser]);

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { hd: ALLOWED_DOMAIN },
        redirectTo: window.location.origin,
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
      return { success: true };
    }
    return { success: false, message: "Invalid password" };
  }

  async function logout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, loginWithGoogle, logout, canApproveLeave: () => user?.isAdmin || user?.isManager || false, getTeamMemberIds: () => [], loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
