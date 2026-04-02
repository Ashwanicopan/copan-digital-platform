const policies = [
  { type: "Casual Leave", total: "12 days", carryForward: "No", encashable: "No" },
  { type: "Sick Leave", total: "7 days", carryForward: "No", encashable: "No" },
  { type: "Earned Leave", total: "18 days", carryForward: "Yes (max 10)", encashable: "Yes" },
  { type: "Comp Off", total: "As earned", carryForward: "No", encashable: "No" },
  { type: "Maternity Leave", total: "182 days", carryForward: "N/A", encashable: "No" },
  { type: "Paternity Leave", total: "15 days", carryForward: "N/A", encashable: "No" },
];

export default function LeavePolicySettings() {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Leave Policy</h2>
        <button className="btn btn-primary btn-sm"><i className="fas fa-edit" /> Edit Policy</button>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Leave Type</th><th>Annual Quota</th><th>Carry Forward</th><th>Encashable</th></tr></thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.type}>
                <td><strong>{p.type}</strong></td>
                <td>{p.total}</td>
                <td>{p.carryForward}</td>
                <td>{p.encashable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 20, padding: 16, background: "var(--gray-50)", borderRadius: "var(--radius)" }}>
        <h3 className="text-sm font-semibold" style={{ marginBottom: 8 }}>Policy Notes</h3>
        <ul style={{ fontSize: "0.8rem", color: "var(--gray-500)", paddingLeft: 16, lineHeight: 1.8 }}>
          <li>Leave year: January 1 to December 31</li>
          <li>Probation period: First 6 months (only sick leave available)</li>
          <li>Earned leave accrues at 1.5 days per month</li>
          <li>Sandwich rule applies to casual leave</li>
        </ul>
      </div>
    </div>
  );
}
