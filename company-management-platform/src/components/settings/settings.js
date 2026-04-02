// Settings component

function renderSettings() {
    return `
    ${renderHeader('Settings')}
    <div class="page-content">
        <div class="settings-layout">
            <div class="settings-sidebar">
                <button class="settings-nav-item active" onclick="switchSettingsTab('company', this)">
                    <i class="fas fa-building"></i> Company Profile
                </button>
                <button class="settings-nav-item" onclick="switchSettingsTab('roles', this)">
                    <i class="fas fa-user-shield"></i> Roles & Permissions
                </button>
                <button class="settings-nav-item" onclick="switchSettingsTab('leave-policy', this)">
                    <i class="fas fa-calendar-alt"></i> Leave Policy
                </button>
                <button class="settings-nav-item" onclick="switchSettingsTab('notifications', this)">
                    <i class="fas fa-bell"></i> Notifications
                </button>
                <button class="settings-nav-item" onclick="switchSettingsTab('payroll-settings', this)">
                    <i class="fas fa-wallet"></i> Payroll Config
                </button>
            </div>

            <div class="settings-content" id="settingsContent">
                ${renderCompanySettings()}
            </div>
        </div>
    </div>`;
}

function renderCompanySettings() {
    return `
    <div class="card">
        <div class="card-header"><h2>Company Profile</h2></div>
        <form id="companySettingsForm">
            <div class="settings-form-grid">
                <div class="form-group">
                    <label>Company Name</label>
                    <input type="text" value="${COMPANY.name}" id="settCompanyName">
                </div>
                <div class="form-group">
                    <label>Industry</label>
                    <select>
                        <option selected>Information Technology</option>
                        <option>Finance</option>
                        <option>Healthcare</option>
                        <option>Education</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Company Size</label>
                    <select>
                        <option>1-50</option>
                        <option selected>51-200</option>
                        <option>201-500</option>
                        <option>500+</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Founded Year</label>
                    <input type="text" value="2018">
                </div>
                <div class="form-group">
                    <label>Contact Email</label>
                    <input type="email" value="hr@technova.com">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" value="+91 22 4567 8900">
                </div>
            </div>
            <div class="form-group" style="margin-top:8px;">
                <label>Address</label>
                <textarea rows="2">Tower B, Cyber City, Sector 24, Mumbai, Maharashtra 400001</textarea>
            </div>

            <div class="card-header" style="margin-top:28px;"><h2>Office Locations</h2></div>
            <div class="settings-locations">
                ${COMPANY.locations.map(loc => `
                <div class="settings-location-tag">
                    <i class="fas fa-map-marker-alt"></i> ${loc}
                </div>`).join('')}
            </div>

            <div class="form-actions" style="margin-top:28px;">
                <button type="button" class="btn btn-outline" onclick="Router.navigate('settings')">Reset</button>
                <button type="button" class="btn btn-primary" onclick="saveCompanySettings()">
                    <i class="fas fa-check"></i> Save Changes
                </button>
            </div>
        </form>
    </div>`;
}

