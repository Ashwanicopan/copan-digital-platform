import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { supabase } from "../../lib/supabase";
import { formatDate } from "../../utils/helpers";

const docConfig = {
  "Aadhaar Card": { icon: "fa-id-card", color: "var(--primary)", documents: ["Aadhaar Card - Front", "Aadhaar Card - Back"], hasFrontBack: true },
  "PAN Card": { icon: "fa-credit-card", color: "var(--warning)", documents: ["PAN Card - Front", "PAN Card - Back"], hasFrontBack: true },
  "Passport": { icon: "fa-passport", color: "var(--danger)", documents: ["Passport - Front Page", "Passport - Last Page"], hasFrontBack: true },
  "Driving License": { icon: "fa-car", color: "var(--info)", documents: ["Driving License - Front", "Driving License - Back"], hasFrontBack: true },
  "Voter ID": { icon: "fa-vote-yea", color: "var(--success)", documents: ["Voter ID - Front", "Voter ID - Back"], hasFrontBack: true },
  "Bank Passbook / Cheque": { icon: "fa-university", color: "var(--primary)", documents: ["Bank Passbook / Cancelled Cheque"], hasFrontBack: false },
  "Offer Letter": { icon: "fa-file-signature", color: "var(--success)", documents: ["Signed Offer Letter"], hasFrontBack: false },
  "Experience Letter": { icon: "fa-briefcase", color: "var(--warning)", documents: ["Experience Letter", "Relieving Letter"], hasFrontBack: false },
  "Education Certificate": { icon: "fa-graduation-cap", color: "var(--info)", documents: ["10th Marksheet", "12th Marksheet", "Degree Certificate", "Post Graduation Certificate"], hasFrontBack: false },
  "Address Proof": { icon: "fa-home", color: "var(--success)", documents: ["Electricity Bill", "Rent Agreement", "Gas Bill"], hasFrontBack: false },
  "Photo": { icon: "fa-camera", color: "var(--danger)", documents: ["Passport Size Photo", "Full Photo"], hasFrontBack: false },
  "Other": { icon: "fa-file-alt", color: "var(--gray-500)", documents: [], hasFrontBack: false },
};

const categories = Object.keys(docConfig);

