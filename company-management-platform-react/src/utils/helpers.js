export function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function getStatusBadge(status) {
  const map = {
    active: "badge-success",
    present: "badge-success",
    approved: "badge-success",
    paid: "badge-success",
    "on-leave": "badge-warning",
    pending: "badge-warning",
    absent: "badge-danger",
    rejected: "badge-danger",
    inactive: "badge-neutral",
  };
  return map[status] || "badge-neutral";
}

export function getAvatarColor(name) {
  const colors = ["#4f46e5", "#0891b2", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#db2777", "#059669"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function getCurrentTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function getCurrentDate() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function getDeptIcon(dept) {
  const icons = {
    Engineering: "fa-code",
    Design: "fa-palette",
    Marketing: "fa-bullhorn",
    Sales: "fa-chart-line",
    HR: "fa-users-cog",
    Finance: "fa-coins",
    Operations: "fa-cogs",
  };
  return icons[dept] || "fa-building";
}

export function getAnnouncementCategory(category) {
  const categories = {
    general: { label: "General", icon: "fa-info-circle", bg: "var(--primary-bg)", color: "var(--primary)" },
    event: { label: "Event", icon: "fa-calendar-check", bg: "var(--success-bg)", color: "var(--success)" },
    policy: { label: "Policy", icon: "fa-file-alt", bg: "var(--warning-bg)", color: "var(--warning)" },
    celebration: { label: "Celebration", icon: "fa-star", bg: "#fdf2f8", color: "#db2777" },
    urgent: { label: "Urgent", icon: "fa-exclamation-triangle", bg: "var(--danger-bg)", color: "var(--danger)" },
  };
  return categories[category] || categories.general;
}
