import { useState } from "react";
import { useData } from "../../../context/DataContext";
import { formatDate } from "../../../utils/helpers";

export default function HolidaySettings() {
  const { holidays: initialHolidays } = useData();
  const [holidays, setHolidays] = useState(
    initialHolidays.map((h, i) => ({ ...h, id: h.id || i + 1, enabled: true }))
  );
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ date: "", name: "", type: "festival" });

  const enabledCount = holidays.filter((h) => h.enabled).length;
  const nationalCount = holidays.filter((h) => h.type === "national" && h.enabled).length;
  const festivalCount = holidays.filter((h) => h.type === "festival" && h.enabled).length;
  const companyCount = holidays.filter((h) => h.type === "company" && h.enabled).length;

  function toggleHoliday(id) {
    setHolidays(holidays.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h)));
  }

  function enableAll() {
    setHolidays(holidays.map((h) => ({ ...h, enabled: true })));
  }

  function disableAll() {
    setHolidays(holidays.map((h) => ({ ...h, enabled: false })));
  }

  function addHoliday(e) {
    e.preventDefault();
    if (!form.date || !form.name.trim()) return;
    const newId = Math.max(...holidays.map((h) => h.id), 0) + 1;
    const updated = [...holidays, { id: newId, ...form, enabled: true }].sort((a, b) => a.date.localeCompare(b.date));
    setHolidays(updated);
    setForm({ date: "", name: "", type: "festival" });
    setShowAdd(false);
  }

  function startEdit(holiday) {
    setEditing(holiday.id);
    setForm({ date: holiday.date, name: holiday.name, type: holiday.type });
  }

  function saveEdit(e) {
    e.preventDefault();
    setHolidays(holidays.map((h) => (h.id === editing ? { ...h, ...form } : h)).sort((a, b) => a.date.localeCompare(b.date)));
    setEditing(null);
    setForm({ date: "", name: "", type: "festival" });
  }

  function deleteHoliday(id) {
    setHolidays(holidays.filter((h) => h.id !== id));
  }

  function getDayName(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" });
  }

  function getTypeBadge(type) {
    const styles = {
      national: { bg: "var(--primary-bg)", color: "var(--primary)", label: "National" },
      festival: { bg: "var(--warning-bg)", color: "var(--warning)", label: "Festival" },
      company: { bg: "var(--info-bg, #ecfeff)", color: "var(--info)", label: "Company" },
    };
    const s = styles[type] || styles.festival;
    return <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600 }}>{s.label}</span>;
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Holiday Calendar</h2>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowAdd(true); setEditing(null); setForm({ date: "", name: "", type: "festival" }); }}>
            <i className="fas fa-plus" /> Add Holiday
          </button>
        </div>

        {/* Summary */}
        <div style={{ display: "flex", gap: 12, padding: "0 20px 16px", flexWrap: "wrap" }}>
          <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "10px 16px", fontSize: "0.82rem", flex: 1, minWidth: 120, textAlign: "center" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--gray-900)" }}>{enabledCount}</div>
            <div style={{ color: "var(--gray-500)" }}>Total Active</div>
          </div>
          <div style={{ background: "var(--primary-bg)", borderRadius: 8, padding: "10px 16px", fontSize: "0.82rem", flex: 1, minWidth: 120, textAlign: "center" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--primary)" }}>{nationalCount}</div>
            <div style={{ color: "var(--primary)" }}>National</div>
          </div>
          <div style={{ background: "var(--warning-bg)", borderRadius: 8, padding: "10px 16px", fontSize: "0.82rem", flex: 1, minWidth: 120, textAlign: "center" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--warning)" }}>{festivalCount}</div>
            <div style={{ color: "var(--warning)" }}>Festival</div>
          </div>
          <div style={{ background: "var(--success-bg)", borderRadius: 8, padding: "10px 16px", fontSize: "0.82rem", flex: 1, minWidth: 120, textAlign: "center" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--success)" }}>{companyCount}</div>
            <div style={{ color: "var(--success)" }}>Company</div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div style={{ display: "flex", gap: 8, padding: "0 20px 16px" }}>
          <button className="btn btn-outline btn-sm" onClick={enableAll}><i className="fas fa-check-double" /> Enable All</button>
          <button className="btn btn-outline btn-sm" onClick={disableAll}><i className="fas fa-ban" /> Disable All</button>
        </div>

        {/* Holiday List */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Active</th>
                <th>Date</th>
                <th>Day</th>
                <th>Holiday Name</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id} style={{ opacity: h.enabled ? 1 : 0.5 }}>
                  <td>
                    <label className="toggle">
                      <input type="checkbox" checked={h.enabled} onChange={() => toggleHoliday(h.id)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td>{formatDate(h.date)}</td>
                  <td>{getDayName(h.date)}</td>
                  <td><strong>{h.name}</strong></td>
                  <td>{getTypeBadge(h.type)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(h)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => deleteHoliday(h.id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3><i className="fas fa-calendar-plus" style={{ marginRight: 8, color: "var(--success)" }} />Add Holiday</h3>
            <form onSubmit={addHoliday}>
              <div className="form-group">
                <label>Holiday Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Diwali" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="national">National</option>
                    <option value="festival">Festival</option>
                    <option value="company">Company</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Holiday Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3><i className="fas fa-edit" style={{ marginRight: 8, color: "var(--primary)" }} />Edit Holiday</h3>
            <form onSubmit={saveEdit}>
              <div className="form-group">
                <label>Holiday Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="national">National</option>
                    <option value="festival">Festival</option>
                    <option value="company">Company</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
