import { useState } from "react";

const defaultRules = [
  {
    id: 1,
    name: "No Attendance",
    icon: "fa-user-xmark",
    description: "Applied when an employee does not mark attendance for the day without approved leave",
    enabled: true,
    deductionType: "leave",
    deductionValue: 1,
    deductionUnit: "day(s) leave",
    gracePeriod: 0,
    gracePeriodUnit: "days",
  },
  {
    id: 2,
    name: "Late Arrival",
    icon: "fa-clock",
    description: "Applied when an employee clocks in after the designated start time",
    enabled: false,
    deductionType: "leave",
    deductionValue: 0.5,
    deductionUnit: "day(s) leave",
    gracePeriod: 15,
    gracePeriodUnit: "minutes",
    threshold: 3,
    thresholdNote: "late arrivals per month before penalty applies",
  },
  {
    id: 3,
    name: "Work Hours Shortage",
    icon: "fa-hourglass-half",
    description: "Applied when an employee works fewer than the minimum required hours in a day",
    enabled: false,
    deductionType: "salary",
    deductionValue: 0,
    deductionUnit: "% of daily salary",
    minimumHours: 8,
    minimumHoursNote: "minimum required hours per day",
  },
  {
    id: 4,
    name: "Missing Attendance Logs",
    icon: "fa-triangle-exclamation",
    description: "Applied when an employee has clock-in but no clock-out or vice versa",
    enabled: false,
    deductionType: "warning",
    deductionValue: 0,
    deductionUnit: "warning(s)",
    warningThreshold: 3,
    warningNote: "warnings before leave deduction applies",
  },
];

export default function PenaltyRulesSettings() {
  const [rules, setRules] = useState(defaultRules);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);

  function toggleRule(id) {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }

  function startEdit(rule) {
    setEditing(rule.id);
    setForm({ ...rule });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(null);
  }

  function saveEdit() {
    setRules(rules.map((r) => (r.id === editing ? { ...form } : r)));
    setEditing(null);
    setForm(null);
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Penalty Rules</h2>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginBottom: 20 }}>
            Configure penalty rules that automatically apply deductions when attendance violations occur.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {rules.map((rule) => (
              <div
                key={rule.id}
                style={{
                  border: `1px solid ${rule.enabled ? "var(--success)" : "var(--gray-200)"}`,
                  borderRadius: "var(--radius)",
                  padding: "20px 24px",
                  background: rule.enabled ? "var(--success-bg)" : "#fff",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: rule.enabled ? 12 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <i className={`fas ${rule.icon}`} style={{ fontSize: "1.1rem", color: rule.enabled ? "var(--success)" : "var(--gray-400)", width: 24 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--gray-900)" }}>{rule.name}</div>
                      {!rule.enabled && (
                        <div style={{ fontSize: "0.78rem", color: "var(--gray-400)", marginTop: 2 }}>{rule.description}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {rule.enabled && (
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(rule)}>
                        <i className="fas fa-pen" /> Edit
                      </button>
                    )}
                    <label className="toggle">
                      <input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                {rule.enabled && (
                  <div style={{ marginLeft: 36 }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginBottom: 4 }}>{rule.description}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 10 }}>
                      <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}>
                        <span style={{ color: "var(--gray-500)" }}>Deduction per incident: </span>
                        <strong>{rule.deductionValue} {rule.deductionUnit}</strong>
                      </div>
                      {rule.gracePeriod > 0 && (
                        <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}>
                          <span style={{ color: "var(--gray-500)" }}>Grace period: </span>
                          <strong>{rule.gracePeriod} {rule.gracePeriodUnit}</strong>
                        </div>
                      )}
                      {rule.threshold > 0 && (
                        <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}>
                          <span style={{ color: "var(--gray-500)" }}>Threshold: </span>
                          <strong>{rule.threshold} {rule.thresholdNote}</strong>
                        </div>
                      )}
                      {rule.minimumHours > 0 && (
                        <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}>
                          <span style={{ color: "var(--gray-500)" }}>Minimum hours: </span>
                          <strong>{rule.minimumHours} hours/day</strong>
                        </div>
                      )}
                      {rule.warningThreshold > 0 && (
                        <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}>
                          <span style={{ color: "var(--gray-500)" }}>Warnings before deduction: </span>
                          <strong>{rule.warningThreshold}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && form && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3>
              <i className={`fas ${form.icon}`} style={{ marginRight: 8, color: "var(--primary)" }} />
              Edit Rule - {form.name}
            </h3>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Deduction Type</label>
                <select value={form.deductionType} onChange={(e) => {
                  const type = e.target.value;
                  const units = { leave: "day(s) leave", salary: "% of daily salary", warning: "warning(s)" };
                  setForm({ ...form, deductionType: type, deductionUnit: units[type] });
                }}>
                  <option value="leave">Leave Deduction</option>
                  <option value="salary">Salary Deduction</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
              <div className="form-group">
                <label>Deduction Value</label>
                <input type="number" min="0" step="0.5" value={form.deductionValue} onChange={(e) => setForm({ ...form, deductionValue: Number(e.target.value) })} />
              </div>
            </div>
            {form.name === "Late Arrival" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label>Grace Period (minutes)</label>
                  <input type="number" min="0" value={form.gracePeriod || 0} onChange={(e) => setForm({ ...form, gracePeriod: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Monthly Threshold (incidents)</label>
                  <input type="number" min="1" value={form.threshold || 3} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} />
                </div>
              </div>
            )}
            {form.name === "Work Hours Shortage" && (
              <div className="form-group">
                <label>Minimum Required Hours per Day</label>
                <input type="number" min="1" max="12" step="0.5" value={form.minimumHours || 8} onChange={(e) => setForm({ ...form, minimumHours: Number(e.target.value) })} />
              </div>
            )}
            {form.name === "Missing Attendance Logs" && (
              <div className="form-group">
                <label>Warnings Before Leave Deduction</label>
                <input type="number" min="1" value={form.warningThreshold || 3} onChange={(e) => setForm({ ...form, warningThreshold: Number(e.target.value) })} />
              </div>
            )}
            <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" onClick={cancelEdit}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
