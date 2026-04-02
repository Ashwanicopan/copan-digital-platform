// Departments component

function renderDepartments() {
    const deptData = COMPANY.departments.map(dept => {
        const members = EMPLOYEES.filter(e => e.department === dept);
        const head = members.find(e => e.designation.includes('Manager') || e.designation.includes('Lead') || e.designation.includes('VP'));
        return { name: dept, members, head, count: members.length };
    });

    const totalDepts = deptData.length;
    const totalEmployees = EMPLOYEES.length;
    const avgSize = Math.round(totalEmployees / totalDepts);
    const largest = deptData.reduce((a, b) => a.count > b.count ? a : b);

    return `
    ${renderHeader('Departments')}
    <div class="page-content">
        <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Total Departments</h3>
                    <div class="stat-value">${totalDepts}</div>
                </div>
                <div class="stat-icon blue"><i class="fas fa-sitemap"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Total Employees</h3>
                    <div class="stat-value">${totalEmployees}</div>
                </div>
                <div class="stat-icon green"><i class="fas fa-users"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Avg Team Size</h3>
                    <div class="stat-value">${avgSize}</div>
                </div>
                <div class="stat-icon orange"><i class="fas fa-chart-bar"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Largest Team</h3>
                    <div class="stat-value">${largest.name}</div>
                    <div class="stat-change">${largest.count} members</div>
                </div>
                <div class="stat-icon red"><i class="fas fa-trophy"></i></div>
            </div>
        </div>

        <div class="dept-grid">
            ${deptData.map(dept => `
            <div class="card dept-card">
                <div class="dept-card-header">
                    <div class="dept-icon" style="background:${getAvatarColor(dept.name)}">
                        <i class="fas ${getDeptIcon(dept.name)}"></i>
                    </div>
                    <div>
                        <h3 class="dept-name">${dept.name}</h3>
                        <span class="text-sm text-muted">${dept.count} member${dept.count !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                ${dept.head ? `
                <div class="dept-head">
                    <div class="detail-label">Department Head</div>
                    <div class="employee-cell" style="margin-top:6px;">
                        <div class="avatar" style="background:${getAvatarColor(dept.head.name)};width:30px;height:30px;font-size:0.7rem;">${dept.head.avatar}</div>
                        <div>
                            <div class="name" style="font-size:0.85rem;">${dept.head.name}</div>
                            <div class="sub">${dept.head.designation}</div>
                        </div>
                    </div>
                </div>` : ''}

                <div class="dept-members-section">
                    <div class="detail-label" style="margin-bottom:8px;">Team Members</div>
                    <div class="dept-members-avatars">
                        ${dept.members.slice(0, 5).map(m => `
                            <div class="avatar dept-member-avatar" style="background:${getAvatarColor(m.name)};width:30px;height:30px;font-size:0.65rem;" title="${m.name}">${m.avatar}</div>
                        `).join('')}
                        ${dept.count > 5 ? `<div class="dept-more-count">+${dept.count - 5}</div>` : ''}
                    </div>
                </div>

                <div class="dept-locations">
                    <div class="detail-label" style="margin-bottom:6px;">Locations</div>
                    <div class="dept-location-tags">
                        ${[...new Set(dept.members.map(m => m.location))].map(loc => `
                            <span class="dept-location-tag"><i class="fas fa-map-marker-alt"></i> ${loc}</span>
                        `).join('')}
                    </div>
                </div>

                <button class="btn btn-outline btn-sm dept-view-btn" onclick="viewDepartmentMembers('${dept.name}')">
                    View All Members <i class="fas fa-arrow-right"></i>
                </button>
            </div>`).join('')}
        </div>
    </div>

    <!-- Department Members Modal -->
    <div class="modal-overlay" id="deptMembersModal" style="display:none;">
        <div class="modal" style="max-width:600px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 id="deptModalTitle" style="margin-bottom:0;">Department Members</h3>
                <button class="btn btn-outline btn-sm" onclick="closeDeptModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="table-container" id="deptMembersTableContainer"></div>
        </div>
    </div>`;
}

function getDeptIcon(dept) {
    const icons = {
        'Engineering': 'fa-code',
        'Design': 'fa-palette',
        'Marketing': 'fa-bullhorn',
        'Sales': 'fa-chart-line',
        'HR': 'fa-users-cog',
        'Finance': 'fa-coins',
        'Operations': 'fa-cogs'
    };
    return icons[dept] || 'fa-building';
}

function viewDepartmentMembers(deptName) {
    const members = EMPLOYEES.filter(e => e.department === deptName);
    document.getElementById('deptModalTitle').textContent = deptName + ' Team';
    document.getElementById('deptMembersTableContainer').innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>Designation</th>
                    <th>Location</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${members.map(emp => `
                <tr class="clickable-row" onclick="closeDeptModal(); Router.navigate('employee-profile', { id: ${emp.id} })">
                    <td>
                        <div class="employee-cell">
                            <div class="avatar" style="background:${getAvatarColor(emp.name)};width:32px;height:32px;font-size:0.75rem;">${emp.avatar}</div>
                            <div>
                                <div class="name">${emp.name}</div>
                                <div class="sub">${emp.email}</div>
                            </div>
                        </div>
                    </td>
                    <td>${emp.designation}</td>
                    <td>${emp.location}</td>
                    <td><span class="badge ${getStatusBadge(emp.status)}">${emp.status}</span></td>
                </tr>`).join('')}
            </tbody>
        </table>`;
    document.getElementById('deptMembersModal').style.display = 'flex';
}

function closeDeptModal() {
    document.getElementById('deptMembersModal').style.display = 'none';
}
