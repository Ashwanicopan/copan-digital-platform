// Payroll component

function renderPayroll() {
    const totalPayout = PAYROLL_DATA.reduce((s, p) => s + p.netPay, 0);
    const totalTax = PAYROLL_DATA.reduce((s, p) => s + p.tax, 0);
    const processed = PAYROLL_DATA.filter(p => p.status === 'paid').length;

    return `
    ${renderHeader('Payroll')}
    <div class="page-content">
        <div class="payroll-summary">
            <div class="payroll-stat">
                <div class="label">Total Payout (March)</div>
                <div class="value">${formatCurrency(totalPayout)}</div>
                <div class="sub">${processed} employees processed</div>
            </div>
            <div class="payroll-stat">
                <div class="label">Total Tax Deducted</div>
                <div class="value">${formatCurrency(totalTax)}</div>
                <div class="sub">TDS for March 2026</div>
            </div>
            <div class="payroll-stat">
                <div class="label">Payroll Status</div>
                <div class="value" style="color:var(--success)">Completed</div>
                <div class="sub">Paid on 28 Mar 2026</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2>Payroll Details - March 2026</h2>
                <div class="flex gap-2">
                    <select class="filter-select">
                        <option>March 2026</option>
                        <option>February 2026</option>
                        <option>January 2026</option>
                    </select>
                    <button class="btn btn-outline btn-sm"><i class="fas fa-download"></i> Export</button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Basic</th>
                            <th>HRA</th>
                            <th>Allowances</th>
                            <th>Deductions</th>
                            <th>Tax</th>
                            <th>Net Pay</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${PAYROLL_DATA.map(p => {
                            const emp = getEmployeeById(p.employeeId);
                            if (!emp) return '';
                            return `
                            <tr>
                                <td>
                                    <div class="employee-cell">
                                        <div class="avatar" style="background:${getAvatarColor(emp.name)}">${emp.avatar}</div>
                                        <div><div class="name">${emp.name}</div><div class="sub">${emp.employeeId}</div></div>
                                    </div>
                                </td>
                                <td class="salary-cell">${formatCurrency(p.basic)}</td>
                                <td class="salary-cell">${formatCurrency(p.hra)}</td>
                                <td class="salary-cell">${formatCurrency(p.allowances)}</td>
                                <td class="salary-cell" style="color:var(--danger)">${formatCurrency(p.deductions)}</td>
                                <td class="salary-cell" style="color:var(--danger)">${formatCurrency(p.tax)}</td>
                                <td class="salary-cell font-semibold">${formatCurrency(p.netPay)}</td>
                                <td><span class="badge ${getStatusBadge(p.status)}">${p.status}</span></td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}
