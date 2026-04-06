import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";

const typeToRoute = {
  leave: "/leave",
  payroll: "/payroll",
  attendance: "/attendance",
  employee: "/employees",
  announcement: "/announcements",
};

export default function Header({ title }) {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleNotifClick(n) {
    markAsRead(n.id);
    setOpen(false);
    navigate(typeToRoute[n.type] || "/dashboard");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-8 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" placeholder="Search..." className="h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-56" />
        </div>

        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`} />
        </button>

        <div className="relative" ref={ref}>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative" onClick={() => setOpen(!open)}>
            <i className="fas fa-bell" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[0.6rem] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium" onClick={markAllRead}>Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <i className="fas fa-bell-slash text-2xl mb-2 block" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${!n.read ? "bg-indigo-50/40" : ""}`}
                      onClick={() => handleNotifClick(n)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                        <i className={`fas ${n.icon} text-indigo-600 text-xs`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{n.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1"><i className="far fa-clock mr-1" />{n.time}</div>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
