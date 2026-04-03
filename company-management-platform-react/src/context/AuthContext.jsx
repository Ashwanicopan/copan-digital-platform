import { createContext, useContext, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const ALLOWED_DOMAIN = "copancs.com";

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  async function login(email, password) {
    // Validate domain
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain !== ALLOWED_DOMAIN) {
      return { success: false, message: `Access restricted to @${ALLOWED_DOMAIN} employees only` };
    }

    try {
      // Check against Supabase employees table
      const { data, error } = await supabase
        .from("employees")
        .select("*, department:departments(name), role:roles(name)")
        .eq("email", email.toLowerCase())
        .eq("password", password)
        .single();

      if (error || !data) {
        return { success: false, message: "Invalid email or password" };
      }

      const initials = data.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

      setIsLoggedIn(true);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.is_admin ? "HR Admin" : data.is_manager ? "Manager" : "Employee",
        avatar: data.avatar || initials,
        isAdmin: data.is_admin || false,
        isManager: data.is_manager || false,
        department: data.department?.name || "",
        designation: data.designation || "",
      });
      return { success: true };
    } catch {
      return { success: false, message: "Invalid email or password" };
    }
  }

  function logout() {
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
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, canApproveLeave, getTeamMemberIds }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
