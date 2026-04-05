import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function ShiftSettings() {
  const [shifts, setShifts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", start_time: "09:00", end_time: "18:00", grace_minutes: 15, min_hours: 8, is_default: false });

  useEffect(() => { fetchShifts(); }, []);

  async function fetchShifts() {
    const { data } = await supabase.from("shifts").select("*").order("start_time");
    if (data) setShifts(data);
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: "", start_time: "09:00", end_time: "18:00", grace_minutes: 15, min_hours: 8, is_default: false });
    setShowModal(true);
  }

  function openEdit(shift) {
    setEditing(shift.id);
    setForm({
      name: shift.name,
      start_time: shift.start_time?.substring(0, 5) || "09:00",
      end_time: shift.end_time?.substring(0, 5) || "18:00",
      grace_minutes: shift.grace_minutes,
      min_hours: Number(shift.min_hours),
      is_default: shift.is_default,
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (editing) {
      // If setting as default, unset others first
      if (form.is_default) {
        await supabase.from("shifts").update({ is_default: false }).neq("id", editing);
      }
      await supabase.from("shifts").update(form).eq("id", editing);
    } else {
      if (form.is_default) {
        await supabase.from("shifts").update({ is_default: false }).gt("id", 0);
      }
      await supabase.from("shifts").insert(form);
    }
    setShowModal(false);
    setEditing(null);
    fetchShifts();
  }

  async function handleDelete(id) {
    await supabase.from("shifts").delete().eq("id", id);
    fetchShifts();
  }

  function formatTime(t) {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:${m} ${ampm}`;
  }

  function calcDuration(start, end) {
    if (!start || !end) return "";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60; // overnight shift
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Shift Management</h2>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <i className="fas fa-plus" /> Add Shift
          </button>
        </div>

        <div style={{ padding: "0 20px 16px" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginBottom: 20 }}>
            Define work shifts with start/end times, grace periods, and minimum hours. Assign shifts to employees to track punctuality.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {shifts.map((shift) => (
              <div
                key={shift.id}
                style={{
                  border: `1px solid ${shift.is_default ? "var(--primary)" : "var(--gray-200)"}`,
                  borderRadius: "var(--radius)",
                  padding: "20px 24px",
                  background: shift.is_default ? "var(--primary-bg)" : "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <i className="fas fa-clock" style={{ fontSize: "1.1rem", color: shift.is_default ? "var(--primary)" : "var(--gray-400)" }} />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{shift.name}</span>
                      {shift.is_default && (
                        <span style={{ marginLeft: 8, background: "var(--primary)", color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: "0.68rem", fontWeight: 600 }}>DEFAULT</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(shift)}>
                      <i className="fas fa-edit" />
                    </button>
                    {!shift.is_default && (
                      <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDelete(shift.id)}>
                        <i className="fas fa-trash" />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginLeft: 36 }}>
                  <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}>
                    <span style={{ color: "var(--gray-500)" }}>Start: </span>
                    <strong>{formatTime(shift.start_time)}</strong>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}>
                    <span style={{ color: "var(--gray-500)" }}>End: </span>
                    <strong>{formatTime(shift.end_time)}</strong>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}>
                    <span style={{ color: "var(--gray-500)" }}>Duration: </span>
                    <strong>{calcDuration(shift.start_time, shift.end_time)}</strong>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}>
                    <span style={{ color: "var(--gray-500)" }}>Grace: </span>
                    <strong>{shift.grace_minutes} min</strong>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}>
                    <span style={{ color: "var(--gray-500)" }}>Min Hours: </span>
                    <strong>{shift.min_hours}h</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3>
              <i className={`fas ${editing ? "fa-edit" : "fa-plus-circle"}`} style={{ marginRight: 8, color: editing ? "var(--primary)" : "var(--success)" }} />
              {editing ? "Edit Shift" : "Add New Shift"}
            </h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Shift Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning Shift" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label>Grace Period (minutes)</label>
                  <input type="number" min="0" max="60" value={form.grace_minutes} onChange={(e) => setForm({ ...form, grace_minutes: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Minimum Hours</label>
                  <input type="number" min="1" max="12" step="0.5" value={form.min_hours} onChange={(e) => setForm({ ...form, min_hours: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label>Default Shift</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
                  <label className="toggle">
                    <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>{form.is_default ? "Yes — new employees get this shift" : "No"}</span>
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editing ? "Save Changes" : "Add Shift"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
