// Utility helpers

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusBadge(status) {
    const map = {
        'active': 'badge-success',
        'present': 'badge-success',
        'approved': 'badge-success',
        'paid': 'badge-success',
        'on-leave': 'badge-warning',
        'pending': 'badge-warning',
        'absent': 'badge-danger',
        'rejected': 'badge-danger',
        'inactive': 'badge-neutral',
    };
    return map[status] || 'badge-neutral';
}

function getAvatarColor(name) {
    const colors = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#059669'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function getEmployeeById(id) {
    return EMPLOYEES.find(e => e.id === id);
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getCurrentDate() {
    return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
