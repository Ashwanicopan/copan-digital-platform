export default function PayrollSettings() {
  return (
    <div className="card">
      <div className="card-header"><h2>Payroll Configuration</h2></div>
      <div className="settings-form-grid">
        <div className="form-group">
          <label>Pay Cycle</label>
          <select defaultValue="Monthly"><option>Monthly</option><option>Bi-weekly</option><option>Weekly</option></select>
        </div>
        <div className="form-group">
          <label>Pay Day</label>
          <select defaultValue="28th of month"><option>25th of month</option><option>28th of month</option><option>Last day of month</option></select>
        </div>
        <div className="form-group">
          <label>Currency</label>
          <select defaultValue="INR (₹)"><option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option></select>
        </div>
        <div className="form-group">
          <label>Financial Year</label>
          <select defaultValue="April - March"><option>April - March</option><option>January - December</option></select>
        </div>
      </div>

      <div className="card-header" style={{ marginTop: 24 }}><h2>Salary Components</h2></div>
      <div className="table-container">
        <table>
          <thead><tr><th>Component</th><th>Type</th><th>Calculation</th></tr></thead>
          <tbody>
            <tr><td><strong>Basic Salary</strong></td><td><span className="badge badge-success">Earning</span></td><td>50% of CTC</td></tr>
            <tr><td><strong>HRA</strong></td><td><span className="badge badge-success">Earning</span></td><td>40% of Basic</td></tr>
            <tr><td><strong>Special Allowance</strong></td><td><span className="badge badge-success">Earning</span></td><td>Remaining CTC</td></tr>
            <tr><td><strong>PF (Employee)</strong></td><td><span className="badge badge-danger">Deduction</span></td><td>12% of Basic</td></tr>
            <tr><td><strong>Professional Tax</strong></td><td><span className="badge badge-danger">Deduction</span></td><td>₹200/month</td></tr>
            <tr><td><strong>Income Tax (TDS)</strong></td><td><span className="badge badge-danger">Deduction</span></td><td>As per slab</td></tr>
          </tbody>
        </table>
      </div>
      <div className="form-actions" style={{ marginTop: 20 }}>
        <button className="btn btn-outline">Reset</button>
        <button className="btn btn-primary" onClick={() => alert("Payroll settings saved!")}>
          <i className="fas fa-check" /> Save Changes
        </button>
      </div>
    </div>
  );
}
