import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { supabase } from "../../lib/supabase";
import { formatDate } from "../../utils/helpers";

const purposes = [
  {
    id: "identity", label: "Identity Proof", icon: "fa-id-card", color: "var(--primary)",
    description: "Government issued photo ID for identity verification",
    documents: [
      { name: "Aadhaar Card", hasFrontBack: true },
      { name: "Passport", hasFrontBack: true },
      { name: "Voter ID", hasFrontBack: true },
      { name: "Driving License", hasFrontBack: true },
    ],
  },
  {
    id: "address", label: "Address Proof", icon: "fa-home", color: "var(--success)",
    description: "Document to verify your current residential address",
    documents: [
      { name: "Aadhaar Card", hasFrontBack: true },
      { name: "Electricity Bill", hasFrontBack: false },
      { name: "Rent Agreement", hasFrontBack: false },
      { name: "Gas Bill", hasFrontBack: false },
      { name: "Bank Statement", hasFrontBack: false },
      { name: "Passport", hasFrontBack: true },
    ],
  },
  {
    id: "financial", label: "Financial / Tax", icon: "fa-rupee-sign", color: "var(--warning)",
    description: "PAN, bank details, and tax related documents",
    documents: [
      { name: "PAN Card", hasFrontBack: true },
      { name: "Bank Passbook", hasFrontBack: false },
      { name: "Cancelled Cheque", hasFrontBack: false },
      { name: "Form 16", hasFrontBack: false },
    ],
  },
  {
    id: "education", label: "Educational", icon: "fa-graduation-cap", color: "var(--info)",
    description: "Academic certificates and marksheets",
    documents: [
      { name: "10th Marksheet", hasFrontBack: false },
      { name: "12th Marksheet", hasFrontBack: false },
      { name: "Degree Certificate", hasFrontBack: false },
      { name: "Post Graduation Certificate", hasFrontBack: false },
      { name: "Diploma Certificate", hasFrontBack: false },
      { name: "Professional Certification", hasFrontBack: false },
    ],
  },
  {
    id: "employment", label: "Employment", icon: "fa-briefcase", color: "var(--danger)",
    description: "Previous employment and offer related documents",
    documents: [
      { name: "Offer Letter (Current)", hasFrontBack: false },
      { name: "Previous Offer Letter", hasFrontBack: false },
      { name: "Experience Letter", hasFrontBack: false },
      { name: "Relieving Letter", hasFrontBack: false },
      { name: "Last 3 Months Payslips", hasFrontBack: false },
      { name: "Appointment Letter", hasFrontBack: false },
    ],
  },
  {
    id: "photo", label: "Photographs", icon: "fa-camera", color: "#db2777",
    description: "Passport size and other photos",
    documents: [
      { name: "Passport Size Photo", hasFrontBack: false },
      { name: "Full Size Photo", hasFrontBack: false },
    ],
  },
  {
    id: "medical", label: "Medical", icon: "fa-heartbeat", color: "var(--danger)",
    description: "Health insurance and medical records",
    documents: [
      { name: "Medical Insurance Card", hasFrontBack: true },
      { name: "Medical Fitness Certificate", hasFrontBack: false },
      { name: "Blood Group Report", hasFrontBack: false },
    ],
  },
  {
    id: "other", label: "Other", icon: "fa-folder-open", color: "var(--gray-500)",
    description: "Any other document not listed above",
    documents: [],
  },
];

