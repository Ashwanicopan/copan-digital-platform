import { useState } from "react";
import { useData } from "../../../context/DataContext";
import Badge from "../../../components/ui/Badge";

const defaultLegalEntities = [
  { id: 1, name: "Copan IND", description: "India operations", status: "active" },
  { id: 2, name: "Copan US", description: "US operations", status: "active" },
];

const defaultBusinessUnits = [
  { id: 1, name: "Product & Engineering", description: "Software development and product management", status: "active" },
  { id: 2, name: "Design Studio", description: "UI/UX and creative design", status: "active" },
  { id: 3, name: "People & Culture", description: "HR, recruitment, and employee experience", status: "active" },
];

export default function OrganizationSettings() {
  const { departments: deptNames, locations: locNames } = useData();

  const [activeTab, setActiveTab] = useState("legal");
  const [legalEntities, setLegalEntities] = useState(defaultLegalEntities);
  const [businessUnits, setBusinessUnits] = useState(defaultBusinessUnits);
  const [depts, setDepts] = useState(deptNames.map((d, i) => ({ id: i + 1, name: d, description: "", status: "active" })));
  const [locs, setLocs] = useState(locNames.map((l, i) => ({ id: i + 1, name: l, description: "", status: "active" })));

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", status: "active" });

  const tabs = [
    { id: "legal", label: "Legal Entities" },
    { id: "business", label: "Business Units" },
    { id: "departments", label: "Departments" },
    { id: "locations", label: "Locations" },
  ];

  const tabLabels = { legal: "Legal Entity", business: "Business Unit", departments: "Department", locations: "Location" };

  function getData() {
    if (activeTab === "legal") return legalEntities;
    if (activeTab === "business") return businessUnits;
    if (activeTab === "departments") return depts;
    return locs;
  }

  function setData(newData) {
    if (activeTab === "legal") setLegalEntities(newData);
    else if (activeTab === "business") setBusinessUnits(newData);
    else if (activeTab === "departments") setDepts(newData);
    else setLocs(newData);
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: "", description: "", status: "active" });
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item.id);
    setForm({ name: item.name, description: item.description, status: item.status });
    setShowModal(true);
  }

  function handleSave(e) {
    e.preventDefault();
    const data = getData();
    if (editing) {
      setData(data.map((d) => (d.id === editing ? { ...d, ...form } : d)));
    } else {
      const newId = Math.max(...data.map((d) => d.id), 0) + 1;
      setData([...data, { id: newId, ...form }]);
    }
    setShowModal(false);
    setEditing(null);
  }

  function handleDelete(id) {
    setData(getData().filter((d) => d.id !== id));
  }

  function toggleStatus(id) {
    const data = getData();
    setData(data.map((d) => (d.id === id ? { ...d, status: d.status === "active" ? "inactive" : "active" } : d)));
  }

  const data = getData();
  const label = tabLabels[activeTab];

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Organization Structure</h2>
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 16 }}>
            {tabs.map((t) => (
              <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Description + Add button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", margin: 0 }}>
              Manage {label.toLowerCase()}s for your organization
            </p>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <i className="fas fa-plus" /> Add {label}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>No {label.toLowerCase()}s added yet</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} style={{ opacity: item.status === "active" ? 1 : 0.5 }}>
                    <td><strong>{item.name}</strong></td>
                    <td className="text-sm text-muted">{item.description || "—"}</td>
                    <td><Badge status={item.status} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDelete(item.id)}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              <i className={`fas ${editing ? "fa-edit" : "fa-plus-circle"}`} style={{ marginRight: 8, color: editing ? "var(--primary)" : "var(--success)" }} />
              {editing ? `Edit ${label}` : `Add ${label}`}
            </h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={`e.g. ${activeTab === "legal" ? "Copan UK" : activeTab === "business" ? "Operations" : activeTab === "departments" ? "Engineering" : "London"}`} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 20 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editing ? "Save Changes" : `Add ${label}`}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
