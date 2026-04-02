import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { COMPANY, LEAVE_REQUESTS_DATA } from "../../data/mockData";

const navItems = [
  { section: "Main", items: [
    { to: "/dashboard", icon: "fa-th-large", label: "Dashboard" },
    { to: "/employees", icon: "fa-users", label: "Employees" },
    { to: "/attendance", icon: "fa-clock", label: "Attendance" },
    { to: "/leave", icon: "fa-calendar-alt", label: "Leave", badge: true },
    { to: "/payroll", icon: "fa-wallet", label: "Payroll", adminOnly: true },
  ]},
  { section: "Organization", items: [
    { to: "/settings", icon: "fa-cog", label: "Settings", adminOnly: true },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pendingLeaves = LEAVE_REQUESTS_DATA.filter((l) => l.status === "pending").length;
  const isAdmin = user?.isAdmin;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo">CD</div>
        <div>
          <div className="brand-name">Copan Digital</div>
          <div className="brand-sub">HR Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => {
          const visibleItems = section.items.filter((item) => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;
          return (
            <div className="nav-section" key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                >
                  <i className={`fas ${item.icon}`} />
                  {item.label}
                  {item.badge && pendingLeaves > 0 && isAdmin && (
                    <span className="nav-badge">{pendingLeaves}</span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={logout} title="Sign out">
          <div className="avatar" style={{ background: "var(--primary-light)", width: 34, height: 34, fontSize: "0.75rem" }}>
            {user?.avatar}
          </div>
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
