const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');

// Role-Based Access Control Configuration
const rolePermissions = {
    'Admin': ['*'], // Access to everything
    'Manager': [
        'dashboard',
        'services',
        'departments',
        'employees',
        'clients',
        'client-services',
        'products',
        'contacts',
        'reports'
    ],
    'User': [
        'dashboard',
        'contacts'
    ]
};

// Function to check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('token');

    if (!token) {
        // No token - redirect to login
        window.location.href = '/login';
        return false;
    }

    return true;
}

// Check if current user has access to a specific page
window.checkPageAccess = function (pageName) {
    const role = localStorage.getItem('userRole') || 'User';

    // Admin has access to everything
    if (role === 'Admin') return true;

    const allowedPages = rolePermissions[role] || rolePermissions['User'];
    return allowedPages.includes(pageName);
};

// Apply role-based UI changes (hide sidebar items)
window.applyRoleBasedUI = function () {
    const role = localStorage.getItem('userRole') || 'User';

    // Show user info
    const userFullName = document.getElementById('userFullName');
    const userRoleDisplay = document.querySelector('.user-role');

    if (userFullName) userFullName.textContent = localStorage.getItem('userFullName') || 'User';
    if (userRoleDisplay) userRoleDisplay.textContent = role;

    // If Admin, show everything
    if (role === 'Admin') {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.display = 'flex';
            item.classList.remove('restricted-hidden');
        });
        return;
    }

    const allowedPages = rolePermissions[role] || rolePermissions['User'];

    // Hide unauthorized sidebar items
    document.querySelectorAll('.nav-item').forEach(item => {
        const page = item.getAttribute('data-page');
        if (page && !allowedPages.includes(page)) {
            item.style.display = 'none';
            item.classList.add('restricted-hidden'); // Mark as hidden by RBAC
        } else {
            item.style.display = 'flex';
            item.classList.remove('restricted-hidden');
        }
    });

    // Hide empty sections
    document.querySelectorAll('.nav-section').forEach(section => {
        const visibleItems = Array.from(section.querySelectorAll('.nav-item')).filter(item =>
            !item.classList.contains('restricted-hidden')
        );

        const header = section.querySelector('.nav-section-header');
        if (visibleItems.length === 0) {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
            if (header) header.style.display = 'block';
        }
    });
};

// Global authentication guard for all admin functions
window.requireAuth = function () {
    if (!checkAuthentication()) {
        return false;
    }
    return true;
};

// Function to handle successful login from login page
window.handleLoginSuccess = function (response) {
    api.setToken(response.token);

    // Store user info
    localStorage.setItem('userFullName', response.fullName);
    localStorage.setItem('userRole', response.role);
    localStorage.setItem('username', response.username);

    // Redirect to main dashboard (admin panel) for ALL users now
    window.location.href = '/admin';
};

// Check authentication when page loads
window.addEventListener('DOMContentLoaded', () => {
    if (checkAuthentication()) {
        // User is authenticated
        api.setToken(localStorage.getItem('token'));

        if (loginScreen && mainApp) {
            loginScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');

            // Apply RBAC
            window.applyRoleBasedUI();

            // Load default dashboard if available
            if (window.loadDashboard) {
                window.loadDashboard();
            }
        }
    }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    api.clearToken();
    localStorage.clear();
    window.location.href = '/login';
});

