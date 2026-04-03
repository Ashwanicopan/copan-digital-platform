import { useState } from "react";

const defaultPolicies = [
  { id: 1, type: "Casual Leave", total: 12, unit: "days", carryForward: false, carryForwardMax: 0, encashable: false, accrual: "Credited at start of year" },
  { id: 2, type: "Sick Leave", total: 7, unit: "days", carryForward: false, carryForwardMax: 0, encashable: false, accrual: "Credited at start of year" },
  { id: 3, type: "Earned Leave", total: 18, unit: "days", carryForward: true, carryForwardMax: 10, encashable: true, accrual: "1.5 days per month" },
  { id: 4, type: "Comp Off", total: 0, unit: "as earned", carryForward: false, carryForwardMax: 0, encashable: false, accrual: "As earned" },
  { id: 5, type: "Maternity Leave", total: 182, unit: "days", carryForward: false, carryForwardMax: 0, encashable: false, accrual: "As applicable" },
  { id: 6, type: "Paternity Leave", total: 15, unit: "days", carryForward: false, carryForwardMax: 0, encashable: false, accrual: "As applicable" },
];

export default function LeavePolicySettings() {
  const [policies, setPolicies] = useState(defaultPolicies);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ type: "", total: 0, unit: "days", carryForward: false, carryForwardMax: 0, encashable: false, accrual: "" });

  function startEdit(policy) {
    setEditing(policy.id);
    setForm({ ...policy });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(null);
  }

  function saveEdit() {
    setPolicies(policies.map((p) => (p.id === editing ? { ...form } : p)));
    setEditing(null);
    setForm(null);
  }

  function deletePolicy(id) {
    setPolicies(policies.filter((p) => p.id !== id));
  }

  function addPolicy() {
    if (!addForm.type.trim()) return;
    const newId = Math.max(...policies.map((p) => p.id), 0) + 1;
    setPolicies([...policies, { ...addForm, id: newId }]);
    setAddForm({ type: "", total: 0, unit: "days", carryForward: false, carryForwardMax: 0, encashable: false, accrual: "" });
    setShowAdd(false);
  }

  function formatTotal(p) {
    if (p.unit === "as earned") return "As earned";
    return `${p.total} ${p.unit}`;
  }

  function formatCarryForward(p) {
    if (!p.carryForward) return "No";
    return p.carryForwardMax > 0 ? `Yes (max ${p.carryForwardMax})` : "Yes";
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Leave Policy</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <i className="fas fa-plus" /> Add Leave Type
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Annual Quota</th>
                <th>Carry Forward</th>
                <th>Encashable</th>
                <th>Accrual</th>
                <th>Actions</th>
              </tr>
            </thead>
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
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => deletePolicy(p.id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 20, padding: 16, background: "var(--gray-50)", borderRadius: "var(--radius)" }}>
          <h3 className="text-sm font-semibold" style={{ marginBottom: 8 }}>Policy Notes</h3>
          <ul style={{ fontSize: "0.8rem", color: "var(--gray-500)", paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Leave year: January 1 to December 31</li>
            <li>Probation period: First 6 months (only sick leave available)</li>
            <li>Earned leave accrues at 1.5 days per month</li>
            <li>Sandwich rule applies to casual leave</li>
          </ul>
        </div>
      </div>

      {/* Edit Policy Modal */}
      {editing && form && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3><i className="fas fa-edit" style={{ marginRight: 8, color: "var(--primary)" }} />Edit Leave Policy - {form.type}</h3>
            <div className="form-group">
              <label>Leave Type</label>
              <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Annual Quota</label>
                <input type="number" min="0" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} disabled={form.unit === "as earned"} />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
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
                    <input type="checkbox" checked={form.carryForward} onChange={(e) => setForm({ ...form, carryForward: e.target.checked, carryForwardMax: e.target.checked ? form.carryForwardMax : 0 })} />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>{form.carryForward ? "Yes" : "No"}</span>
                </div>
              </div>
              {form.carryForward && (
                <div className="form-group">
                  <label>Max Carry Forward Days</label>
                  <input type="number" min="0" value={form.carryForwardMax} onChange={(e) => setForm({ ...form, carryForwardMax: Number(e.target.value) })} placeholder="0 = unlimited" />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Encashable</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
                <label className="toggle">
                  <input type="checkbox" checked={form.encashable} onChange={(e) => setForm({ ...form, encashable: e.target.checked })} />
                  <span className="toggle-slider" />
                </label>
                <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>{form.encashable ? "Yes" : "No"}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Accrual Method</label>
              <input type="text" value={form.accrual} onChange={(e) => setForm({ ...form, accrual: e.target.value })} placeholder="e.g. 1.5 days per month" />
            </div>
            <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" onClick={cancelEdit}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Policy Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3><i className="fas fa-plus-circle" style={{ marginRight: 8, color: "var(--success)" }} />Add New Leave Type</h3>
            <div className="form-group">
              <label>Leave Type</label>
              <input type="text" value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value })} placeholder="e.g. Bereavement Leave" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Annual Quota</label>
                <input type="number" min="0" value={addForm.total} onChange={(e) => setAddForm({ ...addForm, total: Number(e.target.value) })} disabled={addForm.unit === "as earned"} />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select value={addForm.unit} onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}>
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
                    <input type="checkbox" checked={addForm.carryForward} onChange={(e) => setAddForm({ ...addForm, carryForward: e.target.checked, carryForwardMax: e.target.checked ? addForm.carryForwardMax : 0 })} />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>{addForm.carryForward ? "Yes" : "No"}</span>
                </div>
              </div>
              {addForm.carryForward && (
                <div className="form-group">
                  <label>Max Carry Forward Days</label>
                  <input type="number" min="0" value={addForm.carryForwardMax} onChange={(e) => setAddForm({ ...addForm, carryForwardMax: Number(e.target.value) })} placeholder="0 = unlimited" />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Encashable</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
                <label className="toggle">
                  <input type="checkbox" checked={addForm.encashable} onChange={(e) => setAddForm({ ...addForm, encashable: e.target.checked })} />
                  <span className="toggle-slider" />
                </label>
                <span style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>{addForm.encashable ? "Yes" : "No"}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Accrual Method</label>
              <input type="text" value={addForm.accrual} onChange={(e) => setAddForm({ ...addForm, accrual: e.target.value })} placeholder="e.g. Credited at start of year" />
            </div>
            <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={addPolicy} disabled={!addForm.type.trim()}>Add Leave Type</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
