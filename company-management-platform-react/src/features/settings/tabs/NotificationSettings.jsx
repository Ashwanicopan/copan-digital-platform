import { useState } from "react";

const defaultSettings = [
  { label: "Leave request submitted", email: true, push: true },
  { label: "Leave approved / rejected", email: true, push: true },
  { label: "New employee onboarding", email: true, push: false },
  { label: "Payroll processed", email: true, push: true },
  { label: "Attendance anomalies", email: false, push: true },
  { label: "New announcements", email: true, push: true },
  { label: "Birthday reminders", email: false, push: false },
  { label: "Work anniversary", email: true, push: false },
];

export default function NotificationSettings() {
  const [settings, setSettings] = useState(defaultSettings);

  function toggle(index, field) {
    setSettings(settings.map((s, i) => (i === index ? { ...s, [field]: !s[field] } : s)));
  }

  return (
    <div className="card">
      <div className="card-header"><h2>Notification Preferences</h2></div>
      <div className="table-container">
        <table>
          <thead><tr><th>Event</th><th>Email</th><th>Push Notification</th></tr></thead>
          <tbody>
            {settings.map((s, i) => (
              <tr key={s.label}>
                <td>{s.label}</td>
                <td>
                  <label className="toggle">
                    <input type="checkbox" checked={s.email} onChange={() => toggle(i, "email")} />
                    <span className="toggle-slider" />
                  </label>
                </td>
                <td>
                  <label className="toggle">
                    <input type="checkbox" checked={s.push} onChange={() => toggle(i, "push")} />
                    <span className="toggle-slider" />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-actions" style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={() => alert("Notification preferences saved!")}>
          <i className="fas fa-check" /> Save Preferences
        </button>
      </div>
    </div>
  );
}
