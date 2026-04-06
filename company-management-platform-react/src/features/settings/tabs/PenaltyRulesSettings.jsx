import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function PenaltyRulesSettings() {
  const [rules, setRules] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => { fetchRules(); }, []);

  async function fetchRules() {
    const { data } = await supabase.from("penalty_rules").select("*").order("id");
    if (data) setRules(data);
  }

  async function toggleRule(id, currentEnabled) {
    await supabase.from("penalty_rules").update({ enabled: !currentEnabled }).eq("id", id);
    fetchRules();
  }

  function startEdit(rule) {
    setEditing(rule.id);
    setForm({ ...rule });
  }

  async function saveEdit() {
    await supabase.from("penalty_rules").update({
      description: form.description, deduction_type: form.deduction_type,
      deduction_value: form.deduction_value, deduction_unit: form.deduction_unit,
      grace_period: form.grace_period, threshold: form.threshold,
      minimum_hours: form.minimum_hours, warning_threshold: form.warning_threshold,
    }).eq("id", editing);
    setEditing(null); setForm(null);
    fetchRules();
  }

  return (
    <>
      <div className="card">
        <div className="card-header"><h2>Penalty Rules</h2></div>
        <div style={{ padding: "0 20px 20px" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginBottom: 20 }}>
            Configure penalty rules that automatically apply deductions when attendance violations occur.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {rules.map((rule) => (
              <div key={rule.id} style={{ border: `1px solid ${rule.enabled ? "var(--success)" : "var(--gray-200)"}`, borderRadius: "var(--radius)", padding: "20px 24px", background: rule.enabled ? "var(--success-bg)" : "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: rule.enabled ? 12 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <i className={`fas ${rule.icon}`} style={{ fontSize: "1.1rem", color: rule.enabled ? "var(--success)" : "var(--gray-400)", width: 24 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{rule.name}</div>
                      {!rule.enabled && <div style={{ fontSize: "0.78rem", color: "var(--gray-400)", marginTop: 2 }}>{rule.description}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {rule.enabled && <button className="btn btn-outline btn-sm" onClick={() => startEdit(rule)}><i className="fas fa-pen" /> Edit</button>}
                    <label className="toggle"><input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule.id, rule.enabled)} /><span className="toggle-slider" /></label>
                  </div>
                </div>
                {rule.enabled && (
                  <div style={{ marginLeft: 36 }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginBottom: 10 }}>{rule.description}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}><span style={{ color: "var(--gray-500)" }}>Deduction: </span><strong>{rule.deduction_value} {rule.deduction_unit}</strong></div>
                      {rule.grace_period > 0 && <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}><span style={{ color: "var(--gray-500)" }}>Grace: </span><strong>{rule.grace_period} {rule.grace_period_unit}</strong></div>}
                      {rule.threshold > 0 && <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}><span style={{ color: "var(--gray-500)" }}>Threshold: </span><strong>{rule.threshold} {rule.threshold_note}</strong></div>}
                      {Number(rule.minimum_hours) > 0 && <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}><span style={{ color: "var(--gray-500)" }}>Min Hours: </span><strong>{rule.minimum_hours}h/day</strong></div>}
                      {rule.warning_threshold > 0 && <div style={{ background: "#fff", border: "1px solid var(--gray-200)", borderRadius: 6, padding: "8px 14px", fontSize: "0.82rem" }}><span style={{ color: "var(--gray-500)" }}>Warnings: </span><strong>{rule.warning_threshold} before deduction</strong></div>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {editing && form && (
        <div className="modal-overlay" onClick={() => { setEditing(null); setForm(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3><i className={`fas ${form.icon}`} style={{ marginRight: 8, color: "var(--primary)" }} />Edit - {form.name}</h3>
            <div className="form-group"><label>Description</label><textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group"><label>Deduction Type</label>
                <select value={form.deduction_type} onChange={(e) => { const t = e.target.value; const units = { leave: "day(s) leave", salary: "% of daily salary", warning: "warning(s)" }; setForm({ ...form, deduction_type: t, deduction_unit: units[t] }); }}>
                  <option value="leave">Leave Deduction</option><option value="salary">Salary Deduction</option><option value="warning">Warning</option>
                </select>
              </div>
              <div className="form-group"><label>Deduction Value</label><input type="number" min="0" step="0.5" value={form.deduction_value} onChange={(e) => setForm({ ...form, deduction_value: Number(e.target.value) })} /></div>
            </div>
            {form.name === "Late Arrival" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group"><label>Grace Period (min)</label><input type="number" min="0" value={form.grace_period} onChange={(e) => setForm({ ...form, grace_period: Number(e.target.value) })} /></div>
                <div className="form-group"><label>Monthly Threshold</label><input type="number" min="1" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
              </div>
            )}
            {form.name === "Work Hours Shortage" && (
              <div className="form-group"><label>Min Required Hours/Day</label><input type="number" min="1" max="12" step="0.5" value={form.minimum_hours} onChange={(e) => setForm({ ...form, minimum_hours: Number(e.target.value) })} /></div>
            )}
            {form.name === "Missing Attendance Logs" && (
              <div className="form-group"><label>Warnings Before Deduction</label><input type="number" min="1" value={form.warning_threshold} onChange={(e) => setForm({ ...form, warning_threshold: Number(e.target.value) })} /></div>
            )}
            <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" onClick={() => { setEditing(null); setForm(null); }}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
