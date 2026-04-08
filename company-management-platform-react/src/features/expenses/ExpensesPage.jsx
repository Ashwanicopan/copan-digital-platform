import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { supabase } from "../../lib/supabase";
import { formatDate, formatCurrency } from "../../utils/helpers";

const expenseCategories = ["Travel", "Meals", "Accommodation", "Transport", "Office Supplies", "Software", "Training", "Other"];

export default function ExpensesPage() {
  const { user } = useAuth();
  const { employees } = useData();
  const isAdmin = user?.isAdmin;
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], category: "Travel", description: "", amount: "" });
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchExpenses(); }, []);

  async function fetchExpenses() {
    const { data } = await supabase.from("expenses").select("*").order("created_at", { ascending: false });
    if (data) setExpenses(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await supabase.from("expenses").insert({ employee_id: user.id, date: form.date, category: form.category, description: form.description, amount: Number(form.amount) });
    setShowModal(false); setForm({ date: new Date().toISOString().split("T")[0], category: "Travel", description: "", amount: "" }); fetchExpenses();
  }

  async function handleAction(id, status) {
    await supabase.from("expenses").update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", id);
    fetchExpenses();
  }

  const myExpenses = isAdmin ? expenses : expenses.filter((e) => e.employee_id === user?.id);
  const filtered = filter === "all" ? myExpenses : myExpenses.filter((e) => e.status === filter);
  const totalPending = myExpenses.filter((e) => e.status === "pending").reduce((s, e) => s + Number(e.amount), 0);
  const totalApproved = myExpenses.filter((e) => e.status === "approved").reduce((s, e) => s + Number(e.amount), 0);

  return (
    <>
      <Header title="Expenses & Reimbursement" />
      <div className="page-content">
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {[["Total Claims", formatCurrency(totalPending + totalApproved), "var(--primary)"], ["Pending", formatCurrency(totalPending), "var(--warning)"], ["Approved", formatCurrency(totalApproved), "var(--success)"]].map(([l,v,c]) => (
            <div key={l} className="stat-card" style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: "1.3rem", fontWeight: 700, color: c }}>{v}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{l}</div></div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Expense Claims</h2>
            <div className="flex gap-2">
              <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><i className="fas fa-plus" /> New Claim</button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr>{isAdmin && <th>Employee</th>}<th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th>{isAdmin && <th>Actions</th>}</tr></thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={isAdmin ? 7 : 5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>No expense claims</td></tr> :
                filtered.map((ex) => {
                  const emp = employees.find((e) => e.id === ex.employee_id);
                  return (
                    <tr key={ex.id}>
                      {isAdmin && <td><div className="employee-cell"><Avatar name={emp?.name || ""} initials={emp?.avatar || "?"} avatarUrl={emp?.avatarUrl} /><div className="name">{emp?.name}</div></div></td>}
                      <td>{formatDate(ex.date)}</td><td>{ex.category}</td><td className="text-sm">{ex.description}</td>
                      <td className="salary-cell">{formatCurrency(Number(ex.amount))}</td>
                      <td><Badge status={ex.status} /></td>
                      {isAdmin && <td>{ex.status === "pending" ? <div className="leave-actions"><button className="btn-approve" onClick={() => handleAction(ex.id, "approved")}>Approve</button><button className="btn-reject" onClick={() => handleAction(ex.id, "rejected")}>Reject</button></div> : "—"}</td>}
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
            <h3><i className="fas fa-receipt" style={{ marginRight: 8, color: "var(--primary)" }} />New Expense Claim</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="form-group"><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{expenseCategories.map((c) => <option key={c}>{c}</option>)}</select></div>
              </div>
              <div className="form-group"><label>Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of expense" required /></div>
              <div className="form-group"><label>Amount (₹)</label><input type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 1500" required /></div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