function renderRolesSettings() {
    const roles = [
        { name: 'Super Admin', users: 1, permissions: 'Full access to all modules', color: 'var(--danger)' },
        { name: 'HR Manager', users: 1, permissions: 'Manage employees, leave, attendance, payroll', color: 'var(--primary)' },
        { name: 'Manager', users: 3, permissions: 'View team, approve leave, view attendance', color: 'var(--success)' },
        { name: 'Employee', users: 7, permissions: 'Self-service: profile, leave, attendance', color: 'var(--gray-500)' },
    ];

    return `
    <div class="card">
        <div class="card-header">
            <h2>Roles & Permissions</h2>
            <button class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Add Role</button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr><th>Role</th><th>Users</th><th>Permissions</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    ${roles.map(r => `
                    <tr>
                        <td><div class="flex items-center gap-2"><span style="width:10px;height:10px;border-radius:50%;background:${r.color};display:inline-block;"></span><strong>${r.name}</strong></div></td>
                        <td>${r.users}</td>
                        <td class="text-sm text-muted">${r.permissions}</td>
                        <td><button class="btn btn-outline btn-sm">Edit</button></td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
    </div>`;
}

function renderLeavePolicySettings() {
    const policies = [
        { type: 'Casual Leave', total: 12, carryForward: 'No', encashable: 'No' },
        { type: 'Sick Leave', total: 7, carryForward: 'No', encashable: 'No' },
        { type: 'Earned Leave', total: 18, carryForward: 'Yes (max 10)', encashable: 'Yes' },
        { type: 'Comp Off', total: 'As earned', carryForward: 'No', encashable: 'No' },
        { type: 'Maternity Leave', total: 182, carryForward: 'N/A', encashable: 'No' },
        { type: 'Paternity Leave', total: 15, carryForward: 'N/A', encashable: 'No' },
    ];

    return `
    <div class="card">
        <div class="card-header">
            <h2>Leave Policy</h2>
            <button class="btn btn-primary btn-sm"><i class="fas fa-edit"></i> Edit Policy</button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr><th>Leave Type</th><th>Annual Quota</th><th>Carry Forward</th><th>Encashable</th></tr>
                </thead>
                <tbody>
                    ${policies.map(p => `
                    <tr>
                        <td><strong>${p.type}</strong></td>
                        <td>${typeof p.total === 'number' ? p.total + ' days' : p.total}</td>
                        <td>${p.carryForward}</td>
                        <td>${p.encashable}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>

        <div style="margin-top:20px;padding:16px;background:var(--gray-50);border-radius:var(--radius);">
            <h3 class="text-sm font-semibold" style="margin-bottom:8px;">Policy Notes</h3>
            <ul style="font-size:0.8rem;color:var(--gray-500);padding-left:16px;line-height:1.8;">
                <li>Leave year: January 1 to December 31</li>
                <li>Probation period: First 6 months (only sick leave available)</li>
                <li>Earned leave accrues at 1.5 days per month</li>
                <li>Sandwich rule applies to casual leave</li>
            </ul>
        </div>
    </div>`;
}

function renderNotificationSettings() {
    const settings = [
        { label: 'Leave request submitted', email: true, push: true },
        { label: 'Leave approved / rejected', email: true, push: true },
        { label: 'New employee onboarding', email: true, push: false },
        { label: 'Payroll processed', email: true, push: true },
        { label: 'Attendance anomalies', email: false, push: true },
        { label: 'New announcements', email: true, push: true },
        { label: 'Birthday reminders', email: false, push: false },
        { label: 'Work anniversary', email: true, push: false },
    ];

    return `
    <div class="card">
        <div class="card-header"><h2>Notification Preferences</h2></div>
        <div class="table-container">
            <table>
                <thead>
                    <tr><th>Event</th><th>Email</th><th>Push Notification</th></tr>
                </thead>
                <tbody>
                    ${settings.map((s, i) => `
                    <tr>
                        <td>${s.label}</td>
                        <td><label class="toggle"><input type="checkbox" ${s.email ? 'checked' : ''}><span class="toggle-slider"></span></label></td>
                        <td><label class="toggle"><input type="checkbox" ${s.push ? 'checked' : ''}><span class="toggle-slider"></span></label></td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
        <div class="form-actions" style="margin-top:20px;">
            <button class="btn btn-primary" onclick="alert('Notification preferences saved!')"><i class="fas fa-check"></i> Save Preferences</button>
        </div>
    </div>`;
}

function renderPayrollSettings() {
    return `
    <div class="card">
        <div class="card-header"><h2>Payroll Configuration</h2></div>
        <div class="settings-form-grid">
            <div class="form-group">
                <label>Pay Cycle</label>
                <select><option selected>Monthly</option><option>Bi-weekly</option><option>Weekly</option></select>
            </div>
            <div class="form-group">
                <label>Pay Day</label>
                <select><option>25th of month</option><option selected>28th of month</option><option>Last day of month</option></select>
            </div>
            <div class="form-group">
                <label>Currency</label>
                <select><option selected>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option></select>
            </div>
            <div class="form-group">
                <label>Financial Year</label>
                <select><option selected>April - March</option><option>January - December</option></select>
            </div>
        </div>

        <div class="card-header" style="margin-top:24px;"><h2>Salary Components</h2></div>
        <div class="table-container">
            <table>
                <thead>
                    <tr><th>Component</th><th>Type</th><th>Calculation</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>Basic Salary</strong></td><td><span class="badge badge-success">Earning</span></td><td>50% of CTC</td></tr>
                    <tr><td><strong>HRA</strong></td><td><span class="badge badge-success">Earning</span></td><td>40% of Basic</td></tr>
                    <tr><td><strong>Special Allowance</strong></td><td><span class="badge badge-success">Earning</span></td><td>Remaining CTC</td></tr>
                    <tr><td><strong>PF (Employee)</strong></td><td><span class="badge badge-danger">Deduction</span></td><td>12% of Basic</td></tr>
                    <tr><td><strong>Professional Tax</strong></td><td><span class="badge badge-danger">Deduction</span></td><td>₹200/month</td></tr>
                    <tr><td><strong>Income Tax (TDS)</strong></td><td><span class="badge badge-danger">Deduction</span></td><td>As per slab</td></tr>
                </tbody>
            </table>
        </div>
        <div class="form-actions" style="margin-top:20px;">
            <button class="btn btn-outline">Reset</button>
            <button class="btn btn-primary" onclick="alert('Payroll settings saved!')"><i class="fas fa-check"></i> Save Changes</button>
        </div>
    </div>`;
}

function switchSettingsTab(tab, btn) {
    document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
    btn.classList.add('active');

    const content = document.getElementById('settingsContent');
    switch (tab) {
        case 'company': content.innerHTML = renderCompanySettings(); break;
        case 'roles': content.innerHTML = renderRolesSettings(); break;
        case 'leave-policy': content.innerHTML = renderLeavePolicySettings(); break;
        case 'notifications': content.innerHTML = renderNotificationSettings(); break;
        case 'payroll-settings': content.innerHTML = renderPayrollSettings(); break;
    }
}

function saveCompanySettings() {
    const name = document.getElementById('settCompanyName');
    if (name) COMPANY.name = name.value;
    alert('Company settings saved successfully!');
}
