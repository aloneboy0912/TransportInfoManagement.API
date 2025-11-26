window.loadDashboard = async function() {
    // Check authentication before loading dashboard
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1><i class="fas fa-chart-line"></i> Dashboard</h1>
            </div>
            <div class="header-actions">
                <button class="btn btn-sm btn-primary" onclick="refreshDashboard()" title="Refresh">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
        </div>

        <!-- Quick Actions - Prominent Section -->
        <div class="quick-actions-banner">
            <div class="quick-actions-header">
                <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                <p>Access frequently used features instantly</p>
            </div>
            <div class="quick-actions-grid-prominent">
                <a href="#" onclick="loadPage('clients'); return false;" class="quick-action-card">
                    <div class="quick-action-icon-large" style="background: linear-gradient(135deg, var(--primary-color), var(--primary-light));">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="quick-action-content">
                        <span class="quick-action-title">Add Client</span>
                        <span class="quick-action-desc">Register new client</span>
                    </div>
                    <i class="fas fa-chevron-right quick-action-arrow"></i>
                </a>
                <a href="#" onclick="loadPage('payments'); return false;" class="quick-action-card">
                    <div class="quick-action-icon-large" style="background: linear-gradient(135deg, var(--success-color), #059669);">
                        <i class="fas fa-money-bill"></i>
                    </div>
                    <div class="quick-action-content">
                        <span class="quick-action-title">New Payment</span>
                        <span class="quick-action-desc">Record payment</span>
                    </div>
                    <i class="fas fa-chevron-right quick-action-arrow"></i>
                </a>
                <a href="#" onclick="loadPage('employees'); return false;" class="quick-action-card">
                    <div class="quick-action-icon-large" style="background: linear-gradient(135deg, var(--info-color), #2563eb);">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="quick-action-content">
                        <span class="quick-action-title">Add Employee</span>
                        <span class="quick-action-desc">Hire new staff</span>
                    </div>
                    <i class="fas fa-chevron-right quick-action-arrow"></i>
                </a>
                <a href="#" onclick="loadPage('reports'); return false;" class="quick-action-card">
                    <div class="quick-action-icon-large" style="background: linear-gradient(135deg, var(--warning-color), #d97706);">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="quick-action-content">
                        <span class="quick-action-title">View Reports</span>
                        <span class="quick-action-desc">Analytics & insights</span>
                    </div>
                    <i class="fas fa-chevron-right quick-action-arrow"></i>
                </a>
            </div>
        </div>

        <!-- Stats Grid -->
        <div id="dashboardStats" class="stats-grid">
            <div class="stat-card skeleton">
                <div class="stat-card-header">
                    <div class="skeleton-text" style="width: 60%; height: 1rem;"></div>
                    <div class="skeleton-icon"></div>
                </div>
                <div class="skeleton-text" style="width: 40%; height: 2rem; margin: 1rem 0;"></div>
                <div class="skeleton-text" style="width: 80%; height: 0.875rem;"></div>
            </div>
            <div class="stat-card skeleton">
                <div class="stat-card-header">
                    <div class="skeleton-text" style="width: 60%; height: 1rem;"></div>
                    <div class="skeleton-icon"></div>
                </div>
                <div class="skeleton-text" style="width: 40%; height: 2rem; margin: 1rem 0;"></div>
                <div class="skeleton-text" style="width: 80%; height: 0.875rem;"></div>
            </div>
            <div class="stat-card skeleton">
                <div class="stat-card-header">
                    <div class="skeleton-text" style="width: 60%; height: 1rem;"></div>
                    <div class="skeleton-icon"></div>
                </div>
                <div class="skeleton-text" style="width: 40%; height: 2rem; margin: 1rem 0;"></div>
                <div class="skeleton-text" style="width: 80%; height: 0.875rem;"></div>
            </div>
            <div class="stat-card skeleton">
                <div class="stat-card-header">
                    <div class="skeleton-text" style="width: 60%; height: 1rem;"></div>
                    <div class="skeleton-icon"></div>
                </div>
                <div class="skeleton-text" style="width: 40%; height: 2rem; margin: 1rem 0;"></div>
                <div class="skeleton-text" style="width: 80%; height: 0.875rem;"></div>
            </div>
            <div class="stat-card skeleton">
                <div class="stat-card-header">
                    <div class="skeleton-text" style="width: 60%; height: 1rem;"></div>
                    <div class="skeleton-icon"></div>
                </div>
                <div class="skeleton-text" style="width: 40%; height: 2rem; margin: 1rem 0;"></div>
                <div class="skeleton-text" style="width: 80%; height: 0.875rem;"></div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="dashboard-grid">
            <!-- Left Column -->
            <div class="dashboard-column">
                <!-- Revenue Chart -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h2><i class="fas fa-chart-area"></i> Revenue Overview</h2>
                            <p class="card-subtitle">Last 6 months performance</p>
                        </div>
                        <select id="revenuePeriod" class="period-select" onchange="updateRevenueChart()">
                            <option value="6m">6 Months</option>
                            <option value="3m">3 Months</option>
                            <option value="1m">1 Month</option>
                        </select>
                    </div>
                    <div class="card-body">
                        <div id="revenueChart" class="chart-container">
                            <div class="chart-placeholder">
                                <i class="fas fa-chart-line"></i>
                                <p>Revenue chart will be displayed here</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-clock"></i> Recent Activity</h2>
                        <a href="#" onclick="loadPage('reports'); return false;" class="card-link">View All</a>
                    </div>
                    <div class="card-body">
                        <div id="recentActivity" class="activity-list">
                            <div class="activity-item skeleton">
                                <div class="activity-icon skeleton-icon-small"></div>
                                <div class="activity-content">
                                    <div class="skeleton-text" style="width: 70%; height: 0.875rem; margin-bottom: 0.5rem;"></div>
                                    <div class="skeleton-text" style="width: 50%; height: 0.75rem;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div class="dashboard-column">
                <!-- Quick Stats -->
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-tachometer-alt"></i> Quick Stats</h2>
                    </div>
                    <div class="card-body">
                        <div id="quickStats" class="quick-stats-list">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                </div>

                <!-- Payment Status -->
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-money-bill-wave"></i> Payment Status</h2>
                    </div>
                    <div class="card-body">
                        <div id="paymentStatus" class="payment-status-list">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;

    try {
        const stats = await api.get('/reports/dashboard');
        displayDashboardStats(stats);
        displayQuickStats(stats);
        displayPaymentStatus(stats);
        displayRecentActivity(stats);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('dashboardStats').innerHTML = 
            '<div class="stat-card error-state"><i class="fas fa-exclamation-triangle"></i> Error loading dashboard data</div>';
        if (window.showToast) {
            window.showToast('Failed to load dashboard data', 'error');
        }
    }
};

