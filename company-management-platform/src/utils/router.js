// Simple client-side router

const Router = {
    currentPage: 'dashboard',
    listeners: [],

    navigate(page, data = null) {
        this.currentPage = page;
        this.currentData = data;
        this.listeners.forEach(fn => fn(page, data));
    },

    onNavigate(fn) {
        this.listeners.push(fn);
    }
};
