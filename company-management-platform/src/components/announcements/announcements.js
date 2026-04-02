// Announcements component

function renderAnnouncements() {
    return `
    ${renderHeader('Announcements')}
    <div class="page-content">
        <div class="card" style="margin-bottom:24px;">
            <div class="card-header">
                <h2>All Announcements</h2>
                ${CURRENT_USER.isAdmin ? `<button class="btn btn-primary" onclick="showNewAnnouncementModal()"><i class="fas fa-plus"></i> New Announcement</button>` : ''}
            </div>

            <div id="announcementsList">
                ${renderAnnouncementCards()}
            </div>
        </div>
    </div>

    <!-- New Announcement Modal -->
    <div class="modal-overlay" id="newAnnouncementModal" style="display:none;">
        <div class="modal" style="max-width:550px;">
            <h3>Create Announcement</h3>
            <form id="newAnnouncementForm">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="annTitle" placeholder="Enter announcement title" required>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="annCategory">
                        <option value="general">General</option>
                        <option value="event">Event</option>
                        <option value="policy">Policy Update</option>
                        <option value="celebration">Celebration</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea id="annMessage" rows="4" placeholder="Write your announcement..." required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closeNewAnnouncementModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Publish</button>
                </div>
            </form>
        </div>
    </div>`;
}

function renderAnnouncementCards() {
    if (ANNOUNCEMENTS.length === 0) {
        return `<div class="empty-state"><i class="fas fa-bullhorn"></i><p>No announcements yet</p></div>`;
    }

    return ANNOUNCEMENTS.map(a => {
        const category = a.category || 'general';
        const categoryConfig = getAnnouncementCategory(category);

        return `
        <div class="ann-card">
            <div class="ann-card-left">
                <div class="ann-icon" style="background:${categoryConfig.bg};color:${categoryConfig.color};">
                    <i class="fas ${categoryConfig.icon}"></i>
                </div>
            </div>
            <div class="ann-card-content">
                <div class="ann-card-top">
                    <h3 class="ann-title">${a.title}</h3>
                    <span class="badge" style="background:${categoryConfig.bg};color:${categoryConfig.color};">${categoryConfig.label}</span>
                </div>
                <p class="ann-message">${a.message}</p>
                <div class="ann-meta">
                    <span><i class="fas fa-user"></i> ${a.author}</span>
                    <span><i class="far fa-calendar"></i> ${formatDate(a.date)}</span>
                </div>
            </div>
            ${CURRENT_USER.isAdmin ? `
            <div class="ann-actions">
                <button class="btn btn-outline btn-sm" onclick="deleteAnnouncement(${a.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>` : ''}
        </div>`;
    }).join('');
}

function getAnnouncementCategory(category) {
    const categories = {
        general: { label: 'General', icon: 'fa-info-circle', bg: 'var(--primary-bg)', color: 'var(--primary)' },
        event: { label: 'Event', icon: 'fa-calendar-check', bg: 'var(--success-bg)', color: 'var(--success)' },
        policy: { label: 'Policy', icon: 'fa-file-alt', bg: 'var(--warning-bg)', color: 'var(--warning)' },
        celebration: { label: 'Celebration', icon: 'fa-star', bg: '#fdf2f8', color: '#db2777' },
        urgent: { label: 'Urgent', icon: 'fa-exclamation-triangle', bg: 'var(--danger-bg)', color: 'var(--danger)' }
    };
    return categories[category] || categories.general;
}

function showNewAnnouncementModal() {
    document.getElementById('newAnnouncementModal').style.display = 'flex';
}

function closeNewAnnouncementModal() {
    document.getElementById('newAnnouncementModal').style.display = 'none';
}

function deleteAnnouncement(id) {
    const idx = ANNOUNCEMENTS.findIndex(a => a.id === id);
    if (idx !== -1) {
        ANNOUNCEMENTS.splice(idx, 1);
        document.getElementById('announcementsList').innerHTML = renderAnnouncementCards();
    }
}

function initAnnouncements() {
    const form = document.getElementById('newAnnouncementForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const newAnn = {
                id: Date.now(),
                title: document.getElementById('annTitle').value,
                message: document.getElementById('annMessage').value,
                category: document.getElementById('annCategory').value,
                date: new Date().toISOString().split('T')[0],
                author: CURRENT_USER.name
            };
            ANNOUNCEMENTS.unshift(newAnn);
            closeNewAnnouncementModal();
            Router.navigate('announcements');
        });
    }
}
