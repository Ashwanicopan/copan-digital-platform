// Header component

function renderHeader(title) {
    const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

    return `
    <header class="top-header" style="
        height: var(--header-height);
        background: #fff;
        border-bottom: 1px solid var(--gray-200);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 32px;
    ">
        <h1 style="font-size: 1.2rem; font-weight: 600; color: var(--gray-800);">${title}</h1>
        <div class="flex items-center gap-3">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search...">
            </div>
            <div class="notif-wrapper">
                <button class="notif-bell" onclick="toggleNotifications()">
                    <i class="fas fa-bell"></i>
                    ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ''}
                </button>
                <div class="notif-dropdown" id="notifDropdown">
                    <div class="notif-dropdown-header">
                        <span class="notif-dropdown-title">Notifications</span>
                        ${unreadCount > 0 ? `<button class="notif-mark-all" onclick="markAllNotificationsRead()">Mark all read</button>` : ''}
                    </div>
                    <div class="notif-list" id="notifList">
                        ${renderNotificationItems()}
                    </div>
                </div>
            </div>
        </div>
    </header>`;
}

function renderNotificationItems() {
    if (NOTIFICATIONS.length === 0) {
        return `<div class="notif-empty"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>`;
    }

    return NOTIFICATIONS.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="handleNotificationClick(${n.id})">
            <div class="notif-icon notif-icon-${n.type}">
                <i class="fas ${n.icon}"></i>
            </div>
            <div class="notif-content">
                <div class="notif-title">${n.title}</div>
                <div class="notif-message">${n.message}</div>
                <div class="notif-time"><i class="far fa-clock"></i> ${n.time}</div>
            </div>
            ${!n.read ? '<div class="notif-unread-dot"></div>' : ''}
        </div>
    `).join('');
}

function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.classList.toggle('open');

    // Close when clicking outside
    if (dropdown.classList.contains('open')) {
        setTimeout(() => {
            document.addEventListener('click', closeNotifOnClickOutside);
        }, 0);
    }
}

function closeNotifOnClickOutside(e) {
    const wrapper = document.querySelector('.notif-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('notifDropdown').classList.remove('open');
        document.removeEventListener('click', closeNotifOnClickOutside);
    }
}

function handleNotificationClick(id) {
    const notif = NOTIFICATIONS.find(n => n.id === id);
    if (!notif) return;

    notif.read = true;

    // Navigate to relevant page based on type
    const pageMap = { leave: 'leave', payroll: 'payroll', attendance: 'attendance', employee: 'employees', announcement: 'dashboard' };
    const page = pageMap[notif.type] || 'dashboard';

    document.getElementById('notifDropdown').classList.remove('open');
    document.removeEventListener('click', closeNotifOnClickOutside);
    Router.navigate(page);
}

function markAllNotificationsRead() {
    NOTIFICATIONS.forEach(n => n.read = true);
    // Re-render the current page to update badge and list
    Router.navigate(Router.currentPage, Router.currentData);
}
