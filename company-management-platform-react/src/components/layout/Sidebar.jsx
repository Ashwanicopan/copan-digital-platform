import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import copanLogo from "../../assets/images/copan-logo.png";

const navItems = [
  { section: "Main", items: [
    { to: "/dashboard", icon: "fa-th-large", label: "Dashboard" },
    { to: "/employees", icon: "fa-users", label: "Employees" },
    { to: "/attendance", icon: "fa-clock", label: "Attendance" },
    { to: "/leave", icon: "fa-calendar-alt", label: "Leave", badge: true },
    { to: "/expenses", icon: "fa-receipt", label: "Expenses" },
    { to: "/documents", icon: "fa-folder-open", label: "Documents" },
  ]},
  { section: "Organization", items: [
    { to: "/payroll", icon: "fa-wallet", label: "Payroll", adminOnly: true },
    { to: "/assets", icon: "fa-laptop", label: "Assets", adminOnly: true },
    { to: "/reports", icon: "fa-chart-bar", label: "Reports", adminOnly: true },
    { to: "/settings", icon: "fa-cog", label: "Settings", adminOnly: true },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { leaveRequests } = useData();
  const navigate = useNavigate();
  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending").length;
  const isAdmin = user?.isAdmin;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={copanLogo} alt="Copan" style={{ height: 28, width: "auto" }} />
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
        <div className="sidebar-user" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }} title="View Profile">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user?.name} referrerPolicy="no-referrer" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div className="avatar" style={{ background: "var(--primary-light)", width: 34, height: 34, fontSize: "0.75rem" }}>
              {user?.avatar}
            </div>
          )}
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
          <i className="fas fa-chevron-right" style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--gray-500)" }} />
        </div>
      </div>
    </aside>
  );
}