function displayDashboardStats(stats) {
    const statsHtml = `
        <div class="stat-card stat-card-primary">
            <div class="stat-card-header">
                <h3>Total Clients</h3>
                <div class="stat-icon" style="background: linear-gradient(135deg, var(--primary-color), var(--primary-light));">
                    <i class="fas fa-user-tie"></i>
                </div>
            </div>
            <div class="stat-value">${stats.clients.total || 0}</div>
            <div class="stat-footer">
                <span class="stat-badge stat-badge-success">
                    <i class="fas fa-check-circle"></i> ${stats.clients.active || 0} Active
                </span>
                <span class="stat-trend">
                    <i class="fas fa-arrow-up"></i> +${stats.clients.total - (stats.clients.active || 0)}
                </span>
            </div>
        </div>

        <div class="stat-card stat-card-info">
            <div class="stat-card-header">
                <h3>Total Employees</h3>
                <div class="stat-icon" style="background: linear-gradient(135deg, var(--info-color), #2563eb);">
                    <i class="fas fa-users"></i>
                </div>
            </div>
            <div class="stat-value">${stats.employees.total || 0}</div>
            <div class="stat-footer">
                <span class="stat-badge stat-badge-success">
                    <i class="fas fa-check-circle"></i> ${stats.employees.active || 0} Active
                </span>
                <span class="stat-trend">
                    <i class="fas fa-users"></i> Team
                </span>
            </div>
        </div>

        <div class="stat-card stat-card-secondary">
            <div class="stat-card-header">
                <h3>Services</h3>
                <div class="stat-icon" style="background: linear-gradient(135deg, var(--secondary-color), #7c3aed);">
                    <i class="fas fa-cog"></i>
                </div>
            </div>
            <div class="stat-value">${stats.services.total || 0}</div>
            <div class="stat-footer">
                <span class="stat-badge stat-badge-success">
                    <i class="fas fa-check-circle"></i> ${stats.services.active || 0} Active
                </span>
                <span class="stat-trend">
                    <i class="fas fa-cogs"></i> Services
                </span>
            </div>
        </div>

        <div class="stat-card stat-card-success">
            <div class="stat-card-header">
                <h3>Total Revenue</h3>
                <div class="stat-icon" style="background: linear-gradient(135deg, var(--success-color), #059669);">
                    <i class="fas fa-dollar-sign"></i>
                </div>
            </div>
            <div class="stat-value">$${(stats.totalRevenue || 0).toLocaleString()}</div>
            <div class="stat-footer">
                <span class="stat-badge stat-badge-info">
                    <i class="fas fa-chart-line"></i> Cumulative
                </span>
                <span class="stat-trend stat-trend-up">
                    <i class="fas fa-arrow-up"></i> Revenue
                </span>
            </div>
        </div>

        <div class="stat-card stat-card-warning">
            <div class="stat-card-header">
                <h3>Payments</h3>
                <div class="stat-icon" style="background: linear-gradient(135deg, var(--warning-color), #d97706);">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
            </div>
            <div class="stat-value">${stats.payments.total || 0}</div>
            <div class="stat-footer">
                <span class="stat-badge stat-badge-warning">
                    <i class="fas fa-clock"></i> ${stats.payments.pending || 0} Pending
                </span>
                <span class="stat-badge stat-badge-danger" style="margin-left: 0.5rem;">
                    <i class="fas fa-exclamation-triangle"></i> ${stats.payments.overdue || 0} Overdue
                </span>
            </div>
        </div>
    `;
    document.getElementById('dashboardStats').innerHTML = statsHtml;
}