export default function DocumentsPage() {
  const { user } = useAuth();
  const { employees } = useData();
  const isAdmin = user?.isAdmin;
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
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
    setStep(1); setSelectedPurpose(null); setSelectedDoc(null); setCustomName(""); setFrontUrl(""); setBackUrl(""); setEmployeeId("");
    setShowModal(true);
  }

  function selectPurpose(p) { setSelectedPurpose(p); setSelectedDoc(null); setCustomName(""); setStep(2); }
  function selectDocument(doc) { setSelectedDoc(doc); setStep(3); }

  async function handleUpload() {
    const empId = employeeId ? Number(employeeId) : user.id;
    const docName = selectedDoc?.name || customName;
    const category = selectedPurpose?.label || "Other";
    const hasFB = selectedDoc?.hasFrontBack;

    if (hasFB && frontUrl) {
      await supabase.from("documents").insert({ employee_id: empId, name: docName + " - Front", category, file_url: frontUrl, file_name: docName + " - Front" });
      if (backUrl) await supabase.from("documents").insert({ employee_id: empId, name: docName + " - Back", category, file_url: backUrl, file_name: docName + " - Back" });
    } else {
      await supabase.from("documents").insert({ employee_id: empId, name: docName, category, file_url: frontUrl || null, file_name: docName });
    }
    setShowModal(false); fetchDocs();
  }

  async function toggleVerify(id, current) { await supabase.from("documents").update({ verified: !current }).eq("id", id); fetchDocs(); }
  async function handleDelete(id) { await supabase.from("documents").delete().eq("id", id); fetchDocs(); }

  const allCategories = [...new Set(myDocs.map((d) => d.category))];
  const stepLabels = ["What is it for?", "Which document?", "Upload files"];

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
                {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
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
                  const p = purposes.find((pp) => pp.label === doc.category) || purposes[purposes.length - 1];
                  return (
                    <tr key={doc.id}>
                      {isAdmin && <td><div className="employee-cell"><Avatar name={emp?.name || ""} initials={emp?.avatar || "?"} avatarUrl={emp?.avatarUrl} /><div className="name">{emp?.name}</div></div></td>}
                      <td><strong><i className={`fas ${p.icon}`} style={{ marginRight: 8, color: p.color }} />{doc.name}</strong></td>
                      <td><span style={{ background: `${p.color}15`, color: p.color, padding: "3px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600 }}>{doc.category}</span></td>
                      <td className="text-sm">{formatDate(doc.uploaded_at)}</td>
                      <td>{isAdmin ? <label className="toggle"><input type="checkbox" checked={doc.verified} onChange={() => toggleVerify(doc.id, doc.verified)} /><span className="toggle-slider" /></label> : <Badge status={doc.verified ? "approved" : "pending"} />}</td>
                      <td><div className="flex gap-1">{doc.file_url && <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><i className="fas fa-external-link-alt" /></a>}<button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDelete(doc.id)}><i className="fas fa-trash" /></button></div></td>
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
            <div style={{ padding: "24px 28px 18px", background: "linear-gradient(135deg, var(--primary), #6366f1)", color: "#fff" }}>
              <h3 style={{ color: "#fff", margin: "0 0 4px", fontSize: "1.15rem" }}>Upload Document</h3>
              <p style={{ fontSize: "0.82rem", opacity: 0.75, margin: 0 }}>Step {step} of 3 — {stepLabels[step - 1]}</p>
            </div>

            <div style={{ display: "flex", padding: "16px 28px", background: "#fafbfc", borderBottom: "1px solid var(--gray-100)", gap: 8 }}>
              {[1, 2, 3].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, background: step > s ? "var(--success)" : step === s ? "var(--primary)" : "var(--gray-200)", color: step >= s ? "#fff" : "var(--gray-500)", boxShadow: step === s ? "0 0 0 4px rgba(79,70,229,0.15)" : "none" }}>
                    {step > s ? <i className="fas fa-check" style={{ fontSize: "0.65rem" }} /> : s}
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: step === s ? 700 : 500, color: step === s ? "var(--primary)" : "var(--gray-400)" }}>{stepLabels[i]}</span>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: step > s ? "var(--success)" : "var(--gray-200)", marginLeft: 4 }} />}
                </div>
              ))}
            </div>

            <div style={{ padding: "24px 28px", minHeight: 280 }}>
              {/* Step 1: Purpose */}
              {step === 1 && (
                <>
                  <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", marginBottom: 16 }}><i className="fas fa-info-circle" style={{ marginRight: 6 }} />What is this document for?</div>
                  {isAdmin && (
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label>Upload for</label>
                      <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}><option value="">Myself</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {purposes.map((p) => (
                      <button key={p.id} type="button" onClick={() => selectPurpose(p)}
                        style={{ padding: "16px", borderRadius: 12, border: "2px solid var(--gray-200)", background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s", display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <i className={`fas ${p.icon}`} style={{ color: p.color }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 2 }}>{p.label}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--gray-400)", lineHeight: 1.3 }}>{p.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 2: Document Selection */}
              {step === 2 && selectedPurpose && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "12px 16px", background: `${selectedPurpose.color}10`, borderRadius: 10, border: `1px solid ${selectedPurpose.color}30` }}>
                    <i className={`fas ${selectedPurpose.icon}`} style={{ color: selectedPurpose.color }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{selectedPurpose.label}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--gray-500)" }}>Select which document you want to upload</div>
                    </div>
                  </div>
                  {selectedPurpose.documents.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {selectedPurpose.documents.map((doc) => (
                        <button key={doc.name} type="button" onClick={() => selectDocument(doc)}
                          style={{ padding: "14px 16px", borderRadius: 10, border: "1.5px solid var(--gray-200)", background: "#fff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
                          <i className="fas fa-file-alt" style={{ color: selectedPurpose.color }} />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{doc.name}</span>
                            {doc.hasFrontBack && <span style={{ marginLeft: 8, fontSize: "0.68rem", color: "var(--info)", background: "var(--info-bg, #ecfeff)", padding: "2px 6px", borderRadius: 4 }}>Front & Back</span>}
                          </div>
                          <i className="fas fa-chevron-right" style={{ fontSize: "0.7rem", color: "var(--gray-400)" }} />
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div style={{ borderTop: "1px solid var(--gray-100)", marginTop: 12, paddingTop: 12 }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginBottom: 6 }}>Can't find your document? Enter custom name:</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Utility Bill" style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: "0.85rem" }} />
                      <button className="btn btn-outline btn-sm" onClick={() => { if (customName.trim()) { setSelectedDoc({ name: customName, hasFrontBack: false }); setStep(3); } }} disabled={!customName.trim()}>Next</button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Upload */}
              {step === 3 && (
                <>
                  <div style={{ padding: 16, background: "var(--gray-50)", borderRadius: 10, border: "1px solid var(--gray-100)", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${selectedPurpose?.color || "var(--gray-400)"}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`fas ${selectedPurpose?.icon || "fa-file"}`} style={{ color: selectedPurpose?.color, fontSize: "1.1rem" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{selectedDoc?.name || customName}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>{selectedPurpose?.label}{selectedDoc?.hasFrontBack ? " · Front & Back required" : ""}</div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label><i className="fas fa-image" style={{ marginRight: 6, color: "var(--primary)" }} />{selectedDoc?.hasFrontBack ? "Front Side" : "Document"} — Image / PDF Link</label>
                    <input type="url" value={frontUrl} onChange={(e) => setFrontUrl(e.target.value)} placeholder="Paste Google Drive, Imgur, or any image URL" />
                    <span style={{ fontSize: "0.7rem", color: "var(--gray-400)", marginTop: 4, display: "block" }}>Upload your document to Google Drive or Imgur and paste the sharing link</span>
                  </div>

                  {selectedDoc?.hasFrontBack && (
                    <div className="form-group">
                      <label><i className="fas fa-image" style={{ marginRight: 6, color: "var(--warning)" }} />Back Side — Image / PDF Link</label>
                      <input type="url" value={backUrl} onChange={(e) => setBackUrl(e.target.value)} placeholder="Paste back side image URL (optional)" />
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", borderTop: "1px solid var(--gray-100)", background: "#fafbfc" }}>
              <button className="btn btn-outline" style={{ minWidth: 100, height: 38, borderRadius: 10, fontWeight: 600 }} onClick={() => step === 1 ? setShowModal(false) : setStep(step - 1)}>
                {step === 1 ? "Cancel" : <><i className="fas fa-arrow-left" /> Back</>}
              </button>
              <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Step {step} of 3</span>
              {step === 3 ? (
                <button className="btn btn-primary" style={{ minWidth: 120, height: 38, borderRadius: 10, fontWeight: 600 }} onClick={handleUpload} disabled={!frontUrl && !(selectedDoc?.name || customName)}>
                  <i className="fas fa-upload" /> Upload
                </button>
              ) : <div style={{ width: 120 }} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
