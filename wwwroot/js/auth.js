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
        'products',
        'payments',
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
        'payments',
        'reports'
    ],
    'Service': [
        'dashboard',
        'services',
        'clients',
        'client-services',
        'products',
        'reports'
    ],
    'Training': [
        'dashboard',
        'departments',
        'employees',
        'products',
        'reports'
    ],
    'Internet Security': [
        'dashboard',
        'departments',
        'employees',
        'products',
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
        remove: [] // HR Management Supervisors need access to payments and all management features
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

    // Only HR Management Admin has access to everything
    if (role === 'Admin' && departmentName === 'HR Management') return true;

    // Get base department access
    let allowedPages = [];
    if (departmentName && departmentPermissions[departmentName]) {
        allowedPages = [...departmentPermissions[departmentName]];
    }

    // Apply role-based modifiers
    const modifier = roleModifiers[role] || roleModifiers['User'];
    
    // Add role-specific pages
    // Only HR Management Admin gets full access via '*'
    if (modifier.add.includes('*') && departmentName === 'HR Management') {
        return true; // Full access for HR Management Admin only
    }
    allowedPages.push(...modifier.add);
    
    // Remove restricted pages based on role
    // Special handling: HR Management employees need full access
    let pagesToRemove = [...modifier.remove];
    if (departmentName === 'HR Management') {
        if (role === 'Agent') {
            // HR Agents need Departments and Employees - don't remove these
            pagesToRemove = pagesToRemove.filter(page => 
                page !== 'departments' && page !== 'employees'
            );
        } else if (role === 'Supervisor' || role === 'Admin') {
            // HR Management Supervisors and Admins get full access - don't remove anything
            pagesToRemove = [];
        }
    }
    
    // Admin users from any department should see Products (since products are created on purchase)
    if (role === 'Admin' && !allowedPages.includes('products')) {
        allowedPages.push('products');
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

    // Only HR Management Admin shows everything
    if (role === 'Admin' && departmentName === 'HR Management') {
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
    // Only HR Management Admin gets full access via '*'
    if (modifier.add.includes('*') && departmentName === 'HR Management') {
        // HR Management Admin - show everything
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.display = 'flex';
            item.classList.remove('restricted-hidden');
        });
        return;
    }
    allowedPages.push(...modifier.add);
    
    // Remove restricted pages based on role
    // Special handling: HR Management employees need full access
    let pagesToRemove = [...modifier.remove];
    if (departmentName === 'HR Management') {
        if (role === 'Agent') {
            // HR Agents need Departments and Employees - don't remove these
            pagesToRemove = pagesToRemove.filter(page => 
                page !== 'departments' && page !== 'employees'
            );
        } else if (role === 'Supervisor' || role === 'Admin') {
            // HR Management Supervisors and Admins get full access - don't remove anything
            pagesToRemove = [];
        }
    }
    
    // Admin users from any department should see Products (since products are created on purchase)
    if (role === 'Admin' && !allowedPages.includes('products')) {
        allowedPages.push('products');
    }
    
    allowedPages = allowedPages.filter(page => !pagesToRemove.includes(page));
    
    // Remove duplicates
    allowedPages = [...new Set(allowedPages)];

    // Debug logging (can be removed in production)
    console.log('RBAC Debug:', {
        role,
        departmentName,
        allowedPages,
        pagesToRemove: modifier.remove,
        finalAllowedPages: allowedPages
    });

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

// Admin login form handler
window.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminPasswordToggle = document.getElementById('adminPasswordToggle');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLoginText = document.getElementById('adminLoginText');
    const adminLoadingSpinner = document.getElementById('adminLoadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Password toggle
    if (adminPasswordToggle && adminPasswordInput) {
        adminPasswordToggle.addEventListener('click', () => {
            const type = adminPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            adminPasswordInput.setAttribute('type', type);
            const icon = adminPasswordToggle.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Login form submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('adminUsername')?.value.trim();
            const password = document.getElementById('adminPassword')?.value;

            if (!username || !password) {
                showAdminError('Please enter both username and password');
                return;
            }

            setAdminLoading(true);
            if (errorMessage) errorMessage.style.display = 'none';

            try {
                const response = await fetch(`${window.location.origin}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // Store token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('userFullName', data.fullName);
                localStorage.setItem('userRole', data.role);
                if (data.departmentId) {
                    localStorage.setItem('userDepartmentId', data.departmentId);
                }
                if (data.departmentName) {
                    localStorage.setItem('userDepartment', data.departmentName);
                }

                // Hide login screen and show main app
                const loginScreen = document.getElementById('loginScreen');
                const mainApp = document.getElementById('mainApp');
                if (loginScreen) loginScreen.classList.add('hidden');
                if (mainApp) {
                    mainApp.classList.remove('hidden');
                    api.setToken(data.token);
                    window.applyRoleBasedUI();
                    if (window.loadDashboard) {
                        window.loadDashboard();
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                showAdminError(error.message || 'Invalid username or password. Please try again.');
            } finally {
                setAdminLoading(false);
            }
        });
    }

    function showAdminError(message) {
        if (errorText) errorText.textContent = message;
        if (errorMessage) {
            errorMessage.style.display = 'flex';
            setTimeout(() => {
                if (errorMessage) errorMessage.style.display = 'none';
            }, 5000);
        }
    }

    function setAdminLoading(loading) {
        if (adminLoginBtn) adminLoginBtn.disabled = loading;
        if (adminLoginText) adminLoginText.style.display = loading ? 'none' : 'inline';
        if (adminLoadingSpinner) adminLoadingSpinner.style.display = loading ? 'inline-block' : 'none';
    }

    // Populate employee accounts
    populateEmployeeAccounts();

    function populateEmployeeAccounts() {
        const container = document.getElementById('adminEmployeeAccountsList');
        if (!container) return;

        const employees = [
            // HR Management
            { name: 'HR Admin', email: 'hr.admin@excell-on.com', role: 'Admin', dept: 'HR Management', access: 'All Pages' },
            { name: 'HR Manager', email: 'hr.manager@excell-on.com', role: 'Admin', dept: 'HR Management', access: 'All Pages' },
            { name: 'HR Supervisor', email: 'hr.supervisor@excell-on.com', role: 'Supervisor', dept: 'HR Management', access: 'Dashboard, Departments, Employees, Clients, Client Services, Services, Products, Payments, Reports, Analytics' },
            { name: 'HR Team Lead', email: 'hr.teamlead@excell-on.com', role: 'Team Lead', dept: 'HR Management', access: 'Dashboard, Departments, Employees, Clients, Client Services, Services, Products, Reports, Analytics' },
            { name: 'HR Agent', email: 'hr.agent@excell-on.com', role: 'Agent', dept: 'HR Management', access: 'Dashboard, Departments, Employees, Clients, Client Services, Services, Products, Reports' },
            // Administration
            { name: 'Admin Dept Admin', email: 'admin.dept.admin@excell-on.com', role: 'Admin', dept: 'Administration', access: 'All Pages' },
            { name: 'Admin Dept Manager', email: 'admin.dept.manager@excell-on.com', role: 'Admin', dept: 'Administration', access: 'All Pages' },
            { name: 'Admin Dept Supervisor', email: 'admin.dept.supervisor@excell-on.com', role: 'Supervisor', dept: 'Administration', access: 'Dashboard, Departments, Employees, Clients, Client Services, Products, Payments, Reports' },
            { name: 'Admin Dept Team Lead', email: 'admin.dept.teamlead@excell-on.com', role: 'Team Lead', dept: 'Administration', access: 'Dashboard, Departments, Employees, Clients, Client Services, Products, Reports' },
            { name: 'Admin Dept Agent', email: 'admin.dept.agent@excell-on.com', role: 'Agent', dept: 'Administration', access: 'Dashboard, Clients, Client Services, Products, Reports' },
            // Service
            { name: 'Service Admin', email: 'service.admin@excell-on.com', role: 'Admin', dept: 'Service', access: 'All Pages' },
            { name: 'Service Manager', email: 'service.manager@excell-on.com', role: 'Admin', dept: 'Service', access: 'All Pages' },
            { name: 'Service Supervisor', email: 'service.supervisor@excell-on.com', role: 'Supervisor', dept: 'Service', access: 'Dashboard, Services, Clients, Client Services, Products, Reports' },
            { name: 'Service Team Lead', email: 'service.teamlead@excell-on.com', role: 'Team Lead', dept: 'Service', access: 'Dashboard, Services, Clients, Client Services, Products, Reports' },
            { name: 'Service Agent', email: 'service.agent@excell-on.com', role: 'Agent', dept: 'Service', access: 'Dashboard, Services, Clients, Client Services, Products, Reports' },
            // Training
            { name: 'Training Admin', email: 'training.admin@excell-on.com', role: 'Admin', dept: 'Training', access: 'All Pages' },
            { name: 'Training Manager', email: 'training.manager@excell-on.com', role: 'Admin', dept: 'Training', access: 'All Pages' },
            { name: 'Training Supervisor', email: 'training.supervisor@excell-on.com', role: 'Supervisor', dept: 'Training', access: 'Dashboard, Departments, Employees, Reports, Analytics' },
            { name: 'Training Team Lead', email: 'training.teamlead@excell-on.com', role: 'Team Lead', dept: 'Training', access: 'Dashboard, Departments, Employees, Reports' },
            { name: 'Training Agent', email: 'training.agent@excell-on.com', role: 'Agent', dept: 'Training', access: 'Dashboard, Departments, Employees, Reports' },
            // Internet Security
            { name: 'Security Admin', email: 'security.admin@excell-on.com', role: 'Admin', dept: 'Internet Security', access: 'All Pages' },
            { name: 'Security Manager', email: 'security.manager@excell-on.com', role: 'Admin', dept: 'Internet Security', access: 'All Pages' },
            { name: 'Security Supervisor', email: 'security.supervisor@excell-on.com', role: 'Supervisor', dept: 'Internet Security', access: 'Dashboard, Departments, Employees, Reports, Analytics' },
            { name: 'Security Team Lead', email: 'security.teamlead@excell-on.com', role: 'Team Lead', dept: 'Internet Security', access: 'Dashboard, Departments, Employees, Reports' },
            { name: 'Security Agent', email: 'security.agent@excell-on.com', role: 'Agent', dept: 'Internet Security', access: 'Dashboard, Departments, Employees, Reports' },
            // Auditors
            { name: 'Auditor Admin', email: 'auditor.admin@excell-on.com', role: 'Admin', dept: 'Auditors', access: 'All Pages' },
            { name: 'Auditor Manager', email: 'auditor.manager@excell-on.com', role: 'Admin', dept: 'Auditors', access: 'All Pages' },
            { name: 'Auditor Supervisor', email: 'auditor.supervisor@excell-on.com', role: 'Supervisor', dept: 'Auditors', access: 'Dashboard, Clients, Client Services, Products, Payments, Reports' },
            { name: 'Auditor Team Lead', email: 'auditor.teamlead@excell-on.com', role: 'Team Lead', dept: 'Auditors', access: 'Dashboard, Clients, Client Services, Products, Reports' },
            { name: 'Auditor Agent', email: 'auditor.agent@excell-on.com', role: 'Agent', dept: 'Auditors', access: 'Dashboard, Clients, Client Services, Products, Payments, Reports' }
        ];

        const departments = ['HR Management', 'Administration', 'Service', 'Training', 'Internet Security', 'Auditors'];
        const deptIcons = {
            'HR Management': 'fa-users-cog',
            'Administration': 'fa-building',
            'Service': 'fa-headset',
            'Training': 'fa-chalkboard-teacher',
            'Internet Security': 'fa-shield-alt',
            'Auditors': 'fa-clipboard-check'
        };

        let html = '';
        departments.forEach(dept => {
            const deptEmployees = employees.filter(emp => emp.dept === dept);
            if (deptEmployees.length > 0) {
                html += `<div class="department-header">
                    <i class="fas ${deptIcons[dept]}"></i>
                    <span>${dept} Department</span>
                </div>`;
                
                deptEmployees.forEach(emp => {
                    const roleClass = `role-${emp.role.toLowerCase().replace(/\s+/g, '-')}`;
                    html += `<div class="employee-item">
                        <div class="employee-info">
                            <div class="employee-name">${emp.name}</div>
                            <div class="employee-email">${emp.email}</div>
                            <span class="employee-role ${roleClass}">${emp.role}</span>
                            <div class="employee-access">Department: ${emp.dept} | Access: ${emp.access}</div>
                        </div>
                        <button class="employee-login-btn" onclick="fillAdminLogin('${emp.email}', 'employee123')">
                            Login
                        </button>
                    </div>`;
                });
            }
        });

        container.innerHTML = html;
    }

    // Quick login function
    window.fillAdminLogin = function(username, password) {
        const usernameInput = document.getElementById('adminUsername');
        const passwordInput = document.getElementById('adminPassword');
        if (usernameInput) usernameInput.value = username;
        if (passwordInput) passwordInput.value = password;
        if (adminLoginForm) {
            adminLoginForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    };
});

