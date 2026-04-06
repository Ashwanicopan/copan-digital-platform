import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { COMPANY } from "../../data/mockData";
import { supabase } from "../../lib/supabase";

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, departments, locations, addEmployee } = useData();
  const isAdmin = user?.isAdmin;
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", department: departments[0] || "", designation: "", location: locations[0] || "", shiftId: "", salary: "", bankName: "", bankAccount: "", pan: "", uan: "" });
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    supabase.from("shifts").select("*").order("start_time").then(({ data }) => {
      if (data) {
        setShifts(data);
        const defaultShift = data.find((s) => s.is_default);
        if (defaultShift) setForm((f) => ({ ...f, shiftId: String(defaultShift.id) }));
      }
    });
  }, []);

  const designations = COMPANY.designations || {};
  const currentDesignations = designations[form.department] || [];

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    const matchSearch = emp.name.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q) || emp.employeeId.toLowerCase().includes(q);
    const matchDept = !deptFilter || emp.department === deptFilter;
    const matchStatus = !statusFilter || emp.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const active = employees.filter((e) => e.status === "active").length;
  const onLeave = employees.filter((e) => e.status === "on-leave").length;

  function handleDeptChange(dept) {
    const deptDesignations = designations[dept] || [];
    setForm({ ...form, department: dept, designation: deptDesignations[0] || "" });
  }

  async function handleAdd(e) {
    e.preventDefault();
    const initials = form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    const defaultShift = shifts.find((s) => s.is_default);
    await addEmployee({
      ...form,
      shiftId: form.shiftId ? Number(form.shiftId) : null,
      salary: Number(form.salary) || 0,
      bankName: form.bankName,
      bankAccount: form.bankAccount,
      pan: form.pan,
      uan: form.uan,
      phone: "",
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      avatar: initials,
      manager: null,
      employeeId: "CD-" + (1000 + employees.length + 1),
    });
    setShowModal(false);
    setForm({ name: "", email: "", department: departments[0] || "", designation: "", location: locations[0] || "", shiftId: defaultShift ? String(defaultShift.id) : "", salary: "", bankName: "", bankAccount: "", pan: "", uan: "" });
  }

  function openAddModal() {
    const dept = departments[0] || "";
    const deptDesignations = designations[dept] || [];
    const defaultShift = shifts.find((s) => s.is_default);
    setForm({ name: "", email: "", department: dept, designation: deptDesignations[0] || "", location: locations[0] || "", shiftId: defaultShift ? String(defaultShift.id) : "", salary: "", bankName: "", bankAccount: "", pan: "", uan: "" });
    setShowModal(true);
  }

  return (
    <>
      <Header title="Employees" />
      <div className="page-content">
        <div className="employees-header">
          <div className="filters">
            <div className="search-box">
              <i className="fas fa-search" />
              <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openAddModal}>
              <i className="fas fa-plus" /> Add Employee
            </button>
          )}
        </div>

        <div className="employee-stats">
          <span className="employee-stat active-stat">All ({employees.length})</span>
          <span className="employee-stat">Active ({active})</span>
          <span className="employee-stat">On Leave ({onLeave})</span>
        </div>

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Employee</th><th>Employee ID</th><th>Department</th><th>Designation</th><th>Location</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>No employees found. Add your first employee to get started.</td></tr>
                ) : (
                  filtered.map((emp) => (
                    <tr key={emp.id} className="clickable-row" onClick={() => navigate(`/employees/${emp.id}`)}>
                      <td>
                        <div className="employee-cell">
                          <Avatar name={emp.name} initials={emp.avatar} avatarUrl={emp.avatarUrl} />
                          <div><div className="name">{emp.name}</div><div className="sub">{emp.email}</div></div>
                        </div>
                      </td>
                      <td>{emp.employeeId}</td>
                      <td>{emp.department}</td>
                      <td>{emp.designation}</td>
                      <td>{emp.location}</td>
                      <td><Badge status={emp.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Employee">
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select value={form.department} onChange={(e) => handleDeptChange(e.target.value)}>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Designation</label>
            <select value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required>
              <option value="">Select Designation</option>
              {currentDesignations.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Shift</label>
            <select value={form.shiftId} onChange={(e) => setForm({ ...form, shiftId: e.target.value })} required>
              <option value="">Select Shift</option>
              {shifts.map((s) => {
                const fmt = (t) => { const [h,m] = t.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr-12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`; };
                return <option key={s.id} value={s.id}>{s.name} ({fmt(s.start_time)} - {fmt(s.end_time)})</option>;
              })}
            </select>
          </div>

          <div style={{ borderTop: "1px solid var(--gray-200)", margin: "16px 0", paddingTop: 16 }}>
            <h4 style={{ fontSize: "0.85rem", color: "var(--gray-600)", marginBottom: 12 }}>Salary & Bank Details</h4>
          </div>
          <div className="form-group">
            <label>Monthly CTC (₹)</label>
            <input type="number" min="0" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. 50000" required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Bank Name</label>
              <input type="text" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="e.g. HDFC Bank" />
            </div>
            <div className="form-group">
              <label>Bank Account Number</label>
              <input type="text" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} placeholder="Account number" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>PAN Number</label>
              <input type="text" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} placeholder="e.g. ABCDE1234F" maxLength={10} />
            </div>
            <div className="form-group">
              <label>UAN Number</label>
              <input type="text" value={form.uan} onChange={(e) => setForm({ ...form, uan: e.target.value })} placeholder="Universal Account Number" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Employee</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
