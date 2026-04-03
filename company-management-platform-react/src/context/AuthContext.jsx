import { createContext, useContext, useState } from "react";
import { USERS, TEAMS_DATA } from "../data/mockData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  function login(email, password) {
    if (email === "admin@copan.com" && password === "admin123") {
      setIsLoggedIn(true);
      setUser(USERS.admin);
      return { success: true };
    }
    if (email === "priya@copan.com" && password === "manager123") {
      setIsLoggedIn(true);
      setUser(USERS.manager);
      return { success: true };
    }
    if (email === "aarav@copan.com" && password === "emp123") {
      setIsLoggedIn(true);
      setUser(USERS.employee);
      return { success: true };
    }
    return { success: false, message: "Invalid email or password" };
  }

  function logout() {
    setIsLoggedIn(false);
    setUser(null);
  }

  function getTeamMemberIds() {
    if (!user) return [];
    const teams = TEAMS_DATA.filter((t) => t.managerId === user.id);
    const ids = new Set();
    teams.forEach((t) => t.memberIds.forEach((id) => ids.add(id)));
    return [...ids];
  }

  function canApproveLeave(employeeId) {
    if (!user) return false;
    if (user.isAdmin) return true;
    if (user.isManager) return getTeamMemberIds().includes(employeeId);
    return false;
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
