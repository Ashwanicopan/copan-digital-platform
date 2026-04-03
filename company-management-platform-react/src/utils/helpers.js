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

export function numberToWords(num) {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }
  return convert(Math.round(num)) + " Rupees only";
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
