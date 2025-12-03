// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const pageContent = document.getElementById('pageContent');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active state - remove from all items
            document.querySelectorAll('.nav-item').forEach(ni => ni.classList.remove('active'));
            item.classList.add('active');

            // Load corresponding page
            const page = item.getAttribute('data-page');
            loadPage(page);
        });
    });
});

function loadPage(page) {
    // Check access permission
    if (window.checkPageAccess && !window.checkPageAccess(page)) {
        document.getElementById('pageContent').innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-lock" style="font-size: 4rem; color: #cbd5e1; margin-bottom: 1.5rem;"></i>
                <h2 style="color: #1e293b; margin-bottom: 0.5rem;">Access Denied</h2>
                <p style="color: #64748b;">You do not have permission to view this page.</p>
            </div>
        `;
        return;
    }

    const pageFunctions = {
        'dashboard': window.loadDashboard,
        'services': window.loadServices,
        'departments': window.loadDepartments,
        'employees': window.loadEmployees,
        'clients': window.loadClients,
        'client-services': window.loadClientServices,
        'products': window.loadProducts,
        'contacts': window.loadContacts,
        'payments': window.loadPayments,
        'reports': window.loadReports,
        'analytics': window.loadAnalytics,
        'notifications': window.loadNotifications,
        'settings': window.loadSettings
    };

    const loadFunction = pageFunctions[page];
    if (loadFunction) {
        loadFunction();
    } else {
        document.getElementById('pageContent').innerHTML = '<h1>Page Not Found</h1>';
    }
}

