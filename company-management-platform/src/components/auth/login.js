// Login component

function renderLogin() {
    return `
    <div class="auth-page">
        <div class="auth-card">
            <div class="auth-logo">HR</div>
            <h1>Welcome to HRFlow</h1>
            <p class="auth-subtitle">Company Management Platform</p>
            <div class="auth-error" id="authError">Invalid email or password</div>
            <form id="loginForm">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="loginEmail" placeholder="admin@technova.com" value="admin@technova.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="loginPassword" placeholder="Enter password" value="admin123" required>
                </div>
                <button type="submit" class="btn btn-primary">Sign In</button>
            </form>
            <div class="auth-footer">
                <p>Demo: admin@technova.com / admin123</p>
            </div>
        </div>
    </div>`;
}

function initLogin() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const result = AuthService.login(email, password);

        if (result.success) {
            initApp();
        } else {
            const err = document.getElementById('authError');
            err.textContent = result.message;
            err.style.display = 'block';
        }
    });
}
