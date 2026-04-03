import { useState } from "react";
import Header from "../../components/layout/Header";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { formatDate, getAnnouncementCategory } from "../../utils/helpers";

export default function AnnouncementsPage() {
  const { user: CURRENT_USER } = useAuth();
  const { announcements, addAnnouncement, deleteAnnouncement } = useData();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", category: "general" });

  async function handleCreate(e) {
    e.preventDefault();
    await addAnnouncement({
      ...form,
      author: CURRENT_USER.name,
      authorId: CURRENT_USER.id,
    });
    setShowModal(false);
    setForm({ title: "", message: "", category: "general" });
  }

  async function handleDelete(id) {
    await deleteAnnouncement(id);
  }

  return (
    <>
      <Header title="Announcements" />
      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <h2>All Announcements</h2>
            {CURRENT_USER.isAdmin && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <i className="fas fa-plus" /> New Announcement
              </button>
            )}
          </div>

          {announcements.length === 0 ? (
            <div className="empty-state"><i className="fas fa-bullhorn" /><p>No announcements yet</p></div>
          ) : (
            announcements.map((a) => {
              const cat = getAnnouncementCategory(a.category || "general");
              return (
                <div className="ann-card" key={a.id}>
                  <div className="ann-card-left">
                    <div className="ann-icon" style={{ background: cat.bg, color: cat.color }}>
                      <i className={`fas ${cat.icon}`} />
                    </div>
                  </div>
                  <div className="ann-card-content">
                    <div className="ann-card-top">
                      <h3 className="ann-title">{a.title}</h3>
                      <span className="badge" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                    </div>
                    <p className="ann-message">{a.message}</p>
                    <div className="ann-meta">
                      <span><i className="fas fa-user" /> {a.author}</span>
                      <span><i className="far fa-calendar" /> {formatDate(a.date)}</span>
                    </div>
                  </div>
                  {CURRENT_USER.isAdmin && (
                    <div className="ann-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => handleDelete(a.id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Announcement">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {["general", "event", "policy", "celebration", "urgent"].map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane" /> Publish</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
