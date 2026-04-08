import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Badge from "../../components/ui/Badge";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { formatDate } from "../../utils/helpers";

const categories = ["Laptop", "Monitor", "Keyboard", "Mouse", "Headset", "Phone", "ID Card", "Other"];

export default function AssetsPage() {
  const { employees } = useData();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", category: "Laptop", serial_number: "", employee_id: "", status: "available", notes: "" });

  useEffect(() => { fetchAssets(); }, []);

  async function fetchAssets() {
    const { data } = await supabase.from("assets").select("*").order("created_at", { ascending: false });
    if (data) setAssets(data);
  }

  function openAdd() { setEditing(null); setForm({ name: "", category: "Laptop", serial_number: "", employee_id: "", status: "available", notes: "" }); setShowModal(true); }
  function openEdit(a) { setEditing(a.id); setForm({ name: a.name, category: a.category, serial_number: a.serial_number || "", employee_id: a.employee_id ? String(a.employee_id) : "", status: a.status, notes: a.notes || "" }); setShowModal(true); }

  async function handleSave(e) {
    e.preventDefault();
    const payload = { ...form, employee_id: form.employee_id ? Number(form.employee_id) : null, assigned_date: form.employee_id ? new Date().toISOString().split("T")[0] : null };
    if (editing) { await supabase.from("assets").update(payload).eq("id", editing); }
    else { await supabase.from("assets").insert(payload); }
    setShowModal(false); fetchAssets();
  }

  async function handleDelete(id) { await supabase.from("assets").delete().eq("id", id); fetchAssets(); }

  const assigned = assets.filter((a) => a.status === "assigned").length;
  const available = assets.filter((a) => a.status === "available").length;

  return (
    <>
      <Header title="Asset Management" />
      <div className="page-content">
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {[["Total Assets", assets.length, "var(--primary)"], ["Assigned", assigned, "var(--success)"], ["Available", available, "var(--info)"]].map(([l,v,c]) => (
            <div key={l} className="stat-card" style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: c }}>{v}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{l}</div></div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>All Assets</h2>
            {isAdmin && <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus" /> Add Asset</button>}
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Asset</th><th>Category</th><th>Serial No.</th><th>Assigned To</th><th>Date</th><th>Status</th>{isAdmin && <th>Actions</th>}</tr></thead>
              <tbody>
                {assets.length === 0 ? <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>No assets yet</td></tr> :
                assets.map((a) => {
                  const emp = employees.find((e) => e.id === a.employee_id);
                  return (
                    <tr key={a.id}>
                      <td><strong>{a.name}</strong></td>
                      <td>{a.category}</td>
                      <td className="text-sm">{a.serial_number || "—"}</td>
                      <td>{emp?.name || "—"}</td>
                      <td className="text-sm">{a.assigned_date ? formatDate(a.assigned_date) : "—"}</td>
                      <td><Badge status={a.status === "assigned" ? "active" : a.status === "available" ? "pending" : "inactive"} /></td>
                      {isAdmin && <td><div className="flex gap-1"><button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}><i className="fas fa-edit" /></button><button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDelete(a.id)}><i className="fas fa-trash" /></button></div></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Asset" : "Add Asset"}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Asset Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. MacBook Pro 14" required /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Serial Number</label><input type="text" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Assign To</label><select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value, status: e.target.value ? "assigned" : "available" })}><option value="">Unassigned</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="available">Available</option><option value="assigned">Assigned</option><option value="returned">Returned</option><option value="damaged">Damaged</option></select></div>
              </div>
              <div className="form-group"><label>Notes</label><input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editing ? "Save" : "Add Asset"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
