import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { formatDate } from "../../../utils/helpers";

export default function HolidaySettings() {
  const [holidays, setHolidays] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ date: "", name: "", type: "festival" });

  useEffect(() => { fetchHolidays(); }, []);

  async function fetchHolidays() {
    const { data } = await supabase.from("holidays").select("*").order("date");
    if (data) setHolidays(data);
  }

  async function addHoliday(e) {
    e.preventDefault();
    if (!form.date || !form.name.trim()) return;
    await supabase.from("holidays").insert({ date: form.date, name: form.name, type: form.type });
    setForm({ date: "", name: "", type: "festival" });
    setShowAdd(false);
    fetchHolidays();
  }

  function startEdit(holiday) {
    setEditing(holiday.id);
    setForm({ date: holiday.date, name: holiday.name, type: holiday.type });
  }

  async function saveEdit(e) {
    e.preventDefault();
    await supabase.from("holidays").update({ date: form.date, name: form.name, type: form.type }).eq("id", editing);
    setEditing(null);
    setForm({ date: "", name: "", type: "festival" });
    fetchHolidays();
  }

  async function deleteHoliday(id) {
    await supabase.from("holidays").delete().eq("id", id);
    fetchHolidays();
  }

  function getDayName(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" });
  }

  function getTypeBadge(type) {
    const styles = {
      national: { bg: "var(--primary-bg)", color: "var(--primary)", label: "National" },
      festival: { bg: "var(--warning-bg)", color: "var(--warning)", label: "Festival" },
      company: { bg: "var(--success-bg)", color: "var(--success)", label: "Company" },
    };
    const s = styles[type] || styles.festival;
    return <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600 }}>{s.label}</span>;
  }

  const nationalCount = holidays.filter((h) => h.type === "national").length;
  const festivalCount = holidays.filter((h) => h.type === "festival").length;
  const companyCount = holidays.filter((h) => h.type === "company").length;

  function renderModal(onSubmit, title, submitLabel) {
    return (
      <div className="modal-overlay" onClick={() => { setShowAdd(false); setEditing(null); }}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>{title}</h3>
          <form onSubmit={onSubmit}>
            <div className="form-group"><label>Holiday Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
              <div className="form-group"><label>Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="national">National</option><option value="festival">Festival</option><option value="company">Company</option></select></div>
            </div>
            <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">{submitLabel}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Holiday Calendar</h2>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowAdd(true); setEditing(null); setForm({ date: "", name: "", type: "festival" }); }}><i className="fas fa-plus" /> Add Holiday</button>
        </div>
        <div style={{ display: "flex", gap: 12, padding: "0 20px 16px", flexWrap: "wrap" }}>
          <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "10px 16px", fontSize: "0.82rem", flex: 1, minWidth: 100, textAlign: "center" }}><div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{holidays.length}</div><div style={{ color: "var(--gray-500)" }}>Total</div></div>
          <div style={{ background: "var(--primary-bg)", borderRadius: 8, padding: "10px 16px", fontSize: "0.82rem", flex: 1, minWidth: 100, textAlign: "center" }}><div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--primary)" }}>{nationalCount}</div><div style={{ color: "var(--primary)" }}>National</div></div>
          <div style={{ background: "var(--warning-bg)", borderRadius: 8, padding: "10px 16px", fontSize: "0.82rem", flex: 1, minWidth: 100, textAlign: "center" }}><div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--warning)" }}>{festivalCount}</div><div style={{ color: "var(--warning)" }}>Festival</div></div>
          <div style={{ background: "var(--success-bg)", borderRadius: 8, padding: "10px 16px", fontSize: "0.82rem", flex: 1, minWidth: 100, textAlign: "center" }}><div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--success)" }}>{companyCount}</div><div style={{ color: "var(--success)" }}>Company</div></div>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Day</th><th>Holiday Name</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id}>
                  <td>{formatDate(h.date)}</td>
                  <td>{getDayName(h.date)}</td>
                  <td><strong>{h.name}</strong></td>
                  <td>{getTypeBadge(h.type)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(h)}><i className="fas fa-edit" /></button>
                      <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => deleteHoliday(h.id)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAdd && renderModal(addHoliday, "Add Holiday", "Add Holiday")}
      {editing && renderModal(saveEdit, "Edit Holiday", "Save Changes")}
    </>
  );
}
