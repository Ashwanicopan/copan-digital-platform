// Dashboard component

function renderDashboard() {
    const totalEmployees = EMPLOYEES.length;
    const activeEmployees = EMPLOYEES.filter(e => e.status === 'active').length;
    const onLeave = EMPLOYEES.filter(e => e.status === 'on-leave').length;
    const pendingLeaves = LEAVE_REQUESTS.filter(l => l.status === 'pending').length;
    const departments = [...new Set(EMPLOYEES.map(e => e.department))].length;

    return `
    ${renderHeader('Dashboard')}
    <div class="page-content">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Total Employees</h3>
                    <div class="stat-value">${totalEmployees}</div>
                    <div class="stat-change positive"><i class="fas fa-arrow-up"></i> 2 this month</div>
                </div>
                <div class="stat-icon blue"><i class="fas fa-users"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Present Today</h3>
                    <div class="stat-value">${activeEmployees - 1}</div>
                    <div class="stat-change positive">${Math.round(((activeEmployees-1)/totalEmployees)*100)}% attendance</div>
                </div>
                <div class="stat-icon green"><i class="fas fa-user-check"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>On Leave</h3>
                    <div class="stat-value">${onLeave}</div>
                    <div class="stat-change">${pendingLeaves} pending requests</div>
                </div>
                <div class="stat-icon orange"><i class="fas fa-calendar-times"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Departments</h3>
                    <div class="stat-value">${departments}</div>
                    <div class="stat-change">${COMPANY.locations.length} locations</div>
                </div>
                <div class="stat-icon red"><i class="fas fa-building"></i></div>
            </div>
        </div>

        <div class="dashboard-grid">
            <div>
                <div class="card">
                    <div class="card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div class="quick-actions">
                        <button class="quick-action-btn" onclick="Router.navigate('employees')">
                            <i class="fas fa-user-plus"></i> Add Employee
                        </button>
                        <button class="quick-action-btn" onclick="Router.navigate('attendance')">
                            <i class="fas fa-clipboard-check"></i> Mark Attendance
                        </button>
                        <button class="quick-action-btn" onclick="Router.navigate('leave')">
                            <i class="fas fa-calendar-plus"></i> Leave Requests
                        </button>
                        <button class="quick-action-btn" onclick="Router.navigate('payroll')">
                            <i class="fas fa-file-invoice-dollar"></i> Run Payroll
                        </button>
                    </div>
                </div>

                <div class="card mt-4">
                    <div class="card-header">
                        <h2>Recent Leave Requests</h2>
                        <a href="#" onclick="Router.navigate('leave'); return false;" class="text-sm">View All</a>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Type</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${LEAVE_REQUESTS.slice(0, 4).map(l => `
                                <tr>
                                    <td><div class="employee-cell"><div class="avatar" style="background:${getAvatarColor(l.employeeName)}">${getEmployeeById(l.employeeId)?.avatar || '?'}</div><div><div class="name">${l.employeeName}</div></div></div></td>
                                    <td>${l.type}</td>
                                    <td>${l.days} day${l.days > 1 ? 's' : ''}</td>
                                    <td><span class="badge ${getStatusBadge(l.status)}">${l.status}</span></td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div>
                <div class="card">
                    <div class="card-header">
                        <h2>Announcements</h2>
                    </div>
                    ${ANNOUNCEMENTS.map(a => `
                    <div class="announcement-item">
                        <h4>${a.title}</h4>
                        <p>${a.message}</p>
                        <div class="meta">${formatDate(a.date)} &middot; ${a.author}</div>
                    </div>`).join('')}
                </div>

                <div class="card mt-4">
                    <div class="card-header">
                        <h2>Department Breakdown</h2>
                    </div>
                    ${COMPANY.departments.map(dept => {
                        const count = EMPLOYEES.filter(e => e.department === dept).length;
                        const pct = Math.round((count / totalEmployees) * 100);
                        return `
                        <div style="margin-bottom:12px;">
                            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                <span class="text-sm font-medium">${dept}</span>
                                <span class="text-sm text-muted">${count}</span>
                            </div>
                            <div style="height:6px;background:var(--gray-100);border-radius:3px;overflow:hidden;">
                                <div style="height:100%;width:${pct}%;background:var(--primary);border-radius:3px;"></div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>
    </div>`;
}
