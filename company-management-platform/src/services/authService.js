// Auth service

const AuthService = {
    isLoggedIn: false,
    user: null,

    login(email, password) {
        // Mock authentication
        if (email === 'admin@technova.com' && password === 'admin123') {
            this.isLoggedIn = true;
            this.user = CURRENT_USER;
            return { success: true };
        }
        return { success: false, message: 'Invalid email or password' };
    },

    logout() {
        this.isLoggedIn = false;
        this.user = null;
    },

    getUser() {
        return this.user;
    }
};
