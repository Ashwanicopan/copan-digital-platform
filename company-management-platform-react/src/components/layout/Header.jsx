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
    <header className="top-header">
      <h1>{title}</h1>
      <div className="flex items-center gap-3">
        <div className="search-box">
          <i className="fas fa-search" />
          <input type="text" placeholder="Search..." />
        </div>

        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`} />
        </button>

        <div className="notif-wrapper" ref={ref}>
          <button className="notif-bell" onClick={() => setOpen(!open)}>
            <i className="fas fa-bell" />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          <div className={`notif-dropdown ${open ? "open" : ""}`}>
            <div className="notif-dropdown-header">
              <span className="notif-dropdown-title">Notifications</span>
              {unreadCount > 0 && (
                <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
              )}
            </div>
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <i className="fas fa-bell-slash" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.read ? "" : "unread"}`}
                    onClick={() => handleNotifClick(n)}
                  >
                    <div className={`notif-icon notif-icon-${n.type}`}>
                      <i className={`fas ${n.icon}`} />
                    </div>
                    <div className="notif-content">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time"><i className="far fa-clock" /> {n.time}</div>
                    </div>
                    {!n.read && <div className="notif-unread-dot" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
