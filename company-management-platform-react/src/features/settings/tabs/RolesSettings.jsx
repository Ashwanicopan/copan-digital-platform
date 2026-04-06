import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

const allModules = [
  { key: "dashboard", label: "Dashboard", icon: "fa-th-large" },
  { key: "employees", label: "Employees", icon: "fa-users" },
  { key: "attendance", label: "Attendance", icon: "fa-clock" },
  { key: "leave", label: "Leave Management", icon: "fa-calendar-alt" },
  { key: "payroll", label: "Payroll", icon: "fa-wallet" },
  { key: "settings", label: "Settings", icon: "fa-cog" },
  { key: "announcements", label: "Announcements", icon: "fa-bullhorn" },
  { key: "teams", label: "Teams", icon: "fa-people-group" },
];

const permissionLevels = ["none", "view", "manage", "full"];

const colorOptions = [
  { label: "Red", value: "var(--danger)" },
  { label: "Blue", value: "var(--primary)" },
  { label: "Green", value: "var(--success)" },
  { label: "Orange", value: "var(--warning)" },
  { label: "Teal", value: "var(--info)" },
  { label: "Gray", value: "var(--gray-500)" },
];

function getPermissionSummary(perms) {
  if (!perms || typeof perms !== "object") return "No permissions set";
  const full = Object.values(perms).filter((v) => v === "full").length;
  const manage = Object.values(perms).filter((v) => v === "manage").length;
  const view = Object.values(perms).filter((v) => v === "view").length;
  if (full === allModules.length) return "Full access to all modules";
  const parts = [];
  if (full > 0) parts.push(`${full} full access`);
  if (manage > 0) parts.push(`${manage} manage`);
  if (view > 0) parts.push(`${view} view only`);
  return parts.join(", ") || "No access";
}

export default function RolesSettings() {
  const [roles, setRoles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(null);

  useEffect(() => { fetchRoles(); }, []);

  async function fetchRoles() {
    const { data } = await supabase.from("roles").select("*").order("id");
    if (data) setRoles(data);
  }

  function startEdit(role) {
    setEditing(role.id);
    setForm({ ...role, permissions: role.permissions || {} });
  }

  async function saveEdit() {
    await supabase.from("roles").update({ name: form.name, color: form.color, permissions: form.permissions }).eq("id", editing);
    setEditing(null); setForm(null);
    fetchRoles();
  }

  async function deleteRole(id) {
    await supabase.from("roles").delete().eq("id", id);
    fetchRoles();
  }

  function openAdd() {
    const emptyPerms = {};
    allModules.forEach((m) => { emptyPerms[m.key] = "none"; });
    setAddForm({ name: "", color: "var(--primary)", permissions: emptyPerms });
    setShowAdd(true);
  }

  async function saveAdd() {
    if (!addForm.name.trim()) return;
    await supabase.from("roles").insert({ name: addForm.name, color: addForm.color, permissions: addForm.permissions });
    setShowAdd(false); setAddForm(null);
    fetchRoles();
  }

  function setAllPermissions(formObj, setFormFn, level) {
    const perms = { ...formObj.permissions };
    allModules.forEach((m) => { perms[m.key] = level; });
    setFormFn({ ...formObj, permissions: perms });
  }

  function renderPermissionEditor(formObj, setFormFn) {
    return (
      <>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: "0.78rem", color: "var(--gray-500)", lineHeight: "28px", marginRight: 4 }}>Quick set:</span>
          {permissionLevels.map((level) => (
            <button key={level} className="btn btn-outline btn-sm" style={{ fontSize: "0.72rem", textTransform: "capitalize" }} onClick={() => setAllPermissions(formObj, setFormFn, level)}>
              {level === "none" ? "No Access" : level === "full" ? "Full Access" : level === "manage" ? "Manage" : "View Only"}
            </button>
          ))}
        </div>
        <div style={{ border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          {allModules.map((mod, i) => (
            <div key={mod.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < allModules.length - 1 ? "1px solid var(--gray-100)" : "none", background: i % 2 === 0 ? "transparent" : "var(--gray-50)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className={`fas ${mod.icon}`} style={{ width: 18, color: "var(--gray-400)", fontSize: "0.85rem" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{mod.label}</span>
              </div>
              <select value={formObj.permissions?.[mod.key] || "none"} onChange={(e) => { const perms = { ...formObj.permissions, [mod.key]: e.target.value }; setFormFn({ ...formObj, permissions: perms }); }} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--gray-300)", fontSize: "0.8rem", fontFamily: "inherit", minWidth: 130 }}>
                <option value="none">No Access</option>
                <option value="view">View Only</option>
                <option value="manage">Manage</option>
                <option value="full">Full Access</option>
              </select>
            </div>
          ))}
        </div>
      </>
    );
  }

  function renderModal(formObj, setFormFn, onSave, onCancel, title, submitLabel) {
    return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
          <h3>{title}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group"><label>Role Name</label><input type="text" value={formObj.name} onChange={(e) => setFormFn({ ...formObj, name: e.target.value })} /></div>
            <div className="form-group"><label>Color</label><select value={formObj.color} onChange={(e) => setFormFn({ ...formObj, color: e.target.value })}>{colorOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          </div>
          <div className="form-group">
            <label style={{ marginBottom: 12 }}>Module Permissions</label>
            {renderPermissionEditor(formObj, setFormFn)}
          </div>
          <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
            <button className="btn btn-outline btn-sm" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={onSave}>{submitLabel}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Roles & Permissions</h2>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus" /> Add Role</button>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Role</th><th>Permissions</th><th>Actions</th></tr></thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: r.color, display: "inline-block", flexShrink: 0 }} />
                      <strong>{r.name}</strong>
                    </div>
                  </td>
                  <td className="text-sm text-muted">{getPermissionSummary(r.permissions)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(r)}><i className="fas fa-edit" /></button>
                      {r.name !== "Super Admin" && <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => deleteRole(r.id)}><i className="fas fa-trash" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editing && form && renderModal(form, setForm, saveEdit, () => { setEditing(null); setForm(null); }, `Edit Role - ${form.name}`, "Save Changes")}
      {showAdd && addForm && renderModal(addForm, setAddForm, saveAdd, () => { setShowAdd(false); setAddForm(null); }, "Add New Role", "Add Role")}
    </>
  );
}
