import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import copanLogo from "../../assets/images/copan-logo.png";
import { cn } from "@/lib/utils";

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
  const { leaveRequests } = useData();
  const navigate = useNavigate();
  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending").length;
  const isAdmin = user?.isAdmin;

  return (
    <aside className="flex flex-col w-[260px] h-screen bg-slate-900 text-white fixed left-0 top-0 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <img src={copanLogo} alt="Copan" className="h-7 w-auto brightness-0 invert" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((section) => {
          const visibleItems = section.items.filter((item) => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;
          return (
            <div className="mb-6" key={section.section}>
              <div className="text-[0.65rem] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-2">
                {section.section}
              </div>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <i className={`fas ${item.icon} w-5 text-center`} />
                  {item.label}
                  {item.badge && pendingLeaves > 0 && isAdmin && (
                    <span className="ml-auto bg-amber-500 text-white text-[0.65rem] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {pendingLeaves}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/10 p-3">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-all"
          onClick={() => navigate("/profile")}
          title="View Profile"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user?.name} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
              {user?.avatar}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-slate-500">{user?.role}</div>
          </div>
          <i className="fas fa-chevron-right text-[0.6rem] text-slate-600" />
        </div>
      </div>
    </aside>
  );
}
