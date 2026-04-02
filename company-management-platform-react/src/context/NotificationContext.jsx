import { createContext, useContext, useState } from "react";
import { NOTIFICATIONS_DATA } from "../data/mockData";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
