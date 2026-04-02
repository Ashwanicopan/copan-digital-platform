const roles = [
  { name: "Super Admin", users: 1, permissions: "Full access to all modules", color: "var(--danger)" },
  { name: "HR Manager", users: 1, permissions: "Manage employees, leave, attendance, payroll", color: "var(--primary)" },
  { name: "Manager", users: 3, permissions: "View team, approve leave, view attendance", color: "var(--success)" },
  { name: "Employee", users: 7, permissions: "Self-service: profile, leave, attendance", color: "var(--gray-500)" },
];

export default function RolesSettings() {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Roles & Permissions</h2>
        <button className="btn btn-primary btn-sm"><i className="fas fa-plus" /> Add Role</button>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Role</th><th>Users</th><th>Permissions</th><th>Actions</th></tr></thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.name}>
                <td>
                  <div className="flex items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: r.color, display: "inline-block" }} />
                    <strong>{r.name}</strong>
                  </div>
                </td>
                <td>{r.users}</td>
                <td className="text-sm text-muted">{r.permissions}</td>
                <td><button className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
