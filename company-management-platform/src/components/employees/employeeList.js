// Employee List component

function renderEmployeeList() {
    const total = EMPLOYEES.length;
    const active = EMPLOYEES.filter(e => e.status === 'active').length;
    const onLeave = EMPLOYEES.filter(e => e.status === 'on-leave').length;

    return `
    ${renderHeader('Employees')}
    <div class="page-content">
        <div class="employees-header">
            <div class="filters">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search employees..." id="empSearch">
                </div>
                <select class="filter-select" id="deptFilter">
                    <option value="">All Departments</option>
                    ${COMPANY.departments.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
                <select class="filter-select" id="statusFilter">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                </select>
            </div>
            <button class="btn btn-primary" onclick="showAddEmployeeModal()">
                <i class="fas fa-plus"></i> Add Employee
            </button>
        </div>

        <div class="employee-stats">
            <span class="employee-stat active-stat">All (${total})</span>
            <span class="employee-stat">Active (${active})</span>
            <span class="employee-stat">On Leave (${onLeave})</span>
        </div>

        <div class="card">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Employee ID</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Location</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="employeeTableBody">
                        ${renderEmployeeRows(EMPLOYEES)}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="addEmployeeModal" style="display:none;">
        <div class="modal">
            <h3>Add New Employee</h3>
            <form id="addEmployeeForm">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="newEmpName" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="newEmpEmail" required>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select id="newEmpDept" required>
                        ${COMPANY.departments.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Designation</label>
                    <input type="text" id="newEmpDesignation" required>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <select id="newEmpLocation" required>
                        ${COMPANY.locations.map(l => `<option value="${l}">${l}</option>`).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closeAddEmployeeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Employee</button>
                </div>
            </form>
        </div>
    </div>`;
}

function renderEmployeeRows(employees) {
    return employees.map(emp => `
        <tr class="clickable-row" onclick="Router.navigate('employee-profile', { id: ${emp.id} })">
            <td>
                <div class="employee-cell">
                    <div class="avatar" style="background:${getAvatarColor(emp.name)}">${emp.avatar}</div>
                    <div>
                        <div class="name">${emp.name}</div>
                        <div class="sub">${emp.email}</div>
                    </div>
                </div>
            </td>
            <td>${emp.employeeId}</td>
            <td>${emp.department}</td>
            <td>${emp.designation}</td>
            <td>${emp.location}</td>
            <td><span class="badge ${getStatusBadge(emp.status)}">${emp.status}</span></td>
        </tr>
    `).join('');
}

function initEmployeeList() {
    const search = document.getElementById('empSearch');
    const deptFilter = document.getElementById('deptFilter');
    const statusFilter = document.getElementById('statusFilter');

    function filterEmployees() {
        const query = search.value.toLowerCase();
        const dept = deptFilter.value;
        const status = statusFilter.value;

        const filtered = EMPLOYEES.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(query) || emp.email.toLowerCase().includes(query) || emp.employeeId.toLowerCase().includes(query);
            const matchesDept = !dept || emp.department === dept;
            const matchesStatus = !status || emp.status === status;
            return matchesSearch && matchesDept && matchesStatus;
        });

        document.getElementById('employeeTableBody').innerHTML = renderEmployeeRows(filtered);
    }

    if (search) search.addEventListener('input', filterEmployees);
    if (deptFilter) deptFilter.addEventListener('change', filterEmployees);
    if (statusFilter) statusFilter.addEventListener('change', filterEmployees);
}

function showAddEmployeeModal() {
    document.getElementById('addEmployeeModal').style.display = 'flex';
}

function closeAddEmployeeModal() {
    document.getElementById('addEmployeeModal').style.display = 'none';
}

function initAddEmployeeForm() {
    const form = document.getElementById('addEmployeeForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('newEmpName').value;
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const newEmp = {
                id: EMPLOYEES.length + 1,
                name: name,
                email: document.getElementById('newEmpEmail').value,
                phone: '',
                department: document.getElementById('newEmpDept').value,
                designation: document.getElementById('newEmpDesignation').value,
                location: document.getElementById('newEmpLocation').value,
                joinDate: new Date().toISOString().split('T')[0],
                salary: 0,
                status: 'active',
                avatar: initials,
                manager: null,
                employeeId: 'TN-' + (1000 + EMPLOYEES.length + 1)
            };
            EMPLOYEES.push(newEmp);
            closeAddEmployeeModal();
            Router.navigate('employees');
        });
    }
}
