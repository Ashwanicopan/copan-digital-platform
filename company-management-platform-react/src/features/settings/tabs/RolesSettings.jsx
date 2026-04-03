import { useState } from "react";

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

const defaultRoles = [
  {
    id: 1, name: "Super Admin", users: 1, color: "var(--danger)",
    permissions: { dashboard: "full", employees: "full", attendance: "full", leave: "full", payroll: "full", settings: "full", announcements: "full", teams: "full" },
  },
  {
    id: 2, name: "HR Manager", users: 1, color: "var(--primary)",
    permissions: { dashboard: "full", employees: "manage", attendance: "manage", leave: "manage", payroll: "manage", settings: "manage", announcements: "manage", teams: "view" },
  },
  {
    id: 3, name: "Manager", users: 3, color: "var(--success)",
    permissions: { dashboard: "view", employees: "view", attendance: "view", leave: "manage", payroll: "none", settings: "none", announcements: "view", teams: "view" },
  },
  {
    id: 4, name: "Employee", users: 7, color: "var(--gray-500)",
    permissions: { dashboard: "view", employees: "none", attendance: "view", leave: "view", payroll: "none", settings: "none", announcements: "view", teams: "view" },
  },
];

const colorOptions = [
  { label: "Red", value: "var(--danger)" },
  { label: "Blue", value: "var(--primary)" },
  { label: "Green", value: "var(--success)" },
  { label: "Orange", value: "var(--warning)" },
  { label: "Teal", value: "var(--info)" },
  { label: "Gray", value: "var(--gray-500)" },
];

function getPermissionSummary(perms) {
  const full = Object.values(perms).filter((v) => v === "full").length;
  const manage = Object.values(perms).filter((v) => v === "manage").length;
  const view = Object.values(perms).filter((v) => v === "view").length;
  const parts = [];
  if (full === allModules.length) return "Full access to all modules";
  if (full > 0) parts.push(`${full} full access`);
  if (manage > 0) parts.push(`${manage} manage`);
  if (view > 0) parts.push(`${view} view only`);
  return parts.join(", ") || "No access";
}

function PermissionBadge({ level }) {
  const styles = {
    full: { background: "var(--success-bg)", color: "var(--success)" },
    manage: { background: "var(--primary-bg)", color: "var(--primary)" },
    view: { background: "var(--warning-bg)", color: "var(--warning)" },
    none: { background: "var(--gray-100)", color: "var(--gray-400)" },
  };
  const labels = { full: "Full Access", manage: "Manage", view: "View Only", none: "No Access" };
  return (
    <span style={{ ...styles[level], padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600 }}>
      {labels[level]}
    </span>
  );
}

export default function RolesSettings() {
  const [roles, setRoles] = useState(defaultRoles);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(null);

  function startEdit(role) {
    setEditing(role.id);
    setForm({ ...role, permissions: { ...role.permissions } });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(null);
  }

  function saveEdit() {
    setRoles(roles.map((r) => (r.id === editing ? { ...form } : r)));
    setEditing(null);
    setForm(null);
  }

  function deleteRole(id) {
    setRoles(roles.filter((r) => r.id !== id));
  }

  function openAdd() {
    const emptyPerms = {};
    allModules.forEach((m) => { emptyPerms[m.key] = "none"; });
    setAddForm({ name: "", color: "var(--primary)", permissions: emptyPerms });
    setShowAdd(true);
  }

  function saveAdd() {
    if (!addForm.name.trim()) return;
    const newId = Math.max(...roles.map((r) => r.id), 0) + 1;
    setRoles([...roles, { ...addForm, id: newId, users: 0 }]);
    setShowAdd(false);
    setAddForm(null);
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
              <select
                value={formObj.permissions[mod.key]}
                onChange={(e) => {
                  const perms = { ...formObj.permissions, [mod.key]: e.target.value };
                  setFormFn({ ...formObj, permissions: perms });
                }}
                style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--gray-300)", fontSize: "0.8rem", fontFamily: "inherit", minWidth: 130 }}
              >
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

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Roles & Permissions</h2>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus" /> Add Role</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Users</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: r.color, display: "inline-block", flexShrink: 0 }} />
                      <strong>{r.name}</strong>
                    </div>
                  </td>
                  <td>{r.users}</td>
                  <td className="text-sm text-muted">{getPermissionSummary(r.permissions)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(r)}>
                        <i className="fas fa-edit" />
                      </button>
                      {r.name !== "Super Admin" && (
                        <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => deleteRole(r.id)}>
                          <i className="fas fa-trash" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editing && form && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <h3><i className="fas fa-shield-alt" style={{ marginRight: 8, color: "var(--primary)" }} />Edit Role - {form.name}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Role Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Color</label>
                <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
                  {colorOptions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label style={{ marginBottom: 12 }}>Module Permissions</label>
              {renderPermissionEditor(form, setForm)}
            </div>
            <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" onClick={cancelEdit}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAdd && addForm && (
        <div className="modal-overlay" onClick={() => { setShowAdd(false); setAddForm(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <h3><i className="fas fa-plus-circle" style={{ marginRight: 8, color: "var(--success)" }} />Add New Role</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Role Name</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="e.g. Team Lead" />
              </div>
              <div className="form-group">
                <label>Color</label>
                <select value={addForm.color} onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}>
                  {colorOptions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label style={{ marginBottom: 12 }}>Module Permissions</label>
              {renderPermissionEditor(addForm, setAddForm)}
            </div>
            <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" onClick={() => { setShowAdd(false); setAddForm(null); }}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={saveAdd} disabled={!addForm.name.trim()}>Add Role</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
