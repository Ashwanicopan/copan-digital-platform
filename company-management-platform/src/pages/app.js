// Main App controller

function initApp() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="app-shell">
            ${renderSidebar()}
            <div class="main-area" id="mainContent">
                ${renderDashboard()}
            </div>
        </div>`;

    initSidebar();

    Router.onNavigate((page, data) => {
        const main = document.getElementById('mainContent');
        switch (page) {
            case 'dashboard':
                main.innerHTML = renderDashboard();
                break;
            case 'employees':
                main.innerHTML = renderEmployeeList();
                initEmployeeList();
                initAddEmployeeForm();
                break;
            case 'employee-profile':
                main.innerHTML = renderEmployeeProfile(data);
                break;
            case 'attendance':
                main.innerHTML = renderAttendance();
                initAttendance();
                break;
            case 'leave':
                main.innerHTML = renderLeave();
                initLeave();
                break;
            case 'payroll':
                main.innerHTML = renderPayroll();
                break;
            case 'departments':
                main.innerHTML = renderDepartments();
                break;
            case 'announcements':
                main.innerHTML = renderAnnouncements();
                initAnnouncements();
                break;
            case 'settings':
                main.innerHTML = renderSettings();
                break;
            default:
                main.innerHTML = `
                    ${renderHeader(page.charAt(0).toUpperCase() + page.slice(1))}
                    <div class="page-content">
                        <div class="card">
                            <div class="empty-state">
                                <i class="fas fa-tools"></i>
                                <p>${page.charAt(0).toUpperCase() + page.slice(1)} module coming soon.</p>
                            </div>
                        </div>
                    </div>`;
        }

        // Update sidebar active state
        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.toggle('active', n.dataset.page === page);
        });
    });
}

// Boot: show login screen
document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    app.innerHTML = renderLogin();
    initLogin();
});
