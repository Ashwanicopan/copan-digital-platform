import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

export default function TeamsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { teams, employees, addTeam, updateTeam, deleteTeam } = useData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", managerId: "", memberIds: [] });

  const isAdmin = user?.isAdmin;

  const visibleTeams = isAdmin
    ? teams
    : teams.filter((t) => t.managerId === user?.id || t.memberIds.includes(user?.id));

  function getManager(id) {
    return employees.find((e) => e.id === id);
  }

  async function handleCreate(e) {
    e.preventDefault();
    await addTeam({
      name: form.name,
      description: form.description,
      managerId: Number(form.managerId),
      memberIds: form.memberIds.map(Number),
    });
    setShowCreateModal(false);
    setForm({ name: "", description: "", managerId: "", memberIds: [] });
  }

  async function handleEdit(e) {
    e.preventDefault();
    await updateTeam(editingTeam.id, {
      name: form.name,
      description: form.description,
      managerId: Number(form.managerId),
      memberIds: form.memberIds.map(Number),
    });
    setShowEditModal(false);
    setEditingTeam(null);
  }

  async function handleDelete(id) {
    await deleteTeam(id);
  }

  function openEditModal(team) {
    setEditingTeam(team);
    setForm({ name: team.name, description: team.description, managerId: String(team.managerId), memberIds: team.memberIds.map(String) });
    setShowEditModal(true);
  }

  function openCreateModal() {
    setForm({ name: "", description: "", managerId: "", memberIds: [] });
    setShowCreateModal(true);
  }

  function toggleMember(empId) {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(empId)
        ? prev.memberIds.filter((id) => id !== empId)
        : [...prev.memberIds, empId],
    }));
  }

  const potentialManagers = employees.filter((e) =>
    e.designation.includes("Manager") || e.designation.includes("Lead") || e.designation.includes("VP")
  );

  const potentialMembers = employees.filter((e) => String(e.id) !== form.managerId);

  function renderTeamForm(onSubmit, submitLabel) {
    return (
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Team Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Frontend Squad" required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this team do?" />
        </div>
        <div className="form-group">
          <label>Team Manager</label>
          <select value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })} required>
            <option value="">Select a manager</option>
            {potentialManagers.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Team Members</label>
          <div className="member-picker">
            {potentialMembers.map((e) => (
              <label key={e.id} className={`member-pick-item ${form.memberIds.includes(String(e.id)) ? "selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={form.memberIds.includes(String(e.id))}
                  onChange={() => toggleMember(String(e.id))}
                />
                <Avatar name={e.name} initials={e.avatar} />
                <div>
                  <div className="name">{e.name}</div>
                  <div className="sub">{e.designation}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>Cancel</button>
          <button type="submit" className="btn btn-primary">{submitLabel}</button>
        </div>
      </form>
    );
  }

  return (
    <>
      <Header title="Teams" />
      <div className="page-content">
        <div className="employees-header">
          <div>
            <span className="employee-stat active-stat">{visibleTeams.length} Team{visibleTeams.length !== 1 ? "s" : ""}</span>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <i className="fas fa-plus" /> Create Team
            </button>
          )}
        </div>

        <div className="teams-grid">
          {visibleTeams.map((team) => {
            const manager = getManager(team.managerId);
            const members = team.memberIds.map((id) => employees.find((e) => e.id === id)).filter(Boolean);

            return (
              <div className="card team-card" key={team.id}>
                <div className="team-card-top">
                  <div>
                    <h3 className="team-name">{team.name}</h3>
                    <p className="text-sm text-muted">{team.description}</p>
                  </div>
                  {isAdmin && (
                    <div className="team-card-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(team)} title="Edit">
                        <i className="fas fa-pen" />
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDelete(team.id)} title="Delete" style={{ color: "var(--danger)" }}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="team-manager-section">
                  <div className="detail-label">Team Manager</div>
                  {manager ? (
                    <div className="team-manager-row" onClick={() => navigate(`/employees/${manager.id}`)}>
                      <Avatar name={manager.name} initials={manager.avatar} />
                      <div>
                        <div className="name">{manager.name}</div>
                        <div className="sub">{manager.designation}</div>
                      </div>
                      <span className="badge badge-info" style={{ marginLeft: "auto" }}>Manager</span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted">No manager assigned</div>
                  )}
                </div>

                <div className="team-members-section">
                  <div className="detail-label">{members.length} Member{members.length !== 1 ? "s" : ""}</div>
                  <div className="team-members-list">
                    {members.map((m) => (
                      <div key={m.id} className="team-member-row" onClick={() => navigate(`/employees/${m.id}`)}>
                        <Avatar name={m.name} initials={m.avatar} />
                        <div>
                          <div className="name">{m.name}</div>
                          <div className="sub">{m.designation}</div>
                        </div>
                        <Badge status={m.status} />
                      </div>
                    ))}
                    {members.length === 0 && <div className="text-sm text-muted" style={{ padding: "8px 0" }}>No members yet</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {visibleTeams.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <i className="fas fa-users-cog" />
              <p>{isAdmin ? "No teams created yet. Create your first team!" : "You are not part of any team yet."}</p>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Team" wide>
        {renderTeamForm(handleCreate, "Create Team")}
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Team" wide>
        {renderTeamForm(handleEdit, "Save Changes")}
      </Modal>
    </>
  );
}
