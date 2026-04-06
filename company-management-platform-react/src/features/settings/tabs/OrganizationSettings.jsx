import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Badge from "../../../components/ui/Badge";

export default function OrganizationSettings() {
  const [activeTab, setActiveTab] = useState("departments");
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "" });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const { data: deptData } = await supabase.from("departments").select("*").order("name");
    if (deptData) setDepartments(deptData);
    const { data: locData } = await supabase.from("locations").select("*").order("name");
    if (locData) setLocations(locData);
  }

  const tabs = [
    { id: "departments", label: "Departments" },
    { id: "locations", label: "Locations" },
  ];

  function getData() {
    return activeTab === "departments" ? departments : locations;
  }

  const table = activeTab === "departments" ? "departments" : "locations";
  const label = activeTab === "departments" ? "Department" : "Location";
  const data = getData();

  function openAdd() {
    setEditing(null);
    setForm({ name: "" });
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item.id);
    setForm({ name: item.name });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (editing) {
      await supabase.from(table).update({ name: form.name }).eq("id", editing);
    } else {
      await supabase.from(table).insert({ name: form.name });
    }
    setShowModal(false);
    setEditing(null);
    fetchAll();
  }

  async function handleDelete(id) {
    await supabase.from(table).delete().eq("id", id);
    fetchAll();
  }

  return (
    <>
      <div className="card">
        <div className="card-header"><h2>Organization Structure</h2></div>
        <div style={{ padding: "0 20px" }}>
          <div className="tabs" style={{ marginBottom: 16 }}>
            {tabs.map((t) => (
              <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", margin: 0 }}>Manage {label.toLowerCase()}s for your organization</p>
            <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus" /> Add {label}</button>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Actions</th></tr></thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={2} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>No {label.toLowerCase()}s added yet</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}><i className="fas fa-edit" /></button>
                        <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDelete(item.id)}><i className="fas fa-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? `Edit ${label}` : `Add ${label}`}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editing ? "Save" : `Add ${label}`}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
