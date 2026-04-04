import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import StatCard from "../../components/ui/StatCard";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { EMPLOYEES_DATA, COMPANY } from "../../data/mockData";
import { getAvatarColor, getDeptIcon } from "../../utils/helpers";

export default function DepartmentsPage() {
  const navigate = useNavigate();
  const [modalDept, setModalDept] = useState(null);

  const deptData = COMPANY.departments.map((dept) => {
    const members = EMPLOYEES_DATA.filter((e) => e.department === dept);
    const head = members.find((e) => e.designation.includes("Manager") || e.designation.includes("Lead") || e.designation.includes("VP"));
    return { name: dept, members, head, count: members.length };
  });

  const total = EMPLOYEES_DATA.length;
  const avgSize = Math.round(total / deptData.length);
  const largest = deptData.reduce((a, b) => (a.count > b.count ? a : b));

  return (
    <>
      <Header title="Departments" />
      <div className="page-content">
        <div className="stats-grid">
          <StatCard title="Total Departments" value={deptData.length} icon="fa-sitemap" color="blue" />
          <StatCard title="Total Employees" value={total} icon="fa-users" color="green" />
          <StatCard title="Avg Team Size" value={avgSize} icon="fa-chart-bar" color="orange" />
          <StatCard title="Largest Team" value={largest.name} subtitle={`${largest.count} members`} icon="fa-trophy" color="red" />
        </div>

        <div className="dept-grid">
          {deptData.map((dept) => (
            <div className="card dept-card" key={dept.name}>
              <div className="dept-card-header">
                <div className="dept-icon" style={{ background: getAvatarColor(dept.name) }}>
                  <i className={`fas ${getDeptIcon(dept.name)}`} />
                </div>
                <div>
                  <h3 className="dept-name">{dept.name}</h3>
                  <span className="text-sm text-muted">{dept.count} member{dept.count !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {dept.head && (
                <div className="dept-head">
                  <div className="detail-label">Department Head</div>
                  <div className="employee-cell" style={{ marginTop: 6 }}>
                    <Avatar name={dept.head.name} initials={dept.head.avatar} className="avatar-sm" />
                    <div>
                      <div className="name" style={{ fontSize: "0.85rem" }}>{dept.head.name}</div>
                      <div className="sub">{dept.head.designation}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="dept-members-section">
                <div className="detail-label" style={{ marginBottom: 8 }}>Team Members</div>
                <div className="dept-members-avatars">
                  {dept.members.slice(0, 5).map((m) => (
                    <div key={m.id} className="avatar dept-member-avatar" style={{ background: getAvatarColor(m.name), width: 30, height: 30, fontSize: "0.65rem" }} title={m.name}>
                      {m.avatar}
                    </div>
                  ))}
                  {dept.count > 5 && <div className="dept-more-count">+{dept.count - 5}</div>}
                </div>
              </div>

              <div className="dept-locations">
                <div className="detail-label" style={{ marginBottom: 6 }}>Locations</div>
                <div className="dept-location-tags">
                  {[...new Set(dept.members.map((m) => m.location))].map((loc) => (
                    <span key={loc} className="dept-location-tag"><i className="fas fa-map-marker-alt" /> {loc}</span>
                  ))}
                </div>
              </div>

              <button className="btn btn-outline btn-sm dept-view-btn" onClick={() => setModalDept(dept)}>
                View All Members <i className="fas fa-arrow-right" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!modalDept} onClose={() => setModalDept(null)} title={modalDept ? `${modalDept.name} Team` : ""} wide>
        {modalDept && (
          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Designation</th><th>Location</th><th>Status</th></tr></thead>
              <tbody>
                {modalDept.members.map((emp) => (
                  <tr key={emp.id} className="clickable-row" onClick={() => { setModalDept(null); navigate(`/employees/${emp.id}`); }}>
                    <td>
                      <div className="employee-cell">
                        <Avatar name={emp.name} initials={emp.avatar} avatarUrl={emp.avatarUrl} />
                        <div><div className="name">{emp.name}</div><div className="sub">{emp.email}</div></div>
                      </div>
                    </td>
                    <td>{emp.designation}</td>
                    <td>{emp.location}</td>
                    <td><Badge status={emp.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
}