export default function DocumentsPage() {
  const { user } = useAuth();
  const { employees } = useData();
  const isAdmin = user?.isAdmin;
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDoc, setSelectedDoc] = useState("");
  const [customName, setCustomName] = useState("");
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    const { data } = await supabase.from("documents").select("*").order("uploaded_at", { ascending: false });
    if (data) setDocuments(data);
  }

  const myDocs = isAdmin ? documents : documents.filter((d) => d.employee_id === user?.id);
  const filtered = filter ? myDocs.filter((d) => d.category === filter) : myDocs;

  function openUpload() {
    setStep(1); setSelectedCategory(""); setSelectedDoc(""); setCustomName(""); setFrontUrl(""); setBackUrl(""); setEmployeeId("");
    setShowModal(true);
  }

  async function handleUpload() {
    const empId = employeeId ? Number(employeeId) : user.id;
    const docName = selectedDoc || customName;
    const config = docConfig[selectedCategory];

    if (config?.hasFrontBack && frontUrl) {
      // Upload front
      await supabase.from("documents").insert({ employee_id: empId, name: docName + " - Front", category: selectedCategory, file_url: frontUrl, file_name: docName + " - Front" });
      // Upload back if provided
      if (backUrl) {
        await supabase.from("documents").insert({ employee_id: empId, name: docName + " - Back", category: selectedCategory, file_url: backUrl, file_name: docName + " - Back" });
      }
    } else {
      await supabase.from("documents").insert({ employee_id: empId, name: docName, category: selectedCategory, file_url: frontUrl || null, file_name: docName });
    }

    setShowModal(false);
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

  const config = selectedCategory ? docConfig[selectedCategory] : null;

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
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="btn btn-primary btn-sm" onClick={openUpload}><i className="fas fa-upload" /> Upload Document</button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr>{isAdmin && <th>Employee</th>}<th>Document</th><th>Category</th><th>Uploaded</th><th>Verified</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={isAdmin ? 6 : 5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>No documents uploaded</td></tr> :
                filtered.map((doc) => {
                  const emp = employees.find((e) => e.id === doc.employee_id);
                  const catConfig = docConfig[doc.category] || docConfig["Other"];
                  return (
                    <tr key={doc.id}>
                      {isAdmin && <td><div className="employee-cell"><Avatar name={emp?.name || ""} initials={emp?.avatar || "?"} avatarUrl={emp?.avatarUrl} /><div className="name">{emp?.name}</div></div></td>}
                      <td><strong><i className={`fas ${catConfig.icon}`} style={{ marginRight: 8, color: catConfig.color }} />{doc.name}</strong></td>
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
                          {doc.file_url && <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><i className="fas fa-external-link-alt" /></a>}
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

      {/* Smart Upload Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal stepper-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: "24px 28px 18px", background: "linear-gradient(135deg, var(--primary), #6366f1)", color: "#fff" }}>
              <h3 style={{ color: "#fff", margin: "0 0 4px", fontSize: "1.15rem" }}>Upload Document</h3>
              <p style={{ fontSize: "0.82rem", opacity: 0.75, margin: 0 }}>Step {step} of 3 — {step === 1 ? "Select Category" : step === 2 ? "Choose Document" : "Upload Files"}</p>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", padding: "16px 28px", background: "#fafbfc", borderBottom: "1px solid var(--gray-100)", gap: 8 }}>
              {[{ n: 1, l: "Category" }, { n: 2, l: "Document" }, { n: 3, l: "Upload" }].map((s, i) => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, background: step > s.n ? "var(--success)" : step === s.n ? "var(--primary)" : "var(--gray-200)", color: step >= s.n ? "#fff" : "var(--gray-500)", boxShadow: step === s.n ? "0 0 0 4px rgba(79,70,229,0.15)" : "none" }}>
                    {step > s.n ? <i className="fas fa-check" style={{ fontSize: "0.65rem" }} /> : s.n}
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: step === s.n ? 700 : 500, color: step === s.n ? "var(--primary)" : "var(--gray-400)" }}>{s.l}</span>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.n ? "var(--success)" : "var(--gray-200)", marginLeft: 4 }} />}
                </div>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding: "24px 28px", minHeight: 250 }}>
              {/* Step 1: Select Category */}
              {step === 1 && (
                <>
                  <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginBottom: 16 }}><i className="fas fa-info-circle" style={{ marginRight: 6 }} />Select the type of document you want to upload</div>
                  {isAdmin && (
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label>Upload for Employee</label>
                      <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                        <option value="">Myself</option>
                        {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {categories.map((cat) => {
                      const c = docConfig[cat];
                      return (
                        <button key={cat} type="button" onClick={() => { setSelectedCategory(cat); setStep(2); setSelectedDoc(""); setCustomName(""); }}
                          style={{ padding: "16px 12px", borderRadius: 12, border: `2px solid ${selectedCategory === cat ? c.color : "var(--gray-200)"}`, background: selectedCategory === cat ? `${c.color}10` : "#fff", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
                          <i className={`fas ${c.icon}`} style={{ fontSize: "1.3rem", color: c.color, display: "block", marginBottom: 6 }} />
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-700)" }}>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Step 2: Choose Document */}
              {step === 2 && config && (
                <>
                  <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginBottom: 16 }}>
                    <i className={`fas ${config.icon}`} style={{ marginRight: 6, color: config.color }} />
                    Select which <strong>{selectedCategory}</strong> document to upload
                  </div>
                  {config.documents.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {config.documents.map((doc) => (
                        <button key={doc} type="button" onClick={() => { setSelectedDoc(doc); setStep(3); }}
                          style={{ padding: "14px 16px", borderRadius: 10, border: `2px solid ${selectedDoc === doc ? config.color : "var(--gray-200)"}`, background: selectedDoc === doc ? `${config.color}10` : "#fff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
                          <i className="fas fa-file-alt" style={{ color: config.color }} />
                          <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{doc}</span>
                          <i className="fas fa-chevron-right" style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--gray-400)" }} />
                        </button>
                      ))}
                      <div style={{ borderTop: "1px solid var(--gray-100)", marginTop: 8, paddingTop: 12 }}>
                        <div style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginBottom: 6 }}>Or enter custom name:</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Custom document name" style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--gray-200)", borderRadius: 6, fontSize: "0.85rem" }} />
                          <button className="btn btn-outline btn-sm" onClick={() => { if (customName.trim()) { setSelectedDoc(""); setStep(3); } }} disabled={!customName.trim()}>Next</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="form-group">
                        <label>Document Name</label>
                        <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Enter document name" />
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => { if (customName.trim()) setStep(3); }} disabled={!customName.trim()}>Next</button>
                    </div>
                  )}
                </>
              )}

              {/* Step 3: Upload Files */}
              {step === 3 && (
                <>
                  <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginBottom: 20 }}>
                    <i className="fas fa-cloud-upload-alt" style={{ marginRight: 6, color: "var(--primary)" }} />
                    Upload file links for <strong>{selectedDoc || customName}</strong>
                  </div>

                  <div style={{ padding: 16, background: "var(--gray-50)", borderRadius: 10, border: "1px solid var(--gray-100)", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <i className={`fas ${config?.icon || "fa-file"}`} style={{ fontSize: "1.2rem", color: config?.color || "var(--gray-400)" }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{selectedDoc || customName}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>{selectedCategory}</div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label><i className="fas fa-image" style={{ marginRight: 6, color: "var(--primary)" }} />{config?.hasFrontBack ? "Front Side" : "Document"} — Image / PDF URL</label>
                    <input type="url" value={frontUrl} onChange={(e) => setFrontUrl(e.target.value)} placeholder="Paste Google Drive, Imgur, or any image URL" />
                    <span style={{ fontSize: "0.7rem", color: "var(--gray-400)", marginTop: 4, display: "block" }}>Upload to Google Drive or Imgur and paste the sharing link here</span>
                  </div>

                  {config?.hasFrontBack && (
                    <div className="form-group">
                      <label><i className="fas fa-image" style={{ marginRight: 6, color: "var(--warning)" }} />Back Side — Image / PDF URL (optional)</label>
                      <input type="url" value={backUrl} onChange={(e) => setBackUrl(e.target.value)} placeholder="Paste back side image URL" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", borderTop: "1px solid var(--gray-100)", background: "#fafbfc" }}>
              <button className="btn btn-outline" style={{ minWidth: 100, height: 38, borderRadius: 10, fontWeight: 600 }} onClick={() => step === 1 ? setShowModal(false) : setStep(step - 1)}>
                {step === 1 ? "Cancel" : <><i className="fas fa-arrow-left" /> Back</>}
              </button>
              <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Step {step} of 3</span>
              {step === 3 ? (
                <button className="btn btn-primary" style={{ minWidth: 120, height: 38, borderRadius: 10, fontWeight: 600 }} onClick={handleUpload} disabled={!frontUrl && !customName && !selectedDoc}>
                  <i className="fas fa-upload" /> Upload
                </button>
              ) : (
                <div style={{ width: 100 }} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
