// Employee Profile component

function renderEmployeeProfile(data) {
    const emp = getEmployeeById(data.id);
    if (!emp) return `<div class="page-content"><p>Employee not found.</p></div>`;

    const leaveBalance = LEAVE_BALANCE.find(l => l.employeeId === emp.id);
    const payroll = PAYROLL_DATA.find(p => p.employeeId === emp.id);

    return `
    ${renderHeader('Employee Profile')}
    <div class="page-content">
        <button class="btn btn-outline mb-4" onclick="Router.navigate('employees')">
            <i class="fas fa-arrow-left"></i> Back to Employees
        </button>

        <div class="profile-header">
            <div class="avatar avatar-lg" style="background:${getAvatarColor(emp.name)}">${emp.avatar}</div>
            <div class="profile-info">
                <h2>${emp.name}</h2>
                <div class="designation">${emp.designation} &middot; ${emp.department}</div>
                <span class="badge ${getStatusBadge(emp.status)}">${emp.status}</span>
            </div>
        </div>

        <div class="profile-details-grid">
            <div class="card">
                <div class="card-header"><h2>Personal Information</h2></div>
                <div class="detail-item mb-4">
                    <span class="detail-label">Employee ID</span>
                    <span class="detail-value">${emp.employeeId}</span>
                </div>
                <div class="detail-item mb-4">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${emp.email}</span>
                </div>
                <div class="detail-item mb-4">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${emp.phone}</span>
                </div>
                <div class="detail-item mb-4">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${emp.location}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Join Date</span>
                    <span class="detail-value">${formatDate(emp.joinDate)}</span>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2>Employment Details</h2></div>
                <div class="detail-item mb-4">
                    <span class="detail-label">Department</span>
                    <span class="detail-value">${emp.department}</span>
                </div>
                <div class="detail-item mb-4">
                    <span class="detail-label">Designation</span>
                    <span class="detail-value">${emp.designation}</span>
                </div>
                <div class="detail-item mb-4">
                    <span class="detail-label">Reporting Manager</span>
                    <span class="detail-value">${emp.manager || 'N/A'}</span>
                </div>
                <div class="detail-item mb-4">
                    <span class="detail-label">Monthly CTC</span>
                    <span class="detail-value">${formatCurrency(emp.salary)}</span>
                </div>
                ${leaveBalance ? `
                <div class="detail-item">
                    <span class="detail-label">Leave Balance</span>
                    <span class="detail-value">CL: ${leaveBalance.casual} | SL: ${leaveBalance.sick} | EL: ${leaveBalance.earned}</span>
                </div>` : ''}
            </div>
        </div>

        ${payroll ? `
        <div class="card mt-4">
            <div class="card-header"><h2>Last Payslip - ${payroll.month}</h2></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Basic</th>
                            <th>HRA</th>
                            <th>Allowances</th>
                            <th>Deductions</th>
                            <th>Tax</th>
                            <th>Net Pay</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="salary-cell">${formatCurrency(payroll.basic)}</td>
                            <td class="salary-cell">${formatCurrency(payroll.hra)}</td>
                            <td class="salary-cell">${formatCurrency(payroll.allowances)}</td>
                            <td class="salary-cell" style="color:var(--danger)">${formatCurrency(payroll.deductions)}</td>
                            <td class="salary-cell" style="color:var(--danger)">${formatCurrency(payroll.tax)}</td>
                            <td class="salary-cell font-semibold">${formatCurrency(payroll.netPay)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>` : ''}
    </div>`;
}
