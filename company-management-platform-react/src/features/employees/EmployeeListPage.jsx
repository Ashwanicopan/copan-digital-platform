import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { EMPLOYEES_DATA, COMPANY } from "../../data/mockData";

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState(EMPLOYEES_DATA);
  const [form, setForm] = useState({ name: "", email: "", department: COMPANY.departments[0], designation: "", location: COMPANY.locations[0] });

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    const matchSearch = emp.name.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q) || emp.employeeId.toLowerCase().includes(q);
    const matchDept = !deptFilter || emp.department === deptFilter;
    const matchStatus = !statusFilter || emp.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const active = employees.filter((e) => e.status === "active").length;
  const onLeave = employees.filter((e) => e.status === "on-leave").length;

  function handleAdd(e) {
    e.preventDefault();
    const initials = form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    const newEmp = {
      ...form,
      id: employees.length + 1,
      phone: "",
      joinDate: new Date().toISOString().split("T")[0],
      salary: 0,
      status: "active",
      avatar: initials,
      manager: null,
      employeeId: "CD-" + (1000 + employees.length + 1),
    };
    setEmployees([...employees, newEmp]);
    setShowModal(false);
    setForm({ name: "", email: "", department: COMPANY.departments[0], designation: "", location: COMPANY.locations[0] });
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
              {COMPANY.departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus" /> Add Employee
          </button>
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
                {filtered.map((emp) => (
                  <tr key={emp.id} className="clickable-row" onClick={() => navigate(`/employees/${emp.id}`)}>
                    <td>
                      <div className="employee-cell">
                        <Avatar name={emp.name} initials={emp.avatar} />
                        <div><div className="name">{emp.name}</div><div className="sub">{emp.email}</div></div>
                      </div>
                    </td>
                    <td>{emp.employeeId}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.location}</td>
                    <td><Badge status={emp.status} /></td>
                  </tr>
                ))}
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
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {COMPANY.departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Designation</label>
            <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              {COMPANY.locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
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
