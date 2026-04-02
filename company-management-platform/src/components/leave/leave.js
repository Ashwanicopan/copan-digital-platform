// Leave management component

function renderLeave() {
    const userLeave = LEAVE_BALANCE.find(l => l.employeeId === CURRENT_USER.id) || { casual: 10, sick: 7, earned: 15, compOff: 2 };

    return `
    ${renderHeader('Leave Management')}
    <div class="page-content">
        <div class="leave-balance-grid">
            <div class="leave-balance-card">
                <div class="leave-type">Casual Leave</div>
                <div class="leave-count">${userLeave.casual}</div>
                <div class="leave-total">of 12 remaining</div>
            </div>
            <div class="leave-balance-card">
                <div class="leave-type">Sick Leave</div>
                <div class="leave-count">${userLeave.sick}</div>
                <div class="leave-total">of 7 remaining</div>
            </div>
            <div class="leave-balance-card">
                <div class="leave-type">Earned Leave</div>
                <div class="leave-count">${userLeave.earned}</div>
                <div class="leave-total">of 18 remaining</div>
            </div>
            <div class="leave-balance-card">
                <div class="leave-type">Comp Off</div>
                <div class="leave-count">${userLeave.compOff}</div>
                <div class="leave-total">available</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2>Leave Requests</h2>
                <button class="btn btn-primary" onclick="showApplyLeaveModal()">
                    <i class="fas fa-plus"></i> Apply Leave
                </button>
            </div>

            <div class="tabs">
                <button class="tab active" onclick="filterLeaves('all', this)">All</button>
                <button class="tab" onclick="filterLeaves('pending', this)">Pending</button>
                <button class="tab" onclick="filterLeaves('approved', this)">Approved</button>
                <button class="tab" onclick="filterLeaves('rejected', this)">Rejected</button>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Leave Type</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Days</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="leaveTableBody">
                        ${renderLeaveRows(LEAVE_REQUESTS)}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="applyLeaveModal" style="display:none;">
        <div class="modal">
            <h3>Apply for Leave</h3>
            <form id="applyLeaveForm">
                <div class="form-group">
                    <label>Leave Type</label>
                    <select id="leaveType" required>
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Earned Leave">Earned Leave</option>
                        <option value="Comp Off">Comp Off</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>From Date</label>
                    <input type="date" id="leaveFrom" required>
                </div>
                <div class="form-group">
                    <label>To Date</label>
                    <input type="date" id="leaveTo" required>
                </div>
                <div class="form-group">
                    <label>Reason</label>
                    <textarea id="leaveReason" rows="3" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closeApplyLeaveModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit Request</button>
                </div>
            </form>
        </div>
    </div>`;
}

function renderLeaveRows(leaves) {
    return leaves.map(l => `
        <tr>
            <td>
                <div class="employee-cell">
                    <div class="avatar" style="background:${getAvatarColor(l.employeeName)}">${getEmployeeById(l.employeeId)?.avatar || '?'}</div>
                    <div><div class="name">${l.employeeName}</div></div>
                </div>
            </td>
            <td>${l.type}</td>
            <td>${formatDate(l.from)}</td>
            <td>${formatDate(l.to)}</td>
            <td>${l.days}</td>
            <td class="text-sm">${l.reason}</td>
            <td><span class="badge ${getStatusBadge(l.status)}">${l.status}</span></td>
            <td>
                ${l.status === 'pending' ? `
                <div class="leave-actions">
                    <button class="btn-approve" onclick="approveLeave(${l.id})">Approve</button>
                    <button class="btn-reject" onclick="rejectLeave(${l.id})">Reject</button>
                </div>` : '-'}
            </td>
        </tr>
    `).join('');
}

function filterLeaves(status, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const filtered = status === 'all' ? LEAVE_REQUESTS : LEAVE_REQUESTS.filter(l => l.status === status);
    document.getElementById('leaveTableBody').innerHTML = renderLeaveRows(filtered);
}

function approveLeave(id) {
    const leave = LEAVE_REQUESTS.find(l => l.id === id);
    if (leave) { leave.status = 'approved'; Router.navigate('leave'); }
}

function rejectLeave(id) {
    const leave = LEAVE_REQUESTS.find(l => l.id === id);
    if (leave) { leave.status = 'rejected'; Router.navigate('leave'); }
}

function showApplyLeaveModal() {
    document.getElementById('applyLeaveModal').style.display = 'flex';
}

function closeApplyLeaveModal() {
    document.getElementById('applyLeaveModal').style.display = 'none';
}

function initLeave() {
    const form = document.getElementById('applyLeaveForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const from = document.getElementById('leaveFrom').value;
            const to = document.getElementById('leaveTo').value;
            const days = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;

            LEAVE_REQUESTS.unshift({
                id: LEAVE_REQUESTS.length + 1,
                employeeId: CURRENT_USER.id,
                employeeName: CURRENT_USER.name,
                type: document.getElementById('leaveType').value,
                from: from,
                to: to,
                days: days,
                reason: document.getElementById('leaveReason').value,
                status: 'pending',
                appliedOn: new Date().toISOString().split('T')[0]
            });
            closeApplyLeaveModal();
            Router.navigate('leave');
        });
    }
}
