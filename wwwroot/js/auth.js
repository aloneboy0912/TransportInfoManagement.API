const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');

// Function to check if user is authenticated and authorized for admin panel
function checkAuthentication() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');

    if (!token) {
        // No token - redirect to login
        window.location.href = '/login';
        return false;
    }

    // Allow all users to access the dashboard
    // if (role !== 'Admin' && username?.toLowerCase() !== 'admin') {
    //     // Not admin - redirect to user dashboard
    //     window.location.href = '/user';
    //     return false;
    // }

    return true;
}

// Global authentication guard for all admin functions
window.requireAuth = function () {
    if (!checkAuthentication()) {
        return false;
    }
    return true;
};

// Function to handle successful login from login page
window.handleLoginSuccess = function (response) {
    // Check if user is admin
    // Check if user is admin
    // if (response.role !== 'Admin' && response.username?.toLowerCase() !== 'admin') {
    //     // Not admin, redirect to user dashboard
    //     api.setToken(response.token);
    //     localStorage.setItem('userFullName', response.fullName);
    //     localStorage.setItem('userRole', response.role);
    //     localStorage.setItem('username', response.username);
    //     window.location.href = '/user';
    //     return;
    // }

    // Admin user - proceed with admin panel
    api.setToken(response.token);

    // Store user info
    localStorage.setItem('userFullName', response.fullName);
    localStorage.setItem('userRole', response.role);
    localStorage.setItem('username', response.username);

    // Redirect to admin panel
    window.location.href = '/admin';
};

// Check authentication when page loads
window.addEventListener('DOMContentLoaded', () => {
    if (checkAuthentication()) {
        // User is authenticated and authorized - show admin panel
        api.setToken(localStorage.getItem('token'));
        if (loginScreen && mainApp) {
            loginScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            document.getElementById('userFullName').textContent = localStorage.getItem('userFullName') || 'Admin';

            if (window.loadDashboard) {
                window.loadDashboard();
            }
        }
    }
    // If not authenticated, checkAuthentication() will redirect to login
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    api.clearToken();
    localStorage.clear();
    loginScreen.classList.remove('hidden');
    mainApp.classList.add('hidden');
});

