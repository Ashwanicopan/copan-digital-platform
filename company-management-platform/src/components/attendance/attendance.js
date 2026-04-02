// Attendance component

function renderAttendance() {
    const todayLogs = ATTENDANCE_LOG.filter(a => a.date === '2026-04-01');
    const present = todayLogs.filter(a => a.status === 'present').length;
    const absent = todayLogs.filter(a => a.status === 'absent').length;
    const leave = todayLogs.filter(a => a.status === 'on-leave').length;
    const avgHours = (todayLogs.filter(a => a.hours > 0).reduce((s, a) => s + a.hours, 0) / present).toFixed(1);

    return `
    ${renderHeader('Attendance')}
    <div class="page-content">
        <div class="clock-widget" id="clockWidget">
            <div>
                <div class="time" id="liveTime">${getCurrentTime()}</div>
                <div class="date">${getCurrentDate()}</div>
            </div>
            <div class="clock-actions">
                <button class="btn-clock btn-clock-in" onclick="clockIn()">Clock In</button>
                <button class="btn-clock btn-clock-out" onclick="clockOut()">Clock Out</button>
            </div>
        </div>

        <div class="attendance-summary">
            <div class="attendance-stat">
                <div class="count" style="color:var(--success)">${present}</div>
                <div class="label">Present</div>
            </div>
            <div class="attendance-stat">
                <div class="count" style="color:var(--danger)">${absent}</div>
                <div class="label">Absent</div>
            </div>
            <div class="attendance-stat">
                <div class="count" style="color:var(--warning)">${leave}</div>
                <div class="label">On Leave</div>
            </div>
            <div class="attendance-stat">
                <div class="count">${avgHours}</div>
                <div class="label">Avg Hours</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2>Today's Attendance Log</h2>
                <select class="filter-select" id="attendanceDateFilter">
                    <option value="2026-04-01">April 1, 2026</option>
                    <option value="2026-04-02">April 2, 2026</option>
                </select>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Clock In</th>
                            <th>Clock Out</th>
                            <th>Hours</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="attendanceTableBody">
                        ${renderAttendanceRows('2026-04-01')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

function renderAttendanceRows(date) {
    const logs = ATTENDANCE_LOG.filter(a => a.date === date);
    return logs.map(log => {
        const emp = getEmployeeById(log.employeeId);
        if (!emp) return '';
        return `
        <tr>
            <td>
                <div class="employee-cell">
                    <div class="avatar" style="background:${getAvatarColor(emp.name)}">${emp.avatar}</div>
                    <div><div class="name">${emp.name}</div><div class="sub">${emp.department}</div></div>
                </div>
            </td>
            <td>${log.clockIn || '-'}</td>
            <td>${log.clockOut || '-'}</td>
            <td>${log.hours ? log.hours + ' hrs' : '-'}</td>
            <td><span class="badge ${getStatusBadge(log.status)}">${log.status}</span></td>
        </tr>`;
    }).join('');
}

function initAttendance() {
    // Live clock
    setInterval(() => {
        const el = document.getElementById('liveTime');
        if (el) el.textContent = getCurrentTime();
    }, 1000);

    const dateFilter = document.getElementById('attendanceDateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            document.getElementById('attendanceTableBody').innerHTML = renderAttendanceRows(this.value);
        });
    }
}

function clockIn() {
    alert('Clocked in at ' + getCurrentTime());
}

function clockOut() {
    alert('Clocked out at ' + getCurrentTime());
}
