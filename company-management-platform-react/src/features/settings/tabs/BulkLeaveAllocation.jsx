import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useData } from "../../../context/DataContext";

export default function BulkLeaveAllocation() {
  const { employees } = useData();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.from("leave_policies").select("id, type, total_days").order("id").then(({ data }) => {
      if (data) {
        setLeaveTypes(data);
        const alloc = {};
        data.forEach((lt) => { alloc[lt.id] = lt.total_days; });
        setAllocations(alloc);
      }
    });
  }, []);

  async function handleAllocate() {
    setSaving(true);
    const year = new Date().getFullYear();
    const entries = [];
    employees.forEach((emp) => {
      leaveTypes.forEach((lt) => {
        if (allocations[lt.id] > 0) {
          entries.push({ employee_id: emp.id, leave_policy_id: lt.id, balance: allocations[lt.id], used: 0, year });
        }
      });
    });
    // Upsert - delete existing and insert fresh
    await supabase.from("leave_balances").delete().eq("year", year);
    if (entries.length > 0) await supabase.from("leave_balances").insert(entries);
    setSaving(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Bulk Leave Allocation — {new Date().getFullYear()}</h2>
      </div>
      <div style={{ padding: "0 20px 20px" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginBottom: 20 }}>
          Allocate leaves to all {employees.length} employees at once for the current year. This will reset existing balances.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {leaveTypes.map((lt) => (
            <div key={lt.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "var(--gray-50)", borderRadius: "var(--radius)", border: "1px solid var(--gray-100)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{lt.type}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>Policy: {lt.total_days} days/year</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" min="0" step="0.5" value={allocations[lt.id] || 0} onChange={(e) => setAllocations({ ...allocations, [lt.id]: Number(e.target.value) })}
                  style={{ width: 80, padding: "6px 10px", border: "1px solid var(--gray-300)", borderRadius: 6, fontSize: "0.9rem", textAlign: "center" }} />
                <span style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>days each</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-primary" onClick={handleAllocate} disabled={saving}>
            <i className="fas fa-users" /> {saving ? "Allocating..." : `Allocate to all ${employees.length} employees`}
          </button>
          {done && <span style={{ color: "var(--success)", fontSize: "0.85rem", fontWeight: 600 }}><i className="fas fa-check-circle" /> Done! Leaves allocated.</span>}
        </div>
      </div>
    </div>
  );
}
