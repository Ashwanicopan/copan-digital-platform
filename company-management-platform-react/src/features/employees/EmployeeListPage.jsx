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

const steps = [
  { id: 1, label: "Personal", icon: "fa-user" },
  { id: 2, label: "Employment", icon: "fa-briefcase" },
  { id: 3, label: "Salary & Bank", icon: "fa-wallet" },
  { id: 4, label: "Review", icon: "fa-check-circle" },
];

const emptyForm = {
  name: "", email: "", phone: "", dob: "",
  department: "", designation: "", location: "", shiftId: "", joinDate: new Date().toISOString().split("T")[0], managerId: "",
  salary: "", paymentMode: "Bank Transfer", bankName: "", bankAccount: "", pan: "", uan: "",
};

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, departments, locations, addEmployee } = useData();
  const isAdmin = user?.isAdmin;
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm, department: departments[0] || "", location: locations[0] || "" });
  const [step, setStep] = useState(1);
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

  function openAddModal() {
    const dept = departments[0] || "";
    const deptDesignations = designations[dept] || [];
    const defaultShift = shifts.find((s) => s.is_default);
    setForm({ ...emptyForm, department: dept, designation: deptDesignations[0] || "", location: locations[0] || "", shiftId: defaultShift ? String(defaultShift.id) : "" });
    setStep(1);
    setShowModal(true);
  }

  async function handleAdd() {
    const initials = form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    await addEmployee({
      ...form,
      shiftId: form.shiftId ? Number(form.shiftId) : null,
      managerId: form.managerId ? Number(form.managerId) : null,
      salary: Number(form.salary) || 0,
      status: "active",
      avatar: initials,
      employeeId: "CD-" + (1000 + employees.length + 1),
    });
    setShowModal(false);
  }

  function canGoNext() {
    if (step === 1) return form.name.trim() && form.email.trim();
    if (step === 2) return form.department && form.designation && form.shiftId;
    if (step === 3) return form.salary;
    return true;
  }

  function fmtShift(id) {
    const s = shifts.find((sh) => String(sh.id) === String(id));
    if (!s) return "—";
    const fmt = (t) => { const [h,m] = t.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr-12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`; };
    return `${s.name} (${fmt(s.start_time)} - ${fmt(s.end_time)})`;
  }

  function fmtManager(id) {
    const e = employees.find((emp) => emp.id === Number(id));
    return e ? `${e.name} — ${e.designation}` : "None";
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
                <tr><th>Employee</th><th>Employee ID</th><th>Department</th><th>Designation</th><th>Phone</th><th>Shift</th><th>Location</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>No employees found. Add your first employee to get started.</td></tr>
                ) : (
                  filtered.map((emp) => {
                    const empShift = shifts.find((s) => s.id === emp.shiftId);
                    const fmtT = (t) => { if (!t) return ""; const [h,m] = t.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr-12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`; };
                    return (
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
                        <td className="text-sm">{emp.phone || "—"}</td>
                        <td className="text-sm">{empShift ? <><div className="name">{empShift.name}</div><div className="sub">{fmtT(empShift.start_time)} - {fmtT(empShift.end_time)}</div></> : "—"}</td>
                        <td>{emp.location}</td>
                        <td><Badge status={emp.status} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stepper Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal stepper-modal" onClick={(e) => e.stopPropagation()}>
            {/* Gradient Header */}
            <div style={{ padding: "28px 32px 22px", background: "linear-gradient(135deg, var(--primary), #6366f1)", color: "#fff" }}>
              <h3 style={{ color: "#fff", margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 700 }}>Add New Employee</h3>
              <p style={{ fontSize: "0.82rem", opacity: 0.75, margin: 0 }}>Step {step} of {steps.length} — {steps[step - 1].label}</p>
            </div>

            {/* Stepper Track */}
            <div style={{ display: "flex", padding: "18px 32px", background: "#fafbfc", borderBottom: "1px solid var(--gray-100)", gap: 4, alignItems: "center" }}>
              {steps.map((s, i) => (
                <div key={s.id} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0, transition: "all 0.3s",
                    background: step > s.id ? "var(--success)" : step === s.id ? "var(--primary)" : "#e5e7eb",
                    color: step >= s.id ? "#fff" : "var(--gray-500)",
                    boxShadow: step === s.id ? "0 0 0 4px rgba(79,70,229,0.15)" : "none",
                  }}>
                    {step > s.id ? <i className="fas fa-check" style={{ fontSize: "0.7rem" }} /> : s.id}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: step === s.id ? 700 : 500, color: step === s.id ? "var(--primary)" : step > s.id ? "var(--success)" : "var(--gray-400)", whiteSpace: "nowrap" }}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && <div style={{ flex: 1, height: 2, borderRadius: 2, background: step > s.id ? "var(--success)" : "#e5e7eb", marginLeft: 4, transition: "background 0.3s" }} />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div style={{ padding: "28px 32px", minHeight: 280 }}>
              {step === 1 && (
                <>
                  <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}><i className="fas fa-info-circle" /> Enter the employee's personal information</div>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@copancs.com" required />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Date of Joining *</label>
                      <input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} required />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}><i className="fas fa-info-circle" /> Set the employee's role and work details</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group">
                      <label>Department *</label>
                      <select value={form.department} onChange={(e) => handleDeptChange(e.target.value)}>
                        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Designation *</label>
                      <select value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required>
                        <option value="">Select Designation</option>
                        {currentDesignations.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group">
                      <label>Location *</label>
                      <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                        {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Shift *</label>
                      <select value={form.shiftId} onChange={(e) => setForm({ ...form, shiftId: e.target.value })} required>
                        <option value="">Select Shift</option>
                        {shifts.map((s) => {
                          const fmt = (t) => { const [h,m] = t.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr-12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`; };
                          return <option key={s.id} value={s.id}>{s.name} ({fmt(s.start_time)} - {fmt(s.end_time)})</option>;
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Reporting Manager</label>
                    <select value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })}>
                      <option value="">No Manager</option>
                      {employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>)}
                    </select>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}><i className="fas fa-info-circle" /> Enter salary and banking details for payroll</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group">
                      <label>Monthly CTC (₹) *</label>
                      <input type="number" min="0" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. 50000" required />
                    </div>
                    <div className="form-group">
                      <label>Payment Mode</label>
                      <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
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
                </>
              )}

              {step === 4 && (
                <>
                  <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}><i className="fas fa-clipboard-check" /> Review all details before adding the employee</div>
                  {[
                    { title: "Personal Details", icon: "fa-user", color: "var(--primary)", fields: [
                      ["Name", form.name], ["Email", form.email], ["Phone", form.phone || "—"],
                      ["Date of Birth", form.dob || "—"], ["Date of Joining", form.joinDate],
                    ]},
                    { title: "Employment Details", icon: "fa-briefcase", color: "var(--success)", fields: [
                      ["Department", form.department], ["Designation", form.designation], ["Location", form.location],
                      ["Shift", fmtShift(form.shiftId)], ["Reporting Manager", fmtManager(form.managerId)],
                    ]},
                    { title: "Salary & Bank", icon: "fa-wallet", color: "var(--warning)", fields: [
                      ["Monthly CTC", form.salary ? `₹${Number(form.salary).toLocaleString("en-IN")}` : "—"],
                      ["Payment Mode", form.paymentMode], ["Bank", form.bankName || "—"], ["Account", form.bankAccount || "—"],
                      ["PAN", form.pan || "—"], ["UAN", form.uan || "—"],
                    ]},
                  ].map((section) => (
                    <div key={section.title} style={{ marginBottom: 14, padding: "16px 18px", background: "#fafbfc", borderRadius: 12, border: "1px solid var(--gray-100)" }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--gray-700)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                        <i className={`fas ${section.icon}`} style={{ color: section.color }} />{section.title}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
                        {section.fields.map(([label, value]) => (
                          <div key={label} style={{ fontSize: "0.8rem" }}>
                            <span style={{ color: "var(--gray-400)" }}>{label}: </span>
                            <strong style={{ color: "var(--gray-800)" }}>{value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 32px", borderTop: "1px solid var(--gray-100)", background: "#fafbfc" }}>
              <button className="btn btn-outline" style={{ minWidth: 110, height: 40, borderRadius: 10, fontWeight: 600 }} onClick={() => step === 1 ? setShowModal(false) : setStep(step - 1)}>
                {step === 1 ? "Cancel" : <><i className="fas fa-arrow-left" /> Back</>}
              </button>
              <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Step {step} of {steps.length}</span>
              {step < 4 ? (
                <button className="btn btn-primary" style={{ minWidth: 110, height: 40, borderRadius: 10, fontWeight: 600 }} onClick={() => setStep(step + 1)} disabled={!canGoNext()}>
                  Next <i className="fas fa-arrow-right" />
                </button>
              ) : (
                <button className="btn btn-primary" style={{ minWidth: 140, height: 40, borderRadius: 10, fontWeight: 600 }} onClick={handleAdd}>
                  <i className="fas fa-user-plus" /> Add Employee
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
