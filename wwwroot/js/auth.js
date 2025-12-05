const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');

// Department-Based Access Control Configuration
const departmentPermissions = {
    'HR Management': [
        'dashboard',
        'departments',
        'employees',
        'clients',
        'client-services',
        'services',
        'contacts',
        'reports',
        'analytics'
    ],
    'Administration': [
        'dashboard',
        'departments',
        'employees',
        'clients',
        'client-services',
        'products',
        'contacts',
        'payments',
        'reports'
    ],
    'Service': [
        'dashboard',
        'services',
        'clients',
        'client-services',
        'products',
        'contacts',
        'reports'
    ],
    'Training': [
        'dashboard',
        'departments',
        'employees',
        'contacts',
        'reports'
    ],
    'Internet Security': [
        'dashboard',
        'departments',
        'employees',
        'contacts',
        'reports'
    ],
    'Auditors': [
        'dashboard',
        'clients',
        'client-services',
        'products',
        'payments',
        'reports'
    ]
};

// Role-Based Access Control Configuration
// Role modifiers: These pages are added/removed based on role within department
const roleModifiers = {
    'Admin': {
        add: ['*'], // All pages
        remove: []
    },
    'Supervisor': {
        add: ['analytics'], // Additional analytics access for supervisors
        remove: ['payments'] // Remove sensitive financial pages (but keep other management pages)
    },
    'Team Lead': {
        add: ['analytics'], // Additional analytics access
        remove: ['payments', 'departments'] // Remove financial and department management
    },
    'Agent': {
        add: [], // No additional pages
        remove: ['payments', 'departments', 'employees', 'analytics', 'settings'] // Remove management and sensitive pages
    },
    'User': {
        add: [],
        remove: ['payments', 'departments', 'employees', 'clients', 'client-services', 'products', 'services', 'analytics', 'settings', 'reports']
    }
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
    const departmentName = localStorage.getItem('userDepartment') || '';

    // Admin has access to everything
    if (role === 'Admin') return true;

    // Get base department access
    let allowedPages = [];
    if (departmentName && departmentPermissions[departmentName]) {
        allowedPages = [...departmentPermissions[departmentName]];
    }

    // Apply role-based modifiers
    const modifier = roleModifiers[role] || roleModifiers['User'];
    
    // Add role-specific pages
    if (modifier.add.includes('*')) {
        return true; // Full access
    }
    allowedPages.push(...modifier.add);
    
    // Remove restricted pages based on role
    // Special handling: HR Management Agents need Departments and Employees
    let pagesToRemove = [...modifier.remove];
    if (role === 'Agent' && departmentName === 'HR Management') {
        // HR Agents need Departments and Employees - don't remove these
        pagesToRemove = pagesToRemove.filter(page => 
            page !== 'departments' && page !== 'employees'
        );
    }
    
    allowedPages = allowedPages.filter(page => !pagesToRemove.includes(page));
    
    // Remove duplicates
    allowedPages = [...new Set(allowedPages)];

    return allowedPages.includes(pageName);
};

// Apply role-based UI changes (hide sidebar items)
window.applyRoleBasedUI = function () {
    const role = localStorage.getItem('userRole') || 'User';
    const departmentName = localStorage.getItem('userDepartment') || '';

    // Show user info
    const userFullName = document.getElementById('userFullName');
    const userRoleDisplay = document.querySelector('.user-role');

    if (userFullName) userFullName.textContent = localStorage.getItem('userFullName') || 'User';
    if (userRoleDisplay) {
        const displayText = departmentName ? `${role} - ${departmentName}` : role;
        userRoleDisplay.textContent = displayText;
    }

    // If Admin, show everything
    if (role === 'Admin') {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.display = 'flex';
            item.classList.remove('restricted-hidden');
        });
        return;
    }

    // Get allowed pages based on department and role modifiers
    let allowedPages = [];
    if (departmentName && departmentPermissions[departmentName]) {
        allowedPages = [...departmentPermissions[departmentName]];
    }

    // Apply role-based modifiers
    const modifier = roleModifiers[role] || roleModifiers['User'];
    
    // Add role-specific pages
    if (modifier.add.includes('*')) {
        // Admin - show everything
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.display = 'flex';
            item.classList.remove('restricted-hidden');
        });
        return;
    }
    allowedPages.push(...modifier.add);
    
    // Remove restricted pages based on role
    // Special handling: HR Management Agents need Departments and Employees
    let pagesToRemove = [...modifier.remove];
    if (role === 'Agent' && departmentName === 'HR Management') {
        // HR Agents need Departments and Employees - don't remove these
        pagesToRemove = pagesToRemove.filter(page => 
            page !== 'departments' && page !== 'employees'
        );
    }
    
    allowedPages = allowedPages.filter(page => !pagesToRemove.includes(page));
    
    // Remove duplicates
    allowedPages = [...new Set(allowedPages)];

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
    if (response.departmentId) {
        localStorage.setItem('userDepartmentId', response.departmentId);
    }
    if (response.departmentName) {
        localStorage.setItem('userDepartment', response.departmentName);
    }

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

