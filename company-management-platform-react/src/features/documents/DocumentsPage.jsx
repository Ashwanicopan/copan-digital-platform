import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { supabase } from "../../lib/supabase";
import { formatDate } from "../../utils/helpers";

const docCategories = ["ID Proof", "Address Proof", "PAN Card", "Aadhaar Card", "Offer Letter", "Experience Letter", "Education Certificate", "Bank Details", "Other"];

export default function DocumentsPage() {
  const { user } = useAuth();
  const { employees } = useData();
  const isAdmin = user?.isAdmin;
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee_id: "", name: "", category: "ID Proof", file_url: "" });
  const [filter, setFilter] = useState("");

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    const { data } = await supabase.from("documents").select("*").order("uploaded_at", { ascending: false });
    if (data) setDocuments(data);
  }

  const myDocs = isAdmin ? documents : documents.filter((d) => d.employee_id === user?.id);
  const filtered = filter ? myDocs.filter((d) => d.category === filter) : myDocs;

  async function handleUpload(e) {
    e.preventDefault();
    await supabase.from("documents").insert({
      employee_id: form.employee_id ? Number(form.employee_id) : user.id,
      name: form.name,
      category: form.category,
      file_url: form.file_url || null,
      file_name: form.name,
    });
    setShowModal(false);
    setForm({ employee_id: "", name: "", category: "ID Proof", file_url: "" });
    fetchDocs();
  }

  async function toggleVerify(id, current) {
    await supabase.from("documents").update({ verified: !current }).eq("id", id);
    fetchDocs();
  }

  async function handleDelete(id) {
    await supabase.from("documents").delete().eq("id", id);
    fetchDocs();
  }

  return (
    <>
      <Header title="Documents" />
      <div className="page-content">
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {[["Total", myDocs.length, "var(--primary)"], ["Verified", myDocs.filter((d) => d.verified).length, "var(--success)"], ["Pending", myDocs.filter((d) => !d.verified).length, "var(--warning)"]].map(([l, v, c]) => (
            <div key={l} className="stat-card" style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: c }}>{v}</div><div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{l}</div></div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>All Documents</h2>
            <div className="flex gap-2">
              <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">All Categories</option>
                {docCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><i className="fas fa-upload" /> Upload Document</button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr>{isAdmin && <th>Employee</th>}<th>Document</th><th>Category</th><th>Uploaded</th><th>Verified</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={isAdmin ? 6 : 5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>No documents uploaded</td></tr> :
                filtered.map((doc) => {
                  const emp = employees.find((e) => e.id === doc.employee_id);
                  return (
                    <tr key={doc.id}>
                      {isAdmin && <td><div className="employee-cell"><Avatar name={emp?.name || ""} initials={emp?.avatar || "?"} avatarUrl={emp?.avatarUrl} /><div className="name">{emp?.name}</div></div></td>}
                      <td><strong><i className="fas fa-file-alt" style={{ marginRight: 6, color: "var(--gray-400)" }} />{doc.name}</strong></td>
                      <td><span style={{ background: "var(--gray-100)", padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600 }}>{doc.category}</span></td>
                      <td className="text-sm">{formatDate(doc.uploaded_at)}</td>
                      <td>
                        {isAdmin ? (
                          <label className="toggle"><input type="checkbox" checked={doc.verified} onChange={() => toggleVerify(doc.id, doc.verified)} /><span className="toggle-slider" /></label>
                        ) : (
                          <Badge status={doc.verified ? "approved" : "pending"} />
                        )}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDelete(doc.id)}><i className="fas fa-trash" /></button>
                        </div>
                      </td>
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
            <h3><i className="fas fa-upload" style={{ marginRight: 8, color: "var(--primary)" }} />Upload Document</h3>
            <form onSubmit={handleUpload}>
              {isAdmin && (
                <div className="form-group"><label>Employee</label>
                  <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
                    <option value="">Myself</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group"><label>Document Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aadhaar Card - Front" required /></div>
              <div className="form-group"><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{docCategories.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>Document URL (link)</label><input type="url" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="Paste Google Drive / link to document" /></div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
