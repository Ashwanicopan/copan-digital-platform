import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function LeavePolicySettings() {
  const [policies, setPolicies] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ type: "", total_days: 0, unit: "days", carry_forward: false, carry_forward_max: 0, encashable: false, accrual: "" });

  useEffect(() => { fetchPolicies(); }, []);

  async function fetchPolicies() {
    const { data } = await supabase.from("leave_policies").select("*").order("id");
    if (data) setPolicies(data);
  }

  function startEdit(policy) {
    setEditing(policy.id);
    setForm({ ...policy });
  }

  function cancelEdit() { setEditing(null); setForm(null); }

  async function saveEdit() {
    await supabase.from("leave_policies").update({
      type: form.type, total_days: form.total_days, unit: form.unit,
      carry_forward: form.carry_forward, carry_forward_max: form.carry_forward_max,
      encashable: form.encashable, accrual: form.accrual,
    }).eq("id", editing);
    setEditing(null); setForm(null);
    fetchPolicies();
  }

  async function deletePolicy(id) {
    await supabase.from("leave_policies").delete().eq("id", id);
    fetchPolicies();
  }

  async function addPolicy() {
    if (!addForm.type.trim()) return;
    await supabase.from("leave_policies").insert(addForm);
    setAddForm({ type: "", total_days: 0, unit: "days", carry_forward: false, carry_forward_max: 0, encashable: false, accrual: "" });
    setShowAdd(false);
    fetchPolicies();
  }

  function formatTotal(p) {
    if (p.unit === "as earned") return "As earned";
    return `${p.total_days} ${p.unit}`;
  }

  function formatCarryForward(p) {
    if (!p.carry_forward) return "No";
    return p.carry_forward_max > 0 ? `Yes (max ${p.carry_forward_max})` : "Yes";
  }

  function renderForm(f, setF, onSubmit, onCancel, title, submitLabel) {
    return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
          <h3>{title}</h3>
          <div className="form-group">
            <label>Leave Type</label>
            <input type="text" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label>Annual Quota</label>
              <input type="number" min="0" value={f.total_days} onChange={(e) => setF({ ...f, total_days: Number(e.target.value) })} disabled={f.unit === "as earned"} />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>
                <option value="days">Days</option>
                <option value="as earned">As Earned</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label>Carry Forward</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
                <label className="toggle">
                  <input type="checkbox" checked={f.carry_forward} onChange={(e) => setF({ ...f, carry_forward: e.target.checked, carry_forward_max: e.target.checked ? f.carry_forward_max : 0 })} />
                  <span className="toggle-slider" />
                </label>
                <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>{f.carry_forward ? "Yes" : "No"}</span>
              </div>
            </div>
            {f.carry_forward && (
              <div className="form-group">
                <label>Max Carry Forward Days</label>
                <input type="number" min="0" value={f.carry_forward_max} onChange={(e) => setF({ ...f, carry_forward_max: Number(e.target.value) })} />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Encashable</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
              <label className="toggle">
                <input type="checkbox" checked={f.encashable} onChange={(e) => setF({ ...f, encashable: e.target.checked })} />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>{f.encashable ? "Yes" : "No"}</span>
            </div>
          </div>
          <div className="form-group">
            <label>Accrual Method</label>
            <input type="text" value={f.accrual || ""} onChange={(e) => setF({ ...f, accrual: e.target.value })} placeholder="e.g. 1.5 days per month" />
          </div>
          <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
            <button className="btn btn-outline btn-sm" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={onSubmit}>{submitLabel}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Leave Policy</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><i className="fas fa-plus" /> Add Leave Type</button>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Leave Type</th><th>Annual Quota</th><th>Carry Forward</th><th>Encashable</th><th>Accrual</th><th>Actions</th></tr></thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.type}</strong></td>
                  <td>{formatTotal(p)}</td>
                  <td>{formatCarryForward(p)}</td>
                  <td>{p.encashable ? "Yes" : "No"}</td>
                  <td className="text-sm text-muted">{p.accrual}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}><i className="fas fa-edit" /></button>
                      <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => deletePolicy(p.id)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editing && form && renderForm(form, setForm, saveEdit, cancelEdit, `Edit - ${form.type}`, "Save Changes")}
      {showAdd && renderForm(addForm, setAddForm, addPolicy, () => setShowAdd(false), "Add New Leave Type", "Add Leave Type")}
    </>
  );
}
