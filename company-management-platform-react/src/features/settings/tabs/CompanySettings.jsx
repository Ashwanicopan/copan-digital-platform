import { useState } from "react";
import { COMPANY } from "../../../data/mockData";

export default function CompanySettings() {
  const [name, setName] = useState(COMPANY.name);

  return (
    <div className="card">
      <div className="card-header"><h2>Company Profile</h2></div>
      <div className="settings-form-grid">
        <div className="form-group">
          <label>Company Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Industry</label>
          <select defaultValue="Information Technology">
            <option>Information Technology</option><option>Finance</option><option>Healthcare</option><option>Education</option>
          </select>
        </div>
        <div className="form-group">
          <label>Company Size</label>
          <select defaultValue="51-200">
            <option>1-50</option><option>51-200</option><option>201-500</option><option>500+</option>
          </select>
        </div>
        <div className="form-group"><label>Founded Year</label><input type="text" defaultValue="2018" /></div>
        <div className="form-group"><label>Contact Email</label><input type="email" defaultValue="hr@copan.com" /></div>
        <div className="form-group"><label>Phone</label><input type="text" defaultValue="+91 22 4567 8900" /></div>
      </div>
      <div className="form-group" style={{ marginTop: 8 }}>
        <label>Address</label>
        <textarea rows="2" defaultValue="Tower B, Cyber City, Sector 24, Mumbai, Maharashtra 400001" />
      </div>

      <div className="card-header" style={{ marginTop: 28 }}><h2>Office Locations</h2></div>
      <div className="settings-locations">
        {COMPANY.locations.map((loc) => (
          <div className="settings-location-tag" key={loc}><i className="fas fa-map-marker-alt" /> {loc}</div>
        ))}
      </div>

      <div className="form-actions" style={{ marginTop: 28 }}>
        <button className="btn btn-outline">Reset</button>
        <button className="btn btn-primary" onClick={() => alert("Company settings saved!")}><i className="fas fa-check" /> Save Changes</button>
      </div>
    </div>
  );
}
