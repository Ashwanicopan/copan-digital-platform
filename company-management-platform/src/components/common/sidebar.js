// Sidebar component

function renderSidebar() {
    const pendingLeaves = LEAVE_REQUESTS.filter(l => l.status === 'pending').length;

    return `
    <aside class="sidebar">
        <div class="sidebar-brand">
            <div class="logo">HR</div>
            <div>
                <div class="brand-name">HRFlow</div>
                <div class="brand-sub">${COMPANY.name}</div>
            </div>
        </div>

        <nav class="sidebar-nav">
            <div class="nav-section">
                <div class="nav-section-title">Main</div>
                <button class="nav-item active" data-page="dashboard">
                    <i class="fas fa-th-large"></i> Dashboard
                </button>
                <button class="nav-item" data-page="employees">
                    <i class="fas fa-users"></i> Employees
                </button>
                <button class="nav-item" data-page="attendance">
                    <i class="fas fa-clock"></i> Attendance
                </button>
                <button class="nav-item" data-page="leave">
                    <i class="fas fa-calendar-alt"></i> Leave
                    ${pendingLeaves > 0 ? `<span class="nav-badge">${pendingLeaves}</span>` : ''}
                </button>
                <button class="nav-item" data-page="payroll">
                    <i class="fas fa-wallet"></i> Payroll
                </button>
            </div>

            <div class="nav-section">
                <div class="nav-section-title">Organization</div>
                <button class="nav-item" data-page="departments">
                    <i class="fas fa-sitemap"></i> Departments
                </button>
                <button class="nav-item" data-page="announcements">
                    <i class="fas fa-bullhorn"></i> Announcements
                </button>
                <button class="nav-item" data-page="settings">
                    <i class="fas fa-cog"></i> Settings
                </button>
            </div>
        </nav>

        <div class="sidebar-footer">
            <div class="sidebar-user" id="userMenu">
                <div class="avatar">${CURRENT_USER.avatar}</div>
                <div class="user-info">
                    <div class="name">${CURRENT_USER.name}</div>
                    <div class="role">${CURRENT_USER.role}</div>
                </div>
            </div>
        </div>
    </aside>`;
}

function initSidebar() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            Router.navigate(this.dataset.page);
        });
    });
}