function displayQuickStats(stats) {
    const quickStatsHtml = `
        <div class="quick-stat-item">
            <div class="quick-stat-icon" style="background: var(--primary-lighter); color: var(--primary-color);">
                <i class="fas fa-box"></i>
            </div>
            <div class="quick-stat-content">
                <div class="quick-stat-label">Products</div>
                <div class="quick-stat-value">${stats.products?.total || 0}</div>
            </div>
        </div>
        <div class="quick-stat-item">
            <div class="quick-stat-icon" style="background: var(--info-light); color: var(--info-color);">
                <i class="fas fa-link"></i>
            </div>
            <div class="quick-stat-content">
                <div class="quick-stat-label">Client Services</div>
                <div class="quick-stat-value">${stats.clientServices?.total || 0}</div>
            </div>
        </div>
        <div class="quick-stat-item">
            <div class="quick-stat-icon" style="background: var(--success-light); color: var(--success-color);">
                <i class="fas fa-building"></i>
            </div>
            <div class="quick-stat-content">
                <div class="quick-stat-label">Departments</div>
                <div class="quick-stat-value">${stats.departments?.total || 0}</div>
            </div>
        </div>
    `;
    const quickStatsEl = document.getElementById('quickStats');
    if (quickStatsEl) {
        quickStatsEl.innerHTML = quickStatsHtml;
    }
}

function displayPaymentStatus(stats) {
    const total = stats.payments?.total || 0;
    const pending = stats.payments?.pending || 0;
    const paid = stats.payments?.paid || (total - pending - (stats.payments?.overdue || 0));
    const overdue = stats.payments?.overdue || 0;

    const paymentStatusHtml = `
        <div class="payment-status-item">
            <div class="payment-status-header">
                <span class="payment-status-label">Paid</span>
                <span class="payment-status-value">${paid}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${total > 0 ? (paid / total * 100) : 0}%; background: var(--success-color);"></div>
            </div>
        </div>
        <div class="payment-status-item">
            <div class="payment-status-header">
                <span class="payment-status-label">Pending</span>
                <span class="payment-status-value">${pending}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${total > 0 ? (pending / total * 100) : 0}%; background: var(--warning-color);"></div>
            </div>
        </div>
        <div class="payment-status-item">
            <div class="payment-status-header">
                <span class="payment-status-label">Overdue</span>
                <span class="payment-status-value">${overdue}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${total > 0 ? (overdue / total * 100) : 0}%; background: var(--danger-color);"></div>
            </div>
        </div>
    `;
    const paymentStatusEl = document.getElementById('paymentStatus');
    if (paymentStatusEl) {
        paymentStatusEl.innerHTML = paymentStatusHtml;
    }
}

function displayRecentActivity(stats) {
    // This would typically come from an API endpoint
    const activities = stats.recentActivity || [
        { type: 'payment', message: 'New payment received from Client ABC', time: '2 hours ago', icon: 'fa-money-bill', color: 'success' },
        { type: 'client', message: 'New client registered', time: '5 hours ago', icon: 'fa-user-plus', color: 'primary' },
        { type: 'service', message: 'Service contract renewed', time: '1 day ago', icon: 'fa-link', color: 'info' },
        { type: 'employee', message: 'New employee added', time: '2 days ago', icon: 'fa-user', color: 'secondary' }
    ];

    const activityHtml = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon activity-icon-${activity.color}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-message">${activity.message}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');

    const recentActivityEl = document.getElementById('recentActivity');
    if (recentActivityEl) {
        recentActivityEl.innerHTML = activityHtml || '<div class="empty-state">No recent activity</div>';
    }
}

function refreshDashboard() {
    if (window.showToast) {
        window.showToast('Refreshing dashboard...', 'info', 2000);
    }
    window.loadDashboard();
}

function updateRevenueChart() {
    // Placeholder for chart update functionality
    console.log('Updating revenue chart...');
}
